/**
 * Auswertungskette (Spezifikation 6.1), alles reine Funktionen ohne React:
 *   1. Profil → Merkmale (merkmale.ts)
 *   2. Merkmale → Treffer: jede Regel jeder Tabelle; eine Regel trifft, wenn alle Einträge erfüllt sind
 *   3. Treffer → Pflichten und Lücken, gruppiert nach Ausgabe, sortiert nach Katalognummer (COLLECT ist ungeordnet)
 *   4. Gültigkeit: Pflichten mit gueltigBis vor dem Start oder gueltigAb nach dem Horizontende entfallen mit Warnung
 *   5. Termine je Pflicht und Fristregel (fristen/termine.ts); ohne Bundesland noch keine
 *   6. Neu-Markierung im Vergleich mit dem vorigen Ergebnis
 * `heute` wird übergeben, nie intern gelesen.
 */
import { datumText, monatsErster, plusMonate, plusTage } from '../fristen/datum'
import { rechenweg, termineFuer, type TerminKontext } from '../fristen/termine'
import { luecke } from '../katalog/luecken'
import { pflicht } from '../katalog/pflichten'
import { KATALOG_STAND, KATALOG_VERSION, type LueckeId, type Pflicht, type PflichtId } from '../katalog/typen'
import { frageNummer } from '../modell/fragen'
import { merkmale, merkmalInfo, wertText } from '../modell/merkmale'
import { pruefeProfil } from '../modell/pruefung'
import type { Datum, FrageId, Merkmale, Profil, Projekt } from '../modell/typen'
import { erfuellt } from './feel'
import type { Bedingung, Ergebnis, LueckenErgebnis, PflichtErgebnis, Regelwerk, Treffer } from './typen'

export interface Auswertungsoptionen {
  heute: Datum
  /** Standard 24 (Einstellungen). */
  horizontMonate: 12 | 24
  /** Voriges Ergebnis für die Markierung „neu“; ohne Vergleich ist nichts neu. */
  vorher?: Ergebnis | null
}

/** Horizont: vom 1. des Startmonats `monate` Monate lang (6.8.2). */
export function horizont(start: Datum, monate: number): { von: Datum; bis: Datum } {
  const von = monatsErster(start)
  return { von, bis: plusTage(plusMonate(von, monate), -1) }
}

/** Schritt 4: gilt die Pflicht im Zeitraum vom Start bis zum Horizontende? */
export function istGueltig(p: Pick<Pflicht, 'gueltigAb' | 'gueltigBis'>, start: Datum, horizontBis: Datum): boolean {
  return !(p.gueltigBis !== null && p.gueltigBis < start) && !(p.gueltigAb !== null && p.gueltigAb > horizontBis)
}

/** Schritt 2: alle Treffer in der Reihenfolge der Tabellen und Regeln. */
export function trefferListe(regelwerk: Regelwerk, m: Merkmale): { ausgabe: string; art: 'pflicht' | 'luecke'; treffer: Treffer }[] {
  const liste: { ausgabe: string; art: 'pflicht' | 'luecke'; treffer: Treffer }[] = []
  for (const t of regelwerk.tabellen) {
    for (const r of t.regeln) {
      const erfuelltAlle = r.eintraege.every((e, i) => erfuellt(e.test, m[t.eingaben[i].merkmal]))
      if (!erfuelltAlle) continue
      const bedingungen: Bedingung[] = r.eintraege.flatMap((e, i) => {
        if (e.test.art === 'beliebig') return []
        const info = merkmalInfo(t.eingaben[i].merkmal)
        return [{ merkmal: info.name, label: info.label, eintrag: e.text, wert: m[info.name], fragen: info.fragen }]
      })
      liste.push({ ausgabe: r.ausgabe, art: t.ausgabe, treffer: { tabelle: t.id, regel: r.id, begruendung: r.begruendung, bedingungen } })
    }
  }
  return liste
}

function gruppiere<T extends string>(liste: { ausgabe: string; treffer: Treffer }[]): Map<T, Treffer[]> {
  const gruppen = new Map<T, Treffer[]>()
  for (const { ausgabe, treffer } of liste) {
    const id = ausgabe as T
    gruppen.set(id, [...(gruppen.get(id) ?? []), treffer])
  }
  return gruppen
}

