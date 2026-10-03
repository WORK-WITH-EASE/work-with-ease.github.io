#!/usr/bin/env python3
"""Serve public homepage files locally without exposing repository notes."""

import json

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent


class HomepageHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        path = unquote(urlsplit(self.path).path)
        relative = path.lstrip("/") or "index.html"
        parts = Path(relative).parts
        generated = json.loads((ROOT / ".generated-files.json").read_text())
        allowed = relative in generated or (
            parts and parts[0] in {"images", "assets"}
        )
        target = ROOT / relative
        if (
            not allowed
            or any(part.startswith(".") for part in parts)
            or not target.resolve().is_relative_to(ROOT)
            or any((ROOT / Path(*parts[:i])).is_symlink() for i in range(1, len(parts) + 1))
            or not target.is_file()
        ):
            self.send_error(404)
            return None
        return super().send_head()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 4000), HomepageHandler)
    print("Homepage: http://localhost:4000 — Beenden mit Strg+C", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
