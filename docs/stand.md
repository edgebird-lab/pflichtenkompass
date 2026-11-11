# Stand der Arbeit

Checkliste aller Schritte aus Abschnitt 11 der [Spezifikation](spezifikation.md). `- [x]` erledigt, `- [ ]` offen; die Notiz sagt, was geprüft ist und wo ein Nachfolger weitermacht. Annahmen und Abweichungen stehen in [entscheidungen.md](entscheidungen.md).

Vor jedem Commit: `npm run lint`, `npm test`, `npm run build`, `npm run e2e` (lokal mit Edge, Port 4182).

**Offen für Robin:** Kalenderimport in Outlook und Google Kalender von Hand prüfen (Schritt 3.4, R12).

**Offen für Robin:** Das private GitHub-Repo ist noch nicht angelegt. `gh repo create` wurde am 11.11.2026 vom Berechtigungssystem der Claude-Sitzung abgelehnt; alle Commits liegen nur lokal. Nachholen mit `gh repo create edgebird-lab/pflichtenkompass --private --source . --remote origin` und `git push -u origin main`; danach läuft die CI (Lint, Test, Build) zum ersten Mal.

## Phase 0 – Gerüst

- [x] **0.1** Projekt wie beim Prozesslotsen (Vite, React, TypeScript, Vitest, Playwright, oxlint, CI). Ports 4182 (Vorschau, E2E, `strictPort`) und 5182 (Dev). CSP als Meta-Tag nur im Build (Abschnitt 8). CI: Lint, Test, Build (ohne E2E, siehe Entscheidung E1).
- [x] **0.2** Plattformschicht aus dem Prozesslotsen (`src/plattform`, vorerst nur Browser; `desktop.ts` kommt mit Phase 6), Schrittleiste mit neun Schritten (Platzhalter), Darstellung System/Hell/Dunkel (gespeichert in `pflichtenkompass:einstellungen`), Startseite und Fußzeile mit Hinweistext aus 5.7. Geprüft: axe hell und dunkel in allen Schritten ohne schwere Befunde (`e2e/barrierefreiheit.spec.ts`), Tastatur, CSP. Vorgezogen aus 3.1: Grundfunktionen in `src/fristen/datum.ts` (ohne Feiertage).
- [x] **0.3** `CLAUDE.md`, README-Gerüst, [Lizenzhinweise](lizenzen.md) (bpmn.io-Wasserzeichen, MIT). Geprüft: `src/doku.test.ts` prüft alle relativen Links in README, CLAUDE.md und `docs/`.

## Phase 1 – Fachmodell und Katalog

- [x] **1.1** Typen aus Abschnitt 4 (`src/modell/typen.ts`, `src/katalog/typen.ts`, `src/regeln/typen.ts`), Standardprofil (`src/modell/profil.ts`), Beispiele A–F (`src/modell/beispiele.ts`). Geprüft: Typprüfung ohne Fehler, `beispiele.test.ts` (Standardwerte aus 5.2, Werte aus 9.3, frische Kopien).
- [x] **1.2** `src/modell/merkmale.ts` nach 6.2 mit Beschreibung aller 26 Merkmale (`MERKMALE`) und Anzeigetexten für „Warum?“ (`wertText`, Beträge über `src/modell/format.ts`). Geprüft: MM1–MM8 und Grenzfälle in `merkmale.test.ts`.
- [x] **1.3** Katalog in `src/katalog/`: 40 Pflichten (`pflichten.ts`), 17 Quellen (`quellen.ts`), Normlinks und Normtexte (`normen.ts`); [docs/katalog.md](katalog.md) erzeugt mit `npm run doku` (`scripts/katalog-doku.mjs`, `src/katalog/doku.ts`). Geprüft: KA1–KA3, Nummern, Gruppen und Zeitpunkte wie 6.6, jede Norm mit der Quelle ihres Gesetzes, Doku aktuell (`katalog.test.ts`). Kurztexte aus den Begründungen der Regeln (6.5); interne Verweise wie „(O2)“ in Hinweisen als „nicht geprüft“ ausgeschrieben.
- [x] **1.4** Lücken in `src/katalog/luecken.ts` (17, auch in [katalog.md](katalog.md)), Fragen F01–F32 mit Sichtbarkeit in `src/modell/fragen.ts`, [fragenkatalog.md](fragenkatalog.md) erzeugt (`src/modell/doku.ts`). Schrittliste nach `src/modell/schritte.ts` verschoben. Geprüft: sichtbare Fragen A 21, B 18, C 25, D 27, E 19, F 26 (von Hand gezählt), jede Bedingung aus 5.2 einzeln, Optionen gleich den Aufzählungen, Doku aktuell (`fragen.test.ts`, `luecken.test.ts`).
- [x] **1.5** `src/modell/speicher.ts`: Projektdatei lesen und schreiben (Prüfung mit Feldnamen, höchstens 1 MB, unbekannte Felder ignoriert, Notizen auf 500 Zeichen gekürzt), Browserspeicher mit try/catch, „Lokale Daten löschen“, Einstellungen. Geprüft: SP1–SP5 und Feldfehler in `speicher.test.ts`. Offen für 4.8: SP6 (Änderungshinweis).

