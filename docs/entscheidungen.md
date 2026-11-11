# Entscheidungen und Annahmen

Offene Fragen der [Spezifikation](spezifikation.md) (Abschnitt 10.2) und Punkte, die sie nicht festlegt. Wo nichts anderes steht, gilt: **Annahme, bis Robin entscheidet.** Jede Annahme lässt sich ohne Umbau ändern; die Stelle im Code steht dabei.

## Offene Fragen der Spezifikation (O1–O16)

| Nr. | Frage | Annahme bis zur Entscheidung |
| --- | --- | --- |
| O1 | Mindestlohn 2026/2027, Geringfügigkeitsgrenze | Annahme, bis Robin entscheidet: nur die Formel zeigen (Vorschlag der Spezifikation). |
| O2 | DEÜV-Fristen | Annahme, bis Robin entscheidet: Beschäftigungsbeginn als Termin (Vorschlag der Spezifikation). |
| O3 | Kleinunternehmergrenze im Gründungsjahr | Annahme, bis Robin entscheidet: Lücke 16 „Kleinunternehmergrenze im Gründungsjahr“ ab 25.000 € (Regel LU19). |
| O4 | § 18 Abs. 2 Satz 6 UStG läuft 2026 aus | Annahme, bis Robin entscheidet: Wortlaut, also 2027 monatlich, mit Prüfhinweis (6.8.4). |
| O5 | Gewerbe- und Körperschaftsteuer | Annahme, bis Robin entscheidet: Lücken 1 und 2, Aufnahme in Phase 7. |
| O6 | Herstellerbegriff VO (EU) 2025/40 | Annahme, bis Robin entscheidet: Frage F21 wie spezifiziert, Hinweis an Pflicht 39. |
| O7 | Gastronomie-Landesrecht, Lebensmittelregistrierung | Annahme, bis Robin entscheidet: Lücken 3 und 4 bleiben. |
| O8 | Landesfeiertage nicht gegen Gesetze geprüft | Annahme, bis Robin entscheidet: konservative Behandlung nach 6.8.1. |
| O9 | BGB §§ 187–193, Nachweistag, 24.12./31.12. | Annahme, bis Robin entscheidet: Termin einen Arbeitstag vor dem Nachweistag, 24.12. und 31.12. frei. |
| O10 | Veröffentlichung (RDG, StBerG, Haftung) | Annahme, bis Robin entscheidet: Repo bleibt privat, keine Veröffentlichung. |
| O11 | § 41a Abs. 2 Satz 3 EStG, Umrechnung | Annahme, bis Robin entscheidet: Schätzung aus F18 × 12. |
| O12 | § 17 MiLoG und § 2a SchwarzArbG | Annahme, bis Robin entscheidet: nicht aufgenommen, Teil der Lücke 7. |
| O13 | E-Bilanz bei UG/GmbH über das KStG | Annahme, bis Robin entscheidet: Pflicht 27 mit Hinweis „nicht geprüft“. |
| O14 | Name, Dateiendung, privates Repo, Lizenz | Annahme, bis Robin entscheidet: „Pflichten-Kompass“, `.pflichtenkompass`, Repo `edgebird-lab/pflichtenkompass` privat, Lizenz noch nicht festgelegt (wie Prozesslotse). |
| O15 | Bestandsunternehmen (Start vor 2026) | Annahme, bis Robin entscheidet: nicht unterstützt; F02 ab 01.01.2026. |
| O16 | OSS-Frist am Wochenende | Annahme, bis Robin entscheidet: kein `gesetzlichBis` (6.8.2). |

## Umsetzung

| Nr. | Thema | Entscheidung |
| --- | --- | --- |
| E1 | CI | Die CI prüft Lint, Unit-Tests und Build. Die Browsertests laufen vorerst nur lokal mit Edge (Vorgabe des Arbeitsauftrags; spart Minuten im privaten Repo). Annahme, bis Robin entscheidet; ein Schritt `npx playwright test` wie im Prozesslotsen lässt sich jederzeit ergänzen. |
| E2 | Ports | Vorschau und Browsertests auf 4182 mit `strictPort` (Prozesslotse: 4173), Dev-Server 5182. `PK_PORT` setzt einen anderen Port für parallele Arbeitskopien. |
| E3 | CSP | Das Vite-Plugin setzt die CSP direkt hinter `<meta charset>`, damit der Zeichensatz zuerst kommt und die CSP vor allen Skripten gilt. |
| E4 | Typen | Aufzählungen stehen als `as const`-Listen mit abgeleitetem Typ (`RECHTSFORMEN` → `Rechtsform`), damit Prüfung, Auswahlfelder und Typ dieselben Werte nutzen. Die Typen sind gleich denen aus Abschnitt 4. |
| E5 | Ergänzungen am Datenmodell | `Frage.sichtbarText` und `Frage.standardText` (für den erzeugten Fragenkatalog), `MerkmalInfo.einheit` (Beträge in „Warum?“ als Euro), `NormVerweis.bezug` (z. B. „UG/GmbH: § 137 AO“, wie in der Normenspalte von 6.6). `Projekt.gespeichert.pflichten[].id` ist Text statt `PflichtId`, damit eine Datei aus einer anderen Katalogversion entfallene Pflichten nennen kann. |
| E7 | Labels der Kundengruppen | 6.2 nennt für die vier Kunden-Merkmale gemeinsam das Label „Kundengruppen“. Damit „Warum?“ verständlich bleibt, heißen sie einzeln „Kunden: Privatleute in Deutschland“, „Kunden: Unternehmen in Deutschland“, „Kunden: Privatleute in anderen EU-Staaten“ und „Kunden: Unternehmen in anderen EU-Staaten“ (Texte aus F19). |
| E8 | Leere Intervalle | 6.4 lehnt leere Intervalle „(von > bis)“ ab. Abgelehnt werden auch Intervalle mit `von = bis` und offener Grenze wie `(1..1)`, weil sie ebenfalls nie zutreffen. Die DMN-Datei nutzt keine Intervalle. |
| E9 | Prüfung beim Laden | dmn-moddle überspringt nicht lesbare Teile (lax) und meldet sie nur als Warnung; eine Regel mit doppelter ID fiele so still weg. Der Lader wertet jede Warnung als Fehler: doppelte ID als V8, sonst V1. Außerdem prüft er über 6.10 hinaus, dass outputValues nur bekannte IDs nennen (V4), genau eine Annotationsspalte „Begründung“ existiert (V7) und string-Eingaben genau die erlaubten Werte als inputValues haben (V5, wie in 4.3 gefordert). Bei falscher Zahl der Einträge einer Regel meldet er nur diesen Fehler, nicht die versetzten Spalten. |
| E6 | Beispiele | Als Name (F01) tragen die Beispiele ihren Titel („Kaffeeversand“); 9.3 nennt keinen Namen, und er wirkt auf keine Regel. Standardprofil und Beispiele: `src/modell/profil.ts`, `src/modell/beispiele.ts`. |
