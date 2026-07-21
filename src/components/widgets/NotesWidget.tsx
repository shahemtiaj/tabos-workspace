import { useNotesStore } from "@/stores/notes";
import { GlassCard } from "@/components/glass/GlassPanel";

export function NotesWidget() {
  const { content, set } = useNotesStore();
  return (
    <GlassCard className="p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Notes</h2>
        <span className="text-[10px] text-white/40">autosaved</span>
      </div>
      <textarea
        value={content}
        onChange={(e) => set(e.target.value)}
        placeholder="Write anything…"
        spellCheck={false}
        className="flex-1 resize-none bg-transparent outline-none text-sm text-white/85 placeholder:text-white/30 font-mono leading-relaxed"
      />
    </GlassCard>
  );
}
