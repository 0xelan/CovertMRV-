import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      port: 5173,
      strictPort: true,
    },
    worker: {
      format: "es",
    },
    optimizeDeps: {
      // @cofhe/sdk must be excluded so Vite doesn't tree-shake its dynamic
      // Worker / WASM internals. But its CJS dependency iframe-shared-storage
      // must be explicitly included so Vite pre-bundles it (CJS→ESM) and
      // exposes named exports like `constructClient` — otherwise the browser
      // gets the raw CJS file and throws "does not provide an export named
      // 'constructClient'".
      exclude: ["@cofhe/sdk"],
      include: ["iframe-shared-storage"],
    },
  },
});
