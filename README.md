# Goldwurf Royale

**Version 2.28**

Ein kleines, mobiles Würfelspiel für Web und Smartphone.
Spiele alleine gegen die KI oder lokal zu zweit am selben Gerät.

![Screenshot von Goldwurf Royale](screenshot.png)

## Features

- Singleplayer gegen KI
- Multiplayer am selben Gerät
- Startspieler auswählbar
- feste Zielpunkte mit Auswahl 10, 25 oder 50
- 1 oder 2 Würfel
- Normal- und Schwer-Modus
- Risiko-Modus
- Gamble-Modus mit Zugpunkten und Sichern
- Orakel-Modus mit Zahlenauswahl vor dem Wurf
- Goldbelohnungen und Shop für kosmetische Items oder Sounds
- Avatar-Skins für das Spielerfeld
- Würfel-Skins mit Bild-Assets
- Jukebox mit freischaltbaren Hintergrundsounds
- optimierte Shop-Karten für Avatar-Skins, Würfel-Skins und Jukebox
- sauber gegliederter Info-Bereich mit Unterkategorien
- Impressum und Datenschutz als Popups im Info-Bereich
- vorbereiteter Werbe-Hinweis als freiwillige Unterstützung
- Soundeffekte und optionale Hintergrundmusik
- Hell-/Dunkelmodus
- gespeicherte Einstellungen, Spielernamen, Siege, Gold, Avatar, Würfel-Skins, Sounds und Shop-Freischaltungen
- optimiert für Web und Mobile
- optimierte Breitbild-Ansicht im Querformat
- installierbar als PWA
- nach dem ersten Besuch offline startbar

## Online Spielen

https://waltergriebl-blip.github.io/goldwurfroyale/

## Als App Nutzen

Die Webseite kann auf dem Smartphone zum Home-Bildschirm hinzugefügt werden. Nach dem ersten erfolgreichen Laden speichert der Service Worker die wichtigen App-Dateien, Icons und Assets für die Offline-Nutzung.

**iPhone:** Teilen -> Zum Home-Bildschirm  
**Android:** Browser-Menü -> Zum Startbildschirm

## Entwicklung und Dateien

Das Spiel ist eine statische Webseite ohne npm-, Build- oder Framework-Abhängigkeiten.

- `index.html` - Spieloberfläche und PWA-Metadaten
- `styles.css` - Layout, Themes und Animationen
- `script.js` - Spiellogik, Einstellungen, Audio und Service-Worker-Registrierung
- `version.js` - zentrale Versionsquelle (`APP_VERSION`)
- `service-worker.js` - Offline-Cache für App-Dateien, Icons, Musik und Assets
- `sw.js` - Weiterleitung auf den Service Worker für alte Registrierungen
- `manifest.webmanifest` - Installationsdaten und App-Icons
- `CHANGELOG.md` - Versionshistorie
- `assets/skins/` - Würfel-Skins als Bild-Assets
- `assets/avatars/` - Avatar-Bilder für das Spielerfeld
- `assets/music/` - Jukebox-Tracks
- Icons und weitere `assets/` - lokale Bild- und App-Assets

## Rechte

Copyright (c) 2026 Walter Griebl. Alle Rechte vorbehalten.
