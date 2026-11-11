// Bilder für die README (docs/bilder), mit festem Datum 11.11.2026 und Beispiel C bzw. D.
// Aufruf: npm run build && npx vite preview --port 4182 --strictPort & node scripts/readme-bilder.mjs
// Nutzt das installierte Edge (lokal) bzw. Chrome (CI); lädt keinen Browser herunter.
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const ziel = process.argv[2] ?? 'docs/bilder'
const adresse = process.env.ADRESSE ?? `http://localhost:${process.env.PK_PORT ?? 4182}/`
mkdirSync(ziel, { recursive: true })
const browser = await chromium.launch({ channel: process.env.CI ? 'chrome' : 'msedge' })

async function seite(beispiel, optionen = {}) {
  const kontext = await browser.newContext({ viewport: { width: 1280, height: 860 }, locale: 'de-DE', deviceScaleFactor: 1, ...optionen })
  const page = await kontext.newPage()
  await page.clock.setFixedTime(new Date('2026-11-11T10:00:00'))
  await page.goto(adresse)
  await page.getByRole('button', { name: new RegExp(`^Beispiel ${beispiel}:`) }).click()
  await page.getByRole('heading', { level: 1, name: 'Ergebnis' }).waitFor()
  return page
}
const schritt = (page, name) => page.getByRole('navigation', { name: 'Schritte' }).getByRole('button', { name, exact: true }).click()
const foto = (page, name) => page.screenshot({ path: `${ziel}/${name}.png` })

// Ergebnis mit aufgeklapptem „Warum?“ an der ersten Pflicht
const c = await seite('C', { viewport: { width: 1280, height: 1000 } })
await c.locator('article.pflicht summary').first().click()
await foto(c, 'ergebnis')

// Interview: Schritt Personal
await schritt(c, 'Personal')
await c.waitForTimeout(200)
await foto(c, 'interview')

// Termine
await schritt(c, 'Termine')
await c.locator('table.termine tr', { hasText: 'Beitragsnachweis' }).first().scrollIntoViewIfNeeded()
await c.evaluate(() => window.scrollTo(0, 0))
await foto(c, 'termine')

// Regeln: Tabelle „Steuern“ mit markierten Treffern
await schritt(c, 'Regeln')
await c.locator('.dmn-leinwand .djs-element').first().waitFor()
await c.waitForTimeout(500)
await foto(c, 'regeln-drd')
await c.getByRole('button', { name: /^Steuern/ }).click()
await c.locator('.dmn-leinwand .tjs-table').waitFor()
await c.locator('.dmn-rahmen').scrollIntoViewIfNeeded()
await c.waitForTimeout(300)
await foto(c, 'regeln-tabelle')

// Dunkel: Ergebnis von Beispiel D
const d = await seite('D', { colorScheme: 'dark' })
await foto(d, 'ergebnis-dunkel')

await browser.close()
console.log(`Bilder in ${ziel}`)
