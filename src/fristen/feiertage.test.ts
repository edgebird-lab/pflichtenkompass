/**
 * Feiertage, Werktage und Arbeitstage (Spezifikation 6.8.1, Tests DA1–DA10 und BA1–BA7 aus 9.6).
 * Erwartete Daten von Hand nachgezählt: Ostersonntag 2027 = 28.03., 2028 = 16.04.;
 * 01.01.2027 ist ein Freitag.
 */
import { describe, expect, it } from 'vitest'
import type { Bundesland } from '../modell/typen'
import { plusMonate, plusTage, wochentag } from './datum'
import { arbeitstagVomMonatsende, arbeitstageVor, feiertage, fristNachEreignis, istArbeitstag, istWerktag, naechsterWerktag } from './feiertage'

/** 6.8.6: Fälligkeit, Nachweistag und Termin der SV-Beiträge eines Monats, nur aus den Grundfunktionen. */
function sv(jahr: number, monat: number, land: Bundesland) {
  const faellig = arbeitstagVomMonatsende(jahr, monat, 3, land)
  const nachweis = arbeitstageVor(faellig, 2, land)
  return { faellig, nachweis, termin: arbeitstageVor(nachweis, 1, land) }
}

describe('Feiertage je Land (6.8.1)', () => {
  it('liefert die bundesweiten Feiertage aus feiertagejs', () => {
    const nw = feiertage(2027, 'NW', 'sicher')
    expect([...nw.keys()]).toEqual([
      '2027-01-01',
      '2027-03-26', // Karfreitag
      '2027-03-29', // Ostermontag
      '2027-05-01',
      '2027-05-06', // Christi Himmelfahrt
      '2027-05-17', // Pfingstmontag
      '2027-05-27', // Fronleichnam (in NW landesweit)
      '2027-10-03',
      '2027-11-01', // Allerheiligen
      '2027-12-25',
      '2027-12-26',
    ])
    expect(nw.get('2027-05-01')).toBe('Tag der Arbeit')
  })

  it('zählt Mariä Himmelfahrt in Bayern nur als „möglich“', () => {
    expect(feiertage(2028, 'BY', 'sicher').has('2028-08-15')).toBe(false)
    expect(feiertage(2028, 'BY', 'moeglich').has('2028-08-15')).toBe(true)
    expect(feiertage(2028, 'SL', 'sicher').has('2028-08-15')).toBe(true)
  })

  it('ergänzt im Modus „möglich“ 24.12., 31.12. und die regionalen Tage', () => {
    for (const land of ['NW', 'BE', 'SN'] as const) {
      expect(feiertage(2027, land, 'sicher').has('2027-12-24')).toBe(false)
      expect(feiertage(2027, land, 'moeglich').has('2027-12-24')).toBe(true)
      expect(feiertage(2027, land, 'moeglich').has('2027-12-31')).toBe(true)
    }
    // Fronleichnam in SN und TH nur regional, Augsburger Friedensfest nur in Augsburg
    expect(feiertage(2027, 'SN', 'sicher').has('2027-05-27')).toBe(false)
    expect(feiertage(2027, 'SN', 'moeglich').get('2027-05-27')).toBe('Fronleichnam (regional)')
    expect(feiertage(2027, 'TH', 'moeglich').has('2027-05-27')).toBe(true)
    expect(feiertage(2028, 'SN', 'moeglich').has('2028-06-15')).toBe(true) // Ostern 2028 = 16.04.
    expect(feiertage(2027, 'BE', 'moeglich').has('2027-05-27')).toBe(false)
    expect(feiertage(2027, 'BY', 'sicher').has('2027-08-08')).toBe(false)
    expect(feiertage(2027, 'BY', 'moeglich').get('2027-08-08')).toBe('Augsburger Friedensfest (regional)')
  })

  it('kennt Landesfeiertage wie Buß- und Bettag und Reformationstag', () => {
    expect(feiertage(2026, 'SN', 'sicher').has('2026-11-18')).toBe(true)
    expect(feiertage(2026, 'NW', 'sicher').has('2026-11-18')).toBe(false)
    expect(feiertage(2027, 'HH', 'sicher').has('2027-10-31')).toBe(true)
    expect(feiertage(2027, 'BE', 'sicher').has('2027-03-08')).toBe(true) // Internationaler Frauentag
  })
})