## Phase 2 – DMN-Regelwerk

- [x] **2.1** FEEL-Teilmenge in `src/regeln/feel.ts`: eigener Parser nach der Grammatik in 6.4 (`parseEintrag`, `parseLiterale`), Typprüfung für V6 (`pruefeTyp`), Auswertung (`erfuellt`; null oder falscher Typ zur Laufzeit wirft). Geprüft: FE1–FE26 und weitere Randfälle in `feel.test.ts`. Leere Intervalle sind auch `(1..1)` und `[1..1)`, nicht nur `von > bis` (Entscheidung E8).
- [x] **2.2** Differenztest gegen feelin 8.2.0 (`src/regeln/feel.differenz.test.ts`): alle 570 Einträge der DMN-Datei mit allen Testwerten aus 9.1, zusammen 1.904 Vergleiche, keine Abweichung; dazu die Formen aus 9.1, die in der Datei nicht vorkommen (Intervalle, Negation von Zahlentests). Umgesetzt nach 2.3 und 2.4, weil der Test die Einträge aus der geladenen Datei nimmt.
- [x] **2.3** [`regeln/pflichten.dmn`](../regeln/pflichten.dmn): DMN 1.3 mit 7 Tabellen (Hit Policy COLLECT, Annotationsspalte „Begründung“) und DRD (DMNDI); `.gitattributes` mit `*.dmn text eol=lf`. Einmalig aus den Tabellen in 6.5 erzeugt, ab jetzt ist die Datei die Quelle. Geprüft: GR 9, PE 7, BR 1, ST 16, BU 11, ON 3, LU 20 = 67, keine Warnung von dmn-moddle, Formen und Kanten vollständig (`src/regeln/datei.test.ts`); dmn-js 18 öffnet DRD und alle Tabellen ohne Fehler, Wasserzeichen sichtbar (`e2e/regeln.spec.ts`, statt demo.bpmn.io lokal mit derselben Bibliothek). Für 4.7 notiert: Die Tabellenzeilen tragen die Regel-ID im Attribut `data-row-id`; dmn-js zeigt seine Bedienung englisch („When“, „And“, „Hit policy“, „View DRD“).
- [x] **2.4** Lader `src/regeln/dmn.ts` (`pruefeRegelwerk` sammelt alle Befunde, `ladeRegelwerk` wirft `RegelwerkFehler` mit der Liste) und `src/regeln/pruefung.ts` (V9–V11). Geprüft: RV1–RV10 und je V-Regel weitere Fälle in `pruefung.test.ts`. Strenger als 6.10 (Entscheidung E9): Warnungen von dmn-moddle sind Fehler (doppelte ID → V8, sonst V1), outputValues müssen bekannte IDs nennen (V4), genau eine Annotationsspalte „Begründung“ (V7), string-Eingaben brauchen genau die erlaubten Werte als inputValues (V5).
- [x] **2.5** Auswertung `src/regeln/auswertung.ts` nach 6.1 (`werteAus`: Merkmale, Treffer mit erfüllten Bedingungen, Gruppierung nach Ausgabe, Sortierung nach Katalognummer, Gültigkeit mit Warnung, Neu-Markierung; Termine bleiben bis Phase 3 leer). Eingabeprüfungen aus 6.9 in `src/modell/pruefung.ts` (ihre Warnungen stehen im Ergebnis). Geprüft: Beispiele A–F (Pflichten und Lücken wie 9.3, D: PE03 mit „Beschäftigte: 3“, Rechnungen C/B/E), RT1–RT11, Gültigkeit, Horizont, Neu-Markierung (`auswertung.test.ts`, `pruefung.test.ts`). Vorgezogen: Änderungshinweis als reine Funktion (`aenderungenSeitSpeichern`, `gespeichertAus`) mit SP6 auf Funktionsebene; die Anzeige folgt in 4.8.
- [x] **2.6** [`regeln/stand.json`](../regeln/stand.json) mit Version, Stand und SHA-256 über den LF-Text; `npm run regeln:stand` (`scripts/regeln-stand.mjs`) prüft und verlangt nach einer Änderung neue Version und neuen Stand; V12 als `pruefeStand` in `src/regeln/pruefung.ts`, nur in Tests und CI. Einstieg für die App: `src/regeln/regelwerk.ts` (`ladeMitgeliefertesRegelwerk`). Geprüft: KA6 grün, nach Änderung der Datei rot, CRLF-Kopie grün, Version passend zum Katalog (`stand.test.ts`); Skript von Hand gegen geänderte Datei geprüft.

