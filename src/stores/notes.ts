import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  content: string;
  set: (v: string) => void;
};

export const useNotesStore = create<State>()(
  persist(
    (set) => ({
      content: "# Quick Notes\n\n- Ideas for the day\n- Reminders\n- [ ] Something to remember",
      set: (content) => set({ content }),
    }),
    { name: "tabos-notes" },
  ),
);
