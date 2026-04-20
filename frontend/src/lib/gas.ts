// frontend/src/lib/gas.ts
//
// Arbitrum-Sepolia-friendly gas helper. Mirrors the production pattern used by
// audited FHE dApps: bump `maxFeePerGas` by 30% above the network estimate so
// transactions don't revert with "max fee per gas less than block base fee" on
// Arbitrum's volatile testnet.

import type { PublicClient } from "viem";

export interface GasFees {
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

const BUMP_NUMERATOR = 130n;
const BUMP_DENOMINATOR = 100n;

export async function getGasFees(
  publicClient: PublicClient | undefined,
): Promise<GasFees> {
  if (!publicClient) return {};
  try {
    const fees = await publicClient.estimateFeesPerGas();
    return {
      maxFeePerGas: fees.maxFeePerGas
        ? (fees.maxFeePerGas * BUMP_NUMERATOR) / BUMP_DENOMINATOR
        : undefined,
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
    };
  } catch {
    // Fall back to wallet defaults rather than failing the call.
    return {};
  }
}
