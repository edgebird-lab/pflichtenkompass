import { beforeAll, describe, expect, it } from 'vitest'
import xml from '../../regeln/pflichten.dmn?raw'
import { beispiel } from '../modell/beispiele'
import type { Beispiel, Profil } from '../modell/typen'
import { aenderungenSeitSpeichern, bedingungText, gespeichertAus, horizont, istGueltig, nachZeitpunkt, vergleiche, werteAus } from './auswertung'
import { ladeRegelwerk } from './dmn'
import type { Ergebnis, Regelwerk } from './typen'

const HEUTE = '2026-11-11'
let regelwerk: Regelwerk
beforeAll(async () => {
  regelwerk = await ladeRegelwerk(xml, '')
})

const auswerten = (p: Profil, vorher: Ergebnis | null = null) => werteAus(regelwerk, p, { heute: HEUTE, horizontMonate: 24, vorher })
const pflichten = (e: Ergebnis) => e.pflichten.map((p) => p.pflicht.nr)
const luecken = (e: Ergebnis) => e.luecken.map((l) => l.luecke.nr)
const regelnFuer = (e: Ergebnis, id: string) => e.pflichten.find((p) => p.pflicht.id === id)?.treffer.map((t) => t.regel)

/** Beispiel mit Änderungen am Profil (personal und steuern werden zusammengeführt). */
function abgewandelt(id: Beispiel['id'], aendern: (p: Profil) => void): Profil {
  const p = beispiel(id).profil
  aendern(p)
  return p
}

