/**
 * Kalenderdatei nach RFC 5545 (Spezifikation 7.5, Q17), eigener Code ohne Bibliothek:
 * CRLF, Zeilen höchstens 75 Oktette (gefaltet mit CRLF und Leerzeichen, nie mitten in einem
 * UTF-8-Zeichen), TEXT-Werte escaped, ganztägige Termine (DATE) mit Ende am Folgetag.
 * Nutzertext kann keine neuen Eigenschaften erzeugen (Abschnitt 8, Test IC4).
 */
import { datumMitTag, datumText, plusTage } from '../fristen/datum'
import { KEINE_BERATUNG } from '../katalog/hinweis'
import { normenText } from '../katalog/normen'
import { quelle } from '../katalog/quellen'
import type { Pflicht, PflichtId } from '../katalog/typen'
import { sha256Hex } from '../hash'
import { dateiname } from '../modell/format'
import type { Datum, Einstellungen, Profil, Projekt } from '../modell/typen'
import type { Ergebnis, Termin } from '../regeln/typen'

export const PRODID = '-//olbricht-digital//Pflichten-Kompass 0.1//DE'
export const KALENDER_MIME = 'text/calendar; charset=utf-8'
const CRLF = '\r\n'
const MAX_OKTETTE = 75

export interface KalenderEintrag {
  termin: Termin
  pflicht: Pflicht
}

export interface IcsOptionen {
  /** F01; leer, wenn kein Name vergeben ist. */
  vorhaben: string
  eintraege: readonly KalenderEintrag[]
  erinnerungTage: Einstellungen['erinnerungTage']
  /** Zeitpunkt des Exports für DTSTAMP; wird übergeben, nie intern gelesen. */
  exportzeit: Date
  /** Erste 8 Hex-Zeichen von SHA-256 über „name|start|rechtsform“ (`profilSchluessel`). */
  profilschluessel: string
  katalogVersion: string
}

/** Steuerzeichen außer Tab und Zeilenumbruch sind in TEXT nicht erlaubt (RFC 5545, 3.3.11: TSAFE-CHAR). */
function ohneSteuerzeichen(s: string): string {
  return [...s]
    .filter((z) => {
      const c = z.codePointAt(0) ?? 0
      return c === 0x09 || c === 0x0a || (c >= 0x20 && c !== 0x7f)
    })
    .join('')
}

