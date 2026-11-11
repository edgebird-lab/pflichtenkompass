import { afterEach, describe, expect, it, vi } from 'vitest'
import { beispiel, beispiele } from './beispiele'
import {
  alsJson,
  EINSTELLUNGEN_SCHLUESSEL,
  Formatfehler,
  ladeAusBrowser,
  ladeEinstellungen,
  leseEinstellungen,
  leseProjekt,
  leseProjektText,
  loescheLokaleDaten,
  MAX_DATEI_BYTES,
  neuesProjekt,
  PROJEKT_SCHLUESSEL,
  speichereEinstellungen,
  speichereImBrowser,
  STANDARD_EINSTELLUNGEN,
} from './speicher'
import type { Projekt } from './typen'

/** Projekt aus Beispiel D mit Status und gespeichertem Stand. */
function projektD(): Projekt {
  return {
    formatVersion: 1,
    app: 'pflichtenkompass',
    profil: beispiel('D').profil,
    status: {
      gewerbeanzeige: { bearbeitung: 'erledigt', notiz: 'am 20.02. beim Gewerbeamt', geaendertAm: '2027-02-20' },
      infektionsschutz: { bearbeitung: 'offen', notiz: '', geaendertAm: '2027-02-21' },
    },
    gespeichert: { katalogVersion: '2026.11.0', am: '2027-02-21', pflichten: [{ id: 'gewerbeanzeige', stand: '2026-11-11' }] },
  }
}

const roh = (p: Projekt) => JSON.parse(alsJson(p)) as Record<string, any>

function fehler(f: () => unknown): string {
  try {
    f()
  } catch (e) {
    expect(e).toBeInstanceOf(Formatfehler)
    return (e as Error).message
  }
  throw new Error('kein Formatfehler')
}

