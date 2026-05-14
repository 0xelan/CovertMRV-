// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {FHE, euint64} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {FHERC20} from "fhenix-confidential-contracts/contracts/FHERC20/FHERC20.sol";

/// @title cCO2
/// @notice Encrypted fungible carbon credit token (FHERC20).
///         Inherits from fhenix-confidential-contracts FHERC20 v0.3.1.
///
///         Key properties:
///         - All balances are encrypted — never exposed as plaintext
///         - Indicator system: balanceOf() returns 0-9999 for wallet compat
///         - Transfers via confidentialTransfer(to, InEuint64) — amounts encrypted
///         - Time-bounded operators: setOperator(spender, deadline) instead of allowances
///         - mint: restricted to the CreditIssuer contract
///         - burnFrom: restricted to the CreditRetire contract
contract cCO2 is FHERC20 {
    address public owner;
    address public issuer;   // CreditIssuer — only address that can mint
    address public retirer;  // CreditRetire — only address that can burn

    event IssuerSet(address indexed issuer);
    event RetirerSet(address indexed retirer);

    constructor()
        FHERC20(
            "Covert Carbon Credit",
            "cCO2",
            18,
            "ipfs://QmCovertMRVcCO2"
        )
    {
        owner = msg.sender;
        // Pre-initialize _totalSupply so the first external mintEncrypted call works.
        // FHESafeMath.tryIncrease returns the input handle unchanged when _totalSupply is
        // uninitialized, but FHERC20._update then calls FHE.allowThis on that handle.
        // If the handle was created by CreditIssuer (not cCO2), allowThis would revert with
        // SenderNotAllowed. By minting 0 here, cCO2 creates and owns the initial _totalSupply
        // handle, so all subsequent FHE operations inside _update use cCO2-owned handles.
        euint64 zero = FHE.asEuint64(0);
        FHE.allowThis(zero);
        _mint(msg.sender, zero);
    }

    // ─── Access control ─────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyIssuer() {
        require(msg.sender == issuer, "Only issuer");
        _;
    }

    modifier onlyRetirer() {
        require(msg.sender == retirer, "Only retirer");
        _;
    }

    /// @notice Owner sets the CreditIssuer contract address.
    function setIssuer(address _issuer) external onlyOwner {
        require(_issuer != address(0), "zero issuer");
        issuer = _issuer;
        emit IssuerSet(_issuer);
    }

    /// @notice Owner sets the CreditRetire contract address.
    function setRetirer(address _retirer) external onlyOwner {
        require(_retirer != address(0), "zero retirer");
        retirer = _retirer;
        emit RetirerSet(_retirer);
    }

    // ─── Mint / Burn ─────────────────────────────────────────────────────

    /// @notice Mint carbon credits as a plaintext amount (converted to encrypted).
    ///         Only callable by the CreditIssuer contract.
    /// @param _to     Recipient of the credits.
    /// @param _amount Plaintext amount to mint (converted to encrypted internally).
    function mint(address _to, uint256 _amount) external onlyIssuer {
        euint64 encAmount = FHE.asEuint64(_amount);
        FHE.allowThis(encAmount);
        FHE.allow(encAmount, _to);
        _mint(_to, encAmount);
    }

    /// @notice Mint carbon credits as an already-encrypted euint64 handle.
    ///         Used by CreditIssuer when minting via FHE.select conditional.
    ///         Caller (CreditIssuer) must call FHE.allow(_encAmount, address(this))
    ///         before calling this function so FHERC20._update can use the handle.
    /// @param _to        Recipient of the credits.
    /// @param _encAmount Encrypted euint64 amount (must have FHE.allow granted to cCO2).
    function mintEncrypted(address _to, euint64 _encAmount) external onlyIssuer {
        // Do not call FHE.allow/allowThis here — cCO2 didn't create this handle.
        // FHERC20._update will FHE.allow the resulting balance handle to _to internally.
        _mint(_to, _encAmount);
    }

    /// @notice Burn credits from a holder's balance.
    ///         Only callable by the CreditRetire contract.
    ///         Takes an already-verified euint64 handle (verifyInput/asEuint64 must be
    ///         called in CreditRetire where msg.sender is the retirer, not here).
    ///         CreditRetire must also call FHE.allow(amount, address(this)) first.
    /// @param _from      Holder whose credits are being burned.
    /// @param _amount    Pre-verified encrypted amount to burn.
    function burnFrom(address _from, euint64 _amount) external onlyRetirer {
        _burn(_from, _amount);
    }
}
