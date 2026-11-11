/**
 * Schritte 4.2 und 4.3: Sichtbarkeit nach 5.2, Fehler und Warnungen aus 6.9 am Feld;
 * E1: Beispiel A von Hand über den Assistenten, nur mit der Tastatur.
 */
import { expect, test, type Page } from '@playwright/test'
import { geheZu, oeffne, tabZu } from './hilfen.ts'

const frage = (page: Page, text: string) => page.getByText(text, { exact: false })

test('4.2: Fragen erscheinen nach den Bedingungen aus 5.2', async ({ page }) => {
  await oeffne(page)
  await geheZu(page, 'Vorhaben')
  const gbr = 'Ist die GbR im Gesellschaftsregister eingetragen?'
  const kaufmaennisch = 'Braucht der Betrieb nach Art und Umfang eine kaufmännische Einrichtung?'
  await expect(frage(page, gbr)).toHaveCount(0)
  await expect(frage(page, kaufmaennisch)).toBeVisible()

  await page.getByRole('radio', { name: 'GbR' }).check()
  await expect(frage(page, gbr)).toBeVisible()
  await page.getByRole('radio', { name: 'freiberuflich' }).check()
  await expect(frage(page, kaufmaennisch)).toHaveCount(0)
  await page.getByRole('radio', { name: 'GmbH' }).check()
  await page.getByRole('radio', { name: 'gewerblich' }).check()
  await expect(frage(page, gbr)).toHaveCount(0)
  await expect(frage(page, kaufmaennisch)).toHaveCount(0)

  await geheZu(page, 'Tätigkeit')
  await expect(frage(page, 'Welche Art von Handwerk?')).toHaveCount(0)
  await page.getByRole('checkbox', { name: 'Handwerk' }).check()
  await expect(frage(page, 'Welche Art von Handwerk?')).toBeVisible()
  // Standard „ja bei Gastronomie“ für F11 und F17
  const lebensmittel = page.getByRole('group', { name: /Werden Lebensmittel hergestellt/ })
  await expect(lebensmittel.getByRole('radio', { name: 'nein' })).toBeChecked()
  await page.getByRole('checkbox', { name: 'Gastronomie' }).check()
  await expect(lebensmittel.getByRole('radio', { name: 'ja' })).toBeChecked()

  await geheZu(page, 'Personal')
  await expect(frage(page, 'Ab wann?')).toHaveCount(0)
  await page.getByRole('group', { name: /Gibt es Beschäftigte/ }).getByRole('radio', { name: 'ja' }).check()
  await expect(frage(page, 'Ab wann?')).toBeVisible()
  await expect(page.getByRole('group', { name: /Sofortmeldepflicht/ }).getByRole('radio', { name: 'ja' })).toBeChecked()
  await expect(frage(page, 'einheitliche Pauschsteuer')).toHaveCount(0)
  await page.getByLabel('Wie viele Minijobs mit geringfügigem Entgelt?').fill('2')
  await expect(frage(page, 'einheitliche Pauschsteuer')).toBeVisible()
  // Lohnsteuer im ersten Monat nur mit Lohnsteuerabzug (F14 > 0 oder Minijobs ohne Pauschsteuer)
  await expect(frage(page, 'Wie hoch ist die Lohnsteuer')).toHaveCount(0)
  await page.getByLabel('Wie viele sozialversicherungspflichtig Beschäftigte?').fill('1')
  await expect(frage(page, 'Wie hoch ist die Lohnsteuer')).toBeVisible()

  await geheZu(page, 'Verkauf')
  await expect(frage(page, 'Wann wurde die elektronische Kasse angeschafft?')).toHaveCount(0)
  await page.getByRole('radio', { name: 'elektronische Kasse oder Kassen-App' }).check()
  await expect(frage(page, 'Wann wurde die elektronische Kasse angeschafft?')).toBeVisible()
  await expect(page.getByRole('group', { name: /Wird Bargeld angenommen/ }).getByRole('radio', { name: 'ja' })).toBeChecked()

  await geheZu(page, 'Umsatz und Steuern')
  // GmbH: keine ESt-Vorauszahlungen; Start im Folgemonat (Dezember 2026) zeigt F29
  await expect(frage(page, 'Einkommensteuer-Vorauszahlungen')).toHaveCount(0)
  await expect(frage(page, 'Umsatzsteuer-Zahllast 2026')).toBeVisible()
  await page.getByRole('group', { name: /Kleinunternehmerregelung genutzt/ }).getByRole('radio', { name: 'ja' }).check()
  await expect(frage(page, 'Umsatzsteuer-Zahllast 2026')).toHaveCount(0)
  await expect(frage(page, 'Dauerfristverlängerung')).toHaveCount(0)
})