describe('Projektdatei (9.10)', () => {
  it('SP1: Projekt → JSON → Projekt bleibt gleich', () => {
    const p = projektD()
    expect(leseProjektText(alsJson(p))).toEqual(p)
    for (const b of beispiele()) {
      const q: Projekt = { ...neuesProjekt('2026-11-11'), profil: b.profil }
      expect(leseProjektText(alsJson(q)), b.id).toEqual(q)
    }
  })

  it('schreibt JSON mit 2 Leerzeichen Einrückung', () => {
    expect(alsJson(projektD())).toMatch(/^\{\n {2}"formatVersion": 1,\n {2}"app": "pflichtenkompass",/)
  })

  it('SP2: Dateiformat 2 wird mit Meldung abgelehnt', () => {
    const d = roh(projektD())
    d.formatVersion = 2
    expect(fehler(() => leseProjekt(d))).toBe('Dateiformat 2 wird nicht unterstützt.')
  })

  it('SP3: eine Prozesslotse-Datei ist keine Pflichten-Kompass-Datei', () => {
    const prozesslotse = { formatVersion: 3, ist: { name: 'Bestellung', ablauf: { id: 'a', schritte: [] } }, soll: null, massnahmen: [], verworfen: [] }
    expect(fehler(() => leseProjektText(JSON.stringify(prozesslotse)))).toBe('Die Datei ist keine Pflichten-Kompass-Datei.')
    expect(fehler(() => leseProjekt([1, 2, 3]))).toContain('keine Pflichten-Kompass-Datei')
    expect(fehler(() => leseProjekt(null))).toContain('keine Pflichten-Kompass-Datei')
  })

  it('SP4: falscher Aufzählungswert wird mit Feldname abgelehnt', () => {
    const d = roh(projektD())
    d.profil.rechtsform = 'ag'
    expect(fehler(() => leseProjekt(d))).toBe('profil.rechtsform: unbekannter Wert „ag“.')
  })

  it('SP5: Dateien über 1 MB werden abgelehnt, genau 1 MB nicht', () => {
    const json = alsJson(projektD())
    const genau = json + ' '.repeat(MAX_DATEI_BYTES - new TextEncoder().encode(json).length)
    expect(new TextEncoder().encode(genau).length).toBe(MAX_DATEI_BYTES)
    expect(leseProjektText(genau)).toEqual(projektD())
    expect(fehler(() => leseProjektText(`${genau} `))).toContain('größer als 1 MB')
  })

  it('nennt Feldnamen bei Datum, Zahlen und Beträgen', () => {
    const faelle: [(d: Record<string, any>) => void, string][] = [
      [(d) => (d.profil.start = '2027-02-30'), 'profil.start: Datum im Format JJJJ-MM-TT erwartet.'],
      [(d) => (d.profil.personal.minijobber = 1.5), 'profil.personal.minijobber: ganze Zahl ab 0 erwartet.'],
      [(d) => (d.profil.personal.svPflichtig = -1), 'profil.personal.svPflichtig: ganze Zahl ab 0 erwartet.'],
      [(d) => (d.profil.steuern.umsatzErstesJahr = -5), 'profil.steuern.umsatzErstesJahr: Betrag ab 0 erwartet.'],
      [(d) => (d.profil.steuern.gewinnErstesJahr = 'viel'), 'profil.steuern.gewinnErstesJahr: Betrag erwartet.'],
      [(d) => (d.profil.bundesland = 'XX'), 'profil.bundesland: unbekannter Wert „XX“.'],
      [(d) => (d.profil.branchen = ['handel', 'zauberei']), 'profil.branchen: unbekannter Wert „zauberei“.'],
      [(d) => (d.profil.website = 'ja'), 'profil.website: ja oder nein (true/false) erwartet.'],
      [(d) => (d.profil.name = 'x'.repeat(81)), 'profil.name: höchstens 80 Zeichen.'],
      [(d) => delete d.profil.kunden, 'profil.kunden: fehlt oder ist kein Objekt.'],
      [(d) => (d.status.gewerbeanzeige.bearbeitung = 'vielleicht'), 'status.gewerbeanzeige.bearbeitung: unbekannter Wert „vielleicht“.'],
      [(d) => (d.gespeichert.pflichten[0].stand = 'gestern'), 'gespeichert.pflichten[0].stand: Datum im Format JJJJ-MM-TT erwartet.'],
    ]
    for (const [aendern, meldung] of faelle) {
      const d = roh(projektD())
      aendern(d)
      expect(fehler(() => leseProjekt(d))).toBe(meldung)
    }
    expect(fehler(() => leseProjektText('{nicht json'))).toBe('Die Datei ist kein gültiges JSON.')
  })

  it('erlaubt einen negativen Gewinn und leere optionale Felder', () => {
    const d = roh(projektD())
    d.profil.steuern.gewinnErstesJahr = -12_000.5
    d.profil.bundesland = null
    d.profil.steuern.umsatz2026 = null
    expect(leseProjekt(d).profil.steuern.gewinnErstesJahr).toBe(-12_000.5)
  })

  it('ignoriert unbekannte Felder und Status zu unbekannten Pflichten, kürzt lange Notizen', () => {
    const d = roh(projektD())
    d.neuesFeld = 1
    d.profil.lieblingsfarbe = 'blau'
    d.status.gibtsNicht = { bearbeitung: 'offen', notiz: '', geaendertAm: '2027-01-01' }
    d.status.gewerbeanzeige.notiz = 'n'.repeat(600)
    const p = leseProjekt(d)
    expect('neuesFeld' in p).toBe(false)
    expect('lieblingsfarbe' in p.profil).toBe(false)
    expect(Object.keys(p.status)).toEqual(['gewerbeanzeige', 'infektionsschutz'])
    expect(p.status.gewerbeanzeige?.notiz).toHaveLength(500)
  })

  it('entfernt doppelte Bereiche und behält IDs aus anderen Katalogversionen im gespeicherten Stand', () => {
    const d = roh(projektD())
    d.profil.branchen = ['gastronomie', 'gastronomie', 'handel']
    d.gespeichert.pflichten.push({ id: 'pflichtAusKatalog2027', stand: '2027-01-15' })
    const p = leseProjekt(d)
    expect(p.profil.branchen).toEqual(['gastronomie', 'handel'])
    expect(p.gespeichert?.pflichten.map((x) => x.id)).toEqual(['gewerbeanzeige', 'pflichtAusKatalog2027'])
  })

  it('legt ein neues Projekt mit Standardprofil an', () => {
    const p = neuesProjekt('2026-11-11')
    expect(p).toMatchObject({ formatVersion: 1, app: 'pflichtenkompass', status: {}, gespeichert: null })
    expect(p.profil.start).toBe('2026-12-01')
    expect(leseProjektText(alsJson(p))).toEqual(p)
  })
})

/** Einfacher Ersatz für localStorage; `kaputt` wirft wie im privaten Modus mancher Browser. */
function stubSpeicher(kaputt = false) {
  const daten = new Map<string, string>()
  const pruefe = () => {
    if (kaputt) throw new DOMException('gesperrt', 'SecurityError')
  }
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => (pruefe(), daten.get(k) ?? null),
    setItem: (k: string, v: string) => (pruefe(), void daten.set(k, v)),
    removeItem: (k: string) => (pruefe(), void daten.delete(k)),
  })
  return daten
}

