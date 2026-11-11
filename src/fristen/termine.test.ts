/**
 * Termine je Pflicht (Spezifikation 6.8, Tests TE1–TE12 aus 9.8). Erwartete Daten von Hand
 * nachgezählt; Wochentage über 01.01.2027 = Freitag, 01.01.2028 = Samstag, 01.01.2029 = Montag.
 */
import { beforeAll, describe, expect, it } from 'vitest'
import xml from '../../regeln/pflichten.dmn?raw'
import { pflicht } from '../katalog/pflichten'
import type { PflichtId } from '../katalog/typen'
import { beispiel } from '../modell/beispiele'
import type { Beispiel, Profil } from '../modell/typen'
import { horizont, werteAus } from '../regeln/auswertung'
import { ladeRegelwerk } from '../regeln/dmn'
import type { Regelwerk, Termin } from '../regeln/typen'
import { HINWEIS_UST_BEFREIUNG, HINWEIS_UST_O4 } from './berechnungen'
import { HINWEIS_UNVERZUEGLICH, jahresPeriode, monatsPerioden, quartalsPerioden, rechenweg, termineFuer, type TerminKontext } from './termine'

let regelwerk: Regelwerk
beforeAll(async () => {
  regelwerk = await ladeRegelwerk(xml, '')
})

function kontext(p: Profil, monate: 12 | 24 = 24): TerminKontext {
  if (!p.bundesland) throw new Error('Bundesland fehlt')
  return { profil: p, land: p.bundesland, horizont: horizont(p.start, monate) }
}

/** Termine aller Pflichten, die das Regelwerk für das Profil ausgibt. */
function alleTermine(p: Profil, monate: 12 | 24 = 24): Termin[] {
  return werteAus(regelwerk, p, { heute: '2026-11-11', horizontMonate: monate }).pflichten.flatMap((e) => e.termine)
}

const von = (liste: Termin[], id: PflichtId) => liste.filter((t) => t.pflichtId === id)
const tage = (liste: Termin[]) => liste.map((t) => t.faelligAm)
const mit = (id: Beispiel['id'], aendern: (p: Profil) => void): Profil => {
  const p = beispiel(id).profil
  aendern(p)
  return p
}

describe('Zeiträume', () => {
  it('bildet Monate, Quartale und Jahre mit Text und Schlüssel', () => {
    expect(monatsPerioden(2028)[1]).toEqual({ von: '2028-02-01', bis: '2028-02-29', text: 'Februar 2028', schluessel: '2028-02' })
    expect(quartalsPerioden(2027)[3]).toEqual({ von: '2027-10-01', bis: '2027-12-31', text: '4. Quartal 2027', schluessel: '2027-Q4' })
    expect(jahresPeriode(2027)).toEqual({ von: '2027-01-01', bis: '2027-12-31', text: '2027', schluessel: '2027' })
  })
})

