/**
 * Hilfe rechts neben dem Inhalt (Spezifikation 5.1, Spalte „Zeigt“). Alle Aussagen stammen
 * aus dem geprüften Katalog, den Hilfetexten der Fragen und Abschnitt 6.8 der Spezifikation.
 */
import { kleinunternehmerStatus } from '../fristen/berechnungen'
import { betragText } from '../modell/format'
import { SOFORTMELDE_BEREICHE } from '../modell/fragen'
import { KLEINUNTERNEHMER_LAUFEND, KLEINUNTERNEHMER_VORJAHR } from '../modell/merkmale'
import type { Schritt } from '../zustand'
import { useApp } from './kontext'
import { ExternerLink } from './Normen'

const gii = (pfad: string) => `https://www.gesetze-im-internet.de/${pfad}`

function Kleinunternehmer() {
  const { z } = useApp()
  const st = z.projekt.profil.steuern
  if (!st.kleinunternehmer) {
    return (
      <p>
        Die Kleinunternehmerregelung ist möglich bei höchstens {betragText(KLEINUNTERNEHMER_VORJAHR)} Umsatz im Vorjahr und höchstens {betragText(KLEINUNTERNEHMER_LAUFEND)} im laufenden Jahr
        (§ 19 Abs. 1 UStG).
      </p>
    )
  }
  const status = kleinunternehmerStatus({ gruendungsjahr: true, vorjahr: null, laufend: st.umsatzErstesJahr })
  return (
    <p>
      <strong>Kleinunternehmerregelung bei {betragText(st.umsatzErstesJahr)} Umsatz: </strong>
      {status === 'moeglich' && 'nach den Grenzen möglich.'}
      {status === 'pruefen' &&
        `prüfen. Welche Grenze im Gründungsjahr gilt, regelt der Wortlaut von § 19 Abs. 1 UStG nicht; über ${betragText(KLEINUNTERNEHMER_VORJAHR)} zeigt die App deshalb einen Prüfhinweis.`}
      {status === 'nichtMoeglich' && `nicht anwendbar, weil der Umsatz über ${betragText(KLEINUNTERNEHMER_LAUFEND)} liegt. Die App rechnet ohne die Regelung.`}
    </p>
  )
}

