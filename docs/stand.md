# Stand der Arbeit

Checkliste aller Schritte aus Abschnitt 11 der [Spezifikation](spezifikation.md). `- [x]` erledigt, `- [ ]` offen; die Notiz sagt, was geprüft ist und wo ein Nachfolger weitermacht. Annahmen und Abweichungen stehen in [entscheidungen.md](entscheidungen.md).

Vor jedem Commit: `npm run lint`, `npm test`, `npm run build`, `npm run e2e` (lokal mit Edge, Port 4182).

**Offen für Robin:** Das private GitHub-Repo ist noch nicht angelegt. `gh repo create` wurde am 11.11.2026 vom Berechtigungssystem der Claude-Sitzung abgelehnt; alle Commits liegen nur lokal. Nachholen mit `gh repo create edgebird-lab/pflichtenkompass --private --source . --remote origin` und `git push -u origin main`; danach läuft die CI (Lint, Test, Build) zum ersten Mal.

## Phase 0 – Gerüst

- [x] **0.1** Projekt wie beim Prozesslotsen (Vite, React, TypeScript, Vitest, Playwright, oxlint, CI). Ports 4182 (Vorschau, E2E, `strictPort`) und 5182 (Dev). CSP als Meta-Tag nur im Build (Abschnitt 8). CI: Lint, Test, Build (ohne E2E, siehe Entscheidung E1).
- [x] **0.2** Plattformschicht aus dem Prozesslotsen (`src/plattform`, vorerst nur Browser; `desktop.ts` kommt mit Phase 6), Schrittleiste mit neun Schritten (Platzhalter), Darstellung System/Hell/Dunkel (gespeichert in `pflichtenkompass:einstellungen`), Startseite und Fußzeile mit Hinweistext aus 5.7. Geprüft: axe hell und dunkel in allen Schritten ohne schwere Befunde (`e2e/barrierefreiheit.spec.ts`), Tastatur, CSP. Vorgezogen aus 3.1: Grundfunktionen in `src/fristen/datum.ts` (ohne Feiertage).
- [x] **0.3** `CLAUDE.md`, README-Gerüst, [Lizenzhinweise](lizenzen.md) (bpmn.io-Wasserzeichen, MIT). Geprüft: `src/doku.test.ts` prüft alle relativen Links in README, CLAUDE.md und `docs/`.

## Phase 1 – Fachmodell und Katalog

- [x] **1.1** Typen aus Abschnitt 4 (`src/modell/typen.ts`, `src/katalog/typen.ts`, `src/regeln/typen.ts`), Standardprofil (`src/modell/profil.ts`), Beispiele A–F (`src/modell/beispiele.ts`). Geprüft: Typprüfung ohne Fehler, `beispiele.test.ts` (Standardwerte aus 5.2, Werte aus 9.3, frische Kopien).
- [x] **1.2** `src/modell/merkmale.ts` nach 6.2 mit Beschreibung aller 26 Merkmale (`MERKMALE`) und Anzeigetexten für „Warum?“ (`wertText`, Beträge über `src/modell/format.ts`). Geprüft: MM1–MM8 und Grenzfälle in `merkmale.test.ts`.
- [ ] **1.3** Katalog: 40 Pflichten, 17 Quellen, Normlinks; `docs/katalog.md` (KA1–KA3).
- [ ] **1.4** Lücken (17), Fragen F01–F32 mit Sichtbarkeit; `docs/fragenkatalog.md`.
- [ ] **1.5** `speicher.ts` (SP1–SP5).

## Phase 2 – DMN-Regelwerk

- [ ] **2.1** FEEL-Teilmenge (FE1–FE26).
- [ ] **2.2** Differenztests gegen feelin.
- [ ] **2.3** `regeln/pflichten.dmn` mit 7 Tabellen und DRD (67 Regeln).
- [ ] **2.4** Laden mit dmn-moddle, Prüfung V1–V11 (RV1–RV10).
- [ ] **2.5** Auswertung (A–F, RT1–RT11).
- [ ] **2.6** `regeln/stand.json`, `npm run regeln:stand`, V12 (KA6).

## Phase 3 – Fristen, Termine, Kalender

- [ ] **3.1** `datum.ts` und `feiertage.ts` (DA1–DA10, BA1–BA7).
- [ ] **3.2** `berechnungen.ts` (US, LS, ER, AU, KU, GG).
- [ ] **3.3** `termine.ts` (TE1–TE12).
- [ ] **3.4** `ics.ts` (IC1–IC8); Import in Outlook und Google Kalender von Hand.

## Phase 4 – Oberfläche

- [ ] **4.1** Zustand, Autosave, Start mit Beispielen, Datei öffnen, Lokale Daten löschen.
- [ ] **4.2** Schritte Vorhaben und Tätigkeit (F01–F11).
- [ ] **4.3** Schritte Personal, Verkauf, Umsatz und Steuern (F12–F32) mit Prüfungen aus 6.9.
- [ ] **4.4** Ergebnis (E2).
- [ ] **4.5** Termine und Kalenderdialog (E3).
- [ ] **4.6** Druckansicht (E4).
- [ ] **4.7** Regelansicht mit dmn-js (E6).
- [ ] **4.8** Datei speichern und öffnen mit Änderungshinweis (E5, SP6).

## Phase 5 – Qualität und Version 0.1

- [ ] **5.1** Browsertests E1 und E7.
- [ ] **5.2** Barrierefreiheit und Tastatur.
- [ ] **5.3** README mit Bildern, Version 0.1.0.
- [ ] **5.4** Fachliche Abnahme mit Robin.

## Phase 6 – Windows-Programm mit Tauri 2 (später)

- [ ] **6.1** `src-tauri` übernehmen.
- [ ] **6.2** Rust-Befehle, Capabilities, Opener, CSP.
- [ ] **6.3** NSIS-Installer bauen, nicht lokal ausführen.
- [ ] **6.4** Installer-Rauchtest nur in der CI.

## Phase 7 – Katalog 2027.01 (später)

- [ ] **7.1** O1, O2, O9, O11, O12, O16 klären.
- [ ] **7.2** Gewerbe- und Körperschaftsteuer.
- [ ] **7.3** Datenschutz-Grundpflichten.
- [ ] **7.4** Fernabsatz-Grundpflichten.
- [ ] **7.5** Linkprüfung, Katalog 2027.01.0.
