/**
 * FEEL-Teilmenge für Eingabeeinträge der Entscheidungstabellen (Spezifikation 6.4):
 * eine Teilmenge von S-FEEL (DMN 1.3, Abschnitt 9.2, Regeln 5–15) ohne Namen als Endpunkt.
 *
 *   eintrag   = "-" | positiv | "not" "(" positiv ")"
 *   positiv   = test { "," test }
 *   test      = [ vergleich ] literal | intervall
 *   vergleich = "<" | "<=" | ">" | ">="
 *   intervall = ( "[" | "(" | "]" ) zahl ".." zahl ( "]" | ")" | "[" )
 *   literal   = zahl | text | "true" | "false"
 *   zahl      = [ "-" ] ziffer { ziffer } [ "." ziffer { ziffer } ]
 *   text      = '"' { zeichen ohne '"' und '\' } '"'
 *
 * Alles andere (Namen, Funktionen, Ausdrücke, Escapes, leere Einträge, leere
 * Intervalle) wird beim Laden abgelehnt. Vergleiche und Intervalle nur mit Zahlen.
 */
import type { MerkmalTyp } from '../modell/typen'
import type { EinfacherTest, Literal, UnaerTest } from './typen'

export class FeelFehler extends Error {}

const ZAHL = /-?\d+(?:\.\d+)?/y
const NAME = /[A-Za-z_][\w.]*/y
const WEITER = /[\w.]/

class Leser {
  pos = 0
  readonly text: string
  constructor(text: string) {
    this.text = text
  }

  leer(): void {
    while (this.pos < this.text.length && /\s/.test(this.text[this.pos])) this.pos++
  }

  ende(): boolean {
    this.leer()
    return this.pos >= this.text.length
  }

  sieht(s: string): boolean {
    this.leer()
    return this.text.startsWith(s, this.pos)
  }

  nimm(s: string): boolean {
    if (!this.sieht(s)) return false
    this.pos += s.length
    return true
  }

  erwarte(s: string): void {
    if (!this.nimm(s)) this.fehler(`„${s}“ erwartet`)
  }

  zeichen(): string {
    this.leer()
    return this.text[this.pos] ?? ''
  }

  fehler(meldung: string): never {
    throw new FeelFehler(`${meldung} (Stelle ${this.pos + 1} in „${this.text}“)`)
  }
}

function zahl(l: Leser): number {
  l.leer()
  ZAHL.lastIndex = l.pos
  const m = ZAHL.exec(l.text)
  if (!m) l.fehler('Zahl erwartet')
  l.pos += m[0].length
  if (WEITER.test(l.text[l.pos] ?? '') && !l.text.startsWith('..', l.pos)) l.fehler('Ungültige Zahl')
  return Number(m[0])
}

function literal(l: Leser): Literal {
  const c = l.zeichen()
  if (c === '"') {
    const start = l.pos + 1
    for (let i = start; i < l.text.length; i++) {
      if (l.text[i] === '\\') {
        l.pos = i
        l.fehler('Escapes in Texten werden nicht unterstützt')
      }
      if (l.text[i] === '"') {
        l.pos = i + 1
        return l.text.slice(start, i)
      }
    }
    l.fehler('Text ohne schließendes Anführungszeichen')
  }
  if (c === '-' && !/\d/.test(l.text[l.pos + 1] ?? '')) l.fehler('„-“ steht nur allein für „beliebig“')
  if (c === '-' || /\d/.test(c)) return zahl(l)
  NAME.lastIndex = l.pos
  const name = NAME.exec(l.text)?.[0]
  if (name === 'true' || name === 'false') {
    if (WEITER.test(l.text[l.pos + name.length] ?? '')) l.fehler('Unbekannter Name')
    l.pos += name.length
    return name === 'true'
  }
  if (name) {
    l.pos += name.length
    if (l.sieht('(')) l.fehler(`Funktionen wie „${name}(…)“ werden nicht unterstützt`)
    l.fehler(`Namen wie „${name}“ werden nicht unterstützt`)
  }
  return l.fehler(c ? `Unerwartetes Zeichen „${c}“` : 'Wert erwartet')
}

function intervall(l: Leser): EinfacherTest {
  const auf = l.zeichen()
  l.pos++
  const von = zahl(l)
  l.erwarte('..')
  const bis = zahl(l)
  const zu = l.zeichen()
  if (zu !== ']' && zu !== ')' && zu !== '[') l.fehler('Intervallende „]“, „)“ oder „[“ erwartet')
  l.pos++
  const vonOffen = auf !== '['
  const bisOffen = zu !== ']'
  if (von > bis || (von === bis && (vonOffen || bisOffen))) l.fehler('Leeres Intervall')
  return { art: 'intervall', von, bis, vonOffen, bisOffen }
}

