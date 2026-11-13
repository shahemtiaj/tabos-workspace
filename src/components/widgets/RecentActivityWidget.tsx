import { useMemo, useState } from "react";
import { Clock as ClockIcon } from "lucide-react";
import { GlassCard } from "@/components/glass/GlassPanel";
import { useWorkspaceStore } from "@/stores/workspace";
import { useHydrated } from "@/hooks/useHydrated";
import { SiteIcon } from "./BookmarksWidget";

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** Bookmarks you open from TabOS, most recent or most used first. */
export function RecentActivityWidget() {
  const hydrated = useHydrated();
  const usage = useWorkspaceStore((s) => s.usage);
  const [sort, setSort] = useState<"recent" | "frequent">("recent");

  const items = useMemo(() => {
    const list = Object.values(usage ?? {});
    list.sort((a, b) => (sort === "recent" ? b.last - a.last : b.count - a.count || b.last - a.last));
    return list.slice(0, 12);
  }, [usage, sort]);

  return (
    <GlassCard className="p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 gap-2">
        <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
          {sort === "recent" ? "Recently opened" : "Most used"}
        </h2>
        <div className="flex items-center gap-1">
          {(["recent", "frequent"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setSort(k)}
              className={`text-[10px] px-2 py-0.5 rounded-full transition ${sort === k ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80"}`}
            >
              {k === "recent" ? "Recent" : "Frequent"}
            </button>
          ))}
          <ClockIcon className="h-4 w-4 text-white/40 ml-1" />
        </div>
      </div>
      {hydrated && items.length === 0 ? (
        <p className="text-sm text-white/45">
          Bookmarks you open from TabOS will show up here, so your most-used sites are one click away.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 flex-1 content-start overflow-y-auto">
          {items.map((u) => (
            <a
              key={u.url}
              href={u.url}
              onClick={() => useWorkspaceStore.getState().recordOpen({ url: u.url, title: u.title })}
              className="glass-subtle rounded-xl px-2.5 py-2 flex items-center gap-2 hover:bg-white/10 transition min-w-0"
              title={u.url}
            >
              <SiteIcon url={u.url} title={u.title} size={28} />
              <span className="min-w-0">
                <span className="block text-xs text-white/85 truncate">{u.title}</span>
                <span className="block text-[10px] text-white/40 truncate">
                  {sort === "frequent" ? `${u.count}× · ` : ""}
                  {host(u.url)}
                </span>
              </span>
            </a>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
