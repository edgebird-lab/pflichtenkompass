/**
 * Export im offenen Format Beratungsakte v1: Abbildung des Ergebnisses, Stufen, Grenzfälle und
 * die Kopie der Bibliothek in src/beratungsakte.
 */
import { beforeAll, describe, expect, it } from 'vitest'
import xml from '../../regeln/pflichten.dmn?raw'
import { dateinameBeratungsakte, leseBeratungsakte, pruefeBeratungsakte, serialisiereBeratungsakte, type Beratungsakte } from '../beratungsakte/beratungsakte'
import { SCHEMA } from '../beratungsakte/schema'
import { naechsterTermin } from '../fristen/termine'
import { HINWEISTEXT } from '../katalog/hinweis'
import { normenText } from '../katalog/normen'
import { pflicht } from '../katalog/pflichten'
import { KATALOG_STAND, KATALOG_VERSION, type PflichtId } from '../katalog/typen'
import { beispiel } from '../modell/beispiele'
import { WARNUNG_KLEINUNTERNEHMER } from '../modell/pruefung'
import { neuesProjekt } from '../modell/speicher'
import type { Beispiel, Bearbeitung, Datum, Profil, Projekt } from '../modell/typen'
import { nachZeitpunkt, werteAus } from '../regeln/auswertung'
import { ladeRegelwerk } from '../regeln/dmn'
import type { Ergebnis, Regelwerk } from '../regeln/typen'
import { VERSION } from '../version'
import { APP_KENNUNG, beratungsakteAusErgebnis, mandantAusProjekt, PRIORITAET_NACH_ZEITPUNKT, SCHWERE_DER_LUECKE } from './beratungsakte'

const HEUTE = '2026-11-11'
const JETZT = new Date(2026, 10, 13, 12, 0, 0)

let regelwerk: Regelwerk
beforeAll(async () => {
  regelwerk = await ladeRegelwerk(xml, '')
})

const projektAus = (profil: Profil, status: Projekt['status'] = {}): Projekt => ({ ...neuesProjekt(HEUTE), profil, status })
const auswerten = (p: Projekt, heute: Datum = HEUTE): Ergebnis => werteAus(regelwerk, p.profil, { heute, horizontMonate: 24 })

function akteVon(id: Beispiel['id'], status: Projekt['status'] = {}): { akte: Beratungsakte; ergebnis: Ergebnis; projekt: Projekt } {
  const projekt = projektAus(beispiel(id).profil, status)
  const ergebnis = auswerten(projekt)
  return { akte: beratungsakteAusErgebnis({ projekt, ergebnis, mandant: { name: mandantAusProjekt(projekt) }, jetzt: JETZT }), ergebnis, projekt }
}

/** Das Beispiel der Formatbeschreibung: C „Elektro GmbH“. */
const akteDesBeispiels = () => akteVon('C').akte

function gueltigOhneHinweise(akte: Beratungsakte) {
  const ergebnis = pruefeBeratungsakte(JSON.parse(serialisiereBeratungsakte(akte)))
  expect(ergebnis.fehler).toEqual([])
  expect(ergebnis.hinweise).toEqual([])
  expect(ergebnis.gueltig).toBe(true)
}

const kennzahl = (akte: Beratungsakte, kennung: string) => akte.kennzahlen.find((k) => k.kennung === kennung)?.wert
const massnahme = (akte: Beratungsakte, id: PflichtId) => akte.massnahmen.find((m) => m.kennung === `pflicht:${id}`)!
const ns = (x: { erweiterungen?: Record<string, Record<string, unknown>> }) => x.erweiterungen?.[APP_KENNUNG]

