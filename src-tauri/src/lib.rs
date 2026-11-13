//! Windows-Programm des Pflichten-Kompasses (Spezifikation 7.6, Vorlage: Prozesslotse).
//!
//! Die Oberfläche bekommt keine allgemeinen Dateirechte. Sie ruft nur diese
//! Befehle auf, und geschrieben wird nur auf Pfade, die der Benutzer selbst
//! gewählt hat: im Dialog, per Doppelklick im Explorer oder ins Fenster gezogen.
//! Links öffnen nur über `oeffne_link`, nur mit https und nur für die
//! Erlaubnisliste. Das Hauptfenster zeigt nie eine fremde Seite.

use std::{
    collections::HashSet,
    path::{Path, PathBuf},
    sync::Mutex,
};

use serde::Serialize;
use tauri::{
    menu::{Menu, MenuBuilder, MenuItemBuilder, SubmenuBuilder},
    plugin::TauriPlugin,
    AppHandle, DragDropEvent, Emitter, Manager, Runtime, State, Url, WindowEvent, Wry,
};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_opener::OpenerExt;

/// Größte Datei, die geöffnet wird; gleich `MAX_DATEI_BYTES` in `src/modell/speicher.ts`.
const MAX_GROESSE: u64 = 1024 * 1024;

/// Endungen von Projektdateien. Nur solche Pfade darf `speichern` später überschreiben.
const PROJEKT_ENDUNGEN: [&str; 2] = ["pflichtenkompass", "json"];

/// Seiten, die im Standardbrowser öffnen dürfen: Normen und Quellen des Katalogs,
/// dazu bpmn.io (Wasserzeichen der Regelansicht, Pflicht aus der Lizenz von dmn-js).
const ERLAUBTE_HOSTS: [&str; 4] = ["www.gesetze-im-internet.de", "www.omg.org", "www.rfc-editor.org", "bpmn.io"];

/// Pfade, die der Benutzer in dieser Sitzung als Projektdatei gewählt hat.
#[derive(Default)]
struct Freigaben(Mutex<HashSet<PathBuf>>);

#[derive(Serialize, Clone, Debug)]
struct Datei {
    pfad: String,
    name: String,
    inhalt: String,
}

#[derive(Serialize)]
struct Gespeichert {
    pfad: String,
    name: String,
}

/// Was `speichern_unter` schreiben darf: Projektdatei, Kalender (.ics) oder Beratungsakte (.beratungsakte.json).
#[derive(Debug, PartialEq)]
enum Art {
    Projekt,
    Kalender,
    Beratungsakte,
}

impl Art {
    fn aus(text: &str) -> Result<Art, String> {
        match text {
            "projekt" => Ok(Art::Projekt),
            "kalender" => Ok(Art::Kalender),
            "beratungsakte" => Ok(Art::Beratungsakte),
            _ => Err(format!("Unbekannte Dateiart: {text}")),
        }
    }

    /// Filtername, Endung, Dialogtitel, Name der Testantwort (nur Debug-Build)
    fn dialog(&self) -> (&'static str, &'static str, &'static str, &'static str) {
        match self {
            Art::Projekt => ("Pflichten-Kompass-Projekt", "pflichtenkompass", "Speichern unter", "PFLICHTENKOMPASS_TEST_SPEICHERN_PROJEKT"),
            Art::Kalender => ("Kalender (*.ics)", "ics", "Kalender exportieren", "PFLICHTENKOMPASS_TEST_SPEICHERN_KALENDER"),
            // Export im offenen Format Beratungsakte v1; die Endung hat zwei Teile
            Art::Beratungsakte => ("Beratungsakte (*.beratungsakte.json)", "beratungsakte.json", "Für die Beratungsakte speichern", "PFLICHTENKOMPASS_TEST_SPEICHERN_BERATUNGSAKTE"),
        }
    }
}

fn dateiname(p: &Path) -> String {
    p.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default()
}

fn ist_projektpfad(p: &Path) -> bool {
    p.extension().and_then(|e| e.to_str()).is_some_and(|e| PROJEKT_ENDUNGEN.iter().any(|x| x.eq_ignore_ascii_case(e)))
}

