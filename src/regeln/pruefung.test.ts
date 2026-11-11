import { describe, expect, it } from 'vitest'
import xml from '../../regeln/pflichten.dmn?raw'
import { PFLICHTEN } from '../katalog/pflichten'
import type { Pflicht } from '../katalog/typen'
import { ladeRegelwerk, pruefeRegelwerk, RegelwerkFehler, wurzelNamensraum } from './dmn'
import { pruefeKatalog } from './pruefung'

/** Ersetzt genau eine Stelle; scheitert laut, wenn der Text nicht (eindeutig) vorkommt. */
function ersetze(text: string, alt: string | RegExp, neu: string): string {
  const treffer = typeof alt === 'string' ? text.split(alt).length - 1 : (text.match(new RegExp(alt.source, `${alt.flags.replace('g', '')}g`)) ?? []).length
  if (treffer !== 1) throw new Error(`„${String(alt)}“ kommt ${treffer}-mal vor`)
  return text.replace(alt, neu)
}

/** Ändert nur innerhalb des Elements <rule id="…">…</rule>. */
function inRegel(text: string, id: string, aendern: (regel: string) => string): string {
  const start = text.indexOf(`<rule id="${id}">`)
  const ende = text.indexOf('</rule>', start) + '</rule>'.length
  if (start < 0) throw new Error(`Regel ${id} fehlt`)
  return text.slice(0, start) + aendern(text.slice(start, ende)) + text.slice(ende)
}

async function codes(dmn: string) {
  const { fehler } = await pruefeRegelwerk(dmn)
  return fehler.map((f) => f.regel)
}

describe('Prüfung des Regelwerks (9.2)', () => {
  it('RV1: hitPolicy UNIQUE → V2', async () => {
    expect(await codes(xml.replace('hitPolicy="COLLECT"', 'hitPolicy="UNIQUE"'))).toEqual(['V2'])
  })

  it('RV2: aggregation SUM → V2', async () => {
    expect(await codes(xml.replace('hitPolicy="COLLECT"', 'hitPolicy="COLLECT" aggregation="SUM"'))).toEqual(['V2'])
  })

  it('RV3: Eingabeausdruck Merkmale.umsatz → V5', async () => {
    expect(await codes(ersetze(xml, '<text>Merkmale.umsatzErstesJahr</text>', '<text>Merkmale.umsatz</text>'))).toEqual(['V5'])
  })

  it('RV4: Eintrag "gmhb" steht nicht in den erlaubten Werten → V6', async () => {
    const dmn = inRegel(xml, 'GR04', (r) => ersetze(r, '<text>"ug","gmbh"</text>', '<text>"gmhb"</text>'))
    const { fehler } = await pruefeRegelwerk(dmn)
    expect(fehler.map((f) => f.regel)).toEqual(['V6'])
    expect(fehler[0].ort).toContain('GR04')
    expect(fehler[0].meldung).toContain('„gmhb“ steht nicht in den erlaubten Werten')
  })

  it('RV5: Eintrag > "a" → V6', async () => {
    const dmn = inRegel(xml, 'GR04', (r) => ersetze(r, '<text>"ug","gmbh"</text>', '<text>&gt; "a"</text>'))
    const { fehler } = await pruefeRegelwerk(dmn)
    expect(fehler.map((f) => f.regel)).toEqual(['V6'])
    expect(fehler[0].meldung).toContain('Vergleiche nur mit Zahlen')
  })

  it('RV6: Ausgabe "gibtsnicht" → V4', async () => {
    const dmn = inRegel(xml, 'ST05', (r) => ersetze(r, '<text>"rechnungen"</text>', '<text>"gibtsnicht"</text>'))
    expect(await codes(dmn)).toEqual(['V4'])
  })

  it('RV7: Regel ohne Annotationstext → V7', async () => {
    const dmn = inRegel(xml, 'GR02', (r) => ersetze(r, /<annotationEntry>[\s\S]*<\/annotationEntry>/, '<annotationEntry><text>  </text></annotationEntry>'))
    const { fehler } = await pruefeRegelwerk(dmn)
    expect(fehler.map((f) => f.regel)).toEqual(['V7'])
    expect(fehler[0].ort).toContain('GR02')
  })

  it('RV8: Namensraum von DMN 1.2 → V1', async () => {
    const dmn = ersetze(xml, 'xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"', 'xmlns="http://www.omg.org/spec/DMN/20180521/MODEL/"')
    expect(await codes(dmn)).toEqual(['V1'])
  })

  it('RV9: Regel GR01 gelöscht → V9, Gewerbeanzeige unerreichbar', async () => {
    const dmn = inRegel(xml, 'GR01', () => '')
    const { fehler } = await pruefeRegelwerk(dmn)
    expect(fehler.map((f) => f.regel)).toEqual(['V9'])
    expect(fehler[0].meldung).toContain('gewerbeanzeige')
  })

  it('RV10: die echte Datei hat keine Fehler', async () => {
    const { regelwerk, fehler } = await pruefeRegelwerk(xml)
    expect(fehler).toEqual([])
    expect(regelwerk?.tabellen.map((t) => t.regeln.length)).toEqual([9, 7, 1, 16, 11, 3, 20])
  })
})

