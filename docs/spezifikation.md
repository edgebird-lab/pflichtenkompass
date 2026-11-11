# Pflichten-Kompass – Spezifikation Version 0.1

| | |
| --- | --- |
| Stand | 11.11.2026 |
| Katalog | 2026.11.0 (Rechtsstand der geöffneten Quellen, Abschnitt 12) |
| Projektordner | `C:\Users\Robin\Projekte\Apps\pflichtenkompass` |
| Vorbild | Prozesslotse (`C:\Users\Robin\Projekte\Apps\prozesslotse`) |
| Status | Entwurf, fachlich und technisch geprüft am 11.11.2026 (Prüfvermerk am Ende); Freigabe durch Robin offen (Abschnitt 10.2) |

> **Keine Rechtsberatung.** App und Spezifikation fassen Gesetze knapp zusammen. Sie ersetzen keine Rechts- oder Steuerberatung. Maßgeblich ist der Gesetzestext in der verlinkten Quelle.

Lesehilfe: „Q1“ bis „Q17“ verweisen auf die geöffneten Quellen in Abschnitt 12. Was nicht geprüft werden konnte, steht als offene Frage („O1“ …) in Abschnitt 10.2 und nicht im Katalog.

---

## 1. Ziel und Nutzer

Der Pflichten-Kompass zeigt Gründerinnen und Gründern, welche Anmeldungen, Meldungen und Fristen auf sie zukommen. Ein geführtes Interview mit rund 20 Fragen ergibt eine begründete Pflichtenliste mit Frist, zuständiger Stelle, Rechtsgrundlage, Quelle und Stand. Jede Pflicht nennt die Antworten, die sie ausgelöst haben, und die App sagt offen, welche Bereiche sie nicht geprüft hat. Die Regeln liegen als DMN-1.3-Entscheidungstabellen versioniert im Repo; das ergänzt den Prozesslotsen (BPMN) um Entscheidungsmodellierung (DMN). Nutzer sind Gründer vor und im ersten Jahr, Gründungsberater und Robin selbst; die App läuft lokal, ohne Server und ohne KI.

---

## 2. Umfang

### 2.1 Version 0.1 (MVP)

- **Interview** in fünf Schritten mit 32 Fragen. Je Profil sind wegen Bedingungen rund 20 sichtbar.
- **Abgedeckt:** Einzelunternehmen, GbR (inklusive OHG-Fall), UG (haftungsbeschränkt), GmbH; gewerblich oder freiberuflich; Handel, Onlinehandel, Handwerk, Gastronomie, Dienstleistung.
- **Kernkatalog 2026.11.0:** 40 geprüfte Pflichten (6.6) und 17 Lückenhinweise (6.7). Jede Pflicht hat eine geöffnete Primärquelle.
- **Regeln als DMN 1.3:** eine Datei mit 7 Entscheidungstabellen (Hit Policy COLLECT), eigene kleine FEEL-Auswertung, Prüfung beim Laden und in der CI.
- **Ergebnis:** Pflichten nach Zeitpunkt gruppiert; je Pflicht „Warum?“, Frist, nächster Termin, Stelle, Normen, Quelle, Stand, Status (offen, erledigt, trifft nicht zu) und Notiz.
- **Fristenrechner:** Monats- und Wochenfristen, § 108 Abs. 3 AO mit Feiertagen des Landes, wiederkehrende Termine (USt, Lohnsteuer, Sozialversicherung, ZM, OSS), Jahresfristen; Horizont 24 Monate.
- **Export:** Kalenderdatei (ICS nach RFC 5545) mit Erinnerung, Druckansicht (PDF über den Druckdialog), Projektdatei `.pflichtenkompass`.
- **Regelansicht:** DRD und Tabellen mit dmn-js (nur lesen), die Treffer des Profils markiert.
- **Änderungshinweis** beim Öffnen einer Datei: neue, entfallene und geänderte Pflichten seit dem letzten Speichern.
- Hell- und Dunkelmodus, Tastaturbedienung, axe ohne schwere Befunde, Oberfläche auf Deutsch.
- Hinweis „keine Rechtsberatung“ auf Start, Ergebnis, Druck und in jedem Kalendereintrag.

### 2.2 Ausdrücklich später

- **Katalog 2027.01 (Phase 7):** Gewerbe- und Körperschaftsteuer, Datenschutz, Fernabsatz, Arbeitsschutz, Mindestlohnhöhe, DEÜV-Fristen.
- **Windows-Programm mit Tauri 2** (Phase 6, nach dem MVP).
- Was-wäre-wenn-Vergleich zweier Profile; voller Änderungsdienst mit verteilten, signierten Katalogen.
- Regeleditor in der App (dmn-js Modeler) und Import fremder DMN-Dateien.
- Erinnerungen per E-Mail oder ntfy (braucht Server); Nachweise als Dateianhänge.
- Weitere Rechtsformen (KG, GmbH & Co. KG, Verein), abweichendes Wirtschaftsjahr, mehrere Betriebsstätten, Reisegewerbe, erlaubnispflichtige Gewerbe, Kammerberufe.
- Bestandsunternehmen mit Start vor dem 01.01.2026 (O15), englische Oberfläche, Microsoft Store.

### 2.3 Abweichungen von der Ausgangsidee

Die Idee stammt aus der Ideensammlung (Rang 8). Prüfergebnis:

| Ausgangsidee | Entscheidung | Grund |
| --- | --- | --- |
| „Verpackungsregister LUCID“ nach VerpackG | VerpackDG mit „Zentraler Stelle Verpackungsregister“ | Das VerpackDG gilt seit 12.08.2026; § 68 VerpackDG regelt den Übergang vom alten Verpackungsgesetz (Q12). |
| Auswertung mit feelin | eigene FEEL-Teilmenge; feelin nur als Test-Orakel | weniger fremder Code im Programm, nur geprüfte Konstrukte; Differenztests sichern gleiches Rechnen. |
| Editor dmn-js | in 0.1 nur Viewer | Regeln werden im Repo gepflegt und in der CI geprüft. |
| PWA | Web-App wie Prozesslotse, später Tauri | gleicher Weg wie beim Prozesslotsen; offline läuft das Windows-Programm. |
| Erinnerungen per ntfy oder E-Mail vom VPS | Erinnerungen im Kalender (VALARM) | kein Server, keine Daten außer Haus. |
| Status und Nachweis je Pflicht | Status und Notiz | Dateianhänge brauchen Speicher- und Datenschutzkonzept. |
| Änderungsdienst | 0.1: Katalogvergleich beim Öffnen | voller Dienst braucht Verteilung und Signatur von Katalogen. |

---

## 3. Fachliche Grundlagen

### 3.1 Rechtsgrundlagen des Kernkatalogs

Alle Normen wurden im Text der amtlichen Datenbank gesetze-im-internet.de gelesen (Abruf 10./11.11.2026).

| Bereich | Normen | Kernaussage für die App | Quelle |
| --- | --- | --- | --- |
| Fristen | § 108 Abs. 1, 3 AO | §§ 187–193 BGB gelten entsprechend; endet eine Frist an Sa, So oder Feiertag, endet sie am nächsten Werktag. | Q1 |
| Anzeige beim Finanzamt | §§ 137, 138 Abs. 1, 1b, 4 AO | Gewerbe über die Gemeinde, freie Berufe direkt; Fragebogen elektronisch; binnen 1 Monat. Körperschaften zeigen die Gründung binnen 1 Monat an. | Q1 |
| Steuererklärungen | § 149 Abs. 2–4, §§ 180, 181 AO; § 25 Abs. 3–4 EStG; § 18 Abs. 3 UStG | Abgabe 7 Monate nach Jahresende; mit Beratung bis Ende Februar des übernächsten Jahres; dann kann das Finanzamt bei Betriebseröffnung eine frühere Abgabe anordnen. | Q1, Q2, Q4 |
| Buchführung, Kasse, Aufbewahrung | §§ 141, 146, 146a, 147 AO; § 93c Abs. 1 AO | Grenzen 800.000 € und 80.000 €; Einzelaufzeichnung; TSE, Beleg, Mitteilung binnen 1 Monat; 10, 8 oder 6 Jahre. | Q1 |
| Umsatzsteuer | §§ 3c, 14, 14a, 14b, 16 Abs. 1d, 18, 18a, 18j, 19, 27 Abs. 38 UStG | Voranmeldung (9.000 €, 2.000 €, Neugründer), Kleinunternehmer (25.000 €, 100.000 €), Rechnungsfristen (6 Monate; EU-Fälle 15. des Folgemonats), E-Rechnung, ZM, OSS. | Q2 |
| Umsatzsteuer-Durchführung | §§ 33, 34a, 46–48 UStDV | Kleinbetrag bis 250 €; Kleinunternehmer ohne E-Rechnungspflicht; Dauerfristverlängerung; Sondervorauszahlung 1/11. | Q3 |
| Einkommen- und Lohnsteuer | §§ 4 Abs. 3, 5b, 18, 25, 37, 40a, 41, 41a, 41b EStG | freie Berufe, EÜR, E-Bilanz, Vorauszahlungstermine, Pauschsteuer 2 %, Lohnsteuer-Anmeldung (1.080 €, 5.000 €). | Q4 |
| Handelsrecht | §§ 1, 2, 6, 12, 29, 37a, 105, 106, 125, 238, 241a, 242, 243, 257, 264, 267, 267a, 325, 326 HGB | Kaufmann, Handelsregister, Buchführung, Jahresabschluss, Offenlegung, Größenklassen. | Q5 |
| GmbH und UG | §§ 2, 5a, 7, 11, 13, 35a, 40, 41 GmbHG | Notarform, Volleinzahlung bei der UG, Rücklage 1/4, Geschäftsbriefe. | Q6 |
| Gewerbe und Handwerk | §§ 6, 14, 15 GewO; §§ 1, 16, 18 HwO | Gewerbeanzeige gleichzeitig mit Beginn; Handwerksrolle vor Beginn; Anzeige bei zulassungsfreiem Handwerk unverzüglich. | Q7, Q8 |
| Sozialversicherung | §§ 8, 18i, 23, 28a, 28f, 28i SGB IV | Geringfügigkeitsgrenze (Formel), Betriebsnummer, Meldungen, Sofortmeldung (11 Bereiche), Fälligkeit, Beitragsnachweis, Entgeltunterlagen. | Q9 |
| Unfallversicherung | § 192 Abs. 1 SGB VII | Mitteilung binnen 1 Woche; gilt als erfüllt mit rechtzeitiger Gewerbeanzeige. | Q10 |
| Online | § 5 Abs. 1 DDG | Anbieterangaben, leicht erkennbar und ständig verfügbar. | Q11 |
| Verpackung | §§ 3, 6, 7, 9, 10, 68 VerpackDG | Registrierung und Systembeteiligung vor dem Bereitstellen; Datenmeldung; Übergang. | Q12 |
| Mindestlohn | §§ 1, 17 MiLoG | Höhe per Verordnung; Arbeitszeit von Minijobbern binnen 7 Tagen aufzeichnen, 2 Jahre aufbewahren. | Q13 |
| Transparenzregister | § 20 Abs. 1 GwG | Juristische Personen und eingetragene Personengesellschaften melden unverzüglich. | Q14 |
| Infektionsschutz | § 43 IfSG | Bescheinigung höchstens 3 Monate alt; Belehrung alle 2 Jahre, dokumentiert. | Q15 |

### 3.2 Prüfergebnisse: Änderungen und Stolperstellen

1. **Verpackung:** Das VerpackDG gilt seit 12.08.2026 (Q12). Registrierungen nach altem Recht gelten fort, Änderungen bis 12.11.2026 (§ 68 Abs. 2). Alte Systembeteiligungen gelten längstens bis 31.12.2026 (§ 68 Abs. 1). Für 2026 gilt bei der Vollständigkeitserklärung nur § 10 VerpackDG (§ 68 Abs. 5). Datenmeldung unverzüglich nach der Meldung ans System; wer im Vorjahr unter 10 t bereitgestellt hat, meldet jährlich bis 1. Juni (§ 9 Abs. 1–2).
2. **USt-Voranmeldung für Neugründer:** Im Gründungs- und Folgejahr ist der Kalendermonat Zeitraum (§ 18 Abs. 2 Satz 4 UStG). Die Ausnahme in Satz 6 gilt nur für die Besteuerungszeiträume 2021 bis 2026 (Q2). Ab 2027 gilt nach dem Wortlaut wieder die Monatspflicht (O4).
3. **Voranmeldungsgrenzen:** monatlich über 9.000 € Vorjahressteuer; Befreiung möglich bis 2.000 € (§ 18 Abs. 2 UStG).
4. **Kleinunternehmer:** Vorjahr höchstens 25.000 €, laufendes Jahr höchstens 100.000 €; keine Voranmeldung und Jahreserklärung, außer auf Aufforderung nach § 149 Abs. 1 Satz 2 AO (§ 19 Abs. 1 UStG). Der Wortlaut nennt keine eigene Grenze fürs Gründungsjahr und keine Folge des Überschreitens im laufenden Jahr (O3).
5. **E-Rechnung:** Für Umsätze ab 2025 ist der Empfang ohne Zustimmung Pflicht. Papier oder andere Formate sind bis 31.12.2026 erlaubt, bei Vorjahresumsatz bis 800.000 € bis 31.12.2027; EDI bis 31.12.2027 (§ 27 Abs. 38 UStG). Kleinunternehmer und Kleinbeträge bis 250 € dürfen immer „sonstige Rechnungen“ schicken (§§ 33, 34a UStDV).
6. **Aufbewahrung:** Buchungsbelege und Rechnungen 8 Jahre, übereinstimmend in § 147 Abs. 3 AO, § 257 Abs. 4 HGB und § 14b Abs. 1 UStG.
7. **Kasse:** Mitteilung ans Finanzamt binnen 1 Monat nach Anschaffung oder Außerbetriebnahme (§ 146a Abs. 4 AO).
8. **Berufsgenossenschaft:** Eine Gewerbeanzeige binnen 1 Woche gilt als Mitteilung (§ 192 Abs. 1 Satz 2 SGB VII). Freiberufler melden selbst.
9. **Sofortmeldung:** Die Liste in § 28a Abs. 4 SGB IV umfasst 11 Bereiche, darunter Friseur und Kosmetik sowie plattformbasierte Lieferdienste.
10. **Impressum:** Rechtsgrundlage ist § 5 DDG (Q11).
11. **Rechnungen ins EU-Ausland:** Bei Leistungen nach § 3a Abs. 2 UStG an Unternehmen in anderen EU-Staaten und bei innergemeinschaftlichen Lieferungen ist die Rechnung bis zum 15. Tag des Folgemonats auszustellen (§ 14a Abs. 1, 3 UStG). Die 6 Monate gelten dort nicht.
12. **Rechnungen an Privatleute:** Steuerpflichtige Werklieferungen und sonstige Leistungen im Zusammenhang mit einem Grundstück sind auch Privatleuten binnen 6 Monaten in Rechnung zu stellen (§ 14 Abs. 2 Satz 2 Nr. 3 UStG). Die Rechnung weist auf die Aufbewahrungspflicht des Empfängers hin (§ 14 Abs. 4 Satz 1 Nr. 9 UStG).

### 3.3 Formate und technische Normen

| Thema | Festlegung | Quelle |
| --- | --- | --- |
| DMN | Version 1.3, OMG-Dokument formal/2021-01-01, März 2021. XML-Namensraum `https://www.omg.org/spec/DMN/20191111/MODEL/`, DMNDI `https://www.omg.org/spec/DMN/20191111/DMNDI/`, DC und DI aus `…/20180521/`. | Q16; Namensräume aus dmn-moddle 12.2.1 |
| Hit Policy COLLECT | „returns all hits in arbitrary order“; ohne Operator ist das Ergebnis die Liste aller Ausgaben (Abschnitt 8.2.11). Zusammengesetzte Ausgaben nur ohne Operator. | Q16 |
| S-FEEL | Grammatikregeln 5–15 (Abschnitt 9.2): Vergleich `<`, `<=`, `>`, `>=`, Intervall, Liste mit Komma, `not(…)`, `-`. Strings und Booleans nur auf Gleichheit (9.4). | Q16 |
| iCalendar | RFC 5545 (September 2009): CRLF; Zeilen höchstens 75 Oktette, Faltung mit CRLF plus Leerzeichen; Escape `\\ \; \, \n`; PRODID und VERSION Pflicht; UID und DTSTAMP Pflicht; VALARM DISPLAY braucht ACTION, DESCRIPTION, TRIGGER; DATE-Start ohne Ende dauert einen Tag; UTF-8. | Q17 |
| Normlinks | `https://www.gesetze-im-internet.de/<kürzel>/__<nr>.html`, z. B. `ao_1977/__146a.html`. Kürzel: `ao_1977`, `ustg_1980`, `ustdv_1980`, `estg`, `hgb`, `gmbhg`, `gewo`, `hwo`, `sgb_4`, `sgb_7`, `ddg`, `verpackdg`, `milog`, `gwg_2017`, `ifsg`. | Q1–Q15 |

Die Normlinks führen auf Einzelnormen derselben Datenbank. Geprüft wurde der Text im jeweiligen Volltext (Q1–Q9, Q12, Q13) oder in der Einzelnorm (Q10, Q11, Q14, Q15).

### 3.4 Berechnungen (Überblick)

| Berechnung | Regel | Norm | Details |
| --- | --- | --- | --- |
| Fristende | Monatsfrist: gleicher Tag im Zielmonat, sonst Monatsletzter; Verschiebung nach § 108 Abs. 3 AO | § 108 AO | 6.8.2 |
| Feiertage | je Land über feiertagejs; „sicher“ für Verschiebungen, „möglich“ für Rückwärtszählung | Landesrecht nicht geprüft (O8) | 6.8.1 |
| USt-Voranmeldungszeitraum | Monat, Quartal oder keiner | § 18 Abs. 2 UStG, § 19 UStG | 6.8.4 |
| Sondervorauszahlung | nur der Termin; den Betrag (1/11 der Vorauszahlungen) nennt die Pflichtkarte als Regel, die App rechnet ihn nicht | §§ 47, 48 UStDV | 6.8.4 |
| Lohnsteuer-Anmeldungszeitraum | Monat (über 5.000 €), Quartal (über 1.080 €), Jahr | § 41a Abs. 2 EStG | 6.8.5 |
| SV-Fälligkeit | drittletzter Bankarbeitstag; Nachweis 2 Arbeitstage vorher; Termin 1 Arbeitstag vor dem Nachweistag | §§ 23, 28f SGB IV | 6.8.6 |
| E-Rechnungspflicht ab | 2027 oder 2028 nach Gesamtumsatz 2026 | § 27 Abs. 38 UStG | 6.8.9 |
| Aufbewahrung bis | 31.12. des Jahres + 10, 8 oder 6 | § 147 Abs. 3, 4 AO | 6.8.10 |
| Geringfügigkeitsgrenze | Mindestlohn × 130 / 3, auf volle Euro aufgerundet | § 8 Abs. 1a SGB IV | 6.8.11 |
| Kleinunternehmerprüfung | möglich, prüfen oder nicht möglich | § 19 Abs. 1 UStG | 6.8.12 |

---

## 4. Datenmodell (TypeScript)

Quelltext: `src/modell/typen.ts`, `src/katalog/typen.ts`, `src/regeln/typen.ts`. Bezeichner auf Deutsch wie im Prozesslotsen.

### 4.1 Profil (Antworten)

```ts
export const FORMAT_VERSION = 1 as const

/** Kalenderdatum ohne Uhrzeit, ISO 8601 („2027-01-15“). Rechnen nur über src/fristen/datum.ts. */
export type Datum = string
/** Euro-Betrag; Eingaben mit höchstens zwei Nachkommastellen. */
export type Euro = number

export type Bundesland =
  | 'BW' | 'BY' | 'BE' | 'BB' | 'HB' | 'HH' | 'HE' | 'MV'
  | 'NI' | 'NW' | 'RP' | 'SL' | 'SN' | 'ST' | 'SH' | 'TH'
export type Rechtsform = 'einzelunternehmen' | 'gbr' | 'ug' | 'gmbh'
export type Taetigkeit = 'gewerblich' | 'freiberuflich'
export type JaNeinUnklar = 'ja' | 'nein' | 'unklar'
export type Branche = 'handel' | 'onlinehandel' | 'handwerk' | 'gastronomie' | 'dienstleistung'
export type Handwerk = 'keins' | 'zulassungspflichtig' | 'zulassungsfrei' | 'handwerksaehnlich' | 'unklar'
export type Kasse = 'keine' | 'offeneLadenkasse' | 'elektronisch'

export interface Personal {
  vorhanden: boolean               // F12
  beginn: Datum | null             // F13
  svPflichtig: number              // F14, ganze Zahl ≥ 0
  minijobber: number               // F15, ganze Zahl ≥ 0
  minijobPauschsteuer: boolean     // F16
  sofortmeldeBranche: boolean      // F17
  lohnsteuerJeMonat: Euro | null   // F18
}

export interface Kunden {          // F19
  privatInland: boolean
  unternehmenInland: boolean
  privatEu: boolean
  unternehmenEu: boolean
}

export interface Steuerangaben {
  umsatzErstesJahr: Euro           // F25
  gewinnErstesJahr: Euro           // F26
  kleinunternehmer: boolean        // F27
  umsatz2026: Euro | null          // F28
  ustErstesJahr: Euro | null       // F29
  euFernverkaeufe: Euro            // F30
  dauerfristverlaengerung: boolean // F31
  vorauszahlungen: boolean         // F32
}

/** Antworten des Interviews. Ausgeblendete Fragen behalten ihren Standardwert und wirken nicht. */
export interface Profil {
  name: string                     // F01
  start: Datum                     // F02
  bundesland: Bundesland | null    // F03, null bis zur Antwort
  rechtsform: Rechtsform           // F04
  gbrEingetragen: boolean          // F05
  taetigkeit: Taetigkeit           // F06
  kaufmaennisch: JaNeinUnklar      // F07
  steuerberater: boolean           // F08
  branchen: Branche[]              // F09, mindestens eine
  handwerk: Handwerk               // F10
  lebensmittel: boolean            // F11
  personal: Personal               // F12–F18
  kunden: Kunden                   // F19
  website: boolean                 // F20
  verpackungen: boolean            // F21
  kasse: Kasse                     // F22
  kasseAnschaffung: Datum | null   // F23
  bargeld: boolean                 // F24
  steuern: Steuerangaben           // F25–F32
}
```

