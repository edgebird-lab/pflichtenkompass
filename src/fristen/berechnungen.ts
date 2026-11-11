/**
 * Berechnungen der Spezifikation 6.8.4–6.8.12: Voranmeldungs- und Anmeldungszeiträume,
 * SV-Fälligkeit, E-Rechnungspflicht, Aufbewahrung, Kleinunternehmerprüfung und
 * Geringfügigkeitsgrenze. Reine Funktionen; `heute` braucht keine von ihnen.
 */
import { betragText } from '../modell/format'
import { KLEINUNTERNEHMER_LAUFEND, KLEINUNTERNEHMER_VORJAHR, merkmale } from '../modell/merkmale'
import type { Bundesland, Datum, Euro, Profil } from '../modell/typen'
import { wirksam } from '../modell/wirksam'
import { datum, jahrVon, plusMonate, zerlege } from './datum'
import { arbeitstagVomMonatsende, arbeitstageVor } from './feiertage'

// 6.8.4 Umsatzsteuer-Voranmeldung --------------------------------------------------

export type UstZeitraum = 'monat' | 'quartal' | 'keine'

/** § 18 Abs. 2 UStG: monatlich über 9.000 € Steuer, Befreiung möglich bis 2.000 €. */
export const UST_MONATLICH_UEBER = 9_000
export const UST_BEFREIUNG_BIS = 2_000

export const HINWEIS_UST_BEFREIUNG = `Bei höchstens ${betragText(UST_BEFREIUNG_BIS)} Steuer ist eine Befreiung durch das Finanzamt möglich (§ 18 Abs. 2 UStG).`
export const HINWEIS_UST_O4 =
  'Prüfhinweis: Die Ausnahme in § 18 Abs. 2 Satz 6 UStG gilt nach ihrem Wortlaut nur bis 2026. Die App rechnet für 2027 deshalb mit dem Kalendermonat (§ 18 Abs. 2 Satz 4 UStG); ob die Ausnahme verlängert wird, ist nicht geprüft.'
export const HINWEIS_UST_VORJAHR =
  'Vorjahreswert fehlt: Ab dem dritten Jahr richtet sich der Zeitraum nach der Steuer des Vorjahres (§ 18 Abs. 2 UStG). Die App rechnet vorsichtig mit dem Kalendermonat.'

/** Voranmeldungszeitraum eines Kalenderjahres nach 6.8.4. */
export function ustZeitraum(jahr: number, p: Profil): { zeitraum: UstZeitraum; hinweis: string | null } {
  if (merkmale(p).kleinunternehmer) return { zeitraum: 'keine', hinweis: null }
  const gj = jahrVon(p.start)
  if (jahr < gj) return { zeitraum: 'keine', hinweis: null }
  if (jahr === gj && gj === 2026) {
    // § 18 Abs. 2 Satz 6 UStG: voraussichtliche Steuer des Gründungsjahres (F29); ohne Angabe vorsichtig monatlich
    const ust = wirksam(p).ustErstesJahr
    if (ust === null || ust > UST_MONATLICH_UEBER) return { zeitraum: 'monat', hinweis: null }
    return { zeitraum: 'quartal', hinweis: ust <= UST_BEFREIUNG_BIS ? HINWEIS_UST_BEFREIUNG : null }
  }
  if (jahr === gj || jahr === gj + 1) return { zeitraum: 'monat', hinweis: gj === 2026 ? HINWEIS_UST_O4 : null }
  return { zeitraum: 'monat', hinweis: HINWEIS_UST_VORJAHR }
}

/** 10. Tag nach Ablauf des Zeitraums (§ 18 Abs. 1 UStG); mit Dauerfristverlängerung einen Monat später (§ 46 UStDV). */
export function ustFaelligkeit(zeitraumEnde: Datum, dauerfrist: boolean): Datum {
  const { jahr, monat } = zerlege(zeitraumEnde)
  return plusMonate(datum(jahr, monat, 10), dauerfrist ? 2 : 1)
}

// 6.8.5 Lohnsteuer --------------------------------------------------------------------

export type LstZeitraum = 'monat' | 'quartal' | 'jahr'

/** § 41a Abs. 2 EStG: Monat über 5.000 €, Quartal über 1.080 €, sonst Kalenderjahr. */
export const LST_MONATLICH_UEBER = 5_000
export const LST_QUARTAL_UEBER = 1_080

export const HINWEIS_LST_LEER = 'Ohne Angabe der Lohnsteuer (Frage 18) rechnet die App vorsichtig mit monatlicher Anmeldung.'
export const HINWEIS_LST_SCHAETZUNG =
  'Schätzung: Maßgeblich ist die Lohnsteuer des Vorjahres, umgerechnet auf einen Jahresbetrag (§ 41a Abs. 2 Satz 3 EStG). Die App schätzt sie aus Frage 18 × 12; wie umzurechnen ist, ist nicht geprüft.'
export const HINWEIS_LST_VORJAHR =
  'Vorjahreswert fehlt: Der Zeitraum richtet sich nach der Lohnsteuer des Vorjahres (§ 41a Abs. 2 EStG). Die App rechnet vorsichtig mit monatlicher Anmeldung.'

/** Zeitraum aus der Jahreslohnsteuer; ohne Basis vorsichtig monatlich. */
export function lstZeitraumAusBasis(basis: Euro | null): LstZeitraum {
  if (basis === null || basis > LST_MONATLICH_UEBER) return 'monat'
  return basis > LST_QUARTAL_UEBER ? 'quartal' : 'jahr'
}

