/**
 * Kalenderexport nach RFC 5545 (Spezifikation 7.5, Tests IC1–IC8 aus 9.9).
 */
import { beforeAll, describe, expect, it } from 'vitest'
import xml from '../../regeln/pflichten.dmn?raw'
import { pflicht } from '../katalog/pflichten'
import { KATALOG_VERSION } from '../katalog/typen'
import { beispiel } from '../modell/beispiele'
import type { Profil } from '../modell/typen'
import { werteAus } from '../regeln/auswertung'
import { ladeRegelwerk } from '../regeln/dmn'
import type { Ergebnis, Regelwerk, Termin } from '../regeln/typen'
import { entfalte, erzeugeIcs, escapeText, exportEintraege, falte, kalenderDateiname, profilSchluessel, type IcsOptionen, type KalenderEintrag } from './ics'

const HEUTE = '2026-11-11'
const EXPORTZEIT = new Date(Date.UTC(2026, 10, 11, 21, 5, 9))
let regelwerk: Regelwerk
beforeAll(async () => {
  regelwerk = await ladeRegelwerk(xml, '')
})

const auswerten = (p: Profil): Ergebnis => werteAus(regelwerk, p, { heute: HEUTE, horizontMonate: 24 })
const utf8 = (s: string) => new TextEncoder().encode(s).length

function optionen(eintraege: KalenderEintrag[], teil: Partial<IcsOptionen> = {}): IcsOptionen {
  return { vorhaben: '', eintraege, erinnerungTage: 7, exportzeit: EXPORTZEIT, profilschluessel: 'a1b2c3d4', katalogVersion: KATALOG_VERSION, ...teil }
}

/** Ein Termin mit Zeitraum und „gesetzlich bis“ (März 2027, 10.04. ist Samstag). */
const MAERZ: KalenderEintrag = {
  pflicht: pflicht('ustVoranmeldung'),
  termin: {
    pflichtId: 'ustVoranmeldung',
    titel: 'Umsatzsteuer-Voranmeldung',
    faelligAm: '2027-04-10',
    gesetzlichBis: '2027-04-12',
    zeitraum: 'März 2027',
    art: 'abgabeUndZahlung',
    hinweis: null,
    schluessel: '2027-03',
  },
}

/** Eigenschaften der VEVENT-Blöcke nach dem Entfalten. */
function ereignisse(ics: string): Map<string, string>[] {
  const bloecke = entfalte(ics).split('BEGIN:VEVENT\r\n').slice(1)
  return bloecke.map((b) => {
    const eigenschaften = new Map<string, string>()
    for (const zeile of b.split('\r\n')) {
      const i = zeile.indexOf(':')
      if (i > 0 && !eigenschaften.has(zeile.slice(0, i))) eigenschaften.set(zeile.slice(0, i), zeile.slice(i + 1))
    }
    return eigenschaften
  })
}

