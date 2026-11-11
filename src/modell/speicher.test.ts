import { describe, expect, it } from 'vitest'
import { leseEinstellungen, STANDARD_EINSTELLUNGEN } from './speicher'

describe('Einstellungen', () => {
  it('hat die Standardwerte aus 4.7', () => {
    expect(STANDARD_EINSTELLUNGEN).toEqual({ thema: 'system', horizontMonate: 24, erinnerungTage: 7, vergangeneExportieren: false })
  })

  it('übernimmt gültige Werte und ersetzt falsche durch den Standard', () => {
    expect(leseEinstellungen({ thema: 'dunkel', horizontMonate: 12, erinnerungTage: 0, vergangeneExportieren: true })).toEqual({
      thema: 'dunkel',
      horizontMonate: 12,
      erinnerungTage: 0,
      vergangeneExportieren: true,
    })
    expect(leseEinstellungen({ thema: 'lila', horizontMonate: 36, erinnerungTage: 2, vergangeneExportieren: 'ja' })).toEqual(STANDARD_EINSTELLUNGEN)
    expect(leseEinstellungen(null)).toEqual(STANDARD_EINSTELLUNGEN)
    expect(leseEinstellungen([1, 2])).toEqual(STANDARD_EINSTELLUNGEN)
  })
})
