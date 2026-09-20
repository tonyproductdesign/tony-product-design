import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const rawBase = env.VITE_BASE_PATH || "/";
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(rawBase)) {
    throw new Error("VITE_BASE_PATH must be / or a slash-terminated path such as /tony-product-design/.");
  }
  return {
    base: rawBase,
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    build: { target: "es2022", sourcemap: false, assetsDir: "assets/build" },
    server: { port: 5173 },
    preview: { port: 4173 },
  };
});
