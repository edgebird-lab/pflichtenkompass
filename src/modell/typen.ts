/**
 * Datenmodell des Pflichten-Kompasses (Spezifikation, Abschnitt 4.1–4.3 und 4.7).
 * Aufzählungen stehen als Listen da, damit Prüfung und Auswahlfelder dieselben Werte nutzen.
 */
import type { NormVerweis, PflichtId } from '../katalog/typen'

export const FORMAT_VERSION = 1 as const

/** Kalenderdatum ohne Uhrzeit, ISO 8601 („2027-01-15“). Rechnen nur über src/fristen/datum.ts. */
export type Datum = string
/** Euro-Betrag; Eingaben mit höchstens zwei Nachkommastellen. */
export type Euro = number

// 4.1 Profil (Antworten) -------------------------------------------------------

export const BUNDESLAENDER = ['BW', 'BY', 'BE', 'BB', 'HB', 'HH', 'HE', 'MV', 'NI', 'NW', 'RP', 'SL', 'SN', 'ST', 'SH', 'TH'] as const
export type Bundesland = (typeof BUNDESLAENDER)[number]

export const RECHTSFORMEN = ['einzelunternehmen', 'gbr', 'ug', 'gmbh'] as const
export type Rechtsform = (typeof RECHTSFORMEN)[number]

export const TAETIGKEITEN = ['gewerblich', 'freiberuflich'] as const
export type Taetigkeit = (typeof TAETIGKEITEN)[number]

export const JA_NEIN_UNKLAR = ['ja', 'nein', 'unklar'] as const
export type JaNeinUnklar = (typeof JA_NEIN_UNKLAR)[number]

export const BRANCHEN = ['handel', 'onlinehandel', 'handwerk', 'gastronomie', 'dienstleistung'] as const
export type Branche = (typeof BRANCHEN)[number]

export const HANDWERKE = ['keins', 'zulassungspflichtig', 'zulassungsfrei', 'handwerksaehnlich', 'unklar'] as const
export type Handwerk = (typeof HANDWERKE)[number]

export const KASSEN = ['keine', 'offeneLadenkasse', 'elektronisch'] as const
export type Kasse = (typeof KASSEN)[number]

export interface Personal {
  vorhanden: boolean // F12
  beginn: Datum | null // F13
  svPflichtig: number // F14, ganze Zahl ≥ 0
  minijobber: number // F15, ganze Zahl ≥ 0
  minijobPauschsteuer: boolean // F16
  sofortmeldeBranche: boolean // F17
  lohnsteuerJeMonat: Euro | null // F18
}

/** F19 */
export interface Kunden {
  privatInland: boolean
  unternehmenInland: boolean
  privatEu: boolean
  unternehmenEu: boolean
}

export interface Steuerangaben {
  umsatzErstesJahr: Euro // F25
  gewinnErstesJahr: Euro // F26
  kleinunternehmer: boolean // F27
  umsatz2026: Euro | null // F28
  ustErstesJahr: Euro | null // F29
  euFernverkaeufe: Euro // F30
  dauerfristverlaengerung: boolean // F31
  vorauszahlungen: boolean // F32
}

/** Antworten des Interviews. Ausgeblendete Fragen behalten ihren Standardwert und wirken nicht. */
export interface Profil {
  name: string // F01
  start: Datum // F02
  bundesland: Bundesland | null // F03, null bis zur Antwort
  rechtsform: Rechtsform // F04
  gbrEingetragen: boolean // F05
  taetigkeit: Taetigkeit // F06
  kaufmaennisch: JaNeinUnklar // F07
  steuerberater: boolean // F08
  branchen: Branche[] // F09, mindestens eine
  handwerk: Handwerk // F10
  lebensmittel: boolean // F11
  personal: Personal // F12–F18
  kunden: Kunden // F19
  website: boolean // F20
  verpackungen: boolean // F21
  kasse: Kasse // F22
  kasseAnschaffung: Datum | null // F23
  bargeld: boolean // F24
  steuern: Steuerangaben // F25–F32
}

// 4.2 Interview ----------------------------------------------------------------

export type Schritt = 'start' | 'vorhaben' | 'taetigkeit' | 'personal' | 'verkauf' | 'steuern' | 'ergebnis' | 'termine' | 'regeln'

