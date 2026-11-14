import { AnimatePresence, motion } from "motion/react";
import { X, Trash2, Plus, Copy, RotateCcw, Pencil, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { exportBackup, importBackup, eraseAll } from "@/lib/backup";
import { useEffect, useState } from "react";
import { TABOS_VERSION } from "@/lib/version";
import { useSettingsStore, type SearchEngine, type FontFamily } from "@/stores/settings";
import { useWorkspaceStore } from "@/stores/workspace";
import { useLayoutStore, OPTIONAL_WIDGETS, type WidgetId } from "@/stores/layout";
import { LocationPicker } from "./LocationPicker";

type Props = { open: boolean; onClose: () => void };

const CORE_WIDGETS: { id: WidgetId; label: string }[] = [
  { id: "bookmarks", label: "Bookmarks" },
  { id: "clock", label: "Clock" },
  { id: "weather", label: "Weather" },
  { id: "pomodoro", label: "Pomodoro" },
  { id: "todos", label: "Todos" },
  { id: "consistency", label: "Consistency" },
  { id: "notes", label: "Notes" },
  { id: "calculator", label: "Calculator" },
  { id: "activity", label: "Recent Activity" },
];

const OPTIONAL_META: Record<string, { label: string; desc: string }> = {
  worldClocks: { label: "World Clocks", desc: "Multi-timezone strip" },
  quote: { label: "Daily Quote", desc: "Rotating inspiration" },
  scratchpad: { label: "Scratchpad", desc: "Fast throwaway notes" },
  heatmap: { label: "Habit Heatmap", desc: "13-week consistency grid" },
  countdown: { label: "Countdowns", desc: "Days until your key dates" },
  ambient: { label: "Focus Sounds", desc: "Rain / brown noise / waves" },
  readLater: { label: "Read Later", desc: "Stash links to read next" },
  water: { label: "Hydration", desc: "Daily water intake tracker" },
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
    restoreWorkspace,
  } = useWorkspaceStore();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [backupNote, setBackupNote] = useState<string | null>(null);

  const removeWorkspace = (id: string) => {
    if (confirmId !== id) {
      // first click arms the button; it disarms itself after a few seconds
      setConfirmId(id);
      setTimeout(() => setConfirmId((c) => (c === id ? null : c)), 3000);
      return;
    }
    setConfirmId(null);
    const index = workspaces.findIndex((w) => w.id === id);
    const ws = workspaces[index];
    if (!ws) return;
    const wasActive = activeId === id;
    deleteWorkspace(id);
    toast(`Deleted "${ws.name}"`, {
      description: `${ws.bookmarks.length} bookmark${ws.bookmarks.length === 1 ? "" : "s"} removed`,
      action: { label: "Undo", onClick: () => restoreWorkspace(ws, index, wasActive) },
      duration: 8000,
    });
  };
  const layout = useLayoutStore();
  const [newName, setNewName] = useState("");

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
                <Row label="Recent search suggestions">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={s.recentSearchLimit}
                      onChange={(e) => s.setRecentSearchLimit(Number(e.target.value))}
                      className="w-40 accent-indigo-500"
                    />
                    <span className="text-xs text-white/60 w-8 text-right">
                      {s.recentSearchLimit === 0 ? "Off" : s.recentSearchLimit}
                    </span>
                  </div>
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
                <div className="py-3 border-b border-white/5">
                  <LocationPicker />
                </div>
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
                        onClick={() => removeWorkspace(w.id)}
                        disabled={workspaces.length <= 1}
                        className={`h-7 grid place-items-center rounded-full disabled:opacity-30 transition-all ${confirmId === w.id ? "px-2.5 bg-red-500/70 text-white text-[11px]" : "w-7 hover:bg-red-500/20 text-white/60"}`}
                        aria-label={confirmId === w.id ? `Confirm delete ${w.name}` : `Delete ${w.name}`}
                        title={workspaces.length <= 1 ? "You need at least one workspace" : "Delete"}
                      >
                        {confirmId === w.id ? "Delete?" : <Trash2 className="h-3.5 w-3.5" />}
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

              <Section title="Backup">
                <p className="text-xs text-white/50 py-2">
                  Your TabOS data is saved only in this browser. Download a backup to keep it safe or to move it
                  to another computer.
                </p>
                <div className="flex flex-wrap gap-2 pb-2">
                  <button
                    onClick={() => {
                      exportBackup();
                      setBackupNote("Backup downloaded.");
                    }}
                    className="glass-subtle rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5 hover:bg-white/10"
                  >
                    <Download className="h-3 w-3" /> Download backup
                  </button>
                  <label className="glass-subtle rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5 hover:bg-white/10 cursor-pointer">
                    <Upload className="h-3 w-3" /> Restore from file
                    <input
                      type="file"
                      accept="application/json,.json"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        if (!window.confirm("Replace everything in TabOS with this backup?")) return;
                        try {
                          await importBackup(file);
                          window.location.reload();
                        } catch (err) {
                          setBackupNote((err as Error).message);
                        }
                      }}
                    />
                  </label>
                  <button
                    onClick={() => {
                      if (!window.confirm("Erase all TabOS data on this computer? This can't be undone — download a backup first if you might want it.")) return;
                      eraseAll();
                      window.location.reload();
                    }}
                    className="rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5 text-red-200/80 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-3 w-3" /> Erase all data
                  </button>
                </div>
                {backupNote && <p className="text-[11px] text-white/55 pb-2">{backupNote}</p>}
              </Section>

              <div
                className="glass p-4 text-[11px] leading-relaxed text-white/50"
                style={{ borderRadius: "var(--radius-card)" }}
              >
                <p className="text-white/70 font-medium mb-1">Privacy</p>
                TabOS requests no browser permissions and collects no personal data. Everything you create
                stays in this browser. It only goes online for: the weather, if you turn it on (Open-Meteo,
                at most every 30 minutes); your approximate area, only if you choose "Use my approximate
                area" (GeoJS, at most once a day); bookmark icons (Google); and the searches you make.
              </div>

              <div className="pt-1 pb-2 text-center">
                <p className="text-[11px] text-white/45">
                  Build With Love by{" "}
                  <a
                    href="https://shahemtiaj.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-white/80 hover:text-white underline underline-offset-2"
                  >
                    Shah Emtiaj
                  </a>
                </p>
                <p className="text-[10px] text-white/30 mt-0.5">
                  shahemtiaj.com · TabOS v{TABOS_VERSION}
                </p>
              </div>
            </div>

          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
