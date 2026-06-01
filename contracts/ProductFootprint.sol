// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {FHE, euint64, euint8, InEuint64, ebool} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {DisclosureACL} from "./DisclosureACL.sol";

interface ISupplierAttest {
    function getFactor(address supplier, bytes32 sku) external returns (euint64);
}

/// @title ProductFootprint
/// @notice Supply-chain FHE rollup with persisted result handles per requester+sku.
contract ProductFootprint is DisclosureACL {
    ISupplierAttest public immutable supplierAttest;

    uint64 public bandAThreshold = 100;
    uint64 public bandBThreshold = 500;

    mapping(address => mapping(bytes32 => euint64)) private footprintResults;
    mapping(address => mapping(bytes32 => euint8)) private bandResults;
    mapping(address => mapping(bytes32 => ebool)) private thresholdResults;

    event FootprintComputed(
        address indexed requester,
        bytes32 indexed sku,
        uint256 supplierCount
    );
    event BandClassified(address indexed requester, bytes32 indexed sku);
    event ThresholdChecked(address indexed requester, bytes32 indexed sku);

    constructor(address _supplierAttest) {
        owner = msg.sender;
        roles[msg.sender] = Role.ADMIN;
        emit RoleGranted(msg.sender, Role.ADMIN);
        supplierAttest = ISupplierAttest(_supplierAttest);
    }

    function computeFootprint(
        bytes32 _sku,
        address[] calldata _suppliers
    ) external returns (euint64) {
        require(_suppliers.length > 0, "No suppliers");

        euint64 total = _sumFactors(_sku, _suppliers);
        FHE.allow(total, msg.sender);
        footprintResults[msg.sender][_sku] = total;

        emit FootprintComputed(msg.sender, _sku, _suppliers.length);
        return total;
    }

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

        ebool isA = FHE.lte(total, threshA);
        FHE.allowThis(isA);
        ebool isAorB = FHE.lte(total, threshB);
        FHE.allowThis(isAorB);

        euint8 zero = FHE.asEuint8(0);
        FHE.allowThis(zero);
        euint8 one = FHE.asEuint8(1);
        FHE.allowThis(one);
        euint8 two = FHE.asEuint8(2);
        FHE.allowThis(two);

        euint8 bandB = FHE.select(isAorB, one, two);
        FHE.allowThis(bandB);
        euint8 band = FHE.select(isA, zero, bandB);
        FHE.allowThis(band);
        FHE.allow(band, msg.sender);

        bandResults[msg.sender][_sku] = band;
        emit BandClassified(msg.sender, _sku);
        return band;
    }

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

        thresholdResults[msg.sender][_sku] = result;
        emit ThresholdChecked(msg.sender, _sku);
        return result;
    }

    function getFootprintResult(
        address _requester,
        bytes32 _sku
    ) external view returns (euint64) {
        return footprintResults[_requester][_sku];
    }

    function getBandResult(
        address _requester,
        bytes32 _sku
    ) external view returns (euint8) {
        return bandResults[_requester][_sku];
    }

    function getThresholdResult(
        address _requester,
        bytes32 _sku
    ) external view returns (ebool) {
        return thresholdResults[_requester][_sku];
    }

    function setBandThresholds(
        uint64 _thresholdA,
        uint64 _thresholdB
    ) external onlyOwner {
        require(_thresholdA < _thresholdB, "A must be less than B");
        bandAThreshold = _thresholdA;
        bandBThreshold = _thresholdB;
    }

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
            unchecked {
                ++i;
            }
        }

        return total;
    }
}
