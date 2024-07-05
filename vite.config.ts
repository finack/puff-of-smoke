/// <reference types="vitest" />
import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./test/setup-test-env.ts"],
    include: ["./app/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    watchExclude: [".*\\/node_modules\\/.*", ".*\\/build\\/.*"],
  },
});
