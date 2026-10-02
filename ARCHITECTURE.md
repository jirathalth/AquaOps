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

Customer Management follows the same boundary: Server Components load paginated query results, the feature-owned React Hook Form sends plain values to Server Actions, `customer.service` applies normalization and transaction rules, and `customer.repository` is the only layer that queries Prisma. Customer, address replacement, sequence-generated code, and audit writes share one interactive transaction. Currency inputs stay decimal strings until Prisma/PostgreSQL persistence.

Product and pricing modules use the same path through `features/products|pricing`, focused services, and focused repositories. Product/category/unit mutations and all price changes write audit events in their database transaction. `pricing.service` is the single pricing resolver used by current preview and future order services; UI components never implement pricing precedence.

Sales orders follow `features/sales-orders → sales-order.service → sales-order.repository`. The UI submits customer/product references and operator inputs only; the service reloads active master data, calls the centralized pricing resolver, creates customer identity/type, product/unit, and price snapshots, recalculates all totals with fixed-decimal domain logic, and persists the order, items, history, numbering, and audit records in one transaction. Server Actions repeat authentication, permission, and Zod validation for every mutation.

Inventory follows `features/inventory → inventory.service → inventory.repository`. `recordInventoryMovement` is the controlled posting boundary. The service validates active warehouses and base product units, normalizes quantities with fixed-decimal helpers, generates `STK-YYYYMM-00001` numbers from `DocumentSequence`, and appends signed ledger entries. Adjustment and transfer audits share the same serializable transaction as the movement. UI code never updates balances.

Delivery follows `features/delivery → delivery.service → delivery.repository`. The service owns trip numbering and lifecycle, order assignment, sequence, Sales Order histories, delivery outcomes, returns, and audit orchestration. Critical actions use one serializable transaction and call the centralized inventory batch posting boundary; React components and Server Actions never create ledger rows or update balances. The existing `DeliveryStop → Delivery → DeliveryItem` structure represents ordered trip stops and their Sales Orders, so no competing `DeliveryTripOrder` model is introduced.

Accounting follows `features/accounting → accounting.service/accounting-core → accounting.repository`. Invoice, Billing Note, Payment, PaymentAllocation, outstanding, and aging rules stay out of React. Financial amounts remain decimal strings at boundaries and use fixed-decimal/Prisma Decimal persistence; list/detail/AR views all call the same outstanding strategy. Invoice issue, billing grouping, payment/allocation, and cancellation run in serializable transactions with database row locks and audit writes.

Reporting follows `features/reports → reporting.service/reporting-core → reporting.repository`. Reports are read-only read models: pages validate URL search parameters, services compose authoritative sales/inventory/delivery/accounting definitions, and repositories own aggregation and pagination. Dashboard sales cards and charts share `salesWhere`; historical retail/wholesale segmentation uses `SalesOrder.customerTypeSnapshot`; AR delegates to `getAccountsReceivable`; inventory reports delegate to the existing StockBalance/ledger services. Chart values cross into JavaScript numbers only inside the Chart.js presentation component after Decimal-safe server aggregation.

CSV export is a no-store Route Handler guarded by both `report.view` and the report's underlying domain permission. It exports the complete filtered result up to 10,000 rows, emits UTF-8 with BOM for Thai text, quotes CSV control characters, and prefixes spreadsheet-formula cells. No analytics database or report cache is introduced.

## Database strategy

Prisma uses PostgreSQL through the `pg` driver adapter. Better Auth owns its native authentication models; application RBAC remains separate. The singleton Prisma client owns one explicitly bounded `pg` pool per process. `DATABASE_POOL_MAX` defaults to 3, with explicit idle and connection timeouts. Provider TLS stays in the PostgreSQL URL; certificate verification is not globally disabled. Schema details, integrity rules, and required transaction boundaries are documented in [DATABASE.md](./DATABASE.md).

## Production readiness

Database configuration is centrally validated and requires an explicit URL and purpose independent of `NODE_ENV`. Shared runtime, isolated test, and migration/rehearsal targets have separate credentials and guarded commands. Database migrations and bootstrap are explicit administrative operations; application startup never migrates, seeds, or creates test users. See [DATABASE_OPERATIONS.md](./DATABASE_OPERATIONS.md).

