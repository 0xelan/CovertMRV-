// frontend/src/hooks/useFHEStatus.ts
//
// Streaming step-state for FHE encrypt / decrypt flows. Drives the on-screen
// stepper UI ("Encrypting → Computing → Ready").

import { useCallback, useState } from "react";

export const FHEStepStatus = {
  IDLE: "IDLE",
  ENCRYPTING: "ENCRYPTING",
  COMPUTING: "COMPUTING",
  READY: "READY",
  ERROR: "ERROR",
} as const;
export type FHEStepStatusKey = keyof typeof FHEStepStatus;

const STEP_LABELS: Record<FHEStepStatusKey, string> = {
  IDLE: "Ready",
  ENCRYPTING: "Encrypting...",
  COMPUTING: "Computing on-chain...",
  READY: "Complete",
  ERROR: "Error",
};

const STEP_INDEX: Record<FHEStepStatusKey, number> = {
  IDLE: -1,
  ENCRYPTING: 0,
  COMPUTING: 1,
  READY: 2,
  ERROR: -1,
};

export interface FHEStatus {
  step: FHEStepStatusKey;
  stepLabel: string;
  stepIndex: number;
  errorMessage: string | null;
  isWorking: boolean;
  setStep: (step: FHEStepStatusKey, message?: string) => void;
  setLabel: (label: string) => void;
  reset: () => void;
}

export function useFHEStatus(): FHEStatus {
  const [step, setStepState] = useState<FHEStepStatusKey>("IDLE");
  const [overrideLabel, setOverrideLabel] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setStep = useCallback((next: FHEStepStatusKey, message?: string) => {
    setStepState(next);
    setOverrideLabel(null);
    setErrorMessage(next === "ERROR" ? (message ?? "Unknown error") : null);
  }, []);

  const setLabel = useCallback((label: string) => {
    setOverrideLabel(label);
  }, []);

  const reset = useCallback(() => {
    setStepState("IDLE");
    setOverrideLabel(null);
    setErrorMessage(null);
  }, []);

  return {
    step,
    stepLabel: overrideLabel ?? STEP_LABELS[step],
    stepIndex: STEP_INDEX[step],
    errorMessage,
    isWorking: step === "ENCRYPTING" || step === "COMPUTING",
    setStep,
    setLabel,
    reset,
  };
}
