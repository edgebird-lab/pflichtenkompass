/**
 * Lädt regeln/pflichten.dmn mit dmn-moddle und baut daraus das Regelwerk
 * (Spezifikation 6.3). Beim Laden laufen die Prüfungen V1–V11 (6.10); jeder Fehler
 * wird gesammelt, und mit Fehlern bricht das Laden mit der ganzen Liste ab.
 * V12 (Prüfwert der Datei) läuft nur in Tests und CI.
 */
import { DmnModdle } from 'dmn-moddle'
import { istLueckeId } from '../katalog/luecken'
import { istPflichtId } from '../katalog/pflichten'
import { istMerkmal, merkmalInfo } from '../modell/merkmale'
import { FeelFehler, parseEintrag, parseLiterale, pruefeTyp } from './feel'
import { pruefeAbdeckung, pruefeKatalog } from './pruefung'
import type { Eingabe, Literal, Regel, Regelfehler, Regelwerk, Tabelle } from './typen'

export const DMN13_NAMENSRAUM = 'https://www.omg.org/spec/DMN/20191111/MODEL/'
export const REGEL_ID = /^[A-Z]{2}\d{2}$/
export const ANNOTATION = 'Begründung'

export class RegelwerkFehler extends Error {
  readonly fehler: readonly Regelfehler[]
  constructor(fehler: readonly Regelfehler[]) {
    super(`Regelwerk fehlerhaft: ${fehler.map((f) => `${f.regel} ${f.ort}: ${f.meldung}`).join(' | ')}`)
    this.fehler = fehler
  }
}

// Ausschnitt des Objektmodells von dmn-moddle, soweit der Lader ihn liest
interface MText {
  text?: string
}
interface MEingabe {
  id?: string
  label?: string
  inputExpression?: { typeRef?: string; text?: string }
  inputValues?: MText
}
interface MAusgabe {
  id?: string
  name?: string
  typeRef?: string
  outputValues?: MText
}
interface MRegel {
  id?: string
  inputEntry?: MText[]
  outputEntry?: MText[]
  annotationEntry?: MText[]
}
interface MTabelle {
  $type: string
  hitPolicy?: string
  aggregation?: string
  input?: MEingabe[]
  output?: MAusgabe[]
  annotation?: { name?: string }[]
  rule?: MRegel[]
}
interface MEntscheidung {
  $type: string
  id?: string
  name?: string
  decisionLogic?: MTabelle
}

/** Namensraum des Wurzelelements `definitions` (V1), ohne XML-Parser. */
export function wurzelNamensraum(xml: string): string | null {
  const wurzel = /<(?:([\w.-]+):)?definitions\b([^>]*)>/.exec(xml)
  if (!wurzel) return null
  const praefix = wurzel[1]
  const attr = new RegExp(`\\sxmlns${praefix ? `:${praefix}` : ''}\\s*=\\s*["']([^"']*)["']`).exec(wurzel[2])
  return attr?.[1] ?? null
}

function literale(text: string | undefined): Literal[] | null {
  if (text === undefined || text.trim() === '') return null
  try {
    return parseLiterale(text)
  } catch {
    return null
  }
}

