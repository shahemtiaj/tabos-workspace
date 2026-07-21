import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "@/components/ui/sonner";
import { WorkspaceThemeSync } from "@/components/shell/WorkspaceThemeSync";
import App from "./App";
import "@/styles.css";
// Preload the two fonts used by the app.
const linkFonts = document.createElement("link");
linkFonts.rel = "stylesheet";
linkFonts.href =
  "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap";
document.head.appendChild(linkFonts);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WorkspaceThemeSync />
    <App />
    <Toaster />
  </React.StrictMode>,
);
