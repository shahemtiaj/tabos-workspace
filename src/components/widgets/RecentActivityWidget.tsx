import { GlassCard } from "@/components/glass/GlassPanel";
import { useActiveWorkspace } from "@/stores/workspace";
import { Clock as ClockIcon } from "lucide-react";

// On web preview we don't have chrome.topSites — show top workspace bookmarks as "recent".
export function RecentActivityWidget() {
  const ws = useActiveWorkspace();
  const items = ws.bookmarks.slice(0, 8);

  return (
    <GlassCard className="p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Recent & Frequent</h2>
        <ClockIcon className="h-4 w-4 text-white/40" />
      </div>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 flex-1 content-start">
        {items.map((b) => {
          let host = "";
          try {
            host = new URL(b.url).hostname.replace("www.", "");
          } catch {
            host = b.url;
          }
          return (
            <a
              key={b.id}
              href={b.url}
              className="glass-subtle rounded-xl px-3 py-2 flex flex-col items-start hover:bg-white/10 transition min-w-0"
            >
              <span className="text-xs text-white/85 truncate w-full">{b.title}</span>
              <span className="text-[10px] text-white/40 truncate w-full">{host}</span>
            </a>
          );
        })}
      </div>
    </GlassCard>
  );
}
