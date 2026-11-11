import { FRAGEN } from '../../modell/fragen'
import { SCHRITTE, type SchrittInfo } from '../../zustand'
import { FrageFeld } from '../FrageFeld'
import { useApp } from '../kontext'

/** Fragen-Schritte 1–5 (Spezifikation 5.1, 5.2): nur sichtbare Fragen; ausgeblendete wirken nicht. */
export function FragenSchritt({ info }: { info: SchrittInfo }) {
  const { z } = useApp()
  const fragen = FRAGEN.filter((f) => f.schritt === info.id && f.sichtbar(z.projekt.profil))
  return (
    <div className="schritt">
      <h1 id="schritt-titel">{info.name}</h1>
      <p className="leise">
        Schritt {info.nr} von 5 · {fragen.length === 1 ? '1 Frage' : `${fragen.length} Fragen`}; weitere erscheinen, wenn eine Antwort sie nötig macht.
      </p>
      <form className="karte formular" aria-labelledby="schritt-titel" onSubmit={(e) => e.preventDefault()}>
        {fragen.map((f) => (
          <FrageFeld key={f.id} frage={f} />
        ))}
      </form>
      <Weiterleiste info={info} />
    </div>
  )
}

/** „Zurück“ und „Weiter“ zwischen den Schritten. */
export function Weiterleiste({ info }: { info: SchrittInfo }) {
  const { geheZu } = useApp()
  const i = SCHRITTE.findIndex((s) => s.id === info.id)
  const zurueck = SCHRITTE[i - 1]
  const weiter = SCHRITTE[i + 1]
  return (
    <div className="knopfreihe weiterleiste">
      {zurueck && (
        <button type="button" className="knopf" onClick={() => geheZu(zurueck.id)}>
          Zurück: {zurueck.name}
        </button>
      )}
      {weiter && (
        <button type="button" className="knopf knopf-haupt" onClick={() => geheZu(weiter.id)}>
          Weiter: {weiter.name}
        </button>
      )}
    </div>
  )
}
