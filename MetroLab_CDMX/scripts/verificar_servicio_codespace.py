"""Prueba Git real en repositorios temporales; no usa el remoto del usuario."""
from pathlib import Path
import importlib.util
import subprocess
import tempfile

spec = importlib.util.spec_from_file_location('service', Path(__file__).with_name('servicio_codespace.py'))
service = importlib.util.module_from_spec(spec)
spec.loader.exec_module(service)


def run(root, *args):
    return subprocess.check_output(['git', '-C', str(root), *args], stderr=subprocess.STDOUT, text=True)


with tempfile.TemporaryDirectory() as directory:
    root = Path(directory)
    origin, source, client = (root / name for name in ['origin.git', 'source', 'client'])
    subprocess.run(['git', 'init', '--bare', '--initial-branch=main', str(origin)], check=True, capture_output=True)
    subprocess.run(['git', 'clone', str(origin), str(source)], check=True, capture_output=True)
    for repo in [source]:
        run(repo, 'config', 'user.name', 'Test')
        run(repo, 'config', 'user.email', 'test@example.invalid')
    (source / 'app.txt').write_text('v1')
    run(source, 'add', '.')
    run(source, 'commit', '-m', 'base')
    run(source, 'push', 'origin', 'main')
    subprocess.run(['git', 'clone', str(origin), str(client)], check=True, capture_output=True)
    service.REPO = client
    (source / 'app.txt').write_text('v2')
    run(source, 'commit', '-am', 'update')
    run(source, 'push', 'origin', 'main')
    assert service.synchronize().startswith('Actualizado:')
    assert (client / 'app.txt').read_text() == 'v2'
    # Reproduce prepared cloud checkouts with an origin/main ref but no fetch
    # refspec. Only FETCH_HEAD then reflects the just-downloaded main commit.
    stale_tracking = run(client, 'rev-parse', 'origin/main')
    run(client, 'config', '--unset-all', 'remote.origin.fetch')
    (source / 'app.txt').write_text('v2.1')
    run(source, 'commit', '-am', 'fresh fetch without tracking ref')
    run(source, 'push', 'origin', 'main')
    assert service.synchronize().startswith('Actualizado:')
    assert (client / 'app.txt').read_text() == 'v2.1'
    assert run(client, 'rev-parse', 'origin/main') == stale_tracking
    (client / 'app.txt').write_text('trabajo local')
    (source / 'app.txt').write_text('v3')
    run(source, 'commit', '-am', 'next')
    run(source, 'push', 'origin', 'main')
    assert service.synchronize().startswith('Actualización pendiente')
    assert (client / 'app.txt').read_text() == 'trabajo local'
    run(client, 'switch', '-c', 'otra-rama')
    assert 'no es main' in service.synchronize()
print('PASS: sincronización fast-forward real incluso con origin/main obsoleto, conservación de cambios locales y respeto de otras ramas.')
