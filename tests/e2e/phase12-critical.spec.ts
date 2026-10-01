import { expect, test } from "@playwright/test";

test.describe("Phase 12 critical sales paths", () => {
  test.skip(process.env.AQUAOPS_AUTH_BYPASS !== "true", "Run with the isolated Phase 12 database");

  test("moves one order through delivery, billing, partial payment, and paid AR", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/sales/orders/new");
    await page.getByRole("combobox", { name: /^ลูกค้า/ }).click();
    await page.getByRole("option", { name: /CUS-000002/ }).click();
    await expect(page.getByRole("combobox", { name: "ประเภทการชำระเงิน" })).toContainText("เครดิต");
    await page.getByRole("combobox", { name: "เพิ่มสินค้า" }).click();
    await page.getByRole("option", { name: /WATER-600-PACK/ }).click();
    await expect(page.getByLabel("ราคาต่อหน่วย")).toHaveValue("42.5000");
    await page.getByLabel("จำนวน").fill("2.000");
    await page.getByLabel("จำนวน").blur();
    await page.getByRole("button", { name: "บันทึกฉบับร่าง" }).click();
    await expect(page).toHaveURL(/\/sales\/orders\/[0-9a-f-]+$/);
    const orderNo = (await page.getByRole("main").getByText(/^SO-\d{6}-\d{5}$/).first().textContent())!;
    await page.getByRole("button", { name: "ยืนยันคำสั่งซื้อ" }).first().click();
    await page.getByRole("dialog").getByRole("button", { name: "ยืนยันคำสั่งซื้อ" }).click();
    await expect(page.getByText("ยืนยันแล้ว", { exact: true }).first()).toBeVisible();

    await page.goto("/delivery/trips/new");
    await page.getByLabel("วันที่จัดส่ง").fill("2026-10-01");
    await page.getByRole("combobox", { name: /^รถจัดส่ง/ }).click();
    await page.getByRole("option", { name: /1กข 1234/ }).click();
    await page.getByRole("combobox", { name: /^พนักงานขับรถ/ }).click();
    await page.getByRole("option", { name: /ฝ่ายจัดส่ง/ }).click();
    await page.getByLabel(`เลือก ${orderNo}`).click();
    await page.getByLabel("วันที่จัดส่ง").fill("2026-10-01");
    await expect(page.getByLabel("วันที่จัดส่ง")).toHaveValue("2026-10-01");
    await page.getByRole("button", { name: "สร้างรอบจัดส่ง" }).click();
    try { await page.waitForURL(/\/delivery\/trips\/[0-9a-f-]+$/, { timeout: 5_000 }); } catch { throw new Error(`Delivery trip creation failed: ${(await page.getByRole("alert").allTextContents()).join(" | ") || "no validation message"}`); }
    await page.getByRole("button", { name: "เตรียม/ขึ้นสินค้า" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "ขึ้นสินค้า" }).click();
    await page.getByRole("button", { name: "ออกรถจัดส่ง" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "ออกรถจัดส่ง" }).click();
    await page.getByRole("button", { name: "บันทึกผล" }).click();
    await page.getByLabel("ผู้รับสินค้า").fill("Phase 12 E2E");
    await page.getByRole("dialog").getByRole("button", { name: "ยืนยันผลการจัดส่ง" }).click();
    await expect(page.getByText("จัดส่งสำเร็จ", { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "จบรอบจัดส่ง" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "จบรอบจัดส่ง" }).click();
    await expect(page.getByText("เสร็จสิ้น", { exact: true }).first()).toBeVisible();

    await page.goto("/accounting/invoices/new");
    await page.getByRole("combobox", { name: "คำสั่งซื้อที่จัดส่งแล้ว" }).click();
    await page.getByRole("option", { name: new RegExp(orderNo) }).click();
    await page.getByRole("button", { name: "บันทึกฉบับร่าง" }).click();
    await expect(page).toHaveURL(/\/accounting\/invoices\/[0-9a-f-]+$/);
    const invoiceUrl = page.url();
    const invoiceNo = (await page.getByRole("main").getByText(/^INV-\d{6}-\d{5}$/).first().textContent())!;
    await page.getByRole("button", { name: "ออกใบแจ้งหนี้" }).click();
    await expect(page.getByText("ยืนยันแล้ว", { exact: true }).first()).toBeVisible();

    await page.goto("/accounting/billing/new");
    await page.getByRole("combobox", { name: "ลูกค้า" }).click();
    await page.getByRole("option", { name: /CUS-000002/ }).click();
    await page.getByLabel(`เลือก ${invoiceNo}`).click();
    await page.getByRole("button", { name: "บันทึกฉบับร่าง" }).click();
    await expect(page).toHaveURL(/\/accounting\/billing\/[0-9a-f-]+$/);
    const billingUrl = page.url();
    await page.getByRole("button", { name: "ออกใบวางบิล" }).click();
    await expect(page.getByText("ยืนยันแล้ว", { exact: true }).first()).toBeVisible();

    await page.getByRole("main").getByRole("link", { name: "รับชำระเงิน" }).click();
    await page.getByLabel("ยอดรับชำระ").fill("10.00");
    await page.getByRole("button", { name: "จัดสรรตามลำดับใบแจ้งหนี้" }).click();
    await page.getByRole("button", { name: "บันทึกการรับชำระ" }).click();
    await expect(page.getByRole("button", { name: "ยกเลิกรายการรับชำระ" })).toBeVisible();
    await page.goto(billingUrl);
    await expect(page.getByText("ชำระบางส่วน", { exact: true }).first()).toBeVisible();

    await page.getByRole("main").getByRole("link", { name: "รับชำระเงิน" }).click();
    await page.getByLabel("ยอดรับชำระ").fill("80.95");
    await page.getByRole("button", { name: "จัดสรรตามลำดับใบแจ้งหนี้" }).click();
    await page.getByRole("button", { name: "บันทึกการรับชำระ" }).click();
    await expect(page.getByRole("button", { name: "ยกเลิกรายการรับชำระ" })).toBeVisible();
    await page.goto(billingUrl);
    await expect(page.getByText("ชำระแล้ว", { exact: true }).first()).toBeVisible();
    await page.goto(invoiceUrl);
    await expect(page.getByText("ชำระแล้ว", { exact: true }).first()).toBeVisible();
    await page.goto("/accounting/ar?asOfDate=2026-10-01");
    await expect(page.getByText(invoiceNo, { exact: true })).toHaveCount(0);
  });

  test("completes a retail cash sale through paid invoice", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/sales/orders/new");
    await page.getByRole("combobox", { name: /^ลูกค้า/ }).click();
    await page.getByRole("option", { name: /CUS-000001/ }).click();
    await expect(page.getByRole("combobox", { name: "ประเภทการชำระเงิน" })).toContainText("เงินสด");
    await page.getByRole("combobox", { name: "เพิ่มสินค้า" }).click();
    await page.getByRole("option", { name: /WATER-600-PACK/ }).click();
    await expect(page.getByLabel("ราคาต่อหน่วย")).toHaveValue("55.0000");
    await page.getByLabel("จำนวน").fill("1.000");
    await page.getByLabel("จำนวน").blur();
    await page.getByRole("button", { name: "บันทึกฉบับร่าง" }).click();
    const orderNo = (await page.getByRole("main").getByText(/^SO-\d{6}-\d{5}$/).first().textContent())!;
    await page.getByRole("button", { name: "ยืนยันคำสั่งซื้อ" }).first().click();
    await page.getByRole("dialog").getByRole("button", { name: "ยืนยันคำสั่งซื้อ" }).click();
    await expect(page.getByText("ยืนยันแล้ว", { exact: true }).first()).toBeVisible();

    await page.goto("/delivery/trips/new");
    await page.getByRole("combobox", { name: /^รถจัดส่ง/ }).click();
    await page.getByRole("option", { name: /1กข 1234/ }).click();
    await page.getByRole("combobox", { name: /^พนักงานขับรถ/ }).click();
    await page.getByRole("option", { name: /ฝ่ายจัดส่ง/ }).click();
    await page.getByLabel(`เลือก ${orderNo}`).click();
    await page.getByLabel("วันที่จัดส่ง").fill("2026-10-01");
    await page.getByRole("button", { name: "สร้างรอบจัดส่ง" }).click();
    await expect(page).toHaveURL(/\/delivery\/trips\/[0-9a-f-]+$/);
    await page.getByRole("button", { name: "เตรียม/ขึ้นสินค้า" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "ขึ้นสินค้า" }).click();
    await page.getByRole("button", { name: "ออกรถจัดส่ง" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "ออกรถจัดส่ง" }).click();
    await page.getByRole("button", { name: "บันทึกผล" }).click();
    await page.getByLabel("ผู้รับสินค้า").fill("Phase 12 Cash E2E");
    await page.getByRole("dialog").getByRole("button", { name: "ยืนยันผลการจัดส่ง" }).click();
    await page.getByRole("button", { name: "จบรอบจัดส่ง" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "จบรอบจัดส่ง" }).click();
    await expect(page.getByText("เสร็จสิ้น", { exact: true }).first()).toBeVisible();

    await page.goto("/accounting/invoices/new");
    await page.getByRole("combobox", { name: "คำสั่งซื้อที่จัดส่งแล้ว" }).click();
    await page.getByRole("option", { name: new RegExp(orderNo) }).click();
    await page.getByRole("button", { name: "บันทึกฉบับร่าง" }).click();
    await expect(page).toHaveURL(/\/accounting\/invoices\/[0-9a-f-]+$/);
    const invoiceUrl = page.url();
    const invoiceNo = (await page.getByRole("main").getByText(/^INV-\d{6}-\d{5}$/).first().textContent())!;
    await page.getByRole("button", { name: "ออกใบแจ้งหนี้" }).click();
    await expect(page.getByText("ยืนยันแล้ว", { exact: true }).first()).toBeVisible();

    await page.goto("/accounting/payments/new");
    await page.getByRole("combobox", { name: "ลูกค้า" }).click();
    await page.getByRole("option", { name: /CUS-000001/ }).click();
    await page.getByLabel("ยอดรับชำระ").fill("58.85");
    await page.getByLabel(`ยอดจัดสรร ${invoiceNo}`).fill("58.85");
    await page.getByRole("button", { name: "บันทึกการรับชำระ" }).click();
    await expect(page.getByRole("button", { name: "ยกเลิกรายการรับชำระ" })).toBeVisible();
    await page.goto(invoiceUrl);
    await expect(page.getByText("ชำระแล้ว", { exact: true }).first()).toBeVisible();
    await page.goto("/accounting/ar?asOfDate=2026-10-01");
    await expect(page.getByText(invoiceNo, { exact: true })).toHaveCount(0);
  });
});
