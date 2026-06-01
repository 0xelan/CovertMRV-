import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Award,
  Download,
  Layers,
  Plus,
  Trash2,
  PackagePlus,
} from "lucide-react";
import { z } from "zod";
import { isAddress } from "viem";
import { Logo } from "@/components/site/Logo";
import { EncryptedNumber, SpotlightCard } from "@/components/site/motion-primitives";
import { ConnectWallet } from "@/components/shared/ConnectWallet";
import { ChainGuard } from "@/components/shared/ChainGuard";
import { useCovertMrv, useWaitForTransactionReceipt } from "@/hooks/useCovertMrv";
import { useSupplyChain } from "@/hooks/useSupplyChain";
import { useCarbonCredits } from "@/hooks/useCarbonCredits";
import { useAccount, useChainId, usePublicClient } from "wagmi";
import {
  CAP_REGISTRY_ADDRESS,
  CAP_CHECK_ADDRESS,
  COMPLIANCE_CERTIFICATE_ADDRESS,
  SUPPLIER_ATTEST_ADDRESS,
  PRODUCT_FOOTPRINT_ADDRESS,
  CCO2_ADDRESS,
  CREDIT_ISSUER_ADDRESS,
  CREDIT_RETIRE_ADDRESS,
} from "@/config/contracts";
import { fmtTonnes, shortAddress, shortHandle, fmtCountdown } from "@/lib/format";
import { isInitializedCtHandle } from "@/lib/ct-handle";
import { computeComplianceJourney, getActionGate } from "@/lib/compliance-journey";
import { translateUserError } from "@/lib/user-facing-errors";
import { ComplianceJourneyCard } from "@/components/compliance/ComplianceJourneyCard";
import { RegulatoryAwaitingPanel } from "@/components/compliance/RegulatoryAwaitingPanel";
import { GatedAction } from "@/components/compliance/GatedAction";
import { TooltipProvider } from "@/components/ui/tooltip";

const EASE = [0.16, 1, 0.3, 1] as const;

const dashboardSearchSchema = z.object({
  view: z
    .enum(["overview", "submit", "check", "audit", "console", "certificate", "supply-chain", "credits"])
    .catch("overview"),
});

export const Route = createFileRoute("/dashboard")({
  validateSearch: (raw: Record<string, unknown>) => dashboardSearchSchema.parse(raw),
  component: Dashboard,
});

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "submit", label: "Submit Emissions", icon: Upload },
  { id: "check", label: "Compliance Check", icon: ShieldCheck },
  { id: "audit", label: "Audit Access", icon: KeyRound },
  { id: "console", label: "Disclosure Console", icon: Eye },
  { id: "certificate", label: "Certificate", icon: Award },
  { id: "supply-chain", label: "Supply Chain", icon: Layers },
  { id: "credits", label: "Carbon Credits", icon: Zap },
] as const;

const ROLE_LABELS = ["None", "Emitter", "Auditor", "Regulator", "Admin"] as const;