export function werteAus(regelwerk: Regelwerk, profil: Profil, optionen: Auswertungsoptionen): Ergebnis {
  const m = merkmale(profil)
  const alle = trefferListe(regelwerk, m)
  const zeitraum = horizont(profil.start, optionen.horizontMonate)
  const warnungen = pruefeProfil(profil).warnungen.map((w) => w.text)
  const vorher = optionen.vorher ? new Set(optionen.vorher.pflichten.map((p) => p.pflicht.id)) : null
  // Termine brauchen die Feiertage des Landes (F03); bis zur Antwort bleibt die Liste leer
  const kontext: TerminKontext | null = profil.bundesland ? { profil, land: profil.bundesland, horizont: zeitraum } : null

  const pflichten: PflichtErgebnis[] = []
  for (const [id, treffer] of gruppiere<PflichtId>(alle.filter((x) => x.art === 'pflicht'))) {
    const p = pflicht(id)
    if (!istGueltig(p, profil.start, zeitraum.bis)) {
      warnungen.push(
        p.gueltigAb !== null && p.gueltigAb > zeitraum.bis
          ? `„${p.titel}“ gilt erst ab ${datumText(p.gueltigAb)} und entfällt im betrachteten Zeitraum.`
          : `„${p.titel}“ gilt nur bis ${datumText(p.gueltigBis!)} und entfällt, weil die Tätigkeit später beginnt.`,
      )
      continue
    }
    pflichten.push({
      pflicht: p,
      treffer,
      termine: kontext ? termineFuer(p, kontext) : [],
      neu: vorher !== null && !vorher.has(id),
      rechenweg: kontext ? rechenweg(id, kontext) : [],
    })
  }
  pflichten.sort((a, b) => a.pflicht.nr - b.pflicht.nr)

  const luecken: LueckenErgebnis[] = [...gruppiere<LueckeId>(alle.filter((x) => x.art === 'luecke'))]
    .map(([id, treffer]) => ({ luecke: luecke(id), treffer }))
    .sort((a, b) => a.luecke.nr - b.luecke.nr)

  return { katalogVersion: KATALOG_VERSION, stand: KATALOG_STAND, berechnetAm: optionen.heute, horizont: zeitraum, pflichten, luecken, warnungen }
}

/** Neue und entfallene Pflichten gegenüber dem vorigen Ergebnis (5.3: „neu“-Marke, entfallene einmalig als Hinweis). */
export function vergleiche(vorher: Ergebnis | null, jetzt: Ergebnis): { neu: PflichtId[]; entfallen: PflichtId[] } {
  if (!vorher) return { neu: [], entfallen: [] }
  const alt = new Set(vorher.pflichten.map((p) => p.pflicht.id))
  const neu = new Set(jetzt.pflichten.map((p) => p.pflicht.id))
  return { neu: [...neu].filter((id) => !alt.has(id)), entfallen: [...alt].filter((id) => !neu.has(id)) }
}

/** Stand beim Speichern (4.7, 7.4): Katalogversion, Datum und Pflichten mit Stand. */
export function gespeichertAus(ergebnis: Ergebnis, am: Datum): NonNullable<Projekt['gespeichert']> {
  return { katalogVersion: ergebnis.katalogVersion, am, pflichten: ergebnis.pflichten.map((p) => ({ id: p.pflicht.id, stand: p.pflicht.stand })) }
}

/** Änderungshinweis beim Öffnen (2.1, 7.4): neue, entfallene und geänderte Pflichten seit dem letzten Speichern. */
export function aenderungenSeitSpeichern(gespeichert: Projekt['gespeichert'], ergebnis: Ergebnis): { neu: PflichtId[]; entfallen: string[]; geaendert: PflichtId[] } {
  if (!gespeichert) return { neu: [], entfallen: [], geaendert: [] }
  const alt = new Map(gespeichert.pflichten.map((p) => [p.id, p.stand]))
  const jetzt = new Map(ergebnis.pflichten.map((p) => [p.pflicht.id as string, p.pflicht.stand]))
  return {
    neu: ergebnis.pflichten.map((p) => p.pflicht.id).filter((id) => !alt.has(id)),
    entfallen: gespeichert.pflichten.map((p) => p.id).filter((id) => !jetzt.has(id)),
    geaendert: ergebnis.pflichten.filter((p) => alt.has(p.pflicht.id) && alt.get(p.pflicht.id) !== p.pflicht.stand).map((p) => p.pflicht.id),
  }
}

/** „Frage 4“ oder „Fragen 12, 14, 15“. */
export function fragenText(fragen: readonly FrageId[]): string {
  const nummern = fragen.map(frageNummer)
  return `${nummern.length === 1 ? 'Frage' : 'Fragen'} ${nummern.join(', ')}`
}

/** Eine erfüllte Bedingung für „Warum?“: „Beschäftigte: 3“, mit Fragen „Beschäftigte: 3 (Fragen 12, 14, 15)“. */
export function bedingungText(b: Bedingung, mitFragen = false): string {
  const text = `${b.label}: ${wertText(b.merkmal, b.wert)}`
  return mitFragen ? `${text} (${fragenText(b.fragen)})` : text
}
