/**
 * Merkmale: die Eingaben der DMN-Tabellen, als reine Funktion aus dem Profil
 * abgeleitet (Spezifikation 6.2). Ausgeblendete Antworten wirken nicht, weil
 * jede Ableitung die Sichtbarkeit der Frage mitprüft.
 */
import { betragText, jaNein, zahlText } from './format'
import { HANDWERKE, JA_NEIN_UNKLAR, KASSEN, RECHTSFORMEN, TAETIGKEITEN, type MerkmalInfo, type MerkmalName, type Merkmale, type Profil, type Rechtsform } from './typen'

/** § 19 Abs. 1 UStG: laufendes Jahr höchstens 100.000 €, Vorjahr höchstens 25.000 €. */
export const KLEINUNTERNEHMER_LAUFEND = 100_000
export const KLEINUNTERNEHMER_VORJAHR = 25_000
/** § 241a HGB und § 141 Abs. 1 AO: 800.000 € Umsatz, 80.000 € Gewinn bzw. Jahresüberschuss. */
export const GRENZE_UMSATZ = 800_000
export const GRENZE_GEWINN = 80_000

const istKapitalgesellschaft = (r: Rechtsform) => r === 'ug' || r === 'gmbh'
const istPersonenform = (r: Rechtsform) => r === 'einzelunternehmen' || r === 'gbr'

/** F07 ist nur bei Einzelunternehmen und GbR mit gewerblicher Tätigkeit sichtbar (5.2). */
export function kaufmaennischGefragt(p: Profil): boolean {
  return istPersonenform(p.rechtsform) && p.taetigkeit === 'gewerblich'
}

/**
 * Wirkt die Kleinunternehmerregelung? F27 = ja und F25 höchstens 100.000 € (6.2, 6.9). Über der Grenze
 * rechnet die App ohne die Regelung; dann gelten auch die Fragen F28–F31 („F27 = nein“, Entscheidung E21).
 */
export function kleinunternehmerWirksam(p: Profil): boolean {
  return p.steuern.kleinunternehmer && p.steuern.umsatzErstesJahr <= KLEINUNTERNEHMER_LAUFEND
}

/** Lohnsteuerabzug (6.2); steuert auch die Sichtbarkeit von F18. */
export function hatLohnsteuerabzug(p: Profil): boolean {
  const pers = p.personal
  return pers.vorhanden && (pers.svPflichtig > 0 || (pers.minijobber > 0 && !pers.minijobPauschsteuer))
}

export function merkmale(p: Profil): Merkmale {
  const kaufmaennisch = kaufmaennischGefragt(p) ? p.kaufmaennisch : 'nein'
  const kaufmann = istKapitalgesellschaft(p.rechtsform) || (istPersonenform(p.rechtsform) && p.taetigkeit === 'gewerblich' && kaufmaennisch === 'ja')
  const pers = p.personal
  const { umsatzErstesJahr: umsatz, gewinnErstesJahr: gewinn } = p.steuern
  return {
    rechtsform: p.rechtsform,
    taetigkeit: p.taetigkeit,
    kaufmaennisch,
    kaufmann,
    personengesellschaftEingetragen: p.rechtsform === 'gbr' && (p.gbrEingetragen || kaufmann),
    handwerk: p.branchen.includes('handwerk') ? p.handwerk : 'keins',
    handel: p.branchen.includes('handel'),
    onlinehandel: p.branchen.includes('onlinehandel'),
    gastronomie: p.branchen.includes('gastronomie'),
    lebensmittel: p.lebensmittel,
    beschaeftigte: pers.vorhanden ? pers.svPflichtig + pers.minijobber : 0,
    minijobber: pers.vorhanden ? pers.minijobber : 0,
    lohnsteuerabzug: hatLohnsteuerabzug(p),
    sofortmeldeBranche: pers.vorhanden && pers.sofortmeldeBranche,
    kundenPrivat: p.kunden.privatInland,
    kundenUnternehmen: p.kunden.unternehmenInland,
    kundenPrivatEu: p.kunden.privatEu,
    kundenUnternehmenEu: p.kunden.unternehmenEu,
    website: p.website,
    verpackungen: p.verpackungen,
    kasse: p.kasse,
    bargeld: p.bargeld,
    kleinunternehmer: kleinunternehmerWirksam(p),
    hgbBefreit: p.rechtsform === 'einzelunternehmen' && kaufmann && umsatz <= GRENZE_UMSATZ && gewinn <= GRENZE_GEWINN,
    ao141Grenze: p.taetigkeit === 'gewerblich' && (umsatz > GRENZE_UMSATZ || gewinn > GRENZE_GEWINN),
    umsatzErstesJahr: umsatz,
  }
}

