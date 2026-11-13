import { CommandPalette } from "@/components/shell/CommandPalette";
import { EditModeBar } from "@/components/shell/EditModeBar";
import { BgDimOverlay } from "@/components/shell/WorkspaceThemeSync";
import { DashboardGrid } from "@/components/shell/Dashboard";
import { Onboarding } from "@/components/shell/Onboarding";
import { useActiveWorkspace } from "@/stores/workspace";
import { ExtTopBar } from "./ExtTopBar";

export default function App() {
  const ws = useActiveWorkspace();
  return (
    <div className="min-h-screen w-full relative">
      <BgDimOverlay />
      <div className="relative z-10 mx-auto max-w-[1600px] px-4 md:px-8 py-6 md:py-10 space-y-6">
        <ExtTopBar />
        <DashboardGrid />
        <footer className="pt-4 pb-2 text-center text-[11px] text-white/30 uppercase tracking-[0.25em]">
          TabOS · {ws.name} workspace
        </footer>
      </div>
      <EditModeBar />
      <CommandPalette />
      <Onboarding />
    </div>
  );
}
