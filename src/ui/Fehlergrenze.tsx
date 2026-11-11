import { Component, type ReactNode } from 'react'

/** Fängt Fehler einer eingebetteten Ansicht (z. B. dmn-js) ab, damit der Rest der App stehen bleibt. */
export class Fehlergrenze extends Component<{ titel: string; children: ReactNode }, { fehler: string | null }> {
  state = { fehler: null as string | null }

  static getDerivedStateFromError(e: unknown) {
    return { fehler: e instanceof Error ? e.message : String(e) }
  }

  render() {
    if (this.state.fehler === null) return this.props.children
    return (
      <div className="banner banner-fehler" role="alert">
        <p>
          {this.props.titel} konnte nicht angezeigt werden: {this.state.fehler}
        </p>
        <button type="button" className="knopf knopf-klein" onClick={() => this.setState({ fehler: null })}>
          Erneut versuchen
        </button>
      </div>
    )
  }
}
