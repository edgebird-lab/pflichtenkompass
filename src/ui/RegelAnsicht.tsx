/**
 * Regelansicht mit dmn-js 18 (NavigatedViewer, nur lesen; Spezifikation 5.5). Wird per
 * dynamischem Import geladen, damit dmn-js nicht im Hauptbundle landet. Die Bedienung ist ins
 * Deutsche übersetzt; Treffer des Profils sind in DRD und Tabellen markiert. Das
 * bpmn.io-Wasserzeichen bleibt sichtbar (Lizenz, 7.1).
 */
import NavigatedViewer from 'dmn-js/lib/NavigatedViewer'
import 'dmn-js/dist/assets/diagram-js.css'
import 'dmn-js/dist/assets/dmn-js-shared.css'
import 'dmn-js/dist/assets/dmn-js-drd.css'
import 'dmn-js/dist/assets/dmn-js-decision-table.css'
import 'dmn-js/dist/assets/dmn-font/css/dmn-embedded.css'
import { useEffect, useRef, useState } from 'react'
import { REGELN_XML } from '../regeln/regelwerk'

/** Texte der Viewer-Oberfläche von dmn-js, die in der Regelansicht vorkommen. */
const DEUTSCH: Readonly<Record<string, string>> = {
  When: 'Wenn',
  And: 'Und',
  Then: 'Dann',
  'Hit policy:': 'Trefferregel:',
  Collect: 'Collect',
  'Collects the values of all matching rules': 'Sammelt die Ausgaben aller zutreffenden Regeln (COLLECT)',
  'View DRD': 'Zur Übersicht (DRD)',
  Annotations: 'Begründung',
  'Open decision table': 'Entscheidungstabelle öffnen',
  'Open literal expression': 'Ausdruck öffnen',
  'Input label: ': 'Eingabe: ',
  'Input expression: ': 'Ausdruck: ',
  'Input values': 'Erlaubte Werte',
  'Input type': 'Datentyp',
  'Output label': 'Ausgabe',
  'Output name': 'Name der Ausgabe',
  'Output values': 'Erlaubte Ausgaben',
  'Output type': 'Datentyp der Ausgabe',
  'Decision name: ': 'Entscheidung: ',
}

function uebersetze(vorlage: string, ersatz?: Record<string, string>): string {
  return (DEUTSCH[vorlage] ?? vorlage).replace(/{([^}]+)}/g, (_, k: string) => ersatz?.[k] ?? `{${k}}`)
}

/** Ersetzt den Übersetzungsdienst von diagram-js und table-js (Modul im didi-Format). */
const UEBERSETZUNG = { translate: ['value', uebersetze] }

interface Box {
  x: number
  y: number
  width: number
  height: number
}
interface Leinwand {
  viewbox(box?: Box): Box & { inner: Box }
  addMarker(id: string, klasse: string): void
  removeMarker(id: string, klasse: string): void
}

/**
 * Zeigt den ganzen DRD ab dem Ursprung: Oben links blendet dmn-js den Namen der Definitionen
 * ein; die Formen liegen deshalb ab y = 150 und dürfen beim Einpassen nicht nach oben rutschen.
 */
function zeigeGanz(canvas: Leinwand): void {
  const { inner } = canvas.viewbox()
  const x = Math.min(0, inner.x) - 20
  canvas.viewbox({ x, y: Math.min(0, inner.y), width: inner.x + inner.width + 20 - x, height: inner.y + inner.height + 30 })
}

export interface RegelAnsichtProps {
  /** Treffer je Entscheidung (Entscheidungs-ID → Regel-IDs). */
  treffer: ReadonlyMap<string, ReadonlySet<string>>
  /** „drd“ oder die ID einer Entscheidung. */
  ansicht: string
  onAnsicht: (ansicht: string) => void
}

