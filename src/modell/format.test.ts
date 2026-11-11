import { describe, expect, it } from 'vitest'
import { betragFeldText, dateiname, leseAnzahl, leseBetrag } from './format'

describe('Dateinamen', () => {
  it('ersetzt Umlaute und Sonderzeichen', () => {
    expect(dateiname('Café Müller & Söhne', '.pflichtenkompass')).toBe('cafe-mueller-soehne.pflichtenkompass')
    expect(dateiname('Straße 1', '.ics')).toBe('strasse-1.ics')
  })

  it('nimmt einen Ersatznamen, wenn nichts übrig bleibt', () => {
    expect(dateiname('', '.ics')).toBe('vorhaben.ics')
    expect(dateiname('&&&', '.ics', 'pflichten')).toBe('pflichten.ics')
  })

  it('kürzt auf 60 Zeichen ohne Bindestrich am Ende', () => {
    const name = dateiname(`${'a'.repeat(59)} b`, '')
    expect(name).toBe('a'.repeat(59))
    expect(dateiname('x'.repeat(80), '').length).toBe(60)
  })
})

describe('Beträge lesen und anzeigen', () => {
  const wert = (t: string, negativ = false) => {
    const g = leseBetrag(t, negativ)
    return g.ok ? g.wert : g.meldung
  }

  it('versteht deutsche Schreibweisen', () => {
    expect(wert('60000')).toBe(60_000)
    expect(wert('60.000')).toBe(60_000)
    expect(wert('1.000.000')).toBe(1_000_000)
    expect(wert('100.000,01')).toBe(100_000.01)
    expect(wert('100000,01')).toBe(100_000.01)
    expect(wert('1.250 €')).toBe(1_250)
    expect(wert(' 450,5 ')).toBe(450.5)
    expect(wert('12.5')).toBe(12.5)
    expect(wert('0')).toBe(0)
    expect(wert('')).toBeNull()
  })

  it('lehnt Unklares, zu viele Nachkommastellen und negative Beträge ab', () => {
    expect(wert('abc')).toContain('Gültigen Betrag')
    expect(wert('1,2,3')).toContain('1.250,50')
    expect(wert('12.34.5')).toContain('Gültigen Betrag')
    expect(wert('1,234')).toBe('Höchstens zwei Nachkommastellen angeben.')
    expect(wert('-5')).toBe('Betrag ab 0 angeben.')
    expect(wert('-5.000', true)).toBe(-5_000)
    expect(wert('−0', true)).toBe(0)
  })

  it('zeigt Beträge im Feld mit Tausenderpunkt und bei Cent mit zwei Stellen', () => {
    expect(betragFeldText(60_000)).toBe('60.000')
    expect(betragFeldText(100_000.01)).toBe('100.000,01')
    expect(betragFeldText(450.5)).toBe('450,50')
    expect(betragFeldText(-15_000)).toBe('-15.000')
    expect(betragFeldText(null)).toBe('')
  })

  it('liest Anzahlen als ganze Zahl ab 0', () => {
    expect(leseAnzahl('3')).toEqual({ ok: true, wert: 3 })
    expect(leseAnzahl('')).toEqual({ ok: true, wert: null })
    expect(leseAnzahl('2,5').ok).toBe(false)
    expect(leseAnzahl('-1').ok).toBe(false)
  })
})
