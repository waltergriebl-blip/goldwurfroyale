# Goldwurf Royale

**Version 1.61**

Ein kleines, mobiles Wuerfelspiel fuer Web und Smartphone.
Spiele alleine gegen die KI oder lokal zu zweit am selben Geraet.

![Screenshot von Goldwurf Royale](screenshot.png)

## Features

- Singleplayer gegen KI
- Multiplayer am selben Geraet
- Startspieler auswaehlbar
- frei waehlbare Zielpunkte von 10 bis 999
- 1 oder 2 Wuerfel
- Normal- und Schwer-Modus
- Risiko-Modus
- Gamble-Modus mit Zugpunkten und Sichern
- Orakel-Modus mit Zahlenauswahl vor dem Wurf
- Goldbelohnungen und Shop fuer kosmetische Wuerfel-Skins
- Soundeffekte und optionale Hintergrundmusik
- Hell-/Dunkelmodus
- gespeicherte Einstellungen, Spielernamen, Siege, Gold und Shop-Freischaltungen
- optimiert fuer Web und Mobile
- optimierte Breitbild-Ansicht im Querformat
- installierbar als PWA
- nach dem ersten Besuch offline startbar

## Online Spielen

https://waltergriebl-blip.github.io/wuerfelduell/

## Als App Nutzen

Die Webseite kann auf dem Smartphone zum Home-Bildschirm hinzugefuegt werden. Nach dem ersten erfolgreichen Laden speichert der Service Worker die wichtigen App-Dateien, Icons und Assets fuer die Offline-Nutzung.

**iPhone:** Teilen -> Zum Home-Bildschirm  
**Android:** Browser-Menue -> Zum Startbildschirm

## Entwicklung und Dateien

Das Spiel ist eine statische Webseite ohne npm-, Build- oder Framework-Abhaengigkeiten.

- `index.html` - Spieloberflaeche und PWA-Metadaten
- `styles.css` - Layout, Themes und Animationen
- `script.js` - Spiellogik, Einstellungen, Audio und Service-Worker-Registrierung
- `version.js` - zentrale Versionsquelle (`APP_VERSION`)
- `sw.js` - Offline-Cache fuer die PWA
- `manifest.webmanifest` - Installationsdaten und App-Icons
- `assets/` und Icons - lokale Bild- und App-Assets

## Rechte

Copyright (c) 2026 Walter Griebl. Alle Rechte vorbehalten.
