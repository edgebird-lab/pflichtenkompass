/**
 * „Für die Beratungsakte speichern“: fragt nach dem Mandanten (vorbelegt mit dem Namen des
 * Vorhabens) und zeigt, was die Datei im offenen Format Beratungsakte v1 enthält. Gespeichert
 * wird erst mit „Speichern“ über `onSpeichern`; scheitert das, bleibt der Dialog mit Meldung offen.
 */
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { dateinameBeratungsakte, type Beratungsakte } from '../beratungsakte/beratungsakte'
import { beratungsakteAusErgebnis, mandantAusProjekt } from '../export/beratungsakte'
import { HINWEISTEXT } from '../katalog/hinweis'
import type { Projekt } from '../modell/typen'
import type { Ergebnis } from '../regeln/typen'
import { Feld } from './Eingaben'

const anzahl = (n: number, eins: string, viele: string) => `${n} ${n === 1 ? eins : viele}`
const PFLICHT_MELDUNG = 'Bitte den Mandanten angeben.'

export function BeratungsakteDialog({
  projekt,
  ergebnis,
  quelldatei,
  onSpeichern,
  onSchliessen,
}: {
  projekt: Projekt
  ergebnis: Ergebnis
  quelldatei: string | null
  onSpeichern: (akte: Beratungsakte) => Promise<void>
  onSchliessen: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const mandantFeld = useRef<HTMLInputElement>(null)
  const [jetzt] = useState(() => new Date())
  const [mandant, setMandant] = useState(() => mandantAusProjekt(projekt))
  const [kennung, setKennung] = useState('')
  const [meldung, setMeldung] = useState<string | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [laeuft, setLaeuft] = useState(false)
  // Der Inhalt hängt nicht vom Mandanten ab: einmal rechnen, nicht bei jedem Tastendruck
  const vorschau = useMemo(() => beratungsakteAusErgebnis({ projekt, ergebnis, mandant: { name: 'Mandant' }, jetzt, quelldatei }), [projekt, ergebnis, jetzt, quelldatei])
  const dateiname = dateinameBeratungsakte({ ...vorschau, mandant: { name: mandant } })

  useEffect(() => {
    const d = dialog.current
    if (d && !d.open) d.showModal()
    mandantFeld.current?.focus()
  }, [])

  const absenden = async (ev: FormEvent) => {
    ev.preventDefault()
    if (!mandant.trim()) {
      setMeldung(PFLICHT_MELDUNG)
      mandantFeld.current?.focus()
      return
    }
    setLaeuft(true)
    setFehler(null)
    try {
      await onSpeichern(beratungsakteAusErgebnis({ projekt, ergebnis, mandant: { name: mandant, kennung }, jetzt, quelldatei }))
    } catch (e) {
      setFehler(`Die Datei konnte nicht gespeichert werden: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setLaeuft(false)
    }
  }

  return (
    <dialog
      ref={dialog}
      className="dialog akte-dialog"
      aria-labelledby="akte-titel"
      onCancel={(e) => {
        e.preventDefault()
        onSchliessen()
      }}
    >
      <form onSubmit={(e) => void absenden(e)} noValidate>
        <h2 id="akte-titel">Für die Beratungsakte speichern</h2>
        <p className="leise">Pflichten, Fristen und nicht geprüfte Bereiche dieses Ergebnisses als Datei im offenen Format Beratungsakte v1 (JSON).</p>
        <Feld id="akte-mandant" label="Mandant" meldungen={{ fehler: meldung }}>
          {(f) => (
            <input
              ref={mandantFeld}
              id={f.id}
              type="text"
              autoComplete="off"
              required
              aria-required="true"
              aria-invalid={f.ungueltig || undefined}
              aria-describedby={f.beschrieben}
              value={mandant}
              onChange={(e) => {
                setMandant(e.target.value)
                setMeldung(null)
              }}
            />
          )}
        </Feld>
        <Feld id="akte-kennung" label="Mandantennummer (optional)">
          {(f) => <input id={f.id} type="text" autoComplete="off" value={kennung} onChange={(e) => setKennung(e.target.value)} />}
        </Feld>
        <p className="akte-inhalt">
          Enthält: {anzahl(vorschau.kennzahlen.length, 'Kennzahl', 'Kennzahlen')}, {anzahl(vorschau.befunde.length, 'Befund', 'Befunde')},{' '}
          {anzahl(vorschau.massnahmen.length, 'Maßnahme', 'Maßnahmen')}
          <span className="akte-datei">Datei: {dateiname}</span>
        </p>
        <p className="hinweis-kasten klein">
          <strong>Keine Rechtsberatung.</strong> {HINWEISTEXT} Der Hinweis steht auch in der Datei.
        </p>
        {fehler && (
          <p className="feld-meldung" role="alert">
            {fehler}
          </p>
        )}
        <div className="knopfreihe dialog-knoepfe">
          <button type="button" className="knopf" onClick={onSchliessen}>
            Abbrechen
          </button>
          <button type="submit" className="knopf knopf-haupt" disabled={laeuft}>
            Speichern
          </button>
        </div>
      </form>
    </dialog>
  )
}
