import { Calculator, Delete, History, X, Copy, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { useCalculatorStore } from "@/stores/calculator";

type Mode = "deg" | "rad";

const FUNCS = ["sin", "cos", "tan", "asin", "acos", "atan", "sqrt", "ln", "log", "abs", "round", "floor", "ceil"];

/** Safe scientific evaluator (tokenizer → shunting-yard → RPN). No eval/Function. */
function evaluate(input: string, mode: Mode): number | null {
  const src = input.replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
  const tokens: string[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\d|\./.test(c)) {
      let n = "";
      while (i < src.length && /[\d.]/.test(src[i])) n += src[i++];
      tokens.push(n);
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let w = "";
      while (i < src.length && /[a-zA-Z]/.test(src[i])) w += src[i++];
      const lw = w.toLowerCase();
      if (lw === "pi" || lw === "e") tokens.push(lw === "pi" ? String(Math.PI) : String(Math.E));
      else if (FUNCS.includes(lw)) tokens.push(lw);
      else return null;
      continue;
    }
    if ("+-*/%^()!π".includes(c)) {
      tokens.push(c === "π" ? String(Math.PI) : c);
      i++;
      continue;
    }
    return null;
  }
  if (!tokens.length) return null;

  const prec: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2, "^": 4, u: 5, "!": 6 };
  const out: string[] = [];
  const ops: string[] = [];
  let prev: string | null = null;
  const isValue = (t: string | null) => t !== null && (/^\d/.test(t) || t === ")" || t === "!");

  for (const t of tokens) {
    if (/^\d/.test(t)) out.push(t);
    else if (FUNCS.includes(t)) ops.push(t);
    else if (t === "(") ops.push(t);
    else if (t === ")") {
      while (ops.length && ops[ops.length - 1] !== "(") out.push(ops.pop()!);
      if (ops.pop() !== "(") return null;
      if (ops.length && FUNCS.includes(ops[ops.length - 1])) out.push(ops.pop()!);
    } else if (t === "!") out.push("!");
    else {
      const op = (t === "-" || t === "+") && !isValue(prev) ? (t === "-" ? "u" : "+u") : t;
      if (op === "+u") {
        prev = t;
        continue;
      }
      while (
        ops.length &&
        ops[ops.length - 1] !== "(" &&
        !FUNCS.includes(ops[ops.length - 1]) &&
        (op === "^" || op === "u"
          ? prec[ops[ops.length - 1]] > prec[op]
          : prec[ops[ops.length - 1]] >= prec[op])
      )
        out.push(ops.pop()!);
      ops.push(op);
    }
    prev = t;
  }
  while (ops.length) {
    const op = ops.pop()!;
    if (op === "(") return null;
    out.push(op);
  }

  const toRad = (x: number) => (mode === "deg" ? (x * Math.PI) / 180 : x);
  const fromRad = (x: number) => (mode === "deg" ? (x * 180) / Math.PI : x);
  const st: number[] = [];
  for (const t of out) {
    if (/^\d/.test(t)) {
      st.push(parseFloat(t));
      continue;
    }
    if (t === "u" || t === "!" || FUNCS.includes(t)) {
      const a = st.pop();
      if (a === undefined) return null;
      let v: number;
      switch (t) {
        case "u": v = -a; break;
        case "!": {
          if (a < 0 || !Number.isInteger(a) || a > 170) return null;
          v = 1;
          for (let n = 2; n <= a; n++) v *= n;
          break;
        }
        case "sin": v = Math.sin(toRad(a)); break;
        case "cos": v = Math.cos(toRad(a)); break;
        case "tan": v = Math.tan(toRad(a)); break;
        case "asin": v = fromRad(Math.asin(a)); break;
        case "acos": v = fromRad(Math.acos(a)); break;
        case "atan": v = fromRad(Math.atan(a)); break;
        case "sqrt": v = Math.sqrt(a); break;
        case "ln": v = Math.log(a); break;
        case "log": v = Math.log10(a); break;
        case "abs": v = Math.abs(a); break;
        case "round": v = Math.round(a); break;
        case "floor": v = Math.floor(a); break;
        default: v = Math.ceil(a);
      }
      st.push(v);
      continue;
    }
    const b = st.pop();
    const a = st.pop();
    if (a === undefined || b === undefined) return null;
    st.push(
      t === "+" ? a + b : t === "-" ? a - b : t === "*" ? a * b : t === "/" ? a / b : t === "^" ? Math.pow(a, b) : a % b,
    );
  }
  const res = st.pop();
  return st.length === 0 && res !== undefined && Number.isFinite(res) ? res : null;
}

