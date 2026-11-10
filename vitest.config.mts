import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests (Vitest). Browser end-to-end tests live in e2e/ and run with Playwright.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
