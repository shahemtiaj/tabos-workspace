import { AnimatePresence, motion } from "motion/react";
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
import { ResizableTile } from "@/components/shell/ResizableTile";
import { useActiveWorkspace } from "@/stores/workspace";

/**
 * The widget grid, shared by the extension and the web app.
 * It animates when you switch workspace, but not when a new tab opens:
 * a new tab should be usable the instant it appears.
 */
export function DashboardGrid() {
  const ws = useActiveWorkspace();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.section
        key={ws.id}
        initial={{ opacity: 0, filter: "blur(12px)", y: 12 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        exit={{ opacity: 0, filter: "blur(12px)", y: -8 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="grid gap-4 md:gap-5"
        style={{
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          gridAutoRows: "minmax(140px, auto)",
          // fill holes left by tall or hidden widgets instead of leaving gaps
          gridAutoFlow: "row dense",
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
  );
}