fn lies(pfad: &Path) -> Result<Datei, String> {
    let groesse = std::fs::metadata(pfad).map_err(|e| format!("Die Datei ist nicht lesbar: {e}"))?.len();
    if groesse > MAX_GROESSE {
        return Err("Die Datei ist größer als 1 MB und wird nicht geöffnet.".into());
    }
    let bytes = std::fs::read(pfad).map_err(|e| format!("Die Datei ist nicht lesbar: {e}"))?;
    let inhalt = String::from_utf8(bytes).map_err(|_| "Die Datei ist keine Textdatei (UTF-8).".to_string())?;
    Ok(Datei { pfad: pfad.to_string_lossy().into_owned(), name: dateiname(pfad), inhalt })
}

/// Speichert über eine Hilfsdatei und Umbenennen, damit ein Absturz keine halbe Datei hinterlässt.
fn schreibe(p: &Path, inhalt: &str) -> Result<(), String> {
    let mut tmp = p.as_os_str().to_owned();
    tmp.push(".speichern.tmp");
    let tmp = PathBuf::from(tmp);
    std::fs::write(&tmp, inhalt).map_err(|e| format!("Speichern fehlgeschlagen: {e}"))?;
    std::fs::rename(&tmp, p).map_err(|e| {
        let _ = std::fs::remove_file(&tmp);
        format!("Speichern fehlgeschlagen: {e}")
    })
}

fn freigeben(app: &AppHandle, p: &Path) {
    if ist_projektpfad(p) {
        app.state::<Freigaben>().0.lock().unwrap().insert(p.to_path_buf());
    }
}

/// Öffnet eine vom Benutzer gewählte Datei: lesen und zum Speichern freigeben.
fn oeffne_gewaehlt(app: &AppHandle, p: &Path) -> Result<Datei, String> {
    let d = lies(p)?;
    freigeben(app, p);
    Ok(d)
}

/// Ergänzt die Endung, wenn der Benutzer einen Namen ohne Endung getippt hat (für Doppelklick und Filter).
/// Endungen aus mehreren Teilen („beratungsakte.json“) werden angehängt, wenn der Name nicht schon auf sie
/// endet; ein Punkt im Namen („Akte 2.0“) zählt dabei nicht als Endung. Endet der Name auf den letzten Teil
/// („x.json“), wird nur der Rest davor eingefügt: „x.beratungsakte.json“, nicht „x.json.beratungsakte.json“.
fn mit_endung(mut p: PathBuf, endung: &str) -> PathBuf {
    let Some((vorn, letzter)) = endung.rsplit_once('.') else {
        if p.extension().is_none() {
            p.set_extension(endung);
        }
        return p;
    };
    let datei = p.file_name().and_then(|n| n.to_str()).unwrap_or("").to_string();
    let name = datei.to_ascii_lowercase();
    let ganz = format!(".{}", endung.to_ascii_lowercase());
    if name.len() > ganz.len() && name.ends_with(&ganz) {
        return p;
    }
    let schluss = format!(".{}", letzter.to_ascii_lowercase());
    if name.len() > schluss.len() && name.ends_with(&schluss) && name != ganz {
        // Die Endung ist ASCII; der Schnitt liegt deshalb auf einer Zeichengrenze.
        let stamm = &datei[..datei.len() - schluss.len()];
        return p.with_file_name(format!("{stamm}.{vorn}.{letzter}"));
    }
    let mut s = p.into_os_string();
    s.push(".");
    s.push(endung);
    PathBuf::from(s)
}

/// Nur https, nur Hosts der Erlaubnisliste, ohne Benutzername und eigenen Port.
fn erlaubter_link(text: &str) -> Option<Url> {
    if text.len() > 2048 {
        return None;
    }
    let url = Url::parse(text).ok()?;
    let host = url.host_str()?;
    let ok = url.scheme() == "https" && url.username().is_empty() && url.password().is_none() && url.port().is_none() && ERLAUBTE_HOSTS.contains(&host);
    ok.then_some(url)
}

