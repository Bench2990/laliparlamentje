"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { canOccupy } from "@/lib/collisions";
import * as THREE from "three";
import { floorHeight, type SceneId } from "@/lib/world";
import { clearInput, type InputState } from "@/lib/input";
import type { CameoState } from "@/lib/cameo";
import { FOLLOW_CAMERA, cameraPointIsClear } from "@/lib/follow-camera";
import { SLAP, slapPhase, type SlapPhase } from "@/lib/slap";
import { phoneThrowPhase, type PhoneThrowPhase } from "@/lib/magyar";

export type WalkTestApi = {
  snapshot: () => {
    scene: SceneId; x: number; y: number; z: number; yaw: number; pitch: number;
    moveX: number; moveY: number; calls: number; triangles: number; simulationTime: number;
    camera: { x: number; y: number; z: number; distance: number; clear: boolean };
    avatar: { visible: boolean; facing: number; walkBlend: number; walkPhase: number; leftLeg: number; rightLeg: number; rightArm: number; elbow: number; swinging: boolean };
    cameo: { x: number; z: number; pathTime: number; slapTime: number | null; phase: SlapPhase; slapPhases: SlapPhase[]; walking: boolean; tilt: number; wobble: number; height: number; stars: boolean } | null;
    sign: { text: string; inView: boolean; screenX: number; screenY: number } | null;
    riverfront: {
      x: number; y: number; z: number; facing: number; inView: boolean; interactive: boolean;
      time: number; cycle: number; phase: PhoneThrowPhase; phases: PhoneThrowPhase[];
      phone: { id: string; count: number; visible: boolean; inView: boolean; x: number; y: number; z: number; handDistance: number };
      splash: { visible: boolean; inView: boolean; scale: number };
      geometries: number; textures: number;
    } | null;
  };
  place: (x: number, z: number, yaw?: number, pitch?: number) => Promise<void>;
};

declare global { interface Window { __parliamentTest?: WalkTestApi } }