describe('Beispiele A–F (9.3, Golden Tests)', () => {
  const erwartet: Record<Beispiel['id'], { pflichten: number[]; luecken: number[] }> = {
    A: { pflichten: [1, 2, 8, 17, 18, 21, 24, 25, 28, 29, 38, 39, 40], luecken: [1, 5, 6, 8, 9, 10, 11] },
    B: { pflichten: [2, 8, 19, 20, 21, 25, 28, 29, 38], luecken: [6, 9, 10, 12] },
    C: { pflichten: [1, 2, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 20, 21, 22, 27, 29, 30, 34, 35, 37, 38], luecken: [1, 2, 6, 7, 8, 9, 10, 17] },
    D: { pflichten: [1, 2, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 21, 25, 26, 28, 29, 32, 33, 38], luecken: [1, 3, 4, 6, 7, 8, 9, 10] },
    E: { pflichten: [1, 2, 4, 5, 8, 17, 18, 20, 21, 23, 27, 29, 30, 34, 35, 36, 37, 38, 39, 40], luecken: [1, 2, 5, 6, 8, 9, 10, 11, 17] },
    F: { pflichten: [1, 2, 3, 8, 9, 10, 12, 13, 14, 17, 18, 20, 21, 22, 25, 27, 28, 29, 30, 32, 33, 37], luecken: [1, 6, 7, 8, 10, 11] },
  }
  for (const id of ['A', 'B', 'C', 'D', 'E', 'F'] as const) {
    it(`${id}: ${erwartet[id].pflichten.length} Pflichten, ${erwartet[id].luecken.length} Lücken`, () => {
      const e = auswerten(beispiel(id).profil)
      expect(pflichten(e)).toEqual(erwartet[id].pflichten)
      expect(luecken(e)).toEqual(erwartet[id].luecken)
    })
  }

  it('Anzahlen wie in E2: 13, 9, 25, 20, 20, 22', () => {
    expect((['A', 'B', 'C', 'D', 'E', 'F'] as const).map((id) => auswerten(beispiel(id).profil).pflichten.length)).toEqual([13, 9, 25, 20, 20, 22])
  })

  it('D: Sofortmeldung hat genau einen Treffer (PE03) mit zwei Bedingungen', () => {
    const e = auswerten(beispiel('D').profil)
    const sofort = e.pflichten.find((p) => p.pflicht.id === 'sofortmeldung')!
    expect(sofort.treffer).toHaveLength(1)
    expect(sofort.treffer[0].regel).toBe('PE03')
    expect(sofort.treffer[0].tabelle).toBe('Entscheidung_Personal')
    expect(sofort.treffer[0].bedingungen.map((b) => bedingungText(b))).toEqual(['Beschäftigte: 3', 'Bereich mit Sofortmeldepflicht: ja'])
    expect(sofort.treffer[0].bedingungen.map((b) => b.eintrag)).toEqual(['> 0', 'true'])
  })

  it('Rechnungen: C zwei Treffer (ST04, ST16), B einer (ST04), E einer (ST05)', () => {
    expect(regelnFuer(auswerten(beispiel('C').profil), 'rechnungen')).toEqual(['ST04', 'ST16'])
    expect(regelnFuer(auswerten(beispiel('B').profil), 'rechnungen')).toEqual(['ST04'])
    expect(regelnFuer(auswerten(beispiel('E').profil), 'rechnungen')).toEqual(['ST05'])
  })

  it('LU20 bringt Lücke 17 zu C und E', () => {
    for (const id of ['C', 'E'] as const) expect(auswerten(beispiel(id).profil).luecken.find((l) => l.luecke.nr === 17)?.treffer.map((t) => t.regel)).toEqual(['LU20'])
  })

  it('„Warum?“ nennt die erfüllten Bedingungen mit Fragen (5.3)', () => {
    const a = auswerten(beispiel('A').profil)
    const impressum = a.pflichten.find((p) => p.pflicht.id === 'impressum')!
    expect(impressum.treffer[0].bedingungen.map((b) => bedingungText(b))).toEqual(['Online-Auftritt: ja'])
    const c = auswerten(beispiel('C').profil)
    const gmbh = c.pflichten.find((p) => p.pflicht.id === 'handelsregisterGmbh')!
    expect(gmbh.treffer[0].bedingungen.map((b) => bedingungText(b, true))).toEqual(['Rechtsform: GmbH (Frage 4)'])
    const betrieb = c.pflichten.find((p) => p.pflicht.id === 'betriebsnummer')!
    expect(betrieb.treffer[0].bedingungen.map((b) => bedingungText(b, true))).toEqual(['Beschäftigte: 3 (Fragen 12, 14, 15)'])
    // Regeln ohne Bedingung (GR02) haben eine leere Liste, aber eine Begründung
    const erfassung = c.pflichten.find((p) => p.pflicht.id === 'steuerlicheErfassung')!
    expect(erfassung.treffer[0]).toMatchObject({ regel: 'GR02', bedingungen: [] })
    expect(erfassung.treffer[0].begruendung).toContain('Finanzamt')
  })

  it('fasst mehrere Treffer einer Lücke zusammen (Datenschutz bei D über LU06 und LU07)', () => {
    const d = auswerten(beispiel('D').profil)
    expect(d.luecken.find((l) => l.luecke.id === 'datenschutz')?.treffer.map((t) => t.regel)).toEqual(['LU06', 'LU07'])
  })

  it('trägt Katalogversion, Stand, Berechnungstag, Horizont und Termine ein', () => {
    const e = auswerten(beispiel('A').profil)
    expect([e.katalogVersion, e.stand, e.berechnetAm]).toEqual(['2026.11.0', '2026-11-11', HEUTE])
    expect(e.horizont).toEqual({ von: '2027-01-01', bis: '2028-12-31' })
    expect(e.warnungen).toEqual([])
    expect(e.pflichten.some((p) => p.neu)).toBe(false)
    // TE1: 31 Termine; die Einzelheiten prüft fristen/termine.test.ts
    expect(e.pflichten.flatMap((p) => p.termine)).toHaveLength(31)
  })

  it('rechnet ohne Bundesland noch keine Termine', () => {
    const e = auswerten({ ...beispiel('A').profil, bundesland: null })
    expect(e.pflichten.flatMap((p) => p.termine)).toEqual([])
    expect(e.pflichten.flatMap((p) => p.rechenweg)).toEqual([])
  })
})