const fmt = (n: number) => {
  const r = Number(n.toFixed(10));
  return Math.abs(r) >= 1e12 || (Math.abs(r) < 1e-6 && r !== 0) ? r.toExponential(6) : String(r);
};

type Key = { k: string; label?: string; kind?: "fn" | "op" | "num" };

const SCI: Key[] = [
  { k: "sin(", label: "sin", kind: "fn" },
  { k: "cos(", label: "cos", kind: "fn" },
  { k: "tan(", label: "tan", kind: "fn" },
  { k: "ln(", label: "ln", kind: "fn" },
  { k: "log(", label: "log", kind: "fn" },
  { k: "sqrt(", label: "√", kind: "fn" },
  { k: "^", label: "xʸ", kind: "fn" },
  { k: "!", label: "n!", kind: "fn" },
  { k: "π", label: "π", kind: "fn" },
  { k: "e", label: "e", kind: "fn" },
];

const PAD: Key[] = [
  { k: "7" }, { k: "8" }, { k: "9" }, { k: "/", label: "÷", kind: "op" },
  { k: "4" }, { k: "5" }, { k: "6" }, { k: "*", label: "×", kind: "op" },
  { k: "1" }, { k: "2" }, { k: "3" }, { k: "-", label: "−", kind: "op" },
  { k: "0" }, { k: "." }, { k: "%", kind: "op" }, { k: "+", kind: "op" },
];