function Dashboard() {
  const { view } = Route.useSearch();
  const navigate = useNavigate({ from: "/dashboard" });
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [reportingYear, setReportingYear] = useState(new Date().getFullYear());
  const ctx = useCovertMrv(reportingYear);

  return (
    <TooltipProvider delayDuration={300}>
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
          {view === "overview" && (
            <Overview ctx={ctx} reportingYear={reportingYear} setReportingYear={setReportingYear} />
          )}
          {view === "submit" && (
            <SubmitEmissions
              ctx={ctx}
              reportingYear={reportingYear}
              setReportingYear={setReportingYear}
            />
          )}
          {view === "check" && (
            <ComplianceCheck
              ctx={ctx}
              reportingYear={reportingYear}
              setReportingYear={setReportingYear}
            />
          )}
          {view === "audit" && (
            <AuditAccess
              ctx={ctx}
              reportingYear={reportingYear}
              setReportingYear={setReportingYear}
            />
          )}
          {view === "console" && <DisclosureConsole ctx={ctx} />}
          {view === "certificate" && <CertificateView ctx={ctx} />}
          {view === "supply-chain" && <SupplyChainView ctx={ctx} />}
          {view === "credits" && <CarbonCreditsView ctx={ctx} />}
        </main>
      </div>
    </div>
    </TooltipProvider>
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

function EmitterRegistrationCard({ ctx }: { ctx: ReturnType<typeof useCovertMrv> }) {
  const [pending, setPending] = useState(false);
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | null>(null);
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });
  const handledSuccess = useRef(false);

  useEffect(() => {
    if (!isSuccess || handledSuccess.current) return;
    handledSuccess.current = true;
    ctx.refetch();
    setPending(false);
  }, [isSuccess, ctx.refetch]);

  if (ctx.role > 0) return null;

  async function register() {
    setError(null);
    handledSuccess.current = false;
    try {
      setPending(true);
      const h = await ctx.registerAsEmitter();
      setHash(h);
    } catch (e) {
      setPending(false);
      setError((e as Error).message);
    }
  }

  return (
    <motion.div
      className="px-10 pt-2"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <SpotlightCard className="relative overflow-hidden rounded-2xl border border-blue-info/35 bg-gradient-to-br from-blue-info/[0.12] via-surface to-emerald/[0.06] p-8 md:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-info/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald/10 blur-3xl" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-info/40 bg-blue-info/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-blue-info">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-info" />
              Required · one-time setup
            </div>
            <div className="mt-5 flex items-start gap-4">
              <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl border border-blue-info/30 bg-blue-info/10">
                <UserCheck className="h-7 w-7 text-blue-info" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-display text-2xl font-normal tracking-tight md:text-3xl">
                  Register as an Emitter
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-foreground/70">
                  Your wallet is connected, but it is not yet authorized to submit encrypted
                  emissions on CapRegistry. This one on-chain registration unlocks the full
                  compliance console: submit, aggregate, check, audit grants, and disclosure.
                </p>
              </div>
            </div>

            <ol className="mt-8 space-y-3">
              {[
                "Confirm the transaction in your wallet (CapRegistry.registerAsEmitter).",
                "Submit encrypted facility emissions from the Submit Emissions tab.",
                "Aggregate your total, then run an encrypted compliance check against your cap.",
              ].map((step, i) => (
                <li
                  key={step}
                  className="flex items-start gap-3 rounded-lg border border-foreground/10 bg-background/60 px-4 py-3 text-[13px] text-foreground/75"
                >
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald/15 font-mono text-[10px] font-semibold text-emerald">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            {error && (
              <p className="mt-4 inline-flex items-center gap-2 font-mono text-[12px] text-destructive">
                <AlertTriangle className="h-3.5 w-3.5" />
                {error}
              </p>
            )}
            {hash && (
              <p className="mt-4 font-mono text-[11px] text-foreground/50">
                {isSuccess ? "Registered ✓" : isLoading ? "Confirming…" : "Submitted"} ·{" "}
                <a
                  href={`https://sepolia.arbiscan.io/tx/${hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald underline"
                >
                  {shortHandle(hash)}
                </a>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 lg:min-w-[220px]">
            <button
              type="button"
              disabled={pending || isLoading}
              onClick={() => void register()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-[15px] font-semibold text-background shadow-lg transition hover:bg-foreground/90 disabled:opacity-60"
            >
              {pending || isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <UserCheck className="h-5 w-5" />
              )}
              Register as Emitter
            </button>
            <p className="text-center font-mono text-[10px] uppercase tracking-wider text-foreground/45">
              Gas ~150k · Arb Sepolia
            </p>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
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

type YearProps = {
  reportingYear: number;
  setReportingYear: (y: number) => void;
};

function Overview({
  ctx,
  reportingYear,
  setReportingYear,
}: { ctx: ReturnType<typeof useCovertMrv> } & YearProps) {
  const facilityCount = ctx.facilityCount || ctx.facilityIds.length;
  const settledStatus = ctx.settled?.[0];
  const settledValue = ctx.settled?.[1];
  const contractCount = 8;
  return (
    <>
      <PageHeader
        index="00"
        title="Overview"
        desc={`Compliance posture for reporting year ${reportingYear}. All values remain encrypted on-chain; only authorized roles can decrypt.`}
      />
      <div className="px-10 pb-2">
        <label className="font-mono text-[11px] uppercase tracking-widest text-foreground/45">
          Reporting year
        </label>
        <input
          type="number"
          min={2020}
          max={2100}
          value={reportingYear}
          onChange={(e) => setReportingYear(Number(e.target.value) || reportingYear)}
          className="mt-2 w-32 rounded-lg border border-foreground/15 bg-background px-3 py-2 font-mono text-sm outline-none focus:border-emerald"
        />
      </div>
      {ctx.role === 0 && <EmitterRegistrationCard ctx={ctx} />}
      {ctx.role > 0 && (
        <div className="px-10 pb-2">
          <ComplianceJourneyCard ctx={ctx} compact />
        </div>
      )}
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

          <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-foreground/10 bg-foreground/10 md:grid-cols-4">
            {[
              { l: "Facilities", v: String(facilityCount) },
              { l: "Aggregate Total", v: ctx.companyTotalHandle ? "encrypted" : "—" },
              { l: "Certificates", v: ctx.certificateBalance > 0n ? String(ctx.certificateBalance) : "0" },
              { l: "Contracts", v: String(contractCount) },
              { l: "Last Check", v: ctx.lastCheckedAt ? new Date(Number(ctx.lastCheckedAt) * 1000).toLocaleString([], { month: "short", day: "numeric" }) : "—" },
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
                  {ctx.hasComplianceResult ? "ENCRYPTED" : "NOT RUN"}
                </p>
                <p className="font-mono relative text-[11px] text-foreground/50">
                  {ctx.hasComplianceResult ? "ebool · awaiting decryption" : "no result yet"}
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

      {ctx.isOwner && <AdminPanel ctx={ctx} reportingYear={reportingYear} />}

      <div className="px-10 pb-10">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
            Deployed contracts
          </p>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-foreground/45">
            <Activity className="h-3 w-3 text-emerald" /> arbitrum sepolia
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <ContractCard label="CapRegistry" address={CAP_REGISTRY_ADDRESS} />
          <ContractCard label="CapCheck" address={CAP_CHECK_ADDRESS} />
          <ContractCard label="ComplianceCertificate" address={COMPLIANCE_CERTIFICATE_ADDRESS} />
          <ContractCard label="SupplierAttest" address={SUPPLIER_ATTEST_ADDRESS} />
          <ContractCard label="ProductFootprint" address={PRODUCT_FOOTPRINT_ADDRESS} />
          <ContractCard label="cCO2" address={CCO2_ADDRESS} />
          <ContractCard label="CreditIssuer" address={CREDIT_ISSUER_ADDRESS} />
          <ContractCard label="CreditRetire" address={CREDIT_RETIRE_ADDRESS} />
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

function AdminPanel({
  ctx,
  reportingYear,
}: {
  ctx: ReturnType<typeof useCovertMrv>;
  reportingYear: number;
}) {
  const [target, setTarget] = useState("");
  const [cap, setCap] = useState("");
  const [adminYear, setAdminYear] = useState(String(reportingYear));
  const [pending, setPending] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  async function doSetCap(e: React.FormEvent) {
    e.preventDefault();
    if (!isAddress(target)) return setMsg({ tone: "err", text: "Invalid address" });
    if (!cap) return;
    const year = Number(adminYear);
    if (!year) return setMsg({ tone: "err", text: "Invalid reporting year" });
    try {
      setPending("cap");
      setMsg(null);
      const hash = await ctx.setCap(target as `0x${string}`, BigInt(cap), year);
      setMsg({ tone: "ok", text: `Cap submitted: ${shortHandle(hash)}` });
    } catch (e) {
      setMsg({ tone: "err", text: (e as Error).message });
    } finally {
      setPending(null);
    }
  }

  async function doGrantCheck() {
    if (!isAddress(target)) return setMsg({ tone: "err", text: "Invalid address" });
    const year = Number(adminYear);
    if (!year) return setMsg({ tone: "err", text: "Invalid reporting year" });
    try {
      setPending("grant");
      setMsg(null);
      const hash = await ctx.grantCheckAccess(target as `0x${string}`, year);
      setMsg({ tone: "ok", text: `Granted CapCheck access: ${shortHandle(hash)}` });
    } catch (e) {
      setMsg({ tone: "err", text: (e as Error).message });
    } finally {
      setPending(null);
    }
  }

  async function doSettle() {
    if (!isAddress(target)) return setMsg({ tone: "err", text: "Invalid address" });
    const year = Number(adminYear);
    if (!year) return setMsg({ tone: "err", text: "Invalid reporting year" });
    try {
      setPending("settle");
      setMsg(null);
      const hash = await ctx.settleCompliance(target as `0x${string}`, year);
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
        <form onSubmit={doSetCap} className="mt-5 grid gap-4 md:grid-cols-[1.2fr_0.7fr_1fr_auto]">
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Company address (0x…)"
            className="rounded-lg border border-foreground/15 bg-background px-4 py-2.5 font-mono text-[12.5px] outline-none focus:border-emerald"
          />
          <input
            value={adminYear}
            onChange={(e) => setAdminYear(e.target.value)}
            type="number"
            placeholder="Year"
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
          Regulator cap and grant are scoped to the reporting year. Run{" "}
          <code className="rounded bg-foreground/10 px-1 font-mono text-[11px]">
            aggregateTotal(company, year)
          </code>{" "}
          for that year before grant. Settlement decrypts the target company&apos;s
          compliance handle for the selected year (owner wallet required).
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

function SubmitEmissions({
  ctx,
  reportingYear,
  setReportingYear,
}: { ctx: ReturnType<typeof useCovertMrv> } & YearProps) {
  const [facility, setFacility] = useState("");
  const [emissions, setEmissions] = useState("");
  const reportingYearStr = String(reportingYear);
  const [scope, setScope] = useState<0 | 1 | 2>(0);
  const [step, setStep] = useState(0);
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [aggHash, setAggHash] = useState<`0x${string}` | undefined>();
  // Batch submit state
  const [showBatch, setShowBatch] = useState(false);
  const [batchRows, setBatchRows] = useState<{ facilityId: string; tonnes: string }[]>([
    { facilityId: "", tonnes: "" },
    { facilityId: "", tonnes: "" },
  ]);
  const [batchHash, setBatchHash] = useState<`0x${string}` | undefined>();
  const [batchError, setBatchError] = useState<string | null>(null);
  const [batchPending, setBatchPending] = useState(false);

  const tx = useWaitForTransactionReceipt({ hash });
  const aggTx = useWaitForTransactionReceipt({ hash: aggHash });
  const batchTx = useWaitForTransactionReceipt({ hash: batchHash });
  const handledSubmitSuccess = useRef(false);
  const [aggregatePrompt, setAggregatePrompt] = useState(false);
  const aggregateInFlight = useRef(false);
  const submitInFlight = useRef(false);

  const SCOPE_OPTIONS = [
    { value: 0, label: "Scope 1 — Direct", desc: "Combustion, process, fugitive" },
    { value: 1, label: "Scope 2 — Indirect Energy", desc: "Purchased electricity, heat, steam" },
    { value: 2, label: "Scope 3 — Value Chain", desc: "Travel, supply chain, waste" },
  ] as const;

  useEffect(() => {
    if (tx.isLoading) setStep(2);
  }, [tx.isLoading]);

  useEffect(() => {
    if (!tx.isSuccess || handledSubmitSuccess.current) return;
    handledSubmitSuccess.current = true;
    setStep(4);
    ctx.refetch();
    setAggregatePrompt(true);
  }, [tx.isSuccess, ctx.refetch]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitInFlight.current || step === 1 || step === 2) return;
    submitInFlight.current = true;
    setError(null);
    setHash(undefined);
    setAggregatePrompt(false);
    handledSubmitSuccess.current = false;
    setStep(1);
    try {
      if (!ctx.fheReady) throw new Error("FHE client not ready — wait a moment then retry");
      const h = await ctx.submitEmissions(BigInt(facility), BigInt(emissions), reportingYear, scope);
      setHash(h);
    } catch (e) {
      setError((e as Error).message);
      setStep(0);
    } finally {
      submitInFlight.current = false;
    }
  }

  async function aggregate() {
    if (!ctx.address || aggregateInFlight.current || aggTx.isLoading) return;
    aggregateInFlight.current = true;
    setError(null);
    setAggregatePrompt(false);
    try {
      const h = await ctx.aggregateTotal(ctx.address as `0x${string}`, reportingYear);
      setAggHash(h);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      aggregateInFlight.current = false;
    }
  }

  async function submitBatch(e: React.FormEvent) {
    e.preventDefault();
    setBatchError(null);
    setBatchHash(undefined);
    const validRows = batchRows.filter((r) => r.facilityId && r.tonnes);
    if (validRows.length === 0) return setBatchError("Add at least one facility row.");
    setBatchPending(true);
    try {
      if (!ctx.fheReady) throw new Error("FHE client not ready — wait a moment then retry");
      const fids = validRows.map((r) => BigInt(r.facilityId));
      const amounts = validRows.map((r) => BigInt(r.tonnes));
      const h = await ctx.batchSubmitEmissions(fids, amounts, reportingYear, scope);
      setBatchHash(h);
    } catch (e) {
      setBatchError((e as Error).message);
    } finally {
      setBatchPending(false);
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
        <div className="space-y-6">
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
            <Field label="Reporting Year">
              <input
                type="number"
                required
                min={2020}
                max={2100}
                value={reportingYearStr}
                onChange={(e) => setReportingYear(Number(e.target.value) || reportingYear)}
                placeholder="e.g. 2025"
                className="w-full rounded-lg border border-foreground/15 bg-background px-4 py-3 font-mono text-sm outline-none transition focus:border-emerald"
              />
            </Field>
            <Field label="ISO 14064 Scope">
              <div className="grid grid-cols-3 gap-2">
                {SCOPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setScope(opt.value)}
                    className={`flex flex-col items-start gap-1 rounded-lg border px-3 py-3 text-left transition ${
                      scope === opt.value
                        ? "border-emerald/60 bg-emerald/[0.08] text-foreground"
                        : "border-foreground/15 bg-background text-foreground/60 hover:border-foreground/30"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase">
                      <Layers className="h-3 w-3" />
                      {opt.label.split(" — ")[0]}
                    </span>
                    <span className="font-mono text-[10px] leading-tight opacity-70">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
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

          {aggregatePrompt && !ctx.hasAggregated && (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-500/35 bg-amber-500/5 p-4">
              <Zap className="mt-0.5 h-4 w-4 flex-none text-amber-400" />
              <div className="flex-1 text-[13px] text-foreground/75">
                <span className="font-semibold text-amber-400">Next step (separate transaction): </span>
                Emissions are saved on-chain. Click{" "}
                <strong>Aggregate Total</strong> when you are ready — this is a second wallet
                confirmation and is never sent automatically.
              </div>
            </div>
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
              disabled={
                !ctx.address ||
                !ctx.canAggregate ||
                ctx.role === 0 ||
                aggTx.isLoading
              }
              title={
                ctx.role === 0
                  ? "Register as emitter first"
                  : !ctx.canAggregate
                    ? `Submit at least one facility for ${reportingYear} on-chain`
                    : undefined
              }
              onClick={aggregate}
              className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-foreground/[0.04] px-6 py-3 text-[13px] font-semibold text-foreground transition hover:border-emerald disabled:opacity-60"
            >
              {aggTx.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Aggregate Total ({ctx.facilityCount || ctx.facilityIds.length})
            </button>
          </div>
          {aggHash && (
            <p className="mt-3 font-mono text-[11px] text-emerald">
              {aggTx.isSuccess ? "Aggregated ✓" : "Aggregation pending…"} · {shortHandle(aggHash)}
            </p>
          )}
        </form>

        {/* ── Batch Submit ─────────────────────────────────────── */}
        <div className="rounded-2xl border border-foreground/10 bg-surface p-8">
          <button
            type="button"
            onClick={() => setShowBatch((v) => !v)}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <PackagePlus className="h-4 w-4 text-emerald" strokeWidth={1.7} />
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60">
                Batch Submit — multiple facilities in one transaction
              </p>
            </div>
            <ChevronRight
              className={`h-4 w-4 text-foreground/40 transition-transform ${showBatch ? "rotate-90" : ""}`}
            />
          </button>

          {showBatch && (
            <form onSubmit={submitBatch} className="mt-6 space-y-4">
              <p className="text-[12.5px] leading-relaxed text-foreground/60">
                Submit emissions for multiple facilities in a single transaction.
                Shares the <strong>Reporting Year</strong> and <strong>Scope</strong> from the single-facility form above.
                Gas estimate: ~{(1_200_000 + batchRows.filter((r) => r.facilityId && r.tonnes).length * 200_000).toLocaleString()} gas.
              </p>

              {batchRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
                  <Field label={`Facility ID #${idx + 1}`}>
                    <input
                      type="number"
                      value={row.facilityId}
                      onChange={(e) =>
                        setBatchRows((rows) =>
                          rows.map((r, i) => (i === idx ? { ...r, facilityId: e.target.value } : r))
                        )
                      }
                      placeholder="e.g. 1"
                      className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2.5 font-mono text-sm outline-none transition focus:border-emerald"
                    />
                  </Field>
                  <Field label="Tonnes CO₂e">
                    <input
                      type="number"
                      value={row.tonnes}
                      onChange={(e) =>
                        setBatchRows((rows) =>
                          rows.map((r, i) => (i === idx ? { ...r, tonnes: e.target.value } : r))
                        )
                      }
                      placeholder="e.g. 5000"
                      className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2.5 font-mono text-sm outline-none transition focus:border-emerald"
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={() => setBatchRows((rows) => rows.filter((_, i) => i !== idx))}
                    disabled={batchRows.length <= 1}
                    className="mb-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-lg border border-foreground/15 bg-background text-foreground/40 transition hover:border-destructive/40 hover:text-destructive disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setBatchRows((rows) => [...rows, { facilityId: "", tonnes: "" }])}
                className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-3 py-1.5 text-[12px] font-medium text-foreground/60 transition hover:border-emerald hover:text-emerald"
              >
                <Plus className="h-3.5 w-3.5" /> Add facility
              </button>

              {batchError && (
                <p className="inline-flex items-center gap-2 font-mono text-[12px] text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" /> {batchError}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={batchPending || !ctx.fheReady || ctx.role === 0}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-[13px] font-semibold text-background transition hover:bg-foreground/90 disabled:opacity-60"
                >
                  {batchPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />}
                  Encrypt & Batch Submit ({batchRows.filter((r) => r.facilityId && r.tonnes).length} facilities)
                </button>
                {batchHash && (
                  <p className="font-mono text-[11px] text-emerald">
                    {batchTx.isSuccess ? "Batch confirmed ✓" : "Confirming…"} ·{" "}
                    <a
                      href={`https://sepolia.arbiscan.io/tx/${batchHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {shortHandle(batchHash)}
                    </a>
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
        </div>{/* end left column wrapper */}

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
  "Comparing your encrypted total against the regulatory cap…",
  "Securing the verification result for your organization…",
  "Recording the privacy-preserving compliance outcome…",
  "Result ready — you may view your status below.",
];

function ComplianceCheck({
  ctx,
  reportingYear,
  setReportingYear,
}: { ctx: ReturnType<typeof useCovertMrv> } & YearProps) {
  const publicClient = usePublicClient();
  const [step, setStep] = useState(0);
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [decrypted, setDecrypted] = useState<null | boolean>(null);
  const [decrypting, setDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aggregating, setAggregating] = useState(false);
  const tx = useWaitForTransactionReceipt({ hash });
  const handledCheckSuccess = useRef(false);
  const aggregateInFlight = useRef(false);
  const decryptInFlight = useRef(false);

  useEffect(() => {
    ctx.refetch();
  }, [ctx.refetch, reportingYear]);

  useEffect(() => {
    if (tx.isLoading) setStep(2);
  }, [tx.isLoading]);

  useEffect(() => {
    if (!tx.isSuccess || handledCheckSuccess.current) return;
    handledCheckSuccess.current = true;
    setStep(3);
    const timer = window.setTimeout(() => {
      ctx.refetch();
      setStep(4);
    }, 3_000);
    return () => window.clearTimeout(timer);
  }, [tx.isSuccess, ctx.refetch]);

  // After a new check tx, wait for ACL propagation before decrypt (step 4).
  // Existing on-chain results (page load / return visit) skip this gate.
  const awaitingAclSync = !!hash && step > 0 && step < 4;
  const journey = useMemo(() => computeComplianceJourney(ctx), [ctx]);
  const runGate = getActionGate(ctx, "run_compliance_check", {
    txBusy: step === 1 || step === 2,
  });
  const decryptGate = getActionGate(ctx, "decrypt_compliance", {
    awaitingAcl: awaitingAclSync,
    txBusy: tx.isLoading,
    decrypting,
  });
  const noTotal = !ctx.hasAggregated;
  const showRegulatory = journey.showRegulatoryPanel;

  const yearInput = (
    <div className="flex items-center gap-3">
      <label className="font-mono text-[11px] uppercase tracking-widest text-foreground/45">Reporting Year</label>
      <input
        type="number"
        min={2020}
        max={2100}
        value={reportingYear}
        onChange={(e) => setReportingYear(Number(e.target.value) || reportingYear)}
        className="w-28 rounded-lg border border-foreground/15 bg-background px-3 py-2 font-mono text-sm outline-none focus:border-emerald"
      />
    </div>
  );

  async function doAggregate() {
    if (
      !ctx.address ||
      aggregating ||
      aggregateInFlight.current ||
      ctx.hasAggregated ||
      !ctx.canAggregate ||
      ctx.role === 0
    )
      return;
    aggregateInFlight.current = true;
    setError(null);
    setAggregating(true);
    try {
      const h = await ctx.aggregateTotal(ctx.address as `0x${string}`, reportingYear);
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: h });
      }
      ctx.refetch();
    } catch (e) {
      setError(translateUserError(e));
    } finally {
      setAggregating(false);
      aggregateInFlight.current = false;
    }
  }

  async function run() {
    if (!ctx.address) return;
    setError(null);
    setDecrypted(null);
    setHash(undefined);
    handledCheckSuccess.current = false;
    setStep(1);
    try {
      const h = await ctx.checkCompliance(ctx.address as `0x${string}`, reportingYear);
      setHash(h);
    } catch (e) {
      setError(translateUserError(e));
      setStep(0);
    }
  }

  async function decrypt() {
    if (decryptInFlight.current || decrypting) return;
    if (!decryptGate.allowed) {
      setError(decryptGate.reason);
      return;
    }
    decryptInFlight.current = true;
    setError(null);
    setDecrypting(true);
    try {
      const v = await ctx.decryptBool(ctx.complianceHandle);
      setDecrypted(v);
    } catch (e) {
      setError(translateUserError(e));
    } finally {
      setDecrypting(false);
      decryptInFlight.current = false;
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
      <div className="px-10 pb-4">
        <ComplianceJourneyCard ctx={ctx} />
      </div>
      <div className="grid gap-6 p-10 pt-0 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-foreground/10 bg-surface p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
            Verification Engine
          </p>

          {showRegulatory && (
            <div className="mt-5">
              <RegulatoryAwaitingPanel />
            </div>
          )}

          {noTotal && !showRegulatory && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-lg border border-amber-500/25 bg-amber-500/5 p-4"
            >
              <p className="text-[13px] text-foreground/75">
                <span className="font-semibold text-amber-400">Next step: </span>
                Aggregate your facility reports into a single encrypted company total.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  from="/dashboard"
                  to="."
                  search={{ view: "submit" }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-foreground/20 px-3 py-1.5 text-[11px] font-semibold transition hover:border-emerald"
                >
                  Go to Submit Emissions
                </Link>
                <button
                  onClick={doAggregate}
                  disabled={aggregating || !ctx.canAggregate}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 px-3 py-1 text-[11px] font-semibold text-amber-400 transition hover:bg-amber-500/10 disabled:opacity-50"
                >
                  {aggregating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                  Aggregate here
                </button>
              </div>
            </motion.div>
          )}

          <div className="mt-5">
          <GatedAction gate={runGate}>
            <button
              onClick={run}
              disabled={!runGate.allowed || !ctx.address}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-[13px] font-semibold text-background transition hover:bg-foreground/90 disabled:opacity-60"
            >
              {step === 1 || step === 2 ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {step === 4 ? "Re-run Compliance Check" : "Run Compliance Check"}
            </button>
          </GatedAction>
          </div>
          <div className="mt-3">{yearInput}</div>

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
                      {ctx.hasComplianceResult
                        ? awaitingAclSync
                          ? "Securing private access…"
                          : "Private result ready"
                        : "Awaiting compliance verification"}
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

            <div className="mt-5">
              <GatedAction gate={decryptGate}>
                <button
                  disabled={!decryptGate.allowed}
                  onClick={decrypt}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-foreground/25 bg-foreground/[0.04] px-6 py-3 text-[13px] font-semibold text-foreground transition hover:border-emerald hover:text-emerald disabled:opacity-50"
                >
                  {decrypting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
                  Decrypt My Status
                </button>
              </GatedAction>
            </div>
          </div>

          <div className="rounded-2xl border border-foreground/10 bg-surface p-7">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
              <Eye className="h-3.5 w-3.5 text-blue-info" /> Public settlement
            </div>
            <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/70">
              After you view your private result, your regulator may publish an official
              settlement. Only the pass/fail outcome becomes public—your emissions and cap
              values remain encrypted.
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

function AuditAccess({
  ctx,
  reportingYear,
}: { ctx: ReturnType<typeof useCovertMrv> } & YearProps) {
  const publicClient = usePublicClient();
  const auditGate = getActionGate(ctx, "grant_audit");
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

  // Load issued grants from localStorage, then verify on-chain status.
  const storageKey = ctx.address ? `covertmrv.grants.${ctx.address.toLowerCase()}` : "";
  useEffect(() => {
    if (!storageKey || !ctx.address) return;
    (async () => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Array<{ auditor: string; expiry: string }>;
        const verified: Grant[] = [];
        for (const g of parsed) {
          const auditor = g.auditor as `0x${string}`;
          let active = false;
          try {
            active = await ctx.checkAuditActive(ctx.address!, auditor);
          } catch {
            active = false;
          }
          verified.push({
            auditor,
            expiry: BigInt(g.expiry),
            active,
          });
        }
        setGrants(verified);
      } catch {
        /* noop */
      }
    })();
  }, [storageKey, ctx.address, ctx.checkAuditActive, ctx.refetch]);

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
      const hash = await ctx.grantAuditAccess(addr as `0x${string}`, seconds, reportingYear);
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      let active = true;
      if (ctx.address) {
        active = await ctx.checkAuditActive(ctx.address, addr as `0x${string}`);
      }
      const expiry = BigInt(Math.floor(Date.now() / 1000)) + seconds;
      persist([
        { auditor: addr as `0x${string}`, expiry, active },
        ...grants.filter((g) => g.auditor.toLowerCase() !== addr.toLowerCase()),
      ]);
      setAddr("");
    } catch (e) {
      setError(translateUserError(e));
    } finally {
      setPending(false);
    }
  }

  async function revoke(g: Grant) {
    try {
      await ctx.revokeAuditAccess(g.auditor);
      persist(grants.map((x) => (x.auditor === g.auditor ? { ...x, active: false } : x)));
    } catch (e) {
      setError(translateUserError(e));
    }
  }

  return (
    <>
      <PageHeader
        index="03"
        title="Audit Access"
        desc={`Grant auditors decrypt access to your ${reportingYear} aggregate total. Application UI tracks expiry; CoFHE FHE.allow grants remain on-chain until handles rotate.`}
      />
      <AuditTimer grants={grants} now={now} />
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
              to decrypt it. UI expiry is application-level; CoFHE{" "}
              <code className="font-mono text-[10px]">FHE.allow</code> grants persist until
              handles are rotated. Revoke here to mark the grant inactive in-app.
              decryption requests.
            </p>
          </div>
          {error && (
            <p className="mt-3 font-mono text-[12px] text-destructive">{error}</p>
          )}
          <div className="mt-6">
            <GatedAction gate={auditGate}>
              <button
                type="submit"
                disabled={pending || !auditGate.allowed}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-[13px] font-semibold text-background transition hover:bg-foreground/90 disabled:opacity-60"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Issue Audit Permit
              </button>
            </GatedAction>
          </div>
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
    if (isInitializedCtHandle(ctx.companyTotalHandle)) {
      h.push({ id: "company_total", type: "company aggregate", handle: ctx.companyTotalHandle, fheType: "uint64" });
    }
    if (isInitializedCtHandle(ctx.complianceHandle)) {
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

/* -------------------- Certificate View -------------------- */

function CertificateView({ ctx }: { ctx: ReturnType<typeof useCovertMrv> }) {
  const [year, setYear] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    ctx.refetch();
  }, [ctx.refetch]);

  const settled = ctx.settled?.[0] ?? false;
  const compliant = ctx.settled?.[1] ?? false;
  const hasCert = settled && ctx.certificateBalance > 0n;
  const certGate = getActionGate(ctx, "download_certificate");

  function downloadPdf() {
    const company = ctx.address ?? "0x???";
    const lines = [
      "=================================================",
      "   COVERTMRV COMPLIANCE CERTIFICATE",
      "=================================================",
      "",
      `  Company:          ${company}`,
      `  Reporting Year:   ${year}`,
      `  Status:           ${compliant ? "COMPLIANT ✓" : "NON-COMPLIANT ✗"}`,
      `  Issued at:        ${new Date().toUTCString()}`,
      `  Chain:            Arbitrum Sepolia (421614)`,
      `  CapCheck:         ${CAP_CHECK_ADDRESS}`,
      "",
      "  FHE Privacy Proof:",
      "  - Raw facility data: ENCRYPTED (never revealed)",
      "  - Aggregate total:   ENCRYPTED (never revealed)",
      "  - Regulatory cap:    ENCRYPTED (never revealed)",
      "  - Compliance result: ebool (only pass/fail visible)",
      "",
      "  Powered by CoFHE · Fhenix Protocol",
      "=================================================",
    ].join("\n");

    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CovertMRV-Certificate-${year}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        index="05"
        title="Compliance Certificate"
        desc="Download your FHE-verified compliance certificate. Minted as an ERC-721 NFT on-chain when your compliance status is settled by the regulator."
      />
      <div className="p-10">
        <div className="mb-6 flex items-center gap-4">
          <label className="font-mono text-[11px] uppercase tracking-widest text-foreground/45">
            Reporting Year
          </label>
          <input
            type="number"
            min={2020}
            max={2100}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-28 rounded-lg border border-foreground/15 bg-background px-3 py-2 font-mono text-sm outline-none focus:border-emerald"
          />
        </div>

        <div className="mb-6">
          <ComplianceJourneyCard ctx={ctx} compact />
        </div>

        {!settled && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-amber-warn/25 bg-amber-warn/5 p-8"
          >
            <div className="flex flex-col items-center text-center">
              <Clock className="h-10 w-10 text-amber-warn/70" />
              <p className="mt-4 text-[15px] font-semibold text-foreground">Certificate not yet available</p>
              <p className="mt-2 max-w-md text-[13px] leading-relaxed text-foreground/65">
                {certGate.reason}
              </p>
              {certGate.hint && (
                <p className="mt-2 text-[12px] text-foreground/50">{certGate.hint}</p>
              )}
              <Link
                from="/dashboard"
                to="."
                search={{ view: "check" }}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-foreground/20 px-5 py-2.5 text-[12px] font-semibold transition hover:border-emerald"
              >
                Open Compliance Check
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        )}

        {settled && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
            {/* Certificate card */}
            <div
              className={`relative overflow-hidden rounded-2xl border p-8 ${
                compliant
                  ? "border-emerald/40 bg-emerald/5"
                  : "border-destructive/40 bg-destructive/5"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/45">
                    CovertMRV · Arbitrum Sepolia
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-tight">
                    {compliant ? "COMPLIANT" : "NON-COMPLIANT"}
                  </p>
                  <p className="mt-1 font-mono text-sm text-foreground/60">
                    Reporting Year {year}
                  </p>
                </div>
                <Award
                  className={`h-10 w-10 ${compliant ? "text-emerald" : "text-destructive/60"}`}
                />
              </div>

              <div className="mt-6 space-y-2 rounded-xl border border-foreground/10 bg-background p-4">
                <Row label="Company" value={shortAddress(ctx.address, 8)} />
                <Row label="Result" value={compliant ? "ebool: true ✓" : "ebool: false ✗"} />
                <Row label="CapCheck" value={shortAddress(CAP_CHECK_ADDRESS, 8)} />
                <Row label="FHE Privacy" value="All inputs encrypted" />
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-background px-3 py-1.5 font-mono text-[10px] text-foreground/50">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${hasCert ? "bg-emerald" : "bg-foreground/30"}`}
                />
                {hasCert
                  ? `NFT minted · ${ctx.certificateBalance} cert(s) owned`
                  : "NFT not yet minted"}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-foreground/10 bg-surface p-7">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
                  Download Certificate
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-foreground/65">
                  Export a signed compliance statement as a portable text file.
                  The certificate encodes your company address, reporting year,
                  FHE contract references, and compliance status.
                </p>
                <button
                  onClick={downloadPdf}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-[13px] font-semibold text-background transition hover:bg-foreground/90"
                >
                  <Download className="h-4 w-4" />
                  Download Certificate (.txt)
                </button>
              </div>

              <div className="rounded-2xl border border-foreground/10 bg-surface p-7">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
                  FHE Privacy Proof
                </p>
                <ul className="mt-4 space-y-2 text-[12px] text-foreground/65">
                  {[
                    ["Raw facility data", "Encrypted — never on-chain in plaintext"],
                    ["Aggregate total", "Encrypted — even regulator cannot read"],
                    ["Regulatory cap", "Encrypted — set by regulator privately"],
                    ["Compliance result", "ebool only — pass/fail, nothing else"],
                  ].map(([k, v]) => (
                    <li key={k} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-none text-emerald" />
                      <span>
                        <span className="font-semibold text-foreground/80">{k}:</span> {v}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[12px]">
      <span className="font-mono text-foreground/45">{label}</span>
      <span className="font-mono text-foreground/75 truncate max-w-[180px]">{value}</span>
    </div>
  );
}

/* -------------------- Audit Timer -------------------- */

function AuditTimer({
  grants,
  now,
}: {
  grants: { auditor: `0x${string}`; expiry: bigint; active: boolean }[];
  now: number;
}) {
  const activeGrants = grants.filter((g) => g.active && Number(g.expiry) > now);
  if (activeGrants.length === 0) return null;

  const nearest = activeGrants.reduce((a, b) =>
    Number(a.expiry) < Number(b.expiry) ? a : b,
  );
  const remaining = Number(nearest.expiry) - now;

  return (
    <div className="flex items-center gap-4 border-b border-emerald/20 bg-emerald/5 px-10 py-3">
      <Clock className="h-4 w-4 flex-none text-emerald" />
      <p className="font-mono text-[12px]">
        <span className="text-foreground/60">Active audit grant to </span>
        <span className="font-semibold text-emerald">{shortAddress(nearest.auditor, 4)}</span>
        <span className="text-foreground/60"> expires in </span>
        <span className="font-semibold text-emerald">{fmtCountdown(remaining)}</span>
      </p>
    </div>
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

/* -------------------- Supply Chain -------------------- */

function SupplyChainView({ ctx }: { ctx: ReturnType<typeof useCovertMrv> }) {
  const sc = useSupplyChain();
  const publicClient = usePublicClient();
  const [sku, setSku] = useState("");
  const [factor, setFactor] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [suppliers, setSuppliers] = useState("");
  const [threshold, setThreshold] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const supplierList = useMemo(() => {
    return suppliers
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter((s) => isAddress(s)) as `0x${string}`[];
  }, [suppliers]);

  const submitGate = getActionGate(ctx, "supply_submit_factor", {
    supplyRole: sc.role,
    hasSku: !!sku && !!factor,
  });
  const computeGate = getActionGate(ctx, "supply_compute", {
    supplyRole: sc.role,
    hasSku: !!sku,
    hasSuppliers: supplierList.length > 0,
  });
  const classifyGate = getActionGate(ctx, "supply_classify", {
    supplyRole: sc.role,
    hasSku: !!sku,
    hasSuppliers: supplierList.length > 0,
  });
  const thresholdGate = getActionGate(ctx, "supply_threshold", {
    supplyRole: sc.role,
    hasSku: !!sku,
    hasSuppliers: supplierList.length > 0,
    hasThreshold: !!threshold,
  });

  async function run(action: () => Promise<`0x${string}`>, label: string) {
    try {
      setPending(label);
      setMsg(null);
      const h = await action();
      setTxHash(h);
      setMsg({ tone: "ok", text: `${label} completed successfully.` });
    } catch (e) {
      setMsg({ tone: "err", text: translateUserError(e) });
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <PageHeader
        index="06"
        title="Supply Chain"
        desc="Submit encrypted supplier intensity factors, compute multi-supplier footprint totals, and classify bands — without revealing individual supplier data."
      />
      <div className="grid gap-6 p-10 lg:grid-cols-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!sku || !factor) return;
            void run(
              () => sc.submitFactor(sku, BigInt(factor), Number(year)),
              "submitFactor",
            );
          }}
          className="rounded-2xl border border-foreground/10 bg-surface p-8 space-y-5"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
            Submit Supplier Factor
          </p>
          <Field label="Product SKU">
            <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="widget-x" className="w-full rounded-lg border border-foreground/15 bg-background px-4 py-3 font-mono text-sm outline-none focus:border-emerald" />
          </Field>
          <Field label="Intensity (tCO₂e per unit)">
            <input value={factor} onChange={(e) => setFactor(e.target.value)} placeholder="e.g. 24" className="w-full rounded-lg border border-foreground/15 bg-background px-4 py-3 font-mono text-sm outline-none focus:border-emerald" />
          </Field>
          <Field label="Reporting Year">
            <input value={year} onChange={(e) => setYear(e.target.value)} className="w-full rounded-lg border border-foreground/15 bg-background px-4 py-3 font-mono text-sm outline-none focus:border-emerald" />
          </Field>
          {sc.role === 0 && (
            <button
              type="button"
              onClick={async () => {
                try {
                  setPending("register");
                  const h = await sc.registerAsEmitter();
                  if (publicClient) {
                    await publicClient.waitForTransactionReceipt({ hash: h });
                  }
                  await sc.refetchRole();
                  setMsg({ tone: "ok", text: "Registered on SupplierAttest." });
                } catch (e) {
                  setMsg({ tone: "err", text: (e as Error).message });
                } finally {
                  setPending(null);
                }
              }}
              className="text-[12px] text-blue-info underline"
            >
              Register as Emitter on SupplierAttest first
            </button>
          )}
          <GatedAction gate={submitGate}>
            <button
              type="submit"
              disabled={!!pending || sc.fheWorking || !submitGate.allowed}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-[13px] font-semibold text-background disabled:opacity-60"
            >
              {pending === "submitFactor" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Submit Factor
            </button>
          </GatedAction>
        </form>

        <div className="rounded-2xl border border-foreground/10 bg-surface p-8 space-y-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">
            Compute Footprint
          </p>
          <Field label="Product SKU">
            <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="widget-x" className="w-full rounded-lg border border-foreground/15 bg-background px-4 py-3 font-mono text-sm outline-none focus:border-emerald" />
          </Field>
          <Field label="Supplier Addresses (comma-separated)">
            <textarea value={suppliers} onChange={(e) => setSuppliers(e.target.value)} placeholder="0x..., 0x..." rows={3} className="w-full rounded-lg border border-foreground/15 bg-background px-4 py-3 font-mono text-sm outline-none focus:border-emerald" />
          </Field>
          <div className="flex flex-wrap gap-3">
            <GatedAction gate={computeGate} showHint={false}>
              <button
                type="button"
                disabled={!!pending || !computeGate.allowed}
                onClick={() => void run(() => sc.computeFootprint(sku, supplierList), "computeFootprint")}
                className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-5 py-2.5 text-[12px] font-semibold disabled:opacity-60"
              >
                Compute Total
              </button>
            </GatedAction>
            <GatedAction gate={classifyGate} showHint={false}>
              <button
                type="button"
                disabled={!!pending || !classifyGate.allowed}
                onClick={() => void run(() => sc.classifyBand(sku, supplierList), "classifyBand")}
                className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-5 py-2.5 text-[12px] font-semibold disabled:opacity-60"
              >
                Classify Band
              </button>
            </GatedAction>
          </div>
          {(!computeGate.allowed && computeGate.reason) && (
            <p className="text-[12px] text-foreground/55">{computeGate.reason}</p>
          )}
          <Field label="Threshold (tCO₂e) for double-blind check">
            <input value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="e.g. 500" className="w-full rounded-lg border border-foreground/15 bg-background px-4 py-3 font-mono text-sm outline-none focus:border-emerald" />
          </Field>
          <GatedAction gate={thresholdGate}>
            <button
              type="button"
              disabled={!!pending || !thresholdGate.allowed}
              onClick={() =>
                void run(
                  () => sc.checkThreshold(sku, supplierList, BigInt(threshold)),
                  "checkThreshold",
                )
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-[13px] font-semibold text-background disabled:opacity-60"
            >
              Check Threshold
            </button>
          </GatedAction>
        </div>
      </div>
      {msg && (
        <p className={`px-10 pb-6 font-mono text-[12px] ${msg.tone === "ok" ? "text-emerald" : "text-destructive"}`}>
          {msg.text}
          {txHash && msg.tone === "ok" && (
            <a href={`https://sepolia.arbiscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" className="ml-2 underline">
              Arbiscan
            </a>
          )}
        </p>
      )}
    </>
  );
}

/* -------------------- Carbon Credits -------------------- */

function CarbonCreditsView({ ctx }: { ctx: ReturnType<typeof useCovertMrv> }) {
  const credits = useCarbonCredits();
  const publicClient = usePublicClient();
  const [company, setCompany] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [retireAmount, setRetireAmount] = useState("");
  const [decryptedBal, setDecryptedBal] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const issueGate = useMemo(
    () => getActionGate(ctx, "issue_credits", { hasCompany: isAddress(company) }),
    [ctx, company],
  );
  const decryptBalGate = useMemo(
    () => getActionGate(ctx, "decrypt_credit_balance", { hasBalance: credits.hasBalance }),
    [ctx, credits.hasBalance],
  );
  const retireGate = useMemo(
    () =>
      getActionGate(ctx, "retire_credits", {
        hasBalance: credits.hasBalance,
        hasRetireAmount: !!retireAmount,
      }),
    [ctx, credits.hasBalance, retireAmount],
  );

  return (
    <>
      <PageHeader
        index="07"
        title="Carbon Credits"
        desc="FHERC20 cCO2 encrypted carbon credit token. Compliant companies receive credits via FHE.select conditional minting. Retire credits with encrypted receipts."
      />
      <div className="px-10 pb-4">
        <ComplianceJourneyCard ctx={ctx} compact />
      </div>
      <div className="grid gap-6 p-10 pt-0 lg:grid-cols-3">
        <div className="rounded-2xl border border-foreground/10 bg-surface p-8 space-y-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">Issue Credits</p>
          <Field label="Company Address">
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="0x…" className="w-full rounded-lg border border-foreground/15 bg-background px-4 py-3 font-mono text-sm outline-none focus:border-emerald" />
          </Field>
          <Field label="Reporting Year">
            <input value={year} onChange={(e) => setYear(e.target.value)} className="w-full rounded-lg border border-foreground/15 bg-background px-4 py-3 font-mono text-sm outline-none focus:border-emerald" />
          </Field>
          <GatedAction gate={issueGate}>
            <button
              type="button"
              disabled={!!pending || !issueGate.allowed}
              onClick={async () => {
                try {
                  setPending("issue");
                  setMsg(null);
                  const h = await credits.issueCredits(company as `0x${string}`, Number(year));
                  if (publicClient) {
                    await publicClient.waitForTransactionReceipt({ hash: h });
                  }
                  setTxHash(h);
                  setMsg({ tone: "ok", text: "Credits issued successfully." });
                  await credits.refetchBalance();
                } catch (e) {
                  const m = translateUserError(e);
                  if (m.includes("already issued")) {
                    setMsg({ tone: "ok", text: m });
                  } else {
                    setMsg({ tone: "err", text: m });
                  }
                } finally {
                  setPending(null);
                }
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-[13px] font-semibold text-background disabled:opacity-60"
            >
              {pending === "issue" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Issue Credits
            </button>
          </GatedAction>
        </div>

        <div className="rounded-2xl border border-foreground/10 bg-surface p-8 space-y-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">Your Balance</p>
          <p className="font-display text-3xl">{credits.hasBalance ? "encrypted" : "—"}</p>
          <p className="font-mono text-[11px] text-foreground/45">Indicator: {String(credits.balanceIndicator)}</p>
          <GatedAction gate={decryptBalGate}>
            <button
              type="button"
              disabled={!!pending || !decryptBalGate.allowed}
              onClick={async () => {
                try {
                  setPending("decrypt");
                  const v = await credits.decryptBalance();
                  setDecryptedBal(v.toString());
                } catch (e) {
                  setMsg({ tone: "err", text: translateUserError(e) });
                } finally {
                  setPending(null);
                }
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald/40 px-6 py-3 text-[13px] font-semibold text-emerald disabled:opacity-60"
            >
              {pending === "decrypt" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
              Decrypt Balance
            </button>
          </GatedAction>
          {decryptedBal && (
            <p className="font-mono text-[12px] text-emerald">Decrypted: {decryptedBal} base units</p>
          )}
        </div>

        <div className="rounded-2xl border border-foreground/10 bg-surface p-8 space-y-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/45">Retire Credits</p>
          <Field label="Amount (base units)">
            <input value={retireAmount} onChange={(e) => setRetireAmount(e.target.value)} placeholder="e.g. 1000000000000000000" className="w-full rounded-lg border border-foreground/15 bg-background px-4 py-3 font-mono text-sm outline-none focus:border-emerald" />
          </Field>
          {credits.role === 0 && (
            <button type="button" onClick={() => void credits.registerAsEmitter()} className="text-[12px] text-blue-info underline">
              Register as Emitter first
            </button>
          )}
          <GatedAction gate={retireGate}>
            <button
              type="button"
              disabled={!!pending || !retireGate.allowed}
              onClick={async () => {
                try {
                  setPending("retire");
                  setMsg(null);
                  const { hash } = await credits.retireCredits(BigInt(retireAmount), Number(year));
                  setTxHash(hash);
                  setMsg({ tone: "ok", text: "Credits retired successfully." });
                  credits.refetchBalance();
                } catch (e) {
                  setMsg({ tone: "err", text: translateUserError(e) });
                } finally {
                  setPending(null);
                }
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-[13px] font-semibold text-background disabled:opacity-60"
            >
              {pending === "retire" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Retire Credits
            </button>
          </GatedAction>
        </div>
      </div>
      {msg && (
        <p className={`px-10 pb-6 font-mono text-[12px] ${msg.tone === "ok" ? "text-emerald" : "text-destructive"}`}>
          {msg.text}
          {txHash && msg.tone === "ok" && (
            <a href={`https://sepolia.arbiscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" className="ml-2 underline">
              Arbiscan
            </a>
          )}
        </p>
      )}
    </>
  );
}
