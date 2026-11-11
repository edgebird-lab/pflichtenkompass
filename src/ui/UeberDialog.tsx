/** „Über den Pflichten-Kompass“ mit Version, Hinweis, Datenschutz und Lizenzen (Spezifikation 8). */
import { useEffect, useRef } from 'react'
import { datumText } from '../fristen/datum'
import { HINWEISTEXT } from '../katalog/hinweis'
import { KATALOG_STAND, KATALOG_VERSION } from '../katalog/typen'
import { VERSION } from '../version'

const LIZENZEN: readonly [string, string, string][] = [
  ['dmn-js 18.0.3', 'bpmn.io-Lizenz (MIT-Text mit der Pflicht, das bpmn.io-Wasserzeichen sichtbar zu lassen)', 'Anzeige der Entscheidungstabellen'],
  ['dmn-moddle 12.2.1', 'MIT', 'DMN-1.3-Datei lesen'],
  ['feiertagejs 1.5.1', 'MIT', 'Feiertage der Länder'],
  ['React 19.3.1', 'MIT', 'Oberfläche'],
]

export function UeberDialog({ offen, onSchliessen }: { offen: boolean; onSchliessen: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const ausloeser = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (offen && !d.open) {
      ausloeser.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      d.showModal()
    }
    if (!offen && d.open) {
      d.close()
      ausloeser.current?.focus()
    }
  }, [offen])

  return (
    <dialog
      ref={dialog}
      className="dialog"
      aria-labelledby="ueber-titel"
      onCancel={(e) => {
        e.preventDefault()
        onSchliessen()
      }}
    >
      <h2 id="ueber-titel">Pflichten-Kompass {VERSION}</h2>
      <p>Anmeldungen, Meldungen und Fristen für Gründungen aus einem geführten Interview, begründet mit Rechtsgrundlage, Quelle und Stand. Regeln als DMN 1.3, ohne Server und ohne KI.</p>
      <p>
        Katalog {KATALOG_VERSION}, Rechtsstand {datumText(KATALOG_STAND)}.
      </p>
      <p className="hinweis-kasten">
        <strong>Keine Rechtsberatung.</strong> {HINWEISTEXT}
      </p>
      <p>Datenschutz: Die App überträgt nichts. Antworten liegen nur im Speicher dieses Browsers oder in selbst gespeicherten Dateien.</p>
      <h3>Verwendete Bibliotheken</h3>
      <ul className="liste-eng">
        {LIZENZEN.map(([name, lizenz, zweck]) => (
          <li key={name}>
            <strong>{name}</strong>: {lizenz}; {zweck}
          </li>
        ))}
      </ul>
      <p className="leise klein">Ein Portfolio-Projekt von olbricht-digital. Die Lizenz des Pflichten-Kompasses selbst ist noch nicht festgelegt.</p>
      <div className="knopfreihe dialog-knoepfe">
        <button type="button" className="knopf knopf-haupt" onClick={onSchliessen}>
          Schließen
        </button>
      </div>
    </dialog>
  )
}
