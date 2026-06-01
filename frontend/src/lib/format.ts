import { isInitializedCtHandle, parseCtHandle } from "@/lib/ct-handle";

export function shortAddress(addr?: string | null, chars = 4): string {
  if (!addr) return "—";
  if (addr.length < 2 + chars * 2 + 1) return addr;
  return `${addr.slice(0, 2 + chars)}…${addr.slice(-chars)}`;
}

export function shortHandle(handle?: string | bigint | null): string {
  if (handle === null || handle === undefined) return "—";
  if (!isInitializedCtHandle(handle)) return "not initialized";
  const n = parseCtHandle(handle);
  const hex = `0x${n.toString(16).padStart(64, "0")}`;
  if (hex.length <= 14) return hex;
  return `${hex.slice(0, 8)}…${hex.slice(-6)}`;
}

export function fmtTonnes(value?: bigint | number | null): string {
  if (value === null || value === undefined) return "—";
  const n = typeof value === "bigint" ? Number(value) : value;
  return `${n.toLocaleString()} tCO₂e`;
}

export function fmtCountdown(secondsRemaining: number): string {
  if (secondsRemaining <= 0) return "expired";
  const h = Math.floor(secondsRemaining / 3600);
  const m = Math.floor((secondsRemaining % 3600) / 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m}m ${(secondsRemaining % 60).toString().padStart(2, "0")}s`;
}
