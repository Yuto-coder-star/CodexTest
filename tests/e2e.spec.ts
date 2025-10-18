import { test, expect } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test("chat page renders", async ({ page }) => {
  await page.goto(`${baseURL}/chat`);
  await expect(page.getByRole("textbox", { name: "メッセージ" })).toBeVisible();
  await expect(page.getByRole("button", { name: "送信" })).toBeVisible();
});
