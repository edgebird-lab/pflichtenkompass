/**
 * Regelwerk, FEEL-Teilmenge und Ergebnis (Spezifikation, Abschnitte 4.5 und 4.6).
 */
import type { Luecke, Pflicht, PflichtId } from '../katalog/typen'
import type { Datum, FrageId, MerkmalName, MerkmalTyp } from '../modell/typen'

// 4.5 Regelwerk und FEEL -------------------------------------------------------

export type Literal = string | number | boolean

export type EinfacherTest =
  | { art: 'gleich'; wert: Literal }
  | { art: 'vergleich'; op: '<' | '<=' | '>' | '>='; wert: number }
  | { art: 'intervall'; von: number; bis: number; vonOffen: boolean; bisOffen: boolean }

export type UnaerTest =
  | { art: 'beliebig' } // „-“
  | { art: 'liste'; negiert: boolean; tests: EinfacherTest[] } // „a, b“ oder „not(a, b)“

export interface Eingabe {
  id: string
  label: string
  merkmal: MerkmalName
  typ: MerkmalTyp
  erlaubt: readonly Literal[] | null
}

export interface Regel {
  id: string // DMN-rule-id, z. B. „GR03“
  eintraege: readonly { text: string; test: UnaerTest }[]
  ausgabe: string // PflichtId oder LueckeId
  begruendung: string // Regelannotation „Begründung“
}

export interface Tabelle {
  id: string // DMN-decision-id
  name: string
  ausgabe: 'pflicht' | 'luecke'
  eingaben: readonly Eingabe[]
  regeln: readonly Regel[]
}

export interface Regelwerk {
  tabellen: readonly Tabelle[]
  sha256: string
}

export interface Regelfehler {
  regel: 'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6' | 'V7' | 'V8' | 'V9' | 'V10' | 'V11' | 'V12'
  ort: string
  meldung: string
}

// 4.6 Ergebnis und Termine -----------------------------------------------------

export type TerminArt = 'handlung' | 'abgabe' | 'zahlung' | 'abgabeUndZahlung'

export interface Termin {
  pflichtId: PflichtId
  /** Handlung ohne Zeitraum, z. B. „Umsatzsteuer-Voranmeldung“; Anzeige und Kalender setzen „Titel – Zeitraum“ zusammen (Entscheidung E10). */
  titel: string
  /** Konservatives Datum für Liste und Kalender; nie später als das gesetzliche Fristende. */
  faelligAm: Datum
  /** Späteres gesetzliches Fristende, falls abweichend (§ 108 Abs. 3 AO oder Nachweistag der SV, 6.8.6); sonst null. */
  gesetzlichBis: Datum | null
  zeitraum: string | null // „Januar 2027“, „1. Quartal 2027“, „2027“
  art: TerminArt
  hinweis: string | null
  /**
   * Eindeutig je Pflicht, z. B. „2027-01“, „2027-Q1“ oder „sondervorauszahlung-2027“; Teil der
   * Kalender-UID (7.5: „zeitraumschlüssel oder datum“). Ergänzung zur Spezifikation (Entscheidung E10).
   */
  schluessel: string
}

export interface Bedingung {
  merkmal: MerkmalName
  label: string
  eintrag: string // FEEL-Text, z. B. „> 0“
  wert: Literal
  fragen: readonly FrageId[]
}

export interface Treffer {
  tabelle: string
  regel: string
  begruendung: string
  bedingungen: readonly Bedingung[]
}
export interface PflichtErgebnis {
  pflicht: Pflicht
  treffer: readonly Treffer[]
  termine: readonly Termin[]
  neu: boolean
  /** Wie die App die Termine rechnet, z. B. „2027: monatlich“ (Ergänzung zur Spezifikation, Entscheidung E10). */
  rechenweg: readonly string[]
}
export interface LueckenErgebnis {
  luecke: Luecke
  treffer: readonly Treffer[]
}

export interface Ergebnis {
  katalogVersion: string
  stand: Datum
  berechnetAm: Datum
  horizont: { von: Datum; bis: Datum }
  pflichten: readonly PflichtErgebnis[]
  luecken: readonly LueckenErgebnis[]
  warnungen: readonly string[]
}
