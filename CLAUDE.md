# Pflichten-Kompass – Hinweise für die Arbeit am Projekt

- Portfolio-Projekt von Robin (Wirtschaftsinformatik, olbricht-digital). Repo `edgebird-lab/pflichtenkompass` ist **privat**; öffentlich erst nach Robins ausdrücklicher Freigabe (vorher Rechtsfragen O10 klären). Keine GitHub Pages, keine Releases.
- Spezifikation: `docs/spezifikation.md` (lang, in Teilen lesen). Fortschritt mit Häkchen: `docs/stand.md`, nach jedem Schritt abhaken. Annahmen und Abweichungen: `docs/entscheidungen.md`.
- Sprache: Oberfläche, Fachbegriffe im Code, Doku und Commit-Nachrichten auf Deutsch. Keine KI-Funktionen, keine Daten außer Haus.
- Rechtsinhalte nur aus dem geprüften Kernkatalog der Spezifikation (6.6, 6.7); keine Pflichten, Fristen oder Paragraphen erfinden. Jede Pflicht mit Rechtsgrundlage, Quelle und Stand; der Hinweis „keine Rechtsberatung“ ist überall sichtbar.
- Fachlogik in `src/modell`, `src/katalog`, `src/regeln`, `src/fristen`, `src/export` ohne React und mit Tests (Werte von Hand nachgerechnet); Oberfläche in `src/ui`. `heute` wird immer übergeben, nie in der Fachlogik gelesen.
- Vor jedem Commit: `npm run lint`, `npm test`, `npm run build`, `npm run e2e` (lokal mit Edge). Ports: Vorschau und Browsertests 4182 mit `strictPort`, Dev-Server 5182; nie 4173 (Prozesslotse).
- Windows-Programm (Phase 6) wie beim Prozesslotsen; den Installer nie auf Robins Rechner ausführen.
