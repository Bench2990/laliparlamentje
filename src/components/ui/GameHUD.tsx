import { ParliamentIcon, PinIcon, SettingsIcon, SunIcon } from "./Icons";

export function ExperienceHeader({ started, onSettings }: { started: boolean; onSettings: () => void }) {
  return (
    <header className={`experience-header ${started ? "header-exploring" : ""}`}>
      <div className="brand"><ParliamentIcon /><div><span>AZ ORSZÁGHÁZ</span><small>BUDAPEST · EGY SZABAD SÉTA</small></div></div>
      <div className="header-actions"><span className="experience-badge"><i />FEDEZD FEL SZABADON</span><button className="icon-button" aria-label="Beállítások" onClick={onSettings}><SettingsIcon /></button></div>
    </header>
  );
}

export default function GameHUD({ location, mobile, interior, dragLook }: { location: string; mobile: boolean; interior: boolean; dragLook: boolean }) {
  return (
    <div className={`game-hud ${interior ? "hud-interior" : ""}`}>
      <div className="location-label"><PinIcon /><div><span>{interior ? "AZ ORSZÁGHÁZ BELSŐ TEREI" : "BUDAPEST, MAGYARORSZÁG"}</span><p aria-live="polite">{location}</p></div></div>
      {!mobile && <div className="desktop-hint"><kbd>WASD</kbd> Mozgás <i />{dragLook ? "Kattintás és húzás – Körbenézés" : "Egér – Körbenézés"}<i /><kbd>Esc</kbd> Szünet</div>}
      {!mobile && <div className="daytime-label"><SunIcon /><span>{interior ? "Belső séta" : "Nappali séta"}</span></div>}
      <div className="crosshair" aria-hidden="true" />
    </div>
  );
}