// Mounted ONLY with NEXT_PUBLIC_E2E=1 by Playwright. The production build
// eliminates this branch. No test navigation or globals ship to visitors.
export default function SceneTestBridge({ scene, input, cameo }: { scene: SceneId; input: InputState; cameo: CameoState }) {
  const { camera, gl, scene: world } = useThree();
  const slapPhases = useRef<SlapPhase[]>([]);
  const phonePhases = useRef<PhoneThrowPhase[]>([]);
  const simulationTime = useRef(0);
  useFrame((_, delta) => {
    simulationTime.current += Math.min(delta, 0.1);
    if (scene !== "interior") {
      slapPhases.current = [];
      const npc = world.getObjectByName("magyar-peter");
      if (!npc) return;
      const phase = phoneThrowPhase(npc.userData.throwTime ?? 0);
      if (phase === phonePhases.current[phonePhases.current.length - 1]) return;
      if (phase === "take-out") phonePhases.current = [phase];
      else phonePhases.current.push(phase);
      return;
    }
    phonePhases.current = [];
    const phase = slapPhase(cameo.slapTime);
    const previous = slapPhases.current[slapPhases.current.length - 1];
    if (phase === previous) return;
    if (phase === "swing") slapPhases.current = [phase];
    else slapPhases.current.push(phase);
  });
  useEffect(() => {
    window.__parliamentTest = {
      snapshot: () => {
        const avatar = world.getObjectByName("player-avatar");
        const cameoPose = world.getObjectByName("parliament-cameo-pose");
        const sign = world.getObjectByName("entrance-sign");
        const screen = sign ? sign.getWorldPosition(new THREE.Vector3()).project(camera) : null;
        const npc = world.getObjectByName("magyar-peter");
        const phone = world.getObjectByName("magyar-peter-phone");
        const hand = world.getObjectByName("magyar-peter-hand");
        const splash = world.getObjectByName("magyar-peter-splash");
        const phonePosition = phone?.getWorldPosition(new THREE.Vector3());
        const inView = (point: THREE.Vector3) => {
          const screen = point.clone().project(camera);
          return Math.abs(screen.x) <= 1 && Math.abs(screen.y) <= 1 && Math.abs(screen.z) <= 1;
        };
        let phoneCount = 0;
        world.traverse((object) => { if (object.name === "magyar-peter-phone") phoneCount++; });
        return {
          scene, x: input.x, y: input.y, z: input.z, yaw: input.yaw, pitch: input.pitch,
          moveX: input.moveX, moveY: input.moveY, calls: gl.info.render.calls, triangles: gl.info.render.triangles, simulationTime: simulationTime.current,
          camera: { x: camera.position.x, y: camera.position.y, z: camera.position.z, distance: camera.position.distanceTo(new THREE.Vector3(input.x, input.y, input.z)), clear: cameraPointIsClear(scene, camera.position.x, camera.position.y, camera.position.z) },
          avatar: { visible: avatar?.visible ?? false, facing: avatar?.rotation.y ?? 0, walkBlend: input.walkBlend, walkPhase: input.walkPhase, leftLeg: world.getObjectByName("player-avatar-left-leg")?.rotation.x ?? 0, rightLeg: world.getObjectByName("player-avatar-right-leg")?.rotation.x ?? 0, rightArm: world.getObjectByName("player-avatar-right-arm")?.rotation.x ?? 0, elbow: world.getObjectByName("player-avatar-right-elbow")?.rotation.x ?? 0, swinging: cameo.slapTime !== null && cameo.slapTime < SLAP.swingEnd },
          cameo: scene === "interior" ? { x: cameo.x, z: cameo.z, pathTime: cameo.pathTime, slapTime: cameo.slapTime, phase: slapPhase(cameo.slapTime), slapPhases: [...slapPhases.current], walking: cameo.walkBlend > 0.05, tilt: cameoPose?.rotation.x ?? 0, wobble: cameoPose?.rotation.z ?? 0, height: cameoPose?.position.y ?? 0, stars: world.getObjectByName("parliament-cameo-stars")?.visible ?? false } : null,
          sign: sign && screen ? { text: sign.userData.label as string, inView: Math.abs(screen.x) <= 1 && Math.abs(screen.y) <= 1 && Math.abs(screen.z) <= 1, screenX: screen.x, screenY: screen.y } : null,
          riverfront: npc && phone && hand && splash && phonePosition ? {
            x: npc.position.x, y: npc.position.y, z: npc.position.z, facing: npc.rotation.y,
            inView: npc.visible && inView(npc.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 1.25, 0))), interactive: npc.userData.interactive === true,
            time: npc.userData.throwTime ?? 0, cycle: npc.userData.cycle ?? 0, phase: phoneThrowPhase(npc.userData.throwTime ?? 0), phases: [...phonePhases.current],
            phone: { id: phone.uuid, count: phoneCount, visible: phone.visible, inView: inView(phonePosition), x: phonePosition.x, y: phonePosition.y, z: phonePosition.z, handDistance: phonePosition.distanceTo(hand.getWorldPosition(new THREE.Vector3())) },
            splash: { visible: splash.visible, inView: inView(splash.getWorldPosition(new THREE.Vector3())), scale: world.getObjectByName("magyar-peter-ripple")?.scale.x ?? 0 },
            geometries: gl.info.memory.geometries, textures: gl.info.memory.textures,
          } : null,
        };
      },
      place: async (x, z, yaw = 0, pitch = FOLLOW_CAMERA.defaultPitch) => {
        if (!canOccupy(scene, x, z)) throw new Error(`Invalid test pose: ${scene} ${x},${z}`);
        clearInput(input);
        input.x = x;
        input.y = floorHeight(scene, x, z);
        input.z = z;
        input.yaw = yaw;
        input.pitch = pitch;
        input.facing = yaw + Math.PI;
        input.walkBlend = input.walkPhase = 0;
        input.snapCamera = true;
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      },
    };
    return () => { delete window.__parliamentTest; };
  }, [camera, gl, scene, world, input, cameo]);
  return null;
}
