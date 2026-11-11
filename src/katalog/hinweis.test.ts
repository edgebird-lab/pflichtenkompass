import { describe, expect, it } from 'vitest'
import { datumText } from '../fristen/datum'
import { HINWEISTEXT, KEINE_BERATUNG } from './hinweis'
import { KATALOG_STAND } from './typen'

describe('Hinweistext', () => {
  it('nennt den Rechtsstand des Katalogs', () => {
    expect(HINWEISTEXT).toContain(`Rechtsstand vom ${datumText(KATALOG_STAND)}`)
  })

  it('sagt, dass es keine Beratung ist', () => {
    expect(HINWEISTEXT).toContain('keine Rechts- oder Steuerberatung')
    expect(KEINE_BERATUNG).toBe('Keine Rechts- oder Steuerberatung.')
  })
})