### 4.2 Interview

```ts
export type Schritt =
  | 'start' | 'vorhaben' | 'taetigkeit' | 'personal' | 'verkauf' | 'steuern'
  | 'ergebnis' | 'termine' | 'regeln'

export type FrageId =
  | 'F01' | 'F02' | 'F03' | 'F04' | 'F05' | 'F06' | 'F07' | 'F08'
  | 'F09' | 'F10' | 'F11' | 'F12' | 'F13' | 'F14' | 'F15' | 'F16'
  | 'F17' | 'F18' | 'F19' | 'F20' | 'F21' | 'F22' | 'F23' | 'F24'
  | 'F25' | 'F26' | 'F27' | 'F28' | 'F29' | 'F30' | 'F31' | 'F32'

export type FrageTyp = 'text' | 'datum' | 'auswahl' | 'mehrfach' | 'janein' | 'zahl' | 'betrag'

export interface Frage {
  id: FrageId
  schritt: Schritt
  text: string
  hilfe: string
  normen: readonly NormVerweis[]
  typ: FrageTyp
  optionen?: readonly { wert: string; text: string }[]
  pflicht: boolean
  /** Sichtbarkeit; reine Funktion des Profils, getestet. */
  sichtbar: (p: Profil) => boolean
}
```

### 4.3 Merkmale (Eingaben der DMN-Tabellen)

```ts
/** Aus dem Profil abgeleitet (src/modell/merkmale.ts). Nie null: Ableitung setzt Standardwerte. */
export interface Merkmale {
  rechtsform: Rechtsform
  taetigkeit: Taetigkeit
  kaufmaennisch: JaNeinUnklar
  kaufmann: boolean
  personengesellschaftEingetragen: boolean
  handwerk: Handwerk
  handel: boolean
  onlinehandel: boolean
  gastronomie: boolean
  lebensmittel: boolean
  beschaeftigte: number
  minijobber: number
  lohnsteuerabzug: boolean
  sofortmeldeBranche: boolean
  kundenPrivat: boolean
  kundenUnternehmen: boolean
  kundenPrivatEu: boolean
  kundenUnternehmenEu: boolean
  website: boolean
  verpackungen: boolean
  kasse: Kasse
  bargeld: boolean
  kleinunternehmer: boolean
  hgbBefreit: boolean
  ao141Grenze: boolean
  umsatzErstesJahr: Euro
}
export type MerkmalName = keyof Merkmale
export type MerkmalTyp = 'string' | 'number' | 'boolean'

export interface MerkmalInfo {
  name: MerkmalName
  typ: MerkmalTyp
  label: string
  /** Fragen, aus denen das Merkmal entsteht; für „Warum?“. */
  fragen: readonly FrageId[]
  /** Erlaubte Werte bei Typ string; müssen den inputValues der DMN-Datei entsprechen. */
  erlaubt?: readonly string[]
}
```

### 4.4 Katalog

```ts
export type PflichtId =
  | 'gewerbeanzeige' | 'steuerlicheErfassung' | 'handelsregister' | 'handelsregisterGmbh'
  | 'transparenzregister' | 'handwerksrolle' | 'handwerkAnzeige' | 'berufsgenossenschaft'
  | 'betriebsnummer' | 'svAnmeldung' | 'sofortmeldung' | 'beitragsnachweis'
  | 'lohnunterlagen' | 'lohnsteuer' | 'arbeitszeitMinijob' | 'infektionsschutz'
  | 'ustVoranmeldung' | 'ustJahreserklaerung' | 'kleinunternehmerGrenzen' | 'rechnungen'
  | 'eRechnungEmpfang' | 'eRechnungAusstellen' | 'zusammenfassendeMeldung' | 'euFernverkauf'
  | 'einkommensteuererklaerung' | 'feststellungserklaerung' | 'eBilanz' | 'estVorauszahlungen'
  | 'aufbewahrung' | 'buchfuehrungHgb' | 'buchfuehrungAo141' | 'kassenfuehrung'
  | 'elektronischeKasse' | 'jahresabschluss' | 'offenlegung' | 'ugRuecklage'
  | 'geschaeftsbriefe' | 'impressum' | 'verpackung' | 'verpackungDatenmeldung'

export type LueckeId =
  | 'gewerbesteuer' | 'koerperschaftsteuer' | 'gastronomieLandesrecht' | 'lebensmittelrecht'
  | 'fernabsatz' | 'datenschutz' | 'arbeitsrecht' | 'gewerberechtSonstiges'
  | 'kuenstlersozialabgabe' | 'rundfunkbeitrag' | 'elektroBatterien' | 'euKleinunternehmer'
  | 'freiberuflicheKapitalgesellschaft' | 'kaufmannUnklar' | 'handwerkUnklar'
  | 'kleinunternehmerGruendungsjahr' | 'geschaeftsfuehrung'

export type Gruppe = 'gruendung' | 'personal' | 'steuern' | 'buchfuehrung' | 'online'
export type Zeitpunkt = 'vorStart' | 'ersteWochen' | 'laufend' | 'jaehrlich'
export type Gesetz =
  | 'AO' | 'UStG' | 'UStDV' | 'EStG' | 'HGB' | 'GmbHG' | 'GewO' | 'HwO'
  | 'SGB IV' | 'SGB VII' | 'DDG' | 'VerpackDG' | 'MiLoG' | 'GwG' | 'IfSG'

/** Beispiel: { gesetz: 'AO', paragraf: '138', detail: 'Abs. 1b, 4' } → Link …/ao_1977/__138.html */
export interface NormVerweis { gesetz: Gesetz; paragraf: string; detail?: string }

export type QuelleId =
  | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q6' | 'Q7' | 'Q8' | 'Q9'
  | 'Q10' | 'Q11' | 'Q12' | 'Q13' | 'Q14' | 'Q15' | 'Q16' | 'Q17'
export interface Quelle { id: QuelleId; titel: string; url: string; abgerufen: Datum; stand: string }

export type Ereignis = 'start' | 'beschaeftigung' | 'kassenanschaffung'
export type Berechnung =
  | 'ustVoranmeldung' | 'sondervorauszahlung' | 'lohnsteuer' | 'lohnsteuerbescheinigung'
  | 'svBeitrag' | 'zusammenfassendeMeldung' | 'oss' | 'steuererklaerung' | 'estVorauszahlungen'
  | 'jahresabschluss' | 'offenlegung' | 'eRechnungAb' | 'ifsgBescheinigung' | 'ifsgBelehrung'
  | 'verpackungUebergang' | 'verpackungDatenmeldung'

export type FristRegel =
  | { art: 'bisEreignis'; ereignis: Ereignis }
  | { art: 'unverzueglich'; ereignis: Ereignis }
  | { art: 'nachEreignis'; ereignis: Ereignis; monate: number; tage: number; ao108: boolean }
  | { art: 'berechnet'; berechnung: Berechnung }
  | { art: 'laufend' }
  | { art: 'ohneFesteFrist' }

export interface Pflicht {
  id: PflichtId
  nr: number                       // Reihenfolge im Katalog (1–40)
  titel: string                    // Handlung, höchstens 60 Zeichen
  kurz: string                     // 1–2 Sätze
  gruppe: Gruppe
  zeitpunkt: Zeitpunkt
  stelle: string
  weg: string | null               // z. B. „elektronisch (ELSTER)“
  fristen: readonly FristRegel[]
  fristText: string
  normen: readonly NormVerweis[]
  quellen: readonly QuelleId[]     // mindestens eine aus Q1–Q15
  stand: Datum                     // Datum der letzten fachlichen Prüfung
  gueltigAb: Datum | null
  gueltigBis: Datum | null
  hinweise: readonly string[]
}

export interface Luecke {
  id: LueckeId
  nr: number
  art: 'nichtGeprueft' | 'pruefen'
  titel: string
  text: string
}

export const KATALOG_VERSION = '2026.11.0'
export const KATALOG_STAND: Datum = '2026-11-11'
```

### 4.5 Regelwerk und FEEL

```ts
export type Literal = string | number | boolean

export type EinfacherTest =
  | { art: 'gleich'; wert: Literal }
  | { art: 'vergleich'; op: '<' | '<=' | '>' | '>='; wert: number }
  | { art: 'intervall'; von: number; bis: number; vonOffen: boolean; bisOffen: boolean }

export type UnaerTest =
  | { art: 'beliebig' }                                        // „-“
  | { art: 'liste'; negiert: boolean; tests: EinfacherTest[] } // „a, b“ oder „not(a, b)“

export interface Eingabe {
  id: string
  label: string
  merkmal: MerkmalName
  typ: MerkmalTyp
  erlaubt: readonly Literal[] | null
}

export interface Regel {
  id: string                       // DMN-rule-id, z. B. „GR03“
  eintraege: readonly { text: string; test: UnaerTest }[]
  ausgabe: string                  // PflichtId oder LueckeId
  begruendung: string              // Regelannotation „Begründung“
}

export interface Tabelle {
  id: string                       // DMN-decision-id
  name: string
  ausgabe: 'pflicht' | 'luecke'
  eingaben: readonly Eingabe[]
  regeln: readonly Regel[]
}

export interface Regelwerk { tabellen: readonly Tabelle[]; sha256: string }
export interface Regelfehler { regel: 'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6' | 'V7' | 'V8' | 'V9' | 'V10' | 'V11' | 'V12'; ort: string; meldung: string }
```

### 4.6 Ergebnis und Termine

```ts
export type TerminArt = 'handlung' | 'abgabe' | 'zahlung' | 'abgabeUndZahlung'

export interface Termin {
  pflichtId: PflichtId
  titel: string                    // z. B. „Umsatzsteuer-Voranmeldung Januar 2027“
  /** Konservatives Datum für Liste und Kalender; nie später als das gesetzliche Fristende. */
  faelligAm: Datum
  /** Späteres gesetzliches Fristende, falls abweichend (§ 108 Abs. 3 AO oder Nachweistag der SV, 6.8.6); sonst null. */
  gesetzlichBis: Datum | null
  zeitraum: string | null          // „Januar 2027“, „1. Quartal 2027“, „2027“
  art: TerminArt
  hinweis: string | null
}

export interface Bedingung {
  merkmal: MerkmalName
  label: string
  eintrag: string                  // FEEL-Text, z. B. „> 0“
  wert: Literal
  fragen: readonly FrageId[]
}

export interface Treffer { tabelle: string; regel: string; begruendung: string; bedingungen: readonly Bedingung[] }
export interface PflichtErgebnis { pflicht: Pflicht; treffer: readonly Treffer[]; termine: readonly Termin[]; neu: boolean }
export interface LueckenErgebnis { luecke: Luecke; treffer: readonly Treffer[] }

export interface Ergebnis {
  katalogVersion: string
  stand: Datum
  berechnetAm: Datum
  horizont: { von: Datum; bis: Datum }
  pflichten: readonly PflichtErgebnis[]
  luecken: readonly LueckenErgebnis[]
  warnungen: readonly string[]
}
```

### 4.7 Projektdatei und Einstellungen

```ts
export type Bearbeitung = 'offen' | 'erledigt' | 'trifftNichtZu'
export interface PflichtStatus { bearbeitung: Bearbeitung; notiz: string; geaendertAm: Datum }

export interface Projekt {
  formatVersion: typeof FORMAT_VERSION
  app: 'pflichtenkompass'
  profil: Profil
  status: Partial<Record<PflichtId, PflichtStatus>>
  /** Stand beim letzten Speichern; Grundlage des Änderungshinweises. */
  gespeichert: { katalogVersion: string; am: Datum; pflichten: readonly { id: PflichtId; stand: Datum }[] } | null
}

export interface Einstellungen {
  thema: 'system' | 'hell' | 'dunkel'
  horizontMonate: 12 | 24          // Standard 24
  erinnerungTage: 0 | 1 | 3 | 7 | 14 // Standard 7; 0 = keine Erinnerung
  vergangeneExportieren: boolean   // Standard false
}

export interface Beispiel { id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'; titel: string; profil: Profil }
```

---

## 5. Oberfläche und Ablauf

### 5.1 Schritte

Aufbau wie beim Prozesslotsen: Schrittleiste oben, Inhalt in der Mitte, Hilfe rechts. Nach jeder Antwort rechnet die App neu; die Schrittleiste zeigt „bisher n Pflichten“.

| Nr. | Schritt | Fragt | Zeigt |
| --- | --- | --- | --- |
| 0 | Start | – | Zweck in 3 Sätzen, Hinweis „keine Rechtsberatung“, Rechtsstand und Katalogversion; „Neu beginnen“, „Beispiel laden“ (A–F, 9.3), „Datei öffnen“, „Lokale Daten löschen“ (8) |
| 1 | Vorhaben | F01–F08 | Kurzinfo zu Rechtsformen und zu „gewerblich oder freiberuflich“ |
| 2 | Tätigkeit | F09–F11 | Hinweise zu Handwerksanlagen und Lebensmitteln |
| 3 | Personal | F12–F18 | Formel der Geringfügigkeitsgrenze, Liste der Sofortmelde-Bereiche |
| 4 | Verkauf | F19–F24 | Hinweise zu Impressum, Verpackung, Kasse |
| 5 | Umsatz und Steuern | F25–F32 | Warnungen zur Kleinunternehmerregelung (6.9) |
| 6 | Ergebnis | – | Pflichtenliste mit „Warum?“, Status, Lücken (5.3) |
| 7 | Termine | – | Terminliste, Kalenderexport (5.4) |
| 8 | Regeln | – | DMN-Ansicht, Treffer, Quellen (5.5) |

### 5.2 Fragen

Fragen sind unpersönlich formuliert wie im Prozesslotsen. „Sichtbar“ nennt die Bedingung; ausgeblendete Antworten wirken nicht.

| ID | Frage | Typ, Optionen | Sichtbar | Standard | Hilfe, Norm |
| --- | --- | --- | --- | --- | --- |
| F01 | Wie heißt das Vorhaben? | Text, höchstens 80 Zeichen, optional | immer | leer | erscheint in Kalender und Druck |
| F02 | Wann beginnt die Tätigkeit? | Datum, 01.01.2026–31.12.2030 | immer | 1. des Folgemonats | Bezugspunkt aller Fristen |
| F03 | In welchem Bundesland liegt der Betrieb? | Auswahl, 16 Länder | immer | keine Vorauswahl | Feiertage für Fristen (§ 108 Abs. 3 AO) |
| F04 | Welche Rechtsform hat das Unternehmen? | Einzelunternehmen · GbR · UG (haftungsbeschränkt) · GmbH | immer | Einzelunternehmen | Kurzinfo je Form |
| F05 | Ist die GbR im Gesellschaftsregister eingetragen? | ja/nein | F04 = GbR | nein | Transparenzregister, § 20 GwG |
| F06 | Ist die Tätigkeit gewerblich oder freiberuflich? | gewerblich · freiberuflich | immer | gewerblich | Katalog freier Berufe, § 18 Abs. 1 Nr. 1 EStG; im Zweifel gewerblich |
| F07 | Braucht der Betrieb nach Art und Umfang eine kaufmännische Einrichtung? | ja · nein · unklar | F04 ∈ {Einzel, GbR} und F06 = gewerblich | nein | § 1 Abs. 2 HGB; das Gesetz nennt keine festen Grenzen |
| F08 | Ist eine Steuerberatung beauftragt? | ja/nein | immer | nein | längere Erklärungsfristen, § 149 Abs. 3 AO |
| F09 | In welchen Bereichen ist der Betrieb tätig? | mehrfach: Handel vor Ort oder Großhandel · Onlinehandel · Handwerk · Gastronomie · Dienstleistung | immer | keine; mindestens eine | – |
| F10 | Welche Art von Handwerk? | zulassungspflichtig (Anlage A) · zulassungsfrei (Anlage B1) · handwerksähnlich (Anlage B2) · unklar | F09 enthält Handwerk | unklar | §§ 1, 18 HwO |
| F11 | Werden Lebensmittel hergestellt, behandelt oder ausgegeben, z. B. in Küche oder an der Theke? | ja/nein | immer | ja bei Gastronomie, sonst nein | §§ 42, 43 IfSG |
| F12 | Gibt es Beschäftigte, auch Aushilfen oder Minijobs? | ja/nein | immer | nein | – |
| F13 | Ab wann? | Datum | F12 = ja | = F02 | Bezugspunkt der Meldungen |
| F14 | Wie viele sozialversicherungspflichtig Beschäftigte? | Zahl ≥ 0 | F12 = ja | 0 | – |
| F15 | Wie viele Minijobs mit geringfügigem Entgelt? | Zahl ≥ 0 | F12 = ja | 0 | § 8 Abs. 1 Nr. 1, Abs. 1a SGB IV (Formel) |
| F16 | Wird für die Minijobs die einheitliche Pauschsteuer von 2 % gezahlt? | ja/nein | F12 = ja und F15 > 0 | ja | § 40a Abs. 2, 6 EStG |
| F17 | Gehört der Betrieb zu einem Bereich mit Sofortmeldepflicht? | ja/nein mit Liste der 11 Bereiche | F12 = ja | ja bei Gastronomie, sonst nein | § 28a Abs. 4 SGB IV |
| F18 | Wie hoch ist die Lohnsteuer im ersten vollen Monat voraussichtlich? | Betrag ≥ 0, optional | Merkmal `lohnsteuerabzug` | leer (dann monatlich) | § 41a Abs. 2 Satz 4 EStG |
| F19 | Wer sind die Kunden? | mehrfach: Privatleute in Deutschland · Unternehmen in Deutschland · Privatleute in anderen EU-Staaten · Unternehmen in anderen EU-Staaten | immer | Privatleute in Deutschland | – |
| F20 | Gibt es eine geschäftliche Website, einen Onlineshop, eine App oder ein geschäftliches Social-Media-Profil? | ja/nein | immer | nein | § 5 DDG; Impressum auch für geschäftliche Profile prüfen |
| F21 | Werden Waren in Verpackungen, auch in Versandkartons, an Privatleute in Deutschland abgegeben? | ja/nein | immer | ja bei Onlinehandel mit Privatkunden, sonst nein | §§ 3 Abs. 6, 6, 7 VerpackDG; Herstellerbegriff offen (O6) |
| F22 | Welche Kasse wird genutzt? | keine · offene Ladenkasse · elektronische Kasse oder Kassen-App | immer | keine | § 146a AO |
| F23 | Wann wurde die elektronische Kasse angeschafft? | Datum | F22 = elektronisch | = F02 | Mitteilung binnen 1 Monat |
| F24 | Wird Bargeld angenommen? | ja/nein | immer | ja, wenn F22 ≠ keine | § 146 Abs. 1 AO |
| F25 | Wie hoch ist der Umsatz im ersten Kalenderjahr voraussichtlich (netto)? | Betrag ≥ 0 | immer | 0 | Grenzen § 19 UStG, § 141 AO, § 241a HGB |
| F26 | Wie hoch ist der Gewinn im ersten Kalenderjahr voraussichtlich? | Betrag (auch negativ) | immer | 0 | Grenzen § 141 AO, § 241a HGB |
| F27 | Soll die Kleinunternehmerregelung genutzt werden? | ja/nein | immer | nein | § 19 UStG; Warnungen 6.9 |
| F28 | Wie hoch war der Gesamtumsatz 2026? | Betrag ≥ 0, optional | F02 ≤ 31.12.2026, F27 = nein, Unternehmen in Deutschland | leer (dann ab 2027) | § 27 Abs. 38 UStG |
| F29 | Wie hoch ist die Umsatzsteuer-Zahllast 2026 voraussichtlich? | Betrag ≥ 0, optional | F02 im Jahr 2026, F27 = nein | leer (dann monatlich) | § 18 Abs. 2 Satz 6 UStG |
| F30 | Wie hoch sind die Verkäufe an Privatleute in anderen EU-Staaten je Jahr voraussichtlich? | Betrag ≥ 0 | Privatleute EU, F27 = nein | 0 | § 3c Abs. 4 UStG |
| F31 | Wird eine Dauerfristverlängerung beantragt? | ja/nein | F27 = nein | nein | §§ 46–48 UStDV |
| F32 | Hat das Finanzamt Einkommensteuer-Vorauszahlungen festgesetzt? | ja/nein | F04 ∈ {Einzel, GbR} | nein | § 37 Abs. 1 EStG |

### 5.3 Ergebnis

- Gruppen nach `zeitpunkt`: „Vor dem Start“, „In den ersten Wochen“, „Laufend“, „Jährlich“. Innerhalb der Gruppe nach nächstem Termin, dann nach Katalognummer.
- Oben ein Kasten „Nicht geprüft“ mit der Zahl der Lückenhinweise und Sprungmarke; die Lücken stehen am Ende vollständig.
- **Pflichtkarte:** Titel, Kurztext, Frist (`fristText`), nächster Termin mit „gesetzlich bis“, Stelle und Weg, Normen als Links, Quelle mit Stand, Hinweise.
- **„Warum?“** klappt auf: je Treffer die Begründung der Regel und die erfüllten Bedingungen mit Antwort, z. B. „Rechtsform: GmbH (Frage 4) · Beschäftigte: 3 (Fragen 12, 14, 15)“. Bei mehreren Regeln stehen alle Treffer da.
- **Status** je Pflicht: offen, erledigt, trifft nicht zu; dazu eine Notiz (höchstens 500 Zeichen). Filter nach Gruppe und Status.
- **„neu“-Marke:** Pflichten, die seit der letzten Neuberechnung hinzugekommen sind; entfallene erscheinen einmalig als Hinweis.
- Warnungen aus 6.9 oberhalb der Liste.

