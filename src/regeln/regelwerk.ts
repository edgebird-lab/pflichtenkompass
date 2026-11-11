/**
 * Das mitgelieferte Regelwerk: regeln/pflichten.dmn mit dem Prüfwert aus
 * regeln/stand.json zur Anzeige (5.5). Die App lädt nur diese Datei; fremde
 * DMN-Dateien werden in 0.1 nicht geladen (Abschnitt 8).
 */
import xml from '../../regeln/pflichten.dmn?raw'
import stand from '../../regeln/stand.json'
import { ladeRegelwerk } from './dmn'
import type { RegelnStand } from './pruefung'
import type { Regelwerk } from './typen'

export const REGELN_XML: string = xml
export const REGELN_STAND: RegelnStand = stand

export function ladeMitgeliefertesRegelwerk(): Promise<Regelwerk> {
  return ladeRegelwerk(REGELN_XML, REGELN_STAND.sha256['pflichten.dmn'])
}
