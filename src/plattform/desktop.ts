/**
 * Windows-Programm (Tauri): Die Oberfläche ruft Befehle des Rust-Teils auf
 * (src-tauri/src/lib.rs). Dateizugriff gibt es nur über diese Befehle und nur
 * für Pfade, die der Benutzer selbst gewählt hat; Links öffnet nur `oeffne_link`
 * mit seiner Erlaubnisliste. Die Tauri-Bibliotheken werden erst beim ersten Aufruf
 * geladen, damit die Web-Version sie nie mitlädt.
 */
import type { Datei, MenueBefehl, Plattform } from './typen'

const kern = () => import('@tauri-apps/api/core')
const ereignisse = () => import('@tauri-apps/api/event')
const fenster = () => import('@tauri-apps/api/window')

async function rufe<T>(befehl: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke } = await kern()
  return invoke<T>(befehl, args)
}

/** Meldet einen Listener an, der sich auch abmelden lässt, bevor die Anmeldung fertig ist. */
function horche(anmelden: () => Promise<() => void>): () => void {
  let abmelden: (() => void) | null = null
  let beendet = false
  void anmelden().then((f) => {
    if (beendet) f()
    else abmelden = f
  })
  return () => {
    beendet = true
    abmelden?.()
  }
}

/** Letzter Teil eines Windows- oder Unix-Pfads. */
const nameAus = (pfad: string) => pfad.split(/[\\/]/).pop() ?? pfad

export const desktopPlattform: Plattform = {
  desktop: true,
  oeffnen: () => rufe<Datei | null>('oeffnen'),
  startDatei: () => rufe<Datei | null>('start_datei'),
  speichern: (pfad, inhalt) => rufe<void>('speichern', { pfad, inhalt }),
  speichernUnter: (vorschlag, inhalt, art) => rufe<{ pfad: string; name: string } | null>('speichern_unter', { vorschlag, inhalt, art }),
  setzeTitel: (titel) => {
    document.title = titel
    void fenster().then(({ getCurrentWindow }) => getCurrentWindow().setTitle(titel))
  },
  beiDatei: (f) => horche(async () => (await ereignisse()).listen<Datei>('datei-oeffnen', (e) => f(e.payload))),
  beiDateiFehler: (f) => horche(async () => (await ereignisse()).listen<[string, string]>('datei-fehler', (e) => f(...e.payload))),
  beimSchliessen: (darf) =>
    horche(async () =>
      (await fenster()).getCurrentWindow().onCloseRequested(async (e) => {
        if (!(await darf())) e.preventDefault()
      }),
    ),
  beiMenue: (f) => horche(async () => (await ereignisse()).listen<MenueBefehl>('menue', (e) => f(e.payload))),
  externeLinks: (fehler) => {
    // Linksklick (auch mit Strg oder Umschalt) und Mittelklick; WebView2 würde sonst ein neues Fenster
    // wollen, das Tauri ablehnt. Sprungmarken in der App (#luecken) bleiben unberührt.
    const klick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== (e.type === 'auxclick' ? 1 : 0)) return
      const link = e.target instanceof Element ? e.target.closest<HTMLAnchorElement | SVGAElement>('a[href]') : null
      if (!link) return
      const href = link instanceof HTMLAnchorElement ? link.href : link.href.baseVal
      let url: URL
      try {
        url = new URL(href, location.href)
      } catch {
        return
      }
      if (url.origin === location.origin) return
      e.preventDefault()
      rufe<void>('oeffne_link', { url: url.href }).catch((err: unknown) => fehler(`Link nicht geöffnet: ${String(err)}`))
    }
    document.addEventListener('click', klick)
    document.addEventListener('auxclick', klick)
    return () => {
      document.removeEventListener('click', klick)
      document.removeEventListener('auxclick', klick)
    }
  },
  alsPdf: async (vorschlag) => {
    const pfad = await rufe<string | null>('als_pdf', { vorschlag })
    return pfad === null ? null : nameAus(pfad)
  },
}
