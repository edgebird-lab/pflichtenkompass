# Pflichten-Kompass – Hinweise für die Arbeit am Projekt

- Portfolio-Projekt von Robin (Wirtschaftsinformatik, olbricht-digital). Repo `edgebird-lab/pflichtenkompass` ist **privat**; öffentlich erst nach Robins ausdrücklicher Freigabe (vorher Rechtsfragen O10 klären). Keine GitHub Pages, keine Releases.
- Spezifikation: `docs/spezifikation.md` (lang, in Teilen lesen). Fortschritt mit Häkchen: `docs/stand.md`, nach jedem Schritt abhaken. Annahmen und Abweichungen: `docs/entscheidungen.md`.
- Sprache: Oberfläche, Fachbegriffe im Code, Doku und Commit-Nachrichten auf Deutsch. Keine KI-Funktionen, keine Daten außer Haus.
- Rechtsinhalte nur aus dem geprüften Kernkatalog der Spezifikation (6.6, 6.7); keine Pflichten, Fristen oder Paragraphen erfinden. Jede Pflicht mit Rechtsgrundlage, Quelle und Stand; der Hinweis „keine Rechtsberatung“ ist überall sichtbar.
- Fachlogik in `src/modell`, `src/katalog`, `src/regeln`, `src/fristen`, `src/export` ohne React und mit Tests (Werte von Hand nachgerechnet); Oberfläche in `src/ui`. `heute` wird immer übergeben, nie in der Fachlogik gelesen.
- `docs/katalog.md` und `docs/fragenkatalog.md` sind aus `src/katalog/` und `src/modell/fragen.ts` erzeugt: nach jeder Änderung `npm run doku`. Ein Test prüft, dass sie aktuell sind.
- Regeln stehen nur in `regeln/pflichten.dmn` (DMN 1.3, bearbeitbar mit dem Camunda Modeler oder demo.bpmn.io). Nach jeder Änderung `KATALOG_VERSION` und `KATALOG_STAND` in `src/katalog/typen.ts` anheben und `npm run regeln:stand -- --version … --stand …` ausführen; sonst scheitert der Test V12. Der Lader prüft V1–V11 und bricht bei jedem Befund ab.
- Vor jedem Commit: `npm run lint`, `npm test`, `npm run build`, `npm run e2e` (lokal mit Edge). Ports: Vorschau und Browsertests 4182 mit `strictPort`, Dev-Server 5182; nie 4173 (Prozesslotse).
- Keinen Vorschau-Server auf 4182 laufen lassen, wenn die Browsertests starten: `reuseExistingServer` nimmt ihn sonst samt altem Build. Browsertests mit Datum nutzen `e2e/hilfen.ts` (`oeffne` setzt „heute“ per `page.clock` auf den 11.11.2026).
- Oberfläche: Zustand als Reducer in `src/zustand.ts`, Antworten nur über `setzeAntwort` (abhängige Standardwerte aus 5.2). dmn-js lädt nur in der Regelansicht (`src/ui/RegelAnsicht.tsx`), das Regelwerk per dynamischem Import; beides gehört nicht ins Hauptbundle (Browsertest prüft das). Das bpmn.io-Wasserzeichen nie verdecken.
- Bilder für die README: `node scripts/readme-bilder.mjs` gegen die laufende Vorschau; Rundgang mit `node scripts/ansehen.mjs <ordner>`.
- Windows-Programm (Phase 6) wie beim Prozesslotsen; den Installer nie auf Robins Rechner ausführen.
