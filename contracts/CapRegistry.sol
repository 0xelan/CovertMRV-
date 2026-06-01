// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {FHE, euint64, euint8, InEuint64, InEuint8} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {DisclosureACL} from "./DisclosureACL.sol";

/// @title CapRegistry
/// @notice Encrypted facility-level emissions storage, aggregation, and
///         encrypted regulatory cap registry for CovertMRV.
/// @dev All compliance state is keyed by (company, reportingYear).
contract CapRegistry is DisclosureACL {
    struct FacilityData {
        euint64 encryptedEmissions;
        euint8  encryptedScope;
        uint256 reportingPeriod;
        bool    submitted;
    }

    // company => reportingYear => facilityId => FacilityData
    mapping(address => mapping(uint256 => mapping(uint256 => FacilityData))) private facilityEmissions;
    // company => reportingYear => facility id list
    mapping(address => mapping(uint256 => uint256[])) private companyFacilities;
    // company => reportingYear => encrypted aggregated total
    mapping(address => mapping(uint256 => euint64)) private companyTotals;
    // company => reportingYear => encrypted regulatory cap
    mapping(address => mapping(uint256 => euint64)) private regulatoryCaps;
    mapping(address => mapping(uint256 => bool)) private hasSubmitted;
    mapping(address => mapping(uint256 => euint64)) private encryptedFacilityCounts;

    event EmissionsSubmitted(
        address indexed company,
        uint256 indexed facilityId,
        uint256 reportingYear,
        uint256 reportingPeriod
    );
    event TotalAggregated(
        address indexed company,
        uint256 indexed reportingYear,
        uint256 facilityCount
    );
    event CapSet(address indexed company, uint256 indexed reportingYear);

    constructor() {
        owner = msg.sender;
        roles[msg.sender] = Role.ADMIN;
        emit RoleGranted(msg.sender, Role.ADMIN);
    }

    // ─── Emitter functions ──────────────────────────────────────────────

    function submitEmissions(
        uint256 _facilityId,
        InEuint64 calldata _encEmissions,
        InEuint8 calldata _encScope,
        uint256 _reportingYear
    ) external {
        require(
            roles[msg.sender] == Role.EMITTER || msg.sender == owner,
            "Must be EMITTER"
        );

        euint64 emissions = FHE.asEuint64(_encEmissions);
        FHE.allowThis(emissions);
        FHE.allow(emissions, msg.sender);

        euint8 scope = FHE.asEuint8(_encScope);
        FHE.allowThis(scope);
        FHE.allow(scope, msg.sender);

        FacilityData storage f =
            facilityEmissions[msg.sender][_reportingYear][_facilityId];
        bool isNew = !f.submitted;
        f.encryptedEmissions = emissions;
        f.encryptedScope = scope;
        f.reportingPeriod = block.timestamp;
        f.submitted = true;

        if (isNew) {
            companyFacilities[msg.sender][_reportingYear].push(_facilityId);
            _incrementEncryptedCount(msg.sender, _reportingYear);
        }
        hasSubmitted[msg.sender][_reportingYear] = true;

        emit EmissionsSubmitted(
            msg.sender,
            _facilityId,
            _reportingYear,
            block.timestamp
        );
    }

    function batchSubmitEmissions(
        uint256[] calldata _facilityIds,
        InEuint64[] calldata _encEmissions,
        InEuint8[] calldata _encScopes,
        uint256 _reportingYear
    ) external {
        require(
            roles[msg.sender] == Role.EMITTER || msg.sender == owner,
            "Must be EMITTER"
        );
        uint256 len = _facilityIds.length;
        require(len > 0, "Empty batch");
        require(len == _encEmissions.length && len == _encScopes.length, "Length mismatch");

        address sender = msg.sender;
        uint256 ts = block.timestamp;

        for (uint256 i = 0; i < len; ) {
            uint256 fid = _facilityIds[i];
            euint64 emissions = FHE.asEuint64(_encEmissions[i]);
            FHE.allowThis(emissions);
            FHE.allow(emissions, sender);

            euint8 scope = FHE.asEuint8(_encScopes[i]);
            FHE.allowThis(scope);
            FHE.allow(scope, sender);

            FacilityData storage f = facilityEmissions[sender][_reportingYear][fid];
            if (!f.submitted) {
                companyFacilities[sender][_reportingYear].push(fid);
                _incrementEncryptedCount(sender, _reportingYear);
            }
            f.encryptedEmissions = emissions;
            f.encryptedScope = scope;
            f.reportingPeriod = ts;
            f.submitted = true;

            emit EmissionsSubmitted(sender, fid, _reportingYear, ts);

            unchecked {
                ++i;
            }
        }
        hasSubmitted[sender][_reportingYear] = true;
    }

    /// @notice Aggregate facility emissions for a company and reporting year.
    function aggregateTotal(address _company, uint256 _reportingYear) external {
        uint256[] memory facilities = companyFacilities[_company][_reportingYear];
        uint256 len = facilities.length;
        require(len > 0, "No facilities");

        euint64 total =
            facilityEmissions[_company][_reportingYear][facilities[0]]
                .encryptedEmissions;

        for (uint256 i = 1; i < len; ) {
            FacilityData storage f =
                facilityEmissions[_company][_reportingYear][facilities[i]];
            require(f.submitted, "Facility missing");
            total = FHE.add(total, f.encryptedEmissions);
            unchecked {
                ++i;
            }
        }

        companyTotals[_company][_reportingYear] = total;
        FHE.allowThis(total);
        FHE.allow(total, _company);

        emit TotalAggregated(_company, _reportingYear, facilities.length);
    }

    // ─── Regulator functions ────────────────────────────────────────────

    function setCap(
        address _company,
        uint256 _reportingYear,
        InEuint64 calldata _encCap
    ) external onlyOwner {
        euint64 cap = FHE.asEuint64(_encCap);
        FHE.allowThis(cap);
        regulatoryCaps[_company][_reportingYear] = cap;
        emit CapSet(_company, _reportingYear);
    }

    function authorizeReader(address _reader) external onlyOwner {
        require(_reader != address(0), "zero reader");
        emit ReaderAuthorized(_reader);
    }

    event ReaderAuthorized(address indexed reader);

    function grantCheckAccess(
        address _company,
        uint256 _reportingYear,
        address _checker
    ) external onlyOwner {
        require(
            FHE.isInitialized(companyTotals[_company][_reportingYear]),
            "No total"
        );
        require(
            FHE.isInitialized(regulatoryCaps[_company][_reportingYear]),
            "No cap"
        );
        FHE.allow(companyTotals[_company][_reportingYear], _checker);
        FHE.allow(regulatoryCaps[_company][_reportingYear], _checker);
    }

    // ─── Audit access ───────────────────────────────────────────────────

    /// @notice Grants auditor decrypt access to the aggregated total for a
    ///         reporting year. `isAuditActive` is an application-level window;
    ///         CoFHE `FHE.allow` grants persist until handles are rotated.
    function grantAuditAccessToTotal(
        address _auditor,
        uint256 _reportingYear,
        uint256 _durationSeconds
    ) external {
        require(
            FHE.isInitialized(companyTotals[msg.sender][_reportingYear]),
            "No total"
        );
        require(_auditor != address(0), "zero auditor");
        _grantTimedAudit(msg.sender, _auditor, _durationSeconds);
        FHE.allow(companyTotals[msg.sender][_reportingYear], _auditor);
    }

    // ─── Read views ─────────────────────────────────────────────────────

    function getCompanyTotal(
        address _company,
        uint256 _reportingYear
    ) external view returns (euint64) {
        return companyTotals[_company][_reportingYear];
    }

    function getRegulatoryCap(
        address _company,
        uint256 _reportingYear
    ) external view returns (euint64) {
        return regulatoryCaps[_company][_reportingYear];
    }

    function getMyEmissions(
        uint256 _facilityId,
        uint256 _reportingYear
    ) external view returns (euint64) {
        require(
            facilityEmissions[msg.sender][_reportingYear][_facilityId].submitted,
            "Not submitted"
        );
        return facilityEmissions[msg.sender][_reportingYear][_facilityId]
            .encryptedEmissions;
    }

    function getEncryptedFacilityCount(
        address _company,
        uint256 _reportingYear
    ) external view returns (euint64) {
        return encryptedFacilityCounts[_company][_reportingYear];
    }

    function getFacilityCount(
        address _company,
        uint256 _reportingYear
    ) external view returns (uint256) {
        require(msg.sender == owner || msg.sender == _company, "Unauthorized");
        return companyFacilities[_company][_reportingYear].length;
    }

    function getFacilityReportingPeriod(
        address _company,
        uint256 _reportingYear,
        uint256 _facilityId
    ) external view returns (uint256) {
        return facilityEmissions[_company][_reportingYear][_facilityId]
            .reportingPeriod;
    }

    function isFacilitySubmitted(
        address _company,
        uint256 _reportingYear,
        uint256 _facilityId
    ) external view returns (bool) {
        return facilityEmissions[_company][_reportingYear][_facilityId]
            .submitted;
    }

    function getFacilityScope(
        address _company,
        uint256 _reportingYear,
        uint256 _facilityId
    ) external view returns (euint8) {
        return facilityEmissions[_company][_reportingYear][_facilityId]
            .encryptedScope;
    }

    function grantFacilityDecrypt(
        uint256 _facilityId,
        uint256 _reportingYear,
        address _to
    ) external {
        FacilityData storage f =
            facilityEmissions[msg.sender][_reportingYear][_facilityId];
        require(f.submitted, "Not submitted");
        FHE.allow(f.encryptedEmissions, _to);
        FHE.allow(f.encryptedScope, _to);
    }

    function _incrementEncryptedCount(
        address _company,
        uint256 _reportingYear
    ) private {
        euint64 prev = encryptedFacilityCounts[_company][_reportingYear];
        euint64 newCount;
        if (FHE.isInitialized(prev)) {
            newCount = FHE.add(prev, FHE.asEuint64(1));
        } else {
            newCount = FHE.asEuint64(1);
        }
        FHE.allowThis(newCount);
        FHE.allow(newCount, _company);
        encryptedFacilityCounts[_company][_reportingYear] = newCount;
    }
}