function leseTabelle(e: MEntscheidung, fehler: Regelfehler[]): Tabelle | null {
  const name = e.name ?? e.id ?? '?'
  const ort = `Entscheidung „${name}“`
  const melde = (regel: Regelfehler['regel'], wo: string, meldung: string) => fehler.push({ regel, ort: wo, meldung })
  const t = e.decisionLogic

  // V2: Entscheidungstabelle mit COLLECT ohne Aggregation
  if (!t || t.$type !== 'dmn:DecisionTable') {
    melde('V2', ort, 'Keine Entscheidungstabelle.')
    return null
  }
  if (t.hitPolicy !== 'COLLECT') melde('V2', ort, `Hit Policy ${t.hitPolicy ?? 'UNIQUE'} statt COLLECT.`)
  if (t.aggregation !== undefined) melde('V2', ort, `COLLECT mit Aggregation ${t.aggregation} ist nicht erlaubt.`)

  // V3: genau eine Ausgabe „pflicht“ oder „luecke“ vom Typ string mit outputValues
  const ausgaben = t.output ?? []
  const a = ausgaben[0]
  const art = a?.name === 'pflicht' || a?.name === 'luecke' ? a.name : null
  if (ausgaben.length !== 1 || !art) melde('V3', ort, 'Genau eine Ausgabe namens „pflicht“ oder „luecke“ erwartet.')
  if (a && a.typeRef !== 'string') melde('V3', ort, `Ausgabe mit typeRef „${a.typeRef ?? ''}“ statt „string“.`)
  const ausgabeWerte = literale(a?.outputValues?.text)
  if (!ausgabeWerte || ausgabeWerte.some((w) => typeof w !== 'string')) melde('V3', ort, 'Die Ausgabe braucht outputValues mit Textliteralen.')
  // V4 (Teil): alle outputValues gibt es im Katalog bzw. in der Lückenliste
  const bekannt = (w: string) => (art === 'luecke' ? istLueckeId(w) : istPflichtId(w))
  for (const w of ausgabeWerte ?? []) if (art && typeof w === 'string' && !bekannt(w)) melde('V4', ort, `outputValues nennt „${w}“, das es ${art === 'luecke' ? 'in der Lückenliste' : 'im Katalog'} nicht gibt.`)

  // V5: Eingaben als Merkmale.<name> mit passendem Typ und erlaubten Werten
  const eingaben: (Eingabe | null)[] = (t.input ?? []).map((ein, i) => {
    const spalte = `${ort}, Eingabe ${i + 1}`
    const m = /^Merkmale\.(\w+)$/.exec(ein.inputExpression?.text?.trim() ?? '')
    if (!m || !istMerkmal(m[1])) {
      melde('V5', spalte, `Ausdruck „${ein.inputExpression?.text ?? ''}“ ist kein bekanntes Merkmal (Merkmale.<name>).`)
      return null
    }
    const info = merkmalInfo(m[1])
    if (ein.inputExpression?.typeRef !== info.typ) {
      melde('V5', spalte, `Merkmal ${info.name} hat den Typ ${info.typ}, nicht „${ein.inputExpression?.typeRef ?? ''}“.`)
      return null
    }
    let erlaubt: Literal[] | null = null
    if (info.typ === 'string') {
      erlaubt = literale(ein.inputValues?.text)
      const soll = [...(info.erlaubt ?? [])].sort().join()
      if (!erlaubt || [...erlaubt].map(String).sort().join() !== soll) {
        melde('V5', spalte, `inputValues müssen genau die erlaubten Werte von ${info.name} nennen: ${info.erlaubt?.join(', ')}.`)
        erlaubt = info.erlaubt ? [...info.erlaubt] : null
      }
    }
    return { id: ein.id ?? '', label: ein.label ?? info.label, merkmal: info.name, typ: info.typ, erlaubt }
  })

  // V7 (Teil): eine Annotationsspalte „Begründung“
  const annotationen = t.annotation ?? []
  if (annotationen.length !== 1 || annotationen[0].name !== ANNOTATION) melde('V7', ort, `Genau eine Annotationsspalte „${ANNOTATION}“ erwartet.`)

  const regeln: Regel[] = []
  ;(t.rule ?? []).forEach((r, nr) => {
    const id = r.id ?? `Regel ${nr + 1}`
    const wo = `${ort}, Regel ${id}`
    // V6: jeder Eintrag passt zur Grammatik und zum Typ
    const eintraege = r.inputEntry ?? []
    // Bei falscher Anzahl stünden die Einträge in den falschen Spalten; dann nur diesen Fehler melden
    const anzahlPasst = eintraege.length === eingaben.length
    if (!anzahlPasst) melde('V6', wo, `${eintraege.length} Einträge für ${eingaben.length} Eingaben.`)
    const gelesen: Regel['eintraege'][number][] = []
    if (anzahlPasst) eintraege.forEach((eintrag, i) => {
      const text = eintrag.text ?? ''
      const eingabe = eingaben[i]
      try {
        const test = parseEintrag(text)
        if (eingabe) for (const p of pruefeTyp(test, eingabe.typ, eingabe.erlaubt)) melde('V6', `${wo}, Spalte „${eingabe.label}“`, p)
        gelesen.push({ text, test })
      } catch (err) {
        if (!(err instanceof FeelFehler)) throw err
        melde('V6', `${wo}, Spalte ${eingabe ? `„${eingabe.label}“` : i + 1}`, err.message)
      }
    })
    // V4: eine Ausgabe, Textliteral aus outputValues, bekannt im Katalog
    const ausgabe = r.outputEntry?.length === 1 ? literale(r.outputEntry[0].text) : null
    const wert = ausgabe?.length === 1 && typeof ausgabe[0] === 'string' ? ausgabe[0] : null
    if (wert === null) melde('V4', wo, 'Genau ein Ausgabeeintrag als Textliteral erwartet.')
    else if (ausgabeWerte && !ausgabeWerte.includes(wert)) melde('V4', wo, `Ausgabe „${wert}“ steht nicht in den outputValues.`)
    else if (art && !bekannt(wert)) melde('V4', wo, `Ausgabe „${wert}“ gibt es ${art === 'luecke' ? 'in der Lückenliste' : 'im Katalog'} nicht.`)
    // V7: nicht leere Begründung
    const begruendung = r.annotationEntry?.[0]?.text?.trim() ?? ''
    if (!begruendung) melde('V7', wo, 'Die Regel hat keine Begründung (Annotation).')
    regeln.push({ id, eintraege: gelesen, ausgabe: wert ?? '', begruendung })
  })

  return { id: e.id ?? '', name, ausgabe: art ?? 'pflicht', eingaben: eingaben.filter((x): x is Eingabe => x !== null), regeln }
}

