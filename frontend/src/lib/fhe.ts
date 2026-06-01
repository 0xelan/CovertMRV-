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
import type { Address, PublicClient, WalletClient } from "viem";
import { isInitializedCtHandle, parseCtHandle } from "@/lib/ct-handle";

const ARB_SEPOLIA_CHAIN_ID = 421614;
/** ACL propagation waits — reuse the same signed permit between attempts. */
const DECRYPT_ACL_RETRY_DELAYS_MS = [0, 3_000, 6_000] as const;

let client: CofheClient | null = null;
let connectPromise: Promise<CofheClient> | null = null;
let connectedAccount: string | null = null;
/** Prevents concurrent decrypts (double-click / strict mode) from stacking wallet prompts. */
let decryptInflightKey: string | null = null;

export type StepCallback = (step: string) => void;

/**
 * RainbowKit / wagmi often return a WalletClient without `account` populated.
 * CoFHE permits and sealoutput ACL checks require the connected address.
 */
export function bindWalletAccount(
  walletClient: WalletClient,
  account: Address,
): WalletClient {
  if (
    walletClient.account?.address?.toLowerCase() === account.toLowerCase()
  ) {
    return walletClient;
  }
  return {
    ...walletClient,
    account: { address: account, type: "json-rpc" },
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
  account?: Address,
): Promise<CofheClient> {
  if (!account) {
    throw new Error("Wallet address required for FHE client");
  }
  const boundWallet = bindWalletAccount(walletClient, account);
  const currentAccount = boundWallet.account.address.toLowerCase();

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
    await c.connect(publicClient as never, boundWallet as never);
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
  account: Address,
  value: bigint,
  onStep?: StepCallback,
) {
  const c = await getFheClient(publicClient, walletClient, account);
  onStep?.("Initializing FHE");
  const result = await c
    .encryptInputs([Encryptable.uint64(value)])
    .onStep((step: unknown) => onStep?.(String(step)))
    .execute();
  return result[0];
}

/**
 * Encrypts a uint8 value (e.g. ISO 14064 scope 0/1/2).
 */
export async function encryptUint8(
  publicClient: PublicClient,
  walletClient: WalletClient,
  account: Address,
  value: bigint,
  onStep?: StepCallback,
) {
  const c = await getFheClient(publicClient, walletClient, account);
  onStep?.("Initializing FHE");
  const result = await c
    .encryptInputs([Encryptable.uint8(value)])
    .onStep((step: unknown) => onStep?.(String(step)))
    .execute();
  return result[0];
}

/**
 * Encrypt emissions tonnes + ISO scope for a single facility submission.
 */
export async function encryptEmissionSubmission(
  publicClient: PublicClient,
  walletClient: WalletClient,
  account: Address,
  tonnes: bigint,
  scope: number,
  onStep?: StepCallback,
) {
  const c = await getFheClient(publicClient, walletClient, account);
  onStep?.("Encrypting emissions + scope");
  const result = await c
    .encryptInputs([Encryptable.uint64(tonnes), Encryptable.uint8(BigInt(scope))])
    .onStep((step: unknown) => onStep?.(String(step)))
    .execute();
  return { encEmissions: result[0], encScope: result[1] };
}

/**
 * Batch-encrypt parallel emissions + scope arrays for batchSubmitEmissions.
 */
export async function encryptBatchEmissions(
  publicClient: PublicClient,
  walletClient: WalletClient,
  account: Address,
  tonnesArr: bigint[],
  scopes: number[],
  onStep?: StepCallback,
) {
  if (tonnesArr.length !== scopes.length) {
    throw new Error("emissions and scopes length mismatch");
  }
  const c = await getFheClient(publicClient, walletClient, account);
  onStep?.("Encrypting batch");
  const inputs = tonnesArr.flatMap((t, i) => [
    Encryptable.uint64(t),
    Encryptable.uint8(BigInt(scopes[i] ?? 0)),
  ]);
  const result = await c
    .encryptInputs(inputs)
    .onStep((step: unknown) => onStep?.(String(step)))
    .execute();
  const encEmissions: unknown[] = [];
  const encScopes: unknown[] = [];
  for (let i = 0; i < tonnesArr.length; i++) {
    encEmissions.push(result[i * 2]);
    encScopes.push(result[i * 2 + 1]);
  }
  return { encEmissions, encScopes };
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
      case CofheErrorCode.SealOutputFailed:
        return isDecryptAccessError(err)
          ? "Decrypt access not ready yet — wait for the compliance check to confirm, then try again. If it persists, re-run the compliance check (this refreshes on-chain ACL)."
          : err.message;
      case CofheErrorCode.NotConnected:
        return "FHE client not connected — reconnect your wallet.";
      default:
        return err.message;
    }
  }
  const msg = (err as Error)?.message ?? "Unknown error";
  if (isDecryptAccessError(err)) {
    return "Decrypt access denied (HTTP 403). Confirm the compliance check transaction succeeded, wait a few seconds, then decrypt again.";
  }
  return msg;
}

function isDecryptAccessError(err: unknown): boolean {
  const msg = (
    isCofheError(err)
      ? err.message
      : (err as Error)?.message ?? String(err)
  ).toLowerCase();
  // Do not treat every sealoutput failure as ACL — that caused permit refresh loops.
  return (
    msg.includes("403") ||
    msg.includes("acl access") ||
    msg.includes("notallowed") ||
    msg.includes("not allowed") ||
    msg.includes("access denied")
  );
}

