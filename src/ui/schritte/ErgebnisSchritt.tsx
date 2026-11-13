/**
 * Ergebnis (Spezifikation 5.3): Pflichten nach Zeitpunkt, Kasten „Nicht geprüft“ mit Sprungmarke,
 * Warnungen, Neu-Markierung, Änderungshinweis nach dem Öffnen einer Datei (4.8), Filter nach
 * Gruppe und Status, Lücken am Ende.
 */
import { useRef, useState } from 'react'
import { dateinameBeratungsakte, serialisiereBeratungsakte, type Beratungsakte } from '../../beratungsakte/beratungsakte'
import { datumText } from '../../fristen/datum'
import { HINWEISTEXT } from '../../katalog/hinweis'
import { GRUPPEN, istPflichtId, pflicht } from '../../katalog/pflichten'
import type { Gruppe, PflichtId } from '../../katalog/typen'
import { BEARBEITUNGEN, type Bearbeitung } from '../../modell/typen'
import { aenderungenSeitSpeichern, nachZeitpunkt, vergleiche } from '../../regeln/auswertung'
import type { Ergebnis } from '../../regeln/typen'
import { SCHRITTE } from '../../zustand'
import { plattform } from '../../plattform'
import { BeratungsakteDialog } from '../BeratungsakteDialog'
import { useApp } from '../kontext'
import { Lueckenkarte, Pflichtkarte } from '../Pflichtkarte'
import { BEARBEITUNG_TEXT } from '../texte'
import { DruckKnoepfe } from './DruckKnoepfe'
import { Weiterleiste } from './FragenSchritt'
import { FehlendeAngaben } from './FehlendeAngaben'

const titelVon = (id: string) => (istPflichtId(id) ? `„${pflicht(id).titel}“` : `„${id}“ (nicht mehr im Katalog)`)

function Aenderungshinweis({ ergebnis }: { ergebnis: Ergebnis }) {
  const { z, dispatch } = useApp()
  const g = z.projekt.gespeichert
  if (!z.geoeffnet) return null
  const a = aenderungenSeitSpeichern(g, ergebnis)
  const nichts = a.neu.length + a.entfallen.length + a.geaendert.length === 0
  return (
    <section className="banner banner-hinweis" aria-labelledby="aenderung-titel">
      <div>
        <h2 id="aenderung-titel">Änderungen seit dem Speichern</h2>
        {!g ? (
          <p>„{z.geoeffnet}“ enthält keinen gespeicherten Stand; ein Vergleich ist nicht möglich.</p>
        ) : (
          <>
            <p>
              „{z.geoeffnet}“ wurde am {datumText(g.am)} mit Katalog {g.katalogVersion} gespeichert. {nichts && 'Seitdem hat sich an der Pflichtenliste nichts geändert.'}
            </p>
            {a.neu.length > 0 && <p>Neu: {a.neu.map(titelVon).join(', ')}</p>}
            {a.entfallen.length > 0 && <p>Entfallen: {a.entfallen.map(titelVon).join(', ')}</p>}
            {a.geaendert.length > 0 && <p>Mit neuem Stand: {a.geaendert.map(titelVon).join(', ')}</p>}
          </>
        )}
      </div>
      <button type="button" className="knopf knopf-klein" onClick={() => dispatch({ typ: 'hinweisGelesen' })}>
        Hinweis schließen
      </button>
    </section>
  )
}

