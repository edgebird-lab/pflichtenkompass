/**
 * Berechnungen nach 6.8.4–6.8.12 (Tests US, LS, ER, AU, KU, GG aus 9.7).
 * Alle erwarteten Werte von Hand nachgerechnet.
 */
import { describe, expect, it } from 'vitest'
import { standardProfil } from '../modell/profil'
import type { Profil } from '../modell/typen'
import { wirksam } from '../modell/wirksam'
import {
  aufbewahrenBis,
  eRechnungAb,
  geringfuegigkeitsgrenze,
  HINWEIS_LST_LEER,
  HINWEIS_LST_SCHAETZUNG,
  HINWEIS_LST_VORJAHR,
  HINWEIS_UST_BEFREIUNG,
  HINWEIS_UST_O4,
  HINWEIS_UST_VORJAHR,
  kleinunternehmerStatus,
  lstZeitraum,
  lstZeitraumAusBasis,
  svFaelligkeit,
  ustFaelligkeit,
  ustZeitraum,
} from './berechnungen'

type Teil = Partial<Omit<Profil, 'personal' | 'steuern' | 'kunden'>> & {
  personal?: Partial<Profil['personal']>
  steuern?: Partial<Profil['steuern']>
  kunden?: Partial<Profil['kunden']>
}

/** Standardprofil mit gewerblichem Einzelunternehmen in NW, dazu die genannten Antworten. */
function profil(teil: Teil): Profil {
  const p = standardProfil('2026-11-11')
  return {
    ...p,
    bundesland: 'NW',
    branchen: ['dienstleistung'],
    ...teil,
    personal: { ...p.personal, ...teil.personal },
    steuern: { ...p.steuern, ...teil.steuern },
    kunden: { ...p.kunden, ...teil.kunden },
  }
}

describe('Umsatzsteuer-Voranmeldungszeitraum (US1–US9)', () => {
  const start2026 = (ust: number | null) => profil({ start: '2026-03-01', steuern: { ustErstesJahr: ust } })

  it('US1: Zahllast 2026 von 12.000 € → monatlich', () => {
    expect(ustZeitraum(2026, start2026(12_000))).toEqual({ zeitraum: 'monat', hinweis: null })
  })
  it('US2: genau 9.000 € → vierteljährlich', () => {
    expect(ustZeitraum(2026, start2026(9_000))).toEqual({ zeitraum: 'quartal', hinweis: null })
    expect(ustZeitraum(2026, start2026(9_000.01)).zeitraum).toBe('monat')
  })
  it('US3: 1.500 € → vierteljährlich mit Hinweis auf Befreiung', () => {
    expect(ustZeitraum(2026, start2026(1_500))).toEqual({ zeitraum: 'quartal', hinweis: HINWEIS_UST_BEFREIUNG })
    expect(ustZeitraum(2026, start2026(2_000)).hinweis).toBe(HINWEIS_UST_BEFREIUNG)
    expect(ustZeitraum(2026, start2026(2_000.01)).hinweis).toBeNull()
  })
  it('US4: ohne Angabe vorsichtig monatlich', () => {
    expect(ustZeitraum(2026, start2026(null))).toEqual({ zeitraum: 'monat', hinweis: null })
  })
  it('US5: Gründung 2026, Jahr 2027 → monatlich mit Prüfhinweis O4', () => {
    expect(ustZeitraum(2027, start2026(1_500))).toEqual({ zeitraum: 'monat', hinweis: HINWEIS_UST_O4 })
  })
  it('US6: Gründung 2027 → 2027 und 2028 monatlich', () => {
    const p = profil({ start: '2027-01-15' })
    expect(ustZeitraum(2027, p)).toEqual({ zeitraum: 'monat', hinweis: null })
    expect(ustZeitraum(2028, p)).toEqual({ zeitraum: 'monat', hinweis: null })
  })
  it('US7: Gründung 2027, Jahr 2029 → monatlich, Vorjahreswert fehlt', () => {
    expect(ustZeitraum(2029, profil({ start: '2027-01-15' }))).toEqual({ zeitraum: 'monat', hinweis: HINWEIS_UST_VORJAHR })
    expect(ustZeitraum(2028, start2026(null)).hinweis).toBe(HINWEIS_UST_VORJAHR)
  })
  it('US8: Kleinunternehmer → keine Voranmeldung', () => {
    expect(ustZeitraum(2027, profil({ start: '2027-01-15', steuern: { kleinunternehmer: true, umsatzErstesJahr: 18_000 } }))).toEqual({ zeitraum: 'keine', hinweis: null })
    // über 100.000 € ist die Regelung nicht anwendbar (6.9): dann doch Voranmeldung
    expect(ustZeitraum(2027, profil({ start: '2027-01-15', steuern: { kleinunternehmer: true, umsatzErstesJahr: 100_000.01 } })).zeitraum).toBe('monat')
  })
  it('US9: Fälligkeit für Januar 2027 ohne und mit Dauerfristverlängerung', () => {
    expect(ustFaelligkeit('2027-01-31', false)).toBe('2027-02-10')
    expect(ustFaelligkeit('2027-01-31', true)).toBe('2027-03-10')
    expect(ustFaelligkeit('2026-12-31', false)).toBe('2027-01-10') // 4. Quartal 2026
  })
  it('ignoriert eine ausgeblendete Zahllast (F29 nur bei F27 = nein)', () => {
    const p = profil({ start: '2026-03-01', steuern: { kleinunternehmer: true, umsatzErstesJahr: 150_000, ustErstesJahr: 1_500 } })
    expect(ustZeitraum(2026, p)).toEqual({ zeitraum: 'monat', hinweis: null })
  })
  it('kennt vor dem Gründungsjahr keinen Zeitraum', () => {
    expect(ustZeitraum(2026, profil({ start: '2027-01-15' })).zeitraum).toBe('keine')
  })
})

