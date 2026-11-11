import { describe, expect, it } from 'vitest'
import paket from '../package.json'
import { VERSION } from './version'

describe('Version', () => {
  it('passt zu package.json', () => {
    expect(VERSION).toBe(paket.version)
  })
})
