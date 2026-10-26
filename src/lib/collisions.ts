import { BENCHES, CITY_BLOCKS, TREES, WALK, type SceneId } from "./world";

export type BoxCollider = { kind: "box"; minX: number; maxX: number; minZ: number; maxZ: number };
export type CircleCollider = { kind: "circle"; x: number; z: number; radius: number };
export type Collider = BoxCollider | CircleCollider;

const box = (minX: number, maxX: number, minZ: number, maxZ: number): BoxCollider => ({
  kind: "box", minX, maxX, minZ, maxZ,
});

export const EXTERIOR_COLLIDERS: Collider[] = [
  box(-29, 29, -112, 112),
  box(29, 41.8, -14, 14),
  box(-34.5, -29, -16.5, 16.5),
  // Projecting end pavilions and their buttresses.
  ...[-1, 1].flatMap((sign) => {
    const z = sign * 78;
    return [box(27, 34, z - 16, z + 16), box(-35, -27, z - 16, z + 16)];
  }),
  ...CITY_BLOCKS.map((b) => box(b.x - b.width / 2, b.x + b.width / 2, b.z - b.depth / 2, b.z + b.depth / 2)),
  ...CITY_BLOCKS.filter((b) => b.civic).map((b) => box(b.x - b.width / 2 - 6.8, b.x - b.width / 2 + 1, b.z - 14, b.z + 14)),
  ...TREES.map((t): CircleCollider => ({ kind: "circle", x: t.x, z: t.z, radius: 0.48 * t.size })),
  ...BENCHES.map((b) => box(b.x - 0.6, b.x + 0.6, b.z - 1.65, b.z + 1.65)),
  ...[-113, -57, -1, 55, 111].map((z) => box(-58.9, -57.7, z - 1.65, z + 1.65)),
  ...[-1, 1].flatMap((side) => [28, 58, 91, 119].map((z): CircleCollider => ({ kind: "circle", x: 53, z: side * z, radius: 0.2 }))),
  ...[-1, 1].flatMap((side) => [24, 54, 88, 119].map((z): CircleCollider => ({ kind: "circle", x: 118.5, z: side * z, radius: 0.2 }))),
  box(91, 101, 72, 80),
  box(88.5, 106.5, -102, -93),
  { kind: "circle", x: 97, z: -21, radius: 1.5 },
  // Stone balustrades on either side of the entrance staircase.
  box(43, 54.5, -10.2, -9.1),
  box(43, 54.5, 9.1, 10.2),
  box(50.2, 53.8, -11.1, -9),
  box(50.2, 53.8, 9, 11.1),
];

export const INTERIOR_COLLIDERS: Collider[] = [
  ...[-1, 1].flatMap((side) => [-8, -1, 6].map((z): CircleCollider => ({
    kind: "circle", x: side * 10.5, z, radius: 0.8,
  }))),
  ...[-1, 1].flatMap((side) => [-17, -23, -29, -35].map((z): CircleCollider => ({
    kind: "circle", x: side * 4.2, z, radius: 0.46,
  }))),
  ...[-1, 1].flatMap((side) => [-42, -50, -58, -66].map((z): CircleCollider => ({
    kind: "circle", x: side * 15.8, z, radius: 0.72,
  }))),
  box(-5.15, -4.25, -12.8, -5.2),
  box(4.25, 5.15, -12.8, -5.2),
  box(-6, 6, -72.5, -67.1),
];

// Match the semicircular seating banks to the geometry in MainChamber.
for (let row = 0; row < 3; row++) {
  const radius = 7.4 + row * 3.15;
  const count = 12 + row * 4;
  for (let i = 0; i < count; i++) {
    const angle = 0.18 + (i / (count - 1)) * (Math.PI - 0.36);
    const x = Math.cos(angle) * radius;
    if (Math.abs(x) < 2.8) continue;
    INTERIOR_COLLIDERS.push({ kind: "circle", x, z: -64 + Math.sin(angle) * radius, radius: 0.72 });
  }
}

function insideInterior(x: number, z: number): boolean {
  return (
    (x >= -13.5 && x <= 13.5 && z >= -13 && z <= 10.5) ||
    (x >= -4.85 && x <= 4.85 && z >= -36.2 && z <= -12.8) ||
    (x >= -17.5 && x <= 17.5 && z >= -73 && z <= -36)
  );
}

export function canOccupy(scene: SceneId, x: number, z: number, radius: number = WALK.radius): boolean {
  if (scene === "exterior") {
    if (x < -62 + radius || x > 171 - radius || z < -147 + radius || z > 147 - radius) return false;
  } else {
    // Test the footprint against the union of rooms, not separately shrunken rooms:
    // this keeps shared doorways traversable without opening holes at their corners.
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      if (!insideInterior(x + Math.cos(angle) * radius, z + Math.sin(angle) * radius)) return false;
    }
  }
  const colliders = scene === "exterior" ? EXTERIOR_COLLIDERS : INTERIOR_COLLIDERS;
  for (const c of colliders) {
    if (c.kind === "circle") {
      if ((x - c.x) ** 2 + (z - c.z) ** 2 < (radius + c.radius) ** 2) return false;
    } else {
      const nearestX = Math.max(c.minX, Math.min(x, c.maxX));
      const nearestZ = Math.max(c.minZ, Math.min(z, c.maxZ));
      if ((x - nearestX) ** 2 + (z - nearestZ) ** 2 < radius ** 2) return false;
    }
  }
  return true;
}

export function moveWithCollisions(scene: SceneId, x: number, z: number, dx: number, dz: number) {
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.18));
  for (let i = 0; i < steps; i++) {
    if (canOccupy(scene, x + dx / steps, z)) x += dx / steps;
    if (canOccupy(scene, x, z + dz / steps)) z += dz / steps;
  }
  return { x, z };
}