/** V8: Regel-IDs eindeutig und nach dem Muster zwei Buchstaben, zwei Ziffern. */
function pruefeRegelIds(tabellen: readonly Tabelle[]): Regelfehler[] {
  const fehler: Regelfehler[] = []
  const gesehen = new Set<string>()
  for (const t of tabellen) {
    for (const r of t.regeln) {
      if (!REGEL_ID.test(r.id)) fehler.push({ regel: 'V8', ort: `Entscheidung „${t.name}“`, meldung: `Regel-ID „${r.id}“ folgt nicht dem Muster [A-Z]{2}\\d{2}.` })
      if (gesehen.has(r.id)) fehler.push({ regel: 'V8', ort: `Entscheidung „${t.name}“`, meldung: `Regel-ID „${r.id}“ kommt mehrfach vor.` })
      gesehen.add(r.id)
    }
  }
  return fehler
}

/** Liest und prüft das Regelwerk; gibt alle Fehler zurück, ohne zu werfen. */
export async function pruefeRegelwerk(xml: string, sha256 = ''): Promise<{ regelwerk: Regelwerk | null; fehler: Regelfehler[] }> {
  const namensraum = wurzelNamensraum(xml)
  if (namensraum !== DMN13_NAMENSRAUM) {
    return { regelwerk: null, fehler: [{ regel: 'V1', ort: 'definitions', meldung: `Namensraum „${namensraum ?? 'fehlt'}“ ist nicht DMN 1.3 (${DMN13_NAMENSRAUM}).` }] }
  }
  let wurzel: { $type: string; drgElement?: MEntscheidung[] }
  let warnungen: { message: string; error?: Error }[]
  try {
    const gelesen = await new DmnModdle().fromXML(xml)
    wurzel = gelesen.rootElement as unknown as typeof wurzel
    warnungen = gelesen.warnings
  } catch (err) {
    return { regelwerk: null, fehler: [{ regel: 'V1', ort: 'definitions', meldung: `Die Datei ist kein lesbares DMN: ${(err as Error).message}` }] }
  }
  // dmn-moddle überspringt nicht lesbare Teile nur mit Warnung; hier sind sie Fehler,
  // sonst fiele z. B. eine Regel mit doppelter ID still weg.
  const fehler: Regelfehler[] = warnungen.map((w) => {
    const doppelt = /^duplicate ID <(.+)>$/.exec(w.error?.message ?? '')
    const zeile = /line: (\d+)/.exec(w.message)?.[1]
    const ort = zeile ? `Zeile ${zeile}` : 'definitions'
    return doppelt
      ? { regel: 'V8', ort, meldung: `ID „${doppelt[1]}“ kommt mehrfach vor; das zweite Element wäre verloren.` }
      : { regel: 'V1', ort, meldung: `Nicht lesbarer Teil der Datei: ${w.message.split('\n')[0]}` }
  })
  const tabellen = (wurzel.drgElement ?? [])
    .filter((e) => e.$type === 'dmn:Decision')
    .map((e) => leseTabelle(e, fehler))
    .filter((t): t is Tabelle => t !== null)
  fehler.push(...pruefeRegelIds(tabellen), ...pruefeAbdeckung(tabellen), ...pruefeKatalog())
  return { regelwerk: fehler.length === 0 ? { tabellen, sha256 } : null, fehler }
}

/** Lädt das Regelwerk; wirft `RegelwerkFehler` mit allen Befunden, wenn eine Prüfung scheitert. */
export async function ladeRegelwerk(xml: string, sha256: string): Promise<Regelwerk> {
  const { regelwerk, fehler } = await pruefeRegelwerk(xml, sha256)
  if (!regelwerk) throw new RegelwerkFehler(fehler)
  return regelwerk
}
