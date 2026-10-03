"""Exercise the producer in a disposable project; never mutate the working site."""
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]

class ProduceTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        for folder in ('src', 'scripts'):
            shutil.copytree(ROOT / folder, self.root / folder)
        for folder in ('node_modules', 'assets', 'images'):
            (self.root / folder).symlink_to(ROOT / folder, target_is_directory=True)
        for name in ('package.json', 'eleventy.config.js', '.generated-files.json'):
            shutil.copyfile(ROOT / name, self.root / name)
        (self.root / 'CNAME').write_text('protected.example')
        self.run_build()

    def run_build(self, *args, success=True):
        result = subprocess.run(['node', 'scripts/produce.mjs', *args], cwd=self.root, capture_output=True, text=True)
        self.assertEqual(result.returncode == 0, success, result.stdout + result.stderr)
        return result

    def snapshot(self):
        return {p.name: p.read_bytes() for p in self.root.iterdir() if p.is_file() and p.suffix in ('.html', '.css', '.js')}

    def test_repeatable_and_stale_check(self):
        before = self.snapshot()
        self.run_build()
        self.assertEqual(before, self.snapshot())
        self.run_build('--check')
        (self.root / 'index.html').write_text('stale')
        self.run_build('--check', success=False)

    def test_one_menu_source_updates_every_page(self):
        p = self.root / 'src/_data/navigation.json'
        items = json.loads(p.read_text())
        items.append({'label': 'Gemeinsamer Test', 'href': '/#kontakt'})
        p.write_text(json.dumps(items))
        self.run_build()
        for name in ('index.html', 'impressum.html', 'datenschutz.html'):
            self.assertEqual((self.root / name).read_text().count('Gemeinsamer Test'), 3)

    def test_template_error_preserves_output(self):
        before = self.snapshot()
        (self.root / 'src/broken.njk').write_text('{% invalidtag %}')
        self.run_build(success=False)
        self.assertEqual(before, self.snapshot())
        self.assertFalse((self.root / '.produce-lock').exists())

    def test_new_and_removed_page(self):
        p = self.root / 'src/test.njk'
        p.write_text('---\nlayout: layouts/base.njk\ntitle: Test\npermalink: test.html\n---\n<p>Testseite</p>')
        self.run_build()
        self.assertTrue((self.root / 'test.html').exists())
        p.unlink()
        self.run_build()
        self.assertFalse((self.root / 'test.html').exists())
        self.assertEqual((self.root / 'CNAME').read_text(), 'protected.example')

    def test_unowned_file_is_protected(self):
        (self.root / 'custom.html').write_text('keep')
        (self.root / 'src/custom.njk').write_text('---\npermalink: custom.html\n---\nreplace')
        before = self.snapshot()
        self.run_build(success=False)
        self.assertEqual(before, self.snapshot())

if __name__ == '__main__':
    unittest.main()
