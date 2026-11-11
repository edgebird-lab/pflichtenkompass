/**
 * Schritt 4.4: Ergebnis mit Gruppen, Pflichtkarten, „Warum?“, Status, Notiz, Lücken und
 * Neu-Markierung; E2: Beispiele A–F laden.
 */
import { expect, test } from '@playwright/test'
import { geheZu, ladeBeispiel, oeffne, schrittleiste } from './hilfen.ts'

test('E2: Beispiele A–F ergeben 13, 9, 25, 20, 20 und 22 Pflichten', async ({ page }) => {
  await oeffne(page)
  const erwartet = { A: [13, 7], B: [9, 4], C: [25, 8], D: [20, 8], E: [20, 9], F: [22, 6] } as const
  for (const [id, [pflichten, luecken]] of Object.entries(erwartet) as [keyof typeof erwartet, readonly [number, number]][]) {
    await ladeBeispiel(page, id)
    await expect(page.getByTestId('zusammenfassung')).toHaveText(new RegExp(`^${pflichten} Pflichten und ${luecken} Hinweise`))
    await expect(page.locator('article.pflicht')).toHaveCount(pflichten)
    await expect(page.locator('article.luecke')).toHaveCount(luecken)
    await expect(schrittleiste(page)).toContainText(`Bisher ${pflichten} Pflichten`)
  }
})

test('Pflichtkarte zeigt Frist, Termin, Stelle, Normen, Quelle und „Warum?“', async ({ page }) => {
  await oeffne(page)
  await ladeBeispiel(page, 'D')
  const karte = page.locator('article[data-pflicht="sofortmeldung"]')
  await expect(karte.getByRole('heading')).toHaveText('11. Sofortmeldung abgeben')
  await expect(karte).toContainText('spätestens bei Aufnahme der Beschäftigung')
  await expect(karte).toContainText('Mo, 01.03.2027')
  await expect(karte).toContainText('Datenstelle der Rentenversicherung')
  await expect(karte.getByRole('link', { name: /§ 28a Abs\. 4 SGB IV/ })).toHaveAttribute('href', 'https://www.gesetze-im-internet.de/sgb_4/__28a.html')
  await expect(karte.getByRole('link', { name: /§ 28a Abs\. 4 SGB IV/ })).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(karte).toContainText('Stand 11.11.2026')
  await karte.locator('summary').click()
  // 9.3: genau ein Treffer (PE03) mit „Beschäftigte: 3“ und „Bereich mit Sofortmeldepflicht: ja“
  await expect(karte.locator('.warum-treffer')).toHaveCount(1)
  await expect(karte.locator('.warum')).toContainText('Regel PE03')
  await expect(karte.locator('.warum')).toContainText('Beschäftigte: 3 (Fragen 12, 14, 15)')
  await expect(karte.locator('.warum')).toContainText('Bereich mit Sofortmeldepflicht: ja')

  // Lücken: Kasten oben mit Sprungmarke, vollständig am Ende
  await expect(page.locator('.kasten-luecken')).toContainText('8 Bereiche')
  await page.getByRole('link', { name: 'Zu den nicht geprüften Bereichen' }).click()
  await expect(page.locator('#luecken')).toBeInViewport()
  await expect(page.locator('article.luecke').first()).toContainText('In Version 0.1 nicht geprüft')
})

test('Status, Notiz und Filter', async ({ page }) => {
  await oeffne(page)
  await ladeBeispiel(page, 'B')
  const karte = page.locator('article[data-pflicht="impressum"]')
  await karte.getByLabel('Status').selectOption('trifftNichtZu')
  await expect(karte.locator('.etikett')).toHaveText('trifft nicht zu')
  // Notiz höchstens 500 Zeichen; Längeres wird mit Hinweis gekürzt
  await karte.getByLabel('Notiz').fill('x'.repeat(520))
  await expect(karte.getByLabel('Notiz')).toHaveValue('x'.repeat(500))
  await expect(karte).toContainText('Auf 500 Zeichen gekürzt.')

  const filter = page.getByRole('group', { name: 'Filter' })
  await filter.getByLabel('Status').selectOption('trifftNichtZu')
  await expect(page.locator('article.pflicht')).toHaveCount(1)
  await filter.getByLabel('Status').selectOption('alle')
  await filter.getByLabel('Gruppe').selectOption('steuern')
  await expect(page.locator('article.pflicht')).toHaveCount(5) // B: 19, 20, 21, 25, 28
  await expect(filter).toContainText('5 von 9 Pflichten')
})

test('Neu-Markierung und entfallene Pflichten seit dem letzten Blick aufs Ergebnis', async ({ page }) => {
  await oeffne(page)
  await ladeBeispiel(page, 'A')
  await expect(page.locator('.etikett-neu')).toHaveCount(0)
  await geheZu(page, 'Personal')
  await page.getByRole('group', { name: /Gibt es Beschäftigte/ }).getByRole('radio', { name: 'ja' }).check()
  await page.getByLabel('Wie viele sozialversicherungspflichtig Beschäftigte?').fill('1')
  await geheZu(page, 'Verkauf')
  await page.getByRole('group', { name: /geschäftliche Website/ }).getByRole('radio', { name: 'nein' }).check()
  await geheZu(page, 'Ergebnis')
  // dazu: Betriebsnummer, SV-Anmeldung, Beitragsnachweis, Lohnunterlagen, Lohnsteuer; weg: Impressum
  await expect(page.locator('article.pflicht:has(.etikett-neu)')).toHaveCount(5)
  await expect(page.locator('article[data-pflicht="betriebsnummer"] .etikett-neu')).toHaveText('neu')
  await expect(page.getByRole('status').filter({ hasText: 'entfallen' })).toContainText('„Impressum bereitstellen“')
  // einmalig: beim nächsten Besuch ist nichts mehr neu
  await geheZu(page, 'Termine')
  await geheZu(page, 'Ergebnis')
  await expect(page.locator('.etikett-neu')).toHaveCount(0)
  await expect(page.getByRole('status').filter({ hasText: 'entfallen' })).toHaveCount(0)
})

test('Ohne Pflichtangaben nennt das Ergebnis, was fehlt, und springt zur Frage', async ({ page }) => {
  await oeffne(page)
  await geheZu(page, 'Ergebnis')
  await expect(page.getByRole('heading', { name: 'Es fehlen noch Angaben' })).toBeVisible()
  await page.getByRole('button', { name: 'Frage 3 im Schritt „Vorhaben“' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vorhaben')
  await expect(page.getByLabel('In welchem Bundesland liegt der Betrieb?')).toBeFocused()
})
