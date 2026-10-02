import { runE2E } from "./lib/run-isolated-database.mjs";
await runE2E({ slug: "e2e", workers: 1 });
