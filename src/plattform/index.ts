import { browserPlattform } from './browser'
import type { Plattform } from './typen'

export type { Datei, DateiArt, MenueBefehl, Plattform, Zuletzt } from './typen'

/** Läuft die Oberfläche im Windows-Programm? Tauri legt dieses Objekt vor dem Laden der Seite an. */
export const istDesktop = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

/**
 * Bis zum Windows-Programm (Phase 6) gibt es nur die Browser-Plattform. Dann kommt
 * `desktop.ts` aus dem Prozesslotsen dazu, und hier steht wieder
 * `istDesktop ? desktopPlattform : browserPlattform`.
 */
export const plattform: Plattform = browserPlattform
