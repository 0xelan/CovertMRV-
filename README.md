# CovertMRV

> **Encrypted carbon compliance.** Prove you meet your emissions cap without revealing what your emissions are.

[![Network](https://img.shields.io/badge/network-Arbitrum%20Sepolia-8b5cf6?style=flat-square)](https://sepolia.arbiscan.io/)
[![Solidity](https://img.shields.io/badge/solidity-0.8.28-363636?style=flat-square&logo=solidity)](https://soliditylang.org/)
[![SDK](https://img.shields.io/badge/%40cofhe%2Fsdk-0.5.2-10b981?style=flat-square)](https://www.npmjs.com/package/@cofhe/sdk)
[![Contracts](https://img.shields.io/badge/contracts-8%20live-10b981?style=flat-square)](#deployed-contracts-arbitrum-sepolia)
[![Tests](https://img.shields.io/badge/tests-67%20passing-10b981?style=flat-square)](#testing)
[![Live](https://img.shields.io/badge/live-covert--mrv.vercel.app-10b981?style=flat-square)](https://covert-mrv.vercel.app)

---

## What is CovertMRV?

CovertMRV is an FHE-powered Measurement, Reporting, and Verification (MRV) protocol for climate compliance and carbon markets. Facility-level emissions, regulatory caps, and compliance aggregates stay encrypted during storage, computation, and comparison.

Companies submit encrypted emissions with `@cofhe/sdk`. Contracts aggregate via `FHE.add()`, compare with `FHE.lte(total, cap)`, and expose only an encrypted boolean until settlement. The regulator sees pass/fail — not the underlying tonnes.

---

## Deployed Contracts (Arbitrum Sepolia)

Chain ID: `421614` · Deployer: [`0x2301CD93feC8249219b4b661b4bc81889b494De6`](https://sepolia.arbiscan.io/address/0x2301CD93feC8249219b4b661b4bc81889b494De6)

### Core compliance

| Contract | Address |
|----------|---------|
| CapRegistry | [`0xbc3dc391AfbE94BF55cedDF5Aa05dA8e5e73dD41`](https://sepolia.arbiscan.io/address/0xbc3dc391AfbE94BF55cedDF5Aa05dA8e5e73dD41) |
| CapCheck | [`0x2d692212B3bA5c46a1e97d320eA198EaB65C846B`](https://sepolia.arbiscan.io/address/0x2d692212B3bA5c46a1e97d320eA198EaB65C846B) |
| ComplianceCertificate | [`0xe7A84b47fF5DE41F0C112256b659B14A33fab66e`](https://sepolia.arbiscan.io/address/0xe7A84b47fF5DE41F0C112256b659B14A33fab66e) |

### Supply chain (ScopeX)

| Contract | Address |
|----------|---------|
| SupplierAttest | [`0xBF5246DECC3C18F8c9A1B310DDF6CeeA0104980D`](https://sepolia.arbiscan.io/address/0xBF5246DECC3C18F8c9A1B310DDF6CeeA0104980D) |
| ProductFootprint | [`0x7B15F60d8252038281818e138426c834428f9152`](https://sepolia.arbiscan.io/address/0x7B15F60d8252038281818e138426c834428f9152) |

### Carbon credits

| Contract | Address |
|----------|---------|
| cCO2 (FHERC20) | [`0x794ebf1C753FA7DA424624B338cFE07697195670`](https://sepolia.arbiscan.io/address/0x794ebf1C753FA7DA424624B338cFE07697195670) |
| CreditIssuer | [`0xcb2a38D5Ac1c06345450b1564558da468e703Efb`](https://sepolia.arbiscan.io/address/0xcb2a38D5Ac1c06345450b1564558da468e703Efb) |
| CreditRetire | [`0x22930E042B2BE81eC4fcfe9C4e927533D44c9Aab`](https://sepolia.arbiscan.io/address/0x22930E042B2BE81eC4fcfe9C4e927533D44c9Aab) |

---

## Architecture

```
  Browser / Enterprise API (@cofhe/sdk 0.5.2 + wagmi v2)
  encryptInputs([uint64 emissions, uint8 scope]) → InEuint64 + InEuint8
                          │
                          ▼
  CapRegistry ──▶ CapCheck ──▶ ComplianceCertificate (ERC-721)
       │              │
       │              └──▶ CreditIssuer ──▶ cCO2
       │
  SupplierAttest ──▶ ProductFootprint (FHE.allowTransient + FHE.add)
                          │
                     CreditRetire ──▶ burn cCO2 + encrypted receipt
```

**Privacy highlights**

- Scope stored as encrypted `euint8`, not plaintext enum
- Regulatory cap never decryptable — used only in `FHE.lte`
- Supplier factors isolated via `FHE.allowTransient` in footprint rollups
- Settlement reveals boolean + NFT metadata only

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

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Smart Contracts | Solidity 0.8.28, Fhenix FHE, viaIR, cancun |
| FHE | @cofhe/sdk 0.5.2, tfhe 1.5.3 WASM |
| Frontend | React 19, TanStack Router, Tailwind v4, wagmi v2 |
| API | Vercel Node.js function, HMAC-SHA256 |
| Network | Arbitrum Sepolia (421614) |
| Testing | Hardhat + @cofhe/hardhat-plugin — **67 tests** |

---

## Quick Start

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

# Dev server
cd frontend && npm run dev
```

### Frontend environment

Copy [`frontend/.env.example`](frontend/.env.example) to `frontend/.env.local` and set all `VITE_*` contract addresses (defaults also ship in `frontend/src/config/contracts.ts` from the deploy task).

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
# 67 passing — CapRegistry, CapCheck, CapRegistryPrivacy, DisclosureACL,
# SupplierAttest, ProductFootprint, cCO2, CreditIssuer, CreditRetire
```

---

## Vercel / production environment

Set these in the Vercel project dashboard (Production + Preview):

| Variable | Value |
|----------|-------|
| `VITE_CAP_REGISTRY_ADDRESS` | `0xbc3dc391AfbE94BF55cedDF5Aa05dA8e5e73dD41` |
| `VITE_CAP_CHECK_ADDRESS` | `0x2d692212B3bA5c46a1e97d320eA198EaB65C846B` |
| `VITE_COMPLIANCE_CERTIFICATE_ADDRESS` | `0xe7A84b47fF5DE41F0C112256b659B14A33fab66e` |
| `VITE_SUPPLIER_ATTEST_ADDRESS` | `0xBF5246DECC3C18F8c9A1B310DDF6CeeA0104980D` |
| `VITE_PRODUCT_FOOTPRINT_ADDRESS` | `0x7B15F60d8252038281818e138426c834428f9152` |
| `VITE_CCO2_ADDRESS` | `0x794ebf1C753FA7DA424624B338cFE07697195670` |
| `VITE_CREDIT_ISSUER_ADDRESS` | `0xcb2a38D5Ac1c06345450b1564558da468e703Efb` |
| `VITE_CREDIT_RETIRE_ADDRESS` | `0x22930E042B2BE81eC4fcfe9C4e927533D44c9Aab` |
| `CAP_REGISTRY_ADDRESS` | `0xbc3dc391AfbE94BF55cedDF5Aa05dA8e5e73dD41` |
| `ARBITRUM_SEPOLIA_RPC_URL` | `https://sepolia-rollup.arbitrum.io/rpc` |
| `API_SECRET` | *(your existing secret — do not rotate unless needed)* |
| `SUBMIT_PRIVATE_KEY` | *(your server wallet private key — must be EMITTER)* |

After updating env vars, trigger a **Redeploy** in Vercel so the frontend build picks up the new `VITE_*` addresses.

---

## License

MIT · Built on [Fhenix CoFHE](https://cofhe-docs.fhenix.zone/)