/// Das Hauptfenster zeigt nur die App: tauri.localhost (Windows), tauri://localhost
/// (andere Systeme), bei `tauri dev` den Entwicklungsserver auf Port 5182.
fn navigation_erlaubt(url: &Url) -> bool {
    match url.scheme() {
        "tauri" => url.host_str() == Some("localhost"),
        "http" | "https" => url.host_str() == Some("tauri.localhost") || (cfg!(dev) && url.host_str() == Some("localhost") && url.port() == Some(5182)),
        _ => false,
    }
}

fn navigationsschutz<R: Runtime>() -> TauriPlugin<R> {
    tauri::plugin::Builder::new("navigationsschutz").on_navigation(|_, url| navigation_erlaubt(url)).build()
}

/// Nur im Debug-Build: beantwortet Dateidialoge aus einer Umgebungsvariable, damit
/// automatische Tests die echten Abläufe ohne Klicks prüfen können. Im Release fehlt das.
#[cfg(debug_assertions)]
fn testantwort(variable: &str) -> Option<Option<PathBuf>> {
    std::env::var_os(variable).map(|v| if v.is_empty() { None } else { Some(PathBuf::from(v)) })
}
#[cfg(not(debug_assertions))]
fn testantwort(_variable: &str) -> Option<Option<PathBuf>> {
    None
}

/// Erste Datei aus der Befehlszeile (Doppelklick im Explorer, „Öffnen mit“).
fn datei_aus_argumenten(args: &[String], cwd: &Path) -> Option<PathBuf> {
    args.iter().skip(1).find(|a| !a.starts_with('-')).map(|a| cwd.join(a)).filter(|p| p.is_file())
}

#[tauri::command]
fn start_datei(app: AppHandle) -> Result<Option<Datei>, String> {
    let args: Vec<String> = std::env::args().collect();
    let cwd = std::env::current_dir().unwrap_or_default();
    match datei_aus_argumenten(&args, &cwd) {
        Some(p) => oeffne_gewaehlt(&app, &p).map(Some),
        None => Ok(None),
    }
}

#[tauri::command]
async fn oeffnen(app: AppHandle) -> Result<Option<Datei>, String> {
    let wahl = testantwort("PFLICHTENKOMPASS_TEST_OEFFNEN").unwrap_or_else(|| {
        app.dialog()
            .file()
            .set_title("Öffnen")
            .add_filter("Pflichten-Kompass-Projekt", &PROJEKT_ENDUNGEN)
            .blocking_pick_file()
            .and_then(|w| w.into_path().ok())
    });
    match wahl {
        Some(p) => oeffne_gewaehlt(&app, &p).map(Some),
        None => Ok(None),
    }
}

#[tauri::command]
fn speichern(pfad: String, inhalt: String, freigaben: State<Freigaben>) -> Result<(), String> {
    let p = PathBuf::from(&pfad);
    if !freigaben.0.lock().unwrap().contains(&p) {
        return Err("Dieser Pfad wurde nicht vom Benutzer gewählt.".into());
    }
    schreibe(&p, &inhalt)
}

#[tauri::command]
async fn speichern_unter(app: AppHandle, vorschlag: String, inhalt: String, art: String) -> Result<Option<Gespeichert>, String> {
    let art = Art::aus(&art)?;
    let (filter, endung, titel, variable) = art.dialog();
    let wahl = testantwort(variable)
        .unwrap_or_else(|| app.dialog().file().set_title(titel).set_file_name(&vorschlag).add_filter(filter, &[endung]).blocking_save_file().and_then(|w| w.into_path().ok()));
    let Some(p) = wahl else { return Ok(None) };
    let p = mit_endung(p, endung);
    schreibe(&p, &inhalt)?;
    if art == Art::Projekt {
        freigeben(&app, &p);
    }
    Ok(Some(Gespeichert { pfad: p.to_string_lossy().into_owned(), name: dateiname(&p) }))
}