describe('Gezielte Regeltests (9.4)', () => {
  const unterschied = (vorher: Ergebnis, nachher: Ergebnis) => ({
    ohne: pflichten(vorher).filter((n) => !pflichten(nachher).includes(n)),
    mit: pflichten(nachher).filter((n) => !pflichten(vorher).includes(n)),
    ohneLuecken: luecken(vorher).filter((n) => !luecken(nachher).includes(n)),
    mitLuecken: luecken(nachher).filter((n) => !luecken(vorher).includes(n)),
  })
  const vergleich = (id: Beispiel['id'], aendern: (p: Profil) => void) => unterschied(auswerten(beispiel(id).profil), auswerten(abgewandelt(id, aendern)))

  it('RT1: F ohne kaufmännische Einrichtung, 850.000 € Umsatz → ohne 3, 27, 30, 37; mit 31', () => {
    const u = vergleich('F', (p) => {
      p.kaufmaennisch = 'nein'
      p.steuern.umsatzErstesJahr = 850_000
    })
    expect(u).toMatchObject({ ohne: [3, 27, 30, 37], mit: [31] })
  })

  it('RT2: F mit 700.000 € und 70.000 € → befreit nach § 241a HGB: ohne 27, 30; 3 und 37 bleiben', () => {
    const p = abgewandelt('F', (x) => {
      x.steuern.umsatzErstesJahr = 700_000
      x.steuern.gewinnErstesJahr = 70_000
    })
    const u = unterschied(auswerten(beispiel('F').profil), auswerten(p))
    expect(u).toMatchObject({ ohne: [27, 30], mit: [] })
    expect(pflichten(auswerten(p))).toEqual(expect.arrayContaining([3, 37]))
  })

  it('RT3: D mit eingetragener GbR → zusätzlich 5 (GR06)', () => {
    const p = abgewandelt('D', (x) => (x.gbrEingetragen = true))
    expect(unterschied(auswerten(beispiel('D').profil), auswerten(p))).toMatchObject({ ohne: [], mit: [5] })
    expect(regelnFuer(auswerten(p), 'transparenzregister')).toEqual(['GR06'])
  })

  it('RT4: D mit kaufmännischer Einrichtung → zusätzlich 3, 5, 27 (ST14), 30 (BU03), 37', () => {
    const p = abgewandelt('D', (x) => (x.kaufmaennisch = 'ja'))
    expect(unterschied(auswerten(beispiel('D').profil), auswerten(p))).toMatchObject({ ohne: [], mit: [3, 5, 27, 30, 37] })
    expect(regelnFuer(auswerten(p), 'eBilanz')).toEqual(['ST14'])
    expect(regelnFuer(auswerten(p), 'buchfuehrungHgb')).toEqual(['BU03'])
  })

  it('RT5: D ohne Pauschsteuer → zusätzlich 14', () => {
    expect(vergleich('D', (p) => (p.personal.minijobPauschsteuer = false))).toMatchObject({ ohne: [], mit: [14] })
  })

  it('RT6: C mit zulassungsfreiem Handwerk → 7 statt 6; bei „unklar“ weder 6 noch 7, dafür Lücke 15', () => {
    expect(vergleich('C', (p) => (p.handwerk = 'zulassungsfrei'))).toMatchObject({ ohne: [6], mit: [7], mitLuecken: [] })
    expect(vergleich('C', (p) => (p.handwerk = 'unklar'))).toMatchObject({ ohne: [6], mit: [], mitLuecken: [15] })
  })

  it('RT7: B ohne Kleinunternehmerregelung → ohne 19; mit 17, 18, 22, 23; Lücke 12 entfällt', () => {
    expect(vergleich('B', (p) => (p.steuern.kleinunternehmer = false))).toEqual({ ohne: [19], mit: [17, 18, 22, 23], ohneLuecken: [12], mitLuecken: [] })
  })

  it('RT8: E freiberuflich → ohne 1; Lücke 13 neu; Lücken 1 und 8 entfallen', () => {
    expect(vergleich('E', (p) => (p.taetigkeit = 'freiberuflich'))).toEqual({ ohne: [1], mit: [], ohneLuecken: [1, 8], mitLuecken: [13] })
  })

  it('RT9: A mit „unklar“ bei der kaufmännischen Einrichtung → Lücke 14; Pflichten unverändert', () => {
    expect(vergleich('A', (p) => (p.kaufmaennisch = 'unklar'))).toEqual({ ohne: [], mit: [], ohneLuecken: [], mitLuecken: [14] })
  })

  it('RT10: B mit 30.000 € Umsatz → Lücke 16', () => {
    expect(vergleich('B', (p) => (p.steuern.umsatzErstesJahr = 30_000))).toEqual({ ohne: [], mit: [], ohneLuecken: [], mitLuecken: [16] })
  })

  it('RT11: B mit 100.000,01 € → Warnung „nicht anwendbar“; Pflichten wie RT7; ohne Lücken 12 und 16', () => {
    const e = auswerten(abgewandelt('B', (p) => (p.steuern.umsatzErstesJahr = 100_000.01)))
    const rt7 = auswerten(abgewandelt('B', (p) => (p.steuern.kleinunternehmer = false)))
    expect(e.warnungen.some((w) => w.includes('nicht anwendbar'))).toBe(true)
    expect(pflichten(e)).toEqual(pflichten(rt7))
    expect(luecken(e)).not.toContain(12)
    expect(luecken(e)).not.toContain(16)
  })
})

