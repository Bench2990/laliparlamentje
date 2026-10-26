"use client";

import { useMemo } from "react";
import { Model, PALETTE as P } from "@/lib/model";
import StaticModel from "./StaticModel";

function pinnacle(m: Model, x: number, z: number, base: number, size = 1) {
  m.box([x, base + 0.4 * size, z], [1.4 * size, 0.8 * size, 1.4 * size], P.light);
  m.cylinder([x, base + 2.2 * size, z], 0.48 * size, 3.1 * size, P.stone);
  m.cylinder([x, base + 3.7 * size, z], 0.71 * size, 0.35 * size, P.light);
  m.cone([x, base + 5.4 * size, z], 0.74 * size, 3.2 * size, P.darkRoof);
  m.sphere([x, base + 7.1 * size, z], [0.17 * size, 0.25 * size, 0.17 * size], P.gold, "metal");
  m.cone([x, base + 7.7 * size, z], 0.13 * size, 1.1 * size, P.light);
}

function tower(m: Model, x: number, z: number, base: number, size = 1) {
  m.cylinder([x, base + 3.6 * size, z], 1.18 * size, 7.2 * size, P.stone);
  m.cylinder([x, base + 6.5 * size, z], 1.48 * size, 0.55 * size, P.light);
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2;
    m.window(x + Math.sin(a) * 1.2 * size, base + 2.5 * size, z + Math.cos(a) * 1.2 * size, 0.65 * size, 3.2 * size, a, false);
  }
  m.cone([x, base + 11 * size, z], 1.7 * size, 8.8 * size, P.darkRoof);
  m.cylinder([x, base + 15.8 * size, z], 0.09 * size, 1.6 * size, P.light);
  m.sphere([x, base + 15.9 * size, z], [0.22 * size, 0.22 * size, 0.22 * size], P.gold, "metal");
}

function cornices(m: Model, x: number, width: number, depth: number, top: number) {
  for (const [y, h, overhang] of [[1.1, 0.8, 0.4], [8.5, 0.4, 0.4], [top - 1, 0.4, 0.8], [top, 0.65, 1.3]]) {
    m.box([x, y, 0], [width + overhang, h, depth + overhang], y < 2 ? P.base : P.light);
  }
}

function pavilion(m: Model, x: number) {
  m.box([x, 13.5, 0], [29, 26, 64], P.stone);
  cornices(m, x, 29, 64, 27);
  m.add("roof", [x, 27, 0], [31, 11, 66], P.roof);
  for (const side of [-1, 1]) {
    const angle = side === 1 ? 0 : Math.PI;
    const z = side * 32.15;
    for (let i = -2; i <= 2; i++) {
      const xx = x + i * 4.9;
      m.window(xx, 2.2, z, 2.5, 5.1, angle);
      m.window(xx, 11, z, 2.8, 9.5, angle);
      if (i % 2 === 0) {
        m.box([xx, 26.3, z], [3.9, 1, 1.8], P.light);
        m.add("roof", [xx, 26.8, z], [1.8, 5.5, 3.9], P.light, [0, Math.PI / 2, 0]);
        m.window(xx, 26.9, z + side * 0.95, 1.2, 3.1, angle, false);
      }
    }
    for (const xx of [x - 14.8, x + 14.8]) {
      m.box([xx, 13.7, z], [1.05, 27.4, 2.1], P.light);
      tower(m, xx, z, 26.8, 1.02);
    }
  }
  // Ridge ornaments are visible from both the square and the river.
  for (const xx of [x - 10, x, x + 10]) pinnacle(m, xx, 0, 37.5, 0.6);
}