## Hinweise für den nächsten Durchgang (Phase 3 ff.)

- **Zahlen:** 336 Unit-Tests in 24 Dateien und 31 Browsertests (Stand nach Phase 4), alle grün.
- **Schon da und getestet:** `src/fristen/datum.ts` (ISO-Daten, Tageszahlen in UTC, `plusMonate` mit Monatsletztem, Wochentag, Formatierung „Mo, 15.02.2027“; DA5 und DA10 schon geprüft), `src/modell/pruefung.ts` (alle Prüfungen aus 6.9 für 4.3), `aenderungenSeitSpeichern` und `gespeichertAus` für 4.8, `loescheLokaleDaten` für 4.1, `src/hash.ts` (SHA-256 über Web Crypto, auch für den Profilschlüssel der ICS-UIDs in 3.4).
- **Auswertung:** `werteAus` erwartet ein gültiges Startdatum; die Oberfläche ruft es erst auf, wenn `pruefeProfil` für F02 keinen Fehler meldet. Ohne Bundesland (F03) bleiben die Termine leer. Leere Ereignisse (F13, F23) fallen auf F02 zurück (`src/modell/wirksam.ts`).
- **Oberfläche:** Bildschirmfotos für Sichtprüfung und README mit `scripts/ansehen.mjs` (Vorschau auf Port 4182 vorher starten). Browsertests nutzen `e2e/hilfen.ts` (festes Datum 11.11.2026 über `page.clock`, Beispiel laden, axe, Tab-Navigation). Im Arbeitsordner keinen Vorschau-Server laufen lassen: `reuseExistingServer` würde sonst einen alten Build testen.
- **Regelansicht:** dmn-js-Zeilen tragen die Regel-ID in `data-row-id`; die Formen im DRD liegen ab y = 150, damit das Namensfeld von dmn-js oben links nichts verdeckt (`zeigeGanz` in `RegelAnsicht.tsx`).

## Phase 3 – Fristen, Termine, Kalender

