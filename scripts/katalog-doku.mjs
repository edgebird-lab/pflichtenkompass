// Erzeugt die Doku aus Katalog und Fragen: docs/katalog.md und docs/fragenkatalog.md.
// Die TypeScript-Module lädt Vite (runnerImport), wie im Build. Aufruf: npm run doku
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { runnerImport } from 'vite'

const wurzel = fileURLToPath(new URL('..', import.meta.url))

async function schreibe(datei, inhalt) {
  const pfad = new URL(`../${datei}`, import.meta.url)
  const vorher = await readFile(pfad, 'utf8').catch(() => null)
  if (vorher?.replace(/\r\n/g, '\n') === inhalt) {
    console.log(`${datei}: unverändert`)
    return
  }
  await writeFile(pfad, inhalt, 'utf8')
  console.log(`${datei}: geschrieben`)
}

const { module: katalog } = await runnerImport('/src/katalog/doku.ts', { root: wurzel, logLevel: 'warn' })
await schreibe('docs/katalog.md', katalog.katalogDoku())

const { module: fragen } = await runnerImport('/src/modell/doku.ts', { root: wurzel, logLevel: 'warn' })
await schreibe('docs/fragenkatalog.md', fragen.fragenkatalogDoku())
