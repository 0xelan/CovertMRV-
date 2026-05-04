# CovertMRV

> **Encrypted carbon compliance.** Prove you meet your emissions cap without revealing what your emissions are.

[![Network](https://img.shields.io/badge/network-Arbitrum%20Sepolia-8b5cf6?style=flat-square)](https://sepolia.arbiscan.io/)
[![Solidity](https://img.shields.io/badge/solidity-0.8.28-363636?style=flat-square&logo=solidity)](https://soliditylang.org/)
[![SDK](https://img.shields.io/badge/%40cofhe%2Fsdk-0.5.2-10b981?style=flat-square)](https://www.npmjs.com/package/@cofhe/sdk)
[![Wave](https://img.shields.io/badge/wave-3%20%E2%80%94%20ISO%2014064%20%7C%20BatchUI%20%7C%20ComplianceCert-10b981?style=flat-square)](#wave-3-deliverables)
[![Tests](https://img.shields.io/badge/tests-31%20passing-10b981?style=flat-square)](#testing)
[![Live](https://img.shields.io/badge/live-covert--mrv.vercel.app-10b981?style=flat-square)](https://covert-mrv.vercel.app)

---

## What is CovertMRV?

CovertMRV is the first Fully Homomorphic Encryption (FHE) powered Measurement, Reporting, and Verification (MRV) protocol for climate compliance and carbon markets. It is the only system on any blockchain where facility-level emissions, regulatory caps, and compliance aggregates are never in plaintext — not during storage, not during computation, not during comparison.

Climate regulation forces a structural conflict: regulators demand transparency, but facility-level emissions data is competitive trade secret — revealing production volumes, energy efficiency ratios, and supply-chain strategy to every competitor. Today companies choose between honest reporting and survival. **CovertMRV makes the choice unnecessary.**

Companies submit encrypted emissions using `@cofhe/sdk`. The smart contracts aggregate them using `FHE.add()` without ever touching plaintext. Compliance is checked with `FHE.lte(total, cap)` — both inputs remain sealed. The result is an encrypted boolean: **compliant or not**. The regulator receives `true` or `false`. The chain never learns `12,500 tonnes`. The cap remains sealed. Nobody learns the underlying number except the company itself.

---

## The Problem

| Challenge | Why It Matters |
|-----------|---------------|
| Facility emissions are trade secrets | Reporting reveals production volumes, cost structure, competitive position |
| Scope 3 needs supplier data | Suppliers serve multiple competitors — data sharing is commercially impossible |
| Carbon credit markets lack integrity | Double-counting, inflated baselines, opaque registries plague a $2B+ voluntary market |
| Public-chain compliance bids expose strategy | Offset procurement amounts reveal climate commitment budgets and forward targets |
| Regulators need numbers; companies refuse | The result is systematic underreporting and a market built on trust, not proof |

---

## Wave 3 Deliverables

Wave 3 ships **ISO 14064 Scope 1/2/3 classification**, **batch submit UI**, **ComplianceCertificate NFT**, **reporting year tracking**, **SDK 0.5.2 migration**, and the **Enterprise API**.

| # | Component | Description | Status |
|---|-----------|-------------|--------|
| 1 | `ComplianceCertificate.sol` | ERC-721 NFT minted on settlement. `tokenId = keccak256(company, year)`. Self-contained, no external imports. Stores `{company, year, compliant, issuedAt}` | ✅ Deployed |
| 2 | `CapRegistry.sol` (updated) | ISO 14064 `Scope` enum (SCOPE1/2/3). `submitEmissions(id, enc, year, scope)`. `batchSubmitEmissions(ids[], encs[], year, scope)` up to 50 facilities/tx. Gas-optimised loops | ✅ Deployed |
| 3 | `CapCheck.sol` (updated) | `checkCompliance(company, year)`. `settleCompliance` auto-mints NFT. `ComplianceSettled` emits `tokenId`. `IComplianceCertificate` interface | ✅ Deployed |
| 4 | `@cofhe/sdk 0.5.2` | tfhe 1.5.3 WASM. `getOrCreateSelfPermit()` no-args. `.set404RetryTimeout(15_000)` on all decrypt chains | ✅ Done |
| 5 | ISO 14064 Scope selector | Interactive 3-card grid in Submit Emissions UI — Scope 1 (Direct), Scope 2 (Indirect Energy), Scope 3 (Value Chain) | ✅ Done |
| 6 | Batch Submit UI panel | Collapsible dashboard panel. Dynamic facility rows, add/remove, live gas estimate, Arbiscan link on success | ✅ Done |
| 7 | 3-contract Overview | Dashboard Overview shows all 3 contract cards + 4-column stats including certificate NFT balance | ✅ Done |
| 8 | AuditTimer live countdown | Real-time HH:MM:SS countdown to audit grant expiry in dashboard header | ✅ Done |
| 9 | Certificate tab + download | NFT status view, FHE privacy proof list, client-side `.txt` certificate download | ✅ Done |
| 10 | Enterprise API | `POST /api/submit` Vercel Edge Function — HMAC-SHA256 auth, server-side FHE encrypt, batch submit up to 50 facilities | ✅ Done |
| 11 | 31 Hardhat tests | Full suite — batch, cert mint, double-settle revert, scope enum, event log parsing | ✅ 31/31 |

---

## Deployed Contracts (Wave 3 — Arbitrum Sepolia)

| Contract | Address | Network |
|----------|---------|---------|
| `CapRegistry.sol` | [`0x4460Be641B40484bBD25231f594158531e84e108`](https://sepolia.arbiscan.io/address/0x4460Be641B40484bBD25231f594158531e84e108) | Arbitrum Sepolia |
| `CapCheck.sol` | [`0x7E2cc776495bb4565C28F60E3a708a44314a2965`](https://sepolia.arbiscan.io/address/0x7E2cc776495bb4565C28F60E3a708a44314a2965) | Arbitrum Sepolia |
| `ComplianceCertificate.sol` | [`0xF91b8DDf2a4110A897204206714E5B90CAd2C8D5`](https://sepolia.arbiscan.io/address/0xF91b8DDf2a4110A897204206714E5B90CAd2C8D5) | Arbitrum Sepolia |

Chain ID: `421614` · Solidity: `0.8.28` · EVM: `cancun` · viaIR: enabled · Deployer: `0x2301CD93feC8249219b4b661b4bc81889b494De6`

---

## Architecture

```
  Browser / Enterprise API (@cofhe/sdk 0.5.2 + wagmi v2)
  client.encrypt_uint64(emissionsTonnes) → euint64 ciphertext
                                                │
                                                ▼
  ┌──────────────────────────────────────────────────────────────┐
  │  CapRegistry.sol  [0x4460Be641B40484bBD25231f594158531e84e108]│
  │    registerAsEmitter()                                       │
  │    submitEmissions(facilityId, eInput, year, scope)          │
  │    batchSubmitEmissions(ids[], eInputs[], year, scope)        │
  │    aggregateTotal(company) → euint64 via FHE.add()           │
  │    setCap(company, eInput)   // admin only                   │
  │    getFacilityScope(company, facilityId) → Scope enum        │
  └──────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
  ┌──────────────────────────────────────────────────────────────┐
  │  CapCheck.sol     [0x7E2cc776495bb4565C28F60E3a708a44314a2965]│
  │    checkCompliance(company, year) → ebool = FHE.lte(t,c)    │
  │    settleCompliance(company, bool, sig)                      │
  │      └─▶ ComplianceCertificate.mintCertificate()            │
  │    grantAuditAccessToTotal(auditor, durationSec)             │
  │    revokeAuditAccess(auditor)                                │
  └──────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
  ┌──────────────────────────────────────────────────────────────┐
  │  ComplianceCertificate.sol [0xF91b8DDf2a4110A897204206714E5B90CAd2C8D5]│
  │    ERC-721. tokenId = keccak256(company, year)               │
  │    mintCertificate(company, year, compliant) → tokenId       │
  │    getCertificate(tokenId) → Certificate struct              │
  │    balanceOf(owner) · ownerOf(tokenId)                       │
  └──────────────────────────────────────────────────────────────┘

  DisclosureACL (inherited base)
    auditGrants[company][auditor] → (expiry, active)
    Roles: EMITTER · AUDITOR · REGULATOR · ADMIN
```

---

## ISO 14064 Scope Classification

Wave 3 adds the first on-chain ISO 14064 Scope categorisation to a privacy-preserving MRV protocol.

| Scope | Type | Examples |
|-------|------|---------|
| Scope 1 | Direct emissions | Combustion, process emissions, fugitive releases |
| Scope 2 | Indirect energy | Purchased electricity, heat, steam, cooling |
| Scope 3 | Value chain | Business travel, supply chain, waste, logistics |

The `Scope` enum is stored in `FacilityData`, emitted in `EmissionsSubmitted` events, and selectable from the dashboard's 3-card UI. Auditors can query `getFacilityScope(address, facilityId)`.

---

## Selective Disclosure Model

| Level | Visible to | Data revealed |
|-------|-----------|---------------|
| L0 | Company only | Raw facility euint64 ciphertext |
| L1 | + Auditor (time-bounded) | Aggregate encrypted total (FHE.allow scoped) |
| L2 | + Regulator | Pass/fail boolean only — never the number |
| L3 | Anyone | Transaction hash (immutable proof) + ERC-721 NFT certificate |

Time-bounded audit grants expire automatically on-chain. The `AuditTimer` component shows a live HH:MM:SS countdown.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.28, Fhenix FHE library, viaIR, cancun EVM |
| FHE Coprocessor | Fhenix CoFHE, @cofhe/sdk v0.5.2, tfhe 1.5.3 WASM |
| Frontend | TanStack Router SPA, React 19, Tailwind v4, Framer Motion |
| Wallet | wagmi v2, viem, RainbowKit |
| API | Vercel Edge Function, HMAC-SHA256 auth, server-side FHE encrypt |
| Network | Arbitrum Sepolia (421614) |
| Testing | Hardhat, @cofhe/hardhat-plugin, ethers v6, TypeScript |

---

## Repository Structure

```
covertmrv/
├── contracts/
│   ├── DisclosureACL.sol           # Shared base: roles, FHE ACL helpers, audit grants
│   ├── CapRegistry.sol             # Encrypted emissions + ISO 14064 scope + batch submit + cap
│   ├── CapCheck.sol                # Compliance verification + certificate wiring
│   └── ComplianceCertificate.sol   # ERC-721 compliance certificate NFT
├── test/
│   ├── CapRegistry.test.ts         # 23 tests: batch, scope, audit, aggregation
│   ├── CapCheck.test.ts            # 8 tests: cert mint, settle, double-settle revert
│   └── DisclosureACL.test.ts       # ACL role + timed audit grant tests
├── tasks/
│   └── deploy.ts                   # Deploys all 3 contracts, wires them, writes contracts.ts
├── api/
│   └── submit.ts                   # POST /api/submit — HMAC auth, server-side FHE, batch
└── frontend/
    └── src/
        ├── routes/
        │   ├── index.tsx           # Landing page with all marketing sections
        │   ├── dashboard.tsx       # Full dApp: submit, check, audit, batch, cert
        │   └── docs.tsx            # Protocol documentation
        ├── hooks/
        │   └── useCovertMrv.ts     # All on-chain interactions + certificate balance
        ├── lib/
        │   └── fhe.ts              # @cofhe/sdk 0.5.2 singleton
        └── config/
            └── contracts.ts        # ABIs + addresses (auto-generated by deploy task)
```

---

## Quick Start

```bash
# Clone & install
git clone https://github.com/0xelan/CovertMRV-
cd CovertMRV-
npm install
cd frontend && npm install

# Run tests (31/31 passing)
npx hardhat test

# Deploy to Arbitrum Sepolia (requires PRIVATE_KEY in .env)
npx hardhat deploy:covertmrv --network arb-sepolia

# Dev server
cd frontend && npm run dev    # http://localhost:5173

# Production build
cd frontend && npm run build  # 8773 modules transformed
```

### Enterprise API

```bash
# Compute MAC = HMAC-SHA256(API_SECRET, JSON_BODY) then:
curl https://covert-mrv.vercel.app/api/submit \
  -H "Authorization: Bearer <MAC>" \
  -H "Content-Type: application/json" \
  -d '{
    "facilityIds": [1, 2, 3],
    "emissionsTonnes": [12500, 8300, 19100],
    "reportingYear": 2025,
    "company": "0x..."
  }'
# Response: {"txHash":"0x...","facilityCount":3,"reportingYear":2025}
```

Required env vars: `API_SECRET`, `SUBMIT_PRIVATE_KEY`, `CAP_REGISTRY_ADDRESS`.

---

## Testing

```
npx hardhat test

  CapCheck (9 tests)
    ✔ checkCompliance computes FHE.lte(total, cap) and emits event
    ✔ company can decrypt its own boolean status (compliant)
    ✔ company sees false when over the cap
    ✔ regulator (owner) can decrypt boolean for view
    ✔ settleCompliance writes plaintext result and mints certificate
    ✔ non-owner cannot settle
    ✔ double settle reverts

  CapRegistry (23 tests)
    Submissions
      ✔ EMITTER can submit encrypted emissions
      ✔ non-EMITTER cannot submit emissions
      ✔ re-submitting the same facility updates without growing list
    Batch submissions
      ✔ batchSubmitEmissions submits multiple facilities in one tx
      ✔ batchSubmitEmissions reverts on length mismatch
      ✔ batchSubmitEmissions reverts on empty batch
    ... (aggregation, cap, audit access, role tests)

  DisclosureACL (9 tests)
    ✔ owner can grant a role
    ✔ anyone can self-register as EMITTER
    ✔ audit grants are active before expiry
    ✔ time travel reflects in block.timestamp

  31 passing (2s)
```

---

## How FHE Enables This

Traditional approaches fail for encrypted compliance:

- **ZK Proofs** — prover must know the cap to construct the proof. Cap becomes public knowledge.
- **Trusted Execution Environments (TEE)** — raw data decrypted inside the enclave. Side-channel attacks expose everything.
- **Multi-Party Computation (MPC)** — all parties must be online simultaneously. Global supply chains make this infeasible.

**FHE** performs arithmetic directly on sealed ciphertext. `FHE.add(f1, f2)` produces the correct encrypted total without decrypting either input. `FHE.lte(total, cap)` returns the correct encrypted boolean without opening either value. The Fhenix CoFHE coprocessor handles all computation asynchronously. No hardware trust required.

---

## Roadmap

| Wave | Module | Description | Status |
|------|--------|-------------|--------|
| Wave 1 | CapRegistry | Encrypted emissions submission + FHE storage | ✅ Done |
| Wave 2 | CapCheck | Compliance verification + time-bounded audit ACL | ✅ Done |
| Wave 3 | ComplianceCert | ISO 14064 scope, batch submit, ERC-721 cert, Enterprise API | ✅ Live |
| Wave 4 | ScopeX | Encrypted Scope 3 supply chain footprint rollups | Planned |
| Wave 5 | Credits | Confidential cCO2 token (FHERC20) — conditional minting | Planned |
| Wave 6 | Tender | Sealed-bid carbon offset procurement with FHE clearing | Planned |

---

## License

MIT · Built for the Fhenix CoFHE Buildathon · Wave 3 · May 2026
