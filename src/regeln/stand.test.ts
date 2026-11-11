/**
 * KA6 und V12 (Spezifikation 9.10, 6.10): Prüfwert der Regeldatei. Läuft nur in
 * Tests und CI, nie beim Start der App.
 */
import { describe, expect, it } from 'vitest'
import { mitLf, sha256Hex } from '../hash'
import { KATALOG_STAND, KATALOG_VERSION } from '../katalog/typen'
import { pruefeStand } from './pruefung'
import { ladeMitgeliefertesRegelwerk, REGELN_STAND, REGELN_XML } from './regelwerk'

const KATALOG = { version: KATALOG_VERSION, stand: KATALOG_STAND }

describe('regeln/stand.json (KA6, V12)', () => {
  it('Prüfwert passt zur Datei, Version und Stand zum Katalog', async () => {
    expect(await pruefeStand(REGELN_XML, REGELN_STAND, KATALOG)).toEqual([])
    expect(REGELN_STAND.version).toBe('2026.11.0')
    expect(REGELN_STAND.stand).toBe('2026-11-11')
    expect(REGELN_STAND.sha256['pflichten.dmn']).toMatch(/^[0-9a-f]{64}$/)
  })

  it('wird rot, wenn sich die Regeln ohne Versionswechsel ändern', async () => {
    const geaendert = REGELN_XML.replace('Die UG bildet eine gesetzliche Rücklage.', 'Die UG bildet eine Rücklage.')
    expect(geaendert).not.toBe(REGELN_XML)
    const fehler = await pruefeStand(geaendert, REGELN_STAND, KATALOG)
    expect(fehler.map((f) => f.regel)).toEqual(['V12'])
    expect(fehler[0].meldung).toContain('Regeln geändert: Version und Stand anheben')
  })

  it('bleibt grün mit einer CRLF-Kopie der Datei (Windows-Checkout)', async () => {
    const crlf = mitLf(REGELN_XML).replace(/\n/g, '\r\n')
    expect(crlf).toContain('\r\n')
    expect(await pruefeStand(crlf, REGELN_STAND, KATALOG)).toEqual([])
  })

  it('wird rot, wenn Version oder Stand nicht zum Katalog passen', async () => {
    const fehler = await pruefeStand(REGELN_XML, { ...REGELN_STAND, version: '2026.12.0' }, KATALOG)
    expect(fehler.map((f) => [f.regel, f.ort])).toEqual([['V12', 'regeln/stand.json']])
  })

  it('rechnet SHA-256 wie üblich (Prüfvektor „abc“ aus FIPS 180-2)', async () => {
    expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
    expect(mitLf('a\r\nb\rc\n')).toBe('a\nb\nc\n')
  })

  it('lädt das mitgelieferte Regelwerk mit dem Prüfwert aus stand.json', async () => {
    const r = await ladeMitgeliefertesRegelwerk()
    expect(r.sha256).toBe(REGELN_STAND.sha256['pflichten.dmn'])
    expect(r.tabellen).toHaveLength(7)
  })
})
