import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["lib/__tests__/integration/**/*.test.ts"],
    exclude: ["node_modules", ".next"],
    globalSetup: "./vitest.global-setup.ts",
    testTimeout: 30000,
    hookTimeout: 60000,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
});
