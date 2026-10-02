# AquaOps

ระบบบริหารจัดการภายในสำหรับธุรกิจผลิตและจัดจำหน่ายน้ำดื่ม ปัจจุบันมี technical foundation, UI shell, Phase 1 database architecture, Authentication/RBAC, Customer Management, Product/Pricing Management, Sales Order Management, Inventory Management, Delivery Management, Invoice/Billing/Payment/Accounts Receivable และ Dashboard/Reports จากข้อมูลจริงแล้ว

## Requirements

- Node.js 20.19+ (Node.js 22 LTS recommended)
- npm 10+
- Access to the shared PostgreSQL 16+ service (no local PostgreSQL is required after cloud cutover)

## Installation

```bash
nvm use
npm install
cp .env.example .env
```

ตั้งค่า `.env`:

- `DATABASE_URL`: PostgreSQL connection string
- `AQUAOPS_DATABASE_PURPOSE`: `shared` for all normal local and production runtime
- `BETTER_AUTH_SECRET`: secret แบบสุ่มอย่างน้อย 32 ตัวอักษร (`openssl rand -base64 32`)
- `BETTER_AUTH_URL`: URL ของแอป เช่น `http://localhost:3000`
- `AQUAOPS_AUTH_BYPASS`: ใช้ได้เฉพาะ isolated test database ที่ผ่าน guard; ต้องเป็น `false` สำหรับ shared runtime
- `AQUAOPS_BOOTSTRAP_EMAIL` / `AQUAOPS_BOOTSTRAP_PASSWORD`: ใส่เฉพาะตอน seed บัญชี OWNER ครั้งแรก (รหัสผ่านอย่างน้อย 12 ตัวอักษร)
- `TEST_DATABASE_URL` / `TEST_DATABASE_ADMIN_URL`: ใช้เฉพาะ isolated automated tests และห้ามชี้ไป shared runtime
- `MIGRATION_DATABASE_URL`: credential สำหรับ DDL/migration โดยเฉพาะ

## Database

สำหรับ shared runtime ที่สร้าง schema แล้ว ให้รัน bootstrap แบบ explicit เมื่อจำเป็น:

```bash
npm run db:validate
npm run db:generate
npm run db:bootstrap
```

Bootstrap ทำงานแบบ idempotent สำหรับ permissions, system roles และเฉพาะ role-permission mapping ที่เปลี่ยน โดยรักษา custom roles และ user assignments ไว้ Demo data ใช้ `npm run db:seed:demo` ได้เฉพาะ isolated test database

Prisma schema ครอบคลุมฐานข้อมูล Phase 1, Better Auth, RBAC และ audit history แล้ว ดูรายละเอียดและ transaction rules ที่ [DATABASE.md](./DATABASE.md)

ระหว่างพัฒนา schema ให้สร้าง migration ด้วย:

```bash
AQUAOPS_DATABASE_PURPOSE=migration npm run db:migrate:dev -- --name <change_name>
```

## Development

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) หน้าแดชบอร์ดและรายงานอ่านข้อมูลธุรกรรมจริงตามสิทธิ์ของผู้ใช้ ช่วงเวลาเริ่มต้นคือเดือนปัจจุบันตามวันที่ธุรกิจ Asia/Bangkok

ทุกหน้าภายในต้องเข้าสู่ระบบ หน้า `/admin/users` และ `/admin/roles` ใช้จัดการผู้ใช้ บทบาท และสิทธิ์ตาม permission ของผู้ปฏิบัติงาน บัญชี inactive จะเข้าสู่ระบบหรือใช้ session เดิมต่อไม่ได้

Customer Management อยู่ที่ `/customers` รองรับการค้นหา/กรอง/เรียง/แบ่งหน้าแบบ server-side, เพิ่ม แก้ไข ดูรายละเอียด ที่อยู่หลายรายการ เงื่อนไขเครดิต ราคาขาย รอบวางบิล และเปิด/ปิดใช้งานตาม RBAC

Product Management อยู่ที่ `/inventory/products` และ Price List Management อยู่ที่ `/price-lists` รองรับข้อมูลสินค้า หมวดหมู่ หน่วย ราคามาตรฐาน รายการราคา ราคาพิเศษลูกค้า และ pricing preview ตามลำดับ `Customer Override → Customer Price List → Product Default`

Sales Order Management อยู่ที่ `/sales/orders` รองรับรายการแบบ server-side, สร้าง/แก้ไขฉบับร่าง, customer-type/pricing snapshot, ส่วนลด/ภาษีแบบ Decimal-safe, ยืนยันและยกเลิกตาม RBAC พร้อม status history และ audit log การยืนยันคำสั่งซื้อใน Phase #7 **ไม่จองหรือตัดสต็อก**