describe('Prüfung des Regelwerks: weitere Fälle', () => {
  it('V1: fehlender Namensraum, Präfix und unlesbare Datei', async () => {
    expect(wurzelNamensraum(xml)).toBe('https://www.omg.org/spec/DMN/20191111/MODEL/')
    expect(wurzelNamensraum('<dmn:definitions xmlns:dmn="https://www.omg.org/spec/DMN/20191111/MODEL/" id="x">')).toBe('https://www.omg.org/spec/DMN/20191111/MODEL/')
    expect(wurzelNamensraum('<definitions id="x">')).toBeNull()
    expect(await codes('kein XML')).toEqual(['V1'])
    expect(await codes(xml.slice(0, 2000))).toEqual(['V1'])
  })

  it('V2: Entscheidung ohne Tabelle', async () => {
    const dmn = ersetze(xml, /<decisionTable id="Tabelle_Branchen"[\s\S]*?<\/decisionTable>/, '<literalExpression id="LE"><text>1</text></literalExpression>')
    const { fehler } = await pruefeRegelwerk(dmn)
    // ohne Tabelle ist auch der Infektionsschutz unerreichbar
    expect(fehler.map((f) => f.regel)).toEqual(['V2', 'V9'])
  })

  it('V3: falscher Ausgabename, falscher Typ, fehlende outputValues', async () => {
    expect(await codes(ersetze(xml, 'name="pflicht" typeRef="string">\n        <outputValues id="BR_A_W">', 'name="ergebnis" typeRef="string">\n        <outputValues id="BR_A_W">'))).toContain('V3')
    expect(await codes(ersetze(xml, '<output id="BR_A" label="Pflicht" name="pflicht" typeRef="string">', '<output id="BR_A" label="Pflicht" name="pflicht" typeRef="number">'))).toEqual(['V3'])
    expect(await codes(ersetze(xml, /<outputValues id="BR_A_W">[\s\S]*?<\/outputValues>/, ''))).toEqual(['V3'])
  })

  it('V4: outputValues mit unbekannter Pflicht, Ausgabe außerhalb der outputValues', async () => {
    expect(await codes(ersetze(xml, '<text>"infektionsschutz"</text>\n        </outputValues>', '<text>"infektionsschutz","zauberei"</text>\n        </outputValues>'))).toEqual(['V4'])
    const dmn = inRegel(xml, 'ST05', (r) => ersetze(r, '<text>"rechnungen"</text>', '<text>"impressum"</text>'))
    const { fehler } = await pruefeRegelwerk(dmn)
    expect(fehler.map((f) => f.regel)).toEqual(['V4'])
    expect(fehler[0].meldung).toContain('steht nicht in den outputValues')
  })

  it('V5: Typ passt nicht zum Merkmal, inputValues unvollständig', async () => {
    expect(await codes(ersetze(xml, '<inputExpression id="BR_E1_A" typeRef="boolean">', '<inputExpression id="BR_E1_A" typeRef="string">'))).toEqual(['V5'])
    expect(await codes(ersetze(xml, /(<inputValues id="GR_E1_W">\s*<text>)"einzelunternehmen","gbr","ug","gmbh"/, '$1"einzelunternehmen","gbr","ug"'))).toEqual(['V5'])
  })

  it('V6: Zahl der Einträge passt nicht zu den Eingaben', async () => {
    const dmn = inRegel(xml, 'BR01', (r) => ersetze(r, /<inputEntry id="BR01_E1">[\s\S]*?<\/inputEntry>/, ''))
    expect(await codes(dmn)).toEqual(['V6'])
  })

  it('V7: Annotationsspalte fehlt', async () => {
    expect(await codes(ersetze(xml, /(<\/output>\s*)<annotation name="Begründung" \/>(\s*<rule id="BR01">)/, '$1$2'))).toEqual(['V7'])
  })

  it('V8: doppelte und falsch gebaute Regel-IDs', async () => {
    // dmn-moddle verwirft die zweite Regel mit gleicher ID; dadurch fehlt auch ihre Pflicht (V9)
    const doppelt = await pruefeRegelwerk(ersetze(xml, '<rule id="GR02">', '<rule id="GR01">'))
    expect(doppelt.fehler.map((f) => f.regel)).toEqual(['V8', 'V9'])
    expect(doppelt.fehler[0].meldung).toContain('„GR01“ kommt mehrfach vor')
    expect(doppelt.fehler[1].meldung).toContain('steuerlicheErfassung')
    const falsch = ersetze(xml, '<rule id="BR01">', '<rule id="B1">')
    expect(await codes(falsch)).toEqual(['V8'])
  })

  it('V1: nicht lesbare Teile (Tippfehler im Element) sind Fehler statt stiller Verluste', async () => {
    const dmn = inRegel(xml, 'GR03', (r) => r.replace('<inputEntry id="GR03_E1">', '<inputEnty id="GR03_E1">').replace('</inputEntry>', '</inputEnty>'))
    const { fehler } = await pruefeRegelwerk(dmn)
    expect(fehler.map((f) => f.regel)).toEqual(['V1', 'V6'])
    expect(fehler[0].meldung).toContain('<inputEnty>')
  })

  it('V10: Lücke „Rundfunkbeitrag“ unerreichbar ohne LU11', async () => {
    const { fehler } = await pruefeRegelwerk(inRegel(xml, 'LU11', () => ''))
    expect(fehler.map((f) => [f.regel, f.ort])).toEqual([['V10', 'Lücke rundfunkbeitrag']])
  })

  it('V11: Katalog mit fehlender Norm, falscher Quelle, späterem Stand, verdrehter Gültigkeit', () => {
    expect(pruefeKatalog()).toEqual([])
    const kaputt: Pflicht[] = PFLICHTEN.map((p) => ({ ...p }))
    kaputt[0] = { ...kaputt[0], normen: [] }
    kaputt[1] = { ...kaputt[1], quellen: ['Q16'] }
    kaputt[2] = { ...kaputt[2], stand: '2026-11-12' }
    kaputt[3] = { ...kaputt[3], gueltigAb: '2027-01-01', gueltigBis: '2026-12-31' }
    kaputt[4] = { ...kaputt[4], quellen: [] }
    expect(pruefeKatalog(kaputt).map((f) => `${f.ort}: ${f.meldung}`)).toEqual([
      'Pflicht 1 (gewerbeanzeige): Keine Rechtsgrundlage.',
      'Pflicht 2 (steuerlicheErfassung): Quelle Q16 ist keine geöffnete Rechtsquelle (Q1–Q15).',
      'Pflicht 3 (handelsregister): Stand 2026-11-12 liegt nach dem Katalogstand 2026-11-11.',
      'Pflicht 4 (handelsregisterGmbh): Gültig ab 2027-01-01 liegt nach gültig bis 2026-12-31.',
      'Pflicht 5 (transparenzregister): Keine Quelle.',
    ])
    expect(pruefeKatalog(PFLICHTEN.slice(1)).map((f) => f.ort)).toEqual(['Katalog'])
  })

  it('sammelt mehrere Fehler und wirft sie beim Laden gemeinsam', async () => {
    const dmn = inRegel(xml.replace('hitPolicy="COLLECT"', 'hitPolicy="FIRST"'), 'LU11', () => '')
    await expect(ladeRegelwerk(dmn, '')).rejects.toBeInstanceOf(RegelwerkFehler)
    await expect(ladeRegelwerk(dmn, '')).rejects.toMatchObject({ fehler: [{ regel: 'V2' }, { regel: 'V10' }] })
  })
})

