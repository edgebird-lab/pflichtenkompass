/**
 * Schritt 4.8: Datei speichern und öffnen mit Änderungshinweis; E5 und SP6 im Browser.
 */
import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { geheZu, ladeBeispiel, oeffne } from './hilfen.ts'

async function speichere(page: Page): Promise<{ name: string; inhalt: string }> {
  await page.getByText('Projekt', { exact: true }).click()
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('.menue-liste').getByRole('button', { name: 'Als Datei speichern' }).click()])
  return { name: download.suggestedFilename(), inhalt: readFileSync(await download.path(), 'utf8') }
}

async function oeffneDatei(page: Page, name: string, inhalt: string): Promise<void> {
  await geheZu(page, 'Start')
  const [auswahl] = await Promise.all([page.waitForEvent('filechooser'), page.getByRole('button', { name: 'Datei öffnen …' }).click()])
  await auswahl.setFiles({ name, mimeType: 'application/json', buffer: Buffer.from(inhalt, 'utf8') })
}

test('E5: speichern, App neu laden, öffnen: gleiches Profil, Status bleibt', async ({ page }) => {
  await oeffne(page)
  await ladeBeispiel(page, 'E')
  const karte = page.locator('article[data-pflicht="impressum"]')
  await karte.getByLabel('Status').selectOption('erledigt')
  await karte.getByLabel('Notiz').fill('Impressum seit Dezember online')
  const datei = await speichere(page)
  expect(datei.name).toBe('shop-ug.pflichtenkompass')
  const json = JSON.parse(datei.inhalt)
  expect([json.app, json.formatVersion, json.profil.name, json.gespeichert.pflichten.length]).toEqual(['pflichtenkompass', 1, 'Shop UG', 20])
  expect(json.status.impressum).toMatchObject({ bearbeitung: 'erledigt', notiz: 'Impressum seit Dezember online' })

  // Browserspeicher leeren und neu laden: nur die Datei bringt die Antworten zurück
  await geheZu(page, 'Start')
  await page.getByRole('button', { name: 'Lokale Daten löschen' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Lokale Daten löschen' }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: /^Weiter mit/ })).toHaveCount(0)

  await oeffneDatei(page, datei.name, datei.inhalt)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ergebnis')
  await expect(page.getByTestId('zusammenfassung')).toHaveText(/^20 Pflichten/)
  await expect(page.getByRole('region', { name: 'Änderungen seit dem Speichern' })).toContainText('Seitdem hat sich an der Pflichtenliste nichts geändert.')
  await expect(karte.getByLabel('Status')).toHaveValue('erledigt')
  await expect(karte.getByLabel('Notiz')).toHaveValue('Impressum seit Dezember online')
  await geheZu(page, 'Vorhaben')
  await expect(page.getByLabel('Wie heißt das Vorhaben?')).toHaveValue('Shop UG')
  await expect(page.getByLabel('Wann beginnt die Tätigkeit?')).toHaveValue('2026-12-15')
  await expect(page.getByLabel('In welchem Bundesland liegt der Betrieb?')).toHaveValue('BE')
})

test('SP6: Änderungshinweis nennt neue, entfallene und geänderte Pflichten', async ({ page }) => {
  await oeffne(page)
  await ladeBeispiel(page, 'A')
  const json = JSON.parse((await speichere(page)).inhalt)
  json.gespeichert.pflichten = [
    ...json.gespeichert.pflichten.filter((p: { id: string }) => p.id !== 'verpackung').map((p: { id: string; stand: string }) => (p.id === 'impressum' ? { ...p, stand: '2026-06-01' } : p)),
    { id: 'altePflicht', stand: '2026-06-01' },
  ]
  json.gespeichert.am = '2026-10-01'
  await oeffneDatei(page, 'alt.pflichtenkompass', JSON.stringify(json))
  await page.getByRole('dialog').getByRole('button', { name: 'Datei öffnen' }).click()
  const hinweis = page.getByRole('region', { name: 'Änderungen seit dem Speichern' })
  await expect(hinweis).toContainText('am 01.10.2026 mit Katalog 2026.11.0 gespeichert')
  await expect(hinweis).toContainText('Neu: „Als Hersteller registrieren und an einem System beteiligen“')
  await expect(hinweis).toContainText('Entfallen: „altePflicht“ (nicht mehr im Katalog)')
  await expect(hinweis).toContainText('Mit neuem Stand: „Impressum bereitstellen“')
  await hinweis.getByRole('button', { name: 'Hinweis schließen' }).click()
  await expect(hinweis).toHaveCount(0)
})

test('Fremde oder kaputte Dateien werden mit Meldung abgelehnt', async ({ page }) => {
  await oeffne(page)
  await oeffneDatei(page, 'prozess.prozesslotse', JSON.stringify({ app: 'prozesslotse', formatVersion: 1 }))
  const meldung = page.getByRole('dialog', { name: '„prozess.prozesslotse“ nicht geöffnet' })
  await expect(meldung).toContainText('Die Datei ist keine Pflichten-Kompass-Datei.')
  await meldung.getByRole('button', { name: 'Schließen' }).click()

  await oeffneDatei(page, 'kaputt.pflichtenkompass', '{ "app": "pflichtenkompass", ')
  await expect(page.getByRole('dialog')).toContainText('kein gültiges JSON')
  await page.getByRole('dialog').getByRole('button', { name: 'Schließen' }).click()

  // falsche Felder: Meldung mit Feldname, die App bleibt beim bisherigen Stand
  await oeffneDatei(page, 'feld.pflichtenkompass', JSON.stringify({ app: 'pflichtenkompass', formatVersion: 1, profil: {} }))
  await expect(page.getByRole('dialog', { name: '„feld.pflichtenkompass“ nicht geöffnet' })).toContainText('profil.personal: fehlt oder ist kein Objekt.')
  await page.getByRole('dialog').getByRole('button', { name: 'Schließen' }).click()

  // über 1 MB: abgelehnt, bevor die Datei gelesen wird
  await oeffneDatei(page, 'gross.pflichtenkompass', ' '.repeat(1024 * 1024 + 1))
  await expect(page.getByRole('dialog', { name: '„gross.pflichtenkompass“ nicht geöffnet' })).toContainText('größer als 1 MB')
  await page.getByRole('dialog').getByRole('button', { name: 'Schließen' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pflichten-Kompass')
})
