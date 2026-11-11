import { describe, expect, it } from 'vitest'
import fragenkatalogMd from '../../docs/fragenkatalog.md?raw'
import { normLink } from '../katalog/normen'
import { beispiel, beispiele } from './beispiele'
import { fragenkatalogDoku } from './doku'
import { BUNDESLAND_NAMEN, FRAGEN, frage, frageNummer, sichtbareFragen } from './fragen'
import { standardProfil } from './profil'
import { BRANCHEN, BUNDESLAENDER, FRAGE_IDS, HANDWERKE, JA_NEIN_UNKLAR, KASSEN, RECHTSFORMEN, TAETIGKEITEN, type FrageId, type Profil } from './typen'

const basis = () => standardProfil('2026-11-11')
function mit(teil: Partial<Omit<Profil, 'personal' | 'steuern' | 'kunden'>> & { personal?: Partial<Profil['personal']>; steuern?: Partial<Profil['steuern']>; kunden?: Partial<Profil['kunden']> }): Profil {
  const p = basis()
  return { ...p, ...teil, personal: { ...p.personal, ...teil.personal }, steuern: { ...p.steuern, ...teil.steuern }, kunden: { ...p.kunden, ...teil.kunden } }
}
const sichtbar = (id: FrageId, p: Profil) => frage(id).sichtbar(p)
const werte = (id: FrageId) => frage(id).optionen?.map((o) => o.wert)

