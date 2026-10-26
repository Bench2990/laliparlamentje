"use client";

import { useMemo } from "react";
import { Model } from "@/lib/model";
import { I, archway, carpet, chandelier, column, floorTiles, wallSconce } from "@/lib/interior-details";
import StaticModel from "@/components/world/StaticModel";

function buildHall() {
  const m = new Model();
  floorTiles(m, -14, 14, -13, 11, 0);
  carpet(m, 0, 2.8, 3.5, 15.4, 0);
  for (const side of [-1, 1]) {
    m.box([side * 14, 8.2, -1], [0.8, 16.4, 24.8], I.cream);
    m.box([side * 13.55, 1.6, -1], [0.16, 3.2, 24], I.red);
    for (const y of [0.3, 3.2, 13.1, 15.8]) m.box([side * 13.4, y, -1], [0.3, 0.22, 24], I.gold);
    for (const z of [-8, -1, 6]) {
      column(m, side * 10.5, z, 0, 12.7, 0.66);
      const angle = side === -1 ? Math.PI / 2 : -Math.PI / 2;
      m.add("arch", [side * 13.5, 4, z], [4, 8.8, 1], "#694b40", [0, angle, 0], "window");
      m.add("archFrame", [side * 13.4, 4, z], [4, 8.8, 1], I.gold, [0, angle, 0]);
      for (let i = -1; i <= 1; i++) {
        m.box([side * 13.36, 7.5, z + i * 0.95], [0.1, 6.5, 0.45], i % 2 === 0 ? "#c2ad78" : "#967d64", undefined, "glow");
      }
      wallSconce(m, side * 13.3, 4.5, z + 2.8, -side);
    }
    // Back walls flank the open stairway into the corridor.
    m.box([side * 9.7, 8.3, -13.2], [9.4, 16.6, 0.6], I.cream);
    m.box([side * 9.7, 2.6, -12.84], [9.1, 5.2, 0.12], I.red);
    m.add("archFrame", [side * 9.6, 5.6, -12.78], [4.3, 7.4, 1], I.gold);
    m.add("shield", [side * 9.6, 9, -12.5], [1.5, 1.8, 0.7], I.gold);
    m.box([side * 8.4, 8.3, 10.9], [11.2, 16.6, 0.6], I.cream);
  }
  m.box([0, 12.6, 10.9], [6.2, 8, 0.6], I.cream);
  m.add("arch", [0, 0, 10.56], [5.3, 8.9, 1], I.wood, [0, Math.PI, 0]);
  m.add("archFrame", [0, 0, 10.48], [5.3, 8.9, 1], I.gold, [0, Math.PI, 0]);
  for (const side of [-1, 1]) {
    m.box([side * 1.3, 3.3, 10.42], [2.2, 5.6, 0.1], "#705342");
    m.box([side * 1.3, 3.3, 10.34], [1.8, 5.1, 0.06], "#5b4438");
    m.sphere([side * 0.3, 2.8, 10.18], [0.08, 0.16, 0.08], I.gold, "metal");
  }
  m.box([0, 3.7, 10.3], [0.08, 7.4, 0.1], I.gold);
  // Broad ceremonial staircase, with a continuous red runner.
  for (let i = 0; i < 16; i++) {
    const h = (i + 1) * 0.15;
    const z = -5.25 - i * 0.5;
    m.box([0, h / 2, z], [8.5, h, 0.51], i % 2 ? "#dfcfaf" : "#e9d9ba");
    carpet(m, 0, z, 3.5, 0.51, h);
    m.box([0, h + 0.045, z + 0.23], [3.7, 0.035, 0.045], I.gold, undefined, "metal");
  }
  for (const side of [-1, 1]) {
    for (let i = 0; i <= 8; i++) {
      const z = -5.1 - i * 0.95;
      const floor = Math.max(0, (-z - 5) / 8 * 2.4);
      m.cylinder([side * 4.65, floor + 0.55, z], 0.12, 1.1, I.light);
      m.sphere([side * 4.65, floor + 0.6, z], [0.18, 0.25, 0.18], I.gold);
    }
    m.beam([side * 4.65, 1.2, -5], [side * 4.65, 3.6, -13], 0.2, I.gold);
  }
  archway(m, -12.75, 2.4, 9.5, 11.2);
  m.box([0, 16.3, -1], [28, 0.5, 24.5], "#8c7051");
  for (const x of [-10.5, -5.25, 0, 5.25, 10.5]) for (const z of [-9, -3, 3, 9]) {
    m.box([x, 15.98, z], [4.95, 0.12, 5.5], "#c2aa7f");
    m.box([x, 15.87, z], [4.45, 0.12, 5.0], "#d6bc8c");
    m.add("shield", [x, 15.72, z], [1.1, 1.3, 0.3], "#b99758", [-Math.PI / 2, 0, 0]);
  }
  for (const z of [-8, -1, 6]) {
    m.add("archFrame", [0, 11.4, z], [20.6, 4.3, 1.5], I.gold);
  }
  chandelier(m, 0, 15.7, 1, 2.1);
  return m.parts;
}

export default function EntranceHall() {
  const parts = useMemo(buildHall, []);
  return <StaticModel parts={parts} />;
}
