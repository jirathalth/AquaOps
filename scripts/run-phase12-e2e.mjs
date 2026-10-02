import { runE2E } from "./lib/run-isolated-database.mjs";
await runE2E({ slug: "phase12_e2e", specs: ["tests/e2e/sales-orders.spec.ts", "tests/e2e/delivery.spec.ts", "tests/e2e/accounting.spec.ts", "tests/e2e/phase12-critical.spec.ts"], workers: 1 });
