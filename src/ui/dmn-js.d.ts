/** Minimale Typen für dmn-js 18 (das Paket bringt keine mit); nur was die Regelansicht nutzt. */
declare module 'dmn-js/lib/NavigatedViewer' {
  export interface DmnAnsicht {
    type: 'drd' | 'decisionTable' | 'literalExpression' | 'boxedExpression'
    element: { id: string; name?: string }
    name?: string
  }

  export interface DmnModul {
    [name: string]: unknown
  }

  export interface DmnOptionen {
    container: HTMLElement
    drd?: { additionalModules?: DmnModul[]; drillDown?: { enabled?: boolean } }
    decisionTable?: { additionalModules?: DmnModul[] }
  }

  export default class NavigatedViewer {
    constructor(optionen: DmnOptionen)
    importXML(xml: string): Promise<{ warnings: unknown[] }>
    getViews(): DmnAnsicht[]
    getActiveView(): DmnAnsicht | null
    getActiveViewer(): { get<T = unknown>(dienst: string): T } | null
    open(ansicht: DmnAnsicht): Promise<unknown>
    on(ereignis: string, rueckruf: (e: { activeView?: DmnAnsicht; views?: DmnAnsicht[] }) => void): void
    destroy(): void
  }
}
