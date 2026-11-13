/**
 * Prüft das echte Windows-Programm (Debug-Build) ohne Installation, wie beim Prozesslotsen:
 * Start mit der Startseite, Beispiel laden, Speichern unter, Kalender (.ics) und PDF der
 * Druckansicht ohne Druckdialog, Regelansicht mit dmn-js unter der CSP, Quellenlink über die
 * Erlaubnisliste, Navigationsschutz, abgelehnte Befehle, Öffnen per Dialog mit Speichern an
 * den bekannten Pfad, zweiter Start mit Datei (Dateizuordnung, Single-Instance), Sichern beim
 * Schließen und Neustart mit Datei. Über alle Starts: sicherer Kontext, Web Crypto und keine
 * Meldung zur Content Security Policy. Dateidialoge und Links beantwortet der Debug-Build über
 * Umgebungsvariablen; die Oberfläche steuert Playwright über die Debug-Schnittstelle von
 * WebView2 (eigener Port 9334, der Prozesslotse nutzt 9333).
 *
 * Das Programm legt seine Daten (WebView2-Profil mit dem Speicher der Antworten) unter seiner
 * Kennung ab, wie das installierte Programm. Der Test sichert diese Ordner vorher, beginnt leer
 * und stellt sie danach wieder her. Läuft der Pflichten-Kompass schon, bricht er ab.
 *
 * Vorher: npx tauri build --debug --no-bundle
 * Aufruf:  npm run desktop:test
 * PFLICHTENKOMPASS_EXE wählt eine andere exe; ohne sucht der Test unter CARGO_TARGET_DIR,
 * src-tauri/target und %LOCALAPPDATA%\cargo-ziel. DESKTOP_TEST_BEHALTEN=1 lässt die erzeugten
 * Dateien liegen.
 */
import { execFileSync, spawn } from 'node:child_process'
import { copyFileSync, cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { chromium } from '@playwright/test'

const KENNUNG = 'de.olbricht-digital.pflichtenkompass'
const PORT = 9334
const EXE_NAME = 'pflichtenkompass.exe'

const kandidaten = [
  process.env.PFLICHTENKOMPASS_EXE,
  process.env.CARGO_TARGET_DIR && join(process.env.CARGO_TARGET_DIR, 'debug', EXE_NAME),
  'src-tauri/target/debug/' + EXE_NAME,
  process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'cargo-ziel', 'debug', EXE_NAME),
].filter(Boolean)
const EXE = kandidaten.map((k) => resolve(k)).find((k) => existsSync(k))
if (!EXE) throw new Error(`${EXE_NAME} (Debug-Build) nicht gefunden. Vorher: npx tauri build --debug --no-bundle`)

const laeuft = execFileSync('tasklist', ['/FI', `IMAGENAME eq ${EXE_NAME}`, '/NH'], { encoding: 'utf8' })
if (laeuft.toLowerCase().includes(EXE_NAME)) throw new Error('Der Pflichten-Kompass läuft schon. Bitte erst schließen: Er teilt Kennung und Daten mit dem Test.')

const ordner = mkdtempSync(join(tmpdir(), 'pflichtenkompass-desktop-'))
const datei = (name) => join(ordner, name)

// Programmdaten sichern (Roaming und Local), dann leer beginnen
const sicherung = join(ordner, 'sicherung-programmdaten')
const appDaten = [join(process.env.APPDATA, KENNUNG), join(process.env.LOCALAPPDATA, KENNUNG)]
const gesichert = appDaten.map((d, i) => {
  if (!existsSync(d)) return null
  const ziel = join(sicherung, String(i))
  cpSync(d, ziel, { recursive: true })
  rmSync(d, { recursive: true, force: true })
  return ziel
})

