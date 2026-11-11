/**
 * Antworten des Interviews lesen und setzen (Spezifikation 5.2). `setzeAntwort` übernimmt
 * auch die abhängigen Standardwerte, sobald sich die auslösende Antwort ändert:
 * F11 und F17 „ja bei Gastronomie“, F21 „ja bei Onlinehandel mit Privatkunden“,
 * F24 „ja, wenn F22 ≠ keine“. F13 und F23 bleiben leer und folgen damit F02 (wirksam.ts);
 * F16 steht im Standardprofil auf „ja“. Reine Funktionen, das Profil wird nie verändert.
 */
import { BRANCHEN, BUNDESLAENDER, HANDWERKE, JA_NEIN_UNKLAR, KASSEN, RECHTSFORMEN, TAETIGKEITEN, type Branche, type FrageId, type Kunden, type Profil } from './typen'

export type Antwort = string | number | boolean | null | readonly string[]

export const KUNDEN_SCHLUESSEL = ['privatInland', 'unternehmenInland', 'privatEu', 'unternehmenEu'] as const satisfies readonly (keyof Kunden)[]

/** Aktuelle Antwort auf eine Frage im Format des Eingabefelds. */
export function antwort(p: Profil, id: FrageId): Antwort {
  const pers = p.personal
  const st = p.steuern
  switch (id) {
    case 'F01':
      return p.name
    case 'F02':
      return p.start
    case 'F03':
      return p.bundesland
    case 'F04':
      return p.rechtsform
    case 'F05':
      return p.gbrEingetragen
    case 'F06':
      return p.taetigkeit
    case 'F07':
      return p.kaufmaennisch
    case 'F08':
      return p.steuerberater
    case 'F09':
      return p.branchen
    case 'F10':
      return p.handwerk
    case 'F11':
      return p.lebensmittel
    case 'F12':
      return pers.vorhanden
    case 'F13':
      return pers.beginn
    case 'F14':
      return pers.svPflichtig
    case 'F15':
      return pers.minijobber
    case 'F16':
      return pers.minijobPauschsteuer
    case 'F17':
      return pers.sofortmeldeBranche
    case 'F18':
      return pers.lohnsteuerJeMonat
    case 'F19':
      return KUNDEN_SCHLUESSEL.filter((k) => p.kunden[k])
    case 'F20':
      return p.website
    case 'F21':
      return p.verpackungen
    case 'F22':
      return p.kasse
    case 'F23':
      return p.kasseAnschaffung
    case 'F24':
      return p.bargeld
    case 'F25':
      return st.umsatzErstesJahr
    case 'F26':
      return st.gewinnErstesJahr
    case 'F27':
      return st.kleinunternehmer
    case 'F28':
      return st.umsatz2026
    case 'F29':
      return st.ustErstesJahr
    case 'F30':
      return st.euFernverkaeufe
    case 'F31':
      return st.dauerfristverlaengerung
    case 'F32':
      return st.vorauszahlungen
  }
}

function text(w: Antwort, id: FrageId): string {
  if (typeof w !== 'string') throw new Error(`${id}: Text erwartet`)
  return w
}
function janein(w: Antwort, id: FrageId): boolean {
  if (typeof w !== 'boolean') throw new Error(`${id}: ja oder nein erwartet`)
  return w
}
function zahl(w: Antwort, id: FrageId): number {
  if (typeof w !== 'number' || !Number.isFinite(w)) throw new Error(`${id}: Zahl erwartet`)
  return w
}
function zahlOderLeer(w: Antwort, id: FrageId): number | null {
  return w === null ? null : zahl(w, id)
}
function datumOderLeer(w: Antwort, id: FrageId): string | null {
  return w === null || w === '' ? null : text(w, id)
}
function eines<T extends string>(w: Antwort, id: FrageId, werte: readonly T[]): T {
  const t = text(w, id)
  if (!(werte as readonly string[]).includes(t)) throw new Error(`${id}: unbekannter Wert „${t}“`)
  return t as T
}
function liste<T extends string>(w: Antwort, id: FrageId, werte: readonly T[]): T[] {
  if (!Array.isArray(w)) throw new Error(`${id}: Liste erwartet`)
  // Reihenfolge der Optionen, ohne Doppelte
  return werte.filter((x) => (w as readonly string[]).includes(x))
}

