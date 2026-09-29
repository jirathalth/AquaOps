# AquaOps Database Architecture

## Scope

This schema is the Phase 1 data foundation for:

```text
Customer → Sales Order → Inventory → Delivery → Invoice → Billing Note → Payment → Accounts Receivable
```

It defines persistence and integrity only. CRUD, workflows, numbering, status transitions, and authorization checks belong in future feature services.

## Conventions

- PostgreSQL is the source of truth; Prisma models use singular PascalCase and business tables use plural snake-case names.
- Business IDs are UUIDs. Better Auth keeps its native string IDs and table names.
- Business timestamps use `timestamptz(3)`; document dates use PostgreSQL `date`. Application display uses `Asia/Bangkok`.
- Money uses `decimal(14,2)`, unit prices/costs use `decimal(14,4)`, quantities use `decimal(14,3)`, and conversion factors use `decimal(14,6)`.
- Currency is stored per transaction and defaults to `THB`.
- Transactional documents store address, product, description, unit conversion, and price snapshots so later master-data edits do not rewrite history.
- Master records use active/inactive status or soft deletion. Issued transactional records must be cancelled, voided, or reversed instead of deleted.

## Domains

| Domain | Main models | Notes |
| --- | --- | --- |
| Authentication | `User`, `Session`, `Account`, `Verification` | Owned by Better Auth; `User.status` blocks inactive accounts |
| Authorization | `Role`, `Permission`, `UserRole`, `RolePermission` | Application RBAC; server-side enforcement is required |
| Audit | `AuditLog` | Generic append-only before/after history with actor snapshots |
| Customers | `Customer`, `CustomerAddress` | Retail/wholesale, cash/credit defaults, credit terms, billing cycles, multiple billing/shipping addresses |
| Catalog | `ProductCategory`, `Product`, `UnitOfMeasure`, `ProductUnit` | Multiple selling units with conversion to one base unit |
| Pricing | `PriceList`, `PriceListItem`, `CustomerProductPrice` | Multiple lists, quantity tiers, and time-bounded customer overrides |
| Sales | `SalesOrder`, `SalesOrderItem` | Snapshot values and cash/credit classification |
| Inventory | `Warehouse`, `InventoryMovement`, `InventoryLedgerEntry`, `StockBalance`, `InventoryReservation` | Multi-warehouse append-only ledger and balance projection |
| Delivery | `DeliveryTrip`, `DeliveryStop`, `Delivery`, `DeliveryItem` | Multiple orders per stop and partial deliveries |
| Invoicing | `Invoice`, `InvoiceItem` | Multiple invoices may reference one sales order |
| Billing | `BillingNote`, `BillingNoteInvoice` | One billing note can collect multiple invoices |
| Payments | `Payment`, `PaymentAllocation` | One payment can be allocated across invoices; partial allocation is supported |

## Accounts receivable

Accounts receivable is derived instead of duplicated in a mutable balance table:

```text
invoice outstanding = issued invoice total - completed, non-void payment allocations
customer outstanding = sum of outstanding invoices
```

Invoice date, due date, status, customer, and allocation indexes support aging reports. Billing notes group invoices but do not create a second receivable balance.

## Database-enforced integrity

The initial migration adds safeguards that Prisma cannot express directly:

- non-negative money, valid quantity, percentage, date, and fulfillment ranges;
- one default address per customer/address type, one base unit per product, and one default warehouse;
- one active reservation per order line and warehouse;
- immutable inventory ledger and audit rows;
- automatic stock-balance updates in the same transaction as ledger inserts;
- reservation updates that cannot exceed available on-hand stock;
- payment allocations limited by payment and invoice totals;
- customer/currency consistency across payments, invoices, and billing notes.

Foreign keys use restrictive deletion for business history. Cascades are limited to owned draft/detail data and Better Auth session/account data.

## Authentication and RBAC integrity

- `User.status` is `ACTIVE` or `INACTIVE` and indexed. Existing users migrate to `ACTIVE` without data reset.
- `Role.code` and `Permission.code` are unique. Composite primary keys on `UserRole(userId, roleId)` and `RolePermission(roleId, permissionId)` prevent duplicate assignments.
- Only active roles contribute permissions. Effective permissions are the union of all active assigned roles; no deny rules exist in Phase #4.
- Better Auth remains the only owner of credential accounts and password hashing. Application RBAC does not duplicate email, password, account, or session data.
- Users are disabled instead of hard-deleted to preserve document and audit attribution. Disabling a user revokes sessions, while every request also checks current status.
- System role definitions and permission mappings are synchronized by `npm run db:seed`. Custom roles remain database-managed.
- Login/logout, user status/profile changes, role assignment/removal, role changes, and permission changes write to the existing immutable `AuditLog`. Credentials and session secrets are excluded.

## Required service transactions

Services must use Prisma interactive transactions for these operations:

1. Create/update a customer: generate the customer code from `customer_code_seq`, persist customer and addresses, and append an audit record atomically. Sequence gaps after rollbacks are accepted; duplicate codes are not.
2. Confirm an order: validate price/credit, reserve stock, update status, write audit log.
3. Post inventory: create one movement and all ledger entries; transfers must create balanced source and destination entries.
4. Complete delivery: record delivered quantities, post inventory issue, release/fulfill reservations, update order state.
5. Issue invoice or billing note: lock the source document, calculate totals server-side, persist lines, update status, write audit log.
6. Complete or void payment: lock payment/invoices, maintain allocations, update derived statuses, write audit log.

Customer codes use the PostgreSQL sequence and `CUS-000001` display format. Other document numbers must be generated atomically by a repository or database sequence when each module is implemented. Client-supplied totals, prices, permissions, and status transitions must never be trusted.

## Customer lifecycle

- Customer type is `RETAIL` or `WHOLESALE`; status is `ACTIVE` or `INACTIVE`. Deactivation replaces deletion so transactional attribution remains intact.
- `defaultSaleType`, `creditTermDays`, and exact `decimal(14,2)` `creditLimit` are separate concepts. Cash customers are normalized to zero credit.
- `BillingCycle` stores `NONE`, day 15, month end, both, or a custom note. It is configuration only; no scheduler is implemented.
- Each customer can own multiple `BILLING` and `SHIPPING` addresses. The database permits only one default for each type.
- `defaultPriceListId` points to an existing active price list during create/update. Product pricing management remains a later module.
- Customer changes append `CUSTOMER_CREATED`, `CUSTOMER_UPDATED`, `CUSTOMER_DEACTIVATED`, or `CUSTOMER_REACTIVATED` records to the shared `AuditLog`.

## Migrations

Use Node.js 20.19+ (Node.js 22 LTS recommended).

```bash
npm run db:validate
npm run db:generate
npm run db:migrate -- --name <change_name>
npm run db:deploy
npm run db:seed
```

The baseline migration creates Phase 1 tables and database guards. `20260928010000_authentication_rbac` adds `UserStatus` and the indexed user status column without dropping or resetting data. `20260929000000_customer_management` adds billing-cycle fields and the concurrency-safe customer-code sequence. If an existing database contains unmanaged tables, back it up and reconcile it with `prisma migrate diff` before applying migrations; do not mark a migration as applied unless every object and constraint already exists.
