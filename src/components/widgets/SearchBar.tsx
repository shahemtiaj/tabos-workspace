import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { useSettingsStore, type SearchEngine } from "@/stores/settings";

const ENGINES: Record<SearchEngine, { name: string; url: (q: string) => string }> = {
  google: { name: "Google", url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
  duckduckgo: { name: "DuckDuckGo", url: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}` },
  brave: { name: "Brave", url: (q) => `https://search.brave.com/search?q=${encodeURIComponent(q)}` },
  bing: { name: "Bing", url: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}` },
};

export function SearchBar() {
  const [q, setQ] = useState("");
  const { searchEngine, setSearchEngine } = useSettingsStore();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    window.location.href = ENGINES[searchEngine].url(q);
  };

  return (
    <form
      onSubmit={submit}
      className="glass flex items-center gap-2 pl-4 pr-1 py-1 min-w-[280px] max-w-[520px] flex-1"
      style={{ borderRadius: "var(--radius-pill)" }}
    >
      <Search className="h-4 w-4 text-white/60 shrink-0" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={`Search ${ENGINES[searchEngine].name}…`}
        className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/40 min-w-0"
      />
      <select
        value={searchEngine}
        onChange={(e) => setSearchEngine(e.target.value as SearchEngine)}
        className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1.5 outline-none cursor-pointer hover:bg-white/10 transition text-white/80"
      >
        {Object.entries(ENGINES).map(([k, v]) => (
          <option key={k} value={k} className="bg-neutral-900">
            {v.name}
          </option>
        ))}
      </select>
    </form>
  );
}
