"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Model, PALETTE as P } from "@/lib/model";
import { bench, lamp } from "@/lib/street-furniture";
import { DANUBE } from "@/lib/world";
import StaticModel from "./StaticModel";

const vertexShader = `
  varying vec3 vWorld;
  uniform float uTime;
  void main() {
    vec3 p = position;
    p.z += sin(p.x * 0.17 + uTime * 0.6) * cos(p.y * 0.12 + uTime * 0.3) * 0.055;
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec3 vWorld;
  void main() {
    vec2 p = vWorld.xz;
    float waves = sin(p.x * 1.7 + p.y * 0.3 + uTime * 0.65)
                + sin(p.x * 0.34 - p.y * 1.2 - uTime * 0.4) * 0.6
                + sin(p.x * 3.5 + p.y * 0.7 + uTime) * 0.3;
    vec3 viewDir = normalize(cameraPosition - vWorld);
    float fresnel = pow(1.0 - max(viewDir.y, 0.0), 2.5);
    vec3 deep = vec3(0.22, 0.39, 0.39);
    vec3 shallow = vec3(0.39, 0.57, 0.55);
    vec3 color = mix(deep, shallow, fresnel * 0.65 + waves * 0.035);
    float ripple = smoothstep(1.35, 1.65, waves);
    float sunPath = pow(max(dot(normalize(vec2(-0.5, 0.8)), normalize(viewDir.xz + vec2(0.001))), 0.0), 10.0);
    color += vec3(0.28, 0.25, 0.17) * ripple * (0.28 + sunPath * 0.75);
    float mist = smoothstep(210.0, 1100.0, distance(cameraPosition, vWorld));
    color = mix(color, vec3(0.76, 0.80, 0.75), mist * 0.75);
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function riverfrontModel() {
  const m = new Model();
  m.box([-63.4, -1.45, 0], [2.6, 3.9, 520], "#a89f8b");
  m.box([-63.4, 0.16, 0], [3.0, 0.32, 520], "#dad0b9");
  m.box([-52.4, -0.035, 0], [18.6, 0.06, 500], "#c8c2af", undefined, "matte");
  for (let z = -245; z <= 245; z += 3.2) {
    m.box([-63.12, -1.3, z], [2.7, 0.06, 0.07], "#908c7c");
    m.cylinder([-62.8, 0.78, z], 0.065, 1.35, P.bronze, "metal");
    m.sphere([-62.8, 1.48, z], [0.1, 0.1, 0.1], P.bronze, "metal");
  }
  for (const y of [0.55, 1.35]) m.box([-62.8, y, 0], [0.075, 0.075, 500], P.bronze, undefined, "metal");
  for (let z = -140; z <= 140; z += 28) lamp(m, -45.7, z, 1);
  for (let z = -113; z <= 113; z += 56) bench(m, -58.3, z, Math.PI / 2);
  // Quiet stone-sett paving joints along the embankment.
  for (let z = -240; z <= 240; z += 2.5) m.box([-52.5, 0.003, z], [18.6, 0.012, 0.035], "#b4af9e", undefined, "matte");
  return m.parts;
}

function ChainBridge() {
  const parts = useMemo(() => {
    const m = new Model();
    const z = 338;
    m.box([-251, 1.7, z], [365, 1.3, 11], "#9d9f8e");
    for (const x of [-143, -350]) {
      for (const side of [-1, 1]) {
        m.box([x, 10.5, z + side * 6.5], [8, 22, 4], "#c7bda4");
        m.box([x, 1, z + side * 6.5], [13, 5, 7], "#b5ad97");
        m.box([x, 23, z + side * 6.5], [9, 1.4, 5.2], P.light);
      }
      m.box([x, 21, z], [8, 4.5, 17], "#d3c7ac");
    }
    for (const side of [-1, 1]) {
      m.box([-251, 3.9, z + side * 5.4], [365, 0.12, 0.12], P.bronze, undefined, "metal");
      for (let i = 0; i < 36; i++) {
        const x1 = -350 + i / 36 * 207;
        const x2 = -350 + (i + 1) / 36 * 207;
        const y1 = 7.2 + 15 * ((x1 + 246.5) / 103.5) ** 2;
        const y2 = 7.2 + 15 * ((x2 + 246.5) / 103.5) ** 2;
        m.beam([x1, y1, z + side * 6.4], [x2, y2, z + side * 6.4], 0.3, "#58685b");
        m.beam([x1, 3, z + side * 6.4], [x1, y1, z + side * 6.4], 0.095, "#5c6d60");
      }
      for (const [a, b] of [[-432, -350], [-143, -68]]) m.beam([a, a === -143 ? 22 : 5, z + side * 6.4], [b, b === -350 ? 22 : 5, z + side * 6.4], 0.28, "#58685b");
    }
    return m.parts;
  }, []);
  return <StaticModel parts={parts} shadows={false} />;
}

export default function Danube() {
  const water = useRef<THREE.ShaderMaterial>(null);
  const parts = useMemo(riverfrontModel, []);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame(({ clock }) => { if (water.current) water.current.uniforms.uTime.value = clock.getElapsedTime(); });
  return (
    <group>
      <mesh position={[-264, DANUBE.waterHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[398, 1800, 24, 72]} />
        <shaderMaterial ref={water} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
      </mesh>
      <StaticModel parts={parts} />
      <ChainBridge />
    </group>
  );
}
