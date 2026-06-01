/** Explicit shape — do not use `ReturnType<typeof useCovertMrv>` (causes circular init in production chunks). */
export type ComplianceJourneyCtx = {
  role: number;
  facilityCount: number;
  facilityIds: readonly bigint[];
  hasAggregated: boolean;
  hasCapSet: boolean;
  hasComplianceResult: boolean;
  settled?: readonly [settled: boolean, result: boolean];
  canAggregate?: boolean;
};

export type JourneyStepId =
  | "registered"
  | "submitted"
  | "aggregated"
  | "regulator_cap"
  | "compliance_check"
  | "decrypt"
  | "certificate";

export type JourneyStepStatus = "complete" | "current" | "waiting" | "upcoming";

export type JourneyStep = {
  id: JourneyStepId;
  label: string;
  status: JourneyStepStatus;
  detail?: string;
};

export type ComplianceJourney = {
  steps: JourneyStep[];
  currentId: JourneyStepId;
  progressPercent: number;
  showRegulatoryPanel: boolean;
  privacyMessage: string;
};

type Ctx = ComplianceJourneyCtx;

const STEP_DEFS: { id: JourneyStepId; label: string }[] = [
  { id: "registered", label: "Registered as Emitter" },
  { id: "submitted", label: "Emissions Submitted" },
  { id: "aggregated", label: "Total Aggregated" },
  { id: "regulator_cap", label: "Waiting for Regulator Cap" },
  { id: "compliance_check", label: "Waiting for Compliance Check" },
  { id: "decrypt", label: "Ready to Decrypt" },
  { id: "certificate", label: "Certificate Eligible" },
];

function milestoneComplete(ctx: Ctx, id: JourneyStepId): boolean {
  const submitted = ctx.facilityCount > 0 || ctx.facilityIds.length > 0;
  const settled = ctx.settled?.[0] ?? false;

  switch (id) {
    case "registered":
      return ctx.role > 0;
    case "submitted":
      return submitted;
    case "aggregated":
      return ctx.hasAggregated;
    case "regulator_cap":
      return ctx.hasCapSet;
    case "compliance_check":
      return ctx.hasComplianceResult;
    case "decrypt":
      return ctx.hasComplianceResult && settled;
    case "certificate":
      return settled;
    default:
      return false;
  }
}

function resolveCurrentId(ctx: Ctx): JourneyStepId {
  if (ctx.role === 0) return "registered";
  if (ctx.facilityCount === 0 && ctx.facilityIds.length === 0) return "submitted";
  if (!ctx.hasAggregated) return "aggregated";
  if (!ctx.hasCapSet) return "regulator_cap";
  if (!ctx.hasComplianceResult) return "compliance_check";
  if (!(ctx.settled?.[0] ?? false)) return "decrypt";
  return "certificate";
}

export function computeComplianceJourney(ctx: Ctx): ComplianceJourney {
  const currentId = resolveCurrentId(ctx);
  const currentIndex = STEP_DEFS.findIndex((s) => s.id === currentId);

  const steps: JourneyStep[] = STEP_DEFS.map((def, index) => {
    const done = milestoneComplete(ctx, def.id);
    let status: JourneyStepStatus;
    if (done) status = "complete";
    else if (index === currentIndex) status = "current";
    else if (index < currentIndex) status = "complete";
    else if (index === currentIndex + 1) status = "waiting";
    else status = "upcoming";

    let detail: string | undefined;
    if (status === "current") {
      switch (def.id) {
        case "registered":
          detail = "Complete one-time registration to begin reporting.";
          break;
        case "submitted":
          detail = "Submit at least one facility emissions report for this year.";
          break;
        case "aggregated":
          detail = "Combine facility reports into an encrypted company total.";
          break;
        case "regulator_cap":
          detail = "Your regulator assigns an encrypted cap and authorizes verification.";
          break;
        case "compliance_check":
          detail = "Run the encrypted comparison when your cap is in place.";
          break;
        case "decrypt":
          detail = "View your private pass/fail result, then await public settlement.";
          break;
        case "certificate":
          detail = "Download your certificate after regulatory settlement.";
          break;
      }
    }

    return { ...def, status, detail };
  });

  const completedCount = steps.filter((s) => s.status === "complete").length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return {
    steps,
    currentId,
    progressPercent,
    showRegulatoryPanel: ctx.hasAggregated && !ctx.hasCapSet,
    privacyMessage:
      "This is a privacy-preserving regulatory workflow. Encrypted data stays sealed; only authorized steps unlock specific results.",
  };
}

export type GateAction =
  | "run_compliance_check"
  | "decrypt_compliance"
  | "download_certificate"
  | "grant_audit"
  | "issue_credits"
  | "decrypt_credit_balance"
  | "retire_credits"
  | "supply_submit_factor"
  | "supply_compute"
  | "supply_classify"
  | "supply_threshold";

export type ActionGate = {
  allowed: boolean;
  reason: string;
  hint?: string;
  badge?: "ready" | "waiting" | "blocked";
};

