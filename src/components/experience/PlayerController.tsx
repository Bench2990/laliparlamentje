"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { clearInput, type InputState } from "@/lib/input";
import { moveWithCollisions, type CircleCollider } from "@/lib/collisions";
import { WALK, floorHeight, locationName, type SceneId, type Spawn } from "@/lib/world";
import { CAMEO, interactionTarget, type CameoState, type InteractionTarget } from "@/lib/cameo";
import { FOLLOW_CAMERA, clipCameraBoom, followCameraPose } from "@/lib/follow-camera";
import { turnTowards } from "@/lib/characters";
import CharacterModel from "@/components/characters/CharacterModel";

type Props = {
  scene: SceneId;
  spawn: Spawn;
  input: InputState;
  cameo: CameoState;
  started: boolean;
  active: boolean;
  dragLook: boolean;
  onStatus: (target: InteractionTarget, location: string) => void;
};

export default function PlayerController({ scene, spawn, input, cameo, started, active, dragLook, onStatus }: Props) {
  const { camera, gl } = useThree();
  const velocity = useRef({ x: 0, z: 0 });
  const report = useRef<{ elapsed: number; target: InteractionTarget; location: string }>({ elapsed: 0, target: null, location: "" });
  const cameraDestination = useMemo(() => new THREE.Vector3(), []);
  const npcCollider = useMemo<CircleCollider[]>(() => [{ kind: "circle", x: cameo.x, z: cameo.z, radius: CAMEO.radius }], [cameo]);

  useLayoutEffect(() => {
    camera.rotation.order = "YXZ";
    camera.position.set(...spawn.position);
    camera.rotation.set(spawn.pitch, spawn.yaw, 0);
    input.x = spawn.position[0];
    input.y = spawn.position[1] - WALK.eyeHeight;
    input.z = spawn.position[2];
    input.yaw = spawn.yaw;
    input.pitch = FOLLOW_CAMERA.defaultPitch;
    input.facing = spawn.yaw + Math.PI;
    input.walkBlend = input.walkPhase = 0;
    input.snapCamera = true;
    velocity.current = { x: 0, z: 0 };
    report.current = { elapsed: 1, target: null, location: "" };
    clearInput(input);
  }, [scene, spawn, camera, input]);

  useEffect(() => {
    if (!active) {
      clearInput(input);
      velocity.current = { x: 0, z: 0 };
      return;
    }
    let dragging = false;
    const keyDown = (event: KeyboardEvent) => {
      if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
        event.preventDefault();
        input.keys.add(event.code);
      }
    };
    const keyUp = (event: KeyboardEvent) => { input.keys.delete(event.code); };
    const mouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement && !(dragLook && dragging)) return;
      // Ignore implausible OS pointer-warp deltas when a lock is first acquired.
      if (Math.abs(event.movementX) > 450 || Math.abs(event.movementY) > 450) return;
      input.lookX += event.movementX * WALK.mouseSensitivity;
      input.lookY += event.movementY * WALK.mouseSensitivity;
    };
    const down = (event: PointerEvent) => { if (event.button === 0) dragging = true; };
    const up = () => { dragging = false; };
    const reset = () => { clearInput(input); dragging = false; velocity.current = { x: 0, z: 0 }; };
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
    document.addEventListener("mousemove", mouseMove);
    gl.domElement.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      document.removeEventListener("keydown", keyDown);
      document.removeEventListener("keyup", keyUp);
      document.removeEventListener("mousemove", mouseMove);
      gl.domElement.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
      clearInput(input);
    };
  }, [active, dragLook, gl, input]);

  useFrame((_, frameDelta) => {
    const dt = Math.min(frameDelta, 0.1);
    if (input.snapCamera) velocity.current = { x: 0, z: 0 };
    let travelled = 0;
    if (active) {
      input.yaw -= input.lookX;
      input.pitch = Math.max(FOLLOW_CAMERA.minPitch, Math.min(FOLLOW_CAMERA.maxPitch, input.pitch + input.lookY));
      input.lookX = input.lookY = 0;
      const keys = input.keys;
      let strafe = input.moveX + (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) - (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0);
      let forward = input.moveY + (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) - (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0);
      const magnitude = Math.hypot(strafe, forward);
      if (magnitude > 1) { strafe /= magnitude; forward /= magnitude; }
      const targetX = (strafe * Math.cos(input.yaw) - forward * Math.sin(input.yaw)) * WALK.speed;
      const targetZ = (-strafe * Math.sin(input.yaw) - forward * Math.cos(input.yaw)) * WALK.speed;
      const blend = 1 - Math.exp(-WALK.acceleration * dt);
      velocity.current.x += (targetX - velocity.current.x) * blend;
      velocity.current.z += (targetZ - velocity.current.z) * blend;
      npcCollider[0].x = cameo.x;
      npcCollider[0].z = cameo.z;
      const next = moveWithCollisions(scene, input.x, input.z, velocity.current.x * dt, velocity.current.z * dt, scene === "interior" ? npcCollider : undefined);
      const dx = next.x - input.x;
      const dz = next.z - input.z;
      travelled = Math.hypot(dx, dz);
      if (travelled > 0.0001) input.facing = turnTowards(input.facing, Math.atan2(dx, dz), 1 - Math.exp(-12 * dt));
      input.x = next.x;
      input.y = floorHeight(scene, next.x, next.z);
      input.z = next.z;
    }
    const walking = dt > 0 ? Math.min(1, travelled / dt / 3.3) : 0;
    input.walkBlend += (walking - input.walkBlend) * (1 - Math.exp(-12 * dt));
    input.walkPhase += Math.min(travelled, dt * 3.3) * 3;
    if (started) {
      const pose = followCameraPose(scene, input.x, input.y, input.z, input.yaw, input.pitch);
      if (input.snapCamera) {
        camera.position.set(...pose.position);
        input.snapCamera = false;
      } else {
        camera.position.lerp(cameraDestination.set(...pose.position), 1 - Math.exp(-FOLLOW_CAMERA.damping * dt));
        const clipped = clipCameraBoom(scene, pose.target, [camera.position.x, camera.position.y, camera.position.z]);
        camera.position.set(...clipped);
      }
      camera.lookAt(...pose.target);
    }
    report.current.elapsed += frameDelta;
    if (report.current.elapsed > 0.12) {
      report.current.elapsed = 0;
      const target = interactionTarget(scene, input.x, input.z, cameo);
      const location = locationName(scene, input.x, input.z);
      if (target !== report.current.target || location !== report.current.location) {
        report.current.target = target;
        report.current.location = location;
        onStatus(target, location);
      }
    }
  }, -2);
  return <CharacterModel motion={input} variant="player" name="player-avatar" visible={started} />;
}
