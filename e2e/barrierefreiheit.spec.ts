/**
 * E7: axe in allen Schritten, hell und dunkel, ohne schwere oder kritische Befunde; jedes
 * Eingabefeld beschriftet. Geprüft mit leerem Projekt und mit Beispiel C (alle Fragen-Schritte
 * mit Inhalt, Ergebnis, Termine, Regeln mit dmn-js), dazu die Dialoge.
 */
import { expect, test } from '@playwright/test'
import { geheZu, ladeBeispiel, oeffne, pruefeAxe, SCHRITTE, schrittleiste } from './hilfen.ts'

for (const schema of ['light', 'dark'] as const) {
  const name = schema === 'light' ? 'hell' : 'dunkel'

  test(`alle Schritte ohne schwere Barrieren, leeres Projekt (${name})`, async ({ page }) => {
    test.setTimeout(60_000)
    await page.emulateMedia({ colorScheme: schema })
    await oeffne(page)
    for (const s of SCHRITTE) {
      await geheZu(page, s)
      await expect(schrittleiste(page).getByRole('button', { name: s, exact: true })).toHaveAttribute('aria-current', 'step')
      // Der Hinweis „keine Rechtsberatung“ steht in jedem Schritt
      await expect(page.getByRole('contentinfo')).toContainText('keine Rechts- oder Steuerberatung')
      await pruefeAxe(page, `${s} (leer)`)
    }
  })

  test(`alle Schritte ohne schwere Barrieren, Beispiel C (${name})`, async ({ page }) => {
    // neun Schritte mit axe und dmn-js brauchen bei parallelen Tests länger als 30 s
    test.setTimeout(90_000)
    await page.emulateMedia({ colorScheme: schema })
    await oeffne(page)
    await ladeBeispiel(page, 'C')
    for (const s of SCHRITTE) {
      await geheZu(page, s)
      if (s === 'Ergebnis') await page.locator('summary', { hasText: 'Warum?' }).first().click()
      if (s === 'Regeln') {
        await expect(page.locator('.dmn-leinwand .djs-element[data-element-id="Entscheidung_Steuern"]')).toBeVisible()
        await pruefeAxe(page, 'Regeln, DRD')
        await page.getByRole('button', { name: /^Steuern/ }).click()
        await expect(page.locator('.dmn-leinwand .tjs-table')).toBeVisible()
      }
      // Jedes Eingabefeld hat einen zugänglichen Namen
      for (const feld of await page.locator('main input:visible, main select:visible, main textarea:visible').all()) {
        await expect(feld).toHaveAccessibleName(/\S/)
      }
      await pruefeAxe(page, `${s} (Beispiel C)`)
    }
  })

  test(`Dialoge ohne schwere Barrieren (${name})`, async ({ page }) => {
    // drei axe-Prüfungen über der langen Terminliste: bei parallelen Tests auf einem ausgelasteten Rechner über 30 s
    test.setTimeout(60_000)
    await page.emulateMedia({ colorScheme: schema })
    await oeffne(page)
    await ladeBeispiel(page, 'A')
    await geheZu(page, 'Termine')
    await page.getByRole('button', { name: 'Kalender exportieren …' }).click()
    await expect(page.getByRole('dialog', { name: 'Kalender exportieren' })).toBeVisible()
    await pruefeAxe(page, 'Kalenderdialog')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)

    await page.getByText('Projekt', { exact: true }).click()
    await page.getByRole('button', { name: 'Über den Pflichten-Kompass' }).click()
    await expect(page.getByRole('dialog', { name: /Pflichten-Kompass/ })).toBeVisible()
    await pruefeAxe(page, 'Über-Dialog')
    await page.getByRole('button', { name: 'Schließen' }).click()

    await page.getByText('Projekt', { exact: true }).click()
    await page.getByRole('button', { name: 'Neu beginnen' }).click()
    await expect(page.getByRole('dialog', { name: 'Neu beginnen?' })).toBeVisible()
    await pruefeAxe(page, 'Rückfrage')
    // Der Fokus steht auf der sicheren Antwort
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Abbrechen' })).toBeFocused()
  })
}

test('Darstellung lässt sich umschalten und bleibt gespeichert', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await oeffne(page)
  const gruppe = page.getByRole('group', { name: 'Darstellung' })
  const hintergrund = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  const hell = await hintergrund()

  await gruppe.getByRole('button', { name: 'Dunkel' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(gruppe.getByRole('button', { name: 'Dunkel' })).toHaveAttribute('aria-pressed', 'true')
  expect(await hintergrund()).not.toBe(hell)
  await pruefeAxe(page, 'Start, dunkel erzwungen')

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  await gruppe.getByRole('button', { name: 'System' }).click()
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', /./)
  expect(await hintergrund()).toBe(hell)
})

test('Schrittleiste und Start sind per Tastatur erreichbar', async ({ page }) => {
  await oeffne(page)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Zum Inhalt springen' })).toBeFocused()
  const vorhaben = schrittleiste(page).getByRole('button', { name: 'Vorhaben' })
  await vorhaben.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vorhaben')
})

test('Schmale Ansicht (390 px) ohne waagerechtes Scrollen in allen Schritten', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await oeffne(page)
  await ladeBeispiel(page, 'C')
  for (const s of SCHRITTE) {
    await geheZu(page, s)
    // Tabellen und die Regelansicht scrollen in ihrem eigenen Rahmen, die Seite selbst nicht
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), s).toBeLessThanOrEqual(0)
  }
})
