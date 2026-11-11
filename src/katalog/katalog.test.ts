import { describe, expect, it } from 'vitest'
import katalogMd from '../../docs/katalog.md?raw'
import { istDatum } from '../fristen/datum'
import { katalogDoku } from './doku'
import { GESETZ_KUERZEL, GESETZ_QUELLE, normenText, normLink, normText } from './normen'
import { PFLICHTEN, pflicht } from './pflichten'
import { QUELLEN, RECHTSQUELLEN } from './quellen'
import { GESETZE, KATALOG_STAND, PFLICHT_IDS, QUELLE_IDS } from './typen'

const LINK = /^https:\/\/www\.gesetze-im-internet\.de\/([a-z0-9_]+)\/__(\d+[a-z]?)\.html$/

describe('Pflichtenkatalog 2026.11.0', () => {
  it('KA1: 40 Pflichten, IDs eindeutig, je eine Norm und eine Quelle aus Q1–Q15', () => {
    expect(PFLICHTEN).toHaveLength(40)
    expect(new Set(PFLICHTEN.map((p) => p.id)).size).toBe(40)
    for (const p of PFLICHTEN) {
      expect(p.normen.length, p.id).toBeGreaterThan(0)
      expect(p.quellen.length, p.id).toBeGreaterThan(0)
      for (const q of p.quellen) expect(RECHTSQUELLEN, `${p.id}: ${q}`).toContain(q)
    }
  })

  it('KA2: Normlinks folgen dem Muster aus 3.3 und nutzen nur bekannte Kürzel', () => {
    const kuerzel = new Set(Object.values(GESETZ_KUERZEL))
    expect(kuerzel).toEqual(new Set(['ao_1977', 'ustg_1980', 'ustdv_1980', 'estg', 'hgb', 'gmbhg', 'gewo', 'hwo', 'sgb_4', 'sgb_7', 'ddg', 'verpackdg', 'milog', 'gwg_2017', 'ifsg']))
    for (const p of PFLICHTEN) {
      for (const n of p.normen) {
        const m = LINK.exec(normLink(n))
        expect(m, `${p.id}: ${normText(n)}`).not.toBeNull()
        expect(kuerzel.has(m![1])).toBe(true)
        expect(m![2]).toBe(n.paragraf)
      }
    }
    expect(normLink({ gesetz: 'AO', paragraf: '146a' })).toBe('https://www.gesetze-im-internet.de/ao_1977/__146a.html')
    expect(() => normLink({ gesetz: 'AO', paragraf: '46–48' })).toThrow()
  })

  it('KA3: Stand höchstens Katalogstand, gültig ab nicht nach gültig bis', () => {
    for (const p of PFLICHTEN) {
      expect(istDatum(p.stand), p.id).toBe(true)
      expect(p.stand <= KATALOG_STAND, p.id).toBe(true)
      if (p.gueltigAb !== null) expect(istDatum(p.gueltigAb)).toBe(true)
      if (p.gueltigBis !== null) expect(istDatum(p.gueltigBis)).toBe(true)
      if (p.gueltigAb && p.gueltigBis) expect(p.gueltigAb <= p.gueltigBis, p.id).toBe(true)
    }
    // Nr. 39 und 40 gelten ab Inkrafttreten des VerpackDG, sonst ohne Grenzen
    expect(PFLICHTEN.filter((p) => p.gueltigAb !== null).map((p) => [p.nr, p.gueltigAb])).toEqual([
      [39, '2026-08-12'],
      [40, '2026-08-12'],
    ])
    expect(PFLICHTEN.every((p) => p.gueltigBis === null)).toBe(true)
  })

  it('hält Nummern, Reihenfolge und Gruppen aus 6.6 ein', () => {
    expect(PFLICHTEN.map((p) => p.nr)).toEqual(Array.from({ length: 40 }, (_, i) => i + 1))
    expect(PFLICHTEN.map((p) => p.id)).toEqual([...PFLICHT_IDS])
    const gruppe = (nr: number) => (nr <= 8 ? 'gruendung' : nr <= 16 ? 'personal' : nr <= 28 ? 'steuern' : nr <= 37 ? 'buchfuehrung' : 'online')
    for (const p of PFLICHTEN) expect(p.gruppe, p.id).toBe(gruppe(p.nr))
  })

  it('übernimmt die Zeitpunkte aus 6.6', () => {
    const kuerzel = { vorStart: 'V', ersteWochen: 'W', laufend: 'L', jaehrlich: 'J' } as const
    expect(PFLICHTEN.map((p) => kuerzel[p.zeitpunkt]).join('')).toBe('VWWVWVWW' + 'VVVLLLLV' + 'LJLLLLLLJJJL' + 'LLLLWJJJL' + 'VVJ')
  })

  it('hat vollständige Texte: Titel höchstens 60 Zeichen, ganze Sätze', () => {
    for (const p of PFLICHTEN) {
      expect(p.titel.length, p.id).toBeLessThanOrEqual(60)
      expect(p.kurz, p.id).toMatch(/^[A-ZÄÖÜ].*\.$/)
      expect(p.fristText.trim().length, p.id).toBeGreaterThan(0)
      expect(p.stelle.trim().length, p.id).toBeGreaterThan(0)
      expect(p.fristen.length, p.id).toBeGreaterThan(0)
      for (const h of p.hinweise) expect(h, p.id).toMatch(/[.)]$/)
    }
  })

  it('nennt zu jeder Norm die geöffnete Quelle ihres Gesetzes', () => {
    expect(Object.keys(GESETZ_QUELLE).sort()).toEqual([...GESETZE].sort())
    for (const p of PFLICHTEN) for (const n of p.normen) expect(p.quellen, `${p.id}: ${normText(n)}`).toContain(GESETZ_QUELLE[n.gesetz])
  })

  it('schreibt Normen wie die Normenspalte in 6.6', () => {
    expect(normenText(pflicht('steuerlicheErfassung').normen)).toBe('§ 138 Abs. 1 Satz 3, Abs. 1b, Abs. 4 AO; UG/GmbH: § 137 AO')
    expect(normenText(pflicht('handelsregister').normen)).toBe('§ 1 HGB, § 12 Abs. 1 HGB, § 29 HGB; OHG: § 105 Abs. 1 HGB, § 106 Abs. 1 HGB')
    expect(normenText(pflicht('eBilanz').normen)).toBe('§ 5b Abs. 1 EStG; Bilanzpflicht: § 6 HGB, § 238 HGB, § 242 HGB, § 13 Abs. 3 GmbHG')
    expect(normenText(pflicht('gewerbeanzeige').normen)).toBe('§ 14 Abs. 1 GewO, § 15 Abs. 1 GewO, § 138 Abs. 1 Satz 1 AO')
  })

  it('setzt die Fristregeln aus 6.6 und 6.8.3', () => {
    expect(pflicht('steuerlicheErfassung').fristen).toEqual([{ art: 'nachEreignis', ereignis: 'start', monate: 1, tage: 0, ao108: true }])
    expect(pflicht('berufsgenossenschaft').fristen).toEqual([{ art: 'nachEreignis', ereignis: 'start', monate: 0, tage: 7, ao108: false }])
    expect(pflicht('elektronischeKasse').fristen).toEqual([{ art: 'nachEreignis', ereignis: 'kassenanschaffung', monate: 1, tage: 0, ao108: true }])
    expect(pflicht('handelsregister').fristen).toEqual([{ art: 'ohneFesteFrist' }])
    expect(pflicht('lohnsteuer').fristen).toEqual([
      { art: 'berechnet', berechnung: 'lohnsteuer' },
      { art: 'berechnet', berechnung: 'lohnsteuerbescheinigung' },
    ])
    expect(pflicht('verpackung').fristen).toEqual([
      { art: 'bisEreignis', ereignis: 'start' },
      { art: 'berechnet', berechnung: 'verpackungUebergang' },
    ])
    const ereignisse = PFLICHTEN.flatMap((p) => p.fristen.flatMap((f) => ('ereignis' in f ? [`${p.nr}:${f.ereignis}`] : [])))
    expect(ereignisse).toEqual(['1:start', '2:start', '4:start', '5:start', '6:start', '7:start', '8:start', '9:beschaeftigung', '10:beschaeftigung', '11:beschaeftigung', '33:kassenanschaffung', '38:start', '39:start'])
  })
})

