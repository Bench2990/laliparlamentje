"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { clearInput, type InputState } from "@/lib/input";
import { moveWithCollisions } from "@/lib/collisions";
import { WALK, floorHeight, isNearDoor, locationName, type SceneId, type Spawn } from "@/lib/world";

type Props = {
  scene: SceneId;
  spawn: Spawn;
  input: InputState;
  active: boolean;
  dragLook: boolean;
  onStatus: (nearDoor: boolean, location: string) => void;
};

export default function PlayerController({ scene, spawn, input, active, dragLook, onStatus }: Props) {
  const { camera, gl } = useThree();
  const angles = useRef({ yaw: spawn.yaw, pitch: spawn.pitch });
  const velocity = useRef({ x: 0, z: 0 });
  const report = useRef({ elapsed: 0, near: false, location: "" });

  useLayoutEffect(() => {
    camera.rotation.order = "YXZ";
    camera.position.set(...spawn.position);
    angles.current = { yaw: spawn.yaw, pitch: spawn.pitch };
    camera.rotation.set(spawn.pitch, spawn.yaw, 0);
    input.x = spawn.position[0];
    input.z = spawn.position[2];
    velocity.current = { x: 0, z: 0 };
    report.current = { elapsed: 1, near: false, location: "" };
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
    if (active) {
      const a = angles.current;
      a.yaw -= input.lookX;
      a.pitch = Math.max(-WALK.maxPitch, Math.min(WALK.maxPitch, a.pitch - input.lookY));
      input.lookX = input.lookY = 0;
      camera.rotation.set(a.pitch, a.yaw, 0);
      const keys = input.keys;
      let strafe = input.moveX + (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) - (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0);
      let forward = input.moveY + (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) - (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0);
      const magnitude = Math.hypot(strafe, forward);
      if (magnitude > 1) { strafe /= magnitude; forward /= magnitude; }
      const targetX = (strafe * Math.cos(a.yaw) - forward * Math.sin(a.yaw)) * WALK.speed;
      const targetZ = (-strafe * Math.sin(a.yaw) - forward * Math.cos(a.yaw)) * WALK.speed;
      const blend = 1 - Math.exp(-WALK.acceleration * dt);
      velocity.current.x += (targetX - velocity.current.x) * blend;
      velocity.current.z += (targetZ - velocity.current.z) * blend;
      const next = moveWithCollisions(scene, camera.position.x, camera.position.z, velocity.current.x * dt, velocity.current.z * dt);
      camera.position.x = next.x;
      camera.position.z = next.z;
      const height = floorHeight(scene, next.x, next.z) + WALK.eyeHeight;
      camera.position.y += (height - camera.position.y) * (1 - Math.exp(-18 * dt));
      input.x = next.x;
      input.z = next.z;
    }
    report.current.elapsed += frameDelta;
    if (report.current.elapsed > 0.12) {
      report.current.elapsed = 0;
      const near = isNearDoor(scene, input.x, input.z);
      const location = locationName(scene, input.x, input.z);
      if (near !== report.current.near || location !== report.current.location) {
        report.current.near = near;
        report.current.location = location;
        onStatus(near, location);
      }
    }
  });
  return null;
}