test('4.3: Fehler und Warnungen stehen am Feld', async ({ page }) => {
  await oeffne(page)
  await geheZu(page, 'Vorhaben')
  // Pflichtangabe ohne Antwort: ruhiger Hinweis am Feld
  await expect(page.getByLabel('In welchem Bundesland liegt der Betrieb?')).toHaveAccessibleDescription(/Bundesland wählen/)
  await page.getByLabel('In welchem Bundesland liegt der Betrieb?').selectOption('BE')
  await expect(page.getByLabel('In welchem Bundesland liegt der Betrieb?')).not.toHaveAccessibleDescription(/Bundesland wählen/)

  const beginn = page.getByLabel('Wann beginnt die Tätigkeit?')
  await beginn.fill('2031-01-01')
  await expect(beginn).toHaveAccessibleDescription(/zwischen 01\.01\.2026 und 31\.12\.2030/)
  await expect(beginn).toHaveAttribute('aria-invalid', 'true')
  await beginn.fill('2027-03-01')
  await expect(beginn).not.toHaveAttribute('aria-invalid', 'true')

  await geheZu(page, 'Personal')
  await page.getByRole('group', { name: /Gibt es Beschäftigte/ }).getByRole('radio', { name: 'ja' }).check()
  const sv = page.getByLabel('Wie viele sozialversicherungspflichtig Beschäftigte?')
  await expect(sv).toHaveAccessibleDescription(/Mindestens eine Person angeben/)
  await expect(page.getByRole('alert').filter({ hasText: 'Mindestens eine Person angeben' })).toBeVisible()
  await sv.fill('2,5')
  await expect(sv).toHaveAccessibleDescription(/Ganze Zahl ab 0/)
  await sv.fill('2')
  await expect(sv).not.toHaveAttribute('aria-invalid', 'true')
  const ab = page.getByLabel('Ab wann?')
  await ab.fill('2027-02-01')
  await expect(ab).toHaveAccessibleDescription(/vor der Tätigkeit am 01\.03\.2027/)

  await geheZu(page, 'Umsatz und Steuern')
  const umsatz = page.getByLabel('Wie hoch ist der Umsatz im ersten Kalenderjahr voraussichtlich (netto)?')
  await umsatz.fill('-5')
  await expect(umsatz).toHaveAccessibleDescription(/Betrag ab 0 angeben/)
  await umsatz.fill('150.000')
  await expect(umsatz).not.toHaveAttribute('aria-invalid', 'true')
  const klein = page.getByRole('group', { name: /Kleinunternehmerregelung genutzt/ })
  await klein.getByRole('radio', { name: 'ja' }).check()
  await expect(klein).toHaveAccessibleDescription(/nicht anwendbar/)
  await expect(page.getByRole('complementary', { name: 'Hilfe' })).toContainText('nicht anwendbar')

  // Ohne Fehler: Ergebnis mit Warnung oben
  await geheZu(page, 'Tätigkeit')
  await page.getByRole('checkbox', { name: 'Dienstleistung' }).check()
  await geheZu(page, 'Ergebnis')
  await expect(page.getByTestId('zusammenfassung')).toBeVisible()
  await expect(page.locator('.banner-warnung')).toContainText('Kleinunternehmerregelung nicht anwendbar')
})

