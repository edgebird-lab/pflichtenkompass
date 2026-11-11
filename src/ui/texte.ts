/** Anzeigetexte der Oberfläche für Werte aus Modell und Ergebnis. */
import { terminTitel } from '../export/ics'
import { frage } from '../modell/fragen'
import type { Bearbeitung, Rechtsform } from '../modell/typen'
import type { Termin, TerminArt } from '../regeln/typen'

/** „Umsatzsteuer-Voranmeldung – Januar 2027“ (wie im Kalender). */
export { terminTitel as terminText } from '../export/ics'

/**
 * Was der nächste Termin auf der Pflichtkarte und im Druck hinter dem Datum ergänzt: bei einem eigenen
 * Titel „: Titel – Zeitraum“, beim Titel der Pflicht nur „ (für 2027)“; sonst nichts. Vorher stand der
 * lange Titel der Pflicht dort ein zweites Mal („…: Umsatzsteuererklärung für das Kalenderjahr übermitteln – 2027“).
 */
export function terminZusatz(t: Termin, pflichtTitel: string): string {
  if (t.titel !== pflichtTitel) return `: ${terminTitel(t)}`
  return t.zeitraum ? ` (für ${t.zeitraum})` : ''
}

export function rechtsformText(r: Rechtsform): string {
  return frage('F04').optionen?.find((o) => o.wert === r)?.text ?? r
}

export const BEARBEITUNG_TEXT: Readonly<Record<Bearbeitung, string>> = {
  offen: 'offen',
  erledigt: 'erledigt',
  trifftNichtZu: 'trifft nicht zu',
}

export const TERMIN_ART_TEXT: Readonly<Record<TerminArt, string>> = {
  handlung: 'Handlung',
  abgabe: 'Abgabe',
  zahlung: 'Zahlung',
  abgabeUndZahlung: 'Abgabe und Zahlung',
}
