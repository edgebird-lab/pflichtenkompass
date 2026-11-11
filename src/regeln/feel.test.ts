import { describe, expect, it } from 'vitest'
import { erfuellt, FeelFehler, parseEintrag, parseLiterale, pruefeTyp } from './feel'
import type { Literal } from './typen'

const RECHTSFORMEN = ['einzelunternehmen', 'gbr', 'ug', 'gmbh']
const auswertung = (eintrag: string, wert: Literal | null) => erfuellt(parseEintrag(eintrag), wert)

describe('FEEL-Teilmenge: Auswertung (9.1)', () => {
  const faelle: [string, string, Literal, boolean][] = [
    ['FE1', '-', 'gbr', true],
    ['FE2', '-', 0, true],
    ['FE3', '"gmbh"', 'gmbh', true],
    ['FE4', '"ug","gmbh"', 'ug', true],
    ['FE5', '"ug","gmbh"', 'gbr', false],
    ['FE6', 'not("ug","gmbh")', 'gbr', true],
    ['FE7', 'not("ug","gmbh")', 'ug', false],
    ['FE8', 'true', true, true],
    ['FE9', 'true', false, false],
    ['FE10', '> 0', 0, false],
    ['FE11', '> 0', 1, true],
    ['FE12', '>= 800000', 800_000, true],
    ['FE13', '<= 25000', 25_000.01, false],
    ['FE14', '[1..5]', 5, true],
    ['FE15', '[1..5)', 5, false],
    ['FE16', ']1..5]', 1, false],
    ['FE17', '< 10, > 100', 50, false],
    ['FE18', ' "ug" , "gmbh" ', 'gmbh', true],
  ]
  for (const [nr, eintrag, wert, erwartet] of faelle) {
    it(`${nr}: ${eintrag} mit ${JSON.stringify(wert)} → ${erwartet ? 'wahr' : 'falsch'}`, () => {
      expect(auswertung(eintrag, wert)).toBe(erwartet)
    })
  }

  it('FE26: ein Merkmal ohne Wert ist ein Programmfehler', () => {
    expect(() => auswertung('"gmbh"', null)).toThrow(TypeError)
    expect(() => erfuellt(parseEintrag('-'), undefined)).toThrow(TypeError)
  })

  it('wirft bei falschem Typ zur Laufzeit statt still „falsch“ zu liefern', () => {
    expect(() => auswertung('"gmbh"', 3)).toThrow(TypeError)
    expect(() => auswertung('> 0', 'gmbh')).toThrow(TypeError)
    expect(() => auswertung('[1..5]', true)).toThrow(TypeError)
  })
})

describe('FEEL-Teilmenge: Ladefehler (9.1)', () => {
  const faelle: [string, string, RegExp][] = [
    ['FE19', 'not(-)', /„-“ steht nur allein/],
    ['FE20', 'date("2027-01-01")', /nicht unterstützt/],
    ['FE21', 'Merkmale.x > 3', /Namen wie „Merkmale\.x“ werden nicht unterstützt/],
    ['FE22', '"a\\"b"', /Escapes/],
    ['FE23', '> "a"', /Vergleiche nur mit Zahlen/],
    ['FE24', '[5..1]', /Leeres Intervall/],
    ['FE25', '', /Leerer Eintrag/],
  ]
  for (const [nr, eintrag, meldung] of faelle) {
    it(`${nr}: ${eintrag || 'leerer Eintrag'}`, () => {
      expect(() => parseEintrag(eintrag)).toThrow(FeelFehler)
      expect(() => parseEintrag(eintrag)).toThrow(meldung)
    })
  }

  it('lehnt weitere Formen außerhalb der Teilmenge ab', () => {
    for (const eintrag of [
      '   ',
      '"offen',
      '1e5',
      '1.2.3',
      '.5',
      '5.',
      '+5',
      '- 1',
      '"a" "b"',
      '"a",',
      ',"a"',
      'not "a"',
      'not("a"',
      'nicht("a")',
      'true1',
      '? > 3',
      '> = 3',
      '= 3',
      '!= 3',
      '[1..]',
      '[1..5',
      '(1..1)',
      '[1..1)',
      'not(not("a"))',
      '-, 1',
    ]) {
      expect(() => parseEintrag(eintrag), eintrag).toThrow(FeelFehler)
    }
  })
})

