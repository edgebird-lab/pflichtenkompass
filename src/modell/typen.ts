/**
 * Datenmodell des Pflichten-Kompasses (Spezifikation, Abschnitt 4).
 * Wird in Schritt 1.1 vervollständigt.
 */

export const FORMAT_VERSION = 1 as const

/** Kalenderdatum ohne Uhrzeit, ISO 8601 („2027-01-15“). Rechnen nur über src/fristen/datum.ts. */
export type Datum = string
/** Euro-Betrag; Eingaben mit höchstens zwei Nachkommastellen. */
export type Euro = number

export type Schritt = 'start' | 'vorhaben' | 'taetigkeit' | 'personal' | 'verkauf' | 'steuern' | 'ergebnis' | 'termine' | 'regeln'

export interface Einstellungen {
  thema: 'system' | 'hell' | 'dunkel'
  horizontMonate: 12 | 24 // Standard 24
  erinnerungTage: 0 | 1 | 3 | 7 | 14 // Standard 7; 0 = keine Erinnerung
  vergangeneExportieren: boolean // Standard false
}
