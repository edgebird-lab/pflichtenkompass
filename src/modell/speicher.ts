/**
 * Speichern im Browser und als Projektdatei `.pflichtenkompass` (Spezifikation 7.4).
 * Beim Laden wird die Struktur geprüft wie im Prozesslotsen: `app`, `formatVersion`,
 * Typen, Aufzählungswerte, Datumsformat, Zahlenbereiche. Unbekannte Felder werden
 * ignoriert, falsche Werte mit Feldnamen abgelehnt. Jeder Zugriff auf
 * `localStorage` steht in try/catch (privater Modus).
 */
import { istDatum } from '../fristen/datum'
import { PFLICHT_IDS, type PflichtId } from '../katalog/typen'
import { NAME_MAX, NOTIZ_MAX, standardProfil } from './profil'
import {
  BEARBEITUNGEN,
  BRANCHEN,
  BUNDESLAENDER,
  FORMAT_VERSION,
  HANDWERKE,
  JA_NEIN_UNKLAR,
  KASSEN,
  RECHTSFORMEN,
  TAETIGKEITEN,
  type Branche,
  type Datum,
  type Einstellungen,
  type PflichtStatus,
  type Profil,
  type Projekt,
} from './typen'

export const PROJEKT_SCHLUESSEL = 'pflichtenkompass:projekt'
export const EINSTELLUNGEN_SCHLUESSEL = 'pflichtenkompass:einstellungen'
/** Höchstgröße einer Projektdatei (7.4, 8). */
export const MAX_DATEI_BYTES = 1024 * 1024
export const DATEIENDUNG = '.pflichtenkompass'
export const PROJEKT_MIME = 'application/vnd.pflichtenkompass+json'

export class Formatfehler extends Error {}

type Obj = Record<string, unknown>

