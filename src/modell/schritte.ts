/**
 * Die Schritte des Interviews und der Anzeige (Spezifikation 5.1).
 */
import type { Schritt } from './typen'

export type { Schritt }

export interface SchrittInfo {
  id: Schritt
  name: string
  /** Nummer aus 5.1 der Spezifikation; der Start hat keine Nummer in der Schrittleiste. */
  nr: number
  /** Welche Fragen der Schritt stellt, z. B. „F01–F08“; leer bei Anzeige-Schritten. */
  fragen: string
  /** Was der Schritt zeigt (5.1). */
  zeigt: string
}

export const SCHRITTE: readonly SchrittInfo[] = [
  { id: 'start', name: 'Start', nr: 0, fragen: '', zeigt: 'Zweck, Hinweis „keine Rechtsberatung“, Rechtsstand und Katalogversion.' },
  { id: 'vorhaben', name: 'Vorhaben', nr: 1, fragen: 'F01–F08', zeigt: 'Kurzinfo zu den Rechtsformen und zu „gewerblich oder freiberuflich“.' },
  { id: 'taetigkeit', name: 'Tätigkeit', nr: 2, fragen: 'F09–F11', zeigt: 'Hinweise zu den Anlagen der Handwerksordnung und zu Lebensmitteln.' },
  { id: 'personal', name: 'Personal', nr: 3, fragen: 'F12–F18', zeigt: 'Formel der Geringfügigkeitsgrenze und Liste der Bereiche mit Sofortmeldepflicht.' },
  { id: 'verkauf', name: 'Verkauf', nr: 4, fragen: 'F19–F24', zeigt: 'Hinweise zu Impressum, Verpackung und Kasse.' },
  { id: 'steuern', name: 'Umsatz und Steuern', nr: 5, fragen: 'F25–F32', zeigt: 'Warnungen zur Kleinunternehmerregelung.' },
  { id: 'ergebnis', name: 'Ergebnis', nr: 6, fragen: '', zeigt: 'Pflichtenliste mit „Warum?“, Status und nicht geprüften Bereichen.' },
  { id: 'termine', name: 'Termine', nr: 7, fragen: '', zeigt: 'Terminliste und Export als Kalenderdatei.' },
  { id: 'regeln', name: 'Regeln', nr: 8, fragen: '', zeigt: 'Entscheidungstabellen (DMN 1.3) mit den Treffern des Profils und die Quellen.' },
]
