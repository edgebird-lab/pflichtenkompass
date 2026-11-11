/**
 * Schritt 4.5: Terminliste und Kalenderdialog; E3: Kalender für Beispiel A exportieren.
 */
import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { geheZu, ladeBeispiel, oeffne } from './hilfen.ts'

test('Terminliste nach Monaten mit „gesetzlich bis“', async ({ page }) => {
  await oeffne(page)
  await ladeBeispiel(page, 'A')
  await geheZu(page, 'Termine')
  await expect(page.locator('.zusammenfassung')).toContainText('31 Termine von 01.01.2027 bis 31.12.2028')
  await expect(page.getByRole('heading', { name: 'Januar 2027', level: 2 })).toBeVisible()
  // TE3: März 2027 am Sa, 10.04.2027, gesetzlich bis Mo, 12.04.2027
  const zeile = page.locator('table.termine tr', { hasText: 'Sa, 10.04.2027' })
  await expect(zeile).toContainText('Umsatzsteuer-Voranmeldung')
  await expect(zeile).toContainText('März 2027')
  await expect(zeile).toContainText('gesetzlich bis Mo, 12.04.2027')
  await expect(zeile).toContainText('Abgabe und Zahlung')
})

test('E3: Kalender für A als .ics mit 31 Terminen', async ({ page }) => {
  await oeffne(page)
  await ladeBeispiel(page, 'A')
  await geheZu(page, 'Termine')
  await page.getByRole('button', { name: 'Kalender exportieren …' }).click()
  const dialog = page.getByRole('dialog', { name: 'Kalender exportieren' })
  await expect(dialog).toContainText('31 Termine')
  await expect(dialog.getByLabel('Erinnerung')).toHaveValue('7')
  const [download] = await Promise.all([page.waitForEvent('download'), dialog.getByRole('button', { name: 'Exportieren' }).click()])
  expect(download.suggestedFilename()).toBe('pflichten-kaffeeversand-2026-11-11.ics')
  const ics = readFileSync(await download.path(), 'utf8')
  expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(31)
  expect(ics.match(/TRIGGER:-P7D/g)).toHaveLength(31)
  expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
  await expect(dialog).toBeHidden()
  await expect(page.getByRole('status').first()).toContainText('Kalender exportiert')
})

test('Kalenderdialog: 12 Monate, ohne Erinnerung, nur offene Pflichten', async ({ page }) => {
  await oeffne(page)
  await ladeBeispiel(page, 'A')
  // Voranmeldung erledigt: ihre 23 Termine fallen bei „nur offene“ weg
  await page.locator('article[data-pflicht="ustVoranmeldung"]').getByLabel('Status').selectOption('erledigt')
  await geheZu(page, 'Termine')
  await page.getByRole('button', { name: 'Kalender exportieren …' }).click()
  const dialog = page.getByRole('dialog', { name: 'Kalender exportieren' })
  await expect(dialog).toContainText('8 Termine')
  await dialog.getByRole('checkbox', { name: 'Nur Pflichten mit Status „offen“' }).uncheck()
  await expect(dialog).toContainText('31 Termine')
  await dialog.getByRole('radio', { name: '12 Monate ab dem Startmonat' }).check()
  // 12 Monate: 5 Einmaltermine (Gewerbe, Impressum, Verpackung, Unfallversicherung, Fragebogen) + 11 Voranmeldungen (Januar bis November 2027)
  await expect(dialog).toContainText('16 Termine')
  await dialog.getByLabel('Erinnerung').selectOption('0')
  const [download] = await Promise.all([page.waitForEvent('download'), dialog.getByRole('button', { name: 'Exportieren' }).click()])
  const ics = readFileSync(await download.path(), 'utf8')
  expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(16)
  expect(ics).not.toContain('VALARM')
  // die Einstellung gilt auch für die Liste
  await expect(page.locator('.zusammenfassung')).toContainText('(12 Monate ab dem Startmonat)')
})
