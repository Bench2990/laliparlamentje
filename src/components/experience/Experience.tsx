"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useDevice } from "@/hooks/useDevice";
import { clearInput, createInput } from "@/lib/input";
import { INITIAL_SPAWN, SPAWNS, isNearDoor, type SceneId, type Spawn } from "@/lib/world";
import ExteriorScene from "@/components/world/ExteriorScene";
import InteriorScene from "@/components/interior/InteriorScene";
import MobileJoystick from "@/components/controls/MobileJoystick";
import MobileLookControls from "@/components/controls/MobileLookControls";
import InteractionButton from "@/components/controls/InteractionButton";
import WelcomeScreen from "@/components/ui/WelcomeScreen";
import GameHUD, { ExperienceHeader } from "@/components/ui/GameHUD";
import SettingsPanel, { type Quality } from "@/components/ui/SettingsPanel";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { ArrowIcon } from "@/components/ui/Icons";
import PlayerController from "./PlayerController";
import SceneTransition, { type TransitionPhase } from "./SceneTransition";
import SceneTestBridge from "./SceneTestBridge";
import { WebGLFallback } from "./ExperienceLoader";

function RenderTuning({ scene, mobile, lowQuality, onReady, onDprChange }: { scene: SceneId; mobile: boolean; lowQuality: boolean; onReady: () => void; onDprChange: (dpr: number) => void }) {
  const { gl, camera } = useThree();
  const frames = useRef(0);
  const sample = useRef({ seconds: 0, frames: 0, dpr: 1.5 });
  useEffect(() => {
    const dpr = Math.min(window.devicePixelRatio, lowQuality ? 1 : mobile ? 1.3 : 1.65);
    onDprChange(dpr);
    sample.current = { seconds: 0, frames: 0, dpr };
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = mobile ? 73 : 61;
      camera.updateProjectionMatrix();
    }
  }, [camera, mobile, lowQuality, onDprChange]);
  useEffect(() => {
    // All shadow-casting scenery is static. Bake once instead of redrawing
    // thousands of architectural parts into the shadow map on every frame.
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    frames.current = 0;
  }, [gl, scene, lowQuality]);
  useFrame((_, dt) => {
    if (++frames.current === 4) onReady();
    const s = sample.current;
    s.seconds += dt;
    s.frames++;
    if (s.seconds >= 4) {
      const fps = s.frames / s.seconds;
      if (fps < 32 && s.dpr > 0.8) {
        s.dpr = Math.max(0.8, s.dpr - 0.2);
        onDprChange(s.dpr);
      }
      s.seconds = s.frames = 0;
    }
  });
  return null;
}

