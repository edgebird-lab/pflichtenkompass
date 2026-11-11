/**
 * Prüfungen des Regelwerks, die über eine einzelne Tabelle hinausgehen
 * (Spezifikation 6.10): Abdeckung aller Pflichten und Lücken (V9, V10),
 * Vollständigkeit des Katalogs (V11) und Prüfwert der Datei (V12, nur in
 * Tests und CI). V1–V8 prüft der Lader in dmn.ts.
 */
import { mitLf, sha256Hex } from '../hash'
import { LUECKEN } from '../katalog/luecken'
import { PFLICHTEN } from '../katalog/pflichten'
import { RECHTSQUELLEN } from '../katalog/quellen'
import { KATALOG_STAND, LUECKE_IDS, PFLICHT_IDS, type Luecke, type Pflicht } from '../katalog/typen'
import type { Regelfehler, Tabelle } from './typen'

/** V9 und V10: Jede Pflicht und jede Lücke wird von mindestens einer Regel ausgegeben. */
export function pruefeAbdeckung(tabellen: readonly Tabelle[]): Regelfehler[] {
  const fehler: Regelfehler[] = []
  const ausgegeben = (art: Tabelle['ausgabe']) => new Set(tabellen.filter((t) => t.ausgabe === art).flatMap((t) => t.regeln.map((r) => r.ausgabe)))
  const pflichten = ausgegeben('pflicht')
  for (const id of PFLICHT_IDS) {
    if (!pflichten.has(id)) fehler.push({ regel: 'V9', ort: `Pflicht ${id}`, meldung: `Keine Regel gibt die Pflicht „${id}“ aus; sie ist unerreichbar.` })
  }
  const luecken = ausgegeben('luecke')
  for (const id of LUECKE_IDS) {
    if (!luecken.has(id)) fehler.push({ regel: 'V10', ort: `Lücke ${id}`, meldung: `Keine Regel gibt die Lücke „${id}“ aus; sie ist unerreichbar.` })
  }
  return fehler
}

/** V11: Katalog vollständig (Normen, Quellen aus Q1–Q15, Stand, Gültigkeit). */
export function pruefeKatalog(pflichten: readonly Pflicht[] = PFLICHTEN, luecken: readonly Luecke[] = LUECKEN): Regelfehler[] {
  const fehler: Regelfehler[] = []
  const melde = (ort: string, meldung: string) => fehler.push({ regel: 'V11', ort, meldung })
  const ids = pflichten.map((p) => p.id)
  if (ids.join() !== PFLICHT_IDS.join()) melde('Katalog', `Der Katalog muss genau die ${PFLICHT_IDS.length} Pflichten in der Reihenfolge der Nummern enthalten.`)
  for (const p of pflichten) {
    const ort = `Pflicht ${p.nr} (${p.id})`
    if (p.normen.length === 0) melde(ort, 'Keine Rechtsgrundlage.')
    if (p.quellen.length === 0) melde(ort, 'Keine Quelle.')
    for (const q of p.quellen) if (!RECHTSQUELLEN.includes(q)) melde(ort, `Quelle ${q} ist keine geöffnete Rechtsquelle (Q1–Q15).`)
    if (!(p.stand <= KATALOG_STAND)) melde(ort, `Stand ${p.stand} liegt nach dem Katalogstand ${KATALOG_STAND}.`)
    if (p.gueltigAb && p.gueltigBis && p.gueltigAb > p.gueltigBis) melde(ort, `Gültig ab ${p.gueltigAb} liegt nach gültig bis ${p.gueltigBis}.`)
  }
  if (luecken.map((l) => l.id).join() !== LUECKE_IDS.join()) melde('Lücken', `Die Lückenliste muss genau die ${LUECKE_IDS.length} Lücken in der Reihenfolge der Nummern enthalten.`)
  return fehler
}

/** Inhalt von regeln/stand.json. */
export interface RegelnStand {
  version: string
  stand: string
  sha256: { 'pflichten.dmn': string }
}

/**
 * V12, nur in Tests und CI: Der SHA-256 der DMN-Datei (UTF-8, Zeilenenden auf LF
 * vereinheitlicht) entspricht regeln/stand.json, und Version und Stand dort gleichen
 * denen des Katalogs. Sonst wurde die Datei geändert, ohne die Version anzuheben.
 */
export async function pruefeStand(xml: string, stand: RegelnStand, katalog: { version: string; stand: string }): Promise<Regelfehler[]> {
  const fehler: Regelfehler[] = []
  const ist = await sha256Hex(mitLf(xml))
  if (ist !== stand.sha256['pflichten.dmn']) {
    fehler.push({ regel: 'V12', ort: 'regeln/pflichten.dmn', meldung: `Regeln geändert: Version und Stand anheben (npm run regeln:stand -- --version … --stand …). Prüfwert ${ist.slice(0, 12)}… statt ${stand.sha256['pflichten.dmn'].slice(0, 12)}….` })
  }
  if (stand.version !== katalog.version || stand.stand !== katalog.stand) {
    fehler.push({ regel: 'V12', ort: 'regeln/stand.json', meldung: `Version ${stand.version} (Stand ${stand.stand}) passt nicht zum Katalog ${katalog.version} (Stand ${katalog.stand}).` })
  }
  return fehler
}
