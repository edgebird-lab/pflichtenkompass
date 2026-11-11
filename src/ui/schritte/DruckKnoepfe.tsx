import { plattform } from '../../plattform'
import { useApp } from '../kontext'

/**
 * Drucken der Druckansicht (5.6). Im Browser entsteht das PDF über den Druckdialog,
 * im Windows-Programm direkt über WebView2 ohne Dialog (7.5, 7.6).
 */
export function DruckKnoepfe() {
  const { datei } = useApp()
  if (!plattform.desktop) {
    return (
      <button type="button" className="knopf" onClick={() => window.print()}>
        Drucken oder als PDF speichern
      </button>
    )
  }
  return (
    <>
      <button type="button" className="knopf" onClick={() => window.print()}>
        Drucken …
      </button>
      <button type="button" className="knopf" onClick={() => void datei.pdf()}>
        Als PDF speichern …
      </button>
    </>
  )
}
