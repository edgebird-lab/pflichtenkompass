import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

/** Prüft die Seite mit axe; schwere und kritische Befunde lassen den Test scheitern. */
async function pruefe(page: Page, wo: string) {
  const ergebnis = await new AxeBuilder({ page }).analyze()
  const schwer = ergebnis.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(schwer.map((v) => `${wo}: ${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`)).toEqual([])
}

const SCHRITTE = ['Start', 'Vorhaben', 'Tätigkeit', 'Personal', 'Verkauf', 'Umsatz und Steuern', 'Ergebnis', 'Termine', 'Regeln']

for (const schema of ['light', 'dark'] as const) {
  test(`alle Schritte ohne schwere Barrieren (${schema === 'light' ? 'hell' : 'dunkel'})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: schema })
    await page.goto('/')
    const leiste = page.getByRole('navigation', { name: 'Schritte' })
    for (const name of SCHRITTE) {
      await leiste.getByRole('button', { name, exact: true }).click()
      await expect(leiste.getByRole('button', { name, exact: true })).toHaveAttribute('aria-current', 'step')
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(name === 'Start' ? 'Pflichten-Kompass' : name)
      // Der Hinweis „keine Rechtsberatung“ steht in jedem Schritt
      await expect(page.getByRole('contentinfo')).toContainText('keine Rechts- oder Steuerberatung')
      await pruefe(page, name)
    }
  })
}

test('Darstellung lässt sich umschalten und bleibt gespeichert', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  const gruppe = page.getByRole('group', { name: 'Darstellung' })
  const hintergrund = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  const hell = await hintergrund()

  await gruppe.getByRole('button', { name: 'Dunkel' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(gruppe.getByRole('button', { name: 'Dunkel' })).toHaveAttribute('aria-pressed', 'true')
  expect(await hintergrund()).not.toBe(hell)
  await pruefe(page, 'Start, dunkel erzwungen')

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  await gruppe.getByRole('button', { name: 'System' }).click()
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', /./)
  expect(await hintergrund()).toBe(hell)
})

test('Schrittleiste und Start sind per Tastatur erreichbar', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Zum Inhalt springen' })).toBeFocused()
  const vorhaben = page.getByRole('navigation', { name: 'Schritte' }).getByRole('button', { name: 'Vorhaben' })
  await vorhaben.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vorhaben')
})
