/**
 * Standardprofil nach den Standardwerten der Fragen (Spezifikation 5.2).
 */
import { maxDatum, minDatum, monatsErster, plusMonate } from '../fristen/datum'
import type { Datum, Profil } from './typen'

/** Zulässiger Beginn der Tätigkeit (F02); Bestandsunternehmen vor 2026 sind in 0.1 nicht vorgesehen (O15). */
export const START_FRUEHESTENS: Datum = '2026-01-01'
export const START_SPAETESTENS: Datum = '2030-12-31'
/** Plausible Daten für Beschäftigungsbeginn (F13) und Kassenanschaffung (F23); Prüfung in pruefung.ts (E26). */
export const DATUM_FRUEHESTENS: Datum = '1900-01-01'
export const DATUM_SPAETESTENS: Datum = '2099-12-31'
/** Höchstlänge des Namens (F01) und einer Notiz (6.9). */
export const NAME_MAX = 80
export const NOTIZ_MAX = 500

/** F02-Standard: der 1. des Folgemonats, begrenzt auf den zulässigen Bereich. */
export function standardStart(heute: Datum): Datum {
  return maxDatum(START_FRUEHESTENS, minDatum(START_SPAETESTENS, plusMonate(monatsErster(heute), 1)))
}

/**
 * Profil vor der ersten Antwort. Werte, deren Standard von anderen Antworten
 * abhängt (F11, F13, F17, F21, F23, F24), stehen hier für das leere Profil:
 * keine Gastronomie, keine Beschäftigten, kein Onlinehandel, keine Kasse.
 */
export function standardProfil(heute: Datum): Profil {
  return {
    name: '',
    start: standardStart(heute),
    bundesland: null,
    rechtsform: 'einzelunternehmen',
    gbrEingetragen: false,
    taetigkeit: 'gewerblich',
    kaufmaennisch: 'nein',
    steuerberater: false,
    branchen: [],
    handwerk: 'unklar',
    lebensmittel: false,
    personal: {
      vorhanden: false,
      beginn: null,
      svPflichtig: 0,
      minijobber: 0,
      minijobPauschsteuer: true,
      sofortmeldeBranche: false,
      lohnsteuerJeMonat: null,
    },
    kunden: { privatInland: true, unternehmenInland: false, privatEu: false, unternehmenEu: false },
    website: false,
    verpackungen: false,
    kasse: 'keine',
    kasseAnschaffung: null,
    bargeld: false,
    steuern: {
      umsatzErstesJahr: 0,
      gewinnErstesJahr: 0,
      kleinunternehmer: false,
      umsatz2026: null,
      ustErstesJahr: null,
      euFernverkaeufe: 0,
      dauerfristverlaengerung: false,
      vorauszahlungen: false,
    },
  }
}
