"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { canOccupy } from "@/lib/collisions";
import { floorHeight, WALK, type SceneId } from "@/lib/world";
import { clearInput, type InputState } from "@/lib/input";

export type WalkTestApi = {
  snapshot: () => { scene: SceneId; x: number; y: number; z: number; yaw: number; pitch: number; moveX: number; moveY: number; calls: number; triangles: number };
  place: (x: number, z: number, yaw?: number, pitch?: number) => void;
};

declare global { interface Window { __parliamentTest?: WalkTestApi } }

// Mounted ONLY with NEXT_PUBLIC_E2E=1 by Playwright. The production build
// eliminates this branch. No test navigation or globals ship to visitors.
export default function SceneTestBridge({ scene, input }: { scene: SceneId; input: InputState }) {
  const { camera, gl } = useThree();
  useEffect(() => {
    window.__parliamentTest = {
      snapshot: () => ({ scene, x: camera.position.x, y: camera.position.y, z: camera.position.z, yaw: camera.rotation.y, pitch: camera.rotation.x, moveX: input.moveX, moveY: input.moveY, calls: gl.info.render.calls, triangles: gl.info.render.triangles }),
      place: (x, z, yaw = 0, pitch = 0.08) => {
        if (!canOccupy(scene, x, z)) throw new Error(`Invalid test pose: ${scene} ${x},${z}`);
        clearInput(input);
        camera.position.set(x, floorHeight(scene, x, z) + WALK.eyeHeight, z);
        input.x = x;
        input.z = z;
        input.lookX = camera.rotation.y - yaw;
        input.lookY = camera.rotation.x - pitch;
      },
    };
    return () => { delete window.__parliamentTest; };
  }, [camera, gl, scene, input]);
  return null;
}
