/** Minimale Typen für dmn-moddle 12 (das Paket bringt keine mit). */
declare module 'dmn-moddle' {
  export interface ModdleElement {
    $type: string
    id?: string
    name?: string
    label?: string
    [eigenschaft: string]: unknown
  }

  export interface ParseResult {
    rootElement: ModdleElement
    references: unknown[]
    warnings: { message: string }[]
    elementsById: Record<string, ModdleElement>
  }

  /** Im Paket eine Fabrikfunktion; `new DmnModdle()` liefert die Instanz. */
  export class DmnModdle {
    constructor(packages?: Record<string, unknown>, options?: Record<string, unknown>)
    fromXML(xml: string, typeName?: string, options?: Record<string, unknown>): Promise<ParseResult>
  }
}
