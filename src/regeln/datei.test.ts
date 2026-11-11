/**
 * Schritt 2.3: Aufbau von regeln/pflichten.dmn unabhängig vom eigenen Lader,
 * direkt mit dmn-moddle gelesen. Dass dmn-js den DRD zeigt, prüft e2e/regeln.spec.ts.
 */
import { DmnModdle, type ModdleElement } from 'dmn-moddle'
import { describe, expect, it } from 'vitest'
import xml from '../../regeln/pflichten.dmn?raw'

type El = ModdleElement & Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

async function lies() {
  const { rootElement, warnings } = await new DmnModdle().fromXML(xml)
  return { definitionen: rootElement as El, warnings }
}

describe('regeln/pflichten.dmn (2.3)', () => {
  it('ist gültiges DMN 1.3 ohne Warnungen beim Lesen', async () => {
    const { definitionen, warnings } = await lies()
    expect(warnings).toEqual([])
    expect(definitionen.$type).toBe('dmn:Definitions')
    expect(xml).toContain('xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"')
    expect(xml).toContain('xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/"')
    expect(definitionen.name).toBe('Pflichten-Kompass 2026.11.0')
  })

  it('hat 7 Entscheidungstabellen mit 67 Regeln: GR 9, PE 7, BR 1, ST 16, BU 11, ON 3, LU 20', async () => {
    const { definitionen } = await lies()
    const entscheidungen = (definitionen.drgElement as El[]).filter((e) => e.$type === 'dmn:Decision')
    const zahlen = entscheidungen.map((e) => [e.name, (e.decisionLogic as El).rule.length])
    expect(zahlen).toEqual([
      ['Gründung und Anmeldung', 9],
      ['Personal', 7],
      ['Branchenpflichten', 1],
      ['Steuern', 16],
      ['Buchführung, Abschluss und Kasse', 11],
      ['Online und Verpackung', 3],
      ['Nicht geprüfte Bereiche', 20],
    ])
    expect(zahlen.reduce((s, [, n]) => s + (n as number), 0)).toBe(67)
  })

  it('nummeriert die Regeln je Tabelle fortlaufend (GR01, GR02, …)', async () => {
    const { definitionen } = await lies()
    for (const e of (definitionen.drgElement as El[]).filter((x) => x.$type === 'dmn:Decision')) {
      const regeln = (e.decisionLogic as El).rule as El[]
      const kuerzel = regeln[0].id!.slice(0, 2)
      expect(regeln.map((r) => r.id)).toEqual(regeln.map((_, i) => `${kuerzel}${String(i + 1).padStart(2, '0')}`))
    }
  })

  it('verbindet jede Entscheidung mit dem inputData „Merkmale“', async () => {
    const { definitionen } = await lies()
    const elemente = definitionen.drgElement as El[]
    expect(elemente.filter((e) => e.$type === 'dmn:InputData').map((e) => e.id)).toEqual(['Merkmale'])
    for (const e of elemente.filter((x) => x.$type === 'dmn:Decision')) {
      expect(e.informationRequirement.map((r: El) => r.requiredInput.href), e.id).toEqual(['#Merkmale'])
    }
  })

  it('enthält den DRD (DMNDI): eine Form je Element und eine Kante je Anforderung', async () => {
    const { definitionen } = await lies()
    const diagramme = (definitionen.dmnDI as El).diagrams as El[]
    expect(diagramme).toHaveLength(1)
    const elemente = diagramme[0].diagramElements as El[]
    const formen = elemente.filter((e) => e.$type === 'dmndi:DMNShape').map((e) => e.dmnElementRef.id)
    const kanten = elemente.filter((e) => e.$type === 'dmndi:DMNEdge').map((e) => e.dmnElementRef.id)
    const entscheidungen = (definitionen.drgElement as El[]).filter((e) => e.$type === 'dmn:Decision')
    expect(formen.sort()).toEqual(['Merkmale', ...entscheidungen.map((e) => e.id)].sort())
    expect(kanten.sort()).toEqual(entscheidungen.map((e) => e.informationRequirement[0].id).sort())
  })
})
