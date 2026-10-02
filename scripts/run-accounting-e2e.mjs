import { runE2E } from "./lib/run-isolated-database.mjs";
await runE2E({ slug: "accounting_e2e", specs: ["tests/e2e/accounting.spec.ts"] });