export function RegelAnsicht({ treffer, ansicht, onAnsicht }: RegelAnsichtProps) {
  const behaelter = useRef<HTMLDivElement>(null)
  const viewer = useRef<NavigatedViewer | null>(null)
  const meldeAnsicht = useRef(onAnsicht)
  const [bereit, setBereit] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)
  const [aktiv, setAktiv] = useState('drd')

  useEffect(() => {
    meldeAnsicht.current = onAnsicht
  }, [onAnsicht])

  useEffect(() => {
    const c = behaelter.current
    if (!c) return
    const v = new NavigatedViewer({ container: c, drd: { additionalModules: [UEBERSETZUNG] }, decisionTable: { additionalModules: [UEBERSETZUNG] } })
    viewer.current = v
    v.on('views.changed', ({ activeView }) => {
      if (!activeView) return
      const id = activeView.type === 'drd' ? 'drd' : activeView.element.id
      setAktiv(id)
      meldeAnsicht.current(id)
    })
    v.importXML(REGELN_XML)
      .then(() => {
        const canvas = v.getActiveViewer()?.get<Leinwand>('canvas')
        if (canvas) zeigeGanz(canvas)
        setBereit(true)
      })
      .catch((e: unknown) => setFehler(e instanceof Error ? e.message : String(e)))
    return () => {
      v.destroy()
      viewer.current = null
    }
  }, [])

  // Gewünschte Ansicht öffnen (Knöpfe außerhalb der Leinwand)
  useEffect(() => {
    const v = viewer.current
    if (!v || !bereit || ansicht === aktiv) return
    const ziel = v.getViews().find((x) => (ansicht === 'drd' ? x.type === 'drd' : x.type === 'decisionTable' && x.element.id === ansicht))
    if (ziel) void v.open(ziel)
  }, [ansicht, aktiv, bereit])

  // Im DRD: Entscheidungen mit Treffern umranden
  useEffect(() => {
    const v = viewer.current
    if (!v || !bereit || aktiv !== 'drd') return
    const canvas = v.getActiveViewer()?.get<Leinwand>('canvas')
    if (!canvas) return
    zeigeGanz(canvas)
    const ids = v.getViews().filter((x) => x.type === 'decisionTable').map((x) => x.element.id)
    for (const id of ids) {
      canvas.removeMarker(id, 'pk-hat-treffer')
      if ((treffer.get(id)?.size ?? 0) > 0) canvas.addMarker(id, 'pk-hat-treffer')
    }
  }, [treffer, aktiv, bereit])

  // In Tabellen: Zeilen der Treffer markieren; dmn-js zeichnet die Tabelle neu, deshalb mit MutationObserver
  useEffect(() => {
    const c = behaelter.current
    if (!c) return
    const markiere = () => {
      const ids = treffer.get(aktiv)
      for (const zeile of c.querySelectorAll<HTMLTableRowElement>('.tjs-table tbody tr')) {
        const id = zeile.querySelector('[data-row-id]')?.getAttribute('data-row-id') ?? ''
        zeile.classList.toggle('pk-treffer', !!ids?.has(id))
      }
      // Der waagerecht scrollbare Bereich der Tabelle muss per Tastatur erreichbar sein (WCAG 2.1.1)
      for (const bereich of c.querySelectorAll<HTMLElement>('.tjs-table-container:not([tabindex])')) {
        bereich.tabIndex = 0
        bereich.setAttribute('role', 'region')
        bereich.setAttribute('aria-label', `Entscheidungstabelle ${viewer.current?.getActiveView()?.element.name ?? ''}`.trim())
      }
    }
    markiere()
    const beobachter = new MutationObserver(markiere)
    beobachter.observe(c, { childList: true, subtree: true })
    return () => beobachter.disconnect()
  }, [treffer, aktiv])

  return (
    <div className="dmn-rahmen">
      {fehler && (
        <p className="banner banner-fehler" role="alert">
          Die Regelansicht konnte nicht geladen werden: {fehler}
        </p>
      )}
      <div ref={behaelter} className={`dmn-leinwand${aktiv === 'drd' ? ' dmn-leinwand-drd' : ''}`} data-ansicht={aktiv} />
    </div>
  )
}
