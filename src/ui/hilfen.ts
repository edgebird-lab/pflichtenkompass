/** Bietet Text oder eine Datei zum Herunterladen an. */
export function ladeHerunter(dateiname: string, inhalt: string | Blob, typ = 'text/plain'): void {
  const blob = inhalt instanceof Blob ? inhalt : new Blob([inhalt], { type: `${typ};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = dateiname
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
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
