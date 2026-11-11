# Rauchtest des Installers auf einem frischen Windows in der CI (Schritt 6.4). Nicht auf Robins
# Rechner ausführen: Der Test deinstalliert am Ende. Ablauf: still installieren, Programm,
# Startmenü, Desktop-Verknüpfung, Deinstallationseintrag und Dateizuordnung prüfen, eine
# Projektdatei über die Zuordnung öffnen (das Fenster zeigt ihr Ergebnis), still deinstallieren.
# Jeder Punkt steht im Protokoll installer-test.log (Artefakt der CI).
param([string]$Setup = '')
$ErrorActionPreference = 'Stop'
Start-Transcript -Path (Join-Path (Get-Location) 'installer-test.log') | Out-Null

function Pruefe([bool]$ok, [string]$text) {
  if (-not $ok) { throw "Fehlgeschlagen: $text" }
  Write-Host "  ok  $text"
}

try {
  if (-not $Setup) { $Setup = (Get-ChildItem 'src-tauri/target/release/bundle/nsis/*-setup.exe' | Select-Object -First 1).FullName }
  Pruefe ([bool]$Setup -and (Test-Path $Setup)) "Installer gefunden: $Setup"
  Write-Host "Installer: $([math]::Round((Get-Item $Setup).Length / 1MB, 2)) MB"

  Start-Process $Setup -ArgumentList '/S' -Wait
  $ordner = Join-Path $env:LOCALAPPDATA 'Pflichten-Kompass'
  $exe = Join-Path $ordner 'pflichtenkompass.exe'
  Pruefe (Test-Path $exe) "pro Benutzer installiert ohne Admin: $exe"

  $deinstall = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Pflichten-Kompass'
  Pruefe (Test-Path $deinstall) 'Eintrag unter „Apps“ (Deinstallation, HKCU)'

  $programme = [Environment]::GetFolderPath('Programs')
  $start = Get-ChildItem $programme -Recurse -Filter 'Pflichten-Kompass.lnk' -ErrorAction SilentlyContinue | Select-Object -First 1
  Pruefe ([bool]$start) "Startmenü-Eintrag: $($start.FullName)"
  $desktop = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Pflichten-Kompass.lnk'
  Pruefe (Test-Path $desktop) "Desktop-Verknüpfung: $desktop"
  $ziel = (New-Object -ComObject WScript.Shell).CreateShortcut($desktop).TargetPath
  Pruefe ($ziel -eq $exe) "Verknüpfung zeigt auf $ziel"

  # .pflichtenkompass gehört dem Programm (pro Benutzer)
  $endung = (Get-ItemProperty 'HKCU:\Software\Classes\.pflichtenkompass').'(default)'
  Pruefe ($endung -eq 'PflichtenKompass.Projekt') ".pflichtenkompass zeigt auf $endung"
  $befehl = (Get-ItemProperty 'HKCU:\Software\Classes\PflichtenKompass.Projekt\shell\open\command').'(default)'
  Pruefe ($befehl -like '*pflichtenkompass.exe*%1*') "Öffnen-Befehl: $befehl"

  # Projektdatei per Zuordnung öffnen wie ein Doppelklick; der Fenstertitel nennt Schritt und Vorhaben
  $datei = Join-Path $env:TEMP 'Elektro GmbH.pflichtenkompass'
  Copy-Item 'src-tauri/windows/beispiel-c.pflichtenkompass' $datei -Force
  Start-Process $datei
  $titel = ''
  for ($i = 0; $i -lt 90 -and $titel -notlike 'Ergebnis*Elektro GmbH*Pflichten-Kompass'; $i++) {
    Start-Sleep -Seconds 1
    $titel = (Get-Process pflichtenkompass -ErrorAction SilentlyContinue | Where-Object MainWindowTitle | Select-Object -First 1).MainWindowTitle
  }
  Pruefe ($titel -like 'Ergebnis*Elektro GmbH*Pflichten-Kompass') "Doppelklick öffnet die Datei, Fenstertitel: $titel"
  foreach ($p in Get-Process pflichtenkompass -ErrorAction SilentlyContinue) { [void]$p.CloseMainWindow() }
  for ($i = 0; $i -lt 20 -and (Get-Process pflichtenkompass -ErrorAction SilentlyContinue); $i++) { Start-Sleep -Seconds 1 }
  Pruefe (-not (Get-Process pflichtenkompass -ErrorAction SilentlyContinue)) 'das Programm schließt über das Fenster'

  Start-Process (Join-Path $ordner 'uninstall.exe') -ArgumentList '/S' -Wait
  # Der Deinstaller startet sich aus einer Kopie neu; kurz warten, bis er fertig ist
  for ($i = 0; $i -lt 30 -and (Test-Path $exe); $i++) { Start-Sleep -Seconds 1 }
  Pruefe (-not (Test-Path $exe)) 'Programm nach der Deinstallation entfernt'
  Pruefe (-not (Test-Path $deinstall)) 'Deinstallationseintrag entfernt'
  Pruefe (-not (Test-Path $desktop)) 'Desktop-Verknüpfung entfernt'
  Pruefe (-not (Test-Path $start.FullName)) 'Startmenü-Eintrag entfernt'
  Write-Host 'Installer-Test bestanden.'
} finally {
  Stop-Transcript | Out-Null
}
