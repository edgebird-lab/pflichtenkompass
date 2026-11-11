/**
 * Eingabefelder mit sichtbarem Label, Hilfe und Meldungen am Feld (Spezifikation 5.7):
 * Fehler und Warnungen sind über `aria-describedby` mit dem Feld verbunden.
 */
import { useState, type ReactNode } from 'react'
import type { Gelesen } from '../modell/format'

export interface Meldungen {
  /** Ungültige Eingabe; rot, mit `aria-invalid`. */
  fehler?: string | null
  /** Pflichtangabe ohne Antwort; ruhiger Hinweis (6.9: „Hinweis am Feld“). */
  offen?: string | null
  /** Warnung ohne Sperre. */
  warnung?: string | null
}

export interface FeldIds {
  id: string
  beschrieben: string | undefined
  ungueltig: boolean
}

function MeldungsTexte({ id, m }: { id: string; m: Meldungen }) {
  return (
    <>
      {m.fehler && (
        <p id={`${id}-fehler`} className="feld-meldung" role="alert">
          {m.fehler}
        </p>
      )}
      {!m.fehler && m.offen && (
        <p id={`${id}-offen`} className="feld-offen">
          {m.offen}
        </p>
      )}
      {m.warnung && (
        <p id={`${id}-warnung`} className="feld-warnung">
          <span aria-hidden="true">⚠ </span>
          {m.warnung}
        </p>
      )}
    </>
  )
}

function beschreibung(id: string, hilfe: boolean, m: Meldungen): string | undefined {
  const ids = [hilfe ? `${id}-hilfe` : null, m.fehler ? `${id}-fehler` : null, !m.fehler && m.offen ? `${id}-offen` : null, m.warnung ? `${id}-warnung` : null].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
}

/** Ein Feld mit einem Eingabeelement. */
export function Feld({ id, label, hilfe, meldungen = {}, children }: { id: string; label: ReactNode; hilfe?: ReactNode; meldungen?: Meldungen; children: (f: FeldIds) => ReactNode }) {
  const ungueltig = !!meldungen.fehler
  return (
    <div className={`feld${ungueltig ? ' feld-fehler' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children({ id, beschrieben: beschreibung(id, !!hilfe, meldungen), ungueltig })}
      {hilfe && (
        <div id={`${id}-hilfe`} className="feld-hilfe">
          {hilfe}
        </div>
      )}
      <MeldungsTexte id={id} m={meldungen} />
    </div>
  )
}

/** Eine Gruppe von Optionen (Radio oder Checkbox) als `fieldset` mit `legend`. */
export function Gruppe({ id, label, hilfe, meldungen = {}, children }: { id: string; label: ReactNode; hilfe?: ReactNode; meldungen?: Meldungen; children: ReactNode }) {
  return (
    <fieldset className={`feld${meldungen.fehler ? ' feld-fehler' : ''}`} id={id} aria-describedby={beschreibung(id, !!hilfe, meldungen)}>
      <legend>{label}</legend>
      <div className="optionen">{children}</div>
      {hilfe && (
        <div id={`${id}-hilfe`} className="feld-hilfe">
          {hilfe}
        </div>
      )}
      <MeldungsTexte id={id} m={meldungen} />
    </fieldset>
  )
}

export interface Option {
  wert: string
  text: string
}

export function Radios({ name, optionen, wert, onWahl }: { name: string; optionen: readonly Option[]; wert: string | null; onWahl: (w: string) => void }) {
  return (
    <>
      {optionen.map((o) => (
        <label key={o.wert} className={`option${wert === o.wert ? ' an' : ''}`}>
          <input type="radio" name={name} value={o.wert} checked={wert === o.wert} onChange={() => onWahl(o.wert)} />
          <span>{o.text}</span>
        </label>
      ))}
    </>
  )
}

export function Haken({ optionen, werte, onWahl }: { optionen: readonly Option[]; werte: readonly string[]; onWahl: (w: string[]) => void }) {
  return (
    <>
      {optionen.map((o) => {
        const an = werte.includes(o.wert)
        return (
          <label key={o.wert} className={`option${an ? ' an' : ''}`}>
            <input type="checkbox" value={o.wert} checked={an} onChange={() => onWahl(an ? werte.filter((w) => w !== o.wert) : [...werte, o.wert])} />
            <span>{o.text}</span>
          </label>
        )
      })}
    </>
  )
}

/**
 * Zahl oder Betrag als Text, damit „60.000“ und „1.250,50“ gehen. Gültige Eingaben gehen sofort
 * ins Profil, ungültige bleiben mit Fehlermeldung im Feld stehen (das Profil behält den letzten
 * gültigen Wert). Beim Verlassen wird ein gültiger Wert einheitlich formatiert.
 */
export function ZahlText({
  f,
  wert,
  lese,
  zeige,
  leerWert,
  onWert,
  onFehler,
  einheit,
}: {
  f: FeldIds
  wert: number | null
  lese: (text: string) => Gelesen
  zeige: (n: number | null) => string
  /** Wert für ein leeres Feld: `null` bei optionalen Fragen, sonst 0. */
  leerWert: number | null
  onWert: (n: number | null) => void
  onFehler: (meldung: string | null) => void
  einheit?: string
}) {
  const [text, setText] = useState(() => zeige(wert))
  return (
    <span className="zahl">
      <input
        id={f.id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={text}
        aria-describedby={f.beschrieben}
        aria-invalid={f.ungueltig || undefined}
        onChange={(e) => {
          setText(e.target.value)
          const g = lese(e.target.value)
          if (!g.ok) return onFehler(g.meldung)
          onFehler(null)
          onWert(g.wert ?? leerWert)
        }}
        onBlur={() => {
          const g = lese(text)
          if (g.ok) setText(zeige(g.wert ?? leerWert))
        }}
      />
      {einheit && <span className="zahl-einheit">{einheit}</span>}
    </span>
  )
}
