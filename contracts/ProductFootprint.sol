// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {FHE, euint64, euint8, InEuint64, ebool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {DisclosureACL} from "./DisclosureACL.sol";

/// @notice Minimal interface to call SupplierAttest.getFactor via allowTransient.
interface ISupplierAttest {
    function getFactor(address supplier, bytes32 sku) external returns (euint64);
}

/// @title ProductFootprint
/// @notice Reads encrypted emissions factors from multiple suppliers via
///         FHE.allowTransient in a single transaction, sums them with FHE.add,
///         and exposes:
///         - The encrypted aggregate footprint (manufacturer sees total)
///         - An encrypted band classification A/B/C via FHE.select
///         - A double-blind threshold check via FHE.lte (buyer sees only pass/fail)
///
///         No supplier can observe another supplier's contribution at any point.
contract ProductFootprint is DisclosureACL {
    ISupplierAttest public immutable supplierAttest;

    /// @notice Band thresholds in tCO2e. Set by owner.
    ///         ≤ bandAThreshold → band A (best)
    ///         ≤ bandBThreshold → band B
    ///         > bandBThreshold → band C (worst)
    uint64 public bandAThreshold = 100;
    uint64 public bandBThreshold = 500;

    event FootprintComputed(
        address indexed requester,
        bytes32 indexed sku,
        uint256 supplierCount
    );

    constructor(address _supplierAttest) {
        owner = msg.sender;
        roles[msg.sender] = Role.ADMIN;
        emit RoleGranted(msg.sender, Role.ADMIN);
        supplierAttest = ISupplierAttest(_supplierAttest);
    }

    // ─── Core computation ───────────────────────────────────────────────

    /// @notice Compute the encrypted aggregate Scope 3 footprint for a SKU
    ///         across all listed suppliers using FHE.add.
    ///         Each supplier factor is read via FHE.allowTransient (same TX only).
    /// @param _sku       Product identifier.
    /// @param _suppliers List of supplier addresses to aggregate.
    /// @return           Encrypted euint64 total footprint handle.
    function computeFootprint(
        bytes32 _sku,
        address[] calldata _suppliers
    ) external returns (euint64) {
        require(_suppliers.length > 0, "No suppliers");

        euint64 total = _sumFactors(_sku, _suppliers);
        FHE.allow(total, msg.sender);

        emit FootprintComputed(msg.sender, _sku, _suppliers.length);
        return total;
    }

    /// @notice Classify the encrypted footprint into band A (0), B (1), or C (2)
    ///         using two FHE.lte comparisons and a FHE.select chain.
    ///         Returns an encrypted euint8 handle — decrypt with permit to see band.
    /// @param _sku       Product identifier.
    /// @param _suppliers List of supplier addresses.
    /// @return           Encrypted euint8 band (0=A, 1=B, 2=C).
    function classifyBand(
        bytes32 _sku,
        address[] calldata _suppliers
    ) external returns (euint8) {
        require(_suppliers.length > 0, "No suppliers");

        euint64 total = _sumFactors(_sku, _suppliers);

        euint64 threshA = FHE.asEuint64(bandAThreshold);
        FHE.allowThis(threshA);
        euint64 threshB = FHE.asEuint64(bandBThreshold);
        FHE.allowThis(threshB);

        ebool isA    = FHE.lte(total, threshA);
        FHE.allowThis(isA);
        ebool isAorB = FHE.lte(total, threshB);
        FHE.allowThis(isAorB);

        // band = isA ? 0 : (isAorB ? 1 : 2)
        euint8 zero = FHE.asEuint8(0);
        FHE.allowThis(zero);
        euint8 one = FHE.asEuint8(1);
        FHE.allowThis(one);
        euint8 two = FHE.asEuint8(2);
        FHE.allowThis(two);

        euint8 bandB = FHE.select(isAorB, one, two);
        FHE.allowThis(bandB);
        euint8 band  = FHE.select(isA, zero, bandB);
        FHE.allowThis(band);
        FHE.allow(band, msg.sender);

        return band;
    }

    /// @notice Double-blind threshold check.
    ///         Buyer submits an encrypted maximum limit; contract computes
    ///         FHE.lte(footprint, threshold). Neither value is ever decrypted.
    ///         Returns an encrypted ebool — decrypt to see pass (true) or fail (false).
    /// @param _sku        Product identifier.
    /// @param _suppliers  List of supplier addresses.
    /// @param _threshold  Client-encrypted threshold in tCO2e.
    /// @return            Encrypted ebool: true = footprint ≤ threshold.
    function checkThreshold(
        bytes32 _sku,
        address[] calldata _suppliers,
        InEuint64 calldata _threshold
    ) external returns (ebool) {
        require(_suppliers.length > 0, "No suppliers");

        euint64 total = _sumFactors(_sku, _suppliers);
        euint64 threshold = FHE.asEuint64(_threshold);
        FHE.allowThis(threshold);

        ebool result = FHE.lte(total, threshold);
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        return result;
    }

    // ─── Admin ──────────────────────────────────────────────────────────

    /// @notice Owner updates the band classification thresholds.
    function setBandThresholds(
        uint64 _thresholdA,
        uint64 _thresholdB
    ) external onlyOwner {
        require(_thresholdA < _thresholdB, "A must be less than B");
        bandAThreshold = _thresholdA;
        bandBThreshold = _thresholdB;
    }

    // ─── Internal ───────────────────────────────────────────────────────

    /// @dev Reads all supplier factors via allowTransient in the current TX
    ///      and sums them with FHE.add. allowTransient grants expire at TX end.
    function _sumFactors(
        bytes32 _sku,
        address[] calldata _suppliers
    ) internal returns (euint64) {
        euint64 total = supplierAttest.getFactor(_suppliers[0], _sku);
        FHE.allowThis(total);

        for (uint256 i = 1; i < _suppliers.length; ) {
            euint64 factor = supplierAttest.getFactor(_suppliers[i], _sku);
            total = FHE.add(total, factor);
            FHE.allowThis(total);
            unchecked { ++i; }
        }

        return total;
    }
}