- [x] **3.1** `src/fristen/feiertage.ts` mit feiertagejs 1.5.1: `feiertage(jahr, land, modus)` „sicher“ (ohne Mariä Himmelfahrt in BY) und „möglich“ (plus 24.12., 31.12., Fronleichnam in SN/TH, Augsburger Friedensfest in BY), `istWerktag`, `istArbeitstag`, `naechsterWerktag`, `arbeitstageVor`, `arbeitstagVomMonatsende`, `fristNachEreignis`. `datum.ts` bleibt ohne Feiertage. Geprüft: DA1–DA10, BA1–BA7, Feiertagslisten je Land, Tage um die Zeitumstellung (`feiertage.test.ts`).
- [x] **3.2** `src/fristen/berechnungen.ts`: `ustZeitraum` und `ustFaelligkeit` (6.8.4, Hinweise Befreiung, O4, Vorjahreswert), `lstZeitraum` und `lstZeitraumAusBasis` (6.8.5, Schätzung O11), `svFaelligkeit` (6.8.6), `eRechnungAb` (6.8.9), `aufbewahrenBis` (6.8.10), `geringfuegigkeitsgrenze` (6.8.11, ganzzahlig in Cent), `kleinunternehmerStatus` (6.8.12). Neu `src/modell/wirksam.ts`: ausgeblendete Antworten wirken nicht, F13 und F23 fallen auf F02 zurück. Geprüft: US1–US9, LS1–LS7, ER1–ER5, AU1–AU4, KU1–KU5, GG1–GG3 und Grenzfälle (`berechnungen.test.ts`).
- [x] **3.3** `src/fristen/termine.ts`: `termineFuer(pflicht, kontext)` für alle Fristregeln aus 6.8.2–6.8.9 (Abgaben nach § 108 Abs. 3 AO verschoben, Zahlungen unverschoben mit „gesetzlich bis“, OSS ohne, SV einen Arbeitstag vor dem Nachweistag), Horizont-Filter, `rechenweg` für die Pflichtkarte. `werteAus` füllt `termine` und `rechenweg`, sobald F03 beantwortet ist. Ergänzungen E10–E13. Geprüft: TE1–TE12, Sondervorauszahlung und Antrag bei vierteljährlicher Abgabe, OSS über der Schwelle, VerpackDG-Übergang, ESt-Vorauszahlungen, eindeutige Schlüssel in A–F (`termine.test.ts`).
- [x] **3.4** `src/export/ics.ts`: `erzeugeIcs` nach 7.5 (CRLF, Faltung auf 75 Oktette ohne geteilte Zeichen, Escaping, UID aus Pflicht, Terminschlüssel und Profilschlüssel, VALARM nach Einstellung, Beschreibung mit Kurztext, Hinweis, Stelle, Normen, Quelle, Stand, „gesetzlich bis“ und Hinweis „Keine Rechts- oder Steuerberatung.“), `profilSchluessel`, `kalenderDateiname`, `exportEintraege` (nur offene, vergangene). `dateiname` liegt jetzt rein in `src/modell/format.ts`. Geprüft: IC1–IC8 und Auswahl (`ics.test.ts`). **Offen für Robin:** Datei aus Beispiel A von Hand in Outlook und Google Kalender importieren und notieren, ob die Erinnerung übernommen wird (R12); in der Sitzung gibt es keine Kalenderkonten.

## Phase 4 – Oberfläche

