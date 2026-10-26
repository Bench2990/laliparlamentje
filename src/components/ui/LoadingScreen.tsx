import { ParliamentIcon } from "./Icons";

export default function LoadingScreen() {
  return <div className="loading-screen" role="status"><ParliamentIcon /><span className="loading-eyebrow">AZ ORSZÁGHÁZ</span><p>Budapest ébredezik…</p><span className="loading-line" /></div>;
}