/** Anmeldungszeitraum eines Kalenderjahres nach 6.8.5; EJ ist das Jahr des Beschäftigungsbeginns. */
export function lstZeitraum(jahr: number, p: Profil): { zeitraum: LstZeitraum; basis: Euro | null; hinweis: string | null } {
  const w = wirksam(p)
  const ej = jahrVon(w.beschaeftigungsbeginn ?? p.start)
  const monatlich = w.lohnsteuerJeMonat
  if (jahr === ej || jahr === ej + 1) {
    if (monatlich === null) return { zeitraum: 'monat', basis: null, hinweis: HINWEIS_LST_LEER }
    const basis = Math.round(monatlich * 12 * 100) / 100
    return { zeitraum: lstZeitraumAusBasis(basis), basis, hinweis: jahr === ej ? null : HINWEIS_LST_SCHAETZUNG }
  }
  return { zeitraum: 'monat', basis: null, hinweis: HINWEIS_LST_VORJAHR }
}

// 6.8.6 Sozialversicherungsbeiträge ------------------------------------------------------

/**
 * Fälligkeit am drittletzten Bankarbeitstag des Monats (§ 23 Abs. 1 SGB IV), Nachweis zwei
 * Arbeitstage vorher (§ 28f Abs. 3 SGB IV), Termin einen Arbeitstag vor dem Nachweistag (O9).
 */
export function svFaelligkeit(jahr: number, monat: number, land: Bundesland): { faellig: Datum; nachweis: Datum; termin: Datum } {
  const faellig = arbeitstagVomMonatsende(jahr, monat, 3, land)
  const nachweis = arbeitstageVor(faellig, 2, land)
  return { faellig, nachweis, termin: arbeitstageVor(nachweis, 1, land) }
}

// 6.8.9 E-Rechnungspflicht ab -------------------------------------------------------------

/** § 27 Abs. 38 UStG: Übergang bis 31.12.2026, bei höchstens 800.000 € Vorjahresumsatz bis 31.12.2027. */
export const ERECHNUNG_UMSATZGRENZE = 800_000

export function eRechnungAb(p: Profil): Datum {
  if (p.start >= '2028-01-01') return p.start
  const umsatz2026 = wirksam(p).umsatz2026
  if (p.start <= '2026-12-31' && umsatz2026 === null) return '2027-01-01'
  return umsatz2026 !== null && umsatz2026 > ERECHNUNG_UMSATZGRENZE ? '2027-01-01' : '2028-01-01'
}

// 6.8.10 Aufbewahrung bis -------------------------------------------------------------------

export type AufbewahrungsArt = 'buecher' | 'belege' | 'briefe'

/** § 147 Abs. 3 AO: 10, 8 oder 6 Jahre ab dem Ende des Kalenderjahres (Abs. 4). */
export const AUFBEWAHRUNG: readonly { art: AufbewahrungsArt; jahre: number; text: string }[] = [
  { art: 'buecher', jahre: 10, text: 'Bücher, Inventare, Abschlüsse, Organisationsunterlagen' },
  { art: 'belege', jahre: 8, text: 'Buchungsbelege, Rechnungen' },
  { art: 'briefe', jahre: 6, text: 'Geschäftsbriefe, sonstige Unterlagen' },
]

/** 31.12. des Jahres + 10, 8 oder 6; `jahr` ist das Jahr der letzten Eintragung, Aufstellung, Absendung oder Entstehung. */
export function aufbewahrenBis(art: AufbewahrungsArt, jahr: number): Datum {
  const eintrag = AUFBEWAHRUNG.find((a) => a.art === art)
  if (!eintrag) throw new Error(`Unbekannte Art ${art}`)
  return datum(jahr + eintrag.jahre, 12, 31)
}

// 6.8.11 Geringfügigkeitsgrenze -----------------------------------------------------------

/** § 8 Abs. 1a SGB IV: Mindestlohn × 130 / 3, auf volle Euro aufgerundet; ganzzahlig in Cent gerechnet. */
export function geringfuegigkeitsgrenze(mindestlohnCent: number): number {
  if (!Number.isInteger(mindestlohnCent) || mindestlohnCent <= 0) throw new Error(`Mindestlohn in ganzen Cent erwartet: ${mindestlohnCent}`)
  const zaehler = mindestlohnCent * 130
  return Math.floor((zaehler + 299) / 300)
}

// 6.8.12 Kleinunternehmerprüfung ------------------------------------------------------------

export type KleinunternehmerStatus = 'moeglich' | 'pruefen' | 'nichtMoeglich'

/** § 19 Abs. 1 UStG: Vorjahr höchstens 25.000 €, laufendes Jahr höchstens 100.000 €; Gründungsjahr offen (O3). */
export function kleinunternehmerStatus(a: { gruendungsjahr: boolean; vorjahr: Euro | null; laufend: Euro }): KleinunternehmerStatus {
  if (a.laufend > KLEINUNTERNEHMER_LAUFEND) return 'nichtMoeglich'
  if (!a.gruendungsjahr && a.vorjahr !== null && a.vorjahr > KLEINUNTERNEHMER_VORJAHR) return 'nichtMoeglich'
  if (a.gruendungsjahr && a.laufend > KLEINUNTERNEHMER_VORJAHR) return 'pruefen'
  return 'moeglich'
}
