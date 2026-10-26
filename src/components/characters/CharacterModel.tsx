"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CharacterMotion } from "@/lib/characters";
import { SLAP, cameoSlapPose, playerSlapPose, type SlapState } from "@/lib/slap";
import { Model } from "@/lib/model";
import StaticModel from "@/components/world/StaticModel";

type Variant = "player" | "cameo";

function characterParts(variant: Variant) {
  const cameo = variant === "cameo";
  const skin = cameo ? "#dfb298" : "#e9bd9e";
  const hair = cameo ? "#7d766c" : "#563d2e";
  const top = cameo ? "#293b50" : "#24292c";
  const trousers = cameo ? "#283447" : "#262b30";
  const body = new Model();
  body.cylinder([0, 1.13, 0], cameo ? 0.3 : 0.235, 0.56, top);
  body.box([0, 1.34, 0], [cameo ? 0.64 : 0.56, 0.19, 0.32], top);
  body.box([0, 0.88, 0], [0.4, 0.2, 0.3], trousers);
  body.cylinder([0, 1.46, 0], 0.085, 0.15, skin);
  body.sphere([0, 1.65, 0], cameo ? [0.245, 0.24, 0.195] : [0.18, 0.22, 0.17], skin);
  for (const side of [-1, 1]) {
    body.sphere([side * (cameo ? 0.245 : 0.18), 1.64, 0], [0.043, 0.066, 0.037], skin);
    body.box([side * 0.075, 1.685, cameo ? 0.185 : 0.16], [0.046, 0.032, 0.018], "#f0e6d5");
    body.sphere([side * 0.075, 1.685, cameo ? 0.198 : 0.175], [0.013, 0.018, 0.008], "#3b302a");
    body.box([side * 0.075, 1.733, cameo ? 0.189 : 0.158], [0.075, cameo ? 0.025 : 0.017, 0.025], hair, [0, 0, side * -0.08]);
  }
  body.sphere([0, 1.64, cameo ? 0.21 : 0.17], cameo ? [0.058, 0.065, 0.067] : [0.035, 0.05, 0.045], skin);
  body.box([0, 1.555, cameo ? 0.193 : 0.158], [0.082, 0.012, 0.018], "#995e4e");
  if (cameo) {
    body.sphere([0, 1.822, -0.045], [0.232, 0.07, 0.174], hair);
    for (const side of [-1, 1]) body.box([side * 0.216, 1.74, -0.02], [0.046, 0.13, 0.19], hair);
    body.box([0, 1.29, 0.18], [0.21, 0.26, 0.025], "#eee7d7");
    for (const side of [-1, 1]) body.box([side * 0.135, 1.27, 0.19], [0.08, 0.33, 0.045], "#3e4e62", [0, 0, side * -0.3]);
    body.box([0, 1.245, 0.212], [0.047, 0.28, 0.027], "#a2593c");
    body.sphere([0, 1.405, 0.21], [0.035, 0.04, 0.027], "#a2593c");
    body.box([0, 1.005, 0.288], [0.016, 0.23, 0.016], "#1f2c3d");
  } else {
    body.sphere([0, 1.82, -0.014], [0.192, 0.11, 0.176], hair);
    body.box([0.025, 1.775, 0.13], [0.31, 0.074, 0.065], hair, [0, 0, -0.08]);
    body.box([0, 1.02, 0.231], [0.017, 0.3, 0.012], "#30363a");
    body.cylinder([0, 1.432, 0], 0.115, 0.035, "#161d21");
  }
  const arm = new Model();
  arm.cylinder([0, -0.16, 0], cameo ? 0.092 : 0.073, 0.32, top);
  arm.cylinder([0, -0.425, 0.012], cameo ? 0.078 : 0.064, 0.26, top);
  arm.box([0, -0.567, 0.015], [0.135, 0.055, 0.125], cameo ? "#e8dfcc" : "#191f23");
  arm.sphere([0, -0.65, 0.025], [0.067, 0.1, 0.061], skin);
  const upperArm = new Model();
  upperArm.cylinder([0, -0.16, 0], cameo ? 0.092 : 0.073, 0.32, top);
  const forearm = new Model();
  forearm.cylinder([0, -0.125, 0.012], cameo ? 0.078 : 0.064, 0.26, top);
  forearm.box([0, -0.267, 0.015], [0.135, 0.055, 0.125], cameo ? "#e8dfcc" : "#191f23");
  forearm.sphere([0, -0.35, 0.025], [cameo ? 0.08 : 0.07, 0.11, 0.045], skin);
  forearm.sphere([0.075, -0.31, 0.025], [0.03, 0.045, 0.03], skin);
  const leg = new Model();
  leg.box([0, -0.18, 0], [0.165, 0.38, 0.195], trousers);
  leg.box([0, -0.52, 0], [0.15, 0.34, 0.175], trousers);
  leg.box([0, -0.745, 0.055], [0.18, 0.12, 0.3], "#1a2025");
  leg.box([0, -0.802, 0.06], [0.185, 0.025, 0.305], "#414341");
  return { body: body.parts, arm: arm.parts, upperArm: upperArm.parts, forearm: forearm.parts, leg: leg.parts };
}

