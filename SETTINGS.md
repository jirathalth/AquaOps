# AquaOps System Settings

## Scope and boundaries

`/settings` contains administrator-managed business defaults and reusable company information. `DATABASE_URL`, Better Auth secrets/URLs, bootstrap credentials, deployment flags, and other infrastructure/security values remain environment variables and are never returned by the Settings UI.

Customers, products, categories, units, price lists, warehouses, vehicles, users, and roles remain master data. Settings only stores optional foreign-key references to an active Price List or storage Warehouse.

## Categories and defaults

- General: business/legal name, tax identity, Thai address fields, contact details, website, and optional logo URL reference. File upload/storage is deferred.
- Sales: active default Price List fallback, default credit days for newly created Customers, Decimal VAT default for new Sales Order lines, and a global manual-price toggle. Manual override requires both the toggle and `sales_order.override_price`.
- Documents: configurable `SO`, `DL`, `STK`, `INV`, `BL`, and `PAY` display prefixes; tax/address visibility; footer; and payment instructions.
- Inventory & Delivery: active storage-Warehouse defaults. Negative stock remains prohibited and vehicle warehouses remain bound to their Vehicles.
- Finance: default enum-backed Payment Method and billing instructions. Historical Payments retain their method.
- Localization: `th-TH`, `THB`, and `Asia/Bangkok` are fixed because multi-currency and multi-timezone accounting are not supported.
- System: application/version/environment and coarse application/database health only. No credentials or connection details are exposed.

AR aging buckets, statuses, permission identifiers, inventory movement types, payment methods, Thai business timezone, and supported currency remain application constants rather than arbitrary runtime settings.

## Pricing precedence

New price resolution uses:

1. active Customer Product Override;
2. active Customer Default Price List;
3. active configured Default Price List;
4. Product Unit retail/wholesale default.

The configured list is only a fallback. Persisted order-line price, source, tax, and total snapshots are not recalculated after a setting changes.

## Document numbering

`DocumentSequence` counters use immutable document-type/month keys such as `SALES_ORDER-202610`; prefixes are presentation configuration. Changing `SO` to `ORD` therefore produces the next value in the same counter, for example `ORD-202610-00002`, and never resets numbering. Existing numbers remain unchanged. Prefixes accept 2–8 uppercase letters/digits, must be unique among current document types, and cannot reuse a prefix found in another document type's history. Sequence counters are not editable.

## Mutation, RBAC, and audit

Viewing requires `settings.view`; every Server Action update repeats `settings.manage`, Zod validation, authoritative reference checks, a serializable service/repository transaction, optimistic `version` matching, and an `AuditLog` write. Audit records use `BusinessSetting/default:<group>` and store the changed group's old/new values without secrets.

Every setting affects future defaults only. Existing Customers, Sales Orders, inventory movements, delivery trips, Invoices, Billing Notes, Payments, and AR derivations remain unchanged.