function isPermitError(err: unknown): boolean {
  if (!isCofheError(err)) return false;
  return (
    err.code === CofheErrorCode.PermitNotFound ||
    err.code === CofheErrorCode.InvalidPermitData ||
    err.code === CofheErrorCode.InvalidPermitDomain
  );
}

/** One wallet signature max unless the stored permit is invalid. */
async function ensureSelfPermit(
  c: CofheClient,
  publicClient: PublicClient,
  account: Address,
  forceNew = false,
) {
  const chainId = await publicClient.getChainId();
  if (forceNew) {
    try {
      await c.permits.removeActivePermit(chainId, account);
    } catch {
      /* ignore */
    }
  }
  return c.permits.getOrCreateSelfPermit();
}

async function decryptForViewWithPermit(
  c: CofheClient,
  handle: bigint,
  utype: typeof FheTypes.Bool | typeof FheTypes.Uint64,
  account: Address,
  chainId: number,
  permit: Awaited<ReturnType<CofheClient["permits"]["getOrCreateSelfPermit"]>>,
  onStep?: StepCallback,
) {
  onStep?.("Decrypting");
  return c
    .decryptForView(handle, utype)
    .setChainId(chainId)
    .setAccount(account)
    .withPermit(permit)
    .set404RetryTimeout(15_000)
    .execute();
}

function assertDecryptableHandle(handle: bigint): void {
  if (!isInitializedCtHandle(handle)) {
    throw new Error(
      "No encrypted result on-chain for this wallet. Run Compliance Check with the connected wallet, wait for confirmation, then decrypt.",
    );
  }
}

async function decryptWithAclRetries(
  c: CofheClient,
  publicClient: PublicClient,
  account: Address,
  handle: bigint,
  utype: typeof FheTypes.Bool | typeof FheTypes.Uint64,
  onStep?: StepCallback,
): Promise<unknown> {
  const chainId = await publicClient.getChainId();
  if (chainId !== ARB_SEPOLIA_CHAIN_ID) {
    throw new Error(`Switch wallet to Arbitrum Sepolia (${ARB_SEPOLIA_CHAIN_ID})`);
  }

  const lockKey = `${account.toLowerCase()}:${handle.toString(16)}`;
  if (decryptInflightKey === lockKey) {
    throw new Error("Decrypt already in progress — check your wallet.");
  }
  decryptInflightKey = lockKey;

  try {
    onStep?.("Creating permit");
    let permit = await ensureSelfPermit(c, publicClient, account);

    let lastErr: unknown;
    for (let i = 0; i < DECRYPT_ACL_RETRY_DELAYS_MS.length; i++) {
      const delay = DECRYPT_ACL_RETRY_DELAYS_MS[i];
      if (delay > 0) {
        onStep?.(`Waiting for ACL sync (${delay / 1000}s)`);
        await sleep(delay);
      }
      try {
        onStep?.(i === 0 ? "Decrypting" : `Decrypting (retry ${i})`);
        return await decryptForViewWithPermit(
          c,
          handle,
          utype,
          account,
          chainId,
          permit,
          onStep,
        );
      } catch (err) {
        lastErr = err;
        if (isPermitError(err)) {
          onStep?.("Refreshing permit");
          permit = await ensureSelfPermit(c, publicClient, account, true);
        }
        if (!isDecryptAccessError(err) || i === DECRYPT_ACL_RETRY_DELAYS_MS.length - 1) {
          break;
        }
      }
    }

    throw new Error(describeFheError(lastErr));
  } finally {
    if (decryptInflightKey === lockKey) decryptInflightKey = null;
  }
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
  account: Address,
  ctHash: bigint | `0x${string}`,
  onStep?: StepCallback,
): Promise<bigint> {
  const c = await getFheClient(publicClient, walletClient, account);
  const handle = parseCtHandle(ctHash);
  assertDecryptableHandle(handle);
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

  const result = (await decryptWithAclRetries(
    c,
    publicClient,
    account,
    handle,
    FheTypes.Uint64,
    onStep,
  )) as bigint;

  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(cacheKey, result.toString());
    } catch {
      /* ignore */
    }
  }
  onStep?.("Complete");
  return result;
}

/**
 * Decrypt an ebool handle for UI display.
 */
export async function decryptBool(
  publicClient: PublicClient,
  walletClient: WalletClient,
  account: Address,
  ctHash: bigint | `0x${string}`,
  onStep?: StepCallback,
): Promise<boolean> {
  const c = await getFheClient(publicClient, walletClient, account);
  const handle = parseCtHandle(ctHash);
  assertDecryptableHandle(handle);
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

  const result = (await decryptWithAclRetries(
    c,
    publicClient,
    account,
    handle,
    FheTypes.Bool,
    onStep,
  )) as boolean;

  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(cacheKey, String(result));
    } catch {
      /* ignore */
    }
  }
  onStep?.("Complete");
  return result;
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
  account: Address,
  ctHash: bigint | `0x${string}`,
  onStep?: StepCallback,
): Promise<{ decryptedValue: unknown; signature: `0x${string}` }> {
  const c = await getFheClient(publicClient, walletClient, account);
  const handle = parseCtHandle(ctHash);
  assertDecryptableHandle(handle);
  const chainId = await publicClient.getChainId();
  onStep?.("Creating permit");
  const permit = await ensureSelfPermit(c, publicClient, account);
  onStep?.("Decrypting for settlement");
  const result = (await c
    .decryptForTx(handle)
    .setChainId(chainId)
    .setAccount(account)
    .withPermit(permit)
    .execute()) as {
    decryptedValue: unknown;
    signature: `0x${string}`;
  };
  onStep?.("Complete");
  return result;
}
