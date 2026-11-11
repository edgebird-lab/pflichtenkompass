/**
 * Schritt 4.1: Zustand, Speichern im Browser, Start mit Beispielen, „Lokale Daten löschen“;
 * Fehlerfälle: unlesbarer Stand im Browser, Speichern gesperrt.
 */
import { expect, test } from '@playwright/test'
import { geheZu, ladeBeispiel, oeffne, pruefeAxe } from './hilfen.ts'

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

test('Unlesbarer Stand im Browser: Hinweis statt stillem Überschreiben', async ({ page }) => {
  // Stand aus einem anderen Dateiformat liegt schon vor dem ersten Laden im Speicher
  const fremd = JSON.stringify({ app: 'pflichtenkompass', formatVersion: 2, profil: {} })
  await page.addInitScript((t) => {
    if (sessionStorage.getItem('pk-test')) return
    sessionStorage.setItem('pk-test', '1')
    localStorage.setItem('pflichtenkompass:projekt', t)
  }, fremd)
  await oeffne(page)
  const hinweis = page.getByRole('alert').filter({ hasText: 'ließ sich nicht lesen' })
  await expect(hinweis).toContainText('ließ sich nicht lesen (Dateiformat 2 wird nicht unterstützt) und wurde nicht geladen')
  await pruefeAxe(page, 'unlesbarer Stand')
  // auch nach der Wartezeit des Speicherns liegt der alte Stand unverändert da
  await page.waitForTimeout(800)
  expect((await gespeichert(page))[0]).toBe(fremd)

  // erst die nächste Eingabe ersetzt ihn
  await ladeBeispiel(page, 'A')
  await expect(hinweis).toHaveCount(0)
  await expect.poll(async () => (await gespeichert(page))[0] ?? '').toContain('Kaffeeversand')
})

test('Ohne Speichern im Browser läuft die App weiter und sagt es', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Speicher voll', 'QuotaExceededError')
    }
  })
  await oeffne(page)
  await ladeBeispiel(page, 'B')
  await expect(page.getByTestId('zusammenfassung')).toContainText('9 Pflichten')
  await expect(page.getByRole('alert').filter({ hasText: 'lässt kein Speichern zu' })).toContainText('„Als Datei speichern“ (Strg+S)')
  // Hinweise und Warnungen gut lesbar, hell und dunkel
  await pruefeAxe(page, 'Speichern gesperrt, hell')
  await page.emulateMedia({ colorScheme: 'dark' })
  await pruefeAxe(page, 'Speichern gesperrt, dunkel')
})
