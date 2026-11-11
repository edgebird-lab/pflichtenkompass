/**
 * Differenztest (Spezifikation 9.1, Schritt 2.2): Die eigene FEEL-Auswertung muss
 * für jeden Eintrag der DMN-Datei und jeden Testwert dasselbe ergeben wie feelin
 * 8.2.0 (`unaryTest(eintrag, { '?': wert }).value`). feelin ist nur Test-Orakel.
 */
import { unaryTest } from 'feelin'
import { describe, expect, it } from 'vitest'
import xml from '../../regeln/pflichten.dmn?raw'
import { ladeRegelwerk } from './dmn'
import { erfuellt, parseEintrag } from './feel'
import type { Literal } from './typen'

/** Testwerte für Zahlen aus 9.1; Grenzen 2.000, 9.000, 25.000, 100.000 und 800.000 jeweils mit Nachbarwerten. */
const ZAHLEN = [-1, 0, 1, 2_000, 9_000, 9_000.01, 25_000, 25_000.01, 100_000, 800_000, 800_000.01]

function orakel(eintrag: string, wert: Literal): unknown {
  return unaryTest(eintrag, { '?': wert }).value
}

describe('Differenztest gegen feelin 8.2.0', () => {
  it('rechnet für alle Einträge der DMN-Datei mit allen Testwerten gleich', async () => {
    const regelwerk = await ladeRegelwerk(xml, '')
    const abweichungen: string[] = []
    let vergleiche = 0
    const eintraege = new Set<string>()
    for (const t of regelwerk.tabellen) {
      for (const r of t.regeln) {
        r.eintraege.forEach((e, i) => {
          const eingabe = t.eingaben[i]
          const werte: Literal[] = eingabe.typ === 'string' ? [...(eingabe.erlaubt ?? [])] : eingabe.typ === 'boolean' ? [true, false] : ZAHLEN
          eintraege.add(`${eingabe.typ}:${e.text}`)
          for (const w of werte) {
            vergleiche++
            const eigen = erfuellt(e.test, w)
            const fremd = orakel(e.text, w)
            if (eigen !== fremd) abweichungen.push(`${r.id} „${e.text}“ mit ${JSON.stringify(w)}: eigen ${eigen}, feelin ${String(fremd)}`)
          }
        })
      }
    }
    expect(abweichungen).toEqual([])
    // Einträge: GR 9×5 + PE 7×4 + BR 1×1 + ST 16×9 + BU 11×6 + ON 3×2 + LU 20×14 = 570
    expect(regelwerk.tabellen.flatMap((t) => t.regeln).reduce((s, r) => s + r.eintraege.length, 0)).toBe(570)
    // Vergleiche je Regel = Summe der Testwerte ihrer Spalten (Text: erlaubte Werte, boolean: 2, Zahl: 11):
    // GR 15×9 + PE 26×7 + BR 2×1 + ST 23×16 + BU 15×11 + ON 4×3 + LU 52×20 = 1.904
    expect(vergleiche).toBe(1904)
    // Alle Formen, die in der Datei vorkommen: „-“, Textlisten, not(…), true/false, „> 0“, „> 25000“
    expect([...eintraege].filter((e) => !e.endsWith(':-')).sort()).toEqual(
      [
        'boolean:false',
        'boolean:true',
        'number:> 0',
        'number:> 25000',
        'string:"einzelunternehmen","gbr"',
        'string:"einzelunternehmen"',
        'string:"elektronisch"',
        'string:"freiberuflich"',
        'string:"gbr"',
        'string:"gewerblich"',
        'string:"ug","gmbh"',
        'string:"ug"',
        'string:"unklar"',
        'string:"zulassungsfrei","handwerksaehnlich"',
        'string:"zulassungspflichtig"',
        'string:not("keins")',
      ].sort(),
    )
  })

  it('rechnet auch die Formen aus 9.1 wie feelin, die in der Datei nicht vorkommen', () => {
    const faelle: [string, Literal[]][] = [
      ['[1..5]', [0, 1, 3, 5, 6]],
      ['[1..5)', [1, 5]],
      [']1..5]', [1, 5]],
      [']1..5[', [1, 3, 5]],
      ['(1..5)', [1, 3, 5]],
      ['< 10, > 100', [5, 50, 150]],
      ['>= 800000', [799_999.99, 800_000]],
      ['<= 25000', [25_000, 25_000.01]],
      ['< 0', [-1, 0]],
      ['not(> 0)', [0, 1]],
      ['not([1..5])', [0, 3]],
      ['-1, 2.5', [-1, 2.5, 1]],
      ['not(true)', [true, false]],
      [' "ug" , "gmbh" ', ['gmbh', 'gbr']],
    ]
    for (const [eintrag, werte] of faelle) {
      for (const w of werte) expect(erfuellt(parseEintrag(eintrag), w), `${eintrag} mit ${w}`).toBe(orakel(eintrag, w))
    }
  })
})
