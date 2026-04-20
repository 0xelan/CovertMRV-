# CovertMRV

> **Encrypted carbon compliance.** Prove you meet your emissions cap without revealing what your emissions are.

[![Network](https://img.shields.io/badge/network-Arbitrum%20Sepolia-8b5cf6?style=flat-square)](https://sepolia.arbiscan.io/)
[![Solidity](https://img.shields.io/badge/solidity-0.8.28-363636?style=flat-square&logo=solidity)](https://soliditylang.org/)
[![SDK](https://img.shields.io/badge/%40cofhe%2Fsdk-0.4.0-10b981?style=flat-square)](https://www.npmjs.com/package/@cofhe/sdk)
[![Wave](https://img.shields.io/badge/wave-2%20%E2%80%94%20CapCheck-emerald?style=flat-square)](#wave-2-deliverables)

---

## What is CovertMRV?

CovertMRV is the first Fully Homomorphic Encryption (FHE) powered Measurement, Reporting, and Verification (MRV) protocol for climate compliance and carbon markets.

Climate regulation forces a structural conflict: regulators demand transparency, but facility-level emissions data is trade secret � revealing production volumes, energy efficiency, and competitive position. Today companies are forced to choose between honest reporting and survival. **CovertMRV makes the choice unnecessary.**

Companies submit encrypted emissions. The protocol aggregates them under FHE, compares the total to an encrypted regulatory cap, and returns an encrypted boolean result � compliant or not. The regulator sees `true`. The chain never sees `12,500 tonnes`. The cap value remains sealed. No one except the emitting company learns the underlying number.

---

## The Problem

| Challenge | Scale |
|-----------|-------|
| Facility emissions are trade secrets but regulators need them | ~$900B carbon market |
| Scope 3 computation requires supplier data � suppliers serve competitors | 70�90% of most companies' footprints |
| Voluntary carbon credit markets suffer from double-counting and opacity | $2B+ annual market |
| Procurement bids for carbon offsets reveal strategic intent on public chains | � |

---

## Wave 2 Deliverables

Wave 2 ships **CapCheck** � on-chain encrypted compliance verification for regulatory caps.

| Component | Description |
|-----------|-------------|
| `CapRegistry.sol` | Accepts encrypted facility emissions (`euint64`), aggregates via `FHE.add()`, stores encrypted regulatory caps |
| `CapCheck.sol` | Runs `FHE.lte(total, cap)` ? `ebool`, manages time-bounded audit access, settles compliance on-chain |
| `@cofhe/sdk` integration | Full client-side encrypt/decrypt pipeline using permit-based `decryptForView` + `decryptForTx` |
| Production dApp | TanStack Start, React 19, wagmi v2, RainbowKit � wallet-connected compliance dashboard |
| 11 FHE operations | encrypt, add, lte, gte, select, allow, allowThis, allowSender, sealoutput, asEuint64, isInitialized |

---

## Deployed Contracts

| Contract | Address | Network |
|----------|---------|---------|
| `CapRegistry.sol` | [`0x13739cCd234A901060453d7b86C1BCc245B40428`](https://sepolia.arbiscan.io/address/0x13739cCd234A901060453d7b86C1BCc245B40428) | Arbitrum Sepolia |
| `CapCheck.sol` | [`0x2792563D003faBEecfbac8c32c9baA7705030C26`](https://sepolia.arbiscan.io/address/0x2792563D003faBEecfbac8c32c9baA7705030C26) | Arbitrum Sepolia |

Chain ID: `421614` � Solidity: `0.8.28` � EVM: `cancun` � viaIR: enabled

---

## Architecture

```
  Browser (wagmi + @cofhe/sdk v0.4.0)
  encrypt(emissionsTonnes) ? euint64 ciphertext + inputProof
                                          �
                                          ?
  +-----------------------------------------------------+
  �  CapRegistry.sol  [0x13739...0428]                  �
  �    registerAsEmitter()                              �
  �    submitEmissions(facilityId, eInput)              �
  �    aggregateBase(company) ? FHE.add(f1, f2 ...)    �
  �    setCap(company, eInput)   // admin only          �
  +-----------------------------------------------------+
                                          �
                                          ?
  +-----------------------------------------------------+
  �  CapCheck.sol     [0x27925...0C26]                  �
  �    checkCompliance(company)                         �
  �      ? ebool = FHE.lte(total, cap)                  �
  �      ? FHE.allow(result, owner)  // ebool only      �
  �    settleCompliance(company, val, sig)              �
  �    grantAuditAccess(company, auditor, expiry)       �
  +-----------------------------------------------------+
                                          �
                                Fhenix CoFHE Coprocessor
                           Threshold Network � All compute async
```

---

## Selective Disclosure Model

| Level | Visible to | Data revealed |
|-------|-----------|---------------|
| L0 | Company only | Raw facility ciphertext |
| L1 | + Auditor (time-bounded) | Aggregate total (plaintext, scoped) |
| L2 | + Regulator | Pass/fail boolean only |
| L3 | Anyone | Transaction hash (on-chain proof) |

The cap value and exact emission figures are never `allowPublic`. The regulator learns compliance status, not the number.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.28, Fhenix FHE library, viaIR |
| FHE Coprocessor | Fhenix CoFHE, @cofhe/sdk v0.4.0 |
| Frontend | TanStack Start, React 19, Tailwind v4, Framer Motion |
| Wallet | wagmi v2, viem, RainbowKit |
| Network | Arbitrum Sepolia (421614) |

---

## Repository Structure

```
covertmrv/
+-- contracts/
�   +-- DisclosureACL.sol      # Shared base: roles, FHE ACL helpers
�   +-- CapRegistry.sol        # Encrypted emissions storage
�   +-- CapCheck.sol           # Compliance verification engine
+-- frontend/
�   +-- src/
�   �   +-- routes/            # TanStack Start pages
�   �   +-- components/        # UI + site components
�   �   +-- hooks/             # useCovertMrv, wallet hooks
�   �   +-- lib/               # fhe.ts singleton, gas helpers
�   +-- public/
+-- scripts/                   # Deploy + verify scripts
```

---

## Quick Start

```bash
# Install
cd frontend && npm install

# Configure
cp .env.example .env.local
# VITE_CHAIN_ID=421614
# VITE_CAP_REGISTRY_ADDRESS=0x13739cCd234A901060453d7b86C1BCc245B40428
# VITE_CAP_CHECK_ADDRESS=0x2792563D003faBEecfbac8c32c9baA7705030C26

# Dev server
npm run dev          # http://localhost:5173

# Build
npm run build
```

---

## Roadmap

| Wave | Module | Description | Status |
|------|--------|-------------|--------|
| Wave 1 | CapRegistry | Encrypted emissions submission + storage | ? Done |
| Wave 2 | CapCheck | Compliance verification + audit ACL | ? Live |
| Wave 3 | ScopeX | Supply chain Scope 3 footprint rollups | Planned |
| Wave 4 | Credits | Confidential cCO2 token (FHERC20) | Planned |
| Wave 5 | Tender | Sealed-bid carbon offset procurement | Planned |

---

## License

MIT � Built for the Fhenix CoFHE Buildathon � Wave 2
