/**
 * Export im offenen Format Beratungsakte v1 (Kopie der Bibliothek in src/beratungsakte).
 * Die Akte fasst zusammen, was das Ergebnis zeigt; gerechnet wird hier nichts Neues. Grundlage
 * ist das Ergebnis von `werteAus` mit demselben „heute“ wie in der Oberfläche.
 *
 * - Maßnahmen: jede Pflicht des Ergebnisses, mit Stelle, Frist und nächstem Termin ab heute als
 *   `frist`. Rechtsgrundlage, Quellen, Stand, Regeln und Status stehen im Namensraum.
 * - Befunde: die Warnungen des Ergebnisses (Prüfungen 6.9, Gültigkeit), die nicht geprüften
 *   Bereiche (Lücken) und der Hinweis „Keine Rechts- oder Steuerberatung“. Der Hinweis steht als
 *   Befund im Kern, weil Leser Namensräume ignorieren dürfen und er überall sichtbar sein muss.
 * - Kennzahlen: Anzahlen, wie sie Ergebnis und Termine nennen (Pflichten, je Zeitpunkt, je Status,
 *   nicht geprüfte Bereiche, Termine im Zeitraum, davon vor heute).
 *
 * Abbildung der Stufen:
 *
 * | Pflichten-Kompass                         | Beratungsakte         |
 * | ----------------------------------------- | --------------------- |
 * | Warnung im Ergebnis                       | Schwere `mittel`      |
 * | Lücke „Prüfen“ (`pruefen`)                | Schwere `mittel`      |
 * | Lücke „Nicht geprüft“ (`nichtGeprueft`)   | Schwere `niedrig`     |
 * | Hinweis „Keine Rechtsberatung“            | Schwere `hinweis`     |
 * | Pflicht „Vor dem Start“, „In den ersten Wochen“ | Priorität `hoch` |
 * | Pflicht „Laufend“                         | Priorität `mittel`    |
 * | Pflicht „Jährlich“                        | Priorität `niedrig`   |
 * | Pflicht mit Status „erledigt“ oder „trifft nicht zu“ | Priorität `niedrig`, Status im Text |
 *
 * Die Priorität folgt der Gruppierung des Ergebnisses nach Zeitpunkt; eine eigene Dringlichkeit
 * rechnet die App nicht. Den Aufwand kennt die App nicht („nicht geschätzt“). Pflichten antworten
 * auf keinen Befund: Lücken und Warnungen sind gerade das, was keine Pflicht abdeckt.
 */
import { erzeugeBeratungsakte, type Befund, type Beratungsakte, type Kennzahl, type Massnahme, type Prioritaet, type Schwere } from '../beratungsakte/beratungsakte'
import { naechsterTermin } from '../fristen/termine'
import { HINWEISTEXT } from '../katalog/hinweis'
import { normenText } from '../katalog/normen'
import { ZEITPUNKTE } from '../katalog/pflichten'
import { quelle } from '../katalog/quellen'
import type { Luecke, Zeitpunkt } from '../katalog/typen'
import { frageNummer } from '../modell/fragen'
import { pruefeProfil } from '../modell/pruefung'
import { BEARBEITUNGEN, type Bearbeitung, type Datum, type Projekt } from '../modell/typen'
import type { Ergebnis } from '../regeln/typen'
import { VERSION } from '../version'

export const APP_KENNUNG = 'pflichtenkompass'

export const PRIORITAET_NACH_ZEITPUNKT: Readonly<Record<Zeitpunkt, Prioritaet>> = {
  vorStart: 'hoch',
  ersteWochen: 'hoch',
  laufend: 'mittel',
  jaehrlich: 'niedrig',
}

export const SCHWERE_DER_LUECKE: Readonly<Record<Luecke['art'], Schwere>> = {
  pruefen: 'mittel',
  nichtGeprueft: 'niedrig',
}

export const SCHWERE_DER_WARNUNG: Schwere = 'mittel'

const STATUS_TEXT: Readonly<Record<Bearbeitung, string>> = { offen: 'offen', erledigt: 'erledigt', trifftNichtZu: 'trifft nicht zu' }

const KENNUNG_ZEITPUNKT: Readonly<Record<Zeitpunkt, string>> = { vorStart: 'vor-start', ersteWochen: 'erste-wochen', laufend: 'laufend', jaehrlich: 'jaehrlich' }
const KENNUNG_STATUS: Readonly<Record<Bearbeitung, string>> = { offen: 'offen', erledigt: 'erledigt', trifftNichtZu: 'trifft-nicht-zu' }

export interface AkteAngaben {
  projekt: Projekt
  /** Ergebnis von `werteAus` für dieses Projekt; `berechnetAm` ist das „heute“ der Auswertung. */
  ergebnis: Ergebnis
  mandant: { name: string; kennung?: string }
  /** Zeitpunkt der Erzeugung (`erzeugtAm`). */
  jetzt: Date
  /** Name der gespeicherten Projektdatei, falls bekannt. */
  quelldatei?: string | null
}

/** Vorbelegung für den Mandanten: der Name des Vorhabens (F01), sonst leer. */
export function mandantAusProjekt(projekt: Projekt): string {
  return projekt.profil.name.trim()
}

const anzahl = (kennung: string, name: string, wert: number): Kennzahl => ({ kennung, name, wert, einheit: 'Anzahl' })

const satz = (text: string) => (/[.?!]$/.test(text) ? text : `${text}.`)

