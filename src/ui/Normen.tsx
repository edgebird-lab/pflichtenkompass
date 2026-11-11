/**
 * Normen als Links auf die Einzelnorm bei gesetze-im-internet.de (Spezifikation 3.3, 5.3).
 * Externe Links öffnen in neuem Tab mit `rel="noopener noreferrer"` (5.7).
 */
import type { ReactNode } from 'react'
import { normenGruppen, normKurz, normLink } from '../katalog/normen'
import type { NormVerweis } from '../katalog/typen'

export function ExternerLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="nur-vorlesen"> (öffnet neuen Tab)</span>
    </a>
  )
}

/** „§ 1 HGB, § 12 Abs. 1 HGB; OHG: § 105 Abs. 1 HGB“ mit Links. */
export function Normen({ normen }: { normen: readonly NormVerweis[] }) {
  if (normen.length === 0) return null
  return (
    <span className="normen">
      {normenGruppen(normen).map((g, i) => (
        <span key={i}>
          {i > 0 && '; '}
          {g.bezug && `${g.bezug}: `}
          {g.normen.map((n, j) => (
            <span key={j}>
              {j > 0 && ', '}
              <ExternerLink href={normLink(n)}>{normKurz(n)}</ExternerLink>
            </span>
          ))}
        </span>
      ))}
    </span>
  )
}
