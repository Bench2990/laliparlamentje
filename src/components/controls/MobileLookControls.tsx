"use client";

import { useCallback, useEffect, useRef, type PointerEvent } from "react";
import type { InputState } from "@/lib/input";
import { WALK } from "@/lib/world";
import { LookIcon } from "@/components/ui/Icons";

export default function MobileLookControls({ input, enabled }: { input: InputState; enabled: boolean }) {
  const pointer = useRef<number | null>(null);
  const last = useRef({ x: 0, y: 0 });
  const reset = useCallback(() => { pointer.current = null; input.lookX = input.lookY = 0; }, [input]);
  useEffect(() => { if (!enabled) reset(); }, [enabled, reset]);
  useEffect(() => {
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    return () => { window.removeEventListener("blur", reset); document.removeEventListener("visibilitychange", reset); };
  }, [reset]);
  const release = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== pointer.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    pointer.current = null;
  };
  return (
    <div className="mobile-look" aria-label="Húzd az ujjad a körbenézéshez" data-testid="touch-look"
      onPointerDown={(event) => {
        if (!enabled || pointer.current !== null) return;
        event.preventDefault();
        pointer.current = event.pointerId;
        last.current = { x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!enabled || pointer.current !== event.pointerId) return;
        event.preventDefault();
        input.lookX += (event.clientX - last.current.x) * WALK.touchSensitivity;
        input.lookY += (event.clientY - last.current.y) * WALK.touchSensitivity;
        last.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={release} onPointerCancel={release} onLostPointerCapture={() => { pointer.current = null; }}>
      <div className="look-hint"><LookIcon /><span className="touch-caption">KÖRBENÉZÉS</span></div>
    </div>
  );
}