describe('Geladenes Regelwerk', () => {
  it('liest Tabellen, Eingaben, Einträge, Ausgaben und Begründungen', async () => {
    const r = await ladeRegelwerk(xml, 'abc')
    expect(r.sha256).toBe('abc')
    expect(r.tabellen.map((t) => [t.id, t.ausgabe])).toEqual([
      ['Entscheidung_Gruendung', 'pflicht'],
      ['Entscheidung_Personal', 'pflicht'],
      ['Entscheidung_Branchen', 'pflicht'],
      ['Entscheidung_Steuern', 'pflicht'],
      ['Entscheidung_Buchfuehrung', 'pflicht'],
      ['Entscheidung_Online', 'pflicht'],
      ['Entscheidung_Luecken', 'luecke'],
    ])
    const gr = r.tabellen[0]
    expect(gr.eingaben.map((e) => [e.merkmal, e.typ])).toEqual([
      ['rechtsform', 'string'],
      ['taetigkeit', 'string'],
      ['kaufmann', 'boolean'],
      ['personengesellschaftEingetragen', 'boolean'],
      ['handwerk', 'string'],
    ])
    expect(gr.eingaben[0]).toEqual({ id: 'GR_E1', label: 'Rechtsform', merkmal: 'rechtsform', typ: 'string', erlaubt: ['einzelunternehmen', 'gbr', 'ug', 'gmbh'] })
    expect(gr.eingaben[2].erlaubt).toBeNull()
    const gr03 = gr.regeln[2]
    expect(gr03.id).toBe('GR03')
    expect(gr03.ausgabe).toBe('handelsregister')
    expect(gr03.begruendung).toBe('Ein Handelsgewerbe macht zum Kaufmann oder zur OHG; beide gehören ins Handelsregister.')
    expect(gr03.eintraege.map((e) => e.text)).toEqual(['"einzelunternehmen","gbr"', '"gewerblich"', 'true', '-', '-'])
    expect(gr03.eintraege[0].test).toEqual({
      art: 'liste',
      negiert: false,
      tests: [
        { art: 'gleich', wert: 'einzelunternehmen' },
        { art: 'gleich', wert: 'gbr' },
      ],
    })
    // Begründung der LU-Regeln ist der Titel der Lücke (6.5)
    expect(r.tabellen[6].regeln.find((x) => x.id === 'LU19')?.begruendung).toBe('Kleinunternehmergrenze im Gründungsjahr')
  })
})
