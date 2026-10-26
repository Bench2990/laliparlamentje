import { Model, PALETTE as P } from "./model";

export const I = {
  cream: "#e0c99f",
  light: "#f1dfba",
  gold: "#c4a265",
  goldDark: "#977544",
  red: "#823b38",
  wood: "#60463a",
  carpet: "#963d3a",
};

export function column(m: Model, x: number, z: number, floor: number, height: number, radius = 0.53) {
  m.box([x, floor + 0.2, z], [radius * 2.8, 0.4, radius * 2.8], I.light);
  m.cylinder([x, floor + 0.6, z], radius * 1.35, 0.5, I.gold);
  m.cylinder([x, floor + height / 2, z], radius, height - 1.15, "#955b4b");
  for (const y of [1, height * 0.46, height - 1]) m.cylinder([x, floor + y, z], radius * 1.12, 0.18, I.gold, "metal");
  m.cylinder([x, floor + height - 0.55, z], radius * 1.45, 0.45, I.gold);
  m.box([x, floor + height - 0.15, z], [radius * 3.2, 0.35, radius * 3.2], I.light);
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2;
    m.sphere([x + Math.sin(a) * radius * 1.15, floor + height - 0.65, z + Math.cos(a) * radius * 1.15], [radius * 0.35, radius * 0.55, radius * 0.35], I.gold, "metal");
  }
}

export function floorTiles(m: Model, minX: number, maxX: number, minZ: number, maxZ: number, floor: number, size = 2) {
  let row = 0;
  for (let z = minZ + size / 2; z < maxZ; z += size, row++) {
    let col = 0;
    for (let x = minX + size / 2; x < maxX; x += size, col++) {
      m.box([x, floor - 0.035, z], [size - 0.035, 0.06, size - 0.035], (row + col) % 2 ? "#d6c7ac" : "#9b9787", undefined, "matte");
    }
  }
}

export function archway(m: Model, z: number, floor: number, width: number, height: number) {
  m.add("archFrame", [0, floor, z], [width, height, 2.5], I.gold);
  m.add("archFrame", [0, floor, z - 0.35], [width * 0.98, height * 0.99, 1.6], I.light, [0, Math.PI, 0]);
}

export function chandelier(m: Model, x: number, top: number, z: number, radius = 2) {
  m.cylinder([x, top - 1.7, z], 0.075, 3.4, I.gold, "metal");
  m.sphere([x, top - 3.5, z], [0.3, 0.5, 0.3], I.gold, "metal");
  m.add("torus", [x, top - 3.9, z], [radius, radius, 0.6], I.gold, [Math.PI / 2, 0, 0], "metal");
  m.add("torus", [x, top - 4.15, z], [radius * 0.7, radius * 0.7, 0.45], I.gold, [Math.PI / 2, 0, 0], "metal");
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2;
    const xx = x + Math.sin(a) * radius;
    const zz = z + Math.cos(a) * radius;
    m.beam([x, top - 3.1, z], [xx, top - 3.85, zz], 0.05, I.gold, "metal");
    m.cylinder([xx, top - 3.6, zz], 0.09, 0.65, "#efdeb6");
    m.sphere([xx, top - 3.15, zz], [0.13, 0.22, 0.13], "#fff0b3", "glow");
    m.sphere([xx, top - 4.3, zz], [0.09, 0.22, 0.09], "#e7d5ad", "metal");
  }
}

export function wallSconce(m: Model, x: number, y: number, z: number, side: number) {
  m.box([x, y, z], [0.12, 0.8, 0.35], I.gold, undefined, "metal");
  m.beam([x, y - 0.3, z], [x + side * 0.7, y, z], 0.08, I.gold, "metal");
  for (const dz of [-0.25, 0.25]) {
    m.cylinder([x + side * 0.7, y + 0.3, z + dz], 0.08, 0.6, I.light);
    m.sphere([x + side * 0.7, y + 0.72, z + dz], [0.14, 0.22, 0.14], "#fff0c3", "glow");
  }
}

export function carpet(m: Model, x: number, z: number, width: number, depth: number, y: number) {
  m.box([x, y + 0.013, z], [width, 0.025, depth], I.carpet, undefined, "matte");
  for (const side of [-1, 1]) m.box([x + side * (width / 2 - 0.13), y + 0.03, z], [0.07, 0.014, depth], P.gold, undefined, "matte");
}
