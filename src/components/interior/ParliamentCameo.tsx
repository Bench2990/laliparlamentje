"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { CAMEO, cameoRoute, type CameoState } from "@/lib/cameo";
import { turnTowards } from "@/lib/characters";
import type { InputState } from "@/lib/input";
import { WALK } from "@/lib/world";
import CharacterModel from "@/components/characters/CharacterModel";

export default function ParliamentCameo({ cameo, input, active, speaking, onSpeechEnd }: {
  cameo: CameoState; input: InputState; active: boolean; speaking: boolean; onSpeechEnd: () => void;
}) {
  const [labelVisible, setLabelVisible] = useState(false);
  const label = useRef(false);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const showLabel = input.z < -36 && Math.hypot(input.x - cameo.x, input.z - cameo.z) < 17;
    if (showLabel !== label.current) { label.current = showLabel; setLabelVisible(showLabel); }
    if (!active) { cameo.walkBlend = 0; return; }
    const greeting = cameo.greetingRemaining > 0;
    if (greeting) {
      cameo.greetingRemaining = Math.max(0, cameo.greetingRemaining - dt);
      cameo.facing = turnTowards(cameo.facing, Math.atan2(input.x - cameo.x, input.z - cameo.z), 1 - Math.exp(-5 * dt));
      if (cameo.greetingRemaining === 0) onSpeechEnd();
    }
    let travelled = 0;
    if (!greeting) {
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
    cameo.walkBlend += ((travelled > 0.0001 ? 0.65 : 0) - cameo.walkBlend) * blend;
    cameo.walkPhase += travelled * 7;
    cameo.wave += ((greeting ? 1 : 0) - cameo.wave) * blend;
  }, -3);

  return (
    <CharacterModel motion={cameo} variant="cameo" name="parliament-cameo">
      {(labelVisible || speaking) && <Html position={[0, 2.12, 0]} center zIndexRange={[34, 26]} style={{ pointerEvents: "none" }}>
        {speaking ? <div className="cameo-speech" role="status" data-testid="cameo-speech"><span>VIKTOR · FIKTÍV KARIKATÚRA</span><p>„{CAMEO.line}”</p></div> : <div className="cameo-name">Viktor <span>· karikatúra</span></div>}
      </Html>}
    </CharacterModel>
  );
}
