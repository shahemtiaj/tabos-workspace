import { create } from "zustand";
import { syncAcrossTabs } from "@/lib/crossTab";
import { persist } from "zustand/middleware";

export type Priority = "low" | "med" | "high";
export type Todo = {
  id: string;
  title: string;
  done: boolean;
  priority: Priority;
  createdAt: number;
};

type State = {
  todos: Todo[];
  add: (title: string, priority?: Priority) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clearDone: () => void;
};

export const useTodosStore = create<State>()(
  persist(
    (set) => ({
      todos: [],
      add: (title, priority = "med") =>
        set((s) => ({
          todos: [{ id: crypto.randomUUID(), title, done: false, priority, createdAt: Date.now() }, ...s.todos],
        })),
      toggle: (id) => set((s) => ({ todos: s.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
      remove: (id) => set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),
      clearDone: () => set((s) => ({ todos: s.todos.filter((t) => !t.done) })),
    }),
    { name: "tabos-todos" },
  ),
);

syncAcrossTabs(useTodosStore);
