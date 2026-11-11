/**
 * Termine (Spezifikation 5.4): Liste nach Monaten im Horizont mit Datum, Termin, Zeitraum,
 * Stelle und Art; „gesetzlich bis“ bei Abweichung; vergangene Termine grau.
 */
import { useState } from 'react'
import { datumMitTag, datumText, MONATE, zerlege } from '../../fristen/datum'
import type { Pflicht } from '../../katalog/typen'
import type { Termin } from '../../regeln/typen'
import { SCHRITTE } from '../../zustand'
import { KalenderDialog } from '../KalenderDialog'
import { useApp } from '../kontext'
import { TERMIN_ART_TEXT } from '../texte'
import { FehlendeAngaben } from './FehlendeAngaben'
import { Weiterleiste } from './FragenSchritt'

interface Zeile {
  termin: Termin
  pflicht: Pflicht
}

function nachMonaten(zeilen: Zeile[]): { monat: string; zeilen: Zeile[] }[] {
  const gruppen = new Map<string, Zeile[]>()
  for (const z of zeilen) {
    const { jahr, monat } = zerlege(z.termin.faelligAm)
    const name = `${MONATE[monat - 1]} ${jahr}`
    gruppen.set(name, [...(gruppen.get(name) ?? []), z])
  }
  return [...gruppen].map(([monat, liste]) => ({ monat, zeilen: liste }))
}

export function TermineSchritt() {
  const { heute, ergebnis, einstellungen } = useApp()
  const [dialog, setDialog] = useState(false)
  const info = SCHRITTE.find((s) => s.id === 'termine')!

  if (!ergebnis) {
    return (
      <div className="schritt">
        <h1 id="schritt-titel" tabIndex={-1}>Termine</h1>
        <FehlendeAngaben />
        <Weiterleiste info={info} />
      </div>
    )
  }

  const zeilen: Zeile[] = ergebnis.pflichten
    .flatMap((e) => e.termine.map((termin) => ({ termin, pflicht: e.pflicht })))
    .sort((a, b) => (a.termin.faelligAm < b.termin.faelligAm ? -1 : a.termin.faelligAm > b.termin.faelligAm ? 1 : a.pflicht.nr - b.pflicht.nr))
  const vergangen = zeilen.filter((x) => x.termin.faelligAm < heute).length

  return (
    <div className="schritt">
      <h1 id="schritt-titel" tabIndex={-1}>Termine</h1>
      <p className="zusammenfassung">
        <strong>{zeilen.length === 1 ? '1 Termin' : `${zeilen.length} Termine`}</strong> von {datumText(ergebnis.horizont.von)} bis {datumText(ergebnis.horizont.bis)} ({einstellungen.horizontMonate}{' '}
        Monate ab dem Startmonat){vergangen > 0 && `, davon ${vergangen} vor heute`}.
      </p>
      <div className="knopfreihe">
        <button type="button" className="knopf knopf-haupt" onClick={() => setDialog(true)}>
          Kalender exportieren …
        </button>
        <button type="button" className="knopf" onClick={() => window.print()}>
          Drucken oder als PDF speichern
        </button>
      </div>
      <p className="leise klein">
        Die Daten sind vorsichtig angesetzt: nie später als das gesetzliche Fristende. Wo das Gesetz mehr Zeit lässt, steht „gesetzlich bis“ dabei. Pflichten ohne feste Termine (laufend) stehen
        nur im Ergebnis.
      </p>

      {nachMonaten(zeilen).map((g) => (
        <section key={g.monat} className="monat" aria-labelledby={`monat-${g.monat.replace(' ', '-')}`}>
          <h2 id={`monat-${g.monat.replace(' ', '-')}`}>{g.monat}</h2>
          <div className="tabelle-rahmen">
            <table className="termine">
              <thead>
                <tr>
                  <th scope="col">Datum</th>
                  <th scope="col">Termin</th>
                  <th scope="col">Zeitraum</th>
                  <th scope="col">Stelle</th>
                  <th scope="col">Art</th>
                </tr>
              </thead>
              <tbody>
                {g.zeilen.map(({ termin: t, pflicht: p }) => {
                  const vorbei = t.faelligAm < heute
                  return (
                    <tr key={`${t.pflichtId}-${t.schluessel}`} className={vorbei ? 'vergangen' : undefined}>
                      <td className="datum">
                        <time dateTime={t.faelligAm}>{datumMitTag(t.faelligAm)}</time>
                        {vorbei && <span className="klein"> (vergangen)</span>}
                      </td>
                      <td>
                        <strong>{t.titel}</strong>
                        {t.gesetzlichBis && <span className="termin-zusatz">gesetzlich bis {datumMitTag(t.gesetzlichBis)}</span>}
                        {t.hinweis && <span className="termin-zusatz leise">{t.hinweis}</span>}
                      </td>
                      <td>{t.zeitraum ?? '–'}</td>
                      <td>
                        {p.stelle}
                        {p.weg && <span className="leise">; {p.weg}</span>}
                      </td>
                      <td>{TERMIN_ART_TEXT[t.art]}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      {zeilen.length === 0 && <p className="leise">Im Zeitraum gibt es keine Termine mit festem Datum.</p>}
      <KalenderDialog offen={dialog} onSchliessen={() => setDialog(false)} />
      <Weiterleiste info={info} />
    </div>
  )
}
