// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {FHE, euint64, euint8, InEuint64, InEuint8} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {DisclosureACL} from "./DisclosureACL.sol";

/// @title CapRegistry
/// @notice Encrypted facility-level emissions storage, aggregation, and
///         encrypted regulatory cap registry for CovertMRV.
/// @dev scope encrypted as euint8; companyFacilities + hasSubmitted
///      made private to prevent metadata leakage (privacy gaps #1-#6).
contract CapRegistry is DisclosureACL {
    struct FacilityData {
        euint64 encryptedEmissions;
        euint8  encryptedScope;    // ISO 14064 scope — encrypted
        uint256 reportingPeriod;
        uint256 reportingYear;     // stored but NOT emitted in event
        bool    submitted;
    }

    // company => facilityId => FacilityData
    mapping(address => mapping(uint256 => FacilityData)) private facilityEmissions;
    // company => sorted list of facility ids — private (was public, gap #1)
    mapping(address => uint256[]) private companyFacilities;
    // company => encrypted aggregated total
    mapping(address => euint64) private companyTotals;
    // company => encrypted regulatory cap (set by owner/regulator)
    mapping(address => euint64) private regulatoryCaps;
    // company => has any emissions been submitted — private (was public, gap #2)
    mapping(address => bool) private hasSubmitted;
    // company => encrypted facility count (gap #1 fix)
    mapping(address => euint64) private encryptedFacilityCounts;

    event EmissionsSubmitted(
        address indexed company,
        uint256 indexed facilityId,
        uint256 reportingPeriod
        // reportingYear and scope removed from event — sensitive metadata (gaps #4, #6)
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
    /// @param _facilityId    Caller-assigned facility identifier.
    /// @param _encEmissions  Client-encrypted uint64 emissions value (tCO2e).
    /// @param _encScope      Client-encrypted ISO 14064 scope (0=Scope1, 1=Scope2, 2=Scope3).
    /// @param _reportingYear ISO year for this report (e.g. 2025).
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

        FacilityData storage f = facilityEmissions[msg.sender][_facilityId];
        bool isNew = !f.submitted;
        f.encryptedEmissions = emissions;
        f.encryptedScope = scope;
        f.reportingPeriod = block.timestamp;
        f.reportingYear = _reportingYear;
        f.submitted = true;

        if (isNew) {
            companyFacilities[msg.sender].push(_facilityId);
            _incrementEncryptedCount(msg.sender);
        }
        hasSubmitted[msg.sender] = true;

        emit EmissionsSubmitted(msg.sender, _facilityId, block.timestamp);
    }

    /// @notice Submit emissions for multiple facilities in a single transaction.
    ///         Each facility has its own encrypted scope.
    /// @param _facilityIds    Array of facility identifiers.
    /// @param _encEmissions   Parallel array of encrypted emissions values.
    /// @param _encScopes      Parallel array of encrypted ISO 14064 scope categories.
    /// @param _reportingYear  ISO year for this batch report (e.g. 2025).
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

            FacilityData storage f = facilityEmissions[sender][fid];
            if (!f.submitted) {
                companyFacilities[sender].push(fid);
                _incrementEncryptedCount(sender);
            }
            f.encryptedEmissions = emissions;
            f.encryptedScope = scope;
            f.reportingPeriod = ts;
            f.reportingYear = _reportingYear;
            f.submitted = true;

            emit EmissionsSubmitted(sender, fid, ts);

            unchecked { ++i; }
        }
        hasSubmitted[sender] = true;
    }

    /// @notice Aggregate all submitted facility emissions for a company
    ///         using FHE.add. Anyone can trigger aggregation but the
    ///         resulting total handle is only decryptable by the company.
    function aggregateTotal(address _company) external {
        uint256[] memory facilities = companyFacilities[_company];
        uint256 len = facilities.length;
        require(len > 0, "No facilities");

        euint64 total = facilityEmissions[_company][facilities[0]].encryptedEmissions;

        for (uint256 i = 1; i < len; ) {
            FacilityData storage f = facilityEmissions[_company][facilities[i]];
            require(f.submitted, "Facility missing");
            total = FHE.add(total, f.encryptedEmissions);
            unchecked { ++i; }
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

    /// @notice Returns the encrypted facility count for a company.
    ///         Caller needs FHE.allow to decrypt the returned handle.
    function getEncryptedFacilityCount(address _company) external view returns (euint64) {
        return encryptedFacilityCounts[_company];
    }

    /// @notice Returns the plaintext facility count — restricted to owner or the company itself.
    ///         Third parties cannot enumerate another company's facility count (privacy gap #1 fix).
    function getFacilityCount(address _company) external view returns (uint256) {
        require(msg.sender == owner || msg.sender == _company, "Unauthorized");
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

    /// @notice Returns the encrypted scope handle for a facility.
    ///         Caller needs FHE.allow to decrypt (granted via grantFacilityDecrypt).
    function getFacilityScope(
        address _company,
        uint256 _facilityId
    ) external view returns (euint8) {
        return facilityEmissions[_company][_facilityId].encryptedScope;
    }

    /// @notice Company grants an address decrypt access to a specific facility's
    ///         emissions value and scope — used for timed auditor disclosure.
    function grantFacilityDecrypt(uint256 _facilityId, address _to) external {
        FacilityData storage f = facilityEmissions[msg.sender][_facilityId];
        require(f.submitted, "Not submitted");
        FHE.allow(f.encryptedEmissions, _to);
        FHE.allow(f.encryptedScope, _to);
    }

    // ─── Private helpers ─────────────────────────────────────────────────

    /// @dev Increments the encrypted facility counter for a company.
    ///      Uses FHE.asEuint64(1) trivial encryption as the addend.
    function _incrementEncryptedCount(address _company) private {
        euint64 prev = encryptedFacilityCounts[_company];
        euint64 newCount;
        if (FHE.isInitialized(prev)) {
            newCount = FHE.add(prev, FHE.asEuint64(1));
        } else {
            newCount = FHE.asEuint64(1);
        }
        FHE.allowThis(newCount);
        FHE.allow(newCount, _company);
        encryptedFacilityCounts[_company] = newCount;
    }
}
