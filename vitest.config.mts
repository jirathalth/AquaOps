import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["src/**/*.test.ts"], exclude: ["src/**/*-database.test.ts", "node_modules/**"] },
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname, "server-only": new URL("./src/test/server-only.ts", import.meta.url).pathname } },
});
