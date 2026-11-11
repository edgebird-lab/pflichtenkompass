import { describe, expect, it } from 'vitest'
import { ausOrtszeit, datum, datumMitTag, datumText, istDatum, monatsErster, monatsLetzter, plusMonate, plusTage, tageImMonat, tagesnummer, wochentag } from './datum'

describe('Datum', () => {
  it('erkennt gültige ISO-Daten', () => {
    expect(istDatum('2027-01-15')).toBe(true)
    expect(istDatum('2028-02-29')).toBe(true)
    expect(istDatum('2027-02-29')).toBe(false)
    expect(istDatum('2027-1-15')).toBe(false)
    expect(istDatum('2027-13-01')).toBe(false)
    expect(istDatum('2027-00-10')).toBe(false)
    expect(istDatum('15.01.2027')).toBe(false)
    expect(istDatum(20270115)).toBe(false)
    expect(() => datum(2027, 2, 29)).toThrow()
  })

  it('kennt die Monatslängen auch im Schaltjahr', () => {
    expect(tageImMonat(2027, 2)).toBe(28)
    expect(tageImMonat(2028, 2)).toBe(29)
    expect(tageImMonat(2100, 2)).toBe(28)
    expect(tageImMonat(2000, 2)).toBe(29)
    expect(tageImMonat(2027, 12)).toBe(31)
  })

  it('rechnet Wochentage (von Hand nachgezählt)', () => {
    expect(wochentag('1970-01-01')).toBe(4) // Donnerstag
    expect(wochentag('2027-02-15')).toBe(1) // Montag (DA1)
    expect(wochentag('2027-01-03')).toBe(0) // Sonntag (DA2)
    expect(wochentag('2026-10-03')).toBe(6) // Samstag (DA3)
    expect(wochentag('2028-02-29')).toBe(2) // Dienstag (DA5)
    expect(wochentag('1969-12-31')).toBe(3) // Mittwoch, vor 1970
  })

  it('zählt Tage über Monats- und Jahresgrenzen', () => {
    expect(plusTage('2027-01-15', 7)).toBe('2027-01-22') // DA9
    expect(plusTage('2026-12-28', 7)).toBe('2027-01-04')
    expect(plusTage('2028-02-28', 1)).toBe('2028-02-29')
    expect(plusTage('2027-03-01', -1)).toBe('2027-02-28')
    expect(tagesnummer('2027-01-01') - tagesnummer('2026-01-01')).toBe(365)
  })

  it('addiert Monate: gleicher Tag, sonst Monatsletzter (6.8.2)', () => {
    expect(plusMonate('2027-01-15', 1)).toBe('2027-02-15') // DA1
    expect(plusMonate('2026-12-03', 1)).toBe('2027-01-03') // DA2 roh
    expect(plusMonate('2027-01-31', 1)).toBe('2027-02-28') // DA4 roh
    expect(plusMonate('2028-01-31', 1)).toBe('2028-02-29') // DA5
    expect(plusMonate('2027-05-31', -3)).toBe('2027-02-28') // DA10
    expect(plusMonate('2027-01-15', -3)).toBe('2026-10-15') // DA10
    expect(plusMonate('2027-01-01', 24)).toBe('2029-01-01')
    expect(plusMonate('2027-03-31', -1)).toBe('2027-02-28')
  })

  it('findet Monatsanfang und Monatsende', () => {
    expect(monatsErster('2027-01-15')).toBe('2027-01-01')
    expect(monatsLetzter('2028-02-10')).toBe('2028-02-29')
  })

  it('schreibt Daten wie in 5.7 verlangt', () => {
    expect(datumText('2026-11-11')).toBe('11.11.2026')
    expect(datumMitTag('2027-02-15')).toBe('Mo, 15.02.2027')
  })

  it('liest das Datum eines Date in Ortszeit', () => {
    expect(ausOrtszeit(new Date(2026, 10, 11, 23, 59))).toBe('2026-11-11')
    expect(ausOrtszeit(new Date(2027, 0, 1, 0, 1))).toBe('2027-01-01')
  })
})
