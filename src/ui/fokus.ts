import type { FrageId } from '../modell/typen'

/** CSS-Selektor des Eingabefelds einer Frage: das Feld selbst oder das erste Feld ihrer Gruppe. */
export function frageFokus(id: FrageId): string {
  return `input#frage-${id}, select#frage-${id}, textarea#frage-${id}, fieldset#frage-${id} input`
}
