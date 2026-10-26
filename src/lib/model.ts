import type { Position3 } from "./world";

export type GeometryKind = "box" | "cylinder" | "cone" | "sphere" | "leaf" | "arch" | "archFrame" | "torus" | "roof" | "dome" | "shield";
export type Surface = "stone" | "metal" | "window" | "leaf" | "glow" | "matte";
export type Part = {
  kind: GeometryKind;
  position: Position3;
  scale: Position3;
  color: string;
  rotation?: Position3;
  surface?: Surface;
};

export class Model {
  parts: Part[] = [];

  add(kind: GeometryKind, position: Position3, scale: Position3, color: string, rotation?: Position3, surface?: Surface) {
    this.parts.push({ kind, position, scale, color, rotation, surface });
    return this;
  }

  box(position: Position3, scale: Position3, color: string, rotation?: Position3, surface?: Surface) {
    return this.add("box", position, scale, color, rotation, surface);
  }

  cylinder(position: Position3, radius: number, height: number, color: string, surface?: Surface) {
    return this.add("cylinder", position, [radius, height, radius], color, undefined, surface);
  }

  cone(position: Position3, radius: number, height: number, color: string, rotation?: Position3) {
    return this.add("cone", position, [radius, height, radius], color, rotation);
  }

  sphere(position: Position3, scale: Position3, color: string, surface?: Surface) {
    return this.add("sphere", position, scale, color, undefined, surface);
  }

  window(x: number, y: number, z: number, width: number, height: number, angle = 0, rich = true) {
    const rotation: Position3 = [0, angle, 0];
    const front = (depth: number): Position3 => [x + Math.sin(angle) * depth, y, z + Math.cos(angle) * depth];
    this.add("arch", front(0.02), [width, height, 1], "#354b4b", rotation, "window");
    this.add("archFrame", front(0.07), [width, height, 1], "#f2e2c5", rotation);
    const mullion = front(0.12);
    this.box([mullion[0], y + height * 0.43, mullion[2]], [0.12, height * 0.82, 0.14], "#d6c6a8", rotation);
    this.box([mullion[0], y + height * 0.36, mullion[2]], [width * 0.94, 0.13, 0.14], "#bfb196", rotation);
    if (rich) {
      const point = front(0.16);
      this.add("torus", [point[0], y + height * 0.71, point[2]], [width * 0.18, width * 0.18, width * 0.18], "#cebc98", rotation);
      this.box([point[0], y - 0.17, point[2]], [width * 1.35, 0.22, 0.48], "#f1e4cd", rotation);
    }
  }

  beam(from: Position3, to: Position3, thickness: number, color: string, surface?: Surface) {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const dz = to[2] - from[2];
    const length = Math.hypot(dx, dy, dz);
    return this.box(
      [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2],
      [thickness, length, thickness], color,
      [Math.atan2(dz, dy), 0, -Math.atan2(dx, Math.hypot(dy, dz))], surface,
    );
  }
}

export const PALETTE = {
  stone: "#dfcdb0",
  light: "#f0e2c8",
  trim: "#c3ad8c",
  base: "#bdac95",
  roof: "#985347",
  roofLight: "#b66c54",
  darkRoof: "#645956",
  bronze: "#344d46",
  gold: "#ba9653",
  red: "#823b37",
} as const;

export function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
