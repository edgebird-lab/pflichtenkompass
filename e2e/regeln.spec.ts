/**
 * Schritt 2.3: Die DMN-Datei öffnet sich in dmn-js (wie auf demo.bpmn.io) mit DRD und
 * allen Tabellen. Geladen wird das fertige Bundle von dmn-js 18 in eine leere Seite;
 * die App selbst zeigt die Regeln erst ab Schritt 4.7.
 */
import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

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
