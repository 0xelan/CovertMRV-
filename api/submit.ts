/**
 * CovertMRV Enterprise Submit API
 * Vercel Edge Function — POST /api/submit
 *
 * Allows enterprise CEMS / IoT systems to submit encrypted emissions
 * on behalf of a registered emitter, using a server-managed signing key.
 *
 * Auth: Bearer token (HMAC-SHA256 of the JSON body with API_SECRET).
 *
 * Request body:
 *   { facilityIds: number[], emissionsTonnes: number[], reportingYear: number, company: `0x${string}` }
 *
 * Response:
 *   { txHash: `0x${string}`, facilityIds: number[], reportingYear: number }
 */

import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";

export const config = { runtime: "edge" };

// ---------- helpers ----------

async function hmacSHA256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// ---------- minimal ABI for batchSubmitEmissions ----------

const REGISTRY_ABI = parseAbi([
  "function batchSubmitEmissions(uint256[] facilityIds, (uint8 securityZone, bytes data)[] encEmissions, uint256 reportingYear) external",
]);

// ---------- main handler ----------

export default async function handler(req: Request): Promise<Response> {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  // ---------- env ----------
  const API_SECRET = (globalThis as Record<string, unknown>)["API_SECRET"] as string | undefined;
  const PRIVATE_KEY = (globalThis as Record<string, unknown>)["SUBMIT_PRIVATE_KEY"] as string | undefined;
  const REGISTRY_ADDRESS = (globalThis as Record<string, unknown>)["CAP_REGISTRY_ADDRESS"] as string | undefined;

  if (!API_SECRET || !PRIVATE_KEY || !REGISTRY_ADDRESS) {
    return jsonResponse({ error: "Server misconfigured — env vars missing" }, 500);
  }

  // ---------- auth ----------
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse({ error: "Missing Authorization header" }, 401);
  }
  const providedToken = authHeader.slice(7);

  // Read body once
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return jsonResponse({ error: "Failed to read request body" }, 400);
  }

  // Constant-time compare via re-computing expected MAC
  const expectedToken = await hmacSHA256(API_SECRET, rawBody);
  // Simple length-safe compare (edge runtime has no crypto.timingSafeEqual in all envs)
  if (providedToken.length !== expectedToken.length) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }
  let match = true;
  for (let i = 0; i < expectedToken.length; i++) {
    if (providedToken.charCodeAt(i) !== expectedToken.charCodeAt(i)) match = false;
  }
  if (!match) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  // ---------- parse ----------
  let body: { facilityIds: number[]; emissionsTonnes: number[]; reportingYear: number; company: string };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const { facilityIds, emissionsTonnes, reportingYear, company } = body;

  if (
    !Array.isArray(facilityIds) ||
    !Array.isArray(emissionsTonnes) ||
    facilityIds.length !== emissionsTonnes.length ||
    facilityIds.length === 0 ||
    typeof reportingYear !== "number" ||
    !company
  ) {
    return jsonResponse({ error: "Invalid payload shape" }, 400);
  }

  if (facilityIds.length > 50) {
    return jsonResponse({ error: "Max 50 facilities per batch" }, 400);
  }

  // ---------- FHE encrypt ----------
  // Dynamic import to avoid top-level await issues in edge runtime.
  // We use the CoFHE SDK to encrypt each emissions value.
  let encEmissions: Array<{ securityZone: number; data: `0x${string}` }>;
  try {
    // @ts-expect-error — SDK import resolved at runtime
    const { FhenixClient } = await import("@cofhe/sdk");
    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(
        (globalThis as Record<string, unknown>)["ARBITRUM_SEPOLIA_RPC_URL"] as string ||
        "https://sepolia-rollup.arbitrum.io/rpc",
      ),
    });

    const fheClient = new FhenixClient({ provider: publicClient });
    await fheClient.loadPublicKey(arbitrumSepolia.id);

    encEmissions = await Promise.all(
      emissionsTonnes.map(async (tonnes) => {
        const encrypted = await fheClient.encrypt_uint64(BigInt(Math.round(tonnes)));
        return { securityZone: 0, data: encrypted as `0x${string}` };
      }),
    );
  } catch (err) {
    return jsonResponse({ error: "FHE encryption failed", detail: String(err) }, 500);
  }

  // ---------- submit tx ----------
  try {
    const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: arbitrumSepolia,
      transport: http(
        (globalThis as Record<string, unknown>)["ARBITRUM_SEPOLIA_RPC_URL"] as string ||
        "https://sepolia-rollup.arbitrum.io/rpc",
      ),
    });

    const txHash = await walletClient.writeContract({
      address: REGISTRY_ADDRESS as `0x${string}`,
      abi: REGISTRY_ABI,
      functionName: "batchSubmitEmissions",
      args: [
        facilityIds.map(BigInt),
        encEmissions,
        BigInt(reportingYear),
      ],
      gas: BigInt(1_200_000 + facilityIds.length * 200_000),
    });

    return jsonResponse({ txHash, facilityIds, reportingYear, company });
  } catch (err) {
    return jsonResponse({ error: "Transaction failed", detail: String(err) }, 500);
  }
}