describe('Werktage und Arbeitstage', () => {
  it('unterscheidet Wochenende, Feiertag „sicher“ und „möglich“', () => {
    expect(istWerktag('2027-02-15', 'NW')).toBe(true)
    expect(istWerktag('2027-01-02', 'NW')).toBe(false) // Samstag
    expect(istWerktag('2027-01-03', 'NW')).toBe(false) // Sonntag
    expect(istWerktag('2027-05-27', 'NW')).toBe(false) // Fronleichnam
    expect(istWerktag('2027-05-27', 'SN')).toBe(true)
    expect(istArbeitstag('2027-05-27', 'SN')).toBe(false)
    expect(istWerktag('2027-12-24', 'NW')).toBe(true)
    expect(istArbeitstag('2027-12-24', 'NW')).toBe(false)
  })

  it('verschiebt nur, wenn nötig, auf den nächsten Werktag', () => {
    expect(naechsterWerktag('2027-02-15', 'NW')).toBe('2027-02-15')
    expect(naechsterWerktag('2027-12-24', 'NW')).toBe('2027-12-24') // Heiligabend ist kein gesetzlicher Feiertag
    expect(naechsterWerktag('2027-12-25', 'NW')).toBe('2027-12-27') // Sa, So (2. Weihnachtstag) → Mo
    expect(naechsterWerktag('2027-03-26', 'HH')).toBe('2027-03-30') // Karfreitag bis Ostermontag
  })

  it('rechnet über die Zeitumstellung ohne Versatz (R9)', () => {
    expect(plusTage('2027-03-27', 1)).toBe('2027-03-28')
    expect(plusTage('2027-03-28', 1)).toBe('2027-03-29')
    expect(plusTage('2027-10-30', 2)).toBe('2027-11-01')
    expect(wochentag('2027-03-28')).toBe(0)
    expect(wochentag('2027-10-31')).toBe(0)
    expect(naechsterWerktag('2027-10-30', 'NW')).toBe('2027-11-02') // Sa, So, Allerheiligen
  })

  it('zählt Arbeitstage zurück und lehnt ungültige Anzahlen ab', () => {
    expect(arbeitstageVor('2027-01-04', 1, 'NW')).toBe('2026-12-30') // 31.12. gilt als frei
    expect(arbeitstagVomMonatsende(2027, 1, 1, 'NW')).toBe('2027-01-29')
    expect(() => arbeitstageVor('2027-01-04', 0, 'NW')).toThrow()
  })
})

