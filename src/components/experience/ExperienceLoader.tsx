"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { ParliamentIcon } from "@/components/ui/Icons";

export function WebGLFallback() {
  return <div className="webgl-fallback"><ParliamentIcon /><h1>Egy pillanat, mielőtt elindulunk.</h1><p>A háromdimenziós sétához WebGL 2 támogatás szükséges. Kapcsold be a böngésző hardveres gyorsítását, vagy próbálj egy frissebb böngészőt.</p><button className="start-button" onClick={() => window.location.reload()}>Újrapróbálom</button></div>;
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <WebGLFallback /> : this.props.children; }
}

const Experience = dynamic(() => import("./Experience"), { ssr: false, loading: () => <LoadingScreen /> });

export default function ExperienceLoader() {
  return <SceneBoundary><Experience /></SceneBoundary>;
}
