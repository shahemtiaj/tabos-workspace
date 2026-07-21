import { AnimatePresence, motion } from "motion/react";
import { BookmarksWidget } from "@/components/widgets/BookmarksWidget";
import { ClockWidget } from "@/components/widgets/ClockWidget";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { PomodoroWidget } from "@/components/widgets/PomodoroWidget";
import { TodosWidget } from "@/components/widgets/TodosWidget";
import { ConsistencyWidget } from "@/components/widgets/ConsistencyWidget";
import { NotesWidget } from "@/components/widgets/NotesWidget";
import { RecentActivityWidget } from "@/components/widgets/RecentActivityWidget";
import { useActiveWorkspace } from "@/stores/workspace";
import { ExtTopBar } from "./ExtTopBar";

export default function App() {
  const ws = useActiveWorkspace();
  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8 py-6 md:py-10 space-y-6">
        <ExtTopBar />
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
            <div className="col-span-12 lg:col-span-8 row-span-2">
              <BookmarksWidget />
            </div>
            <div className="col-span-6 lg:col-span-4">
              <ClockWidget />
            </div>
            <div className="col-span-6 lg:col-span-4">
              <WeatherWidget />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-4 row-span-2">
              <PomodoroWidget />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-4 row-span-2">
              <TodosWidget />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-4 row-span-2">
              <ConsistencyWidget />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-5 row-span-2">
              <NotesWidget />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-7 row-span-2">
              <RecentActivityWidget />
            </div>
          </motion.section>
        </AnimatePresence>
        <footer className="pt-4 pb-2 text-center text-[11px] text-white/30 uppercase tracking-[0.25em]">
          TabOS · {ws.name} workspace
        </footer>
      </div>
    </div>
  );
}
