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

  it('hält den gespeicherten Stand fest', () => {
    const gespeichert = { katalogVersion: '2026.11.0', am: HEUTE, pflichten: [{ id: 'impressum', stand: '2026-11-11' }] }
    expect(reduziere(startZustand(neuesProjekt(HEUTE)), { typ: 'gespeichert', gespeichert }).projekt.gespeichert).toEqual(gespeichert)
  })
})
