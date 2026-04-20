// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {FHE, euint64, InEuint64} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {DisclosureACL} from "./DisclosureACL.sol";

/// @title CapRegistry
/// @notice Encrypted facility-level emissions storage, aggregation, and
///         encrypted regulatory cap registry for CovertMRV.
contract CapRegistry is DisclosureACL {
    struct FacilityData {
        euint64 encryptedEmissions;
        uint256 reportingPeriod;
        bool submitted;
    }

    // company => facilityId => FacilityData
    mapping(address => mapping(uint256 => FacilityData)) private facilityEmissions;
    // company => sorted list of facility ids that have ever been submitted
    mapping(address => uint256[]) public companyFacilities;
    // company => encrypted aggregated total
    mapping(address => euint64) private companyTotals;
    // company => encrypted regulatory cap (set by owner/regulator)
    mapping(address => euint64) private regulatoryCaps;
    // company => has any emissions been submitted?
    mapping(address => bool) public hasSubmitted;

    event EmissionsSubmitted(
        address indexed company,
        uint256 indexed facilityId,
        uint256 reportingPeriod
    );
    event TotalAggregated(address indexed company, uint256 facilityCount);
    event CapSet(address indexed company);

    constructor() {
        owner = msg.sender;
        roles[msg.sender] = Role.ADMIN;
        emit RoleGranted(msg.sender, Role.ADMIN);
    }

    // ─── Emitter functions ──────────────────────────────────────────────

    /// @notice Submit an encrypted emissions value for a facility.
    function submitEmissions(
        uint256 _facilityId,
        InEuint64 calldata _encEmissions
    ) external {
        require(
            roles[msg.sender] == Role.EMITTER || msg.sender == owner,
            "Must be EMITTER"
        );

        euint64 emissions = FHE.asEuint64(_encEmissions);
        FHE.allowThis(emissions);
        FHE.allowSender(emissions);

        FacilityData storage f = facilityEmissions[msg.sender][_facilityId];
        bool isNew = !f.submitted;
        f.encryptedEmissions = emissions;
        f.reportingPeriod = block.timestamp;
        f.submitted = true;

        if (isNew) {
            companyFacilities[msg.sender].push(_facilityId);
        }
        hasSubmitted[msg.sender] = true;

        emit EmissionsSubmitted(msg.sender, _facilityId, block.timestamp);
    }

    /// @notice Aggregate all submitted facility emissions for a company
    ///         using FHE.add. Anyone can trigger aggregation but the
    ///         resulting total handle is only decryptable by the company.
    function aggregateTotal(address _company) external {
        uint256[] memory facilities = companyFacilities[_company];
        require(facilities.length > 0, "No facilities");

        euint64 total = facilityEmissions[_company][facilities[0]].encryptedEmissions;

        for (uint256 i = 1; i < facilities.length; i++) {
            FacilityData storage f = facilityEmissions[_company][facilities[i]];
            require(f.submitted, "Facility missing");
            total = FHE.add(total, f.encryptedEmissions);
        }

        companyTotals[_company] = total;
        FHE.allowThis(total);
        FHE.allow(total, _company);
        // Owner (regulator) does NOT get decrypt on the raw total — only
        // the encrypted boolean from CapCheck.

        emit TotalAggregated(_company, facilities.length);
    }

    // ─── Regulator functions ────────────────────────────────────────────

    /// @notice Owner / regulator stores an encrypted regulatory cap for
    ///         a company. The cap is never decryptable by anyone — it is
    ///         only used as a private input to FHE.lte inside CapCheck.
    function setCap(
        address _company,
        InEuint64 calldata _encCap
    ) external onlyOwner {
        euint64 cap = FHE.asEuint64(_encCap);
        FHE.allowThis(cap);
        regulatoryCaps[_company] = cap;
        emit CapSet(_company);
    }

    /// @notice Authorize a sibling contract (CapCheck) to read encrypted
    ///         handles owned by this registry. Required so CapCheck can
    ///         call FHE.lte on the total + cap handles.
    function authorizeReader(address _reader) external onlyOwner {
        // No-op marker: the contract-to-contract grants are issued
        // inline in submitEmissions/aggregateTotal/setCap via allowThis.
        // For CapCheck to consume them we re-allow the per-company
        // handles to the reader address here.
        require(_reader != address(0), "zero reader");
        // intentionally minimal — see grantCheckAccess below.
        emit ReaderAuthorized(_reader);
    }

    event ReaderAuthorized(address indexed reader);

    /// @notice Owner grants CapCheck permission to operate on a company's
    ///         total + cap handles. Must be called once per company after
    ///         aggregateTotal + setCap.
    function grantCheckAccess(
        address _company,
        address _checker
    ) external onlyOwner {
        require(FHE.isInitialized(companyTotals[_company]), "No total");
        require(FHE.isInitialized(regulatoryCaps[_company]), "No cap");
        FHE.allow(companyTotals[_company], _checker);
        FHE.allow(regulatoryCaps[_company], _checker);
    }

    // ─── Audit access ───────────────────────────────────────────────────

    /// @notice Caller (a company) grants an auditor time-bounded decrypt
    ///         access to its aggregated total.
    function grantAuditAccessToTotal(
        address _auditor,
        uint256 _durationSeconds
    ) external {
        require(FHE.isInitialized(companyTotals[msg.sender]), "No total");
        require(_auditor != address(0), "zero auditor");
        _grantTimedAudit(msg.sender, _auditor, _durationSeconds);
        FHE.allow(companyTotals[msg.sender], _auditor);
    }

    // ─── Read views (return ciphertext handles) ─────────────────────────

    function getCompanyTotal(address _company) external view returns (euint64) {
        return companyTotals[_company];
    }

    function getRegulatoryCap(address _company) external view returns (euint64) {
        return regulatoryCaps[_company];
    }

    function getMyEmissions(uint256 _facilityId) external view returns (euint64) {
        require(
            facilityEmissions[msg.sender][_facilityId].submitted,
            "Not submitted"
        );
        return facilityEmissions[msg.sender][_facilityId].encryptedEmissions;
    }

    function getFacilityIds(
        address _company
    ) external view returns (uint256[] memory) {
        return companyFacilities[_company];
    }

    function getFacilityCount(
        address _company
    ) external view returns (uint256) {
        return companyFacilities[_company].length;
    }

    function getFacilityReportingPeriod(
        address _company,
        uint256 _facilityId
    ) external view returns (uint256) {
        return facilityEmissions[_company][_facilityId].reportingPeriod;
    }

    function isFacilitySubmitted(
        address _company,
        uint256 _facilityId
    ) external view returns (bool) {
        return facilityEmissions[_company][_facilityId].submitted;
    }
}