/// Öffnet eine Quelle im Standardbrowser. Im Debug-Build schreibt `PFLICHTENKOMPASS_TEST_LINKS`
/// die Adresse stattdessen in eine Datei, damit Tests keinen Browser starten.
#[tauri::command]
fn oeffne_link(app: AppHandle, url: String) -> Result<(), String> {
    let Some(url) = erlaubter_link(&url) else {
        return Err("Dieser Link ist im Programm nicht freigegeben.".into());
    };
    #[cfg(debug_assertions)]
    if let Some(datei) = std::env::var_os("PFLICHTENKOMPASS_TEST_LINKS") {
        use std::io::Write;
        let mut f = std::fs::OpenOptions::new().create(true).append(true).open(datei).map_err(|e| e.to_string())?;
        return writeln!(f, "{url}").map_err(|e| e.to_string());
    }
    app.opener().open_url(url.as_str(), None::<&str>).map_err(|e| format!("Der Browser ließ sich nicht öffnen: {e}"))
}

/// PDF direkt aus der WebView2 (ohne Druckdialog) in A4 mit den Rändern der Druck-CSS
/// (`@page` in `src/styles.css`: 16 mm oben, 14 mm seitlich, 22 mm unten für Hinweis und Seitenzahl).
#[cfg(windows)]
fn drucke_pdf(fenster: &tauri::WebviewWindow, ziel: String) -> Result<(), String> {
    let (tx, rx) = std::sync::mpsc::channel::<Result<(), String>>();
    fenster
        .with_webview(move |wv| unsafe {
            use webview2_com::{
                Microsoft::Web::WebView2::Win32::{ICoreWebView2_7, ICoreWebView2Environment6},
                PrintToPdfCompletedHandler,
            };
            use windows::core::{Interface, HSTRING};
            let tx2 = tx.clone();
            let start = (|| -> windows::core::Result<()> {
                let core7: ICoreWebView2_7 = wv.controller().CoreWebView2()?.cast()?;
                let umgebung: ICoreWebView2Environment6 = wv.environment().cast()?;
                let einstellungen = umgebung.CreatePrintSettings()?;
                // Maße in Zoll (1 Zoll = 25,4 mm): A4 = 210 × 297 mm
                let zoll = |mm: f64| mm / 25.4;
                einstellungen.SetPageWidth(zoll(210.0))?;
                einstellungen.SetPageHeight(zoll(297.0))?;
                einstellungen.SetMarginTop(zoll(16.0))?;
                einstellungen.SetMarginBottom(zoll(22.0))?;
                einstellungen.SetMarginLeft(zoll(14.0))?;
                einstellungen.SetMarginRight(zoll(14.0))?;
                einstellungen.SetShouldPrintBackgrounds(true)?;
                let fertig = PrintToPdfCompletedHandler::create(Box::new(move |hr, ok| {
                    let _ = tx2.send(if hr.is_ok() && ok { Ok(()) } else { Err(format!("PDF fehlgeschlagen: {hr:?}")) });
                    Ok(())
                }));
                core7.PrintToPdf(&HSTRING::from(ziel.as_str()), &einstellungen, &fertig)
            })();
            if let Err(e) = start {
                let _ = tx.send(Err(e.to_string()));
            }
        })
        .map_err(|e| e.to_string())?;
    rx.recv_timeout(std::time::Duration::from_secs(60)).map_err(|e| e.to_string())?
}

#[tauri::command]
async fn als_pdf(app: AppHandle, fenster: tauri::WebviewWindow, vorschlag: String) -> Result<Option<String>, String> {
    #[cfg(windows)]
    {
        let wahl = testantwort("PFLICHTENKOMPASS_TEST_PDF")
            .unwrap_or_else(|| app.dialog().file().set_title("Als PDF speichern").set_file_name(&vorschlag).add_filter("PDF", &["pdf"]).blocking_save_file().and_then(|w| w.into_path().ok()));
        let Some(p) = wahl else { return Ok(None) };
        let ziel = mit_endung(p, "pdf").to_string_lossy().into_owned();
        let z = ziel.clone();
        tauri::async_runtime::spawn_blocking(move || drucke_pdf(&fenster, z)).await.map_err(|e| e.to_string())??;
        Ok(Some(ziel))
    }
    #[cfg(not(windows))]
    {
        let _ = (app, fenster, vorschlag);
        Err("PDF ohne Druckdialog gibt es nur unter Windows.".into())
    }
}

