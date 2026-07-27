import { AnimatePresence, motion } from "motion/react";
import { X, Trash2, Plus, Copy, Locate, RotateCcw, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useSettingsStore, type SearchEngine, type FontFamily, type LocationMode } from "@/stores/settings";
import { useWorkspaceStore } from "@/stores/workspace";
import { useLayoutStore, OPTIONAL_WIDGETS, type WidgetId } from "@/stores/layout";
import { isExtension } from "@/lib/env";

type Props = { open: boolean; onClose: () => void };

const CORE_WIDGETS: { id: WidgetId; label: string }[] = [
  { id: "bookmarks", label: "Bookmarks" },
  { id: "clock", label: "Clock" },
  { id: "weather", label: "Weather" },
  { id: "pomodoro", label: "Pomodoro" },
  { id: "todos", label: "Todos" },
  { id: "consistency", label: "Consistency" },
  { id: "notes", label: "Notes" },
  { id: "activity", label: "Recent Activity" },
];

const OPTIONAL_META: Record<string, { label: string; desc: string }> = {
  worldClocks: { label: "World Clocks", desc: "Multi-timezone strip" },
  quote: { label: "Daily Quote", desc: "Rotating inspiration" },
  scratchpad: { label: "Scratchpad", desc: "Fast throwaway notes" },
  heatmap: { label: "Habit Heatmap", desc: "13-week consistency grid" },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 gap-4">
      <label className="text-sm text-white/70">{label}</label>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-3xl p-5">
      <h2 className="text-[11px] font-semibold text-white/60 uppercase tracking-[0.2em] mb-1">
        {title}
      </h2>
      <div>{children}</div>
    </div>
  );
}