- [x] **4.1** `src/zustand.ts` (Reducer mit Antworten, Status, Laden, Löschen, Schritt), Speichern im Browser 500 ms nach der letzten Eingabe und beim Verlassen der Seite, Startseite mit „Neu beginnen“, Beispielen A–F, „Datei öffnen“ und „Lokale Daten löschen“ (danach bleibt der Speicher leer, bis wieder etwas eingegeben wird), Rückfragen als Dialog (`src/ui/RueckfrageDialog.tsx` aus dem Prozesslotsen). Geprüft: `zustand.test.ts`, `e2e/zustand.spec.ts` (Beispiel laden, neu laden, Status bleibt; Speicher nach Löschen leer).
- [x] **4.2** Fragen-Schritte aus `FRAGEN` (`src/ui/schritte/FragenSchritt.tsx`, `src/ui/FrageFeld.tsx`, `src/ui/Eingaben.tsx`): Label mit Fragenummer, Hilfe mit Normlinks, Radios, Checkboxen, Datumsfeld, Beträge in deutscher Schreibweise; Hilfe-Spalte je Schritt (`src/ui/Hilfe.tsx`); abhängige Standardwerte in `src/modell/antworten.ts` (E16). Geprüft: `antworten.test.ts` (A und D allein aus den Antworten von 9.3), `e2e/interview.spec.ts` (Bedingungen aus 5.2 per Klick).
- [x] **4.3** Schritte Personal, Verkauf, Umsatz und Steuern mit den Prüfungen aus 6.9: Fehler rot mit `aria-invalid`, Pflichtangaben als ruhiger Hinweis, Warnungen gelb, alles über `aria-describedby` am Feld; Kleinunternehmerstatus in der Hilfe (E15). Geprüft: `e2e/interview.spec.ts` (Fehler und Warnungen am Feld), `format.test.ts` (Beträge lesen).
- [x] **4.4** Ergebnis (`src/ui/schritte/ErgebnisSchritt.tsx`, `src/ui/Pflichtkarte.tsx`): Gruppen nach Zeitpunkt (`nachZeitpunkt`), Kasten „Nicht geprüft“ mit Sprungmarke, Pflichtkarte mit Frist, nächstem Termin, Stelle, Normlinks, Quellen mit Stand, Hinweisen, Rechenweg, „Warum?“, Status und Notiz (500 Zeichen, mit Hinweis gekürzt), Filter nach Gruppe und Status, Neu-Markierung (E14), Aufbewahrungsrechner, fehlende Angaben mit Sprung zur Frage. Geprüft: E2 und weitere Fälle in `e2e/ergebnis.spec.ts`.
- [x] **4.5** Termine nach Monaten mit Datum, Termin, Zeitraum, Stelle, Art, „gesetzlich bis“ und Hinweis, vergangene grau und benannt; Kalenderdialog mit Horizont, Erinnerung, „nur offene“, „auch vor heute“ (E20). Geprüft: E3 und Dialog-Fälle in `e2e/termine.spec.ts`.
- [x] **4.6** Druckansicht (`src/ui/Druckansicht.tsx`, Druck-CSS mit A4 hoch, Hinweis und „Seite n von m“ auf jeder Seite, E17). Geprüft: E4 in `e2e/druck.spec.ts`; PDF aus Edge mit Beispiel C erzeugt und angesehen (5 Seiten A4, Kopf, Tabellen, Fußzeile mit Hinweistext und Seitenzahl). Robin sollte das PDF noch selbst ansehen.
- [x] **4.7** Regelansicht (`src/ui/schritte/RegelnSchritt.tsx`, lazy `src/ui/RegelAnsicht.tsx`): Kopf mit Katalog, Stand, Prüfwert, Regeln je Tabelle; DRD mit markierten Entscheidungen, Tabellen mit markierten Trefferzeilen, deutsche Bedienung, Knöpfe je Tabelle, Trefferliste, Quellen Q1–Q17, Wasserzeichen sichtbar (E18, E19). Geprüft: E6 und „Hauptbundle ohne dmn-js“ in `e2e/regeln.spec.ts`.
- [x] **4.8** Menü „Projekt“ mit Neu, Öffnen (Strg+O, auch Ziehen ins Fenster), Als Datei speichern (Strg+S; setzt `gespeichert`), Drucken, Lokale Daten löschen, Über (Lizenzen); Änderungshinweis nach dem Öffnen mit neuen, entfallenen und geänderten Pflichten; fremde oder kaputte Dateien mit Meldung. Geprüft: E5, SP6 und Fehlerfälle in `e2e/datei.spec.ts`.

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
