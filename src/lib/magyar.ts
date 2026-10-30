import { DANUBE, type Position3 } from "./world";

// On the existing upper promenade, two metres inside the railing and well
// clear of the benches and the through path. Local +Z faces the Danube (-X).
export const MAGYAR = {
  x: -60.8,
  z: 18,
  facing: -Math.PI / 2,
  radius: 0.43,
} as const;

export const PHONE_THROW = {
  duration: 6.2,
  phoneOut: 0.5,
  lookStart: 1.05,
  windupStart: 1.85,
  throwStart: 2.28,
  release: 2.6,
  flightDuration: 1.5,
  splashDuration: 0.95,
  arcHeight: 3.8,
  // Clear the broad stone embankment's sightline, not only the railing: a
  // shorter lob hides the water impact from the normal follow camera.
  landing: [0.325, DANUBE.waterHeight, 26.6] as Position3,
} as const;

export type PhoneThrowPhase = "pause" | "take-out" | "look" | "windup" | "throw" | "flight" | "splash";
export type PhoneThrowPose = { shoulder: number; elbow: number; head: number };

const keyframes = [
  { time: 0, shoulder: 0.08, elbow: -0.15, head: 0 },
  { time: PHONE_THROW.phoneOut, shoulder: 0.2, elbow: -0.85, head: 0.12 },
  { time: PHONE_THROW.lookStart, shoulder: -0.82, elbow: -1.7, head: 0.38 },
  { time: PHONE_THROW.windupStart, shoulder: -0.82, elbow: -1.7, head: 0.38 },
  { time: PHONE_THROW.throwStart, shoulder: -3.25, elbow: -1.15, head: -0.08 },
  { time: PHONE_THROW.release, shoulder: -1.95, elbow: -0.2, head: -0.06 },
  { time: 2.95, shoulder: -1.1, elbow: -0.08, head: 0 },
  { time: 3.6, shoulder: 0.08, elbow: -0.15, head: 0 },
  { time: PHONE_THROW.duration, shoulder: 0.08, elbow: -0.15, head: 0 },
];

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export function phoneThrowTime(time: number) {
  const t = Math.max(0, time) % PHONE_THROW.duration;
  // Avoid a floating-point remainder just below the end at exact loop bounds.
  return t > PHONE_THROW.duration - 1e-9 ? 0 : t;
}

export function phoneThrowPhase(time: number): PhoneThrowPhase {
  const t = phoneThrowTime(time);
  if (t < PHONE_THROW.phoneOut) return "pause";
  if (t < PHONE_THROW.lookStart) return "take-out";
  if (t < PHONE_THROW.windupStart) return "look";
  if (t < PHONE_THROW.throwStart) return "windup";
  if (t < PHONE_THROW.release) return "throw";
  if (t < PHONE_THROW.release + PHONE_THROW.flightDuration) return "flight";
  if (t < PHONE_THROW.release + PHONE_THROW.flightDuration + PHONE_THROW.splashDuration) return "splash";
  return "pause";
}

export function phoneThrowPose(time: number): PhoneThrowPose {
  const t = phoneThrowTime(time);
  const index = keyframes.findIndex((frame) => frame.time > t);
  const a = keyframes[index - 1];
  const b = keyframes[index];
  const progress = (t - a.time) / (b.time - a.time);
  const eased = progress * progress * (3 - 2 * progress);
  return { shoulder: mix(a.shoulder, b.shoulder, eased), elbow: mix(a.elbow, b.elbow, eased), head: mix(a.head, b.head, eased) };
}

// Matches the rig's shoulder, elbow and palm offsets exactly. The independent
// phone follows this grip until release; the same point starts its flight.
export function phoneHandPosition(pose: PhoneThrowPose): Position3 {
  const wrist = pose.shoulder + pose.elbow;
  return [
    0.325,
    1.38 - 0.31 * Math.cos(pose.shoulder) - 0.34 * Math.cos(wrist) - 0.045 * Math.sin(wrist),
    -0.31 * Math.sin(pose.shoulder) - 0.34 * Math.sin(wrist) + 0.045 * Math.cos(wrist),
  ];
}

const releasePosition = phoneHandPosition(phoneThrowPose(PHONE_THROW.release));

export function thrownPhonePosition(time: number): Position3 {
  const t = phoneThrowTime(time);
  if (t < PHONE_THROW.release) return phoneHandPosition(phoneThrowPose(t));
  if (t >= PHONE_THROW.release + PHONE_THROW.flightDuration) return [...PHONE_THROW.landing];
  const progress = Math.min(1, (t - PHONE_THROW.release) / PHONE_THROW.flightDuration);
  return [
    mix(releasePosition[0], PHONE_THROW.landing[0], progress),
    mix(releasePosition[1], PHONE_THROW.landing[1], progress) + 4 * PHONE_THROW.arcHeight * progress * (1 - progress),
    mix(releasePosition[2], PHONE_THROW.landing[2], progress),
  ];
}
