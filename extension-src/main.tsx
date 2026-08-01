import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "@/components/ui/sonner";
import { WorkspaceThemeSync } from "@/components/shell/WorkspaceThemeSync";
import App from "./App";
import "@/styles.css";
// Self-hosted fonts — Chrome Web Store forbids remotely hosted resources,
// so every font is bundled inside the extension package (fully offline).
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WorkspaceThemeSync />
    <App />
    <Toaster />
  </React.StrictMode>,
);
