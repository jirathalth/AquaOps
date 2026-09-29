import { expect, test } from "@playwright/test";

test("login page loads with the AquaOps identity", async ({ page }) => { await page.goto("/login"); await expect(page).toHaveTitle(/เข้าสู่ระบบ.*AquaOps/); await expect(page.getByRole("heading", { name: "เข้าสู่ระบบ" })).toBeVisible(); await expect(page.getByLabel("อีเมล")).toBeVisible(); });
test("protected page redirects unauthenticated users and preserves destination", async ({ page }) => { await page.goto("/sales/orders?status=pending"); await expect(page).toHaveURL(/\/login\?returnTo=%2Fsales%2Forders%3Fstatus%3Dpending/); });
test("protected API returns 401 without a session", async ({ request }) => { const response = await request.get("/api/access"); expect(response.status()).toBe(401); expect(await response.json()).toEqual({ error: "UNAUTHENTICATED" }); });
test("login remains usable on desktop, tablet, mobile, and dark mode", async ({ page }) => { for (const viewport of [{ width: 1440, height: 900 }, { width: 834, height: 1112 }, { width: 390, height: 844 }]) { await page.setViewportSize(viewport); await page.goto("/login"); await expect(page.getByRole("button", { name: "เข้าสู่ระบบ" })).toBeVisible(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true); } await page.addInitScript(() => localStorage.setItem("theme", "dark")); await page.reload(); await expect(page.locator("html")).toHaveClass(/dark/); });

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
test("rejects an invalid password", async ({ page }) => { test.skip(!adminEmail, "Set E2E_ADMIN_EMAIL against a seeded test database"); await page.goto("/login"); await page.getByLabel("อีเมล").fill(adminEmail!); await page.getByLabel("รหัสผ่าน").fill("definitely-wrong-password"); await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click(); await expect(page.getByText("อีเมลหรือรหัสผ่านไม่ถูกต้อง")).toBeVisible(); });
test.describe("seeded administrator", () => {
  test.skip(!adminEmail || !adminPassword, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD against a seeded test database");
  test.beforeEach(async ({ page }) => { await page.goto("/login"); await page.getByLabel("อีเมล").fill(adminEmail!); await page.getByLabel("รหัสผ่าน").fill(adminPassword!); await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click(); await expect(page).toHaveURL(/\/dashboard/); });
  test("logs in, sees authorized navigation, and can access users", async ({ page }) => { await expect(page.getByRole("link", { name: "ผู้ใช้งาน" })).toBeVisible(); await page.goto("/admin/users"); await expect(page.getByRole("heading", { name: "ผู้ใช้งาน" })).toBeVisible(); });
  test("logout prevents continued protected access", async ({ page }) => { await page.getByRole("button", { name: "เมนูผู้ใช้งาน" }).click(); await page.getByRole("menuitem", { name: "ออกจากระบบ" }).click(); await expect(page).toHaveURL(/\/login/); await page.goto("/dashboard"); await expect(page).toHaveURL(/\/login/); });
});

const restrictedEmail = process.env.E2E_RESTRICTED_EMAIL;
const restrictedPassword = process.env.E2E_RESTRICTED_PASSWORD;
test.describe("seeded restricted user", () => {
  test.skip(!restrictedEmail || !restrictedPassword, "Set restricted E2E credentials against a seeded test database");
  test.beforeEach(async ({ page }) => { await page.goto("/login"); await page.getByLabel("อีเมล").fill(restrictedEmail!); await page.getByLabel("รหัสผ่าน").fill(restrictedPassword!); await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click(); await expect(page).toHaveURL(/\/dashboard/); });
  test("hides administration and blocks a direct admin URL", async ({ page }) => { await expect(page.getByText("ผู้ดูแลระบบ", { exact: true })).toHaveCount(0); await page.goto("/admin/users"); await expect(page.getByRole("heading", { name: "ไม่มีสิทธิ์เข้าถึง" })).toBeVisible(); });
});
