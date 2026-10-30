import { expect, type Page } from "@playwright/test";
import type {} from "../../src/components/experience/SceneTestBridge";
import { MAGYAR, PHONE_THROW } from "../../src/lib/magyar";
import { DANUBE } from "../../src/lib/world";

export async function checkRiverfrontPhoneThrow(page: Page, mobile: boolean, screenshot: string) {
  const snapshot = () => page.evaluate(() => window.__parliamentTest!.snapshot());
  await page.evaluate(() => window.__parliamentTest!.place(-59.7, 18, Math.PI / 2));
  await expect(page.getByText("Duna-part", { exact: true })).toBeVisible();
  await page.keyboard.press("e");
  await page.keyboard.press("f");
  await expect(page.locator(".interaction-button")).not.toBeVisible();
  await page.evaluate(() => window.__parliamentTest!.place(-54, 21, Math.PI / 2, 0.28));
  await expect(page.getByText("Duna-part", { exact: true })).toBeVisible();
  const initial = (await snapshot()).riverfront!;
  expect(initial.x).toBe(MAGYAR.x);
  expect(initial.y).toBe(0);
  expect(initial.z).toBe(MAGYAR.z);
  expect(initial.facing).toBeCloseTo(-Math.PI / 2);
  expect(initial.inView).toBe(true);
  expect(initial.interactive).toBe(false);
  expect(initial.phone.count).toBe(1);
  await page.keyboard.press("e");
  await page.keyboard.press("f");
  await expect(page.locator('[data-scene="exterior"]')).toBeVisible();
  await expect(page.locator(".interaction-button")).not.toBeVisible();
  await expect(page.getByTestId("cameo-reaction")).not.toBeVisible();

  await expect.poll(async () => (await snapshot()).riverfront!.phase, { intervals: [40, 60], timeout: 45000 }).toBe("look");
  const held = (await snapshot()).riverfront!;
  expect(held.phone.visible).toBe(true);
  expect(held.phone.inView).toBe(true);
  expect(held.phone.handDistance).toBeLessThan(0.001);

  await expect.poll(async () => {
    const npc = (await snapshot()).riverfront!;
    return npc.phase === "flight" && npc.time > PHONE_THROW.release + 0.35;
  }, { intervals: [40, 60] }).toBe(true);
  const flight = (await snapshot()).riverfront!;
  expect(flight.phone.visible).toBe(true);
  expect(flight.phone.inView).toBe(true);
  expect(flight.phone.x).toBeLessThan(DANUBE.railingX);
  expect(flight.phone.y).toBeGreaterThan(2);
  expect(flight.phone.handDistance).toBeGreaterThan(1);

  // Pause through the existing settings UI, both to check pause behavior and
  // to capture the tiny flying prop reliably on slower software GPUs.
  if (!mobile) await page.keyboard.press("Escape");
  const settings = page.getByRole("button", { name: "Beállítások", exact: true });
  if (mobile) await settings.tap(); else await settings.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const paused = (await snapshot()).riverfront!.time;
  await page.waitForTimeout(250);
  expect((await snapshot()).riverfront!.time).toBe(paused);
  await page.screenshot({ path: screenshot, style: ".settings-panel, .pause-overlay { visibility: hidden !important; } .settings-panel::backdrop { opacity: 0 !important; }" });
  const resume = page.getByRole("button", { name: "Vissza a sétához" });
  if (mobile) await resume.tap(); else await resume.click();

  await expect.poll(async () => (await snapshot()).riverfront!.splash.visible, { intervals: [40, 60] }).toBe(true);
  const splash = (await snapshot()).riverfront!;
  expect(splash.phone.visible).toBe(false);
  expect(splash.splash.inView).toBe(true);
  const smallRipple = splash.splash.scale;
  await expect.poll(async () => (await snapshot()).riverfront!.splash.scale, { intervals: [40, 60] }).toBeGreaterThan(smallRipple + 0.08);
  await expect.poll(async () => {
    const npc = (await snapshot()).riverfront!;
    return npc.phase === "pause" && npc.time > 5;
  }, { intervals: [40, 60] }).toBe(true);
  const firstLoop = (await snapshot()).riverfront!;
  expect(firstLoop.phone.visible).toBe(false);
  expect(firstLoop.splash.visible).toBe(false);
  expect(firstLoop.phases).toEqual(["take-out", "look", "windup", "throw", "flight", "splash", "pause"]);

  await expect.poll(async () => {
    const npc = (await snapshot()).riverfront!;
    return npc.cycle > firstLoop.cycle && npc.phase === "splash";
  }, { intervals: [50, 80], timeout: 45000 }).toBe(true);
  const nextLoop = (await snapshot()).riverfront!;
  expect(nextLoop.phone.id).toBe(initial.phone.id);
  expect(nextLoop.phone.count).toBe(1);
  expect(nextLoop.geometries).toBe(firstLoop.geometries);
  expect(nextLoop.textures).toBe(firstLoop.textures);
  expect(nextLoop.x).toBe(initial.x);
  expect(nextLoop.z).toBe(initial.z);
  expect(nextLoop.phases).toEqual(["take-out", "look", "windup", "throw", "flight", "splash"]);
  await expect(page.locator(".interaction-button")).not.toBeVisible();
  if (!mobile) await page.keyboard.press("Escape");
  if (mobile) await settings.tap(); else await settings.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({ path: screenshot.replace(".png", "-splash.png"), style: ".settings-panel, .pause-overlay { visibility: hidden !important; } .settings-panel::backdrop { opacity: 0 !important; }" });
  if (mobile) await resume.tap(); else await resume.click();
}