/** Baut die Akte aus Projekt und Ergebnis. Wirft, wenn der Mandant fehlt. */
export function beratungsakteAusErgebnis({ projekt, ergebnis, mandant, jetzt, quelldatei }: AkteAngaben): Beratungsakte {
  if (!mandant.name.trim()) throw new Error('Bitte den Mandanten angeben.')
  const heute: Datum = ergebnis.berechnetAm
  const statusVon = (id: keyof Projekt['status']): Bearbeitung => projekt.status[id]?.bearbeitung ?? 'offen'

  // Kennzahlen: was Ergebnis (Zusammenfassung, Gruppen, Statusfilter) und Termine zählen
  const termine = ergebnis.pflichten.flatMap((e) => e.termine)
  const kennzahlen: Kennzahl[] = [
    anzahl('pflichten', 'Pflichten', ergebnis.pflichten.length),
    ...ZEITPUNKTE.map((z) => anzahl(`pflichten-${KENNUNG_ZEITPUNKT[z.id]}`, `Pflichten: ${z.titel}`, ergebnis.pflichten.filter((e) => e.pflicht.zeitpunkt === z.id).length)),
    ...BEARBEITUNGEN.map((b) => anzahl(`pflichten-${KENNUNG_STATUS[b]}`, `Pflichten mit Status „${STATUS_TEXT[b]}“`, ergebnis.pflichten.filter((e) => statusVon(e.pflicht.id) === b).length)),
    anzahl('nicht-gepruefte-bereiche', 'Nicht geprüfte Bereiche', ergebnis.luecken.length),
    anzahl('termine', 'Termine im Zeitraum', termine.length),
    anzahl('termine-vor-heute', 'Termine vor heute', termine.filter((t) => t.faelligAm < heute).length),
  ]

  // Befunde: Hinweis, Warnungen (mit Frage, wenn die Prüfung sie kennt), Lücken
  const warnungMitFrage = new Map(pruefeProfil(projekt.profil).warnungen.map((w) => [w.text, w.frage]))
  const befunde: Befund[] = [
    { kennung: 'hinweis:keine-rechtsberatung', schwere: 'hinweis', text: HINWEISTEXT, fundstelle: 'Ergebnis' },
    ...ergebnis.warnungen.map((text, i): Befund => {
      const frage = warnungMitFrage.get(text)
      return { kennung: `warnung:${i + 1}`, schwere: SCHWERE_DER_WARNUNG, text, fundstelle: frage ? `Ergebnis, Warnung zu Frage ${frageNummer(frage)}` : 'Ergebnis, Warnung' }
    }),
    ...ergebnis.luecken.map(
      ({ luecke: l, treffer }): Befund => ({
        kennung: `luecke:${l.id}`,
        schwere: SCHWERE_DER_LUECKE[l.art],
        text: `${l.titel}: in Version 0.1 nicht geprüft. ${l.text}`,
        fundstelle: 'Ergebnis, Nicht geprüft',
        erweiterungen: { [APP_KENNUNG]: { nr: l.nr, art: l.art, regeln: treffer.map((t) => t.regel) } },
      }),
    ),
  ]

  const massnahmen: Massnahme[] = ergebnis.pflichten.map((e): Massnahme => {
    const p = e.pflicht
    const status = statusVon(p.id)
    const naechster = naechsterTermin(e.termine, heute)
    const stelle = [p.stelle !== '–' ? p.stelle : null, p.weg].filter(Boolean).join('; ')
    const teile = [satz(p.titel), p.kurz, stelle && `Stelle: ${satz(stelle)}`, `Frist: ${satz(p.fristText)}`, status !== 'offen' && `Im Pflichten-Kompass als „${STATUS_TEXT[status]}“ markiert.`]
    const m: Massnahme = {
      kennung: `pflicht:${p.id}`,
      text: teile.filter(Boolean).join(' '),
      prioritaet: status === 'offen' ? PRIORITAET_NACH_ZEITPUNKT[p.zeitpunkt] : 'niedrig',
      aufwand: 'nicht geschätzt',
      befunde: [],
    }
    if (naechster) m.frist = naechster.faelligAm
    m.erweiterungen = {
      [APP_KENNUNG]: {
        nr: p.nr,
        gruppe: p.gruppe,
        zeitpunkt: p.zeitpunkt,
        status,
        rechtsgrundlage: normenText(p.normen),
        quellen: p.quellen.map((q) => ({ id: q, titel: quelle(q).titel, url: quelle(q).url })),
        stand: p.stand,
        regeln: e.treffer.map((t) => t.regel),
        termine: e.termine.length,
        ...(naechster?.gesetzlichBis ? { gesetzlichBis: naechster.gesetzlichBis } : {}),
      },
    }
    return m
  })

  return erzeugeBeratungsakte({
    app: { kennung: APP_KENNUNG, name: 'Pflichten-Kompass', version: VERSION },
    mandant: { name: mandant.name.trim(), kennung: mandant.kennung?.trim() || undefined },
    analyse: { art: 'gruendungspflichten', titel: projekt.profil.name.trim() || 'Vorhaben ohne Namen', stand: heute, quelldatei: quelldatei ?? undefined },
    kennzahlen,
    befunde,
    massnahmen,
    erweiterungen: { [APP_KENNUNG]: { katalogVersion: ergebnis.katalogVersion, rechtsstand: ergebnis.stand, horizont: ergebnis.horizont, start: projekt.profil.start } },
    erzeugtAm: jetzt,
  })
}
