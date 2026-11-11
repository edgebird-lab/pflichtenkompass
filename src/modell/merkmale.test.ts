import { describe, expect, it } from 'vitest'
import { beispiel } from './beispiele'
import { betragText } from './format'
import { MERKMALE, merkmale, merkmalInfo, wertText } from './merkmale'
import { standardProfil } from './profil'
import type { Profil } from './typen'

const basis = () => standardProfil('2026-11-11')
/** Profil mit Änderungen; `personal` und `steuern` werden zusammengeführt. */
function mit(teil: Partial<Omit<Profil, 'personal' | 'steuern'>> & { personal?: Partial<Profil['personal']>; steuern?: Partial<Profil['steuern']> }): Profil {
  const p = basis()
  return { ...p, ...teil, personal: { ...p.personal, ...teil.personal }, steuern: { ...p.steuern, ...teil.steuern } }
}

describe('Merkmale (9.5)', () => {
  it('MM1: GmbH ist auch ohne kaufmännische Einrichtung Kaufmann', () => {
    expect(merkmale(mit({ rechtsform: 'gmbh', kaufmaennisch: 'nein' })).kaufmann).toBe(true)
    expect(merkmale(mit({ rechtsform: 'ug', kaufmaennisch: 'nein' })).kaufmann).toBe(true)
  })

  it('MM2: ausgeblendetes F07 wirkt nicht (Einzelunternehmen, freiberuflich)', () => {
    const m = merkmale(mit({ rechtsform: 'einzelunternehmen', taetigkeit: 'freiberuflich', kaufmaennisch: 'ja' }))
    expect(m.kaufmann).toBe(false)
    expect(m.kaufmaennisch).toBe('nein')
  })

  it('MM3: gewerbliche GbR mit kaufmännischer Einrichtung ist eingetragene Personengesellschaft', () => {
    const m = merkmale(mit({ rechtsform: 'gbr', taetigkeit: 'gewerblich', kaufmaennisch: 'ja' }))
    expect(m.kaufmann).toBe(true)
    expect(m.personengesellschaftEingetragen).toBe(true)
  })

  it('MM4: ohne Beschäftigte (F12 = nein) zählen eingetragene Zahlen nicht', () => {
    expect(merkmale(mit({ personal: { vorhanden: false, svPflichtig: 3 } })).beschaeftigte).toBe(0)
  })

  it('MM5: Lohnsteuerabzug nur ohne Pauschsteuer der Minijobs', () => {
    const p = { vorhanden: true, svPflichtig: 0, minijobber: 2 }
    expect(merkmale(mit({ personal: { ...p, minijobPauschsteuer: true } })).lohnsteuerabzug).toBe(false)
    expect(merkmale(mit({ personal: { ...p, minijobPauschsteuer: false } })).lohnsteuerabzug).toBe(true)
  })

  it('MM6: über 100.000 € Umsatz keine Kleinunternehmerregelung', () => {
    expect(merkmale(mit({ steuern: { kleinunternehmer: true, umsatzErstesJahr: 100_000.01 } })).kleinunternehmer).toBe(false)
    expect(merkmale(mit({ steuern: { kleinunternehmer: true, umsatzErstesJahr: 100_000 } })).kleinunternehmer).toBe(true)
    expect(merkmale(mit({ steuern: { kleinunternehmer: false, umsatzErstesJahr: 10_000 } })).kleinunternehmer).toBe(false)
  })

  it('MM7: Befreiung nach § 241a HGB bis einschließlich 800.000 € und 80.000 €', () => {
    const kaufmann = { rechtsform: 'einzelunternehmen' as const, taetigkeit: 'gewerblich' as const, kaufmaennisch: 'ja' as const }
    expect(merkmale(mit({ ...kaufmann, steuern: { umsatzErstesJahr: 800_000, gewinnErstesJahr: 80_000 } })).hgbBefreit).toBe(true)
    expect(merkmale(mit({ ...kaufmann, steuern: { umsatzErstesJahr: 800_000.01, gewinnErstesJahr: 80_000 } })).hgbBefreit).toBe(false)
    expect(merkmale(mit({ ...kaufmann, steuern: { umsatzErstesJahr: 800_000, gewinnErstesJahr: 80_000.01 } })).hgbBefreit).toBe(false)
    // nur Einzelkaufleute: GbR (OHG) und GmbH nie befreit
    expect(merkmale(mit({ ...kaufmann, rechtsform: 'gbr', steuern: { umsatzErstesJahr: 1_000, gewinnErstesJahr: 100 } })).hgbBefreit).toBe(false)
    expect(merkmale(mit({ rechtsform: 'gmbh', steuern: { umsatzErstesJahr: 1_000, gewinnErstesJahr: 100 } })).hgbBefreit).toBe(false)
  })

  it('MM8: § 141 AO nur für gewerbliche Unternehmen', () => {
    expect(merkmale(mit({ taetigkeit: 'freiberuflich', steuern: { umsatzErstesJahr: 900_000 } })).ao141Grenze).toBe(false)
    expect(merkmale(mit({ taetigkeit: 'gewerblich', steuern: { umsatzErstesJahr: 900_000 } })).ao141Grenze).toBe(true)
    expect(merkmale(mit({ taetigkeit: 'gewerblich', steuern: { umsatzErstesJahr: 800_000, gewinnErstesJahr: 80_000 } })).ao141Grenze).toBe(false)
    expect(merkmale(mit({ taetigkeit: 'gewerblich', steuern: { gewinnErstesJahr: 80_000.01 } })).ao141Grenze).toBe(true)
  })

  it('Handwerk wirkt nur, wenn der Bereich Handwerk gewählt ist', () => {
    expect(merkmale(mit({ branchen: ['handel'], handwerk: 'zulassungspflichtig' })).handwerk).toBe('keins')
    expect(merkmale(mit({ branchen: ['handwerk', 'handel'], handwerk: 'zulassungspflichtig' })).handwerk).toBe('zulassungspflichtig')
    expect(merkmale(mit({ branchen: ['handwerk'] })).handwerk).toBe('unklar')
  })

  it('Sofortmeldepflicht und Minijobs nur mit Beschäftigten', () => {
    const m = merkmale(mit({ personal: { vorhanden: false, minijobber: 2, sofortmeldeBranche: true } }))
    expect([m.minijobber, m.sofortmeldeBranche]).toEqual([0, false])
  })

  it('GbR ist eingetragen, wenn F05 ja sagt, auch ohne Kaufmann', () => {
    expect(merkmale(mit({ rechtsform: 'gbr', gbrEingetragen: true })).personengesellschaftEingetragen).toBe(true)
    // F05 gilt nur für die GbR
    expect(merkmale(mit({ rechtsform: 'einzelunternehmen', gbrEingetragen: true })).personengesellschaftEingetragen).toBe(false)
  })

  it('leitet die Beispiele A, C, D und F ab (nachgerechnet)', () => {
    const a = merkmale(beispiel('A').profil)
    expect([a.kaufmann, a.onlinehandel, a.kundenPrivatEu, a.verpackungen, a.kleinunternehmer, a.hgbBefreit, a.ao141Grenze]).toEqual([false, true, true, true, false, false, false])
    const c = merkmale(beispiel('C').profil)
    expect([c.kaufmann, c.handwerk, c.beschaeftigte, c.minijobber, c.lohnsteuerabzug, c.sofortmeldeBranche]).toEqual([true, 'zulassungspflichtig', 3, 1, true, true])
    const d = merkmale(beispiel('D').profil)
    expect([d.kaufmann, d.personengesellschaftEingetragen, d.beschaeftigte, d.lohnsteuerabzug, d.kasse, d.bargeld]).toEqual([false, false, 3, false, 'elektronisch', true])
    const f = merkmale(beispiel('F').profil)
    expect([f.kaufmann, f.hgbBefreit, f.ao141Grenze, f.beschaeftigte, f.lohnsteuerabzug]).toEqual([true, false, true, 1, true])
  })
})

