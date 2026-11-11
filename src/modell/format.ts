/** Zahlen und Beträge im deutschen Format (Spezifikation 5.7: „60.000 €“). */

const GANZ = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 })
const ZWEI = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** „60.000 €“; mit Cent „100.000,01 €“. */
export function betragText(n: number): string {
  const ganz = Math.abs(n - Math.round(n)) < 1e-9
  return `${(ganz ? GANZ : ZWEI).format(n)} €`
}

/** „3“, „1.250“ oder „2,5“. */
export function zahlText(n: number): string {
  return Number.isInteger(n) ? GANZ.format(n) : new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(n)
}

export function jaNein(b: boolean): string {
  return b ? 'ja' : 'nein'
}
