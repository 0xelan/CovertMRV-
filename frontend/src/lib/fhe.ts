// frontend/src/lib/fhe.ts
//
// Singleton CoFHE client + production-grade encrypt / decrypt helpers.
// Patterns adopted from battle-tested FHE dApps on Arbitrum Sepolia:
//   - Promise-based singleton init (no double-connect under React strict mode).
//   - Reset on wallet account change.
//   - decryptForView with sessionStorage cache + permit-refresh-on-failure retry.
//   - Friendly CofheError code → message mapping.
//   - Optional fetch interceptor for sealoutput debugging in development.

import { createCofheClient, createCofheConfig } from "@cofhe/sdk/web";
import {
  Encryptable,
  FheTypes,
  isCofheError,
  CofheErrorCode,
  type CofheClient,
} from "@cofhe/sdk";
import { arbSepolia } from "@cofhe/sdk/chains";
import type { PublicClient, WalletClient } from "viem";

let client: CofheClient | null = null;
let connectPromise: Promise<CofheClient> | null = null;
let connectedAccount: string | null = null;

export type StepCallback = (step: string) => void;

// Dev-only sealoutput response interceptor for debugging permit issues.
if (typeof window !== "undefined" && import.meta.env.DEV) {
  const _fetch = window.fetch.bind(window);
  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const url =
      typeof args[0] === "string"
        ? args[0]
        : args[0] instanceof URL
          ? args[0].href
          : (args[0] as Request)?.url;
    const resp = await _fetch(...args);
    if (url?.includes("sealoutput") && !resp.ok) {
      try {
        const cloned = resp.clone();
        const body = await cloned.text();
        // eslint-disable-next-line no-console
        console.warn(
          `[fhe.sealOutput] ${resp.status} ${resp.statusText}`,
          body.slice(0, 1000),
        );
      } catch {
        /* ignore */
      }
    }
    return resp;
  };
}

/**
 * Returns a connected CoFHE client singleton. Re-uses an in-flight connect
 * promise when called concurrently. Resets if the wallet account changes.
 */
export async function getFheClient(
  publicClient: PublicClient,
  walletClient: WalletClient,
): Promise<CofheClient> {
  const currentAccount = walletClient.account?.address?.toLowerCase() ?? null;

  if (client && connectedAccount && currentAccount !== connectedAccount) {
    client = null;
    connectPromise = null;
    connectedAccount = null;
  }

  if (client) return client;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    const config = createCofheConfig({ supportedChains: [arbSepolia] });
    const c = createCofheClient(config);
    await c.connect(publicClient as never, walletClient as never);
    client = c;
    connectedAccount = currentAccount;
    return c;
  })();

  try {
    return await connectPromise;
  } finally {
    // Either resolved or rejected — drop the in-flight promise so the next
    // call gets a fresh attempt if connect() failed.
    if (!client) connectPromise = null;
  }
}

export function resetFheClient(): void {
  client = null;
  connectPromise = null;
  connectedAccount = null;
}

/**
 * Encrypts a uint64 value client-side. Returns the InEuint64 struct ready to
 * pass to a contract call.
 */
export async function encryptUint64(
  publicClient: PublicClient,
  walletClient: WalletClient,
  value: bigint,
  onStep?: StepCallback,
) {
  const c = await getFheClient(publicClient, walletClient);
  onStep?.("Initializing FHE");
  const result = await c
    .encryptInputs([Encryptable.uint64(value)])
    .onStep((step: unknown) => onStep?.(String(step)))
    .execute();
  return result[0];
}

/**
 * Translates a CofheError into a human-friendly message.
 */
export function describeFheError(err: unknown): string {
  if (isCofheError(err)) {
    switch (err.code) {
      case CofheErrorCode.PermitNotFound:
      case CofheErrorCode.InvalidPermitData:
      case CofheErrorCode.InvalidPermitDomain:
        return "Decrypt permit expired or missing — please sign again.";
      case CofheErrorCode.DecryptFailed:
        return "Decryption rejected by the threshold network. Try again in a few seconds.";
      case CofheErrorCode.NotConnected:
        return "FHE client not connected — reconnect your wallet.";
      default:
        return err.message;
    }
  }
  return (err as Error)?.message ?? "Unknown error";
}

function sessionCacheKey(account: string | undefined, handle: bigint, kind: string) {
  const acc = account?.toLowerCase() ?? "anon";
  return `covertmrv.fhe.${kind}.${acc}.${handle.toString(16)}`;
}

/**
 * Decrypt a uint64 ciphertext handle for UI display.
 * Caches the decrypted value in sessionStorage per (wallet, handle) so repeat
 * views don't roundtrip the threshold network.
 * Refreshes the self-permit and retries once on failure.
 */
