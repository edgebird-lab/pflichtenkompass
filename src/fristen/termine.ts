/**
 * Termine je Pflicht und Fristregel (Spezifikation 6.8.2–6.8.9). Reine Funktionen:
 * Profil, Land und Horizont werden übergeben, `heute` braucht die Rechnung nicht.
 *
 * - Abgaben und Mitteilungen mit § 108 Abs. 3 AO: `faelligAm` ist der nächste Werktag.
 * - Zahlungen (USt, Lohnsteuer, ESt-Vorauszahlung): `faelligAm` bleibt unverschoben,
 *   `gesetzlichBis` ist der nächste Werktag, falls verschieden (O9).
 * - OSS: unverschoben und ohne `gesetzlichBis` (O16).
 * - Termine außerhalb des Horizonts entfallen.
 */
import { pflicht as katalogPflicht } from '../katalog/pflichten'
import type { Berechnung, Ereignis, FristRegel, Pflicht } from '../katalog/typen'
import { betragText } from '../modell/format'
import { merkmale } from '../modell/merkmale'
import type { Bundesland, Datum, Profil } from '../modell/typen'
import { wirksam } from '../modell/wirksam'
import type { Termin, TerminArt } from '../regeln/typen'
import { eRechnungAb, lstZeitraum, svFaelligkeit, ustFaelligkeit, ustZeitraum, type LstZeitraum, type UstZeitraum } from './berechnungen'
import { datum, datumText, jahrVon, maxDatum, MONATE, monatsErster, monatsLetzter, plusMonate, plusTage, tageImMonat, zerlege } from './datum'
import { fristNachEreignis, naechsterWerktag } from './feiertage'

export interface TerminKontext {
  profil: Profil
  land: Bundesland
  horizont: { von: Datum; bis: Datum }
}

/** Ein Abrechnungszeitraum: Monat, Quartal oder Kalenderjahr. */
export interface Periode {
  von: Datum
  bis: Datum
  /** „Januar 2027“, „1. Quartal 2027“, „2027“ */
  text: string
  /** „2027-01“, „2027-Q1“, „2027“ */
  schluessel: string
}

export function monatsPerioden(jahr: number): Periode[] {
  return MONATE.map((name, i) => ({
    von: datum(jahr, i + 1, 1),
    bis: datum(jahr, i + 1, tageImMonat(jahr, i + 1)),
    text: `${name} ${jahr}`,
    schluessel: `${jahr}-${String(i + 1).padStart(2, '0')}`,
  }))
}

export function quartalsPerioden(jahr: number): Periode[] {
  return [1, 2, 3, 4].map((q) => ({
    von: datum(jahr, q * 3 - 2, 1),
    bis: monatsLetzter(datum(jahr, q * 3, 1)),
    text: `${q}. Quartal ${jahr}`,
    schluessel: `${jahr}-Q${q}`,
  }))
}

export function jahresPeriode(jahr: number): Periode {
  return { von: datum(jahr, 1, 1), bis: datum(jahr, 12, 31), text: String(jahr), schluessel: String(jahr) }
}

function perioden(jahr: number, art: Exclude<UstZeitraum, 'keine'> | LstZeitraum): Periode[] {
  if (art === 'monat') return monatsPerioden(jahr)
  if (art === 'quartal') return quartalsPerioden(jahr)
  return [jahresPeriode(jahr)]
}

/** Jahre vom Beginn bis zum Ende des Horizonts. */
function jahreBis(vonJahr: number, horizont: TerminKontext['horizont']): number[] {
  const jahre: number[] = []
  for (let j = vonJahr; j <= jahrVon(horizont.bis); j++) jahre.push(j)
  return jahre
}

export const HINWEIS_UNVERZUEGLICH = 'Unverzüglich heißt ohne schuldhaftes Zögern.'

interface Teil {
  titel: string
  zeitraum?: string | null
  art: TerminArt
  hinweis?: string | null
  schluessel: string
}

/** Termin ohne Verschiebung. */
function fest(id: Pflicht['id'], am: Datum, t: Teil): Termin {
  return { pflichtId: id, titel: t.titel, faelligAm: am, gesetzlichBis: null, zeitraum: t.zeitraum ?? null, art: t.art, hinweis: t.hinweis ?? null, schluessel: t.schluessel }
}

