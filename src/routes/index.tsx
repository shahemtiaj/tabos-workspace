import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/shell/TopBar";
import { ExtensionDownloadBanner } from "@/components/shell/ExtensionDownloadBanner";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { DashboardGrid } from "@/components/shell/Dashboard";
import { Onboarding } from "@/components/shell/Onboarding";
import { Toaster } from "@/components/ui/sonner";
import { EditModeBar } from "@/components/shell/EditModeBar";
import { BgDimOverlay } from "@/components/shell/WorkspaceThemeSync";
import { useActiveWorkspace } from "@/stores/workspace";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TabOS — Your New Tab, Reimagined" },
      { name: "description", content: "A luxurious glass workspace that replaces Chrome's New Tab: bookmarks, tasks, consistency, focus timer, notes and more." },
      { property: "og:title", content: "TabOS — Your New Tab, Reimagined" },
      { property: "og:description", content: "A luxurious glass workspace that replaces Chrome's New Tab." },
    ],
  }),
  component: NewTab,
});

function NewTab() {
  const ws = useActiveWorkspace();
  return (
    <div className="min-h-screen w-full relative">
      <BgDimOverlay />
      <div className="relative z-10 mx-auto max-w-[1600px] px-4 md:px-8 py-6 md:py-10 space-y-6">
        <TopBar />
        <ExtensionDownloadBanner />
        <DashboardGrid />
        <footer className="pt-4 pb-2 text-center text-[11px] text-white/30 uppercase tracking-[0.25em]">
          TabOS · {ws.name} workspace
        </footer>
      </div>
      <EditModeBar />
      <CommandPalette />
      <Onboarding />
      <Toaster />
    </div>
  );
}
