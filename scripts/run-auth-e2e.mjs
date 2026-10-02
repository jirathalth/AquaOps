import { runE2E } from "./lib/run-isolated-database.mjs";
await runE2E({ slug: "auth_e2e", specs: ["tests/e2e/smoke.spec.ts"], authBypass: false, workers: 1 });
