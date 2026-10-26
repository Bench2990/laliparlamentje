"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Model, PALETTE as P } from "@/lib/model";
import StaticModel from "./StaticModel";

export const ENTRANCE_SIGN_TEXT = "Lali parlamentje";

export default function EntranceSign() {
  const { texture, draw } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1536;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    const draw = () => {
      ctx.fillStyle = "#23463c";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#bd9c60";
      ctx.lineWidth = 5;
      ctx.strokeRect(21, 21, 1494, 214);
      ctx.lineWidth = 1.5;
      ctx.strokeRect(32, 32, 1472, 192);
      ctx.font = '500 153px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#f4dfad";
      ctx.fillText(ENTRANCE_SIGN_TEXT, 768, 132, 1320);
      for (const x of [76, 1460]) {
        ctx.save();
        ctx.translate(x, 128);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = "#bd9c60";
        ctx.fillRect(-9, -9, 18, 18);
        ctx.restore();
      }
      texture.needsUpdate = true;
    };
    draw();
    return { texture, draw };
  }, []);
  useEffect(() => {
    let mounted = true;
    // Reuse the locally bundled UI font; never fetch a 3D font from a CDN.
    document.fonts.load('500 153px "Cormorant Garamond"').then(() => { if (mounted) draw(); });
    return () => { mounted = false; texture.dispose(); };
  }, [texture, draw]);
  const frame = useMemo(() => {
    const m = new Model();
    m.box([0, 0, 0], [10.6, 1.95, 0.35], P.trim);
    m.box([0, 0, 0.18], [10.3, 1.72, 0.14], "#b89b64", undefined, "metal");
    for (const side of [-1, 1]) {
      m.sphere([side * 5.48, 0, 0.03], [0.3, 0.3, 0.16], P.gold, "metal");
      m.box([side * 4.6, 0.15, -0.7], [0.14, 1.1, 1.4], P.bronze, undefined, "metal");
    }
    return m.parts;
  }, []);
  return (
    <group name="entrance-sign" position={[0, 13.25, 44.65]} userData={{ label: ENTRANCE_SIGN_TEXT }}>
      <StaticModel parts={frame} />
      <mesh name="entrance-sign-lettering" position={[0, 0, 0.265]}>
        <planeGeometry args={[10.1, 1.62]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}
