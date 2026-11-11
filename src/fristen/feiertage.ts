/**
 * Feiertage, Werktage und Arbeitstage je Land (Spezifikation 6.8.1) über feiertagejs 1.5.1.
 *
 * - **sicher** (für Verschiebungen nach vorn, § 108 Abs. 3 AO): alle Feiertage der Bibliothek,
 *   aber ohne Mariä Himmelfahrt in Bayern (dort nur regional).
 * - **möglich** (für das Zurückzählen von Arbeitstagen): alle Feiertage der Bibliothek plus
 *   24.12. und 31.12., Fronleichnam in SN und TH und das Augsburger Friedensfest (08.08.) in BY.
 *
 * Weniger Feiertage beim Verschieben und mehr Feiertage beim Zurückzählen ergeben nie ein
 * späteres Datum als das Gesetz. Die Landesfeiertage sind nicht gegen die Landesgesetze geprüft (O8).
 */
import { getHolidays } from 'feiertagejs'
import type { Bundesland, Datum } from '../modell/typen'
import { datum, plusMonate, plusTage, tageImMonat, wochentag, zerlege } from './datum'

export type FeiertagsModus = 'sicher' | 'moeglich'

/** Ostersonntag + 60 Tage; feiertagejs führt Fronleichnam für SN und TH nicht (nur regional dort). */
const FRONLEICHNAM_REGIONAL: readonly Bundesland[] = ['SN', 'TH']

const ablage = new Map<string, ReadonlyMap<Datum, string>>()

function isoAusUtc(d: Date): Datum {
  // feiertagejs legt jeden Feiertag auf 12 Uhr UTC; die UTC-Teile sind deshalb der Kalendertag
  return datum(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate())
}

/** Feiertage eines Jahres als Datum → Name, je nach Modus (6.8.1). */
export function feiertage(jahr: number, land: Bundesland, modus: FeiertagsModus): ReadonlyMap<Datum, string> {
  const schluessel = `${jahr}|${land}|${modus}`
  const vorhanden = ablage.get(schluessel)
  if (vorhanden) return vorhanden

  const liste = new Map<Datum, string>()
  let ostermontag: Datum | null = null
  for (const f of getHolidays(jahr, land)) {
    const d = isoAusUtc(f.date)
    if (f.name === 'OSTERMONTAG') ostermontag = d
    if (f.name === 'MARIAHIMMELFAHRT' && land === 'BY' && modus === 'sicher') continue
    liste.set(d, f.translate('de') ?? f.name)
  }
  if (modus === 'moeglich') {
    liste.set(datum(jahr, 12, 24), 'Heiligabend')
    liste.set(datum(jahr, 12, 31), 'Silvester')
    // Fronleichnam = Ostersonntag + 60 Tage = Ostermontag + 59 Tage
    if (FRONLEICHNAM_REGIONAL.includes(land) && ostermontag) liste.set(plusTage(ostermontag, 59), 'Fronleichnam (regional)')
    if (land === 'BY') liste.set(datum(jahr, 8, 8), 'Augsburger Friedensfest (regional)')
  }
  const sortiert = new Map([...liste].sort(([a], [b]) => (a < b ? -1 : 1)))
  ablage.set(schluessel, sortiert)
  return sortiert
}

function istFeiertag(d: Datum, land: Bundesland, modus: FeiertagsModus): boolean {
  return feiertage(zerlege(d).jahr, land, modus).has(d)
}

export function istWochenende(d: Datum): boolean {
  const w = wochentag(d)
  return w === 0 || w === 6
}

/** Werktag im Sinne von § 108 Abs. 3 AO: Montag bis Freitag und kein Feiertag „sicher“. */
export function istWerktag(d: Datum, land: Bundesland): boolean {
  return !istWochenende(d) && !istFeiertag(d, land, 'sicher')
}

/** Arbeitstag, auch Bankarbeitstag: Montag bis Freitag und kein Feiertag „möglich“ (24.12. und 31.12. frei, O9). */
export function istArbeitstag(d: Datum, land: Bundesland): boolean {
  return !istWochenende(d) && !istFeiertag(d, land, 'moeglich')
}

/** `d` selbst, wenn es ein Werktag ist, sonst der nächste Werktag (§ 108 Abs. 3 AO). */
export function naechsterWerktag(d: Datum, land: Bundesland): Datum {
  let x = d
  while (!istWerktag(x, land)) x = plusTage(x, 1)
  return x
}

/** Der `n`-te Arbeitstag vor `d` (ohne `d` selbst), zurückgezählt im Modus „möglich“. */
export function arbeitstageVor(d: Datum, n: number, land: Bundesland): Datum {
  if (!Number.isInteger(n) || n < 1) throw new Error(`Ungültige Zahl von Arbeitstagen: ${n}`)
  let x = d
  for (let gezaehlt = 0; gezaehlt < n; ) {
    x = plusTage(x, -1)
    if (istArbeitstag(x, land)) gezaehlt++
  }
  return x
}

/** Der `n`-letzte Arbeitstag eines Monats (Monat 1–12), vom Monatsende an gezählt; n = 3 ist der drittletzte. */
export function arbeitstagVomMonatsende(jahr: number, monat: number, n: number, land: Bundesland): Datum {
  return arbeitstageVor(plusTage(datum(jahr, monat, tageImMonat(jahr, monat)), 1), n, land)
}

/**
 * Frist nach einem Ereignis (6.8.2): roh = Ereignis + Monate + Tage; mit `ao108` auf den
 * nächsten Werktag verschoben (nur Abgaben und Mitteilungen), sonst unverschoben.
 */
export function fristNachEreignis(ereignis: Datum, monate: number, tage: number, ao108: boolean, land: Bundesland): { roh: Datum; ende: Datum } {
  const roh = plusTage(plusMonate(ereignis, monate), tage)
  return { roh, ende: ao108 ? naechsterWerktag(roh, land) : roh }
}
