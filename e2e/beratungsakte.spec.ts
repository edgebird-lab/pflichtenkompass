/**
 * Export „Für die Beratungsakte speichern“ im Ergebnis (Format Beratungsakte v1): Dialog mit
 * Vorbelegung, Pflichtfeld, Abbrechen, Escape und Fokus; Download mit geprüftem Inhalt; axe hell und dunkel.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { geheZu, ladeBeispiel, oeffne, pruefeAxe } from './hilfen.ts'

const TITEL = 'Für die Beratungsakte speichern'
const knopf = (page: Page) => page.getByRole('button', { name: TITEL })
const dialog = (page: Page) => page.getByRole('dialog', { name: TITEL })
const mandant = (page: Page) => dialog(page).getByRole('textbox', { name: 'Mandant', exact: true })

test('Dialog: Vorbelegung, Pflichtfeld, Abbrechen, Escape und Fokus; Speichern lädt die Akte herunter', async ({ page }) => {
  await oeffne(page)
  await ladeBeispiel(page, 'C')
  // Was das Ergebnis zeigt: Pflichtkarten, nicht geprüfte Bereiche, Warnungen
  const pflichten = await page.locator('article[data-pflicht]').count()
  const luecken = await page.locator('#luecken article').count()
  const warnungen = await page.locator('.banner-warnung li').count()
  expect([pflichten, luecken, warnungen]).toEqual([25, 8, 0])

  // Escape schließt, Fokus zurück auf den Knopf
  await knopf(page).click()
  await expect(dialog(page)).toBeVisible()
  await expect(mandant(page)).toBeFocused()
  await expect(mandant(page)).toHaveValue('Elektro GmbH')
  await expect(dialog(page)).toContainText('Enthält: 11 Kennzahlen, 9 Befunde, 25 Maßnahmen')
  await expect(dialog(page)).toContainText('Datei: Elektro-GmbH-pflichtenkompass-2026-11-11.beratungsakte.json')
  await expect(dialog(page)).toContainText('Keine Rechtsberatung.')
  await expect(dialog(page)).toContainText('Die Datei ist unverschlüsselt und enthält Daten des Mandanten.')
  await expect(dialog(page)).toContainText('keine Rechts- oder Steuerberatung')
  await page.keyboard.press('Escape')
  await expect(dialog(page)).toBeHidden()
  await expect(knopf(page)).toBeFocused()

  // Abbrechen ebenso
  await knopf(page).click()
  await dialog(page).getByRole('button', { name: 'Abbrechen' }).click()
  await expect(dialog(page)).toBeHidden()
  await expect(knopf(page)).toBeFocused()

  // Pflichtfeld: ohne Mandant kein Download, Meldung am Feld
  await knopf(page).click()
  await mandant(page).fill('  ')
  let heruntergeladen = false
  page.on('download', () => (heruntergeladen = true))
  await dialog(page).getByRole('button', { name: 'Speichern' }).click()
  await expect(dialog(page).getByRole('alert')).toHaveText('Bitte den Mandanten angeben.')
  await expect(mandant(page)).toHaveAttribute('aria-invalid', 'true')
  await expect(mandant(page)).toHaveAccessibleDescription('Bitte den Mandanten angeben.')
  await expect(mandant(page)).toBeFocused()
  expect(heruntergeladen).toBe(false)

  // Mandant mit Umlauten und Nummer: Dateiname folgt sofort
  await mandant(page).fill('Bäckerei Groß & Söhne GbR')
  await expect(dialog(page).getByRole('alert')).toHaveCount(0)
  await dialog(page).getByRole('textbox', { name: 'Mandantennummer (optional)' }).fill('K-0815')
  const dateiname = 'Bäckerei-Groß-&-Söhne-GbR-pflichtenkompass-2026-11-11.beratungsakte.json'
  await expect(dialog(page)).toContainText(dateiname)
  const [download] = await Promise.all([page.waitForEvent('download'), dialog(page).getByRole('button', { name: 'Speichern' }).click()])
  await expect(dialog(page)).toBeHidden()
  await expect(knopf(page)).toBeFocused()
  await expect(page.locator('p.meldung')).toHaveText(`Für die Beratungsakte gespeichert: ${dateiname}`)
  expect(download.suggestedFilename()).toBe(dateiname)

  const text = readFileSync(await download.path(), 'utf8')
  expect(text.charCodeAt(0)).not.toBe(0xfeff)
  const akte = JSON.parse(text)
  expect(akte.format).toBe('beratungsakte')
  expect(akte.formatVersion).toBe('1.0')
  expect(akte.erzeugtVon).toMatchObject({ app: 'pflichtenkompass', name: 'Pflichten-Kompass' })
  expect(akte.mandant).toEqual({ name: 'Bäckerei Groß & Söhne GbR', kennung: 'K-0815' })
  expect(akte.analyse).toEqual({ art: 'gruendungspflichten', titel: 'Elektro GmbH', stand: '2026-11-11' })
  expect(akte.massnahmen).toHaveLength(pflichten)
  expect(akte.befunde).toHaveLength(1 + luecken + warnungen)
  expect(akte.befunde[0]).toMatchObject({ kennung: 'hinweis:keine-rechtsberatung', schwere: 'hinweis' })
  expect(akte.kennzahlen.find((k: { kennung: string }) => k.kennung === 'pflichten').wert).toBe(pflichten)
  // Frist der Gewerbeanzeige wie auf der Pflichtkarte („Nächster Termin“)
  await expect(page.locator('article[data-pflicht="gewerbeanzeige"]')).toContainText('Do, 01.04.2027')
  expect(akte.massnahmen.find((m: { kennung: string }) => m.kennung === 'pflicht:gewerbeanzeige').frist).toBe('2027-04-01')
})

test('Status aus der Pflichtkarte kommt in die Akte', async ({ page }) => {
  await oeffne(page)
  await ladeBeispiel(page, 'A')
  await page.locator('article[data-pflicht="gewerbeanzeige"]').getByLabel('Status').selectOption('erledigt')
  await knopf(page).click()
  await expect(mandant(page)).toHaveValue('Kaffeeversand')
  const [download] = await Promise.all([page.waitForEvent('download'), dialog(page).getByRole('button', { name: 'Speichern' }).click()])
  expect(download.suggestedFilename()).toBe('Kaffeeversand-pflichtenkompass-2026-11-11.beratungsakte.json')
  const akte = JSON.parse(readFileSync(await download.path(), 'utf8'))
  const m = akte.massnahmen.find((x: { kennung: string }) => x.kennung === 'pflicht:gewerbeanzeige')
  expect(m).toMatchObject({ prioritaet: 'niedrig', erweiterungen: { pflichtenkompass: { status: 'erledigt' } } })
  expect(m.text).toContain('als „erledigt“ markiert')
  expect(akte.kennzahlen.find((k: { kennung: string }) => k.kennung === 'pflichten-erledigt').wert).toBe(1)
})

test('ohne Ergebnis gibt es den Knopf nicht', async ({ page }) => {
  await oeffne(page)
  await geheZu(page, 'Ergebnis')
  await expect(page.getByRole('heading', { name: 'Es fehlen noch Angaben' })).toBeVisible()
  await expect(knopf(page)).toHaveCount(0)
})

for (const schema of ['light', 'dark'] as const) {
  const art = schema === 'light' ? 'hell' : 'dunkel'
  test(`Knopf und Dialog ohne schwere Barrieren (${art})`, async ({ page }) => {
    test.setTimeout(60_000)
    await page.emulateMedia({ colorScheme: schema })
    await oeffne(page)
    await ladeBeispiel(page, 'C')
    await knopf(page).scrollIntoViewIfNeeded()
    await expect(knopf(page)).toBeVisible()
    await pruefeAxe(page, `Ergebnis mit Knopf (${art})`)
    // Bildschirmfotos nur auf Wunsch: BERATUNGSAKTE_BILDER=<Ordner>
    const bilder = process.env.BERATUNGSAKTE_BILDER
    if (bilder) {
      const reihe = (await knopf(page).locator('xpath=..').boundingBox())!
      await page.screenshot({ path: join(bilder, `pflichtenkompass-knopf-${art}.png`), clip: { x: Math.max(0, reihe.x - 24), y: Math.max(0, reihe.y - 120), width: Math.min(1440, reihe.width + 48), height: reihe.height + 200 } })
    }
    await knopf(page).click()
    await expect(dialog(page)).toBeVisible()
    await pruefeAxe(page, `Dialog (${art})`)
    if (bilder) await page.screenshot({ path: join(bilder, `pflichtenkompass-dialog-${art}.png`) })
    // auch mit Meldung am Feld
    await mandant(page).fill('')
    await dialog(page).getByRole('button', { name: 'Speichern' }).click()
    await expect(dialog(page).getByRole('alert')).toBeVisible()
    await pruefeAxe(page, `Dialog mit Meldung (${art})`)
    if (bilder) await dialog(page).screenshot({ path: join(bilder, `pflichtenkompass-dialog-meldung-${art}.png`) })
  })
}
