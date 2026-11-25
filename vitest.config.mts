import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/test/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      include: [
        "src/lib/**/*.ts",
        "src/features/**/*.{ts,tsx}",
        "src/components/**/*.{ts,tsx}",
        "src/app/api/**/*.ts",
      ],
      exclude: [
        "src/test/**",
        "**/*.d.ts",
        "src/lib/analysis/index.ts",
        "src/lib/analysis/types.ts",
      ],
      thresholds: {
        statements: 80,
        lines: 80,
        functions: 80,
        branches: 75,
      },
    },
  },
});
