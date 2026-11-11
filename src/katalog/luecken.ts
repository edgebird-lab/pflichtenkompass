/**
 * Lückenhinweise (Spezifikation 6.7): Bereiche, die zum Profil passen, aber in
 * Version 0.1 nicht geprüft sind („nichtGeprueft“), und Fragen, die vor dem
 * Handeln zu klären sind („pruefen“). Lücken sind keine Pflichten.
 */
import type { Luecke, LueckeId } from './typen'

/** Steht bei jeder Lücke (6.7). */
export const LUECKE_HINWEIS = 'In Version 0.1 nicht geprüft'

export const LUECKEN: readonly Luecke[] = [
  { id: 'gewerbesteuer', nr: 1, art: 'nichtGeprueft', titel: 'Gewerbesteuer', text: 'Erklärung und Vorauszahlungen.' },
  { id: 'koerperschaftsteuer', nr: 2, art: 'nichtGeprueft', titel: 'Körperschaftsteuer', text: 'Erklärung und Vorauszahlungen.' },
  { id: 'gastronomieLandesrecht', nr: 3, art: 'nichtGeprueft', titel: 'Gaststättenrecht des Landes', text: 'Erlaubnis oder Anzeige nach Landesrecht.' },
  { id: 'lebensmittelrecht', nr: 4, art: 'nichtGeprueft', titel: 'Lebensmittelrecht', text: 'Registrierung als Lebensmittelbetrieb, Hygiene.' },
  {
    id: 'fernabsatz',
    nr: 5,
    art: 'nichtGeprueft',
    titel: 'Verbraucherrecht im Onlinehandel',
    text: 'Informations- und Widerrufspflichten, Bestellbutton, Preisangaben, Barrierefreiheit.',
  },
  {
    id: 'datenschutz',
    nr: 6,
    art: 'nichtGeprueft',
    titel: 'Datenschutz',
    text: 'Datenschutzhinweise, Verarbeitungsverzeichnis, Datenschutzbeauftragter, Einwilligung für Cookies.',
  },
  {
    id: 'arbeitsrecht',
    nr: 7,
    art: 'nichtGeprueft',
    titel: 'Arbeitsrecht und Arbeitsschutz',
    text: 'Arbeitsschutz, Nachweisgesetz, DEÜV-Fristen, Mindestlohnhöhe, Bereiche nach § 2a SchwarzArbG.',
  },
  { id: 'gewerberechtSonstiges', nr: 8, art: 'nichtGeprueft', titel: 'Erlaubnisse und Kammern', text: 'Erlaubnispflichtige Gewerbe, Beiträge zu IHK oder HWK.' },
  { id: 'kuenstlersozialabgabe', nr: 9, art: 'nichtGeprueft', titel: 'Künstlersozialabgabe', text: 'Abgabe auf Aufträge an Kreative, z. B. Webdesign, Fotos, Texte.' },
  { id: 'rundfunkbeitrag', nr: 10, art: 'nichtGeprueft', titel: 'Rundfunkbeitrag für Betriebsstätten', text: 'Anmeldung und Beitrag je Betriebsstätte.' },
  { id: 'elektroBatterien', nr: 11, art: 'nichtGeprueft', titel: 'Elektrogeräte und Batterien', text: 'Registrierungspflichten beim Verkauf solcher Waren.' },
  { id: 'euKleinunternehmer', nr: 12, art: 'nichtGeprueft', titel: 'EU-Geschäft als Kleinunternehmer', text: 'Ort der Leistung, Rechnungsfristen und Meldepflichten.' },
  { id: 'freiberuflicheKapitalgesellschaft', nr: 13, art: 'nichtGeprueft', titel: 'Freiberufliche UG oder GmbH', text: 'Gewerbeanzeige und Berufsrecht.' },
  { id: 'kaufmannUnklar', nr: 14, art: 'pruefen', titel: 'Kaufmannseigenschaft klären', text: 'Handelsregister und Buchführung nach HGB hängen davon ab.' },
  { id: 'handwerkUnklar', nr: 15, art: 'pruefen', titel: 'Handwerksart klären', text: 'Handwerksrolle (Anlage A) oder Anzeige (Anlage B).' },
  {
    id: 'kleinunternehmerGruendungsjahr',
    nr: 16,
    art: 'pruefen',
    titel: 'Kleinunternehmergrenze im Gründungsjahr',
    text: 'Welche Grenze im Gründungsjahr gilt; der Wortlaut von § 19 Abs. 1 UStG regelt das nicht ausdrücklich.',
  },
  {
    id: 'geschaeftsfuehrung',
    nr: 17,
    art: 'pruefen',
    titel: 'Vergütung der Geschäftsführung klären',
    text: 'Lohnsteuer auf ein Geschäftsführergehalt und Sozialversicherungsstatus der Geschäftsführung (Statusfeststellung); die Pflichten 9–14 erscheinen nur, wenn Frage 12 Beschäftigte nennt.',
  },
]

const NACH_ID = new Map(LUECKEN.map((l) => [l.id, l]))

export function luecke(id: LueckeId): Luecke {
  const l = NACH_ID.get(id)
  if (!l) throw new Error(`Unbekannte Lücke ${id}`)
  return l
}

export function istLueckeId(id: string): id is LueckeId {
  return NACH_ID.has(id as LueckeId)
}
