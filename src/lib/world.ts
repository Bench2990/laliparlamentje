export type SceneId = "exterior" | "interior";
export type Position3 = [number, number, number];
export type Spawn = { position: Position3; yaw: number; pitch: number };

// Metres. +X = east, +Z = south. The Parliament's long axis runs north–south.
export const WALK = {
  eyeHeight: 1.7,
  speed: 9.2 * 1.5,
  animationSpeed: 3.3 * 1.5,
  radius: 0.38,
  acceleration: 11,
  mouseSensitivity: 0.0018,
  touchSensitivity: 0.0032,
  maxPitch: 1.32,
  interactionDistance: 2.85,
} as const;

export const DANUBE = {
  waterHeight: -2.45,
  waterEdgeX: -65,
  railingX: -62.8,
} as const;

export const INITIAL_SPAWN: Spawn = {
  position: [145, WALK.eyeHeight, 20],
  yaw: 1.56,
  pitch: 0.17,
};

export const DOORS = {
  exterior: { x: 42.3, z: 0 },
  interior: { x: 0, z: 10.1 },
} as const;

export const SPAWNS: Record<SceneId, Spawn> = {
  exterior: { position: [44.5, 3.14, 0], yaw: -Math.PI / 2, pitch: 0.02 },
  interior: { position: [0, WALK.eyeHeight, 6.5], yaw: 0, pitch: 0.08 },
};

export type CityBlock = {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  color: string;
  civic?: boolean;
};

export const CITY_BLOCKS: CityBlock[] = [
  { x: 188, z: -72, width: 33, depth: 94, height: 24, color: "#dbceb5", civic: true },
  { x: 188, z: 53, width: 33, depth: 98, height: 21, color: "#ded1b9", civic: true },
  { x: 125, z: -163, width: 68, depth: 26, height: 20, color: "#d2c5af" },
  { x: 49, z: -163, width: 66, depth: 26, height: 24, color: "#dcd0b8" },
  { x: -15, z: -169, width: 42, depth: 30, height: 19, color: "#c7b9a6" },
  { x: 132, z: 163, width: 63, depth: 28, height: 23, color: "#d4bd9f" },
  { x: 65, z: 166, width: 62, depth: 28, height: 20, color: "#d9ccba" },
  { x: -4, z: 170, width: 59, depth: 30, height: 22, color: "#c9c0ac" },
];

export const TREES: { x: number; z: number; size: number }[] = [
  ...[-122, -102, -82, -62, -42, 42, 62, 82, 102, 122].map((z, i) => ({
    x: 157,
    z,
    size: 0.87 + (i % 3) * 0.1,
  })),
  ...[-1, 1].flatMap((side) =>
    [61, 82, 103, 124, 145].map((x, i) => ({ x, z: side * 126, size: 0.9 + (i % 2) * 0.18 })),
  ),
  ...[-1, 1].flatMap((side) =>
    [66, 91].map((z, i) => ({ x: 125, z: side * z, size: 0.83 + (i % 2) * 0.13 })),
  ),
  ...[-134, 134].flatMap((z) => [-26, -4, 19].map((x) => ({ x, z, size: 0.9 }))),
];

export const BENCHES = [-1, 1].flatMap((side) =>
  [35, 61, 88, 111].map((z) => ({ x: 115, z: side * z, rotation: Math.PI / 2 })),
);

export const LAWNS = [-1, 1].flatMap((side) => [
  { x: 82, z: side * 62, width: 47, depth: 77 },
  { x: 137, z: side * 70, width: 28, depth: 80 },
]);

export function floorHeight(scene: SceneId, x: number, z: number): number {
  if (scene === "exterior") {
    if (Math.abs(z) < 9.1 && x >= 41.8 && x <= 55) {
      return Math.min(1.44, Math.max(0, ((55 - x) / 8) * 1.44));
    }
    return 0;
  }
  if (z <= -13) return 2.4;
  if (z < -5 && Math.abs(x) < 4.8) return ((-z - 5) / 8) * 2.4;
  return 0;
}

export function isNearDoor(scene: SceneId, x: number, z: number): boolean {
  const door = DOORS[scene];
  return Math.hypot(x - door.x, z - door.z) <= WALK.interactionDistance;
}

export function locationName(scene: SceneId, x: number, z: number): string {
  if (scene === "interior") {
    if (z < -36) return "Díszterem";
    if (z < -13) return "Aranyfolyosó";
    return "Díszlépcsőház";
  }
  if (x < -36) return "Duna-part";
  if (x < 57 && Math.abs(z) < 25) return "Az Országház főbejárata";
  if (Math.abs(z) > 116 && x < 42) return "Az Országház kertje";
  return "Kossuth Lajos tér";
}