function Inhalt({ schritt }: { schritt: Schritt }) {
  switch (schritt) {
    case 'start':
      return (
        <>
          <p>Fünf Schritte mit Fragen, danach Ergebnis, Termine und die Regeln. Nach jeder Antwort rechnet die App neu.</p>
          <p>Jede Pflicht nennt Frist, Stelle, Rechtsgrundlage, Quelle und Stand. „Warum?“ zeigt, welche Antworten sie ausgelöst haben.</p>
          <p>Was diese Version nicht prüft, steht im Ergebnis unter „Nicht geprüft“.</p>
        </>
      )
    case 'vorhaben':
      return (
        <>
          <h3>Rechtsformen</h3>
          <p>Einzelunternehmen: eine Person. GbR: mehrere Personen; mit Handelsgewerbe ist sie eine OHG. UG und GmbH bestehen als solche erst mit der Eintragung ins Handelsregister.</p>
          <h3>Gewerblich oder freiberuflich</h3>
          <p>
            Freie Berufe stehen im Katalog von <ExternerLink href={gii('estg/__18.html')}>§ 18 Abs. 1 Nr. 1 EStG</ExternerLink>. Gewerbe werden über die Gemeinde angezeigt, freie Berufe teilen
            die Aufnahme dem Finanzamt selbst mit (§ 138 AO). Im Zweifel „gewerblich“ wählen.
          </p>
          <h3>Nicht abgedeckt</h3>
          <p>KG, GmbH &amp; Co. KG, Verein, abweichendes Wirtschaftsjahr, mehrere Betriebsstätten, Reisegewerbe, erlaubnispflichtige Gewerbe und Kammerberufe.</p>
        </>
      )
    case 'taetigkeit':
      return (
        <>
          <h3>Handwerk</h3>
          <p>
            Zulassungspflichtige Handwerke (Anlage A der Handwerksordnung) brauchen die Eintragung in die Handwerksrolle vor dem Beginn. Zulassungsfreie Handwerke (Anlage B1) und
            handwerksähnliche Gewerbe (Anlage B2) zeigen den Beginn unverzüglich an (<ExternerLink href={gii('hwo/__18.html')}>§ 18 HwO</ExternerLink>). Bei „unklar“ zeigt die App einen
            Prüfhinweis.
          </p>
          <h3>Lebensmittel</h3>
          <p>
            Wer mit bestimmten Lebensmitteln arbeitet, braucht vor der ersten Tätigkeit eine Bescheinigung nach <ExternerLink href={gii('ifsg/__43.html')}>§ 43 IfSG</ExternerLink>, höchstens 3
            Monate alt; Beschäftigte werden nach Aufnahme der Tätigkeit und alle 2 Jahre belehrt. Welche Tätigkeiten erfasst sind, regelt § 42 IfSG; das ist hier nicht geprüft.
          </p>
        </>
      )
    case 'personal':
      return (
        <>
          <h3>Geringfügigkeitsgrenze</h3>
          <p>
            Mindestlohn × 130 / 3, auf volle Euro aufgerundet (<ExternerLink href={gii('sgb_4/__8.html')}>§ 8 Abs. 1a SGB IV</ExternerLink>). Die Höhe des Mindestlohns prüft diese Version nicht;
            deshalb steht hier nur die Formel.
          </p>
          <h3>Bereiche mit Sofortmeldepflicht</h3>
          <ul className="liste-eng">
            {SOFORTMELDE_BEREICHE.split('; ').map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <p className="klein">
            Quelle: <ExternerLink href={gii('sgb_4/__28a.html')}>§ 28a Abs. 4 SGB IV</ExternerLink>
          </p>
          <h3>Geschäftsführung</h3>
          <p>Ob die Geschäftsführung einer UG oder GmbH sozialversicherungspflichtig ist, klärt eine Statusfeststellung; die App weist im Ergebnis darauf hin.</p>
        </>
      )
    case 'verkauf':
      return (
        <>
          <h3>Impressum</h3>
          <p>
            Geschäftsmäßige digitale Dienste brauchen leicht erkennbare und ständig verfügbare Anbieterangaben (<ExternerLink href={gii('ddg/__5.html')}>§ 5 DDG</ExternerLink>); auch
            geschäftliche Profile in sozialen Netzwerken prüfen.
          </p>
          <h3>Verpackung</h3>
          <p>
            Wer Waren in Verpackungen, auch in Versandkartons, an Privatleute in Deutschland abgibt, registriert sich vor dem ersten Bereitstellen bei der Zentralen Stelle Verpackungsregister und
            beteiligt sich an einem System (VerpackDG, in Kraft seit 12.08.2026). Wer als Hersteller gilt, richtet sich nach der VO (EU) 2025/40; das ist hier nicht geprüft.
          </p>
          <h3>Kasse</h3>
          <p>
            Elektronische Kassen brauchen eine TSE und Belegausgabe; Anschaffung und Außerbetriebnahme werden dem Finanzamt binnen 1 Monat mitgeteilt (
            <ExternerLink href={gii('ao_1977/__146a.html')}>§ 146a AO</ExternerLink>). Bareinnahmen und -ausgaben sind täglich festzuhalten (§ 146 Abs. 1 AO).
          </p>
        </>
      )
    case 'steuern':
      return (
        <>
          <h3>Kleinunternehmer</h3>
          <Kleinunternehmer />
          <h3>Voranmeldungen</h3>
          <p>
            Im Gründungsjahr und im Folgejahr ist der Kalendermonat Voranmeldungszeitraum (<ExternerLink href={gii('ustg_1980/__18.html')}>§ 18 Abs. 2 Satz 4 UStG</ExternerLink>). Für 2026
            gilt nach Satz 6 die voraussichtliche Steuer: über 9.000 € monatlich, sonst vierteljährlich.
          </p>
          <h3>E-Rechnung</h3>
          <p>Rechnungen an inländische Unternehmen werden ab 2027 oder 2028 zur E-Rechnung, je nach Gesamtumsatz 2026 (§ 27 Abs. 38 UStG).</p>
        </>
      )
    case 'ergebnis':
      return (
        <>
          <p>Die Pflichten stehen nach Zeitpunkt geordnet. „Warum?“ zeigt die Regeln und die Antworten, die eine Pflicht ausgelöst haben.</p>
          <p>Status und Notiz je Pflicht werden mit dem Projekt gespeichert. „Trifft nicht zu“ passt, wenn eine Regel vorsichtig zu viel annimmt.</p>
          <p>„Nicht geprüft“ nennt Bereiche, die zum Profil passen, die Version 0.1 aber nicht abdeckt.</p>
        </>
      )
    case 'termine':
      return (
        <>
          <p>Termine für 24 oder 12 Monate ab dem 1. des Startmonats.</p>
          <p>
            Endet eine Frist an einem Samstag, Sonntag oder Feiertag, endet sie am nächsten Werktag (<ExternerLink href={gii('ao_1977/__108.html')}>§ 108 Abs. 3 AO</ExternerLink>). Zahlungen
            stehen vorsichtig am ursprünglichen Tag im Kalender; das spätere Ende steht als „gesetzlich bis“ dabei.
          </p>
          <p>Die Feiertage der Länder stammen aus der Bibliothek feiertagejs und sind nicht gegen die Landesgesetze geprüft.</p>
        </>
      )
    case 'regeln':
      return (
        <>
          <p>Ob eine Pflicht gilt, entscheiden sieben Entscheidungstabellen nach DMN 1.3. Jede zutreffende Regel liefert eine Pflicht oder einen Hinweis (Hit Policy COLLECT).</p>
          <p>Die Fristen rechnet die App danach getrennt. Markiert sind die Regeln, die beim aktuellen Profil zutreffen.</p>
        </>
      )
  }
}

export function Hilfe({ schritt }: { schritt: Schritt }) {
  return (
    <aside className="hilfe" aria-labelledby="hilfe-titel">
      <h2 id="hilfe-titel">Hilfe</h2>
      <Inhalt schritt={schritt} />
    </aside>
  )
}
