import { useEffect, useState } from 'react'
import { datumText } from './fristen/datum'
import { HINWEISTEXT } from './katalog/hinweis'
import { KATALOG_STAND, KATALOG_VERSION } from './katalog/typen'
import { ladeEinstellungen, speichereEinstellungen } from './modell/speicher'
import type { Einstellungen } from './modell/typen'
import { plattform } from './plattform'
import { PlatzhalterSchritt } from './ui/schritte/PlatzhalterSchritt'
import { StartSchritt } from './ui/schritte/StartSchritt'
import { SCHRITTE, type Schritt } from './zustand'
import './styles.css'

const THEMEN: { wert: Einstellungen['thema']; text: string }[] = [
  { wert: 'system', text: 'System' },
  { wert: 'hell', text: 'Hell' },
  { wert: 'dunkel', text: 'Dunkel' },
]

export default function App() {
  const [schritt, setSchritt] = useState<Schritt>('start')
  const [einstellungen, setEinstellungen] = useState(ladeEinstellungen)
  const info = SCHRITTE.find((s) => s.id === schritt) ?? SCHRITTE[0]

  // Hell oder dunkel: „System“ folgt prefers-color-scheme, sonst gilt data-theme (wie im Prozesslotsen)
  useEffect(() => {
    const wurzel = document.documentElement
    if (einstellungen.thema === 'system') delete wurzel.dataset.theme
    else wurzel.dataset.theme = einstellungen.thema === 'hell' ? 'light' : 'dark'
    speichereEinstellungen(einstellungen)
  }, [einstellungen])

  useEffect(() => {
    plattform.setzeTitel(schritt === 'start' ? 'Pflichten-Kompass' : `${info.name} – Pflichten-Kompass`)
    window.scrollTo({ top: 0 })
  }, [schritt, info.name])

  return (
    <div className="app">
      <a className="sprungmarke" href="#inhalt">
        Zum Inhalt springen
      </a>
      <header className="kopf">
        <div className="marke">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={28} height={28} />
          <span>Pflichten-Kompass</span>
        </div>
        <p className="kopf-stand">
          Katalog {KATALOG_VERSION} · Rechtsstand {datumText(KATALOG_STAND)}
        </p>
        <div className="umschalter" role="group" aria-label="Darstellung">
          {THEMEN.map((t) => (
            <button key={t.wert} type="button" aria-pressed={einstellungen.thema === t.wert} onClick={() => setEinstellungen((e) => ({ ...e, thema: t.wert }))}>
              {t.text}
            </button>
          ))}
        </div>
      </header>
      <nav className="schrittleiste" aria-label="Schritte">
        <ol>
          {SCHRITTE.map((s) => (
            <li key={s.id}>
              <button type="button" aria-current={schritt === s.id ? 'step' : undefined} onClick={() => setSchritt(s.id)}>
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
      </nav>
      <main id="inhalt" className="arbeitsflaeche">
        <section className="inhalt" aria-labelledby="schritt-titel">
          {schritt === 'start' ? <StartSchritt onBeginnen={() => setSchritt('vorhaben')} /> : <PlatzhalterSchritt info={info} />}
        </section>
        <aside className="hilfe" aria-label="Hilfe">
          <h2>Hilfe</h2>
          <p>{info.zeigt}</p>
        </aside>
      </main>
      <footer className="fuss">
        <p>
          <strong>Keine Rechtsberatung.</strong> {HINWEISTEXT}
        </p>
      </footer>
    </div>
  )
}
