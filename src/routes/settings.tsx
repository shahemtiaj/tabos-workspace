import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Trash2, Plus, Copy } from "lucide-react";
import { useState } from "react";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { useSettingsStore, type SearchEngine } from "@/stores/settings";
import { useWorkspaceStore } from "@/stores/workspace";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TabOS" },
      { name: "description", content: "Customize your TabOS: workspaces, appearance, glass intensity, blur, clock and search preferences." },
      { property: "og:title", content: "Settings — TabOS" },
      { property: "og:description", content: "Customize TabOS to match your workflow." },
    ],
  }),
  component: SettingsPage,
});

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 gap-4">
      <label className="text-sm text-white/70">{label}</label>
      <div>{children}</div>
    </div>
  );
}

function SettingsPage() {
  const s = useSettingsStore();
  const { workspaces, activeId, setActive, createWorkspace, deleteWorkspace, duplicateWorkspace, renameWorkspace } =
    useWorkspaceStore();
  const [newName, setNewName] = useState("");

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-[1000px] px-4 md:px-8 py-8 md:py-12 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="glass h-10 w-10 grid place-items-center hover:bg-white/10 transition"
            style={{ borderRadius: "var(--radius-pill)" }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-3xl font-semibold text-gradient">Settings</h1>
        </div>

        <GlassPanel className="p-6">
          <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-2">General</h2>
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
        </GlassPanel>

        <GlassPanel className="p-6">
          <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-2">Appearance</h2>
          <Row label={`Glass blur (${s.glassBlur}px)`}>
            <input
              type="range"
              min={8}
              max={48}
              value={s.glassBlur}
              onChange={(e) => s.setGlassBlur(Number(e.target.value))}
              className="w-56 accent-indigo-500"
            />
          </Row>
          <Row label={`Glass intensity (${s.glassIntensity}%)`}>
            <input
              type="range"
              min={2}
              max={16}
              value={s.glassIntensity}
              onChange={(e) => s.setGlassIntensity(Number(e.target.value))}
              className="w-56 accent-indigo-500"
            />
          </Row>
          <Row label={`Panel radius (${s.radius}px)`}>
            <input
              type="range"
              min={12}
              max={40}
              value={s.radius}
              onChange={(e) => s.setRadius(Number(e.target.value))}
              className="w-56 accent-indigo-500"
            />
          </Row>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">Workspaces</h2>
          <div className="space-y-2">
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
                  className="flex-1 bg-transparent outline-none text-sm"
                />
                <button
                  onClick={() => setActive(w.id)}
                  className={`text-xs px-3 py-1 rounded-full ${activeId === w.id ? "text-white" : "text-white/60 hover:text-white bg-white/5"}`}
                  style={activeId === w.id ? { background: `linear-gradient(135deg, ${w.accent}, ${w.accent2})` } : undefined}
                >
                  {activeId === w.id ? "Active" : "Activate"}
                </button>
                <button
                  onClick={() => duplicateWorkspace(w.id)}
                  className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/10 text-white/60"
                  aria-label="Duplicate"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => deleteWorkspace(w.id)}
                  disabled={workspaces.length <= 1}
                  className="h-8 w-8 grid place-items-center rounded-full hover:bg-red-500/20 text-white/60 disabled:opacity-30"
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
            className="glass-subtle mt-4 flex items-center gap-2 pl-4 pr-1 py-1 rounded-full"
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
              style={{ background: "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))" }}
            >
              <Plus className="h-3.5 w-3.5" /> Create
            </button>
          </form>
        </GlassPanel>
      </div>
    </div>
  );
}
