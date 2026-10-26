import { expect, test, type Page } from "@playwright/test";
import type {} from "../../src/components/experience/SceneTestBridge";

declare global {
  interface Window { __slapAudioProbe: { available: boolean; claps: number; running: boolean } }
}

// Observe real Web Audio source starts, without adding diagnostics to the app.
export async function installSlapAudioProbe(page: Page) {
  await page.addInitScript(() => {
    window.__slapAudioProbe = { available: false, claps: 0, running: false };
    const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    window.__slapAudioProbe.available = true;
    const create = AudioContextClass.prototype.createBufferSource;
    AudioContextClass.prototype.createBufferSource = function () {
      const source = create.call(this);
      const start = source.start.bind(source);
      source.start = (...args: Parameters<AudioBufferSourceNode["start"]>) => {
        window.__slapAudioProbe.claps++;
        window.__slapAudioProbe.running = this.state === "running";
        start(...args);
      };
      return source;
    };
  });
}

export async function checkCartoonSlap(page: Page, mobile: boolean, screenshot: string) {
  const snapshot = () => page.evaluate(() => window.__parliamentTest!.snapshot());
  await page.evaluate(() => { const n = window.__parliamentTest!.snapshot().cameo!; return window.__parliamentTest!.place(n.x, n.z + 3); });
  await page.keyboard.press("f");
  expect((await snapshot()).cameo!.phase).toBe("idle");

  await page.evaluate(() => { const n = window.__parliamentTest!.snapshot().cameo!; return window.__parliamentTest!.place(n.x, n.z + 1.25); });
  const button = page.getByRole("button", { name: mobile ? "Pofon 👋" : "F Pofon 👋", exact: true });
  await expect(button).toBeVisible();
  const box = (await button.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  const clapsBefore = await page.evaluate(() => window.__slapAudioProbe.claps);
  // E stays exclusively assigned to doors, even beside the NPC.
  await page.keyboard.press("e");
  expect((await snapshot()).cameo!.phase).toBe("idle");
  if (mobile) await button.tap();
  else await page.keyboard.press("f");
  await expect.poll(async () => (await snapshot()).avatar.rightArm, { intervals: [20, 30, 50] }).toBeLessThan(-0.4);
  const started = (await snapshot()).cameo!;
  expect(started.slapTime).not.toBeNull();
  await page.keyboard.down("f");
  await page.keyboard.down("f"); // A held/repeated key must not restart the timeline.
  await page.keyboard.up("f");
  await expect.poll(async () => Math.abs((await snapshot()).cameo!.wobble), { intervals: [30, 50] }).toBeGreaterThan(0.05);
  await expect.poll(async () => (await snapshot()).cameo!.phase, { intervals: [40, 60] }).toBe("falling");
  await expect.poll(async () => (await snapshot()).cameo!.phase, { intervals: [40, 60] }).toBe("floor");
  const floor = (await snapshot()).cameo!;
  expect(floor.tilt).toBeCloseTo(-Math.PI / 2, 3);
  expect(floor.height).toBeGreaterThanOrEqual(0.33);
  expect(floor.walking).toBe(false);
  expect(floor.stars).toBe(true);
  expect(floor.pathTime).toBe(started.pathTime);
  expect(Math.hypot(floor.x - started.x, floor.z - started.z)).toBeLessThan(0.001);
  await expect(button).not.toBeVisible();
  await expect(page.getByTestId("cameo-reaction")).toContainText("senki sem sérül meg");
  await page.keyboard.press("f");
  if (mobile) await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(250);
  expect((await snapshot()).cameo!.phase).toBe("floor");
  const sound = await page.evaluate(() => window.__slapAudioProbe);
  if (sound.available) {
    expect(sound.claps).toBe(clapsBefore + 1);
    expect(sound.running).toBe(true);
  } else {
    expect(sound.claps).toBe(0);
    test.info().annotations.push({ type: "note", description: "This browser build does not expose Web Audio; verified the silent animation fallback instead." });
  }
  // Settings pause both actors' shared animation clock, with no delayed/double sound.
  if (!mobile) {
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Séta folytatása" })).toBeVisible();
  }
  const settings = page.getByRole("button", { name: "Beállítások", exact: true });
  if (mobile) await settings.tap(); else await settings.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const paused = (await snapshot()).cameo!.slapTime;
  expect(paused).not.toBeNull();
  await page.keyboard.press("f");
  await page.waitForTimeout(300);
  expect((await snapshot()).cameo!.slapTime).toBe(paused);
  // Screenshot capture can be slower than a transient pose on software GPUs.
  // Capture while paused, hiding only the modal's visual layer for the image.
  await page.screenshot({ path: screenshot, style: ".settings-panel, .pause-overlay { visibility: hidden !important; } .settings-panel::backdrop { opacity: 0 !important; }" });
  const resume = page.getByRole("button", { name: "Vissza a sétához" });
  if (mobile) await resume.tap(); else await resume.click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect.poll(async () => (await snapshot()).cameo!.phase).toBe("idle");
  await expect.poll(async () => (await snapshot()).cameo!.walking).toBe(true);
  const recovered = (await snapshot()).cameo!;
  expect(recovered.slapPhases).toEqual(["swing", "wobble", "falling", "floor", "recovering", "idle"]);
  expect(recovered.tilt).toBe(0);
  expect(recovered.height).toBe(0);
  expect(recovered.stars).toBe(false);
  await expect(page.getByTestId("cameo-reaction")).not.toBeVisible();
  await expect.poll(async () => { const n = (await snapshot()).cameo!; return Math.hypot(n.x - floor.x, n.z - floor.z); }).toBeGreaterThan(0.1);
  expect(await page.evaluate(() => window.__slapAudioProbe.claps)).toBe(clapsBefore + Number(sound.available));
}
