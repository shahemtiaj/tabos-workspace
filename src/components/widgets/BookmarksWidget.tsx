import { useState, type FormEvent } from "react";
import { Plus, X, Pencil } from "lucide-react";
import { useActiveWorkspace, useWorkspaceStore } from "@/stores/workspace";
import type { Bookmark } from "@/lib/workspaces/presets";
import { GlassCard } from "@/components/glass/GlassPanel";

function faviconFor(url: string) {
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
  } catch {
    return "";
  }
}

/** Accepts "example.com", "https://…" etc.; returns a safe http(s) URL or null. */
export function normalizeUrl(input: string): string | null {
  const v = input.trim();
  if (!v) return null;
  try {
    const u = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : `https://${v}`);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname.includes(".") && u.hostname !== "localhost") return null;
    return u.href;
  } catch {
    return null;
  }
}

/** Site icon with the first letter underneath, so offline it is never blank. */
export function SiteIcon({ url, title, size = 40 }: { url: string; title: string; size?: number }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const letter = (title.trim()[0] || "?").toUpperCase();
  return (
    <div
      className="relative rounded-xl grid place-items-center overflow-hidden shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, color-mix(in oklab, var(--ws-accent) 35%, transparent), color-mix(in oklab, var(--ws-accent-2) 35%, transparent))",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {!loaded && <span className="text-sm font-semibold text-white/85">{letter}</span>}
      {!failed && (
        <img
          src={faviconFor(url)}
          alt=""
          className="absolute"
          style={{ width: size * 0.6, height: size * 0.6, opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          draggable={false}
        />
      )}
    </div>
  );
}

export function BookmarksWidget() {
  const ws = useActiveWorkspace();
  const { addBookmark, removeBookmark, moveBookmark, updateBookmark, recordOpen } = useWorkspaceStore();
  const [form, setForm] = useState<{ mode: "add" } | { mode: "edit"; id: string } | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const openForm = (b?: Bookmark) => {
    setError(null);
    if (b) {
      setForm({ mode: "edit", id: b.id });
      setTitle(b.title);
      setUrl(b.url);
    } else {
      setForm(form?.mode === "add" ? null : { mode: "add" });
      setTitle("");
      setUrl("");
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setError("Enter a web address, like example.com");
      return;
    }
    let name = title.trim();
    if (!name) name = new URL(normalized).hostname.replace(/^www\./, "");
    if (form?.mode === "edit") updateBookmark(ws.id, form.id, { title: name, url: normalized });
    else addBookmark(ws.id, { title: name, url: normalized });
    setForm(null);
  };

  return (
    <GlassCard className="p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Bookmarks</h2>
        <button
          onClick={() => openForm()}
          className="glass-subtle h-7 w-7 grid place-items-center rounded-full hover:bg-white/10 transition"
          aria-label="Add bookmark"
          title="Add bookmark"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {form && (
        <form onSubmit={submit} className="glass-subtle rounded-2xl p-3 mb-3 flex flex-col gap-2">
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Web address (example.com)"
            className="bg-white/5 rounded-lg px-3 py-2 text-sm outline-none border border-white/10 focus:border-white/30"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name (optional)"
            className="bg-white/5 rounded-lg px-3 py-2 text-sm outline-none border border-white/10 focus:border-white/30"
          />
          {error && <p className="text-xs text-red-300">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg py-2 text-sm font-medium text-white"
              style={{ background: "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))" }}
            >
              {form.mode === "edit" ? "Save" : "Add bookmark"}
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {ws.bookmarks.length === 0 && !form ? (
        <button
          type="button"
          onClick={() => openForm()}
          className="flex-1 rounded-2xl border border-dashed border-white/15 text-sm text-white/45 hover:text-white/70 hover:border-white/30 transition"
        >
          Add your first bookmark
        </button>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 flex-1 content-start overflow-y-auto">
          {ws.bookmarks.map((b, i) => (
            <a
              key={b.id}
              href={b.url}
              onClick={() => recordOpen({ url: b.url, title: b.title })}
              onAuxClick={(e) => e.button === 1 && recordOpen({ url: b.url, title: b.title })}
              draggable
              onDragStart={(e) => {
                setDragFrom(i);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                if (dragFrom === null) return;
                e.preventDefault();
                setDragOver(i);
              }}
              onDragLeave={() => setDragOver((o) => (o === i ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragFrom !== null) moveBookmark(ws.id, dragFrom, i);
                setDragFrom(null);
                setDragOver(null);
              }}
              onDragEnd={() => {
                setDragFrom(null);
                setDragOver(null);
              }}
              title={b.url}
              className={`glass-subtle group relative flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white/10 hover:-translate-y-0.5 transition ${dragFrom === i ? "opacity-40" : ""} ${dragOver === i && dragFrom !== i ? "ring-2 ring-white/40" : ""}`}
            >
              <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openForm(b);
                  }}
                  className="h-5 w-5 grid place-items-center rounded-full bg-black/40 hover:bg-white/25"
                  aria-label={`Edit ${b.title}`}
                >
                  <Pencil className="h-2.5 w-2.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeBookmark(ws.id, b.id);
                  }}
                  className="h-5 w-5 grid place-items-center rounded-full bg-black/40 hover:bg-red-500/60"
                  aria-label={`Remove ${b.title}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <SiteIcon url={b.url} title={b.title} />
              <span className="text-[11px] text-white/80 text-center leading-tight line-clamp-2">{b.title}</span>
            </a>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
