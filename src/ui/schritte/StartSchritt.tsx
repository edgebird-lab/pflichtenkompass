import { datumText } from '../../fristen/datum'
import { HINWEISTEXT } from '../../katalog/hinweis'
import { KATALOG_STAND, KATALOG_VERSION } from '../../katalog/typen'
import { beispiele } from '../../modell/beispiele'
import { BUNDESLAND_NAMEN } from '../../modell/fragen'
import { plattform } from '../../plattform'
import { hatInhalt } from '../datei'
import { useApp } from '../kontext'
import { rechtsformText } from '../texte'

/** Startseite (5.1, Schritt 0): Zweck, Hinweis, Stand; neu beginnen, Beispiel laden, Datei öffnen, lokale Daten löschen. */
export function StartSchritt() {
  const { z, heute, ergebnis, datei, geheZu } = useApp()
  const vorhanden = hatInhalt(z.projekt, heute)
  const name = z.projekt.profil.name.trim()

  return (
    <div className="schritt">
      <h1 id="schritt-titel" tabIndex={-1}>Pflichten-Kompass</h1>
      <p className="einleitung">
        Der Pflichten-Kompass zeigt Gründerinnen und Gründern, welche Anmeldungen, Meldungen und Fristen auf sie zukommen. Aus rund 20 Fragen entsteht eine begründete Pflichtenliste mit Frist,
        zuständiger Stelle, Rechtsgrundlage, Quelle und Stand. Die App läuft ohne Server und ohne KI; die Antworten bleiben auf diesem Rechner.
      </p>
      <div className="hinweis-kasten" role="note" aria-labelledby="hinweis-titel">
        <h2 id="hinweis-titel">Keine Rechtsberatung</h2>
        <p>{HINWEISTEXT}</p>
      </div>
      <dl className="stand">
        <div>
          <dt>Katalog</dt>
          <dd>{KATALOG_VERSION}</dd>
        </div>
        <div>
          <dt>Rechtsstand</dt>
          <dd>{datumText(KATALOG_STAND)}</dd>
        </div>
      </dl>

      <div className="knopfreihe">
        {vorhanden && (
          <button type="button" className="knopf knopf-haupt" onClick={() => geheZu(ergebnis ? 'ergebnis' : 'vorhaben')}>
            Weiter mit {name ? `„${name}“` : 'den gespeicherten Antworten'}
          </button>
        )}
        <button type="button" className={`knopf${vorhanden ? '' : ' knopf-haupt'}`} onClick={() => void datei.neu()}>
          Neu beginnen
        </button>
        <button type="button" className="knopf" onClick={() => datei.oeffnen()}>
          Datei öffnen …
        </button>
      </div>

      <section className="karte" aria-labelledby="beispiele-titel">
        <h2 id="beispiele-titel">Beispiel laden</h2>
        <p className="leise klein">Sechs erfundene Gründungen zum Ausprobieren; sie ersetzen die aktuellen Antworten.</p>
        <ul className="beispiele">
          {beispiele().map((b) => (
            <li key={b.id}>
              <button type="button" className="beispiel-knopf" onClick={() => void datei.ladeBeispiel(b.id)}>
                <span className="beispiel-kennung" aria-hidden="true">
                  {b.id}
                </span>
                <span>
                  <strong>
                    Beispiel {b.id}: {b.titel}
                  </strong>
                  <small>
                    {rechtsformText(b.profil.rechtsform)}, {b.profil.bundesland ? BUNDESLAND_NAMEN[b.profil.bundesland] : ''}, Start {datumText(b.profil.start)}
                  </small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="karte" aria-labelledby="daten-titel">
        <h2 id="daten-titel">Daten auf diesem Rechner</h2>
        <p className="leise">
          Antworten, Status und Einstellungen liegen nur im Speicher {plattform.desktop ? 'dieses Programms' : 'dieses Browsers'}. „{plattform.desktop ? 'Speichern' : 'Als Datei speichern'}“ im
          Menü „Projekt“ sichert sie als Datei <code>.pflichtenkompass</code>. An
          Rechnern, die mehrere Personen nutzen, die Daten nach der Arbeit löschen.
        </p>
        <button type="button" className="knopf knopf-gefahr" onClick={() => void datei.loescheLokal()}>
          Lokale Daten löschen
        </button>
      </section>
    </div>
  )
}
