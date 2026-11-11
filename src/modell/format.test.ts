import { describe, expect, it } from 'vitest'
import { dateiname } from './format'

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
