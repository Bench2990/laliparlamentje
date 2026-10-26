"use client";

import { useMemo } from "react";
import { Model } from "@/lib/model";
import { I, archway, carpet, chandelier, column, floorTiles, wallSconce } from "@/lib/interior-details";
import StaticModel from "@/components/world/StaticModel";

export default function Corridor() {
  const parts = useMemo(() => {
    const m = new Model();
    const floor = 2.4;
    floorTiles(m, -5, 5, -37, -13, floor);
    carpet(m, 0, -25, 3.5, 24, floor);
    for (const side of [-1, 1]) {
      m.box([side * 5.2, 9, -24.5], [0.6, 13.2, 23], I.cream);
      m.box([side * 4.85, 3.9, -24.5], [0.15, 3, 23], I.red);
      for (const y of [2.65, 5.4, 13.7]) m.box([side * 4.7, y, -24.5], [0.25, 0.18, 23], I.gold);
      for (const z of [-17, -23, -29, -35]) {
        column(m, side * 4.2, z, floor, 8.5, 0.38);
        const angle = side === -1 ? Math.PI / 2 : -Math.PI / 2;
        m.add("arch", [side * 4.8, 6.3, z + 2.5], [2.4, 5.6, 1], "#835849", [0, angle, 0]);
        m.add("archFrame", [side * 4.7, 6.3, z + 2.5], [2.4, 5.6, 0.5], I.gold, [0, angle, 0]);
        wallSconce(m, side * 4.7, 6.2, z + 1.2, -side);
      }
    }
    for (const z of [-17, -23, -29, -35]) archway(m, z, floor, 8, 10.7);
    m.box([0, 15, -24.5], [10, 0.5, 23], I.cream);
    for (let z = -14; z >= -35; z -= 3) {
      m.box([0, 14.68, z], [9.8, 0.15, 0.16], I.gold);
      m.box([0, 14.62, z - 1.5], [0.16, 0.15, 2.7], I.gold);
    }
    chandelier(m, 0, 14.2, -24, 1.15);
    return m.parts;
  }, []);
  return <StaticModel parts={parts} />;
}
