/**
 * Erzeugt docs/katalog.md aus dem Katalog (Spezifikation 7.3). Aufruf über
 * `npm run doku`; ein Test prüft, dass die Datei zum Katalog passt.
 */
import { datumText } from '../fristen/datum'
import { HINWEISTEXT } from './hinweis'
import { LUECKE_HINWEIS, LUECKEN } from './luecken'
import { normenGruppen, normKurz, normLink } from './normen'
import { GRUPPEN, PFLICHTEN, ZEITPUNKTE } from './pflichten'
import { QUELLEN } from './quellen'
import { KATALOG_STAND, KATALOG_VERSION, type NormVerweis, type Pflicht } from './typen'

const zeitpunktTitel = (z: Pflicht['zeitpunkt']) => ZEITPUNKTE.find((x) => x.id === z)?.titel ?? z

function normenMitLinks(normen: readonly NormVerweis[]): string {
  return normenGruppen(normen)
    .map((g) => `${g.bezug ? `${g.bezug}: ` : ''}${g.normen.map((n) => `[${normKurz(n)}](${normLink(n)})`).join(', ')}`)
    .join('; ')
}

function pflichtAbschnitt(p: Pflicht): string[] {
  const zeilen = [`### ${p.nr}. ${p.titel}`, '', `\`${p.id}\` · ${zeitpunktTitel(p.zeitpunkt)} · Stand ${datumText(p.stand)}`, '', p.kurz, '']
  zeilen.push(`- **Frist:** ${p.fristText}`)
  zeilen.push(`- **Stelle:** ${p.stelle}`)
  if (p.weg) zeilen.push(`- **Weg:** ${p.weg}`)
  zeilen.push(`- **Rechtsgrundlage:** ${normenMitLinks(p.normen)}`)
  zeilen.push(`- **Quellen:** ${p.quellen.join(', ')}`)
  if (p.gueltigAb) zeilen.push(`- **Gültig ab:** ${datumText(p.gueltigAb)}`)
  if (p.gueltigBis) zeilen.push(`- **Gültig bis:** ${datumText(p.gueltigBis)}`)
  if (p.hinweise.length > 0) zeilen.push(`- **Hinweise:** ${p.hinweise.join(' ')}`)
  zeilen.push('')
  return zeilen
}

export function katalogDoku(): string {
  const zeilen = [
    `# Pflichtenkatalog ${KATALOG_VERSION}`,
    '',
    '> Erzeugt aus `src/katalog/` mit `npm run doku`; nicht von Hand ändern.',
    '',
    `> **Keine Rechtsberatung.** ${HINWEISTEXT}`,
    '',
    `Rechtsstand ${datumText(KATALOG_STAND)}. ${PFLICHTEN.length} Pflichten aus Abschnitt 6.6 der [Spezifikation](spezifikation.md) und ${LUECKEN.length} Lückenhinweise aus 6.7. Die Normen verlinken auf die Einzelnorm bei gesetze-im-internet.de; die Quellen stehen am Ende.`,
    '',
  ]
  for (const g of GRUPPEN) {
    zeilen.push(`## ${g.titel}`, '')
    for (const p of PFLICHTEN.filter((x) => x.gruppe === g.id)) zeilen.push(...pflichtAbschnitt(p))
  }
  zeilen.push(
    '## Lückenhinweise',
    '',
    `${LUECKE_HINWEIS}. Lücken sind keine Pflichten: Sie nennen Bereiche, die zum Profil passen, aber nicht geprüft sind („nicht geprüft“), oder Fragen, die vor dem Handeln zu klären sind („klären“). Abschnitt 6.7 der Spezifikation.`,
    '',
    '| Nr. | Titel | Art | Was offen ist |',
    '| --- | --- | --- | --- |',
  )
  for (const l of LUECKEN) zeilen.push(`| ${l.nr} | ${l.titel} | ${l.art === 'pruefen' ? 'klären' : 'nicht geprüft'} | ${l.text} |`)
  zeilen.push('')
  zeilen.push('## Quellen', '', '| Nr. | Quelle | Stand laut Seite | Abgerufen |', '| --- | --- | --- | --- |')
  for (const q of QUELLEN) zeilen.push(`| ${q.id} | [${q.titel}](${q.url}) | ${q.stand} | ${datumText(q.abgerufen)} |`)
  zeilen.push('')
  return zeilen.join('\n')
}
