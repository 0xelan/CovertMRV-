// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {FHE, euint64, InEuint64} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {DisclosureACL} from "./DisclosureACL.sol";

/// @title SupplierAttest
/// @notice Suppliers register encrypted emissions intensity factors (tCO2e per unit)
///         per product SKU. Enables Scope 3 supply chain privacy:
///         - Each supplier's factor is private
///         - ProductFootprint reads factors via FHE.allowTransient (same-TX only)
///         - No permanent cross-contract access grants required
contract SupplierAttest is DisclosureACL {
    /// @dev supplier => sku hash => encrypted emissions intensity factor
    mapping(address => mapping(bytes32 => euint64)) private emissionsFactors;

    /// @notice supplier => sku hash => last reported year (public for audit verification)
    mapping(address => mapping(bytes32 => uint256)) public factorYear;

    /// @dev supplier => sku hashes ever submitted (private — count not enumerable)
    mapping(address => bytes32[]) private supplierSkus;
    mapping(address => mapping(bytes32 => bool)) private skuExists;

    event FactorSubmitted(address indexed supplier, bytes32 indexed sku, uint256 year);

    constructor() {
        owner = msg.sender;
        roles[msg.sender] = Role.ADMIN;
        emit RoleGranted(msg.sender, Role.ADMIN);
    }

    // ─── Emitter functions ──────────────────────────────────────────────

    /// @notice Supplier registers an encrypted emissions intensity factor for a SKU.
    /// @param _sku       Product identifier (keccak256 of product name/code).
    /// @param _encFactor Client-encrypted uint64 factor in tCO2e per unit.
    /// @param _year      Reporting year this factor applies to.
    function submitFactor(
        bytes32 _sku,
        InEuint64 calldata _encFactor,
        uint256 _year
    ) external {
        require(
            roles[msg.sender] == Role.EMITTER || msg.sender == owner,
            "Must be EMITTER"
        );

        euint64 factor = FHE.asEuint64(_encFactor);
        FHE.allowThis(factor);
        FHE.allow(factor, msg.sender);

        emissionsFactors[msg.sender][_sku] = factor;
        factorYear[msg.sender][_sku] = _year;

        if (!skuExists[msg.sender][_sku]) {
            supplierSkus[msg.sender].push(_sku);
            skuExists[msg.sender][_sku] = true;
        }

        emit FactorSubmitted(msg.sender, _sku, _year);
    }

    // ─── Cross-contract access (FHE.allowTransient) ─────────────────────

    /// @notice Returns a supplier's encrypted factor for a SKU.
    ///         Calls FHE.allowTransient so the calling contract (e.g. ProductFootprint)
    ///         can use the handle within the SAME transaction without a permanent grant.
    ///         After the transaction completes, access expires automatically.
    /// @param _supplier  The supplier address whose factor to read.
    /// @param _sku       Product identifier.
    /// @return           Encrypted euint64 factor handle.
    function getFactor(
        address _supplier,
        bytes32 _sku
    ) external returns (euint64) {
        euint64 factor = emissionsFactors[_supplier][_sku];
        require(FHE.isInitialized(factor), "No factor for SKU");
        FHE.allowTransient(factor, msg.sender);
        return factor;
    }

    // ─── Permanent access grants ─────────────────────────────────────────

    /// @notice Supplier grants a specific address permanent decrypt access to
    ///         their factor for a SKU (e.g. for an auditor or regulator).
    function grantFactorDecrypt(bytes32 _sku, address _to) external {
        euint64 factor = emissionsFactors[msg.sender][_sku];
        require(FHE.isInitialized(factor), "No factor for SKU");
        FHE.allow(factor, _to);
    }

    // ─── Views ──────────────────────────────────────────────────────────

    /// @notice Returns whether a supplier has submitted a factor for a SKU.
    function hasFactorForSku(
        address _supplier,
        bytes32 _sku
    ) external view returns (bool) {
        return skuExists[_supplier][_sku];
    }

    /// @notice Returns the encrypted factor handle for a supplier/SKU.
    ///         The handle ciphertext is only decryptable by addresses that have
    ///         been granted FHE.allow permission (e.g. via grantFactorDecrypt).
    function getFactorHandle(
        address _supplier,
        bytes32 _sku
    ) external view returns (euint64) {
        return emissionsFactors[_supplier][_sku];
    }
}
