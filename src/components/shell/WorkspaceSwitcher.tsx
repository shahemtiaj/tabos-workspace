import { useWorkspaceStore } from "@/stores/workspace";
import { motion } from "motion/react";

export function WorkspaceSwitcher() {
  const { workspaces, activeId, setActive } = useWorkspaceStore();
  return (
    <div
      className="glass flex items-center gap-1 p-1"
      style={{ borderRadius: "var(--radius-pill)" }}
    >
      {workspaces.map((w) => {
        const active = w.id === activeId;
        return (
          <button
            key={w.id}
            onClick={() => setActive(w.id)}
            className="relative px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors"
            style={{ color: active ? "white" : "rgba(255,255,255,0.55)" }}
          >
            {active && (
              <motion.span
                layoutId="ws-pill"
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${w.accent}, ${w.accent2})`,
                  boxShadow: `0 4px 20px -4px ${w.accent}80`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              />
            )}
            <span className="relative">{w.icon}</span>
            <span className="relative hidden md:inline">{w.name}</span>
          </button>
        );
      })}
    </div>
  );
}
