# Lizenzen der verwendeten Bibliotheken

Versionen und Lizenzen nach `npm view <paket> version license` (11.11.2026), wie in Abschnitt 7.1 der [Spezifikation](spezifikation.md). Die Lizenz des Pflichten-Kompasses selbst ist noch nicht festgelegt (wie beim Prozesslotsen, offene Frage O14).

## Im Programm

| Paket | Version | Lizenz | Einsatz | seit |
| --- | --- | --- | --- | --- |
| react, react-dom | 19.3.1 | MIT | Oberfläche | 0.1 |
| dmn-moddle | 12.2.1 | MIT | DMN-1.3-XML lesen | 2.4 |
| dmn-js | 18.0.3 | bpmn.io-Lizenz: MIT-Text plus Pflicht, das bpmn.io-Wasserzeichen sichtbar zu lassen | Anzeige von DRD und Entscheidungstabellen, lazy geladen | 4.7 (im Test ab 2.3) |
| feiertagejs | 1.5.1 | MIT, ohne Abhängigkeiten | Feiertage je Land | 3.1 |

**bpmn.io-Wasserzeichen:** Die Lizenz von dmn-js verlangt, dass das bpmn.io-Logo in der Anzeige sichtbar und unverdeckt bleibt. Die Regelansicht (Schritt 4.7) verdeckt es nicht; der Browsertest E6 prüft das.

## Nur in der Entwicklung

| Paket | Version | Lizenz | Einsatz |
| --- | --- | --- | --- |
| typescript | 7.0.2 | Apache-2.0 | Sprache |
| vite, @vitejs/plugin-react | 8.3.7, 6.3.0 | MIT | Build |
| vitest | 5.1.0 | MIT | Unit-Tests |
| @playwright/test | 1.65.0 | Apache-2.0 | Browsertests |
| @axe-core/playwright | 4.14.0 | MPL-2.0 | Barrierefreiheit in den Browsertests |
| oxlint | 1.93.0 | MIT | Lint |
| @types/react, @types/react-dom, @types/node | 19.3.0, 19.3.0, 24.19.2 | MIT | Typen |
| feelin | 8.2.0 | MIT | nur Test-Orakel für die FEEL-Teilmenge (ab 2.2) |

Verworfen (Spezifikation 7.1): `date-holidays` wegen „CC-BY-SA-4.0“ für die Daten, ICS-Bibliotheken und zod.
