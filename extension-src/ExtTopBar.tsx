import { Pencil, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useHydrated } from "@/hooks/useHydrated";
import { useClock, greetingFor, formatTime, formatDate } from "@/hooks/useClock";
import { useSettingsStore } from "@/stores/settings";
import { useLayoutStore } from "@/stores/layout";
import { OPEN_SETTINGS_EVENT } from "@/components/shell/CommandPalette";
import { SearchBar } from "@/components/widgets/SearchBar";
import { WorkspaceSwitcher } from "@/components/shell/WorkspaceSwitcher";
import { SettingsSheet } from "@/components/shell/SettingsSheet";

// Router-free TopBar for the standalone extension build.
export function ExtTopBar() {
  const hydrated = useHydrated();
  const now = useClock();
  const { userName, clockSeconds, clock24h } = useSettingsStore();
  const editMode = useLayoutStore((s) => s.editMode);
  const setEditMode = useLayoutStore((s) => s.setEditMode);
  const [open, setOpen] = useState(false);

  // Opened from the Cmd/Ctrl-K command palette
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, handler);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, handler);
  }, []);

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-[0.2em] text-white/40">
          {hydrated && now ? formatDate(now) : "\u00A0"}
        </div>
        <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight text-gradient truncate">
          {hydrated && now ? `${greetingFor(now)}, ${userName}` : `Hello, ${userName}`}
        </h1>
      </div>
      <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
        <SearchBar />
        <WorkspaceSwitcher />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEditMode(!editMode)}
            className={`glass grid h-10 w-10 place-items-center hover:bg-white/10 transition ${editMode ? "ring-2 ring-white/40" : ""}`}
            style={{ borderRadius: "var(--radius-pill)" }}
            aria-label="Edit layout"
            title="Edit layout"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="glass grid h-10 w-10 place-items-center hover:bg-white/10 transition"
            style={{ borderRadius: "var(--radius-pill)" }}
            aria-label="Open settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <div
            className="glass grid h-10 w-10 place-items-center"
            style={{ borderRadius: "var(--radius-pill)" }}
            aria-label="Profile"
          >
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>
      <div className="lg:hidden text-2xl font-mono tabular-nums text-white/80">
        {hydrated && now ? formatTime(now, { seconds: clockSeconds, h24: clock24h }) : ""}
      </div>
      <SettingsSheet open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
