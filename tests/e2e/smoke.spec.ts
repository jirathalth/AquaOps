import { expect, test } from "@playwright/test";

test("application loads", async ({ page }) => {
  await page.goto("/dashboard");
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
