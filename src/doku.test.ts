/**
 * Doku-Prüfung: Jeder relative Link in README, CLAUDE.md und docs/ zeigt auf
 * eine vorhandene Datei oder einen vorhandenen Ordner. Die Dateiliste kommt
 * von Vite (import.meta.glob), ohne Dateisystemzugriff im Test.
 */
import { describe, expect, it } from 'vitest'

const texte = import.meta.glob<string>(['/README.md', '/CLAUDE.md', '/docs/*.md'], { query: '?raw', import: 'default', eager: true })
const dateien = new Set(Object.keys(import.meta.glob(['/*.*', '/docs/**/*', '/regeln/**/*', '/src/**/*', '/scripts/**/*', '/e2e/**/*', '/public/**/*'])))

/** Löst einen relativen Link vom Ort der Markdown-Datei aus auf. */
function loese(von: string, ziel: string): string {
  const teile = von.split('/').slice(0, -1)
  for (const t of ziel.split('/')) {
    if (t === '..') teile.pop()
    else if (t !== '.' && t !== '') teile.push(t)
  }
  return teile.join('/')
}

function relativeLinks(text: string): string[] {
  const links: string[] = []
  for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    const ziel = m[1].split('#')[0]
    if (ziel && !/^[a-z]+:/i.test(ziel)) links.push(decodeURI(ziel))
  }
  return links
}

describe('Doku', () => {
  it('findet README, CLAUDE.md und die Doku', () => {
    expect(Object.keys(texte)).toEqual(expect.arrayContaining(['/README.md', '/CLAUDE.md', '/docs/spezifikation.md', '/docs/stand.md', '/docs/entscheidungen.md', '/docs/lizenzen.md']))
  })

  for (const [datei, text] of Object.entries(texte)) {
    it(`${datei}: relative Links sind gültig`, () => {
      const kaputt = relativeLinks(text).filter((ziel) => {
        const pfad = loese(datei, ziel)
        return !dateien.has(pfad) && ![...dateien].some((d) => d.startsWith(`${pfad}/`))
      })
      expect(kaputt).toEqual([])
    })
  }

  it('README verlinkt Stand, Spezifikation, Entscheidungen und Lizenzen', () => {
    const ziele = relativeLinks(texte['/README.md'])
    expect(ziele).toEqual(expect.arrayContaining(['docs/stand.md', 'docs/spezifikation.md', 'docs/entscheidungen.md', 'docs/lizenzen.md']))
  })
})