describe('Beispiel A, Horizont 01.01.2027–31.12.2028 (TE1–TE4)', () => {
  let a: Termin[]
  beforeAll(() => {
    a = alleTermine(beispiel('A').profil)
  })

  it('TE1: 31 Termine insgesamt', () => {
    expect(a).toHaveLength(31)
  })

  it('TE2: Gründungstermine', () => {
    expect(tage(von(a, 'gewerbeanzeige'))).toEqual(['2027-01-15'])
    expect(tage(von(a, 'berufsgenossenschaft'))).toEqual(['2027-01-22'])
    expect(tage(von(a, 'steuerlicheErfassung'))).toEqual(['2027-02-15'])
    expect(tage(von(a, 'impressum'))).toEqual(['2027-01-15'])
    expect(tage(von(a, 'verpackung'))).toEqual(['2027-01-15'])
    expect(von(a, 'gewerbeanzeige')[0]).toMatchObject({ titel: 'Gewerbe anzeigen', art: 'handlung', gesetzlichBis: null })
    expect(von(a, 'steuerlicheErfassung')[0].art).toBe('abgabe')
  })

  it('TE3: 23 Voranmeldungen, Zahlungstermin unverschoben, 6-mal „gesetzlich bis“', () => {
    const ust = von(a, 'ustVoranmeldung')
    expect(ust).toHaveLength(23)
    expect(ust[0]).toMatchObject({ faelligAm: '2027-02-10', zeitraum: 'Januar 2027', titel: 'Umsatzsteuer-Voranmeldung', art: 'abgabeUndZahlung', schluessel: '2027-01' })
    expect(ust.at(-1)).toMatchObject({ faelligAm: '2028-12-10', gesetzlichBis: '2028-12-11', zeitraum: 'November 2028' })
    expect(ust.find((t) => t.zeitraum === 'März 2027')).toMatchObject({ faelligAm: '2027-04-10', gesetzlichBis: '2027-04-12' })
    expect(ust.filter((t) => t.gesetzlichBis !== null).map((t) => t.zeitraum)).toEqual(['März 2027', 'Juni 2027', 'September 2027', 'Mai 2028', 'August 2028', 'November 2028'])
  })

  it('TE4: Jahresfristen; keine Termine für ESt-Vorauszahlungen und EU-Fernverkauf', () => {
    expect(von(a, 'ustJahreserklaerung').map((t) => [t.zeitraum, t.faelligAm])).toEqual([['2027', '2028-07-31']])
    expect(tage(von(a, 'einkommensteuererklaerung'))).toEqual(['2028-07-31'])
    expect(von(a, 'verpackungDatenmeldung').map((t) => [t.zeitraum, t.faelligAm])).toEqual([['2027', '2028-06-01']])
    expect(von(a, 'estVorauszahlungen')).toEqual([])
    expect(von(a, 'euFernverkauf')).toEqual([])
  })

  it('kürzt die Liste bei 12 Monaten Horizont', () => {
    const kurz = alleTermine(beispiel('A').profil, 12)
    expect(von(kurz, 'ustVoranmeldung')).toHaveLength(11) // Januar bis November 2027
    expect(kurz.every((t) => t.faelligAm >= '2027-01-01' && t.faelligAm <= '2027-12-31')).toBe(true)
  })
})