/** Abgabe oder Mitteilung: nach § 108 Abs. 3 AO auf den nächsten Werktag verschoben. */
function abgabe(id: Pflicht['id'], roh: Datum, land: Bundesland, t: Teil): Termin {
  return fest(id, naechsterWerktag(roh, land), t)
}

/** Zahlung: unverschoben; das spätere gesetzliche Ende steht als `gesetzlichBis` (6.8.2). */
function zahlung(id: Pflicht['id'], roh: Datum, land: Bundesland, t: Teil): Termin {
  const verschoben = naechsterWerktag(roh, land)
  return { ...fest(id, roh, t), gesetzlichBis: verschoben === roh ? null : verschoben }
}

function ereignisDatum(e: Ereignis, p: Profil): Datum {
  const w = wirksam(p)
  if (e === 'beschaeftigung') return w.beschaeftigungsbeginn ?? p.start
  if (e === 'kassenanschaffung') return w.kassenanschaffung ?? p.start
  return p.start
}

/** Titel abweichend vom Katalog (6.8.3). */
const TITEL_NACH_EREIGNIS: Partial<Record<Pflicht['id'], string>> = {
  elektronischeKasse: 'Kasse dem Finanzamt mitteilen',
}

// Berechnete Fristen (6.8.4–6.8.9) -----------------------------------------------------

function ustVoranmeldung(k: TerminKontext): Termin[] {
  const p = k.profil
  const dauerfrist = wirksam(p).dauerfristverlaengerung
  return jahreBis(jahrVon(p.start), k.horizont).flatMap((jahr) => {
    const { zeitraum, hinweis } = ustZeitraum(jahr, p)
    if (zeitraum === 'keine') return []
    return perioden(jahr, zeitraum)
      .filter((per) => per.bis >= p.start)
      .map((per) =>
        zahlung('ustVoranmeldung', ustFaelligkeit(per.bis, dauerfrist), k.land, { titel: 'Umsatzsteuer-Voranmeldung', zeitraum: per.text, art: 'abgabeUndZahlung', hinweis, schluessel: per.schluessel }),
      )
  })
}

/** 6.8.4: Sondervorauszahlung bei monatlicher Abgabe mit Dauerfristverlängerung; bei vierteljährlicher Abgabe nur der Antrag. */
function sondervorauszahlung(k: TerminKontext): Termin[] {
  const p = k.profil
  if (!wirksam(p).dauerfristverlaengerung) return []
  const gj = jahrVon(p.start)
  return jahreBis(gj, k.horizont).flatMap((jahr): Termin[] => {
    const { zeitraum } = ustZeitraum(jahr, p)
    if (zeitraum === 'keine') return []
    if (jahr === gj) {
      // gesetzlicher Abgabetag der ersten Voranmeldung ohne Verlängerung (§ 48 Abs. 1–2 UStDV)
      const erste = perioden(jahr, zeitraum).find((per) => per.bis >= p.start)
      if (!erste) return []
      const roh = ustFaelligkeit(erste.bis, false)
      return zeitraum === 'monat'
        ? [zahlung('ustVoranmeldung', roh, k.land, { titel: 'Sondervorauszahlung anmelden und zahlen', zeitraum: String(jahr), art: 'abgabeUndZahlung', schluessel: `sondervorauszahlung-${jahr}` })]
        : [zahlung('ustVoranmeldung', roh, k.land, { titel: 'Dauerfristverlängerung beantragen', zeitraum: String(jahr), art: 'abgabe', schluessel: `dauerfrist-${jahr}` })]
    }
    if (zeitraum !== 'monat') return []
    return [zahlung('ustVoranmeldung', datum(jahr, 2, 10), k.land, { titel: 'Sondervorauszahlung anmelden und zahlen', zeitraum: String(jahr), art: 'abgabeUndZahlung', schluessel: `sondervorauszahlung-${jahr}` })]
  })
}

