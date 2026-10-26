import type { SceneId } from "@/lib/world";
import { ArrowIcon, DoorIcon } from "@/components/ui/Icons";

export default function InteractionButton({ scene, mobile, onInteract }: { scene: SceneId; mobile: boolean; onInteract: () => void }) {
  const entering = scene === "exterior";
  return (
    <button className={`interaction-button ${mobile ? "interaction-mobile" : ""}`} onClick={onInteract}>
      {mobile ? <DoorIcon /> : <kbd>E</kbd>}
      <span>{mobile ? entering ? "Belépés" : "Kilépés" : entering ? "Belépés az Országházba" : "Kilépés az Országházból"}</span>
      <ArrowIcon />
    </button>
  );
}