/** Antworten auf die Dateidialoge und Ziel für Links (nur im Debug-Build ausgewertet) */
const DIALOGE = {
  PFLICHTENKOMPASS_TEST_SPEICHERN_PROJEKT: datei('a.pflichtenkompass'),
  // ohne Endung: Das Programm ergänzt „.ics“
  PFLICHTENKOMPASS_TEST_SPEICHERN_KALENDER: datei('Kalender Elektro'),
  // ohne Endung: Das Programm ergänzt „.beratungsakte.json“
  PFLICHTENKOMPASS_TEST_SPEICHERN_BERATUNGSAKTE: datei('Akte Elektro'),
  PFLICHTENKOMPASS_TEST_PDF: datei('druck.pdf'),
  PFLICHTENKOMPASS_TEST_OEFFNEN: datei('c.pflichtenkompass'),
  PFLICHTENKOMPASS_TEST_LINKS: datei('links.txt'),
}

function pruefe(bedingung, text) {
  if (!bedingung) throw new Error(`Fehlgeschlagen: ${text}`)
  console.log(`  ✓ ${text}`)
}

async function warte(bedingung, text, ms = 15000) {
  const ende = Date.now() + ms
  while (Date.now() < ende) {
    if (await bedingung()) return pruefe(true, text)
    await new Promise((r) => setTimeout(r, 200))
  }
  pruefe(false, text)
}