### 5.4 Termine und Kalenderexport

- Liste nach Monaten im Horizont (Standard 24 Monate ab dem 1. des Startmonats). Je Termin: Datum, Titel, Zeitraum, Stelle, Art; bei Abweichung „gesetzlich bis …“.
- Vergangene Termine erscheinen grau, wenn der Start in der Vergangenheit liegt.
- Dialog „Kalender exportieren“: Horizont 12 oder 24 Monate, Erinnerung 0, 1, 3, 7 oder 14 Tage vorher, Auswahl „nur offene Pflichten“. Ergebnis ist eine ICS-Datei (7.5).

### 5.5 Regelansicht

- Kopf: Katalogversion, Stand, die ersten 12 Zeichen des SHA-256 der DMN-Datei, Zahl der Regeln je Tabelle.
- dmn-js NavigatedViewer, per dynamischem Import geladen (wie `DiagrammLazy.tsx`). Erst der DRD, Klick auf eine Entscheidung öffnet die Tabelle.
- Treffer des Profils werden in der Tabelle hervorgehoben. Die Zeilen tragen die Regel-ID; das genaue DOM-Attribut von dmn-js beim Bau prüfen.
- Das bpmn.io-Wasserzeichen bleibt sichtbar und unverdeckt (Lizenz, 7.1).
- Darunter die Quellenliste Q1–Q17 mit Stand und Abrufdatum.

### 5.6 Druckansicht

- A4 hoch, immer hell. Kopf: Vorhaben, Rechtsform, Bundesland, Start, Katalogversion, Druckdatum.
- Je Gruppe eine Tabelle: Pflicht, Frist und nächster Termin, Stelle, Normen, Status; darunter „Warum?“ als eine Zeile.
- Danach die Lücken und die nächsten 12 Termine.
- Fußzeile auf jeder Seite: Hinweistext aus 5.7 und Seitenzahl.

### 5.7 Allgemeine Regeln der Oberfläche

- **Hinweistext** (überall gleich): „Der Pflichten-Kompass zeigt häufige Pflichten nach dem Rechtsstand vom 11.11.2026. Er ist keine Rechts- oder Steuerberatung und nicht vollständig. Jede Pflicht vor dem Handeln an der genannten Quelle prüfen oder fachlich beraten lassen.“
- Jede Eingabe hat ein sichtbares Label; Fehler stehen am Feld und sind mit `aria-describedby` verbunden.
- Alles per Tastatur bedienbar; Fokus sichtbar; Schrittleiste als `nav` mit Namen „Schritte“ (wie Prozesslotse).
- Farben als CSS-Variablen; Dunkelmodus über `prefers-color-scheme` und `data-theme` wie im Prozesslotsen.
- Externe Links öffnen in neuem Tab mit `rel="noopener noreferrer"`; im Windows-Programm über das Opener-Plugin (7.6).
- Beträge im Format „60.000 €“, Daten als „Mo, 15.02.2027“.

---

## 6. Regeln, Berechnungen und Prüfungen

### 6.1 Auswertungskette

1. **Profil → Merkmale** (`merkmale.ts`): reine Funktion nach 6.2.
2. **Merkmale → Treffer** (`auswertung.ts`): jede Tabelle der DMN-Datei, jede Regel; eine Regel trifft, wenn alle Einträge erfüllt sind (6.4).
3. **Treffer → Pflichten und Lücken:** nach Ausgabe-ID gruppieren; mehrere Treffer je ID bleiben als Begründungen erhalten. Reihenfolge nach Katalognummer, nicht nach Regeln (COLLECT ist ungeordnet).
4. **Gültigkeit:** Pflichten mit `gueltigBis` vor dem Start oder `gueltigAb` nach dem Horizontende entfallen mit Warnung.
5. **Termine** (`termine.ts`): je Pflicht und Fristregel nach 6.8.
6. **Neu-Markierung:** Vergleich mit dem vorigen Ergebnis im Zustand.

Alle Schritte sind reine Funktionen ohne React; `heute` wird übergeben, nie intern gelesen.

### 6.2 Merkmale

| Merkmal | Typ | Label | Herleitung | Fragen |
| --- | --- | --- | --- | --- |
| `rechtsform` | string | Rechtsform | F04 | F04 |
| `taetigkeit` | string | Tätigkeit | F06 | F06 |
| `kaufmaennisch` | string | Kaufmännischer Betrieb | F07, wenn sichtbar; sonst „nein“ | F07 |
| `kaufmann` | boolean | Kaufmann nach HGB | UG oder GmbH; oder Einzel/GbR und gewerblich und F07 = ja | F04, F06, F07 |
| `personengesellschaftEingetragen` | boolean | Eingetragene Personengesellschaft | GbR und (F05 = ja oder `kaufmann`) | F04, F05, F07 |
| `handwerk` | string | Handwerk | F10, wenn F09 Handwerk enthält; sonst „keins“ | F09, F10 |
| `handel`, `onlinehandel`, `gastronomie` | boolean | Handel, Onlinehandel, Gastronomie | F09 enthält den Bereich | F09 |
| `lebensmittel` | boolean | Umgang mit Lebensmitteln | F11 | F11 |
| `beschaeftigte` | number | Beschäftigte | F12 = ja: F14 + F15; sonst 0 | F12, F14, F15 |
| `minijobber` | number | Minijobs | F12 = ja: F15; sonst 0 | F12, F15 |
| `lohnsteuerabzug` | boolean | Lohnsteuerabzug | F12 = ja und (F14 > 0 oder (F15 > 0 und F16 = nein)) | F12, F14, F15, F16 |
| `sofortmeldeBranche` | boolean | Bereich mit Sofortmeldepflicht | F12 = ja und F17 = ja | F12, F17 |
| `kundenPrivat`, `kundenUnternehmen`, `kundenPrivatEu`, `kundenUnternehmenEu` | boolean | Kundengruppen | F19 | F19 |
| `website` | boolean | Online-Auftritt | F20 | F20 |
| `verpackungen` | boolean | Waren in Verpackungen an Privatleute | F21 | F21 |
| `kasse` | string | Kasse | F22 | F22 |
| `bargeld` | boolean | Bargeld | F24 | F24 |
| `kleinunternehmer` | boolean | Kleinunternehmerregelung | F27 = ja und F25 ≤ 100.000 | F25, F27 |
| `hgbBefreit` | boolean | Befreiung nach § 241a HGB | Einzelunternehmen und `kaufmann` und F25 ≤ 800.000 und F26 ≤ 80.000 | F04, F07, F25, F26 |
| `ao141Grenze` | boolean | Grenze nach § 141 AO überschritten | gewerblich und (F25 > 800.000 oder F26 > 80.000) | F06, F25, F26 |
| `umsatzErstesJahr` | number | Umsatz im ersten Jahr | F25 | F25 |

Erlaubte Werte: `rechtsform` = "einzelunternehmen","gbr","ug","gmbh"; `taetigkeit` = "gewerblich","freiberuflich"; `kaufmaennisch` = "ja","nein","unklar"; `handwerk` = "keins","zulassungspflichtig","zulassungsfrei","handwerksaehnlich","unklar"; `kasse` = "keine","offeneLadenkasse","elektronisch".

`hgbBefreit` und `ao141Grenze` nutzen erwartete Werte als Näherung. § 241a HGB stellt bei Neugründung auf den ersten Abschlussstichtag ab; § 141 AO wirkt erst nach Mitteilung des Finanzamts. Beides steht als Hinweis an der Pflicht.

### 6.3 DMN-Datei

- Eine Datei `regeln/pflichten.dmn`, DMN 1.3, UTF-8. Sie ist die einzige Quelle für Auslöser.
- Ein `inputData` „Merkmale“; je Tabelle ein `decision` mit `informationRequirement` auf „Merkmale“. DMNDI für den DRD ist Pflicht, sonst zeigt dmn-js keinen DRD.
- Eingabeausdruck immer `Merkmale.<name>` mit `typeRef` string, number oder boolean. String-Eingaben haben `inputValues` mit allen erlaubten Werten.
- Genau eine Ausgabe namens `pflicht` (Tabellen GR bis ON) oder `luecke` (Tabelle LU), `typeRef="string"`, `outputValues` mit allen vorkommenden IDs.
- Eine Annotationsspalte „Begründung“; jede Regel hat einen Annotationstext.
- Regel-IDs: zwei Buchstaben und zwei Ziffern (GR, PE, BR, ST, BU, ON, LU). IDs bleiben stabil; gelöschte IDs werden nicht wiederverwendet.
- Bearbeitung mit dem dmn-js-Modeler (z. B. demo.bpmn.io) oder dem Camunda Modeler; das Ergebnis wird als Datei committet und von der CI geprüft.

Gerüst (gekürzt):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
             xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/"
             xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/"
             xmlns:di="http://www.omg.org/spec/DMN/20180521/DI/"
             id="Pflichten" name="Pflichten-Kompass 2026.11.0"
             namespace="https://olbricht-digital.de/pflichtenkompass/regeln">
  <inputData id="Merkmale" name="Merkmale">
    <variable id="Merkmale_Variable" name="Merkmale" />
  </inputData>
  <decision id="Entscheidung_Gruendung" name="Gründung und Anmeldung">
    <informationRequirement id="IR_Gruendung"><requiredInput href="#Merkmale" /></informationRequirement>
    <decisionTable id="Tabelle_Gruendung" hitPolicy="COLLECT">
      <input id="GR_E1" label="Rechtsform">
        <inputExpression id="GR_E1_A" typeRef="string"><text>Merkmale.rechtsform</text></inputExpression>
        <inputValues id="GR_E1_W"><text>"einzelunternehmen","gbr","ug","gmbh"</text></inputValues>
      </input>
      <!-- weitere Eingaben: taetigkeit, kaufmann, personengesellschaftEingetragen, handwerk -->
      <output id="GR_A" name="pflicht" typeRef="string">
        <outputValues id="GR_A_W"><text>"gewerbeanzeige","steuerlicheErfassung","handelsregister","handelsregisterGmbh","transparenzregister","handwerksrolle","handwerkAnzeige","berufsgenossenschaft"</text></outputValues>
      </output>
      <annotation name="Begründung" />
      <rule id="GR01">
        <inputEntry id="GR01_E1"><text>-</text></inputEntry>
        <inputEntry id="GR01_E2"><text>"gewerblich"</text></inputEntry>
        <inputEntry id="GR01_E3"><text>-</text></inputEntry>
        <inputEntry id="GR01_E4"><text>-</text></inputEntry>
        <inputEntry id="GR01_E5"><text>-</text></inputEntry>
        <outputEntry id="GR01_A"><text>"gewerbeanzeige"</text></outputEntry>
        <annotationEntry><text>Wer ein stehendes Gewerbe beginnt, zeigt es gleichzeitig an.</text></annotationEntry>
      </rule>
    </decisionTable>
  </decision>
  <dmndi:DMNDI>
    <dmndi:DMNDiagram id="DRD">
      <dmndi:DMNShape id="DI_Merkmale" dmnElementRef="Merkmale"><dc:Bounds x="460" y="420" width="125" height="45" /></dmndi:DMNShape>
      <!-- je Entscheidung eine Form, je Anforderung eine Kante -->
    </dmndi:DMNDiagram>
  </dmndi:DMNDI>
