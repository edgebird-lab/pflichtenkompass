/**
 * Speichern im Browser. Jeder Zugriff auf `localStorage` steht in try/catch,
 * weil der Speicher in privaten Fenstern fehlen oder gesperrt sein kann.
 * Projektdateien folgen in Schritt 1.5.
 */
import type { Einstellungen } from './typen'

export const PROJEKT_SCHLUESSEL = 'pflichtenkompass:projekt'
export const EINSTELLUNGEN_SCHLUESSEL = 'pflichtenkompass:einstellungen'

type Obj = Record<string, unknown>

function istObj(x: unknown): x is Obj {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

export const STANDARD_EINSTELLUNGEN: Einstellungen = {
  thema: 'system',
  horizontMonate: 24,
  erinnerungTage: 7,
  vergangeneExportieren: false,
}

/** Liest gespeicherte Einstellungen; unbekannte oder falsche Werte fallen auf den Standard zurück. */
export function leseEinstellungen(daten: unknown): Einstellungen {
  const e = { ...STANDARD_EINSTELLUNGEN }
  if (!istObj(daten)) return e
  if (daten.thema === 'system' || daten.thema === 'hell' || daten.thema === 'dunkel') e.thema = daten.thema
  if (daten.horizontMonate === 12 || daten.horizontMonate === 24) e.horizontMonate = daten.horizontMonate
  if (daten.erinnerungTage === 0 || daten.erinnerungTage === 1 || daten.erinnerungTage === 3 || daten.erinnerungTage === 7 || daten.erinnerungTage === 14) e.erinnerungTage = daten.erinnerungTage
  if (typeof daten.vergangeneExportieren === 'boolean') e.vergangeneExportieren = daten.vergangeneExportieren
  return e
}

export function ladeEinstellungen(): Einstellungen {
  try {
    const text = globalThis.localStorage?.getItem(EINSTELLUNGEN_SCHLUESSEL)
    return leseEinstellungen(text ? JSON.parse(text) : null)
  } catch {
    return { ...STANDARD_EINSTELLUNGEN }
  }
}

export function speichereEinstellungen(e: Einstellungen): void {
  try {
    globalThis.localStorage?.setItem(EINSTELLUNGEN_SCHLUESSEL, JSON.stringify(e))
  } catch {
    // nicht kritisch
  }
}
