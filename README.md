# Pflichten-Kompass

Zeigt Gründerinnen und Gründern, welche Anmeldungen, Meldungen und Fristen auf sie zukommen. Aus einem geführten Interview entsteht eine begründete Pflichtenliste mit Frist, zuständiger Stelle, Rechtsgrundlage, Quelle und Stand. Jede Pflicht nennt die Antworten, die sie ausgelöst haben, und die App sagt offen, welche Bereiche sie nicht geprüft hat. Die Regeln liegen als DMN-1.3-Entscheidungstabellen im Repo. Läuft im Browser, ohne Server und ohne KI.

> **Keine Rechtsberatung.** Der Pflichten-Kompass zeigt häufige Pflichten nach dem Rechtsstand vom 11.11.2026. Er ist keine Rechts- oder Steuerberatung und nicht vollständig. Jede Pflicht vor dem Handeln an der genannten Quelle prüfen oder fachlich beraten lassen.

![Ergebnis für eine Elektro-GmbH: Zusammenfassung, Hinweis, Kasten „Nicht geprüft“ und die erste Pflicht mit aufgeklapptem „Warum?“](docs/bilder/ergebnis.png)

## Stand

Version 0.1.0, Phasen 0–5 umgesetzt und am 11.11.2026 kritisch geprüft: Regeln, Katalog und 71.264 Kalenderwerte eigenständig nachgerechnet, die Kalenderdatei mit einem fremden Parser gelesen, das PDF der Druckansicht Seite für Seite angesehen; zehn Fehler und Lücken behoben, darunter zwei Abstürze (Liste in [docs/stand.md](docs/stand.md#prüfung-nach-phase-5-11112026)). Die fachliche Abnahme mit Robin (Schritt 5.4) steht noch aus; bis dahin gelten die Annahmen in [docs/entscheidungen.md](docs/entscheidungen.md). Offen sind außerdem der Kalenderimport in Outlook und Google Kalender von Hand, das Windows-Programm (Phase 6) und der Katalog 2027.01 (Phase 7). Das Repo liegt bisher nur lokal; die CI ist deshalb noch nie gelaufen. Die Planung steht in der [Spezifikation](docs/spezifikation.md).

## Was es kann

- **Interview in fünf Schritten** (Vorhaben, Tätigkeit, Personal, Verkauf, Umsatz und Steuern) mit 32 Fragen, von denen je Profil rund 20 sichtbar sind. Jede Frage hat eine Hilfe mit Links auf die Normen; Fehler, offene Pflichtangaben und Warnungen stehen am Feld. Antworten mit Folgen für andere Fragen setzen deren Standard (Gastronomie → Lebensmittel und Sofortmeldung, Onlinehandel mit Privatkunden → Verpackung, Kasse → Bargeld).
- **Abgedeckt:** Einzelunternehmen, GbR (auch als OHG), UG (haftungsbeschränkt), GmbH; gewerblich oder freiberuflich; Handel, Onlinehandel, Handwerk, Gastronomie, Dienstleistung.
- **Kernkatalog 2026.11.0:** 40 geprüfte Pflichten und 17 Hinweise auf nicht geprüfte Bereiche ([Pflichtenkatalog](docs/katalog.md), [Fragenkatalog](docs/fragenkatalog.md)). Jede Pflicht hat Rechtsgrundlage, geöffnete Primärquelle und Stand.
- **Ergebnis** nach Zeitpunkt gruppiert (vor dem Start, erste Wochen, laufend, jährlich). Jede Pflichtkarte zeigt Frist, nächsten Termin mit „gesetzlich bis“, Stelle und Weg, Normen als Links, Quelle mit Stand, Hinweise und den Rechenweg der Termine. „Warum?“ nennt jede zutreffende Regel mit den erfüllten Bedingungen, z. B. „Beschäftigte: 3 (Fragen 12, 14, 15)“. Status (offen, erledigt, trifft nicht zu) und Notiz je Pflicht, Filter nach Gruppe und Status, Marke „neu“ für Pflichten, die seit dem letzten Blick dazugekommen sind.
- **Termine** für 24 oder 12 Monate ab dem Startmonat, nach Monaten geordnet, vergangene grau. Fristende nach § 108 Abs. 3 AO mit den Feiertagen des Landes, wiederkehrende Termine für Umsatzsteuer, Lohnsteuer, Sozialversicherung, Zusammenfassende Meldung und OSS, Jahresfristen für Erklärungen, Abschluss, Offenlegung und Verpackung.
- **Kalenderexport** als `.ics` nach RFC 5545 mit Erinnerung (keine, 1, 3, 7 oder 14 Tage vorher), wahlweise nur offene Pflichten; jeder Eintrag nennt Stelle, Rechtsgrundlage, Quelle und Stand und „Keine Rechts- oder Steuerberatung“.
- **Druckansicht** (A4, immer hell) mit Kopf, je Gruppe einer Tabelle samt „Warum?“, den nicht geprüften Bereichen und den nächsten 12 Terminen; Hinweistext und Seitenzahl auf jeder Seite. PDF über „Als PDF speichern“ im Druckdialog.
- **Regelansicht** mit dmn-js: DRD und alle sieben Entscheidungstabellen, deutsch beschriftet, die Treffer des Profils markiert und zusätzlich als Liste; dazu die Quellen Q1–Q17.
- **Projektdatei** `.pflichtenkompass` (JSON) speichern und öffnen, auch per Strg+S und Strg+O oder durch Ziehen ins Fenster. Beim Öffnen nennt ein Änderungshinweis neue, entfallene und geänderte Pflichten seit dem Speichern; fremde, kaputte oder zu große Dateien lehnt die App mit Meldung ab. Die Antworten liegen außerdem im Browserspeicher; „Lokale Daten löschen“ entfernt sie. Lässt sich der gespeicherte Stand nicht lesen oder erlaubt der Browser kein Speichern, sagt die App das, statt Daten still zu verwerfen.
- Hell- und Dunkelmodus, vollständig per Tastatur bedienbar, geprüft mit axe; schmale Bildschirme ohne waagerechtes Scrollen.

| Interview | Termine |
| --- | --- |
| ![Schritt „Personal“ mit Fragen 12 bis 17 und der Hilfe zu Geringfügigkeitsgrenze und Sofortmeldung](docs/bilder/interview.png) | ![Terminliste April 2027 mit Gründungsterminen und dem ersten Beitragsnachweis](docs/bilder/termine.png) |
| **Regeln (DRD)** | **Regeln (Tabelle „Steuern“)** |
| ![DRD mit sieben Entscheidungen; Entscheidungen mit Treffern sind blau hinterlegt](docs/bilder/regeln-drd.png) | ![Entscheidungstabelle „Steuern“ mit markierten Trefferzeilen](docs/bilder/regeln-tabelle.png) |

## Beispiele

Sechs erfundene Gründungen sind auf der Startseite ladbar; ihre Ergebnisse sind als Golden Tests festgeschrieben (Spezifikation 9.3).

| Beispiel | Profil | Pflichten | Nicht geprüft |
| --- | --- | --- | --- |
| A Kaffeeversand | Einzelunternehmen, Onlinehandel, NW, Start 15.01.2027 | 13 | 7 |
| B Übersetzungsbüro | Einzelunternehmen, freiberuflich, Kleinunternehmer, HE | 9 | 4 |
| C Elektro GmbH | GmbH, zulassungspflichtiges Handwerk, 3 Beschäftigte, BY | 25 | 8 |
| D Café | GbR, Gastronomie, 3 Minijobs, elektronische Kasse, SN | 20 | 8 |
| E Shop UG | UG, Onlinehandel, Start 15.12.2026, BE | 20 | 9 |
| F Großhandel | Einzelkaufmann, 900.000 € Umsatz, HH | 22 | 6 |

Beispiel A ergibt für 24 Monate 31 Termine, darunter 23 Umsatzsteuer-Voranmeldungen.

## Rechenregeln

DMN entscheidet, *ob* eine Pflicht gilt; die Fristen rechnet TypeScript danach (`src/fristen`). Alle Funktionen bekommen „heute“, das Land und den Horizont übergeben.

| Berechnung | Regel | Norm |
| --- | --- | --- |
| Fristende | Monatsfrist: gleicher Tag im Zielmonat, sonst Monatsletzter; Ende am Samstag, Sonntag oder Feiertag → nächster Werktag | § 108 Abs. 3 AO |
| Abgaben und Zahlungen | Abgaben stehen am verschobenen Tag. Zahlungen (USt, Lohnsteuer, ESt-Vorauszahlung) stehen vorsichtig am ursprünglichen Tag, das spätere Ende als „gesetzlich bis“. OSS ohne Verschiebung | § 108 AO |
| Feiertage | aus feiertagejs je Land; „sicher“ (ohne Mariä Himmelfahrt in Bayern) zum Verschieben, „möglich“ (plus 24.12., 31.12., Fronleichnam in SN und TH, Augsburger Friedensfest) zum Zurückzählen. So kommt nie ein späteres Datum als im Gesetz heraus | Landesrecht nicht geprüft |
| USt-Voranmeldung | Gründungsjahr und Folgejahr monatlich; 2026 nach der voraussichtlichen Steuer (über 9.000 € monatlich, sonst vierteljährlich, bis 2.000 € Befreiung möglich); später vorsichtig monatlich. Fällig am 10. nach dem Zeitraum, mit Dauerfristverlängerung einen Monat später | § 18 Abs. 1, 2 UStG, § 46 UStDV |
| Sondervorauszahlung | Termin bei monatlicher Abgabe mit Dauerfristverlängerung: im ersten Jahr am Abgabetag der ersten Voranmeldung, danach am 10.02.; den Betrag (1/11) rechnet die App nicht | §§ 47, 48 UStDV |
| Lohnsteuer-Anmeldung | Monat über 5.000 €, Quartal über 1.080 €, sonst Jahr; im ersten Jahr Lohnsteuer des ersten Monats × 12, im zweiten als Schätzung | § 41a Abs. 2 EStG |
| SV-Beiträge | Fälligkeit am drittletzten Bankarbeitstag, Nachweis zwei Arbeitstage vorher; Termin einen Arbeitstag vor dem Nachweistag | §§ 23, 28f SGB IV |
| Steuererklärungen | 31.07. des Folgejahres; mit Steuerberatung letzter Februartag des übernächsten Jahres | § 149 Abs. 2, 3 AO |
| E-Rechnung ausstellen | ab 2027 bei mehr als 800.000 € Gesamtumsatz 2026 (ohne Angabe vorsichtig 2027), sonst ab 2028 | § 27 Abs. 38 UStG |
| Aufbewahrung | 31.12. des Jahres + 10 (Bücher, Abschlüsse), 8 (Belege, Rechnungen) oder 6 Jahre (Geschäftsbriefe); Rechner auf der Pflichtkarte | § 147 Abs. 3, 4 AO |
| Geringfügigkeitsgrenze | Mindestlohn × 130 / 3, auf volle Euro aufgerundet; die App zeigt nur die Formel | § 8 Abs. 1a SGB IV |
| Kleinunternehmer | Vorjahr höchstens 25.000 €, laufendes Jahr höchstens 100.000 €; im Gründungsjahr über 25.000 € ein Prüfhinweis; über 100.000 € rechnet die App ohne die Regelung und fragt dann auch nach Zahllast, EU-Fernverkäufen und Dauerfristverlängerung | § 19 Abs. 1 UStG |

Alle Werte der Tabellen DA, BA, US, LS, ER, AU, KU, GG und TE aus Abschnitt 9 der Spezifikation sind als Unit-Tests von Hand nachgerechnet. Bei der Prüfung am 11.11.2026 kam eine vom Code unabhängige Nachrechnung dazu: Werktage nach § 108 Abs. 3 AO, Arbeitstage und SV-Termine für jeden Tag von 2026 bis 2031 in allen 16 Ländern, ohne Abweichung.

## Grenzen

- **Nicht abgedeckt:** KG, GmbH & Co. KG, Verein; abweichendes Wirtschaftsjahr, mehrere Betriebsstätten, Reisegewerbe, erlaubnispflichtige Gewerbe, Kammerberufe; Gründungen vor dem 01.01.2026.
- **Nicht geprüft** und deshalb nur als Hinweis: Gewerbe- und Körperschaftsteuer, Gaststätten- und Lebensmittelrecht, Verbraucherrecht im Onlinehandel, Datenschutz, Arbeitsrecht und Arbeitsschutz, Erlaubnisse und Kammern, Künstlersozialabgabe, Rundfunkbeitrag, Elektrogeräte und Batterien, EU-Geschäft als Kleinunternehmer, freiberufliche UG oder GmbH, Vergütung der Geschäftsführung, dazu Prüfhinweise bei unklarer Kaufmannseigenschaft, unklarer Handwerksart und der Kleinunternehmergrenze im Gründungsjahr.
- **Vorsichtige Annahmen bis zur Klärung:** Höhe des Mindestlohns (nur Formel), DEÜV-Fristen (Termin am Beschäftigungsbeginn), § 18 Abs. 2 Satz 6 UStG ab 2027 (nach dem Wortlaut monatlich), Zeitpunkt des Beitragsnachweises und Bankarbeitstage (24.12. und 31.12. frei), OSS-Frist am Wochenende (keine Verschiebung). Die offenen Fragen O1–O16 stehen in der Spezifikation (10.2), die Annahmen in [docs/entscheidungen.md](docs/entscheidungen.md).
- Die Feiertage der Länder stammen aus feiertagejs und sind nicht gegen die Landesgesetze geprüft. Die Links auf gesetze-im-internet.de sind gegen das Muster der Datenbank geprüft, nicht online.
- **Kalender:** Manche Kalender übernehmen die Erinnerung beim Import nicht oder setzen eine eigene. Wie sich Outlook und Google Kalender verhalten, ist noch nicht von Hand geprüft; die Dateien sind mit ical.js (Mozilla) gegengelesen. Der Export braucht Web Crypto, also https oder localhost; sonst nennt der Dialog den Grund.
- **Druck:** Hinweistext und Seitenzahl stehen über die Seitenränder von CSS (`@page`) auf jeder Seite. Geprüft mit Edge; andere Browser sind nicht geprüft.
- **Barrierefreiheit:** Die dmn-js-Leinwand (Verschieben, Zoomen) ist nicht per Tastatur bedienbar; Ersatz sind die Knöpfe je Tabelle und die Liste der zutreffenden Regeln.

## Regeln als DMN 1.3

Ob eine Pflicht gilt, entscheiden sieben Entscheidungstabellen in [`regeln/pflichten.dmn`](regeln/pflichten.dmn) (Hit Policy COLLECT, 67 Regeln, jede mit Begründung). Ihre Eingaben sind 26 Merkmale, die TypeScript aus den Antworten ableitet. Die Einträge nutzen eine kleine, getestete Teilmenge von S-FEEL (`-`, Listen, `not(…)`, Vergleiche, Intervalle); alles andere lehnt der Lader ab. Beim Laden prüft die App die Datei (V1–V11): DMN-1.3-Namensraum, COLLECT, Ausgaben im Katalog, bekannte Merkmale und Typen, Begründung je Regel, eindeutige Regel-IDs, jede Pflicht und jede Lücke erreichbar. Ein Differenztest vergleicht die eigene Auswertung mit feelin über alle 570 Einträge der Datei. Der Prüfwert in [`regeln/stand.json`](regeln/stand.json) zwingt nach jeder Änderung zu neuer Katalogversion (V12). Die Datei öffnet sich auch im Camunda Modeler und auf demo.bpmn.io.

## Datenschutz

Keine Daten verlassen den Rechner: kein Server, keine Telemetrie, keine Konten, keine externen Schriften. Antworten liegen nur im Browserspeicher oder in der selbst gespeicherten Projektdatei. Im Produktions-Build gilt eine strenge Content-Security-Policy.

## Aufbau

| Ordner | Inhalt |
| --- | --- |
| `src/modell` | Profil, Fragen, Antworten, Merkmale, Beispiele, Prüfungen, Speichern |
| `src/katalog` | Pflichten, Lücken, Quellen, Normlinks, Hinweistext |
| `src/regeln` | FEEL-Teilmenge, Laden und Prüfen der DMN-Datei, Auswertung |
| `src/fristen` | Datum, Feiertage, Berechnungen, Termine |
| `src/export` | Kalenderdatei (iCalendar) |
| `src/plattform` | Öffnen und Speichern im Browser (später im Windows-Programm) |
| `src/ui` | React-Oberfläche: Schritte, Pflichtkarte, Terminliste, Regelansicht (lazy), Druckansicht, Dialoge |
| `regeln` | `pflichten.dmn` (DMN 1.3) und ihr Prüfwert |
| `e2e` | Browsertests mit Playwright und axe |
| `scripts` | Doku erzeugen, Prüfwert der Regeln, Bildschirmfotos |
| `docs` | [Spezifikation](docs/spezifikation.md), [Stand](docs/stand.md), [Entscheidungen](docs/entscheidungen.md), [Abnahme](docs/abnahme.md), [Pflichtenkatalog](docs/katalog.md), [Fragenkatalog](docs/fragenkatalog.md), [Lizenzen](docs/lizenzen.md), [Bilder](docs/bilder) |

Die Fachlogik kennt kein React und ist getestet; „heute“ wird ihr immer übergeben.

**Technik:** React 19, TypeScript 7, Vite 8, Vitest, Playwright mit axe, oxlint, GitHub Actions; dmn-moddle und dmn-js für DMN, feiertagejs für die Feiertage.

## Tests

- **Unit-Tests (Vitest, 349 in 25 Dateien):** FEEL-Teilmenge mit Differenztest gegen feelin, Prüfung des Regelwerks, Golden Tests der Beispiele A–F und gezielte Regeltests, Merkmale, Katalog, Speichern, Feiertage, Berechnungen, Termine, Kalenderexport, Antworten, Anzeigetexte und Zustand.
- **Browsertests (Playwright, lokal mit Edge, 40):** E1 Beispiel A nur mit der Tastatur, E2 Beispiele A–F, E3 Kalenderexport, E4 Druckansicht samt Fußzeile, E5 Datei speichern und öffnen, E6 Regelansicht ohne CSP-Meldung, E7 axe in allen Schritten hell und dunkel; dazu Sichtbarkeit der Fragen, Meldungen am Feld, Speicher, Tastatur, schmale Ansicht und die Fehlerfälle: fremde, kaputte und zu große Dateien, unlesbarer oder gesperrter Browserspeicher, Kalenderexport ohne Web Crypto, unsinnige Jahre im Aufbewahrungsrechner.
- **CI** (GitHub Actions): Lint, Unit-Tests und Build; die Browsertests laufen vorerst nur lokal (Entscheidung E1).

## Entwickeln

```bash
npm install
npm run dev       # Entwicklungsserver (Port 5182)
npm test          # Unit-Tests (Vitest)
npm run e2e       # Browsertests gegen den Produktions-Build (Port 4182, lokal mit Edge)
npm run build     # Typprüfung und Produktions-Build
npm run lint      # oxlint
npm run doku      # docs/katalog.md und docs/fragenkatalog.md neu erzeugen
npm run regeln:stand   # Prüfwert der Regeldatei prüfen; nach Änderungen mit --version … --stand …
```

Bildschirmfotos: `npm run build`, dann `npx vite preview --port 4182 --strictPort` starten und `node scripts/readme-bilder.mjs` (README) oder `node scripts/ansehen.mjs <ordner>` (Rundgang) ausführen. Die Vorschau danach wieder beenden, sonst testen die Browsertests den alten Build weiter.

## Lizenz

Noch nicht festgelegt. Die Bibliotheken und ihre Lizenzen stehen in [docs/lizenzen.md](docs/lizenzen.md). dmn-js steht unter der bpmn.io-Lizenz, die das bpmn.io-Wasserzeichen in der Anzeige vorschreibt; die Regelansicht lässt es sichtbar.
