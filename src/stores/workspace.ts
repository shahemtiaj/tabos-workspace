import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WORKSPACE_PRESETS, DEFAULT_WORKSPACE_ID, type Workspace, type Bookmark } from "@/lib/workspaces/presets";

type State = {
  workspaces: Workspace[];
  activeId: string;
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
      setActive: (id) => set({ activeId: id }),
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
          const copy: Workspace = { ...src, id: crypto.randomUUID(), name: `${src.name} Copy` };
          return { workspaces: [...s.workspaces, copy] };
        }),
      renameWorkspace: (id, name) =>
        set((s) => ({ workspaces: s.workspaces.map((w) => (w.id === id ? { ...w, name } : w)) })),
    }),
    { name: "tabos-workspaces" },
  ),
);

export function useActiveWorkspace() {
  return useWorkspaceStore((s) => s.workspaces.find((w) => w.id === s.activeId) ?? s.workspaces[0]);
}
