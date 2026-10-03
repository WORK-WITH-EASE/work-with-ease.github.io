"""Preview-only injection, file isolation and change detection."""
import importlib.util
import json
import tempfile
import threading
import unittest
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import urlopen
from http.server import ThreadingHTTPServer

spec = importlib.util.spec_from_file_location("preview", Path(__file__).resolve().parents[1] / "scripts/serve.py")
preview = importlib.util.module_from_spec(spec)
spec.loader.exec_module(preview)


class PreviewTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name).resolve()
        preview.ROOT = self.root
        preview._hashes.clear()
        (self.root / '.generated-files.json').write_text(json.dumps(['index.html', 'style.css']))
        (self.root / 'index.html').write_text('<body>Hello</body>')
        (self.root / 'style.css').write_text('body { color: red; }')
        (self.root / 'scripts').mkdir()
        (self.root / 'scripts/live-reload.js').write_text('// preview client')
        (self.root / '.planning').mkdir()
        (self.root / '.planning/private.txt').write_text('private')
        self.server = ThreadingHTTPServer(('127.0.0.1', 0), preview.HomepageHandler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.url = 'http://127.0.0.1:' + str(self.server.server_port)

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
        self.temp.cleanup()

    def get(self, path):
        return urlopen(self.url + path)

    def test_injection_only_in_response(self):
        with self.get('/') as response:
            self.assertIn(b'/__preview/live.js', response.read())
            self.assertEqual(response.headers['Cache-Control'], 'no-store')
        self.assertEqual((self.root / 'index.html').read_text(), '<body>Hello</body>')
        with self.get('/__preview/live.js') as response:
            self.assertEqual(response.read(), b'// preview client')
        for path in ['/scripts/live-reload.js', '/.planning/private.txt', '/.generated-files.json']:
            with self.assertRaises(HTTPError) as error:
                self.get(path)
            self.assertEqual(error.exception.code, 404)

    def test_changes_and_build_lock(self):
        before = preview.public_snapshot()
        (self.root / 'style.css').write_text('body { color: tan; }')
        with self.get('/__preview/state') as response:
            after = json.load(response)
        self.assertNotEqual(before['style.css'], after['style.css'])
        self.assertEqual(before['index.html'], after['index.html'])
        self.assertNotIn('.planning/private.txt', after)
        (self.root / '.produce-lock').mkdir()
        with self.assertRaises(HTTPError) as error:
            self.get('/__preview/state')
        self.assertEqual(error.exception.code, 503)
        (self.root / '.produce-lock').rmdir()
        self.assertEqual(preview.public_snapshot(), after)


if __name__ == '__main__':
    unittest.main()