test('E1: Beispiel A über den Assistenten, nur mit der Tastatur', async ({ page }) => {
  await oeffne(page)
  await tabZu(page, page.getByRole('button', { name: 'Neu beginnen' }))
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vorhaben')

  // Schritt 1: Name, Beginn, Bundesland; Rechtsform und Tätigkeit stehen schon richtig
  await tabZu(page, page.getByLabel('Wie heißt das Vorhaben?'))
  await page.keyboard.type('Kaffeeversand')
  await tabZu(page, page.getByLabel('Wann beginnt die Tätigkeit?'))
  await page.keyboard.type('15012027')
  await expect(page.getByLabel('Wann beginnt die Tätigkeit?')).toHaveValue('2027-01-15')
  await tabZu(page, page.getByLabel('In welchem Bundesland liegt der Betrieb?'))
  await page.keyboard.type('Nordrhein')
  await expect(page.getByLabel('In welchem Bundesland liegt der Betrieb?')).toHaveValue('NW')
  await tabZu(page, page.getByRole('button', { name: 'Weiter: Tätigkeit' }))
  await page.keyboard.press('Enter')

  // Schritt 2: Onlinehandel
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tätigkeit')
  await tabZu(page, page.getByRole('checkbox', { name: 'Onlinehandel' }))
  await page.keyboard.press('Space')
  await tabZu(page, page.getByRole('button', { name: 'Weiter: Personal' }))
  await page.keyboard.press('Enter')

  // Schritt 3: keine Beschäftigten (Standard)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Personal')
  await tabZu(page, page.getByRole('button', { name: 'Weiter: Verkauf' }))
  await page.keyboard.press('Enter')

  // Schritt 4: Privatleute in DE (Standard) und in der EU, Website ja; Verpackung folgt dem Onlinehandel
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Verkauf')
  await tabZu(page, page.getByRole('checkbox', { name: 'Privatleute in anderen EU-Staaten' }))
  await page.keyboard.press('Space')
  const website = page.getByRole('group', { name: /geschäftliche Website/ })
  await tabZu(page, website.getByRole('radio', { name: 'nein' }))
  await page.keyboard.press('ArrowLeft')
  await expect(website.getByRole('radio', { name: 'ja' })).toBeChecked()
  await expect(page.getByRole('group', { name: /Waren in Verpackungen/ }).getByRole('radio', { name: 'ja' })).toBeChecked()
  await tabZu(page, page.getByRole('button', { name: 'Weiter: Umsatz und Steuern' }))
  await page.keyboard.press('Enter')

  // Schritt 5: Umsatz, Gewinn, EU-Fernverkäufe
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Umsatz und Steuern')
  for (const [label, wert] of [
    ['Wie hoch ist der Umsatz im ersten Kalenderjahr voraussichtlich (netto)?', '60.000'],
    ['Wie hoch ist der Gewinn im ersten Kalenderjahr voraussichtlich?', '15.000'],
    ['Wie hoch sind die Verkäufe an Privatleute in anderen EU-Staaten je Jahr voraussichtlich?', '4.000'],
  ] as const) {
    await tabZu(page, page.getByLabel(label))
    await page.keyboard.press('Control+A')
    await page.keyboard.type(wert)
  }
  await tabZu(page, page.getByRole('button', { name: 'Weiter: Ergebnis' }))
  await page.keyboard.press('Enter')

  // Ergebnis: 13 Pflichten, 7 Lücken; „Warum?“ beim Impressum nennt den Online-Auftritt
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ergebnis')
  await expect(page.getByTestId('zusammenfassung')).toHaveText(/^13 Pflichten und 7 Hinweise/)
  const warum = page.locator('article[data-pflicht="impressum"] summary')
  await tabZu(page, warum, 300)
  await page.keyboard.press('Enter')
  await expect(page.locator('article[data-pflicht="impressum"] .warum')).toContainText('Online-Auftritt: ja')
})
