/** Map SDK / contract errors to business-friendly copy (never show raw reverts in UI). */

const RULES: { match: RegExp | string; message: string }[] = [
  { match: /No facilities/i, message: "No facility emissions are on file for this year. Submit emissions before aggregating." },
  { match: /No emissions total|No total/i, message: "Your company total has not been aggregated yet. Complete aggregation first." },
  { match: /No regulatory cap|No cap/i, message: "Your regulator has not assigned an encrypted cap for this reporting year yet." },
  { match: /Not authorized|Only owner/i, message: "This action requires regulator permissions." },
  { match: /Credits already issued/i, message: "Credits were already issued for this company and reporting year." },
  { match: /No compliance check/i, message: "Run a compliance check for this company and year before issuing credits." },
  { match: /access denied|403/i, message: "Decrypt access is not ready yet. Wait a few seconds after your compliance check, then try again." },
  { match: /already in progress/i, message: "A decrypt request is already in progress. Approve the permit once in your wallet." },
  { match: /User rejected|denied|rejected the request/i, message: "Transaction was not approved in your wallet. You can try again when ready." },
  { match: /insufficient funds/i, message: "Insufficient testnet ETH for gas. Add Arbitrum Sepolia ETH to your wallet." },
  { match: /VITE_|0x[a-fA-F0-9]{40}/i, message: "A configuration issue prevented this step. Please contact your administrator." },
];

export function translateUserError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? "Something went wrong");
  for (const rule of RULES) {
    if (typeof rule.match === "string" ? raw.includes(rule.match) : rule.match.test(raw)) {
      return rule.message;
    }
  }
  if (raw.length > 120 || raw.includes("revert") || raw.includes("0x")) {
    return "We could not complete this step. Please try again or contact support if it persists.";
  }
  return raw;
}