function dome(m: Model) {
  m.box([0, 16, 0], [36, 31, 56], P.stone);
  m.cylinder([0, 32.5, 0], 15, 2.5, P.light);
  m.cylinder([0, 39, 0], 12.65, 13, P.stone);
  for (const [y, r, h] of [[33.8, 13.2, 0.6], [35, 13.0, 0.4], [45.2, 13.3, 0.7], [46, 13.1, 0.7]]) {
    m.cylinder([0, y, 0], r, h, P.light);
  }
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2;
    m.window(Math.sin(a) * 12.7, 35.8, Math.cos(a) * 12.7, 1.85, 7.3, a);
    const b = a + Math.PI / 16;
    const x = Math.sin(b) * 12.8;
    const z = Math.cos(b) * 12.8;
    m.cylinder([x, 40.2, z], 0.31, 10, P.light);
    pinnacle(m, Math.sin(b) * 14.1, Math.cos(b) * 14.1, 31.5, 0.75);
  }
  m.add("dome", [0, 46.3, 0], [1, 1, 1], "#925449");
  const profile = [[12.05, 0.75], [12.2, 2.5], [11.5, 6], [10.2, 10], [8.2, 14], [6, 18], [3.6, 21.5], [2.6, 23]];
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2;
    for (let j = 0; j < profile.length - 1; j++) {
      const [r1, y1] = profile[j];
      const [r2, y2] = profile[j + 1];
      m.beam(
        [Math.sin(a) * r1, 46.3 + y1, Math.cos(a) * r1],
        [Math.sin(a) * r2, 46.3 + y2, Math.cos(a) * r2],
        i % 2 === 0 ? 0.19 : 0.095, i % 2 === 0 ? "#dbc19b" : "#643d36",
      );
    }
  }
  m.cylinder([0, 69.6, 0], 2.8, 0.7, P.light);
  m.cylinder([0, 71.9, 0], 1.65, 4.2, P.stone);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    m.window(Math.sin(a) * 1.67, 70.5, Math.cos(a) * 1.67, 0.55, 2.7, a, false);
  }
  m.cylinder([0, 74.2, 0], 2.1, 0.5, P.light);
  m.cone([0, 76.1, 0], 2.2, 3.4, P.darkRoof);
  m.sphere([0, 78.1, 0], [0.5, 0.6, 0.5], P.gold, "metal");
  m.cylinder([0, 79.4, 0], 0.12, 2.4, P.gold, "metal");
  m.box([0, 79.6, 0], [1.5, 0.15, 0.15], P.gold);
}

function entrance(m: Model) {
  m.box([0, 13.6, 34], [28, 24.3, 16], P.stone);
  m.box([0, 1.1, 35.5], [30, 0.7, 19], P.base);
  m.box([0, 14, 34.3], [28.8, 0.65, 17], P.light);
  m.box([0, 25.8, 34], [29.5, 0.8, 17.5], P.light);
  m.add("roof", [0, 26.3, 34], [19, 12, 29], P.light, [0, Math.PI / 2, 0]);
  m.add("roof", [0, 26.8, 32.6], [19, 10.3, 25.5], P.roof, [0, Math.PI / 2, 0]);
  m.add("arch", [0, 1.45, 42.12], [5.6, 10.2, 1], "#473d31", undefined, "window");
  m.add("archFrame", [0, 1.45, 42.22], [5.6, 10.2, 1], P.light);
  m.add("archFrame", [0, 1.52, 42.05], [6.8, 11.4, 1], P.trim);
  // Carved double door with bronze studs; the only active portal in the world.
  m.box([0, 5, 42.28], [0.1, 7.1, 0.1], P.gold, undefined, "metal");
  for (const side of [-1, 1]) {
    for (const y of [3.3, 6.8]) {
      m.box([side * 1.35, y, 42.23], [2.05, 2.3, 0.12], "#61533e");
      m.box([side * 1.35, y, 42.32], [1.72, 1.98, 0.07], "#514632");
    }
    m.sphere([side * 0.32, 4.8, 42.4], [0.1, 0.2, 0.1], P.gold, "metal");
    m.window(side * 8.5, 2.1, 42.18, 2.8, 8.2);
    m.window(side * 8.5, 15.4, 42.18, 2.7, 7.7);
    m.box([side * 4.3, 7.9, 42.6], [0.58, 12.7, 1.05], P.light);
    m.box([side * 13.6, 13.6, 42.1], [1.1, 24.3, 1.6], P.light);
    tower(m, side * 14, 42, 25.8, 1.03);
    pinnacle(m, side * 13.6, 25.7, 26, 1);
  }
  m.box([0, 14.4, 43], [10.2, 0.6, 2.8], P.light);
  for (let i = -5; i <= 5; i++) m.cylinder([i * 0.87, 15.3, 44], 0.13, 1.6, P.light);
  m.box([0, 16.15, 44], [10.2, 0.2, 0.4], P.light);
  m.window(0, 17, 42.2, 4.5, 7.1);
  m.sphere([0, 29.7, 43.6], [2.35, 2.35, 0.16], "#3a4946", "window");
  m.add("torus", [0, 29.7, 43.8], [2.25, 2.25, 1], P.trim);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    m.beam([0, 29.7, 43.88], [Math.sin(a) * 2.18, 29.7 + Math.cos(a) * 2.18, 43.88], 0.15, P.light);
  }
  for (const side of [-1, 1]) {
    m.window(side * 6.5, 26.8, 43.64, 1.25, 4.4, 0, false);
    m.beam([side * 14.25, 26.4, 43.62], [0, 38.2, 43.62], 0.34, P.trim);
    m.beam([side * 12.5, 26.6, 43.68], [0, 36.9, 43.68], 0.13, P.light);
  }
  m.box([0, 26.55, 43.65], [28.5, 0.25, 0.35], P.trim);
  m.cone([0, 39.5, 42.2], 0.4, 3.1, P.light);
  m.box([0, 40.9, 42.2], [1.65, 0.18, 0.18], P.light);

  // Nine shallow, walkable steps. Floor alignment uses the same 8 m ramp.
  m.box([0, 0.72, 44.5], [18, 1.44, 5], P.light);
  for (let i = 0; i < 8; i++) {
    const height = (8 - i) * 0.18;
    m.box([0, height / 2, 47.5 + i], [18, height, 1.03], i % 2 ? "#ddd1b9" : "#e5d9c1");
  }
  for (const side of [-1, 1]) {
    m.box([side * 9.65, 0.85, 48.5], [1.1, 1.7, 11], P.stone);
    m.box([side * 9.65, 1.8, 48.5], [1.35, 0.25, 11.5], P.light);
    // Stylized stone guardian lions on plinths.
    m.box([side * 10, 1.4, 52], [2, 2.8, 3.5], P.base);
    m.sphere([side * 10, 3.7, 52], [0.75, 1.1, 1.4], P.stone);
    m.sphere([side * 10, 4.9, 53], [0.82, 0.9, 0.8], P.trim);
    m.sphere([side * 10, 5, 53.6], [0.55, 0.56, 0.48], P.light);
    for (const leg of [-1, 1]) m.box([side * 10 + leg * 0.45, 3.2, 53], [0.38, 1.1, 0.58], P.light);
  }
}

