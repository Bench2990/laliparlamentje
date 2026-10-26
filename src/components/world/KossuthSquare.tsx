"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Model, PALETTE as P, seeded } from "@/lib/model";
import { BENCHES, LAWNS, TREES } from "@/lib/world";
import { bench, lamp, personStatue } from "@/lib/street-furniture";
import StaticModel from "./StaticModel";

function usePavingTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const context = canvas.getContext("2d")!;
    const random = seeded(72);
    context.fillStyle = "#b3afa2";
    context.fillRect(0, 0, 512, 512);
    for (let row = 0; row < 16; row++) {
      for (let col = -1; col < 16; col++) {
        const shade = 196 + Math.floor(random() * 23);
        const x = col * 32 + (row % 2) * 16;
        context.fillStyle = `rgb(${shade + 7},${shade + 3},${shade - 7})`;
        context.fillRect(x + 0.7, row * 32 + 0.7, 30.6, 30.6);
        context.fillStyle = "rgba(255,255,244,0.15)";
        context.fillRect(x + 1, row * 32 + 1, 29, 0.9);
        for (let dot = 0; dot < 14; dot++) {
          context.fillStyle = random() > 0.5 ? "rgba(115,105,90,.08)" : "rgba(255,255,255,.12)";
          context.fillRect(x + random() * 30, row * 32 + random() * 30, 1, 1);
        }
      }
    }
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(27, 46);
    t.anisotropy = 4;
    return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function tree(m: Model, x: number, z: number, size: number, index: number) {
  m.cylinder([x, 2.3 * size, z], 0.34 * size, 4.6 * size, "#786650");
  m.beam([x, 3 * size, z], [x + 1.5 * size, 5.2 * size, z + 0.5], 0.2 * size, "#786650");
  m.beam([x, 3.5 * size, z], [x - 1.4 * size, 6 * size, z - 0.4], 0.18 * size, "#786650");
  const colors = ["#75905a", "#849d64", "#698452", "#92a66c", "#7b965c"];
  const clusters = [[0, 7.5, 0, 3.2], [-1.9, 6, 0.5, 2.6], [1.8, 6.5, -0.4, 2.6], [0.5, 6.6, 1.7, 2.5], [-0.5, 8.4, -0.9, 2.3]];
  clusters.forEach(([dx, y, dz, radius], i) => {
    m.add("leaf", [x + dx * size, y * size, z + dz * size], [radius * size, radius * size * 1.1, radius * size], colors[(i + index) % colors.length], [0.1 * i, index * 0.7, 0], "leaf");
  });
  m.box([x, 0.04, z], [2.1 * size, 0.08, 2.1 * size], "#736f5a");
}

function monuments(m: Model) {
  // Kossuth memorial, north of the main axis: limestone podium and bronze figures.
  m.box([97.5, 0.18, -97.5], [18, 0.36, 9], "#beb49f");
  m.box([97.5, 1.2, -97.5], [15.4, 2, 6.5], "#e2d8c2");
  m.box([97.5, 2.5, -98], [6, 1.1, 5.6], P.light);
  m.box([97.5, 3.4, -98], [4.1, 1.6, 4.1], P.light);
  personStatue(m, 97.5, 4.2, -98, 1.7);
  for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
    personStatue(m, 97.5 + side * (4 + i * 1.55), 2.3, -98 + (i % 2) * 0.7, 0.85);
  }
  // Rákóczi's equestrian silhouette, on the southern lawn.
  m.box([96, 0.2, 76], [10, 0.4, 8], "#b4ac98");
  m.box([96, 1.9, 76], [7.4, 3.4, 4.8], "#d4c9b4");
  m.box([96, 3.7, 76], [8.2, 0.3, 5.5], P.light);
  m.sphere([96, 5.4, 76], [2.15, 0.95, 0.85], P.bronze, "metal");
  m.beam([97.4, 5.4, 76], [98.1, 7.3, 76], 0.7, P.bronze, "metal");
  m.sphere([98.2, 7.25, 76], [0.85, 0.45, 0.4], P.bronze, "metal");
  m.cone([97.9, 7.8, 75.8], 0.14, 0.5, P.bronze);
  for (const dx of [-1.35, 1.3]) for (const dz of [-0.5, 0.5]) {
    m.beam([96 + dx, 5.3, 76 + dz], [96 + dx - 0.25, 3.85, 76 + dz], 0.28, P.bronze, "metal");
  }
  personStatue(m, 96, 5.3, 76, 0.92);
  m.beam([96.5, 7.4, 76], [98, 7.5, 76], 0.16, P.bronze, "metal");
  m.beam([94, 5.4, 76], [93.3, 4.4, 76], 0.22, P.bronze, "metal");
}

