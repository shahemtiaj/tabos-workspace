import { AnimatePresence, motion } from "motion/react";
import { Check, RotateCcw } from "lucide-react";
import { useLayoutStore } from "@/stores/layout";

export function EditModeBar() {
  const editMode = useLayoutStore((s) => s.editMode);
  const setEditMode = useLayoutStore((s) => s.setEditMode);
  const reset = useLayoutStore((s) => s.reset);
  return (
    <AnimatePresence>
      {editMode && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass rounded-full px-4 py-2 flex items-center gap-2 shadow-2xl"
        >
          <span className="text-xs text-white/70 pl-2 pr-1">Editing layout · drag corners to resize</span>
          <button
            onClick={() => reset()}
            className="glass-subtle rounded-full px-3 py-1.5 text-xs flex items-center gap-1 hover:bg-white/10"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
          <button
            onClick={() => setEditMode(false)}
            className="rounded-full px-3 py-1.5 text-xs flex items-center gap-1 text-white"
            style={{ background: "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))" }}
          >
            <Check className="h-3 w-3" /> Done
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
