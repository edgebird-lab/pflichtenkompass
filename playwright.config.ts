import { defineConfig } from '@playwright/test'

const CI = !!process.env.CI
// Fester Port 4182 (der Prozesslotse nutzt 4173); PK_PORT erlaubt parallele Arbeitskopien
const PORT = Number(process.env.PK_PORT ?? 4182)

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  retries: CI ? 1 : 0,
  reporter: CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Vorhandenen Browser nutzen statt einen herunterzuladen: lokal Edge, in der CI Chrome
    channel: CI ? 'chrome' : 'msedge',
    locale: 'de-DE',
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
})