function beschaeftigungsbeginn(p: Profil): Datum {
  return wirksam(p).beschaeftigungsbeginn ?? p.start
}

/**
 * Erstes Jahr mit Lohnsteuerterminen im Horizont: Ein Jahr Y bringt Termine bis Anfang März Y+1
 * (Anmeldung am 10.01., Bescheinigung Ende Februar). Ältere Jahre fallen ohnehin heraus; ohne die
 * Grenze rechnete ein sehr früher Beschäftigungsbeginn (F13) Jahrhunderte durch.
 */
function erstesLohnsteuerjahr(k: TerminKontext): number {
  return Math.max(jahrVon(beschaeftigungsbeginn(k.profil)), jahrVon(k.horizont.von) - 1)
}

function lohnsteuer(k: TerminKontext): Termin[] {
  const p = k.profil
  const beginn = beschaeftigungsbeginn(p)
  return jahreBis(erstesLohnsteuerjahr(k), k.horizont).flatMap((jahr) => {
    const { zeitraum, hinweis } = lstZeitraum(jahr, p)
    return perioden(jahr, zeitraum)
      .filter((per) => per.bis >= beginn)
      .map((per) => zahlung('lohnsteuer', ustFaelligkeit(per.bis, false), k.land, { titel: 'Lohnsteuer-Anmeldung', zeitraum: per.text, art: 'abgabeUndZahlung', hinweis, schluessel: per.schluessel }))
  })
}

function lohnsteuerbescheinigung(k: TerminKontext): Termin[] {
  return jahreBis(erstesLohnsteuerjahr(k), k.horizont).map((jahr) =>
    abgabe('lohnsteuer', monatsLetzter(datum(jahr + 1, 2, 1)), k.land, { titel: 'Lohnsteuerbescheinigung übermitteln', zeitraum: String(jahr), art: 'abgabe', schluessel: `bescheinigung-${jahr}` }),
  )
}

function svBeitrag(k: TerminKontext): Termin[] {
  const beginn = beschaeftigungsbeginn(k.profil)
  const termine: Termin[] = []
  // Der Termin eines Monats liegt in diesem Monat; Monate vor dem Horizont bringen keinen Termin
  for (let erster = maxDatum(monatsErster(beginn), monatsErster(k.horizont.von)); erster <= k.horizont.bis; erster = plusMonate(erster, 1)) {
    const { jahr, monat: m } = zerlege(erster)
    const sv = svFaelligkeit(jahr, m, k.land)
    termine.push({
      pflichtId: 'beitragsnachweis',
      titel: 'Beitragsnachweis übermitteln und Beiträge zahlen',
      faelligAm: sv.termin,
      gesetzlichBis: sv.nachweis,
      zeitraum: `${MONATE[m - 1]} ${jahr}`,
      art: 'abgabeUndZahlung',
      hinweis: `Der Beitragsnachweis muss zu Beginn des ${datumText(sv.nachweis)} vorliegen (Praxis der Einzugsstellen, nicht geprüft); die Beiträge sind am ${datumText(sv.faellig)} fällig.`,
      schluessel: `${jahr}-${String(m).padStart(2, '0')}`,
    })
  }
  return termine
}

/** § 18a UStG: 25. Tag nach Quartalsende. */
function zusammenfassendeMeldung(k: TerminKontext): Termin[] {
  const p = k.profil
  return jahreBis(jahrVon(p.start), k.horizont).flatMap((jahr) =>
    quartalsPerioden(jahr)
      .filter((per) => per.bis >= p.start)
      .map((per) =>
        abgabe('zusammenfassendeMeldung', plusTage(plusMonate(per.von, 3), 24), k.land, {
          titel: 'Zusammenfassende Meldung',
          zeitraum: per.text,
          art: 'abgabe',
          hinweis: 'Monatlich statt vierteljährlich bei über 50.000 € Warenlieferungen je Quartal (§ 18a UStG).',
          schluessel: per.schluessel,
        }),
      ),
  )
}

/** § 3c Abs. 4 UStG: 10.000 € je Jahr. */
export const OSS_SCHWELLE = 10_000

