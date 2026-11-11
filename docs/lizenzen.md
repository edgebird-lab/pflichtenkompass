# Lizenzen der verwendeten Bibliotheken

Versionen und Lizenzen nach `npm view <paket> version license` (11.11.2026), wie in Abschnitt 7.1 der [Spezifikation](spezifikation.md). Die Lizenz des Pflichten-Kompasses selbst ist noch nicht festgelegt (wie beim Prozesslotsen, offene Frage O14).

## Im Programm

| Paket | Version | Lizenz | Einsatz | seit |
| --- | --- | --- | --- | --- |
| react, react-dom | 19.3.1 | MIT | Oberfläche | 0.1 |
| dmn-moddle | 12.2.1 | MIT | DMN-1.3-XML lesen | 2.4 |
| dmn-js | 18.0.3 | bpmn.io-Lizenz: MIT-Text plus Pflicht, das bpmn.io-Wasserzeichen sichtbar zu lassen | Anzeige von DRD und Entscheidungstabellen, lazy geladen | 4.7 (im Test ab 2.3) |
| feiertagejs | 1.5.1 | MIT, ohne Abhängigkeiten | Feiertage je Land | 3.1 |
| @tauri-apps/api | 2.12.4 | Apache-2.0 OR MIT | Windows-Programm: Aufrufe des Rust-Teils, nur dort per dynamischem Import geladen | 6.1 |

## Im Windows-Programm (Rust, `src-tauri/Cargo.lock`)

| Crate | Version | Lizenz | Einsatz |
| --- | --- | --- | --- |
| tauri | 2.12.5 | Apache-2.0 OR MIT | Fenster mit WebView2, Befehle, Menü |
| tauri-plugin-dialog | 2.8.4 | Apache-2.0 OR MIT | Dialoge zum Öffnen und Speichern |
| tauri-plugin-opener | 2.7.3 | Apache-2.0 OR MIT | Quellenlinks im Standardbrowser (nur über `oeffne_link` mit Erlaubnisliste) |
| tauri-plugin-single-instance | 2.5.5 | Apache-2.0 OR MIT | zweiter Start mit Datei landet im laufenden Programm |
| webview2-com, windows | 0.39.1, 0.62.2 | MIT; MIT OR Apache-2.0 | PDF der Druckansicht direkt aus WebView2 |
| serde, serde_json | 1.0 | MIT OR Apache-2.0 | Daten zwischen Rust und Oberfläche |

Der Installer (NSIS) lädt bei Bedarf den WebView2-Bootstrapper von Microsoft; Windows 10 und 11 bringen die WebView2-Laufzeit meist schon mit.

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
| @tauri-apps/cli | 2.12.4 | Apache-2.0 OR MIT | Windows-Programm bauen, Symbole erzeugen (ab 6.1) |

Verworfen (Spezifikation 7.1): `date-holidays` wegen „CC-BY-SA-4.0“ für die Daten, ICS-Bibliotheken und zod.