export function CalculatorWidget() {
  const [expr, setExpr] = useState("");
  const [mode, setMode] = useState<Mode>("deg");
  const [mem, setMem] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const { history, push, clear } = useCalculatorStore();

  const live = useMemo(() => (expr ? evaluate(expr, mode) : null), [expr, mode]);
  const invalid = expr.length > 0 && live === null;

  const press = (k: string) => setExpr((e) => e + k);
  const equals = () => {
    const v = evaluate(expr, mode);
    if (v === null) return;
    const result = fmt(v);
    if (expr.trim() !== result) push(expr.trim(), result);
    setExpr(result);
  };

  const copy = async () => {
    const val = live !== null ? fmt(live) : expr;
    if (!val) return;
    try {
      await navigator.clipboard.writeText(val);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable */
    }
  };

  useEffect(() => {
    if (!showHistory) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setShowHistory(false);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [showHistory]);

  const btn = "glass-subtle rounded-xl text-sm hover:bg-white/12 active:scale-[0.96] transition-transform transition-colors duration-100";

  return (
    <GlassPanel className="h-full w-full p-5 flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-white/50 mb-2">
        <span className="flex items-center gap-2">
          <Calculator className="h-3.5 w-3.5" /> Calculator
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMode((m) => (m === "deg" ? "rad" : "deg"))}
            className="glass-subtle h-7 px-2 rounded-full text-[10px] hover:bg-white/10 uppercase"
            title="Angle unit"
          >
            {mode}
          </button>
          <button onClick={copy} className="glass-subtle h-7 w-7 grid place-items-center rounded-full hover:bg-white/10" aria-label="Copy result">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="glass-subtle h-7 w-7 grid place-items-center rounded-full hover:bg-white/10"
            aria-label="History"
          >
            <History className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setExpr("")} className="glass-subtle h-7 px-2 grid place-items-center rounded-full hover:bg-white/10 text-[10px]">
            AC
          </button>
        </div>
      </div>

      <input
        value={expr}
        onChange={(e) => setExpr(e.target.value.replace(/[^0-9a-zA-Z+\-*/%.()^!π]/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "=") {
            e.preventDefault();
            equals();
          }
        }}
        placeholder="0"
        spellCheck={false}
        className={`w-full bg-transparent outline-none text-right text-2xl font-mono tabular-nums placeholder:text-white/25 ${invalid ? "text-rose-300/90" : "text-white/90"}`}
      />
      <div className="text-right text-xs tabular-nums h-4 text-white/45">
        {live !== null && expr !== fmt(live) ? `= ${fmt(live)}` : invalid ? "…" : ""}
      </div>

      <div className="mt-2 flex items-center gap-1 text-[10px] text-white/40">
        {(["MC", "MR", "M+", "M−"] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              if (m === "MC") setMem(0);
              else if (m === "MR") press(fmt(mem));
              else {
                const v = live ?? 0;
                setMem((x) => (m === "M+" ? x + v : x - v));
              }
            }}
            className="glass-subtle rounded-full px-2 py-0.5 hover:bg-white/10 hover:text-white/80"
          >
            {m}
          </button>
        ))}
        {mem !== 0 && <span className="ml-auto font-mono text-white/50">M {fmt(mem)}</span>}
      </div>

      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {SCI.map(({ k, label }) => (
          <button key={k} onClick={() => press(k)} className={`${btn} py-1.5 text-[12px] text-white/75`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-1.5 grid grid-cols-5 gap-1.5 flex-1 min-h-0">
        <button onClick={() => setExpr((e) => e.slice(0, -1))} className={`${btn} grid place-items-center`} aria-label="Backspace">
          <Delete className="h-4 w-4" />
        </button>
        <button onClick={() => press("(")} className={btn}>(</button>
        <button onClick={() => press(")")} className={btn}>)</button>
        <button onClick={() => press("/100")} className={`${btn} text-[12px]`}>÷100</button>
        <button
          onClick={() => setExpr((e) => (e.startsWith("-") ? e.slice(1) : `-${e}`))}
          className={btn}
          aria-label="Toggle sign"
        >
          ±
        </button>

        {PAD.map(({ k, label, kind }) => (
          <button
            key={k}
            onClick={() => press(k)}
            className={`${btn} py-2 ${kind === "op" ? "text-white/70" : "text-white/90"}`}
          >
            {label ?? k}
          </button>
        ))}
        <button
          onClick={equals}
          className="rounded-xl text-sm text-white font-semibold row-span-4 active:scale-[0.97] transition-transform"
          style={{ background: "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))" }}
        >
          =
        </button>
      </div>

      {showHistory && (
        <div className="absolute inset-0 z-10 bg-black/70 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-white/50">History</span>
            <div className="flex gap-1.5">
              <button onClick={clear} className="glass-subtle rounded-full px-2 py-1 text-[10px] hover:bg-white/10">
                Clear
              </button>
              <button
                onClick={() => setShowHistory(false)}
                className="glass-subtle h-6 w-6 grid place-items-center rounded-full hover:bg-white/10"
                aria-label="Close history"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
            {history.length === 0 && <p className="text-xs text-white/40 py-4 text-center">No calculations yet.</p>}
            {history.map((h) => (
              <button
                key={h.at}
                onClick={() => {
                  setExpr(h.result);
                  setShowHistory(false);
                }}
                className="w-full text-left rounded-xl px-3 py-2 hover:bg-white/10 transition"
              >
                <div className="text-[11px] text-white/45 font-mono truncate">{h.expr}</div>
                <div className="text-sm text-white/90 font-mono tabular-nums truncate">= {h.result}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </GlassPanel>
  );
}
