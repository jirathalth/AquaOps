# Printable business documents

AquaOps prints Invoice, Billing Note, and Receipt documents through dedicated authenticated server-rendered routes. The pages reuse accounting services and persisted transaction values; only the print/back controls are client-side. Browser print and Save as PDF are the output mechanisms, so no PDF library is required.

## Routes and format

- `/accounting/invoices/[id]/print`
- `/accounting/billing/[id]/print`
- `/accounting/payments/[id]/receipt`

All routes enforce the same `*.view` permission as their source detail page. Receipts return not found unless the Payment status is `COMPLETED`.

The shared document component targets A5 landscape with `@page { size: A5 landscape; margin: 6mm; }`. Print controls are hidden, table headers repeat where supported, rows and final summary/signature sections avoid splitting, and long tables flow to additional pages. IBM Plex Sans Thai is inherited from the root Next.js font configuration.

## Data and historical accuracy

Invoice identity, address, product, unit, price, tax, and total fields come from persisted Invoice/InvoiceItem snapshots. Billing uses persisted BillingNoteInvoice amounts and invoice snapshots. Receipts use completed Payment amounts and related invoice snapshots. Current product prices and current VAT settings are never used to reconstruct old documents, and printing does not consume document numbers.

Business identity and logo come from current System Settings because the current schema does not snapshot issuer details per transaction. Payments also do not own a customer snapshot; allocated receipts fall back to their invoice snapshots, while an unallocated receipt can only show the current customer code/name. These are known historical-data limitations that should be addressed before legal-name/address history or fully unallocated receipts must be immutable.

## Adding another document

Build a server page guarded by `requireRouteAccess`, load data through its domain service, map it to `PrintableDocument`, and add only document-specific columns, totals, metadata, and signature labels. Keep financial calculations in domain services/core helpers and persist any historical value that must not change later.
