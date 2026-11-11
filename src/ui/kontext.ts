import { createContext, useContext, type Dispatch } from 'react'
import type { PflichtId } from '../katalog/typen'
import type { Antwort } from '../modell/antworten'
import type { Pruefergebnis } from '../modell/pruefung'
import type { Datum, Einstellungen, FrageId, PflichtStatus } from '../modell/typen'
import type { Ergebnis, Regelwerk } from '../regeln/typen'
import type { Aktion, Schritt, Zustand } from '../zustand'
import type { DateiBefehle } from './datei'

export interface AppApi {
  z: Zustand
  dispatch: Dispatch<Aktion>
  /** Heutiges Datum in Ortszeit, einmal beim Start bestimmt; die Fachlogik bekommt es übergeben. */
  heute: Datum
  einstellungen: Einstellungen
  setzeEinstellungen: (teil: Partial<Einstellungen>) => void
  /** Das mitgelieferte Regelwerk; null, solange es lädt oder wenn es nicht geladen werden konnte. */
  regelwerk: Regelwerk | null
  /** Meldung, wenn das Regelwerk nicht geladen werden konnte (Prüfung V1–V11). */
  regelFehler: string | null
  /** Eingabeprüfungen nach 6.9 für das aktuelle Profil. */
  pruefung: Pruefergebnis
  /** Ergebnis der Auswertung; null, solange Pflichtangaben fehlen oder ein Fehler vorliegt. */
  ergebnis: Ergebnis | null
  /** Antwort setzen, mit den abhängigen Standardwerten aus 5.2. */
  aendere: (frage: FrageId, wert: Antwort) => void
  setzeStatus: (id: PflichtId, teil: Partial<Omit<PflichtStatus, 'geaendertAm'>>) => void
  geheZu: (schritt: Schritt) => void
  /** Kurze Statusmeldung in der Kopfzeile */
  melde: (text: string) => void
  datei: DateiBefehle
}

export const AppKontext = createContext<AppApi | null>(null)

export function useApp(): AppApi {
  const api = useContext(AppKontext)
  if (!api) throw new Error('useApp außerhalb von AppKontext')
  return api
}
