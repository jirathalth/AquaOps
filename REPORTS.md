# AquaOps Reporting Definitions

รายงานเป็น read model จากฐานธุรกรรมหลัก ไม่มี analytics database, mutable summary table หรือ long-lived cache ช่วงวันที่ทั้งหมดใช้วันที่ธุรกิจ `Asia/Bangkok`; คอลัมน์ `@db.Date` เทียบแบบวันที่ และ timestamp ใช้ขอบเขตครึ่งเปิด `[00:00, วันถัดไป 00:00)` เพื่อไม่เลื่อนวันจาก UTC

## Dashboard

| Metric | Source | Business date | Included / excluded | Calculation |
| --- | --- | --- | --- | --- |
| คำสั่งซื้อในช่วง | `SalesOrder` | `orderDate` | รวม CONFIRMED, PREPARING, READY, DELIVERING, DELIVERED, COMPLETED; ไม่รวม DRAFT, legacy PENDING, CANCELLED | `COUNT(*)` |
| ยอดขายตามคำสั่งซื้อ | `SalesOrder` | `orderDate` | สถานะเดียวกับด้านบน | `SUM(totalAmount)` |
| ยอดขายเงินสด / เครดิต | `SalesOrder.saleType` snapshot | `orderDate` | สถานะยอดขายที่ใช้ได้ | `SUM(totalAmount)` แยก CASH/CREDIT; ไม่ใช่ยอดรับเงิน |
| ค้าปลีก / ค้าส่ง | `SalesOrder` + `Customer.type` | `orderDate` | สถานะยอดขายที่ใช้ได้ | `SUM(totalAmount)` แยกประเภทลูกค้าปัจจุบัน |
| สถานะคำสั่งซื้อ | `SalesOrder.status` | `orderDate` | ทุกสถานะ รวม DRAFT/CANCELLED เพื่อการติดตามงาน; ไม่รวมใน KPI ยอดขาย | `COUNT(*)` แยกสถานะ |
| ลูกหนี้คงค้าง | `Invoice` − valid `PaymentAllocation` | `asOfDate` | ใบแจ้งหนี้ที่ออกแล้วก่อน/ในวัน as-of; ไม่รวม DRAFT/VOID; allocation ใช้เฉพาะ Payment COMPLETED ที่ `paymentDate <= asOfDate` | Phase #10 `getAccountsReceivable` |
| ลูกหนี้เกินกำหนด | AR service | `asOfDate` | bucket 1–30, 31–60, 61–90, 90+ | ผลรวม bucket เกินกำหนด |
| รอจัดส่ง | `SalesOrder` / active `Delivery` | สถานะปัจจุบัน | CONFIRMED/READY ที่ไม่มี delivery active | count |
| รอบวางแผน / กำลังจัดส่ง | `DeliveryTrip` | `plannedDate` / สถานะปัจจุบัน | PLANNED/LOADING วันนี้ และ IN_TRANSIT | count |
| ส่งสำเร็จวันนี้ | `Delivery` | `deliveredAt` | DELIVERED | count ตาม Bangkok timestamp |
| สต็อกต่ำ / หมด | `StockBalance` + `Product.reorderLevel` | current state | สินค้าที่ติดตามสต็อกและไม่ถูกลบ | เทียบ on-hand กับ reorder level |
| ลูกค้าอันดับสูง | `SalesOrder` snapshot | `orderDate` | สถานะยอดขายที่ใช้ได้ | `SUM(totalAmount)` |
| สินค้าอันดับสูง | `SalesOrderItem` snapshot | SalesOrder `orderDate` | สถานะยอดขายที่ใช้ได้ | `SUM(lineTotal)` |

ข้อจำกัด: Sales Order ปัจจุบันไม่มี `customerTypeSnapshot` ดังนั้นกราฟ/รายงานค้าปลีกเทียบค้าส่งใช้ `Customer.type` ปัจจุบัน การเปลี่ยนประเภทลูกค้าอาจเปลี่ยนผลย้อนหลัง ชื่อ/รหัสลูกค้าและสินค้าใช้ transactional snapshots ที่มีอยู่

## Reports

| Route | Source and date | Definition |
| --- | --- | --- |
| `/reports/sales` | SalesOrder / `orderDate` | รายละเอียดและ summary จากสถานะยอดขายที่ใช้ได้; Decimal aggregate ฝั่งฐานข้อมูล |
| `/reports/products` | SalesOrderItem + SalesOrder / `orderDate` | จัดกลุ่มด้วย product/unit snapshots; จำนวนไม่รวมข้ามหน่วย; ranking ใช้มูลค่า `lineTotal` |
| `/reports/customers` | SalesOrder / `orderDate` | จำนวนคำสั่งซื้อ มูลค่า และค่าเฉลี่ยต่อคำสั่งซื้อจาก snapshot ลูกค้า |
| `/reports/delivery` | Delivery / `deliveredAt` หรือ DeliveryStop `completedAt` สำหรับผลล้มเหลว | แสดงเฉพาะผล DELIVERED/FAILED ในช่วงเวลา ไม่ใช่ route optimization |
| `/reports/inventory/stock` | StockBalance | current-state report แยกสินค้า/คลัง ไม่ย้อนสร้างจาก movement |
| `/reports/inventory/movements` | InventoryLedgerEntry + InventoryMovement / `occurredAt` | immutable ledger detail; จำนวน signed ตามคลัง |
| `/reports/invoices` | Invoice / `invoiceDate` และ optional `dueDate` | paid/outstanding จาก completed PaymentAllocation; สถานะ overdue derive ณ วันที่ปัจจุบัน |
| `/reports/payments` | Payment / `paymentDate` | ตารางแสดงทุกรายการตามตัวกรอง; summary เงินรับใช้เฉพาะ COMPLETED; ไม่เรียกเป็นยอดขาย |
| `/reports/ar-aging` | Phase #10 AR service / `asOfDate` | Current, 1–30, 31–60, 61–90, 90+ พร้อม drill-down invoice |

ทุกหน้าบังคับ `report.view` และ permission ของข้อมูลต้นทาง (`sales_order.view`, `delivery.view`, `inventory.view`, `invoice.view`, `payment.view`, หรือ `ar.view`) ฝั่งเซิร์ฟเวอร์ CSV ใช้ permission เดียวกัน ส่งออกผลกรองทั้งหมดสูงสุด 10,000 แถว พร้อม UTF-8 BOM, CSV quoting และ formula-injection escaping
