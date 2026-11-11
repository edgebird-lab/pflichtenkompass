/**
 * Schritt 2.3: Die DMN-Datei öffnet sich in dmn-js (wie auf demo.bpmn.io) mit DRD und
 * allen Tabellen; geprüft mit dem fertigen Bundle von dmn-js 18 in einer leeren Seite.
 * Schritt 4.7, E6: die Regelansicht in der App.
 */
import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { geheZu, ladeBeispiel, oeffne, sammleFehler } from './hilfen.ts'

const pfad = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url))
const XML = readFileSync(pfad('regeln/pflichten.dmn'), 'utf8')
const ASSETS = 'node_modules/dmn-js/dist/assets/'

test('dmn-js zeigt den DRD mit 7 Entscheidungen und alle Tabellen mit 67 Regeln', async ({ page }) => {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(e.message))
  await page.setContent('<!doctype html><html lang="de"><body><div id="dmn" style="width:1500px;height:700px"></div></body></html>')
  for (const css of ['dmn-js-shared.css', 'dmn-js-drd.css', 'dmn-js-decision-table.css', 'dmn-font/css/dmn-embedded.css']) await page.addStyleTag({ path: pfad(ASSETS + css) })
  await page.addScriptTag({ path: pfad('node_modules/dmn-js/dist/dmn-navigated-viewer.production.min.js') })

  const drd = await page.evaluate(async (xml) => {
    const w = window as unknown as { DmnJS: new (o: object) => any; viewer: any }
    w.viewer = new w.DmnJS({ container: '#dmn' })
    const { warnings } = await w.viewer.importXML(xml)
    const register = w.viewer.getActiveViewer().get('elementRegistry')
    const anzahl = (typ: string) => register.filter((e: { type: string }) => e.type === typ).length
    return { warnungen: warnings.length, ansicht: w.viewer.getActiveView().type, entscheidungen: anzahl('dmn:Decision'), eingaben: anzahl('dmn:InputData'), kanten: anzahl('dmn:InformationRequirement') }
  }, XML)
  expect(drd).toEqual({ warnungen: 0, ansicht: 'drd', entscheidungen: 7, eingaben: 1, kanten: 7 })
  // Lizenz von dmn-js: das bpmn.io-Wasserzeichen bleibt sichtbar
  await expect(page.locator('.bjs-powered-by')).toBeVisible()

  const tabellen = await page.evaluate(async () => {
    const viewer = (window as unknown as { viewer: any }).viewer
    const ergebnis: [string, number, string[]][] = []
    for (const ansicht of viewer.getViews().filter((v: { type: string }) => v.type === 'decisionTable')) {
      await viewer.open(ansicht)
      const zeilen = [...document.querySelectorAll('.tjs-table tbody tr')]
      const ids = zeilen.map((z) => z.querySelector('[data-row-id]')?.getAttribute('data-row-id') ?? '')
      ergebnis.push([ansicht.name, zeilen.length, ids])
    }
    return ergebnis
  })
  expect(tabellen.map(([name, n]) => [name, n])).toEqual([
    ['Gründung und Anmeldung', 9],
    ['Personal', 7],
    ['Branchenpflichten', 1],
    ['Steuern', 16],
    ['Buchführung, Abschluss und Kasse', 11],
    ['Online und Verpackung', 3],
    ['Nicht geprüfte Bereiche', 20],
  ])
  // Die Zeilen tragen die Regel-ID im Attribut data-row-id (für die Trefferhervorhebung in 4.7)
  expect(tabellen[0][2]).toEqual(['GR01', 'GR02', 'GR03', 'GR04', 'GR05', 'GR06', 'GR07', 'GR08', 'GR09'])
  expect(fehler).toEqual([])
})