describe('Beschreibung der Merkmale', () => {
  it('beschreibt jedes Merkmal genau einmal, in der Reihenfolge des Interfaces', () => {
    expect(MERKMALE.map((m) => m.name)).toEqual(Object.keys(merkmale(basis())))
  })

  it('passt Typ und erlaubte Werte zur Ableitung', () => {
    for (const p of [basis(), beispiel('A').profil, beispiel('C').profil, beispiel('D').profil]) {
      const m = merkmale(p)
      for (const info of MERKMALE) {
        const wert = m[info.name]
        expect(typeof wert, info.name).toBe(info.typ)
        if (info.typ === 'string') expect(info.erlaubt, info.name).toContain(wert)
        else expect(info.erlaubt, info.name).toBeUndefined()
      }
    }
  })

  it('schreibt Werte für „Warum?“', () => {
    expect(`${merkmalInfo('website').label}: ${wertText('website', true)}`).toBe('Online-Auftritt: ja')
    expect(`${merkmalInfo('beschaeftigte').label}: ${wertText('beschaeftigte', 3)}`).toBe('Beschäftigte: 3')
    expect(wertText('rechtsform', 'gmbh')).toBe('GmbH')
    expect(wertText('handwerk', 'zulassungsfrei')).toBe('zulassungsfrei (Anlage B1)')
    expect(wertText('umsatzErstesJahr', 30_000)).toBe('30.000 €')
    expect(betragText(100_000.01)).toBe('100.000,01 €')
    expect(betragText(-500)).toBe('-500 €')
  })
})
