import { create } from "zustand";
import { syncAcrossTabs } from "@/lib/crossTab";
import { persist } from "zustand/middleware";

type State = {
  content: string;
  set: (v: string) => void;
};

export const useNotesStore = create<State>()(
  persist(
    (set) => ({
      content: "",
      set: (content) => set({ content }),
    }),
    { name: "tabos-notes" },
  ),
);

syncAcrossTabs(useNotesStore);
