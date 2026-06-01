# Production Blockers — Final Audit (2026-06-03)

**Scope:** CovertMRV on Arbitrum Sepolia (421614), production URL https://covert-mrv.vercel.app  
**Reference:** [Fhenix CoFHE docs](https://cofhe-docs.fhenix.zone/)  
**Mission wallet:** `0xf76e6B0920e9332fF4410f6dD53F01722AbC71a3`

---

## Executive summary

| Area | Status |
|------|--------|
| Deployed contracts + wiring | **PASS** (all cross-links verified on-chain) |
| CoFHE encrypt/decrypt implementation | **PASS** (code + mock tests; real decrypt requires cap + check first) |
| Vercel contract addresses | **PASS** (fallback addresses match `deployments.json`) |
| Hardhat test suite (67 tests) | **PASS** (uses CoFHE mocks — not a substitute for mainnet FHE TN) |
| New-user wallet `0xf76e6…71a3` | **BLOCKED** — admin `setCap` not run for this address |
| Double wallet popup on submit | **FIXED** — removed silent auto-`aggregateTotal` |

---

## Phase 2 — Double transaction bug (FIXED)

### Symptom

After **Encrypt & Submit**, MetaMask showed two contract interactions back-to-back. Tx #1 succeeded; tx #2 failed (insufficient gas / no time to review).

### Root cause

`frontend/src/routes/dashboard.tsx` — `SubmitEmissions` component:

```tsx
useEffect(() => {
  if (!tx.isSuccess) return;
  // ...
  ctx.aggregateTotal(ctx.address).then((h) => setAggHash(h));
}, [tx.isSuccess, ...]);
```

Submit success **automatically** called `aggregateTotal()` without user consent. That is a second on-chain write and a second wallet prompt.

### Fix applied

- Removed automatic `aggregateTotal` from `useEffect`.
- After submit confirms, show an amber banner: **“Next step (separate transaction): click Aggregate Total”**.
- Added `submitInFlight` / `aggregateInFlight` guards against double-click races.

### Guarantee

| User action | Transactions |
|-------------|----------------|
| Encrypt & Submit | **1** (`submitEmissions`) |
| Aggregate Total (button) | **1** (`aggregateTotal`) |
| Run Compliance Check | **1** (`checkCompliance`) |
| Decrypt My Status | **0 on-chain** (Fhenix `sealoutput` + permit signature) |

No hidden follow-up transactions.

---

## Phase 1 & 6 — New user flow (`0xf76e6…71a3`)

On-chain audit via `npm run audit:arb -- --company 0xf76e6B0920e9332fF4410f6dD53F01722AbC71a3`:

| Step | Status | Evidence |
|------|--------|----------|
| 1. Connect wallet | Manual (UI) | — |
| 2. Register emitter | **DONE** | `role: 1 (EMITTER)` |
| 3. Submit emissions | **DONE** | `facilityCount: 1` |
| 4. Aggregate total | **DONE** | `companyTotal handle: 0x9cd5f07b…` (non-zero) |
| 5. Admin setCap | **NOT DONE** | `regulatoryCap handle: ZERO` |
| 6. grantCheckAccess | **NOT DONE** | (follows setCap; CapCheck needs cap + total) |
| 7. Run compliance check | **NOT DONE** | `compliance.exists: false` |
| 8. Decrypt result | **BLOCKED** | No handle → decrypt correctly disabled |
| 9–13. Certificate / audit / supply chain / credits | **NOT REACHED** | Depend on compliance + roles |

### Why decrypt is disabled on Vercel (screenshot)

Blue banner **“Admin action needed: No encrypted cap…”** is correct.  
Footer **“handle: none — run check with this wallet”** is correct — no `checkCompliance` yet.

This is **not** a broken decrypt path; it is **incomplete onboarding**.

### Unblock judge wallet (operator runbook)

Deployer/owner wallet must run (from repo root, `.env` with `ARB_SEPOLIA_RPC` + owner key):

```bash
npm run set-cap:arb -- --company 0xf76e6B0920e9332fF4410f6dD53F01722AbC71a3 --cap 50000
```

Or use **Overview → Admin** (owner-connected):

1. Company: `0xf76e6B0920e9332fF4410f6dD53F01722AbC71a3`
2. **Encrypt & Set Cap**
3. **Grant CapCheck access** (after aggregate exists — already done for this wallet)

Then emitter on Vercel:

4. **Compliance Check → Run Compliance Check** (same wallet `0xf76e6…`)
5. Wait ~3s ACL sync → **Decrypt My Status** → sign Fhenix permit once

---

## Phase 3 — FHE / CoFHE validation

### Client (`frontend/src/lib/fhe.ts`)

| Check | Result | Proof |
|-------|--------|-------|
| Encryption before submit | **PASS** | `encryptInputs` → `InEuint64` / `InEuint8` passed to contracts |
| `decryptForView` + `withPermit` | **PASS** | Used for UI bool/u64; matches [decrypt-to-view guide](https://cofhe-docs.fhenix.zone/client-sdk/guides/decrypt-to-view.md) |
| No decrypt on zero handle | **PASS** | `assertDecryptableHandle` in `decryptBool` / `decryptUint64` |
| No UI `decryptForTx` fallback | **PASS** | Removed (was causing extra `/v2/decrypt` 403s) |
| Wallet account binding | **PASS** | `bindWalletAccount` for permit ACL |
| Plaintext emissions on-chain | **PASS** | Contracts store `euint64` / `ebool` handles only |

### Contracts (selected ACL)

| Contract | Pattern | Purpose |
|----------|---------|---------|
| `CapRegistry.submitEmissions` | `FHE.allowThis` + `FHE.allow(sender)` | Emitter decrypts own facility data |
| `CapRegistry.aggregateTotal` | `FHE.allow(total, company)` | Company sees aggregate |
| `CapRegistry.setCap` | `FHE.allowThis(cap)` | Cap encrypted at rest |
| `CapRegistry.grantCheckAccess` | `FHE.allow(total,cap → checker)` | CapCheck can compare |
| `CapCheck.checkCompliance` | `FHE.allow(result, owner)` + `FHE.allow(result, company)` | Emitter decrypts bool |
| `SupplierAttest` | `FHE.allowTransient` for footprint | Same-tx only |

### What still requires live Fhenix TN

Mock tests prove Solidity + SDK integration. **Threshold network** (`testnet-cofhe-tn.fhenix.zone`) must accept permit + sealoutput for each wallet after ACL grants. Failures there are usually: wrong wallet, zero handle, or ACL not yet propagated (3–6s retry built in).

---

## Phase 4 — Contract validation

**Network:** `arb-sepolia` — `deployments.json` (2026-06-02)

| Contract | Address | Deploy | Wiring | Frontend ABI |
|----------|---------|--------|--------|--------------|
| CapRegistry | `0xbc3dc391…dD41` | **PASS** | — | **PASS** |
| CapCheck | `0x2d692212…846B` | **PASS** | cert ↔ check ↔ issuer | **PASS** |
| ComplianceCertificate | `0xe7A84b47…b66e` | **PASS** | `capCheck` set | **PASS** |
| SupplierAttest | `0xBF5246DE…980D` | **PASS** | — | **PASS** |
| ProductFootprint | `0x7B15F60d…9152` | **PASS** | `supplierAttest` | **PASS** |
| cCO2 | `0x794ebf1C…5670` | **PASS** | issuer/retire | **PASS** |
| CreditIssuer | `0xcb2a38D5…3Efb` | **PASS** | `capCheck` | **PASS** |
| CreditRetire | `0x22930E04…9Aab` | **PASS** | `cco2` | **PASS** |

**Wiring audit (on-chain):** all four links **PASS** (`covertmrv:audit`).

No redeploy required for the double-tx fix (frontend-only).

---

## Phase 5 — Vercel validation

| Check | Result |
|-------|--------|
| `viteAddress()` empty-env fallback | **PASS** — uses `deployments.json` addresses |
| README env table vs baked defaults | **PASS** — aligned |
| Live site loads | **PASS** — https://covert-mrv.vercel.app |
| Env vars must not be `""` | **DOC** — empty strings break reads; omit or set full `0x` address |

After this commit: **redeploy Vercel** to pick up auto-aggregate removal.

---

## Phase 7 — Remaining blockers

### P0 — Operational (not code)

| ID | Blocker | Owner | Action |
|----|---------|-------|--------|
| B1 | No cap for `0xf76e6…71a3` | Regulator | `setCap` + `grantCheckAccess` |
| B2 | Judge/demo script | Team | Document admin steps before emitter demo |

### P1 — Fixed in this branch (deploy required)

| ID | Issue | Fix |
|----|-------|-----|
| F1 | Auto second tx after submit | Removed auto-aggregate; explicit banner |
| F2 | Zero handle sent to Fhenix | `ct-handle.ts` + decrypt guards |
| F3 | Empty `VITE_*` on Vercel | `viteAddress()` fallback |

### P2 — Enhancements (non-blocking)

| ID | Item |
|----|------|
| E1 | Admin panel: “Paste connected address” shortcut for setCap target |
| E2 | Full live E2E script with funded deployer + emitter keys in CI |
| E3 | 67 Hardhat tests use mocks — add tagged `@fhenix-live` optional suite |

---

## User-impact assessment

| Persona | Impact |
|---------|--------|
| New emitter on Vercel | Cannot decrypt until regulator sets cap — **expected**; UI explains clearly |
| Emitter after submit (pre-fix) | Surprise second wallet popup, possible gas failure — **fixed** after deploy |
| Regulator / judge | Must use Admin or `npm run set-cap:arb` per company address |

---

## Verification commands

```bash
# On-chain user + wiring audit
npm run audit:arb -- --company 0xf76e6B0920e9332fF4410f6dD53F01722AbC71a3

# Contract tests (mock CoFHE)
npm test

# Set cap for judge wallet (owner key in .env)
npm run set-cap:arb -- --company 0xf76e6B0920e9332fF4410f6dD53F01722AbC71a3 --cap 50000
```

---

## Files changed in this audit

- `frontend/src/routes/dashboard.tsx` — remove auto-aggregate; submit/aggregate guards; UX banner
- `tasks/audit-production.ts` — on-chain production audit task
- `package.json` — `audit:arb` script
- `PRODUCTION_BLOCKERS.md` — this document

Prior commit `955d6f6` already hardened decrypt + Vercel env fallbacks.
