import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_API_PROXY_TARGET;
  if (!proxyTarget) {
    throw new Error("VITE_API_PROXY_TARGET is required in frontend/.env");
  }

  return ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
  plugins: [
    react(),
    // lovable-tagger currently emits invalid optimizer options on Vite 8.
    // Keep dev server stable/noisy-free until plugin updates for Vite 8.
    false,
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  });
});

