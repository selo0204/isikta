# fotos-umbenennen.ps1
#
# Benennt alle Fotos in einem Ordner sauber durch: <ordner>-1.jpg, <ordner>-2.jpg, ...
# (sortiert nach Aufnahme-/Änderungsdatum), passend zu assets/js/reisen-data.js.
#
# ANLEITUNG:
# 1. Diese Datei z. B. nach C:\Users\<du>\Desktop\fotos-umbenennen.ps1 speichern.
# 2. PowerShell öffnen, mit "cd" in den Ordner wechseln, in dem das Skript liegt.
# 3. Für JEDEN Bilderordner einmal ausführen, z. B.:
#      .\fotos-umbenennen.ps1 -Pfad "C:\Pfad\zu\PhotoFolio\assets\img\vienna" -Ordnername "vienna"
#    Wiederholen für london, fierence, milan, Prague, TR1, tunningworld, views.
# 4. Falls PowerShell die Ausführung blockiert: einmalig
#      Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#    eingeben und bestätigen, dann das Skript erneut starten.
#
# WICHTIG: Vorher am besten eine Kopie der Original-Fotos behalten (Backup),
# falls beim Umbenennen etwas schiefgeht.

param(
    [Parameter(Mandatory = $true)][string]$Pfad,
    [Parameter(Mandatory = $true)][string]$Ordnername
)

if (-not (Test-Path $Pfad)) {
    Write-Host "Pfad nicht gefunden: $Pfad" -ForegroundColor Red
    exit
}

$dateien = Get-ChildItem -Path $Pfad -File | Where-Object {
    $_.Extension -match '\.(jpg|jpeg|png|webp)$'
} | Sort-Object LastWriteTime

$i = 1
foreach ($datei in $dateien) {
    $neuerName = "$Ordnername-$i$($datei.Extension.ToLower())"
    Rename-Item -Path $datei.FullName -NewName $neuerName
    Write-Host "-> $neuerName"
    $i++
}

Write-Host ""
Write-Host "Fertig: $($i - 1) Fotos umbenannt in '$Ordnername'." -ForegroundColor Green
Write-Host "Trag diese Zahl als 'anzahl' in assets/js/reisen-data.js beim Eintrag '$Ordnername' ein (falls noch nicht korrekt)."
