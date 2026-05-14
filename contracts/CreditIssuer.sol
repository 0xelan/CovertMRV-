// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {FHE, euint64, ebool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";

/// @notice Minimal interface to read the compliance ebool from CapCheck.
interface ICapCheck {
    struct ComplianceResult {
        ebool encryptedResult;
        uint256 timestamp;
        uint256 reportingYear;
        bool exists;
        bool settled;
        bool plaintextResult;
    }

    function complianceResults(address company) external view returns (
        ebool encryptedResult,
        uint256 timestamp,
        uint256 reportingYear,
        bool exists,
        bool settled,
        bool plaintextResult
    );
}

/// @notice Minimal interface to mint cCO2 credits.
interface ICcCO2 {
    function mintEncrypted(address to, euint64 encAmount) external;
}

/// @title CreditIssuer
/// @notice Bridge between encrypted compliance verification (CapCheck) and
///         carbon credit minting (cCO2). Uses FHE.select to conditionally
///         determine the mint amount:
///
///         mintAmount = FHE.select(compliant, issuanceRate, 0)
///
///         - Compliant company → receives issuanceRate credits (encrypted)
///         - Non-compliant company → receives 0 credits (encrypted zero)
///         - Compliance result never decrypted or exposed in plaintext
contract CreditIssuer {
    ICapCheck public immutable capCheck;
    ICcCO2 public immutable cco2;

    address public owner;

    /// @notice Credits issued per tCO2e of verified compliance headroom.
    ///         Default: 1 credit per compliance event (1e18 base units).
    uint64 public issuanceRate = 1_000_000_000_000_000_000; // 1 cCO2 in 18-decimal units

    event CreditsIssued(address indexed company, uint256 indexed reportingYear);
    event IssuanceRateUpdated(uint64 newRate);

    constructor(address _capCheck, address _cco2) {
        capCheck = ICapCheck(_capCheck);
        cco2 = ICcCO2(_cco2);
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // ─── Core issuance ──────────────────────────────────────────────────

    /// @notice Issue carbon credits to a company based on their encrypted compliance result.
    ///         Uses FHE.select to conditionally compute the mint amount without
    ///         ever revealing whether the company is compliant.
    ///
    ///         Prerequisite: CapCheck.checkCompliance(company, year) must have been
    ///         called, AND CapCheck must have CreditIssuer set as creditIssuer so that
    ///         FHE.allow(result, address(this)) was issued during checkCompliance.
    ///
    /// @param _company      Company address to issue credits to.
    /// @param _reportingYear The year the compliance result covers.
    function issueCredits(address _company, uint256 _reportingYear) external {
        (
            ebool encryptedResult,
            ,
            uint256 storedYear,
            bool exists,
            ,

        ) = capCheck.complianceResults(_company);

        require(exists, "No compliance check for company");
        require(storedYear == _reportingYear, "Year mismatch");
        require(FHE.isInitialized(encryptedResult), "Compliance result not initialized");

        // FHE.select: if compliant → issuanceRate credits, else → 0
        // Both branches remain encrypted throughout — no plaintext reveal.
        euint64 rateHandle = FHE.asEuint64(issuanceRate);
        FHE.allowThis(rateHandle);
        euint64 zeroHandle = FHE.asEuint64(0);
        FHE.allowThis(zeroHandle);

        euint64 mintAmt = FHE.select(encryptedResult, rateHandle, zeroHandle);
        FHE.allowThis(mintAmt);
        FHE.allow(mintAmt, _company);
        // Grant cCO2 access to the handle BEFORE calling mintEncrypted.
        // FHERC20._update calls FHE operations on this handle inside cCO2's context;
        // without this allow, the mock would reject cCO2 using a CreditIssuer-owned handle.
        FHE.allow(mintAmt, address(cco2));

        // mintEncrypted: FHERC20 _mint with already-encrypted amount handle.
        // If mintAmt is encrypted 0, recipient balance is unchanged.
        cco2.mintEncrypted(_company, mintAmt);

        emit CreditsIssued(_company, _reportingYear);
    }

    // ─── Admin ──────────────────────────────────────────────────────────

    /// @notice Owner updates the credit issuance rate.
    function setIssuanceRate(uint64 _rate) external onlyOwner {
        require(_rate > 0, "Rate must be > 0");
        issuanceRate = _rate;
        emit IssuanceRateUpdated(_rate);
    }
}
