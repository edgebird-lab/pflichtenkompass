/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/** Content-Security-Policy der Web-App (Spezifikation, Abschnitt 8). `font-src data:` braucht die Symbolschrift von dmn-js. */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ')

/**
 * Setzt die CSP als Meta-Tag direkt hinter den Zeichensatz, also vor alle Skripte und Stile.
 * Nur im Produktions-Build; im Dev-Server würde sie das Neuladen (HMR) stören.
 */
function csp(): Plugin {
  return {
    name: 'pflichtenkompass-csp',
    apply: 'build',
    transformIndexHtml(html) {
      const charset = /<meta charset="UTF-8" \/>/
      if (!charset.test(html)) throw new Error('index.html: <meta charset="UTF-8" /> fehlt, CSP nicht gesetzt.')
      return html.replace(charset, (m) => `${m}\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`)
    },
  }
}

export default defineConfig({
  plugins: [react(), csp()],
  // Eigene Ports, weil auf diesem Rechner mehrere Apps parallel laufen (Prozesslotse: 4173)
  server: { port: 5182 },
  preview: { port: 4182, strictPort: true },
  test: {
    include: ['src/**/*.test.ts'],
  },
})
