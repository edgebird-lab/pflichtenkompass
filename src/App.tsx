import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { ausOrtszeit, datumText } from './fristen/datum'
import { HINWEISTEXT } from './katalog/hinweis'
import { KATALOG_STAND, KATALOG_VERSION } from './katalog/typen'
import { pruefeProfil } from './modell/pruefung'
import { ladeAusBrowser, ladeEinstellungen, neuesProjekt, speichereEinstellungen, speichereImBrowser, STANDARD_EINSTELLUNGEN } from './modell/speicher'
import type { Datum, Einstellungen } from './modell/typen'
import { plattform } from './plattform'
import { werteAus } from './regeln/auswertung'
import type { Regelwerk } from './regeln/typen'
import { useDateiBefehle } from './ui/datei'
import { Druckansicht } from './ui/Druckansicht'
import { Hilfe } from './ui/Hilfe'
import { AppKontext, useApp, type AppApi } from './ui/kontext'
import { RueckfrageDialog } from './ui/RueckfrageDialog'
import { ErgebnisSchritt } from './ui/schritte/ErgebnisSchritt'
import { FragenSchritt } from './ui/schritte/FragenSchritt'
import { RegelnSchritt } from './ui/schritte/RegelnSchritt'
import { StartSchritt } from './ui/schritte/StartSchritt'
import { TermineSchritt } from './ui/schritte/TermineSchritt'
import { UeberDialog } from './ui/UeberDialog'
import { reduziere, SCHRITTE, startZustand, type Schritt } from './zustand'
import './styles.css'

const THEMEN: { wert: Einstellungen['thema']; text: string }[] = [
  { wert: 'system', text: 'System' },
  { wert: 'hell', text: 'Hell' },
  { wert: 'dunkel', text: 'Dunkel' },
]

/** Speichern im Browser 500 ms nach der letzten Eingabe (7.4). */
const SPEICHERN_NACH_MS = 500

function erstZustand(heute: Datum) {
  return startZustand(ladeAusBrowser() ?? neuesProjekt(heute))
}

export default function App() {
  return (
    <RueckfrageDialog>
      <Hauptfenster />
    </RueckfrageDialog>
  )
}

