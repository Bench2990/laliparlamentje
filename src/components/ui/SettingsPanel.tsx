"use client";

import { useEffect, useRef } from "react";
import { CloseIcon, ArrowIcon } from "./Icons";

export type Quality = "auto" | "high" | "low";

export default function SettingsPanel({ quality, onQuality, onClose, mobile }: {
  quality: Quality; onQuality: (value: Quality) => void; onClose: () => void; mobile: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog ref={ref} className="settings-panel" onCancel={(event) => { event.preventDefault(); onClose(); }} aria-labelledby="settings-title">
      <button className="icon-button settings-close" onClick={onClose} aria-label="Beállítások bezárása"><CloseIcon /></button>
      <span className="eyebrow">A SAJÁT TEMPÓDBAN</span>
      <h2 id="settings-title">Egy kellemesebb séta.</h2>
      <label htmlFor="quality">Megjelenítés minősége</label>
      <select id="quality" value={quality} onChange={(event) => onQuality(event.target.value as Quality)}>
        <option value="auto">Automatikus — az eszközödhöz igazítva</option>
        <option value="high">Részletgazdag</option>
        <option value="low">Kímélő — gördülékenyebb mozgás</option>
      </select>
      <p className="settings-note">A kímélő mód csökkenti a felbontást és az árnyékok részletességét. Az építészeti elemek megmaradnak.</p>
      <div className="settings-controls"><h3>Így barangolhatsz</h3>{mobile ? <p>Bal oldali joystick – Mozgás<br />Jobb oldal húzása – Körbenézés<br />A bejáratnál megjelenő gomb – Belépés vagy kilépés</p> : <p>W A S D vagy nyílbillentyűk – Mozgás<br />Egér – Körbenézés<br />E – Belépés vagy kilépés a bejáratnál<br />Esc – A séta szüneteltetése</p>}</div>
      <p className="about-note">Az Országház és környékének stilizált, szabadon bejárható építészeti értelmezése. Nem pontos műemléki felmérés; a belső terek a valódi épület hangulatát idézik.</p>
      <button className="start-button" onClick={onClose}><span>Vissza a sétához</span><ArrowIcon /></button>
    </dialog>
  );
}