## System settings

Settings follow `features/settings → settings.service → settings.repository → BusinessSetting`. The known, typed singleton avoids arbitrary runtime keys and stores only business identity, future-record defaults, document presentation, master-data references, and fixed localization values. Server Actions enforce `settings.manage`; the service validates active references, uses serializable transactions plus optimistic `version` matching, and appends group-level old/new AuditLog records. Reads go through grouped service queries rather than React components querying Prisma.

Document counters are independent from configurable display prefixes: sequence keys use stable document types (`SALES_ORDER`, `DELIVERY_TRIP`, `INVENTORY_MOVEMENT`, `INVOICE`, `BILLING_NOTE`, `PAYMENT`) plus `YYYYMM`. Prefix changes therefore continue the same counter and affect future documents only. Pricing fallback is Customer Override → Customer Price List → configured Price List → Product default. Settings never rewrites transaction snapshots. Environment secrets and infrastructure URLs remain outside the database; master-data modules remain authoritative for their records. See [SETTINGS.md](./SETTINGS.md).

## Authentication and authorization

Better Auth owns `User`, `Session`, `Account`, `Verification`, password hashing, email/password login, logout, and session cookies through `/api/auth/[...all]`. Public self-registration is disabled. New operational users are created by an authorized administrator; temporary passwords are never logged or returned after creation.

The server-only authorization DAL loads the current database session, re-reads user status, active roles, and effective permissions, then deduplicates the union of all role permissions. `requireSession()`, `requirePermission()`, `requireAnyPermission()`, `requireRouteAccess()`, and `authorizeApi()` are the common enforcement points. Server Components check access close to their page data; every Server Action and Route Handler must repeat its own server-side check. Proxy performs only the inexpensive session-cookie redirect and is not a security boundary.

Permission codes use `resource.action` and are defined once in `src/config/permissions.ts`. Route mappings live in `src/config/route-permissions.ts`; navigation reuses permission metadata and removes empty groups. `PermissionProvider`, `Can`, and `usePermission` support lightweight UI visibility, but cannot grant server access.

Roles are database-configurable and additive: `User → UserRole → Role → RolePermission → Permission`. OWNER and ADMIN begin with full access; SALES, ACCOUNTING, WAREHOUSE, DELIVERY, PRODUCTION, and VIEWER receive focused defaults from the idempotent seed. System roles are read-only in normal administration; custom roles can be created, edited, enabled, and assigned permissions.

Inactive users are rejected when Better Auth creates a session and rejected again on every secure access load. Deactivation also revokes existing database sessions. Self-disable, removal of one's own final administrative access, and removal of the final active OWNER/ADMIN account are blocked. Authentication and RBAC mutations create append-only audit records without passwords, hashes, cookies, or tokens.

## Product and pricing

- Product SKU and optional barcode are normalized and unique. SKU is entered by the operator in this phase; no competing number sequence is introduced.
- Each product begins with one immutable base-unit assignment. The schema remains compatible with additional selling units, but conversion workflows are deferred.
- Unit cost, retail price, wholesale price, list prices, and customer prices stay exact decimal strings until Prisma/PostgreSQL persistence.
- Effective pricing is resolved centrally: active customer override, then active/valid customer default price list and quantity tier, then retail/wholesale product default according to customer type.
- Cost visibility currently follows `product.update`; a dedicated cost permission can be added when costing workflows are implemented.
- Configuration changes affect only new transactions. Future orders and invoices store price snapshots and are never rewritten by master-price changes.

## Sales orders

- Monthly order numbers use the stable `SALES_ORDER-YYYYMM` counter and configured display prefix (default `SO-YYYYMM-00001`); no `MAX + 1` query is used.
- Draft creation and editing resolve `CustomerProductPrice → PriceListItem → ProductUnit default`, then preserve the resolved and final unit prices plus source and override metadata.
- The calculation engine rounds line gross values to two decimals, applies line discounts, allocates the document discount proportionally, then calculates exclusive line tax from the discounted taxable base. The server always recalculates persisted totals.
- Customer code/name, credit term/limit, product name, SKU, unit name, conversion factor, and prices are transaction snapshots. Cash orders snapshot zero credit; credit orders snapshot the customer's current terms.
- Phase #7 owns `DRAFT → CONFIRMED`, `DRAFT → CANCELLED`, and `CONFIRMED → CANCELLED`. Phase #9 Delivery owns `PREPARING`, `READY`, `DELIVERING`, and `DELIVERED` transitions with status history.
- Confirmation validates authoritative draft data and writes status history/audit atomically. **It does not reserve or deduct inventory in Phase #7.** Credit-limit enforcement is deferred until reliable invoice/payment-derived AR exists.