/** Beschreibung der Merkmale nach 6.2; Reihenfolge wie im Interface `Merkmale`. */
export const MERKMALE: readonly MerkmalInfo[] = [
  { name: 'rechtsform', typ: 'string', label: 'Rechtsform', fragen: ['F04'], erlaubt: RECHTSFORMEN },
  { name: 'taetigkeit', typ: 'string', label: 'Tätigkeit', fragen: ['F06'], erlaubt: TAETIGKEITEN },
  { name: 'kaufmaennisch', typ: 'string', label: 'Kaufmännischer Betrieb', fragen: ['F07'], erlaubt: JA_NEIN_UNKLAR },
  { name: 'kaufmann', typ: 'boolean', label: 'Kaufmann nach HGB', fragen: ['F04', 'F06', 'F07'] },
  { name: 'personengesellschaftEingetragen', typ: 'boolean', label: 'Eingetragene Personengesellschaft', fragen: ['F04', 'F05', 'F07'] },
  { name: 'handwerk', typ: 'string', label: 'Handwerk', fragen: ['F09', 'F10'], erlaubt: HANDWERKE },
  { name: 'handel', typ: 'boolean', label: 'Handel', fragen: ['F09'] },
  { name: 'onlinehandel', typ: 'boolean', label: 'Onlinehandel', fragen: ['F09'] },
  { name: 'gastronomie', typ: 'boolean', label: 'Gastronomie', fragen: ['F09'] },
  { name: 'lebensmittel', typ: 'boolean', label: 'Umgang mit Lebensmitteln', fragen: ['F11'] },
  { name: 'beschaeftigte', typ: 'number', label: 'Beschäftigte', fragen: ['F12', 'F14', 'F15'] },
  { name: 'minijobber', typ: 'number', label: 'Minijobs', fragen: ['F12', 'F15'] },
  { name: 'lohnsteuerabzug', typ: 'boolean', label: 'Lohnsteuerabzug', fragen: ['F12', 'F14', 'F15', 'F16'] },
  { name: 'sofortmeldeBranche', typ: 'boolean', label: 'Bereich mit Sofortmeldepflicht', fragen: ['F12', 'F17'] },
  { name: 'kundenPrivat', typ: 'boolean', label: 'Kunden: Privatleute in Deutschland', fragen: ['F19'] },
  { name: 'kundenUnternehmen', typ: 'boolean', label: 'Kunden: Unternehmen in Deutschland', fragen: ['F19'] },
  { name: 'kundenPrivatEu', typ: 'boolean', label: 'Kunden: Privatleute in anderen EU-Staaten', fragen: ['F19'] },
  { name: 'kundenUnternehmenEu', typ: 'boolean', label: 'Kunden: Unternehmen in anderen EU-Staaten', fragen: ['F19'] },
  { name: 'website', typ: 'boolean', label: 'Online-Auftritt', fragen: ['F20'] },
  { name: 'verpackungen', typ: 'boolean', label: 'Waren in Verpackungen an Privatleute', fragen: ['F21'] },
  { name: 'kasse', typ: 'string', label: 'Kasse', fragen: ['F22'], erlaubt: KASSEN },
  { name: 'bargeld', typ: 'boolean', label: 'Bargeld', fragen: ['F24'] },
  { name: 'kleinunternehmer', typ: 'boolean', label: 'Kleinunternehmerregelung', fragen: ['F25', 'F27'] },
  { name: 'hgbBefreit', typ: 'boolean', label: 'Befreiung nach § 241a HGB', fragen: ['F04', 'F07', 'F25', 'F26'] },
  { name: 'ao141Grenze', typ: 'boolean', label: 'Grenze nach § 141 AO überschritten', fragen: ['F06', 'F25', 'F26'] },
  { name: 'umsatzErstesJahr', typ: 'number', label: 'Umsatz im ersten Jahr', fragen: ['F25'], einheit: 'euro' },
]

const NACH_NAME = new Map(MERKMALE.map((m) => [m.name, m]))

export function istMerkmal(name: string): name is MerkmalName {
  return NACH_NAME.has(name as MerkmalName)
}

export function merkmalInfo(name: MerkmalName): MerkmalInfo {
  const info = NACH_NAME.get(name)
  if (!info) throw new Error(`Unbekanntes Merkmal ${name}`)
  return info
}

/** Anzeigetexte der Textwerte, z. B. für „Rechtsform: GmbH“ in „Warum?“. */
const WERT_TEXTE: Partial<Record<MerkmalName, Record<string, string>>> = {
  rechtsform: { einzelunternehmen: 'Einzelunternehmen', gbr: 'GbR', ug: 'UG (haftungsbeschränkt)', gmbh: 'GmbH' },
  taetigkeit: { gewerblich: 'gewerblich', freiberuflich: 'freiberuflich' },
  kaufmaennisch: { ja: 'ja', nein: 'nein', unklar: 'unklar' },
  handwerk: {
    keins: 'kein Handwerk',
    zulassungspflichtig: 'zulassungspflichtig (Anlage A)',
    zulassungsfrei: 'zulassungsfrei (Anlage B1)',
    handwerksaehnlich: 'handwerksähnlich (Anlage B2)',
    unklar: 'unklar',
  },
  kasse: { keine: 'keine', offeneLadenkasse: 'offene Ladenkasse', elektronisch: 'elektronische Kasse oder Kassen-App' },
}

/** Wert eines Merkmals als Text: „ja“, „3“, „60.000 €“, „GmbH“. */
export function wertText(name: MerkmalName, wert: string | number | boolean): string {
  if (typeof wert === 'boolean') return jaNein(wert)
  if (typeof wert === 'number') return merkmalInfo(name).einheit === 'euro' ? betragText(wert) : zahlText(wert)
  return WERT_TEXTE[name]?.[wert] ?? wert
}
