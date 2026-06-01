import { Clock, Info, Lock } from "lucide-react";
import type { ActionGate } from "@/lib/compliance-journey";

export function ActionHint({ gate }: { gate: ActionGate }) {
  const Icon =
    gate.badge === "waiting" ? Clock : gate.badge === "ready" ? Info : Lock;

  return (
    <p className="mt-2.5 flex items-start gap-2 text-[12.5px] leading-relaxed text-foreground/60">
      <Icon
        className={`mt-0.5 h-3.5 w-3.5 flex-none ${
          gate.badge === "waiting" ? "text-sky-400" : "text-foreground/45"
        }`}
      />
      <span>
        <span className="font-medium text-foreground/75">{gate.reason}</span>
        {gate.hint ? <> {gate.hint}</> : null}
      </span>
    </p>
  );
}
