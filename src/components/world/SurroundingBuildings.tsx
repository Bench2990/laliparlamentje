"use client";

import { useMemo } from "react";
import { CITY_BLOCKS } from "@/lib/world";
import { Model, PALETTE as P, seeded } from "@/lib/model";
import StaticModel from "./StaticModel";

function cityModel() {
  const m = new Model();
  for (const b of CITY_BLOCKS) {
    m.box([b.x, b.height / 2, b.z], [b.width, b.height, b.depth], b.color);
    m.box([b.x, 1.3, b.z], [b.width + 0.7, 2.6, b.depth + 0.7], "#b5aa96");
    m.box([b.x, b.height - 0.8, b.z], [b.width + 1, 0.7, b.depth + 1], "#eddfc6");
    m.box([b.x, b.height + 0.1, b.z], [b.width + 1.5, 0.6, b.depth + 1.5], "#e5d7bd");
    m.add("roof", [b.x, b.height + 0.4, b.z], [b.depth + 1, 5, b.width + 1], "#68716b", [0, Math.PI / 2, 0]);
    const count = Math.floor(b.depth / 5.5);
    for (let i = 0; i < count; i++) {
      const z = b.z - b.depth / 2 + 3 + i * (b.depth - 6) / Math.max(1, count - 1);
      for (let floor = 0; floor < 3; floor++) {
        const y = 3 + floor * 6;
        const x = b.x - b.width / 2 - 0.06;
        if (floor === 0) m.window(x, y, z, 2.1, 3.6, -Math.PI / 2, false);
        else {
          m.box([x, y + 1.8, z], [0.15, 3.6, 2.2], "#46565a", undefined, "window");
          for (const side of [-1, 1]) m.box([x - 0.08, y + 1.8, z + side * 1.2], [0.2, 4, 0.2], "#e9dcc4");
          m.box([x - 0.08, y + 3.8, z], [0.3, 0.25, 2.7], "#e9dcc4");
          m.box([x - 0.08, y - 0.1, z], [0.5, 0.25, 2.8], "#e9dcc4");
          m.box([x - 0.12, y + 1.8, z], [0.08, 3.5, 0.12], "#b8ac93");
        }
      }
    }
    // Southern and northern elevations continue the street architecture.
    for (const side of [-1, 1]) for (let x = b.x - b.width / 2 + 4; x < b.x + b.width / 2 - 2; x += 5.5) {
      for (let floor = 0; floor < 3; floor++) m.window(x, 3 + floor * 6, b.z + side * (b.depth / 2 + 0.08), 2, 3.6, side === 1 ? 0 : Math.PI, false);
    }
    if (b.civic) {
      const face = b.x - b.width / 2 - 1;
      m.box([face, 12, b.z], [2, 24, 23], "#e4d5ba");
      m.box([face - 1.8, 3, b.z], [3.6, 6, 27], "#c5b69d");
      for (let i = -2; i <= 2; i++) {
        m.cylinder([face - 2.2, 12, b.z + i * 4.5], 0.63, 14, P.light);
        m.cylinder([face - 2.2, 19.1, b.z + i * 4.5], 0.9, 0.6, P.light);
      }
      m.box([face - 1.4, 20.3, b.z], [5.5, 1.8, 26], P.light);
      m.add("roof", [face - 1.4, 21.2, b.z], [5.7, 6.6, 27], P.light);
      m.box([face - 2, 0.45, b.z], [7, 0.9, 28], P.light);
    }
  }
  return m.parts;
}

export function BudaSkyline() {
  const parts = useMemo(() => {
    const m = new Model();
    const random = seeded(42);
    m.box([-542, -0.7, 0], [280, 2, 1800], "#a1ad8c", undefined, "matte");
    m.sphere([-560, 1, 170], [150, 43, 220], "#81957b", "matte");
    m.sphere([-660, 1, -230], [170, 55, 260], "#8e9f88", "matte");
    for (let i = 0; i < 45; i++) {
      const z = -660 + i * 29;
      const height = 9 + random() * 10;
      const color = ["#d5c7ae", "#d5cbb7", "#cbb8a1", "#dbc5a5"][i % 4];
      m.box([-423 - random() * 8, height / 2, z], [17, height, 25], color);
      m.add("roof", [-424, height, z], [26, 4.3, 20], i % 3 ? "#927468" : "#78847a", [0, Math.PI / 2, 0]);
      for (let k = -1; k <= 1; k++) for (const y of [4, 9]) m.box([-413.8, y, z + k * 7], [0.15, 2.2, 1.5], "#788279", undefined, "window");
    }
    // Twin Baroque towers of Saint Anne's Church opposite the Parliament.
    m.box([-435, 10, -9], [25, 20, 30], "#d9bd85");
    m.add("roof", [-435, 20, -9], [28, 9, 30], "#865f51");
    for (const z of [-21, 3]) {
      m.box([-419, 15, z], [7, 30, 7], "#e7d2a5");
      m.cylinder([-419, 31, z], 4.2, 2, "#e2cdaa");
      m.sphere([-419, 35, z], [3.7, 5.1, 3.7], "#6d827a");
      m.cone([-419, 40.7, z], 1.6, 5.8, "#6d827a");
      m.cylinder([-419, 44, z], 0.13, 2.6, P.gold);
    }
    // A light, distant Matthias Church / Fisherman's Bastion silhouette on the hill.
    m.box([-520, 42, 110], [22, 24, 47], "#e4d7bf");
    m.add("roof", [-520, 54, 110], [48, 13, 24], "#b08a63", [0, Math.PI / 2, 0]);
    m.box([-504, 52, 131], [7.5, 43, 7.5], "#e6dac4");
    m.cone([-504, 83, 131], 4.6, 23, "#a4a398");
    for (let i = 0; i < 6; i++) {
      const z = 74 + i * 13;
      m.cylinder([-485, 33, z], 3.7, 8, "#e0d5bd");
      m.cone([-485, 39.5, z], 4.2, 6.2, "#ccc8b7");
    }
    m.box([-485, 30, 108], [4, 4, 80], "#d3c7ae");
    // Buda Castle, further south, with a muted copper dome.
    m.box([-535, 33, 355], [54, 24, 122], "#cbbb9c");
    m.add("roof", [-535, 45, 355], [123, 8, 57], "#7b8778", [0, Math.PI / 2, 0]);
    m.cylinder([-524, 52, 355], 10, 12, "#bfae8c");
    m.sphere([-524, 61, 355], [11, 12, 11], "#758e82");
    m.cone([-524, 74, 355], 2.3, 7, "#758e82");
    return m.parts;
  }, []);
  return <StaticModel parts={parts} shadows={false} />;
}

export default function SurroundingBuildings() {
  const parts = useMemo(cityModel, []);
  return <><StaticModel parts={parts} /><BudaSkyline /></>;
}
