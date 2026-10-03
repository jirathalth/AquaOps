import { expect, test, type Page } from "@playwright/test";

const authBypass = process.env.AQUAOPS_AUTH_BYPASS === "true";
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

async function authenticate(page: Page) {
  if (authBypass) return;
  await page.goto("/login");
  await page.getByLabel("อีเมล").fill(adminEmail!);
  await page.getByLabel("รหัสผ่าน").fill(adminPassword!);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("customer management", () => {
  test.skip(!authBypass && (!adminEmail || !adminPassword), "Enable development bypass or provide E2E administrator credentials");
  test.beforeEach(async ({ page }) => authenticate(page));

  test("creates, edits, views, and deactivates a customer", async ({ page }) => {
    const name = `ลูกค้าทดสอบ ${Date.now()}`;
    await page.goto("/customers");
    await expect(page.getByRole("heading", { name: "ลูกค้า" })).toBeVisible();
    await page.getByRole("link", { name: "เพิ่มลูกค้า", exact: true }).click();
    await expect(page).toHaveURL(/\/customers\/new$/);
    await page.getByLabel(/^ชื่อลูกค้า/).fill(name);
    await page.getByRole("button", { name: "เพิ่มที่อยู่จัดส่ง" }).click();
    await page.getByRole("textbox", { name: /^ที่อยู่ / }).fill("99 ถนนสุขุมวิท");
    await page.getByRole("textbox", { name: /^จังหวัด/ }).fill("กรุงเทพมหานคร");
    await page.getByRole("button", { name: "เพิ่มลูกค้า", exact: true }).click();
    await expect(page).toHaveURL(/\/customers\/[0-9a-f-]+$/);
    await expect(page.getByRole("heading", { name })).toBeVisible();
    await page.getByRole("link", { name: "แก้ไข" }).click();
    await page.getByLabel("โทรศัพท์").first().fill("081-111-2222");
    await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง" }).click();
    await expect(page.getByText("081-111-2222").first()).toBeVisible();
    await page.getByRole("button", { name: "ปิดใช้งาน", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "ปิดใช้งาน" }).click();
    await expect(page.getByText("ไม่ใช้งาน", { exact: true }).first()).toBeVisible();
  });

  test("customer list remains usable at tablet and mobile widths", async ({ page }) => {
    for (const viewport of [{ width: 834, height: 1112 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      await page.goto("/customers");
      await expect(page.getByRole("heading", { name: "ลูกค้า" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    }
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("billing customers can omit a credit limit", async ({ page }) => {
    await page.goto("/customers/new");
    await page.getByLabel("รูปแบบการขาย").click();
    await page.getByRole("option", { name: "วางบิล", exact: true }).click();
    await expect(page.getByLabel("กำหนดชำระ (วัน)")).toBeVisible();
    await expect(page.getByLabel("รอบวางบิล")).toBeVisible();
    await expect(page.getByLabel("กำหนดวงเงินเครดิต")).not.toBeChecked();
    await expect(page.getByLabel("วงเงินเครดิต")).toHaveCount(0);
    await page.getByLabel("กำหนดวงเงินเครดิต").check();
    await expect(page.getByLabel("วงเงินเครดิต")).toBeVisible();
    await page.getByLabel("กำหนดวงเงินเครดิต").uncheck();
    await expect(page.getByLabel("วงเงินเครดิต")).toHaveCount(0);
  });
});
