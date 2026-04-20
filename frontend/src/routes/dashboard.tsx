import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Upload,
  ShieldCheck,
  KeyRound,
  Eye,
  Lock,
  ChevronRight,
  Copy,
  Unlock,
  CheckCircle2,
  XCircle,
  Clock,
  Info,
  Building2,
  Hash,
  Zap,
  Activity,
  Loader2,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { z } from "zod";
import { isAddress } from "viem";
import { Logo } from "@/components/site/Logo";
import { EncryptedNumber, SpotlightCard } from "@/components/site/motion-primitives";
import { Sparkline } from "@/components/site/diagrams";
import { ConnectWallet } from "@/components/shared/ConnectWallet";
import { ChainGuard } from "@/components/shared/ChainGuard";
import { useCovertMrv, useWaitForTransactionReceipt } from "@/hooks/useCovertMrv";
import { useAccount, useChainId } from "wagmi";
import { CAP_REGISTRY_ADDRESS, CAP_CHECK_ADDRESS } from "@/config/contracts";
import { fmtTonnes, shortAddress, shortHandle, fmtCountdown } from "@/lib/format";

const EASE = [0.16, 1, 0.3, 1] as const;

const dashboardSearchSchema = z.object({
  view: z
    .enum(["overview", "submit", "check", "audit", "console"])
    .catch("overview"),
});

export const Route = createFileRoute("/dashboard")({
  validateSearch: (raw: Record<string, unknown>) => dashboardSearchSchema.parse(raw),
  head: () => ({
    meta: [
      { title: "Dashboard — CovertMRV Compliance Console" },
      {
        name: "description",
        content:
          "Encrypted compliance dashboard. Submit emissions, run cap checks, manage audit access, and inspect the disclosure console.",
      },
      { property: "og:title", content: "CovertMRV Dashboard" },
      {
        property: "og:description",
        content: "The institutional-grade encrypted compliance console.",
      },
    ],
  }),
  component: Dashboard,
});

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "submit", label: "Submit Emissions", icon: Upload },
  { id: "check", label: "Compliance Check", icon: ShieldCheck },
  { id: "audit", label: "Audit Access", icon: KeyRound },
  { id: "console", label: "Disclosure Console", icon: Eye },
] as const;

const ROLE_LABELS = ["None", "Emitter", "Auditor", "Regulator", "Admin"] as const;

function Dashboard() {
  const { view } = Route.useSearch();
  const navigate = useNavigate({ from: "/dashboard" });
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const ctx = useCovertMrv();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="sticky top-0 flex h-screen flex-col border-r border-foreground/10 bg-surface">
          <Link
            to="/"
            className="flex items-center gap-2.5 border-b border-foreground/10 px-6 py-6"
          >
            <Logo size={32} />
            <span className="font-mono text-[14px] font-medium">
              Covert<span className="text-emerald">MRV</span>
            </span>
          </Link>

          <div className="px-4 py-5">
            <p className="px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
              Console
            </p>
            <nav className="mt-3 space-y-1">
              {NAV.map((item) => {
                const active = view === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate({ search: { view: item.id } })}
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13.5px] transition ${
                      active
                        ? "bg-foreground/[0.08] text-foreground"
                        : "text-foreground/65 hover:bg-foreground/[0.04] hover:text-foreground"
                    }`}
                  >
                    <item.icon
                      className={`h-4 w-4 ${active ? "text-emerald" : ""}`}
                      strokeWidth={1.7}
                    />
                    <span className="flex-1">{item.label}</span>
                    {active && (
                      <ChevronRight className="h-3.5 w-3.5 text-emerald" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto border-t border-foreground/10 p-5">
            <div className="rounded-xl border border-foreground/10 bg-background p-4">
              <div className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isConnected ? "bg-emerald" : "bg-foreground/30"
                  }`}
                />
                <p className="font-mono text-[10px] uppercase tracking-wider text-foreground/55">
                  {isConnected ? "Connected" : "Disconnected"}
                </p>
              </div>
              <p className="mt-2 break-all font-mono text-[11px] text-foreground/70">
                {isConnected ? shortAddress(address, 5) : "—"}
              </p>
              <p className="mt-1 font-mono text-[10px] text-foreground/40">
                {isConnected ? `Arb Sepolia · ${chainId}` : "No wallet"}
              </p>
              {isConnected && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald/30 bg-emerald/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-emerald">
                  {ROLE_LABELS[ctx.role] ?? "None"}
                  {ctx.isOwner ? " · Owner" : ""}
                </p>
              )}
              <div className="mt-3">
                <ConnectWallet variant="compact" />
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-h-screen overflow-x-hidden">
          <ChainGuard />
          {!isConnected && <DisconnectedBanner />}
          {isConnected && ctx.role === 0 && <NotRegisteredBanner ctx={ctx} />}
          {view === "overview" && <Overview ctx={ctx} />}
          {view === "submit" && <SubmitEmissions ctx={ctx} />}
          {view === "check" && <ComplianceCheck ctx={ctx} />}
          {view === "audit" && <AuditAccess ctx={ctx} />}
          {view === "console" && <DisclosureConsole ctx={ctx} />}
        </main>
      </div>
    </div>
  );
}

/* -------------------- Banners -------------------- */

function DisconnectedBanner() {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-foreground/10 bg-surface px-10 py-3">
      <div className="flex items-center gap-2 text-[13px] text-foreground/70">
        <Lock className="h-4 w-4 text-emerald" />
        Connect a wallet on Arbitrum Sepolia to use the encrypted compliance console.
      </div>
      <ConnectWallet variant="compact" />
    </div>
  );
}

