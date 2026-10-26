import { Model, PALETTE as P } from "./model";

export function lamp(m: Model, x: number, z: number, size = 1) {
  const c = P.bronze;
  m.cylinder([x, 0.15 * size, z], 0.46 * size, 0.3 * size, "#9e9b86");
  m.cylinder([x, 0.7 * size, z], 0.21 * size, 1.15 * size, c, "metal");
  m.cylinder([x, 2.65 * size, z], 0.09 * size, 4.3 * size, c, "metal");
  for (const y of [1.2, 3.8, 4.5]) m.cylinder([x, y * size, z], 0.17 * size, 0.16 * size, c, "metal");
  m.box([x, 4.8 * size, z], [2.4 * size, 0.1 * size, 0.12 * size], c, undefined, "metal");
  m.cone([x, 5.35 * size, z], 0.15 * size, 0.8 * size, c);
  for (const side of [-1, 1]) {
    const xx = x + side * 1.1 * size;
    m.beam([x, 4.3 * size, z], [xx, 4.8 * size, z], 0.075 * size, c, "metal");
    m.cylinder([xx, 4.9 * size, z], 0.27 * size, 0.13 * size, c, "metal");
    m.add("box", [xx, 5.25 * size, z], [0.38 * size, 0.65 * size, 0.38 * size], "#f8e3ac", undefined, "glow");
    for (const dx of [-0.21, 0.21]) for (const dz of [-0.21, 0.21]) {
      m.box([xx + dx * size, 5.25 * size, z + dz * size], [0.04 * size, 0.69 * size, 0.04 * size], c, undefined, "metal");
    }
    m.cone([xx, 5.72 * size, z], 0.43 * size, 0.4 * size, c);
    m.sphere([xx, 6.0 * size, z], [0.07 * size, 0.13 * size, 0.07 * size], c, "metal");
  }
}

export function bench(m: Model, x: number, z: number, rotation = 0) {
  const point = (dx: number, y: number, dz: number): [number, number, number] => [
    x + dx * Math.cos(rotation) + dz * Math.sin(rotation), y,
    z - dx * Math.sin(rotation) + dz * Math.cos(rotation),
  ];
  const rot: [number, number, number] = [0, rotation, 0];
  for (const dx of [-1.1, 1.1]) {
    for (const dz of [-0.33, 0.33]) m.box(point(dx, 0.37, dz), [0.09, 0.74, 0.09], P.bronze, rot, "metal");
    m.box(point(dx, 0.8, -0.39), [0.09, 1.1, 0.09], P.bronze, rot, "metal");
    m.box(point(dx, 0.95, 0), [0.08, 0.08, 0.9], P.bronze, rot, "metal");
  }
  for (let i = 0; i < 5; i++) m.box(point(0, 0.65, -0.32 + i * 0.16), [3, 0.09, 0.12], i % 2 ? "#96704c" : "#ac825a", rot);
  for (let i = 0; i < 3; i++) m.box(point(0, 0.92 + i * 0.17, -0.4), [3, 0.12, 0.08], "#a17b55", rot);
}

export function personStatue(m: Model, x: number, y: number, z: number, scale = 1) {
  m.cone([x, y + scale * 0.9, z], scale * 0.46, scale * 1.8, P.bronze);
  m.sphere([x, y + scale * 1.8, z], [scale * 0.4, scale * 0.65, scale * 0.26], P.bronze, "metal");
  m.sphere([x, y + scale * 2.6, z], [scale * 0.28, scale * 0.34, scale * 0.27], P.bronze, "metal");
  m.beam([x - 0.3 * scale, y + 2 * scale, z], [x - 0.8 * scale, y + 1.4 * scale, z + 0.15], 0.2 * scale, P.bronze, "metal");
  m.beam([x + 0.3 * scale, y + 2 * scale, z], [x + 0.7 * scale, y + 2.2 * scale, z + 0.2], 0.2 * scale, P.bronze, "metal");
}
