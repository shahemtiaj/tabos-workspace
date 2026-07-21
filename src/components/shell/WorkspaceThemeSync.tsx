import { useEffect } from "react";
import { useActiveWorkspace } from "@/stores/workspace";
import { useSettingsStore, FONT_STACKS } from "@/stores/settings";

export function WorkspaceThemeSync() {
  const ws = useActiveWorkspace();
  const { glassBlur, glassIntensity, radius, fontFamily, uiScale, bgDim } =
    useSettingsStore();

  useEffect(() => {
    if (!ws) return;
    const root = document.documentElement;
    root.style.setProperty("--ws-accent", ws.accent);
    root.style.setProperty("--ws-accent-2", ws.accent2);
    root.style.setProperty("--glass-blur", `${glassBlur}px`);
    root.style.setProperty(
      "--glass-bg",
      `color-mix(in oklab, white ${glassIntensity}%, transparent)`,
    );
    root.style.setProperty(
      "--glass-bg-strong",
      `color-mix(in oklab, white ${Math.min(glassIntensity + 4, 20)}%, transparent)`,
    );
    root.style.setProperty("--radius-panel", `${radius}px`);
    root.style.setProperty("--radius-card", `${Math.max(radius - 8, 12)}px`);

    // Font family — set on body so the whole app inherits it.
    document.body.style.fontFamily = FONT_STACKS[fontFamily];

    // UI scale via root font-size (rem-based sizes scale, px stays fixed).
    root.style.fontSize = `${uiScale}%`;

    // Background dim overlay — expose as a CSS var; overlay rendered separately.
    root.style.setProperty("--bg-dim", `${bgDim / 100}`);
  }, [ws, glassBlur, glassIntensity, radius, fontFamily, uiScale, bgDim]);

  return null;
}

/** Fixed overlay for the bgDim setting. Render once near the app root. */
export function BgDimOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{ background: "black", opacity: "var(--bg-dim, 0)" }}
    />
  );
}
