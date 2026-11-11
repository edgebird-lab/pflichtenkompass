/**
 * Schritt 4.6, E4: Druckansicht (emulateMedia print): Hinweistext sichtbar, alle Pflichten da,
 * heller Hintergrund auch im Dunkelmodus, Bedienelemente ausgeblendet.
 */
import { expect, test } from '@playwright/test'
import { HINWEISTEXT } from '../src/katalog/hinweis.ts'
import { geheZu, ladeBeispiel, oeffne } from './hilfen.ts'

const HINWEIS = 'Der Pflichten-Kompass zeigt häufige Pflichten nach dem Rechtsstand vom 11.11.2026. Er ist keine Rechts- oder Steuerberatung und nicht vollständig.'

test('Fußzeile jeder Druckseite: derselbe Hinweistext wie in der App und die Seitenzahl (5.6)', async ({ page }) => {
  // Die Fußzeile steht als Text in styles.css (@page); ohne diesen Test bliebe nach einem neuen Rechtsstand das alte Datum im Druck
  await oeffne(page)
  const seitenregel = await page.evaluate(() =>
    [...document.styleSheets]
      .flatMap((s) => [...s.cssRules])
      .filter((r) => r.constructor.name === 'CSSPageRule')
      .map((r) => r.cssText)
      .join('\n'),
  )
  expect(seitenregel).toContain(`@bottom-left { content: "Keine Rechtsberatung. ${HINWEISTEXT}"`)
  expect(seitenregel).toContain('@bottom-right { content: "Seite " counter(page) " von " counter(pages)')
  expect(seitenregel).toMatch(/size: a4;/)
})

test('E4: Druckansicht mit Hinweis, allen Pflichten und hellem Hintergrund', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await oeffne(page)
  await ladeBeispiel(page, 'C')
  await page.locator('article[data-pflicht="impressum"]').getByLabel('Status').selectOption('erledigt')
  await expect(page.locator('.druck')).toBeHidden()

  await page.emulateMedia({ media: 'print', colorScheme: 'dark' })
  const druck = page.locator('.druck')
  await expect(druck).toBeVisible()
  await expect(page.locator('.app')).toBeHidden()
  await expect(druck).toContainText(HINWEIS)
  await expect(druck.locator('h1')).toHaveText('Pflichten-Kompass: Elektro GmbH')
  await expect(druck.locator('.druck-kopf')).toContainText('GmbH')
  await expect(druck.locator('.druck-kopf')).toContainText('Bayern')
  await expect(druck.locator('.druck-kopf')).toContainText('01.04.2027')
  await expect(druck.locator('.druck-kopf')).toContainText('2026.11.0')
  await expect(druck.locator('.druck-kopf')).toContainText('11.11.2026')
  await expect(druck.locator('tbody.druck-pflicht')).toHaveCount(25)
  await expect(druck.locator('tbody.druck-pflicht', { hasText: '38. Impressum bereitstellen' })).toContainText('erledigt')
  await expect(druck.getByText('Warum?').first()).toBeVisible()
  await expect(druck.getByRole('heading', { name: 'Nicht geprüft' })).toBeVisible()
  await expect(druck.getByRole('heading', { name: 'Die nächsten 12 Termine' })).toBeVisible()
  const farben = await page.evaluate(() => [getComputedStyle(document.body).backgroundColor, getComputedStyle(document.body).color])
  expect(farben).toEqual(['rgb(255, 255, 255)', 'rgb(11, 11, 11)'])
})

test('Ohne Ergebnis druckt die Seite ohne Bedienelemente', async ({ page }) => {
  await oeffne(page)
  await geheZu(page, 'Vorhaben')
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.druck')).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Schritte' })).toBeHidden()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vorhaben')
  await expect(page.getByRole('contentinfo')).toContainText(HINWEIS)
})