fn baue_menue(app: &AppHandle) -> tauri::Result<Menu<Wry>> {
    let punkt = |id: &str, text: &str| MenuItemBuilder::with_id(id, text).build(app);
    let datei = SubmenuBuilder::new(app, "&Datei")
        .item(&punkt("neu", "&Neu beginnen")?)
        .item(&punkt("oeffnen", "Ö&ffnen …\tStrg+O")?)
        .separator()
        .item(&punkt("speichern", "&Speichern\tStrg+S")?)
        .item(&punkt("speichernUnter", "Speichern &unter …\tStrg+Umschalt+S")?)
        .separator()
        .item(&punkt("kalender", "&Kalender exportieren …")?)
        .item(&punkt("drucken", "&Drucken …")?)
        .item(&punkt("pdf", "Als &PDF speichern …")?)
        .separator()
        .item(&punkt("beenden", "&Beenden")?)
        .build()?;
    let hilfe = SubmenuBuilder::new(app, "&Hilfe").item(&punkt("ueber", "Ü&ber den Pflichten-Kompass")?).build()?;
    MenuBuilder::new(app).items(&[&datei, &hilfe]).build()
}

/// Bringt das Hauptfenster nach vorn, z. B. wenn ein zweiter Start eine Datei übergibt.
fn zeige_hauptfenster(app: &AppHandle) {
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.unminimize();
        let _ = w.set_focus();
    }
}

/// Meldet der Oberfläche eine vom Benutzer übergebene Datei (zweiter Start, ins Fenster gezogen).
fn melde_datei(app: &AppHandle, p: &Path) {
    let _ = match oeffne_gewaehlt(app, p) {
        Ok(d) => app.emit("datei-oeffnen", d),
        Err(e) => app.emit("datei-fehler", (dateiname(p), e)),
    };
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Zuerst: Ein zweiter Start (Doppelklick auf eine weitere Datei) landet im laufenden Programm.
        .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
            if let Some(p) = datei_aus_argumenten(&args, Path::new(&cwd)) {
                melde_datei(app, &p);
            }
            zeige_hauptfenster(app);
        }))
        .plugin(navigationsschutz())
        .plugin(tauri_plugin_dialog::init())
        // Links nur über `oeffne_link`; das Plugin fängt keine Klicks ab, und die Oberfläche hat keine Rechte daran
        .plugin(tauri_plugin_opener::Builder::new().open_js_links_on_click(false).build())
        .manage(Freigaben::default())
        .setup(|app| {
            let menue = baue_menue(app.handle())?;
            app.set_menu(menue)?;
            app.on_menu_event(|app, ereignis| {
                let id = ereignis.id().as_ref();
                if id == "beenden" {
                    // Über das normale Schließen, damit die Oberfläche ihren Stand noch sichert
                    if let Some(w) = app.get_webview_window("main") {
                        let _ = w.close();
                    }
                } else {
                    let _ = app.emit("menue", id);
                }
            });
            Ok(())
        })
        .on_window_event(|fenster, ereignis| {
            // Datei ins Fenster gezogen: Das ist eine Auswahl des Benutzers, also freigeben.
            if let WindowEvent::DragDrop(DragDropEvent::Drop { paths, .. }) = ereignis {
                if let Some(p) = paths.iter().find(|p| p.is_file()) {
                    melde_datei(fenster.app_handle(), p);
                }
            }
        })
        .invoke_handler(tauri::generate_handler![start_datei, oeffnen, speichern, speichern_unter, als_pdf, oeffne_link])
        .run(tauri::generate_context!())
        .expect("Der Pflichten-Kompass konnte nicht starten");
}

#[cfg(test)]
mod tests {
    use super::*;

    fn testordner(name: &str) -> PathBuf {
        let ordner = std::env::temp_dir().join(format!("pflichtenkompass-test-{name}"));
        std::fs::create_dir_all(&ordner).unwrap();
        ordner
    }

