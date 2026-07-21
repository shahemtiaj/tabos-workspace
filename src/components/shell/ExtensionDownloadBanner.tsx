import { Download, Chrome } from "lucide-react";
import { toast } from "sonner";

export function ExtensionDownloadBanner() {
  const download = () => {
    toast.loading("Preparing extension…", { id: "ext-dl" });
    fetch("/tabos-extension.zip")
      .then((res) => {
        if (!res.ok) throw new Error(`Download failed (${res.status})`);
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "tabos-extension.zip";
        a.click();
        URL.revokeObjectURL(a.href);
        toast.success("Downloaded! Unzip → chrome://extensions → Developer mode → Load unpacked.", {
          id: "ext-dl",
          duration: 9000,
        });
      })
      .catch((err) => toast.error(err.message, { id: "ext-dl" }));
  };

  return (
    <div
      className="glass relative overflow-hidden p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
      style={{ borderRadius: "var(--radius-panel)" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(600px 200px at 10% 50%, var(--ws-accent, #4f46e5), transparent 60%)",
        }}
      />
      <div
        className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
        style={{
          background: "linear-gradient(135deg, var(--ws-accent, #4f46e5), var(--ws-accent-2, #7c3aed))",
          boxShadow: "0 8px 32px -8px var(--ws-accent, #4f46e5)",
        }}
      >
        <Chrome className="h-7 w-7 text-white" />
      </div>
      <div className="relative flex-1 min-w-0">
        <div className="text-[11px] uppercase tracking-[0.25em] text-white/50">
          Chrome extension
        </div>
        <h3 className="mt-1 text-lg md:text-xl font-semibold text-white">
          Install TabOS as your New Tab
        </h3>
        <p className="mt-1 text-sm text-white/60">
          Standalone MV3 build — works offline, replaces chrome://newtab. Unzip, open{" "}
          <code className="text-white/80">chrome://extensions</code>, enable Developer mode, then
          Load unpacked.
        </p>
      </div>
      <button
        type="button"
        onClick={download}
        className="relative shrink-0 inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
        style={{
          borderRadius: "var(--radius-pill)",
          background: "linear-gradient(135deg, var(--ws-accent, #4f46e5), var(--ws-accent-2, #7c3aed))",
          boxShadow: "0 10px 30px -10px var(--ws-accent, #4f46e5)",
        }}
      >
        <Download className="h-4 w-4" />
        Download .zip
      </button>
    </div>
  );
}
