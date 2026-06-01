import { motion } from "framer-motion";
import { Check, Clock, Loader2 } from "lucide-react";
import {
  computeComplianceJourney,
  type ComplianceJourneyCtx,
  type JourneyStepStatus,
} from "@/lib/compliance-journey";

const EASE = [0.16, 1, 0.3, 1] as const;

type Props = {
  ctx: ComplianceJourneyCtx;
  compact?: boolean;
};

function StepIcon({ status }: { status: JourneyStepStatus }) {
  if (status === "complete") {
    return (
      <motion.span
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald text-background"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
      </motion.span>
    );
  }
  if (status === "current") {
    return (
      <motion.span
        animate={{ boxShadow: ["0 0 0 0 rgba(16,185,129,0.4)", "0 0 0 8px rgba(16,185,129,0)", "0 0 0 0 rgba(16,185,129,0.4)"] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-emerald bg-emerald/15"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald" />
      </motion.span>
    );
  }
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-foreground/15 bg-foreground/[0.04]">
      <Clock className="h-3.5 w-3.5 text-foreground/35" />
    </span>
  );
}

export function ComplianceJourneyCard({ ctx, compact = false }: Props) {
  const journey = computeComplianceJourney(ctx);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className={`rounded-2xl border border-foreground/10 bg-surface ${compact ? "p-5" : "p-7"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45">
            Compliance journey
          </p>
          <p className="mt-1 text-[13px] text-foreground/60">{journey.privacyMessage}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-foreground/10">
            <motion.div
              className="h-full rounded-full bg-emerald"
              initial={{ width: 0 }}
              animate={{ width: `${journey.progressPercent}%` }}
              transition={{ duration: 0.8, ease: EASE }}
            />
          </div>
          <span className="font-mono text-[11px] text-foreground/50">{journey.progressPercent}%</span>
        </div>
      </div>

      <ol className={`mt-6 space-y-0 ${compact ? "grid gap-2 sm:grid-cols-2" : ""}`}>
        {journey.steps.map((step, i) => {
          const isCurrent = step.status === "current";
          const isComplete = step.status === "complete";
          return (
            <motion.li
              key={step.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35, ease: EASE }}
              className={`relative flex gap-3 ${compact ? "rounded-lg border px-3 py-2.5" : "py-2"} ${
                isCurrent
                  ? "border-emerald/35 bg-emerald/[0.06]"
                  : isComplete
                    ? "border-transparent"
                    : compact
                      ? "border-foreground/10 bg-background/40"
                      : ""
              }`}
            >
              {!compact && i < journey.steps.length - 1 ? (
                <span
                  className="absolute left-[13px] top-9 bottom-0 w-px bg-foreground/10"
                  aria-hidden
                />
              ) : null}
              <StepIcon status={step.status} />
              <div className="min-w-0 flex-1 pb-1">
                <p
                  className={`text-[13px] font-medium ${
                    isCurrent ? "text-emerald" : isComplete ? "text-foreground" : "text-foreground/50"
                  }`}
                >
                  {!isComplete && !isCurrent ? "⏳ " : ""}
                  {step.label}
                </p>
                {isCurrent && step.detail ? (
                  <p className="mt-0.5 text-[12px] leading-snug text-foreground/55">{step.detail}</p>
                ) : null}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </motion.div>
  );
}