/** 6.8.8: nur über der Schwelle; Ende des Monats nach Quartalsende, ohne Verschiebung (O16). */
function oss(k: TerminKontext): Termin[] {
  const p = k.profil
  if (wirksam(p).euFernverkaeufe <= OSS_SCHWELLE) return []
  return jahreBis(jahrVon(p.start), k.horizont).flatMap((jahr) =>
    quartalsPerioden(jahr)
      .filter((per) => per.bis >= p.start)
      .map((per) =>
        fest('euFernverkauf', monatsLetzter(plusMonate(per.von, 3)), {
          titel: 'OSS-Erklärung übermitteln und Steuer zahlen',
          zeitraum: per.text,
          art: 'abgabeUndZahlung',
          hinweis: 'OSS ist wählbar; die Teilnahme vor Quartalsbeginn beim Bundeszentralamt für Steuern anzeigen.',
          schluessel: per.schluessel,
        }),
      ),
  )
}

/** 6.8.7: ohne Beratung 31.07. des Folgejahres, mit Beratung letzter Februartag des übernächsten Jahres. */
function steuererklaerung(pf: Pflicht, k: TerminKontext): Termin[] {
  const p = k.profil
  const beratung = wirksam(p).steuerberater
  return jahreBis(jahrVon(p.start), k.horizont).map((jahr) =>
    abgabe(pf.id, beratung ? monatsLetzter(datum(jahr + 2, 2, 1)) : datum(jahr + 1, 7, 31), k.land, {
      titel: pf.titel,
      zeitraum: String(jahr),
      art: 'abgabe',
      hinweis: beratung ? 'Frist mit Steuerberatung (§ 149 Abs. 3 AO); das Finanzamt kann die Erklärung früher anfordern (§ 149 Abs. 4 AO).' : null,
      schluessel: String(jahr),
    }),
  )
}

/** § 37 Abs. 1 EStG: 10.03., 10.06., 10.09., 10.12. ab dem Start, nur wenn festgesetzt (F32). */
function estVorauszahlungen(k: TerminKontext): Termin[] {
  const p = k.profil
  if (!wirksam(p).vorauszahlungen) return []
  return jahreBis(jahrVon(p.start), k.horizont).flatMap((jahr) =>
    [3, 6, 9, 12]
      .map((monat) => datum(jahr, monat, 10))
      .filter((d) => d >= p.start)
      .map((d) => zahlung('estVorauszahlungen', d, k.land, { titel: 'Einkommensteuer-Vorauszahlung zahlen', zeitraum: String(jahr), art: 'zahlung', schluessel: d })),
  )
}

function jahresabschluss(pf: Pflicht, k: TerminKontext): Termin[] {
  return jahreBis(jahrVon(k.profil.start), k.horizont).map((jahr) =>
    fest(pf.id, datum(jahr + 1, 3, 31), {
      titel: pf.titel,
      zeitraum: String(jahr),
      art: 'handlung',
      hinweis: `Kleine Gesellschaften bis ${datumText(datum(jahr + 1, 6, 30))}, wenn das einem ordnungsgemäßen Geschäftsgang entspricht (§ 264 Abs. 1 HGB).`,
      schluessel: String(jahr),
    }),
  )
}

function offenlegung(pf: Pflicht, k: TerminKontext): Termin[] {
  return jahreBis(jahrVon(k.profil.start), k.horizont).map((jahr) => fest(pf.id, datum(jahr + 1, 12, 31), { titel: pf.titel, zeitraum: String(jahr), art: 'abgabe', schluessel: String(jahr) }))
}

function eRechnung(pf: Pflicht, k: TerminKontext): Termin[] {
  const ab = eRechnungAb(k.profil)
  return [fest(pf.id, ab, { titel: `E-Rechnungen ausstellen ab ${datumText(ab)}`, art: 'handlung', schluessel: ab })]
}

function ifsgBescheinigung(k: TerminKontext): Termin[] {
  const start = k.profil.start
  return [
    fest('infektionsschutz', start, {
      titel: 'Bescheinigung nach § 43 IfSG vor der ersten Tätigkeit',
      art: 'handlung',
      hinweis: `Die Bescheinigung darf höchstens 3 Monate alt sein: frühestens ausgestellt am ${datumText(plusMonate(start, -3))}.`,
      schluessel: `bescheinigung-${start}`,
    }),
  ]
}

