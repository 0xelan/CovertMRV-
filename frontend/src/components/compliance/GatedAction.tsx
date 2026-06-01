import { cloneElement, isValidElement, type ReactElement } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ActionGate } from "@/lib/compliance-journey";
import { ActionHint } from "./ActionHint";

type Props = {
  gate: ActionGate;
  children: ReactElement;
  showHint?: boolean;
};

export function GatedAction({ gate, children, showHint = true }: Props) {
  const child = gate.allowed
    ? children
    : (
        <span className="inline-flex w-full flex-col">
          {cloneDisabled(child)}
        </span>
      );

  const wrapped = (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={gate.allowed ? "inline-flex" : "inline-flex w-full cursor-not-allowed"}>
          {child}
        </span>
      </TooltipTrigger>
      {!gate.allowed && gate.reason ? (
        <TooltipContent side="top" className="max-w-xs text-left">
          {gate.reason}
        </TooltipContent>
      ) : null}
    </Tooltip>
  );

  return (
    <div className="w-full">
      {wrapped}
      {showHint && !gate.allowed && gate.reason ? (
        <ActionHint gate={gate} />
      ) : null}
    </div>
  );
}

function cloneDisabled(element: ReactElement): ReactElement {
  if (!isValidElement(element)) return element;
  const prev = (element.props as { className?: string }).className ?? "";
  return cloneElement(element, {
    disabled: true,
    "aria-disabled": true,
    className: `${prev} pointer-events-none`.trim(),
  });
}
