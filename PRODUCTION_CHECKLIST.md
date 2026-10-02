# AquaOps Phase 1 Production Checklist

Last verified: 2026-10-01

## Release gates

- [x] Prisma schema validates and a fresh PostgreSQL database applies all migrations.
- [x] RBAC bootstrap is idempotent and demo data is restricted to approved isolated test targets.
- [x] Lint, TypeScript, unit tests, database integration suites, and production build pass.
- [x] Critical browser flows pass for real authentication/RBAC, Sales Orders, Delivery, Accounting, and responsive containment.
- [x] Inventory ledger reconciles to `StockBalance`; negative stock and duplicate delivery postings are rejected.
- [x] Issued Invoice totals reconcile to Sales Order snapshots and valid Payment Allocations reconcile to AR.
- [x] Document numbers and idempotency keys have database uniqueness and transactional generation.
- [x] Historical reports use transactional snapshots, including customer type.
- [x] Protected mutations validate input and enforce permissions on the server.
- [x] No production secret or predictable bootstrap password is stored in source control.
- [x] No known Critical or High integrity, security, or data-loss issue remains.
- [x] Settings are typed, permission-controlled, audited, concurrency-safe, and contain no infrastructure secrets.

## Before deployment

1. Back up the target PostgreSQL database and record the restore location and retention policy.
2. Set the least-privilege runtime `DATABASE_URL`, `AQUAOPS_DATABASE_PURPOSE=shared`, a unique `BETTER_AUTH_SECRET` of at least 32 characters, and the public absolute `BETTER_AUTH_URL` over HTTPS. Keep `AQUAOPS_AUTH_BYPASS=false`.
3. For the first OWNER only, set a non-predictable `AQUAOPS_BOOTSTRAP_EMAIL` and password of at least 12 characters, run the explicit seed, then remove the bootstrap values from the runtime environment.
4. Run `npm ci`, review migration SQL, set the dedicated `MIGRATION_DATABASE_URL`, then run `npm run db:validate`, `npm run db:status`, `npm run db:deploy`, and `npm run build`. Never run `prisma migrate dev`, `migrate reset`, or forced `db push` against the shared database.
5. If RBAC definitions need synchronization, run `npm run db:bootstrap` explicitly. Application startup does not migrate or bootstrap automatically; never run `db:seed:demo` on the shared database.
6. Start the application, verify `GET /api/health` reports application/database health, then smoke-test login and one permission-restricted route.

## Settings readiness

- [ ] Business/legal information and Thai document address are configured as required.
- [ ] VAT default and exclusive-tax behavior are verified for new Sales Orders.
- [ ] Default Price List fallback and active default Warehouse references are verified.
- [ ] Sales Order, Delivery, Inventory, Invoice, Billing Note, and Payment prefixes are approved; counters remain read-only.
- [ ] Default Payment Method and document payment instructions are verified.
- [x] Locale is `th-TH`, currency is `THB`, and timezone is `Asia/Bangkok`.
- [x] Database/auth URLs, passwords, tokens, and credentials are not stored in Settings.

## Post-deployment integrity

- Confirm migration status with `npm run db:status` and retain deployment logs.
- Run inventory reconciliation through `checkInventoryIntegrity()` in the controlled operations environment; every ledger sum must equal its stock balance.
- Run financial reconciliation through `checkFinancialIntegrity()`; completed payment allocations must not exceed payment or invoice totals.
- Confirm no negative stock, duplicate active Invoice per Sales Order, duplicate active delivery assignment, or duplicate completed payment submission exists.
- Compare Dashboard sales, delivery, inventory, and AR totals with their corresponding reports for the same filters/business date.
- Verify recent critical mutations created `AuditLog` rows without credentials, tokens, or secrets.

## Backup and recovery

PostgreSQL backup is an external operational responsibility. Use encrypted backups with retention appropriate for financial and inventory history, monitor backup failures, and test a full restore into an isolated environment before launch and periodically thereafter. A restore drill must include migration status, login, inventory reconciliation, AR reconciliation, and a read-only document sample before service is reopened.

## Phase 1 acceptance

| Area | Status | Evidence |
| --- | --- | --- |
| Authentication / RBAC | Accepted | Real login/logout, unauthenticated API, restricted navigation, and direct-route denial tested |
| Customers | Accepted | Validation, transactional addresses, status lifecycle, audit, and snapshots exercised |
| Products / Pricing | Accepted | Override → price list → product default resolution and exact decimals exercised |
| Sales Orders | Accepted | Create, snapshot, totals, confirm, numbering, and permission paths tested |
| Inventory | Accepted | Atomic ledger posting, negative-stock protection, concurrency, immutability, and reconciliation tested |
| Delivery | Accepted | Plan, load, dispatch, delivered/failed return, completion, and duplicate-posting protection tested |
| Invoice / Billing | Accepted | Snapshot documents, issue idempotency, uniqueness, grouping, and lifecycle tested |
| Payments / AR | Accepted | Partial/final payment, duplicate submission, over-allocation, void behavior, aging, and reconciliation tested |
| Dashboard / Reports | Accepted | Shared definitions, pagination/export boundaries, snapshot history, and cross-report totals tested |
| Audit trail | Accepted for capture | Critical actions write immutable records; a centralized operator audit-log viewer is not yet implemented |
| System Settings | Accepted | Typed singleton, active master-data references, future-only defaults, stable document counters, RBAC, optimistic concurrency, and old/new audit capture tested |

## Known issues

- **Medium:** `/admin/audit-logs` is still a placeholder. Audit capture and record integrity are implemented, but operations cannot yet search all events from one screen.
- **Low:** current Prisma PostgreSQL adapter test runs emit a `pg` deprecation warning for a nested interactive-transaction read. Tests pass and application code no longer intentionally runs parallel queries on one transaction client; re-evaluate before upgrading to `pg` 9.

No known Critical or High issue remains as of the verification date. Re-run the release gates after dependency, migration, authentication, inventory, accounting, or reporting changes.
