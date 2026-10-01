import { expect, test } from "@playwright/test";

test.describe("accounting workflow", () => {
  test.skip(process.env.AQUAOPS_AUTH_BYPASS !== "true", "Run with the local development auth bypass");

  test("records, allocates, and voids a payment while preserving responsive AR", async ({ page }) => {
    await page.goto("/accounting/invoices");
    await expect(page.getByRole("heading", { name: "ใบแจ้งหนี้" })).toBeVisible();
    await expect(page.getByText("INV-202608-00001", { exact: true })).toBeVisible();
    await page.goto("/accounting/billing");
    await page.getByText("BL-202609-00001", { exact: true }).click();
    await expect(page).toHaveURL(/\/accounting\/billing\/[0-9a-f-]+$/);
    await page.getByRole("main").getByRole("link", { name: "รับชำระเงิน" }).click();
    await expect(page.getByRole("heading", { name: "บันทึกการรับชำระเงิน" })).toBeVisible();
    await page.getByLabel("ยอดรับชำระ").fill("10.00");
    await page.getByRole("button", { name: "จัดสรรตามลำดับใบแจ้งหนี้" }).click();
    await page.getByRole("button", { name: "บันทึกการรับชำระ" }).click();
    await expect(page).toHaveURL(/\/accounting\/payments\/[0-9a-f-]+$/);
    await expect(page.getByText("฿10.00", { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "ยกเลิกรายการรับชำระ" }).click();
    await page.getByLabel("เหตุผล").fill("ทดสอบการยกเลิกรายการ");
    await page.getByRole("dialog").getByRole("button", { name: "ยืนยันการยกเลิก" }).click();
    await expect(page.getByText("ยกเลิก", { exact: true }).first()).toBeVisible();
    await page.goto("/accounting/ar?asOfDate=2026-10-01");
    await expect(page.getByRole("heading", { name: "ลูกหนี้การค้า" })).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await expect(page.getByText("INV-202608-00001", { exact: true })).toBeVisible();
  });
});