describe('Lohnsteuer-Anmeldungszeitraum (LS1–LS7)', () => {
  it('LS1–LS4: Grenzen 5.000 € und 1.080 €', () => {
    expect(lstZeitraumAusBasis(5_000)).toBe('quartal')
    expect(lstZeitraumAusBasis(5_000.01)).toBe('monat')
    expect(lstZeitraumAusBasis(1_080)).toBe('jahr')
    expect(lstZeitraumAusBasis(1_080.01)).toBe('quartal')
    expect(lstZeitraumAusBasis(0)).toBe('jahr')
    expect(lstZeitraumAusBasis(null)).toBe('monat')
  })

  const mitLohnsteuer = (f18: number | null) => profil({ start: '2027-04-01', personal: { vorhanden: true, beginn: '2027-04-01', svPflichtig: 2, lohnsteuerJeMonat: f18 } })

  it('LS5: 450 € im Monat (Basis 5.400 €) → monatlich', () => {
    expect(lstZeitraum(2027, mitLohnsteuer(450))).toEqual({ zeitraum: 'monat', basis: 5_400, hinweis: null })
  })
  it('LS6: 400 € im Monat (Basis 4.800 €) → vierteljährlich', () => {
    expect(lstZeitraum(2027, mitLohnsteuer(400))).toEqual({ zeitraum: 'quartal', basis: 4_800, hinweis: null })
  })
  it('LS7: ohne Angabe vorsichtig monatlich', () => {
    expect(lstZeitraum(2027, mitLohnsteuer(null))).toEqual({ zeitraum: 'monat', basis: null, hinweis: HINWEIS_LST_LEER })
  })
  it('schätzt das Folgejahr aus F18 × 12 und rechnet danach monatlich (O11)', () => {
    expect(lstZeitraum(2028, mitLohnsteuer(400))).toEqual({ zeitraum: 'quartal', basis: 4_800, hinweis: HINWEIS_LST_SCHAETZUNG })
    expect(lstZeitraum(2029, mitLohnsteuer(400))).toEqual({ zeitraum: 'monat', basis: null, hinweis: HINWEIS_LST_VORJAHR })
  })
  it('nimmt das Jahr des Beschäftigungsbeginns, ohne Angabe F02', () => {
    const spaeter = profil({ start: '2027-04-01', personal: { vorhanden: true, beginn: '2028-02-01', svPflichtig: 1, lohnsteuerJeMonat: 50 } })
    expect(lstZeitraum(2028, spaeter)).toEqual({ zeitraum: 'jahr', basis: 600, hinweis: null })
    const ohneBeginn = profil({ start: '2027-04-01', personal: { vorhanden: true, beginn: null, svPflichtig: 1, lohnsteuerJeMonat: 50 } })
    expect(lstZeitraum(2027, ohneBeginn).basis).toBe(600)
  })
})

describe('SV-Fälligkeit (6.8.6)', () => {
  it('setzt Fälligkeit, Nachweistag und Termin wie BA1 und TE8', () => {
    expect(svFaelligkeit(2026, 12, 'NW')).toEqual({ faellig: '2026-12-28', nachweis: '2026-12-22', termin: '2026-12-21' })
    expect(svFaelligkeit(2027, 4, 'BY')).toEqual({ faellig: '2027-04-28', nachweis: '2027-04-26', termin: '2027-04-23' })
  })
})

describe('E-Rechnungspflicht ab (ER1–ER5)', () => {
  const start2026 = (umsatz: number | null) => profil({ start: '2026-06-01', kunden: { unternehmenInland: true }, steuern: { umsatz2026: umsatz } })

  it('ER1: Gesamtumsatz 2026 genau 800.000 € → ab 2028', () => {
    expect(eRechnungAb(start2026(800_000))).toBe('2028-01-01')
  })
  it('ER2: 800.000,01 € → ab 2027', () => {
    expect(eRechnungAb(start2026(800_000.01))).toBe('2027-01-01')
  })
  it('ER3: ohne Angabe vorsichtig ab 2027', () => {
    expect(eRechnungAb(start2026(null))).toBe('2027-01-01')
  })
  it('ER4: Start 2027 → ab 2028', () => {
    expect(eRechnungAb(profil({ start: '2027-01-15' }))).toBe('2028-01-01')
  })
  it('ER5: Start 2028 → ab Start', () => {
    expect(eRechnungAb(profil({ start: '2028-05-01' }))).toBe('2028-05-01')
  })
  it('wertet einen ausgeblendeten Umsatz 2026 nicht (F28 nur mit Geschäftskunden in Deutschland)', () => {
    const p = profil({ start: '2026-06-01', kunden: { unternehmenInland: false }, steuern: { umsatz2026: 900_000 } })
    expect(wirksam(p).umsatz2026).toBeNull()
    expect(eRechnungAb(p)).toBe('2027-01-01')
  })
})

