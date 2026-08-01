import { Download, Pencil, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useHydrated } from "@/hooks/useHydrated";
import { useClock, greetingFor, formatTime, formatDate } from "@/hooks/useClock";
import { useSettingsStore } from "@/stores/settings";
import { useLayoutStore } from "@/stores/layout";
import { OPEN_SETTINGS_EVENT } from "@/components/shell/CommandPalette";
import { SearchBar } from "@/components/widgets/SearchBar";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { SettingsSheet } from "./SettingsSheet";

export function TopBar() {
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
            onClick={() => {
              toast.loading("Preparing extension…", { id: "ext-dl" });
              fetch("/tabos-extension.zip")
                .then((res) => {
                  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
                  return res.blob();
                })
                .then((blob) => {
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = "tabos-extension.zip";
                  a.click();
                  URL.revokeObjectURL(a.href);
                  toast.success(
                    "Downloaded! Unzip, open chrome://extensions, enable Developer mode, then Load unpacked.",
                    { id: "ext-dl", duration: 8000 },
                  );
                })
                .catch((err) => toast.error(err.message, { id: "ext-dl" }));
            }}
            className="glass hidden md:flex items-center gap-2 h-10 px-3 hover:bg-white/10 transition text-xs font-medium"
            style={{ borderRadius: "var(--radius-pill)" }}
            aria-label="Download Chrome extension"
          >
            <Download className="h-3.5 w-3.5" />
            Get Extension
          </button>
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
