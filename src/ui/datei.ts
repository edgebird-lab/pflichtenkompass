/**
 * Dateibefehle der Oberfläche: neu beginnen, Beispiel laden, Projektdatei öffnen und
 * speichern, PDF, lokale Daten löschen (Spezifikation 4.1, 4.8, 7.4, 7.6, 8). Rückfragen
 * kommen als Dialog; die Prüfung der Datei macht `speicher.ts`. Im Windows-Programm merkt
 * sich die Oberfläche den Pfad der geöffneten oder gespeicherten Datei: „Speichern“ schreibt
 * dorthin, „Speichern unter“ fragt neu. Im Browser lädt beides die Datei herunter.
 */
import { useMemo, useRef, type Dispatch } from 'react'
import { beispiel } from '../modell/beispiele'
import { dateiname } from '../modell/format'
import { alsJson, DATEIENDUNG, Formatfehler, leseProjektText, loescheLokaleDaten, neuesProjekt, pruefeGroesse } from '../modell/speicher'
import type { Beispiel, Datum, Projekt } from '../modell/typen'
import { plattform, type Datei } from '../plattform'
import { gespeichertAus } from '../regeln/auswertung'
import type { Ergebnis } from '../regeln/typen'
import type { Aktion, Zustand } from '../zustand'
import { useBestaetigen, useRueckfrage } from './rueckfrage'

export interface DateiBefehle {
  neu(): Promise<void>
  ladeBeispiel(id: Beispiel['id']): Promise<void>
  /** Öffnet das Dateifeld (Browser) oder den Öffnen-Dialog (Programm). */
  oeffnen(): void
  /** Prüft und lädt den Inhalt einer gewählten Datei; `pfad` nur im Programm. */
  oeffneDatei(name: string, groesse: number, lies: () => Promise<string>, pfad?: string | null): Promise<void>
  /** Datei aus dem Programm (Doppelklick, zweiter Start, ins Fenster gezogen). */
  oeffneGewaehlt(d: Datei): Promise<void>
  /** Meldung, wenn eine Datei nicht geöffnet werden konnte. */
  zeigeFehler(name: string | null, text: string): Promise<void>
  /** Programm: an den bekannten Pfad, sonst wie „Speichern unter“. Browser: Download. */
  speichern(): Promise<void>
  speichernUnter(): Promise<void>
  /** Druckansicht als PDF ohne Druckdialog (nur im Programm). */
  pdf(): Promise<void>
  loescheLokal(): Promise<void>
}

/** Hat das Projekt Antworten oder einen Status? Dann fragt die App vor dem Ersetzen nach. */
export function hatInhalt(p: Projekt, heute: Datum): boolean {
  const leer = neuesProjekt(heute)
  return JSON.stringify(p.profil) !== JSON.stringify(leer.profil) || Object.keys(p.status).length > 0
}

