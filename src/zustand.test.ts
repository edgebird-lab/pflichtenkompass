import { describe, expect, it } from 'vitest'
import { beispiel } from './modell/beispiele'
import { neuesProjekt } from './modell/speicher'
import type { Ergebnis } from './regeln/typen'
import { reduziere, startZustand } from './zustand'

const HEUTE = '2026-11-11'
const ergebnis = (ids: string[]) => ({ pflichten: ids.map((id) => ({ pflicht: { id } })) }) as unknown as Ergebnis

describe('Zustand der Oberfläche', () => {
  it('setzt Profil und Status und speichert danach wieder', () => {
    let z = reduziere(startZustand(neuesProjekt(HEUTE)), { typ: 'geloescht', projekt: neuesProjekt(HEUTE) })
    expect(z.speichern).toBe(false)
    z = reduziere(z, { typ: 'profil', profil: beispiel('A').profil })
    expect(z.speichern).toBe(true)
    expect(z.projekt.profil.name).toBe('Kaffeeversand')
    z = reduziere(z, { typ: 'status', id: 'impressum', teil: { bearbeitung: 'erledigt' }, heute: HEUTE })
    expect(z.projekt.status.impressum).toEqual({ bearbeitung: 'erledigt', notiz: '', geaendertAm: HEUTE })
    z = reduziere(z, { typ: 'status', id: 'impressum', teil: { notiz: 'online seit Januar' }, heute: '2026-11-12' })
    expect(z.projekt.status.impressum).toEqual({ bearbeitung: 'erledigt', notiz: 'online seit Januar', geaendertAm: '2026-11-12' })
  })

  it('setzt Antworten mit abhängigen Standardwerten', () => {
    let z = startZustand(neuesProjekt(HEUTE))
    z = reduziere(z, { typ: 'antwort', frage: 'F09', wert: ['gastronomie'] })
    z = reduziere(z, { typ: 'antwort', frage: 'F22', wert: 'elektronisch' })
    expect([z.projekt.profil.lebensmittel, z.projekt.profil.bargeld]).toEqual([true, true])
  })

  it('beginnt beim Laden neu: Schritt, Version, kein Vergleich, Dateiname für den Hinweis', () => {
    const z0 = { ...startZustand(neuesProjekt(HEUTE)), vorher: ergebnis(['impressum']) }
    const z = reduziere(z0, { typ: 'laden', projekt: { ...neuesProjekt(HEUTE), profil: beispiel('B').profil }, schritt: 'ergebnis', datei: 'buero.pflichtenkompass' })
    expect([z.schritt, z.version, z.vorher, z.geoeffnet]).toEqual(['ergebnis', 1, null, 'buero.pflichtenkompass'])
    expect(reduziere(z, { typ: 'hinweisGelesen' }).geoeffnet).toBeNull()
  })

  it('merkt sich das Ergebnis erst beim Verlassen des Ergebnisses', () => {
    let z = startZustand(neuesProjekt(HEUTE), 'personal')
    z = reduziere(z, { typ: 'schritt', schritt: 'ergebnis', ergebnis: ergebnis(['a']) })
    expect(z.vorher).toBeNull()
    z = reduziere(z, { typ: 'schritt', schritt: 'termine', ergebnis: ergebnis(['a', 'b']) })
    expect(z.vorher?.pflichten).toHaveLength(2)
    z = reduziere(z, { typ: 'schritt', schritt: 'personal', ergebnis: ergebnis(['c']) })
    expect(z.vorher?.pflichten).toHaveLength(2)
  })

  it('überschreibt einen unlesbaren Stand im Browser erst nach der nächsten Eingabe', () => {
    const z0 = startZustand(neuesProjekt(HEUTE), 'start', 'Dateiformat 2 wird nicht unterstützt.')
    expect([z0.speichern, z0.unlesbar]).toEqual([false, 'Dateiformat 2 wird nicht unterstützt.'])
    // Schrittwechsel ist keine Eingabe
    const z1 = reduziere(z0, { typ: 'schritt', schritt: 'vorhaben', ergebnis: null })
    expect([z1.speichern, z1.unlesbar]).toEqual([false, 'Dateiformat 2 wird nicht unterstützt.'])
    for (const a of [
      { typ: 'antwort', frage: 'F01', wert: 'Laden' },
      { typ: 'status', id: 'impressum', teil: { bearbeitung: 'erledigt' }, heute: HEUTE },
      { typ: 'laden', projekt: neuesProjekt(HEUTE), schritt: 'ergebnis' },
    ] as const) {
      expect([reduziere(z1, a).speichern, reduziere(z1, a).unlesbar], a.typ).toEqual([true, null])
    }
    // „Lokale Daten löschen“ entfernt den Stand ohnehin; danach kein Hinweis mehr
    expect(reduziere(z1, { typ: 'geloescht', projekt: neuesProjekt(HEUTE) }).unlesbar).toBeNull()
    expect(startZustand(neuesProjekt(HEUTE)).speichern).toBe(true)
  })

  it('hält den gespeicherten Stand fest', () => {
    const gespeichert = { katalogVersion: '2026.11.0', am: HEUTE, pflichten: [{ id: 'impressum', stand: '2026-11-11' }] }
    expect(reduziere(startZustand(neuesProjekt(HEUTE)), { typ: 'gespeichert', gespeichert }).projekt.gespeichert).toEqual(gespeichert)
  })
})
