import { ladeHerunter } from '../ui/hilfen'
import type { DateiArt, Plattform } from './typen'

/** MIME-Typen nach Abschnitt 7.4 und 7.5 der Spezifikation; die Beratungsakte ist schlichtes JSON. */
const MIME: Record<DateiArt, string> = {
  projekt: 'application/vnd.pflichtenkompass+json',
  kalender: 'text/calendar',
  beratungsakte: 'application/json',
}

/**
 * Browser: Öffnen läuft über das Dateifeld der Oberfläche, Speichern über
 * einen Download. Das Projekt liegt zusätzlich im Browserspeicher, deshalb
 * fragt der Browser beim Schließen nicht nach.
 */
export const browserPlattform: Plattform = {
  desktop: false,
  oeffnen: async () => null,
  startDatei: async () => null,
  speichern: async () => {
    throw new Error('Im Browser gibt es kein Speichern an einen Pfad.')
  },
  speichernUnter: async (vorschlag, inhalt, art) => {
    ladeHerunter(vorschlag, inhalt, MIME[art])
    return { pfad: null, name: vorschlag }
  },
  setzeTitel: (titel) => {
    document.title = titel
  },
  beiDatei: () => () => {},
  beiDateiFehler: () => () => {},
  beimSchliessen: () => () => {},
  beiMenue: () => () => {},
  externeLinks: () => () => {},
  alsPdf: async () => null,
}
