/**
 * CovertMRV Enterprise Submit API
 * POST /api/submit
 *
 * Server-side batch emissions submit using @cofhe/sdk 0.5.2.
 * The SUBMIT_PRIVATE_KEY wallet must be registered as EMITTER on CapRegistry.
 *
 * Auth: Bearer token (HMAC-SHA256 of the JSON body with API_SECRET).
 *
 * Request body:
 *   {
 *     facilityIds: number[],
 *     emissionsTonnes: number[],
 *     reportingYear: number,
 *     scopes?: number[],   // optional, defaults to 0 (Scope 1) per facility
 *     company?: `0x${string}` // logged in response only; tx sender is SUBMIT_PRIVATE_KEY
 *   }
 */

import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import {
  createCofheConfig,
  createCofheClient,
  Encryptable,
} from "@cofhe/sdk/node";
import { getChainById } from "@cofhe/sdk/chains";

export const config = { runtime: "nodejs" };

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

const REGISTRY_ABI = parseAbi([
  "function batchSubmitEmissions(uint256[] _facilityIds, (uint256 ctHash, uint8 securityZone, uint8 utype, bytes signature)[] _encEmissions, (uint256 ctHash, uint8 securityZone, uint8 utype, bytes signature)[] _encScopes, uint256 _reportingYear) external",
]);

export default async function handler(req: Request): Promise<Response> {
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

  const API_SECRET = process.env.API_SECRET;
  const PRIVATE_KEY = process.env.SUBMIT_PRIVATE_KEY;
  const REGISTRY_ADDRESS = process.env.CAP_REGISTRY_ADDRESS;
  const RPC_URL =
    process.env.ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";

  if (!API_SECRET || !PRIVATE_KEY || !REGISTRY_ADDRESS) {
    return jsonResponse({ error: "Server misconfigured — env vars missing" }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse({ error: "Missing Authorization header" }, 401);
  }
  const providedToken = authHeader.slice(7);

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return jsonResponse({ error: "Failed to read request body" }, 400);
  }

  const expectedToken = await hmacSHA256(API_SECRET, rawBody);
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

  let body: {
    facilityIds: number[];
    emissionsTonnes: number[];
    reportingYear: number;
    scopes?: number[];
    company?: string;
  };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const { facilityIds, emissionsTonnes, reportingYear, scopes, company } = body;

  if (
    !Array.isArray(facilityIds) ||
    !Array.isArray(emissionsTonnes) ||
    facilityIds.length !== emissionsTonnes.length ||
    facilityIds.length === 0 ||
    typeof reportingYear !== "number"
  ) {
    return jsonResponse({ error: "Invalid payload shape" }, 400);
  }

  if (scopes && scopes.length !== facilityIds.length) {
    return jsonResponse({ error: "scopes length must match facilityIds" }, 400);
  }

  if (facilityIds.length > 50) {
    return jsonResponse({ error: "Max 50 facilities per batch" }, 400);
  }

  const scopeValues = scopes ?? facilityIds.map(() => 0);

  try {
    const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(RPC_URL),
    });
    const walletClient = createWalletClient({
      account,
      chain: arbitrumSepolia,
      transport: http(RPC_URL),
    });

    const chain = getChainById(arbitrumSepolia.id);
    if (!chain) {
      return jsonResponse({ error: "CoFHE chain config not found" }, 500);
    }

    const cofheConfig = createCofheConfig({
      environment: "node",
      supportedChains: [chain],
    });
    const fheClient = createCofheClient(cofheConfig);
    await fheClient.connect(publicClient, walletClient);
    await fheClient.permits.createSelf({ issuer: account.address });

    const inputs = emissionsTonnes.flatMap((tonnes, i) => [
      Encryptable.uint64(BigInt(Math.round(tonnes))),
      Encryptable.uint8(BigInt(scopeValues[i] ?? 0)),
    ]);
    const encrypted = await fheClient.encryptInputs(inputs).execute();

    const encEmissions = encrypted.filter((_, i) => i % 2 === 0);
    const encScopes = encrypted.filter((_, i) => i % 2 === 1);

    const txHash = await walletClient.writeContract({
      address: REGISTRY_ADDRESS as `0x${string}`,
      abi: REGISTRY_ABI,
      functionName: "batchSubmitEmissions",
      args: [
        facilityIds.map(BigInt),
        encEmissions as never,
        encScopes as never,
        BigInt(reportingYear),
      ],
      gas: BigInt(1_200_000 + facilityIds.length * 200_000),
    });

    return jsonResponse({
      txHash,
      facilityIds,
      reportingYear,
      company: company ?? account.address,
    });
  } catch (err) {
    return jsonResponse({ error: "Submit failed", detail: String(err) }, 500);
  }
}
