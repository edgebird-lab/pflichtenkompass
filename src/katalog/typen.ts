/**
 * Katalog der Pflichten (Spezifikation, Abschnitt 4.4). Die Inhalte stehen in
 * pflichten.ts, luecken.ts und quellen.ts.
 */
import type { Datum } from '../modell/typen'

/** In der Reihenfolge der Katalognummern 1–40 (6.6). */
export const PFLICHT_IDS = [
  'gewerbeanzeige', 'steuerlicheErfassung', 'handelsregister', 'handelsregisterGmbh',
  'transparenzregister', 'handwerksrolle', 'handwerkAnzeige', 'berufsgenossenschaft',
  'betriebsnummer', 'svAnmeldung', 'sofortmeldung', 'beitragsnachweis',
  'lohnunterlagen', 'lohnsteuer', 'arbeitszeitMinijob', 'infektionsschutz',
  'ustVoranmeldung', 'ustJahreserklaerung', 'kleinunternehmerGrenzen', 'rechnungen',
  'eRechnungEmpfang', 'eRechnungAusstellen', 'zusammenfassendeMeldung', 'euFernverkauf',
  'einkommensteuererklaerung', 'feststellungserklaerung', 'eBilanz', 'estVorauszahlungen',
  'aufbewahrung', 'buchfuehrungHgb', 'buchfuehrungAo141', 'kassenfuehrung',
  'elektronischeKasse', 'jahresabschluss', 'offenlegung', 'ugRuecklage',
  'geschaeftsbriefe', 'impressum', 'verpackung', 'verpackungDatenmeldung',
] as const
export type PflichtId = (typeof PFLICHT_IDS)[number]

/** In der Reihenfolge der Nummern 1–17 (6.7). */
export const LUECKE_IDS = [
  'gewerbesteuer', 'koerperschaftsteuer', 'gastronomieLandesrecht', 'lebensmittelrecht',
  'fernabsatz', 'datenschutz', 'arbeitsrecht', 'gewerberechtSonstiges',
  'kuenstlersozialabgabe', 'rundfunkbeitrag', 'elektroBatterien', 'euKleinunternehmer',
  'freiberuflicheKapitalgesellschaft', 'kaufmannUnklar', 'handwerkUnklar',
  'kleinunternehmerGruendungsjahr', 'geschaeftsfuehrung',
] as const
export type LueckeId = (typeof LUECKE_IDS)[number]

export type Gruppe = 'gruendung' | 'personal' | 'steuern' | 'buchfuehrung' | 'online'
export type Zeitpunkt = 'vorStart' | 'ersteWochen' | 'laufend' | 'jaehrlich'

export const GESETZE = ['AO', 'UStG', 'UStDV', 'EStG', 'HGB', 'GmbHG', 'GewO', 'HwO', 'SGB IV', 'SGB VII', 'DDG', 'VerpackDG', 'MiLoG', 'GwG', 'IfSG'] as const
export type Gesetz = (typeof GESETZE)[number]

/**
 * Beispiel: { gesetz: 'AO', paragraf: '138', detail: 'Abs. 1b, 4' } → Link …/ao_1977/__138.html.
 * `bezug` (Ergänzung zur Spezifikation) nennt, wofür die Norm gilt, z. B. „UG/GmbH“ → „UG/GmbH: § 137 AO“.
 */
export interface NormVerweis {
  gesetz: Gesetz
  paragraf: string
  detail?: string
  bezug?: string
}

export const QUELLE_IDS = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12', 'Q13', 'Q14', 'Q15', 'Q16', 'Q17'] as const
export type QuelleId = (typeof QUELLE_IDS)[number]
export interface Quelle {
  id: QuelleId
  titel: string
  url: string
  abgerufen: Datum
  stand: string
}

export type Ereignis = 'start' | 'beschaeftigung' | 'kassenanschaffung'
export type Berechnung =
  | 'ustVoranmeldung'
  | 'sondervorauszahlung'
  | 'lohnsteuer'
  | 'lohnsteuerbescheinigung'
  | 'svBeitrag'
  | 'zusammenfassendeMeldung'
  | 'oss'
  | 'steuererklaerung'
  | 'estVorauszahlungen'
  | 'jahresabschluss'
  | 'offenlegung'
  | 'eRechnungAb'
  | 'ifsgBescheinigung'
  | 'ifsgBelehrung'
  | 'verpackungUebergang'
  | 'verpackungDatenmeldung'

export type FristRegel =
  | { art: 'bisEreignis'; ereignis: Ereignis }
  | { art: 'unverzueglich'; ereignis: Ereignis }
  | { art: 'nachEreignis'; ereignis: Ereignis; monate: number; tage: number; ao108: boolean }
  | { art: 'berechnet'; berechnung: Berechnung }
  | { art: 'laufend' }
  | { art: 'ohneFesteFrist' }

export interface Pflicht {
  id: PflichtId
  nr: number // Reihenfolge im Katalog (1–40)
  titel: string // Handlung, höchstens 60 Zeichen
  kurz: string // 1–2 Sätze
  gruppe: Gruppe
  zeitpunkt: Zeitpunkt
  stelle: string
  weg: string | null // z. B. „elektronisch (ELSTER)“
  fristen: readonly FristRegel[]
  fristText: string
  normen: readonly NormVerweis[]
  quellen: readonly QuelleId[] // mindestens eine aus Q1–Q15
  stand: Datum // Datum der letzten fachlichen Prüfung
  gueltigAb: Datum | null
  gueltigBis: Datum | null
  hinweise: readonly string[]
}

export interface Luecke {
  id: LueckeId
  nr: number
  art: 'nichtGeprueft' | 'pruefen'
  titel: string
  text: string
}

export const KATALOG_VERSION = '2026.11.0'
export const KATALOG_STAND: Datum = '2026-11-11'
