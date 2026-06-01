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
