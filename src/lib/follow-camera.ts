import { canOccupy } from "./collisions";
import { floorHeight, type Position3, type SceneId } from "./world";

export const FOLLOW_CAMERA = {
  exteriorDistance: 5.2,
  interiorDistance: 3.6,
  targetHeight: 1.25,
  upwardAimLift: 4.8,
  defaultPitch: 0.28,
  minPitch: -0.6,
  maxPitch: 1.05,
  clearance: 0.2,
  damping: 14,
} as const;

export function cameraPointIsClear(scene: SceneId, x: number, y: number, z: number) {
  if (!canOccupy(scene, x, z, FOLLOW_CAMERA.clearance)) return false;
  if (y < floorHeight(scene, x, z) + FOLLOW_CAMERA.clearance) return false;
  const ceiling = z < -36 ? 23 : z < -13 ? 14.6 : 15.6;
  return scene === "exterior" || y < ceiling;
}

// Sample the camera boom against the same lightweight world primitives as the
// player. This also prevents the camera cutting across room corners on orbit.
export function clipCameraBoom(scene: SceneId, target: Position3, desired: Position3): Position3 {
  const length = Math.hypot(desired[0] - target[0], desired[1] - target[1], desired[2] - target[2]);
  const steps = Math.max(1, Math.ceil(length / 0.12));
  let safe: Position3 = [...target];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const next: Position3 = [
      target[0] + (desired[0] - target[0]) * t,
      target[1] + (desired[1] - target[1]) * t,
      target[2] + (desired[2] - target[2]) * t,
    ];
    if (!cameraPointIsClear(scene, ...next)) break;
    safe = next;
  }
  return safe;
}

export function followCameraPose(scene: SceneId, x: number, y: number, z: number, yaw: number, pitch: number) {
  const distance = scene === "exterior" ? FOLLOW_CAMERA.exteriorDistance : FOLLOW_CAMERA.interiorDistance;
  const target: Position3 = [x, y + FOLLOW_CAMERA.targetHeight + Math.max(0, -pitch) * FOLLOW_CAMERA.upwardAimLift, z];
  const desired: Position3 = [
    x + Math.sin(yaw) * Math.cos(pitch) * distance,
    target[1] + Math.sin(pitch) * distance,
    z + Math.cos(yaw) * Math.cos(pitch) * distance,
  ];
  desired[1] = Math.max(floorHeight(scene, desired[0], desired[2]) + 0.25, desired[1]);
  let position = clipCameraBoom(scene, target, desired);
  // Against a wall, a short elevated boom keeps the avatar visible rather than
  // putting the lens inside the character's head. It never passes through walls.
  if (Math.hypot(position[0] - x, position[1] - target[1], position[2] - z) < 1.35) {
    const overhead: Position3 = [position[0], y + 4.4, position[2]];
    if (cameraPointIsClear(scene, ...overhead)) {
      position = overhead;
      target[1] = y + FOLLOW_CAMERA.targetHeight;
    }
  }
  return { position, target };
}
