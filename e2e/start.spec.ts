import { expect, test } from '@playwright/test'

test('Startseite lädt ohne Verstoß gegen die CSP', async ({ page }) => {
  const meldungen: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') meldungen.push(m.text())
  })
  page.on('pageerror', (e) => meldungen.push(e.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Pflichten-Kompass', level: 1 })).toBeVisible()
  await expect(page.getByText('Keine Rechtsberatung', { exact: false }).first()).toBeVisible()
  // Die CSP steht nur im Produktions-Build; die Tests laufen gegen `vite preview`
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveCount(1)
  expect(meldungen).toEqual([])
})
