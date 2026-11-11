import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { RueckfrageKontext, type Rueckfrage, type RueckfrageFn } from './rueckfrage'

interface Offen {
  frage: Rueckfrage<string>
  antwort: (wert: string) => void
}

/**
 * Stellt Rückfragen als modaler Dialog (statt window.confirm): barrierefrei,
 * mit mehr als zwei Antworten und im Windows-Programm im eigenen Stil.
 * Escape bricht ab; der Fokus steht auf „Abbrechen“.
 */
export function RueckfrageDialog({ children }: { children: ReactNode }) {
  const [offen, setOffen] = useState<Offen | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const warteschlange = useRef<Offen[]>([])

  const frage = useCallback<RueckfrageFn>(
    <T extends string>(f: Rueckfrage<T>) =>
      new Promise<T>((resolve) => {
        const eintrag: Offen = { frage: f, antwort: (w) => resolve(w as T) }
        setOffen((jetzt) => {
          if (jetzt) {
            warteschlange.current.push(eintrag)
            return jetzt
          }
          return eintrag
        })
      }),
    [],
  )

  useEffect(() => {
    const d = dialog.current
    if (!offen || !d) return
    if (!d.open) d.showModal()
    // showModal setzt den Fokus auf den ersten Knopf; er gehört auf die sichere Antwort
    d.querySelector<HTMLButtonElement>('[data-abbrechen]')?.focus()
  }, [offen])

  const antworte = (wert: string) => {
    if (!offen) return
    offen.antwort(wert)
    dialog.current?.close()
    setOffen(warteschlange.current.shift() ?? null)
  }

  return (
    <RueckfrageKontext.Provider value={frage}>
      {children}
      {offen && (
        <dialog
          ref={dialog}
          className="rueckfrage-dialog"
          aria-labelledby="rueckfrage-titel"
          aria-describedby="rueckfrage-text"
          onCancel={(e) => {
            e.preventDefault()
            antworte(offen.frage.abbrechen)
          }}
        >
          <h2 id="rueckfrage-titel">{offen.frage.titel}</h2>
          <p id="rueckfrage-text">{offen.frage.text}</p>
          <div className="knopfreihe">
            {offen.frage.knoepfe.map((k) => (
              <button
                key={k.wert}
                type="button"
                // Fokus auf der sicheren Antwort, damit Enter nichts löscht oder verwirft
                data-abbrechen={k.wert === offen.frage.abbrechen ? '' : undefined}
                className={`knopf${k.art === 'haupt' ? ' knopf-haupt' : k.art === 'gefahr' ? ' knopf-gefahr' : ''}`}
                onClick={() => antworte(k.wert)}
              >
                {k.text}
              </button>
            ))}
          </div>
        </dialog>
      )}
    </RueckfrageKontext.Provider>
  )
}
