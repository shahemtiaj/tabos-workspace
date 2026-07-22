import { Eraser, StickyNote } from "lucide-react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GlassPanel } from "@/components/glass/GlassPanel";

type S = { text: string; set: (t: string) => void };
const useScratch = create<S>()(
  persist((set) => ({ text: "", set: (text) => set({ text }) }), { name: "tabos-scratchpad" }),
);

export function ScratchpadWidget() {
  const { text, set } = useScratch();
  return (
    <GlassPanel className="h-full w-full p-5 flex flex-col">
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-white/50 mb-2">
        <span className="flex items-center gap-2"><StickyNote className="h-3.5 w-3.5" /> Scratchpad</span>
        <button
          onClick={() => set("")}
          className="glass-subtle h-7 w-7 grid place-items-center rounded-full hover:bg-white/10"
          aria-label="Clear"
        >
          <Eraser className="h-3 w-3" />
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => set(e.target.value)}
        placeholder="Quick thoughts…"
        className="flex-1 w-full resize-none bg-transparent outline-none text-sm text-white/90 placeholder:text-white/30 leading-relaxed"
      />
    </GlassPanel>
  );
}
