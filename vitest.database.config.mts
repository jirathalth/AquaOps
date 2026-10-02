import { defineConfig } from "vitest/config";
import { assertIsolatedTestRuntime } from "./src/config/database-environment.ts";

assertIsolatedTestRuntime(process.env, "Vitest database integration tests");

export default defineConfig({
  test: { environment: "node", include: ["src/**/*-database.test.ts"], fileParallelism: false },
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname, "server-only": new URL("./src/test/server-only.ts", import.meta.url).pathname } },
});
