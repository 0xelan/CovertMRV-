// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {FHE, euint64, ebool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {CapRegistry} from "./CapRegistry.sol";

interface IComplianceCertificate {
    function mintCertificate(
        address company,
        uint256 reportingYear,
        bool compliant
    ) external returns (uint256 tokenId);
}

/// @title CapCheck
/// @notice Encrypted compliance verification per (company, reportingYear).
contract CapCheck {
    CapRegistry public immutable registry;
    IComplianceCertificate public certificate;
    address public owner;
    address public creditIssuer;

    struct ComplianceResult {
        ebool encryptedResult;
        uint256 timestamp;
        bool exists;
        bool settled;
        bool plaintextResult;
    }

    mapping(address => mapping(uint256 => ComplianceResult)) public complianceResults;

    event ComplianceChecked(
        address indexed company,
        uint256 indexed reportingYear,
        uint256 timestamp
    );
    event ComplianceSettled(
        address indexed company,
        uint256 indexed reportingYear,
        bool result,
        uint256 tokenId
    );

    constructor(address _registry) {
        registry = CapRegistry(_registry);
        owner = msg.sender;
    }

    function setCertificate(address _certificate) external {
        require(msg.sender == owner, "Only owner");
        require(_certificate != address(0), "zero address");
        certificate = IComplianceCertificate(_certificate);
    }

    function setCreditIssuer(address _creditIssuer) external {
        require(msg.sender == owner, "Only owner");
        require(_creditIssuer != address(0), "zero address");
        creditIssuer = _creditIssuer;
    }

    /// @notice Run FHE.lte(total, cap) for a reporting year. Callable by the
    ///         company or the regulator owner only.
    function checkCompliance(
        address _company,
        uint256 _reportingYear
    ) external {
        require(
            msg.sender == _company || msg.sender == owner,
            "Not authorized"
        );

        euint64 total = registry.getCompanyTotal(_company, _reportingYear);
        euint64 cap = registry.getRegulatoryCap(_company, _reportingYear);
        require(FHE.isInitialized(total), "No emissions total");
        require(FHE.isInitialized(cap), "No regulatory cap");

        ebool result = FHE.lte(total, cap);

        FHE.allowThis(result);
        FHE.allow(result, owner);
        FHE.allow(result, _company);
        if (creditIssuer != address(0)) {
            FHE.allow(result, creditIssuer);
        }

        ComplianceResult storage stored =
            complianceResults[_company][_reportingYear];
        stored.encryptedResult = result;
        stored.timestamp = block.timestamp;
        stored.exists = true;
        stored.settled = false;
        stored.plaintextResult = false;

        emit ComplianceChecked(_company, _reportingYear, block.timestamp);
    }

    function settleCompliance(
        address _company,
        uint256 _reportingYear,
        bool _value,
        bytes calldata _signature
    ) external {
        require(msg.sender == owner, "Only owner");
        ComplianceResult storage stored =
            complianceResults[_company][_reportingYear];
        require(stored.exists, "No check");
        require(!stored.settled, "Already settled");

        FHE.publishDecryptResult(stored.encryptedResult, _value, _signature);

        stored.settled = true;
        stored.plaintextResult = _value;

        uint256 tokenId = 0;
        if (address(certificate) != address(0)) {
            tokenId = certificate.mintCertificate(
                _company,
                _reportingYear,
                _value
            );
        }

        emit ComplianceSettled(_company, _reportingYear, _value, tokenId);
    }

    function getComplianceResult(
        address _company,
        uint256 _reportingYear
    ) external view returns (ebool) {
        return complianceResults[_company][_reportingYear].encryptedResult;
    }

    function isSettled(
        address _company,
        uint256 _reportingYear
    ) external view returns (bool settled, bool result) {
        ComplianceResult storage r = complianceResults[_company][_reportingYear];
        return (r.settled, r.plaintextResult);
    }

    function lastCheckedAt(
        address _company,
        uint256 _reportingYear
    ) external view returns (uint256) {
        return complianceResults[_company][_reportingYear].timestamp;
    }
}
