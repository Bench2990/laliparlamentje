import { expect, type Page } from "@playwright/test";
import type {} from "../../src/components/experience/SceneTestBridge";
import { WALK } from "../../src/lib/world";

// Measure actual collision-resolved travel, not just the configuration value.
// Use gameplay seconds so software-GPU frame throttling does not skew results.
export async function checkMovementSpeed(page: Page, analog = 1) {
  const start = await page.evaluate(() => window.__parliamentTest!.snapshot());
  await expect.poll(async () => (await page.evaluate(() => window.__parliamentTest!.snapshot())).simulationTime - start.simulationTime, { intervals: [50, 100] }).toBeGreaterThan(0.6);
  const end = await page.evaluate(() => window.__parliamentTest!.snapshot());
  const elapsed = end.simulationTime - start.simulationTime;
  const speed = Math.hypot(end.x - start.x, end.z - start.z) / elapsed;
  expect(speed).toBeGreaterThan(WALK.speed * analog * 0.9);
  expect(speed).toBeLessThanOrEqual(WALK.speed * analog * 1.02);
  expect((end.avatar.walkPhase - start.avatar.walkPhase) / elapsed).toBeCloseTo(WALK.animationSpeed * 3, 1);
  expect(end.camera.clear).toBe(true);
}
