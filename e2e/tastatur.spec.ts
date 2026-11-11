/**
 * Schritt 5.2: Durchgang nur mit der Tastatur ohne Hänger: Fokus nach Schrittwechsel, Menü,
 * Kalenderdialog, Regelansicht. Ergänzt E1 (Interview nur mit der Tastatur).
 */
import { expect, test } from '@playwright/test'
import { ladeBeispiel, oeffne, tabZu } from './hilfen.ts'

test('Fokus nach dem Schrittwechsel steht auf der Überschrift', async ({ page }) => {
  await oeffne(page)
  await ladeBeispiel(page, 'A')
  await expect(page.getByRole('heading', { level: 1, name: 'Ergebnis' })).toBeFocused()
  await tabZu(page, page.getByRole('button', { name: 'Weiter: Termine' }), 400)
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1, name: 'Termine' })).toBeFocused()
})

test('Menü, Kalenderdialog und Regelansicht nur mit der Tastatur', async ({ page }) => {
  await oeffne(page)
  await ladeBeispiel(page, 'A')

  // Menü „Projekt“: öffnen, mit Escape schließen, Fokus zurück
  const menue = page.locator('summary', { hasText: 'Projekt' })
  await tabZu(page, menue)
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Über den Pflichten-Kompass' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Über den Pflichten-Kompass' })).toBeHidden()
  await expect(menue).toBeFocused()

  // Schritt „Termine“ über die Schrittleiste, Dialog mit Enter öffnen und mit Escape schließen
  await tabZu(page, page.getByRole('navigation', { name: 'Schritte' }).getByRole('button', { name: 'Termine' }))
  await page.keyboard.press('Enter')
  const export_ = page.getByRole('button', { name: 'Kalender exportieren …' })
  await tabZu(page, export_)
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Kalender exportieren' })
  await expect(dialog).toBeVisible()
  // Der Fokus erreicht nie die Seite hinter dem Dialog (die ist inert); nach dem letzten Feld geht er an den Browser
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    expect(await dialog.evaluate((d) => !document.activeElement || document.activeElement === document.body || d.contains(document.activeElement))).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(export_).toBeFocused()

  // Regeln: Tabelle über die Knöpfe öffnen; der scrollbare Tabellenbereich ist erreichbar
  await tabZu(page, page.getByRole('navigation', { name: 'Schritte' }).getByRole('button', { name: 'Regeln' }))
  await page.keyboard.press('Enter')
  const steuern = page.getByRole('button', { name: /^Steuern/ })
  await tabZu(page, steuern)
  await page.keyboard.press('Enter')
  await expect(steuern).toHaveAttribute('aria-pressed', 'true')
  const tabelle = page.getByRole('region', { name: 'Entscheidungstabelle Steuern' })
  await tabZu(page, tabelle)
  await page.keyboard.press('ArrowRight')
  await expect(tabelle).toBeFocused()
})
