/**
 * Eingabeprüfungen und Warnungen nach 6.9 der Spezifikation. Geprüft werden nur
 * sichtbare Fragen; ausgeblendete Antworten wirken nicht. Fehler stehen am Feld,
 * Warnungen sperren nichts.
 */
import { datumText, istDatum } from '../fristen/datum'
import { betragText } from './format'
import { frage } from './fragen'
import { KLEINUNTERNEHMER_LAUFEND } from './merkmale'
import { DATUM_FRUEHESTENS, DATUM_SPAETESTENS, NAME_MAX, START_FRUEHESTENS, START_SPAETESTENS } from './profil'
import type { Datum, FrageId, Profil } from './typen'

export interface Meldung {
  frage: FrageId
  text: string
}

export interface Pruefergebnis {
  fehler: Meldung[]
  warnungen: Meldung[]
}

/** Pflichtfelder nach 6.9: ohne Antwort gibt es noch kein Ergebnis. */
export const PFLICHTFELDER: readonly FrageId[] = ['F02', 'F03', 'F04', 'F06', 'F09', 'F19']

export const WARNUNG_KLEINUNTERNEHMER = `Kleinunternehmerregelung nicht anwendbar: Der Umsatz im ersten Jahr liegt über ${betragText(KLEINUNTERNEHMER_LAUFEND)} (§ 19 Abs. 1 UStG). Die App rechnet ohne die Regelung.`

export function pruefeProfil(p: Profil): Pruefergebnis {
  const fehler: Meldung[] = []
  const warnungen: Meldung[] = []
  const sichtbar = (id: FrageId) => frage(id).sichtbar(p)
  const betrag = (id: FrageId, wert: number | null, negativErlaubt = false) => {
    if (wert === null || !sichtbar(id)) return
    if (!Number.isFinite(wert)) fehler.push({ frage: id, text: 'Gültigen Betrag angeben.' })
    else if (!negativErlaubt && wert < 0) fehler.push({ frage: id, text: 'Betrag ab 0 angeben.' })
  }
  /** F13 und F23: gültig und im Bereich 1900–2099 (E26); sonst rechnete die Fristlogik über das Jahr 9999 hinaus. */
  const ereignisDatum = (id: FrageId, wert: Datum | null): boolean => {
    if (wert === null || !sichtbar(id)) return false
    if (!istDatum(wert)) fehler.push({ frage: id, text: 'Gültiges Datum angeben.' })
    else if (wert < DATUM_FRUEHESTENS || wert > DATUM_SPAETESTENS) fehler.push({ frage: id, text: `Datum zwischen ${datumText(DATUM_FRUEHESTENS)} und ${datumText(DATUM_SPAETESTENS)} angeben.` })
    else return true
    return false
  }

  if (p.name.length > NAME_MAX) fehler.push({ frage: 'F01', text: `Höchstens ${NAME_MAX} Zeichen.` })
  if (!istDatum(p.start)) fehler.push({ frage: 'F02', text: 'Gültiges Datum angeben.' })
  else if (p.start < START_FRUEHESTENS || p.start > START_SPAETESTENS) {
    fehler.push({ frage: 'F02', text: `Der Beginn muss zwischen ${datumText(START_FRUEHESTENS)} und ${datumText(START_SPAETESTENS)} liegen.` })
  }
  if (p.bundesland === null) fehler.push({ frage: 'F03', text: 'Bundesland wählen; seine Feiertage verschieben Fristen.' })
  if (p.branchen.length === 0) fehler.push({ frage: 'F09', text: 'Mindestens einen Bereich wählen.' })
  if (!Object.values(p.kunden).some(Boolean)) fehler.push({ frage: 'F19', text: 'Mindestens eine Kundengruppe wählen.' })

  const pers = p.personal
  if (pers.vorhanden) {
    if (pers.svPflichtig + pers.minijobber === 0) fehler.push({ frage: 'F14', text: 'Mindestens eine Person angeben.' })
    if (ereignisDatum('F13', pers.beginn) && pers.beginn !== null && istDatum(p.start) && pers.beginn < p.start) {
      warnungen.push({ frage: 'F13', text: `Die Beschäftigung beginnt am ${datumText(pers.beginn)}, vor der Tätigkeit am ${datumText(p.start)}.` })
    }
  }
  ereignisDatum('F23', p.kasseAnschaffung)

  betrag('F18', pers.lohnsteuerJeMonat)
  betrag('F25', p.steuern.umsatzErstesJahr)
  betrag('F26', p.steuern.gewinnErstesJahr, true)
  betrag('F28', p.steuern.umsatz2026)
  betrag('F29', p.steuern.ustErstesJahr)
  betrag('F30', p.steuern.euFernverkaeufe)

  if (p.steuern.kleinunternehmer && p.steuern.umsatzErstesJahr > KLEINUNTERNEHMER_LAUFEND) warnungen.push({ frage: 'F27', text: WARNUNG_KLEINUNTERNEHMER })
  return { fehler, warnungen }
}

/** Pflichtfelder ohne Antwort; das Ergebnis erscheint erst, wenn die Liste leer ist (6.9). */
export function offenePflichtfelder(p: Profil): FrageId[] {
  const fehler = new Set(pruefeProfil(p).fehler.map((f) => f.frage))
  return PFLICHTFELDER.filter((id) => fehler.has(id))
}