export const FRAGE_IDS = [
  'F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'F08',
  'F09', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16',
  'F17', 'F18', 'F19', 'F20', 'F21', 'F22', 'F23', 'F24',
  'F25', 'F26', 'F27', 'F28', 'F29', 'F30', 'F31', 'F32',
] as const
export type FrageId = (typeof FRAGE_IDS)[number]

export type FrageTyp = 'text' | 'datum' | 'auswahl' | 'mehrfach' | 'janein' | 'zahl' | 'betrag'

export interface Frage {
  id: FrageId
  schritt: Schritt
  text: string
  hilfe: string
  normen: readonly NormVerweis[]
  typ: FrageTyp
  optionen?: readonly { wert: string; text: string }[]
  pflicht: boolean
  /** Sichtbarkeit; reine Funktion des Profils, getestet. */
  sichtbar: (p: Profil) => boolean
  /** Sichtbarkeit als Text für den Fragenkatalog, z. B. „F04 = GbR“ (Ergänzung zur Spezifikation). */
  sichtbarText: string
  /** Standardwert als Text für den Fragenkatalog (Ergänzung zur Spezifikation). */
  standardText: string
}

// 4.3 Merkmale (Eingaben der DMN-Tabellen) ---------------------------------------

/** Aus dem Profil abgeleitet (src/modell/merkmale.ts). Nie null: Ableitung setzt Standardwerte. */
export interface Merkmale {
  rechtsform: Rechtsform
  taetigkeit: Taetigkeit
  kaufmaennisch: JaNeinUnklar
  kaufmann: boolean
  personengesellschaftEingetragen: boolean
  handwerk: Handwerk
  handel: boolean
  onlinehandel: boolean
  gastronomie: boolean
  lebensmittel: boolean
  beschaeftigte: number
  minijobber: number
  lohnsteuerabzug: boolean
  sofortmeldeBranche: boolean
  kundenPrivat: boolean
  kundenUnternehmen: boolean
  kundenPrivatEu: boolean
  kundenUnternehmenEu: boolean
  website: boolean
  verpackungen: boolean
  kasse: Kasse
  bargeld: boolean
  kleinunternehmer: boolean
  hgbBefreit: boolean
  ao141Grenze: boolean
  umsatzErstesJahr: Euro
}
export type MerkmalName = keyof Merkmale
export type MerkmalTyp = 'string' | 'number' | 'boolean'

export interface MerkmalInfo {
  name: MerkmalName
  typ: MerkmalTyp
  label: string
  /** Fragen, aus denen das Merkmal entsteht; für „Warum?“. */
  fragen: readonly FrageId[]
  /** Erlaubte Werte bei Typ string; müssen den inputValues der DMN-Datei entsprechen. */
  erlaubt?: readonly string[]
  /** Anzeige der Zahl als Euro-Betrag (Ergänzung zur Spezifikation). */
  einheit?: 'euro'
}

// 4.7 Projektdatei und Einstellungen ---------------------------------------------

export const BEARBEITUNGEN = ['offen', 'erledigt', 'trifftNichtZu'] as const
export type Bearbeitung = (typeof BEARBEITUNGEN)[number]
export interface PflichtStatus {
  bearbeitung: Bearbeitung
  notiz: string
  geaendertAm: Datum
}

export interface Projekt {
  formatVersion: typeof FORMAT_VERSION
  app: 'pflichtenkompass'
  profil: Profil
  status: Partial<Record<PflichtId, PflichtStatus>>
  /**
   * Stand beim letzten Speichern; Grundlage des Änderungshinweises. Die IDs sind Text,
   * weil eine Datei aus einer anderen Katalogversion Pflichten nennen kann, die es nicht mehr gibt.
   */
  gespeichert: { katalogVersion: string; am: Datum; pflichten: readonly { id: string; stand: Datum }[] } | null
}

export interface Einstellungen {
  thema: 'system' | 'hell' | 'dunkel'
  horizontMonate: 12 | 24 // Standard 24
  erinnerungTage: 0 | 1 | 3 | 7 | 14 // Standard 7; 0 = keine Erinnerung
  vergangeneExportieren: boolean // Standard false
}

export interface Beispiel {
  id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  titel: string
  profil: Profil
}
