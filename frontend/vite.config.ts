import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TFHE_WASM = path.resolve(__dirname, "node_modules/tfhe/tfhe_bg.wasm");

/** Serve tfhe_bg.wasm with correct MIME type — Vite prebundle breaks relative wasm URLs. */
function tfheWasmPlugin(): Plugin {
  return {
    name: "tfhe-wasm",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.includes("tfhe_bg.wasm")) {
          if (!fs.existsSync(TFHE_WASM)) {
            res.statusCode = 404;
            res.end("tfhe_bg.wasm not found");
            return;
          }
          res.setHeader("Content-Type", "application/wasm");
          fs.createReadStream(TFHE_WASM).pipe(res);
          return;
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
    tfheWasmPlugin(),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
  worker: {
    format: "es",
  },
  assetsInclude: ["**/*.wasm"],
  optimizeDeps: {
    // Pre-bundle @cofhe/sdk (bundles its own zod v4) + tweetnacl CJS interop.
    include: ["iframe-shared-storage", "tweetnacl", "@cofhe/sdk", "@cofhe/sdk/web"],
    needsInterop: ["tweetnacl"],
  },
});
