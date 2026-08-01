import { Headphones, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GlassPanel } from "@/components/glass/GlassPanel";

type Mode = "rain" | "brown" | "waves";

const MODES: { id: Mode; label: string }[] = [
  { id: "rain", label: "Rain" },
  { id: "brown", label: "Brown" },
  { id: "waves", label: "Waves" },
];

// Procedurally generated ambience — no audio assets, works offline in MV3.
export function AmbientSoundWidget() {
  const [mode, setMode] = useState<Mode>("rain");
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(35);

  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

  const stop = () => {
    nodesRef.current.forEach((n) => {
      try {
        (n as AudioScheduledSourceNode).stop?.();
      } catch {
        /* not a source node */
      }
      n.disconnect();
    });
    nodesRef.current = [];
  };

  const start = (m: Mode) => {
    stop();
    let ctx = ctxRef.current;
    if (!ctx) {
      ctx = new AudioContext();
      ctxRef.current = ctx;
      const g = ctx.createGain();
      g.connect(ctx.destination);
      gainRef.current = g;
    }
    void ctx.resume();
    const gain = gainRef.current!;
    gain.gain.value = volume / 100;

    // 2s looping noise buffer
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      if (m === "brown") {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      } else {
        data[i] = white;
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    if (m === "rain") {
      filter.type = "bandpass";
      filter.frequency.value = 1400;
      filter.Q.value = 0.6;
    } else if (m === "waves") {
      filter.type = "lowpass";
      filter.frequency.value = 500;
    } else {
      filter.type = "lowpass";
      filter.frequency.value = 900;
    }

    src.connect(filter).connect(gain);
    nodesRef.current = [src, filter];

    if (m === "waves") {
      // slow swell using an LFO on the filter gain
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.12;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 320;
      lfo.connect(lfoGain).connect(filter.frequency);
      lfo.start();
      nodesRef.current.push(lfo, lfoGain);
    }
    src.start();
  };

  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = volume / 100;
  }, [volume]);

  useEffect(() => {
    if (playing) start(mode);
    else stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, mode]);

  useEffect(
    () => () => {
      stop();
      void ctxRef.current?.close();
    },
    [],
  );

  return (
    <GlassPanel className="h-full w-full p-5 flex flex-col">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 mb-3">
        <Headphones className="h-3.5 w-3.5" /> Focus Sounds
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="h-12 w-12 shrink-0 grid place-items-center rounded-full text-white"
          style={{ background: "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))" }}
          aria-label={playing ? "Pause ambience" : "Play ambience"}
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </button>
        <div className="flex glass-subtle rounded-full p-0.5 flex-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex-1 px-2 py-1.5 text-xs rounded-full transition ${
                mode === m.id ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <label className="mt-4 block text-[10px] uppercase tracking-widest text-white/40">
        Volume {volume}%
      </label>
      <input
        type="range"
        min={0}
        max={100}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        className="w-full accent-indigo-500 mt-1"
      />
    </GlassPanel>
  );
}