export function getActionGate(
  ctx: Ctx,
  action: GateAction,
  extras?: {
    txBusy?: boolean;
    awaitingAcl?: boolean;
    decrypting?: boolean;
    hasBalance?: boolean;
    hasCompany?: boolean;
    supplyRole?: number;
    hasSku?: boolean;
    hasSuppliers?: boolean;
    hasThreshold?: boolean;
    hasRetireAmount?: boolean;
  },
): ActionGate {
  const e = extras ?? {};

  switch (action) {
    case "run_compliance_check": {
      if (ctx.role === 0) {
        return {
          allowed: false,
          reason: "Register as an emitter before running compliance verification.",
          badge: "blocked",
        };
      }
      if (!ctx.hasAggregated) {
        return {
          allowed: false,
          reason: "Submit and aggregate your emissions before compliance verification.",
          hint: "Go to Submit Emissions, then aggregate your facility total.",
          badge: "blocked",
        };
      }
      if (!ctx.hasCapSet) {
        return {
          allowed: false,
          reason: "Unavailable until an encrypted cap is assigned by the regulator.",
          hint: "Your organization is queued for regulatory configuration—this is expected.",
          badge: "waiting",
        };
      }
      if (e.txBusy) {
        return {
          allowed: false,
          reason: "Compliance verification is in progress. Confirm the transaction in your wallet.",
          badge: "waiting",
        };
      }
      return { allowed: true, reason: "", badge: "ready" };
    }

    case "decrypt_compliance": {
      if (!ctx.hasComplianceResult) {
        return {
          allowed: false,
          reason: "Available after a compliance result has been generated.",
          hint: "Run Compliance Check first, then return here to view your status.",
          badge: "blocked",
        };
      }
      if (e.awaitingAcl) {
        return {
          allowed: false,
          reason: "Securing decrypt access for your wallet. This usually takes a few seconds.",
          badge: "waiting",
        };
      }
      if (e.txBusy) {
        return {
          allowed: false,
          reason: "Wait for the compliance check to finish confirming on-chain.",
          badge: "waiting",
        };
      }
      if (e.decrypting) {
        return {
          allowed: false,
          reason: "Decrypt in progress—approve the privacy permit in your wallet if prompted.",
          badge: "waiting",
        };
      }
      return { allowed: true, reason: "", badge: "ready" };
    }

    case "download_certificate": {
      if (!ctx.hasComplianceResult) {
        return {
          allowed: false,
          reason: "Available after compliance verification and settlement.",
          hint: "Complete a compliance check, then ask your regulator to publish settlement.",
          badge: "blocked",
        };
      }
      if (!(ctx.settled?.[0] ?? false)) {
        return {
          allowed: false,
          reason: "Available after compliance verification and settlement.",
          hint: "Your private result is ready; the regulator will publish the official certificate next.",
          badge: "waiting",
        };
      }
      return { allowed: true, reason: "", badge: "ready" };
    }

    case "grant_audit": {
      if (!ctx.hasAggregated) {
        return {
          allowed: false,
          reason: "Available after your encrypted company total has been aggregated.",
          hint: "Submit emissions and run Aggregate Total on the Submit Emissions tab.",
          badge: "blocked",
        };
      }
      return { allowed: true, reason: "", badge: "ready" };
    }

    case "issue_credits": {
      if (!ctx.hasComplianceResult) {
        return {
          allowed: false,
          reason: "Credits are issued only after a compliance check exists for that company and year.",
          badge: "blocked",
        };
      }
      if (!e.hasCompany) {
        return {
          allowed: false,
          reason: "Enter a valid company address to issue credits.",
          badge: "blocked",
        };
      }
      return { allowed: true, reason: "", badge: "ready" };
    }

    case "decrypt_credit_balance": {
      if (!e.hasBalance) {
        return {
          allowed: false,
          reason: "Available after encrypted credits have been issued to your wallet.",
          badge: "blocked",
        };
      }
      return { allowed: true, reason: "", badge: "ready" };
    }

    case "retire_credits": {
      if (!e.hasBalance) {
        return {
          allowed: false,
          reason: "You need an encrypted credit balance before retirement.",
          badge: "blocked",
        };
      }
      if (!e.hasRetireAmount) {
        return {
          allowed: false,
          reason: "Enter an amount to retire.",
          badge: "blocked",
        };
      }
      return { allowed: true, reason: "", badge: "ready" };
    }

    case "supply_submit_factor": {
      if ((e.supplyRole ?? 0) === 0) {
        return {
          allowed: false,
          reason: "Register on the supply-chain registry before submitting factors.",
          badge: "blocked",
        };
      }
      if (!e.hasSku) {
        return {
          allowed: false,
          reason: "Enter a product SKU and intensity value.",
          badge: "blocked",
        };
      }
      return { allowed: true, reason: "", badge: "ready" };
    }

    case "supply_compute":
    case "supply_classify":
    case "supply_threshold": {
      if ((e.supplyRole ?? 0) === 0) {
        return {
          allowed: false,
          reason: "Complete supply-chain registration first.",
          badge: "blocked",
        };
      }
      if (!e.hasSku || !e.hasSuppliers) {
        return {
          allowed: false,
          reason: "Enter a product SKU and at least one supplier address.",
          badge: "blocked",
        };
      }
      if (action === "supply_threshold" && !e.hasThreshold) {
        return {
          allowed: false,
          reason: "Enter a threshold value for the double-blind check.",
          badge: "blocked",
        };
      }
      return { allowed: true, reason: "", badge: "ready" };
    }

    default:
      return { allowed: true, reason: "" };
  }
}
