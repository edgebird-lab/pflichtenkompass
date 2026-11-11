/**
 * Schritt 4.1: Zustand, Speichern im Browser, Start mit Beispielen, „Lokale Daten löschen“.
 */
import { expect, test } from '@playwright/test'
import { geheZu, ladeBeispiel, oeffne } from './hilfen.ts'

const SCHLUESSEL = ['pflichtenkompass:projekt', 'pflichtenkompass:einstellungen']
const gespeichert = (page: import('@playwright/test').Page) => page.evaluate((s) => s.map((k) => localStorage.getItem(k)), SCHLUESSEL)

test('Beispiel laden, Seite neu laden: Antworten und Status bleiben', async ({ page }) => {
  await oeffne(page)
  await ladeBeispiel(page, 'A')
  await expect(page.getByTestId('zusammenfassung')).toContainText('13 Pflichten')
  const impressum = page.locator('article[data-pflicht="impressum"]')
  await impressum.getByLabel('Status').selectOption('erledigt')
  await impressum.getByLabel('Notiz').fill('Seite ist online')
  // gespeichert wird 500 ms nach der letzten Eingabe
  await expect.poll(async () => (await gespeichert(page))[0] ?? '').toContain('Seite ist online')

  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pflichten-Kompass')
  await page.getByRole('button', { name: 'Weiter mit „Kaffeeversand“' }).click()
  await expect(page.getByTestId('zusammenfassung')).toContainText('13 Pflichten')
  await expect(impressum.getByLabel('Status')).toHaveValue('erledigt')
  await expect(impressum.getByLabel('Notiz')).toHaveValue('Seite ist online')
  await expect(impressum.locator('.etikett')).toHaveText('erledigt')
})

test('„Lokale Daten löschen“ leert den Browserspeicher', async ({ page }) => {
  await oeffne(page)
  await page.getByRole('group', { name: 'Darstellung' }).getByRole('button', { name: 'Dunkel' }).click()
  await ladeBeispiel(page, 'D')
  await expect.poll(async () => (await gespeichert(page)).every((x) => x !== null)).toBe(true)

  await geheZu(page, 'Start')
  await page.getByRole('button', { name: 'Lokale Daten löschen' }).click()
  const frage = page.getByRole('dialog', { name: 'Lokale Daten löschen?' })
  await expect(frage).toBeVisible()
  await frage.getByRole('button', { name: 'Lokale Daten löschen' }).click()
  await expect(page.getByRole('status').first()).toContainText('Lokale Daten gelöscht.')
  // auch nach der Wartezeit des Speicherns bleibt der Speicher leer
  await page.waitForTimeout(800)
  expect(await gespeichert(page)).toEqual([null, null])
  await expect(page.getByRole('button', { name: /^Weiter mit/ })).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', /./)

  await page.reload()
  await expect(page.getByRole('button', { name: /^Weiter mit/ })).toHaveCount(0)
  expect(await gespeichert(page)).toEqual([null, null])
})

test('Neu beginnen fragt nach und leert die Antworten', async ({ page }) => {
  await oeffne(page)
  await ladeBeispiel(page, 'B')
  await geheZu(page, 'Start')
  await page.getByRole('button', { name: 'Neu beginnen' }).click()
  const frage = page.getByRole('dialog', { name: 'Neu beginnen?' })
  await frage.getByRole('button', { name: 'Abbrechen' }).click()
  await expect(page.getByRole('button', { name: 'Weiter mit „Übersetzungsbüro“' })).toBeVisible()

  await page.getByRole('button', { name: 'Neu beginnen' }).click()
  await frage.getByRole('button', { name: 'Neu beginnen' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vorhaben')
  await expect(page.getByLabel('Wie heißt das Vorhaben?')).toHaveValue('')
  await expect(page.getByRole('navigation', { name: 'Schritte' })).toContainText('Pflichtangaben fehlen noch')
})