function Hauptfenster() {
  // „heute“ einmal beim Start in Ortszeit; die Fachlogik bekommt es übergeben
  const [heute] = useState(() => ausOrtszeit(new Date()))
  const [z, dispatch] = useReducer(reduziere, heute, erstZustand)
  const [einstellungen, setEinstellungen] = useState(ladeEinstellungen)
  const [regelwerk, setRegelwerk] = useState<Regelwerk | null>(null)
  const [regelFehler, setRegelFehler] = useState<string | null>(null)
  const [meldung, setMeldung] = useState('')
  const [ueber, setUeber] = useState(false)
  const dateiFeld = useRef<HTMLInputElement>(null)
  const meldungsZeit = useRef<number | undefined>(undefined)
  const aktuell = useRef(z)

  useEffect(() => {
    aktuell.current = z
  }, [z])

  // Das Regelwerk (dmn-moddle und DMN-Datei) kommt als eigener Teil, damit die Oberfläche sofort steht
  useEffect(() => {
    import('./regeln/regelwerk')
      .then((m) => m.ladeMitgeliefertesRegelwerk())
      .then(setRegelwerk)
      .catch((e: unknown) => setRegelFehler(e instanceof Error ? e.message : String(e)))
  }, [])

  const profil = z.projekt.profil
  const pruefung = useMemo(() => pruefeProfil(profil), [profil])
  const ergebnis = useMemo(
    () => (regelwerk && pruefung.fehler.length === 0 ? werteAus(regelwerk, profil, { heute, horizontMonate: einstellungen.horizontMonate, vorher: z.vorher }) : null),
    [regelwerk, profil, pruefung, heute, einstellungen.horizontMonate, z.vorher],
  )
  const ergebnisRef = useRef(ergebnis)
  useEffect(() => {
    ergebnisRef.current = ergebnis
  }, [ergebnis])

  const melde = useCallback((text: string) => {
    setMeldung(text)
    window.clearTimeout(meldungsZeit.current)
    meldungsZeit.current = window.setTimeout(() => setMeldung(''), 6000)
  }, [])

  const setzeEinstellungen = useCallback(
    (teil: Partial<Einstellungen>) => {
      const neu = { ...einstellungen, ...teil }
      setEinstellungen(neu)
      speichereEinstellungen(neu)
    },
    [einstellungen],
  )
  // Nach „Lokale Daten löschen“: Standard, aber nicht speichern, damit der Speicher leer bleibt
  const einstellungenZuruecksetzen = useCallback(() => setEinstellungen({ ...STANDARD_EINSTELLUNGEN }), [])
  const holeDateiFeld = useCallback(() => dateiFeld.current, [])

  const datei = useDateiBefehle({ z, dispatch, ergebnis, heute, melde, dateiFeld: holeDateiFeld, einstellungenZuruecksetzen })

  const geheZu = useCallback((schritt: Schritt) => dispatch({ typ: 'schritt', schritt, ergebnis: ergebnisRef.current }), [])

  // Speichern im Browser, 500 ms nach der letzten Änderung; beim Verlassen der Seite sofort
  useEffect(() => {
    if (!z.speichern) return
    const t = window.setTimeout(() => speichereImBrowser(z.projekt), SPEICHERN_NACH_MS)
    return () => window.clearTimeout(t)
  }, [z.projekt, z.speichern])
  useEffect(() => {
    const sofort = () => {
      if (aktuell.current.speichern) speichereImBrowser(aktuell.current.projekt)
    }
    const versteckt = () => document.visibilityState === 'hidden' && sofort()
    window.addEventListener('pagehide', sofort)
    document.addEventListener('visibilitychange', versteckt)
    return () => {
      window.removeEventListener('pagehide', sofort)
      document.removeEventListener('visibilitychange', versteckt)
    }
  }, [])

  // Hell oder dunkel: „System“ folgt prefers-color-scheme, sonst gilt data-theme (wie im Prozesslotsen)
  useEffect(() => {
    const wurzel = document.documentElement
    if (einstellungen.thema === 'system') delete wurzel.dataset.theme
    else wurzel.dataset.theme = einstellungen.thema === 'hell' ? 'light' : 'dark'
  }, [einstellungen.thema])

  const info = SCHRITTE.find((s) => s.id === z.schritt) ?? SCHRITTE[0]
  const name = profil.name.trim()
  useEffect(() => {
    plattform.setzeTitel(z.schritt === 'start' ? 'Pflichten-Kompass' : `${info.name}${name ? ` – ${name}` : ''} – Pflichten-Kompass`)
  }, [z.schritt, info.name, name])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [z.schritt])

  // Strg+S speichert als Datei, Strg+O öffnet (auch in Eingabefeldern)
  useEffect(() => {
    const taste = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return
      const k = e.key.toLowerCase()
      if (k === 's') {
        e.preventDefault()
        void datei.speichern()
      } else if (k === 'o') {
        e.preventDefault()
        datei.oeffnen()
      }
    }
    window.addEventListener('keydown', taste)
    return () => window.removeEventListener('keydown', taste)
  }, [datei])

  // Projektdatei ins Fenster ziehen
  useEffect(() => {
    const ueber = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) e.preventDefault()
    }
    const ablegen = (e: DragEvent) => {
      const f = e.dataTransfer?.files[0]
      if (!f) return
      e.preventDefault()
      void datei.oeffneDatei(f.name, f.size, () => f.text())
    }
    window.addEventListener('dragover', ueber)
    window.addEventListener('drop', ablegen)
    return () => {
      window.removeEventListener('dragover', ueber)
      window.removeEventListener('drop', ablegen)
    }
  }, [datei])

  const dateiGewaehlt = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (f) void datei.oeffneDatei(f.name, f.size, () => f.text())
  }

  const api = useMemo<AppApi>(
    () => ({
      z,
      dispatch,
      heute,
      einstellungen,
      setzeEinstellungen,
      regelwerk,
      regelFehler,
      pruefung,
      ergebnis,
      aendere: (frage, wert) => dispatch({ typ: 'antwort', frage, wert }),
      setzeStatus: (id, teil) => dispatch({ typ: 'status', id, teil, heute }),
      geheZu,
      melde,
      datei,
    }),
    [z, heute, einstellungen, setzeEinstellungen, regelwerk, regelFehler, pruefung, ergebnis, geheZu, melde, datei],
  )

  return (
    <AppKontext.Provider value={api}>
      <div className="app">
        <a className="sprungmarke" href="#inhalt">
          Zum Inhalt springen
        </a>
        <Kopfzeile meldung={meldung} onUeber={() => setUeber(true)} />
        <input ref={dateiFeld} type="file" accept=".pflichtenkompass,.json,application/json" hidden onChange={dateiGewaehlt} />
        <Schrittleiste />
        <main id="inhalt" className={`arbeitsflaeche${z.schritt === 'regeln' ? ' breit' : ''}`}>
          <section className="inhalt" aria-labelledby="schritt-titel" key={`${z.schritt}-${z.version}`}>
            {z.schritt === 'start' && <StartSchritt />}
            {info.fragen && <FragenSchritt info={info} />}
            {z.schritt === 'ergebnis' && <ErgebnisSchritt />}
            {z.schritt === 'termine' && <TermineSchritt />}
            {z.schritt === 'regeln' && <RegelnSchritt />}
          </section>
          <Hilfe schritt={z.schritt} />
        </main>
        <footer className="fuss">
          <p>
            <strong>Keine Rechtsberatung.</strong> {HINWEISTEXT}
          </p>
        </footer>
      </div>
      {ergebnis && <Druckansicht ergebnis={ergebnis} />}
      <UeberDialog offen={ueber} onSchliessen={() => setUeber(false)} />
    </AppKontext.Provider>
  )
}

