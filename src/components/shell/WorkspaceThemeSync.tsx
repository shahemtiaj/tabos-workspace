import { useEffect } from "react";
import { useActiveWorkspace } from "@/stores/workspace";
import { useSettingsStore } from "@/stores/settings";

export function WorkspaceThemeSync() {
  const ws = useActiveWorkspace();
  const { glassBlur, glassIntensity, radius } = useSettingsStore();

  useEffect(() => {
    if (!ws) return;
    const root = document.documentElement;
    root.style.setProperty("--ws-accent", ws.accent);
    root.style.setProperty("--ws-accent-2", ws.accent2);
    root.style.setProperty("--glass-blur", `${glassBlur}px`);
    root.style.setProperty("--glass-bg", `color-mix(in oklab, white ${glassIntensity}%, transparent)`);
    root.style.setProperty(
      "--glass-bg-strong",
      `color-mix(in oklab, white ${Math.min(glassIntensity + 4, 20)}%, transparent)`,
    );
    root.style.setProperty("--radius-panel", `${radius}px`);
    root.style.setProperty("--radius-card", `${Math.max(radius - 8, 12)}px`);
  }, [ws, glassBlur, glassIntensity, radius]);

  return null;
}