Inventory Management อยู่ที่ `/inventory/stock`, `/inventory/movements` และ `/inventory/warehouses` รองรับยอดคงเหลือ ประวัติแบบ immutable การปรับปรุง และการโอนย้ายระหว่างคลังแบบ atomic ตามสิทธิ์ `inventory.view`, `inventory.adjust`, `inventory.transfer` และ `inventory.manage_warehouse` จำนวนสต็อกใช้ Decimal และหน่วยหลักของสินค้า

Delivery Management อยู่ที่ `/delivery`, `/delivery/trips` และ `/delivery/vehicles` รองรับการวางแผนรอบ เพิ่ม/นำคำสั่งซื้อออก จัดลำดับ ขึ้นสินค้า ออกรถ บันทึกผล คืนสินค้าที่จัดส่งไม่สำเร็จ และจบรอบตามสิทธิ์ `delivery.view` / `delivery.manage` ที่อยู่จัดส่งใช้ snapshot จาก Sales Order เสมอ การขึ้นสินค้าโอน `คลังต้นทาง → คลังรถ`, การจัดส่งสำเร็จตัด `SALE` จากคลังรถ และรายการที่ไม่สำเร็จต้องคืน `คลังรถ → คลังต้นทาง` ก่อนจบรอบ

งานบัญชีลูกหนี้อยู่ที่ `/accounting/invoices`, `/accounting/billing`, `/accounting/payments` และ `/accounting/ar` รองรับใบแจ้งหนี้จากคำสั่งซื้อที่ส่งสำเร็จ, snapshot ข้อมูลในวันที่ออกเอกสาร, ใบวางบิลหลายใบแจ้งหนี้, การรับชำระบางส่วน/หลายใบแจ้งหนี้, เงินรับล่วงหน้าที่ยังไม่จัดสรร, การยกเลิกแบบเก็บประวัติ และอายุลูกหนี้ตาม `asOfDate` ทั้งหมดใช้ Decimal และ transaction แบบ Serializable

Dashboard อยู่ที่ `/dashboard` และรายงานอยู่ใต้ `/reports` ครอบคลุมยอดขาย สินค้า ลูกค้า การจัดส่ง สต็อก การเคลื่อนไหว ใบแจ้งหนี้ การรับชำระ และอายุลูกหนี้ ตัวกรองเก็บใน URL ตารางแบ่งหน้า/เรียงบนเซิร์ฟเวอร์ และ CSV ส่งออกข้อมูลที่ตรงกับตัวกรองได้สูงสุด 10,000 แถว ดูนิยามตัวชี้วัดที่ [REPORTS.md](./REPORTS.md)

System Settings อยู่ที่ `/settings` แบ่งเป็นข้อมูลกิจการ การขาย เอกสาร คลังและจัดส่ง การเงิน ภาษา/รูปแบบ และสถานะระบบ ใช้ `settings.view` / `settings.manage`, optimistic concurrency และ AuditLog การเปลี่ยนค่าใช้กับรายการใหม่เท่านั้น ดูขอบเขตและลำดับ fallback ที่ [SETTINGS.md](./SETTINGS.md)

**PaymentAllocation is the authoritative relationship between Payments and Invoices.**

**Accounts Receivable is derived from Invoice amounts minus valid Payment Allocations.**

**InventoryTransaction is the authoritative stock movement history.** ใน schema ปัจจุบันแนวคิดนี้ประกอบด้วย `InventoryMovement` (หัวรายการ) และ signed `InventoryLedgerEntry` (รายการที่มีผลต่อสต็อก) ส่วน **InventoryBalance is a derived operational projection and must remain consistent with the ledger.** โดย model ที่ใช้ชื่อ `StockBalance` และอัปเดตด้วย database trigger ใน transaction เดียวกับ ledger เท่านั้น

ระบบไม่อนุญาตให้สต็อกพร้อมใช้ติดลบ รายการที่ลงบัญชีแล้วแก้ไข/ลบไม่ได้ และต้องแก้ด้วย compensating movement การยืนยัน Sales Order ยังไม่จองหรือตัดสต็อก จุดตัดสินค้าครั้งแรกคือการขึ้นสินค้าของรอบจัดส่ง ดังนั้น Current Quantity ยังไม่ใช่ Available-to-Promise

