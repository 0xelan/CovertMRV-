// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {FHE, euint64, ebool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";

interface ICapCheck {
    function complianceResults(
        address company,
        uint256 reportingYear
    ) external view returns (
        ebool encryptedResult,
        uint256 timestamp,
        bool exists,
        bool settled,
        bool plaintextResult
    );
}

interface ICcCO2 {
    function mintEncrypted(address to, euint64 encAmount) external;
}

/// @title CreditIssuer
/// @notice Conditional credit minting from encrypted compliance; idempotent per (company, year).
contract CreditIssuer {
    ICapCheck public immutable capCheck;
    ICcCO2 public immutable cco2;

    address public owner;
    uint64 public issuanceRate = 1_000_000_000_000_000_000;

    mapping(address => mapping(uint256 => bool)) public creditsIssued;

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

    function issueCredits(address _company, uint256 _reportingYear) external {
        require(
            !creditsIssued[_company][_reportingYear],
            "Credits already issued"
        );

        (
            ebool encryptedResult,
            ,
            bool exists,
            ,

        ) = capCheck.complianceResults(_company, _reportingYear);

        require(exists, "No compliance check for company");
        require(FHE.isInitialized(encryptedResult), "Compliance result not initialized");

        euint64 rateHandle = FHE.asEuint64(issuanceRate);
        FHE.allowThis(rateHandle);
        euint64 zeroHandle = FHE.asEuint64(0);
        FHE.allowThis(zeroHandle);

        euint64 mintAmt = FHE.select(encryptedResult, rateHandle, zeroHandle);
        FHE.allowThis(mintAmt);
        FHE.allow(mintAmt, _company);
        FHE.allow(mintAmt, address(cco2));

        cco2.mintEncrypted(_company, mintAmt);

        creditsIssued[_company][_reportingYear] = true;

        emit CreditsIssued(_company, _reportingYear);
    }

    function setIssuanceRate(uint64 _rate) external onlyOwner {
        require(_rate > 0, "Rate must be > 0");
        issuanceRate = _rate;
        emit IssuanceRateUpdated(_rate);
    }
}
