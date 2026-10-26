export type CharacterMotion = {
  x: number;
  y: number;
  z: number;
  facing: number;
  walkPhase: number;
  walkBlend: number;
};

export function turnTowards(current: number, target: number, blend: number) {
  const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + difference * blend;
}
