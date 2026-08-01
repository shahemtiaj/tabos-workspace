import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, Layers, Bookmark, Pencil, Settings, CheckSquare, CornerDownLeft } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace";
import { useLayoutStore } from "@/stores/layout";
import { useTodosStore } from "@/stores/todos";
import { useSettingsStore, type SearchEngine } from "@/stores/settings";

const ENGINE_URL: Record<SearchEngine, (q: string) => string> = {
  google: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  duckduckgo: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  brave: (q) => `https://search.brave.com/search?q=${encodeURIComponent(q)}`,
  bing: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
};

export const OPEN_SETTINGS_EVENT = "tabos:open-settings";

type Item = {
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  run: () => void;
};

/** Global Cmd/Ctrl-K launcher: bookmarks, workspaces, todos and app actions. */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const setActive = useWorkspaceStore((s) => s.setActive);
  const todos = useTodosStore((s) => s.todos);
  const toggle = useTodosStore((s) => s.toggle);
  const add = useTodosStore((s) => s.add);
  const editMode = useLayoutStore((s) => s.editMode);
  const setEditMode = useLayoutStore((s) => s.setEditMode);
  const searchEngine = useSettingsStore((s) => s.searchEngine);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setCursor(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const list: Item[] = [];

    workspaces.forEach((w) => {
      list.push({
        id: `ws-${w.id}`,
        label: `${w.icon} ${w.name}`,
        hint: "Workspace",
        icon: <Layers className="h-3.5 w-3.5" />,
        run: () => setActive(w.id),
      });
      w.bookmarks.forEach((b) => {
        list.push({
          id: `bm-${w.id}-${b.id}`,
          label: b.title,
          hint: `${w.name} · bookmark`,
          icon: <Bookmark className="h-3.5 w-3.5" />,
          run: () => window.open(b.url, "_blank", "noopener"),
        });
      });
    });

    todos
      .filter((t) => !t.done)
      .forEach((t) => {
        list.push({
          id: `todo-${t.id}`,
          label: t.title,
          hint: "Complete todo",
          icon: <CheckSquare className="h-3.5 w-3.5" />,
          run: () => toggle(t.id),
        });
      });

    list.push({
      id: "act-edit",
      label: editMode ? "Exit edit mode" : "Edit layout",
      hint: "Action",
      icon: <Pencil className="h-3.5 w-3.5" />,
      run: () => setEditMode(!editMode),
    });
    list.push({
      id: "act-settings",
      label: "Open settings",
      hint: "Action",
      icon: <Settings className="h-3.5 w-3.5" />,
      run: () => window.dispatchEvent(new CustomEvent(OPEN_SETTINGS_EVENT)),
    });

    return list;
  }, [workspaces, todos, editMode, setActive, toggle, setEditMode]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = needle
      ? items.filter((i) => i.label.toLowerCase().includes(needle) || i.hint.toLowerCase().includes(needle))
      : items.slice(0, 8);
    const extra: Item[] = [];
    if (needle) {
      extra.push({
        id: "web",
        label: `Search the web for "${q.trim()}"`,
        hint: "Search",
        icon: <Search className="h-3.5 w-3.5" />,
        run: () => {
          window.location.href = ENGINE_URL[searchEngine](q.trim());
        },
      });
      extra.push({
        id: "newtodo",
        label: `Add todo "${q.trim()}"`,
        hint: "Action",
        icon: <CheckSquare className="h-3.5 w-3.5" />,
        run: () => add(q.trim()),
      });
    }
    return [...base.slice(0, 10), ...extra];
  }, [q, items, searchEngine, add]);

  const runAt = (i: number) => {
    const item = filtered[i];
    if (!item) return;
    item.run();
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed left-1/2 top-[14vh] z-[61] w-[min(640px,92vw)] -translate-x-1/2"
            role="dialog"
            aria-label="Command palette"
          >
            <div className="glass-strong overflow-hidden" style={{ borderRadius: "var(--radius-panel)" }}>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                <Search className="h-4 w-4 text-white/50" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setCursor(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setCursor((c) => Math.min(c + 1, filtered.length - 1));
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setCursor((c) => Math.max(c - 1, 0));
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      runAt(cursor);
                    }
                  }}
                  placeholder="Search bookmarks, workspaces, todos or the web…"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/35"
                />
                <kbd className="text-[10px] text-white/40 glass-subtle px-2 py-1 rounded-md">ESC</kbd>
              </div>
              <ul className="max-h-[46vh] overflow-y-auto p-2">
                {filtered.length === 0 && (
                  <li className="px-3 py-6 text-center text-sm text-white/40">No matches</li>
                )}
                {filtered.map((it, i) => (
                  <li key={it.id}>
                    <button
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => runAt(i)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition ${
                        i === cursor ? "bg-white/12" : "hover:bg-white/5"
                      }`}
                    >
                      <span className="text-white/60">{it.icon}</span>
                      <span className="flex-1 min-w-0 truncate text-sm">{it.label}</span>
                      <span className="text-[10px] uppercase tracking-widest text-white/35">{it.hint}</span>
                      {i === cursor && <CornerDownLeft className="h-3 w-3 text-white/40" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