function buildParliament() {
  const m = new Model();
  m.box([0, 0.45, 0], [224, 0.9, 59], P.base);
  m.box([0, 12.2, 0], [220, 23.5, 54], P.stone);
  cornices(m, 0, 221, 54.5, 24.1);
  m.add("roof", [0, 24.4, 0], [221.5, 9.3, 57.5], P.roof);

  for (const side of [-1, 1]) {
    const angle = side === 1 ? 0 : Math.PI;
    for (let i = 0; i <= 50; i++) {
      const x = -105 + i * 4.2;
      if (Math.abs(x) < 16) continue;
      m.window(x, 2.1, side * 27.1, 2.1, 5.4, angle);
      m.window(x, 11, side * 27.1, 2.35, 8.5, angle);
      if (i % 2 === 0) {
        m.box([x, 25, side * 27.7], [3.3, 0.7, 1.6], P.light);
        m.add("roof", [x, 25.3, side * 27.9], [1.7, 4.8, 3.5], P.light, [0, Math.PI / 2, 0]);
        m.window(x, 25.6, side * 28.85, 1.0, 2.75, angle, false);
      }
    }
    for (let i = 0; i <= 26; i++) {
      const x = -109.2 + i * 8.4;
      if (Math.abs(x) < 16) continue;
      m.box([x, 12.5, side * 27.7], [0.7, 24, 1.5], P.light);
      m.box([x, 2.2, side * 28.2], [1.25, 3.2, 2.3], P.trim);
      m.box([x, 9.6, side * 28.1], [0.95, 0.4, 2.05], P.light);
      pinnacle(m, x, side * 27.8, 24.5, 0.8);
      // Narrow stone lancet niches beneath the parapet.
      m.add("arch", [x, 15.4, side * 28.52], [0.38, 2.6, 1], "#aa977a", [0, angle, 0]);
    }
    for (let x = -101; x <= 101; x += 8.4) {
      if (Math.abs(x) < 18) continue;
      m.box([x, 22.2, side * 27.4], [1.2, 1.8, 0.7], P.light);
      m.cone([x, 23.6, side * 27.4], 0.68, 1.3, P.light);
    }
  }
  pavilion(m, -78);
  pavilion(m, 78);

  // End elevations have real depth, windows, gables, and their own roofline.
  for (const side of [-1, 1]) {
    const x = side * 110.1;
    for (let z = -21; z <= 21; z += 6) {
      const angle = side * Math.PI / 2;
      m.window(x, 2.1, z, 2.4, 5.4, angle);
      m.window(x, 11, z, 2.7, 8.2, angle);
      m.box([x, 12, z + 3], [1.2, 23, 0.65], P.light);
    }
    for (const z of [-26, 26]) tower(m, side * 110, z, 23.8, 0.93);
    pinnacle(m, side * 110, 0, 33.7, 0.9);
  }

  dome(m);
  entrance(m);
  // River-facing central bay, which is deliberately distinct from the east portal.
  m.box([0, 14, -29.5], [29, 26.5, 6], P.stone);
  for (let x = -10; x <= 10; x += 5) {
    m.window(x, 3, -32.6, 2.8, 7.2, Math.PI);
    m.window(x, 13.8, -32.6, 3, 9.3, Math.PI);
  }
  m.box([0, 27.5, -30], [31, 0.7, 8], P.light);
  for (const x of [-15, 15]) tower(m, x, -32.2, 27.7, 1.02);
  return m.parts;
}

export default function Parliament() {
  const parts = useMemo(buildParliament, []);
  return <group rotation={[0, Math.PI / 2, 0]}><StaticModel parts={parts} /></group>;
}