export default function CharacterModel({ motion, slap, variant, name, visible = true, children }: {
  motion: CharacterMotion; slap: SlapState; variant: Variant; name: string; visible?: boolean; children?: ReactNode;
}) {
  const root = useRef<THREE.Group>(null);
  const contactShadow = useRef<THREE.Mesh>(null);
  const rig = useRef<THREE.Group>(null);
  const stars = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const rightElbow = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const parts = useMemo(() => characterParts(variant), [variant]);
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    for (let i = 0; i <= 10; i++) {
      const angle = i * Math.PI / 5 + Math.PI / 2;
      const radius = i % 2 ? 0.055 : 0.13;
      if (i === 0) shape.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      else shape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    return shape;
  }, []);
  const shadow = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(32, 32, 3, 32, 32, 31);
    gradient.addColorStop(0, "rgba(25,25,20,.3)");
    gradient.addColorStop(1, "rgba(25,25,20,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }, []);
  useEffect(() => () => shadow.dispose(), [shadow]);
  useFrame(() => {
    if (!root.current || !visible) return;
    root.current.position.set(motion.x, motion.y, motion.z);
    root.current.rotation.y = motion.facing;
    const time = slap.slapTime;
    const player = variant === "player";
    const arm = playerSlapPose(player ? time : null);
    const reaction = cameoSlapPose(player ? null : time);
    const acting = time !== null && (!player || time < SLAP.swingEnd);
    const swing = acting ? 0 : Math.sin(motion.walkPhase) * Math.min(1, motion.walkBlend);
    const flail = !player && time !== null && time >= SLAP.impact ? Math.sin(Math.min(1, (time - SLAP.impact) * 5) * Math.PI / 2) * (time < SLAP.floorEnd ? 1 : reaction.fall) : 0;
    if (rig.current) {
      rig.current.position.set(reaction.side, reaction.height, player ? arm.lean : reaction.back);
      rig.current.rotation.set(player ? -arm.lean * 0.22 : reaction.tilt, arm.twist, reaction.wobble);
    }
    if (contactShadow.current) {
      contactShadow.current.position.set(reaction.side, 0.012, reaction.back - reaction.fall * 0.8);
      contactShadow.current.scale.y = 1 + reaction.fall * 0.9;
    }
    if (torso.current) {
      torso.current.position.y = acting ? 0 : Math.sin(motion.walkPhase * 2) * 0.018 * motion.walkBlend;
    }
    if (leftLeg.current) leftLeg.current.rotation.set(swing * 0.6 + reaction.fall * 0.08, 0, reaction.fall * 0.12);
    if (rightLeg.current) rightLeg.current.rotation.set(-swing * 0.6 - reaction.fall * 0.08, 0, -reaction.fall * 0.12);
    if (leftArm.current) leftArm.current.rotation.set(-swing * 0.46 - flail * 0.55, 0, -flail * 0.65);
    if (rightArm.current) rightArm.current.rotation.set(swing * 0.46 + arm.x - flail * 0.7, arm.y, arm.z + flail * 0.8);
    if (rightElbow.current) rightElbow.current.rotation.set(arm.elbow - flail * 0.35, 0, 0);
    if (stars.current) {
      stars.current.visible = !player && time !== null && time >= SLAP.impact && time < SLAP.duration - 0.15;
      stars.current.position.set(reaction.side, 2.1 - reaction.fall * 1.2, reaction.back - reaction.fall * 1.65);
      stars.current.rotation.y = (time ?? 0) * 4;
    }
  }, -1);

  return (
    <group ref={root} name={name} visible={visible} userData={{ character: variant }}>
      <mesh ref={contactShadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <planeGeometry args={[1.4, 1.15]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={rig} name={`${name}-pose`}>
        <group ref={torso} scale={variant === "cameo" ? [1.07, 1, 1.06] : [1, 1, 1]}>
          <StaticModel parts={parts.body} shadows={false} />
          <group ref={leftArm} position={[-0.325, 1.38, 0]}><StaticModel parts={parts.arm} shadows={false} /></group>
          <group ref={rightArm} name={`${name}-right-arm`} position={[0.325, 1.38, 0]}>
            <StaticModel parts={parts.upperArm} shadows={false} />
            <group ref={rightElbow} name={`${name}-right-elbow`} position={[0, -0.31, 0]}><StaticModel parts={parts.forearm} shadows={false} /></group>
          </group>
        </group>
        <group ref={leftLeg} name={`${name}-left-leg`} position={[-0.115, 0.825, 0]}><StaticModel parts={parts.leg} shadows={false} /></group>
        <group ref={rightLeg} name={`${name}-right-leg`} position={[0.115, 0.825, 0]}><StaticModel parts={parts.leg} shadows={false} /></group>
      </group>
      {variant === "cameo" && <group ref={stars} name={`${name}-stars`} visible={false}>
        {[0, 1, 2].map((index) => <mesh key={index} position={[Math.cos(index * Math.PI * 2 / 3) * 0.42, index % 2 * 0.1, Math.sin(index * Math.PI * 2 / 3) * 0.42]}>
          <shapeGeometry args={[starShape]} />
          <meshBasicMaterial color="#ffd65c" side={THREE.DoubleSide} toneMapped={false} />
        </mesh>)}
      </group>}
      {children}
    </group>
  );
}
