import { BookmarkPlus, ExternalLink, Check } from "lucide-react";
import { useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { useHydrated } from "@/hooks/useHydrated";

export type ReadItem = { id: string; url: string; title: string; addedAt: number };

type S = {
  items: ReadItem[];
  add: (url: string) => void;
  remove: (id: string) => void;
};

const normalize = (u: string) => (/^https?:\/\//i.test(u) ? u : `https://${u}`);
const hostOf = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
};

export const useReadLaterStore = create<S>()(
  persist(
    (set) => ({
      items: [],
      add: (url) =>
        set((s) => {
          const full = normalize(url.trim());
          return {
            items: [
              { id: crypto.randomUUID(), url: full, title: hostOf(full), addedAt: Date.now() },
              ...s.items,
            ].slice(0, 50),
          };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
    }),
    { name: "tabos-readlater" },
  ),
);

export function ReadLaterWidget() {
  const hydrated = useHydrated();
  const { items, add, remove } = useReadLaterStore();
  const [url, setUrl] = useState("");

  return (
    <GlassPanel className="h-full w-full p-5 flex flex-col">
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-white/50 mb-3">
        <span className="flex items-center gap-2">
          <BookmarkPlus className="h-3.5 w-3.5" /> Read Later
        </span>
        {hydrated && <span className="text-white/30">{items.length}</span>}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
        {hydrated && items.length === 0 && (
          <p className="text-sm text-white/40">Stash links here to read when you have time.</p>
        )}
        {hydrated &&
          items.map((it) => (
            <div key={it.id} className="glass-subtle rounded-2xl px-3 py-2 flex items-center gap-2">
              <img
                src={`https://www.google.com/s2/favicons?domain=${hostOf(it.url)}&sz=32`}
                alt=""
                className="h-4 w-4 rounded-sm shrink-0"
                loading="lazy"
              />
              <a
                href={it.url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-0 truncate text-sm text-white/85 hover:text-white"
              >
                {it.title}
              </a>
              <a
                href={it.url}
                target="_blank"
                rel="noreferrer"
                className="h-6 w-6 grid place-items-center rounded-full hover:bg-white/10 text-white/40"
                aria-label="Open link"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
              <button
                onClick={() => remove(it.id)}
                className="h-6 w-6 grid place-items-center rounded-full hover:bg-emerald-500/20 text-white/40"
                aria-label="Mark as read"
                title="Mark as read"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!url.trim()) return;
          add(url);
          setUrl("");
        }}
        className="mt-3 glass-subtle flex items-center gap-2 pl-4 pr-1 py-1 rounded-full"
      >
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a link…"
          className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-white/30"
        />
        <button
          type="submit"
          className="h-8 px-3 rounded-full text-xs text-white shrink-0"
          style={{ background: "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))" }}
        >
          Save
        </button>
      </form>
    </GlassPanel>
  );
}