export function ErgebnisSchritt() {
  const { z, heute, ergebnis, datei, melde } = useApp()
  const [akteOffen, setAkteOffen] = useState(false)
  const akteKnopf = useRef<HTMLButtonElement>(null)
  const [gruppe, setGruppe] = useState<Gruppe | 'alle'>('alle')
  const [bearbeitung, setBearbeitung] = useState<Bearbeitung | 'alle'>('alle')
  const info = SCHRITTE.find((s) => s.id === 'ergebnis')!

  if (!ergebnis) {
    return (
      <div className="schritt">
        <h1 id="schritt-titel" tabIndex={-1}>Ergebnis</h1>
        <FehlendeAngaben />
        <Weiterleiste info={info} />
      </div>
    )
  }

  const schliesseAkte = () => {
    setAkteOffen(false)
    requestAnimationFrame(() => akteKnopf.current?.focus())
  }
  // Wie die übrigen Exporte: im Programm über den Speichern-Dialog, im Browser als Download
  const speichereAkte = async (akte: Beratungsakte) => {
    const ort = await plattform.speichernUnter(dateinameBeratungsakte(akte), serialisiereBeratungsakte(akte), 'beratungsakte')
    schliesseAkte()
    if (ort) melde(`Für die Beratungsakte gespeichert: ${ort.name}`)
  }

  const statusVon = (id: PflichtId) => z.projekt.status[id]?.bearbeitung ?? 'offen'
  const gefiltert = ergebnis.pflichten.filter((e) => (gruppe === 'alle' || e.pflicht.gruppe === gruppe) && (bearbeitung === 'alle' || statusVon(e.pflicht.id) === bearbeitung))
  const gruppen = nachZeitpunkt(gefiltert, heute)
  const entfallen = vergleiche(z.vorher, ergebnis).entfallen
  const n = ergebnis.pflichten.length
  const l = ergebnis.luecken.length

  return (
    <div className="schritt">
      <h1 id="schritt-titel" tabIndex={-1}>Ergebnis</h1>
      <p className="zusammenfassung" data-testid="zusammenfassung">
        <strong>{n === 1 ? '1 Pflicht' : `${n} Pflichten`}</strong> und {l === 1 ? '1 Hinweis' : `${l} Hinweise`} auf nicht geprüfte Bereiche · Katalog {ergebnis.katalogVersion},
        Rechtsstand {datumText(ergebnis.stand)}
      </p>
      <div className="hinweis-kasten" role="note">
        <p>
          <strong>Keine Rechtsberatung.</strong> {HINWEISTEXT}
        </p>
      </div>

      <Aenderungshinweis ergebnis={ergebnis} />

      {entfallen.length > 0 && (
        <div className="banner banner-hinweis" role="status">
          <p>Seit dem letzten Blick auf das Ergebnis entfallen: {entfallen.map(titelVon).join(', ')}.</p>
        </div>
      )}

      {ergebnis.warnungen.length > 0 && (
        <div className="banner banner-warnung">
          <ul>
            {ergebnis.warnungen.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {l > 0 && (
        <div className="kasten-luecken">
          <p>
            <strong>Nicht geprüft:</strong> {l === 1 ? 'Ein Bereich passt' : `${l} Bereiche passen`} zu diesem Profil, sind in Version 0.1 aber nicht geprüft.{' '}
            <a href="#luecken">Zu den nicht geprüften Bereichen</a>
          </p>
        </div>
      )}

      <div className="filter" role="group" aria-label="Filter">
        <label>
          Gruppe{' '}
          <select value={gruppe} onChange={(e) => setGruppe(e.target.value as Gruppe | 'alle')}>
            <option value="alle">alle</option>
            {GRUPPEN.map((g) => (
              <option key={g.id} value={g.id}>
                {g.titel}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status{' '}
          <select value={bearbeitung} onChange={(e) => setBearbeitung(e.target.value as Bearbeitung | 'alle')}>
            <option value="alle">alle</option>
            {BEARBEITUNGEN.map((b) => (
              <option key={b} value={b}>
                {BEARBEITUNG_TEXT[b]}
              </option>
            ))}
          </select>
        </label>
        <span className="leise klein" aria-live="polite">
          {gefiltert.length === n ? 'alle Pflichten' : `${gefiltert.length} von ${n} Pflichten`}
        </span>
      </div>

      {gruppen.length === 0 && <p className="leise">Keine Pflicht passt zum Filter.</p>}
      {gruppen.map((g) => (
        <section key={g.zeitpunkt} className="gruppe" aria-labelledby={`gruppe-${g.zeitpunkt}`}>
          <h2 id={`gruppe-${g.zeitpunkt}`}>
            {g.titel} <span className="leise">({g.pflichten.length})</span>
          </h2>
          {g.pflichten.map((e) => (
            <Pflichtkarte key={e.pflicht.id} e={e} />
          ))}
        </section>
      ))}

      {l > 0 && (
        <section id="luecken" className="gruppe" aria-labelledby="luecken-titel" tabIndex={-1}>
          <h2 id="luecken-titel">
            Nicht geprüft <span className="leise">({l})</span>
          </h2>
          <p className="leise">Diese Bereiche passen zum Profil, sind in Version 0.1 aber nicht geprüft. Sie sind keine Pflichtenliste; hier lohnt sich eine eigene Prüfung oder Beratung.</p>
          {ergebnis.luecken.map((x) => (
            <Lueckenkarte key={x.luecke.id} luecke={x.luecke} treffer={x.treffer} />
          ))}
        </section>
      )}

      <div className="knopfreihe">
        <DruckKnoepfe />
        <button type="button" className="knopf" onClick={() => void datei.speichern()}>
          {plattform.desktop ? 'Speichern' : 'Als Datei speichern'}
        </button>
        <button type="button" className="knopf" ref={akteKnopf} onClick={() => setAkteOffen(true)}>
          Für die Beratungsakte speichern
        </button>
      </div>
      {akteOffen && <BeratungsakteDialog projekt={z.projekt} ergebnis={ergebnis} quelldatei={datei.quelldatei()} onSpeichern={speichereAkte} onSchliessen={schliesseAkte} />}
      <Weiterleiste info={info} />
    </div>
  )
}