export async function decryptUint64(
  publicClient: PublicClient,
  walletClient: WalletClient,
  ctHash: bigint | `0x${string}`,
  onStep?: StepCallback,
): Promise<bigint> {
  const c = await getFheClient(publicClient, walletClient);
  const handle = typeof ctHash === "string" ? BigInt(ctHash) : ctHash;
  const account = walletClient.account?.address;
  const cacheKey = sessionCacheKey(account, handle, "u64");

  if (typeof window !== "undefined") {
    try {
      const cached = window.sessionStorage.getItem(cacheKey);
      if (cached !== null) {
        onStep?.("Complete (cached)");
        return BigInt(cached);
      }
    } catch {
      /* sessionStorage may be unavailable (private mode) */
    }
  }

  onStep?.("Creating permit");
  await c.permits.getOrCreateSelfPermit({});
  onStep?.("Decrypting");
  try {
    const result = (await c
      .decryptForView(handle, FheTypes.Uint64)
      .execute()) as bigint;
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(cacheKey, result.toString());
      } catch {
        /* ignore */
      }
    }
    onStep?.("Complete");
    return result;
  } catch (err) {
    // Retry with a fresh permit — the cached one may be stale or invalid.
    onStep?.("Refreshing permit");
    try {
      const chainId = await publicClient.getChainId();
      if (account) {
        try {
          await c.permits.removeActivePermit(chainId, account);
        } catch {
          /* ignore */
        }
      }
      await c.permits.getOrCreateSelfPermit({});
      onStep?.("Decrypting (retry)");
      const result = (await c
        .decryptForView(handle, FheTypes.Uint64)
        .execute()) as bigint;
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(cacheKey, result.toString());
        } catch {
          /* ignore */
        }
      }
      onStep?.("Complete");
      return result;
    } catch (retryErr) {
      throw new Error(describeFheError(retryErr) || describeFheError(err));
    }
  }
}

/**
 * Decrypt an ebool handle for UI display.
 */
export async function decryptBool(
  publicClient: PublicClient,
  walletClient: WalletClient,
  ctHash: bigint | `0x${string}`,
  onStep?: StepCallback,
): Promise<boolean> {
  const c = await getFheClient(publicClient, walletClient);
  const handle = typeof ctHash === "string" ? BigInt(ctHash) : ctHash;
  const account = walletClient.account?.address;
  const cacheKey = sessionCacheKey(account, handle, "bool");

  if (typeof window !== "undefined") {
    try {
      const cached = window.sessionStorage.getItem(cacheKey);
      if (cached !== null) {
        onStep?.("Complete (cached)");
        return cached === "true";
      }
    } catch {
      /* ignore */
    }
  }

  onStep?.("Creating permit");
  await c.permits.getOrCreateSelfPermit({});
  onStep?.("Decrypting");
  try {
    const result = (await c.decryptForView(handle, FheTypes.Bool).execute()) as boolean;
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(cacheKey, String(result));
      } catch {
        /* ignore */
      }
    }
    onStep?.("Complete");
    return result;
  } catch (err) {
    onStep?.("Refreshing permit");
    try {
      const chainId = await publicClient.getChainId();
      if (account) {
        try {
          await c.permits.removeActivePermit(chainId, account);
        } catch {
          /* ignore */
        }
      }
      await c.permits.getOrCreateSelfPermit({});
      onStep?.("Decrypting (retry)");
      const result = (await c.decryptForView(handle, FheTypes.Bool).execute()) as boolean;
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(cacheKey, String(result));
        } catch {
          /* ignore */
        }
      }
      onStep?.("Complete");
      return result;
    } catch (retryErr) {
      throw new Error(describeFheError(retryErr) || describeFheError(err));
    }
  }
}

/**
 * Decrypt a handle for on-chain settlement. Returns { decryptedValue, signature }
 * for use with `FHE.publishDecryptResult` on-chain.
 *
 * Uses `.withPermit()` because CapCheck issues `FHE.allow(result, owner)` to
 * the caller (not `allowPublic`), so the threshold network requires a signed
 * permit proving the caller is authorised to decrypt.
 */
export async function decryptForSettlement(
  publicClient: PublicClient,
  walletClient: WalletClient,
  ctHash: bigint | `0x${string}`,
  onStep?: StepCallback,
): Promise<{ decryptedValue: unknown; signature: `0x${string}` }> {
  const c = await getFheClient(publicClient, walletClient);
  const handle = typeof ctHash === "string" ? BigInt(ctHash) : ctHash;
  onStep?.("Creating permit");
  await c.permits.getOrCreateSelfPermit({});
  onStep?.("Decrypting for settlement");
  const result = (await c.decryptForTx(handle).withPermit().execute()) as {
    decryptedValue: unknown;
    signature: `0x${string}`;
  };
  onStep?.("Complete");
  return result;
}