</definitions>
```

Laden: `dmn-moddle` liest das XML in Node und im Browser. `src/regeln/dmn.ts` baut daraus `Regelwerk` (4.5) und prüft V1–V11 (6.10). Fehler brechen das Laden mit einer Liste von `Regelfehler` ab. V12 (Hash) läuft nur in Tests und CI; `Regelwerk.sha256` kommt zur Anzeige aus `regeln/stand.json`.

### 6.4 FEEL-Teilmenge

Grammatik (Teilmenge von S-FEEL, DMN 1.3 Abschnitt 9.2, Regeln 5–15, ohne Namen als Endpunkt):

```ebnf
eintrag      = "-" | positiv | "not" , "(" , positiv , ")" ;
positiv      = test , { "," , test } ;
test         = [ vergleich ] , literal | intervall ;
vergleich    = "<" | "<=" | ">" | ">=" ;
intervall    = ( "[" | "(" | "]" ) , zahl , ".." , zahl , ( "]" | ")" | "[" ) ;
literal      = zahl | text | "true" | "false" ;
zahl         = [ "-" ] , ziffer , { ziffer } , [ "." , ziffer , { ziffer } ] ;
text         = '"' , { zeichen ohne '"' und '\' } , '"' ;
```

Bedeutung:

- `-` ist immer erfüllt.
- Eine Liste ist erfüllt, wenn mindestens ein Test erfüllt ist. `not(…)` kehrt das um.
- `literal` ohne Vergleich prüft Gleichheit; der Typ muss zum Merkmal passen.
- Vergleiche und Intervalle nur mit Zahlen. `[` und `]` schließen ein, `(`, `)` und nach außen gedrehte Klammern schließen aus (DMN 1.3, 9.4).
- Leerzeichen um Tokens sind erlaubt.
- Merkmale sind nie null. Ein null-Wert zur Laufzeit ist ein Programmfehler und wirft.
- Nicht unterstützt und beim Laden abgelehnt: Namen als Endpunkt, Funktionen (`date(…)` usw.), Ausdrücke, Escapes in Texten, leere Einträge, leere Intervalle (`von > bis`).

### 6.5 Entscheidungstabellen

Schreibweise: Nur die Einträge, die nicht `-` sind, werden genannt. Alle Tabellen haben Hit Policy COLLECT.

**Tabelle GR „Gründung und Anmeldung“** – Eingaben: `rechtsform`, `taetigkeit`, `kaufmann`, `personengesellschaftEingetragen`, `handwerk`

| Regel | Bedingungen | Ausgabe | Begründung |
| --- | --- | --- | --- |
| GR01 | taetigkeit `"gewerblich"` | gewerbeanzeige | Wer ein stehendes Gewerbe beginnt, zeigt es gleichzeitig an. |
| GR02 | – | steuerlicheErfassung | Jede Betriebseröffnung und jede freiberufliche Tätigkeit wird dem Finanzamt mitgeteilt. |
| GR03 | rechtsform `"einzelunternehmen","gbr"`; taetigkeit `"gewerblich"`; kaufmann `true` | handelsregister | Ein Handelsgewerbe macht zum Kaufmann oder zur OHG; beide gehören ins Handelsregister. |
| GR04 | rechtsform `"ug","gmbh"` | handelsregisterGmbh | Die Gesellschaft besteht als solche erst mit der Eintragung. |
| GR05 | rechtsform `"ug","gmbh"` | transparenzregister | UG und GmbH sind juristische Personen des Privatrechts. |
| GR06 | rechtsform `"gbr"`; personengesellschaftEingetragen `true` | transparenzregister | Eingetragene Personengesellschaften melden ihre wirtschaftlich Berechtigten. |
| GR07 | handwerk `"zulassungspflichtig"` | handwerksrolle | Ein zulassungspflichtiges Handwerk darf nur mit Eintragung betrieben werden. |
| GR08 | handwerk `"zulassungsfrei","handwerksaehnlich"` | handwerkAnzeige | Der Beginn eines zulassungsfreien oder handwerksähnlichen Gewerbes ist anzuzeigen. |
| GR09 | – | berufsgenossenschaft | Jedes Unternehmen meldet sich binnen einer Woche beim Unfallversicherungsträger. |

**Tabelle PE „Personal“** – Eingaben: `beschaeftigte`, `minijobber`, `lohnsteuerabzug`, `sofortmeldeBranche`

| Regel | Bedingungen | Ausgabe | Begründung |
| --- | --- | --- | --- |
| PE01 | beschaeftigte `> 0` | betriebsnummer | Wer Beschäftigte meldet, braucht eine Betriebsnummer. |
| PE02 | beschaeftigte `> 0` | svAnmeldung | Versicherte Beschäftigte werden bei Beginn gemeldet. |
| PE03 | beschaeftigte `> 0`; sofortmeldeBranche `true` | sofortmeldung | In bestimmten Bereichen ist der Beginn spätestens bei Arbeitsaufnahme zu melden. |
| PE04 | beschaeftigte `> 0` | beitragsnachweis | Beiträge werden monatlich nachgewiesen und gezahlt. |
| PE05 | beschaeftigte `> 0` | lohnunterlagen | Für jede beschäftigte Person sind Lohnkonto und Entgeltunterlagen zu führen. |
| PE06 | lohnsteuerabzug `true` | lohnsteuer | Einbehaltene Lohnsteuer wird angemeldet, abgeführt und bescheinigt. |
| PE07 | minijobber `> 0` | arbeitszeitMinijob | Für Minijobs ist die tägliche Arbeitszeit aufzuzeichnen. |

**Tabelle BR „Branchenpflichten“** – Eingabe: `lebensmittel`

| Regel | Bedingungen | Ausgabe | Begründung |
| --- | --- | --- | --- |
| BR01 | lebensmittel `true` | infektionsschutz | Wer mit bestimmten Lebensmitteln arbeitet, braucht eine Belehrung nach § 43 IfSG. |

**Tabelle ST „Steuern“** – Eingaben: `rechtsform`, `kleinunternehmer`, `kundenUnternehmen`, `kundenUnternehmenEu`, `kundenPrivatEu`, `kaufmann`, `hgbBefreit`, `handwerk`, `kundenPrivat`

| Regel | Bedingungen | Ausgabe | Begründung |
| --- | --- | --- | --- |
| ST01 | kleinunternehmer `false` | ustVoranmeldung | Ohne Kleinunternehmerregelung sind Voranmeldungen abzugeben. |
| ST02 | kleinunternehmer `false` | ustJahreserklaerung | Ohne Kleinunternehmerregelung ist eine Jahreserklärung abzugeben. |
| ST03 | kleinunternehmer `true` | kleinunternehmerGrenzen | Die Steuerbefreiung gilt nur innerhalb der Umsatzgrenzen. |
| ST04 | kundenUnternehmen `true` | rechnungen | Leistungen an Unternehmen sind binnen sechs Monaten abzurechnen. |
| ST05 | kleinunternehmer `false`; kundenUnternehmenEu `true` | rechnungen | An Unternehmen in anderen EU-Staaten ist bis zum 15. des Folgemonats abzurechnen. |
| ST06 | – | eRechnungEmpfang | Inländische Unternehmen dürfen E-Rechnungen ohne Zustimmung schicken. |
| ST07 | kleinunternehmer `false`; kundenUnternehmen `true` | eRechnungAusstellen | Rechnungen an inländische Unternehmen werden zur E-Rechnung. |
| ST08 | kleinunternehmer `false`; kundenUnternehmenEu `true` | zusammenfassendeMeldung | Lieferungen und Leistungen an Unternehmen in anderen EU-Staaten sind zu melden. |
| ST09 | kleinunternehmer `false`; kundenPrivatEu `true` | euFernverkauf | Über 10.000 € EU-Verkäufen an Privatleute gilt die Steuer des Bestimmungslands. |
| ST10 | rechtsform `"einzelunternehmen","gbr"` | einkommensteuererklaerung | Gewinne natürlicher Personen fließen in die Einkommensteuererklärung. |
| ST11 | rechtsform `"gbr"` | feststellungserklaerung | Gemeinsame Einkünfte mehrerer Personen werden gesondert und einheitlich festgestellt. |
| ST12 | rechtsform `"ug","gmbh"` | eBilanz | Bilanzierende übermitteln Bilanz und GuV elektronisch. |
| ST13 | rechtsform `"einzelunternehmen"`; kaufmann `true`; hgbBefreit `false` | eBilanz | Bilanzierende übermitteln Bilanz und GuV elektronisch. |
| ST14 | rechtsform `"gbr"`; kaufmann `true` | eBilanz | Bilanzierende übermitteln Bilanz und GuV elektronisch. |
| ST15 | rechtsform `"einzelunternehmen","gbr"` | estVorauszahlungen | Das Finanzamt kann vierteljährliche Vorauszahlungen festsetzen. |
| ST16 | handwerk `not("keins")`; kundenPrivat `true`; kleinunternehmer `false` | rechnungen | Steuerpflichtige Leistungen im Zusammenhang mit einem Grundstück sind auch Privatleuten binnen sechs Monaten abzurechnen. |

ST16 nutzt das Handwerk als Näherung für Leistungen an Grundstücken. Die Pflichtkarte nennt die Bedingung; ohne Grundstücksbezug setzt der Nutzer „trifft nicht zu“. Für Kleinunternehmer im EU-Geschäft gilt Lücke 12, deshalb greift ST05 nur ohne Kleinunternehmerregelung.

**Tabelle BU „Buchführung, Abschluss und Kasse“** – Eingaben: `rechtsform`, `kaufmann`, `hgbBefreit`, `ao141Grenze`, `bargeld`, `kasse`

| Regel | Bedingungen | Ausgabe | Begründung |
| --- | --- | --- | --- |
| BU01 | – | aufbewahrung | Bücher, Belege und Geschäftsbriefe sind aufzubewahren. |
| BU02 | rechtsform `"ug","gmbh"` | buchfuehrungHgb | UG und GmbH sind Handelsgesellschaften und führen Bücher. |
| BU03 | rechtsform `"gbr"`; kaufmann `true` | buchfuehrungHgb | Eine OHG ist Handelsgesellschaft; die Befreiung nach § 241a HGB gilt nur für Einzelkaufleute. |
| BU04 | rechtsform `"einzelunternehmen"`; kaufmann `true`; hgbBefreit `false` | buchfuehrungHgb | Einzelkaufleute über den Grenzen des § 241a HGB führen Bücher. |
| BU05 | kaufmann `false`; ao141Grenze `true` | buchfuehrungAo141 | Über 800.000 € Umsatz oder 80.000 € Gewinn kann das Finanzamt Bücher verlangen. |
| BU06 | bargeld `true` | kassenfuehrung | Bareinnahmen und -ausgaben sind täglich festzuhalten. |
| BU07 | kasse `"elektronisch"` | elektronischeKasse | Elektronische Kassen brauchen TSE, Belegausgabe und Mitteilung. |
| BU08 | rechtsform `"ug","gmbh"` | jahresabschluss | Kapitalgesellschaften stellen den Jahresabschluss in festen Fristen auf. |
| BU09 | rechtsform `"ug","gmbh"` | offenlegung | Kapitalgesellschaften legen den Jahresabschluss offen. |
| BU10 | rechtsform `"ug"` | ugRuecklage | Die UG bildet eine gesetzliche Rücklage. |
| BU11 | kaufmann `true` | geschaeftsbriefe | Kaufleute und Handelsgesellschaften machen Pflichtangaben auf Geschäftsbriefen. |

**Tabelle ON „Online und Verpackung“** – Eingaben: `website`, `verpackungen`

| Regel | Bedingungen | Ausgabe | Begründung |
| --- | --- | --- | --- |
| ON01 | website `true` | impressum | Geschäftsmäßige digitale Dienste brauchen Anbieterangaben. |
| ON02 | verpackungen `true` | verpackung | Hersteller systembeteiligungspflichtiger Verpackungen registrieren sich und beteiligen sich an einem System. |
| ON03 | verpackungen `true` | verpackungDatenmeldung | Die Mengen der beteiligten Verpackungen gehen auch an die Zentrale Stelle. |

**Tabelle LU „Nicht geprüfte Bereiche“** – Ausgabe `luecke`; Eingaben: `rechtsform`, `taetigkeit`, `kaufmaennisch`, `handwerk`, `handel`, `onlinehandel`, `gastronomie`, `lebensmittel`, `beschaeftigte`, `website`, `kleinunternehmer`, `kundenPrivatEu`, `kundenUnternehmenEu`, `umsatzErstesJahr`

| Regel | Bedingungen | Ausgabe |
| --- | --- | --- |
| LU01 | taetigkeit `"gewerblich"` | gewerbesteuer |
| LU02 | rechtsform `"ug","gmbh"` | koerperschaftsteuer |
| LU03 | gastronomie `true` | gastronomieLandesrecht |
| LU04 | lebensmittel `true` | lebensmittelrecht |
| LU05 | onlinehandel `true` | fernabsatz |
| LU06 | website `true` | datenschutz |
| LU07 | beschaeftigte `> 0` | datenschutz |
| LU08 | beschaeftigte `> 0` | arbeitsrecht |
| LU09 | taetigkeit `"gewerblich"` | gewerberechtSonstiges |
| LU10 | website `true` | kuenstlersozialabgabe |
| LU11 | – | rundfunkbeitrag |
| LU12 | onlinehandel `true` | elektroBatterien |
| LU13 | handel `true` | elektroBatterien |
| LU14 | kleinunternehmer `true`; kundenPrivatEu `true` | euKleinunternehmer |
| LU15 | kleinunternehmer `true`; kundenUnternehmenEu `true` | euKleinunternehmer |
| LU16 | rechtsform `"ug","gmbh"`; taetigkeit `"freiberuflich"` | freiberuflicheKapitalgesellschaft |
| LU17 | rechtsform `"einzelunternehmen","gbr"`; taetigkeit `"gewerblich"`; kaufmaennisch `"unklar"` | kaufmannUnklar |
| LU18 | handwerk `"unklar"` | handwerkUnklar |
| LU19 | kleinunternehmer `true`; umsatzErstesJahr `> 25000` | kleinunternehmerGruendungsjahr |
| LU20 | rechtsform `"ug","gmbh"` | geschaeftsfuehrung |

Die Begründung der LU-Regeln ist der Titel der Lücke (6.7).

### 6.6 Pflichtenkatalog 2026.11.0

Zeitpunkt (Zp.): V = vor dem Start, W = erste Wochen, L = laufend, J = jährlich. Alle Einträge: `stand` = 2026-11-11. `gueltigAb` = 2026-08-12 bei Nr. 39 und 40 (Inkrafttreten VerpackDG), sonst null; `gueltigBis` überall null.

**Gründung und Anmeldung**

| Nr. | ID | Pflicht | Zp. | Frist (Fristregel) | Stelle, Weg | Normen | Quelle | Hinweise |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | gewerbeanzeige | Gewerbe anzeigen | V | gleichzeitig mit dem Beginn (`bisEreignis start`) | Gewerbeamt der Gemeinde (zuständige Behörde) | § 14 Abs. 1, § 15 Abs. 1 GewO; § 138 Abs. 1 Satz 1 AO | Q7, Q1 | Empfangsbescheinigung binnen 3 Tagen. Die Gemeinde unterrichtet das Finanzamt. Ausnahmen nach § 6 GewO. |
| 2 | steuerlicheErfassung | Fragebogen zur steuerlichen Erfassung übermitteln | W | 1 Monat nach Beginn bzw. Gründung (`nachEreignis start, 1 Monat, ao108`) | Finanzamt; elektronisch über die amtlich bestimmte Schnittstelle (ELSTER) | § 138 Abs. 1 Satz 3, Abs. 1b, Abs. 4 AO; UG/GmbH: § 137 AO | Q1 | Freiberufler teilen die Aufnahme selbst mit. Papier nur auf Antrag bei unbilliger Härte. |
| 3 | handelsregister | Firma zum Handelsregister anmelden | W | keine feste gesetzliche Frist (`ohneFesteFrist`) | Registergericht; elektronisch in öffentlich beglaubigter Form (Notar) | § 1, § 12 Abs. 1, § 29 HGB; OHG: § 105 Abs. 1, § 106 Abs. 1 HGB | Q5 | Eine GbR mit Handelsgewerbe ist eine OHG. |
| 4 | handelsregisterGmbh | Gesellschaft zum Handelsregister anmelden | V | vor dem Geschäftsbeginn (`bisEreignis start`) | Notar, Registergericht | § 2 Abs. 1, § 5a Abs. 1–2, § 7 Abs. 1–2, § 11 GmbHG; § 12 Abs. 1 HGB | Q6, Q5 | Vertrag notariell. UG: Stammkapital voll einzahlen, keine Sacheinlagen. Vor der Eintragung haften Handelnde persönlich. |
| 5 | transparenzregister | Wirtschaftlich Berechtigte mitteilen | W | unverzüglich (`unverzueglich start`) | registerführende Stelle des Transparenzregisters; elektronisch | § 20 Abs. 1 GwG | Q14 | Gilt für juristische Personen des Privatrechts und eingetragene Personengesellschaften. |
| 6 | handwerksrolle | In die Handwerksrolle eintragen lassen | V | vor dem Beginn (`bisEreignis start`) | Handwerkskammer | § 1 Abs. 1, § 16 Abs. 1 HwO | Q8 | Handwerkskarte mit der Gewerbeanzeige vorlegen. |
| 7 | handwerkAnzeige | Beginn bei der Handwerkskammer anzeigen | W | unverzüglich (`unverzueglich start`) | Handwerkskammer | § 18 Abs. 1–2 HwO | Q8 | Zulassungsfreie Handwerke (Anlage B1), handwerksähnliche Gewerbe (Anlage B2). |
| 8 | berufsgenossenschaft | Unternehmen beim Unfallversicherungsträger melden | W | binnen 1 Woche nach Beginn (`nachEreignis start, 7 Tage, keine Verschiebung`) | zuständige Berufsgenossenschaft oder Unfallkasse | § 192 Abs. 1 SGB VII | Q10 | Gilt als erfüllt, wenn die Gewerbeanzeige binnen 1 Woche erstattet wurde. Freiberufler melden selbst. |

**Personal**

| Nr. | ID | Pflicht | Zp. | Frist (Fristregel) | Stelle, Weg | Normen | Quelle | Hinweise |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 9 | betriebsnummer | Betriebsnummer beantragen | V | vor der ersten Meldung (`bisEreignis beschaeftigung`) | Bundesagentur für Arbeit; elektronisch | § 18i Abs. 1–2 SGB IV | Q9 | – |
| 10 | svAnmeldung | Beschäftigte zur Sozialversicherung anmelden | V | zum Beschäftigungsbeginn, konservativ (`bisEreignis beschaeftigung`) | Krankenkasse; Minijobs: Deutsche Rentenversicherung Knappschaft-Bahn-See | § 28a Abs. 1 Nr. 1, § 28i SGB IV | Q9 | Einzelfrist steht in der DEÜV (nicht geöffnet, O2). |
| 11 | sofortmeldung | Sofortmeldung abgeben | V | spätestens bei Aufnahme der Beschäftigung (`bisEreignis beschaeftigung`) | Datenstelle der Rentenversicherung | § 28a Abs. 4 SGB IV | Q9 | Bereiche: Bau; Gaststätten und Beherbergung; Personenbeförderung; Spedition, Transport, Logistik inkl. plattformbasierter Lieferdienste; Schausteller; Gebäudereinigung; Messebau; Fleischwirtschaft (ohne Fleischerhandwerk); Prostitution; Wach- und Sicherheit; Friseur und Kosmetik. |
| 12 | beitragsnachweis | Beitragsnachweis übermitteln und Beiträge zahlen | L | monatlich; Fälligkeit drittletzter Bankarbeitstag, Nachweis 2 Arbeitstage vorher; die App setzt den Arbeitstag davor an (`berechnet svBeitrag`) | Einzugsstelle (Krankenkasse; Minijobs: KBS) | § 23 Abs. 1, § 28f Abs. 3 SGB IV | Q9 | Nach der Praxis der Einzugsstellen muss der Nachweis zu Beginn des Nachweistags vorliegen (O9). |
| 13 | lohnunterlagen | Lohnkonto und Entgeltunterlagen führen | L | laufend; Entgeltunterlagen bis Ende des Kalenderjahres nach der letzten Prüfung aufbewahren (`laufend`) | intern | § 41 Abs. 1 EStG; § 28f Abs. 1 SGB IV | Q4, Q9 | – |
| 14 | lohnsteuer | Lohnsteuer anmelden, abführen und bescheinigen | L | 10. Tag nach dem Anmeldungszeitraum; Bescheinigung bis letzter Februartag des Folgejahres (`berechnet lohnsteuer`, `berechnet lohnsteuerbescheinigung`) | Betriebsstättenfinanzamt; elektronisch | § 41a Abs. 1–2, § 41b Abs. 1 EStG; § 93c Abs. 1 AO | Q4, Q1 | Minijobs mit einheitlicher Pauschsteuer 2 % laufen über die KBS (§ 40a Abs. 2, 6 EStG). |
| 15 | arbeitszeitMinijob | Arbeitszeit der Minijobber aufzeichnen | L | bis zum 7. Tag nach dem Arbeitstag; 2 Jahre aufbewahren (`laufend`) | intern | § 17 Abs. 1 MiLoG | Q13 | Gilt nicht für Minijobs in Privathaushalten (§ 8a SGB IV). |
| 16 | infektionsschutz | Belehrung nach Infektionsschutzgesetz sicherstellen | V | Bescheinigung vor der ersten Tätigkeit, höchstens 3 Monate alt; Beschäftigte nach Aufnahme und alle 2 Jahre belehren (`berechnet ifsgBescheinigung`, `berechnet ifsgBelehrung`) | Gesundheitsamt oder beauftragter Arzt | § 43 Abs. 1, 4–6 IfSG | Q15 | Gilt auch für Selbständige. Belehrung dokumentieren. Tätigkeiten nach § 42 Abs. 1 IfSG prüfen (nicht geöffnet). |

**Steuern**

| Nr. | ID | Pflicht | Zp. | Frist (Fristregel) | Stelle, Weg | Normen | Quelle | Hinweise |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 17 | ustVoranmeldung | Umsatzsteuer-Voranmeldung übermitteln und zahlen | L | 10. Tag nach dem Zeitraum; mit Dauerfristverlängerung 1 Monat später (`berechnet ustVoranmeldung`, `berechnet sondervorauszahlung`) | Finanzamt; elektronisch | § 18 Abs. 1, 2, 2a UStG; §§ 46–48 UStDV | Q2, Q3 | Zeitraum nach 6.8.4. Sondervorauszahlung 1/11 bei monatlicher Abgabe mit Fristverlängerung; die App nennt den Termin, nicht den Betrag. |
| 18 | ustJahreserklaerung | Umsatzsteuererklärung für das Kalenderjahr übermitteln | J | 31. Juli des Folgejahres; mit Beratung letzter Februartag des übernächsten Jahres (`berechnet steuererklaerung`) | Finanzamt; elektronisch | § 18 Abs. 3 UStG; § 149 Abs. 2–4 AO | Q2, Q1 | Bei Betriebseröffnung kann das Finanzamt mit Beratung früher anfordern (§ 149 Abs. 4 Satz 1 Nr. 2 AO); die Frist beträgt dann 4 Monate nach Bekanntgabe. |
| 19 | kleinunternehmerGrenzen | Kleinunternehmergrenzen einhalten | L | laufend (`laufend`) | Finanzamt | § 19 Abs. 1–3 UStG; § 34a UStDV | Q2, Q3 | Vorjahr höchstens 25.000 €, laufendes Jahr höchstens 100.000 €. Keine Voranmeldung und Jahreserklärung, außer auf Aufforderung. Rechnung mit Hinweis auf die Steuerbefreiung. Verzicht bindet 5 Jahre. |
| 20 | rechnungen | Rechnungen mit Pflichtangaben fristgerecht ausstellen | L | an Unternehmen im Inland binnen 6 Monaten nach der Leistung; an Unternehmen in anderen EU-Staaten bis zum 15. des Folgemonats; steuerpflichtige Leistungen an Grundstücken auch an Privatleute binnen 6 Monaten; 8 Jahre aufbewahren (`laufend`) | – | § 14 Abs. 2 Satz 2 Nr. 1, 3, Abs. 4, § 14a Abs. 1, 3, § 14b Abs. 1 UStG; §§ 33, 34a UStDV | Q2, Q3 | Kleinbetragsrechnung bis 250 € mit weniger Angaben. EU-Fälle: Leistungen nach § 3a Abs. 2 UStG und innergemeinschaftliche Lieferungen, mit USt-IdNr. beider Seiten. Rechnung an Privatleute mit Hinweis auf deren Aufbewahrungspflicht (§ 14 Abs. 4 Satz 1 Nr. 9 UStG). |
| 21 | eRechnungEmpfang | E-Rechnungen empfangen und aufbewahren können | L | für Umsätze ab 2025, laufend (`laufend`) | – | § 14 Abs. 1 Satz 3–6, Abs. 2 Satz 2 Nr. 1, § 14b Abs. 1, § 27 Abs. 38 UStG | Q2 | Für E-Rechnungen inländischer Unternehmen braucht es keine Zustimmung des Empfängers. |
| 22 | eRechnungAusstellen | E-Rechnungen an inländische Unternehmen ausstellen | L | ab 01.01.2027, wenn Gesamtumsatz 2026 über 800.000 €; sonst ab 01.01.2028 (`berechnet eRechnungAb`) | – | § 14 Abs. 1, 2 Satz 2 Nr. 1, § 27 Abs. 38 UStG; § 33 Satz 4 UStDV | Q2, Q3 | EDI bis 31.12.2027 zulässig. Kleinbeträge bis 250 € immer als sonstige Rechnung. |
| 23 | zusammenfassendeMeldung | Zusammenfassende Meldung übermitteln | L | 25. Tag nach Quartalsende; monatlich bei über 50.000 € Warenlieferungen je Quartal (`berechnet zusammenfassendeMeldung`) | Bundeszentralamt für Steuern; elektronisch | § 18a Abs. 1–2 UStG | Q2 | – |
| 24 | euFernverkauf | EU-Fernverkäufe: 10.000-Euro-Schwelle beachten | L | laufend; mit OSS Erklärung und Zahlung bis Ende des Monats nach Quartalsende (`berechnet oss`) | Bundeszentralamt für Steuern (OSS) | § 3c Abs. 4, § 16 Abs. 1d, § 18j Abs. 1, 4 UStG | Q2 | Über der Schwelle gilt die Steuer des Bestimmungslands. OSS-Teilnahme vor Quartalsbeginn anzeigen. Verzicht auf die Schwelle bindet 2 Jahre. |
| 25 | einkommensteuererklaerung | Einkommensteuererklärung elektronisch abgeben | J | wie Nr. 18 (`berechnet steuererklaerung`) | Finanzamt; elektronisch | § 4 Abs. 3, § 25 Abs. 3–4 EStG; § 149 Abs. 2–4 AO | Q4, Q1 | Gewinn per Einnahmen-Überschuss-Rechnung, wenn keine Buchführungspflicht besteht. Bei der GbR erklärt jede Person ihren Anteil. |
| 26 | feststellungserklaerung | Feststellungserklärung der Gesellschaft abgeben | J | wie Nr. 18 (`berechnet steuererklaerung`) | Finanzamt; elektronisch | § 180 Abs. 1 Satz 1 Nr. 2 Buchst. a, § 181 Abs. 2, § 149 Abs. 2–4 AO | Q1 | – |
| 27 | eBilanz | Bilanz und GuV elektronisch übermitteln (E-Bilanz) | J | mit der Steuererklärung (`berechnet steuererklaerung`) | Finanzamt; elektronisch | § 5b Abs. 1 EStG; Bilanzpflicht: §§ 6, 238, 242 HGB, § 13 Abs. 3 GmbHG | Q4, Q5, Q6 | Für Kapitalgesellschaften gilt § 5b über das KStG (nicht geöffnet, O13). |
| 28 | estVorauszahlungen | Einkommensteuer-Vorauszahlungen zahlen | L | 10.03., 10.06., 10.09., 10.12., wenn festgesetzt (`berechnet estVorauszahlungen`) | Finanzamt | § 37 Abs. 1 EStG | Q4 | Termine nur bei F32 = ja. |

**Buchführung, Abschluss und Kasse**

| Nr. | ID | Pflicht | Zp. | Frist (Fristregel) | Stelle, Weg | Normen | Quelle | Hinweise |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 29 | aufbewahrung | Unterlagen 10, 8 oder 6 Jahre aufbewahren | L | ab Ende des Kalenderjahres: Bücher und Abschlüsse 10 J., Buchungsbelege und Rechnungen 8 J., Geschäftsbriefe 6 J. (`laufend`) | – | § 147 Abs. 1, 3, 4 AO; § 257 Abs. 1, 4, 5 HGB; § 14b Abs. 1 UStG | Q1, Q5, Q2 | Die Frist läuft nicht ab, solange die Festsetzungsfrist offen ist (§ 147 Abs. 3 AO). |
| 30 | buchfuehrungHgb | Handelsbücher führen und Jahresabschluss aufstellen | L | laufend; Abschluss in der „einem ordnungsmäßigen Geschäftsgang entsprechenden Zeit“ (`laufend`) | – | §§ 6 Abs. 1, 238 Abs. 1, 241a, 242, 243 Abs. 3 HGB; § 41 GmbHG | Q5, Q6 | Einzelkaufleute mit höchstens 800.000 € Umsatz und 80.000 € Jahresüberschuss sind befreit; bei Neugründung zählt der erste Abschlussstichtag. Zu Beginn des Handelsgewerbes eine Eröffnungsbilanz aufstellen (§ 242 Abs. 1 HGB). |
| 31 | buchfuehrungAo141 | Steuerliche Buchführungspflicht beachten | L | ab dem Wirtschaftsjahr nach der Mitteilung des Finanzamts (`laufend`) | Finanzamt | § 141 Abs. 1–2 AO | Q1, Q4 | Grenzen: Gesamtumsatz über 800.000 € oder Gewinn über 80.000 €. Ab dann Bilanz statt Einnahmen-Überschuss-Rechnung und E-Bilanz (§ 5b EStG); Nr. 27 löst die App dafür nicht aus. |
| 32 | kassenfuehrung | Kasseneinnahmen und -ausgaben täglich festhalten | L | täglich (`laufend`) | – | § 146 Abs. 1 AO | Q1 | Ohne elektronisches System keine Einzelaufzeichnung beim Warenverkauf gegen bar an viele unbekannte Personen. |
| 33 | elektronischeKasse | Elektronische Kasse mit TSE betreiben und mitteilen | W | TSE und Beleg ab Nutzung; Mitteilung binnen 1 Monat nach Anschaffung oder Außerbetriebnahme (`nachEreignis kassenanschaffung, 1 Monat, ao108`) | Finanzamt; elektronisch | § 146a Abs. 1, 2, 4 AO | Q1 | Befreiung von der Belegausgabe nur durch das Finanzamt (§ 146a Abs. 2 Satz 2 AO). |
| 34 | jahresabschluss | Jahresabschluss der UG/GmbH aufstellen | J | 3 Monate nach Geschäftsjahresende; kleine Gesellschaften bis 6 Monate (`berechnet jahresabschluss`) | – | §§ 242, 264 Abs. 1, 267 Abs. 1 HGB | Q5 | Die App setzt konservativ 3 Monate an. |
| 35 | offenlegung | Jahresabschluss offenlegen | J | spätestens 1 Jahr nach dem Abschlussstichtag (`berechnet offenlegung`) | das Unternehmensregister führende Stelle; elektronisch | § 325 Abs. 1, 1a, § 326 Abs. 2, § 267a HGB | Q5 | Kleinstkapitalgesellschaften übermitteln nur die Bilanz und können hinterlegen. |
| 36 | ugRuecklage | Gesetzliche Rücklage der UG bilden | J | mit jedem Jahresabschluss (`laufend`) | – | § 5a Abs. 3 GmbHG | Q6 | Ein Viertel des um einen Verlustvortrag geminderten Jahresüberschusses. |
| 37 | geschaeftsbriefe | Pflichtangaben auf Geschäftsbriefen machen | L | laufend (`laufend`) | – | § 37a HGB (Kaufmann), § 125 HGB (OHG), § 35a GmbHG | Q5, Q6 | – |

**Online und Verpackung**

| Nr. | ID | Pflicht | Zp. | Frist (Fristregel) | Stelle, Weg | Normen | Quelle | Hinweise |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 38 | impressum | Impressum bereitstellen | V | ab Veröffentlichung, ständig verfügbar (`bisEreignis start`) | – | § 5 Abs. 1 DDG | Q11 | Name, Anschrift, E-Mail, Register und Nummer, USt-IdNr. falls vorhanden; bei juristischen Personen Rechtsform und Vertretung. |
| 39 | verpackung | Als Hersteller registrieren und an einem System beteiligen | V | vor dem erstmaligen Bereitstellen (`bisEreignis start`, `berechnet verpackungUebergang`) | Zentrale Stelle Verpackungsregister (Online-Registrierung); ein System | § 3 Abs. 6, § 6 Abs. 1–3, § 7 Abs. 1, § 68 Abs. 1–2 VerpackDG | Q12 | Herstellerbegriff nach VO (EU) 2025/40 prüfen (O6). Beteiligungen nach altem Recht gelten längstens bis 31.12.2026. |
| 40 | verpackungDatenmeldung | Verpackungsmengen an die Zentrale Stelle melden | J | unverzüglich nach der Systembeteiligung; unter 10 t im Vorjahr bis 1. Juni des Folgejahres (`berechnet verpackungDatenmeldung`) | Zentrale Stelle Verpackungsregister | § 9 Abs. 1–2, § 10 VerpackDG | Q12 | Vollständigkeitserklärung bis 15. Mai ab 80 t Glas, 50 t Papier oder 30 t sonstiger Materialien. |

Gruppen im Datenmodell: Nr. 1–8 `gruendung`, 9–16 `personal`, 17–28 `steuern`, 29–37 `buchfuehrung`, 38–40 `online`.

### 6.7 Lückenhinweise

Lücken sind keine Pflichten. Sie sagen, welche Bereiche zum Profil passen, aber in 0.1 nicht geprüft sind. Die App zeigt sie immer mit dem Text „In Version 0.1 nicht geprüft“.

| Nr. | ID | Art | Titel | Regeln | Nicht geprüft |
| --- | --- | --- | --- | --- | --- |
| 1 | gewerbesteuer | nichtGeprueft | Gewerbesteuer | LU01 | Erklärung und Vorauszahlungen (O5) |
| 2 | koerperschaftsteuer | nichtGeprueft | Körperschaftsteuer | LU02 | Erklärung und Vorauszahlungen (O5) |
| 3 | gastronomieLandesrecht | nichtGeprueft | Gaststättenrecht des Landes | LU03 | Erlaubnis oder Anzeige nach Landesrecht (O7) |
| 4 | lebensmittelrecht | nichtGeprueft | Lebensmittelrecht | LU04 | Registrierung als Lebensmittelbetrieb, Hygiene (O7) |
| 5 | fernabsatz | nichtGeprueft | Verbraucherrecht im Onlinehandel | LU05 | Informations- und Widerrufspflichten, Bestellbutton, Preisangaben, Barrierefreiheit |
| 6 | datenschutz | nichtGeprueft | Datenschutz | LU06, LU07 | Datenschutzhinweise, Verarbeitungsverzeichnis, Datenschutzbeauftragter, Einwilligung für Cookies |
| 7 | arbeitsrecht | nichtGeprueft | Arbeitsrecht und Arbeitsschutz | LU08 | Arbeitsschutz, Nachweisgesetz, DEÜV-Fristen, Mindestlohnhöhe, Bereiche nach § 2a SchwarzArbG (O1, O2, O12) |
| 8 | gewerberechtSonstiges | nichtGeprueft | Erlaubnisse und Kammern | LU09 | erlaubnispflichtige Gewerbe, Beiträge zu IHK oder HWK |
| 9 | kuenstlersozialabgabe | nichtGeprueft | Künstlersozialabgabe | LU10 | Abgabe auf Aufträge an Kreative, z. B. Webdesign, Fotos, Texte |
| 10 | rundfunkbeitrag | nichtGeprueft | Rundfunkbeitrag für Betriebsstätten | LU11 | Anmeldung und Beitrag je Betriebsstätte |
| 11 | elektroBatterien | nichtGeprueft | Elektrogeräte und Batterien | LU12, LU13 | Registrierungspflichten beim Verkauf solcher Waren |
| 12 | euKleinunternehmer | nichtGeprueft | EU-Geschäft als Kleinunternehmer | LU14, LU15 | Ort der Leistung, Rechnungsfristen und Meldepflichten |
| 13 | freiberuflicheKapitalgesellschaft | nichtGeprueft | Freiberufliche UG oder GmbH | LU16 | Gewerbeanzeige und Berufsrecht |
| 14 | kaufmannUnklar | pruefen | Kaufmannseigenschaft klären | LU17 | Handelsregister und Buchführung nach HGB hängen davon ab |
| 15 | handwerkUnklar | pruefen | Handwerksart klären | LU18 | Handwerksrolle (Anlage A) oder Anzeige (Anlage B) |
| 16 | kleinunternehmerGruendungsjahr | pruefen | Kleinunternehmergrenze im Gründungsjahr | LU19 | welche Grenze im Gründungsjahr gilt (O3) |
| 17 | geschaeftsfuehrung | pruefen | Vergütung der Geschäftsführung klären | LU20 | Lohnsteuer auf ein Geschäftsführergehalt und Sozialversicherungsstatus der Geschäftsführung (Statusfeststellung); die Pflichten 9–14 erscheinen nur, wenn F12 Beschäftigte nennt |

### 6.8 Fristen und Berechnungen

Alle Funktionen sind rein und bekommen `heute`, `bundesland` und den Horizont übergeben.

#### 6.8.1 Datum und Feiertage

- Daten sind ISO-Strings. Gerechnet wird mit Tageszahlen oder `Date.UTC(j, m, t, 12)`; nie `new Date('JJJJ-MM-TT')` in Ortszeit.
- `feiertage(jahr, land, modus)` nutzt `getHolidays(jahr, land)` aus feiertagejs 1.5.1:
  - **sicher** (für Verschiebungen nach vorn): alle Feiertage der Bibliothek, aber ohne Mariä Himmelfahrt in Bayern (dort nur regional).
  - **möglich** (für Rückwärtszählung): alle Feiertage der Bibliothek plus 24.12. und 31.12., Fronleichnam in SN und TH und das Augsburger Friedensfest (08.08.) in BY. Diese regionalen Tage führt feiertagejs 1.5.1 für die Länder nicht (Quelltext am 11.11.2026 geprüft; das Friedensfest nur mit der Region `AUGSBURG`).
- `istWerktag(d)` = Mo–Fr und kein Feiertag „sicher“. `istArbeitstag(d)` = Mo–Fr und kein Feiertag „möglich“; gilt auch als Bankarbeitstag.
- Begründung: Weniger Feiertage beim Verschieben und mehr Feiertage beim Zurückzählen ergeben nie ein späteres Datum als das Gesetz.

#### 6.8.2 Fristregeln

```text
bisEreignis(e)        → Termin am Ereignisdatum, Art „handlung“
unverzueglich(e)      → Termin am Ereignisdatum, Hinweis „unverzüglich = ohne schuldhaftes Zögern“
nachEreignis(e, m, t) → roh = plusTage(plusMonate(e, m), t)
                        plusMonate: gleicher Tag im Zielmonat; fehlt er, der Monatsletzte
                        ao108 = true  → faelligAm = naechsterWerktag(roh)   (nur Abgaben und Mitteilungen)
                        ao108 = false → faelligAm = roh                      (keine Verschiebung)
laufend, ohneFesteFrist → keine Termine
```

- Termine außerhalb des Horizonts entfallen. Horizont: vom 1. des Startmonats `horizontMonate` Monate lang.
- **Zahlungen** (USt, Lohnsteuer, ESt-Vorauszahlung): `faelligAm` bleibt unverschoben; `gesetzlichBis` = `naechsterWerktag(roh)`, falls verschieden. Grund: Die Verschiebung von Zahlungsterminen stützt sich auf § 108 Abs. 1 AO mit § 193 BGB; BGB nicht geöffnet (O9).
- **OSS:** `faelligAm` bleibt unverschoben, `gesetzlichBis` ist immer null. Ob sich die EU-weite Frist am Wochenende verlängert, ist nicht geprüft (O16).
- **Ereignisse:** `start` = F02; `beschaeftigung` = F13; `kassenanschaffung` = F23.

#### 6.8.3 Einzelne Fristen

| Pflicht | Termine |
| --- | --- |
| steuerlicheErfassung | Start + 1 Monat, nach § 108 Abs. 3 AO verschoben |
| berufsgenossenschaft | Start + 7 Tage, unverschoben |
| elektronischeKasse | Anschaffung + 1 Monat, nach § 108 Abs. 3 AO verschoben; Titel „Kasse dem Finanzamt mitteilen“ |
| übrige `bisEreignis`/`unverzueglich` | am Ereignisdatum |

#### 6.8.4 Umsatzsteuer-Voranmeldung

```text
ustZeitraum(jahr, p): 'monat' | 'quartal' | 'keine'
  wenn kleinunternehmer                          → 'keine'
  GJ = Jahr von F02
  wenn jahr = GJ = 2026:                           (§ 18 Abs. 2 Satz 6 UStG)
      F29 leer                                   → 'monat' (konservativ)
      F29 > 9.000                                → 'monat'
      sonst                                      → 'quartal'; bei F29 ≤ 2.000 Hinweis „Befreiung durch das Finanzamt möglich“
  wenn jahr ∈ {GJ, GJ+1}                         → 'monat' (Satz 4); bei GJ = 2026 Prüfhinweis O4
  sonst                                          → 'monat' (konservativ; Vorjahressteuer unbekannt), Hinweis
```

- Termine: je Zeitraum ab dem Zeitraum, der F02 enthält. Fällig am 10. Tag nach Ablauf; mit F31 einen Monat später. Art „abgabeUndZahlung“.
- **Sondervorauszahlung** (nur F31 = ja): Ist `ustZeitraum(Y)` = 'monat', Termin „Sondervorauszahlung anmelden und zahlen“ im Jahr Y. Im ersten Jahr am gesetzlichen Abgabetag der ersten Voranmeldung ohne Verlängerung, danach am 10.02. (§ 48 Abs. 1–2 UStDV). Bei 'quartal' nur im ersten Jahr der Termin „Dauerfristverlängerung beantragen“.
- Den Betrag der Sondervorauszahlung rechnet die App nicht. Die Pflichtkarte nennt die Regel: 1/11 der Vorauszahlungen des Vorjahres, im Gründungsjahr der zu erwartenden (§ 47 Abs. 1, 3 UStDV). Ob diese im Gründungsjahr hochzurechnen sind, ist nicht geprüft.

#### 6.8.5 Lohnsteuer

```text
lstZeitraum(jahr, p): 'monat' | 'quartal' | 'jahr'
  EJ = Jahr von F13
  basis = jahr = EJ     → F18 × 12                    (§ 41a Abs. 2 Satz 4 EStG)
          jahr = EJ + 1 → F18 × 12 als Schätzung       (Satz 3; Hinweis, Umrechnung O11)
          sonst         → unbekannt
  basis unbekannt oder F18 leer → 'monat' (konservativ)
  basis > 5.000 → 'monat'; basis > 1.080 → 'quartal'; sonst → 'jahr'
```

- Termine: 10. Tag nach Ablauf jedes Zeitraums ab dem Zeitraum mit F13; Art „abgabeUndZahlung“.
- Lohnsteuerbescheinigung: für jedes Jahr Y ab EJ am letzten Februartag des Jahres Y+1, nach § 108 Abs. 3 AO verschoben; Art „abgabe“.

#### 6.8.6 Sozialversicherungsbeiträge

```text
für jeden Monat M ab dem Monat von F13:
  faellig  = drittletzter Arbeitstag(M)                (vom Monatsende zurück, Modus „möglich“)
  nachweis = zwei Arbeitstage vor faellig             (zurückzählen, Modus „möglich“)
  termin   = ein Arbeitstag vor nachweis              (zurückzählen, Modus „möglich“)
  Termin: faelligAm = termin, gesetzlichBis = nachweis, Art „abgabeUndZahlung“,
          Hinweis „Nachweis muss zu Beginn des <nachweis> vorliegen; Beiträge fällig am <faellig>“
```

Nach der Praxis der Einzugsstellen muss der Nachweis zu Beginn des Nachweistags (0 Uhr) vorliegen. Das ist nicht an einer Primärquelle geprüft (O9). Der Termin einen Arbeitstag vorher ist in beiden Lesarten rechtzeitig.

#### 6.8.7 Jahresfristen

| Berechnung | Termin für Besteuerungs- oder Geschäftsjahr Y (ab Jahr von F02) | Verschiebung |
| --- | --- | --- |
| steuererklaerung | ohne Beratung 31.07.(Y+1); mit Beratung (F08) letzter Februartag (Y+2) | § 108 Abs. 3 AO |
| jahresabschluss | 31.03.(Y+1); Hinweis „klein: bis 30.06.(Y+1), wenn ordnungsgemäßer Geschäftsgang“ | keine |
| offenlegung | 31.12.(Y+1) | keine |
| verpackungDatenmeldung | 01.06.(Y+1); Hinweis „ab 10 t im Vorjahr unverzüglich nach Beteiligung“ | keine |
| estVorauszahlungen | 10.03., 10.06., 10.09., 10.12. ab F02, nur bei F32 = ja; Art „zahlung“ | als `gesetzlichBis` |

#### 6.8.8 Weitere Berechnungen

| Berechnung | Regel |
| --- | --- |
| zusammenfassendeMeldung | je Quartal ab F02: 25. Tag nach Quartalsende, nach § 108 Abs. 3 AO verschoben; Hinweis auf monatliche Abgabe über 50.000 € Warenlieferungen je Quartal |
| oss | nur bei F30 > 10.000: je Quartal Erklärung und Zahlung am letzten Tag des Folgemonats, ohne `gesetzlichBis` (6.8.2); Art „abgabeUndZahlung“; Hinweis „OSS ist wählbar; Anzeige beim BZSt vor Quartalsbeginn“. Sonst Hinweis „Schwelle nicht überschritten“ |
| ifsgBescheinigung | Termin am Start; Hinweis „Bescheinigung frühestens ausgestellt am <Start − 3 Monate>“ |
| ifsgBelehrung | nur bei `beschaeftigte` > 0: Termin an F13, danach alle 24 Monate |
| verpackungUebergang | nur bei F02 < 12.08.2026: Termin 31.12.2026 „Systembeteiligung nach VerpackDG neu abschließen“ (§ 68 Abs. 1) |

#### 6.8.9 E-Rechnungspflicht ab

```text
eRechnungAb(p):
  F02 ≥ 2028-01-01            → F02
  F02 ≤ 2026-12-31 und F28 leer → 2027-01-01 (konservativ)
  F28 > 800.000               → 2027-01-01
  sonst                       → 2028-01-01
Termin „E-Rechnungen ausstellen ab <Datum>“, Art „handlung“, keine Verschiebung.
```

#### 6.8.10 Aufbewahrung bis

`aufbewahrenBis(art, jahr)` = 31.12.(jahr + n) mit n = 10 (Bücher, Inventare, Abschlüsse, Organisationsunterlagen), 8 (Buchungsbelege, Rechnungen), 6 (Geschäftsbriefe, sonstige Unterlagen). `jahr` ist das Jahr der letzten Eintragung, Aufstellung, Absendung oder Entstehung (§ 147 Abs. 4 AO). Die Pflichtkarte zeigt einen kleinen Rechner.

#### 6.8.11 Geringfügigkeitsgrenze

`geringfuegigkeitsgrenze(mindestlohnCent)` = `Math.ceil(mindestlohnCent × 130 / 300)` Euro (§ 8 Abs. 1a SGB IV). Ganzzahlig rechnen. Der aktuelle Mindestlohn ist nicht geprüft (O1); die App zeigt bis zur Klärung nur die Formel.

#### 6.8.12 Kleinunternehmerprüfung

```text
kleinunternehmerStatus({ gruendungsjahr, vorjahr, laufend }):
  laufend > 100.000                        → 'nichtMoeglich'
  nicht gruendungsjahr und vorjahr > 25.000 → 'nichtMoeglich'
  gruendungsjahr und laufend > 25.000       → 'pruefen' (O3)
  sonst                                    → 'moeglich'
```

### 6.9 Eingabeprüfungen und Warnungen

| Prüfung | Bedingung | Folge |
| --- | --- | --- |
| Pflichtfelder | F02, F03, F04, F06, F09 (mindestens eine), F19 (mindestens eine) | Ergebnis erst nach Antwort; Hinweis am Feld |
| Datumsbereich | F02 außerhalb 01.01.2026–31.12.2030 | Fehler am Feld |
| Beschäftigte | F12 = ja und F14 + F15 = 0 | Fehler „mindestens eine Person angeben“ |
| Beginn | F13 vor F02 | Warnung, keine Sperre |
| Kleinunternehmer | F27 = ja und F25 > 100.000 | Warnung „nicht anwendbar“; Merkmal `kleinunternehmer` = false |
| Kleinunternehmer | F27 = ja und F25 > 25.000 | Lücke `kleinunternehmerGruendungsjahr` |
| Beträge | F18, F25, F28–F30 < 0 oder nicht endlich; F26 nicht endlich | Fehler am Feld |
| Notiz | länger als 500 Zeichen | wird abgeschnitten mit Hinweis |

### 6.10 Prüfung des Regelwerks (beim Laden und in der CI)

| Regel | Prüfung |
| --- | --- |
| V1 | Namensraum ist DMN 1.3 (`https://www.omg.org/spec/DMN/20191111/MODEL/`). |
| V2 | Jede Entscheidung hat eine Entscheidungstabelle mit `hitPolicy="COLLECT"` und ohne `aggregation`. |
| V3 | Genau eine Ausgabe `pflicht` oder `luecke`, `typeRef="string"`, mit `outputValues`. |
| V4 | Jeder Ausgabeeintrag ist ein Textliteral aus `outputValues` und existiert im Katalog bzw. in der Lückenliste. |
| V5 | Jeder Eingabeausdruck ist `Merkmale.<name>` mit bekanntem Merkmal und passendem `typeRef`. |
| V6 | Jeder Eingabeeintrag passt zur Grammatik (6.4) und zum Typ; Textliterale stehen in den erlaubten Werten. |
| V7 | Jede Regel hat einen nicht leeren Annotationstext. |
| V8 | Regel-IDs sind eindeutig und folgen dem Muster `[A-Z]{2}\d{2}`. |
| V9 | Jede der 40 Pflichten wird von mindestens einer Regel ausgegeben. |
| V10 | Jede der 17 Lücken wird von mindestens einer Regel ausgegeben. |
| V11 | Katalog vollständig: Normen, Quellen (Q1–Q15), `stand` ≤ `KATALOG_STAND`, `gueltigAb` ≤ `gueltigBis`. |
| V12 | Nur in Tests und CI, nicht beim Laden: Der SHA-256 der DMN-Datei (UTF-8, Zeilenenden vor dem Hashen auf LF vereinheitlicht) entspricht `regeln/stand.json`; sonst „Regeln geändert: Version und Stand anheben“. |

---

## 7. Technik

### 7.1 Stack und Bibliotheken

Wie beim Prozesslotsen: React, TypeScript, Vite, Vitest, Playwright mit axe, oxlint, GitHub Actions. Versionen und Lizenzen per `npm view <paket> version license` am 11.11.2026 geprüft.

| Paket | Version | Lizenz | Einsatz |
| --- | --- | --- | --- |
| react, react-dom | 19.3.1 | MIT | Oberfläche |
| typescript | 7.0.2 | Apache-2.0 | Sprache (dev) |
| vite | 8.3.7 | MIT | Build (dev) |
| @vitejs/plugin-react | 6.3.0 | MIT | Build (dev) |
| vitest | 5.1.0 | MIT | Unit-Tests (dev) |
| @playwright/test | 1.65.0 | Apache-2.0 | Browsertests (dev) |
| @axe-core/playwright | 4.14.0 | MPL-2.0 | Barrierefreiheit (dev) |
| oxlint | 1.93.0 | MIT | Lint (dev) |
| @types/react, @types/react-dom | 19.3.0 | MIT | Typen (dev) |
| @types/node | 24.19.2 (Linie 24 passend zu Node 24; neueste wäre 26.6.6) | MIT | Typen (dev) |
| **dmn-js** | 18.0.3 | bpmn.io-Lizenz: MIT-Text plus Pflicht, das Wasserzeichen sichtbar zu lassen | Anzeige von DRD und Tabellen; lazy geladen |
| **dmn-moddle** | 12.2.1 | MIT | DMN-1.3-XML lesen |
| **feelin** | 8.2.0 | MIT | nur Test-Orakel für die FEEL-Teilmenge (dev) |
| **feiertagejs** | 1.5.1 | MIT, ohne Abhängigkeiten | Feiertage je Land |
| @tauri-apps/api | 2.12.4 | Apache-2.0 OR MIT | Phase 6 |
| @tauri-apps/cli | 2.12.4 | Apache-2.0 OR MIT | Phase 6 (dev) |
| @tauri-apps/plugin-opener | 2.7.3 | MIT OR Apache-2.0 | Phase 6: Quellenlinks im Standardbrowser |

Verworfen: `date-holidays` 3.39.1 (Lizenz „ISC AND CC-BY-SA-4.0“, Share-Alike für Daten); ICS-Bibliotheken (Format ist klein, eigener Code mit Tests); zod (Prüfung wie `speicher.ts` im Prozesslotsen).

Hinweise zu dmn-js 18.0.3: Einstieg `dmn-js/lib/NavigatedViewer`; CSS aus `dmn-js/dist/assets/` (`dmn-js-shared.css`, `dmn-js-drd.css`, `dmn-js-decision-table.css`, `dmn-font/css/dmn-embedded.css`). Zum Größenvergleich: Das vorgefertigte Bundle `dmn-navigated-viewer.production.min.js` ist 529 KB groß, der Viewer ohne Navigation 517 KB. Der DRD erscheint nur mit DMNDI. Die Symbolschrift steckt in `dmn-embedded.css` als data-URL; die CSP braucht deshalb `font-src 'self' data:` (8).

### 7.2 Bewertung: echte DMN-1.3-Tabellen

**Ergebnis: sinnvoll und machbar, mit klarer Arbeitsteilung.** DMN entscheidet, *ob* eine Pflicht gilt. TypeScript leitet vorher die Merkmale ab und rechnet danach die Fristen.

Dafür spricht:

- DMN ist ein Standard mit Werkzeugen (dmn-js, Camunda Modeler); Regeln sind für Fachleute lesbar und als XML in Git versionierbar.
- COLLECT passt genau: alle zutreffenden Pflichten. Ein ODER entsteht durch mehrere Regeln mit gleicher Ausgabe.
- Die Begründung fällt nebenbei ab: Die erfüllten Einträge einer Regel sind das „Warum?“.
- Es passt zum Prozesslotsen (BPMN) und zeigt WI-Kompetenz in Entscheidungsmodellierung.

Grenzen und Antworten:

- FEEL ist groß (Kontexte, Funktionen, Zeitrechnung). Die App nutzt nur die Teilmenge aus 6.4 und lehnt alles andere beim Laden ab.
- Fristen sind Kalenderrechnung und gehören nicht in Entscheidungstabellen; sie stehen in `fristen/`.
- dmn-js ist groß; es lädt erst in der Regelansicht.
- Eigene FEEL-Auswertung statt feelin im Programm: weniger fremder Code und jede Form getestet. feelin bleibt Entwicklungsabhängigkeit; Differenztests vergleichen beide über alle Einträge der Datei.
- Kein Anspruch auf eine DMN-Konformitätsstufe. Die App liest gültiges DMN 1.3 und wertet eine Teilmenge der S-FEEL-Tabellen aus.
- Verworfen: Regeln als JSON. Einfacher, aber ohne Standard, Werkzeuge und WI-Bezug.

### 7.3 Ordnerstruktur

```text
pflichtenkompass/
├─ docs/
│  ├─ spezifikation.md       diese Datei
│  ├─ katalog.md             aus dem Katalog erzeugt (scripts/katalog-doku.mjs)
│  └─ fragenkatalog.md       Fragen F01–F32
├─ regeln/
│  ├─ pflichten.dmn          DMN 1.3, 7 Entscheidungstabellen mit DRD
│  └─ stand.json             { "version": "2026.11.0", "stand": "2026-11-11", "sha256": { "pflichten.dmn": "…" } }
├─ src/
│  ├─ modell/                typen.ts, fragen.ts, merkmale.ts, beispiele.ts, speicher.ts
│  ├─ katalog/               typen.ts, pflichten.ts, luecken.ts, quellen.ts, normen.ts (Linkbau)
│  ├─ regeln/                typen.ts, feel.ts, dmn.ts (Laden), pruefung.ts (V1–V12), auswertung.ts
│  ├─ fristen/               datum.ts, feiertage.ts, berechnungen.ts, termine.ts
│  ├─ export/                ics.ts
│  ├─ plattform/             browser.ts, desktop.ts, index.ts, typen.ts (aus dem Prozesslotsen)
│  ├─ ui/                    Schritte, Pflichtkarte, Terminliste, RegelAnsicht (lazy), Druck
│  ├─ zustand.ts, main.tsx, App.tsx, styles.css
├─ e2e/                      Playwright-Tests
├─ scripts/                  regeln-stand.mjs, katalog-doku.mjs; desktop-test.mjs (Phase 6, aus dem Prozesslotsen)
├─ .github/workflows/ci.yml  Lint, Test, Build, E2E (wie Prozesslotse)
├─ CLAUDE.md, README.md, package.json, vite.config.ts, playwright.config.ts, tsconfig*.json, .oxlintrc.json
├─ .gitattributes            `* text=auto eol=lf` wie Prozesslotse (sonst ändert ein Windows-Checkout den Hash, V12)
```

Die DMN-Datei kommt per `import xml from '../../regeln/pflichten.dmn?raw'` in App und Tests.

### 7.4 Speicherung und Dateiformat

- **Browser:** `localStorage` mit `pflichtenkompass:projekt` und `pflichtenkompass:einstellungen`. Speichern 500 ms nach der letzten Eingabe; jeder Zugriff in `try/catch` (privater Modus).
- **Datei:** `<Vorhaben>.pflichtenkompass`, JSON in UTF-8, 2 Leerzeichen eingerückt, höchstens 1 MB. MIME-Typ `application/vnd.pflichtenkompass+json`.
- **Laden** prüft die Struktur wie `speicher.ts` im Prozesslotsen: `app`, `formatVersion`, Typen, Aufzählungswerte, Datumsformat, Zahlenbereiche. Unbekannte Felder werden ignoriert, falsche Werte mit Feldnamen abgelehnt.
- **Speichern** setzt `gespeichert` (Katalogversion, Datum, Pflicht-IDs mit Stand). Beim Öffnen vergleicht die App diese Liste mit dem neuen Ergebnis und zeigt neue, entfallene und geänderte Pflichten.

### 7.5 Export

**Kalender (ICS)** nach RFC 5545 (Q17), eigener Code in `export/ics.ts`:

```text
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//olbricht-digital//Pflichten-Kompass 0.1//DE
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:<pflichtId>-<zeitraumschlüssel oder datum>-<profilschlüssel>@pflichtenkompass
DTSTAMP:<Exportzeit UTC, JJJJMMTTThhmmssZ>
DTSTART;VALUE=DATE:<faelligAm JJJJMMTT>
DTEND;VALUE=DATE:<faelligAm + 1 Tag>
SUMMARY:[<Vorhaben>] <Titel> – <Zeitraum>     (Vorhaben und Zeitraum nur, wenn vorhanden)
DESCRIPTION:<kurz>\nZuständig: …\nRechtsgrundlage: …\nQuelle: <url>\nStand: … (Katalog …)\n<gesetzlich bis …>\nKeine Rechts- oder Steuerberatung.
CATEGORIES:Pflichten-Kompass
TRANSP:TRANSPARENT
BEGIN:VALARM            (nur bei erinnerungTage > 0)
ACTION:DISPLAY
DESCRIPTION:<Titel>
TRIGGER:-P<n>D
END:VALARM
END:VEVENT
END:VCALENDAR
```

- Zeilenende CRLF. Zeilen über 75 Oktette (UTF-8-Bytes) werden mit CRLF und einem Leerzeichen gefaltet, nie mitten in einem Mehrbyte-Zeichen.
- TEXT-Werte escapen: `\` → `\\`, `;` → `\;`, `,` → `\,`, Zeilenumbruch → `\n`; CR entfernen.
- `profilschlüssel` = erste 8 Hex-Zeichen von SHA-256 über `name|start|rechtsform`. Gleiche Termine bekommen bei erneutem Export dieselbe UID; wie Kalender-Apps einen erneuten Import behandeln, wird manuell geprüft.
- Dateiname `pflichten-<slug>-<JJJJ-MM-TT>.ics`, MIME-Typ `text/calendar; charset=utf-8`.
- Manche Kalender übernehmen VALARM beim Import nicht oder setzen eigene Standarderinnerungen. Schritt 3.4 prüft das in Outlook und Google Kalender; das Ergebnis steht im Exportdialog und im README.

**Druck und PDF:** eigene Druck-CSS (5.6), Auslösen mit `window.print()`. PDF über „Als PDF speichern“ im Druckdialog; im Windows-Programm direkt über WebView2 `PrintToPdf` wie im Prototyp des Prozesslotsen.

### 7.6 Windows-Programm mit Tauri 2 (Phase 6)

Vorlage ist `docs/windows-prototyp` des Prozesslotsen (gemessen: Installer 2,1 MB, bedienbar nach 0,65 s).

- `src-tauri` übernehmen; `identifier` `de.olbricht-digital.pflichtenkompass`, `productName` „Pflichten-Kompass“, `mainBinaryName` `pflichtenkompass`.
- NSIS-Installer pro Benutzer (`installMode: currentUser`), Sprache Deutsch, ohne Admin-Rechte. WebView2 per Bootstrapper.
- Dateizuordnung nur für `.pflichtenkompass` (Rolle Editor). Keine Zuordnung für `.ics` oder `.dmn`.
- Rust-Befehle wie im Prototyp: `start_datei`, `oeffnen`, `speichern`, `speichern_unter` (Filter „Pflichten-Kompass-Projekt“ und „Kalender (*.ics)“), `als_pdf`. Dateizugriff nur auf vom Benutzer gewählte Pfade; atomares Speichern über eine Hilfsdatei.
- Opener-Plugin (`tauri-plugin-opener` 2, JS 2.7.3) nur für `https://www.gesetze-im-internet.de/*`, `https://www.omg.org/*`, `https://www.rfc-editor.org/*`.
- CSP aus `src-tauri/tauri.conf.json` des Prozesslotsen übernehmen. Sie enthält schon `style-src 'self' 'unsafe-inline'`, `img-src 'self' data: blob:` (bpmn.io-Logo), `font-src 'self' data:` (Symbolschrift) und `connect-src ipc: http://ipc.localhost`. `freezePrototype` bleibt aus. Mit dmn-js testen.
- Capabilities minimal: `core:default`, `core:window:allow-set-title`, `core:window:allow-destroy`, je eigener Befehl `allow-<befehl>` und Opener (`opener:allow-open-url`) mit obiger Liste. Die Befehle stehen wie im Prozesslotsen im App-Manifest in `build.rs`; ohne die `allow-…`-Rechte sind sie gesperrt.
- Plattformschicht `src/plattform/` aus dem Prozesslotsen; Tauri-Bibliotheken nur per dynamischem Import.
- Voraussetzungen auf Robins Rechner: Rust pro Benutzer, VS Build Tools 2022 und Windows SDK (vorhanden). Kein Codesigning (Risiko R11).
- Den Installer nie auf Robins Rechner ausführen (Regel aus der CLAUDE.md des Prozesslotsen). Installertest nur in der CI mit `src-tauri/windows/installer-test.ps1`; lokal testet `npm run desktop:test` das Programm ohne Installation.

---

## 8. Sicherheit und Datenschutz

- **Keine Daten außer Haus:** kein Server, keine Telemetrie, keine Konten, keine externen Schriften oder CDNs. Alle Bibliotheken liegen im Bundle.
- **Profil-Daten:** Bei Einzelunternehmen und GbR sind Umsatz, Gewinn, Name des Vorhabens und Notizen personenbezogene Daten. Sie bleiben lokal im Browser-Speicher oder in der Datei; die App überträgt nichts.
- **Lokale Daten löschen:** Die Startseite bietet „Lokale Daten löschen“; das entfernt beide `localStorage`-Schlüssel. Wichtig für Beratungsrechner, an denen mehrere Gründer sitzen.
- **CSP** im Produktions-Build der Web-App als Meta-Tag, eingefügt von einem kleinen Vite-Plugin mit `apply: 'build'`. Im Dev-Server entfällt sie, weil sie dort HMR stört. Wert: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'`. Ohne `font-src … data:` fehlen die Symbole von dmn-js. Die E2E-Tests laufen wie beim Prozesslotsen gegen `vite preview` und prüfen die CSP so mit (E6).
- **Kein `dangerouslySetInnerHTML`** für Nutzertexte. Hilfetexte und Katalog sind statische Daten im Code.
- **Dateiimport:** Größenlimit 1 MB, Strukturprüfung, keine Auswertung von Code. Fremde DMN-Dateien werden in 0.1 nicht geladen.
- **ICS-Injektion:** Nutzertext in SUMMARY und DESCRIPTION wird escaped; Zeilenumbrüche können keine neuen Eigenschaften erzeugen (Test IC4).
- **XML:** Nur die mitgelieferte DMN-Datei wird gelesen; ihren Hash prüft die CI (V12).
- **Links:** nur aus dem Katalog; `rel="noopener noreferrer"`; im Windows-Programm Opener mit Erlaubnisliste.
- **Tauri:** Dateizugriff nur über Befehle und nur für Pfade, die der Benutzer gewählt hat.
- **Lizenzen:** bpmn.io-Wasserzeichen in der Regelansicht sichtbar (Test E6); Lizenzhinweise im „Über“-Dialog.
- **Lieferkette:** `npm ci` mit Lockfile; Updates bewusst und mit vollem Testlauf.
- **Rechtliches:** Hinweistext (5.7) an allen Ausgaben. Vor einer Veröffentlichung klärt Robin Rechtsdienstleistungsgesetz und Steuerberatungsgesetz (O10). Ein Haftungsausschluss allein schützt nicht; Stand je Pflicht, Quellen und Pflege sind die eigentliche Gegenmaßnahme.
- **Urheberrecht:** Gesetze und Verordnungen sind nach § 5 Abs. 1 UrhG gemeinfrei. Der Katalog nutzt trotzdem nur Fundstellen und eigene Kurzfassungen. Aus der DMN-Spezifikation der OMG wird nichts kopiert; gesetze-im-internet.de wird nur verlinkt.

---

## 9. Tests

Unit-Tests mit Vitest unter `src/**/*.test.ts`, Browsertests mit Playwright unter `e2e/`. Alle Zahlen und Daten unten sind die erwarteten Ergebnisse.

### 9.1 FEEL-Teilmenge (`regeln/feel.test.ts`)

| Nr. | Eintrag | Typ | Wert | Erwartet |
| --- | --- | --- | --- | --- |
| FE1 | `-` | string | `"gbr"` | wahr |
| FE2 | `-` | number | `0` | wahr |
| FE3 | `"gmbh"` | string | `"gmbh"` | wahr |
| FE4 | `"ug","gmbh"` | string | `"ug"` | wahr |
| FE5 | `"ug","gmbh"` | string | `"gbr"` | falsch |
| FE6 | `not("ug","gmbh")` | string | `"gbr"` | wahr |
| FE7 | `not("ug","gmbh")` | string | `"ug"` | falsch |
| FE8 | `true` | boolean | `true` | wahr |
| FE9 | `true` | boolean | `false` | falsch |
| FE10 | `> 0` | number | `0` | falsch |
| FE11 | `> 0` | number | `1` | wahr |
| FE12 | `>= 800000` | number | `800000` | wahr |
| FE13 | `<= 25000` | number | `25000.01` | falsch |
| FE14 | `[1..5]` | number | `5` | wahr |
| FE15 | `[1..5)` | number | `5` | falsch |
| FE16 | `]1..5]` | number | `1` | falsch |
| FE17 | `< 10, > 100` | number | `50` | falsch |
| FE18 | ` "ug" , "gmbh" ` | string | `"gmbh"` | wahr |
| FE19 | `not(-)` | – | – | Ladefehler |
| FE20 | `date("2027-01-01")` | – | – | Ladefehler „nicht unterstützt“ |
| FE21 | `Merkmale.x > 3` | – | – | Ladefehler |
| FE22 | `"a\"b"` | – | – | Ladefehler (Escape) |
| FE23 | `> "a"` | – | – | Ladefehler (Vergleich nur mit Zahlen) |
| FE24 | `[5..1]` | – | – | Ladefehler (leeres Intervall) |
| FE25 | leerer Eintrag | – | – | Ladefehler |
| FE26 | `"gmbh"` mit Wert `null` | string | `null` | wirft (Programmfehler) |

**Differenztest:** Er läuft über jeden Eintrag der DMN-Datei. Testwerte sind alle erlaubten Strings, `true`, `false` und die Zahlen −1, 0, 1, 2.000, 9.000, 9.000,01, 25.000, 25.000,01, 100.000, 800.000, 800.000,01. Erwartet: eigene Auswertung = `unaryTest(eintrag, { '?': wert }).value` von feelin 8.2.0.

### 9.2 Regelwerk-Prüfung (`regeln/pruefung.test.ts`)

Kleine DMN-Texte im Test, jeweils aus der echten Datei abgeleitet:

| Nr. | Änderung | Erwartet |
| --- | --- | --- |
| RV1 | `hitPolicy="UNIQUE"` | V2 |
| RV2 | `aggregation="SUM"` | V2 |
| RV3 | Eingabeausdruck `Merkmale.umsatz` | V5 |
| RV4 | Eintrag `"gmhb"` | V6 (nicht in den erlaubten Werten) |
| RV5 | Eintrag `> "a"` | V6 |
| RV6 | Ausgabe `"gibtsnicht"` | V4 |
| RV7 | Regel ohne Annotationstext | V7 |
| RV8 | Namensraum von DMN 1.2 | V1 |
| RV9 | Regel GR01 gelöscht | V9 (gewerbeanzeige unerreichbar) |
| RV10 | echte Datei | keine Fehler |

### 9.3 Beispielprofile A–F (Golden Tests, `regeln/auswertung.test.ts`)

Die Beispiele liegen in `modell/beispiele.ts` und sind in der App ladbar. Nicht genannte Felder haben den Standard aus 5.2.

| Feld | A Kaffeeversand | B Übersetzungsbüro | C Elektro GmbH | D Café | E Shop UG | F Großhandel |
| --- | --- | --- | --- | --- | --- | --- |
| F02 Start | 2027-01-15 | 2026-12-01 | 2027-04-01 | 2027-03-01 | 2026-12-15 | 2027-02-01 |
| F03 Land | NW | HE | BY | SN | BE | HH |
| F04 Rechtsform | Einzel | Einzel | GmbH | GbR | UG | Einzel |
| F05 eingetragen | – | – | – | nein | – | – |
| F06 Tätigkeit | gewerblich | freiberuflich | gewerblich | gewerblich | gewerblich | gewerblich |
| F07 kaufmännisch | nein | – | – | nein | – | ja |
| F08 Beratung | nein | nein | ja | nein | ja | ja |
| F09 Bereiche | Onlinehandel | Dienstleistung | Handwerk | Gastronomie | Onlinehandel | Handel |
| F10 Handwerk | – | – | zulassungspflichtig | – | – | – |
| F11 Lebensmittel | nein | nein | nein | ja | nein | nein |
| F12–F17 Personal | nein | nein | ab 2027-04-01: 2 SV, 1 Minijob, Pauschsteuer ja, Sofortmeldung ja | ab 2027-03-01: 0 SV, 3 Minijobs, Pauschsteuer ja, Sofortmeldung ja | nein | ab 2027-02-01: 1 SV, 0 Minijobs, Sofortmeldung nein |
| F18 Lohnsteuer/Monat | – | – | 450 € | – | – | 350 € |
| F19 Kunden | Privat DE, Privat EU | Unternehmen DE, Unternehmen EU | Privat DE, Unternehmen DE | Privat DE | Privat DE, Unternehmen EU | Privat DE, Unternehmen DE |
| F20 Website | ja | ja | ja | ja | ja | nein |
| F21 Verpackungen | ja | nein | nein | nein | ja | nein |
| F22/F23 Kasse | keine | keine | keine | elektronisch, 2027-02-15 | keine | elektronisch, 2027-01-20 |
| F24 Bargeld | nein | nein | nein | ja | nein | ja |
| F25/F26 Umsatz/Gewinn | 60.000/15.000 | 18.000/12.000 | 400.000/40.000 | 120.000/30.000 | 5.000/0 | 900.000/90.000 |
| F27 Kleinunternehmer | nein | ja | nein | nein | nein | nein |
| F29 USt 2026 | – | – | – | – | 400 | – |
| F30 EU-Fernverkäufe | 4.000 | – | – | – | – | – |
| F31 Dauerfrist | nein | – | ja | nein | nein | ja |
| F32 Vorauszahlungen | nein | nein | – | nein | – | ja |

Erwartete Pflichten (Katalognummern aus 6.6, Reihenfolge nach Nummer):

| Beispiel | Anzahl | Pflichten |
| --- | --- | --- |
| A | 13 | 1, 2, 8, 17, 18, 21, 24, 25, 28, 29, 38, 39, 40 |
| B | 9 | 2, 8, 19, 20, 21, 25, 28, 29, 38 |
| C | 25 | 1, 2, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 20, 21, 22, 27, 29, 30, 34, 35, 37, 38 |
| D | 20 | 1, 2, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 21, 25, 26, 28, 29, 32, 33, 38 |
| E | 20 | 1, 2, 4, 5, 8, 17, 18, 20, 21, 23, 27, 29, 30, 34, 35, 36, 37, 38, 39, 40 |
| F | 22 | 1, 2, 3, 8, 9, 10, 12, 13, 14, 17, 18, 20, 21, 22, 25, 27, 28, 29, 30, 32, 33, 37 |

Erwartete Lücken (Nummern aus 6.7):

| Beispiel | Anzahl | Lücken |
| --- | --- | --- |
| A | 7 | 1, 5, 6, 8, 9, 10, 11 |
| B | 4 | 6, 9, 10, 12 |
| C | 8 | 1, 2, 6, 7, 8, 9, 10, 17 |
| D | 8 | 1, 3, 4, 6, 7, 8, 9, 10 |
| E | 9 | 1, 2, 5, 6, 8, 9, 10, 11, 17 |
| F | 6 | 1, 6, 7, 8, 10, 11 |

Zusätzlich: Bei D hat `sofortmeldung` genau einen Treffer (PE03) mit den Bedingungen „Beschäftigte: 3“ und „Bereich mit Sofortmeldepflicht: ja“. `rechnungen` hat bei C zwei Treffer (ST04, ST16), bei B einen (ST04; ST05 greift nur ohne Kleinunternehmerregelung) und bei E einen (ST05). ST05 und ST16 ändern keine Pflichtenzahl; LU20 bringt Lücke 17 zu C und E (alles nachgerechnet am 11.11.2026).

### 9.4 Gezielte Regeltests

| Nr. | Ausgang | Änderung | Erwartet |
| --- | --- | --- | --- |
| RT1 | F | F07 = nein, F25 = 850.000 | ohne 3, 27, 30, 37; mit 31 |
| RT2 | F | F25 = 700.000, F26 = 70.000 | `hgbBefreit` = true: ohne 27, 30; 3 und 37 bleiben |
| RT3 | D | F05 = ja | zusätzlich 5 (Regel GR06) |
| RT4 | D | F07 = ja | zusätzlich 3, 5, 27 (ST14), 30 (BU03), 37 |
| RT5 | D | F16 = nein | zusätzlich 14 |
| RT6 | C | F10 = zulassungsfrei | statt 6 nun 7; bei F10 = unklar weder 6 noch 7, Lücke 15 |
| RT7 | B | F27 = nein | ohne 19; mit 17, 18, 22, 23; Lücke 12 entfällt |
| RT8 | E | F06 = freiberuflich | ohne 1; Lücke 13 kommt hinzu; Lücken 1 und 8 entfallen |
| RT9 | A | F07 = unklar | Lücke 14 kommt hinzu; Pflichten unverändert |
| RT10 | B | F25 = 30.000 | Lücke 16 kommt hinzu |
| RT11 | B | F25 = 100.000,01 | Warnung „nicht anwendbar“; Pflichten wie RT7; Lücken 12 und 16 nicht dabei |

### 9.5 Merkmale (`modell/merkmale.test.ts`)

| Nr. | Eingabe | Erwartet |
| --- | --- | --- |
| MM1 | GmbH, F07 = nein | `kaufmann` = true |
| MM2 | Einzel, freiberuflich, F07 = ja (ausgeblendet) | `kaufmann` = false, `kaufmaennisch` = "nein" |
| MM3 | GbR, gewerblich, F07 = ja | `kaufmann` = true, `personengesellschaftEingetragen` = true |
| MM4 | F12 = nein, F14 = 3 | `beschaeftigte` = 0 |
| MM5 | F15 = 2, F16 = ja, F14 = 0 | `lohnsteuerabzug` = false; mit F16 = nein true |
| MM6 | F27 = ja, F25 = 100.000,01 | `kleinunternehmer` = false |
| MM7 | Einzelkaufmann, F25 = 800.000, F26 = 80.000 | `hgbBefreit` = true; F25 = 800.000,01 → false |
| MM8 | freiberuflich, F25 = 900.000 | `ao141Grenze` = false |

### 9.6 Kalender und Fristen (`fristen/*.test.ts`)

| Nr. | Fall | Land | Erwartet |
| --- | --- | --- | --- |
| DA1 | 2027-01-15 + 1 Monat | NW | 2027-02-15 (Mo) |
| DA2 | 2026-12-03 + 1 Monat | NW | roh 2027-01-03 (So) → 2027-01-04 (Mo) |
| DA3 | 2026-09-03 + 1 Monat | BY | roh 2026-10-03 (Sa, Feiertag) → 2026-10-05 (Mo) |
| DA4 | 2027-01-31 + 1 Monat | NW | roh 2027-02-28 (So) → 2027-03-01 (Mo) |
| DA5 | 2028-01-31 + 1 Monat | NW | 2028-02-29 (Di) |
| DA6 | 2026-10-18 + 1 Monat | SN / NW | SN: 2026-11-18 Buß- und Bettag → 2026-11-19 (Do); NW: 2026-11-18 (Mi) |
| DA7 | 2028-07-15 + 1 Monat | SL / BY | SL: 2028-08-15 Mariä Himmelfahrt → 2028-08-16 (Mi); BY: 2028-08-15 (konservativ) |
| DA8 | 2027-04-01 + 1 Monat | BY | roh 2027-05-01 (Sa, Feiertag) → 2027-05-03 (Mo) |
| DA9 | 2027-01-15 + 7 Tage, ohne Verschiebung | NW | 2027-01-22 (Fr) |
| DA10 | minus 3 Monate | – | 2027-05-31 → 2027-02-28; 2027-01-15 → 2026-10-15 |
| BA1 | SV-Fälligkeit Dezember 2026 | NW | Fälligkeit 2026-12-28 (Mo), Nachweis 2026-12-22 (Di), Termin 2026-12-21 (Mo) |
| BA2 | Januar 2027 | NW | 2027-01-27 (Mi), Nachweis 2027-01-25 (Mo), Termin 2027-01-22 (Fr) |
| BA3 | März 2027 (Karfreitag 26.03., Ostermontag 29.03.) | SN | 2027-03-25 (Do), Nachweis 2027-03-23 (Di), Termin 2027-03-22 (Mo) |
| BA4 | April 2027 | BY | 2027-04-28 (Mi), Nachweis 2027-04-26 (Mo), Termin 2027-04-23 (Fr) |
| BA5 | Mai 2027 (Fronleichnam 27.05.) | NW | 2027-05-26 (Mi), Nachweis 2027-05-24 (Mo), Termin 2027-05-21 (Fr) |
| BA6 | Dezember 2027 | SN | 2027-12-28 (Di), Nachweis 2027-12-23 (Do), Termin 2027-12-22 (Mi) |
| BA7 | Mai 2027, Fronleichnam regional | SN | wie BA5: 2027-05-26 (Mi), Nachweis 2027-05-24 (Mo), Termin 2027-05-21 (Fr); ohne die Ergänzung aus 6.8.1 käme 2027-05-27 heraus |

### 9.7 Berechnungen (`fristen/berechnungen.test.ts`)

| Nr. | Fall | Erwartet |
| --- | --- | --- |
| US1 | Start 2026-03-01, Jahr 2026, F29 = 12.000 | monat |
| US2 | dto., F29 = 9.000 | quartal |
| US3 | dto., F29 = 1.500 | quartal + Hinweis Befreiung |
| US4 | dto., F29 leer | monat |
| US5 | Start 2026-03-01, Jahr 2027 | monat + Prüfhinweis O4 |
| US6 | Start 2027-01-15, Jahre 2027 und 2028 | monat |
| US7 | Start 2027-01-15, Jahr 2029 | monat + Hinweis „Vorjahreswert fehlt“ |
| US8 | Kleinunternehmer | keine |
| US9 | Fälligkeit Januar 2027 | ohne F31 2027-02-10; mit F31 2027-03-10 |
| LS1 | Basis 5.000,00 | quartal |
| LS2 | Basis 5.000,01 | monat |
| LS3 | Basis 1.080,00 | jahr |
| LS4 | Basis 1.080,01 | quartal |
| LS5 | F18 = 450 (Basis 5.400) | monat |
| LS6 | F18 = 400 (Basis 4.800) | quartal |
| LS7 | F18 leer | monat |
| ER1 | Start 2026-06-01, F28 = 800.000 | 2028-01-01 |
| ER2 | dto., F28 = 800.000,01 | 2027-01-01 |
| ER3 | dto., F28 leer | 2027-01-01 |
| ER4 | Start 2027-01-15 | 2028-01-01 |
| ER5 | Start 2028-05-01 | 2028-05-01 |
| AU1 | Buchungsbeleg 2026 | 31.12.2034 |
| AU2 | Jahresabschluss 2026, aufgestellt 2027 | 31.12.2037 |
| AU3 | empfangener Geschäftsbrief 2026 | 31.12.2032 |
| AU4 | Rechnung 2026 | 31.12.2034 |
| KU1 | Gründungsjahr, laufend 20.000 | moeglich |
| KU2 | Gründungsjahr, laufend 30.000 | pruefen |
| KU3 | Folgejahr, Vorjahr 25.000, laufend 90.000 | moeglich |
| KU4 | Folgejahr, Vorjahr 25.000,01 | nichtMoeglich |
| KU5 | Vorjahr 20.000, laufend 100.000,01 | nichtMoeglich |
| GG1 | Mindestlohn 12,00 € (Wert aus § 1 Abs. 2 MiLoG) | 520 € |
| GG2 | Rechenbeispiel 12,82 € | 556 € |
| GG3 | Rechenbeispiel 13,90 € | 603 € |

### 9.8 Termine (`fristen/termine.test.ts`)

Beispiel A, Horizont 2027-01-01 bis 2028-12-31, `heute` = 2026-11-11:

| Nr. | Erwartet |
| --- | --- |
| TE1 | 31 Termine insgesamt |
| TE2 | gewerbeanzeige 2027-01-15; berufsgenossenschaft 2027-01-22; steuerlicheErfassung 2027-02-15; impressum und verpackung 2027-01-15 |
| TE3 | ustVoranmeldung: 23 Termine (Januar 2027 bis November 2028), erster 2027-02-10; März 2027: `faelligAm` 2027-04-10, `gesetzlichBis` 2027-04-12; genau 6 Termine mit `gesetzlichBis` |
| TE4 | ustJahreserklaerung und einkommensteuererklaerung 2027: 2028-07-31; verpackungDatenmeldung 2027: 2028-06-01; keine Termine für estVorauszahlungen und euFernverkauf |

Beispiel C, Horizont 2027-04-01 bis 2029-03-31:

| Nr. | Erwartet |
| --- | --- |
| TE5 | steuerlicheErfassung 2027-05-03 (1. Mai ist Samstag und Feiertag) |
| TE6 | lohnsteuer monatlich, erster Termin 2027-05-10; Lohnsteuerbescheinigung 2027: 2028-02-29 |
| TE7 | ustVoranmeldung April 2027 mit Dauerfrist: 2027-06-10; Sondervorauszahlung 2027: 2027-05-10; 2028: 2028-02-10; 2029: `faelligAm` 2029-02-10, `gesetzlichBis` 2029-02-12 |
| TE8 | beitragsnachweis April 2027: `faelligAm` 2027-04-23, `gesetzlichBis` 2027-04-26, Hinweis nennt Nachweistag 26.04.2027 und Fälligkeit 28.04.2027 |
| TE9 | jahresabschluss 2027: 2028-03-31; 2028: 2029-03-31; offenlegung 2027: 2028-12-31 |
| TE10 | ustJahreserklaerung und eBilanz 2027 (mit Beratung): 2029-02-28 |
| TE11 | eRechnungAusstellen: Termin „ab“ 2028-01-01 |

Beispiel D, Horizont 2027-03-01 bis 2029-02-28:

| Nr. | Erwartet |
| --- | --- |
| TE12 | elektronischeKasse: Mitteilung bis 2027-03-15 (Mo); infektionsschutz: Bescheinigung 2027-03-01 mit Hinweis „frühestens ausgestellt am 01.12.2026“, Belehrung 2027-03-01 (nächste 2029-03-01 liegt außerhalb) |

### 9.9 ICS-Export (`export/ics.test.ts`)

| Nr. | Prüfung | Erwartet |
| --- | --- | --- |
| IC1 | Grundgerüst | beginnt mit `BEGIN:VCALENDAR`, enthält `VERSION:2.0` und `PRODID`, endet mit `END:VCALENDAR`; jede Zeile endet mit CRLF |
| IC2 | VEVENT | je Termin genau ein VEVENT mit UID, DTSTAMP (endet auf `Z`), `DTSTART;VALUE=DATE`, `DTEND;VALUE=DATE` = Folgetag, SUMMARY, DESCRIPTION |
| IC3 | Faltung | keine Zeile über 75 Oktette; Umlaute nie getrennt; Entfalten ergibt den Originaltext |
| IC4 | Escaping | Vorhaben `Müller, Söhne; Co` mit Zeilenumbruch und `KG` erscheint als `Müller\, Söhne\; Co\nKG`; keine zusätzliche Eigenschaft entsteht |
| IC5 | UID | zweimal exportiert: gleiche UIDs; anderes Profil: andere UIDs |
| IC6 | Erinnerung | 7 Tage: VALARM mit `ACTION:DISPLAY`, DESCRIPTION, `TRIGGER:-P7D`; 0 Tage: kein VALARM |
| IC7 | gesetzlich bis | DESCRIPTION nennt beide Daten |
| IC8 | Beispiel A | 31 VEVENT |

### 9.10 Speichern und Katalog

| Nr. | Prüfung | Erwartet |
| --- | --- | --- |
| SP1 | Projekt → JSON → Projekt | gleich |
| SP2 | `formatVersion` 2 | Formatfehler mit Meldung |
| SP3 | Prozesslotse-Datei | Formatfehler „keine Pflichten-Kompass-Datei“ |
| SP4 | `rechtsform` = "ag" | Formatfehler mit Feldname |
| SP5 | Datei über 1 MB | abgelehnt |
| SP6 | gespeichert mit Liste ohne `verpackung` | nach Öffnen Hinweis „neu: verpackung“ |
| KA1 | Katalog | 40 Pflichten, IDs eindeutig, je mindestens eine Norm und eine Quelle aus Q1–Q15 |
| KA2 | Normlinks | folgen dem Muster aus 3.3 und nutzen nur bekannte Kürzel |
| KA3 | Daten | `stand` ≤ 2026-11-11; `gueltigAb` ≤ `gueltigBis` |
| KA4 | Regeln ↔ Katalog | V4 und V9 erfüllt |
| KA5 | Lücken | 17 Einträge, alle erreichbar (V10) |
| KA6 | `regeln/stand.json` | Hash passt (V12); nach geänderter DMN-Datei ohne Versionswechsel rot |

### 9.11 Browsertests (`e2e/`)

| Nr. | Ablauf | Erwartet |
| --- | --- | --- |
| E1 | Beispiel A von Hand über den Assistenten eingeben, nur Tastatur | 13 Pflichten, 7 Lücken; „Warum?“ bei Impressum nennt „Online-Auftritt: ja“ |
| E2 | Beispiele A–F laden | Anzahlen 13, 9, 25, 20, 20, 22 |
| E3 | Kalender für A exportieren | Download `.ics` mit 31 `BEGIN:VEVENT` |
| E4 | Druckansicht (`emulateMedia print`) | Hinweistext sichtbar, alle Pflichten da, heller Hintergrund |
| E5 | Datei speichern, App neu laden, Datei öffnen | gleiches Profil, Status bleibt |
| E6 | Regelansicht öffnen | DRD mit 7 Entscheidungen; Tabelle „Steuern“ markiert Treffer; bpmn.io-Wasserzeichen sichtbar; keine CSP-Meldung in der Konsole |
| E7 | axe in allen Schritten, hell und dunkel | keine schweren oder kritischen Befunde; jedes Eingabefeld beschriftet |

### 9.12 Testdaten: Herkunft und Lizenz

- **Beispielprofile A–F:** für diese Spezifikation erfunden; Lizenz wie das Projekt. Keine echten Personen oder Firmen.
- **Erwartete Pflichten und Lücken:** von Hand aus den Regeln in 6.5 abgeleitet.
- **Kalenderwerte:** mit eigener Hilfsrechnung (Osterdatum nach dem gregorianischen Algorithmus, Wochentage, Feiertage der betroffenen Länder) am 11.11.2026 bestimmt. Die Feiertagslisten der Länder stammen aus feiertagejs 1.5.1 (MIT) und sind nicht gegen Landesgesetze geprüft (O8).
- **Normtexte:** Der Katalog enthält nur Fundstellen und eigene Kurzfassungen, keine Gesetzestexte.
- **FEEL-Orakel:** feelin 8.2.0 (MIT), nur Entwicklungsabhängigkeit.

---

## 10. Risiken und offene Fragen

### 10.1 Risiken

| Nr. | Risiko | Gegenmaßnahme |
| --- | --- | --- |
| R1 | Rechtsänderungen nach dem 11.11.2026 machen Pflichten falsch (Beispiel VerpackDG seit 12.08.2026). | Stand je Pflicht; Quellen sichtbar; Quartalsprüfung (Schritt 7.5); Hash-Test zwingt zum Versionswechsel. |
| R2 | Nutzer halten die Liste für vollständig. | Lückenkasten oben im Ergebnis, Hinweistext überall, Lücken auch im Druck. |
| R3 | Haftung, Rechtsdienstleistungs- und Steuerberatungsgesetz bei Veröffentlichung. | Hinweistext; keine Einzelfallprüfung durch Menschen; rechtliche Prüfung vor dem Store (O10). |
| R4 | Selbsteinschätzung ist schwer (Kaufmann, Handwerksanlage, freier Beruf). | Option „unklar“ mit Prüfhinweis; Hilfetexte mit Normen. |
| R5 | Auslegung von § 18 Abs. 2 UStG ab 2027 nach dem Wortlaut. | Prüfhinweis an der Pflicht; O4 vor Version 0.1 klären. |
| R6 | Feiertagsdaten der Bibliothek fehlerhaft oder regional ungenau. | konservative Nutzung (6.8.1), Tests DA/BA. |
| R7 | Eigene FEEL-Auswertung weicht vom Standard ab. | kleine Teilmenge, Ladefehler für alles andere, Differenztests mit feelin. |
| R8 | dmn-js vergrößert das Bundle; Lizenz verlangt Wasserzeichen. | lazy laden; Test E6 prüft das Wasserzeichen. |
| R9 | Zeitzonenfehler bei Datumsrechnung. | nur ISO-Datumsstrings, UTC-Mittag, Tests um die Zeitumstellung. |
| R10 | Katalogpflege kostet mehr als die Entwicklung. | Katalog klein halten, Lücken offen benennen, Pflege als eigene Phase. |
| R11 | Unsignierter Installer löst SmartScreen-Warnung aus. | wie beim Prozesslotsen hinnehmen; Signatur erst bei Veröffentlichung. |
| R12 | Kalender übernehmen die Erinnerung (VALARM) beim Import nicht. | Prüfung in Schritt 3.4; Hinweis im Exportdialog und im README. |
| R13 | Ein Windows-Checkout mit CRLF ändert den Hash der DMN-Datei. | `.gitattributes` mit `eol=lf`; Hash über LF-Text; V12 nur in Tests und CI, nie beim Start der App. |
| R14 | Übergangsregeln laufen aus (E-Rechnung bis 2027, VerpackDG-Übergang bis 31.12.2026, § 18 Abs. 2 Satz 6 UStG bis 2026). | `gueltigBis` und Termine pflegen; Quartalsprüfung (Schritt 7.5). |

### 10.2 Offene Fragen für Robin

| Nr. | Frage | Vorschlag |
| --- | --- | --- |
| O1 | Mindestlohn ab 2026 und 2027 und damit die Geringfügigkeitsgrenze (Verordnung vom 5.11.2025, nicht geöffnet). | in Schritt 7.1 klären; bis dahin nur Formel zeigen |
| O2 | DEÜV-Fristen für An- und Abmeldung (nicht geöffnet). | bis dahin Beschäftigungsbeginn als Termin |
| O3 | Kleinunternehmer im Gründungsjahr: gilt 25.000 € oder 100.000 €? Ab welchem Umsatz endet die Befreiung, wenn eine Grenze überschritten wird? Der Wortlaut von § 19 Abs. 1 UStG regelt beides nicht (am 11.11.2026 geprüft). | BMF-Schreiben zu § 19 UStG oder Steuerberatung; bis dahin Lücke 16 |
| O4 | § 18 Abs. 2 Satz 6 UStG gilt laut Wortlaut vom 11.11.2026 nur für 2021 bis 2026. Wird verlängert? Gilt für Gründungen 2026 im Jahr 2027 wörtlich die Monatspflicht? | vor Version 0.1 klären |
| O5 | Gewerbe- und Körperschaftsteuer (GewStG, GewStDV, KStG) sind nicht geprüft. | in Phase 7 aufnehmen |
| O6 | Herstellerbegriff der VO (EU) 2025/40 (Art. 3 Abs. 1 Nr. 15): Wer registriert Versandverpackungen? Gilt das auch für To-go-Becher und andere Serviceverpackungen in der Gastronomie? | EUR-Lex öffnen, dann Frage F21 und ihre Hilfe schärfen |
| O7 | Gastronomie-Landesrecht und Lebensmittelregistrierung: alle 16 Länder abbilden oder dauerhaft Lücke? | Lücke lassen bis zum Bedarf |
| O8 | Landesfeiertage nicht gegen Gesetze geprüft; feiertagejs zählt Mariä Himmelfahrt für ganz Bayern. Reicht die konservative Behandlung? | ja, mit Testliste aus amtlicher Quelle in Phase 7 |
| O9 | BGB §§ 187–193 nicht geöffnet: Monatsfristen und Verschiebung von Zahlungsterminen. Gilt „Nachweis zu Beginn des Nachweistags“ (Praxis der Einzugsstellen) verbindlich? Zählen 24.12. und 31.12. als Bankarbeitstage? | in Schritt 7.1 klären; bis dahin Termin einen Arbeitstag vor dem Nachweistag und 24.12./31.12. als frei |
| O10 | Darf die App öffentlich oder im Store erscheinen (Rechtsdienstleistungsgesetz, Steuerberatungsgesetz, Haftung)? Anhaltspunkt: BGH, Urteil vom 09.09.2021, I ZR 113/20 (Vertragsgenerator „Smartlaw“), nicht geöffnet. | rechtliche Prüfung vor Veröffentlichung |
| O11 | § 41a Abs. 2 Satz 3 EStG: Umrechnung auf einen Jahresbetrag nach Monaten oder Tagen? | vorerst Schätzung aus F18 |
| O12 | § 17 MiLoG gilt auch für alle Beschäftigten in Bereichen nach § 2a SchwarzArbG (Liste nicht geöffnet). Aufnehmen? | in Schritt 7.1 |
| O13 | E-Bilanz bei UG/GmbH: Verweis über das KStG nicht geprüft. | mit O5 klären |
| O14 | Name „Pflichten-Kompass“, Dateiendung `.pflichtenkompass`, privates Repo, Lizenz wie beim Prozesslotsen? | Vorschlag: ja, wie beim Prozesslotsen; dort hat Robin die eigene Endung angenommen |
| O15 | Sollen Bestandsunternehmen (Start vor 2026) in 0.1 unterstützt werden? | nein; erst mit Vorjahreswerten in 0.2 |
| O16 | OSS: Verlängert sich die Frist „Ende des Folgemonats“ (§ 18j UStG), wenn sie auf ein Wochenende oder einen Feiertag fällt? | bis zur Klärung kein `gesetzlichBis` (6.8.2); in Schritt 7.1 klären |

---

## 11. Arbeitsschritte zum Abhaken

Jeder Schritt ist in einem halben bis einem Arbeitstag machbar und hat ein prüfbares Ergebnis. Vor jedem Commit: `npm run lint`, `npm test`, `npm run build`; bei Oberflächenänderungen zusätzlich `npm run e2e` (wie Prozesslotse).

### Phase 0 – Gerüst (≈ 1,5 Arbeitstage)

- [ ] **0.1** Projekt wie beim Prozesslotsen anlegen (Vite, React, TypeScript, Vitest, Playwright, oxlint, CI), privates Repo. Prüfbar: `npm run lint`, `npm test`, `npm run build` grün, lokal und in der CI.
- [ ] **0.2** Plattformschicht übernehmen; Schrittleiste mit leeren Schritten; Hell- und Dunkelmodus; Startseite mit Hinweistext. Prüfbar: axe-Test hell und dunkel ohne schwere Befunde.
- [ ] **0.3** CLAUDE.md, README-Gerüst, Lizenzhinweise (bpmn.io, MIT), docs verlinkt. Prüfbar: Dateien vorhanden, Links gültig.

### Phase 1 – Fachmodell und Katalog (≈ 3 Arbeitstage)

- [ ] **1.1** Typen aus Abschnitt 4, Standardprofil, Beispiele A–F. Prüfbar: Typprüfung ohne Fehler; Beispiele laden.
- [ ] **1.2** `merkmale.ts` nach 6.2. Prüfbar: MM1–MM8 grün.
- [ ] **1.3** Katalog mit 40 Pflichten, 17 Quellen, Normlinks; `docs/katalog.md` erzeugen. Prüfbar: KA1–KA3 grün.
- [ ] **1.4** Lückenliste (17) und Fragenkatalog F01–F32 mit Sichtbarkeit; `docs/fragenkatalog.md`. Prüfbar: Tests zur Sichtbarkeit für A–F (21 sichtbare Fragen bei A).
- [ ] **1.5** `speicher.ts` für Projektdateien. Prüfbar: SP1–SP5 grün.

### Phase 2 – DMN-Regelwerk (≈ 4 Arbeitstage)

- [ ] **2.1** FEEL-Teilmenge: Parser und Auswertung. Prüfbar: FE1–FE26 grün.
- [ ] **2.2** Differenztests gegen feelin. Prüfbar: alle Einträge mal alle Testwerte gleich.
- [ ] **2.3** `regeln/pflichten.dmn` mit 7 Tabellen (6.5) und DRD anlegen; `.gitattributes` mit `eol=lf`. Prüfbar: Datei öffnet in demo.bpmn.io mit DRD; Regelzahl je Tabelle GR 9, PE 7, BR 1, ST 16, BU 11, ON 3, LU 20 (zusammen 67).
- [ ] **2.4** DMN laden mit dmn-moddle; Prüfung V1–V11. Prüfbar: RV1–RV10 grün.
- [ ] **2.5** Auswertung (COLLECT, Begründungen, Sortierung, Gültigkeit). Prüfbar: Beispiele A–F (9.3) und RT1–RT11 grün.
- [ ] **2.6** `regeln/stand.json`, `npm run regeln:stand` und V12 als Test (Hash über LF-Text). Prüfbar: KA6 grün; nach Änderung der DMN-Datei ohne Versionswechsel rot; mit CRLF-Kopie der Datei weiter grün.

### Phase 3 – Fristen, Termine, Kalender (≈ 3,5 Arbeitstage)

- [ ] **3.1** `datum.ts` und `feiertage.ts` (sicher/möglich). Prüfbar: DA1–DA10 und BA1–BA7 grün.
- [ ] **3.2** `berechnungen.ts`. Prüfbar: US1–US9, LS1–LS7, ER1–ER5, AU1–AU4, KU1–KU5, GG1–GG3 grün.
- [ ] **3.3** `termine.ts` für alle Fristregeln. Prüfbar: TE1–TE12 grün.
- [ ] **3.4** `ics.ts`. Prüfbar: IC1–IC8 grün; Datei aus Beispiel A importiert ohne Fehler in Outlook und Google Kalender; notiert ist auch, ob die Erinnerung übernommen wird (manuell, R12).

### Phase 4 – Oberfläche (≈ 6 Arbeitstage)

- [ ] **4.1** Zustand, Autosave, Start mit Beispielen, „Datei öffnen“ und „Lokale Daten löschen“. Prüfbar: Beispiel laden, Seite neu laden, Zustand bleibt; nach „Lokale Daten löschen“ ist der Speicher leer.
- [ ] **4.2** Schritte Vorhaben und Tätigkeit (F01–F11) mit Hilfen und Sichtbarkeit. Prüfbar: Bedingungen aus 5.2 per Klick nachvollziehbar; Labels vollständig.
- [ ] **4.3** Schritte Personal, Verkauf, Umsatz und Steuern (F12–F32) mit Prüfungen aus 6.9. Prüfbar: Fehler und Warnungen erscheinen am Feld.
- [ ] **4.4** Ergebnis: Gruppen, Pflichtkarten, „Warum?“, Status, Notiz, Lücken, Neu-Markierung. Prüfbar: E2 grün.
- [ ] **4.5** Termine-Ansicht und Kalenderdialog. Prüfbar: E3 grün.
- [ ] **4.6** Druckansicht. Prüfbar: E4 grün; PDF aus Edge mit Beispiel C angesehen.
- [ ] **4.7** Regelansicht mit dmn-js (lazy), Treffer markieren, Quellenliste. Prüfbar: E6 grün; Hauptbundle ohne dmn-js.
- [ ] **4.8** Datei speichern und öffnen mit Änderungshinweis. Prüfbar: E5 und SP6 grün.

### Phase 5 – Qualität und Version 0.1 (≈ 2,5 Arbeitstage)

- [ ] **5.1** Restliche Browsertests E1 und E7. Prüfbar: alle E-Tests lokal (Edge) und in der CI (Chrome) grün.
- [ ] **5.2** Barrierefreiheit und Tastatur nacharbeiten. Prüfbar: E7 grün; Durchgang nur mit Tastatur ohne Hänger.
- [ ] **5.3** README mit Bildern, Grenzen und Rechenregeln; Version 0.1.0. Prüfbar: README beschreibt alle Funktionen aus 2.1; Zahlen durch Tests gedeckt.
- [ ] **5.4** Fachliche Abnahme mit Robin: drei echte Profile durchgehen; für O3, O4, O9 und O10 festlegen, wer klärt und was die App bis dahin anzeigt. Prüfbar: Abnahmeprotokoll in `docs/` mit Entscheidungen.

### Phase 6 – Windows-Programm mit Tauri 2 (≈ 2,5 Arbeitstage)

- [ ] **6.1** `src-tauri` aus dem Prototyp des Prozesslotsen übernehmen und anpassen (7.6). Prüfbar: `npx tauri dev` startet die App.
- [ ] **6.2** Rust-Befehle für Öffnen, Speichern, Speichern unter (auch `.ics`), PDF; Capabilities mit `allow-<befehl>`; Opener-Plugin mit Erlaubnisliste; CSP mit dmn-js. Prüfbar: alle Befehle von Hand ausgelöst, Quellenlink öffnet im Standardbrowser, Regelansicht ohne CSP-Fehler.
- [ ] **6.3** NSIS-Installer pro Benutzer ohne Admin bauen (`npm run desktop:build`), aber nicht lokal ausführen. Prüfbar: Installergröße notiert; Startzeit mit `npm run desktop:test` ohne Installation gemessen und im README notiert.
- [ ] **6.4** Rauchtest des Installers nur in der CI auf einem Windows-Runner (`installer-test.ps1` wie beim Prozesslotsen): installieren, Beispiel laden, ICS speichern, PDF erzeugen, Datei über die Dateizuordnung öffnen, deinstallieren. Prüfbar: CI-Lauf grün, Protokoll je Punkt als Artefakt.

### Phase 7 – Katalog 2027.01 (≈ 3,5 Arbeitstage, nach Version 0.1)

- [ ] **7.1** O1, O2, O9, O11, O12, O16 mit Primärquellen klären (MiLoV, DEÜV, BGB §§ 187–193, SchwarzArbG § 2a, § 18j UStG mit EU-Recht). Prüfbar: Quellen in Abschnitt 12 ergänzt; Katalog oder Lücken angepasst; Tests grün.
- [ ] **7.2** Gewerbe- und Körperschaftsteuer aufnehmen (O5, O13). Prüfbar: neue Pflichten mit Regeln und Tests; Lücken 1 und 2 entfallen.
- [ ] **7.3** Datenschutz-Grundpflichten aufnehmen. Prüfbar: Lücke 6 ersetzt durch geprüfte Pflichten.
- [ ] **7.4** Fernabsatz-Grundpflichten aufnehmen. Prüfbar: Lücke 5 ersetzt durch geprüfte Pflichten.
- [ ] **7.5** Linkprüfung und Standabgleich aller Quellen; Katalog 2027.01.0. Prüfbar: Skript meldet alle Links erreichbar; `stand.json` aktualisiert.

**Aufwand gesamt:** MVP (Phasen 0–5) etwa 20,5 Arbeitstage; mit Windows-Programm etwa 23; mit Katalog 2027.01 etwa 26,5.

---

## 12. Quellen

Nur Seiten, die für diese Spezifikation geöffnet wurden. Abruf am 11.11.2026, Q1 am 10.11.2026. Die Standzeile ist die Angabe der Datenbank beim Abruf.

| Nr. | Quelle | URL | Stand laut Seite |
| --- | --- | --- | --- |
| Q1 | Abgabenordnung (AO), Volltext | https://www.gesetze-im-internet.de/ao_1977/BJNR006130976.html | neugefasst durch Bek. v. 23.1.2025 I Nr. 24; zuletzt geändert durch Art. 6 G v. 22.10.2026 I Nr. 320 |
| Q2 | Umsatzsteuergesetz (UStG), Volltext | https://www.gesetze-im-internet.de/ustg_1980/BJNR119530979.html | zuletzt geändert durch Art. 5 G v. 29.6.2026 I Nr. 197 |
| Q3 | Umsatzsteuer-Durchführungsverordnung (UStDV), Volltext | https://www.gesetze-im-internet.de/ustdv_1980/BJNR023590979.html | zuletzt geändert durch Art. 7 V v. 19.12.2025 I Nr. 372 |
| Q4 | Einkommensteuergesetz (EStG), Volltext | https://www.gesetze-im-internet.de/estg/BJNR010050934.html | zuletzt geändert durch Art. 1 G v. 15.10.2026 I Nr. 307 |
| Q5 | Handelsgesetzbuch (HGB), Volltext | https://www.gesetze-im-internet.de/hgb/BJNR002190897.html | zuletzt geändert durch Art. 4 G v. 4.2.2026 I Nr. 33 |
| Q6 | GmbH-Gesetz (GmbHG), Volltext | https://www.gesetze-im-internet.de/gmbhg/BJNR004770892.html | zuletzt geändert durch Art. 21 G v. 23.10.2024 I Nr. 323 |
| Q7 | Gewerbeordnung (GewO), Volltext | https://www.gesetze-im-internet.de/gewo/BJNR002450869.html | zuletzt geändert durch Art. 1 G v. 20.7.2026 I Nr. 215 |
| Q8 | Handwerksordnung (HwO), Volltext | https://www.gesetze-im-internet.de/hwo/BJNR014110953.html | zuletzt geändert durch Art. 8 G v. 20.7.2026 I Nr. 215 |
| Q9 | SGB IV, Volltext | https://www.gesetze-im-internet.de/sgb_4/BJNR138450976.html | zuletzt geändert durch Art. 2 G v. 24.7.2026 I Nr. 228 |
| Q10 | SGB VII, § 192 | https://www.gesetze-im-internet.de/sgb_7/__192.html | Einzelnorm ohne Standzeile |
| Q11 | Digitale-Dienste-Gesetz (DDG), § 5 | https://www.gesetze-im-internet.de/ddg/__5.html | Einzelnorm ohne Standzeile |
| Q12 | Verpackungsrecht-Durchführungsgesetz (VerpackDG), Volltext | https://www.gesetze-im-internet.de/verpackdg/BJNR0CF0B0026.html | G v. 13.7.2026 (BGBl. 2026 I Nr. 207), in Kraft seit 12.8.2026 |
| Q13 | Mindestlohngesetz (MiLoG), Volltext | https://www.gesetze-im-internet.de/milog/BJNR134810014.html | zuletzt geändert durch Art. 8 Abs. 3 G v. 12.5.2026 I Nr. 137 |
| Q14 | Geldwäschegesetz (GwG), § 20 | https://www.gesetze-im-internet.de/gwg_2017/__20.html | Einzelnorm ohne Standzeile |
| Q15 | Infektionsschutzgesetz (IfSG), § 43 | https://www.gesetze-im-internet.de/ifsg/__43.html | Einzelnorm ohne Standzeile |
| Q16 | OMG, Decision Model and Notation 1.3 (formal/2021-01-01) | https://www.omg.org/spec/DMN/1.3/PDF | Release März 2021; genutzt: 8.2.11, 9.2–9.5 |
| Q17 | RFC 5545, iCalendar | https://www.rfc-editor.org/rfc/rfc5545.txt | September 2009 |

Nur zur Navigation abgerufen, keine Quellen: Verzeichnisseiten von gesetze-im-internet.de (`ustdv_1980`, `hwo`, `milog`, `verpackdg`, `Teilliste_V`; `verpackg/index.html` lieferte 404). Paketdaten kamen aus der npm-Registry per `npm view` und `npm pack` (LICENSE, README und Schema von dmn-js 18.0.3, dmn-moddle 12.2.1, feelin 8.2.0, feiertagejs 1.5.1).

**Bei der Prüfung am 11.11.2026 geöffnet** (Einzelnormen derselben Datenbank). Der Katalog verweist weiter auf Q1–Q15; P1–P9 belegen nur den Prüfvermerk.

| Nr. | Seite | Ergebnis |
| --- | --- | --- |
| P1 | https://www.gesetze-im-internet.de/ustg_1980/__19.html | Grenzen 25.000 € und 100.000 €, Verzicht 5 Jahre bestätigt; keine Regel fürs Gründungsjahr im Wortlaut (O3) |
| P2 | https://www.gesetze-im-internet.de/ustg_1980/__14a.html | Rechnung bis zum 15. des Folgemonats (Abs. 1, 3) → ST05 und Pflicht 20 korrigiert |
| P3 | https://www.gesetze-im-internet.de/ustg_1980/__14.html | Abs. 2 Satz 2 Nr. 1 (Unternehmen) und Nr. 3 („steuerpflichtige“ Grundstücksleistungen), Abs. 4 Nr. 9 → Regel ST16 |
| P4 | https://www.gesetze-im-internet.de/ustg_1980/__18.html | Abs. 2 Satz 6 gilt für 2021 bis 2026; 9.000 € und 2.000 € bestätigt |
| P5 | https://www.gesetze-im-internet.de/ao_1977/__149.html | Betriebseröffnung in Abs. 4 Satz 1 Nr. 2 bestätigt; Frist dann 4 Monate |
| P6 | https://www.gesetze-im-internet.de/sgb_4/__28a.html | Abs. 4: 11 Bereiche, Friseur und Kosmetik enthalten, Forstwirtschaft nicht |
| P7 | https://www.gesetze-im-internet.de/verpackdg/__68.html | Abs. 1 (31.12.2026) und Abs. 2 (12.11.2026) bestätigt; Abs. 5 ergänzt |
| P8 | https://www.gesetze-im-internet.de/verpackdg/__9.html | Datenmeldung unverzüglich; unter 10 t im Vorjahr bis 1. Juni bestätigt |
| P9 | https://www.gesetze-im-internet.de/verpackdg/__10.html | Vollständigkeitserklärung bis 15. Mai; Schwellen 80 t, 50 t, 30 t bestätigt |

---

## Prüfvermerk (2026-11-10)

Geprüft am 11.11.2026 als Fachgutachten und Entwicklerprüfung. Grundlage: 9 Einzelnormen (P1–P9), `npm view` für alle 20 Pakete, Quelltext von dmn-js 18.0.3 und feiertagejs 1.5.1, die Projektdateien des Prozesslotsen und ein eigenes Rechenskript.

### Bestätigt

- Die stichprobenartig geprüften Normzitate des Autors stimmen: § 18 Abs. 2 Satz 6 UStG, § 149 Abs. 4 Satz 1 Nr. 2 AO, § 28a Abs. 4 SGB IV, § 68 Abs. 1–2 sowie §§ 9, 10 VerpackDG.
- Versionen und Lizenzen aller 20 Pakete stimmen. dmn-js steht unter der bpmn.io-Lizenz mit Wasserzeichenpflicht.
- Golden Tests A–F und RT1–RT11 folgen aus den Regeln. Alle Kalenderwerte (DA1–DA10, BA1–BA6, TE1–TE12) sind nachgerechnet.
- Der Aufruf `unaryTest(…, { '?': wert }).value` passt zur README von feelin 8.2.0.

### Geändert

1. **Rechnungsfrist EU (Fehler):** ST05 und Pflicht 20 nannten 6 Monate. Richtig ist der 15. des Folgemonats (§ 14a Abs. 1, 3 UStG). ST05 greift nur noch ohne Kleinunternehmerregelung.
2. **Neue Regel ST16:** Handwerk mit Privatkunden löst Pflicht 20 aus (§ 14 Abs. 2 Satz 2 Nr. 3 UStG). Vorher fehlte die Rechnungspflicht für Handwerker ohne Geschäftskunden.
3. **Neue Lücke 17 „Vergütung der Geschäftsführung“ (LU20):** UG und GmbH bekamen keinen Hinweis auf Lohnsteuer und SV-Status der Geschäftsführung. Lücken bei C jetzt 8, bei E 9.
4. **SV-Beitragsnachweis:** Termin einen Arbeitstag vor dem Nachweistag; der Nachweistag steht als `gesetzlichBis`. BA1–BA6 und TE8 ergänzt, BA7 neu.
5. **Feiertage „möglich“:** Fronleichnam in SN und TH sowie das Augsburger Friedensfest ergänzt. feiertagejs führt sie für diese Länder nicht.
6. **OSS:** kein `gesetzlichBis`, bis O16 geklärt ist.
7. **Sondervorauszahlung:** Betragsrechner gestrichen. Er hatte keine Eingabe in der Oberfläche, und die Hochrechnung im Gründungsjahr ist ungeprüft. US10 entfällt.
8. **Web-CSP (Fehler):** `font-src 'self' data:` ergänzt, sonst fehlen die dmn-js-Symbole. Ein Vite-Plugin setzt die CSP nur im Build.
9. **Tauri (Fehler):** Die eigenen Befehle brauchen `allow-<befehl>`-Rechte aus dem App-Manifest. Der Installer läuft nur in der CI, wie es die CLAUDE.md des Prozesslotsen verlangt.
10. **V12:** nur noch in Tests und CI, Hash über LF-Text, `.gitattributes` mit `eol=lf`. Vorher hätte ein CRLF-Checkout die App beim Start blockiert.
11. **Phase 2:** Die DMN-Datei (2.3) entsteht jetzt vor dem Lader (2.4). Vorher bauten die Lader-Tests auf einer noch fehlenden Datei auf.
12. **Datenschutz und Recht:** Profile von Einzelunternehmen sind personenbezogen. Ergänzt: „Lokale Daten löschen“, § 5 UrhG, Steuerberatungsgesetz und BGH I ZR 113/20 als Prüfpunkt.
13. **Kleineres:** E-Bilanz-Hinweis bei § 141 AO, Eröffnungsbilanz, 4-Monats-Frist nach § 149 Abs. 4 AO, Social-Media-Profil in F20, VALARM beim Import, Bundle-Größe des NavigatedViewer, @types/node Linie 24, Risiken R12–R14, O3/O4/O6/O9/O10 geschärft, O16 neu.

### Offen

- O3 Kleinunternehmergrenze im Gründungsjahr; der Wortlaut von § 19 UStG regelt sie nicht.
- O4 Monatspflicht 2027 für Gründungen 2026, weil § 18 Abs. 2 Satz 6 UStG ausläuft.
- O9 und O16: Zeitpunkt des Beitragsnachweises, Bankarbeitstage, OSS-Frist am Wochenende.
- O10 Rechtsdienstleistungs- und Steuerberatungsgesetz vor jeder Veröffentlichung.
- Nicht erneut geöffnet: Q10, Q11, Q14, Q15, DMN 1.3 (Q16) und RFC 5545 (Q17).
- ST16 nutzt das Handwerk als Näherung für den Grundstücksbezug. Fehltreffer setzt der Nutzer auf „trifft nicht zu“.

### Bewertung

Die Spezifikation ist fachlich sorgfältig und baubar; jeder Schritt hat ein prüfbares Ergebnis. Der MVP ist groß, aber stimmig. Wird die Zeit knapp, zuerst den Änderungshinweis (4.8) und dann die Trefferhervorhebung in dmn-js (Teil von 4.7) auf Version 0.2 schieben.