describe('Beispiel C, Horizont 01.04.2027–31.03.2029 (TE5–TE11)', () => {
  let c: Termin[]
  beforeAll(() => {
    c = alleTermine(beispiel('C').profil)
  })

  it('TE5: Fragebogen am Mo, 03.05.2027 (01.05. ist Samstag und Feiertag)', () => {
    expect(tage(von(c, 'steuerlicheErfassung'))).toEqual(['2027-05-03'])
  })

  it('TE6: Lohnsteuer monatlich ab 10.05.2027; Bescheinigung 2027 am 29.02.2028', () => {
    const lst = von(c, 'lohnsteuer').filter((t) => t.titel === 'Lohnsteuer-Anmeldung')
    expect(lst[0]).toMatchObject({ faelligAm: '2027-05-10', zeitraum: 'April 2027', art: 'abgabeUndZahlung' })
    expect(lst.every((t) => !t.zeitraum?.includes('Quartal'))).toBe(true)
    expect(von(c, 'lohnsteuer').find((t) => t.schluessel === 'bescheinigung-2027')).toMatchObject({ faelligAm: '2028-02-29', art: 'abgabe', titel: 'Lohnsteuerbescheinigung übermitteln' })
  })

  it('TE7: Voranmeldung mit Dauerfrist und Sondervorauszahlungen', () => {
    const ust = von(c, 'ustVoranmeldung')
    expect(ust.find((t) => t.zeitraum === 'April 2027')?.faelligAm).toBe('2027-06-10')
    const svz = ust.filter((t) => t.titel === 'Sondervorauszahlung anmelden und zahlen')
    expect(svz.map((t) => [t.zeitraum, t.faelligAm, t.gesetzlichBis])).toEqual([
      ['2027', '2027-05-10', null],
      ['2028', '2028-02-10', null],
      ['2029', '2029-02-10', '2029-02-12'],
    ])
  })

  it('TE8: Beitragsnachweis April 2027 einen Arbeitstag vor dem Nachweistag', () => {
    const april = von(c, 'beitragsnachweis').find((t) => t.zeitraum === 'April 2027')
    expect(april).toMatchObject({ faelligAm: '2027-04-23', gesetzlichBis: '2027-04-26', art: 'abgabeUndZahlung' })
    expect(april?.hinweis).toContain('26.04.2027')
    expect(april?.hinweis).toContain('28.04.2027')
    expect(von(c, 'beitragsnachweis')).toHaveLength(24) // April 2027 bis März 2029
  })

  it('Beschäftigung lange vor dem Start (F13 nur mit Warnung): Termine nur im Horizont, Rechnung bleibt schnell', () => {
    // vorher rechnete die App jeden Monat und jedes Jahr ab F13 durch: rund 0,5–0,8 s je Auswertung bei F13 = 01.01.1000
    const frueh = mit('C', (x) => {
      x.personal.beginn = '1000-01-01'
    })
    const t0 = performance.now()
    for (let i = 0; i < 5; i++) alleTermine(frueh)
    expect(performance.now() - t0).toBeLessThan(1000)
    const liste = alleTermine(frueh)
    // SV: dieselben 24 Monate wie mit Beginn am Start, weil der Termin eines Monats in diesem Monat liegt
    expect(von(liste, 'beitragsnachweis')).toEqual(von(c, 'beitragsnachweis'))
    // Lohnsteuer ab Vorjahreswert unbekannt monatlich; März 2027 ist am Sa, 10.04.2027 dran (gesetzlich bis Mo, 12.04.)
    const anmeldungen = von(liste, 'lohnsteuer').filter((t) => t.titel === 'Lohnsteuer-Anmeldung')
    expect(anmeldungen[0]).toMatchObject({ zeitraum: 'März 2027', faelligAm: '2027-04-10', gesetzlichBis: '2027-04-12' })
    expect(von(liste, 'lohnsteuer').filter((t) => t.titel !== 'Lohnsteuer-Anmeldung').map((t) => [t.zeitraum, t.faelligAm])).toEqual([
      ['2027', '2028-02-29'],
      ['2028', '2029-02-28'],
    ])
    expect(rechenweg('lohnsteuer', kontext(frueh))).toEqual(['Anmeldungszeitraum: 2026 monatlich, 2027 monatlich, 2028 monatlich, 2029 monatlich.'])
  })

  it('TE9: Jahresabschluss und Offenlegung', () => {
    expect(von(c, 'jahresabschluss').map((t) => [t.zeitraum, t.faelligAm])).toEqual([
      ['2027', '2028-03-31'],
      ['2028', '2029-03-31'],
    ])
    expect(von(c, 'jahresabschluss')[0].hinweis).toContain('30.06.2028')
    expect(von(c, 'offenlegung').map((t) => [t.zeitraum, t.faelligAm])).toEqual([['2027', '2028-12-31']])
  })

  it('TE10: Umsatzsteuererklärung und E-Bilanz 2027 mit Beratung am 28.02.2029', () => {
    expect(tage(von(c, 'ustJahreserklaerung'))).toEqual(['2029-02-28'])
    expect(tage(von(c, 'eBilanz'))).toEqual(['2029-02-28'])
    expect(von(c, 'eBilanz')[0].hinweis).toContain('§ 149 Abs. 3 AO')
  })

  it('TE11: E-Rechnungen ausstellen ab 01.01.2028', () => {
    expect(von(c, 'eRechnungAusstellen')).toEqual([
      expect.objectContaining({ titel: 'E-Rechnungen ausstellen ab 01.01.2028', faelligAm: '2028-01-01', art: 'handlung', gesetzlichBis: null }),
    ])
  })
})

describe('Beispiel D, Horizont 01.03.2027–28.02.2029 (TE12)', () => {
  it('TE12: Kasse mitteilen am 15.03.2027; Bescheinigung und Belehrung nach § 43 IfSG', () => {
    const d = alleTermine(beispiel('D').profil)
    expect(von(d, 'elektronischeKasse')).toEqual([expect.objectContaining({ titel: 'Kasse dem Finanzamt mitteilen', faelligAm: '2027-03-15', art: 'abgabe' })])
    const ifsg = von(d, 'infektionsschutz')
    expect(ifsg.map((t) => [t.schluessel, t.faelligAm])).toEqual([
      ['bescheinigung-2027-03-01', '2027-03-01'],
      ['belehrung-2027-03-01', '2027-03-01'],
    ])
    expect(ifsg[0].hinweis).toContain('frühestens ausgestellt am 01.12.2026')
  })
})

