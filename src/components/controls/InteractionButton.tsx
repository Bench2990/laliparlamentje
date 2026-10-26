import type { SceneId } from "@/lib/world";
import type { InteractionTarget } from "@/lib/cameo";
import { ArrowIcon, DoorIcon } from "@/components/ui/Icons";

export default function InteractionButton({ scene, target, mobile, onInteract }: { scene: SceneId; target: NonNullable<InteractionTarget>; mobile: boolean; onInteract: () => void }) {
  const entering = scene === "exterior";
  const cameo = target === "cameo";
  return (
    <button className={`interaction-button ${mobile ? "interaction-mobile" : ""}`} onClick={onInteract} aria-keyshortcuts={mobile ? undefined : cameo ? "F" : "E"}>
      {mobile ? !cameo && <DoorIcon /> : <kbd>{cameo ? "F" : "E"}</kbd>}
      <span>{cameo ? "Pofon 👋" : mobile ? entering ? "Belépés" : "Kilépés" : entering ? "Belépés az Országházba" : "Kilépés az Országházból"}</span>
      <ArrowIcon />
    </button>
  );
}