export function SettingsSheet({ open, onClose }: Props) {
  const s = useSettingsStore();
  const {
    workspaces,
    activeId,
    setActive,
    createWorkspace,
    deleteWorkspace,
    duplicateWorkspace,
    renameWorkspace,
  } = useWorkspaceStore();
  const layout = useLayoutStore();
  const [newName, setNewName] = useState("");

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const detectLocation = async () => {
    // In the extension (chrome://newtab), navigator.geolocation triggers a
    // permission warning and is unreliable — use the same IP fallback the
    // WeatherWidget uses. On the web app, keep the precise GPS prompt.
    if (isExtension) {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (typeof data.latitude === "number") s.setManualLat(Number(data.latitude.toFixed(4)));
        if (typeof data.longitude === "number") s.setManualLon(Number(data.longitude.toFixed(4)));
        if (data.city && !s.manualCity) s.setManualCity(data.city);
      } catch {
        /* ignore */
      }
      return;
    }
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        s.setManualLat(Number(pos.coords.latitude.toFixed(4)));
        s.setManualLon(Number(pos.coords.longitude.toFixed(4)));
      },
      undefined,
      { timeout: 6000 },
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 240, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full sm:max-w-[520px] z-50 overflow-y-auto"
            role="dialog"
            aria-label="Settings"
          >
            <div
              className="min-h-full p-4 md:p-6 space-y-4"
              style={{
                background:
                  "linear-gradient(180deg, rgba(20,20,50,0.98), rgba(10,10,26,0.98))",
              }}
            >
              <div className="flex items-center justify-between sticky top-0 -mx-4 md:-mx-6 px-4 md:px-6 py-3 backdrop-blur-xl bg-black/30 z-10 border-b border-white/5">
                <h1 className="text-xl font-semibold text-gradient">Settings</h1>
                <button
                  onClick={onClose}
                  className="glass grid h-9 w-9 place-items-center rounded-full hover:bg-white/10"
                  aria-label="Close settings"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <Section title="General">
                <Row label="Your name">
                  <input
                    value={s.userName}
                    onChange={(e) => s.setUserName(e.target.value)}
                    className="glass-subtle rounded-full px-4 py-2 text-sm outline-none w-56"
                  />
                </Row>
                <Row label="Search engine">
                  <select
                    value={s.searchEngine}
                    onChange={(e) => s.setSearchEngine(e.target.value as SearchEngine)}
                    className="glass-subtle rounded-full px-4 py-2 text-sm outline-none"
                  >
                    <option value="google" className="bg-neutral-900">Google</option>
                    <option value="duckduckgo" className="bg-neutral-900">DuckDuckGo</option>
                    <option value="brave" className="bg-neutral-900">Brave</option>
                    <option value="bing" className="bg-neutral-900">Bing</option>
                  </select>
                </Row>
                <Row label="Show seconds on clock">
                  <input
                    type="checkbox"
                    checked={s.clockSeconds}
                    onChange={(e) => s.setClockSeconds(e.target.checked)}
                    className="h-5 w-5 accent-indigo-500"
                  />
                </Row>
                <Row label="24-hour clock">
                  <input
                    type="checkbox"
                    checked={s.clock24h}
                    onChange={(e) => s.setClock24h(e.target.checked)}
                    className="h-5 w-5 accent-indigo-500"
                  />
                </Row>
              </Section>

              <Section title="Weather & Location">
                <Row label="Location source">
                  <select
                    value={s.locationMode}
                    onChange={(e) => s.setLocationMode(e.target.value as LocationMode)}
                    className="glass-subtle rounded-full px-4 py-2 text-sm outline-none"
                  >
                    <option value="auto" className="bg-neutral-900">Auto (IP / GPS)</option>
                    <option value="manual" className="bg-neutral-900">Manual</option>
                  </select>
                </Row>
                {s.locationMode === "manual" && (
                  <>
                    <Row label="City label">
                      <input
                        value={s.manualCity}
                        onChange={(e) => s.setManualCity(e.target.value)}
                        placeholder="e.g. Dhaka"
                        className="glass-subtle rounded-full px-4 py-2 text-sm outline-none w-56"
                      />
                    </Row>
                    <Row label="Latitude">
                      <input
                        type="number"
                        step="0.0001"
                        value={s.manualLat ?? ""}
                        onChange={(e) =>
                          s.setManualLat(e.target.value === "" ? null : Number(e.target.value))
                        }
                        placeholder="23.8103"
                        className="glass-subtle rounded-full px-4 py-2 text-sm outline-none w-40"
                      />
                    </Row>
                    <Row label="Longitude">
                      <input
                        type="number"
                        step="0.0001"
                        value={s.manualLon ?? ""}
                        onChange={(e) =>
                          s.setManualLon(e.target.value === "" ? null : Number(e.target.value))
                        }
                        placeholder="90.4125"
                        className="glass-subtle rounded-full px-4 py-2 text-sm outline-none w-40"
                      />
                    </Row>
                    <Row label="Detect from GPS">
                      <button
                        type="button"
                        onClick={detectLocation}
                        className="glass-subtle rounded-full px-3 py-2 text-xs flex items-center gap-1 hover:bg-white/10"
                      >
                        <Locate className="h-3 w-3" /> Detect
                      </button>
                    </Row>
                  </>
                )}
                <Row label="Temperature unit">
                  <div className="flex glass-subtle rounded-full p-0.5">
                    {(["c", "f"] as const).map((u) => (
                      <button
                        key={u}
                        onClick={() => s.setTempUnit(u)}
                        className={`px-3 py-1 text-xs rounded-full ${s.tempUnit === u ? "bg-white/15 text-white" : "text-white/50"}`}
                      >
                        °{u.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </Row>
              </Section>

              <Section title="Appearance">
                <Row label="Font family">
                  <select
                    value={s.fontFamily}
                    onChange={(e) => s.setFontFamily(e.target.value as FontFamily)}
                    className="glass-subtle rounded-full px-4 py-2 text-sm outline-none"
                  >
                    <option value="poppins" className="bg-neutral-900">Poppins</option>
                    <option value="space-grotesk" className="bg-neutral-900">Space Grotesk</option>
                    <option value="inter" className="bg-neutral-900">Inter</option>
                    <option value="system" className="bg-neutral-900">System</option>
                  </select>
                </Row>
                <Row label={`Glass blur (${s.glassBlur}px)`}>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={s.glassBlur}
                    onChange={(e) => s.setGlassBlur(Number(e.target.value))}
                    className="w-56 accent-indigo-500"
                  />
                </Row>
                <Row label={`Glass intensity (${s.glassIntensity}%)`}>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={s.glassIntensity}
                    onChange={(e) => s.setGlassIntensity(Number(e.target.value))}
                    className="w-56 accent-indigo-500"
                  />
                </Row>
                <Row label={`Panel radius (${s.radius}px)`}>
                  <input
                    type="range"
                    min={8}
                    max={48}
                    value={s.radius}
                    onChange={(e) => s.setRadius(Number(e.target.value))}
                    className="w-56 accent-indigo-500"
                  />
                </Row>
                <Row label={`UI scale (${s.uiScale}%)`}>
                  <input
                    type="range"
                    min={80}
                    max={130}
                    value={s.uiScale}
                    onChange={(e) => s.setUiScale(Number(e.target.value))}
                    className="w-56 accent-indigo-500"
                  />
                </Row>
                <Row label={`Background dim (${s.bgDim}%)`}>
                  <input
                    type="range"
                    min={0}
                    max={70}
                    value={s.bgDim}
                    onChange={(e) => s.setBgDim(Number(e.target.value))}
                    className="w-56 accent-indigo-500"
                  />
                </Row>
              </Section>

              <Section title="Widgets & Layout">
                <div className="flex items-center justify-between pb-3">
                  <button
                    onClick={() => {
                      layout.setEditMode(!layout.editMode);
                      if (!layout.editMode) onClose();
                    }}
                    className="glass-subtle rounded-full px-3 py-1.5 text-xs flex items-center gap-1 hover:bg-white/10"
                  >
                    <Pencil className="h-3 w-3" />
                    {layout.editMode ? "Exit edit mode" : "Enter edit mode to resize"}
                  </button>
                  <button
                    onClick={() => layout.reset()}
                    className="glass-subtle rounded-full px-3 py-1.5 text-xs flex items-center gap-1 hover:bg-white/10"
                  >
                    <RotateCcw className="h-3 w-3" /> Reset
                  </button>
                </div>

                <div className="text-[10px] uppercase tracking-widest text-white/40 mt-2 mb-1">Core</div>
                <div className="space-y-2">
                  {CORE_WIDGETS.map((w) => {
                    const t = layout.tiles[w.id];
                    return (
                      <div key={w.id} className="glass-subtle rounded-2xl px-3 py-2 flex items-center gap-3">
                        <span className="flex-1 text-sm">{w.label}</span>
                        <span className="text-[10px] text-white/40 tabular-nums">{t.col}×{t.row}</span>
                        <label className="flex items-center gap-1 text-xs text-white/60 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={layout.enabled[w.id]}
                            onChange={() => layout.toggleEnabled(w.id)}
                            className="h-4 w-4 accent-indigo-500"
                          />
                          Show
                        </label>
                      </div>
                    );
                  })}
                </div>

                <div className="text-[10px] uppercase tracking-widest text-white/40 mt-4 mb-1">Optional</div>
                <div className="space-y-2">
                  {OPTIONAL_WIDGETS.map((id) => {
                    const meta = OPTIONAL_META[id];
                    const t = layout.tiles[id];
                    return (
                      <div key={id} className="glass-subtle rounded-2xl px-3 py-2 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">{meta.label}</div>
                          <div className="text-[10px] text-white/50 truncate">{meta.desc}</div>
                        </div>
                        <span className="text-[10px] text-white/40 tabular-nums">{t.col}×{t.row}</span>
                        <label className="flex items-center gap-1 text-xs text-white/60 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={layout.enabled[id]}
                            onChange={() => layout.toggleEnabled(id)}
                            className="h-4 w-4 accent-indigo-500"
                          />
                          Enable
                        </label>
                      </div>
                    );
                  })}
                </div>
              </Section>

              <Section title="Workspaces">
                <div className="space-y-2 pt-1">
                  {workspaces.map((w) => (
                    <div
                      key={w.id}
                      className="glass-subtle rounded-2xl px-3 py-2 flex items-center gap-3"
                      style={{ borderLeft: `3px solid ${w.accent}` }}
                    >
                      <span className="text-xl">{w.icon}</span>
                      <input
                        value={w.name}
                        onChange={(e) => renameWorkspace(w.id, e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm min-w-0"
                      />
                      <button
                        onClick={() => setActive(w.id)}
                        className={`text-[11px] px-2.5 py-1 rounded-full ${activeId === w.id ? "text-white" : "text-white/60 hover:text-white bg-white/5"}`}
                        style={
                          activeId === w.id
                            ? { background: `linear-gradient(135deg, ${w.accent}, ${w.accent2})` }
                            : undefined
                        }
                      >
                        {activeId === w.id ? "Active" : "Use"}
                      </button>
                      <button
                        onClick={() => duplicateWorkspace(w.id)}
                        className="h-7 w-7 grid place-items-center rounded-full hover:bg-white/10 text-white/60"
                        aria-label="Duplicate"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteWorkspace(w.id)}
                        disabled={workspaces.length <= 1}
                        className="h-7 w-7 grid place-items-center rounded-full hover:bg-red-500/20 text-white/60 disabled:opacity-30"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newName.trim()) return;
                    createWorkspace({ name: newName.trim() });
                    setNewName("");
                  }}
                  className="glass-subtle mt-3 flex items-center gap-2 pl-4 pr-1 py-1 rounded-full"
                >
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="New workspace name…"
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/40"
                  />
                  <button
                    type="submit"
                    className="h-8 px-3 rounded-full text-sm text-white flex items-center gap-1"
                    style={{
                      background: "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))",
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" /> Create
                  </button>
                </form>
              </Section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
