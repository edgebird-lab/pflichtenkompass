/**
 * Anzeigetexte ohne React: Zusatz zum nächsten Termin auf der Pflichtkarte und im Druck.
 */
import { beforeAll, describe, expect, it } from 'vitest'
import xml from '../../regeln/pflichten.dmn?raw'
import { pflicht } from '../katalog/pflichten'
import { beispiel } from '../modell/beispiele'
import { werteAus } from '../regeln/auswertung'
import { ladeRegelwerk } from '../regeln/dmn'
import type { Ergebnis, Termin } from '../regeln/typen'
import { terminZusatz } from './texte'

let c: Ergebnis
let e: Ergebnis
beforeAll(async () => {
  const regelwerk = await ladeRegelwerk(xml, '')
  c = werteAus(regelwerk, beispiel('C').profil, { heute: '2026-11-11', horizontMonate: 24 })
  e = werteAus(regelwerk, beispiel('E').profil, { heute: '2026-11-11', horizontMonate: 24 })
})

const erster = (x: Ergebnis, id: string): Termin => {
  const t = x.pflichten.find((p) => p.pflicht.id === id)?.termine[0]
  if (!t) throw new Error(`kein Termin für ${id}`)
  return t
}

describe('Zusatz zum nächsten Termin', () => {
  it('nennt beim Titel der Pflicht nur den Zeitraum, statt den Titel zu wiederholen', () => {
    // C, Umsatzsteuererklärung 2027 mit Beratung am 28.02.2029
    expect(terminZusatz(erster(c, 'ustJahreserklaerung'), pflicht('ustJahreserklaerung').titel)).toBe(' (für 2027)')
    expect(terminZusatz(erster(c, 'jahresabschluss'), pflicht('jahresabschluss').titel)).toBe(' (für 2027)')
  })

  it('ergänzt nichts, wenn der Termin weder eigenen Titel noch Zeitraum hat', () => {
    expect(terminZusatz(erster(c, 'gewerbeanzeige'), pflicht('gewerbeanzeige').titel)).toBe('')
  })

  it('nennt einen eigenen Titel mit Zeitraum', () => {
    expect(terminZusatz(erster(e, 'ustVoranmeldung'), pflicht('ustVoranmeldung').titel)).toBe(': Umsatzsteuer-Voranmeldung – 4. Quartal 2026')
    expect(terminZusatz(erster(c, 'eRechnungAusstellen'), pflicht('eRechnungAusstellen').titel)).toBe(': E-Rechnungen ausstellen ab 01.01.2028')
  })
})
