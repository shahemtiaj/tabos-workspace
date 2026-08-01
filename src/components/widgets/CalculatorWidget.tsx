import { Calculator, Delete, History, X } from "lucide-react";
import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { useCalculatorStore } from "@/stores/calculator";

// Tiny safe expression evaluator (shunting-yard → RPN). No eval/Function.
function evaluate(input: string): number | null {
  const tokens = input.match(/\d+\.?\d*|[+\-*/%^()]/g);
  if (!tokens) return null;
  const prec: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2, "^": 3 };
  const out: string[] = [];
  const ops: string[] = [];
  for (const t of tokens) {
    if (/^\d/.test(t)) out.push(t);
    else if (t === "(") ops.push(t);
    else if (t === ")") {
      while (ops.length && ops[ops.length - 1] !== "(") out.push(ops.pop()!);
      if (ops.pop() !== "(") return null;
    } else {
      while (
        ops.length &&
        ops[ops.length - 1] !== "(" &&
        (t === "^" ? prec[ops[ops.length - 1]] > prec[t] : prec[ops[ops.length - 1]] >= prec[t])
      )
        out.push(ops.pop()!);
      ops.push(t);
    }
  }
  while (ops.length) {
    const op = ops.pop()!;
    if (op === "(") return null;
    out.push(op);
  }
  const st: number[] = [];
  for (const t of out) {
    if (/^\d/.test(t)) st.push(parseFloat(t));
    else {
      const b = st.pop();
      const a = st.pop();
      if (a === undefined || b === undefined) return null;
      st.push(
        t === "+"
          ? a + b
          : t === "-"
            ? a - b
            : t === "*"
              ? a * b
              : t === "/"
                ? a / b
                : t === "^"
                  ? Math.pow(a, b)
                  : a % b,
      );
    }
  }
  const res = st.pop();
  return st.length === 0 && res !== undefined && Number.isFinite(res) ? res : null;
}

const fmt = (n: number) => {
  const r = Number(n.toFixed(10));
  return Math.abs(r) >= 1e12 || (Math.abs(r) < 1e-6 && r !== 0) ? r.toExponential(6) : String(r);
};

const KEYS: { k: string; label?: string; accent?: boolean }[] = [
  { k: "7" }, { k: "8" }, { k: "9" }, { k: "/", label: "÷" },
  { k: "4" }, { k: "5" }, { k: "6" }, { k: "*", label: "×" },
  { k: "1" }, { k: "2" }, { k: "3" }, { k: "-", label: "−" },
  { k: "0" }, { k: "." }, { k: "%" }, { k: "+" },
];

export function CalculatorWidget() {
  const [expr, setExpr] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const { history, push, clear } = useCalculatorStore();
  const live = expr ? evaluate(expr) : null;

  const press = (k: string) => setExpr((e) => e + k);
  const equals = () => {
    const v = evaluate(expr);
    if (v === null) return;
    const result = fmt(v);
    if (expr.trim() !== result) push(expr.trim(), result);
    setExpr(result);
  };

  // Keyboard support while the widget input is focused is handled by the input itself.
  useEffect(() => {
    if (!showHistory) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setShowHistory(false);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [showHistory]);

  return (
    <GlassPanel className="h-full w-full p-5 flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-white/50 mb-2">
        <span className="flex items-center gap-2">
          <Calculator className="h-3.5 w-3.5" /> Calculator
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="glass-subtle h-7 w-7 grid place-items-center rounded-full hover:bg-white/10"
            aria-label="History"
          >
            <History className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setExpr("")}
            className="glass-subtle h-7 px-2 grid place-items-center rounded-full hover:bg-white/10 text-[10px]"
          >
            AC
          </button>
        </div>
      </div>

      <input
        value={expr}
        onChange={(e) => setExpr(e.target.value.replace(/[^0-9+\-*/%.()^]/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "=") {
            e.preventDefault();
            equals();
          }
        }}
        placeholder="0"
        inputMode="text"
        className="w-full bg-transparent outline-none text-right text-2xl font-mono tabular-nums text-white/90 placeholder:text-white/25"
      />
      <div className="text-right text-xs text-white/40 tabular-nums h-4">
        {live !== null && expr !== fmt(live) && `= ${fmt(live)}`}
      </div>

      <div className="mt-3 grid grid-cols-5 gap-1.5 flex-1 min-h-0">
        <button
          onClick={() => setExpr((e) => e.slice(0, -1))}
          className="glass-subtle rounded-xl grid place-items-center hover:bg-white/10 transition"
          aria-label="Backspace"
        >
          <Delete className="h-4 w-4" />
        </button>
        <button onClick={() => press("(")} className="glass-subtle rounded-xl text-sm hover:bg-white/10 transition">(</button>
        <button onClick={() => press(")")} className="glass-subtle rounded-xl text-sm hover:bg-white/10 transition">)</button>
        <button onClick={() => press("^")} className="glass-subtle rounded-xl text-sm hover:bg-white/10 transition">x^y</button>
        <button
          onClick={() => setExpr((e) => (e.startsWith("-") ? e.slice(1) : `-${e}`))}
          className="glass-subtle rounded-xl text-sm hover:bg-white/10 transition"
          aria-label="Toggle sign"
        >
          ±
        </button>

        {KEYS.map(({ k, label }) => (
          <button
            key={k}
            onClick={() => press(k)}
            className="glass-subtle rounded-xl text-sm py-2 hover:bg-white/10 transition col-span-1"
          >
            {label ?? k}
          </button>
        ))}
        <button
          onClick={equals}
          className="rounded-xl text-sm text-white font-semibold row-span-4"
          style={{ background: "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))" }}
        >
          =
        </button>
      </div>

      {showHistory && (
        <div className="absolute inset-0 z-10 backdrop-blur-xl bg-black/50 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-white/50">History</span>
            <div className="flex gap-1.5">
              <button
                onClick={clear}
                className="glass-subtle rounded-full px-2 py-1 text-[10px] hover:bg-white/10"
              >
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
            {history.length === 0 && (
              <p className="text-xs text-white/40 py-4 text-center">No calculations yet.</p>
            )}
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
