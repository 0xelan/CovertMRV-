/**
 * Normalize CoFHE ciphertext handles from wagmi (bytes32 hex | bigint).
 * Uninitialized on-chain values are zero — must not be sent to sealoutput.
 */

export function parseCtHandle(value: unknown): bigint {
  if (value === null || value === undefined) return 0n;
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "0x") return 0n;
    try {
      return BigInt(trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`);
    } catch {
      return 0n;
    }
  }
  return 0n;
}

/** True when the handle is a non-zero FHE ciphertext reference. */
export function isInitializedCtHandle(value: unknown): boolean {
  return parseCtHandle(value) !== 0n;
}

/** Wagmi/viem return public struct getters as tuples; support both shapes. */
export function parseComplianceRecord(data: unknown): {
  exists: boolean;
  settled: boolean;
  plaintextResult: boolean;
} | null {
  if (data === null || data === undefined) return null;
  if (Array.isArray(data)) {
    return {
      exists: Boolean(data[2]),
      settled: Boolean(data[3]),
      plaintextResult: Boolean(data[4]),
    };
  }
  const r = data as {
    exists?: boolean;
    settled?: boolean;
    plaintextResult?: boolean;
  };
  return {
    exists: Boolean(r.exists),
    settled: Boolean(r.settled),
    plaintextResult: Boolean(r.plaintextResult),
  };
}

/** Wagmi may return `isSettled` as a tuple or `{ settled, result }`. */
export function parseSettledStatus(
  data: unknown,
): readonly [settled: boolean, result: boolean] | undefined {
  if (data === null || data === undefined) return undefined;
  if (Array.isArray(data)) {
    return [Boolean(data[0]), Boolean(data[1])];
  }
  const r = data as { settled?: boolean; result?: boolean };
  if (r.settled === undefined && r.result === undefined) return undefined;
  return [Boolean(r.settled), Boolean(r.result)];
}
