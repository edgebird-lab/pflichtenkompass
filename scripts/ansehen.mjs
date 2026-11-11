// Rundgang durch die App mit Bildschirmfotos (Entwicklungswerkzeug, auch für die README-Bilder).
// Aufruf: npm run build && npx vite preview --port 4182 --strictPort & node scripts/ansehen.mjs <zielordner>
// Nutzt das installierte Edge (lokal) bzw. Chrome (CI); lädt keinen Browser herunter.
// „heute“ steht fest auf dem 11.11.2026, damit die Bilder gleich bleiben.
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const ziel = process.argv[2] ?? 'bilder'
const adresse = process.env.ADRESSE ?? `http://localhost:${process.env.PK_PORT ?? 4182}/`
mkdirSync(ziel, { recursive: true })
const browser = await chromium.launch({ channel: process.env.CI ? 'chrome' : 'msedge' })
const meldungen = []

async function seite(optionen = {}) {
  const kontext = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE', ...optionen })
  const page = await kontext.newPage()
  await page.clock.setFixedTime(new Date('2026-11-11T10:00:00'))
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') meldungen.push(`${m.type()}: ${m.text()}`)
  })
  page.on('pageerror', (e) => meldungen.push(`pageerror: ${e.message}`))
  await page.goto(adresse)
  return page
}
const foto = (page, name, ganz = false) => page.screenshot({ path: `${ziel}/${name}.png`, fullPage: ganz })
const schritt = (page, name) => page.getByRole('navigation', { name: 'Schritte' }).getByRole('button', { name, exact: true }).click()

const page = await seite()
await page.waitForTimeout(400)
await foto(page, '01-start')
await page.getByRole('button', { name: /Beispiel C/ }).click()
await page.waitForTimeout(500)
await foto(page, '02-ergebnis')
await page.getByText('Warum?').first().click()
await foto(page, '03-ergebnis-warum', true)
await schritt(page, 'Personal')
await page.waitForTimeout(300)
await foto(page, '04-personal', true)
await schritt(page, 'Termine')
await page.waitForTimeout(300)
await foto(page, '05-termine')
await page.getByRole('button', { name: 'Kalender exportieren …' }).click()
await page.waitForTimeout(300)
await foto(page, '06-kalender')
await page.getByRole('button', { name: 'Abbrechen' }).click()
await schritt(page, 'Regeln')
await page.waitForTimeout(1500)
await foto(page, '07-regeln-drd')
await page.getByRole('button', { name: /^Steuern/ }).click()
await page.waitForTimeout(800)
await foto(page, '08-regeln-steuern')
await page.emulateMedia({ media: 'print' })
await foto(page, '09-druck', true)
await page.emulateMedia({ media: 'screen' })

// Dunkel
const dunkel = await seite({ colorScheme: 'dark' })
await dunkel.getByRole('button', { name: /Beispiel D/ }).click()
await dunkel.waitForTimeout(500)
await foto(dunkel, '10-ergebnis-dunkel')
await schritt(dunkel, 'Vorhaben')
await foto(dunkel, '11-vorhaben-dunkel')

// Schmal
const schmal = await seite({ viewport: { width: 390, height: 844 } })
await schmal.getByRole('button', { name: /Beispiel A/ }).click()
await schmal.waitForTimeout(500)
await foto(schmal, '12-schmal')

await browser.close()
if (meldungen.length) console.log(meldungen.join('\n'))
console.log(`Bilder in ${ziel}`)
