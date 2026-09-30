import { expect, test } from "@playwright/test";

test.describe("sales order management", () => {
  test.skip(process.env.AQUAOPS_AUTH_BYPASS !== "true", "Run with the local development auth bypass");

  test("creates, prices, saves and confirms an order", async ({ page }) => {
    await page.goto("/sales/orders");
    await expect(page.getByRole("heading", { name: "คำสั่งซื้อ" })).toBeVisible();
    await page.getByRole("link", { name: "สร้างคำสั่งซื้อ", exact: true }).first().click();
    await page.getByRole("combobox", { name: /^ลูกค้า/ }).click();
    await page.getByRole("option", { name: /CUS-000002/ }).click();
    await page.getByRole("combobox", { name: "เพิ่มสินค้า" }).click();
    await page.getByRole("option", { name: /WATER-600-PACK/ }).click();
    await expect(page.getByLabel("ราคาต่อหน่วย")).toHaveValue("42.5000");
    await page.getByLabel("จำนวน").fill("2.000");
    await page.getByLabel("จำนวน").blur();
    await expect(page.getByText("฿85.00", { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "บันทึกฉบับร่าง" }).click();
    await expect(page).toHaveURL(/\/sales\/orders\/[0-9a-f-]+$/);
    await expect(page.getByText("ฉบับร่าง", { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "ยืนยันคำสั่งซื้อ" }).first().click();
    await page.getByRole("dialog").getByRole("button", { name: "ยืนยันคำสั่งซื้อ" }).click();
    await expect(page.getByText("ยืนยันแล้ว", { exact: true }).first()).toBeVisible();
  });

  test("order entry remains contained on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/sales/orders/new");
    await expect(page.getByRole("heading", { name: "สร้างคำสั่งซื้อ" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
});
