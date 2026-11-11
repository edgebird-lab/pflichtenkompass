import { describe, expect, it } from 'vitest'
import { beispiel, beispiele } from './beispiele'
import { standardProfil, standardStart } from './profil'

describe('Standardprofil (5.2)', () => {
  it('beginnt am 1. des Folgemonats', () => {
    expect(standardProfil('2026-11-11').start).toBe('2026-12-01')
    expect(standardStart('2026-12-31')).toBe('2027-01-01')
    expect(standardStart('2027-01-31')).toBe('2027-02-01')
  })

  it('bleibt im zulässigen Bereich 2026 bis 2030', () => {
    expect(standardStart('2025-06-15')).toBe('2026-01-01')
    expect(standardStart('2030-12-10')).toBe('2030-12-31')
  })

  it('hat die Standardwerte der Fragen', () => {
    const p = standardProfil('2026-11-11')
    expect(p.name).toBe('')
    expect(p.bundesland).toBeNull() // F03 ohne Vorauswahl
    expect(p.rechtsform).toBe('einzelunternehmen') // F04
    expect(p.gbrEingetragen).toBe(false) // F05
    expect(p.taetigkeit).toBe('gewerblich') // F06
    expect(p.kaufmaennisch).toBe('nein') // F07
    expect(p.steuerberater).toBe(false) // F08
    expect(p.branchen).toEqual([]) // F09 keine
    expect(p.handwerk).toBe('unklar') // F10
    expect(p.personal).toEqual({ vorhanden: false, beginn: null, svPflichtig: 0, minijobber: 0, minijobPauschsteuer: true, sofortmeldeBranche: false, lohnsteuerJeMonat: null })
    expect(p.kunden).toEqual({ privatInland: true, unternehmenInland: false, privatEu: false, unternehmenEu: false }) // F19
    expect([p.website, p.verpackungen, p.kasse, p.kasseAnschaffung, p.bargeld]).toEqual([false, false, 'keine', null, false])
    expect(p.steuern).toEqual({
      umsatzErstesJahr: 0,
      gewinnErstesJahr: 0,
      kleinunternehmer: false,
      umsatz2026: null,
      ustErstesJahr: null,
      euFernverkaeufe: 0,
      dauerfristverlaengerung: false,
      vorauszahlungen: false,
    })
  })
})

describe('Beispiele A–F (9.3)', () => {
  it('gibt es in der Reihenfolge A bis F mit Titel', () => {
    expect(beispiele().map((b) => `${b.id} ${b.titel}`)).toEqual(['A Kaffeeversand', 'B Übersetzungsbüro', 'C Elektro GmbH', 'D Café', 'E Shop UG', 'F Großhandel'])
  })

  it('übernimmt Beginn, Land, Rechtsform und Tätigkeit aus der Tabelle', () => {
    const zeilen = beispiele().map((b) => [b.profil.start, b.profil.bundesland, b.profil.rechtsform, b.profil.taetigkeit, b.profil.steuerberater])
    expect(zeilen).toEqual([
      ['2027-01-15', 'NW', 'einzelunternehmen', 'gewerblich', false],
      ['2026-12-01', 'HE', 'einzelunternehmen', 'freiberuflich', false],
      ['2027-04-01', 'BY', 'gmbh', 'gewerblich', true],
      ['2027-03-01', 'SN', 'gbr', 'gewerblich', false],
      ['2026-12-15', 'BE', 'ug', 'gewerblich', true],
      ['2027-02-01', 'HH', 'einzelunternehmen', 'gewerblich', true],
    ])
  })

  it('übernimmt Personal, Kasse und Beträge', () => {
    const c = beispiel('C').profil
    expect(c.personal).toEqual({ vorhanden: true, beginn: '2027-04-01', svPflichtig: 2, minijobber: 1, minijobPauschsteuer: true, sofortmeldeBranche: true, lohnsteuerJeMonat: 450 })
    const d = beispiel('D').profil
    expect([d.personal.svPflichtig, d.personal.minijobber, d.kasse, d.kasseAnschaffung, d.bargeld]).toEqual([0, 3, 'elektronisch', '2027-02-15', true])
    const e = beispiel('E').profil
    expect([e.steuern.umsatzErstesJahr, e.steuern.gewinnErstesJahr, e.steuern.ustErstesJahr]).toEqual([5_000, 0, 400])
    const f = beispiel('F').profil
    expect([f.kaufmaennisch, f.steuern.umsatzErstesJahr, f.steuern.gewinnErstesJahr, f.steuern.vorauszahlungen, f.personal.lohnsteuerJeMonat]).toEqual(['ja', 900_000, 90_000, true, 350])
    expect(beispiel('A').profil.steuern.euFernverkaeufe).toBe(4_000)
    expect(beispiel('B').profil.steuern.kleinunternehmer).toBe(true)
  })

  it('liefert jedes Mal frische Kopien', () => {
    const a = beispiel('A')
    a.profil.personal.svPflichtig = 99
    expect(beispiel('A').profil.personal.svPflichtig).toBe(0)
    expect(beispiel('B').profil.personal).not.toBe(beispiel('B').profil.personal)
  })
})