ในโหมดพัฒนา เปิด `/dev/ui` เพื่อตรวจสอบ typography, forms, statuses, tables และ interaction patterns ของ design system หน้านี้คืนค่า 404 ใน production

## Quality and tests

```bash
npm run lint
npm run typecheck
npm run test
npm run test:inventory-db
npm run test:delivery-db
npm run test:accounting-db
npm run test:phase12-db
npm run test:settings-db
npm run test:e2e
npm run test:e2e:auth
npm run test:e2e:delivery
npm run test:e2e:accounting
npm run test:e2e:phase12
npm run test:e2e:settings
```

E2E ที่ต้องเข้าสู่ระบบใช้ฐานข้อมูลทดสอบที่ seed แล้ว และอ่าน credentials จาก `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, `E2E_RESTRICTED_EMAIL`, `E2E_RESTRICTED_PASSWORD`; ชุดทดสอบดังกล่าวจะ skip พร้อมเหตุผลเมื่อไม่ได้กำหนดค่า

DB/E2E suites ต้องรันด้วย `AQUAOPS_DATABASE_PURPOSE=test` และใช้ `TEST_DATABASE_URL` + `TEST_DATABASE_ADMIN_URL`; runner ไม่ derive สิทธิ์ admin จาก `DATABASE_URL` และจะ abort ก่อนทดสอบหาก target ตรงกับ shared runtime ดู workflow ที่ [DATABASE_OPERATIONS.md](./DATABASE_OPERATIONS.md)

`npm run test:delivery-db` สร้างฐานข้อมูลชั่วคราว ทดสอบ migration/seed แบบ idempotent และตรวจ workflow ขึ้นสินค้า ออกรถ จัดส่งสำเร็จ จัดส่งไม่สำเร็จ คืนสินค้า และการป้องกัน movement ซ้ำ

`npm run test:accounting-db` สร้างฐานข้อมูลชั่วคราว ทดสอบ migration/seed แบบ idempotent, reconciliation, partial payment, payment reversal, over-allocation และ concurrency ของ Payment/Billing Note

`npm run test:phase12-db` deploy migration ทั้งหมดและ seed สองครั้งบนฐานข้อมูลชั่วคราว แล้วทดสอบ golden path เดียวตั้งแต่ pricing → Sales Order → Delivery → Inventory → Invoice → Billing → Payment → AR → Dashboard/Reports รวม snapshot และ idempotency

`npm run test:settings-db` deploy migration และ seed แบบ idempotent บนฐานข้อมูลชั่วคราว แล้วตรวจ persistence, optimistic concurrency, audit old/new, historical safety และ prefix/counter concurrency

`npm run test:e2e:auth` ตรวจ login, logout, unauthenticated access และ RBAC ด้วย Better Auth จริงบนฐานข้อมูลชั่วคราว ส่วน `npm run test:e2e:phase12` ตรวจ cash sale, wholesale credit จนชำระครบ, failed-delivery return, Sales Order, Delivery และ Accounting ใน Chromium

`npm run test:e2e:delivery` สร้างฐานข้อมูลชั่วคราวและตรวจ workflow จัดส่งหลักใน Chromium ทั้งเดสก์ท็อปและมือถือ โดยไม่เปลี่ยนข้อมูลฐานพัฒนาหลัก

`npm run test:e2e:accounting` สร้างฐานข้อมูลชั่วคราวและตรวจการรับชำระ การจัดสรร การยกเลิก และหน้าลูกหนี้ใน Chromium โดยไม่เปลี่ยนข้อมูลฐานพัฒนาหลัก

`npm run test:e2e:settings` ตรวจการแก้ไขแต่ละหมวด การยืนยันคำนำหน้า persistence, RBAC และ responsive containment ใน Chromium บนฐานข้อมูลชั่วคราว

ติดตั้ง Playwright browser ครั้งแรกด้วย `npx playwright install chromium` หากเครื่องยังไม่มี browser binary

## Production build

```bash
npm run build
npm start
```

Production ต้องกำหนด `DATABASE_URL`, `AQUAOPS_DATABASE_PURPOSE=shared`, `BETTER_AUTH_SECRET` อย่างน้อย 32 ตัวอักษร และ absolute `BETTER_AUTH_URL`; แอปจะหยุดพร้อมข้อความที่ไม่เปิดเผย credential หากค่าหลักไม่ครบหรือเปิด auth bypass

ก่อน deploy ให้ทำตาม [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) ดูแนวทางโครงสร้างที่ [ARCHITECTURE.md](./ARCHITECTURE.md) และลำดับงานที่ [ROADMAP.md](./ROADMAP.md)
