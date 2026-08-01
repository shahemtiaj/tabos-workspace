import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { TopBar } from "@/components/shell/TopBar";
import { ExtensionDownloadBanner } from "@/components/shell/ExtensionDownloadBanner";
import { SearchWidget } from "@/components/widgets/SearchWidget";
import { BookmarksWidget } from "@/components/widgets/BookmarksWidget";
import { ClockWidget } from "@/components/widgets/ClockWidget";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { PomodoroWidget } from "@/components/widgets/PomodoroWidget";
import { TodosWidget } from "@/components/widgets/TodosWidget";
import { ConsistencyWidget } from "@/components/widgets/ConsistencyWidget";
import { NotesWidget } from "@/components/widgets/NotesWidget";
import { RecentActivityWidget } from "@/components/widgets/RecentActivityWidget";
import { WorldClocksWidget } from "@/components/widgets/WorldClocksWidget";
import { QuoteWidget } from "@/components/widgets/QuoteWidget";
import { ScratchpadWidget } from "@/components/widgets/ScratchpadWidget";
import { HabitHeatmapWidget } from "@/components/widgets/HabitHeatmapWidget";
import { CountdownWidget } from "@/components/widgets/CountdownWidget";
import { CalculatorWidget } from "@/components/widgets/CalculatorWidget";
import { AmbientSoundWidget } from "@/components/widgets/AmbientSoundWidget";
import { ReadLaterWidget } from "@/components/widgets/ReadLaterWidget";
import { WaterWidget } from "@/components/widgets/WaterWidget";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { ResizableTile } from "@/components/shell/ResizableTile";
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
        <AnimatePresence mode="wait">
          <motion.section
            key={ws.id}
            initial={{ opacity: 0, filter: "blur(12px)", y: 12 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(12px)", y: -8 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-4 md:gap-5"
            style={{
              gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
              gridAutoRows: "minmax(140px, auto)",
            }}
          >
            <ResizableTile id="search"><SearchWidget /></ResizableTile>
            <ResizableTile id="bookmarks"><BookmarksWidget /></ResizableTile>
            <ResizableTile id="clock"><ClockWidget /></ResizableTile>
            <ResizableTile id="weather"><WeatherWidget /></ResizableTile>
            <ResizableTile id="pomodoro"><PomodoroWidget /></ResizableTile>
            <ResizableTile id="todos"><TodosWidget /></ResizableTile>
            <ResizableTile id="consistency"><ConsistencyWidget /></ResizableTile>
            <ResizableTile id="notes"><NotesWidget /></ResizableTile>
            <ResizableTile id="activity"><RecentActivityWidget /></ResizableTile>
            <ResizableTile id="worldClocks"><WorldClocksWidget /></ResizableTile>
            <ResizableTile id="quote"><QuoteWidget /></ResizableTile>
            <ResizableTile id="scratchpad"><ScratchpadWidget /></ResizableTile>
            <ResizableTile id="heatmap"><HabitHeatmapWidget /></ResizableTile>
            <ResizableTile id="countdown"><CountdownWidget /></ResizableTile>
            <ResizableTile id="calculator"><CalculatorWidget /></ResizableTile>
            <ResizableTile id="ambient"><AmbientSoundWidget /></ResizableTile>
            <ResizableTile id="readLater"><ReadLaterWidget /></ResizableTile>
            <ResizableTile id="water"><WaterWidget /></ResizableTile>
          </motion.section>
        </AnimatePresence>
        <footer className="pt-4 pb-2 text-center text-[11px] text-white/30 uppercase tracking-[0.25em]">
          TabOS · {ws.name} workspace
        </footer>
      </div>
      <EditModeBar />
      <CommandPalette />
    </div>
  );
}
