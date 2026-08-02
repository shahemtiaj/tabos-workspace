export type WidgetKey =
  | "bookmarks"
  | "clock"
  | "weather"
  | "pomodoro"
  | "todos"
  | "consistency"
  | "notes"
  | "recent"
  | "search";

export type Bookmark = { id: string; title: string; url: string };

export type Workspace = {
  id: string;
  name: string;
  icon: string; // emoji
  accent: string; // hex
  accent2: string;
  wallpaperFrom: string;
  wallpaperTo: string;
  bookmarks: Bookmark[];
  widgets: WidgetKey[];
};

const bm = (title: string, url: string): Bookmark => ({
  id: `${title}-${url}`.toLowerCase().replace(/[^a-z0-9]/g, "-"),
  title,
  url,
});

export const WORKSPACE_PRESETS: Workspace[] = [
  {
    id: "default",
    name: "Default",
    icon: "🌌",
    accent: "#4f46e5",
    accent2: "#7c3aed",
    wallpaperFrom: "#0a0a1a",
    wallpaperTo: "#141432",
    widgets: ["bookmarks", "clock", "weather", "pomodoro", "todos", "consistency", "notes", "recent"],
    bookmarks: [
      bm("Gmail", "https://mail.google.com"),
      bm("Calendar", "https://calendar.google.com"),
      bm("YouTube", "https://youtube.com"),
      bm("Drive", "https://drive.google.com"),
      bm("Notion", "https://notion.so"),
      bm("Spotify", "https://open.spotify.com"),
    ],
  },
  {
    id: "ai",
    name: "AI",
    icon: "🧠",
    accent: "#8b5cf6",
    accent2: "#ec4899",
    wallpaperFrom: "#0f0a1e",
    wallpaperTo: "#1e0f2e",
    widgets: ["bookmarks", "clock", "pomodoro", "todos", "notes"],
    bookmarks: [
      bm("ChatGPT", "https://chat.openai.com"),
      bm("Claude", "https://claude.ai"),
      bm("Gemini", "https://gemini.google.com"),
      bm("Perplexity", "https://perplexity.ai"),
      bm("Cursor", "https://cursor.sh"),
      bm("GitHub", "https://github.com"),
      bm("Hugging Face", "https://huggingface.co"),
      bm("Bolt", "https://bolt.new"),
      bm("v0", "https://v0.dev"),
    ],
  },
  {
    id: "video",
    name: "Video Editing",
    icon: "🎬",
    accent: "#f43f5e",
    accent2: "#f59e0b",
    wallpaperFrom: "#1a0a0f",
    wallpaperTo: "#2a0f14",
    widgets: ["bookmarks", "clock", "pomodoro", "todos", "notes"],
    bookmarks: [
      bm("Premiere Pro", "https://www.adobe.com/products/premiere.html"),
      bm("After Effects", "https://www.adobe.com/products/aftereffects.html"),
      bm("Frame.io", "https://frame.io"),
      bm("Envato", "https://elements.envato.com"),
      bm("Motion Array", "https://motionarray.com"),
      bm("Artlist", "https://artlist.io"),
      bm("Epidemic Sound", "https://epidemicsound.com"),
      bm("Pixabay", "https://pixabay.com"),
      bm("Pexels", "https://pexels.com"),
    ],
  },
  {
    id: "design",
    name: "Graphic Design",
    icon: "🎨",
    accent: "#06b6d4",
    accent2: "#8b5cf6",
    wallpaperFrom: "#06121a",
    wallpaperTo: "#0a1e2a",
    widgets: ["bookmarks", "clock", "pomodoro", "todos", "notes"],
    bookmarks: [
      bm("Figma", "https://figma.com"),
      bm("Canva", "https://canva.com"),
      bm("Photoshop", "https://www.adobe.com/products/photoshop.html"),
      bm("Illustrator", "https://www.adobe.com/products/illustrator.html"),
      bm("Freepik", "https://freepik.com"),
      bm("Icons8", "https://icons8.com"),
      bm("Flaticon", "https://flaticon.com"),
      bm("Remove.bg", "https://remove.bg"),
    ],
  },
  {
    id: "dev",
    name: "Development",
    icon: "⌨️",
    accent: "#22d3ee",
    accent2: "#4ade80",
    wallpaperFrom: "#06141a",
    wallpaperTo: "#0a1e22",
    widgets: ["bookmarks", "clock", "pomodoro", "todos", "notes", "recent"],
    bookmarks: [
      bm("GitHub", "https://github.com"),
      bm("Stack Overflow", "https://stackoverflow.com"),
      bm("MDN", "https://developer.mozilla.org"),
      bm("Vercel", "https://vercel.com"),
      bm("Netlify", "https://netlify.com"),
      bm("Cursor", "https://cursor.sh"),
      bm("npm", "https://npmjs.com"),
      bm("CodeSandbox", "https://codesandbox.io"),
    ],
  },
  {
    id: "study",
    name: "Study",
    icon: "📚",
    accent: "#eab308",
    accent2: "#f97316",
    wallpaperFrom: "#141006",
    wallpaperTo: "#1e1608",
    widgets: ["bookmarks", "clock", "pomodoro", "todos", "consistency", "notes"],
    bookmarks: [
      bm("Notion", "https://notion.so"),
      bm("Coursera", "https://coursera.org"),
      bm("Khan Academy", "https://khanacademy.org"),
      bm("Wikipedia", "https://wikipedia.org"),
      bm("Anki", "https://apps.ankiweb.net"),
      bm("Quizlet", "https://quizlet.com"),
    ],
  },
  {
    id: "business",
    name: "Business",
    icon: "💼",
    accent: "#10b981",
    accent2: "#0ea5e9",
    wallpaperFrom: "#06141a",
    wallpaperTo: "#0a1e1a",
    widgets: ["bookmarks", "clock", "weather", "todos", "notes", "recent"],
    bookmarks: [
      bm("Gmail", "https://mail.google.com"),
      bm("Calendar", "https://calendar.google.com"),
      bm("Slack", "https://slack.com"),
      bm("LinkedIn", "https://linkedin.com"),
      bm("Stripe", "https://dashboard.stripe.com"),
      bm("Notion", "https://notion.so"),
    ],
  },
];

export const DEFAULT_WORKSPACE_ID = "default";
