import { test, expect } from "@playwright/test";
import type {} from "../../src/components/experience/SceneTestBridge";

test("production build renders self-contained local assets without the test navigation API", async ({ page }) => {
  const errors: string[] = [];
  const remote: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.url().startsWith("http") && new URL(request.url()).origin !== "http://127.0.0.1:3200") remote.push(request.url());
  });
  await page.goto("/");
  await expect(page.locator('[data-ready="true"]')).toBeVisible({ timeout: 90_000 });
  await expect(page.getByRole("heading", { name: "Az Országház", exact: true })).toBeVisible();
  expect(await page.locator("html").getAttribute("lang")).toBe("hu");
  expect(await page.evaluate(() => window.__parliamentTest === undefined)).toBe(true);
  await page.getByRole("button", { name: "Séta indítása" }).click();
  await expect(page.getByText("Kossuth Lajos tér", { exact: true })).toBeVisible();
  await expect(page.locator('[data-perspective="third-person"]')).toBeVisible();
  await expect(page.getByTestId("entrance-sign-label")).toHaveText("Bejárati felirat: Lali parlamentje");
  await page.keyboard.press("e");
  await expect(page.locator('[data-scene="exterior"]')).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Séta folytatása" })).toBeVisible();
  expect(errors).toEqual([]);
  expect(remote).toEqual([]);
});
