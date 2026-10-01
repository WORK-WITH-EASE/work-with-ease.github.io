# Work with Ease

Statische Homepage für GitHub Pages. Die Domain steht in `CNAME`.

## Lokal ansehen

Im Repository starten:

```sh
python3 scripts/serve.py
```

Anschließend http://localhost:4000 öffnen. Beenden mit Strg+C.
Der Server ist nur lokal erreichbar und liefert ausschließlich die Seiten-Dateien
(`index.html`, `styles.css`, `script.js`, `images/` und `assets/`) aus.
Nach Änderungen oder einem Branch-Wechsel die Browserseite neu laden.

## Zusammenarbeit

Planung liegt lokal im ignorierten Ordner `.planning/`. Sie ist nicht über Git gesichert.
Veröffentlichbare Seiten-Dateien liegen im Hauptverzeichnis, Bilder in `images/`.
Abgeschlossene Arbeitsstände werden committed; ein Push erfolgt ausschließlich
auf ausdrückliche Anweisung. Größere Änderungen entstehen auf einem eigenen Branch.
