/**
 * Was die Oberfläche vom Betriebssystem braucht: Dateien öffnen und speichern,
 * Fenstertitel, Schließen abfangen, Menübefehle, externe Links. Im Browser gibt es
 * davon nur einen Teil (Herunterladen statt Speichern); im Windows-Programm (Tauri,
 * Spezifikation 7.6) erledigt das der Rust-Teil. Übernommen aus dem Prozesslotsen.
 */

/** Eine geöffnete Datei. Im Browser gibt es keinen Pfad. */
export interface Datei {
  pfad: string | null
  name: string
  inhalt: string
}

/** Projektdatei `.pflichtenkompass` oder Kalenderdatei `.ics`. */
export type DateiArt = 'projekt' | 'kalender'

/** Befehle aus dem Programmmenü (Windows-Programm). */
export type MenueBefehl = 'neu' | 'oeffnen' | 'speichern' | 'speichernUnter' | 'kalender' | 'drucken' | 'pdf' | 'ueber'

export interface Plattform {
  /** true im Windows-Programm */
  readonly desktop: boolean
  /** Öffnen-Dialog; null bei Abbruch. Nur im Programm, im Browser öffnet die Oberfläche selbst. */
  oeffnen(): Promise<Datei | null>
  /** Datei, mit der das Programm gestartet wurde (Doppelklick im Explorer). */
  startDatei(): Promise<Datei | null>
  /** Speichert an einen Pfad, der schon geöffnet oder gewählt wurde (nur im Programm). */
  speichern(pfad: string, inhalt: string): Promise<void>
  /** Fragt nach Ort und Namen; im Browser ein Download. null bei Abbruch. */
  speichernUnter(vorschlag: string, inhalt: string, art: DateiArt): Promise<{ pfad: string | null; name: string } | null>
  setzeTitel(titel: string): void
  /** Weitere Datei soll geöffnet werden (Doppelklick bei laufendem Programm, ins Fenster gezogen). */
  beiDatei(f: (d: Datei) => void): () => void
  /** So eine Datei ließ sich nicht lesen (zu groß, keine Textdatei). */
  beiDateiFehler(f: (name: string, fehler: string) => void): () => void
  /** Vor dem Schließen: `darf` entscheidet, ob das Fenster zugeht. */
  beimSchliessen(darf: () => Promise<boolean>): () => void
  beiMenue(f: (befehl: MenueBefehl) => void): () => void
  /**
   * Externe Links: Im Programm öffnen sie im Standardbrowser, nur mit https und nur für die
   * Erlaubnisliste des Rust-Teils; sonst bekommt `fehler` die Meldung. Im Browser öffnen sie
   * wie gewohnt in einem neuen Tab.
   */
  externeLinks(fehler: (text: string) => void): () => void
  /** Druckansicht als PDF ohne Druckdialog; Dateiname, oder null, wenn das hier nicht geht oder abgebrochen wurde. */
  alsPdf(vorschlag: string): Promise<string | null>
}
