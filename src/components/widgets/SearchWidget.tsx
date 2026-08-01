import { memo, useDeferredValue, useMemo, useRef, useState, type FormEvent } from "react";
import { Search, X, History, Command, Link as LinkIcon } from "lucide-react";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { useSettingsStore, type SearchEngine } from "@/stores/settings";
import { useSearchStore } from "@/stores/search";

const ENGINES: Record<SearchEngine, { name: string; url: (q: string) => string }> = {
  google: { name: "Google", url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
  duckduckgo: { name: "DuckDuckGo", url: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}` },
  brave: { name: "Brave", url: (q) => `https://search.brave.com/search?q=${encodeURIComponent(q)}` },
  bing: { name: "Bing", url: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}` },
};

/** Detects a pasted URL / bare domain and returns a navigable href. */
function asUrl(input: string): string | null {
  const v = input.trim();
  if (!v || /\s/.test(v)) return null;
  if (/^(https?|ftp):\/\/\S+$/i.test(v)) return v;
  if (/^localhost(:\d+)?(\/\S*)?$/i.test(v)) return `http://${v}`;
  if (/^([\w-]+\.)+[a-z]{2,}(:\d+)?(\/\S*)?$/i.test(v)) return `https://${v}`;
  return null;
}

/** Mandatory search widget: engine picker + recent-search suggestions. */
export function SearchWidget() {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchEngine = useSettingsStore((s) => s.searchEngine);
  const setSearchEngine = useSettingsStore((s) => s.setSearchEngine);
  const recentSearchLimit = useSettingsStore((s) => s.recentSearchLimit);
  const recent = useSearchStore((s) => s.recent);
  const remove = useSearchStore((s) => s.remove);
  const clear = useSearchStore((s) => s.clear);

  // Filtering is deferred so typing never blocks the input paint.
  const deferredQ = useDeferredValue(q);
  const suggestions = useMemo(() => {
    if (!focused || recentSearchLimit <= 0) return [];
    const needle = deferredQ.trim().toLowerCase();
    const base = needle ? recent.filter((r) => r.q.toLowerCase().includes(needle)) : recent;
    return base.slice(0, recentSearchLimit);
  }, [recent, deferredQ, recentSearchLimit, focused]);

  const go = (query: string) => {
    const v = query.trim();
    if (!v) return;
    const target = asUrl(v) ?? ENGINES[searchEngine].url(v);
    // Navigate immediately; history write happens after the navigation is queued.
    window.location.href = target;
    setTimeout(() => useSearchStore.getState().push(v), 0);
  };


  const submit = (e: FormEvent) => {
    e.preventDefault();
    go(q);
  };

  const isUrl = asUrl(q) !== null;
  const showSuggestions = focused && suggestions.length > 0;


  return (
    <GlassPanel className="h-full flex flex-col gap-3 p-5">
      <form
        onSubmit={submit}
        className="glass flex items-center gap-2 pl-4 pr-1 py-1.5"
        style={{ borderRadius: "var(--radius-pill)" }}
      >
        {isUrl ? (
          <LinkIcon className="h-4 w-4 text-white/60 shrink-0" />
        ) : (
          <Search className="h-4 w-4 text-white/60 shrink-0" />
        )}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            if (blurTimer.current) clearTimeout(blurTimer.current);
            setFocused(true);
          }}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setFocused(false), 150);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setFocused(false);
          }}
          placeholder={isUrl ? "Press Enter to open link…" : `Search ${ENGINES[searchEngine].name}…`}
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/40 min-w-0"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="grid h-7 w-7 place-items-center rounded-full text-white/50 hover:text-white hover:bg-white/10"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="submit"
          className="hidden sm:grid h-7 px-3 place-items-center rounded-full text-[11px] font-medium text-white"
          style={{ background: "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))" }}
        >
          {isUrl ? "Open" : "Search"}
        </button>
        <select
          value={searchEngine}
          onChange={(e) => setSearchEngine(e.target.value as SearchEngine)}
          className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1.5 outline-none cursor-pointer hover:bg-white/10 transition text-white/80"
          aria-label="Search engine"
        >
          {Object.entries(ENGINES).map(([k, v]) => (
            <option key={k} value={k} className="bg-neutral-900">
              {v.name}
            </option>
          ))}
        </select>
      </form>

      {showSuggestions ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="text-[10px] uppercase tracking-widest text-white/35 flex items-center gap-1.5">
              <History className="h-3 w-3" /> Recent
            </span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={clear}
              className="text-[10px] uppercase tracking-widest text-white/35 hover:text-white/70"
            >
              Clear
            </button>
          </div>
          <ul className="space-y-1">
            {suggestions.map((r) => (
              <SuggestionRow key={r.q} q={r.q} onGo={go} onRemove={remove} />
            ))}
          </ul>

        </div>
      ) : (
        <p className="flex items-center gap-1.5 px-1 text-[11px] text-white/35">
          <Command className="h-3 w-3" /> Press ⌘/Ctrl + K for the command palette
        </p>
      )}
    </GlassPanel>
  );
}