export default function Experience() {
  const mobile = useDevice();
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [dragLook, setDragLook] = useState(false);
  const [scene, setScene] = useState<SceneId>("exterior");
  const [spawn, setSpawn] = useState<Spawn>(INITIAL_SPAWN);
  const [nearDoor, setNearDoor] = useState(false);
  const [location, setLocation] = useState("Kossuth Lajos tér");
  const [phase, setPhase] = useState<TransitionPhase>(null);
  const [settings, setSettings] = useState(false);
  const [quality, setQuality] = useState<Quality>("auto");
  // Keep Canvas and adaptive quality under one owner; a fixed Canvas DPR range
  // otherwise overwrites mobile/fallback resolution whenever the HUD re-renders.
  const [renderDpr, setRenderDpr] = useState(1);
  const [contextLost, setContextLost] = useState(false);
  const input = useMemo(createInput, []);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const transitioning = useRef(false);
  const awaitingArrival = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lowQuality = quality === "low" || (quality === "auto" && mobile);
  const playing = started && !settings && !phase && (mobile || locked || dragLook);
  const onReady = useCallback(() => {
    setReady(true);
    if (!awaitingArrival.current) return;
    awaitingArrival.current = false;
    // Fade in only after the destination has actually rendered. Shader compilation
    // on a slower phone must finish behind the curtain, not during the reveal.
    timers.current.push(setTimeout(() => setPhase("in"), 60));
    timers.current.push(setTimeout(() => { setPhase(null); transitioning.current = false; }, 510));
  }, []);

  useEffect(() => {
    if (!started) setSpawn(mobile ? { ...INITIAL_SPAWN, yaw: 1.43, pitch: 0.025 } : INITIAL_SPAWN);
  }, [mobile, started]);

  useEffect(() => {
    const lockChange = () => { setLocked(document.pointerLockElement === canvas.current); clearInput(input); };
    const lockError = () => { setDragLook(true); };
    const visibility = () => { clearInput(input); };
    document.addEventListener("pointerlockchange", lockChange);
    document.addEventListener("pointerlockerror", lockError);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("pointerlockchange", lockChange);
      document.removeEventListener("pointerlockerror", lockError);
      document.removeEventListener("visibilitychange", visibility);
      timers.current.forEach(clearTimeout);
    };
  }, [input]);

  const requestLook = useCallback(() => {
    if (mobile) return;
    const element = canvas.current;
    if (!element?.requestPointerLock) { setDragLook(true); return; }
    try {
      const result = element.requestPointerLock() as Promise<void> | undefined;
      result?.catch(() => setDragLook(true));
    } catch { setDragLook(true); }
  }, [mobile]);

  const interact = useCallback(() => {
    // Check the current controller position, not just a potentially stale UI prompt.
    if (!playing || transitioning.current || !isNearDoor(scene, input.x, input.z)) return;
    transitioning.current = true;
    clearInput(input);
    setNearDoor(false);
    setPhase("out");
    const destination: SceneId = scene === "exterior" ? "interior" : "exterior";
    timers.current.push(setTimeout(() => {
      awaitingArrival.current = true;
      setScene(destination);
      setSpawn(SPAWNS[destination]);
      setLocation(destination === "interior" ? "Díszlépcsőház" : "Az Országház főbejárata");
    }, 430));
  }, [input, playing, scene]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.code === "KeyE" && !event.repeat) { event.preventDefault(); interact(); }
      if (event.code === "Escape" && started && !settings) {
        if (document.pointerLockElement) document.exitPointerLock();
        setDragLook(false);
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [interact, dragLook, started, settings]);

  const onStatus = useCallback((near: boolean, name: string) => { setNearDoor(near); setLocation(name); }, []);
  const openSettings = () => {
    if (phase) return;
    clearInput(input);
    setSettings(true);
    if (document.pointerLockElement) document.exitPointerLock();
  };
  const closeSettings = () => { setSettings(false); if (started) requestLook(); };

  return (
    <div className={`experience ${scene === "interior" ? "is-interior" : ""}`} data-scene={scene} data-ready={ready} data-transition={phase ?? "idle"}>
      <Canvas
        shadows="soft"
        dpr={renderDpr}
        camera={{ position: INITIAL_SPAWN.position, fov: 61, near: 0.08, far: 1600 }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: false, stencil: false }}
        fallback={<WebGLFallback />}
        onCreated={({ gl }) => {
          canvas.current = gl.domElement;
          gl.domElement.setAttribute("aria-label", "Szabadon bejárható háromdimenziós Budapest");
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.domElement.addEventListener("webglcontextlost", (event) => { event.preventDefault(); clearInput(input); setContextLost(true); });
        }}
      >
        {scene === "exterior" ? <ExteriorScene lowQuality={lowQuality} /> : <InteriorScene lowQuality={lowQuality} />}
        <PlayerController scene={scene} spawn={spawn} input={input} active={playing} dragLook={dragLook} onStatus={onStatus} />
        <RenderTuning scene={scene} mobile={mobile} lowQuality={lowQuality} onReady={onReady} onDprChange={setRenderDpr} />
        {process.env.NEXT_PUBLIC_E2E === "1" && <SceneTestBridge scene={scene} input={input} />}
      </Canvas>
      <div className="top-scrim" />
      <ExperienceHeader started={started} onSettings={openSettings} />
      {!started && <WelcomeScreen mobile={mobile} ready={ready} onStart={() => { setStarted(true); requestLook(); }} />}
      {started && <>
        <GameHUD location={location} mobile={mobile} interior={scene === "interior"} dragLook={dragLook} />
        {mobile && <><MobileLookControls input={input} enabled={playing} /><MobileJoystick input={input} enabled={playing} /></>}
        {nearDoor && playing && <InteractionButton scene={scene} mobile={mobile} onInteract={interact} />}
        {!mobile && !locked && !dragLook && !settings && !phase && <div className="pause-overlay"><div className="pause-card"><span className="eyebrow">NINCS MIÉRT SIETNED</span><h2>A tér megvár.</h2><p>Kattints a folytatáshoz. Az Esc billentyűvel<br />bármikor elengedheted az egeret.</p><button className="start-button" onClick={requestLook}><span>Séta folytatása</span><ArrowIcon /></button></div></div>}
      </>}
      {settings && <SettingsPanel quality={quality} onQuality={setQuality} onClose={closeSettings} mobile={mobile} />}
      <SceneTransition phase={phase} />
      {!ready && <LoadingScreen />}
      {contextLost && <WebGLFallback />}
    </div>
  );
}
