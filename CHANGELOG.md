# Changelog

## Version 1.48 - 2026-05-20

- Orakel-Würfel etwas weiter nach oben positioniert.

## Version 1.47 - 2026-05-20

- Würfelpunkte unabhängig vom Grid auf eine einheitliche Größe gesetzt.
- Orakel-Würfel weiter nach oben positioniert.

## Version 1.46 - 2026-05-20

- Orakel-Würfel wieder nach oben positioniert.
- Finale Würfel-Normalisierung ergänzt, damit 1- und 2-Würfel-Modus dieselbe Einzelwürfel-Geometrie verwenden.

## Version 1.45 - 2026-05-20

- Orakel-/Combo-Ansicht vereinheitlicht: 1- und 2-Würfel-Modus verwenden denselben vertikalen Würfelversatz.

## Version 1.44 - 2026-05-20

- Zwei-Würfel-Modus auf die größere Einzelwürfel-Geometrie umgestellt, damit alle Würfel wie im Ein-Würfel-Modus aussehen.

## Version 1.43 - 2026-05-20

- Würfelbühne vereinheitlicht: Ein- und Zwei-Würfel-Modus nutzen feste Würfelspalten und dieselbe Breite/Höhe pro Würfel.

## Version 1.42 - 2026-05-20

- Würfelgrößen-Regel verstärkt: Die eigentliche Würfelfläche (`.die-face`) ist in Ein- und Zwei-Würfel-Modus identisch groß.

## Version 1.41 - 2026-05-20

- Würfelgrößen vereinheitlicht: Ein-Würfel- und Zwei-Würfel-Modus verwenden dieselbe sichtbare Würfelgröße.
- Cache-Busting-Version aktualisiert, damit Browser und PWA die neue Darstellung laden.

## Version 1.40 - 2026-05-19

- Neuer Modus Orakel ergänzt, mit 1-Würfel- und 2-Würfel-Runden.
- Orakel-Auswahl für Spieler 1 und Spieler 2 inklusive KI-Auswahl im Singleplayer eingebaut.
- Eigene Kombi-Statusanzeige, farbliche Markierungen, Ergebnislogik und neue Runden über den Reset-Button ergänzt.

## Version 1.26 - 2026-05-19

- Neue Würfel-Skin-Daten für Shop-Items ergänzt, inklusive Seltenheit, Preis, Beschreibung, Freischaltbedingung und Platzhalter-Preview.
- Shop-Logik prüft Freischaltungen jetzt vor dem Kauf und zeigt die Bedingungen direkt am Item.
- Skin-Platzhalter nutzen CSS-Farben/Effekte, damit spätere Sprite- oder Icon-Dateien leicht ergänzt werden können.

## Version 1.25 - 2026-05-19

- Zentrale Versionsquelle in `version.js` festgelegt.
- Info-Panel zeigt die Version automatisch aus `APP_VERSION` an.
- PWA-Unterstuetzung verbessert: neuer Service Worker mit Offline-Cache fuer App-Dateien, Icons, Musik und lokale Assets.
- README mit PWA-/Offline-Hinweisen und kurzer Dateistruktur aktualisiert.