    #[test]
    fn findet_die_datei_in_den_argumenten() {
        let ordner = testordner("argumente");
        let datei = ordner.join("beispiel.pflichtenkompass");
        std::fs::write(&datei, "{}").unwrap();
        let args = vec!["pflichtenkompass.exe".to_string(), "--flag".to_string(), "beispiel.pflichtenkompass".to_string()];
        assert_eq!(datei_aus_argumenten(&args, &ordner), Some(datei.clone()));
        let ohne = vec!["pflichtenkompass.exe".to_string()];
        assert_eq!(datei_aus_argumenten(&ohne, &ordner), None);
        let fehlt = vec!["pflichtenkompass.exe".to_string(), "gibt-es-nicht.pflichtenkompass".to_string()];
        assert_eq!(datei_aus_argumenten(&fehlt, &ordner), None);
    }

    #[test]
    fn speichert_atomar_und_liest_wieder() {
        let ordner = testordner("schreiben");
        let datei = ordner.join("projekt.pflichtenkompass");
        schreibe(&datei, "{\"a\":1}").unwrap();
        schreibe(&datei, "{\"a\":\"Größe\"}").unwrap();
        let gelesen = lies(&datei).unwrap();
        assert_eq!(gelesen.inhalt, "{\"a\":\"Größe\"}");
        assert_eq!(gelesen.name, "projekt.pflichtenkompass");
        assert!(!ordner.join("projekt.pflichtenkompass.speichern.tmp").exists());
    }

    #[test]
    fn lehnt_binaerdateien_und_zu_grosse_dateien_ab() {
        let ordner = testordner("lesen");
        let binaer = ordner.join("bild.pflichtenkompass");
        std::fs::write(&binaer, [0xff, 0xfe, 0x00, 0xd8]).unwrap();
        assert!(lies(&binaer).unwrap_err().contains("UTF-8"));
        let gross = ordner.join("gross.pflichtenkompass");
        std::fs::write(&gross, vec![b' '; MAX_GROESSE as usize + 1]).unwrap();
        assert!(lies(&gross).unwrap_err().contains("größer als 1 MB"));
        let genau = ordner.join("genau.pflichtenkompass");
        std::fs::write(&genau, vec![b' '; MAX_GROESSE as usize]).unwrap();
        assert!(lies(&genau).is_ok());
    }

    #[test]
    fn kennt_nur_projekt_kalender_und_beratungsakte() {
        assert_eq!(Art::aus("projekt"), Ok(Art::Projekt));
        assert_eq!(Art::aus("kalender"), Ok(Art::Kalender));
        assert_eq!(Art::aus("beratungsakte"), Ok(Art::Beratungsakte));
        assert_eq!(Art::Beratungsakte.dialog().0, "Beratungsakte (*.beratungsakte.json)");
        assert_eq!(Art::Beratungsakte.dialog().1, "beratungsakte.json");
        assert!(Art::aus("exe").is_err());
        assert!(Art::aus("").is_err());
        assert_eq!(Art::Kalender.dialog().1, "ics");
        assert_eq!(Art::Projekt.dialog().1, "pflichtenkompass");
    }

    #[test]
    fn ergaenzt_nur_fehlende_endungen() {
        assert_eq!(mit_endung(PathBuf::from("C:/a/Kalender"), "ics"), PathBuf::from("C:/a/Kalender.ics"));
        assert_eq!(mit_endung(PathBuf::from("C:/a/b.ics"), "ics"), PathBuf::from("C:/a/b.ics"));
        assert_eq!(mit_endung(PathBuf::from("C:/a/Café GmbH"), "pflichtenkompass"), PathBuf::from("C:/a/Café GmbH.pflichtenkompass"));
        assert_eq!(mit_endung(PathBuf::from("C:/a/Elektro-GmbH-pflichtenkompass-2026-11-13"), "beratungsakte.json"), PathBuf::from("C:/a/Elektro-GmbH-pflichtenkompass-2026-11-13.beratungsakte.json"));
        assert_eq!(mit_endung(PathBuf::from("C:/a/b.beratungsakte.json"), "beratungsakte.json"), PathBuf::from("C:/a/b.beratungsakte.json"));
    }

