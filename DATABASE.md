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
| Sales | `SalesOrder`, `SalesOrderItem`, `SalesOrderStatusHistory`, `DocumentSequence` | Snapshot values, cash/credit classification, controlled status history, atomic document numbering |
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
2. Create/update an order: atomically increment the monthly document counter when creating, persist the order and item snapshots, server-calculated totals, and audit/history records.
3. Confirm or cancel an order: reload and validate authoritative data, recalculate totals on confirmation, update status, and write status history plus audit log atomically. Phase #7 does not reserve or deduct stock.
4. Post inventory: create one movement and all ledger entries; transfers must create balanced source and destination entries.
5. Run delivery operations: loading transfers source stock to the vehicle; successful delivery posts the vehicle `SALE`; failed delivery return transfers vehicle stock back to source. Each operation updates delivery/order state, history, and audit atomically.
6. Issue invoice or billing note: lock the source document, calculate totals server-side, persist lines, update status, write audit log.
7. Complete or void payment: lock payment/invoices, maintain allocations, update derived statuses, write audit log.

Customer codes use the PostgreSQL sequence and `CUS-000001` display format. Other document numbers must be generated atomically by a repository or database sequence when each module is implemented. Client-supplied totals, prices, permissions, and status transitions must never be trusted.

## Customer lifecycle

- Customer type is `RETAIL` or `WHOLESALE`; status is `ACTIVE` or `INACTIVE`. Deactivation replaces deletion so transactional attribution remains intact.
- `defaultSaleType`, `creditTermDays`, and exact `decimal(14,2)` `creditLimit` are separate concepts. Cash customers are normalized to zero credit.
- `BillingCycle` stores `NONE`, day 15, month end, both, or a custom note. It is configuration only; no scheduler is implemented.
- Each customer can own multiple `BILLING` and `SHIPPING` addresses. The database permits only one default for each type.
- `defaultPriceListId` points to an existing active price list during create/update.
- Customer changes append `CUSTOMER_CREATED`, `CUSTOMER_UPDATED`, `CUSTOMER_DEACTIVATED`, or `CUSTOMER_REACTIVATED` records to the shared `AuditLog`.

## Product and pricing lifecycle

- Products, categories, units, and price lists are deactivated instead of deleting referenced master data. Existing relationships remain readable.
- `ProductUnit` owns unit-specific cost, retail price, and wholesale price as `decimal(14,4)`. Non-negative checks are enforced by PostgreSQL.
- Phase #6 creates one base unit per product. The existing conversion factor supports later selling-unit extensions without implementing conversion chains now.
- `PriceListItem` uniquely identifies a price by price list, product unit, and minimum quantity. Quantity tiers use the greatest qualifying minimum quantity.
- `CustomerProductPrice` is time-bounded and deactivated by setting `validTo`; history is retained.
- Resolution order is `CustomerProductPrice → Customer.defaultPriceList/PriceListItem → ProductUnit retail/wholesale default`. Retail customers fall back to retail price and wholesale customers to wholesale price.
- All prices remain decimal strings in validation/services and become Prisma Decimal only at persistence. No JavaScript floating-point calculation is used for business prices.
- Product and pricing changes append to the shared `AuditLog`, including old/new pricing values where applicable.
- Master-price changes apply only to new price resolution. Transaction item snapshots preserve historical selling prices.

## Sales order lifecycle

- `DocumentSequence` uses one row per `SO-YYYYMM` period. Transactional upsert/increment provides concurrency-safe numbering; gaps after rollback/retry are acceptable.
- Orders snapshot customer code/name and the credit term/limit that applied at creation or the last allowed draft edit. Cash orders store zero credit; historical credit terms are never recalculated from Customer.
- Items snapshot product name, SKU, unit name, conversion factor, resolved price, final unit price, and pricing source. Master-data and pricing changes never rewrite existing order lines.
- Line gross is rounded to 2 decimals from exact quantity × unit price. Line discounts and the proportionally allocated document discount reduce the taxable base; tax is exclusive and calculated per line. Document subtotal, total discount, tax, and grand total are sums of the persisted server calculation.
- Status transitions are centralized. Phase #7 permits `DRAFT → CONFIRMED`, `DRAFT → CANCELLED`, and `CONFIRMED → CANCELLED`; each writes `SalesOrderStatusHistory` and `AuditLog` in the same transaction.
- Credit-limit enforcement is intentionally deferred until Invoice/Payment modules provide reliable outstanding AR. Settings are displayed and snapshotted but do not block valid Phase #7 orders.
- **Sales Order confirmation does NOT reserve or deduct inventory in Phase #7.** Inventory behavior belongs to Phase #8.

