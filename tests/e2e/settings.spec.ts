import { expect, test } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const restrictedEmail = process.env.E2E_RESTRICTED_EMAIL;
const restrictedPassword = process.env.E2E_RESTRICTED_PASSWORD;
async function login(page: import("@playwright/test").Page, email: string, password: string) { await page.goto("/login"); await page.getByLabel("อีเมล").fill(email); await page.getByLabel("รหัสผ่าน").fill(password); await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click(); await expect(page).toHaveURL(/\/dashboard/); }

test.describe("Phase 13 settings", () => {
  test.skip(!adminEmail || !adminPassword || !restrictedEmail || !restrictedPassword, "Run with the isolated settings E2E database");

  test("authorized administrator persists independent sections and confirms a prefix change", async ({ page }) => {
    await login(page, adminEmail!, adminPassword!);
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "ตั้งค่าระบบและกิจการ" })).toBeVisible();
    const businessName = page.getByLabel("ชื่อกิจการ");
    await expect(businessName).toHaveValue("AquaOps");
    await businessName.fill("โรงงานน้ำดื่ม AquaOps ทดสอบ");
    await page.getByRole("button", { name: "บันทึกข้อมูลกิจการ" }).click();
    await expect(page.getByText("บันทึกการตั้งค่าแล้ว").last()).toBeVisible();

    await page.getByRole("link", { name: /การขาย/ }).click();
    await page.getByLabel("เครดิตเริ่มต้น (วัน)").fill("15");
    await page.getByRole("button", { name: "บันทึกค่าการขาย" }).click();
    await expect(page.getByText("บันทึกการตั้งค่าแล้ว").last()).toBeVisible();

    await page.getByRole("link", { name: /เอกสาร/ }).click();
    await page.getByLabel("คำสั่งซื้อ").fill("ORD");
    await page.getByRole("button", { name: "ตรวจสอบและบันทึก" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(/เอกสารเดิมจะไม่เปลี่ยนแปลง/)).toBeVisible();
    const toastCount = await page.getByText("บันทึกการตั้งค่าแล้ว").count();
    await dialog.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText(/การตั้งค่าถูกแก้ไข|ไม่สามารถบันทึกการตั้งค่า/)).toHaveCount(0);
    await expect(page.getByText("บันทึกการตั้งค่าแล้ว")).toHaveCount(toastCount + 1);
    await page.waitForLoadState("networkidle");

    await page.reload();
    await expect(page.getByLabel("คำสั่งซื้อ")).toHaveValue("ORD");
    await page.getByRole("link", { name: /ทั่วไป/ }).click();
    await expect(page.getByLabel("ชื่อกิจการ")).toHaveValue("โรงงานน้ำดื่ม AquaOps ทดสอบ");
    await page.getByRole("link", { name: /การขาย/ }).click();
    await expect(page.getByLabel("เครดิตเริ่มต้น (วัน)")).toHaveValue("15");
  });

  test("settings navigation remains contained on tablet and mobile", async ({ page }) => {
    await login(page, adminEmail!, adminPassword!);
    for (const viewport of [{ width: 834, height: 1112 }, { width: 390, height: 844 }]) { await page.setViewportSize(viewport); await page.goto("/settings?section=system"); await expect(page.getByText("ข้อมูลระบบ", { exact: true })).toBeVisible(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true); }
  });

  test("unauthorized user cannot see or open Settings", async ({ page }) => {
    await login(page, restrictedEmail!, restrictedPassword!);
    await expect(page.getByRole("link", { name: "ตั้งค่า" })).toHaveCount(0);
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "ไม่มีสิทธิ์เข้าถึง" })).toBeVisible();
  });
});
