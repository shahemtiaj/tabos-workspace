import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Standalone Chrome MV3 extension build. Fully self-contained SPA — reuses
// the widgets, stores, and styles from ../src but ships zero TanStack/SSR.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
  base: "./", // relative asset URLs so chrome-extension:// works
  build: {
    outDir: path.resolve(__dirname, "../extension"),
    emptyOutDir: false, // preserve manifest.json + icon.png
    assetsDir: "assets",
    rollupOptions: {
      input: path.resolve(__dirname, "newtab.html"),
    },
    target: "es2022",
  },
});