function test(l: Leser): EinfacherTest {
  const c = l.zeichen()
  if (c === '[' || c === '(' || c === ']') return intervall(l)
  for (const op of ['<=', '>=', '<', '>'] as const) {
    if (l.nimm(op)) {
      const wert = literal(l)
      if (typeof wert !== 'number') l.fehler('Vergleiche nur mit Zahlen')
      return { art: 'vergleich', op, wert }
    }
  }
  return { art: 'gleich', wert: literal(l) }
}

function positiv(l: Leser): EinfacherTest[] {
  const tests = [test(l)]
  while (l.nimm(',')) tests.push(test(l))
  return tests
}

/** Liest einen Eingabeeintrag; wirft `FeelFehler` bei allem außerhalb der Teilmenge. */
export function parseEintrag(text: string): UnaerTest {
  const l = new Leser(text)
  if (l.ende()) l.fehler('Leerer Eintrag')
  if (text.trim() === '-') return { art: 'beliebig' }
  let negiert = false
  let tests: EinfacherTest[]
  NAME.lastIndex = l.pos
  if (NAME.exec(l.text)?.[0] === 'not') {
    l.pos += 3
    l.erwarte('(')
    negiert = true
    tests = positiv(l)
    l.erwarte(')')
  } else {
    tests = positiv(l)
  }
  if (!l.ende()) l.fehler(`Unerwartetes Zeichen „${l.zeichen()}“`)
  return { art: 'liste', negiert, tests }
}

/** Liest eine Liste von Literalen, z. B. inputValues `"a","b"` oder einen Ausgabeeintrag `"gewerbeanzeige"`. */
export function parseLiterale(text: string): Literal[] {
  const t = parseEintrag(text)
  if (t.art !== 'liste' || t.negiert || t.tests.some((x) => x.art !== 'gleich')) throw new FeelFehler(`Nur Literale erlaubt: „${text}“`)
  return t.tests.map((x) => (x as Extract<EinfacherTest, { art: 'gleich' }>).wert)
}

function typVon(wert: Literal): MerkmalTyp {
  return typeof wert as MerkmalTyp
}

/**
 * Prüft einen gelesenen Eintrag gegen den Typ der Eingabe (V6): Texte und
 * Wahrheitswerte nur auf Gleichheit, Textliterale aus den erlaubten Werten.
 * Gibt die Probleme als Text zurück; leer, wenn alles passt.
 */
export function pruefeTyp(eintrag: UnaerTest, typ: MerkmalTyp, erlaubt: readonly Literal[] | null): string[] {
  if (eintrag.art === 'beliebig') return []
  const probleme: string[] = []
  for (const t of eintrag.tests) {
    if (t.art !== 'gleich') {
      if (typ !== 'number') probleme.push(`Vergleiche und Intervalle nur mit Zahlen, die Eingabe ist ${typ}`)
      continue
    }
    if (typVon(t.wert) !== typ) probleme.push(`${JSON.stringify(t.wert)} passt nicht zum Typ ${typ}`)
    else if (typ === 'string' && erlaubt && !erlaubt.includes(t.wert)) probleme.push(`„${String(t.wert)}“ steht nicht in den erlaubten Werten`)
  }
  return probleme
}

function einfach(t: EinfacherTest, wert: Literal): boolean {
  if (t.art === 'gleich') {
    if (typeof t.wert !== typeof wert) throw new TypeError(`Typfehler: ${JSON.stringify(wert)} gegen ${JSON.stringify(t.wert)}`)
    return t.wert === wert
  }
  if (typeof wert !== 'number') throw new TypeError(`Typfehler: Vergleich mit ${JSON.stringify(wert)}`)
  if (t.art === 'vergleich') {
    switch (t.op) {
      case '<':
        return wert < t.wert
      case '<=':
        return wert <= t.wert
      case '>':
        return wert > t.wert
      case '>=':
        return wert >= t.wert
    }
  }
  const unten = t.vonOffen ? wert > t.von : wert >= t.von
  const oben = t.bisOffen ? wert < t.bis : wert <= t.bis
  return unten && oben
}

/**
 * Ist der Eintrag für den Wert erfüllt? Eine Liste ist erfüllt, wenn mindestens ein
 * Test passt; `not(…)` kehrt das um. Merkmale sind nie null: null oder ein falscher
 * Typ zur Laufzeit ist ein Programmfehler und wirft.
 */
export function erfuellt(eintrag: UnaerTest, wert: Literal | null | undefined): boolean {
  if (wert === null || wert === undefined) throw new TypeError('Programmfehler: Merkmal ohne Wert')
  if (eintrag.art === 'beliebig') return true
  const treffer = eintrag.tests.some((t) => einfach(t, wert))
  return eintrag.negiert ? !treffer : treffer
}
