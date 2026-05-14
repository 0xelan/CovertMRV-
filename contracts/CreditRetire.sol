// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {FHE, euint64, InEuint64} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {DisclosureACL} from "./DisclosureACL.sol";

/// @notice Minimal interface to call cCO2.burnFrom.
/// burnFrom takes a pre-verified euint64 — CreditRetire calls FHE.asEuint64 first
/// (where msg.sender = retirer) then grants cCO2 access via FHE.allow before burning.
interface ICcCO2Burnable {
    function burnFrom(address from, euint64 amount) external;
}

/// @title CreditRetire
/// @notice Retires (burns) cCO2 carbon credits with encrypted receipts.
///         Retirement amounts are never emitted in events. Companies can
///         selectively grant decrypt access to specific auditors or registries
///         for a time-bounded period.
///
///         Privacy model:
///         - retirementReceipts[id] stores encrypted euint64 handle
///         - Only the retiree (msg.sender) gets FHE.allow on their receipt
///         - Auditors get FHE.allow via grantRetirementAudit
///         - Event log contains only company + retirementId + timestamp (no amount)
contract CreditRetire is DisclosureACL {
    ICcCO2Burnable public immutable cco2;

    /// @dev retirementId => encrypted amount handle
    mapping(bytes32 => euint64) private retirementReceipts;

    /// @dev retirementId => company that retired (for access control)
    mapping(bytes32 => address) public retirementOwner;

    event CreditsRetired(
        address indexed company,
        bytes32 indexed retirementId,
        uint256 timestamp
        // amount deliberately omitted from event log
    );

    event RetirementAuditGranted(
        address indexed company,
        bytes32 indexed retirementId,
        address indexed auditor,
        uint256 expiry
    );

    constructor(address _cco2) {
        cco2 = ICcCO2Burnable(_cco2);
        owner = msg.sender;
        roles[msg.sender] = Role.ADMIN;
        emit RoleGranted(msg.sender, Role.ADMIN);
    }

    // ─── Core retirement ─────────────────────────────────────────────────

    /// @notice Retire (burn) an encrypted amount of cCO2 credits.
    ///         The retirement receipt is stored as an encrypted handle so
    ///         the retiree can prove the amount later without public disclosure.
    ///
    /// @param _encAmount    Client-encrypted amount to retire.
    /// @param _retirementId Caller-assigned unique identifier for this retirement.
    ///                      Use keccak256(abi.encodePacked(company, year, nonce)).
    function retireCredits(
        InEuint64 calldata _encAmount,
        bytes32 _retirementId
    ) external {
        require(retirementOwner[_retirementId] == address(0), "Retirement ID already used");

        // Verify the encrypted input here — msg.sender is the retirer, so verifyInput
        // inside FHE.asEuint64 checks that the data was signed by the retirer. This would
        // fail if done inside cCO2.burnFrom where msg.sender would be CreditRetire.
        euint64 amount = FHE.asEuint64(_encAmount);
        FHE.allowThis(amount);          // CreditRetire owns this handle
        FHE.allow(amount, msg.sender);  // Retirer can see their amount
        FHE.allow(amount, address(cco2)); // cCO2 needs access to burn it

        // Burn the credits from the caller's cCO2 balance.
        cco2.burnFrom(msg.sender, amount);

        // Store an independent encrypted receipt for this retirement.
        retirementReceipts[_retirementId] = amount;
        retirementOwner[_retirementId] = msg.sender;

        emit CreditsRetired(msg.sender, _retirementId, block.timestamp);
    }

    // ─── Selective disclosure ─────────────────────────────────────────────

    /// @notice Grant an auditor or registry timed decrypt access to a specific
    ///         retirement receipt. The grant is tracked by DisclosureACL for
    ///         expiry, and FHE.allow is issued to the auditor's address.
    ///
    ///         Note: FHE.allow is permanent at the coprocessor level. The expiry
    ///         is enforced at the application layer. For true cryptographic
    ///         revocation call revokeAuditAccess (which sets active=false) and
    ///         contact the contract owner to rotate the receipt handle if needed.
    ///
    /// @param _retirementId  The retirement to grant access to.
    /// @param _auditor       Auditor or registry address.
    /// @param _durationSecs  How long the grant is considered valid.
    function grantRetirementAudit(
        bytes32 _retirementId,
        address _auditor,
        uint256 _durationSecs
    ) external {
        require(retirementOwner[_retirementId] == msg.sender, "Not retirement owner");
        require(_auditor != address(0), "zero auditor");

        euint64 receipt = retirementReceipts[_retirementId];
        require(FHE.isInitialized(receipt), "Receipt not found");

        FHE.allow(receipt, _auditor);
        _grantTimedAudit(msg.sender, _auditor, _durationSecs);

        uint256 expiry = block.timestamp + _durationSecs;
        emit RetirementAuditGranted(msg.sender, _retirementId, _auditor, expiry);
    }

    // ─── Views ──────────────────────────────────────────────────────────

    /// @notice Returns the encrypted receipt handle for a retirement.
    ///         Caller must have FHE.allow to decrypt the value.
    function getRetirementReceipt(
        bytes32 _retirementId
    ) external view returns (euint64) {
        return retirementReceipts[_retirementId];
    }
}
