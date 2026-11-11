import { describe, expect, it } from 'vitest'
import { beispiele, beispiel } from './beispiele'
import { standardProfil } from './profil'
import { offenePflichtfelder, pruefeProfil, WARNUNG_KLEINUNTERNEHMER } from './pruefung'
import type { Profil } from './typen'

const mitA = (aendern: (p: Profil) => void) => {
  const p = beispiel('A').profil
  aendern(p)
  return pruefeProfil(p)
}
const fehlerAn = (r: ReturnType<typeof pruefeProfil>) => r.fehler.map((f) => f.frage)

describe('Eingabeprüfungen (6.9)', () => {
  it('meldet im Standardprofil die offenen Pflichtfelder Bundesland und Bereich', () => {
    const p = standardProfil('2026-11-11')
    expect(fehlerAn(pruefeProfil(p))).toEqual(['F03', 'F09'])
    expect(offenePflichtfelder(p)).toEqual(['F03', 'F09'])
  })

  it('hat bei den Beispielen A–F weder Fehler noch Warnungen', () => {
    for (const b of beispiele()) expect(pruefeProfil(b.profil), b.id).toEqual({ fehler: [], warnungen: [] })
  })

  it('verlangt mindestens eine Kundengruppe', () => {
    const r = mitA((p) => (p.kunden = { privatInland: false, unternehmenInland: false, privatEu: false, unternehmenEu: false }))
    expect(r.fehler).toEqual([{ frage: 'F19', text: 'Mindestens eine Kundengruppe wählen.' }])
  })

  it('begrenzt den Beginn auf 01.01.2026 bis 31.12.2030', () => {
    expect(fehlerAn(mitA((p) => (p.start = '2025-12-31')))).toEqual(['F02'])
    expect(fehlerAn(mitA((p) => (p.start = '2031-01-01')))).toEqual(['F02'])
    expect(fehlerAn(mitA((p) => (p.start = '2026-01-01')))).toEqual([])
    expect(fehlerAn(mitA((p) => (p.start = '2030-12-31')))).toEqual([])
    expect(mitA((p) => (p.start = '2027-02-30')).fehler).toEqual([{ frage: 'F02', text: 'Gültiges Datum angeben.' }])
  })

  it('verlangt bei Beschäftigten mindestens eine Person', () => {
    const r = mitA((p) => (p.personal = { ...p.personal, vorhanden: true, beginn: '2027-01-15', svPflichtig: 0, minijobber: 0 }))
    expect(r.fehler).toEqual([{ frage: 'F14', text: 'Mindestens eine Person angeben.' }])
  })

  it('warnt, wenn die Beschäftigung vor der Tätigkeit beginnt, sperrt aber nicht', () => {
    const r = mitA((p) => (p.personal = { ...p.personal, vorhanden: true, beginn: '2027-01-14', svPflichtig: 1 }))
    expect(r.fehler).toEqual([])
    expect(r.warnungen).toEqual([{ frage: 'F13', text: 'Die Beschäftigung beginnt am 14.01.2027, vor der Tätigkeit am 15.01.2027.' }])
  })

  it('warnt bei Kleinunternehmerregelung über 100.000 €, nicht bei genau 100.000 €', () => {
    const ueber = mitA((p) => Object.assign(p.steuern, { kleinunternehmer: true, umsatzErstesJahr: 100_000.01 }))
    expect(ueber.warnungen).toEqual([{ frage: 'F27', text: WARNUNG_KLEINUNTERNEHMER }])
    expect(WARNUNG_KLEINUNTERNEHMER).toContain('nicht anwendbar')
    expect(WARNUNG_KLEINUNTERNEHMER).toContain('100.000 €')
    expect(mitA((p) => Object.assign(p.steuern, { kleinunternehmer: true, umsatzErstesJahr: 100_000 })).warnungen).toEqual([])
  })

  it('prüft Beträge: ab 0, der Gewinn darf negativ sein, aber nicht unendlich', () => {
    expect(mitA((p) => (p.steuern.umsatzErstesJahr = -1)).fehler).toEqual([{ frage: 'F25', text: 'Betrag ab 0 angeben.' }])
    expect(mitA((p) => (p.steuern.gewinnErstesJahr = -5_000)).fehler).toEqual([])
    expect(mitA((p) => (p.steuern.gewinnErstesJahr = Number.NaN)).fehler).toEqual([{ frage: 'F26', text: 'Gültigen Betrag angeben.' }])
    expect(mitA((p) => (p.steuern.euFernverkaeufe = Number.POSITIVE_INFINITY)).fehler).toEqual([{ frage: 'F30', text: 'Gültigen Betrag angeben.' }])
  })

  it('prüft ausgeblendete Fragen nicht', () => {
    // A hat keine Beschäftigten: F18 ist ausgeblendet; A beginnt 2027: F28 und F29 sind ausgeblendet
    expect(mitA((p) => (p.personal.lohnsteuerJeMonat = -100)).fehler).toEqual([])
    expect(mitA((p) => (p.steuern.ustErstesJahr = -1)).fehler).toEqual([])
    const c = beispiel('C').profil
    c.personal.lohnsteuerJeMonat = -100
    expect(pruefeProfil(c).fehler).toEqual([{ frage: 'F18', text: 'Betrag ab 0 angeben.' }])
  })

  it('begrenzt den Namen auf 80 Zeichen', () => {
    expect(fehlerAn(mitA((p) => (p.name = 'x'.repeat(81))))).toEqual(['F01'])
    expect(fehlerAn(mitA((p) => (p.name = 'x'.repeat(80))))).toEqual([])
  })

  it('begrenzt Beschäftigungsbeginn und Kassenanschaffung auf 1900–2099 (E26)', () => {
    // vorher: Kasse im Dezember 9999 → Mitteilungsfrist im Jahr 10000 → Ausnahme beim Rechnen, leere Seite
    const text = 'Datum zwischen 01.01.1900 und 31.12.2099 angeben.'
    const kasse = (d: string) => mitA((p) => Object.assign(p, { kasse: 'elektronisch', kasseAnschaffung: d }))
    expect(kasse('9999-12-15').fehler).toEqual([{ frage: 'F23', text }])
    expect(kasse('2100-01-01').fehler).toEqual([{ frage: 'F23', text }])
    expect(kasse('2099-12-31').fehler).toEqual([])
    expect(kasse('1900-01-01').fehler).toEqual([])
    const beginn = (d: string) => mitA((p) => (p.personal = { ...p.personal, vorhanden: true, svPflichtig: 1, beginn: d }))
    expect(beginn('1899-12-31')).toEqual({ fehler: [{ frage: 'F13', text }], warnungen: [] })
    // im Bereich, aber vor dem Start: nur die Warnung aus 6.9
    expect(beginn('1900-01-01').fehler).toEqual([])
    expect(beginn('1900-01-01').warnungen.map((w) => w.frage)).toEqual(['F13'])
    // ausgeblendet (ohne elektronische Kasse) wird nicht geprüft
    expect(mitA((p) => (p.kasseAnschaffung = '9999-12-15')).fehler).toEqual([])
  })
})