## Inventory

- **InventoryTransaction is the authoritative stock movement history.** AquaOps retains the Phase #3 names: `InventoryMovement` is the logical header and signed `InventoryLedgerEntry` rows are the authoritative quantity ledger.
- **InventoryBalance is a derived operational projection and must remain consistent with the ledger.** The existing model is named `StockBalance`; PostgreSQL updates it from ledger insert triggers in the same transaction.
- Quantities are base-unit `decimal(14,3)` values. A positive ledger quantity increases stock and a negative quantity reduces it; movement type and sign are not competing direction sources.
- Negative available stock is forbidden. A conditional database update locks the balance row and succeeds only when `onHand + delta >= reserved`; serializable service transactions handle wider write conflicts. This prevents two concurrent reductions from both consuming the same stock.
- A transfer is one `InventoryMovement` with a negative source entry and positive destination entry. Both entries, projection updates, and the business audit commit or roll back together.
- Movement headers and ledger rows are immutable. Corrections append a compensating movement. `checkInventoryIntegrity()` compares ledger sums with the balance projection; rebuild is an explicit maintenance operation, never part of request handling.
- Warehouse management uses activation status rather than deletion. Inactive warehouses remain visible historically and are rejected for new postings.
- Sales Order confirmation still does not reserve or deduct stock. Delivery loading is the physical issue point; current quantity remains distinct from available-to-promise because confirmed orders are not reserved.

## Delivery

- Monthly trip numbers use the stable `DELIVERY_TRIP-YYYYMM` counter with configured display prefix (default `DL-YYYYMM-00001`); no `MAX + 1` query is used.
- The established trip lifecycle remains `PLANNED → LOADING → IN_TRANSIT → COMPLETED`, with safe cancellation from `PLANNED` or `LOADING`. `IN_TRANSIT` is the schema-level equivalent of dispatched.
- Assigning a confirmed order moves it to `PREPARING`. Atomic loading transfers all required base-unit quantities from the order source warehouse to the selected vehicle warehouse and moves orders to `READY`. Dispatch moves orders to `DELIVERING`.
- Successful delivery posts one idempotent `SALE` movement from the vehicle warehouse and moves the order to `DELIVERED`. Delivery does not move the order to `COMPLETED`; invoicing/payment phases may own that future rule.
- Failed delivery does not post a sale. Stock remains in the vehicle warehouse until the explicit idempotent return transfers it to the source warehouse, after which the order returns to `READY` for re-delivery. A trip cannot complete while failed stock remains unreturned.
- Sales Orders use their persisted shipping-address snapshot. Customer master-data changes never rewrite an assigned delivery destination.

## Accounting lifecycle

- Phase 10 creates one full-order Invoice from a `DELIVERED` Sales Order; issue moves the order to `COMPLETED`. A partial unique index prevents another non-void full-order invoice while preserving the schema's future multiple-invoice relationship.
- Invoice/customer/item/pricing/credit-term snapshots become immutable after issue. CASH invoices are due on the invoice date; CREDIT invoices use the Sales Order credit-term snapshot.
- Billing Notes group current outstanding amounts for one customer. Invoice row locks plus Serializable transactions prevent conflicting active assignments.
- Payments are posted once with zero or more immutable allocations. Unallocated money remains explicit; voiding a payment retains allocations as history but removes their financial effect.
- Invoice outstanding is total minus allocations whose Payment is `COMPLETED`. Status precedence is `PAID`, then `OVERDUE`, then `PARTIALLY_PAID`, then `ISSUED`; paid/outstanding values remain visible when overdue.
- AR is derived from Invoice and PaymentAllocation, never manually edited. Aging uses due date against an explicit Bangkok business `asOfDate`: current, 1–30, 31–60, 61–90, and 90+ days.
