# Work with Ease

Statische Homepage auf GitHub Pages, Domain in `CNAME`.

## Arbeitsablauf

Einmal nach dem Klonen: `npm ci` (Node.js 24 LTS).

1. **Quelle bearbeiten**, nicht die erzeugten Dateien im Root.
2. **`npm run produce`** setzt die Website zusammen.
3. **`python3 scripts/serve.py`** startet http://localhost:4000 zur Prüfung.
4. **`npm run check`** prüft, dass die Root-Ausgabe den Quellen entspricht.
5. Quellen und erzeugte Dateien kleinschrittig gemeinsam committen. Standardmäßig direkt auf `main` arbeiten; neue Branches nur auf ausdrücklichen Wunsch. `produce` selbstständig ausführen. Push nur auf Andreas Anweisung für den auf `main` zusammengeführten Stand, mit Versions-Tag gemäß `AGENTS.md`.

Für laufende Arbeit in einem zweiten Terminal **`npm run dev`** starten. Es beobachtet die Quellen und führt produce automatisch aus. Der Vorschau-Server übernimmt CSS automatisch ohne Seitenwechsel (ausgewähltes Beispiel bleibt erhalten); bei HTML-, JavaScript- oder Asset-Änderungen lädt er die Seite neu. Nach erstmaligem Aktivieren von Live Reload die offene Vorschau einmal manuell neu laden. Mit Strg+C beenden. Der Vorschau-Server bleibt derselbe und liefert ausschließlich Website-Dateien aus.

## Wo ändere ich was?

| Änderung | Quelle |
| --- | --- |
| Menüpunkt (Desktop, mobil und Footer) | `src/_data/navigation.json` |
| E-Mail, Telefon, Profiladressen | `src/_data/site.json` |
| Header / Footer | `src/_includes/components/header.njk` / `footer.njk` |
| Allgemeines Seitengerüst | `src/_includes/layouts/base.njk` |
| Rechtliche Seiten: gemeinsamer Aufbau | `src/_includes/layouts/legal.njk` |
| Startseite / weitere Seiteninhalte | `src/index.njk`, `src/impressum.njk`, `src/datenschutz.njk` |
| Farben und Gestaltung | `src/static/style.css`, `src/static/legal.css` |
| Interaktionen | `src/static/site.js`, `src/static/cases.js` |
| Bilder und Schriften | `assets/` (direkt verwendet) |

Neue Seite: `src/beispiel.njk` mit `layout: layouts/base.njk`, Titel und `permalink: beispiel.html` im YAML-Kopf anlegen. Menüeintrag in `navigation.json` mit `label` und `href: /beispiel.html` ergänzen. Für noch nicht vorhandene Seiten steht statt `href` ein `preview`-Text. Nach produce wird die neue Seite automatisch im lokalen Server freigegeben.

## Was produce macht

Eleventy erzeugt zuerst in einem temporären Ordner. Nach erfolgreichem Build und Prüfung lokaler Ressourcen aktualisiert produce ausschließlich die vorgesehenen HTML-/CSS-/JS-Dateien im Root. `.generated-files.json` verzeichnet diese versionierten Ausgaben. Entfernte Seiten werden beim nächsten Build entfernt; fremde Dateien, `CNAME`, Quellen und Notizen werden nicht überschrieben. Bei Vorlagen- oder Validierungsfehlern bleibt die bisherige Root-Ausgabe unverändert. Ein laufender Build sperrt parallele Aufrufe; bei einem Prozessabsturz ggf. `.produce-lock/` nach Prüfung entfernen.

Das Übernehmen erfolgt pro Datei per Umbenennen, nicht als atomarer Austausch der gesamten Website. Der Build-Ordner und `node_modules/` sind entbehrliche Hilfsdateien; Quellen und Root-Ausgabe sind in Git. `.planning/` ist ausschließlich für lokale Notizen/Ideen.

Der Umbau verändert noch nicht die Veröffentlichungseinstellungen: `noindex`, Entwurfshinweise und Platzhalter für Buchung/weitere Seiten bestehen weiterhin. Eleventy wird nur lokal beim Erzeugen gebraucht, nicht auf dem Webserver. GitHub Pages erhält die fertigen Root-Dateien; `_config.yml` schließt die Build-Quellen aus.

Generator-Prüfungen: `npm test` (temporäre Testprojekte, keine Änderung der Arbeitskopie).

Bekannter Befund: `npm audit` meldet bei Eleventy 3.1.6 eine transitive Schwachstelle in `braces` (GHSA-vfj7-8cjw-p6xm; fünf betroffene Abhängigkeiten). Der Generator verarbeitet nur unsere lokalen, vertrauenswürdigen Quellen; keine Nutzereingaben. Der Eleventy-Dev-Server wird nicht verwendet. Abhängigkeiten vor späteren Updates erneut prüfen; kein automatisches `audit fix --force`.

Live Reload wird ausschließlich vom lokalen Server in HTML-Antworten eingefügt; die Dateien im Root und die veröffentlichte Website enthalten keinen Reload-Client. Während `produce` läuft, werden keine Zwischenstände zum Neuladen gemeldet.
