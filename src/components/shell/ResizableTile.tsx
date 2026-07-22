import { EyeOff, GripVertical } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import {
  useLayoutStore,
  MIN_COL,
  MAX_COL,
  MIN_ROW,
  MAX_ROW,
  type WidgetId,
  type Tile,
} from "@/stores/layout";
import { cn } from "@/lib/utils";

type Props = { id: WidgetId; children: ReactNode };

const ROW_HEIGHT = 148; // matches gridAutoRows base + gap
const GAP = 20;

export function ResizableTile({ id, children }: Props) {
  const tile = useLayoutStore((s) => s.tiles[id]);
  const enabled = useLayoutStore((s) => s.enabled[id]);
  const editMode = useLayoutStore((s) => s.editMode);
  const setTile = useLayoutStore((s) => s.setTile);
  const toggleEnabled = useLayoutStore((s) => s.toggleEnabled);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<Tile | null>(null);

  const startResize = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const el = wrapRef.current;
      const grid = el?.parentElement;
      if (!el || !grid) return;
      const gridRect = grid.getBoundingClientRect();
      const colWidth = (gridRect.width - GAP * 11) / 12 + GAP;
      const rowStep = ROW_HEIGHT + GAP;
      const startRect = el.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      const startCol = tile.col;
      const startRow = tile.row;
      const originW = startRect.width;
      const originH = startRect.height;

      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        const newW = originW + dx;
        const newH = originH + dy;
        const col = Math.max(
          MIN_COL,
          Math.min(MAX_COL, Math.round((newW + GAP) / colWidth)),
        );
        const row = Math.max(
          MIN_ROW,
          Math.min(MAX_ROW, Math.round((newH + GAP) / rowStep)),
        );
        if (col !== startCol || row !== startRow) setDrag({ col, row });
        else setDrag({ col: startCol, row: startRow });
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        setDrag((d) => {
          if (d) setTile(id, d);
          return null;
        });
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [id, setTile, tile.col, tile.row],
  );

  if (!enabled) return null;

  const active = drag ?? tile;

  return (
    <motion.div
      ref={wrapRef}
      layout
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className={cn(
        "relative group",
        editMode && "outline outline-1 outline-dashed outline-white/25 rounded-[calc(var(--radius-panel)+2px)]",
      )}
      style={{
        gridColumn: `span ${active.col} / span ${active.col}`,
        gridRow: `span ${active.row} / span ${active.row}`,
      }}
    >
      <div className="h-full w-full">{children}</div>

      {editMode && (
        <>
          <div className="absolute top-2 right-2 flex items-center gap-1 z-30">
            <button
              type="button"
              onClick={() => toggleEnabled(id)}
              className="glass-subtle grid h-7 w-7 place-items-center rounded-full text-white/80 hover:text-white hover:bg-white/15"
              aria-label="Hide widget"
              title="Hide"
            >
              <EyeOff className="h-3 w-3" />
            </button>
          </div>
          <div className="absolute bottom-1 left-2 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full glass-subtle text-white/70 z-30 pointer-events-none">
            {active.col}×{active.row}
          </div>
          <button
            type="button"
            onPointerDown={startResize}
            className="absolute bottom-1 right-1 h-6 w-6 grid place-items-center rounded-md glass-subtle text-white/80 hover:text-white hover:bg-white/20 cursor-se-resize z-30 touch-none"
            aria-label="Resize widget"
            title="Drag to resize"
          >
            <GripVertical className="h-3 w-3 rotate-45" />
          </button>
        </>
      )}
    </motion.div>
  );
}
