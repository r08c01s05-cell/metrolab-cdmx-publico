"""Prueba integración real contra un remoto Git temporal, sin acceder a GitHub."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).with_name('integrar.sh').resolve()


class Integracion(unittest.TestCase):
    def git(self, *args, cwd=None):
        return subprocess.check_output(
            ['git', *args], cwd=cwd or self.work, stderr=subprocess.STDOUT,
            text=True).strip()

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        root = Path(self.tmp.name)
        self.remote = root / 'remote.git'
        self.work = root / 'work'
        self.git('init', '--bare', str(self.remote), cwd=root)
        self.git('init', '-b', 'main', str(self.work), cwd=root)
        self.git('config', 'user.name', 'Prueba')
        self.git('config', 'user.email', 'prueba@example.invalid')
        checks = self.work / 'MetroLab_CDMX/scripts'
        checks.mkdir(parents=True)
        (checks / 'verificar_colaboracion.mjs').write_text(
            "if(process.env.TEST_FAIL==='1')process.exit(1);\n")
        (self.work / 'pieza.txt').write_text('base\n')
        self.git('add', '.')
        self.git('commit', '-m', 'Base')
        self.base = self.git('rev-parse', 'HEAD')
        self.git('remote', 'add', 'origin', str(self.remote))
        self.git('push', 'origin', 'main')
        self.git('switch', '-c', 'mejora/prueba')
        (self.work / 'pieza.txt').write_text('mejora\n')
        self.git('commit', '-am', 'Mejora')
        self.revision = self.git('rev-parse', 'HEAD')
        self.git('push', 'origin', 'HEAD')

    def run_script(self, fail=False):
        return subprocess.run(
            ['bash', str(SCRIPT)], cwd=self.work,
            env={**os.environ, 'METROLAB_SOURCE_SHA': self.revision,
                 'TEST_FAIL': '1' if fail else '0'},
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

    def remote_main(self):
        return self.git('--git-dir', str(self.remote), 'rev-parse', 'main')

    def test_integra_y_conserva_colaborador(self):
        self.git('switch', 'main')
        (self.work / 'colaborador.txt').write_text('conservar\n')
        self.git('add', '.')
        self.git('commit', '-m', 'Trabajo colaborador')
        self.git('push', 'origin', 'main')
        result = self.run_script()
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertNotEqual(self.remote_main(), self.base)
        self.assertEqual((self.work / 'colaborador.txt').read_text(), 'conservar\n')
        self.assertEqual((self.work / 'pieza.txt').read_text(), 'mejora\n')
        integrated = self.remote_main()
        self.assertEqual(self.run_script().returncode, 0)
        self.assertEqual(self.remote_main(), integrated)

    def test_prueba_fallida_no_publica(self):
        result = self.run_script(fail=True)
        self.assertNotEqual(result.returncode, 0, result.stdout)
        self.assertEqual(self.remote_main(), self.base)

    def test_conflicto_no_publica(self):
        self.git('switch', 'main')
        (self.work / 'pieza.txt').write_text('cambio colaborador\n')
        self.git('commit', '-am', 'Cambio incompatible')
        self.git('push', 'origin', 'main')
        before = self.remote_main()
        result = self.run_script()
        self.assertNotEqual(result.returncode, 0, result.stdout)
        self.assertEqual(self.remote_main(), before)


if __name__ == '__main__':
    unittest.main()
