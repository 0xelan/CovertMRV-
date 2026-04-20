// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {FHE, euint64, ebool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {CapRegistry} from "./CapRegistry.sol";

/// @title CapCheck
/// @notice Encrypted compliance verification engine. Compares a company's
///         encrypted emissions total against its encrypted regulatory cap
///         and exposes only an encrypted boolean (pass/fail).
contract CapCheck {
    CapRegistry public immutable registry;
    address public owner;

    struct ComplianceResult {
        ebool encryptedResult;
        uint256 timestamp;
        bool exists;
        bool settled;
        bool plaintextResult;
    }

    // company => latest compliance result
    mapping(address => ComplianceResult) public complianceResults;

    event ComplianceChecked(address indexed company, uint256 timestamp);
    event ComplianceSettled(address indexed company, bool result);

    constructor(address _registry) {
        registry = CapRegistry(_registry);
        owner = msg.sender;
    }

    /// @notice Run the encrypted FHE.lte(total, cap) comparison and store
    ///         the resulting ebool. Both the company and the regulator
    ///         (owner) get decrypt access.
    function checkCompliance(address _company) external {
        euint64 total = registry.getCompanyTotal(_company);
        euint64 cap = registry.getRegulatoryCap(_company);
        require(FHE.isInitialized(total), "No emissions total");
        require(FHE.isInitialized(cap), "No regulatory cap");

        ebool result = FHE.lte(total, cap);

        // Contract retains compute access.
        FHE.allowThis(result);
        // Regulator (owner) sees ONLY the boolean.
        FHE.allow(result, owner);
        // Company sees its own status.
        FHE.allow(result, _company);

        ComplianceResult storage stored = complianceResults[_company];
        stored.encryptedResult = result;
        stored.timestamp = block.timestamp;
        stored.exists = true;
        // Reset settlement state for the new check.
        stored.settled = false;
        stored.plaintextResult = false;

        emit ComplianceChecked(_company, block.timestamp);
    }

    /// @notice Settle the compliance result on-chain using the value +
    ///         signature returned by `client.decryptForTx`.
    /// @dev Only the owner (regulator) can settle, matching the spec.
    ///      The threshold-network signature is verified by the FHE
    ///      precompile through `publishDecryptResult`.
    function settleCompliance(
        address _company,
        bool _value,
        bytes calldata _signature
    ) external {
        require(msg.sender == owner, "Only owner");
        ComplianceResult storage stored = complianceResults[_company];
        require(stored.exists, "No check");
        require(!stored.settled, "Already settled");

        // Cryptographically settle the decrypted boolean on-chain.
        FHE.publishDecryptResult(stored.encryptedResult, _value, _signature);

        stored.settled = true;
        stored.plaintextResult = _value;

        emit ComplianceSettled(_company, _value);
    }

    function getComplianceResult(
        address _company
    ) external view returns (ebool) {
        return complianceResults[_company].encryptedResult;
    }

    function isSettled(
        address _company
    ) external view returns (bool settled, bool result) {
        ComplianceResult storage r = complianceResults[_company];
        return (r.settled, r.plaintextResult);
    }

    function lastCheckedAt(
        address _company
    ) external view returns (uint256) {
        return complianceResults[_company].timestamp;
    }
}
