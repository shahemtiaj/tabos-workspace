import { useState } from "react";
import { Plus, X, ExternalLink } from "lucide-react";
import { useActiveWorkspace, useWorkspaceStore } from "@/stores/workspace";
import { GlassCard } from "@/components/glass/GlassPanel";
import { motion } from "motion/react";

function faviconFor(url: string) {
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=128`;
  } catch {
    return "";
  }
}

export function BookmarksWidget() {
  const ws = useActiveWorkspace();
  const { addBookmark, removeBookmark } = useWorkspaceStore();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const submit = () => {
    if (!title || !url) return;
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    addBookmark(ws.id, { title, url: normalized });
    setTitle("");
    setUrl("");
    setAdding(false);
  };

  return (
    <GlassCard className="p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Bookmarks</h2>
        <button
          onClick={() => setAdding((v) => !v)}
          className="glass-subtle h-7 w-7 grid place-items-center rounded-full hover:bg-white/10 transition"
          aria-label="Add bookmark"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {adding && (
        <div className="glass-subtle rounded-2xl p-3 mb-3 flex flex-col gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="bg-white/5 rounded-lg px-3 py-2 text-sm outline-none border border-white/10 focus:border-white/30"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className="bg-white/5 rounded-lg px-3 py-2 text-sm outline-none border border-white/10 focus:border-white/30"
          />
          <button
            onClick={submit}
            className="rounded-lg py-2 text-sm font-medium text-white"
            style={{ background: "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))" }}
          >
            Add bookmark
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 flex-1 content-start">
        {ws.bookmarks.map((b) => (
          <motion.a
            key={b.id}
            href={b.url}
            whileHover={{ y: -3, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="glass-subtle group relative flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white/10 transition"
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                removeBookmark(ws.id, b.id);
              }}
              className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition h-5 w-5 grid place-items-center rounded-full bg-black/40 hover:bg-red-500/60"
              aria-label="Remove"
            >
              <X className="h-3 w-3" />
            </button>
            <div
              className="h-10 w-10 rounded-xl grid place-items-center overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${ws.accent}30, ${ws.accent2}30)`,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <img
                src={faviconFor(b.url)}
                alt=""
                className="h-6 w-6"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <span className="text-[11px] text-white/80 text-center leading-tight line-clamp-2">
              {b.title}
            </span>
          </motion.a>
        ))}
      </div>
    </GlassCard>
  );
}