test('E6: Regelansicht in der App mit DRD, Treffern in „Steuern“, Wasserzeichen und ohne CSP-Meldung', async ({ page }) => {
  const fehler = sammleFehler(page)
  await oeffne(page)
  await ladeBeispiel(page, 'A')
  await geheZu(page, 'Regeln')
  const leinwand = page.locator('.dmn-leinwand')
  await expect(leinwand.locator('.djs-element[data-element-id^="Entscheidung_"]')).toHaveCount(7)
  await expect(leinwand.locator('.djs-element.pk-hat-treffer')).toHaveCount(5) // A: alle außer Personal und Branchenpflichten
  await expect(leinwand.locator('.bjs-powered-by')).toBeVisible()
  await expect(page.locator('dl.stand')).toContainText('a03b1678b126')
  await expect(page.locator('dl.stand')).toContainText('GR 9 · PE 7 · BR 1 · ST 16 · BU 11 · ON 3 · LU 20')

  const steuern = page.getByRole('button', { name: /^Steuern/ })
  const treffer = Number((await steuern.textContent())?.match(/\((\d+) Treffer\)/)?.[1])
  expect(treffer).toBeGreaterThan(0)
  await steuern.click()
  await expect(steuern).toHaveAttribute('aria-pressed', 'true')
  await expect(leinwand.locator('.tjs-table')).toBeVisible()
  await expect(leinwand.locator('tr.pk-treffer')).toHaveCount(treffer)
  await expect(leinwand.locator('.bjs-powered-by')).toBeVisible()
  // Bedienung von dmn-js auf Deutsch
  await expect(leinwand).toContainText('Trefferregel:')
  await expect(leinwand.locator('th').filter({ hasText: 'Wenn' }).first()).toBeVisible()
  await leinwand.getByRole('button', { name: 'Zur Übersicht (DRD)' }).click()
  await expect(page.getByRole('button', { name: 'Übersicht (DRD)' })).toHaveAttribute('aria-pressed', 'true')

  // Treffer auch als Liste, Quellen Q1–Q17
  const liste = page.getByRole('region', { name: 'Zutreffende Regeln bei diesem Profil' })
  await expect(liste).toContainText('GR01 Gewerbe anzeigen')
  await expect(page.locator('table.quellen tbody tr')).toHaveCount(17)
  expect(fehler).toEqual([])
})

test('Das Hauptbundle enthält dmn-js nicht; es lädt erst mit der Regelansicht', async ({ page }) => {
  const geladen: string[] = []
  page.on('request', (r) => geladen.push(r.url()))
  await oeffne(page)
  await ladeBeispiel(page, 'B')
  expect(geladen.some((u) => /RegelAnsicht-.*\.js$/.test(u))).toBe(false)
  await geheZu(page, 'Regeln')
  await expect(page.locator('.dmn-leinwand .djs-element').first()).toBeVisible()
  expect(geladen.some((u) => /RegelAnsicht-.*\.js$/.test(u))).toBe(true)
})

test('Eine Tabelle lässt sich wählen, während dmn-js noch lädt', async ({ page }) => {
  const fehler = sammleFehler(page)
  // Den Teil mit dmn-js verzögern, damit der Klick sicher vor dem Import landet. Ohne Verzögerung
  // traf der Test den Wettlauf nur auf einem ausgelasteten Rechner: Der Import öffnete den DRD
  // und überschrieb die schon gewählte Tabelle.
  await page.route(/\/RegelAnsicht-[^/]*\.js$/, async (route) => {
    await new Promise((fertig) => setTimeout(fertig, 800))
    await route.continue()
  })
  await oeffne(page)
  await ladeBeispiel(page, 'A')
  await geheZu(page, 'Regeln')
  // sofort klicken, ohne auf den DRD zu warten
  await page.getByRole('button', { name: /^Steuern/ }).click()
  await expect(page.locator('.dmn-leinwand .tjs-table')).toBeVisible()
  await expect(page.getByRole('button', { name: /^Steuern/ })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Regeln')
  expect(fehler).toEqual([])
})
