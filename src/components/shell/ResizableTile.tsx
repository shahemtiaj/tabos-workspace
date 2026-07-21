import { Maximize2, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { SIZE_SPANS, useLayoutStore, type WidgetId } from "@/stores/layout";
import { cn } from "@/lib/utils";

type Props = { id: WidgetId; children: ReactNode };

export function ResizableTile({ id, children }: Props) {
  const size = useLayoutStore((s) => s.sizes[id]);
  const hidden = useLayoutStore((s) => s.hidden[id]);
  const editMode = useLayoutStore((s) => s.editMode);
  const cycleSize = useLayoutStore((s) => s.cycleSize);
  const toggleHidden = useLayoutStore((s) => s.toggleHidden);

  if (hidden && !editMode) return null;

  const span = SIZE_SPANS[size ?? "md"];

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 240, damping: 28 }}
      className={cn("relative group", hidden && "opacity-40")}
      style={{
        gridColumn: `span ${span.col} / span ${span.col}`,
        gridRow: `span ${span.row} / span ${span.row}`,
      }}
    >
      {children}
      <div
        className={cn(
          "absolute top-2 right-2 flex items-center gap-1 transition-opacity z-20",
          editMode
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
        )}
      >
        <button
          type="button"
          onClick={() => cycleSize(id)}
          className="glass-subtle grid h-7 w-7 place-items-center rounded-full text-white/80 hover:text-white hover:bg-white/15"
          aria-label={`Resize (current: ${size})`}
          title={`Size: ${size} — click to cycle`}
        >
          <Maximize2 className="h-3 w-3" />
        </button>
        {editMode && (
          <button
            type="button"
            onClick={() => toggleHidden(id)}
            className="glass-subtle grid h-7 w-7 place-items-center rounded-full text-white/80 hover:text-white hover:bg-white/15"
            aria-label="Hide widget"
          >
            <EyeOff className="h-3 w-3" />
          </button>
        )}
      </div>
      {editMode && (
        <div className="absolute bottom-2 left-2 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full glass-subtle text-white/70 z-20">
          {size}
        </div>
      )}
    </motion.div>
  );
}
