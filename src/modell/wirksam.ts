/**
 * Antworten, wie sie für Fristen und Termine wirken (Spezifikation 5.2 und 6.8):
 * Ausgeblendete Fragen zählen nicht, leere Daten fallen auf ihren Standard zurück
 * (F13 und F23 „= F02“). Die Merkmale der Regeln entstehen getrennt in merkmale.ts.
 */
import { frage } from './fragen'
import type { Datum, Euro, FrageId, Profil } from './typen'

export interface WirksameAntworten {
  /** F13, sonst F02; null ohne Beschäftigte (F12 = nein). */
  beschaeftigungsbeginn: Datum | null
  /** F23, sonst F02; null ohne elektronische Kasse. */
  kassenanschaffung: Datum | null
  /** F18; null, wenn leer oder ausgeblendet. */
  lohnsteuerJeMonat: Euro | null
  /** F28; null, wenn leer oder ausgeblendet. */
  umsatz2026: Euro | null
  /** F29; null, wenn leer oder ausgeblendet. */
  ustErstesJahr: Euro | null
  /** F30; 0, wenn ausgeblendet. */
  euFernverkaeufe: Euro
  /** F31 */
  dauerfristverlaengerung: boolean
  /** F32 */
  vorauszahlungen: boolean
  /** F08 */
  steuerberater: boolean
}

export function wirksam(p: Profil): WirksameAntworten {
  const sichtbar = (id: FrageId) => frage(id).sichtbar(p)
  const st = p.steuern
  return {
    beschaeftigungsbeginn: sichtbar('F13') ? (p.personal.beginn ?? p.start) : null,
    kassenanschaffung: sichtbar('F23') ? (p.kasseAnschaffung ?? p.start) : null,
    lohnsteuerJeMonat: sichtbar('F18') ? p.personal.lohnsteuerJeMonat : null,
    umsatz2026: sichtbar('F28') ? st.umsatz2026 : null,
    ustErstesJahr: sichtbar('F29') ? st.ustErstesJahr : null,
    euFernverkaeufe: sichtbar('F30') ? st.euFernverkaeufe : 0,
    dauerfristverlaengerung: sichtbar('F31') && st.dauerfristverlaengerung,
    vorauszahlungen: sichtbar('F32') && st.vorauszahlungen,
    steuerberater: p.steuerberater,
  }
}
