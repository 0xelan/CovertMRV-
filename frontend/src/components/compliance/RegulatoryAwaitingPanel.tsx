import { motion } from "framer-motion";
import { Building2, Shield } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

export function RegulatoryAwaitingPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="relative overflow-hidden rounded-xl border border-sky-500/25 bg-gradient-to-br from-sky-500/[0.08] to-transparent p-6"
    >
      <motion.div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sky-400/10 blur-2xl"
        animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative flex gap-4">
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10">
          <Building2 className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-400/90">
            Regulatory review
          </p>
          <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-foreground">
            Awaiting Regulatory Configuration
          </h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/72">
            Your emissions have been securely submitted and aggregated. Before compliance
            verification can begin, the regulator must assign an encrypted emissions cap
            and authorize compliance checks for your organization.
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-[12px] text-foreground/55">
            <Shield className="h-3.5 w-3.5 text-emerald" />
            This waiting period is normal—it protects cap confidentiality.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
