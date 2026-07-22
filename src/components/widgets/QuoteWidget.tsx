import { Quote, RefreshCw } from "lucide-react";
import { useState } from "react";
import { GlassPanel } from "@/components/glass/GlassPanel";

const QUOTES: { text: string; author: string }[] = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Discipline equals freedom.", author: "Jocko Willink" },
  { text: "What you do every day matters more than what you do once in a while.", author: "Gretchen Rubin" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "Slow is smooth, and smooth is fast.", author: "Navy SEALs" },
  { text: "Amateurs sit and wait for inspiration; the rest of us just get up and go to work.", author: "Stephen King" },
  { text: "Stay hungry. Stay foolish.", author: "Steve Jobs" },
  { text: "The best way out is always through.", author: "Robert Frost" },
  { text: "Do the hard jobs first. The easy jobs will take care of themselves.", author: "Dale Carnegie" },
];

export function QuoteWidget() {
  const [i, setI] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const q = QUOTES[i];
  return (
    <GlassPanel className="h-full w-full p-5 flex flex-col">
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-white/50 mb-2">
        <span className="flex items-center gap-2"><Quote className="h-3.5 w-3.5" /> Daily Quote</span>
        <button
          onClick={() => setI((n) => (n + 1) % QUOTES.length)}
          className="glass-subtle h-7 w-7 grid place-items-center rounded-full hover:bg-white/10"
          aria-label="New quote"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-base md:text-lg text-white/90 leading-snug font-medium">"{q.text}"</p>
        <p className="mt-2 text-xs text-white/50 uppercase tracking-widest">— {q.author}</p>
      </div>
    </GlassPanel>
  );
}
