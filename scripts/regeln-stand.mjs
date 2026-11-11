// Schreibt den Prüfwert (SHA-256) der Regeldatei nach regeln/stand.json (Spezifikation 6.10, V12).
// Der Wert wird über den Text mit LF-Zeilenenden gebildet; ein Windows-Checkout mit CRLF ändert ihn nicht.
//
//   npm run regeln:stand                                         prüft nur
//   npm run regeln:stand -- --version 2026.12.0 --stand 2026-12-01  neue Version nach einer Änderung
//
// Hat sich die Datei geändert, verlangt das Skript eine neue Version und einen neuen Stand. Dieselben
// Werte gehören nach src/katalog/typen.ts (KATALOG_VERSION, KATALOG_STAND); ein Test prüft beides.
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

const DMN = new URL('../regeln/pflichten.dmn', import.meta.url)
const STAND = new URL('../regeln/stand.json', import.meta.url)

function argument(name) {
  const i = process.argv.indexOf(`--${name}`)
  return i > 0 ? process.argv[i + 1] : undefined
}

const text = (await readFile(DMN, 'utf8')).replace(/\r\n/g, '\n')
const sha256 = createHash('sha256').update(text, 'utf8').digest('hex')
const alt = JSON.parse(await readFile(STAND, 'utf8').catch(() => 'null'))
const version = argument('version')
const stand = argument('stand')

if (version !== undefined && !/^\d{4}\.\d{2}\.\d+$/.test(version)) {
  console.error(`Version „${version}“ hat nicht das Format JJJJ.MM.N, z. B. 2026.12.0.`)
  process.exit(1)
}
if (stand !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(stand)) {
  console.error(`Stand „${stand}“ hat nicht das Format JJJJ-MM-TT.`)
  process.exit(1)
}
if ((version === undefined) !== (stand === undefined)) {
  console.error('Version und Stand bitte zusammen angeben: --version JJJJ.MM.N --stand JJJJ-MM-TT')
  process.exit(1)
}

const bisher = alt?.sha256?.['pflichten.dmn']
if (version === undefined) {
  if (bisher === sha256) {
    console.log(`regeln/stand.json passt: ${alt.version}, Stand ${alt.stand}, SHA-256 ${sha256.slice(0, 12)}…`)
    process.exit(0)
  }
  console.error('Regeln geändert: Version und Stand anheben, z. B.')
  console.error('  npm run regeln:stand -- --version 2026.12.0 --stand 2026-12-01')
  console.error('und dieselben Werte in src/katalog/typen.ts eintragen (KATALOG_VERSION, KATALOG_STAND).')
  process.exit(1)
}
if (alt && bisher !== sha256 && version === alt.version) {
  console.error(`Die Regeln haben sich geändert, aber die Version ${version} ist dieselbe. Bitte eine neue Version angeben.`)
  process.exit(1)
}

const neu = { version, stand, sha256: { 'pflichten.dmn': sha256 } }
await writeFile(STAND, `${JSON.stringify(neu, null, 2)}\n`, 'utf8')
console.log(`regeln/stand.json geschrieben: ${version}, Stand ${stand}, SHA-256 ${sha256.slice(0, 12)}…`)