describe('Browserspeicher', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('speichert und lädt das Projekt', () => {
    const daten = stubSpeicher()
    expect(ladeAusBrowser()).toBeNull()
    expect(speichereImBrowser(projektD())).toBe(true)
    expect(daten.has(PROJEKT_SCHLUESSEL)).toBe(true)
    expect(ladeAusBrowser()).toEqual(projektD())
  })

  it('verwirft einen beschädigten Speicherstand', () => {
    const daten = stubSpeicher()
    daten.set(PROJEKT_SCHLUESSEL, '{"app":"pflichtenkompass","formatVersion":1}')
    expect(ladeAusBrowser()).toBeNull()
  })

  it('„Lokale Daten löschen“ entfernt Projekt und Einstellungen', () => {
    const daten = stubSpeicher()
    speichereImBrowser(projektD())
    speichereEinstellungen({ ...STANDARD_EINSTELLUNGEN, thema: 'dunkel' })
    daten.set('anderes:programm', 'bleibt')
    expect(loescheLokaleDaten()).toBe(true)
    expect([...daten.keys()]).toEqual(['anderes:programm'])
    expect(ladeEinstellungen()).toEqual(STANDARD_EINSTELLUNGEN)
  })

  it('läuft weiter, wenn der Speicher gesperrt ist', () => {
    stubSpeicher(true)
    expect(speichereImBrowser(projektD())).toBe(false)
    expect(ladeAusBrowser()).toBeNull()
    expect(loescheLokaleDaten()).toBe(false)
    expect(ladeEinstellungen()).toEqual(STANDARD_EINSTELLUNGEN)
    expect(() => speichereEinstellungen(STANDARD_EINSTELLUNGEN)).not.toThrow()
  })

  it('speichert Einstellungen unter eigenem Schlüssel', () => {
    const daten = stubSpeicher()
    speichereEinstellungen({ ...STANDARD_EINSTELLUNGEN, horizontMonate: 12 })
    expect(JSON.parse(daten.get(EINSTELLUNGEN_SCHLUESSEL)!)).toMatchObject({ horizontMonate: 12 })
    expect(ladeEinstellungen().horizontMonate).toBe(12)
  })
})

describe('Einstellungen', () => {
  it('hat die Standardwerte aus 4.7', () => {
    expect(STANDARD_EINSTELLUNGEN).toEqual({ thema: 'system', horizontMonate: 24, erinnerungTage: 7, vergangeneExportieren: false })
  })

  it('übernimmt gültige Werte und ersetzt falsche durch den Standard', () => {
    expect(leseEinstellungen({ thema: 'dunkel', horizontMonate: 12, erinnerungTage: 0, vergangeneExportieren: true })).toEqual({
      thema: 'dunkel',
      horizontMonate: 12,
      erinnerungTage: 0,
      vergangeneExportieren: true,
    })
    expect(leseEinstellungen({ thema: 'lila', horizontMonate: 36, erinnerungTage: 2, vergangeneExportieren: 'ja' })).toEqual(STANDARD_EINSTELLUNGEN)
    expect(leseEinstellungen(null)).toEqual(STANDARD_EINSTELLUNGEN)
    expect(leseEinstellungen([1, 2])).toEqual(STANDARD_EINSTELLUNGEN)
  })
})