function starte(args = []) {
  const p = spawn(EXE, args, {
    env: { ...process.env, WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${PORT}`, ...DIALOGE },
    stdio: 'ignore',
  })
  p.gestartet = Date.now()
  return p
}

async function verbinde() {
  const ende = Date.now() + 40000
  while (Date.now() < ende) {
    try {
      const browser = await chromium.connectOverCDP(`http://127.0.0.1:${PORT}`)
      const kontext = browser.contexts()[0]
      const seite = kontext.pages()[0] ?? (await kontext.waitForEvent('page', { timeout: 10000 }))
      // Beim allerersten Start legt WebView2 erst sein Profil an; die Seite kommt dann etwas später
      await seite.waitForURL(/tauri\.localhost/, { timeout: 20000 })
      await seite.waitForLoadState('domcontentloaded')
      return { browser, seite }
    } catch {
      await new Promise((r) => setTimeout(r, 300))
    }
  }
  throw new Error('Keine Verbindung zur WebView2')
}

/** Meldungen zur Content Security Policy und Seitenfehler aus allen Starts */
const csp = []
const seitenfehler = []

/** Sammelt CSP-Meldungen der Konsole, auch die vor dem Verbinden: Log.enable liefert sie nach. */
async function beobachte(seite) {
  const merke = (text) => /Content.Security.Policy/i.test(text) && csp.push(text)
  seite.on('console', (m) => merke(m.text()))
  seite.on('pageerror', (e) => seitenfehler.push(e.message))
  const cdp = await seite.context().newCDPSession(seite)
  cdp.on('Log.entryAdded', ({ entry }) => merke(entry.text))
  await cdp.send('Log.enable')
  await seite.evaluate(() => document.addEventListener('securitypolicyviolation', (e) => console.error(`Content Security Policy: ${e.violatedDirective} ${e.blockedURI}`)))
}

async function portFrei() {
  try {
    await fetch(`http://127.0.0.1:${PORT}/json/version`, { signal: AbortSignal.timeout(1000) })
    return false
  } catch {
    return true
  }
}

/** Zeit vom Start des Prozesses bis zum ersten Bild der Seite (First Contentful Paint), in Sekunden */
async function startzeit(seite, prozess) {
  await seite.getByRole('heading', { level: 1 }).waitFor({ timeout: 20000 })
  // WebView2 meldet beim allerersten Start (neues Profil) teils nur „first-paint“
  const bild = await seite.evaluate(() => {
    const paint = Object.fromEntries(performance.getEntriesByType('paint').map((p) => [p.name, p.startTime]))
    const t = paint['first-contentful-paint'] ?? paint['first-paint']
    return t === undefined ? null : performance.timeOrigin + t
  })
  return bild === null ? null : (bild - prozess.gestartet) / 1000
}

/** Titel des Programmfensters, wie Windows ihn sieht (prüft das Recht core:window:allow-set-title) */
const fenstertitel = (pid) =>
  execFileSync('powershell', ['-NoProfile', '-Command', `[Console]::OutputEncoding = [Text.Encoding]::UTF8; (Get-Process -Id ${pid}).MainWindowTitle`], { encoding: 'utf8' }).trim()

let prozess = starte()
let browser
let seite
const meldung = async () => (await seite.locator('p.meldung').textContent()) ?? ''
const h1 = () => seite.getByRole('heading', { level: 1 })
const schritt = async (name) => {
  await seite.getByRole('navigation', { name: 'Schritte' }).getByRole('button', { name, exact: true }).click()
  await warte(async () => (await h1().textContent()) === (name === 'Start' ? 'Pflichten-Kompass' : name), `Schritt „${name}“`)
}
/** Ruft einen Rust-Befehl direkt auf, wie es eine eingeschleuste Seite versuchen könnte; Ergebnis als Text */
const rufe = (befehl, args) =>
  seite.evaluate(
    ([b, a]) =>
      window.__TAURI_INTERNALS__.invoke(b, a).then(
        (r) => `angenommen: ${JSON.stringify(r)}`,
        (e) => `abgelehnt: ${String(e)}`,
      ),
    [befehl, args],
  )

/** Neuer Programmstart, sobald die WebView2 des vorigen weg ist (sonst verbände sich Playwright mit ihr). */
async function neuerStart(args = []) {
  await browser?.close().catch(() => {})
  const ende = Date.now() + 20000
  while (!(await portFrei())) {
    if (Date.now() > ende) throw new Error(`Port ${PORT} ist noch belegt`)
    await new Promise((r) => setTimeout(r, 300))
  }
  prozess = starte(args)
  console.log(`Programm neu gestartet (PID ${prozess.pid})`)
  ;({ browser, seite } = await verbinde())
  await beobachte(seite)
}

const zeiten = []
try {
  console.log(`Programm gestartet (PID ${prozess.pid}), ${EXE}\nTestordner ${ordner}`)
  ;({ browser, seite } = await verbinde())
  await beobachte(seite)

  // 1. Start: Fenster mit Startseite, sicherer Kontext, CSP wirkt
  zeiten.push(await startzeit(seite, prozess))
  pruefe((await h1().textContent()) === 'Pflichten-Kompass', `Startseite erscheint (erstes Bild nach ${zeiten[0]?.toFixed(2)} s, mit neuem WebView2-Profil)`)
  await warte(async () => fenstertitel(prozess.pid) === 'Pflichten-Kompass', 'Fenstertitel „Pflichten-Kompass“')
  const umgebung = await seite.evaluate(() => ({ herkunft: location.origin, sicher: window.isSecureContext, subtle: typeof globalThis.crypto?.subtle?.digest === 'function' }))
  pruefe(umgebung.herkunft === 'http://tauri.localhost', `Herkunft ${umgebung.herkunft}`)
  pruefe(umgebung.sicher && umgebung.subtle, 'sicherer Kontext mit crypto.subtle (Profilschlüssel der Kalenderdatei)')
  const bisher = csp.length
  await seite.evaluate(() => {
    const s = document.createElement('script')
    s.textContent = 'window.__gegenprobe = 1'
    document.head.append(s)
  })
  await warte(async () => csp.length > bisher, 'Gegenprobe: die CSP blockiert ein eingeschleustes Inline-Skript, die Beobachtung meldet es')
  pruefe((await seite.evaluate(() => window.__gegenprobe)) === undefined, 'Gegenprobe: das Inline-Skript lief nicht')
  // Dieselbe Meldung kommt über bis zu drei Wege (Log, Konsole, Ereignis); alle abwarten, dann zählt sie nicht mit
  await new Promise((r) => setTimeout(r, 1000))
  csp.splice(bisher)

  // 2. Beispiel C laden, Speichern unter mit Strg+Umschalt+S
  await seite.getByRole('button', { name: /^Beispiel C:/ }).click()
  await warte(async () => (await h1().textContent()) === 'Ergebnis', 'Beispiel C zeigt das Ergebnis')
  await warte(async () => fenstertitel(prozess.pid) === 'Ergebnis – Elektro GmbH – Pflichten-Kompass', 'Fenstertitel nennt Schritt und Vorhaben')
  await seite.keyboard.press('Control+Shift+S')
  await warte(async () => (await meldung()) === 'Als Datei gespeichert: a.pflichtenkompass', 'Speichern unter schreibt a.pflichtenkompass')
  const a = JSON.parse(readFileSync(datei('a.pflichtenkompass'), 'utf8'))
  pruefe(a.app === 'pflichtenkompass' && a.profil.name === 'Elektro GmbH' && a.gespeichert.pflichten.length === 25, 'Projektdatei mit Profil und 25 gespeicherten Pflichten')

  // 2b. Für die Beratungsakte speichern: Dialog, Speichern-Dialog des Programms, Endung ergänzt
  await seite.getByRole('button', { name: 'Für die Beratungsakte speichern' }).click()
  const akteDialog = seite.getByRole('dialog', { name: 'Für die Beratungsakte speichern' })
  await akteDialog.getByRole('textbox', { name: 'Mandantennummer (optional)' }).fill('K-0815')
  await akteDialog.getByRole('button', { name: 'Speichern' }).click()
  await warte(async () => (await meldung()) === 'Für die Beratungsakte gespeichert: Akte Elektro.beratungsakte.json', 'Beratungsakte gespeichert, Endung .beratungsakte.json ergänzt')
  const akte = JSON.parse(readFileSync(datei('Akte Elektro.beratungsakte.json'), 'utf8'))
  pruefe(
    akte.format === 'beratungsakte' && akte.erzeugtVon.app === 'pflichtenkompass' && akte.mandant.name === 'Elektro GmbH' && akte.mandant.kennung === 'K-0815' && akte.analyse.quelldatei === 'a.pflichtenkompass',
    'Beratungsakte mit Mandant aus dem Vorhaben, Nummer und Name der Projektdatei',
  )
  pruefe(akte.massnahmen.length === 25 && akte.befunde[0].kennung === 'hinweis:keine-rechtsberatung', 'Beratungsakte mit 25 Pflichten und dem Hinweis „keine Rechtsberatung“')

  // 3. Kalender ohne Dialog, Endung ergänzt
  await schritt('Termine')
  await seite.getByRole('button', { name: 'Kalender exportieren …' }).click()
  const kalenderDialog = seite.getByRole('dialog', { name: 'Kalender exportieren' })
  await kalenderDialog.getByRole('button', { name: 'Exportieren' }).click()
  await warte(async () => /^Kalender exportiert: Kalender Elektro\.ics \(\d+ Termine\)$/.test(await meldung()), 'Kalenderdatei gespeichert, Endung .ics ergänzt')
  const ics = readFileSync(datei('Kalender Elektro.ics'), 'utf8')
  const termine = Number(/\((\d+) Termine\)/.exec(await meldung())[1])
  pruefe(ics.startsWith('BEGIN:VCALENDAR\r\n') && ics.trimEnd().endsWith('END:VCALENDAR'), 'Kalenderdatei nach RFC 5545 mit CRLF')
  pruefe((ics.match(/BEGIN:VEVENT/g) ?? []).length === termine && termine > 0, `${termine} Termine in der Datei, wie gemeldet`)

  // 4. PDF der Druckansicht ohne Druckdialog, A4
  await seite.getByRole('button', { name: 'Als PDF speichern …' }).click()
  await warte(async () => (await meldung()) === 'Als PDF gespeichert: druck.pdf', 'PDF ohne Druckdialog geschrieben', 60000)
  const pdf = readFileSync(datei('druck.pdf'), 'latin1')
  pruefe(pdf.startsWith('%PDF-'), 'die PDF-Datei beginnt mit %PDF')
  const seiten = (pdf.match(/\/Type\s*\/Page\b/g) ?? []).length
  const boxen = [...pdf.matchAll(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/g)]
  pruefe(seiten >= 3, `die Druckansicht hat mehrere Seiten (${seiten})`)
  pruefe(boxen.length > 0 && boxen.every(([, b, h]) => Math.abs(Number(b) - 595.3) < 2 && Math.abs(Number(h) - 841.9) < 2), `alle Seiten in A4 (${boxen[0]?.[1]} × ${boxen[0]?.[2]} pt)`)

  // 5. Regelansicht: dmn-js unter der CSP, Symbolschrift aus data:, Wasserzeichen
  await schritt('Regeln')
  const leinwand = seite.locator('.dmn-leinwand')
  await warte(async () => (await leinwand.locator('.djs-element[data-element-id^="Entscheidung_"]').count()) === 7, 'DRD mit 7 Entscheidungen')
  pruefe(await leinwand.locator('.bjs-powered-by').isVisible(), 'bpmn.io-Wasserzeichen sichtbar')
  await seite.getByRole('button', { name: /^Steuern/ }).click()
  await leinwand.locator('.tjs-table').waitFor({ timeout: 15000 })
  pruefe((await leinwand.locator('tr.pk-treffer').count()) > 0, 'Tabelle „Steuern“ mit markierten Treffern')
  await warte(() => seite.evaluate(() => [...document.fonts].some((f) => /dmn/i.test(f.family) && f.status === 'loaded')), 'Symbolschrift von dmn-js geladen (font-src data:)')

  // 6. Quellenlink: im Standardbrowser (hier: Testdatei), das Fenster bleibt bei der App
  await schritt('Ergebnis')
  const norm = seite.locator('article[data-pflicht] a[href^="https://www.gesetze-im-internet.de/"]').first()
  const ziel = await norm.getAttribute('href')
  await norm.click()
  await warte(() => existsSync(datei('links.txt')) && readFileSync(datei('links.txt'), 'utf8') === `${ziel}\n`, `Normlink geht an den Standardbrowser (${ziel})`)
  pruefe(seite.url().startsWith('http://tauri.localhost') && browser.contexts()[0].pages().length === 1, 'kein neues Fenster, die App bleibt im Fenster')
  await seite.evaluate(() => {
    const a = document.createElement('a')
    a.href = 'https://example.org/'
    a.target = '_blank'
    a.textContent = 'fremd'
    document.querySelector('main')?.append(a)
    a.click()
    a.remove()
  })
  await warte(async () => (await meldung()).startsWith('Link nicht geöffnet: Dieser Link ist im Programm nicht freigegeben.'), 'fremder Link wird abgelehnt und gemeldet')
  const links = {
    fremd: await rufe('oeffne_link', { url: 'https://example.org/' }),
    http: await rufe('oeffne_link', { url: 'http://www.gesetze-im-internet.de/ao_1977/__108.html' }),
    datei: await rufe('oeffne_link', { url: 'file:///C:/Windows/System32/calc.exe' }),
    opener: await rufe('plugin:opener|open_url', { url: 'https://www.gesetze-im-internet.de/' }),
    shell: await rufe('plugin:shell|open', { path: 'https://www.gesetze-im-internet.de/' }),
  }
  for (const [art, antwort] of Object.entries(links)) pruefe(antwort.startsWith('abgelehnt'), `Link ${art} abgelehnt (${antwort})`)
  pruefe(readFileSync(datei('links.txt'), 'utf8') === `${ziel}\n`, 'abgelehnte Links öffnen nichts')

  // 7. Navigationsschutz: Das Hauptfenster zeigt keine fremde Seite, neue Fenster gibt es nicht
  await seite.evaluate(() => {
    location.href = 'https://example.org/'
  })
  await new Promise((r) => setTimeout(r, 1500))
  pruefe(seite.url().startsWith('http://tauri.localhost') && (await h1().textContent()) === 'Ergebnis', 'Navigation zu einer fremden Seite wird verhindert')
  await seite.evaluate(() => window.open('https://example.org/'))
  await new Promise((r) => setTimeout(r, 1000))
  pruefe(browser.contexts()[0].pages().length === 1, 'window.open öffnet kein Fenster')

  // 8. Befehle lehnen fremde Pfade und Arten ab, ohne Dialog
  const befehle = {
    fremderPfad: await rufe('speichern', { pfad: datei('fremd.pflichtenkompass'), inhalt: '{}' }),
    kalenderPfad: await rufe('speichern', { pfad: datei('Kalender Elektro.ics'), inhalt: 'x' }),
    art: await rufe('speichern_unter', { vorschlag: 'a.exe', inhalt: 'x', art: 'exe' }),
    dateisystem: await rufe('plugin:fs|read_text_file', { path: 'C:/Windows/win.ini' }),
  }
  pruefe(befehle.fremderPfad.includes('nicht vom Benutzer gewählt'), `speichern an einen nicht gewählten Pfad abgelehnt (${befehle.fremderPfad})`)
  pruefe(befehle.kalenderPfad.includes('nicht vom Benutzer gewählt'), 'die Kalenderdatei ist nicht zum Überschreiben freigegeben')
  pruefe(befehle.art.includes('Unbekannte Dateiart: exe'), `unbekannte Dateiart abgelehnt (${befehle.art})`)
  pruefe(befehle.dateisystem.startsWith('abgelehnt'), `kein Dateisystem-Plugin (${befehle.dateisystem})`)
  pruefe(!existsSync(datei('fremd.pflichtenkompass')) && readFileSync(datei('Kalender Elektro.ics'), 'utf8') === ics, 'abgelehnte Befehle schreiben nichts')

  // 9. Öffnen-Dialog (Strg+O), Änderung, Strg+S schreibt in die geöffnete Datei, nicht in a.pflichtenkompass
  copyFileSync(datei('a.pflichtenkompass'), datei('c.pflichtenkompass'))
  await seite.keyboard.press('Control+o')
  const oeffnenFrage = seite.getByRole('dialog', { name: '„c.pflichtenkompass“ öffnen?' })
  await oeffnenFrage.waitFor({ timeout: 10000 })
  pruefe(true, 'Strg+O: Rückfrage vor dem Ersetzen der Antworten')
  await oeffnenFrage.getByRole('button', { name: 'Datei öffnen' }).click()
  await warte(async () => (await meldung()) === '„c.pflichtenkompass“ geöffnet.', 'Strg+O öffnet c.pflichtenkompass')
  const karte = seite.locator('article[data-pflicht]').first()
  const id = await karte.getAttribute('data-pflicht')
  await karte.getByLabel('Status').selectOption('erledigt')
  await seite.keyboard.press('Control+s')
  await warte(() => JSON.parse(readFileSync(datei('c.pflichtenkompass'), 'utf8')).status?.[id]?.bearbeitung === 'erledigt', `Strg+S speichert ohne Dialog in die geöffnete Datei (Status „${id}“)`)
  pruefe(JSON.parse(readFileSync(datei('a.pflichtenkompass'), 'utf8')).status?.[id] === undefined, 'a.pflichtenkompass bleibt unverändert')

  // 10. Zweiter Start mit einer Datei (Doppelklick bei laufendem Programm): landet im laufenden Programm
  copyFileSync(datei('a.pflichtenkompass'), datei('b.pflichtenkompass'))
  const zweiter = starte([datei('b.pflichtenkompass')])
  await new Promise((r) => zweiter.on('exit', r))
  pruefe(true, 'zweiter Start beendet sich sofort')
  const frageB = seite.getByRole('dialog', { name: '„b.pflichtenkompass“ öffnen?' })
  await frageB.waitFor({ timeout: 10000 })
  await frageB.getByRole('button', { name: 'Datei öffnen' }).click()
  await warte(async () => (await meldung()) === '„b.pflichtenkompass“ geöffnet.', 'b.pflichtenkompass öffnet im laufenden Programm')
  writeFileSync(datei('gross.pflichtenkompass'), ' '.repeat(1024 * 1024 + 1))
  const dritter = starte([datei('gross.pflichtenkompass')])
  await new Promise((r) => dritter.on('exit', r))
  const zuGross = seite.getByRole('dialog', { name: '„gross.pflichtenkompass“ nicht geöffnet' })
  await zuGross.waitFor({ timeout: 10000 })
  pruefe((await zuGross.textContent()).includes('größer als 1 MB'), 'eine Datei über 1 MB wird mit Meldung abgelehnt')
  await zuGross.getByRole('button', { name: 'Schließen' }).click()

  // 11. Schließen sichert den Stand sofort (Änderung und Schließen ohne Pause)
  await schritt('Vorhaben')
  await seite.getByLabel('Wie heißt das Vorhaben?').fill('Elektro GmbH im Test')
  execFileSync('taskkill', ['/PID', String(prozess.pid)])
  await warte(() => prozess.exitCode !== null, 'das Programm schließt ohne Rückfrage')

  // 12. Neustart mit Datei (Doppelklick im Explorer): Rückfrage, Abbrechen zeigt den gesicherten Stand
  await neuerStart([datei('a.pflichtenkompass')])
  zeiten.push(await startzeit(seite, prozess))
  const frageA = seite.getByRole('dialog', { name: '„a.pflichtenkompass“ öffnen?' })
  await frageA.waitFor({ timeout: 15000 })
  pruefe(true, `Start mit Datei fragt vor dem Ersetzen (erstes Bild nach ${zeiten[1]?.toFixed(2)} s)`)
  await frageA.getByRole('button', { name: 'Abbrechen' }).click()
  await warte(async () => (await seite.getByRole('button', { name: /^Weiter mit/ }).textContent()) === 'Weiter mit „Elektro GmbH im Test“', 'der beim Schließen gesicherte Stand ist nach dem Neustart da')
  await seite.getByRole('button', { name: 'Datei öffnen …' }).click()
  const frageC = seite.getByRole('dialog', { name: '„c.pflichtenkompass“ öffnen?' })
  await frageC.waitFor({ timeout: 10000 })
  await frageC.getByRole('button', { name: 'Datei öffnen' }).click()
  await warte(async () => (await h1().textContent()) === 'Ergebnis', '„Datei öffnen …“ auf der Startseite nutzt den Dialog des Programms')
  pruefe((await seite.locator(`article[data-pflicht="${id}"]`).getByLabel('Status').inputValue()) === 'erledigt', 'der Status aus der Datei ist da')
  execFileSync('taskkill', ['/PID', String(prozess.pid)])
  await warte(() => prozess.exitCode !== null, 'das Programm schließt')

  pruefe(csp.length === 0, `keine Meldung zur Content Security Policy (zwei Starts)${csp.length ? `: ${csp.join(' | ')}` : ''}`)
  pruefe(seitenfehler.length === 0, `keine Fehler in der Seite${seitenfehler.length ? `: ${seitenfehler.join(' | ')}` : ''}`)
  console.log(`Startzeit bis zum ersten Bild (Debug-Build): ${zeiten[0]?.toFixed(2)} s mit neuem WebView2-Profil, ${zeiten[1]?.toFixed(2)} s beim Neustart mit Datei`)
  console.log('Desktop-Test bestanden.')
} finally {
  await browser?.close().catch(() => {})
  if (prozess.exitCode === null) prozess.kill()
  await new Promise((r) => setTimeout(r, 2000))
  // Programmdaten wiederherstellen: erst die des Tests entfernen, dann die Sicherung zurück
  for (const [i, d] of appDaten.entries()) {
    rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 })
    if (gesichert[i]) cpSync(gesichert[i], d, { recursive: true })
  }
  if (process.env.DESKTOP_TEST_BEHALTEN) console.log(`Testdateien bleiben in ${ordner}`)
  else rmSync(ordner, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 })
}