describe('Quellen (Abschnitt 12)', () => {
  it('hat Q1–Q17 mit URL, Abrufdatum und Stand', () => {
    expect(QUELLEN.map((q) => q.id)).toEqual([...QUELLE_IDS])
    for (const q of QUELLEN) {
      expect(q.url, q.id).toMatch(/^https:\/\//)
      expect(istDatum(q.abgerufen), q.id).toBe(true)
      expect(q.abgerufen <= KATALOG_STAND).toBe(true)
      expect(q.stand.length, q.id).toBeGreaterThan(0)
    }
    expect(QUELLEN[0].abgerufen).toBe('2026-11-10')
  })

  it('verweist bei Rechtsquellen auf gesetze-im-internet.de mit dem Kürzel des Gesetzes', () => {
    for (const g of GESETZE) {
      const q = QUELLEN.find((x) => x.id === GESETZ_QUELLE[g])!
      expect(q.url, g).toContain(`https://www.gesetze-im-internet.de/${GESETZ_KUERZEL[g]}/`)
    }
  })
})

describe('docs/katalog.md', () => {
  it('ist aus dem aktuellen Katalog erzeugt (sonst: npm run doku)', () => {
    expect(katalogMd.replace(/\r\n/g, '\n')).toBe(katalogDoku())
  })

  it('enthält alle Pflichten und den Hinweis „keine Rechtsberatung“', () => {
    for (const p of PFLICHTEN) expect(katalogMd).toContain(`### ${p.nr}. ${p.titel}`)
    expect(katalogMd).toContain('**Keine Rechtsberatung.**')
  })
})
