import { expect, test, type Page } from "@playwright/test";

function pdfPageCount(pdf: Buffer) { return pdf.toString("latin1").match(/\/Type\s*\/Page\b/g)?.length ?? 0; }
function pdfMediaBox(pdf: Buffer) {
  const match = pdf.toString("latin1").match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : null;
}
async function openDetail(page: Page, listPath: string, number: string) { await page.goto(listPath); await page.getByText(number, { exact: true }).click(); }

test.describe("printable business documents", () => {
  test.skip(process.env.AQUAOPS_AUTH_BYPASS !== "true", "Run with the isolated development auth bypass");

  test("prints an A5 landscape invoice and handles a multi-page item table", async ({ page }) => {
    await openDetail(page, "/accounting/invoices", "INV-202608-00001");
    await page.getByRole("link", { name: "พิมพ์เอกสาร" }).click();
    await expect(page.getByRole("heading", { name: "ใบแจ้งหนี้" })).toBeVisible();
    await expect(page.getByText("INV-202608-00001", { exact: true })).toBeVisible();
    expect(await page.locator("article").evaluate((element) => Number.parseFloat(getComputedStyle(element).width))).toBeCloseTo(793.7, 0);
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: "print" });
    await expect(page.getByRole("navigation", { name: "การทำงานเอกสาร" })).toBeHidden();
    const normalPdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
    const mediaBox = pdfMediaBox(normalPdf);
    expect(mediaBox).not.toBeNull();
    expect(mediaBox!.width).toBeGreaterThan(590);
    expect(mediaBox!.width).toBeLessThan(600);
    expect(mediaBox!.height).toBeGreaterThan(415);
    expect(mediaBox!.height).toBeLessThan(425);
    const normalPages = pdfPageCount(normalPdf);
    expect(normalPages).toBe(1);
    await page.locator("tbody tr").first().evaluate((row) => { const body = row.parentElement!; for (let index = 0; index < 40; index += 1) body.append(row.cloneNode(true)); });
    const longPdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
    expect(pdfPageCount(longPdf)).toBeGreaterThan(normalPages);
  });

  test("renders billing and completed-payment receipt routes", async ({ page }) => {
    await openDetail(page, "/accounting/billing", "BL-202609-00001");
    await page.getByRole("link", { name: "พิมพ์เอกสาร" }).click();
    await expect(page.getByRole("heading", { name: "ใบวางบิล" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "ยอดวางบิล" })).toBeVisible();
    await openDetail(page, "/accounting/payments", "PAY-202609-00001");
    await page.getByRole("link", { name: "พิมพ์ใบเสร็จ" }).click();
    await expect(page.getByRole("heading", { name: "ใบเสร็จรับเงิน" })).toBeVisible();
    await expect(page.getByText("PAY-202609-00001", { exact: true })).toBeVisible();
    await expect(page.getByText("โอนธนาคาร", { exact: true })).toBeVisible();
  });
});
