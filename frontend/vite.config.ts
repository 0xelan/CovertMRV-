import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

/** Dev server must serve .wasm with the correct MIME type for tfhe-rs. */
function wasmContentTypePlugin(): Plugin {
  return {
    name: "wasm-content-type",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.includes(".wasm")) {
          res.setHeader("Content-Type", "application/wasm");
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
    wasmContentTypePlugin(),
  ],
  server: {
    port: 5173,
    strictPort: true,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  worker: {
    format: "es",
  },
  assetsInclude: ["**/*.wasm"],
  optimizeDeps: {
    // Pre-bundle tweetnacl for CJS interop; keep tfhe/@cofhe out so tfhe_bg.wasm resolves correctly.
    include: ["iframe-shared-storage", "tweetnacl"],
    needsInterop: ["tweetnacl"],
    exclude: ["@cofhe/sdk", "@cofhe/sdk/web", "tfhe"],
  },
});