function istObj(x: unknown): x is Obj {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

function fordere(bedingung: unknown, meldung: string): asserts bedingung {
  if (!bedingung) throw new Formatfehler(meldung)
}

// Einzelne Felder: jede Funktion nennt bei einem Fehler das Feld ------------------

function text(x: unknown, feld: string, max = Infinity): string {
  fordere(typeof x === 'string', `${feld}: Text erwartet.`)
  fordere(x.length <= max, `${feld}: höchstens ${max} Zeichen.`)
  return x
}

function janein(x: unknown, feld: string): boolean {
  fordere(typeof x === 'boolean', `${feld}: ja oder nein (true/false) erwartet.`)
  return x
}

function datum(x: unknown, feld: string): Datum {
  fordere(istDatum(x), `${feld}: Datum im Format JJJJ-MM-TT erwartet.`)
  return x
}

function datumOderLeer(x: unknown, feld: string): Datum | null {
  return x === null ? null : datum(x, feld)
}

function eines<T extends string>(x: unknown, feld: string, werte: readonly T[]): T {
  fordere(typeof x === 'string', `${feld}: Text erwartet.`)
  fordere((werte as readonly string[]).includes(x), `${feld}: unbekannter Wert „${x}“.`)
  return x as T
}

function anzahl(x: unknown, feld: string): number {
  fordere(typeof x === 'number' && Number.isInteger(x) && x >= 0, `${feld}: ganze Zahl ab 0 erwartet.`)
  return x
}

function betrag(x: unknown, feld: string, negativErlaubt = false): number {
  fordere(typeof x === 'number' && Number.isFinite(x), `${feld}: Betrag erwartet.`)
  fordere(negativErlaubt || x >= 0, `${feld}: Betrag ab 0 erwartet.`)
  return x
}

function betragOderLeer(x: unknown, feld: string): number | null {
  return x === null ? null : betrag(x, feld)
}

function objekt(x: unknown, feld: string): Obj {
  fordere(istObj(x), `${feld}: fehlt oder ist kein Objekt.`)
  return x
}

// Profil, Status, gespeicherter Stand ------------------------------------------------

/** Prüft ein Profil und gibt eine bereinigte Kopie ohne unbekannte Felder zurück. */
export function leseProfil(x: unknown, feld = 'profil'): Profil {
  const p = objekt(x, feld)
  const pers = objekt(p.personal, `${feld}.personal`)
  const kunden = objekt(p.kunden, `${feld}.kunden`)
  const st = objekt(p.steuern, `${feld}.steuern`)
  fordere(Array.isArray(p.branchen), `${feld}.branchen: Liste erwartet.`)
  const branchen: Branche[] = []
  for (const b of p.branchen) {
    const wert = eines(b, `${feld}.branchen`, BRANCHEN)
    if (!branchen.includes(wert)) branchen.push(wert)
  }
  return {
    name: text(p.name, `${feld}.name`, NAME_MAX),
    start: datum(p.start, `${feld}.start`),
    bundesland: p.bundesland === null ? null : eines(p.bundesland, `${feld}.bundesland`, BUNDESLAENDER),
    rechtsform: eines(p.rechtsform, `${feld}.rechtsform`, RECHTSFORMEN),
    gbrEingetragen: janein(p.gbrEingetragen, `${feld}.gbrEingetragen`),
    taetigkeit: eines(p.taetigkeit, `${feld}.taetigkeit`, TAETIGKEITEN),
    kaufmaennisch: eines(p.kaufmaennisch, `${feld}.kaufmaennisch`, JA_NEIN_UNKLAR),
    steuerberater: janein(p.steuerberater, `${feld}.steuerberater`),
    branchen,
    handwerk: eines(p.handwerk, `${feld}.handwerk`, HANDWERKE),
    lebensmittel: janein(p.lebensmittel, `${feld}.lebensmittel`),
    personal: {
      vorhanden: janein(pers.vorhanden, `${feld}.personal.vorhanden`),
      beginn: datumOderLeer(pers.beginn, `${feld}.personal.beginn`),
      svPflichtig: anzahl(pers.svPflichtig, `${feld}.personal.svPflichtig`),
      minijobber: anzahl(pers.minijobber, `${feld}.personal.minijobber`),
      minijobPauschsteuer: janein(pers.minijobPauschsteuer, `${feld}.personal.minijobPauschsteuer`),
      sofortmeldeBranche: janein(pers.sofortmeldeBranche, `${feld}.personal.sofortmeldeBranche`),
      lohnsteuerJeMonat: betragOderLeer(pers.lohnsteuerJeMonat, `${feld}.personal.lohnsteuerJeMonat`),
    },
    kunden: {
      privatInland: janein(kunden.privatInland, `${feld}.kunden.privatInland`),
      unternehmenInland: janein(kunden.unternehmenInland, `${feld}.kunden.unternehmenInland`),
      privatEu: janein(kunden.privatEu, `${feld}.kunden.privatEu`),
      unternehmenEu: janein(kunden.unternehmenEu, `${feld}.kunden.unternehmenEu`),
    },
    website: janein(p.website, `${feld}.website`),
    verpackungen: janein(p.verpackungen, `${feld}.verpackungen`),
    kasse: eines(p.kasse, `${feld}.kasse`, KASSEN),
    kasseAnschaffung: datumOderLeer(p.kasseAnschaffung, `${feld}.kasseAnschaffung`),
    bargeld: janein(p.bargeld, `${feld}.bargeld`),
    steuern: {
      umsatzErstesJahr: betrag(st.umsatzErstesJahr, `${feld}.steuern.umsatzErstesJahr`),
      gewinnErstesJahr: betrag(st.gewinnErstesJahr, `${feld}.steuern.gewinnErstesJahr`, true),
      kleinunternehmer: janein(st.kleinunternehmer, `${feld}.steuern.kleinunternehmer`),
      umsatz2026: betragOderLeer(st.umsatz2026, `${feld}.steuern.umsatz2026`),
      ustErstesJahr: betragOderLeer(st.ustErstesJahr, `${feld}.steuern.ustErstesJahr`),
      euFernverkaeufe: betrag(st.euFernverkaeufe, `${feld}.steuern.euFernverkaeufe`),
      dauerfristverlaengerung: janein(st.dauerfristverlaengerung, `${feld}.steuern.dauerfristverlaengerung`),
      vorauszahlungen: janein(st.vorauszahlungen, `${feld}.steuern.vorauszahlungen`),
    },
  }
}

/** Status je Pflicht; Einträge zu unbekannten Pflichten (z. B. aus einem anderen Katalog) fallen weg, zu lange Notizen werden gekürzt (6.9). */
function leseStatus(x: unknown): Projekt['status'] {
  const status = objekt(x, 'status')
  const ergebnis: Partial<Record<PflichtId, PflichtStatus>> = {}
  for (const id of PFLICHT_IDS) {
    if (!(id in status)) continue
    const s = objekt(status[id], `status.${id}`)
    ergebnis[id] = {
      bearbeitung: eines(s.bearbeitung, `status.${id}.bearbeitung`, BEARBEITUNGEN),
      notiz: text(s.notiz, `status.${id}.notiz`).slice(0, NOTIZ_MAX),
      geaendertAm: datum(s.geaendertAm, `status.${id}.geaendertAm`),
    }
  }
  return ergebnis
}

function leseGespeichert(x: unknown): Projekt['gespeichert'] {
  if (x === null) return null
  const g = objekt(x, 'gespeichert')
  fordere(Array.isArray(g.pflichten), 'gespeichert.pflichten: Liste erwartet.')
  const katalogVersion = text(g.katalogVersion, 'gespeichert.katalogVersion')
  fordere(katalogVersion.length > 0, 'gespeichert.katalogVersion: darf nicht leer sein.')
  return {
    katalogVersion,
    am: datum(g.am, 'gespeichert.am'),
    pflichten: g.pflichten.map((e, i) => {
      const eintrag = objekt(e, `gespeichert.pflichten[${i}]`)
      const id = text(eintrag.id, `gespeichert.pflichten[${i}].id`)
      fordere(id.length > 0, `gespeichert.pflichten[${i}].id: darf nicht leer sein.`)
      return { id, stand: datum(eintrag.stand, `gespeichert.pflichten[${i}].stand`) }
    }),
  }
}

/** Prüft geladene Daten und gibt sie als Projekt zurück; wirft `Formatfehler`. */
export function leseProjekt(daten: unknown): Projekt {
  fordere(istObj(daten) && daten.app === 'pflichtenkompass', 'Die Datei ist keine Pflichten-Kompass-Datei.')
  fordere(daten.formatVersion === FORMAT_VERSION, `Dateiformat ${String(daten.formatVersion)} wird nicht unterstützt.`)
  return {
    formatVersion: FORMAT_VERSION,
    app: 'pflichtenkompass',
    profil: leseProfil(daten.profil),
    status: leseStatus(daten.status),
    gespeichert: leseGespeichert(daten.gespeichert),
  }
}

/** Größe in Bytes (UTF-8); für Dateien vor dem Lesen auch `File.size`. */
export function pruefeGroesse(bytes: number): void {
  fordere(bytes <= MAX_DATEI_BYTES, 'Die Datei ist größer als 1 MB und wird nicht geöffnet.')
}

export function leseProjektText(text: string): Projekt {
  pruefeGroesse(new TextEncoder().encode(text).length)
  let daten: unknown
  try {
    daten = JSON.parse(text)
  } catch {
    throw new Formatfehler('Die Datei ist kein gültiges JSON.')
  }
  return leseProjekt(daten)
}

/** JSON in UTF-8, 2 Leerzeichen eingerückt (7.4). */
export function alsJson(p: Projekt): string {
  return `${JSON.stringify(p, null, 2)}\n`
}

export function neuesProjekt(heute: Datum): Projekt {
  return { formatVersion: FORMAT_VERSION, app: 'pflichtenkompass', profil: standardProfil(heute), status: {}, gespeichert: null }
}

// Browser-Speicher ---------------------------------------------------------------

export function ladeAusBrowser(): Projekt | null {
  try {
    const text = globalThis.localStorage?.getItem(PROJEKT_SCHLUESSEL)
    return text ? leseProjektText(text) : null
  } catch {
    return null
  }
}

export function speichereImBrowser(p: Projekt): boolean {
  try {
    globalThis.localStorage?.setItem(PROJEKT_SCHLUESSEL, JSON.stringify(p))
    return true
  } catch {
    return false
  }
}

/** „Lokale Daten löschen“ (8): entfernt Projekt und Einstellungen aus dem Browserspeicher. */
export function loescheLokaleDaten(): boolean {
  try {
    globalThis.localStorage?.removeItem(PROJEKT_SCHLUESSEL)
    globalThis.localStorage?.removeItem(EINSTELLUNGEN_SCHLUESSEL)
    return true
  } catch {
    return false
  }
}

// Einstellungen ------------------------------------------------------------------

export const STANDARD_EINSTELLUNGEN: Einstellungen = {
  thema: 'system',
  horizontMonate: 24,
  erinnerungTage: 7,
  vergangeneExportieren: false,
}

/** Liest gespeicherte Einstellungen; unbekannte oder falsche Werte fallen auf den Standard zurück. */
export function leseEinstellungen(daten: unknown): Einstellungen {
  const e = { ...STANDARD_EINSTELLUNGEN }
  if (!istObj(daten)) return e
  if (daten.thema === 'system' || daten.thema === 'hell' || daten.thema === 'dunkel') e.thema = daten.thema
  if (daten.horizontMonate === 12 || daten.horizontMonate === 24) e.horizontMonate = daten.horizontMonate
  if (daten.erinnerungTage === 0 || daten.erinnerungTage === 1 || daten.erinnerungTage === 3 || daten.erinnerungTage === 7 || daten.erinnerungTage === 14) e.erinnerungTage = daten.erinnerungTage
  if (typeof daten.vergangeneExportieren === 'boolean') e.vergangeneExportieren = daten.vergangeneExportieren
  return e
}

export function ladeEinstellungen(): Einstellungen {
  try {
    const text = globalThis.localStorage?.getItem(EINSTELLUNGEN_SCHLUESSEL)
    return leseEinstellungen(text ? JSON.parse(text) : null)
  } catch {
    return { ...STANDARD_EINSTELLUNGEN }
  }
}

export function speichereEinstellungen(e: Einstellungen): void {
  try {
    globalThis.localStorage?.setItem(EINSTELLUNGEN_SCHLUESSEL, JSON.stringify(e))
  } catch {
    // nicht kritisch
  }
}
