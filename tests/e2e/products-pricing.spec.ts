import { expect, test, type Page } from "@playwright/test";

const authBypass = process.env.AQUAOPS_AUTH_BYPASS === "true";
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

async function authenticate(page: Page) { if (authBypass) return; await page.goto("/login"); await page.getByLabel("อีเมล").fill(adminEmail!); await page.getByLabel("รหัสผ่าน").fill(adminPassword!); await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click(); await expect(page).toHaveURL(/\/dashboard/); }
async function selectFirstOption(page: Page, label: string) { await page.getByRole("combobox", { name: label }).click(); await page.getByRole("option").first().click(); }

test.describe("product and pricing management", () => {
  test.skip(!authBypass && (!adminEmail || !adminPassword), "Enable development bypass or provide E2E administrator credentials");
  test.beforeEach(async ({ page }) => authenticate(page));

  test("creates a product and configures a price-list item", async ({ page }) => {
    const suffix = Date.now();
    const sku = `E2E-${suffix}`;
    await page.goto("/inventory/products");
    await expect(page.getByRole("heading", { name: "สินค้า" })).toBeVisible();
    await page.getByRole("link", { name: "เพิ่มสินค้า", exact: true }).click();
    await page.getByLabel("SKU / รหัสสินค้า").fill(sku);
    await page.getByLabel("ชื่อสินค้า").fill(`สินค้าทดสอบ ${suffix}`);
    await selectFirstOption(page, "หน่วยหลัก");
    await page.getByLabel("ราคาปลีก").fill("20.1255");
    await page.getByLabel("ราคาส่ง").fill("18.5000");
    await page.getByRole("button", { name: "เพิ่มสินค้า", exact: true }).click();
    await expect(page).toHaveURL(/\/inventory\/products\/[0-9a-f-]+$/);
    await expect(page.getByText(sku, { exact: true }).first()).toBeVisible();

    await page.goto("/price-lists");
    await page.getByRole("link", { name: "สร้างรายการราคา", exact: true }).click();
    await page.getByLabel("รหัสรายการราคา").fill(`E2E-${suffix}`);
    await page.getByLabel("ชื่อรายการราคา").fill(`ราคาทดสอบ ${suffix}`);
    await page.getByRole("button", { name: "สร้างรายการราคา", exact: true }).click();
    await expect(page).toHaveURL(/\/price-lists\/[0-9a-f-]+$/);
    await page.getByRole("button", { name: "เพิ่มราคาสินค้า", exact: true }).first().click();
    await page.getByRole("combobox", { name: "สินค้าและหน่วย" }).click();
    await page.getByRole("option", { name: new RegExp(sku) }).click();
    await page.getByRole("spinbutton", { name: /^ราคา/ }).fill("17.1255");
    await page.getByRole("dialog").getByRole("button", { name: "บันทึก" }).click();
    await expect(page.getByText("฿17.12", { exact: true })).toBeVisible();
  });

  test("catalog screens remain usable at tablet and mobile widths", async ({ page }) => {
    for (const viewport of [{ width: 834, height: 1112 }, { width: 390, height: 844 }]) { await page.setViewportSize(viewport); await page.goto("/inventory/products"); await expect(page.getByRole("heading", { name: "สินค้า" })).toBeVisible(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true); await page.goto("/price-lists"); expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true); }
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
