import Environment from "./Environment";
import Parliament from "./Parliament";
import KossuthSquare from "./KossuthSquare";
import Danube from "./Danube";
import SurroundingBuildings from "./SurroundingBuildings";
import MagyarPeter from "./MagyarPeter";

export default function ExteriorScene({ lowQuality, active }: { lowQuality: boolean; active: boolean }) {
  return <><Environment lowQuality={lowQuality} /><Parliament /><KossuthSquare /><Danube /><SurroundingBuildings /><MagyarPeter active={active} /></>;
}
