import { useMemo, useState } from "react";
import { Eye, Pencil, ExternalLink } from "lucide-react";
import { useNotesStore } from "@/stores/notes";
import { GlassCard } from "@/components/glass/GlassPanel";

const URL_RE = /((?:https?:\/\/|www\.)[^\s<>()]+[^\s<>().,;:!?'"])/gi;

const href = (raw: string) => (raw.startsWith("http") ? raw : `https://${raw}`);

/** Splits text into plain segments and clickable links. */
function linkify(text: string) {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  URL_RE.lastIndex = 0;
  while ((m = URL_RE.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const url = m[0];
    nodes.push(
      <a
        key={`${m.index}-${url}`}
        href={href(url)}
        target="_blank"
        rel="noreferrer noopener"
        className="underline decoration-white/30 underline-offset-2 hover:decoration-white transition"
        style={{ color: "var(--ws-accent-2, #a5b4fc)" }}
      >
        {url}
      </a>,
    );
    last = m.index + url.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function NotesWidget() {
  const { content, set } = useNotesStore();
  const [preview, setPreview] = useState(false);

  const links = useMemo(() => {
    URL_RE.lastIndex = 0;
    return Array.from(new Set(content.match(URL_RE) ?? []));
  }, [content]);

  return (
    <GlassCard className="p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 gap-2">
        <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Notes</h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40">autosaved</span>
          <button
            onClick={() => setPreview((p) => !p)}
            className="glass-subtle h-7 px-2.5 rounded-full text-[10px] uppercase tracking-widest text-white/70 hover:bg-white/10 flex items-center gap-1.5"
            aria-label={preview ? "Edit notes" : "Preview notes"}
          >
            {preview ? <Pencil className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {preview ? "Edit" : "Links"}
          </button>
        </div>
      </div>

      {preview ? (
        <div className="flex-1 min-h-0 overflow-y-auto whitespace-pre-wrap break-words text-sm text-white/85 font-mono leading-relaxed">
          {content ? linkify(content) : <span className="text-white/30">Nothing yet…</span>}
        </div>
      ) : (
        <textarea
          value={content}
          onChange={(e) => set(e.target.value)}
          placeholder="Write anything…"
          spellCheck={false}
          className="flex-1 resize-none bg-transparent outline-none text-sm text-white/85 placeholder:text-white/30 font-mono leading-relaxed"
        />
      )}

      {!preview && links.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
          {links.slice(0, 6).map((l) => (
            <a
              key={l}
              href={href(l)}
              target="_blank"
              rel="noreferrer noopener"
              className="glass-subtle max-w-[180px] truncate rounded-full px-2.5 py-1 text-[11px] text-white/70 hover:bg-white/10 flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              <span className="truncate">{l.replace(/^https?:\/\//, "")}</span>
            </a>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
