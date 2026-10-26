import { ArrowIcon, CompassIcon, DoorIcon, WalkIcon } from "./Icons";

export default function WelcomeScreen({ mobile, ready, onStart }: { mobile: boolean; ready: boolean; onStart: () => void }) {
  return (
    <section className="welcome-screen" aria-labelledby="welcome-title">
      <div className="welcome-wash" />
      <div className="welcome-content">
        <div className="eyebrow"><span />EGY SÉTA BUDAPEST SZÍVÉBEN</div>
        <h1 id="welcome-title" aria-label="Az Országház">Az <span className="title-line"><em>Országház</em><span className="title-period" aria-hidden="true">.</span></span></h1>
        <p className="welcome-subtitle">Fedezd fel a Parlamentet és környékét!</p>
        <p className="welcome-description">Lassulj le. Nézz körül. Indulj el.<br />A város legszebb részletei csak rád várnak.</p>
        <button className="start-button" onClick={onStart} disabled={!ready}>
          <span>{ready ? "Séta indítása" : "A tér életre kel…"}</span><ArrowIcon />
        </button>
        <div className="welcome-features"><span><WalkIcon />Szabad felfedezés</span><i /><span><DoorIcon />Kívül és belül</span></div>
      </div>
      <div className="welcome-scene-note" aria-hidden="true">
        <CompassIcon />
        <div><span>PEST, A DUNA PARTJÁN</span><p>Egy egészen új nézőpont.</p></div>
      </div>
      <footer className="welcome-footer">
        <div className="launch-controls">{mobile ? <><span className="control-dot" />Bal oldali joystick – Mozgás <b>·</b> Jobb oldal – Körbenézés</> : <><span className="key-cluster"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span><span>Mozgás</span><b>·</b><span>Egér – Körbenézés</span><b>·</b><kbd>E</kbd><span>Belépés</span></>}</div>
        <span className="footer-coordinates">47°30′25″ É &nbsp; 19°02′44″ K</span>
      </footer>
    </section>
  );
}