    #[test]
    fn ergaenzt_die_zweiteilige_endung_ohne_den_namen_zu_verstuemmeln() {
        let akte = "beratungsakte.json";
        let p = PathBuf::from;
        assert_eq!(mit_endung(p("C:/a/b.BERATUNGSAKTE.JSON"), akte), p("C:/a/b.BERATUNGSAKTE.JSON"));
        // „.json“ wird ergänzt, nicht verdoppelt
        assert_eq!(mit_endung(p("C:/a/x.json"), akte), p("C:/a/x.beratungsakte.json"));
        assert_eq!(mit_endung(p("C:/a/x.JSON"), akte), p("C:/a/x.beratungsakte.json"));
        assert_eq!(mit_endung(p("C:/a/Akte 2.0.json"), akte), p("C:/a/Akte 2.0.beratungsakte.json"));
        // Punkt im Namen: Endung angehängt, nichts abgeschnitten
        assert_eq!(mit_endung(p("C:/a/Akte 2.0"), akte), p("C:/a/Akte 2.0.beratungsakte.json"));
        assert_eq!(mit_endung(p("C:/a/Muster-Co.-KG-pflichtenkompass-2026-11-13"), akte), p("C:/a/Muster-Co.-KG-pflichtenkompass-2026-11-13.beratungsakte.json"));
        assert_eq!(mit_endung(p("C:/a/b.pflichtenkompass"), akte), p("C:/a/b.pflichtenkompass.beratungsakte.json"));
        assert_eq!(mit_endung(p("C:/a/.json"), akte), p("C:/a/.json.beratungsakte.json"));
    }

    #[test]
    fn gibt_nur_projektdateien_zum_speichern_frei() {
        assert!(ist_projektpfad(Path::new("C:/a/b.pflichtenkompass")));
        assert!(ist_projektpfad(Path::new("C:/a/b.JSON")));
        assert!(!ist_projektpfad(Path::new("C:/a/b.ics")));
        assert!(!ist_projektpfad(Path::new("C:/a/b.exe")));
        assert!(!ist_projektpfad(Path::new("C:/a/b")));
    }

    #[test]
    fn oeffnet_nur_https_links_der_erlaubnisliste() {
        for ok in [
            "https://www.gesetze-im-internet.de/ao_1977/__108.html",
            "https://www.omg.org/spec/DMN/1.3/",
            "https://www.rfc-editor.org/rfc/rfc5545",
            "https://bpmn.io",
            "https://www.gesetze-im-internet.de:443/hgb/",
        ] {
            assert!(erlaubter_link(ok).is_some(), "{ok}");
        }
        for nein in [
            "http://www.gesetze-im-internet.de/ao_1977/__108.html",
            "https://gesetze-im-internet.de/",
            "https://www.gesetze-im-internet.de.example.org/",
            "https://example.org/?https://www.gesetze-im-internet.de/",
            "https://nutzer@www.gesetze-im-internet.de/",
            "https://www.gesetze-im-internet.de:8443/",
            "file:///C:/Windows/System32/calc.exe",
            "javascript:alert(1)",
            "mailto:a@example.org",
            "ms-settings:",
            "C:\\Windows\\System32\\calc.exe",
            "",
        ] {
            assert!(erlaubter_link(nein).is_none(), "{nein}");
        }
        assert!(erlaubter_link(&format!("https://bpmn.io/{}", "a".repeat(3000))).is_none());
    }

    #[test]
    fn hauptfenster_bleibt_bei_der_app() {
        let url = |s: &str| Url::parse(s).unwrap();
        assert!(navigation_erlaubt(&url("http://tauri.localhost/")));
        assert!(navigation_erlaubt(&url("http://tauri.localhost/index.html#luecken")));
        assert!(navigation_erlaubt(&url("tauri://localhost/")));
        assert!(!navigation_erlaubt(&url("https://www.gesetze-im-internet.de/")));
        assert!(!navigation_erlaubt(&url("http://tauri.localhost.example.org/")));
        assert!(!navigation_erlaubt(&url("file:///C:/")));
        assert!(!navigation_erlaubt(&url("about:blank")));
    }
}
