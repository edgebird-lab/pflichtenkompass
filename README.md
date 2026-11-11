# Pflichten-Kompass

Zeigt Gründerinnen und Gründern, welche Anmeldungen, Meldungen und Fristen auf sie zukommen. Aus einem geführten Interview entsteht eine begründete Pflichtenliste mit Frist, zuständiger Stelle, Rechtsgrundlage, Quelle und Stand. Jede Pflicht nennt die Antworten, die sie ausgelöst haben, und die App sagt offen, welche Bereiche sie nicht geprüft hat. Die Regeln liegen als DMN-1.3-Entscheidungstabellen im Repo. Läuft im Browser, ohne Server und ohne KI.

> **Keine Rechtsberatung.** Der Pflichten-Kompass zeigt häufige Pflichten nach dem Rechtsstand vom 11.11.2026. Er ist keine Rechts- oder Steuerberatung und nicht vollständig. Jede Pflicht vor dem Handeln an der genannten Quelle prüfen oder fachlich beraten lassen.

## Stand

In Arbeit, Version 0.1 entsteht. Erledigte und offene Schritte stehen in [docs/stand.md](docs/stand.md), die Planung in der [Spezifikation](docs/spezifikation.md), getroffene Annahmen in [docs/entscheidungen.md](docs/entscheidungen.md).

## Was Version 0.1 können soll

- **Interview** in fünf Schritten; je Profil sind rund 20 der 32 Fragen sichtbar.
- **Abgedeckt:** Einzelunternehmen, GbR (auch als OHG), UG (haftungsbeschränkt), GmbH; gewerblich oder freiberuflich; Handel, Onlinehandel, Handwerk, Gastronomie, Dienstleistung.
- **Kernkatalog 2026.11.0:** 40 geprüfte Pflichten und 17 Hinweise auf nicht geprüfte Bereiche, jede Pflicht mit geöffneter Primärquelle.
- **Regeln als DMN 1.3:** sieben Entscheidungstabellen mit Hit Policy COLLECT, ausgewertet mit einer kleinen, getesteten FEEL-Teilmenge.
- **Ergebnis** nach Zeitpunkt gruppiert, je Pflicht „Warum?“, Frist, nächster Termin, Stelle, Normen, Quelle, Stand und Status.
- **Fristenrechner** mit § 108 Abs. 3 AO und Feiertagen des Landes, wiederkehrende Termine für 24 Monate.
- **Export** als Kalenderdatei (iCalendar), Druckansicht und Projektdatei `.pflichtenkompass`.
- Hell- und Dunkelmodus, Tastaturbedienung, geprüft mit axe.

## Aufbau

| Ordner | Inhalt |
| --- | --- |
| `src/modell` | Profil, Fragen, Merkmale, Beispiele, Speichern |
| `src/katalog` | Pflichten, Lücken, Quellen, Normlinks, Hinweistext |
| `src/regeln` | FEEL-Teilmenge, Laden und Prüfen der DMN-Datei, Auswertung |
| `src/fristen` | Datum, Feiertage, Berechnungen, Termine |
| `src/export` | Kalenderdatei |
| `src/plattform` | Öffnen und Speichern im Browser (später im Windows-Programm) |
| `src/ui` | React-Oberfläche |
| `regeln` | `pflichten.dmn` (DMN 1.3) und ihr Prüfwert |
| `e2e` | Browsertests mit Playwright und axe |
| `docs` | [Spezifikation](docs/spezifikation.md), [Stand](docs/stand.md), [Entscheidungen](docs/entscheidungen.md), [Lizenzen](docs/lizenzen.md) |

Die Fachlogik kennt kein React und ist getestet; `heute` wird ihr immer übergeben.

**Technik:** React 19, TypeScript 7, Vite 8, Vitest, Playwright mit axe, oxlint, GitHub Actions.

## Entwickeln

```bash
npm install
npm run dev       # Entwicklungsserver (Port 5182)
npm test          # Unit-Tests (Vitest)
npm run e2e       # Browsertests gegen den Produktions-Build (Port 4182, lokal mit Edge)
npm run build     # Typprüfung und Produktions-Build
npm run lint      # oxlint
```

## Datenschutz

Keine Daten verlassen den Rechner: kein Server, keine Telemetrie, keine Konten, keine externen Schriften. Antworten liegen nur im Browserspeicher oder in der selbst gespeicherten Projektdatei.

## Lizenz

Noch nicht festgelegt. Die Bibliotheken und ihre Lizenzen stehen in [docs/lizenzen.md](docs/lizenzen.md). dmn-js steht unter der bpmn.io-Lizenz, die das bpmn.io-Wasserzeichen in der Anzeige vorschreibt.
