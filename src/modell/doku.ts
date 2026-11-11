/**
 * Erzeugt docs/fragenkatalog.md aus den Fragen (Spezifikation 7.3). Aufruf über
 * `npm run doku`; ein Test prüft, dass die Datei zu den Fragen passt.
 */
import { normKurz, normLink } from '../katalog/normen'
import { SCHRITTE } from './schritte'
import { FRAGEN } from './fragen'
import type { Frage, FrageTyp } from './typen'

const TYPEN: Readonly<Record<FrageTyp, string>> = {
  text: 'Text',
  datum: 'Datum',
  auswahl: 'Auswahl',
  mehrfach: 'Mehrfachauswahl',
  janein: 'ja/nein',
  zahl: 'Zahl',
  betrag: 'Betrag',
}

function typText(f: Frage): string {
  const optionen = f.optionen && f.optionen.length <= 6 ? `: ${f.optionen.map((o) => o.text).join(' · ')}` : f.optionen ? `: ${f.optionen.length} Optionen` : ''
  return `${TYPEN[f.typ]}${optionen}`
}

const zelle = (text: string) => text.replace(/\|/g, '\\|')

export function fragenkatalogDoku(): string {
  const zeilen = [
    '# Fragenkatalog',
    '',
    '> Erzeugt aus `src/modell/fragen.ts` mit `npm run doku`; nicht von Hand ändern.',
    '',
    `${FRAGEN.length} Fragen in fünf Schritten (Abschnitt 5.2 der [Spezifikation](spezifikation.md)). Ausgeblendete Fragen behalten ihren Standardwert und wirken nicht. Pflichtfelder: ${FRAGEN.filter((f) => f.pflicht)
      .map((f) => f.id)
      .join(', ')}.`,
    '',
  ]
  for (const s of SCHRITTE) {
    const fragen = FRAGEN.filter((f) => f.schritt === s.id)
    if (fragen.length === 0) continue
    zeilen.push(`## ${s.nr}. ${s.name}`, '', '| ID | Frage | Typ | Sichtbar | Standard | Hilfe | Normen |', '| --- | --- | --- | --- | --- | --- | --- |')
    for (const f of fragen) {
      const normen = f.normen.map((n) => `[${normKurz(n)}](${normLink(n)})`).join(', ') || '–'
      zeilen.push(`| ${f.id}${f.pflicht ? ' *' : ''} | ${zelle(f.text)} | ${zelle(typText(f))} | ${zelle(f.sichtbarText)} | ${zelle(f.standardText)} | ${zelle(f.hilfe)} | ${normen} |`)
    }
    zeilen.push('')
  }
  zeilen.push('`*` Pflichtfeld: Das Ergebnis erscheint erst nach einer Antwort (6.9).', '')
  return zeilen.join('\n')
}
