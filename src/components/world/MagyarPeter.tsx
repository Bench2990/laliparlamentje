"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MAGYAR, PHONE_THROW, phoneThrowPose, phoneThrowTime, thrownPhonePosition } from "@/lib/magyar";
import { floorHeight } from "@/lib/world";
import { Model } from "@/lib/model";
import StaticModel from "./StaticModel";

function characterParts() {
  const skin = "#e5b89b";
  const hair = "#654532";
  const jacket = "#283b4a";
  const trousers = "#343e48";
  const body = new Model();
  body.cylinder([0, 1.13, 0], 0.245, 0.56, jacket);
  body.box([0, 1.34, 0], [0.58, 0.19, 0.32], jacket);
  body.box([0, 0.88, 0], [0.4, 0.2, 0.3], trousers);
  body.box([0, 1.28, 0.175], [0.23, 0.32, 0.035], "#e7e6df");
  for (const side of [-1, 1]) {
    body.box([side * 0.14, 1.27, 0.197], [0.075, 0.34, 0.035], "#405564", [0, 0, side * -0.22]);
    body.box([side * 0.055, 1.42, 0.2], [0.09, 0.1, 0.035], "#f2ede2", [0, 0, side * 0.35]);
    body.box([side * 0.115, 0.64, 0], [0.165, 0.38, 0.195], trousers);
    body.box([side * 0.115, 0.305, 0], [0.15, 0.34, 0.175], trousers);
    body.box([side * 0.115, 0.08, 0.055], [0.18, 0.12, 0.3], "#41382f");
    body.box([side * 0.115, 0.022, 0.06], [0.185, 0.025, 0.305], "#282e32");
  }
  body.cylinder([0, 1.46, 0], 0.085, 0.15, skin);
  // The relaxed left arm is batched with the stationary body.
  body.cylinder([-0.325, 1.22, 0], 0.078, 0.32, jacket);
  body.cylinder([-0.325, 0.955, 0.012], 0.065, 0.26, jacket);
  body.sphere([-0.325, 0.73, 0.025], [0.064, 0.1, 0.06], skin);

  // Head coordinates are relative to a neck pivot, allowing a glance down at
  // the phone. Short side-parted brown hair, strong brows and an open collar
  // give this fictional low-poly caricature its own silhouette.
  const head = new Model();
  head.sphere([0, 0.15, 0], [0.185, 0.225, 0.174], skin);
  head.sphere([0, 0.315, -0.023], [0.194, 0.095, 0.178], hair);
  head.box([0.03, 0.288, 0.125], [0.29, 0.06, 0.07], hair, [0, 0, -0.14]);
  head.box([-0.12, 0.265, 0.11], [0.055, 0.08, 0.075], "#866044");
  for (const side of [-1, 1]) {
    head.sphere([side * 0.182, 0.14, 0], [0.039, 0.063, 0.035], skin);
    head.box([side * 0.072, 0.185, 0.161], [0.047, 0.031, 0.016], "#f1ece1");
    head.sphere([side * 0.072, 0.185, 0.175], [0.014, 0.017, 0.008], "#4f655d");
    head.box([side * 0.073, 0.231, 0.163], [0.078, 0.019, 0.024], hair, [0, 0, side * -0.1]);
  }
  head.sphere([0, 0.14, 0.174], [0.038, 0.053, 0.049], skin);
  head.box([0, 0.057, 0.158], [0.087, 0.013, 0.018], "#a26657", [0, 0, -0.04]);

  const upperArm = new Model();
  upperArm.cylinder([0, -0.155, 0], 0.078, 0.31, jacket);
  const forearm = new Model();
  forearm.cylinder([0, -0.13, 0.012], 0.065, 0.26, jacket);
  forearm.box([0, -0.263, 0.015], [0.12, 0.035, 0.115], "#e7e6df");
  forearm.sphere([0, -0.34, 0.045], [0.064, 0.095, 0.057], skin);
  return { body: body.parts, head: head.parts, upperArm: upperArm.parts, forearm: forearm.parts };
}

const DROPLETS = 8;