function NotRegisteredBanner({ ctx }: { ctx: ReturnType<typeof useCovertMrv> }) {
  const [pending, setPending] = useState(false);
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });
  useEffect(() => {
    if (isSuccess) {
      ctx.refetch();
      setPending(false);
    }
  }, [isSuccess, ctx]);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-info/30 bg-blue-info/5 px-10 py-3">
      <div className="flex items-center gap-2 text-[13px] text-foreground/75">
        <UserCheck className="h-4 w-4 text-blue-info" />
        You are not yet registered as an Emitter. Self-register to begin
        submitting encrypted emissions reports.
      </div>
      <button
        disabled={pending || isLoading}
        onClick={async () => {
          try {
            setPending(true);
            const h = await ctx.registerAsEmitter();
            setHash(h);
          } catch (e) {
            setPending(false);
            console.error(e);
          }
        }}
        className="inline-flex items-center gap-2 rounded-full border border-blue-info/40 bg-blue-info/10 px-4 py-1.5 text-[12px] font-semibold text-blue-info transition hover:bg-blue-info/20 disabled:opacity-60"
      >
        {pending || isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : null}
        Register as Emitter
      </button>
    </div>
  );
}

/* -------------------- Shared UI -------------------- */

function PageHeader({
  index,
  title,
  desc,
}: {
  index: string;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      key={title}
      className="border-b border-foreground/10 bg-surface px-10 py-10"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/45">
        <span className="text-emerald">{index}</span>
        <span className="h-px w-10 bg-foreground/20" />
        <span>{title}</span>
      </div>
      <h1 className="font-display mt-5 max-w-3xl text-3xl font-normal leading-tight tracking-tight md:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/60">
        {desc}
      </p>
    </motion.div>
  );
}

function CipherChip({ value, label = "CIPHERTEXT" }: { value?: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-foreground/15 bg-foreground/[0.04] px-2.5 py-1.5 font-mono text-[11px] text-foreground/65">
      <Lock className="h-3 w-3 text-emerald" />
      {value ?? "sealed"}
      <span className="text-foreground/35">· {label}</span>
    </span>
  );
}

function FacilityRow({
  id,
  ctx,
}: {
  id: bigint;
  ctx: ReturnType<typeof useCovertMrv>;
}) {
  const [value, setValue] = useState<bigint | null>(null);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function decrypt() {
    setErr(null);
    setPending(true);
    try {
      const v = await ctx.decryptFacility(id);
      setValue(v);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <li className="flex flex-col gap-1.5 border-b border-foreground/5 py-1.5">
      <div className="flex items-center justify-between gap-3">
        <span>Facility #{String(id)}</span>
        <div className="flex items-center gap-2">
          {value !== null ? (
            <span className="font-display text-sm text-emerald">
              {fmtTonnes(value)}
            </span>
          ) : (
            <CipherChip value="euint64" label="ENCRYPTED" />
          )}
          <button
            onClick={decrypt}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-full border border-foreground/20 bg-foreground/[0.04] px-2.5 py-1 text-[10px] font-semibold text-foreground/80 transition hover:border-emerald hover:text-emerald disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Unlock className="h-3 w-3" />
            )}
            {value !== null ? "Re-decrypt" : "Decrypt"}
          </button>
        </div>
      </div>
      {err && (
        <span className="text-[10px] text-destructive">{err}</span>
      )}
    </li>
  );
}

