/**
 * Dialog „Kalender exportieren“ (Spezifikation 5.4, 7.5): Horizont 12 oder 24 Monate,
 * Erinnerung 0, 1, 3, 7 oder 14 Tage vorher, nur offene Pflichten, vergangene Termine.
 */
import { useEffect, useRef, useState } from 'react'
import { erzeugeIcs, exportEintraege, kalenderDateiname, profilSchluessel } from '../export/ics'
import type { Einstellungen } from '../modell/typen'
import { plattform } from '../plattform'
import { useApp } from './kontext'

const ERINNERUNGEN: readonly { wert: Einstellungen['erinnerungTage']; text: string }[] = [
  { wert: 0, text: 'keine Erinnerung' },
  { wert: 1, text: '1 Tag vorher' },
  { wert: 3, text: '3 Tage vorher' },
  { wert: 7, text: '7 Tage vorher' },
  { wert: 14, text: '14 Tage vorher' },
]

export function KalenderDialog({ offen, onSchliessen }: { offen: boolean; onSchliessen: () => void }) {
  const { z, heute, ergebnis, einstellungen, setzeEinstellungen, melde } = useApp()
  const [nurOffene, setNurOffene] = useState(true)
  const [laeuft, setLaeuft] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)

  const ausloeser = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (offen && !d.open) {
      ausloeser.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      setFehler(null)
      d.showModal()
    }
    if (!offen && d.open) {
      d.close()
      ausloeser.current?.focus()
    }
  }, [offen])

  const eintraege = ergebnis ? exportEintraege(ergebnis, z.projekt.status, { nurOffene, vergangene: einstellungen.vergangeneExportieren, heute }) : []

  const exportieren = async () => {
    if (!ergebnis) return
    setLaeuft(true)
    setFehler(null)
    try {
      const p = z.projekt.profil
      const ics = erzeugeIcs({
        vorhaben: p.name,
        eintraege,
        erinnerungTage: einstellungen.erinnerungTage,
        exportzeit: new Date(),
        profilschluessel: await profilSchluessel(p),
        katalogVersion: ergebnis.katalogVersion,
      })
      const ort = await plattform.speichernUnter(kalenderDateiname(p.name, heute), ics, 'kalender')
      if (ort) melde(`Kalender exportiert: ${ort.name} (${eintraege.length} Termine)`)
      onSchliessen()
    } catch (e) {
      // Der Dialog bleibt offen und sagt, was schiefging (vorher scheiterte der Export still)
      setFehler(`Die Kalenderdatei konnte nicht erstellt werden: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setLaeuft(false)
    }
  }

  return (
    <dialog
      ref={dialog}
      className="dialog"
      aria-labelledby="kalender-titel"
      onCancel={(e) => {
        e.preventDefault()
        onSchliessen()
      }}
    >
      <h2 id="kalender-titel">Kalender exportieren</h2>
      <p className="leise">Eine Kalenderdatei (.ics) zum Import in Outlook, Google Kalender oder den Kalender des Telefons.</p>
      <fieldset className="feld">
        <legend>Zeitraum</legend>
        <div className="optionen">
          {([12, 24] as const).map((m) => (
            <label key={m} className={`option${einstellungen.horizontMonate === m ? ' an' : ''}`}>
              <input type="radio" name="horizont" checked={einstellungen.horizontMonate === m} onChange={() => setzeEinstellungen({ horizontMonate: m })} />
              <span>{m} Monate ab dem Startmonat</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="feld">
        <label htmlFor="kalender-erinnerung">Erinnerung</label>
        <select id="kalender-erinnerung" value={einstellungen.erinnerungTage} onChange={(e) => setzeEinstellungen({ erinnerungTage: Number(e.target.value) as Einstellungen['erinnerungTage'] })}>
          {ERINNERUNGEN.map((x) => (
            <option key={x.wert} value={x.wert}>
              {x.text}
            </option>
          ))}
        </select>
      </div>
      <label className="haken">
        <input type="checkbox" checked={nurOffene} onChange={(e) => setNurOffene(e.target.checked)} /> Nur Pflichten mit Status „offen“
      </label>
      <label className="haken">
        <input type="checkbox" checked={einstellungen.vergangeneExportieren} onChange={(e) => setzeEinstellungen({ vergangeneExportieren: e.target.checked })} /> Auch Termine vor heute
      </label>
      <p aria-live="polite">
        <strong>{eintraege.length === 1 ? '1 Termin' : `${eintraege.length} Termine`}</strong> kommen in die Datei. Jeder Eintrag nennt Stelle, Rechtsgrundlage, Quelle und Stand und den Hinweis
        „Keine Rechts- oder Steuerberatung“.
      </p>
      <p className="leise klein">
        Manche Kalender übernehmen die Erinnerung beim Import nicht oder setzen eine eigene. Nach dem Import kurz prüfen; wie sich Outlook und Google Kalender verhalten, ist noch nicht geprüft.
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
        <button type="button" className="knopf knopf-haupt" disabled={laeuft || eintraege.length === 0} onClick={() => void exportieren()}>
          Exportieren
        </button>
      </div>
    </dialog>
  )
}
