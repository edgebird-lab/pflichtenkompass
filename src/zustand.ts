/**
 * Zustand der Oberfläche als reiner Reducer (wie im Prozesslotsen). Das Projekt
 * (Profil, Status, gespeicherter Stand) wird im Browser gespeichert; Schritt,
 * Vergleichsergebnis und Änderungshinweis leben nur im Speicher.
 */
import type { PflichtId } from './katalog/typen'
import { setzeAntwort, type Antwort } from './modell/antworten'
import type { Schritt } from './modell/schritte'
import type { Datum, FrageId, PflichtStatus, Profil, Projekt } from './modell/typen'
import type { Ergebnis } from './regeln/typen'

export { SCHRITTE, type Schritt, type SchrittInfo } from './modell/schritte'

export interface Zustand {
  projekt: Projekt
  schritt: Schritt
  /**
   * Ergebnis beim letzten Verlassen des Ergebnisses: Pflichten, die seitdem dazugekommen sind,
   * tragen „neu“, entfallene erscheinen einmal als Hinweis (5.3, Entscheidung E14).
   */
  vorher: Ergebnis | null
  /** Name der zuletzt geöffneten Datei, solange ihr Änderungshinweis zu sehen ist (4.8). */
  geoeffnet: string | null
  /**
   * Nach „Lokale Daten löschen“ bis zur nächsten Eingabe aus, damit der Speicher leer bleibt (8);
   * ebenso nach dem Start mit einem unlesbaren Stand, damit er nicht ungefragt überschrieben wird.
   */
  speichern: boolean
  /** Warum der Stand im Browser beim Start nicht lesbar war; null ab der ersten Eingabe (Hinweis in der Oberfläche). */
  unlesbar: string | null
  /** Zählt Laden, Neubeginn und Löschen; Schlüssel der Formulare, damit Eingabefelder neu anfangen. */
  version: number
}

export type Aktion =
  | { typ: 'profil'; profil: Profil }
  /** Antwort mit den abhängigen Standardwerten aus 5.2 (modell/antworten.ts). */
  | { typ: 'antwort'; frage: FrageId; wert: Antwort }
  /** Status oder Notiz einer Pflicht; `heute` wird als Änderungsdatum eingetragen. */
  | { typ: 'status'; id: PflichtId; teil: Partial<Omit<PflichtStatus, 'geaendertAm'>>; heute: Datum }
  | { typ: 'laden'; projekt: Projekt; schritt: Schritt; datei?: string }
  | { typ: 'geloescht'; projekt: Projekt }
  | { typ: 'gespeichert'; gespeichert: Projekt['gespeichert'] }
  | { typ: 'schritt'; schritt: Schritt; ergebnis: Ergebnis | null }
  | { typ: 'hinweisGelesen' }

/**
 * Zustand beim Start. `unlesbar` nennt den Grund, wenn der Stand im Browser nicht gelesen werden konnte;
 * dann speichert die App erst nach der nächsten Eingabe (sonst wäre der alte Stand nach 500 ms überschrieben).
 */
export function startZustand(projekt: Projekt, schritt: Schritt = 'start', unlesbar: string | null = null): Zustand {
  return { projekt, schritt, vorher: null, geoeffnet: null, speichern: unlesbar === null, unlesbar, version: 0 }
}

export function reduziere(z: Zustand, a: Aktion): Zustand {
  switch (a.typ) {
    case 'profil':
      return { ...z, projekt: { ...z.projekt, profil: a.profil }, speichern: true, unlesbar: null }
    case 'antwort':
      return { ...z, projekt: { ...z.projekt, profil: setzeAntwort(z.projekt.profil, a.frage, a.wert) }, speichern: true, unlesbar: null }
    case 'status': {
      const alt: PflichtStatus = z.projekt.status[a.id] ?? { bearbeitung: 'offen', notiz: '', geaendertAm: a.heute }
      const neu: PflichtStatus = { ...alt, ...a.teil, geaendertAm: a.heute }
      return { ...z, projekt: { ...z.projekt, status: { ...z.projekt.status, [a.id]: neu } }, speichern: true, unlesbar: null }
    }
    case 'laden':
      return { projekt: a.projekt, schritt: a.schritt, vorher: null, geoeffnet: a.datei ?? null, speichern: true, unlesbar: null, version: z.version + 1 }
    case 'geloescht':
      return { projekt: a.projekt, schritt: 'start', vorher: null, geoeffnet: null, speichern: false, unlesbar: null, version: z.version + 1 }
    case 'gespeichert':
      return { ...z, projekt: { ...z.projekt, gespeichert: a.gespeichert } }
    case 'schritt': {
      // Wer das Ergebnis verlässt, hat es gesehen: Vergleichsgrundlage für „neu“ beim nächsten Besuch
      const verlaesst = z.schritt === 'ergebnis' && a.schritt !== 'ergebnis'
      return { ...z, schritt: a.schritt, vorher: verlaesst && a.ergebnis ? a.ergebnis : z.vorher }
    }
    case 'hinweisGelesen':
      return { ...z, geoeffnet: null }
  }
}