describe('Fristen nach § 108 Abs. 3 AO (DA1–DA10)', () => {
  const plusEinMonat = (d: string, land: Bundesland) => fristNachEreignis(d, 1, 0, true, land)

  it('DA1: 2027-01-15 + 1 Monat (NW) = Mo, 15.02.2027', () => {
    expect(plusEinMonat('2027-01-15', 'NW')).toEqual({ roh: '2027-02-15', ende: '2027-02-15' })
    expect(wochentag('2027-02-15')).toBe(1)
  })

  it('DA2: roh So, 03.01.2027 → Mo, 04.01.2027', () => {
    expect(plusEinMonat('2026-12-03', 'NW')).toEqual({ roh: '2027-01-03', ende: '2027-01-04' })
  })

  it('DA3: roh Sa, 03.10.2026 (Feiertag) → Mo, 05.10.2026 (BY)', () => {
    expect(plusEinMonat('2026-09-03', 'BY')).toEqual({ roh: '2026-10-03', ende: '2026-10-05' })
  })

  it('DA4: 31.01.2027 + 1 Monat = So, 28.02.2027 → Mo, 01.03.2027', () => {
    expect(plusEinMonat('2027-01-31', 'NW')).toEqual({ roh: '2027-02-28', ende: '2027-03-01' })
  })

  it('DA5: 31.01.2028 + 1 Monat = Di, 29.02.2028', () => {
    expect(plusEinMonat('2028-01-31', 'NW')).toEqual({ roh: '2028-02-29', ende: '2028-02-29' })
  })

  it('DA6: Buß- und Bettag verschiebt nur in Sachsen', () => {
    expect(plusEinMonat('2026-10-18', 'SN').ende).toBe('2026-11-19')
    expect(plusEinMonat('2026-10-18', 'NW').ende).toBe('2026-11-18')
  })

  it('DA7: Mariä Himmelfahrt verschiebt im Saarland, in Bayern nicht (vorsichtig)', () => {
    expect(plusEinMonat('2028-07-15', 'SL').ende).toBe('2028-08-16')
    expect(plusEinMonat('2028-07-15', 'BY').ende).toBe('2028-08-15')
  })

  it('DA8: roh Sa, 01.05.2027 (Feiertag) → Mo, 03.05.2027 (BY)', () => {
    expect(plusEinMonat('2027-04-01', 'BY')).toEqual({ roh: '2027-05-01', ende: '2027-05-03' })
  })

  it('DA9: 7 Tage ohne Verschiebung = Fr, 22.01.2027', () => {
    expect(fristNachEreignis('2027-01-15', 0, 7, false, 'NW')).toEqual({ roh: '2027-01-22', ende: '2027-01-22' })
    // ohne Verschiebung bleibt auch ein Samstag stehen
    expect(fristNachEreignis('2027-01-16', 0, 7, false, 'NW').ende).toBe('2027-01-23')
  })

  it('DA10: minus 3 Monate', () => {
    expect(plusMonate('2027-05-31', -3)).toBe('2027-02-28')
    expect(plusMonate('2027-01-15', -3)).toBe('2026-10-15')
  })
})

describe('SV-Fälligkeit, Nachweis und Termin (BA1–BA7)', () => {
  it('BA1: Dezember 2026 (NW)', () => {
    expect(sv(2026, 12, 'NW')).toEqual({ faellig: '2026-12-28', nachweis: '2026-12-22', termin: '2026-12-21' })
  })
  it('BA2: Januar 2027 (NW)', () => {
    expect(sv(2027, 1, 'NW')).toEqual({ faellig: '2027-01-27', nachweis: '2027-01-25', termin: '2027-01-22' })
  })
  it('BA3: März 2027 mit Karfreitag und Ostermontag (SN)', () => {
    expect(sv(2027, 3, 'SN')).toEqual({ faellig: '2027-03-25', nachweis: '2027-03-23', termin: '2027-03-22' })
  })
  it('BA4: April 2027 (BY)', () => {
    expect(sv(2027, 4, 'BY')).toEqual({ faellig: '2027-04-28', nachweis: '2027-04-26', termin: '2027-04-23' })
  })
  it('BA5: Mai 2027 mit Fronleichnam (NW)', () => {
    expect(sv(2027, 5, 'NW')).toEqual({ faellig: '2027-05-26', nachweis: '2027-05-24', termin: '2027-05-21' })
  })
  it('BA6: Dezember 2027 (SN)', () => {
    expect(sv(2027, 12, 'SN')).toEqual({ faellig: '2027-12-28', nachweis: '2027-12-23', termin: '2027-12-22' })
  })
  it('BA7: Mai 2027 in Sachsen wie BA5, weil Fronleichnam regional zählt', () => {
    expect(sv(2027, 5, 'SN')).toEqual(sv(2027, 5, 'NW'))
    // ohne die Ergänzung aus 6.8.1 wäre der drittletzte Arbeitstag der 27.05.
    const ohneErgaenzung = ['2027-05-31', '2027-05-28', '2027-05-27'].every((d) => istWerktag(d, 'SN'))
    expect(ohneErgaenzung).toBe(true)
  })
})
