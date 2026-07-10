import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@chemlab/types": fileURLToPath(
        new URL("../../packages/types/src/index.ts", import.meta.url),
      ),
      "@chemlab/chemistry": fileURLToPath(
        new URL("../../packages/chemistry/src/index.ts", import.meta.url),
      ),
      "@chemlab/plugins-sdk": fileURLToPath(
        new URL("../../packages/plugins-sdk/src/index.ts", import.meta.url),
      ),
    },
  },
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