describe('Aufbewahrung bis (AU1–AU4)', () => {
  it('AU1: Buchungsbeleg 2026 → 31.12.2034', () => expect(aufbewahrenBis('belege', 2026)).toBe('2034-12-31'))
  it('AU2: Jahresabschluss 2026, aufgestellt 2027 → 31.12.2037', () => expect(aufbewahrenBis('buecher', 2027)).toBe('2037-12-31'))
  it('AU3: empfangener Geschäftsbrief 2026 → 31.12.2032', () => expect(aufbewahrenBis('briefe', 2026)).toBe('2032-12-31'))
  it('AU4: Rechnung 2026 → 31.12.2034', () => expect(aufbewahrenBis('belege', 2026)).toBe('2034-12-31'))
})

describe('Kleinunternehmerprüfung (KU1–KU5)', () => {
  it('KU1: Gründungsjahr, laufend 20.000 € → möglich', () => {
    expect(kleinunternehmerStatus({ gruendungsjahr: true, vorjahr: null, laufend: 20_000 })).toBe('moeglich')
  })
  it('KU2: Gründungsjahr, laufend 30.000 € → prüfen (O3)', () => {
    expect(kleinunternehmerStatus({ gruendungsjahr: true, vorjahr: null, laufend: 30_000 })).toBe('pruefen')
    expect(kleinunternehmerStatus({ gruendungsjahr: true, vorjahr: null, laufend: 25_000 })).toBe('moeglich')
  })
  it('KU3: Folgejahr, Vorjahr 25.000 €, laufend 90.000 € → möglich', () => {
    expect(kleinunternehmerStatus({ gruendungsjahr: false, vorjahr: 25_000, laufend: 90_000 })).toBe('moeglich')
  })
  it('KU4: Folgejahr, Vorjahr 25.000,01 € → nicht möglich', () => {
    expect(kleinunternehmerStatus({ gruendungsjahr: false, vorjahr: 25_000.01, laufend: 10_000 })).toBe('nichtMoeglich')
  })
  it('KU5: laufend 100.000,01 € → nicht möglich', () => {
    expect(kleinunternehmerStatus({ gruendungsjahr: false, vorjahr: 20_000, laufend: 100_000.01 })).toBe('nichtMoeglich')
    expect(kleinunternehmerStatus({ gruendungsjahr: true, vorjahr: null, laufend: 100_000.01 })).toBe('nichtMoeglich')
  })
})

describe('Geringfügigkeitsgrenze (GG1–GG3)', () => {
  it('GG1: 12,00 € → 520 €', () => expect(geringfuegigkeitsgrenze(1_200)).toBe(520))
  it('GG2: 12,82 € → 556 € (555,53 aufgerundet)', () => expect(geringfuegigkeitsgrenze(1_282)).toBe(556))
  it('GG3: 13,90 € → 603 € (602,33 aufgerundet)', () => expect(geringfuegigkeitsgrenze(1_390)).toBe(603))
  it('rundet genaue Werte nicht auf und lehnt Bruchteile von Cent ab', () => {
    expect(geringfuegigkeitsgrenze(300)).toBe(130)
    expect(() => geringfuegigkeitsgrenze(12.5)).toThrow()
  })
})

describe('Wirksame Antworten (5.2)', () => {
  it('lässt ausgeblendete Antworten nicht wirken und füllt leere Daten mit F02', () => {
    const p = profil({
      start: '2027-03-01',
      rechtsform: 'gmbh',
      kasse: 'keine',
      kasseAnschaffung: '2027-01-01',
      personal: { vorhanden: false, beginn: '2027-05-01' },
      steuern: { vorauszahlungen: true, dauerfristverlaengerung: true, kleinunternehmer: true, umsatzErstesJahr: 10_000 },
    })
    expect(wirksam(p)).toMatchObject({ beschaeftigungsbeginn: null, kassenanschaffung: null, vorauszahlungen: false, dauerfristverlaengerung: false })
    const q = profil({ start: '2027-03-01', kasse: 'elektronisch', personal: { vorhanden: true, beginn: null, svPflichtig: 1 } })
    expect(wirksam(q)).toMatchObject({ beschaeftigungsbeginn: '2027-03-01', kassenanschaffung: '2027-03-01' })
  })
})