describe('Gültigkeit, Horizont, Neu-Markierung, Warnungen', () => {
  it('berechnet den Horizont vom 1. des Startmonats', () => {
    expect(horizont('2027-04-01', 24)).toEqual({ von: '2027-04-01', bis: '2029-03-31' }) // Beispiel C
    expect(horizont('2027-01-15', 12)).toEqual({ von: '2027-01-01', bis: '2027-12-31' })
    expect(horizont('2028-02-29', 24)).toEqual({ von: '2028-02-01', bis: '2030-01-31' })
  })

  it('lässt Pflichten außerhalb ihrer Gültigkeit entfallen (6.1, Schritt 4)', () => {
    const p = { gueltigAb: '2026-08-12', gueltigBis: null }
    expect(istGueltig(p, '2026-01-01', '2026-12-31')).toBe(true)
    expect(istGueltig(p, '2026-01-01', '2026-08-11')).toBe(false) // beginnt erst nach dem Horizont
    expect(istGueltig(p, '2026-01-01', '2026-08-12')).toBe(true) // gilt ab dem letzten Tag
    expect(istGueltig({ gueltigAb: null, gueltigBis: '2026-12-31' }, '2027-01-01', '2028-12-31')).toBe(false) // endet vor dem Start
    expect(istGueltig({ gueltigAb: null, gueltigBis: '2026-12-31' }, '2026-12-31', '2028-12-31')).toBe(true)
    expect(istGueltig({ gueltigAb: null, gueltigBis: null }, '2030-12-31', '2031-12-31')).toBe(true)
  })

  it('markiert neue Pflichten gegenüber dem vorigen Ergebnis und nennt entfallene', () => {
    const vorher = auswerten(beispiel('A').profil)
    const p = abgewandelt('A', (x) => {
      x.website = false
      x.personal = { ...x.personal, vorhanden: true, beginn: '2027-02-01', svPflichtig: 1 }
    })
    const jetzt = auswerten(p, vorher)
    expect(jetzt.pflichten.filter((x) => x.neu).map((x) => x.pflicht.id)).toEqual(['betriebsnummer', 'svAnmeldung', 'beitragsnachweis', 'lohnunterlagen', 'lohnsteuer'])
    expect(vergleiche(vorher, jetzt)).toEqual({ neu: ['betriebsnummer', 'svAnmeldung', 'beitragsnachweis', 'lohnunterlagen', 'lohnsteuer'], entfallen: ['impressum'] })
    expect(vergleiche(null, jetzt)).toEqual({ neu: [], entfallen: [] })
  })

  it('übernimmt die Warnungen aus 6.9 (Beschäftigung vor dem Start)', () => {
    const p = abgewandelt('C', (x) => (x.personal.beginn = '2027-03-15'))
    expect(auswerten(p).warnungen).toEqual(['Die Beschäftigung beginnt am 15.03.2027, vor der Tätigkeit am 01.04.2027.'])
  })

  it('SP6: gespeichert ohne Verpackung → Hinweis „neu: verpackung“', () => {
    const e = auswerten(beispiel('A').profil)
    const gespeichert = gespeichertAus(e, '2027-01-10')
    expect(gespeichert.katalogVersion).toBe('2026.11.0')
    expect(gespeichert.pflichten).toHaveLength(13)
    const ohneVerpackung = { ...gespeichert, pflichten: gespeichert.pflichten.filter((p) => p.id !== 'verpackung') }
    expect(aenderungenSeitSpeichern(ohneVerpackung, e)).toEqual({ neu: ['verpackung'], entfallen: [], geaendert: [] })
    const mitAlterPflicht = { ...gespeichert, pflichten: [...gespeichert.pflichten.map((p) => (p.id === 'impressum' ? { ...p, stand: '2026-01-01' } : p)), { id: 'pflichtAus2025', stand: '2025-12-01' }] }
    expect(aenderungenSeitSpeichern(mitAlterPflicht, e)).toEqual({ neu: [], entfallen: ['pflichtAus2025'], geaendert: ['impressum'] })
    expect(aenderungenSeitSpeichern(null, e)).toEqual({ neu: [], entfallen: [], geaendert: [] })
  })
})

describe('Gruppen für die Anzeige (5.3)', () => {
  it('ordnet nach Zeitpunkt, dann nach nächstem Termin und Katalognummer', () => {
    const gruppen = nachZeitpunkt(auswerten(beispiel('A').profil).pflichten, HEUTE)
    expect(gruppen.map((g) => [g.titel, g.pflichten.map((p) => p.pflicht.nr)])).toEqual([
      ['Vor dem Start', [1, 38, 39]],
      ['In den ersten Wochen', [8, 2]],
      ['Laufend', [17, 21, 24, 28, 29]],
      ['Jährlich', [40, 18, 25]],
    ])
  })

  it('stellt Pflichten ohne kommenden Termin hinter die mit Termin', () => {
    const gruppen = nachZeitpunkt(auswerten(beispiel('A').profil).pflichten, '2027-03-01')
    expect(gruppen[0].pflichten.map((p) => p.pflicht.nr)).toEqual([1, 38, 39])
    expect(gruppen[1].pflichten.map((p) => p.pflicht.nr)).toEqual([2, 8])
  })
})
