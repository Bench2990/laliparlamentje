export type TransitionPhase = "out" | "in" | null;

export default function SceneTransition({ phase }: { phase: TransitionPhase }) {
  return <div className={`scene-transition ${phase === "out" ? "is-covered" : ""}`} aria-hidden="true" style={{ pointerEvents: phase ? "all" : "none" }} />;
}