/** Nur mit Beschäftigten: an F13, danach alle 24 Monate. */
function ifsgBelehrung(k: TerminKontext): Termin[] {
  if (merkmale(k.profil).beschaeftigte === 0) return []
  const termine: Termin[] = []
  for (let d = beschaeftigungsbeginn(k.profil); d <= k.horizont.bis; d = plusMonate(d, 24)) {
    termine.push(fest('infektionsschutz', d, { titel: 'Beschäftigte nach § 43 IfSG belehren', art: 'handlung', schluessel: `belehrung-${d}` }))
  }
  return termine
}

/** § 68 Abs. 1 VerpackDG: nur bei Start vor dem Inkrafttreten am 12.08.2026. */
function verpackungUebergang(k: TerminKontext): Termin[] {
  if (k.profil.start >= '2026-08-12') return []
  return [
    fest('verpackung', '2026-12-31', {
      titel: 'Systembeteiligung nach VerpackDG neu abschließen',
      art: 'handlung',
      hinweis: 'Systembeteiligungen nach altem Recht gelten längstens bis 31.12.2026 (§ 68 Abs. 1 VerpackDG).',
      schluessel: 'uebergang-2026-12-31',
    }),
  ]
}

function verpackungDatenmeldung(pf: Pflicht, k: TerminKontext): Termin[] {
  return jahreBis(jahrVon(k.profil.start), k.horizont).map((jahr) =>
    fest(pf.id, datum(jahr + 1, 6, 1), { titel: pf.titel, zeitraum: String(jahr), art: 'abgabe', hinweis: 'Ab 10 t im Vorjahr unverzüglich nach der Systembeteiligung (§ 9 VerpackDG).', schluessel: String(jahr) }),
  )
}

function berechnet(b: Berechnung, pf: Pflicht, k: TerminKontext): Termin[] {
  switch (b) {
    case 'ustVoranmeldung':
      return ustVoranmeldung(k)
    case 'sondervorauszahlung':
      return sondervorauszahlung(k)
    case 'lohnsteuer':
      return lohnsteuer(k)
    case 'lohnsteuerbescheinigung':
      return lohnsteuerbescheinigung(k)
    case 'svBeitrag':
      return svBeitrag(k)
    case 'zusammenfassendeMeldung':
      return zusammenfassendeMeldung(k)
    case 'oss':
      return oss(k)
    case 'steuererklaerung':
      return steuererklaerung(pf, k)
    case 'estVorauszahlungen':
      return estVorauszahlungen(k)
    case 'jahresabschluss':
      return jahresabschluss(pf, k)
    case 'offenlegung':
      return offenlegung(pf, k)
    case 'eRechnungAb':
      return eRechnung(pf, k)
    case 'ifsgBescheinigung':
      return ifsgBescheinigung(k)
    case 'ifsgBelehrung':
      return ifsgBelehrung(k)
    case 'verpackungUebergang':
      return verpackungUebergang(k)
    case 'verpackungDatenmeldung':
      return verpackungDatenmeldung(pf, k)
  }
}

function ausRegel(regel: FristRegel, pf: Pflicht, k: TerminKontext): Termin[] {
  switch (regel.art) {
    case 'bisEreignis':
      return [fest(pf.id, ereignisDatum(regel.ereignis, k.profil), { titel: pf.titel, art: 'handlung', schluessel: ereignisDatum(regel.ereignis, k.profil) })]
    case 'unverzueglich':
      return [fest(pf.id, ereignisDatum(regel.ereignis, k.profil), { titel: pf.titel, art: 'handlung', hinweis: HINWEIS_UNVERZUEGLICH, schluessel: ereignisDatum(regel.ereignis, k.profil) })]
    case 'nachEreignis': {
      const { ende } = fristNachEreignis(ereignisDatum(regel.ereignis, k.profil), regel.monate, regel.tage, regel.ao108, k.land)
      return [fest(pf.id, ende, { titel: TITEL_NACH_EREIGNIS[pf.id] ?? pf.titel, art: 'abgabe', schluessel: ende })]
    }
    case 'berechnet':
      return berechnet(regel.berechnung, pf, k)
    case 'laufend':
    case 'ohneFesteFrist':
      return []
  }
}