describe('Kalenderdatei (IC1–IC8)', () => {
  it('IC1: Grundgerüst mit CRLF', () => {
    const ics = erzeugeIcs(optionen([MAERZ]))
    expect(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//olbricht-digital//Pflichten-Kompass 0.1//DE\r\nCALSCALE:GREGORIAN\r\n')).toBe(true)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    // jede Zeile endet mit CRLF: kein LF ohne CR davor, kein CR ohne LF danach
    expect(/[^\r]\n/.test(ics)).toBe(false)
    expect(/\r[^\n]/.test(ics)).toBe(false)
  })

  it('IC2: je Termin ein VEVENT mit Pflichteigenschaften, Ende am Folgetag', () => {
    const [e] = ereignisse(erzeugeIcs(optionen([MAERZ])))
    expect(e.get('UID')).toBe('ustVoranmeldung-2027-03-a1b2c3d4@pflichtenkompass')
    expect(e.get('DTSTAMP')).toBe('20261111T210509Z')
    expect(e.get('DTSTART;VALUE=DATE')).toBe('20270410')
    expect(e.get('DTEND;VALUE=DATE')).toBe('20270411')
    expect(e.get('SUMMARY')).toBe('Umsatzsteuer-Voranmeldung – März 2027')
    expect(e.get('DESCRIPTION')).toContain('Keine Rechts- oder Steuerberatung.')
    expect(e.get('DESCRIPTION')).toContain('Quelle: https://www.gesetze-im-internet.de/ustg_1980/BJNR119530979.html')
    expect(e.get('DESCRIPTION')).toContain('Stand: 11.11.2026 (Katalog 2026.11.0)')
    expect(e.get('CATEGORIES')).toBe('Pflichten-Kompass')
    expect(e.get('TRANSP')).toBe('TRANSPARENT')
    // Jahreswechsel beim Ende
    const silvester = { ...MAERZ, termin: { ...MAERZ.termin, faelligAm: '2027-12-31', gesetzlichBis: null, schluessel: 'x' } }
    expect(ereignisse(erzeugeIcs(optionen([silvester])))[0].get('DTEND;VALUE=DATE')).toBe('20280101')
  })

  it('IC3: keine Zeile über 75 Oktette, Umlaute ganz, Entfalten ergibt den Text', () => {
    const lang = `Bäckerei Müller-Lüdenscheidt & Söhne ${'äöüß€'.repeat(20)} 🥐 Ende`
    const gefaltet = falte(`SUMMARY:${lang}`)
    for (const zeile of gefaltet.split('\r\n')) {
      expect(utf8(zeile)).toBeLessThanOrEqual(75)
      expect(/[\uD800-\uDBFF]$/.test(zeile)).toBe(false) // kein halbes Zeichen am Zeilenende
    }
    expect(gefaltet.split('\r\n').slice(1).every((z) => z.startsWith(' '))).toBe(true)
    expect(entfalte(gefaltet)).toBe(`SUMMARY:${lang}`)
    // genau 75 Oktette bleiben ungefaltet
    expect(falte('X'.repeat(75))).toBe('X'.repeat(75))
    expect(falte('X'.repeat(76))).toBe(`${'X'.repeat(75)}\r\n X`)

    const ics = erzeugeIcs(optionen([MAERZ], { vorhaben: lang }))
    expect(ics.split('\r\n').every((z) => utf8(z) <= 75)).toBe(true)
    expect(ereignisse(ics)[0].get('SUMMARY')).toBe(`[${escapeText(lang)}] Umsatzsteuer-Voranmeldung – März 2027`)
  })

  it('IC4: Nutzertext wird escaped und erzeugt keine neue Eigenschaft', () => {
    const ics = erzeugeIcs(optionen([MAERZ], { vorhaben: 'Müller, Söhne; Co\r\nKG\\X\nBEGIN:VALARM' }))
    const e = ereignisse(ics)[0]
    expect(e.get('SUMMARY')).toBe('[Müller\\, Söhne\\; Co\\nKG\\\\X\\nBEGIN:VALARM] Umsatzsteuer-Voranmeldung – März 2027')
    expect(entfalte(ics).split('\r\n').filter((z) => z === 'BEGIN:VALARM')).toHaveLength(1)
    expect(escapeText('Müller, Söhne; Co\nKG')).toBe('Müller\\, Söhne\\; Co\\nKG')
  })

  it('IC5: gleiche UIDs bei erneutem Export, andere bei anderem Profil', async () => {
    const a = beispiel('A').profil
    const eintraege = exportEintraege(auswerten(a), {}, { nurOffene: false, vergangene: false, heute: HEUTE })
    const uids = async (p: Profil) => ereignisse(erzeugeIcs(optionen(eintraege, { profilschluessel: await profilSchluessel(p) }))).map((e) => e.get('UID'))
    const erst = await uids(a)
    expect(await uids(beispiel('A').profil)).toEqual(erst)
    expect(new Set(erst).size).toBe(erst.length)
    const anders = await uids({ ...a, name: 'Kaffeeversand Nord' })
    expect(anders.some((u) => erst.includes(u))).toBe(false)
    expect(await profilSchluessel(a)).toMatch(/^[0-9a-f]{8}$/)
  })

  it('IC6: Erinnerung nach Einstellung, ohne Erinnerung kein VALARM', () => {
    const mit = entfalte(erzeugeIcs(optionen([MAERZ], { erinnerungTage: 7 })))
    expect(mit).toContain('BEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:Umsatzsteuer-Voranmeldung – März 2027\r\nTRIGGER:-P7D\r\nEND:VALARM\r\nEND:VEVENT')
    expect(entfalte(erzeugeIcs(optionen([MAERZ], { erinnerungTage: 14 })))).toContain('TRIGGER:-P14D')
    expect(erzeugeIcs(optionen([MAERZ], { erinnerungTage: 0 }))).not.toContain('VALARM')
  })

  it('IC7: „gesetzlich bis“ nennt beide Daten', () => {
    const beschreibung = ereignisse(erzeugeIcs(optionen([MAERZ])))[0].get('DESCRIPTION') ?? ''
    // im Kalender escaped: „Sa\, 10.04.2027“
    expect(beschreibung).toContain(escapeText('Termin: Sa, 10.04.2027 (vorsichtig angesetzt); gesetzlich bis: Mo, 12.04.2027'))
    const ohne: Termin = { ...MAERZ.termin, gesetzlichBis: null }
    expect(ereignisse(erzeugeIcs(optionen([{ ...MAERZ, termin: ohne }])))[0].get('DESCRIPTION')).not.toContain('gesetzlich bis')
  })

  it('IC8: Beispiel A ergibt 31 Termine', () => {
    const eintraege = exportEintraege(auswerten(beispiel('A').profil), {}, { nurOffene: false, vergangene: false, heute: HEUTE })
    const ics = erzeugeIcs(optionen(eintraege, { vorhaben: 'Kaffeeversand' }))
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(31)
    expect(ics.match(/END:VEVENT/g)).toHaveLength(31)
    expect(ereignisse(ics)[0].get('SUMMARY')).toBe('[Kaffeeversand] Gewerbe anzeigen')
  })
})

describe('Auswahl für den Export (5.4)', () => {
  it('lässt erledigte Pflichten und vergangene Termine auf Wunsch weg', () => {
    const e = auswerten(beispiel('A').profil)
    const alle = (heute: string, vergangene = false) => exportEintraege(e, {}, { nurOffene: false, vergangene, heute })
    expect(alle(HEUTE)).toHaveLength(31)
    // am 01.03.2027 liegen 5 Termine zurück: Gewerbe, Impressum, Verpackung (15.01.), Unfallversicherung (22.01.), Voranmeldung Januar (10.02.), Fragebogen (15.02.)
    expect(alle('2027-03-01')).toHaveLength(31 - 6)
    expect(alle('2027-03-01', true)).toHaveLength(31)
    const status = { ustVoranmeldung: { bearbeitung: 'erledigt' as const, notiz: '', geaendertAm: HEUTE }, impressum: { bearbeitung: 'trifftNichtZu' as const, notiz: '', geaendertAm: HEUTE } }
    expect(exportEintraege(e, status, { nurOffene: true, vergangene: false, heute: HEUTE })).toHaveLength(31 - 23 - 1)
    expect(exportEintraege(e, status, { nurOffene: false, vergangene: false, heute: HEUTE })).toHaveLength(31)
  })

  it('sortiert nach Datum, bei gleichem Tag nach Katalognummer', () => {
    const liste = exportEintraege(auswerten(beispiel('A').profil), {}, { nurOffene: false, vergangene: false, heute: HEUTE })
    expect(liste.slice(0, 3).map((x) => x.pflicht.nr)).toEqual([1, 38, 39])
  })

  it('benennt die Datei nach Vorhaben und Datum', () => {
    expect(kalenderDateiname('Café Müller', '2026-11-11')).toBe('pflichten-cafe-mueller-2026-11-11.ics')
    expect(kalenderDateiname('', '2026-11-11')).toBe('pflichten-vorhaben-2026-11-11.ics')
  })
})
