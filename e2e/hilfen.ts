/** Gemeinsame Hilfen der Browsertests. */
import AxeBuilder from '@axe-core/playwright'
import { expect, type Locator, type Page } from '@playwright/test'

/** „heute“ für alle Tests mit Datum: der Rechtsstand des Katalogs. */
export const HEUTE = new Date('2026-11-11T10:00:00')

export const SCHRITTE = ['Start', 'Vorhaben', 'Tätigkeit', 'Personal', 'Verkauf', 'Umsatz und Steuern', 'Ergebnis', 'Termine', 'Regeln'] as const

/** Öffnet die App mit festem Datum; Speicher und Einstellungen sind in jedem Test leer. */
export async function oeffne(page: Page): Promise<void> {
  await page.clock.setFixedTime(HEUTE)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}

export function schrittleiste(page: Page): Locator {
  return page.getByRole('navigation', { name: 'Schritte' })
}

export async function geheZu(page: Page, name: (typeof SCHRITTE)[number]): Promise<void> {
  await schrittleiste(page).getByRole('button', { name, exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(name === 'Start' ? 'Pflichten-Kompass' : name)
}

/** Lädt ein Beispiel von der Startseite; danach steht das Ergebnis da. */
export async function ladeBeispiel(page: Page, id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'): Promise<void> {
  await geheZu(page, 'Start')
  await page.getByRole('button', { name: new RegExp(`^Beispiel ${id}:`) }).click()
  // Mit vorhandenen Antworten fragt die App nach, bevor sie sie ersetzt
  const rueckfrage = page.getByRole('dialog', { name: /laden\?$/ })
  const ergebnis = page.getByRole('heading', { level: 1, name: 'Ergebnis' })
  await expect(rueckfrage.or(ergebnis)).toBeVisible()
  if (await rueckfrage.isVisible()) await rueckfrage.getByRole('button', { name: 'Beispiel laden' }).click()
  await expect(ergebnis).toBeVisible()
}

/** Prüft die Seite mit axe; schwere und kritische Befunde lassen den Test scheitern. */
export async function pruefeAxe(page: Page, wo: string): Promise<void> {
  const ergebnis = await new AxeBuilder({ page }).analyze()
  const schwer = ergebnis.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(schwer.map((v) => `${wo}: ${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`)).toEqual([])
}

/** Drückt Tab, bis `ziel` den Fokus hat (Bedienung nur mit der Tastatur). */
export async function tabZu(page: Page, ziel: Locator, hoechstens = 120): Promise<void> {
  for (let i = 0; i < hoechstens; i++) {
    await page.keyboard.press('Tab')
    if (await ziel.evaluate((el) => el === document.activeElement).catch(() => false)) return
  }
  throw new Error(`Mit Tab nicht erreicht: ${ziel}`)
}

/** Meldungen der Konsole und Seitenfehler sammeln (CSP-Verstöße erscheinen als Fehler). */
export function sammleFehler(page: Page): string[] {
  const meldungen: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') meldungen.push(m.text())
  })
  page.on('pageerror', (e) => meldungen.push(e.message))
  return meldungen
}