function Kopfzeile({ meldung, onUeber }: { meldung: string; onUeber: () => void }) {
  const { einstellungen, setzeEinstellungen, datei } = useApp()
  const menue = useRef<HTMLDetailsElement>(null)
  const schliesse = () => menue.current?.removeAttribute('open')
  return (
    <header className="kopf">
      <div className="marke">
        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={28} height={28} />
        <span>Pflichten-Kompass</span>
      </div>
      <p className="kopf-stand">
        Katalog {KATALOG_VERSION} · Rechtsstand {datumText(KATALOG_STAND)}
      </p>
      <p className="meldung" role="status" aria-live="polite">
        {meldung}
      </p>
      <div className="umschalter" role="group" aria-label="Darstellung">
        {THEMEN.map((t) => (
          <button key={t.wert} type="button" aria-pressed={einstellungen.thema === t.wert} onClick={() => setzeEinstellungen({ thema: t.wert })}>
            {t.text}
          </button>
        ))}
      </div>
      <details className="menue" ref={menue}>
        <summary className="knopf knopf-klein">Projekt</summary>
        <div className="menue-liste">
          <MenuePunkt onClick={() => void datei.neu()} schliesse={schliesse}>
            Neu beginnen
          </MenuePunkt>
          <MenuePunkt onClick={() => datei.oeffnen()} schliesse={schliesse} taste="Strg+O">
            Datei öffnen …
          </MenuePunkt>
          <MenuePunkt onClick={() => void datei.speichern()} schliesse={schliesse} taste="Strg+S">
            Als Datei speichern
          </MenuePunkt>
          <MenuePunkt onClick={() => window.print()} schliesse={schliesse}>
            Drucken oder als PDF speichern
          </MenuePunkt>
          <MenuePunkt onClick={() => void datei.loescheLokal()} schliesse={schliesse}>
            Lokale Daten löschen
          </MenuePunkt>
          <MenuePunkt onClick={onUeber} schliesse={schliesse}>
            Über den Pflichten-Kompass
          </MenuePunkt>
        </div>
      </details>
    </header>
  )
}

function MenuePunkt({ children, onClick, schliesse, taste }: { children: ReactNode; onClick: () => void; schliesse: () => void; taste?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        schliesse()
        onClick()
      }}
    >
      <span>{children}</span>
      {taste && <kbd className="menue-taste">{taste}</kbd>}
    </button>
  )
}

function Schrittleiste() {
  const { z, ergebnis, regelwerk, geheZu } = useApp()
  const n = ergebnis?.pflichten.length ?? 0
  return (
    <nav className="schrittleiste" aria-label="Schritte">
      <ol>
        {SCHRITTE.map((s) => (
          <li key={s.id}>
            <button type="button" aria-current={z.schritt === s.id ? 'step' : undefined} onClick={() => geheZu(s.id)}>
              {s.nr > 0 && (
                <span className="nummer" aria-hidden="true">
                  {s.nr}
                </span>
              )}
              {s.name}
            </button>
          </li>
        ))}
      </ol>
      <p className="zwischenstand" aria-live="polite">
        {ergebnis ? `Bisher ${n === 1 ? '1 Pflicht' : `${n} Pflichten`}` : regelwerk ? 'Pflichtangaben fehlen noch' : ''}
      </p>
    </nav>
  )
}
