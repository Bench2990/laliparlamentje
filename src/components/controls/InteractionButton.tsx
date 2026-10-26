import type { SceneId } from "@/lib/world";
import type { InteractionTarget } from "@/lib/cameo";
import { ArrowIcon, DoorIcon, SpeechIcon } from "@/components/ui/Icons";

export default function InteractionButton({ scene, target, mobile, onInteract }: { scene: SceneId; target: NonNullable<InteractionTarget>; mobile: boolean; onInteract: () => void }) {
  const entering = scene === "exterior";
  const cameo = target === "cameo";
  return (
    <button className={`interaction-button ${mobile ? "interaction-mobile" : ""}`} onClick={onInteract}>
      {mobile ? cameo ? <SpeechIcon /> : <DoorIcon /> : <kbd>E</kbd>}
      <span>{cameo ? mobile ? "Megszólítás" : "Nyomj E-t a megszólításhoz" : mobile ? entering ? "Belépés" : "Kilépés" : entering ? "Belépés az Országházba" : "Kilépés az Országházból"}</span>
      <ArrowIcon />
    </button>
  );
}
