import { Calculator, Delete } from "lucide-react";
import { useState } from "react";
import { GlassPanel } from "@/components/glass/GlassPanel";

// Tiny safe expression evaluator (shunting-yard → RPN). No eval/Function.
function evaluate(input: string): number | null {
  const tokens = input.match(/\d+\.?\d*|[+\-*/%()]/g);
  if (!tokens) return null;
  const prec: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2 };
  const out: string[] = [];
  const ops: string[] = [];
  for (const t of tokens) {
    if (/^\d/.test(t)) out.push(t);
    else if (t === "(") ops.push(t);
    else if (t === ")") {
      while (ops.length && ops[ops.length - 1] !== "(") out.push(ops.pop()!);
      if (ops.pop() !== "(") return null;
    } else {
      while (ops.length && prec[ops[ops.length - 1]] >= prec[t]) out.push(ops.pop()!);
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
      st.push(t === "+" ? a + b : t === "-" ? a - b : t === "*" ? a * b : t === "/" ? a / b : a % b);
    }
  }
  const res = st.pop();
  return st.length === 0 && res !== undefined && Number.isFinite(res) ? res : null;
}

const KEYS = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "%", "+"];

export function CalculatorWidget() {
  const [expr, setExpr] = useState("");
  const live = expr ? evaluate(expr) : null;

  const press = (k: string) => setExpr((e) => e + k);
  const equals = () => {
    const v = evaluate(expr);
    if (v !== null) setExpr(String(Number(v.toFixed(10))));
  };

  return (
    <GlassPanel className="h-full w-full p-5 flex flex-col">
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-white/50 mb-2">
        <span className="flex items-center gap-2">
          <Calculator className="h-3.5 w-3.5" /> Calculator
        </span>
        <button
          onClick={() => setExpr("")}
          className="glass-subtle h-7 px-2 grid place-items-center rounded-full hover:bg-white/10 text-[10px]"
        >
          AC
        </button>
      </div>

      <input
        value={expr}
        onChange={(e) => setExpr(e.target.value.replace(/[^0-9+\-*/%.()]/g, ""))}
        onKeyDown={(e) => e.key === "Enter" && equals()}
        placeholder="0"
        inputMode="text"
        className="w-full bg-transparent outline-none text-right text-2xl font-mono tabular-nums text-white/90 placeholder:text-white/25"
      />
      <div className="text-right text-xs text-white/40 tabular-nums h-4">
        {live !== null && String(Number(live.toFixed(10)))}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5 flex-1 min-h-0">
        {KEYS.map((k) => (
          <button
            key={k}
            onClick={() => press(k)}
            className="glass-subtle rounded-xl text-sm py-2 hover:bg-white/10 transition"
          >
            {k}
          </button>
        ))}
        <button
          onClick={() => setExpr((e) => e.slice(0, -1))}
          className="glass-subtle rounded-xl grid place-items-center hover:bg-white/10 transition"
          aria-label="Backspace"
        >
          <Delete className="h-4 w-4" />
        </button>
        <button
          onClick={() => press("(")}
          className="glass-subtle rounded-xl text-sm hover:bg-white/10 transition"
        >
          (
        </button>
        <button
          onClick={() => press(")")}
          className="glass-subtle rounded-xl text-sm hover:bg-white/10 transition"
        >
          )
        </button>
        <button
          onClick={equals}
          className="rounded-xl text-sm text-white font-semibold"
          style={{ background: "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))" }}
        >
          =
        </button>
      </div>
    </GlassPanel>
  );
}
