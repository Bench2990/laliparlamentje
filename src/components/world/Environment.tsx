"use client";

import { Sky } from "@react-three/drei";

export default function Environment({ lowQuality }: { lowQuality: boolean }) {
  return (
    <>
      <color attach="background" args={["#cbdde0"]} />
      <fog attach="fog" args={["#d8dfd5", 190, 1050]} />
      <Sky distance={450000} sunPosition={[180, 220, 90]} inclination={0.49} azimuth={0.2} turbidity={4.5} rayleigh={0.65} mieCoefficient={0.005} mieDirectionalG={0.8} />
      <hemisphereLight args={["#dfedf1", "#a99b7f", 2.1]} />
      <ambientLight color="#f5e7ce" intensity={0.35} />
      <directionalLight
        key={lowQuality ? "sun-low" : "sun-high"}
        position={[130, 180, 100]}
        color="#fff0d4"
        intensity={3.3}
        castShadow
        shadow-mapSize-width={lowQuality ? 1024 : 2048}
        shadow-mapSize-height={lowQuality ? 1024 : 2048}
        shadow-camera-left={-175}
        shadow-camera-right={175}
        shadow-camera-top={160}
        shadow-camera-bottom={-160}
        shadow-camera-near={1}
        shadow-camera-far={450}
        shadow-bias={-0.0003}
        shadow-normalBias={0.18}
      />
    </>
  );
}