function FHEStepper({ ctx }: { ctx: ReturnType<typeof useCovertMrv> }) {
  if (ctx.fheStep === "IDLE") return null;
  const labels = ["Encrypting", "Computing", "Ready"] as const;
  const isError = ctx.fheStep === "ERROR";
  return (
    <div className="mt-4 rounded-lg border border-foreground/10 bg-background p-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50">
          FHE pipeline
        </p>
        <p
          className={`font-mono text-[11px] ${
            isError ? "text-destructive" : "text-foreground/70"
          }`}
        >
          {ctx.fheStepLabel}
        </p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {labels.map((label, i) => {
          const done = !isError && ctx.fheStepIndex > i;
          const active = !isError && ctx.fheStepIndex === i;
          return (
            <div key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-5 w-5 flex-none items-center justify-center rounded-full font-mono text-[10px] ${
                  isError
                    ? "bg-destructive/20 text-destructive"
                    : done
                      ? "bg-emerald text-background"
                      : active
                        ? "bg-foreground text-background"
                        : "bg-foreground/10 text-foreground/45"
                }`}
              >
                {isError ? "!" : done ? "✓" : i + 1}
              </span>
              <span
                className={`font-mono text-[11px] ${
                  done || active ? "text-foreground/80" : "text-foreground/40"
                }`}
              >
                {label}
              </span>
              {i < labels.length - 1 && (
                <span className="h-px flex-1 bg-foreground/10" />
              )}
            </div>
          );
        })}
      </div>
      {isError && ctx.fheError && (
        <p className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] text-destructive">
          <AlertTriangle className="h-3 w-3" /> {ctx.fheError}
        </p>
      )}
    </div>
  );
}

function StatusPill({ kind, children }: { kind: "ok" | "warn" | "err" | "info"; children: React.ReactNode }) {
  const map = {
    ok: "border-emerald/40 bg-emerald/10 text-emerald",
    warn: "border-amber-warn/40 bg-amber-warn/10 text-amber-warn",
    err: "border-destructive/40 bg-destructive/10 text-destructive",
    info: "border-blue-info/40 bg-blue-info/10 text-blue-info",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${map[kind]}`}>
      {children}
    </span>
  );
}

/* -------------------- Overview -------------------- */

function Overview({ ctx }: { ctx: ReturnType<typeof useCovertMrv> }) {
  const sparkA = [12, 18, 14, 22, 19, 26, 24, 30, 28, 34, 31, 38];
  const sparkB = [40, 38, 42, 36, 44, 39, 46, 41, 48, 43, 50, 45];
  const facilityCount = ctx.facilityIds.length;
  const settledStatus = ctx.settled?.[0];
  const settledValue = ctx.settled?.[1];
  return (
    <>
      <PageHeader
        index="00"
        title="Overview"
        desc="Compliance posture for the current reporting period. All values remain encrypted on-chain; only authorized roles can decrypt."
      />
      <div className="grid gap-6 p-10 lg:grid-cols-3">
        <SpotlightCard className="rounded-2xl border border-foreground/10 bg-surface p-7 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
              Company
            </p>
            {ctx.role > 0 ? (
              <StatusPill kind="ok">
                <span className="h-1 w-1 animate-pulse rounded-full bg-emerald" />
                {ROLE_LABELS[ctx.role]}
              </StatusPill>
            ) : (
              <StatusPill kind="warn">Not Registered</StatusPill>
            )}
          </div>
          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-foreground/15 bg-background">
              <Building2 className="h-6 w-6 text-emerald" strokeWidth={1.6} />
            </div>
            <div>
              <p className="font-mono text-base font-medium">
                {shortAddress(ctx.address, 6)}
              </p>
              <p className="mt-1 text-xs text-foreground/55">
                {ctx.isOwner ? "Protocol Admin / Regulator" : "Self-custodial Emitter"}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-foreground/10 bg-foreground/10">
            {[
              { l: "Facilities Reported", v: String(facilityCount), spark: sparkA },
              { l: "Aggregate Total", v: ctx.companyTotalHandle ? "encrypted" : "—" },
              { l: "Last Check", v: ctx.lastCheckedAt ? new Date(Number(ctx.lastCheckedAt) * 1000).toLocaleString() : "—", spark: sparkB },
            ].map((s, i) => (
              <motion.div
                key={s.l}
                className="bg-surface p-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: EASE }}
              >
                <p className="font-mono text-[10px] uppercase tracking-wider text-foreground/45">
                  {s.l}
                </p>
                <p className="font-display mt-2 text-2xl font-normal tracking-tight">
                  {s.v}
                </p>
                {s.spark && (
                  <Sparkline values={s.spark} className="mt-2 opacity-70" />
                )}
              </motion.div>
            ))}
          </div>
        </SpotlightCard>

        <SpotlightCard className="rounded-2xl border border-foreground/10 bg-surface p-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
            Compliance Status
          </p>
          <div className="relative mt-6 flex flex-col items-center gap-3 overflow-hidden rounded-xl border border-foreground/10 bg-background p-8 text-center">
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, var(--color-emerald-glow), transparent 60%)",
              }}
              animate={{ opacity: [0.2, 0.45, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            {settledStatus ? (
              settledValue ? (
                <>
                  <CheckCircle2 className="relative h-7 w-7 text-emerald" strokeWidth={1.4} />
                  <p className="font-display relative text-2xl font-normal tracking-tight text-emerald">COMPLIANT</p>
                  <p className="font-mono relative text-[11px] text-foreground/50">settled · public</p>
                </>
              ) : (
                <>
                  <XCircle className="relative h-7 w-7 text-destructive" strokeWidth={1.4} />
                  <p className="font-display relative text-2xl font-normal tracking-tight text-destructive">NON-COMPLIANT</p>
                  <p className="font-mono relative text-[11px] text-foreground/50">settled · public</p>
                </>
              )
            ) : (
              <>
                <Lock className="relative h-7 w-7 text-emerald" strokeWidth={1.4} />
                <p className="font-display relative text-2xl font-normal tracking-tight">
                  {ctx.complianceHandle ? "ENCRYPTED" : "NOT RUN"}
                </p>
                <p className="font-mono relative text-[11px] text-foreground/50">
                  {ctx.complianceHandle ? "ebool · awaiting decryption" : "no result yet"}
                </p>
              </>
            )}
          </div>
          <Link
            from="/dashboard"
            to="."
            search={{ view: "check" }}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-[13px] font-semibold text-background transition hover:bg-foreground/90"
          >
            Check Compliance
            <ChevronRight className="h-4 w-4" />
          </Link>
        </SpotlightCard>
      </div>

      {ctx.isOwner && <AdminPanel ctx={ctx} />}

      <div className="px-10 pb-10">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
            Deployed contracts
          </p>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-foreground/45">
            <Activity className="h-3 w-3 text-emerald" /> arbitrum sepolia
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <ContractCard label="CapRegistry" address={CAP_REGISTRY_ADDRESS} />
          <ContractCard label="CapCheck" address={CAP_CHECK_ADDRESS} />
        </div>
      </div>
    </>
  );
}

function ContractCard({ label, address }: { label: string; address: string }) {
  return (
    <a
      href={`https://sepolia.arbiscan.io/address/${address}`}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between rounded-xl border border-foreground/10 bg-surface px-4 py-3 transition hover:border-emerald/40"
    >
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-foreground/45">{label}</p>
        <p className="mt-1 font-mono text-[12.5px] text-foreground/85">{address}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-foreground/40" />
    </a>
  );
}

function AdminPanel({ ctx }: { ctx: ReturnType<typeof useCovertMrv> }) {
  const [target, setTarget] = useState("");
  const [cap, setCap] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  async function doSetCap(e: React.FormEvent) {
    e.preventDefault();
    if (!isAddress(target)) return setMsg({ tone: "err", text: "Invalid address" });
    if (!cap) return;
    try {
      setPending("cap");
      setMsg(null);
      const hash = await ctx.setCap(target as `0x${string}`, BigInt(cap));
      setMsg({ tone: "ok", text: `Cap submitted: ${shortHandle(hash)}` });
    } catch (e) {
      setMsg({ tone: "err", text: (e as Error).message });
    } finally {
      setPending(null);
    }
  }

  async function doGrantCheck() {
    if (!isAddress(target)) return setMsg({ tone: "err", text: "Invalid address" });
    try {
      setPending("grant");
      setMsg(null);
      const hash = await ctx.grantCheckAccess(target as `0x${string}`);
      setMsg({ tone: "ok", text: `Granted CapCheck access: ${shortHandle(hash)}` });
    } catch (e) {
      setMsg({ tone: "err", text: (e as Error).message });
    } finally {
      setPending(null);
    }
  }

  async function doSettle() {
    if (!isAddress(target)) return setMsg({ tone: "err", text: "Invalid address" });
    try {
      setPending("settle");
      setMsg(null);
      const hash = await ctx.settleCompliance(target as `0x${string}`);
      setMsg({ tone: "ok", text: `Settlement broadcast: ${shortHandle(hash)}` });
    } catch (e) {
      setMsg({ tone: "err", text: (e as Error).message });
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="px-10 pb-2">
      <div className="rounded-2xl border border-amber-warn/30 bg-amber-warn/[0.04] p-7">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-amber-warn" />
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-amber-warn">
            Regulator / Admin controls
          </p>
        </div>
        <form onSubmit={doSetCap} className="mt-5 grid gap-4 md:grid-cols-[1.6fr_1fr_auto]">
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Company address (0x…)"
            className="rounded-lg border border-foreground/15 bg-background px-4 py-2.5 font-mono text-[12.5px] outline-none focus:border-emerald"
          />
          <input
            value={cap}
            onChange={(e) => setCap(e.target.value)}
            type="number"
            placeholder="Cap (tCO₂e)"
            className="rounded-lg border border-foreground/15 bg-background px-4 py-2.5 font-mono text-[12.5px] outline-none focus:border-emerald"
          />
          <button
            disabled={pending === "cap"}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-[12.5px] font-semibold text-background disabled:opacity-60"
          >
            {pending === "cap" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
            Encrypt & Set Cap
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            disabled={pending === "grant"}
            onClick={doGrantCheck}
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-foreground/[0.04] px-4 py-2 text-[12px] font-semibold text-foreground transition hover:border-emerald disabled:opacity-60"
          >
            {pending === "grant" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
            Grant CapCheck access
          </button>
          <button
            disabled={pending === "settle"}
            onClick={doSettle}
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-foreground/[0.04] px-4 py-2 text-[12px] font-semibold text-foreground transition hover:border-emerald disabled:opacity-60"
          >
            {pending === "settle" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlock className="h-3.5 w-3.5" />}
            Decrypt & Settle compliance
          </button>
        </div>
        {msg && (
          <p className={`mt-3 font-mono text-[11.5px] ${msg.tone === "ok" ? "text-emerald" : "text-destructive"}`}>
            {msg.text}
          </p>
        )}
        <p className="mt-4 text-[12px] leading-relaxed text-foreground/55">
          Owners can encrypt new caps, grant the CapCheck contract access to a
          company's aggregate (run once after every aggregateTotal), and decrypt
          + publish a compliance result on-chain so the public can verify.
        </p>
      </div>
    </div>
  );
}

/* -------------------- Submit -------------------- */

const SUBMIT_STEPS = [
  "Encrypting in browser via @cofhe/sdk…",
  "Submitting to Arbitrum Sepolia…",
  "FHE.allowThis() — contract retains compute access…",
  "Emissions recorded · ciphertext handle created.",
];

function SubmitEmissions({ ctx }: { ctx: ReturnType<typeof useCovertMrv> }) {
  const [facility, setFacility] = useState("");
  const [emissions, setEmissions] = useState("");
  const [step, setStep] = useState(0);
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [aggHash, setAggHash] = useState<`0x${string}` | undefined>();
  const tx = useWaitForTransactionReceipt({ hash });
  const aggTx = useWaitForTransactionReceipt({ hash: aggHash });

  useEffect(() => {
    if (tx.isLoading) setStep(2);
    if (tx.isSuccess) {
      setStep(4);
      ctx.refetch();
    }
  }, [tx.isLoading, tx.isSuccess, ctx]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setHash(undefined);
    setStep(1);
    try {
      if (!ctx.fheReady) throw new Error("FHE client not ready — wait a moment then retry");
      const h = await ctx.submitEmissions(BigInt(facility), BigInt(emissions));
      setHash(h);
    } catch (e) {
      setError((e as Error).message);
      setStep(0);
    }
  }

  async function aggregate() {
    if (!ctx.address) return;
    setError(null);
    try {
      const h = await ctx.aggregateTotal(ctx.address as `0x${string}`);
      setAggHash(h);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <PageHeader
        index="01"
        title="Submit Emissions"
        desc="Submit a facility-level emissions value. The number is encrypted client-side before it ever leaves your browser."
      />
      <div className="grid gap-6 p-10 lg:grid-cols-[1.2fr_1fr]">
        <form
          onSubmit={submit}
          className="rounded-2xl border border-foreground/10 bg-surface p-8"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
            Facility Report
          </p>
          <div className="mt-6 space-y-5">
            <Field label="Facility ID">
              <input
                type="number"
                required
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                placeholder="e.g. 7"
                className="w-full rounded-lg border border-foreground/15 bg-background px-4 py-3 font-mono text-sm outline-none transition focus:border-emerald"
              />
            </Field>
            <Field label="Emissions (tonnes CO₂e)">
              <input
                type="number"
                required
                value={emissions}
                onChange={(e) => setEmissions(e.target.value)}
                placeholder="e.g. 18450"
                className="w-full rounded-lg border border-foreground/15 bg-background px-4 py-3 font-mono text-sm outline-none transition focus:border-emerald"
              />
            </Field>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-lg border border-foreground/10 bg-background p-4">
            <Info className="mt-0.5 h-4 w-4 flex-none text-emerald" />
            <p className="text-[13px] leading-relaxed text-foreground/65">
              Your emissions value is encrypted in this tab via the CoFHE SDK
              before submission. The chain stores only ciphertext — no
              validator, explorer, or competitor can read it.
            </p>
          </div>

          {error && (
            <p className="mt-4 inline-flex items-center gap-2 font-mono text-[12px] text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" /> {error}
            </p>
          )}

          <FHEStepper ctx={ctx} />

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!ctx.fheReady || step === 1 || step === 2 || ctx.role === 0}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-[13px] font-semibold text-background transition hover:bg-foreground/90 disabled:opacity-60"
            >
              {step === 1 || step === 2 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Encrypt & Submit
            </button>
            <button
              type="button"
              disabled={!ctx.address || ctx.facilityIds.length === 0}
              onClick={aggregate}
              className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-foreground/[0.04] px-6 py-3 text-[13px] font-semibold text-foreground transition hover:border-emerald disabled:opacity-60"
            >
              {aggTx.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Aggregate Total ({ctx.facilityIds.length})
            </button>
          </div>
          {aggHash && (
            <p className="mt-3 font-mono text-[11px] text-emerald">
              {aggTx.isSuccess ? "Aggregated ✓" : "Aggregation pending…"} · {shortHandle(aggHash)}
            </p>
          )}
        </form>

        <div className="space-y-6">
          <div className="rounded-2xl border border-foreground/10 bg-surface p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
              Submission Pipeline
            </p>
            <ol className="mt-5 space-y-3">
              {SUBMIT_STEPS.map((s, i) => {
                const done = step > i + 1 || (i === 3 && step === 4);
                const active = step === i + 1;
                return (
                  <li
                    key={s}
                    className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 transition ${
                      done
                        ? "border-emerald/40 bg-emerald/5"
                        : active
                          ? "border-foreground/25 bg-foreground/[0.04]"
                          : "border-foreground/10 bg-background"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full font-mono text-[10px] ${
                        done
                          ? "bg-emerald text-background"
                          : active
                            ? "bg-foreground text-background"
                            : "bg-foreground/10 text-foreground/45"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span className={`text-[13px] ${done || active ? "text-foreground" : "text-foreground/50"}`}>
                      {s}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="rounded-2xl border border-foreground/10 bg-surface p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
              On-chain trace
            </p>
            <div className="mt-4 space-y-3 rounded-lg border border-foreground/10 bg-background p-4 font-mono text-xs leading-relaxed text-foreground/70">
              <div>
                <div className="flex items-center gap-2 text-emerald">
                  <Hash className="h-3.5 w-3.5" /> tx
                </div>
                {hash ? (
                  <a
                    href={`https://sepolia.arbiscan.io/tx/${hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block break-all hover:text-emerald"
                  >
                    {hash}
                  </a>
                ) : (
                  <p className="mt-1 text-foreground/40">— no submission yet</p>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 text-emerald">
                  <Lock className="h-3.5 w-3.5" /> input type
                </div>
                <p className="mt-1">InEuint64 (encrypted)</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-emerald">
                  <Zap className="h-3.5 w-3.5" /> grants
                </div>
                <p className="mt-1">FHE.allowThis() · FHE.allowSender()</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-foreground/10 bg-surface p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
              Reported facilities
            </p>
            {ctx.facilityIds.length === 0 ? (
              <p className="mt-4 font-mono text-xs text-foreground/45">No facilities yet.</p>
            ) : (
              <ul className="mt-4 space-y-1 font-mono text-xs text-foreground/75">
                {ctx.facilityIds.map((id) => (
                  <FacilityRow key={String(id)} id={id} ctx={ctx} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* -------------------- Compliance Check -------------------- */

const CHECK_STEPS = [
  "FHE.lte(total, cap) — comparing ciphertexts on-chain…",
  "Allowing result handle to caller and company…",
  "Encrypted boolean stored in CapCheck.results…",
  "Result available · decrypt to view in your tab.",
];

function ComplianceCheck({ ctx }: { ctx: ReturnType<typeof useCovertMrv> }) {
  const [step, setStep] = useState(0);
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [decrypted, setDecrypted] = useState<null | boolean>(null);
  const [decrypting, setDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tx = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (tx.isLoading) setStep(2);
    if (tx.isSuccess) {
      setStep(4);
      ctx.refetch();
    }
  }, [tx.isLoading, tx.isSuccess, ctx]);

  async function run() {
    if (!ctx.address) return;
    setError(null);
    setDecrypted(null);
    setHash(undefined);
    setStep(1);
    try {
      const h = await ctx.checkCompliance(ctx.address as `0x${string}`);
      setHash(h);
    } catch (e) {
      setError((e as Error).message);
      setStep(0);
    }
  }

  async function decrypt() {
    if (!ctx.complianceHandle) return;
    setError(null);
    setDecrypting(true);
    try {
      const v = await ctx.decryptBool(ctx.complianceHandle);
      setDecrypted(v);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDecrypting(false);
    }
  }

  const settledStatus = ctx.settled?.[0];
  const settledValue = ctx.settled?.[1];

  return (
    <>
      <PageHeader
        index="02"
        title="Compliance Check"
        desc="Run an encrypted comparison between your aggregate emissions and the regulator's encrypted cap. The chain returns a boolean — never the values."
      />
      <div className="grid gap-6 p-10 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-foreground/10 bg-surface p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
            Verification Engine
          </p>

          <button
            onClick={run}
            disabled={step === 1 || step === 2 || !ctx.address}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-[13px] font-semibold text-background transition hover:bg-foreground/90 disabled:opacity-60"
          >
            {step === 1 || step === 2 ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {step === 4 ? "Re-run Compliance Check" : "Run Compliance Check"}
          </button>

          <FHEStepper ctx={ctx} />

          {error && (
            <p className="mt-4 inline-flex items-center gap-2 font-mono text-[12px] text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" /> {error}
            </p>
          )}

          <ol className="mt-7 space-y-3">
            {CHECK_STEPS.map((s, i) => {
              const isDone = step > i + 1 || (i === 3 && step === 4);
              const active = step === i + 1;
              return (
                <li
                  key={s}
                  className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 transition ${
                    isDone
                      ? "border-emerald/40 bg-emerald/5"
                      : active
                        ? "border-foreground/25 bg-foreground/[0.04]"
                        : "border-foreground/10 bg-background"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full font-mono text-[10px] ${
                      isDone
                        ? "bg-emerald text-background"
                        : active
                          ? "bg-foreground text-background"
                          : "bg-foreground/10 text-foreground/45"
                    }`}
                  >
                    {isDone ? "✓" : i + 1}
                  </span>
                  <span className={`text-[13px] ${isDone || active ? "text-foreground" : "text-foreground/50"}`}>
                    {s}
                  </span>
                </li>
              );
            })}
          </ol>

          {hash && (
            <p className="mt-5 break-all font-mono text-[11px] text-foreground/60">
              tx ·{" "}
              <a
                href={`https://sepolia.arbiscan.io/tx/${hash}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald hover:underline"
              >
                {hash}
              </a>
            </p>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-foreground/10 bg-surface p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
              Your Compliance Status
            </p>
            <div className="relative mt-6 flex flex-col items-center gap-3 overflow-hidden rounded-xl border border-foreground/10 bg-background p-10 text-center">
              <AnimatePresence mode="wait">
                {decrypted === null ? (
                  <motion.div
                    key="enc"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="flex flex-col items-center gap-3"
                  >
                    <Lock className="h-8 w-8 text-emerald" strokeWidth={1.4} />
                    <p className="font-display text-3xl font-normal tracking-tight">
                      <EncryptedNumber value="ENCRYPTED" decrypted={false} />
                    </p>
                    <p className="font-mono text-[11px] text-foreground/50">
                      {ctx.complianceHandle ? "ebool · ready to decrypt" : "no result yet — run check"}
                    </p>
                  </motion.div>
                ) : decrypted ? (
                  <motion.div
                    key="ok"
                    initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                    className="flex flex-col items-center gap-3"
                  >
                    <CheckCircle2 className="h-8 w-8 text-emerald" strokeWidth={1.6} />
                    <p className="font-display text-3xl font-normal tracking-tight text-emerald">
                      COMPLIANT
                    </p>
                    <p className="font-mono text-[11px] text-foreground/50">
                      aggregate ≤ cap
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="bad"
                    initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                    className="flex flex-col items-center gap-3"
                  >
                    <XCircle className="h-8 w-8 text-destructive" strokeWidth={1.6} />
                    <p className="font-display text-3xl font-normal tracking-tight text-destructive">
                      NON-COMPLIANT
                    </p>
                    <p className="font-mono text-[11px] text-foreground/50">
                      aggregate &gt; cap
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              disabled={!ctx.complianceHandle || decrypting}
              onClick={decrypt}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-foreground/25 bg-foreground/[0.04] px-6 py-3 text-[13px] font-semibold text-foreground transition hover:border-emerald hover:text-emerald disabled:opacity-50"
            >
              {decrypting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
              Decrypt My Status
            </button>

            <p className="mt-3 font-mono text-[11px] text-foreground/50">
              handle: {shortHandle(ctx.complianceHandle)}
            </p>
          </div>

          <div className="rounded-2xl border border-foreground/10 bg-surface p-7">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
              <Eye className="h-3.5 w-3.5 text-blue-info" /> Public settlement
            </div>
            <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/70">
              The regulator can decrypt the boolean result and publish it on-chain
              via <span className="font-mono text-emerald">FHE.publishDecryptResult</span>.
              Anyone may then read the boolean — values stay sealed forever.
            </p>
            <div className="mt-3">
              {settledStatus ? (
                settledValue ? (
                  <StatusPill kind="ok"><CheckCircle2 className="h-3 w-3" /> public · compliant</StatusPill>
                ) : (
                  <StatusPill kind="err"><XCircle className="h-3 w-3" /> public · non-compliant</StatusPill>
                )
              ) : (
                <StatusPill kind="info">awaiting regulator</StatusPill>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* -------------------- Audit Access -------------------- */

type Grant = {
  auditor: `0x${string}`;
  expiry: bigint;
  active: boolean;
};

function AuditAccess({ ctx }: { ctx: ReturnType<typeof useCovertMrv> }) {
  const [addr, setAddr] = useState("");
  const [hrs, setHrs] = useState("48");
  const [grants, setGrants] = useState<Grant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  // Locally track issued grants (chain doesn't expose enumeration). Persisted per-address.
  const storageKey = ctx.address ? `covertmrv.grants.${ctx.address.toLowerCase()}` : "";
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Array<{ auditor: string; expiry: string }>;
        setGrants(
          parsed.map((g) => ({
            auditor: g.auditor as `0x${string}`,
            expiry: BigInt(g.expiry),
            active: true,
          })),
        );
      }
    } catch {/* noop */}
  }, [storageKey]);

  function persist(next: Grant[]) {
    setGrants(next);
    if (!storageKey) return;
    localStorage.setItem(
      storageKey,
      JSON.stringify(next.map((g) => ({ auditor: g.auditor, expiry: g.expiry.toString() }))),
    );
  }

  async function grant(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isAddress(addr)) return setError("Invalid auditor address");
    const seconds = BigInt(Math.max(1, Math.floor(Number(hrs) * 3600)));
    try {
      setPending(true);
      await ctx.grantAuditAccess(addr as `0x${string}`, seconds);
      const expiry = BigInt(Math.floor(Date.now() / 1000)) + seconds;
      persist([
        { auditor: addr as `0x${string}`, expiry, active: true },
        ...grants.filter((g) => g.auditor.toLowerCase() !== addr.toLowerCase()),
      ]);
      setAddr("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }

  async function revoke(g: Grant) {
    try {
      await ctx.revokeAuditAccess(g.auditor);
      persist(grants.map((x) => (x.auditor === g.auditor ? { ...x, active: false } : x)));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <PageHeader
        index="03"
        title="Audit Access"
        desc="Issue time-bounded decrypt access to your aggregate emissions total. Auditors can verify quality. Access expires automatically — no manual revocation required."
      />
      <div className="grid gap-6 p-10 lg:grid-cols-[1fr_1.4fr]">
        <form
          onSubmit={grant}
          className="rounded-2xl border border-foreground/10 bg-surface p-8"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
            Grant Audit Access
          </p>
          <div className="mt-6 space-y-5">
            <Field label="Auditor Address">
              <input
                value={addr}
                onChange={(e) => setAddr(e.target.value)}
                placeholder="0x…"
                className="w-full rounded-lg border border-foreground/15 bg-background px-4 py-3 font-mono text-sm outline-none transition focus:border-emerald"
              />
            </Field>
            <Field label="Expiry Duration (hours)">
              <input
                type="number"
                value={hrs}
                onChange={(e) => setHrs(e.target.value)}
                className="w-full rounded-lg border border-foreground/15 bg-background px-4 py-3 font-mono text-sm outline-none transition focus:border-emerald"
              />
            </Field>
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-foreground/10 bg-background p-4">
            <Info className="mt-0.5 h-4 w-4 flex-none text-emerald" />
            <p className="text-[13px] leading-relaxed text-foreground/65">
              Your aggregate total handle is granted to the auditor. The auditor
              must hold an active grant <em>and</em> a CoFHE permit signed by you
              to decrypt it. Once the expiry passes the chain rejects further
              decryption requests.
            </p>
          </div>
          {error && (
            <p className="mt-3 font-mono text-[12px] text-destructive">{error}</p>
          )}
          <button
            type="submit"
            disabled={pending || !ctx.companyTotalHandle}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-[13px] font-semibold text-background transition hover:bg-foreground/90 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Issue Audit Permit
          </button>
          {!ctx.companyTotalHandle && (
            <p className="mt-3 font-mono text-[11px] text-amber-warn">
              Aggregate your facilities first — there is no encrypted total to share yet.
            </p>
          )}
        </form>

        <div className="rounded-2xl border border-foreground/10 bg-surface p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
            Active Grants
          </p>
          <div className="mt-5 overflow-hidden rounded-xl border border-foreground/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-background text-[11px] uppercase tracking-wider text-foreground/45">
                <tr>
                  <th className="px-4 py-3 font-mono font-normal">Auditor</th>
                  <th className="px-4 py-3 font-mono font-normal">Expiry</th>
                  <th className="px-4 py-3 font-mono font-normal">Status</th>
                  <th className="px-4 py-3 font-mono font-normal">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10 bg-surface">
                {grants.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center font-mono text-xs text-foreground/40">
                      No grants issued yet.
                    </td>
                  </tr>
                )}
                {grants.map((g) => {
                  const remaining = Number(g.expiry) - now;
                  const expired = remaining <= 0 || !g.active;
                  return (
                    <tr key={g.auditor + g.expiry.toString()}>
                      <td className="px-4 py-3 font-mono text-foreground/80">
                        {shortAddress(g.auditor, 5)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground/60">
                          <Clock className="h-3 w-3" /> {expired ? "—" : fmtCountdown(remaining)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {expired ? (
                          <StatusPill kind="warn">Expired</StatusPill>
                        ) : (
                          <StatusPill kind="ok">Active</StatusPill>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!expired ? (
                          <button
                            onClick={() => revoke(g)}
                            className="text-xs font-medium text-destructive hover:underline"
                          >
                            Revoke
                          </button>
                        ) : (
                          <span className="text-xs text-foreground/30">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

/* -------------------- Disclosure Console -------------------- */

type Handle = {
  id: string;
  type: string;
  handle: bigint;
  fheType: "uint64" | "bool";
};

function DisclosureConsole({ ctx }: { ctx: ReturnType<typeof useCovertMrv> }) {
  const [tab, setTab] = useState<"ciphertext" | "acl" | "decrypt">("ciphertext");
  const [decrypted, setDecrypted] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handles: Handle[] = useMemo(() => {
    const h: Handle[] = [];
    if (ctx.companyTotalHandle) {
      h.push({ id: "company_total", type: "company aggregate", handle: ctx.companyTotalHandle, fheType: "uint64" });
    }
    if (ctx.complianceHandle) {
      h.push({ id: "compliance_result", type: "compliance result", handle: ctx.complianceHandle, fheType: "bool" });
    }
    return h;
  }, [ctx.companyTotalHandle, ctx.complianceHandle]);

  async function doDecrypt(h: Handle) {
    setError(null);
    setPending(h.id);
    try {
      if (h.fheType === "uint64") {
        const v = await ctx.decryptUint64(h.handle);
        setDecrypted((d) => ({ ...d, [h.id]: fmtTonnes(v) }));
      } else {
        const v = await ctx.decryptBool(h.handle);
        setDecrypted((d) => ({ ...d, [h.id]: v ? "true (compliant)" : "false (non-compliant)" }));
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <PageHeader
        index="04"
        title="Disclosure Console"
        desc="Inspect every encrypted handle stored under your address. Review ACL grants by role. Decrypt only what you are authorized to see."
      />
      <div className="px-10">
        <div className="inline-flex rounded-full border border-foreground/15 bg-surface p-1">
          {(
            [
              ["ciphertext", "Ciphertext"],
              ["acl", "Access Control"],
              ["decrypt", "Decrypt"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-full px-5 py-2 text-[13px] font-medium transition ${
                tab === id
                  ? "bg-foreground text-background"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-10 pt-6">
        <FHEStepper ctx={ctx} />
        {error && (
          <p className="mb-4 mt-4 font-mono text-[12px] text-destructive">{error}</p>
        )}
        {handles.length === 0 ? (
          <div className="rounded-2xl border border-foreground/10 bg-surface p-10 text-center">
            <Lock className="mx-auto h-8 w-8 text-foreground/30" />
            <p className="mt-3 font-mono text-sm text-foreground/55">
              No encrypted handles yet — submit emissions and run aggregate to populate this view.
            </p>
          </div>
        ) : tab === "ciphertext" ? (
          <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="bg-background text-[11px] uppercase tracking-wider text-foreground/45">
                <tr>
                  <th className="px-5 py-3 font-mono font-normal">Handle ID</th>
                  <th className="px-5 py-3 font-mono font-normal">Data Type</th>
                  <th className="px-5 py-3 font-mono font-normal">FHE Type</th>
                  <th className="px-5 py-3 font-mono font-normal">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                {handles.map((h) => (
                  <tr key={h.id} className="hover:bg-background/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5 text-emerald" />
                        <span className="font-mono text-foreground/80">{shortHandle(h.handle)}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(`0x${h.handle.toString(16)}`)}
                          className="text-foreground/40 hover:text-foreground"
                          title="Copy"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-foreground/70">{h.type}</td>
                    <td className="px-5 py-4 font-mono text-foreground/70">e{h.fheType}</td>
                    <td className="px-5 py-4">
                      <CipherChip value={`e${h.fheType}`} label="ENCRYPTED" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tab === "acl" ? (
          <div className="grid gap-4">
            {handles.map((h) => (
              <div
                key={h.id}
                className="rounded-2xl border border-foreground/10 bg-surface p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm text-foreground/85">{shortHandle(h.handle)}</p>
                    <p className="mt-1 font-mono text-xs text-foreground/45">{h.type}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <RoleBadge color="emerald" label="Company" sub="permanent" />
                  <RoleBadge color="amber" label="Auditor" sub="timed grants" />
                  {h.id === "compliance_result" && (
                    <RoleBadge color="blue" label="Regulator" sub="boolean only" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {handles.map((h) => {
              const value = decrypted[h.id];
              return (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-2xl border border-foreground/10 bg-surface p-6"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-foreground/85">{shortHandle(h.handle)}</p>
                    <p className="mt-1 font-mono text-xs text-foreground/45">{h.type}</p>
                    <div className="mt-3">
                      {value ? (
                        <span
                          className="font-display text-2xl font-normal tracking-tight text-emerald"
                          style={{ animation: "pulse 700ms ease-out" }}
                        >
                          {value}
                        </span>
                      ) : (
                        <CipherChip value={`e${h.fheType}::sealed`} />
                      )}
                    </div>
                  </div>
                  <button
                    disabled={pending === h.id}
                    onClick={() => doDecrypt(h)}
                    className="inline-flex flex-none items-center gap-2 rounded-full border border-foreground/25 bg-foreground/[0.04] px-4 py-2 text-[12px] font-semibold text-foreground transition hover:border-emerald hover:text-emerald disabled:opacity-60"
                  >
                    {pending === h.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlock className="h-3.5 w-3.5" />}
                    {value ? "Decrypted" : "Decrypt"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

/* -------------------- Helpers -------------------- */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/55">
        {label}
      </span>
      {children}
    </label>
  );
}

function RoleBadge({
  color,
  label,
  sub,
}: {
  color: "emerald" | "amber" | "blue";
  label: string;
  sub: string;
}) {
  const map = {
    emerald: "border-emerald/40 bg-emerald/10 text-emerald",
    amber: "border-amber-warn/40 bg-amber-warn/10 text-amber-warn",
    blue: "border-blue-info/40 bg-blue-info/10 text-blue-info",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] ${map[color]}`}
    >
      <span className="font-semibold uppercase tracking-wider">{label}</span>
      <span className="opacity-70">· {sub}</span>
    </span>
  );
}
