/** Track facility IDs submitted by this wallet — on-chain list is private. */

function storageKey(address: string) {
  return `covertmrv.facilities.${address.toLowerCase()}`;
}

export function loadSubmittedFacilityIds(address: string | undefined): bigint[] {
  if (!address || typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(address));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return parsed.map((s) => BigInt(s));
  } catch {
    return [];
  }
}

export function saveSubmittedFacilityIds(address: string, ids: readonly bigint[]): void {
  if (typeof window === "undefined") return;
  const unique = [...new Set(ids.map((id) => id.toString()))].sort(
    (a, b) => (BigInt(a) > BigInt(b) ? 1 : -1),
  );
  window.localStorage.setItem(storageKey(address), JSON.stringify(unique));
}

export function recordSubmittedFacilityIds(
  address: string,
  ids: readonly bigint[],
): bigint[] {
  const existing = loadSubmittedFacilityIds(address);
  const merged = [...existing];
  for (const id of ids) {
    if (!merged.some((x) => x === id)) merged.push(id);
  }
  merged.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
  saveSubmittedFacilityIds(address, merged);
  return merged;
}
