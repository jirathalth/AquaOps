import { expect, test } from "@playwright/test";

test("application loads", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveTitle("AquaOps");
  await expect(page.getByRole("heading", { name: "ภาพรวมธุรกิจ" })).toBeVisible();
});

test("desktop shell supports dark mode", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dashboard");
  await expect(page.getByRole("navigation", { name: "เมนูหลัก" })).toBeVisible();
  await page.getByRole("button", { name: "ใช้ธีมมืด" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("mobile shell opens navigation drawer", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "เปิดเมนู" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("link", { name: "คำสั่งขาย" })).toBeVisible();
});

test("tablet UI uses IBM Plex Sans Thai for Thai and English", async ({ page }) => {
  await page.setViewportSize({ width: 834, height: 1112 });
  await page.goto("/dev/ui");
  await expect(page.getByRole("heading", { name: "UI Design System" })).toBeVisible();
  await expect(page.getByText("Body — ระบบบริหารจัดการธุรกิจผลิตและจัดจำหน่ายน้ำดื่ม")).toBeVisible();
  const typography = await page.evaluate(async () => {
    await document.fonts.ready;
    const rootFont = getComputedStyle(document.documentElement).getPropertyValue("--font-ibm-plex-sans-thai").trim();
    return { rootFont, bodyFont: getComputedStyle(document.body).fontFamily, status: document.fonts.status };
  });
  expect(typography.rootFont).toBeTruthy();
  expect(typography.bodyFont).toContain(typography.rootFont.split(",")[0].replaceAll('"', "").trim());
  expect(typography.status).toBe("loaded");
  await page.getByRole("button", { name: "ใช้ธีมมืด" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});
