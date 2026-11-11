/**
 * Druckansicht (Spezifikation 5.6): A4 hoch, immer hell. Kopf mit Vorhaben, Rechtsform, Land,
 * Start, Katalogversion und Druckdatum; je Gruppe eine Tabelle; danach Lücken und die nächsten
 * 12 Termine. Fußzeile mit Hinweistext und Seitenzahl kommt aus `@page` in styles.css.
 * Auf dem Bildschirm ist sie ausgeblendet; `window.print()` zeigt nur sie.
 */
import { datumMitTag, datumText } from '../fristen/datum'
import { naechsterTermin } from '../fristen/termine'
import { HINWEISTEXT } from '../katalog/hinweis'
import { normenText } from '../katalog/normen'
import { BUNDESLAND_NAMEN } from '../modell/fragen'
import { bedingungText, nachZeitpunkt } from '../regeln/auswertung'
import type { Ergebnis, Treffer } from '../regeln/typen'
import { useApp } from './kontext'
import { BEARBEITUNG_TEXT, rechtsformText, terminText, terminZusatz } from './texte'

function warumZeile(treffer: readonly Treffer[]): string {
  return treffer.map((t) => `${t.begruendung}${t.bedingungen.length ? ` (${t.bedingungen.map((b) => bedingungText(b, true)).join(' · ')})` : ''}`).join(' | ')
}

export function Druckansicht({ ergebnis }: { ergebnis: Ergebnis }) {
  const { z, heute } = useApp()
  const p = z.projekt.profil
  const naechste = ergebnis.pflichten
    .flatMap((e) => e.termine.map((t) => ({ t, e })))
    .filter((x) => x.t.faelligAm >= heute)
    .sort((a, b) => (a.t.faelligAm < b.t.faelligAm ? -1 : a.t.faelligAm > b.t.faelligAm ? 1 : a.e.pflicht.nr - b.e.pflicht.nr))
    .slice(0, 12)

  return (
    <div className="druck">
      <header className="druck-kopf">
        <h1>Pflichten-Kompass: {p.name.trim() || 'Vorhaben ohne Namen'}</h1>
        <dl>
          <div>
            <dt>Rechtsform</dt>
            <dd>{rechtsformText(p.rechtsform)}</dd>
          </div>
          <div>
            <dt>Bundesland</dt>
            <dd>{p.bundesland ? BUNDESLAND_NAMEN[p.bundesland] : '–'}</dd>
          </div>
          <div>
            <dt>Start</dt>
            <dd>{datumText(p.start)}</dd>
          </div>
          <div>
            <dt>Katalog</dt>
            <dd>
              {ergebnis.katalogVersion} (Rechtsstand {datumText(ergebnis.stand)})
            </dd>
          </div>
          <div>
            <dt>Gedruckt am</dt>
            <dd>{datumText(heute)}</dd>
          </div>
        </dl>
        <p className="druck-hinweis">
          <strong>Keine Rechtsberatung.</strong> {HINWEISTEXT}
        </p>
        <p>
          {ergebnis.pflichten.length} Pflichten und {ergebnis.luecken.length} Hinweise auf nicht geprüfte Bereiche.
        </p>
      </header>

      {nachZeitpunkt(ergebnis.pflichten, heute).map((g) => (
        <section key={g.zeitpunkt} className="druck-gruppe">
          <h2>{g.titel}</h2>
          <table>
            <thead>
              <tr>
                <th scope="col">Pflicht</th>
                <th scope="col">Frist und nächster Termin</th>
                <th scope="col">Stelle</th>
                <th scope="col">Normen</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            {g.pflichten.map((e) => {
              const t = naechsterTermin(e.termine, heute)
              const status = z.projekt.status[e.pflicht.id]
              return (
                <tbody key={e.pflicht.id} className="druck-pflicht">
                  <tr>
                    <td>
                      <strong>
                        {e.pflicht.nr}. {e.pflicht.titel}
                      </strong>
                    </td>
                    <td>
                      {e.pflicht.fristText}
                      {t && (
                        <>
                          <br />
                          Nächster Termin: {datumMitTag(t.faelligAm)}
                          {t.gesetzlichBis && ` (gesetzlich bis ${datumMitTag(t.gesetzlichBis)})`}
                          {terminZusatz(t, e.pflicht.titel)}
                        </>
                      )}
                    </td>
                    <td>
                      {e.pflicht.stelle}
                      {e.pflicht.weg && `; ${e.pflicht.weg}`}
                    </td>
                    <td>{normenText(e.pflicht.normen)}</td>
                    <td>
                      {BEARBEITUNG_TEXT[status?.bearbeitung ?? 'offen']}
                      {status?.notiz && (
                        <>
                          <br />
                          {status.notiz}
                        </>
                      )}
                    </td>
                  </tr>
                  <tr className="druck-warum">
                    <td colSpan={5}>Warum? {warumZeile(e.treffer)}</td>
                  </tr>
                </tbody>
              )
            })}
          </table>
        </section>
      ))}

      {ergebnis.luecken.length > 0 && (
        <section className="druck-gruppe">
          <h2>Nicht geprüft</h2>
          <ul>
            {ergebnis.luecken.map((l) => (
              <li key={l.luecke.id}>
                <strong>{l.luecke.titel}:</strong> In Version 0.1 nicht geprüft: {l.luecke.text}
              </li>
            ))}
          </ul>
        </section>
      )}

      {naechste.length > 0 && (
        <section className="druck-gruppe">
          <h2>Die nächsten {naechste.length} Termine</h2>
          <table>
            <thead>
              <tr>
                <th scope="col">Datum</th>
                <th scope="col">Termin</th>
                <th scope="col">Stelle</th>
              </tr>
            </thead>
            <tbody>
              {naechste.map(({ t, e }) => (
                <tr key={`${t.pflichtId}-${t.schluessel}`}>
                  <td>
                    {datumMitTag(t.faelligAm)}
                    {t.gesetzlichBis && ` (gesetzlich bis ${datumMitTag(t.gesetzlichBis)})`}
                  </td>
                  <td>{terminText(t)}</td>
                  <td>{e.pflicht.stelle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
