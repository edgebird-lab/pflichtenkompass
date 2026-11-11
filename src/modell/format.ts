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

/** Dateiname aus dem Namen des Vorhabens: „Café Müller & Söhne“ → „cafe-mueller-soehne“. */
export function dateiname(name: string, rest: string, ersatz = 'vorhaben'): string {
  const basis =
    name
      .toLocaleLowerCase('de-DE')
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60)
      .replace(/-$/, '') || ersatz
  return `${basis}${rest}`
}

const FELD = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2, minimumFractionDigits: 0 })

/** Betrag für ein Eingabefeld: „60.000“, mit Cent „100.000,01“ (immer zwei Nachkommastellen). */
export function betragFeldText(n: number | null): string {
  if (n === null) return ''
  const ganz = Number.isInteger(n)
  return ganz ? FELD.format(n) : ZWEI.format(n)
}

export type Gelesen = { ok: true; wert: number | null } | { ok: false; meldung: string }

/**
 * Liest einen Betrag in deutscher Schreibweise: „60000“, „60.000“, „60.000,50“, „1.250 €“,
 * „-5.000“. Punkte sind Tausendertrennzeichen, das Komma trennt die Nachkommastellen; ein Punkt
 * ohne Komma gilt nur dann als Dezimalzeichen, wenn ihm nicht genau drei Ziffern folgen.
 * Leer ergibt `null`.
 */
export function leseBetrag(text: string, negativErlaubt = false): Gelesen {
  let s = text.replace(/[\s €]/g, '')
  if (s === '') return { ok: true, wert: null }
  let vorzeichen = 1
  if (s.startsWith('-') || s.startsWith('−')) {
    vorzeichen = -1
    s = s.slice(1)
  }
  let ganz: string
  let nachkomma = ''
  if (s.includes(',')) {
    const teile = s.split(',')
    if (teile.length !== 2) return { ok: false, meldung: 'Betrag in der Form 1.250,50 angeben.' }
    ;[ganz, nachkomma] = teile
    if (!/^\d{1,3}(\.\d{3})*$|^\d+$/.test(ganz)) return { ok: false, meldung: 'Betrag in der Form 1.250,50 angeben.' }
    ganz = ganz.replace(/\./g, '')
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    ganz = s.replace(/\./g, '')
  } else if (/^\d+(\.\d{1,2})?$/.test(s)) {
    ;[ganz, nachkomma = ''] = s.split('.')
  } else {
    return { ok: false, meldung: 'Gültigen Betrag angeben, z. B. 60.000 oder 1.250,50.' }
  }
  if (!/^\d+$/.test(ganz) || !/^\d*$/.test(nachkomma)) return { ok: false, meldung: 'Gültigen Betrag angeben, z. B. 60.000 oder 1.250,50.' }
  if (nachkomma.length > 2) return { ok: false, meldung: 'Höchstens zwei Nachkommastellen angeben.' }
  const wert = vorzeichen * Number(`${ganz}.${nachkomma || '0'}`)
  if (!Number.isFinite(wert)) return { ok: false, meldung: 'Gültigen Betrag angeben.' }
  if (wert < 0 && !negativErlaubt) return { ok: false, meldung: 'Betrag ab 0 angeben.' }
  return { ok: true, wert: wert === 0 ? 0 : wert }
}

/** Ganze Zahl ab 0 (F14, F15); leer ergibt `null`. */
export function leseAnzahl(text: string): Gelesen {
  const s = text.trim()
  if (s === '') return { ok: true, wert: null }
  if (!/^\d{1,6}$/.test(s)) return { ok: false, meldung: 'Ganze Zahl ab 0 angeben.' }
  return { ok: true, wert: Number(s) }
}
