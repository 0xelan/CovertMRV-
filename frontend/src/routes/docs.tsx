import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Cpu,
  KeySquare,
  Lock,
  ServerCog,
  ShieldCheck,
  Award,
  Layers,
  Zap,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/docs")({
  component: Docs,
});

const SECTIONS = [
  { id: "overview", label: "Protocol Overview" },
  { id: "wave4", label: "Wave 4 Changelog" },
  { id: "wave3", label: "Wave 3 Changelog" },
  { id: "architecture", label: "Architecture" },
  { id: "deployments", label: "Deployments" },
  { id: "fhe", label: "How FHE Works" },
  { id: "contracts", label: "Smart Contracts" },
  { id: "sdk", label: "SDK Integration" },
  { id: "api", label: "Enterprise API" },
  { id: "disclosure", label: "Disclosure Model" },
  { id: "faq", label: "FAQ" },
];

function Docs() {
  return (
    <div className="bg-background text-foreground">
      <Nav />
      {/* Header */}
      <section className="relative overflow-hidden border-b border-foreground/10 bg-surface pb-24 pt-40">
        <div className="absolute inset-0 grid-faint opacity-50" />
        <div className="relative mx-auto max-w-[1480px] px-6 md:px-10">
          <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/45">
            <span className="text-emerald">DOCS</span>
            <span className="h-px w-12 bg-foreground/20" />
          <span>v0.4.0 · Wave 4 · Arbitrum Sepolia</span>
          </div>
          <h1 className="font-display mt-6 max-w-3xl text-4xl font-normal leading-[1.05] tracking-tight md:text-6xl">
            Protocol
            <br />
            <span className="text-emerald">Architecture.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-foreground/65">
            CovertMRV is an encrypted Measurement, Reporting & Verification
            protocol for climate compliance, built on Fhenix CoFHE. This
            document describes the contracts, the cryptographic primitives, and
            the disclosure model.
          </p>            <p className="mt-2 font-mono text-[12px] text-emerald/70">
              Wave 3 — SDK 0.5.2 · ComplianceCertificate NFT · Batch Submit · Reporting Year · Enterprise API · ISO 14064 Scope 1/2/3
            </p>        </div>
      </section>

      <div className="mx-auto grid max-w-[1480px] gap-12 px-6 py-16 md:px-10 lg:grid-cols-[240px_1fr]">
        {/* TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-1">
            <p className="px-2 pb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
              On this page
            </p>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block rounded-md px-3 py-1.5 text-[13px] text-foreground/65 transition hover:bg-foreground/[0.04] hover:text-emerald"
              >
                {s.label}
              </a>
            ))}
          </div>
        </aside>

        <article className="max-w-3xl space-y-20">
          <Block id="overview" title="Protocol Overview">
            <p>
              CovertMRV solves a structural conflict at the heart of climate
              regulation: regulators demand transparency, but facility-level
              emissions data is also competitively sensitive trade secret.
              Companies are forced to choose between honest reporting and
              competitive survival. CovertMRV makes the choice unnecessary.
            </p>
            <p>
              Companies submit encrypted facility-level emissions to the
              protocol using Fhenix CoFHE. The chain aggregates them under FHE,
              compares the total to an encrypted regulatory cap, and emits an
              encrypted boolean result. The regulator decrypts only the
              boolean. The number, the cap, and every intermediate computation
              remain ciphertext for the lifetime of the contract.
            </p>
            <p>
              Wave 4 adds <strong>5 new contracts</strong>: SupplierAttest (encrypted Scope 3 supplier factors), ProductFootprint (multi-supplier FHE rollup + band classification), cCO2 (FHERC20 carbon credit token), CreditIssuer (FHE.select conditional minting), and CreditRetire (encrypted retirement receipts with selective audit disclosure). Total: <strong>8 contracts, 56 tests</strong>.
            </p>
          </Block>

          <Block id="wave4" title="Wave 4 Changelog">
            <p className="mb-4 text-foreground/60">All changes shipped in Wave 4 (Q4 2026). 5 new contracts, 25 new tests, full supply chain + carbon credit pipeline.</p>
            <div className="space-y-3">
              {[
                {
                  icon: Layers,
                  label: "SupplierAttest.sol — Encrypted Scope 3 Intensity Factors",
                  detail: "Suppliers register euint64 emission intensity factors per product SKU. submitFactor(sku, InEuint64, year). getFactor() uses FHE.allowTransient for same-TX cross-contract reads. grantFactorDecrypt for persistent auditor access.",
                },
                {
                  icon: Cpu,
                  label: "ProductFootprint.sol — Multi-Supplier FHE Rollup",
                  detail: "Aggregates supplier factors via FHE.add across up to N suppliers. Classifies footprint into encrypted bands A (≤100), B (101-500), C (>500) using FHE.select. Double-blind threshold check via FHE.lte.",
                },
                {
                  icon: KeySquare,
                  label: "cCO2.sol — FHERC20 Encrypted Carbon Credit Token",
                  detail: "FHERC20 token with encrypted balances. Minted by CreditIssuer, burned by CreditRetire. Inherits full FHERC20 encrypted transfer mechanics. All on-chain balances remain ciphertext.",
                },
                {
                  icon: ShieldCheck,
                  label: "CreditIssuer.sol — FHE.select Conditional Minting",
                  detail: "Reads compliance ebool from CapCheck and mints cCO2 via FHE.select(compliant, issuanceRate, 0). Both compliant and non-compliant paths execute identically — observers cannot distinguish outcomes from gas or calldata.",
                },
                {
                  icon: Lock,
                  label: "CreditRetire.sol — Encrypted Retirement Receipts",
                  detail: "Burns cCO2 via burnFrom and stores encrypted receipts keyed by retirement ID. Selective audit disclosure: grantRetirementAudit grants time-bounded FHE.allow to specific auditors per retirement ID.",
                },
                {
                  icon: ServerCog,
                  label: "CapRegistry + DisclosureACL — Wave 4 Privacy Fixes",
                  detail: "Scope now encrypted as InEuint8 in submitEmissions. companyFacilities and hasSubmitted mappings made private. getFacilityCount restricted to owner or company only. _rotateHandle added to DisclosureACL for handle hygiene.",
                },
                {
                  icon: Zap,
                  label: "25 New Tests — 56 Total",
                  detail: "CapRegistryPrivacy (6), SupplierAttest (6), ProductFootprint (8), cCO2 (5), CreditIssuer (4), CreditRetire (5). All prior 31 tests updated for new submitEmissions encrypted-scope signature.",
                },
              ].map(({ icon: Icon, label, detail }) => (
                <div key={label} className="rounded-xl border border-foreground/10 bg-surface p-5">
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-4 w-4 flex-none text-emerald" strokeWidth={1.6} />
                    <div>
                      <p className="font-semibold text-[14px]">{label}</p>
                      <p className="mt-1 text-[13px] text-foreground/60 leading-relaxed">{detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Block>

          <Block id="wave3" title="Wave 3 Changelog">
            <p className="mb-4 text-foreground/60">All changes shipped in Wave 3 (May 2026). Contracts re-deployed at new addresses after ISO scope addition.</p>
            <div className="space-y-3">
              {[
                {
                  icon: Zap,
                  label: "SDK upgrade: @cofhe/sdk 0.4.x → 0.5.2",
                  detail: "tfhe WASM 0.11.1 → 1.5.3. getOrCreateSelfPermit() now takes no args. set404RetryTimeout(15_000) added to all decryptForView chains. WagmiAdapter added in ./adapters export.",
                },
                {
                  icon: Layers,
                  label: "CapRegistry: ISO 14064 Scope enum + batch submissions + reporting year",
                  detail: "enum Scope { SCOPE1, SCOPE2, SCOPE3 } — GHG Protocol ISO 14064 classification stored per facility. submitEmissions(facilityId, encEmissions, reportingYear, scope). batchSubmitEmissions(ids[], encs[], year, scope) — up to 50 facilities/tx. getFacilityScope(addr, id) view. unchecked loops, cached msg.sender/block.timestamp for gas.",
                },
                {
                  icon: Award,
                  label: "ComplianceCertificate.sol — ERC-721 NFT",
                  detail: "Minted by CapCheck on settleCompliance. Token ID = keccak256(company, reportingYear) — deterministic and idempotent. Self-contained, no external imports. Certificate struct: {company, reportingYear, compliant, issuedAt}.",
                },
                {
                  icon: ShieldCheck,
                  label: "CapCheck: certificate wiring + reportingYear",
                  detail: "checkCompliance now accepts (company, reportingYear). settleCompliance calls certificate.mintCertificate if wired. ComplianceSettled event now emits tokenId.",
                },
                {
                  icon: ServerCog,
                  label: "31 Hardhat tests — all passing",
                  detail: "CapRegistry suite (23), CapCheck suite (8). Covers batch submissions, ISO scope storage, length mismatch revert, certificate mint, double-settle revert, ComplianceSettled event log parsing.",
                },
                {
                  icon: Cpu,
                  label: "Dashboard UX — ISO scope selector + batch panel + 3-contract overview",
                  detail: "Interactive 3-card ISO scope selector (Scope 1/2/3 with descriptions). Collapsible batch submit panel with dynamic rows, gas estimate, Arbiscan link. 4-column stats including certificate balance. All 3 contracts shown in Overview. AuditTimer countdown. Certificate tab.",
                },
                {
                  icon: Lock,
                  label: "Enterprise API — POST /api/submit",
                  detail: "Vercel Edge Function. HMAC-SHA256 Bearer auth. Encrypts facility array server-side, calls batchSubmitEmissions. Max 50 facilities/batch. Gas scales: 1.2M + N×200k.",
                },
              ].map(({ icon: Icon, label, detail }) => (
                <div key={label} className="rounded-xl border border-foreground/10 bg-surface p-5">
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-4 w-4 flex-none text-emerald" strokeWidth={1.6} />
                    <div>
                      <p className="font-semibold text-[14px]">{label}</p>
                      <p className="mt-1 text-[13px] text-foreground/60 leading-relaxed">{detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Block>

          <Block id="deployments" title="Live Deployments">
            <p className="mb-6">
              Both contracts are deployed on Arbitrum Sepolia (chain ID 421614) and verified. All FHE
              operations route through the Fhenix CoFHE coprocessor.
            </p>
            <div className="space-y-3">
              {[
                {
                  name: "CapRegistry.sol",
                  address: "0x495e718979D882024CAea4613D7b05F9865bC652",
                  role: "Encrypted emissions storage + batch submit + cap management",
                },
                {
                  name: "CapCheck.sol",
                  address: "0xbeA50F98e24F03D6A901897C2B520636d19B9043",
                  role: "Compliance verification + certificate wiring + audit access control",
                },
                {
                  name: "ComplianceCertificate.sol",
                  address: "0xC327A527B81402495f343277E37AE19b4112749d",
                  role: "ERC-721 compliance certificate NFT — minted on settlement",
                },
              ].map((c) => (
                <div
                  key={c.name}
                  className="rounded-xl border border-foreground/10 bg-surface p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-display text-lg tracking-tight">{c.name}</span>
                    <a
                      href={`https://sepolia.arbiscan.io/address/${c.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-background px-3 py-1 font-mono text-[11px] text-emerald transition hover:border-emerald/50"
                    >
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" />
                      Arbiscan
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                  <p className="mt-1 font-mono text-[11.5px] text-foreground/50">{c.address}</p>
                  <p className="mt-2 text-[13px] text-foreground/65">{c.role}</p>
                </div>
              ))}
            </div>
          </Block>

          <Block id="architecture" title="Architecture">
            <p className="mb-6">
              Three contracts coordinate. Five roles consume their outputs.
            </p>
            <pre className="overflow-x-auto rounded-xl border border-foreground/10 bg-surface p-6 font-mono text-[12.5px] leading-relaxed text-foreground/80">
{`┌─────────────────────────────────────────────────────────────────┐
│              CovertMRV Protocol v0.3  ·  Wave 3                 │
└─────────────────────────────────────────────────────────────────┘

   client (browser / enterprise API)
   ──────────────────────────────────
   @cofhe/sdk 0.5.2  ──encrypt──▶  euint64 ciphertext
                                         │
                                         ▼
   ┌──────────────────────────────────────────────────────────────┐
   │  CapRegistry.sol  [0x4460Be641B40484bBD25231f594158531e84e108]│
   │    • submitEmissions(id, eEmit, year, scope)                 │
   │    • batchSubmitEmissions(ids[], eEmits[], year, scope)      │
   │    • aggregateTotal()  →  FHE.add() across handles           │
   │    • setCap(eCap)       // encrypted regulatory cap          │
   │    • enum Scope { SCOPE1, SCOPE2, SCOPE3 }  // ISO 14064     │
   │    • getFacilityScope(company, id) → Scope                  │
   └──────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
   ┌──────────────────────────────────────────────────────────────┐
   │  CapCheck.sol     [0x7E2cc776495bb4565C28F60E3a708a44314a2965]│
   │    • checkCompliance(company, year) → ebool = FHE.lte(t,c)  │
   │    • settleCompliance(company, bool, sig)                    │
   │      └─▶ ComplianceCertificate.mintCertificate()            │
   └──────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
   ┌──────────────────────────────────────────────────────────────┐
   │  ComplianceCertificate.sol [0xF91b8DDf2a4110A897204206714E5B90CAd2C8D5]│
   │    • ERC-721. tokenId = keccak256(company, year)             │
   │    • certificates[id] = {company, year, compliant, ts}      │
   └──────────────────────────────────────────────────────────────┘
                                         │
   DisclosureACL (base)                  │
     • grantAuditAccessToTotal(auditor, ttl)  FHE.allow()
     • revokeAuditAccess(auditor)
     • auditGrants[company][auditor] → (expiry, active)`}
            </pre>
          </Block>

          <Block id="fhe" title="How FHE Works">
            <p>
              Fully Homomorphic Encryption lets a computer perform arithmetic
              on sealed ciphertext without ever decrypting it. Hand the
              protocol a sealed envelope containing 12,500 tonnes. Hand it
              another sealed envelope containing the regulatory cap. It returns
              a sealed envelope containing <em>true</em> (compliant) or
              <em>false</em> (exceeded) — without opening either input.
            </p>
            <p>
              CovertMRV uses this to aggregate facility emissions, compare the
              total against an encrypted cap, and emit a sealed boolean result.
              The contract holds compute permission via <code className="rounded border border-foreground/10 bg-surface px-1.5 py-0.5 font-mono text-[12px] text-emerald">FHE.allowThis()</code> but
              never decrypt permission. Decryption is a separate signed
              operation scoped per role, per handle, per duration.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Mini
                icon={Cpu}
                title="11 FHE operations"
                body="encrypt, add, sub, lte, gte, select, allow, allowThis, allowSender, sealoutput, isInitialized."
              />
              <Mini
                icon={Lock}
                title="Zero hardware trust"
                body="No enclaves. No side channels. No attestation chains. Pure lattice-based cryptography on the Fhenix threshold network."
              />
            </div>
          </Block>

          <Block id="contracts" title="Smart Contract Reference">
            <p className="mb-6">
              Two contracts deployed on Arbitrum Sepolia (chain ID 421614). Solidity 0.8.28, viaIR, cancun EVM.
            </p>
            <div className="space-y-4">
              <ContractCard
                icon={ServerCog}
                name="CapRegistry.sol"
                address="0x4460Be641B40484bBD25231f594158531e84e108"
                fns={[
                  ["registerAsEmitter", "() → role granted"],
                  ["submitEmissions", "(facilityId: uint256, e: InEuint64, year: uint256, scope: Scope) → void"],
                  ["batchSubmitEmissions", "(ids: uint256[], es: InEuint64[], year: uint256, scope: Scope) → void"],
                  ["aggregateTotal", "(company: address) → void  // FHE.add()"],
                  ["setCap", "(company: address, e: InEuint64) → void  // admin"],
                  ["getFacilityScope", "(company: address, facilityId: uint256) → Scope"],
                  ["getMyEmissions", "(facilityId: uint256) → euint64  // msg.sender"],
                  ["getFacilityIds", "(company: address) → uint256[]"],
                ]}
              />
              <ContractCard
                icon={ShieldCheck}
                name="CapCheck.sol"
                address="0x7E2cc776495bb4565C28F60E3a708a44314a2965"
                fns={[
                  ["checkCompliance", "(company: address, year: uint256) → void  // FHE.lte(total, cap)"],
                  ["settleCompliance", "(company: address, val: bool, sig: bytes) → void  // mints NFT"],
                  ["setCertificate", "(cert: address) → void  // owner only, one-time"],
                  ["isSettled", "(company: address) → (bool settled, bool result)"],
                  ["lastCheckedAt", "(company: address) → uint256"],
                ]}
              />
              <ContractCard
                icon={Award}
                name="ComplianceCertificate.sol"
                address="0xF91b8DDf2a4110A897204206714E5B90CAd2C8D5"
                fns={[
                  ["mintCertificate", "(company, year, compliant) → tokenId  // called by CapCheck"],
                  ["getCertificate", "(company, year) → Certificate"],
                  ["tokenIdFor", "(company, year) → uint256  // keccak256 deterministic ID"],
                  ["balanceOf", "(owner: address) → uint256"],
                  ["ownerOf", "(tokenId: uint256) → address"],
                  ["setCapCheck", "(capCheck: address) → void  // owner only"],
                ]}
              />
              <ContractCard
                icon={KeySquare}
                name="DisclosureACL (base)"
                address=""
                fns={[
                  ["grantAuditAccessToTotal", "(auditor, durationSec) → FHE.allow(total, auditor)"],
                  ["revokeAuditAccess", "(auditor) → deactivate grant"],
                  ["auditGrants", "[company][auditor] → (expiry: uint256, active: bool)"],
                  ["roleOf", "(addr) → Role enum"],
                ]}
              />
              <p className="pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald/60">Wave 4 Contracts</p>
              <ContractCard
                icon={Layers}
                name="SupplierAttest.sol"
                address="pending deploy:wave4"
                fns={[
                  ["submitFactor", "(sku: bytes32, e: InEuint64, year: uint256) → void  // EMITTER role"],
                  ["getFactor", "(supplier: address, sku: bytes32) → euint64  // FHE.allowTransient"],
                  ["grantFactorDecrypt", "(sku: bytes32, to: address) → FHE.allow()"],
                  ["getFactorHandle", "(supplier: address, sku: bytes32) → euint64  // view, no allowTransient"],
                  ["hasFactorForSku", "(supplier: address, sku: bytes32) → bool"],
                ]}
              />
              <ContractCard
                icon={Zap}
                name="ProductFootprint.sol"
                address="pending deploy:wave4"
                fns={[
                  ["computeFootprint", "(sku: bytes32, suppliers: address[]) → euint64"],
                  ["classifyBand", "(sku: bytes32, suppliers: address[]) → euint8  // 0=A 1=B 2=C"],
                  ["checkThreshold", "(sku: bytes32, suppliers: address[], limit: InEuint64) → ebool"],
                  ["setBandThresholds", "(bandA: uint64, bandB: uint64) → void  // owner only"],
                ]}
              />
              <ContractCard
                icon={KeySquare}
                name="cCO2.sol (FHERC20)"
                address="pending deploy:wave4"
                fns={[
                  ["mint", "(to: address, amount: uint256) → void  // issuer only, plaintext→encrypted"],
                  ["mintEncrypted", "(to: address, encAmount: euint64) → void  // issuer only"],
                  ["burnFrom", "(from: address, encAmount: InEuint64) → void  // retirer only"],
                  ["setIssuer", "(issuer: address) → void  // owner only"],
                  ["setRetirer", "(retirer: address) → void  // owner only"],
                  ["balanceOf", "(owner: address) → uint256  // FHERC20 indicator"],
                ]}
              />
              <ContractCard
                icon={ShieldCheck}
                name="CreditIssuer.sol"
                address="pending deploy:wave4"
                fns={[
                  ["issueCredits", "(company: address, reportingYear: uint256) → void"],
                  ["setIssuanceRate", "(rate: uint64) → void  // owner only"],
                  ["issuanceRate", "() → uint64  // default: 1e18 (1 cCO2)"],
                ]}
              />
              <ContractCard
                icon={Lock}
                name="CreditRetire.sol"
                address="pending deploy:wave4"
                fns={[
                  ["retireCredits", "(encAmount: InEuint64, retirementId: bytes32) → void"],
                  ["grantRetirementAudit", "(retirementId: bytes32, auditor: address, durationSecs: uint256) → void"],
                  ["getRetirementReceipt", "(retirementId: bytes32) → euint64  // handle"],
                  ["retirementOwner", "(retirementId: bytes32) → address"],
                ]}
              />
            </div>
          </Block>

          <Block id="sdk" title="SDK Integration">
            <p>Wave 3 uses <code className="rounded border border-foreground/10 bg-surface px-1.5 py-0.5 font-mono text-[12px] text-emerald">@cofhe/sdk@0.5.2</code>. Breaking changes from 0.4.x: <code className="rounded border border-foreground/10 bg-surface px-1.5 py-0.5 font-mono text-[12px] text-emerald">getOrCreateSelfPermit()</code> now takes no arguments (uses connected state), and tfhe WASM upgraded to 1.5.3. All contracts re-deployed with ISO 14064 Scope enum — 4th parameter on submit functions.</p>
            <pre className="overflow-x-auto rounded-xl border border-foreground/10 bg-surface p-6 font-mono text-[12.5px] leading-relaxed text-foreground/80">
{`// 1. Initialise the FHE client (singleton per session)
const client = await getFheClient(publicClient, walletClient);

// 2. Encrypt before sending to contract
const eInput = await client.encrypt_uint64(BigInt(emissionsTonnes));

// 3. Submit single facility (with reporting year + ISO scope)
//    scope: 0 = Scope 1 Direct, 1 = Scope 2 Indirect, 2 = Scope 3 Value Chain
await submitEmissions(facilityId, eInput, reportingYear, scope);

// 4. OR — batch submit up to 50 facilities (same scope applied to all)
await batchSubmitEmissions([1n, 2n, 3n], [eA, eB, eC], 2025n, 0);

// 5. Read your own encrypted value (off-chain, permit-based)
const permit = await client.getOrCreateSelfPermit(); // 0.5.x: no args
const sealed = await client
  .decryptForView(handle, permit)
  .set404RetryTimeout(15_000)   // new in 0.5.x
  .execute();

// 6. Settle compliance on-chain (regulator only)
const { value, signature } = await client
  .decryptForTx(complianceHandle)
  .execute();
await settleCompliance(company, value, signature);
// → CapCheck automatically calls
//   ComplianceCertificate.mintCertificate(company, year, value)`}
            </pre>
            <div className="grid gap-4 sm:grid-cols-2">
              <Mini
                icon={Cpu}
                title="SDK 0.5.2 · tfhe 1.5.3"
                body="getOrCreateSelfPermit() takes no args. set404RetryTimeout(15_000) on all decryptForView chains. WagmiAdapter in ./adapters."
              />
              <Mini
                icon={Lock}
                title="Zero hardware trust"
                body="No enclaves. No side channels. No attestation chains. Pure lattice-based cryptography on the Fhenix threshold network."
              />
            </div>
          </Block>

          <Block id="api" title="Enterprise API">
            <p>
              The <code className="rounded border border-foreground/10 bg-surface px-1.5 py-0.5 font-mono text-[12px] text-emerald">POST /api/submit</code> Vercel Edge Function allows CEMS, IoT sensors, and enterprise ERP systems to submit batch encrypted emissions without a browser wallet. Authentication is HMAC-SHA256 — the request body is signed with a shared secret, verified server-side via the Web Crypto API.
            </p>
            <pre className="overflow-x-auto rounded-xl border border-foreground/10 bg-surface p-6 font-mono text-[12.5px] leading-relaxed text-foreground/80">
{`# Compute HMAC-SHA256 of the JSON body with your API_SECRET
# and pass it as a Bearer token.

curl https://covert-mrv.vercel.app/api/submit \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <HMAC-SHA256>" \\
  -d '{
    "facilityIds":      [1, 2, 3],
    "emissionsTonnes":  [12500, 8300, 19100],
    "reportingYear":    2025,
    "company":          "0x..."
  }'

# Response
{
  "txHash":        "0x...",
  "facilityIds":   [1, 2, 3],
  "reportingYear": 2025,
  "company":       "0x..."
}`}
            </pre>
            <div className="grid gap-4 sm:grid-cols-2">
              <Mini
                icon={Lock}
                title="HMAC-SHA256 auth"
                body="Bearer token = HMAC of the JSON body. Constant-time comparison on server. No API keys in URLs."
              />
              <Mini
                icon={Zap}
                title="Server-side FHE encrypt"
                body="The edge function encrypts all facility values with @cofhe/sdk before calling batchSubmitEmissions. Max 50 facilities per batch."
              />
            </div>
            <p className="text-sm text-foreground/55">Required Vercel env vars: <code className="font-mono text-[11px]">API_SECRET</code>, <code className="font-mono text-[11px]">SUBMIT_PRIVATE_KEY</code>, <code className="font-mono text-[11px]">CAP_REGISTRY_ADDRESS</code>.</p>
          </Block>

          <Block id="disclosure" title="Selective Disclosure Model">
            <p>
              Disclosure is graduated, not binary. The same handle can be
              visible to a regulator as a boolean, to an auditor as a precise
              total for 48 hours, and to a buyer as a band classification —
              while remaining permanently sealed to the public.
            </p>
            <pre className="overflow-x-auto rounded-xl border border-foreground/10 bg-surface p-5 font-mono text-[12.5px] leading-relaxed text-foreground/80">
{`L0  Raw Data           →  Company           FHE.allow(h, self)
L1  Aggregate Total    →  + Auditor (TTL)   FHE.allow(total, auditor)
L2  Band Category      →  + Buyer (A/B/C)   FHE.select() chain
L3  Boolean            →  + Regulator       FHE.allow(ebool, reg)
L4  Proof              →  Anyone            on-chain TX hash`}
            </pre>
          </Block>

          <Block id="faq" title="FAQ">
            <div className="space-y-3">
              {[
                {
                  q: "Can the protocol team see my emissions?",
                  a: "No. Compute permission is granted to the contract via FHE.allowThis(). Decrypt permission is scoped per role and never granted to protocol operators.",
                },
                {
                  q: "What happens if I submit a wrong value?",
                  a: "Auditors with timed access can decrypt the aggregate total and verify against an off-chain attestation. Misreporting carries the same penalties as plaintext systems — but only the auditor sees the value.",
                },
                {
                  q: "Why not zero-knowledge proofs?",
                  a: "ZK requires the prover to know the cap. The cap becomes public. Regulators specifically refuse this — exact thresholds enable gaming.",
                },
                {
                  q: "How are gas costs?",
                  a: "FHE operations are heavier than plaintext but ordering is the same. CapCheck's full pipeline executes in a single transaction. Costs are dominated by FHE.add over facility count.",
                },
                {
                  q: "Is this production-ready?",
                  a: "Wave 3 is live on Arbitrum Sepolia with all three contracts deployed and wired. 31 Hardhat tests pass on every commit. Mainnet rollout follows post-audit. ScopeX (supply chain), Credits (cCO2 token), and Tender are on the roadmap.",
                },
                {
                  q: "What does the ComplianceCertificate NFT prove?",
                  a: "It proves that at the time of settlement, the FHE coprocessor evaluated FHE.lte(encryptedTotal, encryptedCap) = true (or false). The token ID is deterministic: keccak256(company, reportingYear). Metadata is on-chain. No IPFS dependency.",
                },
                {
                  q: "Can I submit via the API instead of the browser?",
                  a: "Yes. POST /api/submit accepts a JSON batch of up to 50 facilities. It encrypts server-side and calls batchSubmitEmissions. Auth is HMAC-SHA256 of the request body. Required env: API_SECRET, SUBMIT_PRIVATE_KEY, CAP_REGISTRY_ADDRESS.",
                },
              ].map((it) => (
                <FAQItem key={it.q} q={it.q} a={it.a} />
              ))}
            </div>
          </Block>

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-foreground/10 bg-surface p-7">
            <p className="flex-1 text-[14px] text-foreground/75">
              Ready to inspect the encrypted dashboard?
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-[13px] font-semibold text-background transition hover:bg-foreground/90"
            >
              Launch Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>
      </div>

      <Footer />
    </div>
  );
}

function Block({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-3xl font-normal leading-tight tracking-tight md:text-4xl">
        {title}
      </h2>
      <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-foreground/75">
        {children}
      </div>
    </section>
  );
}

function ContractCard({
  icon: Icon,
  name,
  address,
  fns,
}: {
  icon: typeof ServerCog;
  name: string;
  address: string;
  fns: [string, string][];
}) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-surface p-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-foreground/15 bg-background">
          <Icon className="h-4 w-4 text-emerald" strokeWidth={1.6} />
        </div>
        <p className="font-display text-xl tracking-tight">{name}</p>
        {address ? (
          <a
            href={`https://sepolia.arbiscan.io/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 font-mono text-[11px] text-foreground/50 hover:text-emerald"
          >
            {address.slice(0, 8)}&hellip;{address.slice(-6)}{" "}
            <ArrowUpRight className="h-3 w-3" />
          </a>
        ) : null}
      </div>
      <div className="mt-4 divide-y divide-foreground/10 rounded-lg border border-foreground/10 bg-background">
        {fns.map(([n, sig]) => (
          <div
            key={n}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 font-mono text-[12.5px]"
          >
            <span className="text-emerald">{n}</span>
            <span className="text-foreground/55">{sig}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Mini({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Cpu;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-foreground/10 bg-surface p-5">
      <Icon className="h-5 w-5 text-emerald" strokeWidth={1.6} />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1.5 text-[13px] text-foreground/60">{body}</p>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((o) => !o)}
      className="block w-full rounded-xl border border-foreground/10 bg-surface p-5 text-left transition hover:border-emerald/40"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold">{q}</span>
        <ChevronDown
          className={`h-4 w-4 flex-none text-foreground/55 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
      {open && (
        <p className="mt-3 text-[14px] leading-relaxed text-foreground/65">
          {a}
        </p>
      )}
    </button>
  );
}
