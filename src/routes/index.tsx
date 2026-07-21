import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { TopBar } from "@/components/shell/TopBar";
import { BookmarksWidget } from "@/components/widgets/BookmarksWidget";
import { ClockWidget } from "@/components/widgets/ClockWidget";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { PomodoroWidget } from "@/components/widgets/PomodoroWidget";
import { TodosWidget } from "@/components/widgets/TodosWidget";
import { ConsistencyWidget } from "@/components/widgets/ConsistencyWidget";
import { NotesWidget } from "@/components/widgets/NotesWidget";
import { RecentActivityWidget } from "@/components/widgets/RecentActivityWidget";
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
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8 py-6 md:py-10 space-y-6">
        <TopBar />

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
            {/* Bookmarks — large hero */}
            <div className="col-span-12 lg:col-span-8 row-span-2">
              <BookmarksWidget />
            </div>
            {/* Clock */}
            <div className="col-span-6 lg:col-span-4">
              <ClockWidget />
            </div>
            {/* Weather */}
            <div className="col-span-6 lg:col-span-4">
              <WeatherWidget />
            </div>

            {/* Pomodoro */}
            <div className="col-span-12 md:col-span-6 lg:col-span-4 row-span-2">
              <PomodoroWidget />
            </div>
            {/* Todos */}
            <div className="col-span-12 md:col-span-6 lg:col-span-4 row-span-2">
              <TodosWidget />
            </div>
            {/* Consistency */}
            <div className="col-span-12 md:col-span-6 lg:col-span-4 row-span-2">
              <ConsistencyWidget />
            </div>

            {/* Notes */}
            <div className="col-span-12 md:col-span-6 lg:col-span-5 row-span-2">
              <NotesWidget />
            </div>
            {/* Recent */}
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
