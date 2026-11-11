import { createContext, useCallback, useContext } from 'react'

export interface RueckfrageKnopf<T extends string> {
  wert: T
  text: string
  art?: 'haupt' | 'gefahr'
}

/** Rückfrage mit mehreren Antworten, z. B. „Speichern / Nicht speichern / Abbrechen“. */
export interface Rueckfrage<T extends string> {
  titel: string
  text: string
  knoepfe: RueckfrageKnopf<T>[]
  /** Antwort bei Escape oder Schließen; bekommt auch den Fokus, damit Enter nichts zerstört. */
  abbrechen: T
}

export type RueckfrageFn = <T extends string>(f: Rueckfrage<T>) => Promise<T>

export const RueckfrageKontext = createContext<RueckfrageFn | null>(null)

export function useRueckfrage(): RueckfrageFn {
  const f = useContext(RueckfrageKontext)
  if (!f) throw new Error('useRueckfrage außerhalb von RueckfrageDialog')
  return f
}

/** Ja/Abbrechen-Rückfrage; true bei Ja. */
export function useBestaetigen(): (titel: string, text: string, ja: string) => Promise<boolean> {
  const frage = useRueckfrage()
  return useCallback(
    (titel, text, ja) =>
      frage({ titel, text, knoepfe: [{ wert: 'ja', text: ja, art: 'gefahr' }, { wert: 'nein', text: 'Abbrechen' }], abbrechen: 'nein' }).then((w) => w === 'ja'),
    [frage],
  )
}
