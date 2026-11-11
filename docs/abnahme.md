# Fachliche Abnahme Version 0.1 (Schritt 5.4)

**Status: offen.** Vorbereitet am 11.11.2026; die Abnahme selbst macht Robin. Prüfbar laut Spezifikation (11, Schritt 5.4): drei echte Profile durchgehen und für O3, O4, O9 und O10 festlegen, wer klärt und was die App bis dahin anzeigt. Die bisherigen Annahmen stehen in [entscheidungen.md](entscheidungen.md), der Arbeitsstand in [stand.md](stand.md).

## Ablauf

1. App starten: `npm run build`, dann `npx vite preview --port 4182 --strictPort` und `http://localhost:4182` öffnen (oder `npm run dev`, Port 5182).
2. Je Profil das Interview von „Neu beginnen“ an ausfüllen, nicht aus einem Beispiel.
3. Im Ergebnis jede Pflicht gegen die verlinkte Norm lesen: trifft sie zu, stimmt die Frist, stimmt die Stelle? „Warum?“ aufklappen und prüfen, ob die genannten Antworten die Pflicht wirklich auslösen.
4. Unter „Nicht geprüft“ prüfen, ob ein Bereich fehlt, der für das Profil wichtig wäre.
5. Unter „Termine“ die ersten Termine nachrechnen (Feiertage des Landes, „gesetzlich bis“).
6. Kalender exportieren und in Outlook und Google Kalender importieren; notieren, ob die Erinnerung übernommen wird (Risiko R12, Schritt 3.4).
7. Druckansicht als PDF speichern und ansehen (Schritt 4.6).
8. Funde unten eintragen; was sich ändern soll, als Aufgabe in [stand.md](stand.md) übernehmen.

## Drei Profile

| Nr. | Profil (Kurzbeschreibung) | Pflichten / nicht geprüft | Auffälligkeiten | Ergebnis |
| --- | --- | --- | --- | --- |
| 1 | | | | offen |
| 2 | | | | offen |
| 3 | | | | offen |

## Offene Fragen mit Folgen für die Anzeige

| Nr. | Frage | Was die App jetzt zeigt | Vorschlag der Spezifikation | Wer klärt | Entscheidung |
| --- | --- | --- | --- | --- | --- |
| O3 | Kleinunternehmergrenze im Gründungsjahr (25.000 € oder 100.000 €)? | Über 25.000 € im ersten Jahr der Hinweis „Kleinunternehmergrenze im Gründungsjahr“ (Lücke 16, Regel LU19); über 100.000 € rechnet die App ohne die Regelung und warnt. | BMF-Schreiben zu § 19 UStG oder Steuerberatung | offen | offen |
| O4 | Gilt für Gründungen 2026 im Jahr 2027 die Monatspflicht, weil § 18 Abs. 2 Satz 6 UStG ausläuft? | 2027 monatliche Voranmeldungen mit Prüfhinweis an jedem Termin. | vor Version 0.1 klären | offen | offen |
| O9 | BGB §§ 187–193: Verschiebung von Zahlungsterminen, Zeitpunkt des Beitragsnachweises, 24.12. und 31.12. als Bankarbeitstage? | Zahlungen am ursprünglichen Tag mit „gesetzlich bis“; SV-Termin einen Arbeitstag vor dem Nachweistag; 24.12. und 31.12. gelten als frei. | in Schritt 7.1 klären | offen | offen |
| O10 | Darf die App öffentlich erscheinen (Rechtsdienstleistungsgesetz, Steuerberatungsgesetz, Haftung)? | Hinweis „keine Rechtsberatung“ auf Start, Ergebnis, Druck, in jedem Kalendereintrag und in der Fußzeile, dazu in README und Release-Notizen. | rechtliche Prüfung vor jeder Veröffentlichung | Robin | Am 11.11.2026 veröffentlicht (Repo öffentlich, Release v0.1.0); siehe [entscheidungen.md](entscheidungen.md) |

## Weitere Punkte für Robin

- Eigene Kurzfassungen in Hilfetexten fachlich durchsehen, besonders F04 (Rechtsformen), F12 (Geschäftsführung), F15 (Geringfügigkeit) und die Hilfe-Spalte je Schritt (`src/ui/Hilfe.tsx`).
- Annahmen E1–E26 in [entscheidungen.md](entscheidungen.md) bestätigen oder ändern, besonders E21 und E26 aus der Prüfung vom 11.11.2026 (bei Kleinunternehmerregelung über 100.000 € fragt die App auch F28–F31; F13 und F23 nur von 1900 bis 2099); die übrigen offenen Fragen O1, O2, O5–O8 und O11–O16 bleiben für Phase 7.
- ~~Privates GitHub-Repo anlegen und pushen~~: erledigt; das Repo ist seit dem 11.11.2026 öffentlich (siehe [stand.md](stand.md)).
