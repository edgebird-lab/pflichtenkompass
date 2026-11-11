/**
 * Pflichtkarte im Ergebnis (Spezifikation 5.3): Titel, Kurztext, Frist, nächster Termin mit
 * „gesetzlich bis“, Stelle und Weg, Normen als Links, Quelle mit Stand, Hinweise, „Warum?“,
 * Status und Notiz.
 */
import { useId, useState } from 'react'
import { AUFBEWAHRUNG, aufbewahrenBis, type AufbewahrungsArt } from '../fristen/berechnungen'
import { datumMitTag, datumText, jahrVon } from '../fristen/datum'
import { naechsterTermin } from '../fristen/termine'
import { quelle } from '../katalog/quellen'
import type { Luecke } from '../katalog/typen'
import { NOTIZ_MAX } from '../modell/profil'
import { BEARBEITUNGEN, type Bearbeitung } from '../modell/typen'
import { bedingungText } from '../regeln/auswertung'
import type { PflichtErgebnis, Treffer } from '../regeln/typen'
import { useApp } from './kontext'
import { ExternerLink, Normen } from './Normen'
import { BEARBEITUNG_TEXT, terminText } from './texte'

export function Warum({ treffer, id }: { treffer: readonly Treffer[]; id: string }) {
  return (
    <details className="warum">
      <summary>
        Warum?<span className="nur-vorlesen"> Begründung zu „{id}“</span>
      </summary>
      {treffer.map((t) => (
        <div key={t.regel} className="warum-treffer">
          <p>
            {t.begruendung} <span className="leise klein">(Regel {t.regel})</span>
          </p>
          {t.bedingungen.length > 0 && (
            <ul>
              {t.bedingungen.map((b) => (
                <li key={b.merkmal}>{bedingungText(b, true)}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </details>
  )
}

function Aufbewahrungsrechner() {
  const { heute } = useApp()
  const [art, setArt] = useState<AufbewahrungsArt>('belege')
  const [jahr, setJahr] = useState(String(jahrVon(heute)))
  const id = useId()
  const j = /^\d{4}$/.test(jahr) ? Number(jahr) : null
  return (
    <div className="rechner" role="group" aria-labelledby={`${id}-titel`}>
      <p id={`${id}-titel`} className="rechner-titel">
        Aufbewahren bis
      </p>
      <div className="rechner-felder">
        <label>
          Unterlage{' '}
          <select value={art} onChange={(e) => setArt(e.target.value as AufbewahrungsArt)}>
            {AUFBEWAHRUNG.map((a) => (
              <option key={a.art} value={a.art}>
                {a.text} ({a.jahre} Jahre)
              </option>
            ))}
          </select>
        </label>
        <label>
          Jahr der letzten Eintragung, Aufstellung oder Absendung <input type="text" inputMode="numeric" className="jahr" value={jahr} onChange={(e) => setJahr(e.target.value.trim())} />
        </label>
      </div>
      <p aria-live="polite">{j !== null ? <strong>bis {datumText(aufbewahrenBis(art, j))}</strong> : 'Jahr vierstellig angeben.'}</p>
    </div>
  )
}

export function Pflichtkarte({ e }: { e: PflichtErgebnis }) {
  const { z, heute, setzeStatus } = useApp()
  const p = e.pflicht
  const status = z.projekt.status[p.id]
  const bearbeitung = status?.bearbeitung ?? 'offen'
  const [gekuerzt, setGekuerzt] = useState(false)
  const naechster = naechsterTermin(e.termine, heute)
  const titelId = `pflicht-${p.id}`

  return (
    <article className={`pflicht karte${bearbeitung !== 'offen' ? ' pflicht-bearbeitet' : ''}`} aria-labelledby={titelId} data-pflicht={p.id}>
      <header className="pflicht-kopf">
        <h3 id={titelId}>
          <span className="pflicht-nr">{p.nr}.</span> {p.titel}
        </h3>
        <div className="etiketten">
          {e.neu && <span className="etikett etikett-neu">neu</span>}
          {bearbeitung !== 'offen' && <span className="etikett">{BEARBEITUNG_TEXT[bearbeitung]}</span>}
        </div>
      </header>
      <p>{p.kurz}</p>
      <dl className="pflicht-daten">
        <div>
          <dt>Frist</dt>
          <dd>{p.fristText}</dd>
        </div>
        {naechster && (
          <div>
            <dt>Nächster Termin</dt>
            <dd>
              <strong>{datumMitTag(naechster.faelligAm)}</strong>
              {naechster.gesetzlichBis && <> (gesetzlich bis {datumMitTag(naechster.gesetzlichBis)})</>}
              {terminText(naechster) !== p.titel && `: ${terminText(naechster)}`}
              {e.termine.length > 1 && <span className="leise"> · {e.termine.length} Termine im Zeitraum</span>}
            </dd>
          </div>
        )}
        {(p.stelle !== '–' || p.weg) && (
          <div>
            <dt>Stelle</dt>
            <dd>
              {p.stelle !== '–' ? p.stelle : ''}
              {p.weg && `${p.stelle !== '–' ? '; ' : ''}${p.weg}`}
            </dd>
          </div>
        )}
        <div>
          <dt>Rechtsgrundlage</dt>
          <dd>
            <Normen normen={p.normen} />
          </dd>
        </div>
        <div>
          <dt>Quelle</dt>
          <dd>
            {p.quellen.map((q, i) => (
              <span key={q}>
                {i > 0 && '; '}
                <ExternerLink href={quelle(q).url}>{quelle(q).titel}</ExternerLink>
              </span>
            ))}{' '}
            <span className="leise">· Stand {datumText(p.stand)}</span>
          </dd>
        </div>
      </dl>
      {e.rechenweg.length > 0 && (
        <ul className="rechenweg">
          {e.rechenweg.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
      {p.hinweise.length > 0 && (
        <ul className="hinweise">
          {p.hinweise.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}
      {p.id === 'aufbewahrung' && <Aufbewahrungsrechner />}
      <Warum treffer={e.treffer} id={p.titel} />
      <div className="status-zeile">
        <label>
          Status
          <select value={bearbeitung} onChange={(ev) => setzeStatus(p.id, { bearbeitung: ev.target.value as Bearbeitung })}>
            {BEARBEITUNGEN.map((b) => (
              <option key={b} value={b}>
                {BEARBEITUNG_TEXT[b]}
              </option>
            ))}
          </select>
        </label>
        <div className="notiz">
          <label htmlFor={`notiz-${p.id}`}>Notiz</label>
          <textarea
            id={`notiz-${p.id}`}
            rows={2}
            value={status?.notiz ?? ''}
            aria-describedby={`notiz-${p.id}-zaehler`}
            onChange={(ev) => {
              const text = ev.target.value
              setGekuerzt(text.length > NOTIZ_MAX)
              setzeStatus(p.id, { notiz: text.slice(0, NOTIZ_MAX) })
            }}
          />
          <span id={`notiz-${p.id}-zaehler`} className="leise klein" aria-live="polite">
            {gekuerzt ? `Auf ${NOTIZ_MAX} Zeichen gekürzt.` : `${(status?.notiz ?? '').length} von ${NOTIZ_MAX} Zeichen`}
          </span>
        </div>
      </div>
    </article>
  )
}

export function Lueckenkarte({ luecke, treffer }: { luecke: Luecke; treffer: readonly Treffer[] }) {
  return (
    <article className="luecke karte" aria-labelledby={`luecke-${luecke.id}`}>
      <header className="pflicht-kopf">
        <h3 id={`luecke-${luecke.id}`}>{luecke.titel}</h3>
        <div className="etiketten">
          <span className="etikett etikett-luecke">{luecke.art === 'pruefen' ? 'Prüfen' : 'Nicht geprüft'}</span>
        </div>
      </header>
      <p>
        <strong>In Version 0.1 nicht geprüft:</strong> {luecke.text}
      </p>
      <Warum treffer={treffer} id={luecke.titel} />
    </article>
  )
}
