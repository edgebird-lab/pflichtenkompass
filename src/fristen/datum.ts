/**
 * Kalenderdaten als ISO-Text („2027-01-15“). Gerechnet wird mit Tageszahlen
 * über `Date.UTC`, nie mit `new Date('JJJJ-MM-TT')` in Ortszeit (Spezifikation 6.8.1).
 * Feiertage und Werktage folgen in Phase 3 (`feiertage.ts`).
 */
import type { Datum } from '../modell/typen'

const MUSTER = /^(\d{4})-(\d{2})-(\d{2})$/
const MS_TAG = 86_400_000

export const WOCHENTAGE_KURZ = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'] as const
export const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'] as const

/** Monat 1–12. */
export interface Teile {
  jahr: number
  monat: number
  tag: number
}

export function tageImMonat(jahr: number, monat: number): number {
  return new Date(Date.UTC(jahr, monat, 0, 12)).getUTCDate()
}

function gueltig(jahr: number, monat: number, tag: number): boolean {
  return Number.isInteger(jahr) && Number.isInteger(monat) && Number.isInteger(tag) && jahr >= 1000 && jahr <= 9999 && monat >= 1 && monat <= 12 && tag >= 1 && tag <= tageImMonat(jahr, monat)
}

/** Ist `x` ein gültiges Kalenderdatum im Format JJJJ-MM-TT? */
export function istDatum(x: unknown): x is Datum {
  if (typeof x !== 'string') return false
  const m = MUSTER.exec(x)
  return !!m && gueltig(Number(m[1]), Number(m[2]), Number(m[3]))
}

export function zerlege(d: Datum): Teile {
  const m = MUSTER.exec(d)
  const teile = m ? { jahr: Number(m[1]), monat: Number(m[2]), tag: Number(m[3]) } : null
  if (!teile || !gueltig(teile.jahr, teile.monat, teile.tag)) throw new Error(`Kein gültiges Datum: „${d}“`)
  return teile
}

export function datum(jahr: number, monat: number, tag: number): Datum {
  if (!gueltig(jahr, monat, tag)) throw new Error(`Kein gültiges Datum: ${jahr}-${monat}-${tag}`)
  return `${jahr}-${String(monat).padStart(2, '0')}-${String(tag).padStart(2, '0')}`
}

/** Fortlaufende Tageszahl (Tage seit 1970-01-01). */
export function tagesnummer(d: Datum): number {
  const { jahr, monat, tag } = zerlege(d)
  return Math.floor(Date.UTC(jahr, monat - 1, tag, 12) / MS_TAG)
}

export function ausTagesnummer(n: number): Datum {
  const d = new Date(n * MS_TAG + MS_TAG / 2)
  return datum(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate())
}

export function plusTage(d: Datum, n: number): Datum {
  return ausTagesnummer(tagesnummer(d) + n)
}

/** Gleicher Tag im Zielmonat; gibt es ihn nicht, der Monatsletzte (2027-01-31 + 1 Monat = 2027-02-28). */
export function plusMonate(d: Datum, n: number): Datum {
  const { jahr, monat, tag } = zerlege(d)
  const index = jahr * 12 + (monat - 1) + n
  const j = Math.floor(index / 12)
  const m = index - j * 12 + 1
  return datum(j, m, Math.min(tag, tageImMonat(j, m)))
}

/** 0 = Sonntag … 6 = Samstag */
export function wochentag(d: Datum): number {
  return ((tagesnummer(d) % 7) + 7 + 4) % 7
}

export function monatsErster(d: Datum): Datum {
  const { jahr, monat } = zerlege(d)
  return datum(jahr, monat, 1)
}

export function monatsLetzter(d: Datum): Datum {
  const { jahr, monat } = zerlege(d)
  return datum(jahr, monat, tageImMonat(jahr, monat))
}

export function jahrVon(d: Datum): number {
  return zerlege(d).jahr
}

/** Kleiner als 0, wenn `a` vor `b` liegt. ISO-Daten lassen sich auch als Text vergleichen. */
export function vergleiche(a: Datum, b: Datum): number {
  return a < b ? -1 : a > b ? 1 : 0
}

export function minDatum(a: Datum, b: Datum): Datum {
  return a <= b ? a : b
}

export function maxDatum(a: Datum, b: Datum): Datum {
  return a >= b ? a : b
}

/** „15.02.2027“ */
export function datumText(d: Datum): string {
  const { jahr, monat, tag } = zerlege(d)
  return `${String(tag).padStart(2, '0')}.${String(monat).padStart(2, '0')}.${jahr}`
}

/** „Mo, 15.02.2027“ (Spezifikation 5.7) */
export function datumMitTag(d: Datum): string {
  return `${WOCHENTAGE_KURZ[wochentag(d)]}, ${datumText(d)}`
}

/** Datum eines `Date` in Ortszeit, z. B. für „heute“ in der Oberfläche. Die Fachlogik bekommt „heute“ immer übergeben. */
export function ausOrtszeit(d: Date): Datum {
  return datum(d.getFullYear(), d.getMonth() + 1, d.getDate())
}
