/**
 * Normverweise als Text und Link auf die Einzelnorm bei gesetze-im-internet.de
 * (Spezifikation 3.3): https://www.gesetze-im-internet.de/<kürzel>/__<nr>.html
 */
import type { Gesetz, NormVerweis, QuelleId } from './typen'

export const NORM_BASIS = 'https://www.gesetze-im-internet.de/'

/** Kürzel der Datenbank je Gesetz (3.3). */
export const GESETZ_KUERZEL: Readonly<Record<Gesetz, string>> = {
  AO: 'ao_1977',
  UStG: 'ustg_1980',
  UStDV: 'ustdv_1980',
  EStG: 'estg',
  HGB: 'hgb',
  GmbHG: 'gmbhg',
  GewO: 'gewo',
  HwO: 'hwo',
  'SGB IV': 'sgb_4',
  'SGB VII': 'sgb_7',
  DDG: 'ddg',
  VerpackDG: 'verpackdg',
  MiLoG: 'milog',
  GwG: 'gwg_2017',
  IfSG: 'ifsg',
}

/** Geöffnete Quelle je Gesetz (Abschnitt 12). */
export const GESETZ_QUELLE: Readonly<Record<Gesetz, QuelleId>> = {
  AO: 'Q1',
  UStG: 'Q2',
  UStDV: 'Q3',
  EStG: 'Q4',
  HGB: 'Q5',
  GmbHG: 'Q6',
  GewO: 'Q7',
  HwO: 'Q8',
  'SGB IV': 'Q9',
  'SGB VII': 'Q10',
  DDG: 'Q11',
  VerpackDG: 'Q12',
  MiLoG: 'Q13',
  GwG: 'Q14',
  IfSG: 'Q15',
}

/** Paragrafennummer, wie die Datenbank sie im Dateinamen nutzt: „146a“, „18i“, „5“. */
export const PARAGRAF_MUSTER = /^\d+[a-z]?$/

export function normLink(n: NormVerweis): string {
  if (!PARAGRAF_MUSTER.test(n.paragraf)) throw new Error(`Ungültige Paragrafennummer „${n.paragraf}“`)
  return `${NORM_BASIS}${GESETZ_KUERZEL[n.gesetz]}/__${n.paragraf}.html`
}

/** „§ 138 Abs. 1b, 4 AO“, ohne Bezug. */
export function normKurz(n: NormVerweis): string {
  return `§ ${n.paragraf}${n.detail ? ` ${n.detail}` : ''} ${n.gesetz}`
}

/** „§ 138 Abs. 1b, 4 AO“; mit Bezug „UG/GmbH: § 137 AO“. */
export function normText(n: NormVerweis): string {
  return n.bezug ? `${n.bezug}: ${normKurz(n)}` : normKurz(n)
}

/**
 * Normen fortlaufend gruppiert nach Bezug, wie in der Normenspalte von 6.6:
 * „§ 1 HGB, § 12 Abs. 1 HGB, § 29 HGB; OHG: § 105 Abs. 1 HGB, § 106 Abs. 1 HGB“.
 */
export function normenGruppen(normen: readonly NormVerweis[]): { bezug: string | null; normen: NormVerweis[] }[] {
  const gruppen: { bezug: string | null; normen: NormVerweis[] }[] = []
  for (const n of normen) {
    const letzte = gruppen.at(-1)
    if (letzte && letzte.bezug === (n.bezug ?? null)) letzte.normen.push(n)
    else gruppen.push({ bezug: n.bezug ?? null, normen: [n] })
  }
  return gruppen
}

export function normenText(normen: readonly NormVerweis[]): string {
  return normenGruppen(normen)
    .map((g) => `${g.bezug ? `${g.bezug}: ` : ''}${g.normen.map(normKurz).join(', ')}`)
    .join('; ')
}