## Inventory lifecycle

- **InventoryTransaction is the authoritative stock movement history.** The established Phase #3 schema represents that concept with an immutable `InventoryMovement` header and signed immutable `InventoryLedgerEntry` rows. It is not a separate model named `InventoryTransaction`.
- **InventoryBalance is a derived operational projection and must remain consistent with the ledger.** The established model name is `StockBalance`, keyed by warehouse and product and expressed in the product base unit.
- Quantity direction uses signed ledger quantities: positive increases stock and negative decreases stock. `InventoryMovementType` describes the business origin; it does not replace or duplicate the signed quantity.
- All quantities use `decimal(14,3)`. Application calculations use string/BigInt fixed-decimal helpers and Prisma Decimal serialization; JavaScript floating-point arithmetic is not used.
- `STK-YYYYMM-00001` is generated by atomically upserting the monthly `DocumentSequence` row. `MAX + 1` is prohibited.
- Each ledger insert invokes `apply_inventory_ledger_entry()` in the same transaction. Positive entries upsert the projection. Negative entries use a conditional `UPDATE` that locks the balance row and permits the write only when the resulting on-hand quantity remains at least the reserved quantity. Failure aborts the ledger insert and its surrounding transaction.
- Inventory services also use `Serializable` interactive transactions. Transfers lock relevant existing balance rows in deterministic warehouse-ID order, append a negative source entry and positive destination entry under one movement, then write one business audit record. Partial transfers cannot commit.
- New movements require active warehouses and active inventory-tracked products with an active base unit. Inactive warehouses retain balances/history but reject new entries. Warehouses are deactivated, not hard-deleted.
- Normal operations cannot create negative stock. Any future exceptional override requires an explicit permission and policy; Phase #8 has no bypass.
- Posted movements and ledger entries are database-immutable. Corrections use a new compensating movement; a full reversal UI is deferred.
- `checkInventoryIntegrity()` reports any warehouse/product where `SUM(InventoryLedgerEntry.quantity)` differs from `StockBalance.onHandQuantity`. A rebuild must be an explicit offline maintenance transaction: validate/stop writers, recreate on-hand rows from grouped ledger sums, preserve valid reservation values, reconcile, then resume traffic. Normal requests never rebuild balances.
- Adjustment audits capture actor, warehouse, product/unit, direction, reason, quantity, before/after balance, and movement number. Transfer audits capture both warehouses and both before/after balances. The stock ledger remains the operational detail; `AuditLog` records who performed the business action.
- Sales Order confirmation remains outside inventory posting. Delivery loading is now the physical issue boundary and current on-hand quantity is still not available-to-promise because confirmed orders are not reserved.
- Phase #9 adds `WarehouseType` only to distinguish operational storage from vehicle stock. Each `Vehicle` owns one `VEHICLE` warehouse; all balances and movements still use the same inventory ledger and projection.

## Delivery lifecycle

- AquaOps preserves the Phase #3 `DeliveryTrip → DeliveryStop → Delivery → DeliveryItem` architecture. `Delivery` is the Sales Order assignment within an ordered stop; no duplicate trip-order table is added.
- `DeliveryTrip` keeps driver and registration snapshots while also referencing the active `User` and `Vehicle`. Vehicle identity and stock live in the lightweight `Vehicle` record and its unique vehicle warehouse.
- Trip numbers use an atomic monthly `DocumentSequence` key and `DL-YYYYMM-00001` format. Delivery numbers derive from the trip number and stop sequence.
- Only `CONFIRMED` and returned `READY` orders are assignable. A partial unique index prevents one Sales Order from appearing in conflicting active deliveries. Every assignment uses the immutable Sales Order shipping-address snapshot.
- Loading runs in one serializable transaction: authoritative stock validation, one multi-product `TRANSFER`, balance trigger updates, trip/delivery/order status changes, Sales Order histories, and audit. The movement idempotency key prevents duplicate postings.
- Successful delivery posts an idempotent `SALE` from the vehicle warehouse, records POD metadata, delivered quantities, order `DELIVERED`, status history, and audit in one transaction. It never creates an Invoice and never moves the order to `COMPLETED`.
- Failed delivery records a reason but no stock issue. Explicit return posts `RETURN` as a balanced vehicle-to-source transfer and makes the order `READY` for re-delivery. Trip completion requires terminal results and returned stock for every failed result.

