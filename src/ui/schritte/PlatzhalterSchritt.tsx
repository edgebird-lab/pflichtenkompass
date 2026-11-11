import type { SchrittInfo } from '../../zustand'

/** Leerer Schritt im Gerüst (Phase 0); die Inhalte folgen in Phase 4. */
export function PlatzhalterSchritt({ info }: { info: SchrittInfo }) {
  return (
    <div className="schritt">
      <h1 id="schritt-titel">{info.name}</h1>
      <div className="karte">
        <p>{info.fragen ? `Hier stehen später die Fragen ${info.fragen}.` : 'Dieser Schritt zeigt später das Ergebnis der Auswertung.'}</p>
        <p className="leise">{info.zeigt}</p>
        <p className="leise klein">Noch nicht umgesetzt (Phase 4 der Spezifikation).</p>
      </div>
    </div>
  )
}
