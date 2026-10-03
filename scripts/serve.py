#!/usr/bin/env python3
"""Serve public homepage files locally without exposing repository notes."""

import json
import hashlib
import html
import io
import threading

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent


_snapshot_lock = threading.Lock()
_hashes = {}


def public_snapshot():
    """Only fingerprint publishable files; wait for produce to finish."""
    with _snapshot_lock:
        if (ROOT / ".produce-lock").exists():
            return None
        names = set(json.loads((ROOT / ".generated-files.json").read_text()))
        for folder in ("assets", "images"):
            names.update(str(p.relative_to(ROOT)) for p in (ROOT / folder).rglob("*") if p.is_file())
        result = {}
        for name in sorted(names):
            p = ROOT / name
            if any(part.startswith(".") or part == ".." for part in Path(name).parts):
                continue
            if not p.resolve().is_relative_to(ROOT) or p.is_symlink() or not p.is_file():
                continue
            stat = p.stat()
            signature = (stat.st_mtime_ns, stat.st_ctime_ns, stat.st_size)
            cached = _hashes.get(name)
            if cached is None or cached[0] != signature:
                cached = (signature, hashlib.sha256(p.read_bytes()).hexdigest())
                _hashes[name] = cached
            result[name] = cached[1]
        if (ROOT / ".produce-lock").exists():
            return None
        return result


class HomepageHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def memory_response(self, data, content_type, status=200):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        return io.BytesIO(data)

    def log_message(self, format, *args):
        if urlsplit(self.path).path != "/__preview/state":
            super().log_message(format, *args)

    def send_head(self):
        path = unquote(urlsplit(self.path).path)
        if path == "/__preview/live.js":
            return self.memory_response((ROOT / "scripts/live-reload.js").read_bytes(), "text/javascript; charset=utf-8")
        if path == "/__preview/state":
            state = public_snapshot()
            return self.memory_response(json.dumps(state).encode(), "application/json", 200 if state is not None else 503)
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
        if target.suffix == ".html":
            state = public_snapshot()
            if state is None:
                return self.memory_response(b"Build in progress. Please reload shortly.", "text/plain", 503)
            document = target.read_text()
            snapshot = html.escape(json.dumps(state), quote=True)
            client = '<script src="/__preview/live.js" data-snapshot="' + snapshot + '"></script>'
            document = document.replace("</body>", client + "</body>")
            return self.memory_response(document.encode(), "text/html; charset=utf-8")
        return super().send_head()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 4000), HomepageHandler)
    print("Homepage mit Live Reload: http://localhost:4000 — Beenden mit Strg+C", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
