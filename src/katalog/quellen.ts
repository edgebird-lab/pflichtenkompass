/**
 * Geöffnete Quellen Q1–Q17 (Spezifikation, Abschnitt 12). Abruf am 11.11.2026,
 * Q1 am 10.11.2026; „stand“ ist die Angabe der Datenbank beim Abruf.
 * Q1–Q15 sind Rechtsquellen des Katalogs, Q16 und Q17 technische Normen.
 */
import type { Quelle, QuelleId } from './typen'

export const QUELLEN: readonly Quelle[] = [
  {
    id: 'Q1',
    titel: 'Abgabenordnung (AO), Volltext',
    url: 'https://www.gesetze-im-internet.de/ao_1977/BJNR006130976.html',
    abgerufen: '2026-11-10',
    stand: 'neugefasst durch Bek. v. 23.1.2025 I Nr. 24; zuletzt geändert durch Art. 6 G v. 22.10.2026 I Nr. 320',
  },
  {
    id: 'Q2',
    titel: 'Umsatzsteuergesetz (UStG), Volltext',
    url: 'https://www.gesetze-im-internet.de/ustg_1980/BJNR119530979.html',
    abgerufen: '2026-11-11',
    stand: 'zuletzt geändert durch Art. 5 G v. 29.6.2026 I Nr. 197',
  },
  {
    id: 'Q3',
    titel: 'Umsatzsteuer-Durchführungsverordnung (UStDV), Volltext',
    url: 'https://www.gesetze-im-internet.de/ustdv_1980/BJNR023590979.html',
    abgerufen: '2026-11-11',
    stand: 'zuletzt geändert durch Art. 7 V v. 19.12.2025 I Nr. 372',
  },
  {
    id: 'Q4',
    titel: 'Einkommensteuergesetz (EStG), Volltext',
    url: 'https://www.gesetze-im-internet.de/estg/BJNR010050934.html',
    abgerufen: '2026-11-11',
    stand: 'zuletzt geändert durch Art. 1 G v. 15.10.2026 I Nr. 307',
  },
  {
    id: 'Q5',
    titel: 'Handelsgesetzbuch (HGB), Volltext',
    url: 'https://www.gesetze-im-internet.de/hgb/BJNR002190897.html',
    abgerufen: '2026-11-11',
    stand: 'zuletzt geändert durch Art. 4 G v. 4.2.2026 I Nr. 33',
  },
  {
    id: 'Q6',
    titel: 'GmbH-Gesetz (GmbHG), Volltext',
    url: 'https://www.gesetze-im-internet.de/gmbhg/BJNR004770892.html',
    abgerufen: '2026-11-11',
    stand: 'zuletzt geändert durch Art. 21 G v. 23.10.2024 I Nr. 323',
  },
  {
    id: 'Q7',
    titel: 'Gewerbeordnung (GewO), Volltext',
    url: 'https://www.gesetze-im-internet.de/gewo/BJNR002450869.html',
    abgerufen: '2026-11-11',
    stand: 'zuletzt geändert durch Art. 1 G v. 20.7.2026 I Nr. 215',
  },
  {
    id: 'Q8',
    titel: 'Handwerksordnung (HwO), Volltext',
    url: 'https://www.gesetze-im-internet.de/hwo/BJNR014110953.html',
    abgerufen: '2026-11-11',
    stand: 'zuletzt geändert durch Art. 8 G v. 20.7.2026 I Nr. 215',
  },
  {
    id: 'Q9',
    titel: 'SGB IV, Volltext',
    url: 'https://www.gesetze-im-internet.de/sgb_4/BJNR138450976.html',
    abgerufen: '2026-11-11',
    stand: 'zuletzt geändert durch Art. 2 G v. 24.7.2026 I Nr. 228',
  },
  {
    id: 'Q10',
    titel: 'SGB VII, § 192',
    url: 'https://www.gesetze-im-internet.de/sgb_7/__192.html',
    abgerufen: '2026-11-11',
    stand: 'Einzelnorm ohne Standzeile',
  },
  {
    id: 'Q11',
    titel: 'Digitale-Dienste-Gesetz (DDG), § 5',
    url: 'https://www.gesetze-im-internet.de/ddg/__5.html',
    abgerufen: '2026-11-11',
    stand: 'Einzelnorm ohne Standzeile',
  },
  {
    id: 'Q12',
    titel: 'Verpackungsrecht-Durchführungsgesetz (VerpackDG), Volltext',
    url: 'https://www.gesetze-im-internet.de/verpackdg/BJNR0CF0B0026.html',
    abgerufen: '2026-11-11',
    stand: 'G v. 13.7.2026 (BGBl. 2026 I Nr. 207), in Kraft seit 12.8.2026',
  },
  {
    id: 'Q13',
    titel: 'Mindestlohngesetz (MiLoG), Volltext',
    url: 'https://www.gesetze-im-internet.de/milog/BJNR134810014.html',
    abgerufen: '2026-11-11',
    stand: 'zuletzt geändert durch Art. 8 Abs. 3 G v. 12.5.2026 I Nr. 137',
  },
  {
    id: 'Q14',
    titel: 'Geldwäschegesetz (GwG), § 20',
    url: 'https://www.gesetze-im-internet.de/gwg_2017/__20.html',
    abgerufen: '2026-11-11',
    stand: 'Einzelnorm ohne Standzeile',
  },
  {
    id: 'Q15',
    titel: 'Infektionsschutzgesetz (IfSG), § 43',
    url: 'https://www.gesetze-im-internet.de/ifsg/__43.html',
    abgerufen: '2026-11-11',
    stand: 'Einzelnorm ohne Standzeile',
  },
  {
    id: 'Q16',
    titel: 'OMG, Decision Model and Notation 1.3 (formal/2021-01-01)',
    url: 'https://www.omg.org/spec/DMN/1.3/PDF',
    abgerufen: '2026-11-11',
    stand: 'Release März 2021; genutzt: 8.2.11, 9.2–9.5',
  },
  {
    id: 'Q17',
    titel: 'RFC 5545, iCalendar',
    url: 'https://www.rfc-editor.org/rfc/rfc5545.txt',
    abgerufen: '2026-11-11',
    stand: 'September 2009',
  },
]

/** Rechtsquellen, auf die sich Pflichten stützen dürfen (KA1). */
export const RECHTSQUELLEN: readonly QuelleId[] = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12', 'Q13', 'Q14', 'Q15']

export function quelle(id: QuelleId): Quelle {
  const q = QUELLEN.find((x) => x.id === id)
  if (!q) throw new Error(`Unbekannte Quelle ${id}`)
  return q
}
