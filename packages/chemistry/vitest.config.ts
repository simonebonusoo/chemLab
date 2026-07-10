import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@chemlab/types": new URL("../types/src/index.ts", import.meta.url).pathname,
    },
  },
});
