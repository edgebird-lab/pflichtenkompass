/**
 * Dateibefehle der Oberfläche: neu beginnen, Beispiel laden, Projektdatei öffnen und
 * speichern, lokale Daten löschen (Spezifikation 4.1, 4.8, 7.4, 8). Rückfragen kommen
 * als Dialog; die Prüfung der Datei macht `speicher.ts`.
 */
import { useMemo, type Dispatch } from 'react'
import { beispiel } from '../modell/beispiele'
import { dateiname } from '../modell/format'
import { alsJson, DATEIENDUNG, Formatfehler, leseProjektText, loescheLokaleDaten, neuesProjekt, pruefeGroesse } from '../modell/speicher'
import type { Beispiel, Datum, Projekt } from '../modell/typen'
import { plattform } from '../plattform'
import { gespeichertAus } from '../regeln/auswertung'
import type { Ergebnis } from '../regeln/typen'
import type { Aktion, Zustand } from '../zustand'
import { useBestaetigen, useRueckfrage } from './rueckfrage'

export interface DateiBefehle {
  neu(): Promise<void>
  ladeBeispiel(id: Beispiel['id']): Promise<void>
  /** Öffnet das Dateifeld (Browser). */
  oeffnen(): void
  /** Prüft und lädt den Inhalt einer gewählten Datei. */
  oeffneDatei(name: string, groesse: number, lies: () => Promise<string>): Promise<void>
  speichern(): Promise<void>
  loescheLokal(): Promise<void>
}

/** Hat das Projekt Antworten oder einen Status? Dann fragt die App vor dem Ersetzen nach. */
export function hatInhalt(p: Projekt, heute: Datum): boolean {
  const leer = neuesProjekt(heute)
  return JSON.stringify(p.profil) !== JSON.stringify(leer.profil) || Object.keys(p.status).length > 0
}

export function useDateiBefehle(a: {
  z: Zustand
  dispatch: Dispatch<Aktion>
  ergebnis: Ergebnis | null
  heute: Datum
  melde: (text: string) => void
  dateiFeld: () => HTMLInputElement | null
  /** Nach „Lokale Daten löschen“: Einstellungen auf den Standard, ohne sie zu speichern. */
  einstellungenZuruecksetzen: () => void
}): DateiBefehle {
  const bestaetigen = useBestaetigen()
  const rueckfrage = useRueckfrage()
  const { z, dispatch, ergebnis, heute, melde, dateiFeld, einstellungenZuruecksetzen } = a

  return useMemo<DateiBefehle>(() => {
    const ersetzen = async (titel: string, ja: string) =>
      !hatInhalt(z.projekt, heute) || (await bestaetigen(titel, 'Die bisherigen Antworten und der Status je Pflicht werden ersetzt. Gespeicherte Dateien bleiben unverändert.', ja))

    return {
      async neu() {
        if (!(await ersetzen('Neu beginnen?', 'Neu beginnen'))) return
        dispatch({ typ: 'laden', projekt: neuesProjekt(heute), schritt: 'vorhaben' })
        melde('Neues Vorhaben begonnen.')
      },

      async ladeBeispiel(id) {
        const b = beispiel(id)
        if (!(await ersetzen(`Beispiel „${b.titel}“ laden?`, 'Beispiel laden'))) return
        dispatch({ typ: 'laden', projekt: { ...neuesProjekt(heute), profil: b.profil }, schritt: 'ergebnis' })
        melde(`Beispiel ${b.id} „${b.titel}“ geladen.`)
      },

      oeffnen() {
        dateiFeld()?.click()
      },

      async oeffneDatei(name, groesse, lies) {
        let projekt: Projekt
        try {
          pruefeGroesse(groesse)
          projekt = leseProjektText(await lies())
        } catch (e) {
          const text = e instanceof Formatfehler ? e.message : 'Die Datei konnte nicht gelesen werden.'
          await rueckfrage({ titel: `„${name}“ nicht geöffnet`, text, knoepfe: [{ wert: 'ok', text: 'Schließen', art: 'haupt' }], abbrechen: 'ok' })
          return
        }
        if (!(await ersetzen(`„${name}“ öffnen?`, 'Datei öffnen'))) return
        dispatch({ typ: 'laden', projekt, schritt: 'ergebnis', datei: name })
        melde(`„${name}“ geöffnet.`)
      },

      async speichern() {
        const gespeichert = ergebnis ? gespeichertAus(ergebnis, heute) : null
        const projekt: Projekt = { ...z.projekt, gespeichert }
        const vorschlag = dateiname(projekt.profil.name, DATEIENDUNG, 'pflichten')
        const ort = await plattform.speichernUnter(vorschlag, alsJson(projekt), 'projekt')
        if (!ort) return
        dispatch({ typ: 'gespeichert', gespeichert })
        melde(`Als Datei gespeichert: ${ort.name}`)
      },

      async loescheLokal() {
        const ja = await bestaetigen(
          'Lokale Daten löschen?',
          'Antworten, Status und Einstellungen werden aus dem Speicher dieses Browsers entfernt. Gespeicherte Dateien bleiben erhalten.',
          'Lokale Daten löschen',
        )
        if (!ja) return
        const ok = loescheLokaleDaten()
        dispatch({ typ: 'geloescht', projekt: neuesProjekt(heute) })
        einstellungenZuruecksetzen()
        melde(ok ? 'Lokale Daten gelöscht.' : 'Der Browserspeicher ist nicht erreichbar; es lag nichts darin.')
      },
    }
  }, [z.projekt, dispatch, ergebnis, heute, melde, dateiFeld, einstellungenZuruecksetzen, bestaetigen, rueckfrage])
}
