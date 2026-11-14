import { TABOS_VERSION } from "@/lib/version";

// Everything TabOS saves lives in localStorage under keys starting "tabos-".
// A backup is those values in one JSON file. Caches are left out: they are
// rebuilt on their own.
const PREFIX = "tabos-";
const SKIP = new Set(["tabos-weather-cache", "tabos-place-cache", "tabos-focus-last-done"]);

const ownKeys = () =>
  Object.keys(localStorage).filter((k) => k.startsWith(PREFIX) && !SKIP.has(k));

export function exportBackup() {
  const data: Record<string, unknown> = {};
  for (const k of ownKeys()) {
    const raw = localStorage.getItem(k);
    if (raw == null) continue;
    try {
      data[k] = JSON.parse(raw);
    } catch {
      data[k] = raw;
    }
  }
  const file = { app: "tabos", version: TABOS_VERSION, exportedAt: new Date().toISOString(), data };
  const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `tabos-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Validates a backup file and restores it. Returns how many items were restored. */
export async function importBackup(file: File): Promise<number> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error("This file isn't a TabOS backup.");
  }
  const f = parsed as { app?: unknown; data?: unknown };
  if (f?.app !== "tabos" || !f.data || typeof f.data !== "object" || Array.isArray(f.data)) {
    throw new Error("This file isn't a TabOS backup.");
  }
  const entries = Object.entries(f.data as Record<string, unknown>).filter(
    ([k]) => k.startsWith(PREFIX) && !SKIP.has(k) && k.length < 100,
  );
  if (entries.length === 0) throw new Error("The backup is empty.");
  // Replace, don't merge: the backup is restored exactly as it was saved.
  for (const k of ownKeys()) localStorage.removeItem(k);
  for (const [k, v] of entries) {
    localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
  }
  return entries.length;
}

export function eraseAll() {
  for (const k of Object.keys(localStorage)) if (k.startsWith(PREFIX)) localStorage.removeItem(k);
}
