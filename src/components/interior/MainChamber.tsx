"use client";

import { useMemo } from "react";
import { Model } from "@/lib/model";
import { I, archway, carpet, chandelier, column, floorTiles, wallSconce } from "@/lib/interior-details";
import StaticModel from "@/components/world/StaticModel";

function buildChamber() {
  const m = new Model();
  const floor = 2.4;
  floorTiles(m, -18, 18, -74, -36, floor);
  carpet(m, 0, -52, 3.5, 32, floor);
  for (const side of [-1, 1]) {
    m.box([side * 18, 12.7, -55], [0.8, 20.6, 38], I.cream);
    m.box([side * 17.5, 5.2, -55], [0.2, 5.6, 38], I.red);
    for (const y of [2.8, 7.9, 17.6, 21.8]) m.box([side * 17.35, y, -55], [0.3, 0.22, 38], I.gold);
    for (const z of [-42, -50, -58, -66]) {
      column(m, side * 15.8, z, floor, 14.8, 0.6);
      const angle = side === -1 ? Math.PI / 2 : -Math.PI / 2;
      m.add("arch", [side * 17.45, 9, z], [4.4, 10, 1], "#997353", [0, angle, 0]);
      m.add("archFrame", [side * 17.3, 9, z], [4.4, 10, 1], I.gold, [0, angle, 0]);
      m.box([side * 17.28, 13.3, z], [0.12, 7.5, 0.18], I.gold);
      m.box([side * 17.25, 13.4, z], [0.13, 0.2, 3.7], I.gold);
      wallSconce(m, side * 17.2, 7, z + 3, -side);
      m.add("shield", [side * 17.25, 5.5, z], [1.5, 1.7, 0.8], I.gold, [0, angle, 0]);
    }
    m.box([side * 11.6, 12.7, -36], [13.2, 20.6, 0.6], I.cream);
    m.box([side * 11.6, 5.2, -36.35], [13.2, 5.6, 0.12], I.red);
  }
  archway(m, -36.3, floor, 9.4, 13.7);
  m.box([0, 21, -36], [10.2, 4, 0.6], I.cream);
  m.box([0, 12.7, -73.5], [36.5, 20.6, 0.7], I.red);
  for (const x of [-15.8, -10.5, -5.3, 5.3, 10.5, 15.8]) {
    column(m, x, -72.8, floor, 16.2, 0.46);
    m.add("archFrame", [x, 8.8, -72.95], [3.3, 9.4, 0.7], I.gold);
  }
  for (const y of [3, 7.8, 18.9, 21.9]) m.box([0, y, -73], [35.4, 0.25, 0.4], I.gold);

  // Three semicircular banks leave a clear central aisle and side circulation.
  for (let row = 0; row < 3; row++) {
    const radius = 7.4 + row * 3.15;
    const count = 12 + row * 4;
    for (let i = 0; i < count; i++) {
      const angle = 0.18 + i / (count - 1) * (Math.PI - 0.36);
      const x = Math.cos(angle) * radius;
      if (Math.abs(x) < 2.8) continue;
      const z = -64 + Math.sin(angle) * radius;
      const yaw = Math.PI / 2 - angle;
      const rot: [number, number, number] = [0, yaw, 0];
      const point = (dx: number, y: number, dz: number): [number, number, number] => [x + dx * Math.cos(yaw) + dz * Math.sin(yaw), y, z - dx * Math.sin(yaw) + dz * Math.cos(yaw)];
      m.box(point(0, floor + 0.58, 0), [1.15, 0.18, 1.05], I.red, rot);
      m.box(point(0, floor + 1.14, 0.46), [1.17, 1.1, 0.18], I.wood, rot);
      m.box(point(0, floor + 1.15, 0.35), [0.94, 0.8, 0.08], I.red, rot);
      for (const side of [-1, 1]) m.box(point(side * 0.48, floor + 0.3, 0), [0.12, 0.6, 0.8], I.wood, rot);
      m.box(point(0, floor + 0.95, -0.68), [1.45, 0.12, 0.55], "#79573e", rot);
      m.box(point(0, floor + 1.01, -0.94), [1.45, 0.05, 0.06], I.gold, rot, "metal");
      m.box(point(0, floor + 0.5, -0.68), [1.2, 0.8, 0.15], I.wood, rot);
    }
  }
  // Speaker's dais and gilded ceremonial backdrop.
  for (let i = 0; i < 3; i++) m.box([0, floor + (i + 1) * 0.13, -68.3 - i * 0.55], [12 - i * 0.6, (i + 1) * 0.26, 4 - i * 0.7], "#b09b78");
  m.box([0, floor + 1.3, -70], [5.8, 1.45, 1.9], I.wood);
  m.box([0, floor + 2.12, -70], [6.2, 0.19, 2.2], "#977344");
  for (const x of [-2.2, 0, 2.2]) m.add("shield", [x, floor + 1.32, -68.98], [0.72, 0.74, 0.5], I.gold);
  m.box([0, 12.4, -72.95], [8.5, 13, 0.2], "#9d4b40");
  m.add("archFrame", [0, 5.9, -72.7], [8.3, 13.1, 1], I.gold);
  m.add("shield", [0, 13.5, -72.45], [3.4, 4, 1], I.gold);
  m.add("shield", [0, 13.5, -72.27], [2.9, 3.4, 1], I.red);
  m.box([0.58, 13.75, -72.05], [0.16, 2.35, 0.15], I.light);
  for (const y of [13.7, 14.35]) m.box([0.58, y, -72.04], [1.05, 0.15, 0.15], I.light);
  for (const y of [12.7, 13.3, 13.9, 14.5]) m.box([-0.65, y, -72.04], [1, 0.22, 0.15], I.light);
  m.cylinder([0, 16.2, -72.1], 1.2, 0.25, I.gold);
  for (const x of [-0.8, -0.4, 0, 0.4, 0.8]) m.sphere([x, 16.5, -72.1], [0.13, 0.25, 0.13], I.gold, "metal");

  m.box([0, 23.5, -55], [36, 0.6, 38], "#b7986a");
  for (const x of [-13.5, -6.75, 0, 6.75, 13.5]) for (const z of [-40, -47.5, -55, -62.5, -70]) {
    m.box([x, 23.12, z], [6.3, 0.15, 7.05], "#cdb48a");
    m.box([x, 23.01, z], [5.7, 0.1, 6.45], "#dbc296");
  }
  for (const z of [-43, -55, -67]) m.add("archFrame", [0, 14, z], [31.2, 8.8, 1.8], I.gold);
  chandelier(m, 0, 22.7, -54, 3.5);
  for (const x of [-9, 9]) chandelier(m, x, 21, -62, 1.6);
  return m.parts;
}

export default function MainChamber() {
  const parts = useMemo(buildChamber, []);
  return <StaticModel parts={parts} />;
}