/** Alle Termine einer Pflicht im Horizont, nach Datum sortiert. */
export function termineFuer(pf: Pflicht, k: TerminKontext): Termin[] {
  return pf.fristen
    .flatMap((r) => ausRegel(r, pf, k))
    .filter((t) => t.faelligAm >= k.horizont.von && t.faelligAm <= k.horizont.bis)
    .sort((a, b) => (a.faelligAm < b.faelligAm ? -1 : a.faelligAm > b.faelligAm ? 1 : 0))
}

/** Erster Termin ab `heute` (Liste nach Datum sortiert); null, wenn keiner mehr kommt. */
export function naechsterTermin(termine: readonly Termin[], heute: Datum): Termin | null {
  return termine.find((t) => t.faelligAm >= heute) ?? null
}

// Rechenweg für die Pflichtkarte ------------------------------------------------------------

const UST_TEXT: Record<UstZeitraum, string> = { monat: 'monatlich', quartal: 'vierteljährlich', keine: 'keine Voranmeldung' }
const LST_TEXT: Record<LstZeitraum, string> = { monat: 'monatlich', quartal: 'vierteljährlich', jahr: 'jährlich' }

/** Kurze Sätze, wie die App die Termine einer Pflicht bestimmt (Zeiträume je Jahr, Schwellen). */
export function rechenweg(id: Pflicht['id'], k: TerminKontext): string[] {
  const p = k.profil
  const w = wirksam(p)
  switch (id) {
    case 'ustVoranmeldung': {
      const jahre = jahreBis(jahrVon(p.start), k.horizont)
      return [
        `Voranmeldungszeitraum: ${jahre.map((j) => `${j} ${UST_TEXT[ustZeitraum(j, p).zeitraum]}`).join(', ')}.`,
        ...(w.dauerfristverlaengerung ? ['Mit Dauerfristverlängerung je einen Monat später (§ 46 UStDV).'] : []),
      ]
    }
    case 'lohnsteuer': {
      // Beginnt die Beschäftigung erst nach dem Zeitraum, gibt es nichts zu rechnen (vorher stand dort „Anmeldungszeitraum: .“)
      const beginn = beschaeftigungsbeginn(p)
      if (beginn > k.horizont.bis) return [`Keine Termine im betrachteten Zeitraum: Die Beschäftigung beginnt am ${datumText(beginn)}.`]
      const jahre = jahreBis(erstesLohnsteuerjahr(k), k.horizont)
      return [
        `Anmeldungszeitraum: ${jahre
          .map((j) => {
            const z = lstZeitraum(j, p)
            return `${j} ${LST_TEXT[z.zeitraum]}${z.basis !== null ? ` (Jahreslohnsteuer ${betragText(z.basis)})` : ''}`
          })
          .join(', ')}.`,
      ]
    }
    case 'euFernverkauf':
      return [
        w.euFernverkaeufe > OSS_SCHWELLE
          ? `EU-Fernverkäufe von ${betragText(w.euFernverkaeufe)} je Jahr liegen über der Schwelle von ${betragText(OSS_SCHWELLE)}; die Termine gelten für das wählbare OSS-Verfahren.`
          : `EU-Fernverkäufe von ${betragText(w.euFernverkaeufe)} je Jahr: Schwelle von ${betragText(OSS_SCHWELLE)} nicht überschritten, deshalb keine OSS-Termine.`,
      ]
    case 'estVorauszahlungen':
      return w.vorauszahlungen ? [] : ['Keine Termine: Das Finanzamt hat keine Vorauszahlungen festgesetzt (Frage 32).']
    default:
      return []
  }
}

/** Termine einer Katalogpflicht nach ihrer ID. */
export function termineDerPflicht(id: Pflicht['id'], k: TerminKontext): Termin[] {
  return termineFuer(katalogPflicht(id), k)
}
