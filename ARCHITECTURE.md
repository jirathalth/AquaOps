# AquaOps Architecture

## Tech stack

- Next.js 16, React 19, TypeScript, App Router, IBM Plex Sans Thai
- Tailwind CSS 4, shadcn/ui source components, Lucide
- TanStack Table, React Hook Form, Zod
- PostgreSQL, Prisma ORM
- Better Auth
- Chart.js, react-chartjs-2
- Vitest, Playwright

## Modular monolith

```text
UI (app, components)
  → Feature / business logic (features)
    → Service (services)
      → Repository (repositories)
        → Database (Prisma / PostgreSQL)
```

Transport code stays in App Router pages and route handlers. Services expose use cases without depending on HTTP response objects. Repositories own persistence access. This boundary allows services and repositories to move to a separate backend later while preserving the UI-facing contract.

## Project structure

```text
prisma/                 Database schema and migrations
src/app/                Routes, layouts, route handlers, boundaries
src/components/ui/      shadcn-based primitives
src/components/layout/  Application shell
src/components/shared/  Reusable application behavior
src/features/           Feature-owned UI and business logic
src/services/           Application use cases
src/repositories/       Persistence access
src/lib/                Framework/database/auth utilities
src/config/             Navigation, permission/role registries, status, chart, locale configuration
src/constants/          Stable application constants
src/types/              Shared domain types
src/validations/        Zod schemas at input boundaries
```

## UI architecture

Server Components are the default. Client Components are limited to forms, navigation state, theme switching, dialogs, and charts. Semantic theme and status tokens are centralized; application components add behavior only when it is reused.

Thai is the default language, English is the fallback. Locale, currency, and timezone are centralized as `th-TH`, `THB`, and `Asia/Bangkok`. The lightweight message map can be replaced by a full i18n router if locale-specific URLs become necessary.

### Design-system patterns

- Semantic CSS variables drive light/dark colors; status colors are mapped centrally.
- Typography, page spacing, page headers, filters, financial values, feedback states, form sections, and destructive confirmations use shared patterns.
- `DataTable` owns TanStack Table rendering and supports controlled server-side pagination, sorting, and filtering as well as client-side mode.
- Small edits and confirmations use dialogs. Multi-section records and transactional workflows use full pages.
- Desktop uses an expandable sidebar, tablet defaults to icon-only navigation, and mobile uses a focus-trapped drawer. Tables retain useful column widths and scroll horizontally when required.
- `/dev/ui` is a development-only visual reference and is not part of production navigation.

## Service and repository layers

Route handlers and Server Actions validate transport input, then call services. Services implement authorization and workflows. Repositories contain Prisma queries and never return HTTP responses. Admin user/role actions are the reference mutation path: Zod → server permission guard → service rules/transaction → repository/database.

## Database strategy

Prisma uses PostgreSQL through the `pg` driver adapter. Better Auth owns its native authentication models; application RBAC remains separate. Phase 1 business models use UUIDs, exact decimals, restrictive foreign keys, snapshot fields, an append-only inventory ledger, and invoice/payment allocations as the accounts-receivable source of truth. A singleton client prevents excess development connections. Schema details, integrity rules, and required transaction boundaries are documented in [DATABASE.md](./DATABASE.md).

## Authentication and authorization

Better Auth owns `User`, `Session`, `Account`, `Verification`, password hashing, email/password login, logout, and session cookies through `/api/auth/[...all]`. Public self-registration is disabled. New operational users are created by an authorized administrator; temporary passwords are never logged or returned after creation.

The server-only authorization DAL loads the current database session, re-reads user status, active roles, and effective permissions, then deduplicates the union of all role permissions. `requireSession()`, `requirePermission()`, `requireAnyPermission()`, `requireRouteAccess()`, and `authorizeApi()` are the common enforcement points. Server Components check access close to their page data; every Server Action and Route Handler must repeat its own server-side check. Proxy performs only the inexpensive session-cookie redirect and is not a security boundary.

Permission codes use `resource.action` and are defined once in `src/config/permissions.ts`. Route mappings live in `src/config/route-permissions.ts`; navigation reuses permission metadata and removes empty groups. `PermissionProvider`, `Can`, and `usePermission` support lightweight UI visibility, but cannot grant server access.

Roles are database-configurable and additive: `User → UserRole → Role → RolePermission → Permission`. OWNER and ADMIN begin with full access; SALES, ACCOUNTING, WAREHOUSE, DELIVERY, PRODUCTION, and VIEWER receive focused defaults from the idempotent seed. System roles are read-only in normal administration; custom roles can be created, edited, enabled, and assigned permissions.

Inactive users are rejected when Better Auth creates a session and rejected again on every secure access load. Deactivation also revokes existing database sessions. Self-disable, removal of one's own final administrative access, and removal of the final active OWNER/ADMIN account are blocked. Authentication and RBAC mutations create append-only audit records without passwords, hashes, cookies, or tokens.
