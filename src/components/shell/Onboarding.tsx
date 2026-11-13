import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useHydrated } from "@/hooks/useHydrated";
import { useSettingsStore } from "@/stores/settings";
import { useWorkspaceStore } from "@/stores/workspace";
import { LocationPicker } from "./LocationPicker";

const STEPS = ["name", "weather", "workspace"] as const;

/** First-run setup: name, weather location and a starting workspace. */
export function Onboarding() {
  const hydrated = useHydrated();
  const onboarded = useSettingsStore((s) => s.onboarded);
  const setOnboarded = useSettingsStore((s) => s.setOnboarded);
  const userName = useSettingsStore((s) => s.userName);
  const setUserName = useSettingsStore((s) => s.setUserName);
  const { workspaces, activeId, setActive } = useWorkspaceStore();
  const [step, setStep] = useState(0);

  if (!hydrated || onboarded) return null;

  const last = step === STEPS.length - 1;
  const next = () => (last ? setOnboarded(true) : setStep((s) => s + 1));

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4 bg-black/55 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label="Set up TabOS"
        className="glass-strong w-full max-w-lg p-6 md:p-8"
        style={{ borderRadius: "var(--radius-panel)" }}
      >
        <div className="flex items-center gap-1.5 mb-6">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className="h-1 flex-1 rounded-full transition-colors"
              style={{ background: i <= step ? "var(--ws-accent)" : "rgba(255,255,255,0.12)" }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="min-h-[220px]"
          >
            {STEPS[step] === "name" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  next();
                }}
              >
                <h2 className="text-2xl font-semibold text-gradient">Welcome to TabOS</h2>
                <p className="mt-2 text-sm text-white/60">
                  Your new tab, set up in three quick steps. Everything stays on this computer.
                </p>
                <label className="block mt-6 text-xs uppercase tracking-widest text-white/45">
                  What should we call you?
                </label>
                <input
                  autoFocus
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your name"
                  maxLength={40}
                  className="mt-2 w-full glass-subtle rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-white/25"
                />
              </form>
            )}
            {STEPS[step] === "weather" && (
              <div>
                <h2 className="text-2xl font-semibold text-gradient">Weather</h2>
                <p className="mt-2 mb-5 text-sm text-white/60">
                  Pick your city for local weather. TabOS only contacts the free Open-Meteo service, and
                  only once every half hour.
                </p>
                <LocationPicker />
              </div>
            )}
            {STEPS[step] === "workspace" && (
              <div>
                <h2 className="text-2xl font-semibold text-gradient">Pick a starting workspace</h2>
                <p className="mt-2 mb-5 text-sm text-white/60">
                  Each one has its own colours and bookmarks. You can switch any time from the top bar.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {workspaces.map((w) => {
                    const active = w.id === activeId;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setActive(w.id)}
                        className={`relative rounded-2xl px-3 py-3 text-left transition ${active ? "text-white" : "glass-subtle text-white/70 hover:bg-white/10"}`}
                        style={active ? { background: `linear-gradient(135deg, ${w.accent}, ${w.accent2})` } : undefined}
                      >
                        <div className="text-xl">{w.icon}</div>
                        <div className="text-sm mt-1 truncate">{w.name}</div>
                        {active && <Check className="absolute top-2 right-2 h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="text-sm text-white/60 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setOnboarded(true)}
              className="text-sm text-white/45 hover:text-white/80"
            >
              Skip setup
            </button>
          )}
          <button
            type="button"
            onClick={next}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-white flex items-center gap-1.5 accent-glow"
            style={{ background: "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))" }}
          >
            {last ? "Start using TabOS" : "Next"} {!last && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
