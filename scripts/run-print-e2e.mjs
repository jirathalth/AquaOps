import { runE2E } from "./lib/run-isolated-database.mjs";
await runE2E({ slug: "print_e2e", specs: ["tests/e2e/printable-documents.spec.ts"] });