describe('Fragenkatalog F01–F32 (5.2)', () => {
  it('hat 32 Fragen in der Reihenfolge der IDs', () => {
    expect(FRAGEN.map((f) => f.id)).toEqual([...FRAGE_IDS])
  })

  it('ordnet die Fragen den Schritten aus 5.1 zu', () => {
    const schritt = (nr: number) => (nr <= 8 ? 'vorhaben' : nr <= 11 ? 'taetigkeit' : nr <= 18 ? 'personal' : nr <= 24 ? 'verkauf' : 'steuern')
    for (const f of FRAGEN) expect(f.schritt, f.id).toBe(schritt(frageNummer(f.id)))
  })

  it('kennt die Pflichtfelder aus 6.9', () => {
    expect(FRAGEN.filter((f) => f.pflicht).map((f) => f.id)).toEqual(['F02', 'F03', 'F04', 'F06', 'F09', 'F19'])
  })

  it('bietet genau die Werte des Datenmodells an', () => {
    expect(werte('F03')).toEqual([...BUNDESLAENDER])
    expect(Object.keys(BUNDESLAND_NAMEN)).toEqual([...BUNDESLAENDER])
    expect(werte('F04')).toEqual([...RECHTSFORMEN])
    expect(werte('F06')).toEqual([...TAETIGKEITEN])
    expect(werte('F07')).toEqual([...JA_NEIN_UNKLAR])
    expect(werte('F09')).toEqual([...BRANCHEN])
    expect(werte('F10')).toEqual(HANDWERKE.filter((h) => h !== 'keins'))
    expect(werte('F19')).toEqual(Object.keys(basis().kunden))
    expect(werte('F22')).toEqual([...KASSEN])
    for (const f of FRAGEN) {
      const mitOptionen = f.typ === 'auswahl' || f.typ === 'mehrfach'
      expect(!!f.optionen, f.id).toBe(mitOptionen)
    }
  })

  it('hat Texte, Hilfen und gültige Normlinks', () => {
    for (const f of FRAGEN) {
      expect(f.text, f.id).toMatch(/\?$/)
      expect(f.hilfe, f.id).toMatch(/\.$/)
      for (const n of f.normen) expect(normLink(n)).toMatch(/^https:\/\/www\.gesetze-im-internet\.de\//)
      expect(f.sichtbarText.length, f.id).toBeGreaterThan(0)
      expect(f.standardText.length, f.id).toBeGreaterThan(0)
    }
  })
})

describe('Sichtbarkeit (5.2)', () => {
  it('zeigt im Standardprofil 21 Fragen', () => {
    // ausgeblendet: F05 (keine GbR), F10 (kein Handwerk), F13–F18 (keine Beschäftigten), F23 (keine Kasse), F30 (keine EU-Privatkunden)
    // F28 und F29 sind sichtbar, weil der Standardbeginn 01.12.2026 im Jahr 2026 liegt; F28 aber nur mit Geschäftskunden
    expect(sichtbareFragen(basis()).map((f) => f.id)).toEqual(['F01', 'F02', 'F03', 'F04', 'F06', 'F07', 'F08', 'F09', 'F11', 'F12', 'F19', 'F20', 'F21', 'F22', 'F24', 'F25', 'F26', 'F27', 'F29', 'F31', 'F32'])
  })

  it('zeigt bei A 21 Fragen und bei B–F die von Hand gezählten Mengen', () => {
    const anzahl = Object.fromEntries(beispiele().map((b) => [b.id, sichtbareFragen(b.profil).length]))
    expect(anzahl).toEqual({ A: 21, B: 18, C: 25, D: 27, E: 19, F: 26 })
  })

  it('blendet bei A genau die erwarteten Fragen aus', () => {
    const aus = FRAGEN.filter((f) => !f.sichtbar(beispiel('A').profil)).map((f) => f.id)
    expect(aus).toEqual(['F05', 'F10', 'F13', 'F14', 'F15', 'F16', 'F17', 'F18', 'F23', 'F28', 'F29'])
  })

  it('F05 nur bei der GbR', () => {
    expect(sichtbar('F05', mit({ rechtsform: 'gbr' }))).toBe(true)
    for (const r of ['einzelunternehmen', 'ug', 'gmbh'] as const) expect(sichtbar('F05', mit({ rechtsform: r }))).toBe(false)
  })

  it('F07 nur bei Einzelunternehmen oder GbR mit gewerblicher Tätigkeit', () => {
    expect(sichtbar('F07', mit({ rechtsform: 'einzelunternehmen', taetigkeit: 'gewerblich' }))).toBe(true)
    expect(sichtbar('F07', mit({ rechtsform: 'gbr', taetigkeit: 'gewerblich' }))).toBe(true)
    expect(sichtbar('F07', mit({ rechtsform: 'gbr', taetigkeit: 'freiberuflich' }))).toBe(false)
    expect(sichtbar('F07', mit({ rechtsform: 'gmbh', taetigkeit: 'gewerblich' }))).toBe(false)
  })

  it('F10 nur mit dem Bereich Handwerk', () => {
    expect(sichtbar('F10', mit({ branchen: ['handel', 'handwerk'] }))).toBe(true)
    expect(sichtbar('F10', mit({ branchen: ['handel'] }))).toBe(false)
  })

  it('F13–F17 nur mit Beschäftigten, F16 nur mit Minijobs', () => {
    const mitPersonal = mit({ personal: { vorhanden: true, svPflichtig: 1, minijobber: 0 } })
    expect((['F13', 'F14', 'F15', 'F17'] as const).map((id) => sichtbar(id, mitPersonal))).toEqual([true, true, true, true])
    expect(sichtbar('F16', mitPersonal)).toBe(false)
    expect(sichtbar('F16', mit({ personal: { vorhanden: true, minijobber: 1 } }))).toBe(true)
    // ohne F12 = ja bleibt alles ausgeblendet, auch wenn Zahlen eingetragen sind
    const ohne = mit({ personal: { vorhanden: false, svPflichtig: 2, minijobber: 2 } })
    expect((['F13', 'F14', 'F15', 'F16', 'F17', 'F18'] as const).some((id) => sichtbar(id, ohne))).toBe(false)
  })

  it('F18 nur mit Lohnsteuerabzug', () => {
    expect(sichtbar('F18', mit({ personal: { vorhanden: true, svPflichtig: 1 } }))).toBe(true)
    expect(sichtbar('F18', mit({ personal: { vorhanden: true, minijobber: 2, minijobPauschsteuer: true } }))).toBe(false)
    expect(sichtbar('F18', mit({ personal: { vorhanden: true, minijobber: 2, minijobPauschsteuer: false } }))).toBe(true)
  })

  it('F23 nur bei elektronischer Kasse', () => {
    expect(sichtbar('F23', mit({ kasse: 'elektronisch' }))).toBe(true)
    expect(sichtbar('F23', mit({ kasse: 'offeneLadenkasse' }))).toBe(false)
  })

  it('F28 nur bei Beginn bis Ende 2026, ohne Kleinunternehmerregelung und mit inländischen Geschäftskunden', () => {
    const ja = { start: '2026-12-31', kunden: { unternehmenInland: true } }
    expect(sichtbar('F28', mit(ja))).toBe(true)
    expect(sichtbar('F28', mit({ ...ja, start: '2027-01-01' }))).toBe(false)
    expect(sichtbar('F28', mit({ ...ja, steuern: { kleinunternehmer: true } }))).toBe(false)
    expect(sichtbar('F28', mit({ ...ja, kunden: { unternehmenInland: false, unternehmenEu: true } }))).toBe(false)
  })

  it('F29 nur bei Beginn im Jahr 2026 ohne Kleinunternehmerregelung', () => {
    expect(sichtbar('F29', mit({ start: '2026-03-01' }))).toBe(true)
    expect(sichtbar('F29', mit({ start: '2027-01-01' }))).toBe(false)
    expect(sichtbar('F29', mit({ start: '2026-03-01', steuern: { kleinunternehmer: true } }))).toBe(false)
  })

  it('F30 nur mit Privatkunden in der EU ohne Kleinunternehmerregelung, F31 ohne Kleinunternehmerregelung', () => {
    expect(sichtbar('F30', mit({ kunden: { privatEu: true } }))).toBe(true)
    expect(sichtbar('F30', mit({ kunden: { privatEu: true }, steuern: { kleinunternehmer: true } }))).toBe(false)
    expect(sichtbar('F31', mit({}))).toBe(true)
    expect(sichtbar('F31', mit({ steuern: { kleinunternehmer: true } }))).toBe(false)
  })

  it('F32 nur bei Einzelunternehmen und GbR', () => {
    expect((['einzelunternehmen', 'gbr', 'ug', 'gmbh'] as const).map((r) => sichtbar('F32', mit({ rechtsform: r })))).toEqual([true, true, false, false])
  })
})

describe('docs/fragenkatalog.md', () => {
  it('ist aus den aktuellen Fragen erzeugt (sonst: npm run doku)', () => {
    expect(fragenkatalogMd.replace(/\r\n/g, '\n')).toBe(fragenkatalogDoku())
  })
})
