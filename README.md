# CovertMRV

> **Encrypted carbon compliance.** Prove you meet your emissions cap without revealing what your emissions are.

[![Network](https://img.shields.io/badge/network-Arbitrum%20Sepolia-8b5cf6?style=flat-square)](https://sepolia.arbiscan.io/)
[![Solidity](https://img.shields.io/badge/solidity-0.8.28-363636?style=flat-square&logo=solidity)](https://soliditylang.org/)
[![SDK](https://img.shields.io/badge/%40cofhe%2Fsdk-0.5.2-10b981?style=flat-square)](https://www.npmjs.com/package/@cofhe/sdk)
[![Wave](https://img.shields.io/badge/wave-3%20%E2%80%94%20ComplianceCert-emerald?style=flat-square)](#wave-3-deliverables)
[![Tests](https://img.shields.io/badge/tests-31%20passing-10b981?style=flat-square)](#testing)

---

## What is CovertMRV?

CovertMRV is the first Fully Homomorphic Encryption (FHE) powered Measurement, Reporting, and Verification (MRV) protocol for climate compliance and carbon markets.

Climate regulation forces a structural conflict: regulators demand transparency, but facility-level emissions data is trade secret — revealing production volumes, energy efficiency, and competitive position. Today companies are forced to choose between honest reporting and survival. **CovertMRV makes the choice unnecessary.**

Companies submit encrypted emissions. The protocol aggregates them under FHE, compares the total to an encrypted regulatory cap, and returns an encrypted boolean result — compliant or not. The regulator sees `true`. The chain never sees `12,500 tonnes`. The cap value remains sealed. No one except the emitting company learns the underlying number.

---

## The Problem

| Challenge | Scale |
|-----------|-------|
| Facility emissions are trade secrets but regulators need them | ~$900B carbon market |
| Scope 3 computation requires supplier data — suppliers serve competitors | 70–90% of most companies' footprints |
| Voluntary carbon credit markets suffer from double-counting and opacity | $2B+ annual market |
| Procurement bids for carbon offsets reveal strategic intent on public chains | — |

---

## Wave 3 Deliverables

Wave 3 ships **ComplianceCertificate NFT**, **batch emissions**, **reporting year tracking**, **SDK 0.5.2**, and the **Enterprise API**.

| Component | Description |
|-----------|-------------|
| `ComplianceCertificate.sol` | ERC-721 NFT minted on settlement. Token ID = `keccak256(company, year)`. Self-contained, no external imports |
| `CapRegistry.sol` (updated) | `submitEmissions(id, enc, year)` + `batchSubmitEmissions(ids[], encs[], year)`. Gas-optimised loops |
| `CapCheck.sol` (updated) | `checkCompliance(company, year)`. `settleCompliance` auto-mints certificate. `ComplianceSettled` emits `tokenId` |
| `@cofhe/sdk 0.5.2` | tfhe 1.5.3 WASM. `getOrCreateSelfPermit()` no-args. `set404RetryTimeout(15_000)` on all decrypt chains |
| Dashboard UX | Reporting year pickers, AuditTimer live countdown, Certificate tab with NFT status + download |
| Enterprise API | `POST /api/submit` Vercel Edge Function — HMAC-SHA256 auth, server-side FHE encrypt, batch submit |
| 31 Hardhat tests | Full suite covering batch, cert mint, double-settle revert, event log parsing |

---

## Deployed Contracts (Wave 3)

| Contract | Address | Network |
|----------|---------|---------|
| `CapRegistry.sol` | [`0x495e718979D882024CAea4613D7b05F9865bC652`](https://sepolia.arbiscan.io/address/0x495e718979D882024CAea4613D7b05F9865bC652) | Arbitrum Sepolia |
| `CapCheck.sol` | [`0xbeA50F98e24F03D6A901897C2B520636d19B9043`](https://sepolia.arbiscan.io/address/0xbeA50F98e24F03D6A901897C2B520636d19B9043) | Arbitrum Sepolia |
| `ComplianceCertificate.sol` | [`0xC327A527B81402495f343277E37AE19b4112749d`](https://sepolia.arbiscan.io/address/0xC327A527B81402495f343277E37AE19b4112749d) | Arbitrum Sepolia |

Chain ID: `421614` · Solidity: `0.8.28` · EVM: `cancun` · viaIR: enabled · Deployer: `0x2301CD93feC8249219b4b661b4bc81889b494De6`

---

## Architecture

```
  Browser / Enterprise API (wagmi + @cofhe/sdk v0.5.2)
  encrypt(emissionsTonnes) → euint64 ciphertext
                                         │
                                         ▼
  ┌──────────────────────────────────────────────────────┐
  │  CapRegistry.sol  [0x495e...C652]                    │
  │    registerAsEmitter()                               │
  │    submitEmissions(facilityId, eInput, year)         │
  │    batchSubmitEmissions(ids[], eInputs[], year)       │
  │    aggregateTotal(company) → FHE.add(f1, f2 ...)     │
  │    setCap(company, eInput)   // admin only           │
  └──────────────────────────────────────────────────────┘
                                         │
                                         ▼
  ┌──────────────────────────────────────────────────────┐
  │  CapCheck.sol     [0xbeA5...9043]                    │
  │    checkCompliance(company, year)                    │
  │      → ebool = FHE.lte(total, cap)                   │
  │      → FHE.allow(result, owner)  // ebool only       │
  │    settleCompliance(company, val, sig)               │
  │      └→ ComplianceCertificate.mintCertificate()      │
  └──────────────────────────────────────────────────────┘
                                         │
                                         ▼
  ┌──────────────────────────────────────────────────────┐
  │  ComplianceCertificate.sol  [0xC327...749d]          │
  │    ERC-721. tokenId = keccak256(company, year)       │
  │    certificates[id] = {company, year, compliant, ts} │
  └──────────────────────────────────────────────────────┘
                                         │
                             Fhenix CoFHE Coprocessor
                        Threshold Network · All compute async
```

---

## Selective Disclosure Model

| Level | Visible to | Data revealed |
|-------|-----------|---------------|
| L0 | Company only | Raw facility ciphertext |
| L1 | + Auditor (time-bounded) | Aggregate total (plaintext, scoped) |
| L2 | + Regulator | Pass/fail boolean only |
| L3 | Anyone | Transaction hash (on-chain proof) + NFT certificate |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.28, Fhenix FHE library, viaIR |
| FHE Coprocessor | Fhenix CoFHE, @cofhe/sdk v0.5.2, tfhe 1.5.3 |
| Frontend | TanStack Router SPA, React 19, Tailwind v4, Framer Motion |
| Wallet | wagmi v2, viem, RainbowKit |
| API | Vercel Edge Function, HMAC-SHA256 auth |
| Network | Arbitrum Sepolia (421614) |

---

## Repository Structure

```
covertmrv/
├── contracts/
│   ├── DisclosureACL.sol           # Shared base: roles, FHE ACL helpers
│   ├── CapRegistry.sol             # Encrypted emissions + batch submit + cap
│   ├── CapCheck.sol                # Compliance verification + cert wiring
│   └── ComplianceCertificate.sol   # ERC-721 compliance certificate NFT
├── test/
│   ├── CapRegistry.test.ts         # 23 tests incl. batch, audit
│   ├── CapCheck.test.ts            # 8 tests incl. cert mint, settle
│   └── DisclosureACL.test.ts       # ACL role + audit grant tests
├── tasks/
│   └── deploy.ts                   # Deploys all 3 contracts + wires them
├── api/
│   └── submit.ts                   # POST /api/submit enterprise edge fn
└── frontend/
    └── src/
        ├── routes/
        │   ├── dashboard.tsx       # Full dApp: submit, check, audit, cert
        │   └── docs.tsx            # Protocol documentation
        ├── hooks/
        │   └── useCovertMrv.ts     # All on-chain interactions
        ├── lib/
        │   └── fhe.ts              # @cofhe/sdk 0.5.2 singleton
        └── config/
            └── contracts.ts        # ABIs + addresses (auto-generated)
```

---

## Quick Start

```bash
# Clone & install
git clone https://github.com/0xelan/CovertMRV-
cd CovertMRV-
npm install
cd frontend && npm install

# Run tests
npx hardhat test    # 31/31 passing

# Deploy (requires PRIVATE_KEY in .env)
npx hardhat deploy:covertmrv --network arb-sepolia

# Dev server
cd frontend && npm run dev    # http://localhost:5173

# Production build
cd frontend && npm run build
```

### Enterprise API

```bash
# Compute MAC = HMAC-SHA256(API_SECRET, JSON_BODY) then:
curl https://covert-mrv.vercel.app/api/submit \
  -H "Authorization: Bearer <MAC>" \
  -H "Content-Type: application/json" \
  -d '{"facilityIds":[1,2,3],"emissionsTonnes":[12500,8300,19100],"reportingYear":2025,"company":"0x..."}'
```

Required Vercel env vars: `API_SECRET`, `SUBMIT_PRIVATE_KEY`, `CAP_REGISTRY_ADDRESS`.

---

## Testing

```
npx hardhat test

  CapRegistry
    ✓ deploys (23 tests)
    Batch submissions
      ✓ batchSubmitEmissions submits multiple facilities in one tx
      ✓ batchSubmitEmissions reverts on length mismatch
      ✓ batchSubmitEmissions reverts on empty batch

  CapCheck
    ✓ settleCompliance writes result and mints certificate
    ✓ double settle reverts
    ✓ ComplianceCertificate NFT ownership correct
    ... 8 tests total

  DisclosureACL
    ... (role + audit grant coverage)

  31 passing (2s)
```

---

## Roadmap

| Wave | Module | Description | Status |
|------|--------|-------------|--------|
| Wave 1 | CapRegistry | Encrypted emissions submission + storage | ✅ Done |
| Wave 2 | CapCheck | Compliance verification + audit ACL | ✅ Done |
| Wave 3 | ComplianceCert | Batch submit, reporting year, ERC-721 cert, Enterprise API | ✅ Live |
| Wave 4 | ScopeX | Supply chain Scope 3 footprint rollups | Planned |
| Wave 5 | Credits | Confidential cCO2 token (FHERC20) | Planned |
| Wave 6 | Tender | Sealed-bid carbon offset procurement | Planned |

---

## License

MIT · Built for the Fhenix CoFHE Buildathon · Wave 3


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
