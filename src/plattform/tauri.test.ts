/**
 * Regeln des Windows-Programms (Spezifikation 7.6, 8) als Test, damit sie bei Änderungen
 * nicht still verloren gehen: Kennung, Dateizuordnung und Installer, CSP gleich der Web-App
 * bis auf die Verbindung zum Rust-Teil, Rechte nur für die eigenen Befehle, Erlaubnisliste
 * der Links passend zum Katalog. Läuft ohne Rust, also auch in der CI unter Linux.
 */
import { describe, expect, it } from 'vitest'
import buildRs from '../../src-tauri/build.rs?raw'
import rechteText from '../../src-tauri/capabilities/default.json?raw'
import libRs from '../../src-tauri/src/lib.rs?raw'
import konfigText from '../../src-tauri/tauri.conf.json?raw'
import beispielDatei from '../../src-tauri/windows/beispiel-c.pflichtenkompass?raw'
import viteKonfig from '../../vite.config.ts?raw'
import { NORM_BASIS } from '../katalog/normen'
import { QUELLEN } from '../katalog/quellen'
import { DATEIENDUNG, leseProjektText, MAX_DATEI_BYTES, PROJEKT_MIME } from '../modell/speicher'

const konfig = JSON.parse(konfigText)
const rechte = JSON.parse(rechteText) as { windows: string[]; permissions: (string | { identifier: string })[] }

/** „default-src 'self'; …“ → Map Direktive → Werte */
function direktiven(csp: string): Map<string, string> {
  return new Map(
    csp
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => {
        const [name, ...werte] = d.split(/\s+/)
        return [name, werte.join(' ')] as const
      }),
  )
}

/** Die Liste `const CSP = [ … ].join('; ')` aus vite.config.ts */
function webCsp(): string {
  const block = /const CSP = \[([\s\S]*?)\]\.join\('; '\)/.exec(viteKonfig)?.[1]
  if (!block) throw new Error('CSP in vite.config.ts nicht gefunden')
  return [...block.matchAll(/"([^"]+)"/g)].map((m) => m[1]).join('; ')
}

/** Befehle aus `AppManifest::new().commands(&[…])` in build.rs */
const manifestBefehle = [...(/commands\(&\[([\s\S]*?)\]\)/.exec(buildRs)?.[1] ?? '').matchAll(/"(\w+)"/g)].map((m) => m[1])
/** Befehle aus `generate_handler![…]` in lib.rs */
const handlerBefehle = (/generate_handler!\[([^\]]*)\]/.exec(libRs)?.[1] ?? '').split(',').map((s) => s.trim()).filter(Boolean)

describe('Windows-Programm (src-tauri)', () => {
  it('trägt Kennung, Namen und Version aus package.json', () => {
    expect(konfig.identifier).toBe('de.olbricht-digital.pflichtenkompass')
    expect(konfig.productName).toBe('Pflichten-Kompass')
    expect(konfig.mainBinaryName).toBe('pflichtenkompass')
    expect(konfig.version).toBe('../package.json')
    expect(konfig.app.windows).toHaveLength(1)
    expect(konfig.app.windows[0].label).toBe('main')
  })

  it('ordnet nur .pflichtenkompass zu und installiert pro Benutzer ohne Admin', () => {
    expect(konfig.bundle.targets).toEqual(['nsis'])
    expect(konfig.bundle.fileAssociations).toEqual([
      expect.objectContaining({ ext: [DATEIENDUNG.slice(1)], mimeType: PROJEKT_MIME, role: 'Editor', name: 'PflichtenKompass.Projekt' }),
    ])
    expect(konfig.bundle.windows.nsis.installMode).toBe('currentUser')
    expect(konfig.bundle.windows.nsis.languages).toEqual(['German'])
  })

  it('nutzt die CSP der Web-App, nur mit Verbindung zum Rust-Teil statt connect-src self', () => {
    const tauri = direktiven(konfig.app.security.csp)
    const web = direktiven(webCsp())
    expect(web.size).toBeGreaterThan(5)
    for (const [name, wert] of web) {
      if (name === 'connect-src') continue
      expect(tauri.get(name), name).toBe(wert)
    }
    expect(tauri.get('connect-src')).toBe('ipc: http://ipc.localhost')
    expect(tauri.get('frame-ancestors')).toBe("'none'")
    expect(tauri.get('script-src')).toBe("'self'")
    expect(konfig.app.security.csp).not.toMatch(/unsafe-eval|\*/)
    expect(konfig.app.security.dangerousDisableAssetCspModification).toBeUndefined()
  })

  it('gibt der Oberfläche nur die eigenen Befehle frei, ohne Datei-, Shell- oder Opener-Rechte', () => {
    expect(manifestBefehle).toEqual(['start_datei', 'oeffnen', 'speichern', 'speichern_unter', 'als_pdf', 'oeffne_link'])
    expect([...handlerBefehle].sort()).toEqual([...manifestBefehle].sort())
    expect(rechte.windows).toEqual(['main'])
    const namen = rechte.permissions.map((p) => (typeof p === 'string' ? p : p.identifier))
    expect(namen).toEqual(['core:default', 'core:window:allow-set-title', 'core:window:allow-destroy', ...manifestBefehle.map((b) => `allow-${b.replace(/_/g, '-')}`)])
  })

  it('die Projektdatei für den Installertest der CI ist gültig (Beispiel C)', () => {
    const projekt = leseProjektText(beispielDatei)
    expect(projekt.profil.name).toBe('Elektro GmbH')
    expect(projekt.gespeichert?.pflichten).toHaveLength(25)
  })

  it('liest höchstens so viel wie die Oberfläche (1 MB)', () => {
    expect(/const MAX_GROESSE: u64 = 1024 \* 1024;/.test(libRs)).toBe(true)
    expect(MAX_DATEI_BYTES).toBe(1024 * 1024)
  })

  it('erlaubt im Programm alle Links des Katalogs, nur mit https', () => {
    const liste = /const ERLAUBTE_HOSTS: \[&str; \d+\] = \[([^\]]*)\]/.exec(libRs)?.[1]
    const hosts = new Set([...(liste ?? '').matchAll(/"([^"]+)"/g)].map((m) => m[1]))
    expect(hosts.size).toBeGreaterThan(0)
    const links = [NORM_BASIS, ...QUELLEN.map((q) => q.url)]
    for (const link of links) {
      const url = new URL(link)
      expect(url.protocol, link).toBe('https:')
      expect(hosts.has(url.hostname), link).toBe(true)
    }
    // dazu bpmn.io für das Wasserzeichen der Regelansicht
    expect([...hosts].sort()).toEqual([...new Set([...links.map((l) => new URL(l).hostname), 'bpmn.io'])].sort())
  })
})
