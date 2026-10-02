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