## Invoice, billing, payment, and AR lifecycle

- Invoice numbers use the atomic monthly `DocumentSequence` key and `INV-YYYYMM-00001` format. Billing Notes use `BL-YYYYMM-00001`; Payments use `PAY-YYYYMM-00001`. `MAX + 1` is prohibited.
- Phase 10 creates one complete Invoice from a `DELIVERED` Sales Order. A partial unique index rejects a second non-void invoice for that order; the underlying one-to-many relation remains available for a future explicit partial-invoicing design.
- Invoice headers snapshot customer code/name, tax identity, billing address, and Sales Order credit terms. Invoice items snapshot product name, SKU, unit, quantity, price, discount, tax, and totals. Issue makes these financial fields database-immutable.
- Due date is invoice date plus the Sales Order credit-term snapshot. CASH uses zero days. Dates are business dates; timestamps remain audit/event time.
- Billing Notes contain eligible outstanding Invoices for exactly one customer. Their total is the sum of outstanding amounts captured when the draft is created. Active assignment is serialized by locking Invoice rows before eligibility is re-read.
- **PaymentAllocation is the authoritative relationship between Payments and Invoices.** A completed Payment may cover multiple Invoices, an Invoice may have multiple Payments, and an amount may remain unapplied. Allocation inserts lock their Payment and Invoice and database triggers reject customer/currency mismatch or over-allocation.
- Posted allocations are immutable. Voiding a Payment retains its allocations for audit but excludes them from every outstanding calculation; affected Invoice and Billing Note statuses are recalculated atomically.
- **Accounts Receivable is derived from Invoice amounts minus valid Payment Allocations.** No mutable AR balance table exists. Only `COMPLETED`, non-void Payment allocations reduce AR.
- Aging compares due date with an explicit `asOfDate` under Bangkok business-date semantics. Buckets are Current, 1–30, 31–60, 61–90, and 90+; only outstanding amounts are included.
- Financial mutations use Serializable interactive transactions. Payments lock Invoice rows in deterministic ID order; the allocation trigger locks the Payment and Invoice again at write time. Duplicate submission is contained by unique document/source constraints and lifecycle checks.
- Issued documents are never hard-deleted. Invoice/Billing Note cancellation and Payment void require a reason, preserve history, and append `AuditLog` events. Invoices with active allocations cannot be voided; Billing Notes with completed allocations cannot be cancelled.
- RBAC uses `invoice.view/create/issue/cancel`, `billing.view/manage`, `payment.view/create/allocate/cancel`, and `ar.view`. Every Server Action repeats authorization and Zod validation.

## Migrations

Use Node.js 20.19+ (Node.js 22 LTS recommended).

```bash
npm run db:validate
npm run db:generate
npm run db:migrate -- --name <change_name>
npm run db:deploy
npm run db:seed
```

The baseline migration creates Phase 1 tables and database guards. `20260928010000_authentication_rbac` adds `UserStatus` and the indexed user status column without dropping or resetting data. `20260929000000_customer_management` adds billing-cycle fields and the concurrency-safe customer-code sequence. `20260930000000_product_pricing_management` adds exact base-unit cost/default selling prices and non-negative constraints without resetting data. `20260930010000_sales_order_management` adds order snapshots, status history, and document counters. `20260930020000_inventory_management` makes movement headers immutable, adds the movement-time index, and replaces balance application with a concurrency-safe conditional reduction. `20260930030000_delivery_management` adds vehicle warehouses, trip driver/vehicle references, delivery result/return metadata, inventory idempotency keys, and the active-order assignment guard. `20261001000000_accounting_phase_10` adds accounting documents, allocations, integrity triggers, and financial indexes. `20261001010000_reporting_phase_11_indexes` adds targeted status/business-date indexes for delivery results, invoices, and payments. If an existing database contains unmanaged tables, back it up and reconcile it with `prisma migrate diff` before applying migrations; do not mark a migration as applied unless every object and constraint already exists.
