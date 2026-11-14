import { create } from "zustand";
import { syncAcrossTabs } from "@/lib/crossTab";
import { persist } from "zustand/middleware";
import { WORKSPACE_PRESETS, DEFAULT_WORKSPACE_ID, type Workspace, type Bookmark } from "@/lib/workspaces/presets";

// What you open from TabOS bookmarks, for the "Recent & Frequent" widget.
export type Usage = { url: string; title: string; count: number; last: number };

type State = {
  workspaces: Workspace[];
  activeId: string;
  usage: Record<string, Usage>;
  recordOpen: (b: { url: string; title: string }) => void;
  moveBookmark: (wsId: string, from: number, to: number) => void;
  updateBookmark: (wsId: string, bId: string, patch: Partial<Omit<Bookmark, "id">>) => void;
  restoreWorkspace: (ws: Workspace, index: number, makeActive: boolean) => void;
  setActive: (id: string) => void;
  addBookmark: (wsId: string, b: Omit<Bookmark, "id">) => void;
  removeBookmark: (wsId: string, bId: string) => void;
  createWorkspace: (partial: Partial<Workspace> & { name: string }) => void;
  deleteWorkspace: (id: string) => void;
  duplicateWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => void;
};

export const useWorkspaceStore = create<State>()(
  persist(
    (set) => ({
      workspaces: WORKSPACE_PRESETS,
      activeId: DEFAULT_WORKSPACE_ID,
      usage: {},
      setActive: (id) => set({ activeId: id }),
      recordOpen: (b) =>
        set((s) => {
          const prev = s.usage[b.url];
          const usage = { ...s.usage, [b.url]: { url: b.url, title: b.title, count: (prev?.count ?? 0) + 1, last: Date.now() } };
          // keep the 60 most recently used
          const keys = Object.keys(usage);
          if (keys.length > 60) {
            keys.sort((a, c) => usage[a].last - usage[c].last);
            for (const k of keys.slice(0, keys.length - 60)) delete usage[k];
          }
          return { usage };
        }),
      moveBookmark: (wsId, from, to) =>
        set((s) => ({
          workspaces: s.workspaces.map((w) => {
            if (w.id !== wsId || from === to) return w;
            const list = [...w.bookmarks];
            const [item] = list.splice(from, 1);
            if (!item) return w;
            list.splice(Math.max(0, Math.min(list.length, to)), 0, item);
            return { ...w, bookmarks: list };
          }),
        })),
      updateBookmark: (wsId, bId, patch) =>
        set((s) => ({
          workspaces: s.workspaces.map((w) =>
            w.id === wsId ? { ...w, bookmarks: w.bookmarks.map((b) => (b.id === bId ? { ...b, ...patch } : b)) } : w,
          ),
        })),
      restoreWorkspace: (ws, index, makeActive) =>
        set((s) => {
          if (s.workspaces.some((w) => w.id === ws.id)) return s;
          const workspaces = [...s.workspaces];
          workspaces.splice(Math.min(index, workspaces.length), 0, ws);
          return { workspaces, activeId: makeActive ? ws.id : s.activeId };
        }),
      addBookmark: (wsId, b) =>
        set((s) => ({
          workspaces: s.workspaces.map((w) =>
            w.id === wsId ? { ...w, bookmarks: [...w.bookmarks, { ...b, id: crypto.randomUUID() }] } : w,
          ),
        })),
      removeBookmark: (wsId, bId) =>
        set((s) => ({
          workspaces: s.workspaces.map((w) =>
            w.id === wsId ? { ...w, bookmarks: w.bookmarks.filter((x) => x.id !== bId) } : w,
          ),
        })),
      createWorkspace: (partial) =>
        set((s) => {
          const base = WORKSPACE_PRESETS[0];
          const ws: Workspace = {
            ...base,
            id: crypto.randomUUID(),
            name: partial.name,
            icon: partial.icon ?? "✨",
            accent: partial.accent ?? base.accent,
            accent2: partial.accent2 ?? base.accent2,
            bookmarks: [],
          };
          return { workspaces: [...s.workspaces, ws], activeId: ws.id };
        }),
      deleteWorkspace: (id) =>
        set((s) => {
          const workspaces = s.workspaces.filter((w) => w.id !== id);
          const activeId = s.activeId === id ? (workspaces[0]?.id ?? DEFAULT_WORKSPACE_ID) : s.activeId;
          return { workspaces, activeId };
        }),
      duplicateWorkspace: (id) =>
        set((s) => {
          const src = s.workspaces.find((w) => w.id === id);
          if (!src) return s;
          // Deep-clone bookmarks so the copy owns its own array/entries — a
          // shallow spread would share the reference and let a future mutation
          // silently corrupt the source workspace.
          const copy: Workspace = {
            ...src,
            id: crypto.randomUUID(),
            name: `${src.name} Copy`,
            bookmarks: src.bookmarks.map((b) => ({ ...b, id: crypto.randomUUID() })),
          };
          return { workspaces: [...s.workspaces, copy] };
        }),
      renameWorkspace: (id, name) =>
        set((s) => ({ workspaces: s.workspaces.map((w) => (w.id === id ? { ...w, name } : w)) })),
    }),
    { name: "tabos-workspaces" },
  ),
);

syncAcrossTabs(useWorkspaceStore);

export function useActiveWorkspace() {
  return useWorkspaceStore((s) => s.workspaces.find((w) => w.id === s.activeId) ?? s.workspaces[0]);
}
