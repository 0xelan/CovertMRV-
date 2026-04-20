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
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/docs")({
  component: Docs,
});

const SECTIONS = [
  { id: "overview", label: "Protocol Overview" },
  { id: "architecture", label: "Architecture" },
  { id: "deployments", label: "Deployments" },
  { id: "fhe", label: "How FHE Works" },
  { id: "contracts", label: "Smart Contracts" },
  { id: "sdk", label: "SDK Integration" },
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
            <span>v0.2.0 · Wave 2 · Arbitrum Sepolia</span>
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
          </p>
        </div>
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
              Wave 2 (CapCheck) is live on Arbitrum Sepolia with two deployed
              contracts, a production dApp, and 11 FHE operations executing
              fully on-chain. Subsequent waves extend the protocol to supply
              chain footprints, confidential carbon credits, and sealed-bid
              green procurement.
            </p>
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
                  address: "0x13739cCd234A901060453d7b86C1BCc245B40428",
                  role: "Encrypted emissions storage + cap management",
                },
                {
                  name: "CapCheck.sol",
                  address: "0x2792563D003faBEecfbac8c32c9baA7705030C26",
                  role: "Compliance verification + audit access control",
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
{`┌─────────────────────────────────────────────────────────────┐
│                       CovertMRV Protocol                    │
└─────────────────────────────────────────────────────────────┘

   client (browser)
   ────────────────
   @cofhe/sdk   ──encrypt──▶  euint64 ciphertext
                                    │
                                    ▼
   ┌────────────────────────────────────────────────┐
   │   CapRegistry.sol     // emissions storage     │
   │     • submit(facilityId, eEmissions)           │
   │     • aggregate() → FHE.add() across handles   │
   │     • setCap(eCap)   // encrypted threshold    │
   └────────────────────────────────────────────────┘
                                    │
                                    ▼
   ┌────────────────────────────────────────────────┐
   │   CapCheck.sol        // verification engine   │
   │     • compute() → ebool = FHE.lte(total, cap)  │
   │     • result()  → ebool handle                 │
   └────────────────────────────────────────────────┘
                                    │
                                    ▼
   ┌────────────────────────────────────────────────┐
   │   DisclosureACL.sol   // role-scoped access    │
   │     • grantAuditor(addr, ttl)                  │
   │     • grantRegulator(addr)  // ebool only      │
   │     • grantBuyerBand(addr, level)              │
   └────────────────────────────────────────────────┘`}
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
                address="0x13739cCd234A901060453d7b86C1BCc245B40428"
                fns={[
                  ["registerAsEmitter", "() → role granted"],
                  ["submitEmissions", "(facilityId: uint256, e: InEuint64) → void"],
                  ["aggregateBase", "(company: address) → void  // FHE.add()"],
                  ["setCap", "(company: address, e: InEuint64) → void  // admin"],
                  ["grantCheckAccess", "(company: address) → void  // admin"],
                  ["getMyEmissions", "(facilityId: uint256) → euint64  // msg.sender"],
                  ["getMyFacilities", "() → uint256[]  // registered facility IDs"],
                ]}
              />
              <ContractCard
                icon={ShieldCheck}
                name="CapCheck.sol"
                address="0x2792563D003faBEecfbac8c32c9baA7705030C26"
                fns={[
                  ["checkCompliance", "(company: address) → void  // FHE.lte(total, cap)"],
                  ["settleCompliance", "(company: address, val: bool, sig: bytes) → void"],
                  ["grantAuditAccess", "(company: address, auditor: address, expiry: uint256) → void"],
                  ["grantAuditAccessSelf", "(auditor: address, expiry: uint256) → void"],
                  ["revokeAuditAccess", "(company: address, auditor: address) → void"],
                  ["isCompliant", "(company: address) → bool  // settled result"],
                ]}
              />
              <ContractCard
                icon={KeySquare}
                name="DisclosureACL (base)"
                address=""
                fns={[
                  ["_retainAccess", "(handle: euint64) → FHE.allowThis()"],
                  ["_grantDecrypt", "(handle: euint64, to: address) → FHE.allow()"],
                  ["_grantBoolOnly", "(ebool: ebool, to: address) → selective bool"],
                  ["_grantTimedAudit", "(handle, auditor, expiry) → time-bounded"],
                ]}
              />
            </div>
          </Block>

          <Block id="sdk" title="SDK Integration">
            <p>Wave 2 uses <code className="rounded border border-foreground/10 bg-surface px-1.5 py-0.5 font-mono text-[12px] text-emerald">@cofhe/sdk@0.4.0</code> exclusively. The legacy <code className="rounded border border-foreground/10 bg-surface px-1.5 py-0.5 font-mono text-[12px] text-emerald">cofhejs</code> FHE.decrypt() API is deprecated and not used.</p>
            <pre className="overflow-x-auto rounded-xl border border-foreground/10 bg-surface p-6 font-mono text-[12.5px] leading-relaxed text-foreground/80">
{`// 1. Initialise the FHE client (singleton per session)
const client = await getFheClient(publicClient, walletClient);

// 2. Encrypt before sending to contract
const eInput = await client.encrypt_uint64(BigInt(emissionsTonnes));
const { handles, inputProof } = eInput;

// 3. Read your own encrypted value (off-chain, permit-based)
const sealed = await client
  .decrypt(handle)
  .withPermit()    // signed permit scoped to your account
  .execute();

// 4. Publish decryption result on-chain (compliance settlement)
// → CapCheck calls FHE.allow(result, owner) not allowPublic
const { value, signature } = await client
  .decryptForTx(complianceHandle)
  .withPermit()
  .execute();
await settleCompliance(company, value, signature);`}
            </pre>
            <div className="grid gap-4 sm:grid-cols-2">
              <Mini
                icon={Cpu}
                title="11 FHE operations"
                body="encrypt, add, sub, lte, gte, select, allow, allowThis, allowSender, sealoutput, isInitialized."
              />
              <Mini
                icon={Lock}
                title="Zero hardware trust"
                body="No enclaves, no side channels, no attestation chains. Pure lattice-based cryptography on the threshold network."
              />
            </div>
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
                  a: "Wave 2 (CapCheck) is live on Arbitrum Sepolia. Mainnet rollout follows post-audit. ScopeX (supply chain), Credits (cCO2 token), and Tender are scheduled per the roadmap.",
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
