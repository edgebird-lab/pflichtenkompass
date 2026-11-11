import { datumText } from '../../fristen/datum'
import { HINWEISTEXT } from '../../katalog/hinweis'
import { KATALOG_STAND, KATALOG_VERSION } from '../../katalog/typen'

export function StartSchritt({ onBeginnen }: { onBeginnen: () => void }) {
  return (
    <div className="schritt">
      <h1 id="schritt-titel">Pflichten-Kompass</h1>
      <p className="einleitung">
        Der Pflichten-Kompass zeigt Gründerinnen und Gründern, welche Anmeldungen, Meldungen und Fristen auf sie zukommen. Ein geführtes Interview ergibt eine begründete
        Pflichtenliste mit Frist, zuständiger Stelle, Rechtsgrundlage, Quelle und Stand. Die App läuft ohne Server und ohne KI; die Antworten bleiben auf diesem Rechner.
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
        <button type="button" className="knopf knopf-haupt" onClick={onBeginnen}>
          Neu beginnen
        </button>
      </div>
      <p className="leise klein">Beispiele laden, Datei öffnen und „Lokale Daten löschen“ folgen mit der Oberfläche (Phase 4).</p>
    </div>
  )
}