describe('FEEL-Teilmenge: Grammatik', () => {
  it('liest Listen, Negation und Leerzeichen um Tokens', () => {
    expect(parseEintrag(' not ( "ug" , "gmbh" ) ')).toEqual({
      art: 'liste',
      negiert: true,
      tests: [
        { art: 'gleich', wert: 'ug' },
        { art: 'gleich', wert: 'gmbh' },
      ],
    })
    expect(parseEintrag(' - ')).toEqual({ art: 'beliebig' })
  })

  it('liest Zahlen mit Vorzeichen und Nachkommastellen', () => {
    expect(parseEintrag('-1')).toEqual({ art: 'liste', negiert: false, tests: [{ art: 'gleich', wert: -1 }] })
    expect(parseEintrag('>= -2.5')).toEqual({ art: 'liste', negiert: false, tests: [{ art: 'vergleich', op: '>=', wert: -2.5 }] })
    expect(parseEintrag('0.5')).toEqual({ art: 'liste', negiert: false, tests: [{ art: 'gleich', wert: 0.5 }] })
    expect(auswertung('-1', -1)).toBe(true)
  })

  it('liest alle Klammerformen der Intervalle (9.4)', () => {
    const iv = (text: string) => parseEintrag(text).art === 'liste' && (parseEintrag(text) as { tests: unknown[] }).tests[0]
    expect(iv('[1..5]')).toEqual({ art: 'intervall', von: 1, bis: 5, vonOffen: false, bisOffen: false })
    expect(iv('(1..5)')).toEqual({ art: 'intervall', von: 1, bis: 5, vonOffen: true, bisOffen: true })
    expect(iv(']1..5[')).toEqual({ art: 'intervall', von: 1, bis: 5, vonOffen: true, bisOffen: true })
    expect(iv('[ 1.5 .. 2.5 ]')).toEqual({ art: 'intervall', von: 1.5, bis: 2.5, vonOffen: false, bisOffen: false })
    expect(iv('[-5..-1]')).toEqual({ art: 'intervall', von: -5, bis: -1, vonOffen: false, bisOffen: false })
    expect(iv('[1..1]')).toEqual({ art: 'intervall', von: 1, bis: 1, vonOffen: false, bisOffen: false })
    expect([0.99, 1, 3, 5, 5.01].map((w) => auswertung('[1..5]', w))).toEqual([false, true, true, true, false])
    expect([1, 1.01, 4.99, 5].map((w) => auswertung('(1..5)', w))).toEqual([false, true, true, false])
    expect([1, 5].map((w) => auswertung(']1..5[', w))).toEqual([false, false])
    expect(auswertung('[1..1]', 1)).toBe(true)
  })

  it('liest alle Vergleichsoperatoren', () => {
    expect(['< 5', '<= 5', '> 5', '>= 5'].map((e) => [4, 5, 6].map((w) => auswertung(e, w)))).toEqual([
      [true, false, false],
      [true, true, false],
      [false, false, true],
      [false, true, true],
    ])
  })

  it('kennt Texte mit Komma und Leerzeichen', () => {
    expect(auswertung('"a, b", "c"', 'a, b')).toBe(true)
    expect(auswertung('"a, b", "c"', 'a')).toBe(false)
  })

  it('negiert auch Zahlentests', () => {
    expect(auswertung('not(> 0)', 0)).toBe(true)
    expect(auswertung('not([1..5])', 3)).toBe(false)
    expect(auswertung('not(false)', true)).toBe(true)
  })

  it('liest Literal-Listen für inputValues und outputValues', () => {
    expect(parseLiterale('"einzelunternehmen","gbr","ug","gmbh"')).toEqual(RECHTSFORMEN)
    expect(parseLiterale('"gewerbeanzeige"')).toEqual(['gewerbeanzeige'])
    expect(() => parseLiterale('not("a")')).toThrow(FeelFehler)
    expect(() => parseLiterale('> 3')).toThrow(FeelFehler)
    expect(() => parseLiterale('-')).toThrow(FeelFehler)
  })
})

describe('FEEL-Teilmenge: Typprüfung (V6)', () => {
  it('erlaubt Texte nur auf Gleichheit und nur mit erlaubten Werten', () => {
    expect(pruefeTyp(parseEintrag('"ug","gmbh"'), 'string', RECHTSFORMEN)).toEqual([])
    expect(pruefeTyp(parseEintrag('not("keins")'), 'string', ['keins', 'unklar'])).toEqual([])
    expect(pruefeTyp(parseEintrag('"gmhb"'), 'string', RECHTSFORMEN)).toEqual(['„gmhb“ steht nicht in den erlaubten Werten'])
    expect(pruefeTyp(parseEintrag('> 3'), 'string', RECHTSFORMEN)).toEqual(['Vergleiche und Intervalle nur mit Zahlen, die Eingabe ist string'])
    expect(pruefeTyp(parseEintrag('true'), 'string', RECHTSFORMEN)).toEqual(['true passt nicht zum Typ string'])
  })

  it('erlaubt bei Wahrheitswerten nur true und false', () => {
    expect(pruefeTyp(parseEintrag('true'), 'boolean', null)).toEqual([])
    expect(pruefeTyp(parseEintrag('"true"'), 'boolean', null)).toEqual(['"true" passt nicht zum Typ boolean'])
    expect(pruefeTyp(parseEintrag('[0..1]'), 'boolean', null)).toHaveLength(1)
  })

  it('erlaubt bei Zahlen Gleichheit, Vergleich und Intervall', () => {
    expect(pruefeTyp(parseEintrag('0, > 3, [5..9]'), 'number', null)).toEqual([])
    expect(pruefeTyp(parseEintrag('"3"'), 'number', null)).toEqual(['"3" passt nicht zum Typ number'])
    expect(pruefeTyp(parseEintrag('-'), 'number', null)).toEqual([])
  })
})
