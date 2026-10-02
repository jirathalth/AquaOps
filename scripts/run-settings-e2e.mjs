import { runE2E } from "./lib/run-isolated-database.mjs";
await runE2E({ slug: "settings_e2e", specs: ["tests/e2e/settings.spec.ts"], authBypass: false, workers: 1 });
