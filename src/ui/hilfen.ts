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
