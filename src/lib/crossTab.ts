// Keeps every open TabOS tab in step.
//
// Each tab holds its own copy of the persisted stores in memory. Without this,
// a tab opened earlier writes its stale copy back the next time anything
// changes in it, silently undoing what was done in a newer tab (a todo added,
// a bookmark deleted). The browser fires `storage` in every *other* tab when
// localStorage changes; we reload the matching store from storage there.

type Rehydratable = { persist: { rehydrate: () => Promise<void> | void; getOptions: () => { name?: string } } };

const stores = new Map<string, Rehydratable>();
let listening = false;

export function syncAcrossTabs(store: Rehydratable) {
  const name = store.persist.getOptions().name;
  if (!name) return;
  stores.set(name, store);
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("storage", (e) => {
    if (e.storageArea !== window.localStorage) return;
    if (e.key === null) {
      // localStorage.clear() in another tab
      for (const s of stores.values()) void s.persist.rehydrate();
      return;
    }
    const s = stores.get(e.key);
    if (s) void s.persist.rehydrate();
  });
}