const fehlertext = (e: unknown) => (e instanceof Error ? e.message : String(e))

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
  // Programm: Datei, in die „Speichern“ schreibt (geöffnet oder unter diesem Namen gespeichert)
  const dokument = useRef<{ pfad: string; name: string } | null>(null)

  return useMemo<DateiBefehle>(() => {
    const ersetzen = async (titel: string, ja: string) =>
      !hatInhalt(z.projekt, heute) || (await bestaetigen(titel, 'Die bisherigen Antworten und der Status je Pflicht werden ersetzt. Gespeicherte Dateien bleiben unverändert.', ja))

    const zeigeFehler = async (name: string | null, text: string) => {
      await rueckfrage({ titel: name ? `„${name}“ nicht geöffnet` : 'Datei nicht geöffnet', text, knoepfe: [{ wert: 'ok', text: 'Schließen', art: 'haupt' }], abbrechen: 'ok' })
    }

    const oeffneDatei = async (name: string, groesse: number, lies: () => Promise<string>, pfad: string | null = null) => {
      let projekt: Projekt
      try {
        pruefeGroesse(groesse)
        projekt = leseProjektText(await lies())
      } catch (e) {
        await zeigeFehler(name, e instanceof Formatfehler ? e.message : 'Die Datei konnte nicht gelesen werden.')
        return
      }
      if (!(await ersetzen(`„${name}“ öffnen?`, 'Datei öffnen'))) return
      dispatch({ typ: 'laden', projekt, schritt: 'ergebnis', datei: name })
      dokument.current = pfad ? { pfad, name } : null
      melde(`„${name}“ geöffnet.`)
    }

    const oeffneGewaehlt = (d: Datei) => oeffneDatei(d.name, new TextEncoder().encode(d.inhalt).length, async () => d.inhalt, d.pfad)

    /** Projekt mit dem Stand für den Änderungshinweis beim nächsten Öffnen (4.8). */
    const zumSpeichern = () => {
      const gespeichert = ergebnis ? gespeichertAus(ergebnis, heute) : null
      return { gespeichert, json: alsJson({ ...z.projekt, gespeichert }) }
    }

    const speichernUnter = async () => {
      const { gespeichert, json } = zumSpeichern()
      const vorschlag = dokument.current?.name ?? dateiname(z.projekt.profil.name, DATEIENDUNG, 'pflichten')
      try {
        const ort = await plattform.speichernUnter(vorschlag, json, 'projekt')
        if (!ort) return
        if (ort.pfad) dokument.current = { pfad: ort.pfad, name: ort.name }
        dispatch({ typ: 'gespeichert', gespeichert })
        melde(`Als Datei gespeichert: ${ort.name}`)
      } catch (e) {
        melde(`Nicht gespeichert: ${fehlertext(e)}`)
      }
    }

    return {
      async neu() {
        if (!(await ersetzen('Neu beginnen?', 'Neu beginnen'))) return
        dispatch({ typ: 'laden', projekt: neuesProjekt(heute), schritt: 'vorhaben' })
        dokument.current = null
        melde('Neues Vorhaben begonnen.')
      },

      async ladeBeispiel(id) {
        const b = beispiel(id)
        if (!(await ersetzen(`Beispiel „${b.titel}“ laden?`, 'Beispiel laden'))) return
        dispatch({ typ: 'laden', projekt: { ...neuesProjekt(heute), profil: b.profil }, schritt: 'ergebnis' })
        dokument.current = null
        melde(`Beispiel ${b.id} „${b.titel}“ geladen.`)
      },

      oeffnen() {
        if (!plattform.desktop) {
          dateiFeld()?.click()
          return
        }
        void plattform.oeffnen().then(
          (d) => d && oeffneGewaehlt(d),
          (e: unknown) => zeigeFehler(null, fehlertext(e)),
        )
      },

      oeffneDatei,
      oeffneGewaehlt,
      zeigeFehler,

      async speichern() {
        const d = dokument.current
        if (!plattform.desktop || !d) return speichernUnter()
        const { gespeichert, json } = zumSpeichern()
        try {
          await plattform.speichern(d.pfad, json)
          dispatch({ typ: 'gespeichert', gespeichert })
          melde(`Als Datei gespeichert: ${d.name}`)
        } catch (e) {
          melde(`Nicht gespeichert: ${fehlertext(e)}`)
        }
      },

      speichernUnter,

      async pdf() {
        try {
          const name = await plattform.alsPdf(dateiname(z.projekt.profil.name, '.pdf', 'pflichten'))
          if (name) melde(`Als PDF gespeichert: ${name}`)
        } catch (e) {
          melde(`PDF nicht gespeichert: ${fehlertext(e)}`)
        }
      },

      async loescheLokal() {
        const ja = await bestaetigen(
          'Lokale Daten löschen?',
          `Antworten, Status und Einstellungen werden aus dem Speicher ${plattform.desktop ? 'dieses Programms' : 'dieses Browsers'} entfernt. Gespeicherte Dateien bleiben erhalten.`,
          'Lokale Daten löschen',
        )
        if (!ja) return
        const ok = loescheLokaleDaten()
        dispatch({ typ: 'geloescht', projekt: neuesProjekt(heute) })
        dokument.current = null
        einstellungenZuruecksetzen()
        melde(ok ? 'Lokale Daten gelöscht.' : 'Der Browserspeicher ist nicht erreichbar; es lag nichts darin.')
      },
    }
  }, [z.projekt, dispatch, ergebnis, heute, melde, dateiFeld, einstellungenZuruecksetzen, bestaetigen, rueckfrage])
}