describe('Weitere Fristregeln', () => {
  it('nennt bei „unverzüglich“ die Bedeutung (Transparenzregister bei C)', () => {
    const c = alleTermine(beispiel('C').profil)
    expect(von(c, 'transparenzregister')).toEqual([expect.objectContaining({ faelligAm: '2027-04-01', hinweis: HINWEIS_UNVERZUEGLICH })])
  })

  it('E: 4. Quartal 2026 vierteljährlich mit Befreiungshinweis, ab 2027 monatlich mit Prüfhinweis O4', () => {
    const e = alleTermine(beispiel('E').profil)
    const ust = von(e, 'ustVoranmeldung')
    expect(ust[0]).toMatchObject({ zeitraum: '4. Quartal 2026', faelligAm: '2027-01-10', gesetzlichBis: '2027-01-11', hinweis: HINWEIS_UST_BEFREIUNG })
    expect(ust[1]).toMatchObject({ zeitraum: 'Januar 2027', faelligAm: '2027-02-10', hinweis: HINWEIS_UST_O4 })
    // Zusammenfassende Meldung: 25. nach Quartalsende, nach § 108 Abs. 3 AO verschoben
    expect(tage(von(e, 'zusammenfassendeMeldung')).slice(0, 4)).toEqual(['2027-01-25', '2027-04-26', '2027-07-26', '2027-10-25'])
  })

  it('beantragt bei vierteljährlicher Abgabe im ersten Jahr nur die Dauerfristverlängerung', () => {
    const p = mit('E', (x) => {
      x.steuern.dauerfristverlaengerung = true
    })
    const ust = von(alleTermine(p), 'ustVoranmeldung')
    expect(ust.find((t) => t.schluessel === 'dauerfrist-2026')).toMatchObject({ titel: 'Dauerfristverlängerung beantragen', faelligAm: '2027-01-10', gesetzlichBis: '2027-01-11' })
    expect(ust.find((t) => t.zeitraum === '4. Quartal 2026')?.faelligAm).toBe('2027-02-10')
    expect(ust.filter((t) => t.titel.startsWith('Sondervorauszahlung')).map((t) => t.faelligAm)).toEqual(['2027-02-10', '2028-02-10'])
  })

  it('F: Lohnsteuer vierteljährlich, ESt-Vorauszahlungen mit „gesetzlich bis“ am Wochenende', () => {
    const f = alleTermine(beispiel('F').profil)
    const anmeldungen = von(f, 'lohnsteuer').filter((t) => t.titel === 'Lohnsteuer-Anmeldung')
    expect(anmeldungen.map((t) => t.zeitraum)).toEqual([
      '1. Quartal 2027',
      '2. Quartal 2027',
      '3. Quartal 2027',
      '4. Quartal 2027',
      '1. Quartal 2028',
      '2. Quartal 2028',
      '3. Quartal 2028',
      '4. Quartal 2028',
    ])
    expect(anmeldungen[0]).toMatchObject({ faelligAm: '2027-04-10', gesetzlichBis: '2027-04-12', hinweis: null })
    expect(anmeldungen[4].hinweis).toContain('Schätzung')
    const est = von(f, 'estVorauszahlungen')
    expect(est.map((t) => [t.faelligAm, t.gesetzlichBis])).toEqual([
      ['2027-03-10', null],
      ['2027-06-10', null],
      ['2027-09-10', null],
      ['2027-12-10', null],
      ['2028-03-10', null],
      ['2028-06-10', '2028-06-12'],
      ['2028-09-10', '2028-09-11'],
      ['2028-12-10', '2028-12-11'],
    ])
    expect(est[0].art).toBe('zahlung')
  })

  it('OSS nur über 10.000 €: Ende des Folgemonats, nie „gesetzlich bis“ (O16)', () => {
    const p = mit('A', (x) => {
      x.steuern.euFernverkaeufe = 12_000
    })
    const oss = von(alleTermine(p), 'euFernverkauf')
    expect(oss.map((t) => t.faelligAm)).toEqual(['2027-04-30', '2027-07-31', '2027-10-31', '2028-01-31', '2028-04-30', '2028-07-31', '2028-10-31'])
    expect(oss.every((t) => t.gesetzlichBis === null && t.art === 'abgabeUndZahlung')).toBe(true)
    expect(rechenweg('euFernverkauf', kontext(p))[0]).toContain('über der Schwelle')
    expect(rechenweg('euFernverkauf', kontext(beispiel('A').profil))[0]).toContain('nicht überschritten')
  })

  it('Kleinunternehmerregelung gewählt, aber über 100.000 €: F30 und F31 wirken (E21)', () => {
    // vorher blieben F30 und F31 ausgeblendet: keine OSS-Termine, „0 € … nicht überschritten“, keine Dauerfrist
    const p = mit('A', (x) => {
      Object.assign(x.steuern, { kleinunternehmer: true, umsatzErstesJahr: 150_000, euFernverkaeufe: 12_000, dauerfristverlaengerung: true })
    })
    const liste = alleTermine(p)
    expect(tage(von(liste, 'euFernverkauf'))).toEqual(['2027-04-30', '2027-07-31', '2027-10-31', '2028-01-31', '2028-04-30', '2028-07-31', '2028-10-31'])
    expect(rechenweg('euFernverkauf', kontext(p))[0]).toContain('12.000 € je Jahr liegen über der Schwelle')
    // Januar 2027 mit Dauerfristverlängerung am Mi, 10.03.2027; Sondervorauszahlung am Abgabetag der ersten Voranmeldung
    const ust = von(liste, 'ustVoranmeldung')
    expect(ust.find((t) => t.zeitraum === 'Januar 2027')?.faelligAm).toBe('2027-03-10')
    expect(ust.find((t) => t.schluessel === 'sondervorauszahlung-2027')?.faelligAm).toBe('2027-02-10')
  })

  it('setzt den Übergang nach § 68 VerpackDG nur bei Start vor dem 12.08.2026', () => {
    const frueh = mit('A', (x) => {
      x.start = '2026-05-04'
    })
    expect(von(termineFuer(pflicht('verpackung'), kontext(frueh)), 'verpackung').map((t) => [t.titel, t.faelligAm])).toEqual([
      ['Als Hersteller registrieren und an einem System beteiligen', '2026-05-04'],
      ['Systembeteiligung nach VerpackDG neu abschließen', '2026-12-31'],
    ])
    expect(termineFuer(pflicht('verpackung'), kontext(beispiel('A').profil))).toHaveLength(1)
  })

  it('beschreibt den Rechenweg für Voranmeldung, Lohnsteuer und Vorauszahlungen', () => {
    expect(rechenweg('ustVoranmeldung', kontext(beispiel('E').profil))[0]).toBe('Voranmeldungszeitraum: 2026 vierteljährlich, 2027 monatlich, 2028 monatlich.')
    expect(rechenweg('ustVoranmeldung', kontext(beispiel('C').profil))).toHaveLength(2)
    expect(rechenweg('lohnsteuer', kontext(beispiel('F').profil))[0]).toBe('Anmeldungszeitraum: 2027 vierteljährlich (Jahreslohnsteuer 4.200 €), 2028 vierteljährlich (Jahreslohnsteuer 4.200 €), 2029 monatlich.')
    expect(rechenweg('estVorauszahlungen', kontext(beispiel('A').profil))).toEqual(['Keine Termine: Das Finanzamt hat keine Vorauszahlungen festgesetzt (Frage 32).'])
    expect(rechenweg('gewerbeanzeige', kontext(beispiel('A').profil))).toEqual([])
  })
})

describe('Allgemeine Eigenschaften (alle Beispiele)', () => {
  for (const id of ['A', 'B', 'C', 'D', 'E', 'F'] as const) {
    it(`${id}: Termine im Horizont, eindeutige Schlüssel, „gesetzlich bis“ nie früher`, () => {
      const p = beispiel(id).profil
      const h = horizont(p.start, 24)
      const liste = alleTermine(p)
      expect(liste.every((t) => t.faelligAm >= h.von && t.faelligAm <= h.bis)).toBe(true)
      expect(liste.every((t) => t.gesetzlichBis === null || t.gesetzlichBis > t.faelligAm)).toBe(true)
      const schluessel = liste.map((t) => `${t.pflichtId}|${t.schluessel}`)
      expect(new Set(schluessel).size).toBe(schluessel.length)
    })
  }
})