describe('Beratungsakte aus dem Ergebnis', () => {
  it('Beispiel C ist eine gültige Akte ohne Hinweise, mit Kopf aus der App', () => {
    const akte = akteDesBeispiels()
    gueltigOhneHinweise(akte)
    expect(akte.format).toBe('beratungsakte')
    expect(akte.formatVersion).toBe('1.0')
    expect(akte.erzeugtVon).toEqual({ app: 'pflichtenkompass', name: 'Pflichten-Kompass', version: VERSION })
    // Ortszeit des Rechners (CI läuft in UTC)
    expect(akte.erzeugtAm).toMatch(/^2026-11-13T12:00:00(Z|[+-]\d\d:\d\d)$/)
    expect(akte.mandant).toEqual({ name: 'Elektro GmbH' })
    expect(akte.analyse).toEqual({ art: 'gruendungspflichten', titel: 'Elektro GmbH', stand: HEUTE })
    expect(ns(akte)).toEqual({ katalogVersion: KATALOG_VERSION, rechtsstand: KATALOG_STAND, horizont: { von: '2027-04-01', bis: '2029-03-31' }, start: '2027-04-01' })
  })

  it('Beispiel C: Zahlen wie im Ergebnis (README: 25 Pflichten, 8 nicht geprüft; 90 Termine)', () => {
    const { akte, ergebnis } = akteVon('C')
    expect(akte.kennzahlen.map((k) => [k.kennung, k.wert])).toEqual([
      ['pflichten', 25],
      ['pflichten-vor-start', 7],
      ['pflichten-erste-wochen', 3],
      ['pflichten-laufend', 11],
      ['pflichten-jaehrlich', 4],
      ['pflichten-offen', 25],
      ['pflichten-erledigt', 0],
      ['pflichten-trifft-nicht-zu', 0],
      ['nicht-gepruefte-bereiche', 8],
      ['termine', 90],
      ['termine-vor-heute', 0],
    ])
    expect(akte.kennzahlen.every((k) => k.einheit === 'Anzahl' && k.bewertung === undefined)).toBe(true)
    // Gruppen wie die Überschriften im Ergebnis
    expect(nachZeitpunkt(ergebnis.pflichten, HEUTE).map((g) => [`Pflichten: ${g.titel}`, g.pflichten.length])).toEqual(
      akte.kennzahlen.slice(1, 5).map((k) => [k.name, k.wert]),
    )
    // Eine Maßnahme je Pflicht, in der Reihenfolge des Katalogs
    expect(akte.massnahmen.map((m) => m.kennung)).toEqual(ergebnis.pflichten.map((e) => `pflicht:${e.pflicht.id}`))
    expect(akte.befunde.map((b) => b.kennung)).toEqual([
      'hinweis:keine-rechtsberatung',
      'luecke:gewerbesteuer',
      'luecke:koerperschaftsteuer',
      'luecke:datenschutz',
      'luecke:arbeitsrecht',
      'luecke:gewerberechtSonstiges',
      'luecke:kuenstlersozialabgabe',
      'luecke:rundfunkbeitrag',
      'luecke:geschaeftsfuehrung',
    ])
  })

  it('Pflicht als Maßnahme: Text mit Stelle und Frist, nächster Termin als Frist, Rechtsgrundlage und Quelle im Namensraum', () => {
    const { akte, ergebnis } = akteVon('C')
    const p = pflicht('handwerksrolle')
    const m = massnahme(akte, 'handwerksrolle')
    expect(m.text.startsWith(`${p.titel}. ${p.kurz}`)).toBe(true)
    expect(m.text).toContain(`Stelle: ${p.stelle}`)
    expect(m.text).toContain(`Frist: ${p.fristText}`)
    expect(m).toMatchObject({ prioritaet: 'hoch', aufwand: 'nicht geschätzt', befunde: [], frist: '2027-04-01' })
    expect(ns(m)).toMatchObject({ nr: p.nr, gruppe: 'gruendung', zeitpunkt: 'vorStart', status: 'offen', rechtsgrundlage: normenText(p.normen), stand: KATALOG_STAND })
    expect((ns(m)!.quellen as { id: string }[]).map((q) => q.id)).toEqual([...p.quellen])
    // Jede Frist ist der nächste Termin ab heute, wie auf der Pflichtkarte
    for (const e of ergebnis.pflichten) expect(massnahme(akte, e.pflicht.id).frist, e.pflicht.id).toBe(naechsterTermin(e.termine, HEUTE)?.faelligAm)
    // Mit Weg: „Stelle: Finanzamt; elektronisch …“
    expect(massnahme(akte, 'steuerlicheErfassung').text).toContain('Stelle: Finanzamt; elektronisch über die amtlich bestimmte Schnittstelle (ELSTER).')
    // Ohne Termin keine Frist (laufende Pflicht)
    expect('frist' in massnahme(akte, 'rechnungen')).toBe(false)
    // „gesetzlich bis“, wenn der nächste Termin es hat
    for (const e of ergebnis.pflichten) {
      const g = naechsterTermin(e.termine, HEUTE)?.gesetzlichBis
      expect(ns(massnahme(akte, e.pflicht.id))!.gesetzlichBis, e.pflicht.id).toBe(g ?? undefined)
    }
    expect(ns(massnahme(akte, 'ustVoranmeldung'))!.regeln).toEqual(ergebnis.pflichten.find((e) => e.pflicht.id === 'ustVoranmeldung')!.treffer.map((t) => t.regel))
  })

  it('Beispiel A: 13 Pflichten, 7 nicht geprüft, 31 Termine; erste Voranmeldung am 10.02.2027', () => {
    const { akte } = akteVon('A')
    gueltigOhneHinweise(akte)
    expect([kennzahl(akte, 'pflichten'), kennzahl(akte, 'nicht-gepruefte-bereiche'), kennzahl(akte, 'termine')]).toEqual([13, 7, 31])
    expect(akte.massnahmen).toHaveLength(13)
    expect(akte.befunde).toHaveLength(1 + 7)
    expect(massnahme(akte, 'ustVoranmeldung')).toMatchObject({ prioritaet: 'mittel', frist: '2027-02-10' })
    expect(ns(massnahme(akte, 'ustVoranmeldung'))!.termine).toBe(23)
  })

  it('alle Beispiele A–F ergeben gültige Akten mit den Zahlen der Golden Tests', () => {
    const ids = ['A', 'B', 'C', 'D', 'E', 'F'] as const
    const akten = ids.map((id) => akteVon(id).akte)
    for (const a of akten) gueltigOhneHinweise(a)
    expect(akten.map((a) => a.massnahmen.length)).toEqual([13, 9, 25, 20, 20, 22])
    expect(akten.map((a) => kennzahl(a, 'nicht-gepruefte-bereiche'))).toEqual([7, 4, 8, 8, 9, 6])
    expect(akten.map((a) => a.befunde.length)).toEqual([8, 5, 9, 9, 10, 7])
    expect(akten.map((a) => a.analyse.titel)).toEqual(ids.map((id) => beispiel(id).titel))
  })

  it('der Hinweis „keine Rechtsberatung“ steht als Befund im Kern', () => {
    for (const id of ['A', 'C'] as const) {
      const b = akteVon(id).akte.befunde[0]
      expect(b).toEqual({ kennung: 'hinweis:keine-rechtsberatung', schwere: 'hinweis', text: HINWEISTEXT, fundstelle: 'Ergebnis' })
      expect(b.text).toContain('keine Rechts- oder Steuerberatung')
    }
  })

  it('Stufen: Priorität nach Zeitpunkt, Status senkt sie und steht im Text', () => {
    expect(PRIORITAET_NACH_ZEITPUNKT).toEqual({ vorStart: 'hoch', ersteWochen: 'hoch', laufend: 'mittel', jaehrlich: 'niedrig' })
    const { akte: offen, ergebnis } = akteVon('C')
    for (const e of ergebnis.pflichten) expect(massnahme(offen, e.pflicht.id).prioritaet, e.pflicht.id).toBe(PRIORITAET_NACH_ZEITPUNKT[e.pflicht.zeitpunkt])
    // jede Stufe kommt in C vor
    expect(new Set(offen.massnahmen.map((m) => m.prioritaet))).toEqual(new Set(['hoch', 'mittel', 'niedrig']))

    const status = (bearbeitung: Bearbeitung) => ({ bearbeitung, notiz: 'privat', geaendertAm: HEUTE })
    const { akte } = akteVon('C', { gewerbeanzeige: status('erledigt'), handwerksrolle: status('trifftNichtZu'), lohnsteuer: status('offen') })
    gueltigOhneHinweise(akte)
    expect(massnahme(akte, 'gewerbeanzeige')).toMatchObject({ prioritaet: 'niedrig', erweiterungen: { pflichtenkompass: { status: 'erledigt' } } })
    expect(massnahme(akte, 'gewerbeanzeige').text).toMatch(/Im Pflichten-Kompass als „erledigt“ markiert\.$/)
    expect(massnahme(akte, 'handwerksrolle')).toMatchObject({ prioritaet: 'niedrig', erweiterungen: { pflichtenkompass: { status: 'trifftNichtZu' } } })
    expect(massnahme(akte, 'handwerksrolle').text).toMatch(/„trifft nicht zu“ markiert\.$/)
    expect(massnahme(akte, 'lohnsteuer').prioritaet).toBe('mittel')
    expect(massnahme(akte, 'lohnsteuer').text).not.toContain('markiert')
    expect([kennzahl(akte, 'pflichten-offen'), kennzahl(akte, 'pflichten-erledigt'), kennzahl(akte, 'pflichten-trifft-nicht-zu')]).toEqual([23, 1, 1])
    // Notizen bleiben in der App
    expect(serialisiereBeratungsakte(akte)).not.toContain('privat')
  })

  it('Stufen: Lücken „Prüfen“ mittel, „Nicht geprüft“ niedrig; Warnungen mittel mit Frage', () => {
    expect(SCHWERE_DER_LUECKE).toEqual({ pruefen: 'mittel', nichtGeprueft: 'niedrig' })
    const { akte } = akteVon('C')
    expect(akte.befunde.find((b) => b.kennung === 'luecke:geschaeftsfuehrung')).toMatchObject({ schwere: 'mittel', fundstelle: 'Ergebnis, Nicht geprüft', erweiterungen: { pflichtenkompass: { nr: 17, art: 'pruefen', regeln: ['LU20'] } } })
    expect(akte.befunde.find((b) => b.kennung === 'luecke:gewerbesteuer')).toMatchObject({ schwere: 'niedrig', text: 'Gewerbesteuer: in Version 0.1 nicht geprüft. Erklärung und Vorauszahlungen.' })

    // Warnungen aus der Prüfung 6.9 (F13 und F27)
    const p = beispiel('C').profil
    p.personal.beginn = '2027-03-15'
    const projekt = projektAus(p)
    const ergebnis = auswerten(projekt)
    const mitWarnung = beratungsakteAusErgebnis({ projekt, ergebnis, mandant: { name: 'M' }, jetzt: JETZT })
    gueltigOhneHinweise(mitWarnung)
    expect(mitWarnung.befunde[1]).toEqual({ kennung: 'warnung:1', schwere: 'mittel', text: 'Die Beschäftigung beginnt am 15.03.2027, vor der Tätigkeit am 01.04.2027.', fundstelle: 'Ergebnis, Warnung zu Frage 13' })

    const b = beispiel('B').profil
    b.steuern.umsatzErstesJahr = 100_000.01
    const projektB = projektAus(b)
    const akteB = beratungsakteAusErgebnis({ projekt: projektB, ergebnis: auswerten(projektB), mandant: { name: 'M' }, jetzt: JETZT })
    expect(akteB.befunde.find((x) => x.kennung === 'warnung:1')).toMatchObject({ schwere: 'mittel', text: WARNUNG_KLEINUNTERNEHMER, fundstelle: 'Ergebnis, Warnung zu Frage 27' })

    // Warnung ohne Frage (Gültigkeit einer Pflicht)
    const ohneFrage = beratungsakteAusErgebnis({ projekt, ergebnis: { ...ergebnis, warnungen: ['„X“ gilt erst ab 01.01.2030 und entfällt im betrachteten Zeitraum.'] }, mandant: { name: 'M' }, jetzt: JETZT })
    expect(ohneFrage.befunde[1]).toMatchObject({ kennung: 'warnung:1', schwere: 'mittel', fundstelle: 'Ergebnis, Warnung' })
  })

  it('Bezüge: Pflichten antworten auf keinen Befund; Kennungen eindeutig', () => {
    for (const id of ['A', 'C', 'E'] as const) {
      const { akte } = akteVon(id)
      expect(akte.massnahmen.every((m) => m.befunde.length === 0)).toBe(true)
      expect(new Set(akte.befunde.map((b) => b.kennung)).size).toBe(akte.befunde.length)
      expect(new Set(akte.massnahmen.map((m) => m.kennung)).size).toBe(akte.massnahmen.length)
    }
  })

  it('nach dem Start: Termine vor heute gezählt, Frist ist der nächste kommende Termin', () => {
    const projekt = projektAus(beispiel('A').profil)
    const heute = '2027-03-01'
    const ergebnis = auswerten(projekt, heute)
    const akte = beratungsakteAusErgebnis({ projekt, ergebnis, mandant: { name: 'M' }, jetzt: JETZT })
    gueltigOhneHinweise(akte)
    expect(akte.analyse.stand).toBe(heute)
    const vorHeute = ergebnis.pflichten.flatMap((e) => e.termine).filter((t) => t.faelligAm < heute).length
    expect(vorHeute).toBeGreaterThan(0)
    expect(kennzahl(akte, 'termine-vor-heute')).toBe(vorHeute)
    expect('frist' in massnahme(akte, 'gewerbeanzeige')).toBe(false) // einziger Termin am 15.01.2027
    expect(massnahme(akte, 'ustVoranmeldung').frist).toBe('2027-03-10')
  })

  it('Dateiname mit Umlauten im Mandanten, Mandantennummer und Quelldatei', () => {
    const { ergebnis, projekt } = akteVon('C')
    const akte = beratungsakteAusErgebnis({ projekt, ergebnis, mandant: { name: '  Bäckerei Groß & Söhne GbR ', kennung: ' K-0815 ' }, jetzt: JETZT, quelldatei: 'elektro-gmbh.pflichtenkompass' })
    gueltigOhneHinweise(akte)
    expect(akte.mandant).toEqual({ name: 'Bäckerei Groß & Söhne GbR', kennung: 'K-0815' })
    expect(akte.analyse.quelldatei).toBe('elektro-gmbh.pflichtenkompass')
    expect(dateinameBeratungsakte(akte)).toBe('Bäckerei-Groß-&-Söhne-GbR-pflichtenkompass-2026-11-13.beratungsakte.json')
    expect(dateinameBeratungsakte(akteDesBeispiels())).toBe('Elektro-GmbH-pflichtenkompass-2026-11-13.beratungsakte.json')
  })

  it('ohne Namen: leere Vorbelegung, Titel „Vorhaben ohne Namen“, ohne Kennung und Quelldatei', () => {
    const p = beispiel('B').profil
    p.name = '   '
    const projekt = projektAus(p)
    expect(mandantAusProjekt(projekt)).toBe('')
    const akte = beratungsakteAusErgebnis({ projekt, ergebnis: auswerten(projekt), mandant: { name: 'M', kennung: '  ' }, jetzt: JETZT, quelldatei: null })
    gueltigOhneHinweise(akte)
    expect(akte.analyse.titel).toBe('Vorhaben ohne Namen')
    expect(akte.mandant).toEqual({ name: 'M' })
    expect('quelldatei' in akte.analyse).toBe(false)
  })

  it('ein Ergebnis ohne Pflichten und Lücken ergibt eine gültige Akte mit dem Hinweis', () => {
    const projekt = neuesProjekt(HEUTE)
    const leer: Ergebnis = { katalogVersion: KATALOG_VERSION, stand: KATALOG_STAND, berechnetAm: HEUTE, horizont: { von: '2026-11-01', bis: '2028-10-31' }, pflichten: [], luecken: [], warnungen: [] }
    const akte = beratungsakteAusErgebnis({ projekt, ergebnis: leer, mandant: { name: 'M' }, jetzt: JETZT })
    gueltigOhneHinweise(akte)
    expect(akte.massnahmen).toEqual([])
    expect(akte.befunde.map((b) => b.kennung)).toEqual(['hinweis:keine-rechtsberatung'])
    expect(akte.kennzahlen).toHaveLength(11)
    expect(akte.kennzahlen.every((k) => k.wert === 0)).toBe(true)
  })

  it('lehnt einen leeren Mandanten ab', () => {
    const { ergebnis, projekt } = akteVon('A')
    expect(() => beratungsakteAusErgebnis({ projekt, ergebnis, mandant: { name: '' }, jetzt: JETZT })).toThrow('Bitte den Mandanten angeben.')
    expect(() => beratungsakteAusErgebnis({ projekt, ergebnis, mandant: { name: '  ' }, jetzt: JETZT })).toThrow('Bitte den Mandanten angeben.')
  })
})

