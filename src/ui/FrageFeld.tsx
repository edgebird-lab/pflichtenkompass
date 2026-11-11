/**
 * Eine Frage des Interviews als Eingabefeld (Spezifikation 5.2): Label mit Fragenummer,
 * Hilfe mit Normlinks, Fehler, Hinweise und Warnungen aus 6.9 am Feld.
 */
import { useState } from 'react'
import { datumText, istDatum } from '../fristen/datum'
import { antwort } from '../modell/antworten'
import { betragFeldText, leseAnzahl, leseBetrag } from '../modell/format'
import { frageNummer } from '../modell/fragen'
import { NAME_MAX, START_FRUEHESTENS, START_SPAETESTENS } from '../modell/profil'
import type { Frage, FrageId } from '../modell/typen'
import { Feld, Gruppe, Haken, Radios, ZahlText, type FeldIds, type Meldungen } from './Eingaben'
import { useApp } from './kontext'
import { Normen } from './Normen'

/** Pflichtangaben, deren Fehler nur „noch keine Antwort“ bedeutet: ruhiger Hinweis statt Fehler. */
const NUR_OFFEN = new Set<FrageId>(['F03', 'F09', 'F19'])
/** Beträge ohne Standard: leer bedeutet „keine Angabe“ (5.2). */
const OPTIONAL = new Set<FrageId>(['F18', 'F28', 'F29'])
/** Daten, die ohne Angabe dem Beginn der Tätigkeit folgen (F13, F23 „= F02“). */
const FOLGT_START = new Set<FrageId>(['F13', 'F23'])
const JA_NEIN = [
  { wert: 'ja', text: 'ja' },
  { wert: 'nein', text: 'nein' },
] as const

export function FrageFeld({ frage }: { frage: Frage }) {
  const { z, aendere, pruefung } = useApp()
  const p = z.projekt.profil
  const [lokal, setLokal] = useState<string | null>(null)
  const id = `frage-${frage.id}`
  const wert = antwort(p, frage.id)
  const gemeldet = pruefung.fehler.find((m) => m.frage === frage.id)?.text ?? null
  const meldungen: Meldungen = {
    fehler: lokal ?? (gemeldet && !NUR_OFFEN.has(frage.id) ? gemeldet : null),
    offen: gemeldet && NUR_OFFEN.has(frage.id) ? gemeldet : null,
    warnung: pruefung.warnungen.find((m) => m.frage === frage.id)?.text ?? null,
  }
  const label = (
    <>
      <span className="frage-nr">Frage {frageNummer(frage.id)}</span> {frage.text}
    </>
  )
  const hilfe = (
    <>
      {frage.hilfe}
      {FOLGT_START.has(frage.id) && ` Ohne eigene Angabe gilt der Beginn der Tätigkeit (${datumText(p.start)}).`}
      {frage.normen.length > 0 && (
        <span className="normen-zeile">
          Gesetzestext: <Normen normen={frage.normen} />
        </span>
      )}
    </>
  )

  const optionen = frage.optionen ?? []
  switch (frage.typ) {
    case 'text':
      return (
        <Feld id={id} label={label} hilfe={hilfe} meldungen={meldungen}>
          {(f) => <input id={f.id} type="text" maxLength={NAME_MAX} autoComplete="off" value={String(wert ?? '')} aria-describedby={f.beschrieben} aria-invalid={f.ungueltig || undefined} onChange={(e) => aendere(frage.id, e.target.value)} />}
        </Feld>
      )

    case 'datum':
      return (
        <Feld id={id} label={label} hilfe={hilfe} meldungen={meldungen}>
          {(f) => <DatumFeld f={f} frage={frage.id} wert={typeof wert === 'string' ? wert : null} onFehler={setLokal} />}
        </Feld>
      )

    case 'auswahl':
      if (frage.id === 'F03') {
        return (
          <Feld id={id} label={label} hilfe={hilfe} meldungen={meldungen}>
            {(f) => (
              <select id={f.id} value={String(wert ?? '')} aria-describedby={f.beschrieben} aria-invalid={f.ungueltig || undefined} onChange={(e) => aendere(frage.id, e.target.value || null)}>
                <option value="">Bitte wählen</option>
                {optionen.map((o) => (
                  <option key={o.wert} value={o.wert}>
                    {o.text}
                  </option>
                ))}
              </select>
            )}
          </Feld>
        )
      }
      return (
        <Gruppe id={id} label={label} hilfe={hilfe} meldungen={meldungen}>
          <Radios name={id} optionen={optionen} wert={String(wert)} onWahl={(w) => aendere(frage.id, w)} />
        </Gruppe>
      )

    case 'mehrfach':
      return (
        <Gruppe id={id} label={label} hilfe={hilfe} meldungen={meldungen}>
          <Haken optionen={optionen} werte={Array.isArray(wert) ? wert : []} onWahl={(w) => aendere(frage.id, w)} />
        </Gruppe>
      )

    case 'janein':
      return (
        <Gruppe id={id} label={label} hilfe={hilfe} meldungen={meldungen}>
          <Radios name={id} optionen={JA_NEIN} wert={wert ? 'ja' : 'nein'} onWahl={(w) => aendere(frage.id, w === 'ja')} />
        </Gruppe>
      )

    case 'zahl':
      return (
        <Feld id={id} label={label} hilfe={hilfe} meldungen={meldungen}>
          {(f) => <ZahlText f={f} wert={typeof wert === 'number' ? wert : 0} lese={leseAnzahl} zeige={(n) => String(n ?? 0)} leerWert={0} onWert={(n) => aendere(frage.id, n ?? 0)} onFehler={setLokal} />}
        </Feld>
      )

    case 'betrag': {
      const optional = OPTIONAL.has(frage.id)
      return (
        <Feld id={id} label={label} hilfe={hilfe} meldungen={meldungen}>
          {(f) => (
            <ZahlText
              f={f}
              wert={typeof wert === 'number' ? wert : null}
              lese={(t) => leseBetrag(t, frage.id === 'F26')}
              zeige={betragFeldText}
              leerWert={optional ? null : 0}
              onWert={(n) => aendere(frage.id, n)}
              onFehler={setLokal}
              einheit="€"
            />
          )}
        </Feld>
      )
    }
  }
}

/**
 * Datumsfeld ohne feste Bindung an den Wert: Der Browser hält Zwischenstände beim Tippen
 * selbst, gültige Daten gehen sofort ins Profil. Nach Laden oder Neubeginn entsteht das Feld
 * neu (Schlüssel `version` im Schritt).
 */
function DatumFeld({ f, frage, wert, onFehler }: { f: FeldIds; frage: FrageId; wert: string | null; onFehler: (m: string | null) => void }) {
  const { aendere } = useApp()
  const pflicht = frage === 'F02'
  return (
    <input
      id={f.id}
      type="date"
      defaultValue={wert ?? ''}
      min={pflicht ? START_FRUEHESTENS : undefined}
      max={pflicht ? START_SPAETESTENS : undefined}
      aria-describedby={f.beschrieben}
      aria-invalid={f.ungueltig || undefined}
      onChange={(e) => {
        const v = e.target.value
        if (istDatum(v)) {
          onFehler(null)
          aendere(frage, v)
        } else if (v === '' && !pflicht) {
          onFehler(null)
          aendere(frage, null)
        }
      }}
      onBlur={(e) => {
        const v = e.target.value
        if (v === '' && !pflicht) return
        onFehler(istDatum(v) ? null : 'Vollständiges Datum angeben (TT.MM.JJJJ).')
      }}
    />
  )
}
