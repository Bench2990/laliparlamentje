import type { CharacterMotion } from "./characters";
import { INITIAL_SPAWN } from "./world";
import { FOLLOW_CAMERA } from "./follow-camera";

export type InputState = CharacterMotion & {
  keys: Set<string>;
  moveX: number;
  moveY: number;
  lookX: number;
  lookY: number;
  yaw: number;
  pitch: number;
  snapCamera: boolean;
};

export function createInput(): InputState {
  return {
    keys: new Set(), moveX: 0, moveY: 0, lookX: 0, lookY: 0,
    x: INITIAL_SPAWN.position[0], y: 0, z: INITIAL_SPAWN.position[2],
    yaw: INITIAL_SPAWN.yaw, pitch: FOLLOW_CAMERA.defaultPitch,
    facing: INITIAL_SPAWN.yaw + Math.PI, walkPhase: 0, walkBlend: 0,
    snapCamera: true,
  };
}

export function clearInput(input: InputState) {
  input.keys.clear();
  input.moveX = 0;
  input.moveY = 0;
  input.lookX = 0;
  input.lookY = 0;
}
