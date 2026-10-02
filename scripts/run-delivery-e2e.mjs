import { runE2E } from "./lib/run-isolated-database.mjs";
await runE2E({ slug: "delivery_e2e", specs: ["tests/e2e/delivery.spec.ts"] });
