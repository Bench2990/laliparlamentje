"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import type { InputState } from "@/lib/input";

export default function MobileJoystick({ input, enabled }: { input: InputState; enabled: boolean }) {
  const pointer = useRef<number | null>(null);
  const element = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const reset = useCallback(() => {
    pointer.current = null;
    input.moveX = input.moveY = 0;
    setKnob({ x: 0, y: 0 });
  }, [input]);
  useEffect(() => { if (!enabled) reset(); }, [enabled, reset]);
  useEffect(() => {
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
      input.moveX = input.moveY = 0;
    };
  }, [input, reset]);
  const update = (event: PointerEvent<HTMLDivElement>) => {
    const rect = element.current!.getBoundingClientRect();
    let x = event.clientX - (rect.left + rect.width / 2);
    let y = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(x, y);
    const radius = rect.width * 0.3;
    if (distance > radius) { x *= radius / distance; y *= radius / distance; }
    input.moveX = x / radius;
    input.moveY = -y / radius;
    setKnob({ x, y });
  };
  const down = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled || pointer.current !== null) return;
    event.preventDefault();
    event.stopPropagation();
    pointer.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    update(event);
  };
  const release = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== pointer.current) return;
    event.preventDefault();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    reset();
  };
  return (
    <div className="joystick-wrap">
      <div ref={element} className="joystick" role="group" aria-label="Mozgásjoystick" data-testid="joystick"
        onPointerDown={down}
        onPointerMove={(event) => { if (enabled && event.pointerId === pointer.current) { event.preventDefault(); update(event); } }}
        onPointerUp={release} onPointerCancel={release} onLostPointerCapture={reset}>
        <span className="joystick-ring" />
        <span className="joystick-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
      </div>
      <span className="touch-caption">MOZGÁS</span>
    </div>
  );
}
