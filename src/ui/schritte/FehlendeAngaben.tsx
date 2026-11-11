import { frage, frageNummer } from '../../modell/fragen'
import { SCHRITTE } from '../../zustand'
import { fokussiereFrage } from '../fokus'
import { useApp } from '../kontext'

/** Statt eines Ergebnisses: was noch fehlt, mit Sprung zur Frage (6.9: „Ergebnis erst nach Antwort“). */
export function FehlendeAngaben() {
  const { regelwerk, regelFehler, pruefung, geheZu } = useApp()
  if (regelFehler) {
    return (
      <div className="banner banner-fehler" role="alert">
        <p>Die Regeln konnten nicht geladen werden: {regelFehler}</p>
      </div>
    )
  }
  if (!regelwerk) return <p className="leise">Die Regeln werden geladen …</p>
  return (
    <div className="karte" role="status">
      <h2>Es fehlen noch Angaben</h2>
      <p>Das Ergebnis erscheint, sobald diese Angaben stimmen:</p>
      <ul className="fehlend">
        {pruefung.fehler.map((m) => {
          const f = frage(m.frage)
          const schritt = SCHRITTE.find((s) => s.id === f.schritt)
          return (
            <li key={`${m.frage}-${m.text}`}>
              <button
                type="button"
                className="knopf-link"
                onClick={() => {
                  geheZu(f.schritt)
                  fokussiereFrage(m.frage)
                }}
              >
                Frage {frageNummer(m.frage)} im Schritt „{schritt?.name}“
              </button>
              : {m.text}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