export default function MagyarPeter({ active }: { active: boolean }) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const shoulder = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const phone = useRef<THREE.Group>(null);
  const splash = useRef<THREE.Group>(null);
  const ripple = useRef<THREE.Group>(null);
  const rippleMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const droplets = useRef<THREE.InstancedMesh>(null);
  const dropletMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const clock = useRef({ time: 0, cycle: 0 });
  // Keep metadata stable when settings/HUD re-render the exterior scene.
  const metadata = useMemo(() => ({ character: "magyar-peter", fictional: true, interactive: false, throwTime: 0, cycle: 0 }), []);
  const parts = useMemo(characterParts, []);
  const dropletTransform = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ camera }, delta) => {
    if (active && !document.hidden) {
      clock.current.time += Math.min(delta, 0.1);
      if (clock.current.time >= PHONE_THROW.duration) {
        clock.current.time = phoneThrowTime(clock.current.time);
        clock.current.cycle++;
      }
    }
    const t = clock.current.time;
    if (root.current) {
      root.current.userData.throwTime = t;
      root.current.userData.cycle = clock.current.cycle;
      // Do not spend mobile draw calls on a tiny figure hidden on the far side
      // of Parliament. The clock keeps looping while outside viewing range.
      const dx = camera.position.x - MAGYAR.x;
      const dz = camera.position.z - MAGYAR.z;
      root.current.visible = dx * dx + dz * dz < 100 * 100;
      if (!root.current.visible) return;
    }
    const pose = phoneThrowPose(t);
    if (head.current) head.current.rotation.x = pose.head;
    if (shoulder.current) shoulder.current.rotation.x = pose.shoulder;
    if (elbow.current) elbow.current.rotation.x = pose.elbow;
    if (phone.current) {
      const flight = Math.max(0, (t - PHONE_THROW.release) / PHONE_THROW.flightDuration);
      phone.current.visible = t >= PHONE_THROW.phoneOut && t < PHONE_THROW.release + PHONE_THROW.flightDuration;
      phone.current.position.set(...thrownPhonePosition(t));
      phone.current.rotation.set(-0.25 + flight * Math.PI * 5, flight * Math.PI * 2, flight * 0.8);
    }
    const age = t - PHONE_THROW.release - PHONE_THROW.flightDuration;
    const splashing = age >= 0 && age < PHONE_THROW.splashDuration;
    if (splash.current) splash.current.visible = splashing;
    if (!splashing) return;
    const progress = age / PHONE_THROW.splashDuration;
    if (ripple.current) ripple.current.scale.setScalar(0.24 + progress * 1.55);
    if (rippleMaterial.current) rippleMaterial.current.opacity = (1 - progress) * 0.75;
    if (dropletMaterial.current) dropletMaterial.current.opacity = (1 - progress) * 0.9;
    if (droplets.current) {
      for (let i = 0; i < DROPLETS; i++) {
        const angle = i * Math.PI * 2 / DROPLETS;
        const radius = 0.08 + age * (0.6 + (i % 3) * 0.15);
        dropletTransform.position.set(Math.cos(angle) * radius, Math.max(0, age * (2.6 + (i % 2) * 0.7) - 3.6 * age * age), Math.sin(angle) * radius);
        dropletTransform.scale.set(0.055 * (1 - progress * 0.5), 0.09 * (1 - progress * 0.6), 0.055 * (1 - progress * 0.5));
        dropletTransform.updateMatrix();
        droplets.current.setMatrixAt(i, dropletTransform.matrix);
      }
      droplets.current.instanceMatrix.needsUpdate = true;
    }
  }, -1);

  return (
    <group ref={root} name="magyar-peter" position={[MAGYAR.x, floorHeight("exterior", MAGYAR.x, MAGYAR.z), MAGYAR.z]} rotation={[0, MAGYAR.facing, 0]} userData={metadata}>
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.43, 20]} />
        <meshBasicMaterial color="#384339" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <StaticModel parts={parts.body} shadows={false} />
      <group ref={head} position={[0, 1.5, 0]}><StaticModel parts={parts.head} shadows={false} /></group>
      <group ref={shoulder} name="magyar-peter-arm" position={[0.325, 1.38, 0]}>
        <StaticModel parts={parts.upperArm} shadows={false} />
        <group ref={elbow} position={[0, -0.31, 0]}>
          <StaticModel parts={parts.forearm} shadows={false} />
          <group name="magyar-peter-hand" position={[0, -0.34, 0.045]} />
        </group>
      </group>
      {/* One independent, reusable phone follows the palm, then flies. Nothing
          is spawned during a loop; R3F disposes these resources on unmount. */}
      <group ref={phone} name="magyar-peter-phone" visible={false}>
        <mesh>
          <boxGeometry args={[0.17, 0.3, 0.045]} />
          <meshStandardMaterial color="#e6b55f" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0, 0.026]}>
          <boxGeometry args={[0.137, 0.245, 0.009]} />
          <meshBasicMaterial color="#9ceaf0" toneMapped={false} />
        </mesh>
        <mesh position={[-0.045, 0.105, -0.026]}>
          <boxGeometry args={[0.04, 0.045, 0.009]} />
          <meshStandardMaterial color="#243442" roughness={0.6} />
        </mesh>
      </group>
      <group ref={splash} name="magyar-peter-splash" position={[PHONE_THROW.landing[0], PHONE_THROW.landing[1] + 0.08, PHONE_THROW.landing[2]]} visible={false}>
        <group ref={ripple} name="magyar-peter-ripple">
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.9, 1, 32]} />
            <meshBasicMaterial ref={rippleMaterial} color="#d3f6ed" transparent depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        </group>
        <instancedMesh ref={droplets} args={[undefined, undefined, DROPLETS]} frustumCulled={false}>
          <sphereGeometry args={[1, 6, 4]} />
          <meshBasicMaterial ref={dropletMaterial} color="#ddfaf3" transparent depthWrite={false} toneMapped={false} />
        </instancedMesh>
      </group>
    </group>
  );
}
