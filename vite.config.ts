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
 * Nur im Produktions-Build; im Dev-Server würde sie das Neuladen (HMR) stören. Im Build für das
 * Windows-Programm (Tauri setzt TAURI_ENV_PLATFORM) gilt stattdessen die CSP aus
 * `src-tauri/tauri.conf.json`: Sie erlaubt zusätzlich die Verbindung zum Rust-Teil (ipc:), die
 * `connect-src 'self'` hier sperren würde, denn zwei Richtlinien gelten immer gemeinsam.
 */
function csp(): Plugin {
  return {
    name: 'pflichtenkompass-csp',
    apply: (_, { command }) => command === 'build' && !process.env.TAURI_ENV_PLATFORM,
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
  // dmn-js (Regelansicht) ist rund 680 kB groß und lädt nur bei Bedarf; das Hauptbundle bleibt kleiner
  build: { chunkSizeWarningLimit: 800 },
  test: {
    include: ['src/**/*.test.ts'],
  },
})
