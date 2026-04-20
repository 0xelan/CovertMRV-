import {
  Factory,
  Link2,
  AlertTriangle,
  EyeOff,
  Lock,
  Layers,
  ShieldCheck,
  Eye,
  Cpu,
  Network,
  ServerCog,
  KeySquare,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Reveal,
  StaggerGroup,
  StaggerItem,
  SpotlightCard,
  Tilt,
} from "./motion-primitives";
import { FlowDiagram, DisclosurePyramid, FHEOrbit } from "./diagrams";
import { Link } from "@tanstack/react-router";

const EASE = [0.16, 1, 0.3, 1] as const;

/* =========================================================
   Problem
========================================================= */
export function ProblemSection() {
  const items = [
    {
      icon: Factory,
      title: "Emissions Expose Trade Secrets",
      body: "Facility-level reporting reveals production volumes, energy efficiency, and competitive strategy. Companies underreport rather than expose.",
    },
    {
      icon: Link2,
      title: "Suppliers Refuse to Share",
      body: "Scope 3 footprints require supplier emissions factors. Suppliers serve competing manufacturers and refuse to expose proprietary data.",
    },
    {
      icon: AlertTriangle,
      title: "Carbon Credits Lack Integrity",
      body: "Verra suspended 90%+ of rainforest credits. Double-counting and inflated baselines plague a $2B+ voluntary market.",
    },
    {
      icon: EyeOff,
      title: "Procurement Leaks Strategy",
      body: "Public bids for carbon offsets reveal budget thresholds and climate commitment intensity to direct competitors.",
    },
  ];

  return (
    <section className="relative border-t border-foreground/10 bg-background py-32">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10">
        <Reveal>
          <SectionLabel index="01" label="The Problem" />
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display mt-6 max-w-3xl text-4xl font-normal leading-[1.05] tracking-tight md:text-5xl">
            Climate Compliance Forces a Choice:
            <br />
            <span className="text-foreground/45">
              Transparency or Confidentiality.
            </span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-foreground/60">
            Every regulator wants the number. Every competitor wants the number.
            No existing system lets you prove the number without giving it away.
          </p>
        </Reveal>

        <StaggerGroup className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/10 md:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <StaggerItem key={it.title}>
              <SpotlightCard className="group relative flex h-full flex-col gap-6 bg-background p-8 transition hover:bg-surface">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-foreground/15 bg-foreground/[0.03] text-emerald transition group-hover:border-emerald/50 group-hover:scale-110">
                  <it.icon className="h-5 w-5" strokeWidth={1.6} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold leading-snug">
                    {it.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                    {it.body}
                  </p>
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/30">
                  ISSUE.0{i + 1}
                </div>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

/* =========================================================
   How It Works  — with FlowDiagram
========================================================= */
export function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Encrypt Emissions",
      body: "Companies encrypt facility-level emissions client-side via @cofhe/sdk. Data enters the blockchain as euint64 ciphertext. Nobody — not validators, not block explorers — sees the number.",
      code: "FHE.encrypt(emissions) → euint64",
    },
    {
      n: "02",
      title: "Aggregate On-Chain",
      body: "The smart contract adds encrypted facility values together using FHE.add(). The total is mathematically correct but permanently invisible.",
      code: "total = FHE.add(facility₁, facility₂…)",
    },
    {
      n: "03",
      title: "Compare Against Cap",
      body: "FHE.lte(total, cap) compares encrypted emissions against an encrypted regulatory cap. Even the cap is hidden.",
      code: "ebool = FHE.lte(total, cap)",
    },
    {
      n: "04",
      title: "Disclose Selectively",
      body: "The regulator receives an encrypted boolean: COMPLIANT or NOT. The number is never exposed.",
      code: "FHE.allow(ebool, regulator)",
    },
  ];

  return (
    <section className="relative overflow-hidden border-t border-foreground/10 bg-surface py-32">
      <div className="absolute inset-0 grid-faint opacity-40" />
      <div className="relative mx-auto max-w-[1480px] px-6 md:px-10">
        <Reveal>
          <SectionLabel index="02" label="How It Works" />
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display mt-6 max-w-3xl text-4xl font-normal leading-[1.05] tracking-tight md:text-5xl">
            Verify the Claim,
            <br />
            <span className="text-emerald">Not the Data.</span>
          </h2>
        </Reveal>

        {/* Flow diagram */}
        <Reveal delay={0.15} className="mt-14">
          <FlowDiagram />
        </Reveal>

        <StaggerGroup className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <StaggerItem key={s.n}>
              <Tilt max={4}>
                <SpotlightCard className="group flex h-full flex-col gap-5 rounded-2xl border border-foreground/10 bg-background p-7 transition hover:border-emerald/40">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-emerald">
                      STEP {s.n}
                    </span>
                    {i < steps.length - 1 && (
                      <ArrowRight className="hidden h-4 w-4 text-foreground/25 lg:block" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold leading-snug">{s.title}</h3>
                  <p className="text-[13.5px] leading-relaxed text-foreground/60">
                    {s.body}
                  </p>
                  <div className="mt-auto rounded-md border border-foreground/10 bg-foreground/[0.03] px-3 py-2 font-mono text-[11px] text-emerald/90">
                    {s.code}
                  </div>
                </SpotlightCard>
              </Tilt>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

/* =========================================================
   Disclosure spectrum — with pyramid diagram
========================================================= */
export function DisclosureSpectrum() {
  const levels = [
    { l: "L0", title: "Raw Data", who: "Company only", code: "FHE.allow(h, self)" },
    { l: "L1", title: "Aggregate Total", who: "+ Auditor (timed)", code: "FHE.allow(total, auditor)" },
    { l: "L2", title: "Band Category", who: "+ Buyer (A/B/C)", code: "FHE.select() chain" },
    { l: "L3", title: "Boolean", who: "+ Regulator (pass/fail)", code: "FHE.allow(ebool, reg)" },
    { l: "L4", title: "Proof", who: "Anyone (TX hash)", code: "On-chain confirmation" },
  ];

  return (
    <section className="relative border-t border-foreground/10 bg-background py-32">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10">
        <Reveal>
          <SectionLabel index="03" label="Selective Disclosure" />
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display mt-6 max-w-3xl text-4xl font-normal leading-[1.05] tracking-tight md:text-5xl">
            Five Levels of Disclosure.
            <br />
            <span className="text-foreground/45">Not Binary Public/Private.</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          {/* Pyramid diagram */}
          <Reveal delay={0.1}>
            <DisclosurePyramid />
          </Reveal>

          {/* Detail list */}
          <div className="flex flex-col gap-3">
            {levels.map((lvl, i) => (
              <Reveal key={lvl.l} delay={0.15 + i * 0.06}>
                <SpotlightCard className="flex items-center gap-5 rounded-xl border border-foreground/10 bg-surface px-5 py-4 transition hover:border-emerald/40">
                  <div
                    className="flex h-10 w-10 flex-none items-center justify-center rounded-lg font-mono text-xs font-semibold"
                    style={{
                      background: `oklch(0.21 0.035 240)`,
                      border: `1px solid hsl(${155 + i * 18} 60% 60% / 0.4)`,
                      color: `hsl(${155 + i * 18} 60% 60%)`,
                    }}
                  >
                    {lvl.l}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold">{lvl.title}</p>
                    <p className="text-xs text-foreground/55">{lvl.who}</p>
                  </div>
                  <code className="hidden truncate rounded border border-foreground/10 bg-background px-2 py-1 font-mono text-[10.5px] text-emerald/85 md:block">
                    {lvl.code}
                  </code>
                  <Lock className="h-3.5 w-3.5 flex-none text-foreground/35" />
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Bar */}
        <div className="mt-12">
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
            <span>← Most Private</span>
            <span>Most Public →</span>
          </div>
          <motion.div
            className="relative mt-4 h-1 w-full overflow-hidden rounded-full bg-foreground/10"
            initial={{ scaleX: 0, transformOrigin: "left" }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: EASE }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald via-blue-info to-amber-warn opacity-80" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   Market
========================================================= */
export function MarketSection() {
  const stats = [
    { v: "$909B", l: "Global carbon market size (World Bank 2024)" },
    { v: "EU CBAM", l: "Mandatory carbon reporting launched 2026" },
    { v: "$101M", l: "Raised by Persefoni for carbon accounting SaaS" },
    {
      v: "TradeLens",
      l: "$100M+ IBM/Maersk venture failed because transparent ledgers exposed competitive data",
    },
    { v: "$10M+", l: "Fines for emissions misreporting" },
    { v: "90%+", l: "Verra credits suspended over integrity concerns" },
  ];
  return (
    <section className="relative overflow-hidden border-t border-foreground/10 bg-surface py-32">
      <div className="absolute inset-0 grid-faint opacity-40" />
      <div className="relative mx-auto max-w-[1480px] px-6 md:px-10">
        <Reveal>
          <SectionLabel index="04" label="Market Validation" />
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display mt-6 max-w-3xl text-4xl font-normal leading-[1.05] tracking-tight md:text-5xl">
            This Market Is Real.
            <br />
            It Is Massive. It Is{" "}
            <span className="text-emerald">Mandatory.</span>
          </h2>
        </Reveal>

        <StaggerGroup className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/10 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => (
            <StaggerItem key={s.v}>
              <SpotlightCard className="flex h-full min-h-[180px] flex-col justify-between bg-background p-7 transition hover:bg-surface-2">
                <p className="font-display text-4xl font-normal leading-tight tracking-tight md:text-5xl">
                  {s.v}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-foreground/60">
                  {s.l}
                </p>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

/* =========================================================
   Three Contracts
========================================================= */
export function ContractsSection() {
  const items = [
    {
      icon: ServerCog,
      name: "CapRegistry.sol",
      sub: "Encrypted Emissions Storage",
      body: "Companies submit encrypted facility emissions. The contract stores euint64 handles, aggregates totals via FHE.add(), and stores encrypted regulatory caps.",
    },
    {
      icon: ShieldCheck,
      name: "CapCheck.sol",
      sub: "Compliance Verification Engine",
      body: "Computes FHE.lte(total, cap) and returns only an encrypted boolean to the regulator. Pass or fail. Never the number.",
    },
    {
      icon: KeySquare,
      name: "DisclosureACL.sol",
      sub: "Graduated Access Control",
      body: "Five roles (Emitter, Auditor, Regulator, Buyer, Admin) with scoped FHE.allow() grants and time-bounded audit permits.",
    },
  ];
  return (
    <section className="relative border-t border-foreground/10 bg-background py-32">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10">
        <Reveal>
          <SectionLabel index="05" label="Protocol Architecture" />
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display mt-6 max-w-3xl text-4xl font-normal leading-[1.05] tracking-tight md:text-5xl">
            Three Contracts.
            <br />
            <span className="text-foreground/45">Complete Compliance.</span>
          </h2>
        </Reveal>

        <StaggerGroup className="mt-16 grid gap-6 lg:grid-cols-3">
          {items.map((it) => (
            <StaggerItem key={it.name}>
              <Tilt max={5}>
                <SpotlightCard className="group relative h-full overflow-hidden rounded-2xl border border-foreground/10 bg-surface p-8 transition hover:border-emerald/40">
                  <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-emerald/[0.07] blur-3xl transition group-hover:bg-emerald/15" />
                  <it.icon className="relative h-7 w-7 text-emerald" strokeWidth={1.6} />
                  <p className="relative mt-6 font-mono text-sm text-foreground/55">
                    {it.sub}
                  </p>
                  <h3 className="font-display relative mt-2 text-3xl font-normal tracking-tight">
                    {it.name}
                  </h3>
                  <p className="relative mt-5 text-[14px] leading-relaxed text-foreground/65">
                    {it.body}
                  </p>
                  <div className="relative mt-8 flex items-center gap-2 font-mono text-[11px] text-foreground/40">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" />
                    deployed · arbitrum sepolia
                  </div>
                </SpotlightCard>
              </Tilt>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

/* =========================================================
   Why FHE — orbit diagram
========================================================= */
export function WhyFHE() {
  const items = [
    { icon: Layers, tag: "ZK Proofs", verdict: "Cap leaks", body: "Prover must know the cap to construct the proof. Cap becomes public knowledge.", ok: false },
    { icon: Network, tag: "MPC", verdict: "Synchrony required", body: "All suppliers must be online simultaneously. Global supply chains? Impossible.", ok: false },
    { icon: Cpu, tag: "TEE", verdict: "Hardware trust", body: "Raw data decrypted inside the enclave. Side-channel attacks expose everything.", ok: false },
    { icon: Lock, tag: "FHE", verdict: "Compares ciphertext", body: "Compares two encrypted values. Neither decrypts. Async, persistent, zero hardware trust.", ok: true },
  ];
  return (
    <section className="relative overflow-hidden border-t border-foreground/10 bg-surface py-32">
      <div className="absolute inset-0 grid-faint opacity-40" />
      <div className="relative mx-auto max-w-[1480px] px-6 md:px-10">
        <Reveal>
          <SectionLabel index="06" label="Cryptographic Choice" />
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display mt-6 max-w-3xl text-4xl font-normal leading-[1.05] tracking-tight md:text-5xl">
            Why Only FHE Works
            <br />
            <span className="text-foreground/45">for Climate Compliance.</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <Reveal delay={0.1}>
            <FHEOrbit />
          </Reveal>

          <StaggerGroup className="grid gap-3">
            {items.map((it) => (
              <StaggerItem key={it.tag}>
                <SpotlightCard
                  className={`flex items-start gap-5 rounded-xl border bg-background p-5 transition ${
                    it.ok ? "border-emerald/40 ring-1 ring-emerald/20" : "border-foreground/10 hover:border-foreground/20"
                  }`}
                >
                  <div className={`flex h-11 w-11 flex-none items-center justify-center rounded-lg border ${it.ok ? "border-emerald/40 bg-emerald/10 text-emerald" : "border-foreground/15 bg-foreground/[0.03] text-foreground/55"}`}>
                    <it.icon className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-display text-xl tracking-tight">{it.tag}</p>
                      <span className={`font-mono text-[10px] uppercase tracking-[0.16em] ${it.ok ? "text-emerald" : "text-destructive"}`}>
                        {it.ok ? "✓ viable" : "✕ blocked"}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-foreground/50">{it.verdict}</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-foreground/65">{it.body}</p>
                  </div>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   Roadmap
========================================================= */
export function Roadmap() {
  const waves = [
    { w: "Wave 2", tag: "CapCheck", status: "Live", body: "Encrypted emissions storage, compliance verification engine, deployed contracts, live dApp." },
    { w: "Wave 3", tag: "ScopeX", status: "In Build", body: "Encrypted supply chain footprint rollups with allowTransient cross-contract FHE composition." },
    { w: "Wave 4", tag: "Credits", status: "Q3 2026", body: "FHERC20 carbon credit token (cCO2) with conditional minting on verified compliance." },
    { w: "Wave 5", tag: "Tender + Sentinel", status: "Q1 2027", body: "Sealed-bid green procurement and encrypted risk scoring engine." },
  ];
  return (
    <section className="relative border-t border-foreground/10 bg-background py-32">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10">
        <Reveal>
          <SectionLabel index="07" label="Roadmap" />
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display mt-6 max-w-3xl text-4xl font-normal leading-[1.05] tracking-tight md:text-5xl">
            From Compliance
            <br />
            <span className="text-emerald">to Carbon Markets.</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-foreground/45">
            Protocol release schedule.
            <br />
            All waves remain encrypted-by-default.
          </div>
          <div className="relative">
            <motion.div
              className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-emerald via-foreground/15 to-transparent"
              initial={{ scaleY: 0, transformOrigin: "top" }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: EASE }}
            />
            <ul className="space-y-10">
              {waves.map((w, i) => (
                <motion.li
                  key={w.w}
                  className="relative pl-10"
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease: EASE }}
                >
                  <span
                    className={`absolute left-0 top-2 h-3.5 w-3.5 rounded-full border-2 ${
                      i === 0 ? "border-emerald bg-emerald shadow-[0_0_12px_var(--color-emerald)]" : "border-foreground/30 bg-background"
                    }`}
                  />
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-mono text-xs uppercase tracking-[0.18em] text-foreground/45">{w.w}</span>
                    <h3 className="font-display text-2xl font-normal tracking-tight md:text-3xl">{w.tag}</h3>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                        i === 0 ? "border-emerald/50 bg-emerald/10 text-emerald" : "border-foreground/15 bg-foreground/[0.04] text-foreground/55"
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>
                  <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-foreground/65">
                    {w.body}
                  </p>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   Tech Stack
========================================================= */
export function TechStack() {
  const stack = [
    "Fhenix CoFHE",
    "@cofhe/sdk",
    "Solidity 0.8.28",
    "React 19",
    "TypeScript",
    "Vite",
    "wagmi v2",
    "Arbitrum Sepolia",
  ];
  return (
    <section className="relative border-t border-foreground/10 bg-background py-20">
      <div className="mx-auto max-w-[1480px] px-6 md:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
              Built with
            </p>
            <p className="font-display mt-3 text-2xl font-normal tracking-tight md:text-3xl">
              Production-grade infrastructure.
            </p>
          </Reveal>
          <StaggerGroup className="flex flex-wrap gap-2">
            {stack.map((s) => (
              <StaggerItem key={s}>
                <span className="inline-block rounded-full border border-foreground/15 bg-foreground/[0.04] px-4 py-2 font-mono text-xs text-foreground/75 transition hover:border-emerald/40 hover:text-emerald">
                  {s}
                </span>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   Closing CTA
========================================================= */
export function ClosingCTA() {
  return (
    <section className="relative overflow-hidden border-t border-foreground/10 bg-surface py-32">
      <div className="absolute inset-0 grid-faint opacity-30" />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[100px]"
        style={{ background: "var(--color-emerald)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative mx-auto max-w-3xl px-6 text-center md:px-10">
        <Reveal>
          <Eye className="mx-auto h-7 w-7 text-emerald" strokeWidth={1.4} />
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display mt-8 text-4xl font-normal leading-[1.05] tracking-tight text-balance md:text-6xl">
            Compliance without
            <br />
            <span className="text-emerald">surveillance.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-foreground/65">
            Connect a wallet on Arbitrum Sepolia to encrypt facility emissions,
            run cap checks against an encrypted regulator threshold, and grant
            time-bounded audit access — every value stays sealed end-to-end on
            live contracts.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to="/dashboard"
              className="rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background transition hover:bg-foreground/90"
            >
              Launch Dashboard
            </Link>
            <Link
              to="/docs"
              className="rounded-full border border-foreground/25 bg-foreground/[0.04] px-7 py-3.5 text-sm font-semibold text-foreground transition hover:border-emerald hover:text-emerald"
            >
              View Architecture
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/45">
      <span className="text-emerald">{index}</span>
      <span className="h-px w-12 bg-foreground/20" />
      <span>{label}</span>
    </div>
  );
}