function squareModel() {
  const m = new Model();
  for (const lawn of LAWNS) {
    m.box([lawn.x, 0.04, lawn.z], [lawn.width, 0.08, lawn.depth], "#8b9e70", undefined, "matte");
    for (let i = 0; i < 8; i++) {
      m.box([lawn.x - lawn.width / 2 + lawn.width / 16 + i * lawn.width / 8, 0.085, lawn.z], [lawn.width / 8, 0.012, lawn.depth], i % 2 ? "#8b9d70" : "#8fa274", undefined, "matte");
    }
    for (const side of [-1, 1]) {
      m.box([lawn.x + side * lawn.width / 2, 0.08, lawn.z], [0.22, 0.16, lawn.depth + 0.25], "#d7d1bc", undefined, "matte");
      m.box([lawn.x, 0.08, lawn.z + side * lawn.depth / 2], [lawn.width, 0.16, 0.22], "#d7d1bc", undefined, "matte");
    }
  }
  // Inlaid limestone bands give the broad square an intentional pedestrian layout.
  for (const x of [45, 55.5, 110, 120, 163]) m.box([x, -0.008, 0], [0.42, 0.035, 288], "#a6a494", undefined, "matte");
  for (const z of [-119, -16, 16, 119]) m.box([105, -0.006, z], [131, 0.035, 0.45], "#b0ab98", undefined, "matte");
  for (const side of [-1, 1]) {
    for (const z of [28, 58, 91, 119]) lamp(m, 53, side * z, 0.92);
    for (const z of [24, 54, 88, 119]) lamp(m, 118.5, side * z, 0.92);
  }
  TREES.forEach((t, i) => tree(m, t.x, t.z, t.size, i));
  BENCHES.forEach((b) => bench(m, b.x, b.z, b.rotation));
  for (const z of [-132, 132]) for (const x of [-20, 12, 43]) lamp(m, x, z, 0.92);
  const random = seeded(14);
  for (const side of [-1, 1]) {
    m.box([60.2, 0.16, side * 63], [2.1, 0.3, 63], "#637c4e", undefined, "leaf");
    for (let i = 0; i < 90; i++) {
      m.sphere([59.5 + random() * 1.4, 0.4 + random() * 0.15, side * (33 + random() * 60)], [0.13, 0.14, 0.13], ["#e4c4a6", "#eee0b5", "#b67567"][i % 3], "leaf");
    }
  }
  monuments(m);
  m.cylinder([97, 0.2, -21], 1.5, 0.4, P.light);
  m.cylinder([97, 9.8, -21], 0.075, 19.2, "#bdb7a3", "metal");
  m.sphere([97, 19.6, -21], [0.14, 0.18, 0.14], P.gold, "metal");
  return m.parts;
}

function HungarianFlag() {
  const mesh = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    const color = new THREE.Color();
    for (let band = 0; band < 3; band++) {
      color.set(["#b94b43", "#f1ecdd", "#4d795b"][band]);
      const start = positions.length / 3;
      for (let row = 0; row <= 1; row++) for (let col = 0; col <= 18; col++) {
        positions.push(col / 18 * 4.8, -band * 0.8 - row * 0.8, 0);
        colors.push(color.r, color.g, color.b);
      }
      for (let col = 0; col < 18; col++) {
        const a = start + col;
        indices.push(a, a + 19, a + 1, a + 1, a + 19, a + 20);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const positions = geo.attributes.position;
    const time = clock.getElapsedTime();
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      positions.setZ(i, (Math.sin(x * 1.5 - time * 2.5) * 0.22 + Math.sin(x * 2.7 - time * 1.6) * 0.08) * x / 4.8);
    }
    positions.needsUpdate = true;
    geo.computeVertexNormals();
  });
  return <mesh ref={mesh} geometry={geo} position={[97, 18.9, -21]} rotation={[0, 0.5, 0]}><meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={1} /></mesh>;
}

export default function KossuthSquare() {
  const parts = useMemo(squareModel, []);
  const paving = usePavingTexture();
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[78, -0.035, 0]} receiveShadow>
        <planeGeometry args={[284, 500]} />
        <meshStandardMaterial map={paving} roughness={0.96} color="#f0e7d4" />
      </mesh>
      <StaticModel parts={parts} />
      <HungarianFlag />
    </group>
  );
}
