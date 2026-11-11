import type { FrageId } from '../modell/typen'

/** Setzt den Fokus auf das Eingabefeld einer Frage, sobald der Schritt gezeichnet ist. */
export function fokussiereFrage(id: FrageId): void {
  requestAnimationFrame(() => {
    const ziel = document.querySelector<HTMLElement>(`#frage-${id}:is(input, select, textarea), #frage-${id} input`)
    ziel?.focus()
    ziel?.scrollIntoView({ block: 'center' })
  })
}
