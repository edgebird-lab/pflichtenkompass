/**
 * Regeln (Spezifikation 5.5): Katalogversion, Stand, Prüfwert der DMN-Datei, Regeln je Tabelle;
 * dmn-js lazy geladen; Treffer des Profils als markierte Zeilen und als Liste; Quellen Q1–Q17.
 */
import { lazy, Suspense, useMemo, useState } from 'react'
import { datumText } from '../../fristen/datum'
import { luecke } from '../../katalog/luecken'
import { pflicht } from '../../katalog/pflichten'
import { QUELLEN } from '../../katalog/quellen'
import { KATALOG_STAND, KATALOG_VERSION, type LueckeId, type PflichtId } from '../../katalog/typen'
import stand from '../../../regeln/stand.json'
import { SCHRITTE } from '../../zustand'
import { useApp } from '../kontext'
import { ExternerLink } from '../Normen'
import { Weiterleiste } from './FragenSchritt'

const RegelAnsicht = lazy(() => import('../RegelAnsicht').then((m) => ({ default: m.RegelAnsicht })))

export function RegelnSchritt() {
  const { regelwerk, regelFehler, ergebnis } = useApp()
  const [ansicht, setAnsicht] = useState('drd')
  const info = SCHRITTE.find((s) => s.id === 'regeln')!

  /** Treffer je Tabelle mit Ausgabe, nach Regel-ID sortiert. */
  const treffer = useMemo(() => {
    const je = new Map<string, { regel: string; ausgabe: string }[]>()
    const dazu = (tabelle: string, regel: string, ausgabe: string) => je.set(tabelle, [...(je.get(tabelle) ?? []), { regel, ausgabe }])
    for (const e of ergebnis?.pflichten ?? []) for (const t of e.treffer) dazu(t.tabelle, t.regel, pflicht(e.pflicht.id as PflichtId).titel)
    for (const l of ergebnis?.luecken ?? []) for (const t of l.treffer) dazu(t.tabelle, t.regel, `Hinweis: ${luecke(l.luecke.id as LueckeId).titel}`)
    for (const liste of je.values()) liste.sort((a, b) => (a.regel < b.regel ? -1 : 1))
    return je
  }, [ergebnis])
  const trefferIds = useMemo(() => new Map([...treffer].map(([tabelle, liste]) => [tabelle, new Set(liste.map((x) => x.regel))])), [treffer])

  return (
    <div className="schritt">
      <h1 id="schritt-titel">Regeln</h1>
      <p className="einleitung">
        Ob eine Pflicht gilt, entscheiden sieben Entscheidungstabellen nach DMN 1.3 (Hit Policy COLLECT). Ihre Eingaben sind Merkmale, die die App aus den Antworten ableitet; die Fristen
        rechnet sie danach getrennt. Die Datei <code>regeln/pflichten.dmn</code> lässt sich mit dem Camunda Modeler oder auf demo.bpmn.io öffnen.
      </p>
      <dl className="stand">
        <div>
          <dt>Katalog</dt>
          <dd>{KATALOG_VERSION}</dd>
        </div>
        <div>
          <dt>Stand</dt>
          <dd>{datumText(KATALOG_STAND)}</dd>
        </div>
        <div>
          <dt>Prüfwert (SHA-256)</dt>
          <dd>
            <code>{stand.sha256['pflichten.dmn'].slice(0, 12)}</code>
          </dd>
        </div>
        <div>
          <dt>Regeln je Tabelle</dt>
          <dd>{regelwerk ? regelwerk.tabellen.map((t) => `${t.regeln[0]?.id.slice(0, 2) ?? ''} ${t.regeln.length}`).join(' · ') : '…'}</dd>
        </div>
      </dl>
      {regelFehler && (
        <p className="banner banner-fehler" role="alert">
          Die Regeln konnten nicht geladen werden: {regelFehler}
        </p>
      )}
      {!ergebnis && <p className="banner banner-hinweis">Treffer erscheinen, sobald die Pflichtangaben vollständig sind.</p>}

      {regelwerk && (
        <div className="ansicht-wahl" role="group" aria-label="Ansicht der Regeln">
          <button type="button" className="knopf knopf-klein" aria-pressed={ansicht === 'drd'} onClick={() => setAnsicht('drd')}>
            Übersicht (DRD)
          </button>
          {regelwerk.tabellen.map((t) => (
            <button key={t.id} type="button" className="knopf knopf-klein" aria-pressed={ansicht === t.id} onClick={() => setAnsicht(t.id)}>
              {t.name} <span className="leise">({treffer.get(t.id)?.length ?? 0} Treffer)</span>
            </button>
          ))}
        </div>
      )}

      <Suspense fallback={<div className="dmn-laden">Regelansicht wird geladen …</div>}>
        <RegelAnsicht treffer={trefferIds} ansicht={ansicht} onAnsicht={setAnsicht} />
      </Suspense>
      <p className="leise klein">Ziehen verschiebt die Übersicht, Strg und Mausrad zoomen. Ein Klick auf das Tabellensymbol einer Entscheidung öffnet ihre Tabelle; markierte Zeilen treffen zu.</p>

      {regelwerk && ergebnis && (
        <section className="karte" aria-labelledby="treffer-titel">
          <h2 id="treffer-titel">Zutreffende Regeln bei diesem Profil</h2>
          {regelwerk.tabellen.map((t) => {
            const liste = treffer.get(t.id) ?? []
            return (
              <div key={t.id} className="treffer-tabelle">
                <h3>
                  {t.name} <span className="leise">({liste.length === 1 ? '1 Treffer' : `${liste.length} Treffer`})</span>
                </h3>
                {liste.length > 0 ? (
                  <ul className="liste-eng">
                    {liste.map((x) => (
                      <li key={`${x.regel}-${x.ausgabe}`}>
                        <code>{x.regel}</code> {x.ausgabe}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="leise klein">Keine Regel trifft zu.</p>
                )}
              </div>
            )
          })}
        </section>
      )}

      <section className="karte" aria-labelledby="quellen-titel">
        <h2 id="quellen-titel">Quellen</h2>
        <div className="tabelle-rahmen">
          <table className="quellen">
            <thead>
              <tr>
                <th scope="col">Nr.</th>
                <th scope="col">Quelle</th>
                <th scope="col">Stand laut Seite</th>
                <th scope="col">Abgerufen</th>
              </tr>
            </thead>
            <tbody>
              {QUELLEN.map((q) => (
                <tr key={q.id}>
                  <td>{q.id}</td>
                  <td>
                    <ExternerLink href={q.url}>{q.titel}</ExternerLink>
                  </td>
                  <td>{q.stand}</td>
                  <td>{datumText(q.abgerufen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Weiterleiste info={info} />
    </div>
  )
}
