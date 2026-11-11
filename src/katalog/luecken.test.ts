import { describe, expect, it } from 'vitest'
import { LUECKE_HINWEIS, LUECKEN, luecke } from './luecken'
import { LUECKE_IDS } from './typen'

describe('Lückenhinweise (6.7)', () => {
  it('hat 17 Einträge in der Reihenfolge der Nummern', () => {
    expect(LUECKEN.map((l) => l.id)).toEqual([...LUECKE_IDS])
    expect(LUECKEN.map((l) => l.nr)).toEqual(Array.from({ length: 17 }, (_, i) => i + 1))
  })

  it('unterscheidet „nicht geprüft“ (1–13) und „klären“ (14–17)', () => {
    for (const l of LUECKEN) expect(l.art, l.id).toBe(l.nr <= 13 ? 'nichtGeprueft' : 'pruefen')
  })

  it('übernimmt die Titel aus 6.7', () => {
    expect(LUECKEN.map((l) => l.titel)).toEqual([
      'Gewerbesteuer',
      'Körperschaftsteuer',
      'Gaststättenrecht des Landes',
      'Lebensmittelrecht',
      'Verbraucherrecht im Onlinehandel',
      'Datenschutz',
      'Arbeitsrecht und Arbeitsschutz',
      'Erlaubnisse und Kammern',
      'Künstlersozialabgabe',
      'Rundfunkbeitrag für Betriebsstätten',
      'Elektrogeräte und Batterien',
      'EU-Geschäft als Kleinunternehmer',
      'Freiberufliche UG oder GmbH',
      'Kaufmannseigenschaft klären',
      'Handwerksart klären',
      'Kleinunternehmergrenze im Gründungsjahr',
      'Vergütung der Geschäftsführung klären',
    ])
  })

  it('hat zu jeder Lücke einen Satz ohne interne Verweise', () => {
    for (const l of LUECKEN) {
      expect(l.text, l.id).toMatch(/^[A-ZÄÖÜ].*\.$/)
      expect(l.text, l.id).not.toMatch(/\(O\d+/)
    }
    expect(luecke('geschaeftsfuehrung').text).toContain('Statusfeststellung')
    expect(LUECKE_HINWEIS).toBe('In Version 0.1 nicht geprüft')
  })
})
