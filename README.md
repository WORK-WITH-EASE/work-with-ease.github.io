# Work with Ease

Statische Homepage für GitHub Pages. Die Domain steht in `CNAME`.

## Lokal ansehen

Im Repository starten:

```sh
python3 scripts/serve.py
```

Anschließend http://localhost:4000 öffnen. Beenden mit Strg+C.
Der Server ist nur lokal erreichbar und liefert ausschließlich die Seiten-Dateien
(`index.html`, `impressum.html`, `datenschutz.html`, `style.css`, `legal.css`,
`cases.js`, `images/` und `assets/`) aus.
Nach Änderungen oder einem Branch-Wechsel die Browserseite neu laden.

## Zusammenarbeit

Planung liegt lokal im ignorierten Ordner `.planning/`. Sie ist nicht über Git gesichert.
Die Website wird direkt im Hauptverzeichnis entwickelt; benötigte Bilder und Schriften
liegen in `assets/`. `.planning/` enthält keine parallel entwickelte Website.
Der aktuelle Entwicklungsstand enthält noch Platzhalter für weitere Unterseiten und
Kontaktbuchung sowie `noindex`; diese Punkte sind vor Veröffentlichung abzuschließen.
Abgeschlossene Arbeitsstände werden committed; ein Push erfolgt ausschließlich
auf ausdrückliche Anweisung. Größere Änderungen entstehen auf einem eigenen Branch.
