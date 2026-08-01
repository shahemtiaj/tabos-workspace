import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "@/components/ui/sonner";
import { WorkspaceThemeSync } from "@/components/shell/WorkspaceThemeSync";
import App from "./App";
import "@/styles.css";
// Self-hosted fonts — Chrome Web Store forbids remotely hosted resources,
// so every font is bundled inside the extension package (fully offline).
import "@fontsource/poppins/latin-300.css";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/poppins/latin-700.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-700.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WorkspaceThemeSync />
    <App />
    <Toaster />
  </React.StrictMode>,
);
