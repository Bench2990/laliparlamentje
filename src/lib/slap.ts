// One shared, frame-rate-independent clock drives the arm, reaction and impact sound.
export const SLAP = {
  impact: 0.26,
  swingEnd: 0.68,
  wobbleEnd: 1.2,
  fallEnd: 1.85,
  floorEnd: 3.6,
  duration: 4.8,
} as const;

export type SlapState = { slapTime: number | null };
export type SlapPhase = "idle" | "swing" | "wobble" | "falling" | "floor" | "recovering";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };

export function slapPhase(time: number | null): SlapPhase {
  if (time === null || time >= SLAP.duration) return "idle";
  if (time < SLAP.impact) return "swing";
  if (time < SLAP.wobbleEnd) return "wobble";
  if (time < SLAP.fallEnd) return "falling";
  if (time < SLAP.floorEnd) return "floor";
  return "recovering";
}

export function advanceSlap(state: SlapState, delta: number) {
  if (state.slapTime === null) return { impact: false, finished: false };
  const previous = state.slapTime;
  const next = Math.min(SLAP.duration, previous + Math.max(0, delta));
  const finished = next >= SLAP.duration;
  state.slapTime = finished ? null : next;
  return { impact: previous < SLAP.impact && next >= SLAP.impact, finished };
}

// Time, shoulder X/Y/Z, elbow bend, torso twist, small forward lean.
const SWING = [
  [0, 0, 0, 0, 0, 0, 0],
  [0.16, -1.15, -1.05, 1.1, -0.85, -0.22, 0.08],
  [SLAP.impact, -1.85, 0.48, 0.22, -0.06, 0.18, 0.28],
  [0.4, -1.4, 1.2, -0.35, -0.15, 0.25, 0.18],
  [SLAP.swingEnd, 0, 0, 0, 0, 0, 0],
] as const;

export function playerSlapPose(time: number | null) {
  if (time === null || time >= SLAP.swingEnd) return { x: 0, y: 0, z: 0, elbow: 0, twist: 0, lean: 0 };
  const index = Math.max(1, SWING.findIndex((frame) => frame[0] >= time));
  const from = SWING[index - 1], to = SWING[index];
  const blend = smooth((time - from[0]) / (to[0] - from[0]));
  const value = (column: 1 | 2 | 3 | 4 | 5 | 6) => from[column] + (to[column] - from[column]) * blend;
  return { x: value(1), y: value(2), z: value(3), elbow: value(4), twist: value(5), lean: value(6) };
}

export function cameoSlapPose(time: number | null) {
  let fall = 0, wobble = 0, bounce = 0;
  if (time !== null && time >= SLAP.impact && time < SLAP.duration) {
    if (time < SLAP.wobbleEnd) {
      const t = (time - SLAP.impact) / (SLAP.wobbleEnd - SLAP.impact);
      wobble = Math.sin(t * Math.PI * 5) * 0.32 * Math.sin(Math.PI * t);
    } else if (time < SLAP.fallEnd) {
      const t = (time - SLAP.wobbleEnd) / (SLAP.fallEnd - SLAP.wobbleEnd);
      fall = smooth(t);
      bounce = Math.sin(Math.PI * t) * 0.13;
    } else if (time < SLAP.floorEnd) {
      fall = 1;
      bounce = Math.abs(Math.sin((time - SLAP.fallEnd) * 16)) * 0.07 * Math.exp(-(time - SLAP.fallEnd) * 8);
    } else {
      const t = (time - SLAP.floorEnd) / (SLAP.duration - SLAP.floorEnd);
      fall = 1 - smooth(t);
      bounce = Math.sin(Math.PI * t) * 0.12;
    }
  }
  // A little sideways tumble keeps the gag visible beside the third-person avatar.
  return { fall, tilt: fall ? -Math.PI / 2 * fall : 0, wobble, height: 0.33 * fall + bounce, side: 0.75 * fall, back: fall ? -0.18 * fall : 0 };
}
