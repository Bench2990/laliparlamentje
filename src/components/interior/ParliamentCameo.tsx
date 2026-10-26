"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { CAMEO, cameoRoute, type CameoState } from "@/lib/cameo";
import { turnTowards } from "@/lib/characters";
import type { InputState } from "@/lib/input";
import { WALK } from "@/lib/world";
import { advanceSlap, slapPhase, type SlapPhase } from "@/lib/slap";
import CharacterModel from "@/components/characters/CharacterModel";

const REACTIONS: Record<SlapPhase, string> = {
  idle: "", swing: "Csak rajzfilm! 👋", wobble: "CSATT! ✨", falling: "Hoppááá!",
  floor: "Egy pillanat… csillagokat számolok!", recovering: "Na, séta tovább!",
};

export default function ParliamentCameo({ cameo, input, active, slapping, onSlapImpact, onSlapEnd }: {
  cameo: CameoState; input: InputState; active: boolean; slapping: boolean; onSlapImpact: () => void; onSlapEnd: () => void;
}) {
  const [labelVisible, setLabelVisible] = useState(false);
  const [phase, setPhase] = useState<SlapPhase>("idle");
  const lastPhase = useRef<SlapPhase>("idle");
  const label = useRef(false);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const showLabel = input.z < -36 && Math.hypot(input.x - cameo.x, input.z - cameo.z) < 17;
    if (showLabel !== label.current) { label.current = showLabel; setLabelVisible(showLabel); }
    if (!active) { cameo.walkBlend = 0; return; }
    const reacting = cameo.slapTime !== null;
    if (reacting) {
      const event = advanceSlap(cameo, dt);
      if (event.impact) onSlapImpact();
      if (event.finished) onSlapEnd();
    }
    const nextPhase = slapPhase(cameo.slapTime);
    if (nextPhase !== lastPhase.current) {
      lastPhase.current = nextPhase;
      setPhase(nextPhase);
    }
    let travelled = 0;
    if (!reacting) {
      const next = cameoRoute(cameo.pathTime + dt);
      // Politely wait rather than walking into the visitor or pushing them aside.
      if (Math.hypot(next.x - input.x, next.z - input.z) > CAMEO.radius + WALK.radius + 0.18) {
        travelled = Math.hypot(next.x - cameo.x, next.z - cameo.z);
        cameo.pathTime += dt;
        cameo.x = next.x;
        cameo.z = next.z;
        cameo.facing = turnTowards(cameo.facing, next.facing, 1 - Math.exp(-5 * dt));
      }
    }
    const blend = 1 - Math.exp(-8 * dt);
    cameo.walkBlend = reacting ? 0 : cameo.walkBlend + ((travelled > 0.0001 ? 0.65 : 0) - cameo.walkBlend) * blend;
    cameo.walkPhase += travelled * 7;
  }, -3);

  return (
    <CharacterModel motion={cameo} slap={cameo} variant="cameo" name="parliament-cameo">
      {(labelVisible || slapping) && <Html position={[0, 2.12, 0]} center zIndexRange={[34, 26]} style={{ pointerEvents: "none" }}>
        {slapping ? <div className="cameo-reaction" role="status" data-testid="cameo-reaction" data-phase={phase}><span>{CAMEO.label}</span><p>{REACTIONS[phase]}</p><small>Rajzfilmes tréfa · senki sem sérül meg</small></div> : <div className="cameo-name">Viktor <span>· karikatúra</span></div>}
      </Html>}
    </CharacterModel>
  );
}
