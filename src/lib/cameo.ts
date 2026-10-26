import type { CharacterMotion } from "./characters";
import { isNearDoor, type SceneId } from "./world";

export type InteractionTarget = "door" | "cameo" | null;

export const CAMEO = {
  radius: 0.46,
  interactionDistance: 2.8,
  greetingDuration: 4.5,
  line: "Napirend előtt: egy kis séta is belefér!",
  label: "Viktor · fiktív karikatúra",
} as const;

export type CameoState = CharacterMotion & {
  pathTime: number;
  greetingRemaining: number;
};

// A slow loop in the open foyer of the chamber, clear of desks and columns.
export function cameoRoute(time: number) {
  const angle = time * 0.14;
  return {
    x: Math.sin(angle) * 4.8,
    z: -42.5 + Math.cos(angle) * 1.5,
    facing: Math.atan2(Math.cos(angle) * 4.8, -Math.sin(angle) * 1.5),
  };
}

export function createCameo(): CameoState {
  return { ...cameoRoute(0), y: 2.4, pathTime: 0, greetingRemaining: 0, walkPhase: 0, walkBlend: 0, wave: 0 };
}

export function resetCameo(cameo: CameoState) {
  Object.assign(cameo, createCameo());
}

export function isNearCameo(scene: SceneId, x: number, z: number, cameo: CameoState) {
  return scene === "interior" && z < -36 && Math.hypot(x - cameo.x, z - cameo.z) <= CAMEO.interactionDistance;
}

export function interactionTarget(scene: SceneId, x: number, z: number, cameo: CameoState): InteractionTarget {
  if (isNearDoor(scene, x, z)) return "door";
  if (cameo.greetingRemaining <= 0 && isNearCameo(scene, x, z, cameo)) return "cameo";
  return null;
}
