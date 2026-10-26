import Environment from "./Environment";
import Parliament from "./Parliament";
import KossuthSquare from "./KossuthSquare";
import Danube from "./Danube";
import SurroundingBuildings from "./SurroundingBuildings";

export default function ExteriorScene({ lowQuality }: { lowQuality: boolean }) {
  return <><Environment lowQuality={lowQuality} /><Parliament /><KossuthSquare /><Danube /><SurroundingBuildings /></>;
}
