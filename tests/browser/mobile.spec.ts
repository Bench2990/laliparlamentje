import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import type {} from "../../src/components/experience/SceneTestBridge";
import { checkCartoonSlap, installSlapAudioProbe } from "./slap-check";
import { checkMovementSpeed } from "./movement-check";
import { checkRiverfrontPhoneThrow } from "./riverfront-check";

async function checkMobileLayout(page: Page) {
  const viewport = page.viewportSize()!;
  for (const control of [page.getByTestId("joystick"), page.getByTestId("touch-look"), page.getByRole("button", { name: "Beállítások", exact: true })]) {
    await expect(control).toBeVisible();
    const box = (await control.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
  }
  const dimensions = await page.evaluate(() => {
    return { scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight, width: innerWidth, height: innerHeight };
  });
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1);
  expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.height + 1);
  await expect.poll(() => page.evaluate(() => { const canvas = document.querySelector("canvas")!; return canvas.width / canvas.clientWidth; })).toBeLessThanOrEqual(1.05);
}

for (const orientation of ["portrait", "landscape"] as const) {
  test(`mobile (${orientation}): multitouch, higher-speed collision, touch transitions and rotation`, async ({ page, context }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await installSlapAudioProbe(page);
    await page.setViewportSize(orientation === "portrait" ? { width: 393, height: 851 } : { width: 851, height: 393 });
    await page.goto("/");
    await expect(page.locator('[data-ready="true"]')).toBeVisible({ timeout: 120_000 });
    await mkdir("artifacts", { recursive: true });
    await page.screenshot({ path: `artifacts/mobile-${orientation}-welcome.png` });
    await page.getByRole("button", { name: "Séta indítása" }).tap();
    await checkMobileLayout(page);
    expect(await page.evaluate(() => document.pointerLockElement === null)).toBe(true);
    const joystick = (await page.getByTestId("joystick").boundingBox())!;
    const look = (await page.getByTestId("touch-look").boundingBox())!;
    const x = joystick.x + joystick.width / 2;
    const y = joystick.y + joystick.height / 2;
    const lx = look.x + look.width / 2;
    const ly = look.y + look.height / 2;
    const cdp = await context.newCDPSession(page);
    // React can show the controls before the first started gameplay frame has
    // positioned the follow camera, especially with a warm landscape page.
    await expect.poll(async () => (await page.evaluate(() => window.__parliamentTest!.snapshot())).camera.distance).toBeGreaterThan(3);
    const start = await page.evaluate(() => window.__parliamentTest!.snapshot());
    expect(start.avatar.visible).toBe(true);
    expect(start.camera.distance).toBeGreaterThan(3);
    expect(start.camera.clear).toBe(true);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ id: 1, x, y }, { id: 2, x: lx, y: ly }] });
    const touchDown = await page.evaluate(() => window.__parliamentTest!.snapshot());
    expect(Math.abs(touchDown.yaw - start.yaw)).toBeLessThan(0.001);
    expect(Math.abs(touchDown.pitch - start.pitch)).toBeLessThan(0.001);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ id: 1, x, y: y - 31 }, { id: 2, x: lx + 37, y: ly + 12 }] });
    await expect.poll(async () => { const p = await page.evaluate(() => window.__parliamentTest!.snapshot()); return Math.hypot(start.x - p.x, start.z - p.z); }, { timeout: 15000 }).toBeGreaterThan(1.2);
    const during = await page.evaluate(() => window.__parliamentTest!.snapshot());
    expect(Math.abs(during.yaw - start.yaw)).toBeGreaterThan(0.05);
    expect(Math.abs(during.pitch - start.pitch)).toBeGreaterThan(0.01);
    expect(during.moveY).toBeGreaterThan(0.5);
    expect(during.avatar.walkBlend).toBeGreaterThan(0.2);
    expect(during.camera.clear).toBe(true);
    expect(during.calls).toBeLessThan(80);
    await checkMovementSpeed(page, Math.hypot(during.moveX, during.moveY));
    await cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
    await page.waitForTimeout(350);
    const stopped = await page.evaluate(() => window.__parliamentTest!.snapshot());
    expect(stopped.moveX).toBe(0);
    expect(stopped.moveY).toBe(0);
    await page.screenshot({ path: `artifacts/mobile-${orientation}-exploring.png` });
    await checkRiverfrontPhoneThrow(page, true, `artifacts/mobile-${orientation}-phone-throw.png`);

    await page.evaluate(() => window.__parliamentTest!.place(59, 0, Math.PI / 2, -0.4));
    const sign = (await page.evaluate(() => window.__parliamentTest!.snapshot())).sign;
    expect(sign?.text).toBe("Lali parlamentje");
    expect(sign?.inView).toBe(true);
    await page.screenshot({ path: `artifacts/mobile-${orientation}-sign.png` });

    await page.evaluate(() => window.__parliamentTest!.place(44.5, 0, Math.PI / 2));
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ id: 3, x, y }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ id: 3, x, y: y - joystick.width * 0.3 }] });
    await expect.poll(async () => (await page.evaluate(() => window.__parliamentTest!.snapshot())).x, { timeout: 15000 }).toBeLessThan(42.6);
    expect((await page.evaluate(() => window.__parliamentTest!.snapshot())).x).toBeGreaterThanOrEqual(42.17);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(async () => (await page.evaluate(() => window.__parliamentTest!.snapshot())).moveY).toBe(0);
    const enter = page.getByRole("button", { name: "Belépés", exact: true });
    await expect(enter).toBeVisible();
    const button = (await enter.boundingBox())!;
    expect(button.width).toBeGreaterThanOrEqual(44);
    expect(button.height).toBeGreaterThanOrEqual(44);
    expect(button.x < joystick.x + joystick.width && button.x + button.width > joystick.x && button.y < joystick.y + joystick.height && button.y + button.height > joystick.y).toBe(false);
    await enter.tap();
    await expect(page.locator('[data-scene="interior"][data-transition="idle"]')).toBeVisible();
    await expect(page.locator(".scene-transition")).toHaveCSS("opacity", "0");
    await page.screenshot({ path: `artifacts/mobile-${orientation}-interior.png` });
    expect((await page.evaluate(() => window.__parliamentTest!.snapshot())).avatar.visible).toBe(true);
    expect((await page.evaluate(() => window.__parliamentTest!.snapshot())).riverfront).toBeNull();
    await checkCartoonSlap(page, true, `artifacts/mobile-${orientation}-cartoon-slap.png`);
    await page.evaluate(() => window.__parliamentTest!.place(0, 8.6, Math.PI));
    await page.getByRole("button", { name: "Kilépés", exact: true }).tap();
    await expect(page.locator('[data-scene="exterior"][data-transition="idle"]')).toBeVisible();
    expect((await page.evaluate(() => window.__parliamentTest!.snapshot())).riverfront?.phone.count).toBe(1);
    await expect(page.locator(".scene-transition")).toHaveCSS("opacity", "0");
    await page.setViewportSize(orientation === "portrait" ? { width: 851, height: 393 } : { width: 393, height: 851 });
    await checkMobileLayout(page);
    await page.screenshot({ path: `artifacts/mobile-${orientation}-rotated.png` });
    await page.getByRole("button", { name: "Beállítások", exact: true }).tap();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByLabel("Megjelenítés minősége").selectOption("low");
    await page.getByRole("button", { name: "Vissza a sétához" }).tap();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await checkMobileLayout(page);
    expect(errors).toEqual([]);
  });
}
