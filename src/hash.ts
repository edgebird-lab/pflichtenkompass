export const OHNE_WEB_CRYPTO = 'Der Browser bietet hier keine Prüfsummen an (Web Crypto fehlt); die App braucht https oder localhost.'

/** SHA-256 eines Textes (UTF-8) als Hex, über Web Crypto (Browser und Node 24). Browser haben es nur in sicheren Kontexten. */
export async function sha256Hex(text: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) throw new Error(OHNE_WEB_CRYPTO)
  const digest = await subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Zeilenenden auf LF vereinheitlichen (V12: ein Windows-Checkout mit CRLF ändert den Prüfwert nicht). */
export function mitLf(text: string): string {
  return text.replace(/\r\n?/g, '\n')
}
