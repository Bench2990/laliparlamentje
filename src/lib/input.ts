export type InputState = {
  keys: Set<string>;
  moveX: number;
  moveY: number;
  lookX: number;
  lookY: number;
  x: number;
  z: number;
};

export function createInput(): InputState {
  return { keys: new Set(), moveX: 0, moveY: 0, lookX: 0, lookY: 0, x: 145, z: 20 };
}

export function clearInput(input: InputState) {
  input.keys.clear();
  input.moveX = 0;
  input.moveY = 0;
  input.lookX = 0;
  input.lookY = 0;
}
