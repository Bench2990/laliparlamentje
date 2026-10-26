"use client";

import { useMemo } from "react";
import * as THREE from "three";
import EntranceHall from "./EntranceHall";
import Corridor from "./Corridor";
import MainChamber from "./MainChamber";

export default function InteriorScene({ lowQuality }: { lowQuality: boolean }) {
  const lightTarget = useMemo(() => {
    const target = new THREE.Object3D();
    target.position.set(0, 0, -55);
    return target;
  }, []);
  return (
    <>
      <color attach="background" args={["#5b4633"]} />
      <fog attach="fog" args={["#a88b62", 50, 145]} />
      <ambientLight intensity={0.8} color="#ffe4b7" />
      <hemisphereLight args={["#fff1d2", "#ac7d59", 0.85]} />
      <primitive object={lightTarget} />
      <directionalLight key={lowQuality ? "chamber-low" : "chamber-high"} position={[8, 21, -46]} target={lightTarget} intensity={1.8} color="#ffebc7" castShadow
        shadow-mapSize-width={lowQuality ? 1024 : 2048} shadow-mapSize-height={lowQuality ? 1024 : 2048}
        shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={44} shadow-camera-bottom={-44}
        shadow-camera-near={0.2} shadow-camera-far={90} shadow-bias={-0.0003} shadow-normalBias={0.08} />
      <pointLight position={[0, 11, 1]} intensity={210} distance={36} decay={2} color="#ffd38a" />
      <pointLight position={[0, 11, -24]} intensity={120} distance={26} decay={2} color="#ffe1a8" />
      <pointLight position={[0, 17, -54]} intensity={370} distance={49} decay={2} color="#ffdb94" />
      <EntranceHall />
      <Corridor />
      <MainChamber />
    </>
  );
}
