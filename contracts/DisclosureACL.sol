// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {FHE, euint64, ebool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";

/// @title DisclosureACL
/// @notice Shared role-based access control + FHE ACL helpers for the
///         CovertMRV protocol. Inherited by every protocol contract.
abstract contract DisclosureACL {
    enum Role {
        NONE,
        EMITTER,
        AUDITOR,
        REGULATOR,
        ADMIN
    }

    /// @dev Time-bounded audit grant scoped to a (company, auditor) pair.
    struct AuditGrant {
        uint256 expiry;
        bool active;
    }

    address public owner;
    mapping(address => Role) public roles;
    // company => auditor => grant
    mapping(address => mapping(address => AuditGrant)) public auditGrants;

    event RoleGranted(address indexed user, Role role);
    event AuditAccessGranted(
        address indexed company,
        address indexed auditor,
        uint256 expiry
    );
    event AuditAccessRevoked(
        address indexed company,
        address indexed auditor
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyRole(Role _role) {
        require(
            roles[msg.sender] == _role || msg.sender == owner,
            "Unauthorized role"
        );
        _;
    }

    /// @notice Owner (admin/regulator) assigns a role to an address.
    function grantRole(address _user, Role _role) external onlyOwner {
        roles[_user] = _role;
        emit RoleGranted(_user, _role);
    }

    /// @notice Self-service: any wallet without a role can claim EMITTER
    ///         so the dApp is fully usable without operator interaction.
    function registerAsEmitter() external {
        require(roles[msg.sender] == Role.NONE, "Already has a role");
        roles[msg.sender] = Role.EMITTER;
        emit RoleGranted(msg.sender, Role.EMITTER);
    }

    /// @notice Returns the role of an address.
    function roleOf(address _user) external view returns (Role) {
        return roles[_user];
    }

    // ─── Internal FHE ACL helpers ───────────────────────────────────────
    function _retainAccess(euint64 _handle) internal {
        FHE.allowThis(_handle);
    }

    function _grantDecrypt(euint64 _handle, address _to) internal {
        FHE.allow(_handle, _to);
    }

    function _grantBoolOnly(ebool _result, address _to) internal {
        FHE.allow(_result, _to);
    }

    /// @dev Records a time-bounded audit grant. Note: the contract-side
    ///      `isAuditActive` check enforces expiry for any new requests.
    ///      The underlying FHE.allow grant is permanent on Fhenix once
    ///      issued, so historical handles remain decryptable to the
    ///      grantee — rotate the handle to revoke fully.
    function _grantTimedAudit(
        address _company,
        address _auditor,
        uint256 _durationSeconds
    ) internal {
        uint256 expiry = block.timestamp + _durationSeconds;
        auditGrants[_company][_auditor] = AuditGrant({
            expiry: expiry,
            active: true
        });
        emit AuditAccessGranted(_company, _auditor, expiry);
    }

    /// @notice Returns true if the audit grant is active and unexpired.
    function isAuditActive(
        address _company,
        address _auditor
    ) public view returns (bool) {
        AuditGrant memory g = auditGrants[_company][_auditor];
        return g.active && block.timestamp <= g.expiry;
    }

    /// @notice Caller revokes a previously-issued audit grant.
    function revokeAuditAccess(address _auditor) external {
        auditGrants[msg.sender][_auditor].active = false;
        emit AuditAccessRevoked(msg.sender, _auditor);
    }
}
