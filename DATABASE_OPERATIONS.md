# AquaOps Database Operations

## Database categories

### Shared runtime database

`AQUAOPS_DATABASE_PURPOSE=shared`. Local development on every computer and production intentionally use this one database through `DATABASE_URL`. After cloud cutover, normal local application actions operate on real shared data and can change it; the safety guards do not prevent intentional application CRUD.

Use a least-privilege runtime role for application CRUD and transactions. It should not own the database or require DDL privileges.

### Isolated test database

`AQUAOPS_DATABASE_PURPOSE=test`. Database integration and Playwright commands require both `TEST_DATABASE_URL` and `TEST_DATABASE_ADMIN_URL`, prove that the test target differs from `DATABASE_URL`, create a uniquely named disposable database, and drop only that database. This is test infrastructure, not a second AquaOps development runtime.

The admin URL is explicit and is never derived from the shared runtime credential. It must be limited to disposable databases on the test server. Run guarded suites with:

```bash
AQUAOPS_DATABASE_PURPOSE=test npm run test:settings-db
AQUAOPS_DATABASE_PURPOSE=test npm run test:e2e:auth
```

Pure unit tests use `npm test` and need no PostgreSQL connection. Direct `playwright test` and direct database-test config execution fail closed.

### Migration development and rehearsal database

`AQUAOPS_DATABASE_PURPOSE=migration`. This isolated database or provider branch is used only to generate and rehearse migrations. It is not a normal runtime environment.

```bash
AQUAOPS_DATABASE_PURPOSE=migration npm run db:migrate:dev -- --name <change_name>
```

`MIGRATION_DATABASE_URL` must differ from the shared `DATABASE_URL` for migration development. Never use `prisma migrate dev`, `migrate reset`, or forced `db push` against the shared database.

## Shared deployment workflow

1. Back up the shared database and verify the restore location.
2. Review the migration SQL and rehearse it on an isolated restored database/branch.
3. Set `AQUAOPS_DATABASE_PURPOSE=shared` and a DDL-capable `MIGRATION_DATABASE_URL` for the shared target.
4. Run `npm run db:status`, then `npm run db:deploy`.
5. Run `npm run db:bootstrap` only when RBAC baseline synchronization is required.
6. Verify migration status, login, inventory integrity, and financial integrity.

Application startup never runs migrations, bootstrap, demo seed, or test-user creation. Remove migration credentials from the runtime service after the administrative operation.

## Bootstrap and demo data

`npm run db:bootstrap` idempotently upserts permissions/system roles and synchronizes only changed system-role mappings. It preserves custom roles and all user assignments. Optional initial Owner creation refuses to run when an active Owner/Admin already exists and never overwrites an existing user.

`npm run db:seed:demo` is destructive development/test fixture work. It runs only inside an approved isolated test target. It never falls back to `DATABASE_URL` and cannot run with purpose `shared`.

## Environment files and new computers

Use `.env` as the only local source of `DATABASE_URL`; `.env` and `.env.local` are ignored. Do not duplicate `DATABASE_URL` in `.env.local`. The preflight rejects conflicting values. `.env.local` may hold unrelated Next.js-only settings.

New machine setup is: clone, select the repository Node version, `npm install`, copy `.env.example` to `.env`, enter the shared runtime settings, and run `npm run dev`. PostgreSQL/Postgres.app is not required after cloud cutover. `npm install` does not generate Prisma or require database credentials; guarded `predev` and `prebuild` generate the client without connecting.

Cloud TLS should be expressed by the provider connection string (for example `sslmode=require`). AquaOps does not disable certificate verification globally.

## Neon Free workflow

Verified on 2026-10-02 for the AquaOps Free project in AWS Asia Pacific 1 (Singapore):

- The root branch is `production`; it is reserved for the future shared runtime database and is not the current source of truth.
- Disposable branches are used for database tests and migration rehearsal. They are not separate development runtime environments.
- AquaOps runtime uses the pooled Neon endpoint. `pg_dump`, `pg_restore`, and administrative migration work use the direct endpoint.
- Keep real Neon URLs only in ignored files or shell-scoped variables. The rehearsal convention is `NEON_REHEARSAL_DATABASE_URL` for pooled access and `NEON_REHEARSAL_MIGRATION_DATABASE_URL` for direct access in `.env.rehearsal`.
- No Neon SDK, Neon Auth, Functions, Object Storage, or Data API is required.

Current Free limits relevant to AquaOps are 0.5 GB storage per project, 100 CU-hours per project per month, up to 10 branches, autoscaling up to 2 CU, and scale to zero after inactivity. Free restore history is 6 hours, so it is not a substitute for independent logical backups. Recheck the [Neon Free Plan guidance](https://neon.com/blog/how-to-make-the-most-of-neons-free-plan), [compute documentation](https://neon.com/docs/manage/endpoints/), and the project console before final cutover because provider limits can change.

### Rehearsal procedure

1. Create a disposable branch from the empty root branch, set an auto-delete deadline, and record the branch identity separately from its credentials.
2. Verify source and target PostgreSQL versions, installed extensions, migration history, and the empty target identity.
3. Capture source counts and inventory/financial reconciliation results without writing to the source.
4. Create a custom-format logical dump outside the repository with `pg_dump --format=custom --no-owner --no-acl`.
5. Restore through the direct endpoint with `pg_restore --clean --if-exists --no-owner --no-acl --single-transaction --exit-on-error` only after confirming the disposable target identity.
6. Do not rerun migrations on top of the restored dump. Use `prisma migrate status` and compare repository checksums with `_prisma_migrations`.
7. Compare schema objects, representative row counts, Auth/RBAC relationships, inventory, accounting/AR, document sequences, settings, and audit history.
8. Run the application temporarily with the pooled endpoint and `AQUAOPS_DATABASE_PURPOSE=test`; never replace the normal `.env` during rehearsal.
9. Keep smoke-test mutations confined to the disposable branch and retain audit history.

The 2026-10-02 rehearsal used PostgreSQL 16.15 at both ends and restored all 11 migrations successfully. Prisma 7, `@prisma/adapter-pg`, and `pg` worked through the pooled endpoint with the existing maximum of three application connections per process. The local PostgreSQL database remains authoritative until final cutover.

### Final cutover prerequisites

Do not perform these steps as part of rehearsal. The final cutover is an explicit maintenance operation:

1. Confirm an independent backup and restore location.
2. Confirm the Neon root target and direct migration credential.
3. Freeze every writer to the local source.
4. Create the final logical dump.
5. Restore it to the confirmed root target.
6. Verify Prisma migrations and checksums.
7. Reconcile inventory.
8. Reconcile accounting and accounts receivable.
9. Verify Better Auth and RBAC.
10. Switch every runtime `DATABASE_URL` to the pooled Neon URL.
11. Run a controlled smoke test.
12. Monitor errors, latency, connections, storage, and compute usage.
13. Test the available Neon restore capability and retain independent backups.
14. Retain the local source unchanged through the confidence period.