/** TEXT-Wert escapen (RFC 5545, 3.3.11): `\` `;` `,` und Zeilenumbruch; CR und andere Steuerzeichen entfallen. */
export function escapeText(s: string): string {
  return ohneSteuerzeichen(s.replace(/\r/g, '')).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function oktette(zeichen: string): number {
  const cp = zeichen.codePointAt(0) ?? 0
  return cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4
}

/** Faltet eine Inhaltszeile auf höchstens 75 Oktette je Zeile; Fortsetzungen beginnen mit einem Leerzeichen. */
export function falte(zeile: string): string {
  const teile: string[] = []
  let aktuell = ''
  let laenge = 0
  for (const zeichen of zeile) {
    const n = oktette(zeichen)
    // Fortsetzungszeilen tragen ein führendes Leerzeichen, das mitzählt
    const grenze = teile.length === 0 ? MAX_OKTETTE : MAX_OKTETTE - 1
    if (laenge + n > grenze) {
      teile.push(aktuell)
      aktuell = ''
      laenge = 0
    }
    aktuell += zeichen
    laenge += n
  }
  teile.push(aktuell)
  return teile.join(`${CRLF} `)
}

/** Umkehrung der Faltung (für Tests und zum Prüfen). */
export function entfalte(text: string): string {
  return text.replace(/\r\n[ \t]/g, '')
}

const kompakt = (d: Datum) => d.replace(/-/g, '')

function zeitstempel(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

/** „Umsatzsteuer-Voranmeldung – Januar 2027“ */
export function terminTitel(t: Termin): string {
  return t.zeitraum ? `${t.titel} – ${t.zeitraum}` : t.titel
}

function beschreibung(e: KalenderEintrag, o: IcsOptionen): string {
  const { termin: t, pflicht: p } = e
  const zeilen = [p.kurz]
  if (t.hinweis) zeilen.push(`Hinweis: ${t.hinweis}`)
  if (p.stelle !== '–') zeilen.push(`Zuständig: ${p.stelle}${p.weg ? `; ${p.weg}` : ''}`)
  zeilen.push(`Rechtsgrundlage: ${normenText(p.normen)}`)
  zeilen.push(`Quelle: ${quelle(p.quellen[0]).url}`)
  zeilen.push(`Stand: ${datumText(p.stand)} (Katalog ${o.katalogVersion})`)
  if (t.gesetzlichBis) zeilen.push(`Termin: ${datumMitTag(t.faelligAm)} (vorsichtig angesetzt); gesetzlich bis: ${datumMitTag(t.gesetzlichBis)}`)
  zeilen.push(KEINE_BERATUNG)
  return zeilen.join('\n')
}

function vevent(e: KalenderEintrag, o: IcsOptionen, stempel: string): string[] {
  const t = e.termin
  const titel = terminTitel(t)
  const summary = o.vorhaben.trim() ? `[${o.vorhaben.trim()}] ${titel}` : titel
  const zeilen = [
    'BEGIN:VEVENT',
    `UID:${t.pflichtId}-${t.schluessel}-${o.profilschluessel}@pflichtenkompass`,
    `DTSTAMP:${stempel}`,
    `DTSTART;VALUE=DATE:${kompakt(t.faelligAm)}`,
    `DTEND;VALUE=DATE:${kompakt(plusTage(t.faelligAm, 1))}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(beschreibung(e, o))}`,
    'CATEGORIES:Pflichten-Kompass',
    'TRANSP:TRANSPARENT',
  ]
  if (o.erinnerungTage > 0) zeilen.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escapeText(titel)}`, `TRIGGER:-P${o.erinnerungTage}D`, 'END:VALARM')
  zeilen.push('END:VEVENT')
  return zeilen
}

/** Die ganze Kalenderdatei; jede Zeile endet mit CRLF. */
export function erzeugeIcs(o: IcsOptionen): string {
  const stempel = zeitstempel(o.exportzeit)
  const zeilen = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:${PRODID}`, 'CALSCALE:GREGORIAN', ...o.eintraege.flatMap((e) => vevent(e, o, stempel)), 'END:VCALENDAR']
  return zeilen.map((z) => falte(z) + CRLF).join('')
}

/** Erste 8 Hex-Zeichen von SHA-256 über „name|start|rechtsform“ (7.5): gleiche Termine behalten ihre UID. */
export async function profilSchluessel(p: Pick<Profil, 'name' | 'start' | 'rechtsform'>): Promise<string> {
  return (await sha256Hex(`${p.name}|${p.start}|${p.rechtsform}`)).slice(0, 8)
}

/** `pflichten-<slug>-<JJJJ-MM-TT>.ics` */
export function kalenderDateiname(vorhaben: string, heute: Datum): string {
  return `pflichten-${dateiname(vorhaben, '')}-${heute}.ics`
}

export interface ExportAuswahl {
  /** Nur Pflichten mit Status „offen“ (5.4). */
  nurOffene: boolean
  /** Auch Termine vor `heute` (Einstellung, Standard nein). */
  vergangene: boolean
  heute: Datum
}

/** Termine für den Export, nach Datum sortiert. */
export function exportEintraege(ergebnis: Ergebnis, status: Projekt['status'], a: ExportAuswahl): KalenderEintrag[] {
  const offen = (id: PflichtId) => (status[id]?.bearbeitung ?? 'offen') === 'offen'
  return ergebnis.pflichten
    .filter((e) => !a.nurOffene || offen(e.pflicht.id))
    .flatMap((e) => e.termine.map((termin) => ({ termin, pflicht: e.pflicht })))
    .filter((e) => a.vergangene || e.termin.faelligAm >= a.heute)
    .sort((x, y) => (x.termin.faelligAm < y.termin.faelligAm ? -1 : x.termin.faelligAm > y.termin.faelligAm ? 1 : x.pflicht.nr - y.pflicht.nr))
}
