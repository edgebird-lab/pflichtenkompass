# Fragenkatalog

> Erzeugt aus `src/modell/fragen.ts` mit `npm run doku`; nicht von Hand ändern.

32 Fragen in fünf Schritten (Abschnitt 5.2 der [Spezifikation](spezifikation.md)). Ausgeblendete Fragen behalten ihren Standardwert und wirken nicht. Pflichtfelder: F02, F03, F04, F06, F09, F19.

## 1. Vorhaben

| ID | Frage | Typ | Sichtbar | Standard | Hilfe | Normen |
| --- | --- | --- | --- | --- | --- | --- |
| F01 | Wie heißt das Vorhaben? | Text | immer | leer | Freiwillig, höchstens 80 Zeichen. Der Name erscheint in Kalender und Druck. | – |
| F02 * | Wann beginnt die Tätigkeit? | Datum | immer | 1. des Folgemonats | Zwischen 01.01.2026 und 31.12.2030. Der Beginn ist der Bezugspunkt aller Fristen. | – |
| F03 * | In welchem Bundesland liegt der Betrieb? | Auswahl: 16 Optionen | immer | keine Vorauswahl | Die Feiertage des Landes verschieben Fristen auf den nächsten Werktag (§ 108 Abs. 3 AO). | [§ 108 Abs. 3 AO](https://www.gesetze-im-internet.de/ao_1977/__108.html) |
| F04 * | Welche Rechtsform hat das Unternehmen? | Auswahl: Einzelunternehmen · GbR · UG (haftungsbeschränkt) · GmbH | immer | Einzelunternehmen | Einzelunternehmen: eine Person. GbR: mehrere Personen; mit Handelsgewerbe ist sie eine OHG. UG und GmbH bestehen als solche erst mit der Eintragung ins Handelsregister; die UG zahlt ihr Stammkapital voll ein und bildet eine gesetzliche Rücklage. | [§ 11 GmbHG](https://www.gesetze-im-internet.de/gmbhg/__11.html), [§ 5a GmbHG](https://www.gesetze-im-internet.de/gmbhg/__5a.html) |
| F05 | Ist die GbR im Gesellschaftsregister eingetragen? | ja/nein | F04 = GbR | nein | Eingetragene Personengesellschaften teilen ihre wirtschaftlich Berechtigten dem Transparenzregister mit (§ 20 GwG). | [§ 20 GwG](https://www.gesetze-im-internet.de/gwg_2017/__20.html) |
| F06 * | Ist die Tätigkeit gewerblich oder freiberuflich? | Auswahl: gewerblich · freiberuflich | immer | gewerblich | Freie Berufe stehen im Katalog von § 18 Abs. 1 Nr. 1 EStG. Im Zweifel „gewerblich“ wählen. | [§ 18 Abs. 1 Nr. 1 EStG](https://www.gesetze-im-internet.de/estg/__18.html) |
| F07 | Braucht der Betrieb nach Art und Umfang eine kaufmännische Einrichtung? | Auswahl: ja · nein · unklar | F04 ∈ {Einzelunternehmen, GbR} und F06 = gewerblich | nein | Dann ist er ein Handelsgewerbe (§ 1 Abs. 2 HGB). Das Gesetz nennt keine festen Grenzen; bei „unklar“ zeigt die App einen Prüfhinweis. | [§ 1 Abs. 2 HGB](https://www.gesetze-im-internet.de/hgb/__1.html) |
| F08 | Ist eine Steuerberatung beauftragt? | ja/nein | immer | nein | Mit Beratung gelten längere Fristen für die Steuererklärungen (§ 149 Abs. 3 AO). | [§ 149 Abs. 3 AO](https://www.gesetze-im-internet.de/ao_1977/__149.html) |

## 2. Tätigkeit

| ID | Frage | Typ | Sichtbar | Standard | Hilfe | Normen |
| --- | --- | --- | --- | --- | --- | --- |
| F09 * | In welchen Bereichen ist der Betrieb tätig? | Mehrfachauswahl: Handel vor Ort oder Großhandel · Onlinehandel · Handwerk · Gastronomie · Dienstleistung | immer | keine; mindestens eine | Mehrere Antworten möglich, mindestens eine. | – |
| F10 | Welche Art von Handwerk? | Auswahl: zulassungspflichtig (Anlage A) · zulassungsfrei (Anlage B1) · handwerksähnlich (Anlage B2) · unklar | F09 enthält Handwerk | unklar | Zulassungspflichtige Handwerke stehen in Anlage A, zulassungsfreie in Anlage B1 und handwerksähnliche Gewerbe in Anlage B2 der Handwerksordnung (§§ 1, 18 HwO). | [§ 1 HwO](https://www.gesetze-im-internet.de/hwo/__1.html), [§ 18 HwO](https://www.gesetze-im-internet.de/hwo/__18.html) |
| F11 | Werden Lebensmittel hergestellt, behandelt oder ausgegeben, z. B. in Küche oder an der Theke? | ja/nein | immer | ja bei Gastronomie, sonst nein | Wer mit bestimmten Lebensmitteln arbeitet, braucht eine Belehrung nach § 43 IfSG; welche Tätigkeiten erfasst sind, regelt § 42 IfSG. | [§ 42 IfSG](https://www.gesetze-im-internet.de/ifsg/__42.html), [§ 43 IfSG](https://www.gesetze-im-internet.de/ifsg/__43.html) |

## 3. Personal

| ID | Frage | Typ | Sichtbar | Standard | Hilfe | Normen |
| --- | --- | --- | --- | --- | --- | --- |
| F12 | Gibt es Beschäftigte, auch Aushilfen oder Minijobs? | ja/nein | immer | nein | Den Sozialversicherungsstatus der Geschäftsführung einer UG oder GmbH klärt eine Statusfeststellung; die App weist darauf hin. | – |
| F13 | Ab wann? | Datum | F12 = ja | = F02 | Beginn der ersten Beschäftigung; Bezugspunkt der Meldungen. | – |
| F14 | Wie viele sozialversicherungspflichtig Beschäftigte? | Zahl | F12 = ja | 0 | Ganze Zahl ab 0. | – |
| F15 | Wie viele Minijobs mit geringfügigem Entgelt? | Zahl | F12 = ja | 0 | Geringfügig: Entgelt regelmäßig nicht über der Geringfügigkeitsgrenze im Monat. Grenze = Mindestlohn × 130 / 3, auf volle Euro aufgerundet (§ 8 Abs. 1 Nr. 1, Abs. 1a SGB IV). | [§ 8 Abs. 1 Nr. 1, Abs. 1a SGB IV](https://www.gesetze-im-internet.de/sgb_4/__8.html) |
| F16 | Wird für die Minijobs die einheitliche Pauschsteuer von 2 % gezahlt? | ja/nein | F12 = ja und F15 > 0 | ja | Dann läuft die Lohnsteuer der Minijobs über die Knappschaft-Bahn-See (§ 40a Abs. 2, 6 EStG). | [§ 40a Abs. 2, 6 EStG](https://www.gesetze-im-internet.de/estg/__40a.html) |
| F17 | Gehört der Betrieb zu einem Bereich mit Sofortmeldepflicht? | ja/nein | F12 = ja | ja bei Gastronomie, sonst nein | Bereiche nach § 28a Abs. 4 SGB IV: Bau; Gaststätten und Beherbergung; Personenbeförderung; Spedition, Transport, Logistik einschließlich plattformbasierter Lieferdienste; Schausteller; Gebäudereinigung; Messebau; Fleischwirtschaft (ohne Fleischerhandwerk); Prostitution; Wach- und Sicherheit; Friseur und Kosmetik. | [§ 28a Abs. 4 SGB IV](https://www.gesetze-im-internet.de/sgb_4/__28a.html) |
| F18 | Wie hoch ist die Lohnsteuer im ersten vollen Monat voraussichtlich? | Betrag | Merkmal Lohnsteuerabzug: F12 = ja und (F14 > 0 oder F15 > 0 ohne Pauschsteuer) | leer (dann monatlich) | Sie bestimmt, ob die Lohnsteuer monatlich, vierteljährlich oder jährlich angemeldet wird (§ 41a Abs. 2 Satz 4 EStG). Ohne Angabe rechnet die App monatlich. | [§ 41a Abs. 2 Satz 4 EStG](https://www.gesetze-im-internet.de/estg/__41a.html) |

## 4. Verkauf

| ID | Frage | Typ | Sichtbar | Standard | Hilfe | Normen |
| --- | --- | --- | --- | --- | --- | --- |
| F19 * | Wer sind die Kunden? | Mehrfachauswahl: Privatleute in Deutschland · Unternehmen in Deutschland · Privatleute in anderen EU-Staaten · Unternehmen in anderen EU-Staaten | immer | Privatleute in Deutschland | Mehrere Antworten möglich, mindestens eine. | – |
| F20 | Gibt es eine geschäftliche Website, einen Onlineshop, eine App oder ein geschäftliches Social-Media-Profil? | ja/nein | immer | nein | Geschäftsmäßige digitale Dienste brauchen Anbieterangaben (§ 5 DDG); auch geschäftliche Profile prüfen. | [§ 5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html) |
| F21 | Werden Waren in Verpackungen, auch in Versandkartons, an Privatleute in Deutschland abgegeben? | ja/nein | immer | ja bei Onlinehandel mit Privatkunden, sonst nein | Hersteller systembeteiligungspflichtiger Verpackungen registrieren sich und beteiligen sich an einem System (§§ 3 Abs. 6, 6, 7 VerpackDG). Wer als Hersteller gilt, richtet sich nach der VO (EU) 2025/40; das ist hier nicht geprüft. | [§ 3 Abs. 6 VerpackDG](https://www.gesetze-im-internet.de/verpackdg/__3.html), [§ 6 VerpackDG](https://www.gesetze-im-internet.de/verpackdg/__6.html), [§ 7 VerpackDG](https://www.gesetze-im-internet.de/verpackdg/__7.html) |
| F22 | Welche Kasse wird genutzt? | Auswahl: keine · offene Ladenkasse · elektronische Kasse oder Kassen-App | immer | keine | Elektronische Kassen brauchen eine TSE und Belegausgabe und werden dem Finanzamt mitgeteilt (§ 146a AO). | [§ 146a AO](https://www.gesetze-im-internet.de/ao_1977/__146a.html) |
| F23 | Wann wurde die elektronische Kasse angeschafft? | Datum | F22 = elektronisch | = F02 | Die Anschaffung ist dem Finanzamt binnen 1 Monat mitzuteilen (§ 146a Abs. 4 AO). | [§ 146a Abs. 4 AO](https://www.gesetze-im-internet.de/ao_1977/__146a.html) |
| F24 | Wird Bargeld angenommen? | ja/nein | immer | ja, wenn F22 ≠ keine | Bareinnahmen und -ausgaben sind täglich festzuhalten (§ 146 Abs. 1 AO). | [§ 146 Abs. 1 AO](https://www.gesetze-im-internet.de/ao_1977/__146.html) |

## 5. Umsatz und Steuern

| ID | Frage | Typ | Sichtbar | Standard | Hilfe | Normen |
| --- | --- | --- | --- | --- | --- | --- |
| F25 | Wie hoch ist der Umsatz im ersten Kalenderjahr voraussichtlich (netto)? | Betrag | immer | 0 | Grenzen: 25.000 € und 100.000 € für Kleinunternehmer (§ 19 UStG), 800.000 € für die Buchführung (§ 141 AO, § 241a HGB). | [§ 19 UStG](https://www.gesetze-im-internet.de/ustg_1980/__19.html), [§ 141 AO](https://www.gesetze-im-internet.de/ao_1977/__141.html), [§ 241a HGB](https://www.gesetze-im-internet.de/hgb/__241a.html) |
| F26 | Wie hoch ist der Gewinn im ersten Kalenderjahr voraussichtlich? | Betrag | immer | 0 | Auch ein Verlust ist möglich. Grenze: 80.000 € für die Buchführung (§ 141 AO, § 241a HGB). | [§ 141 AO](https://www.gesetze-im-internet.de/ao_1977/__141.html), [§ 241a HGB](https://www.gesetze-im-internet.de/hgb/__241a.html) |
| F27 | Soll die Kleinunternehmerregelung genutzt werden? | ja/nein | immer | nein | Möglich bei höchstens 25.000 € Umsatz im Vorjahr und höchstens 100.000 € im laufenden Jahr (§ 19 Abs. 1 UStG). Ein Verzicht auf die Regelung bindet 5 Jahre. | [§ 19 UStG](https://www.gesetze-im-internet.de/ustg_1980/__19.html) |
| F28 | Wie hoch war der Gesamtumsatz 2026? | Betrag | F02 ≤ 31.12.2026, ohne Kleinunternehmerregelung (F27 = nein oder F25 über 100.000 €) und Kunden: Unternehmen in Deutschland | leer (dann ab 2027) | Über 800.000 € sind E-Rechnungen an inländische Unternehmen ab 2027 Pflicht, sonst ab 2028 (§ 27 Abs. 38 UStG). Ohne Angabe rechnet die App vorsichtig mit 2027. | [§ 27 Abs. 38 UStG](https://www.gesetze-im-internet.de/ustg_1980/__27.html) |
| F29 | Wie hoch ist die Umsatzsteuer-Zahllast 2026 voraussichtlich? | Betrag | F02 im Jahr 2026 und ohne Kleinunternehmerregelung (F27 = nein oder F25 über 100.000 €) | leer (dann monatlich) | Im Gründungsjahr 2026 richtet sich der Voranmeldungszeitraum nach der voraussichtlichen Steuer (§ 18 Abs. 2 Satz 6 UStG): über 9.000 € monatlich, sonst vierteljährlich. Ohne Angabe rechnet die App monatlich. | [§ 18 Abs. 2 Satz 6 UStG](https://www.gesetze-im-internet.de/ustg_1980/__18.html) |
| F30 | Wie hoch sind die Verkäufe an Privatleute in anderen EU-Staaten je Jahr voraussichtlich? | Betrag | Kunden: Privatleute in anderen EU-Staaten und ohne Kleinunternehmerregelung (F27 = nein oder F25 über 100.000 €) | 0 | Über 10.000 € gilt die Umsatzsteuer des Bestimmungslands (§ 3c Abs. 4 UStG). | [§ 3c Abs. 4 UStG](https://www.gesetze-im-internet.de/ustg_1980/__3c.html) |
| F31 | Wird eine Dauerfristverlängerung beantragt? | ja/nein | ohne Kleinunternehmerregelung (F27 = nein oder F25 über 100.000 €) | nein | Dann sind die Voranmeldungen einen Monat später fällig; bei monatlicher Abgabe mit Sondervorauszahlung (§§ 46–48 UStDV). | [§ 46 UStDV](https://www.gesetze-im-internet.de/ustdv_1980/__46.html), [§ 47 UStDV](https://www.gesetze-im-internet.de/ustdv_1980/__47.html), [§ 48 UStDV](https://www.gesetze-im-internet.de/ustdv_1980/__48.html) |
| F32 | Hat das Finanzamt Einkommensteuer-Vorauszahlungen festgesetzt? | ja/nein | F04 ∈ {Einzelunternehmen, GbR} | nein | Festgesetzte Vorauszahlungen sind am 10.03., 10.06., 10.09. und 10.12. fällig (§ 37 Abs. 1 EStG). | [§ 37 Abs. 1 EStG](https://www.gesetze-im-internet.de/estg/__37.html) |

`*` Pflichtfeld: Das Ergebnis erscheint erst nach einer Antwort (6.9).
