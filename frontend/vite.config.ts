import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
  worker: {
    format: "es",
  },
  optimizeDeps: {
    // Pre-bundle @cofhe/sdk + tweetnacl so CJS default interop works in dev.
    include: ["iframe-shared-storage", "@cofhe/sdk", "tweetnacl"],
    needsInterop: ["tweetnacl"],
  },
});
