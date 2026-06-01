/** Track facility IDs submitted by wallet per reporting year — on-chain list is private. */

function storageKey(address: string, reportingYear: number) {
  return `covertmrv.facilities.${address.toLowerCase()}.${reportingYear}`;
}

export function loadSubmittedFacilityIds(
  address: string | undefined,
  reportingYear: number,
): bigint[] {
  if (!address || typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(address, reportingYear));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return parsed.map((s) => BigInt(s));
  } catch {
    return [];
  }
}

export function saveSubmittedFacilityIds(
  address: string,
  reportingYear: number,
  ids: readonly bigint[],
): void {
  if (typeof window === "undefined") return;
  const unique = [...new Set(ids.map((id) => id.toString()))].sort(
    (a, b) => (BigInt(a) > BigInt(b) ? 1 : -1),
  );
  window.localStorage.setItem(storageKey(address, reportingYear), JSON.stringify(unique));
}

export function recordSubmittedFacilityIds(
  address: string,
  reportingYear: number,
  ids: readonly bigint[],
): bigint[] {
  const existing = loadSubmittedFacilityIds(address, reportingYear);
  const merged = [...existing];
  for (const id of ids) {
    if (!merged.some((x) => x === id)) merged.push(id);
  }
  merged.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
  saveSubmittedFacilityIds(address, reportingYear, merged);
  return merged;
}