// Dateien über Vite (import.meta.glob) wie in doku.test.ts; die App kennt die Typen von Node nicht
const gueltig = import.meta.glob<string>('/testdaten/beratungsakte/gueltig/*.json', { query: '?raw', import: 'default', eager: true })
const ungueltig = import.meta.glob<string>('/testdaten/beratungsakte/ungueltig/*.json', { query: '?raw', import: 'default', eager: true })
const schemaDatei = import.meta.glob<string>('/src/beratungsakte/beratungsakte-v1.schema.json', { query: '?raw', import: 'default', eager: true })

describe('Kopie der Bibliothek (src/beratungsakte)', () => {
  it('liest alle gültigen Beispiele', () => {
    expect(Object.keys(gueltig).length).toBeGreaterThan(0)
    for (const [d, text] of Object.entries(gueltig)) expect(leseBeratungsakte(text).ok, d).toBe(true)
  })

  it('lehnt alle ungültigen Beispiele ab', () => {
    expect(Object.keys(ungueltig).length).toBeGreaterThan(0)
    for (const [d, text] of Object.entries(ungueltig)) expect(leseBeratungsakte(text).ok, d).toBe(false)
  })

  it('meldet eine neuere Hauptversion', () => {
    const r = leseBeratungsakte(ungueltig['/testdaten/beratungsakte/ungueltig/neuere-hauptversion.json'])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.fehler.map((f) => f.code)).toContain('neuere-hauptversion')
  })

  it('schema.ts entspricht der Schema-Datei', () => {
    expect(SCHEMA).toEqual(JSON.parse(Object.values(schemaDatei)[0]))
  })
})

// Mit BERATUNGSAKTE_AUSGABE=<Ordner> schreibt der Test die Akte von Beispiel C dorthin (Beispieldatei des Formats).
const umgebung = (globalThis as unknown as { process: { env: Record<string, string | undefined> } }).process.env
interface Dateisystem {
  mkdirSync(pfad: string, o: { recursive: boolean }): void
  writeFileSync(pfad: string, text: string, kodierung: 'utf8'): void
}
it.runIf(!!umgebung.BERATUNGSAKTE_AUSGABE)('schreibt die Akte des Beispiels', async () => {
  const ziel = umgebung.BERATUNGSAKTE_AUSGABE!
  const modul = 'node:fs'
  const fs = (await import(/* @vite-ignore */ modul)) as Dateisystem
  const akte = akteDesBeispiels()
  fs.mkdirSync(ziel, { recursive: true })
  fs.writeFileSync(`${ziel}/${dateinameBeratungsakte(akte)}`, serialisiereBeratungsakte(akte), 'utf8')
})
