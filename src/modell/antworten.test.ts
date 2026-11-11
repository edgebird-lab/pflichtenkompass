import { describe, expect, it } from 'vitest'
import { antwort, setzeAntwort } from './antworten'
import { beispiel } from './beispiele'
import { FRAGEN } from './fragen'
import { standardProfil } from './profil'
import type { Profil } from './typen'

const leer = () => standardProfil('2026-11-11')

function setze(p: Profil, ...antworten: [Parameters<typeof setzeAntwort>[1], Parameters<typeof setzeAntwort>[2]][]): Profil {
  return antworten.reduce((q, [id, w]) => setzeAntwort(q, id, w), p)
}

describe('Antworten lesen und setzen', () => {
  it('liest jede Antwort von C und schreibt sie unverändert zurück', () => {
    const c = beispiel('C').profil
    for (const f of FRAGEN) expect(setzeAntwort(c, f.id, antwort(c, f.id))).toEqual(c)
  })

  it('verändert das alte Profil nicht', () => {
    const p = leer()
    const kopie = structuredClone(p)
    setzeAntwort(p, 'F14', 3)
    setzeAntwort(p, 'F19', ['unternehmenEu'])
    expect(p).toEqual(kopie)
  })

  it('schreibt Listen in der Reihenfolge der Optionen ohne Doppelte', () => {
    const p = setze(leer(), ['F09', ['gastronomie', 'handel', 'handel']], ['F19', ['unternehmenEu', 'privatInland']])
    expect(p.branchen).toEqual(['handel', 'gastronomie'])
    expect(p.kunden).toEqual({ privatInland: true, unternehmenInland: false, privatEu: false, unternehmenEu: true })
    expect(antwort(p, 'F19')).toEqual(['privatInland', 'unternehmenEu'])
  })

  it('macht leere Daten und Beträge zu null', () => {
    const p = setze(leer(), ['F13', ''], ['F23', null], ['F18', null], ['F03', ''])
    expect([p.personal.beginn, p.kasseAnschaffung, p.personal.lohnsteuerJeMonat, p.bundesland]).toEqual([null, null, null, null])
  })

  it('lehnt falsche Typen und unbekannte Werte ab', () => {
    expect(() => setzeAntwort(leer(), 'F04', 'ag')).toThrow('F04')
    expect(() => setzeAntwort(leer(), 'F12', 'ja')).toThrow('F12')
    expect(() => setzeAntwort(leer(), 'F25', Number.NaN)).toThrow('F25')
    expect(() => setzeAntwort(leer(), 'F10', 'keins')).toThrow('F10')
  })
})

describe('Abhängige Standardwerte (5.2)', () => {
  it('F11 und F17 folgen der Gastronomie, solange sie umschlägt', () => {
    const mit = setzeAntwort(leer(), 'F09', ['gastronomie'])
    expect([mit.lebensmittel, mit.personal.sofortmeldeBranche]).toEqual([true, true])
    // eigene Antwort bleibt, wenn ein anderer Bereich dazukommt
    const eigen = setze(mit, ['F11', false], ['F09', ['gastronomie', 'handel']])
    expect(eigen.lebensmittel).toBe(false)
    const ohne = setzeAntwort(eigen, 'F09', ['handel'])
    expect([ohne.lebensmittel, ohne.personal.sofortmeldeBranche]).toEqual([false, false])
  })

  it('F21 folgt „Onlinehandel mit Privatkunden in Deutschland“', () => {
    const p = setzeAntwort(leer(), 'F09', ['onlinehandel'])
    expect(p.verpackungen).toBe(true)
    expect(setzeAntwort(p, 'F19', ['unternehmenInland']).verpackungen).toBe(false)
    const eigen = setze(p, ['F21', false], ['F19', ['privatInland', 'privatEu']])
    expect(eigen.verpackungen).toBe(false)
  })

  it('F24 folgt „Kasse vorhanden“', () => {
    const p = setzeAntwort(leer(), 'F22', 'elektronisch')
    expect(p.bargeld).toBe(true)
    const eigen = setze(p, ['F24', false], ['F22', 'offeneLadenkasse'])
    expect(eigen.bargeld).toBe(false)
    expect(setzeAntwort(eigen, 'F22', 'keine').bargeld).toBe(false)
  })

  it('ergibt Beispiel A, wenn nur die Antworten aus 9.3 gegeben werden', () => {
    const a = setze(
      leer(),
      ['F01', 'Kaffeeversand'],
      ['F02', '2027-01-15'],
      ['F03', 'NW'],
      ['F09', ['onlinehandel']],
      ['F19', ['privatInland', 'privatEu']],
      ['F20', true],
      ['F25', 60_000],
      ['F26', 15_000],
      ['F30', 4_000],
    )
    expect(a).toEqual(beispiel('A').profil)
  })

  it('ergibt Beispiel D mit Gastronomie und elektronischer Kasse', () => {
    const d = setze(
      leer(),
      ['F01', 'Café'],
      ['F02', '2027-03-01'],
      ['F03', 'SN'],
      ['F04', 'gbr'],
      ['F09', ['gastronomie']],
      ['F12', true],
      ['F13', '2027-03-01'],
      ['F15', 3],
      ['F20', true],
      ['F22', 'elektronisch'],
      ['F23', '2027-02-15'],
      ['F25', 120_000],
      ['F26', 30_000],
    )
    expect(d).toEqual(beispiel('D').profil)
  })
})
