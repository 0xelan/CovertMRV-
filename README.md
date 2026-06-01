# CovertMRV

> **Encrypted carbon compliance.** Prove you meet your emissions cap without revealing what your emissions are.

[![Network](https://img.shields.io/badge/network-Arbitrum%20Sepolia-8b5cf6?style=flat-square)](https://sepolia.arbiscan.io/)
[![Solidity](https://img.shields.io/badge/solidity-0.8.28-363636?style=flat-square&logo=solidity)](https://soliditylang.org/)
[![SDK](https://img.shields.io/badge/%40cofhe%2Fsdk-0.5.2-10b981?style=flat-square)](https://www.npmjs.com/package/@cofhe/sdk)
[![Contracts](https://img.shields.io/badge/contracts-8%20live-10b981?style=flat-square)](#deployed-contracts-arbitrum-sepolia)
[![Tests](https://img.shields.io/badge/tests-67%20passing-10b981?style=flat-square)](#testing)
[![Live](https://img.shields.io/badge/live-covert--mrv.vercel.app-10b981?style=flat-square)](https://covert-mrv.vercel.app)

---

## Table of contents

1. [What problem we solve](#what-problem-we-solve)
2. [What CovertMRV is](#what-covertmrv-is)
3. [How FHE works in this project (not hand-wavy)](#how-fhe-works-in-this-project-not-hand-wavy)
4. [System architecture](#system-architecture)
5. [Compliance journey (dashboard UX)](#compliance-journey-dashboard-ux)
6. [End-to-end flows](#end-to-end-flows)
7. [Disclosure model & roles](#disclosure-model--roles)
8. [Deployed contracts](#deployed-contracts-arbitrum-sepolia)
9. [Features](#features)
10. [Tech stack](#tech-stack)
11. [Quick start](#quick-start)
12. [Testing](#testing)
13. [Production / Vercel](#vercel--production-environment)
14. [License](#license)

---

## What problem we solve

Traditional MRV (Measurement, Reporting, and Verification) for carbon compliance forces a painful trade-off:

| Today (plaintext MRV) | Pain |
|----------------------|------|
| Facility emissions published on registries | Competitors infer production, fuel mix, and strategy |
| Caps and totals visible on-chain or in APIs | Market signals leak before public disclosure |
| Scope 3 supplier data shared for audits | Suppliers fear factor leakage to buyers |
| Compliance = boolean + tonnes in same report | Regulators get more than they need for pass/fail |

**CovertMRV** keeps tonnes, caps, scopes, supplier factors, and credit balances as **FHE ciphertexts** on Arbitrum Sepolia. The chain performs real homomorphic operations (`FHE.add`, `FHE.lte`, `FHE.select`) via the **Fhenix CoFHE** coprocessor. Only addresses you explicitly authorize can decrypt—and only the handles you grant.

What regulators and the public still get when appropriate:

- An **encrypted** compliance result (`ebool`) until someone with permission decrypts it
- A **public settlement** boolean + ERC-721 certificate metadata after `settleCompliance` (admin)
- **No** facility-level plaintext on-chain events (reporting year and scope removed from events by design)

---

## What CovertMRV is

CovertMRV is an FHE-powered Measurement, Reporting, and Verification protocol for:

1. **Corporate cap compliance** — encrypted facility submissions → homomorphic aggregate → encrypted compare to encrypted cap
2. **ISO 14064 scopes** — scope stored as `euint8` (0=Scope 1, 1=Scope 2, 2=Scope 3), not a public enum
3. **Time-bounded audit disclosure** — `grantAuditAccessToTotal` gives an auditor decrypt rights on the aggregate for N seconds
4. **Supply chain (ScopeX)** — suppliers attest encrypted intensity factors; products roll up footprints with `FHE.allowTransient`
5. **Conditional carbon credits** — `CreditIssuer` mints `cCO2` via `FHE.select` only when compliance `ebool` is true (both branches execute homomorphically)

**Live app:** https://covert-mrv.vercel.app  
**In-app docs:** `/docs` (architecture, SDK snippets, disclosure ladder)

---

## How FHE works in this project (not hand-wavy)

This stack uses **[Fhenix CoFHE](https://cofhe-docs.fhenix.zone/)** on **Arbitrum Sepolia (421614)**.

### Client side (`@cofhe/sdk` 0.5.2 + `tfhe` 1.5.3 WASM)

| Step | What happens | Where in repo |
|------|----------------|---------------|
| Connect | `createCofheClient` + `connect(publicClient, walletClient)` for `arbSepolia` | `frontend/src/lib/fhe.ts` |
| Permit | `getOrCreateSelfPermit()` — no args in 0.5.2 | `fhe.ts` |
| Encrypt | `encryptInputs([Encryptable.uint64(tonnes), Encryptable.uint8(scope)])` → `InEuint64`, `InEuint8` | `useCovertMrv`, `api/submit.ts` |
| Submit tx | Wallet sends calldata with **ciphertext handles**, not plaintext | `CapRegistry.submitEmissions` |
| View decrypt | `decryptForView(handle, FheTypes.Uint64)` + session cache + 15s 404 retry | `fhe.ts` |
| Tx decrypt | `decryptForTx(eboolHandle)` for compliance boolean | dashboard Check tab |

The browser loads **`tfhe_bg.wasm`** (bundled under `frontend` assets). Vite dev serves WASM via custom middleware so the worker does not receive HTML by mistake.

### On-chain (`@fhenixprotocol/cofhe-contracts`)

| Operation | Used for |
|-----------|----------|
| `FHE.asEuint64(InEuint64)` / `FHE.asEuint8(InEuint8)` | Ingest client ciphertexts in `submitEmissions` |
| `FHE.add(a, b)` | Facility rollup + `aggregateTotal` + product footprint sums |
| `FHE.lte(a, b)` | `CapCheck.checkCompliance` — total ≤ cap without revealing either operand |
| `FHE.select(condition, ifTrue, ifFalse)` | Credit mint amount, footprint band classification |
| `FHE.allowThis(handle)` | Contract retains compute permission on stored handles |
| `FHE.allow(handle, addr)` | Persistent decrypt grant (emitter self, auditor, regulator) |
| `FHE.allowTransient(handle, addr)` | Same-transaction cross-contract read (SupplierAttest → ProductFootprint) |

**Important:** Homomorphic comparison produces an **`ebool`**. The cap and total stay encrypted; only parties with `FHE.allow` on that `ebool` (or after public settlement) learn the outcome.

### What is NOT decrypted on-chain by default

- Regulatory cap (`regulatoryCaps[company]`) — compared only inside `FHE.lte`
- Per-facility emissions and scope — unless emitter or time-bounded auditor decrypts
- Supplier factors — unless `grantFactorDecrypt` or transient read in same tx

---

## System architecture

### High-level component map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Users: Emitter wallet · Auditor · Regulator/Admin · Enterprise API         │
└─────────────────────────────────────────────────────────────────────────────┘
         │                              │                         │
         ▼                              ▼                         ▼
┌─────────────────┐          ┌──────────────────┐    ┌─────────────────────┐
│ React dashboard │          │ Vercel API       │    │ Hardhat / CLI tasks   │
│ wagmi v2        │          │ POST /api/submit │    │ deploy:full, set-cap  │
│ @cofhe/sdk 0.5.2│          │ HMAC + server key│    │ verify:deployment     │
└────────┬────────┘          └────────┬─────────┘    └─────────────────────┘
         │ encrypt / decrypt          │ encrypt batch
         └──────────────┬─────────────┘
                        ▼
         ┌──────────────────────────────────────────────┐
         │  Arbitrum Sepolia 421614                        │
         │  CoFHE coprocessor (Fhenix) + 8 Solidity contracts │
         └──────────────────────────────────────────────┘
```

### Contract dependency graph

```
                    DisclosureACL (roles, audit grants)
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
   CapRegistry            CapCheck          ComplianceCertificate
   · submitEmissions      · checkCompliance   · settle → NFT
   · aggregateTotal       · reads ebool       · public metadata
   · setCap (admin)
         │
         │  (compliance ebool)
         ▼
   CreditIssuer ──mint──▶ cCO2 (FHERC20)
         │
   CreditRetire ──burn──▶ encrypted retirement receipt

   SupplierAttest ──allowTransient──▶ ProductFootprint
        · submitFactor                  · computeFootprint
        · grantFactorDecrypt            · classifyBand (FHE.select)
                                        · checkThreshold (FHE.lte)
```

### Data flow: emitter compliance (sequence)

```mermaid
sequenceDiagram
  participant U as Emitter browser
  participant SDK as @cofhe/sdk
  participant CR as CapRegistry
  participant CC as CapCheck
  participant COP as CoFHE coprocessor

  U->>SDK: encryptInputs(tonnes, scope)
  SDK-->>U: InEuint64, InEuint8
  U->>CR: submitEmissions(facilityId, ...)
  CR->>COP: store euint64, FHE.allowThis
  U->>CR: aggregateTotal()
  CR->>COP: FHE.add across facilities
  Note over U,CR: Admin set encrypted cap + grantCheckAccess
  U->>CC: checkCompliance(company, year)
  CC->>COP: FHE.lte(total, cap) → ebool
  U->>SDK: decryptForTx(ebool) [if allowed]
  SDK-->>U: COMPLIANT / NON-COMPLIANT
```

### Privacy-oriented storage (CapRegistry)

Public mappings that leaked metadata were made **private**; the UI scans `getFacilityCount` + `isFacilitySubmitted` instead of a public facility ID list:

- `companyFacilities` — private array
- `hasSubmitted` — private flag
- Events omit `reportingYear` and scope (sensitive metadata)

---

## Compliance journey (dashboard UX)

The dashboard is a **guided regulatory workflow**, not a broken form. A **Compliance Journey** card (Overview, Compliance Check, Certificate, Carbon Credits) shows where you are. Disabled buttons always include a **plain-language reason**—never raw contract reverts.

### Journey steps (emitter path)

| Step | Dashboard label | On-chain meaning | Who acts |
|------|-----------------|------------------|----------|
| 1 | Registered as Emitter | `roleOf(wallet) == EMITTER` on CapRegistry | **You** — Overview → Register as Emitter |
| 2 | Emissions Submitted | `getFacilityCount(company, year) > 0` | **You** — Submit Emissions tab |
| 3 | Total Aggregated | `getCompanyTotal(company, year)` is initialized | **You** — Aggregate Total (after ≥1 facility) |
| 4 | Waiting for Regulator Cap | Encrypted cap + CapCheck read access | **Regulator** — `setCap` + `grantCheckAccess` |
| 5 | Waiting for Compliance Check | `checkCompliance` not run yet for this year | **You** — Compliance Check → Run |
| 6 | Ready to Decrypt | `ebool` stored; private decrypt via CoFHE permit | **You** — Decrypt My Status |
| 7 | Certificate Eligible | Regulator `settleCompliance` + NFT minted | **Regulator** settles; **you** download cert |

The **current** step is highlighted with animation. Earlier steps show ✓; later steps show ⏳. This is intentional waiting—especially step 4—**not a system error**.

### When the regulator cap is missing

After aggregation, the Compliance Check tab shows **Awaiting Regulatory Configuration**:

> Your emissions have been securely submitted and aggregated. Before compliance verification can begin, the regulator must assign an encrypted emissions cap and authorize compliance checks for your organization.

**Run Compliance Check** stays disabled with: *“Unavailable until an encrypted cap is assigned by the regulator.”*

### Console tabs — what each does

| Tab | Purpose | Typical prerequisites |
|-----|---------|------------------------|
| **Overview** | Registration card, journey (compact), company stats, contract links | Wallet connected on Arb Sepolia |
| **Submit Emissions** | Encrypt facility tonnes + ISO scope client-side; batch submit; aggregate | EMITTER role; reporting year matches submissions |
| **Compliance Check** | Full journey card; run encrypted `total ≤ cap`; decrypt private pass/fail | Aggregated total + regulator cap for that year |
| **Audit Access** | Grant auditor decrypt on **aggregate only** (time-bounded UI + `FHE.allow`) | Aggregated total exists |
| **Disclosure Console** | Inspect handles; decrypt what your wallet is allowed to see | At least one encrypted handle |
| **Certificate** | Download statement + view NFT after public settlement | Compliance check done + regulator settlement |
| **Supply Chain** | Supplier factors → footprint → band → threshold (separate registry) | Register on **SupplierAttest** first |
| **Carbon Credits** | Issue / decrypt / retire encrypted `cCO2` | Compliance check exists for company/year |

### Why common actions are disabled (UX copy)

| Action | Disabled because |
|--------|------------------|
| Run Compliance Check | Not registered, no aggregate, or **no encrypted cap yet** |
| Decrypt My Status | No compliance result yet, or ACL still syncing after check tx |
| Download Certificate | Verification or **regulator settlement** not complete |
| Issue Audit Permit | Company total not aggregated yet |
| Issue Credits | No compliance check for that company/year |
| Decrypt Balance | Credits not issued to wallet yet |
| Supply chain compute | SKU, supplier addresses, or SupplierAttest registration missing |

Implementation: `frontend/src/lib/compliance-journey.ts` (`computeComplianceJourney`, `getActionGate`) and `frontend/src/lib/user-facing-errors.ts` (`translateUserError`).

### Regulator / admin operations (CLI)

The deployer wallet (`CapRegistry` owner) configures caps and settlement. Emitters use the dashboard; regulators often use Hardhat:

```bash
# Encrypted cap + grant CapCheck read access (after emitter has aggregated)
npx hardhat covertmrv:set-cap --network arb-sepolia \
  --company 0xYourEmitterAddress --cap 10000 --year 2026

# Decrypt-for-tx + public settlement + certificate NFT
npx hardhat covertmrv:settle --network arb-sepolia \
  --company 0xYourEmitterAddress --year 2026

# On-chain audit for a wallet/year
npx hardhat covertmrv:audit --network arb-sepolia \
  --company 0xYourEmitterAddress --year 2026
```

Contract owner can also use the **Regulator / Admin** panel on Overview when connected with the owner wallet.

### Period keys (reporting year)

Totals, caps, compliance results, and certificates are keyed by **`(company, reportingYear)`**. Always use the same year in Submit, Aggregate, Check, and regulator CLI flags. Facility tracking in the UI is scoped per year (`localStorage` + on-chain `getFacilityCount`).

---

## End-to-end flows

### 1. First-time emitter (full path)

1. Connect wallet → https://covert-mrv.vercel.app/dashboard  
2. **Overview** → **Register as Emitter** (`CapRegistry.registerAsEmitter`)  
3. **Submit Emissions** → one or more facilities (encrypted `InEuint64` + `InEuint8` scope)  
4. **Aggregate Total** → homomorphic sum into `companyTotals[you][year]`  
5. **Regulator** → `covertmrv:set-cap` + automatic `grantCheckAccess` to CapCheck  
6. **Compliance Check** → Run check → wait for confirmation → **Decrypt My Status** (COMPLIANT / NON-COMPLIANT)  
7. Optional **Audit Access** → grant auditor address for 48h (UI timer + on-chain allow)  
8. **Regulator** → `covertmrv:settle` → public boolean + ComplianceCertificate NFT  
9. **Certificate** tab → download `.txt` attestation  
10. Optional **Carbon Credits** → issue (after check), decrypt balance, retire  
11. Optional **Supply Chain** → separate SupplierAttest registration and footprint flows  

### 2. Supply chain tab

1. **Register** on `SupplierAttest` (separate from CapRegistry EMITTER)  
2. `submitFactor(sku, encrypted intensity)` for a reporting year  
3. `computeFootprint` / `classifyBand` / `checkThreshold` with comma-separated supplier addresses  
4. Results stored as encrypted handles; decrypt via hooks when permitted  

### 3. Enterprise API

`POST /api/submit` with HMAC body auth — server wallet encrypts and batches `submitEmissions`. The server key must already be **EMITTER** on CapRegistry.

---

## Disclosure model & roles

### Roles (`DisclosureACL`)

| Role | Value | Capabilities |
|------|-------|----------------|
| NONE | 0 | Connect only; must `registerAsEmitter` |
| EMITTER | 1 | Submit, aggregate, request checks, grant audit to auditors |
| AUDITOR | 2 | Decrypt handles explicitly allowed (e.g. time-bounded total) |
| REGULATOR | 3 | Set caps, settlement, protocol policy |
| ADMIN | 4 | Owner; `grantRole`, full admin panel |

### Disclosure ladder (what each level can learn)

```
L0  Raw facility ciphertext     →  Emitter (FHE.allow to self via allowSender patterns)
L1  Company aggregate euint64   →  Emitter + auditor (TTL grant on total)
L2  Product band / footprint    →  Buyer paths via select + scoped allows
L3  Compliance ebool            →  Emitter decrypt; regulator on settlement
L4  Public settlement           →  Anyone (boolean + certificate metadata only)
```

Auditors never receive blanket decrypt rights—they get **specific handles** for **specific durations**.

---

## Deployed contracts (Arbitrum Sepolia)

Chain ID: `421614` · Deployer: [`0x2301CD93feC8249219b4b661b4bc81889b494De6`](https://sepolia.arbiscan.io/address/0x2301CD93feC8249219b4b661b4bc81889b494De6)

### Core compliance

| Contract | Address |
|----------|---------|
| CapRegistry | [`0x10e76b22Cc21B606c6d6aD9B1C4b0192e8168147`](https://sepolia.arbiscan.io/address/0x10e76b22Cc21B606c6d6aD9B1C4b0192e8168147) |
| CapCheck | [`0xAB5B0f9249AaB16dCe45bc45e24Ece6d2B14d189`](https://sepolia.arbiscan.io/address/0xAB5B0f9249AaB16dCe45bc45e24Ece6d2B14d189) |
| ComplianceCertificate | [`0xfC00455c683AFCC57FF47cbF38C3480222e7f437`](https://sepolia.arbiscan.io/address/0xfC00455c683AFCC57FF47cbF38C3480222e7f437) |

### Supply chain (ScopeX)

| Contract | Address |
|----------|---------|
| SupplierAttest | [`0x7B514F53ACcC6757e6BeB361A75F9f0A31552612`](https://sepolia.arbiscan.io/address/0x7B514F53ACcC6757e6BeB361A75F9f0A31552612) |
| ProductFootprint | [`0x8042463634B04bd9B39A2854ba614B9A05452c67`](https://sepolia.arbiscan.io/address/0x8042463634B04bd9B39A2854ba614B9A05452c67) |

### Carbon credits

| Contract | Address |
|----------|---------|
| cCO2 (FHERC20) | [`0xa9bA06359DDf073a226652F10f13863Af824cAd1`](https://sepolia.arbiscan.io/address/0xa9bA06359DDf073a226652F10f13863Af824cAd1) |
| CreditIssuer | [`0x83E5d71D7661D024C1E06E0c3C71b1e84Ce86664`](https://sepolia.arbiscan.io/address/0x83E5d71D7661D024C1E06E0c3C71b1e84Ce86664) |
| CreditRetire | [`0x5f280cFc9055f2f22C4E3f9115Cd86fAa0544320`](https://sepolia.arbiscan.io/address/0x5f280cFc9055f2f22C4E3f9115Cd86fAa0544320) |

---

## Features

| Area | Capability |
|------|------------|
| Compliance | Register emitter, submit/batch emissions, aggregate, check, settle, NFT certificate |
| ISO 14064 | Encrypted scope (0=Scope1, 1=Scope2, 2=Scope3) per facility |
| Audit | Time-bounded `grantAuditAccessToTotal` with on-chain expiry |
| Supply chain | Submit supplier factors, compute footprint, classify band, threshold check |
| Credits | Conditional mint via `FHE.select`, encrypted balance, retirement receipts |
| API | `POST /api/submit` — HMAC auth, server-side FHE batch submit |
| UI | Compliance Journey card, regulatory awaiting panel, gated actions with tooltips, user-friendly errors, Overview registration, disclosure console |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Smart Contracts | Solidity 0.8.28, Fhenix FHE, viaIR, cancun |
| FHE | @cofhe/sdk 0.5.2, tfhe 1.5.3 WASM |
| Frontend | React 19, TanStack Router, Tailwind v4, wagmi v2 |
| API | Vercel Node.js function, HMAC-SHA256 |
| Network | Arbitrum Sepolia (421614) |
| Testing | Hardhat + @cofhe/hardhat-plugin — **72 tests** |
| UX | `compliance-journey.ts`, `ComplianceJourneyCard`, `GatedAction`, `translateUserError` |

---

## Quick start

```bash
git clone https://github.com/0xelan/CovertMRV-
cd CovertMRV-
npm install
cd frontend && npm install

# Run tests
npx hardhat test

# Deploy full stack (8 contracts)
npx hardhat deploy:full --network arb-sepolia

# Verify wiring on-chain
npx hardhat verify:deployment --network arb-sepolia

# Regulator: cap + settlement (see Compliance journey above)
npx hardhat covertmrv:set-cap --network arb-sepolia --company <EMITTER> --cap <TONNES> --year 2026
npx hardhat covertmrv:settle --network arb-sepolia --company <EMITTER> --year 2026

# Dev server
cd frontend && npm run dev
```

### Frontend environment

Copy [`frontend/.env.example`](frontend/.env.example) to `frontend/.env.local` and set all `VITE_*` contract addresses (defaults also ship in `frontend/src/config/contracts.ts` from the deploy task).

If FHE WASM fails in dev after config changes, delete `frontend/node_modules/.vite` and restart.

### Enterprise API

```bash
curl https://covert-mrv.vercel.app/api/submit \
  -H "Authorization: Bearer <HMAC-SHA256(API_SECRET, body)>" \
  -H "Content-Type: application/json" \
  -d '{
    "facilityIds": [1, 2],
    "emissionsTonnes": [12500, 8300],
    "reportingYear": 2025,
    "scopes": [0, 0]
  }'
```

The `SUBMIT_PRIVATE_KEY` wallet must be registered as **EMITTER** on CapRegistry.

---

## Testing

```bash
npx hardhat test
# 72 passing — CapRegistry, CapCheck, CapRegistryPrivacy, DisclosureACL,
# SupplierAttest, ProductFootprint, cCO2, CreditIssuer, CreditRetire
```

---

## Vercel / production environment

Set these in the Vercel project dashboard (Production + Preview):

| Variable | Value |
|----------|-------|
| `VITE_CAP_REGISTRY_ADDRESS` | `0x10e76b22Cc21B606c6d6aD9B1C4b0192e8168147` (or omit — baked in `contracts.ts`) |
| `VITE_CAP_CHECK_ADDRESS` | `0xAB5B0f9249AaB16dCe45bc45e24Ece6d2B14d189` |
| `VITE_COMPLIANCE_CERTIFICATE_ADDRESS` | `0xfC00455c683AFCC57FF47cbF38C3480222e7f437` |
| `VITE_SUPPLIER_ATTEST_ADDRESS` | `0x7B514F53ACcC6757e6BeB361A75F9f0A31552612` |
| `VITE_PRODUCT_FOOTPRINT_ADDRESS` | `0x8042463634B04bd9B39A2854ba614B9A05452c67` |
| `VITE_CCO2_ADDRESS` | `0xa9bA06359DDf073a226652F10f13863Af824cAd1` |
| `VITE_CREDIT_ISSUER_ADDRESS` | `0x83E5d71D7661D024C1E06E0c3C71b1e84Ce86664` |
| `VITE_CREDIT_RETIRE_ADDRESS` | `0x5f280cFc9055f2f22C4E3f9115Cd86fAa0544320` |
| `CAP_REGISTRY_ADDRESS` | `0x10e76b22Cc21B606c6d6aD9B1C4b0192e8168147` |
| `ARBITRUM_SEPOLIA_RPC_URL` | `https://sepolia-rollup.arbitrum.io/rpc` |
| `API_SECRET` | *(your existing secret — do not rotate unless needed)* |
| `SUBMIT_PRIVATE_KEY` | *(your server wallet private key — must be EMITTER)* |

After updating env vars, trigger a **Redeploy** in Vercel so the frontend build picks up the new `VITE_*` addresses.

---

## License

MIT · Built on [Fhenix CoFHE](https://cofhe-docs.fhenix.zone/)