/** Antworten ohne Abhängigkeiten in das Profil schreiben. */
function schreibe(p: Profil, id: FrageId, w: Antwort): Profil {
  const pers = p.personal
  const st = p.steuern
  switch (id) {
    case 'F01':
      return { ...p, name: text(w, id) }
    case 'F02':
      return { ...p, start: text(w, id) }
    case 'F03':
      return { ...p, bundesland: w === null || w === '' ? null : eines(w, id, BUNDESLAENDER) }
    case 'F04':
      return { ...p, rechtsform: eines(w, id, RECHTSFORMEN) }
    case 'F05':
      return { ...p, gbrEingetragen: janein(w, id) }
    case 'F06':
      return { ...p, taetigkeit: eines(w, id, TAETIGKEITEN) }
    case 'F07':
      return { ...p, kaufmaennisch: eines(w, id, JA_NEIN_UNKLAR) }
    case 'F08':
      return { ...p, steuerberater: janein(w, id) }
    case 'F09':
      return { ...p, branchen: liste<Branche>(w, id, BRANCHEN) }
    case 'F10':
      return { ...p, handwerk: eines(w, id, HANDWERKE.filter((h) => h !== 'keins')) }
    case 'F11':
      return { ...p, lebensmittel: janein(w, id) }
    case 'F12':
      return { ...p, personal: { ...pers, vorhanden: janein(w, id) } }
    case 'F13':
      return { ...p, personal: { ...pers, beginn: datumOderLeer(w, id) } }
    case 'F14':
      return { ...p, personal: { ...pers, svPflichtig: zahl(w, id) } }
    case 'F15':
      return { ...p, personal: { ...pers, minijobber: zahl(w, id) } }
    case 'F16':
      return { ...p, personal: { ...pers, minijobPauschsteuer: janein(w, id) } }
    case 'F17':
      return { ...p, personal: { ...pers, sofortmeldeBranche: janein(w, id) } }
    case 'F18':
      return { ...p, personal: { ...pers, lohnsteuerJeMonat: zahlOderLeer(w, id) } }
    case 'F19': {
      const gewaehlt = liste(w, id, KUNDEN_SCHLUESSEL)
      return { ...p, kunden: { privatInland: gewaehlt.includes('privatInland'), unternehmenInland: gewaehlt.includes('unternehmenInland'), privatEu: gewaehlt.includes('privatEu'), unternehmenEu: gewaehlt.includes('unternehmenEu') } }
    }
    case 'F20':
      return { ...p, website: janein(w, id) }
    case 'F21':
      return { ...p, verpackungen: janein(w, id) }
    case 'F22':
      return { ...p, kasse: eines(w, id, KASSEN) }
    case 'F23':
      return { ...p, kasseAnschaffung: datumOderLeer(w, id) }
    case 'F24':
      return { ...p, bargeld: janein(w, id) }
    case 'F25':
      return { ...p, steuern: { ...st, umsatzErstesJahr: zahl(w, id) } }
    case 'F26':
      return { ...p, steuern: { ...st, gewinnErstesJahr: zahl(w, id) } }
    case 'F27':
      return { ...p, steuern: { ...st, kleinunternehmer: janein(w, id) } }
    case 'F28':
      return { ...p, steuern: { ...st, umsatz2026: zahlOderLeer(w, id) } }
    case 'F29':
      return { ...p, steuern: { ...st, ustErstesJahr: zahlOderLeer(w, id) } }
    case 'F30':
      return { ...p, steuern: { ...st, euFernverkaeufe: zahl(w, id) } }
    case 'F31':
      return { ...p, steuern: { ...st, dauerfristverlaengerung: janein(w, id) } }
    case 'F32':
      return { ...p, steuern: { ...st, vorauszahlungen: janein(w, id) } }
  }
}

const gastronomie = (p: Profil) => p.branchen.includes('gastronomie')
const onlinehandelPrivat = (p: Profil) => p.branchen.includes('onlinehandel') && p.kunden.privatInland

/**
 * Setzt eine Antwort und danach die abhängigen Standardwerte aus 5.2, aber nur, wenn die
 * auslösende Bedingung umschlägt. Eigene Antworten auf F11, F17, F21 und F24 bleiben sonst stehen.
 */
export function setzeAntwort(p: Profil, id: FrageId, w: Antwort): Profil {
  const neu = schreibe(p, id, w)
  let q = neu
  if (gastronomie(p) !== gastronomie(neu)) {
    q = { ...q, lebensmittel: gastronomie(neu), personal: { ...q.personal, sofortmeldeBranche: gastronomie(neu) } }
  }
  if (onlinehandelPrivat(p) !== onlinehandelPrivat(neu)) q = { ...q, verpackungen: onlinehandelPrivat(neu) }
  if ((p.kasse === 'keine') !== (neu.kasse === 'keine')) q = { ...q, bargeld: neu.kasse !== 'keine' }
  return q
}
