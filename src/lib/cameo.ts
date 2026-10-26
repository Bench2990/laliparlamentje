import type { CharacterMotion } from "./characters";
import type { SlapState } from "./slap";
import { isNearDoor, type SceneId } from "./world";

export type InteractionTarget = "door" | "cameo" | null;

export const CAMEO = {
  radius: 0.46,
  interactionDistance: 1.65,
  label: "Viktor · fiktív karikatúra",
} as const;

export type CameoState = CharacterMotion & SlapState & {
  pathTime: number;
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
  return { ...cameoRoute(0), y: 2.4, pathTime: 0, slapTime: null, walkPhase: 0, walkBlend: 0 };
}

export function resetCameo(cameo: CameoState) {
  Object.assign(cameo, createCameo());
}

export function isNearCameo(scene: SceneId, x: number, z: number, cameo: CameoState) {
  return scene === "interior" && z < -36 && Math.hypot(x - cameo.x, z - cameo.z) <= CAMEO.interactionDistance;
}

export function beginSlap(scene: SceneId, player: CharacterMotion, cameo: CameoState) {
  if (cameo.slapTime !== null || !isNearCameo(scene, player.x, player.z, cameo)) return false;
  // Face each other once; neither actor tracks or slides after the cartoon fall.
  player.facing = Math.atan2(cameo.x - player.x, cameo.z - player.z);
  cameo.facing = Math.atan2(player.x - cameo.x, player.z - cameo.z);
  cameo.slapTime = 0;
  cameo.walkBlend = 0;
  return true;
}

export function interactionTarget(scene: SceneId, x: number, z: number, cameo: CameoState): InteractionTarget {
  if (isNearDoor(scene, x, z)) return "door";
  if (cameo.slapTime === null && isNearCameo(scene, x, z, cameo)) return "cameo";
  return null;
}
