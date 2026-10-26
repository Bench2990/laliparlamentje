"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { GeometryKind, Part, Surface } from "@/lib/model";

function pointedPath(path: THREE.Shape | THREE.Path, width = 1, height = 1, bottom = 0) {
  path.moveTo(-width / 2, bottom);
  path.lineTo(width / 2, bottom);
  path.lineTo(width / 2, bottom + height * 0.62);
  path.quadraticCurveTo(width / 2, bottom + height * 0.81, 0, bottom + height);
  path.quadraticCurveTo(-width / 2, bottom + height * 0.81, -width / 2, bottom + height * 0.62);
  path.closePath();
}

function geometry(kind: GeometryKind): THREE.BufferGeometry {
  switch (kind) {
    case "box": return new THREE.BoxGeometry(1, 1, 1);
    case "cylinder": return new THREE.CylinderGeometry(1, 1, 1, 10);
    case "cone": return new THREE.ConeGeometry(1, 1, 8);
    case "sphere": return new THREE.IcosahedronGeometry(1, 1);
    case "leaf": return new THREE.IcosahedronGeometry(1, 1);
    case "torus": return new THREE.TorusGeometry(1, 0.1, 5, 20);
    case "arch": {
      const shape = new THREE.Shape();
      pointedPath(shape);
      return new THREE.ShapeGeometry(shape, 8);
    }
    case "archFrame": {
      const shape = new THREE.Shape();
      pointedPath(shape, 1.25, 1.11, -0.035);
      const hole = new THREE.Path();
      pointedPath(hole, 1, 1, 0);
      shape.holes.push(hole);
      return new THREE.ExtrudeGeometry(shape, { depth: 0.18, bevelEnabled: false, curveSegments: 8 });
    }
    case "roof": {
      // A true triangular prism: ridge runs along X, with closed gable ends.
      const shape = new THREE.Shape();
      shape.moveTo(-0.5, 0);
      shape.lineTo(0.5, 0);
      shape.lineTo(0, 1);
      shape.closePath();
      const result = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
      result.translate(0, 0, -0.5);
      result.rotateY(Math.PI / 2);
      return result;
    }
    case "dome": {
      const profile = [[0, 0], [11.4, 0], [12, 0.7], [12.1, 2.5], [11.4, 6], [10.1, 10], [8.1, 14], [5.9, 18], [3.5, 21.5], [2.5, 23], [0, 23]];
      return new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 48);
    }
    case "shield": {
      const shape = new THREE.Shape();
      shape.moveTo(-0.5, 0.5);
      shape.lineTo(0.5, 0.5);
      shape.lineTo(0.45, -0.2);
      shape.quadraticCurveTo(0.35, -0.5, 0, -0.7);
      shape.quadraticCurveTo(-0.35, -0.5, -0.45, -0.2);
      shape.closePath();
      return new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false });
    }
  }
}

function material(surface: Surface) {
  return new THREE.MeshStandardMaterial({
    roughness: surface === "metal" ? 0.46 : surface === "window" ? 0.31 : 0.9,
    metalness: surface === "metal" ? 0.5 : surface === "window" ? 0.23 : 0,
    side: surface === "window" ? THREE.DoubleSide : THREE.FrontSide,
    ...(surface === "glow" ? { emissive: "#ffd893", emissiveIntensity: 1.3 } : {}),
  });
}

function InstanceBatch({ parts, kind, surface, shadows }: {
  parts: Part[]; kind: GeometryKind; surface: Surface; shadows: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => geometry(kind), [kind]);
  const mat = useMemo(() => material(surface), [surface]);
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const object = new THREE.Object3D();
    const color = new THREE.Color();
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      object.position.set(...p.position);
      object.scale.set(...p.scale);
      object.rotation.set(...(p.rotation ?? [0, 0, 0]));
      object.updateMatrix();
      mesh.setMatrixAt(i, object.matrix);
      mesh.setColorAt(i, color.set(p.color));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [parts]);

  return (
    <instancedMesh
      ref={ref}
      args={[geo, mat, parts.length]}
      castShadow={shadows && surface !== "window" && surface !== "glow" && surface !== "matte"}
      receiveShadow={surface !== "glow"}
    />
  );
}

export default function StaticModel({ parts, shadows = true }: { parts: Part[]; shadows?: boolean }) {
  const batches = useMemo(() => {
    const result = new Map<string, { kind: GeometryKind; surface: Surface; parts: Part[] }>();
    for (const part of parts) {
      const surface = part.surface ?? "stone";
      const key = `${part.kind}:${surface}`;
      if (!result.has(key)) result.set(key, { kind: part.kind, surface, parts: [] });
      result.get(key)!.parts.push(part);
    }
    return [...result.entries()];
  }, [parts]);

  return <group>{batches.map(([key, batch]) => <InstanceBatch key={key} {...batch} shadows={shadows} />)}</group>;
}
