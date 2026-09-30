import { expect, test } from "@playwright/test";

test.describe("delivery management", () => {
  test.skip(process.env.AQUAOPS_AUTH_BYPASS !== "true", "Run with the local development auth bypass");

  test("plans, loads, dispatches, and records a delivery on desktop and mobile", async ({ page }) => {
    await page.goto("/delivery");
    await expect(page.getByRole("heading", { name: "การจัดส่ง" })).toBeVisible();
    await page.getByRole("link", { name: "สร้างรอบจัดส่ง" }).click();
    await page.getByLabel("วันที่จัดส่ง").fill("2026-09-30");
    await page.getByRole("combobox", { name: /^รถจัดส่ง/ }).click();
    await page.getByRole("option", { name: /1กข 1234/ }).click();
    await page.getByRole("combobox", { name: /^พนักงานขับรถ/ }).click();
    await page.getByRole("option", { name: /ฝ่ายจัดส่ง/ }).click();
    await page.getByLabel(/เลือก SO-202609-00002/).click();
    await page.getByRole("button", { name: "สร้างรอบจัดส่ง" }).click();
    await expect(page).toHaveURL(/\/delivery\/trips\/[0-9a-f-]+$/);
    await page.getByRole("button", { name: "เตรียม/ขึ้นสินค้า" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "ขึ้นสินค้า" }).click();
    await expect(page.getByText("เตรียม/ขึ้นสินค้า", { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "ออกรถจัดส่ง" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "ออกรถจัดส่ง" }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await page.getByRole("button", { name: "บันทึกผล" }).click();
    await page.getByLabel("ผู้รับสินค้า").fill("ผู้รับทดสอบ");
    await page.getByRole("dialog").getByRole("button", { name: "ยืนยันผลการจัดส่ง" }).click();
    await expect(page.getByText("จัดส่งสำเร็จ", { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "จบรอบจัดส่ง" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "จบรอบจัดส่ง" }).click();
    await expect(page.getByText("เสร็จสิ้น", { exact: true }).first()).toBeVisible();
  });
});
