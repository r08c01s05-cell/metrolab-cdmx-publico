"""Servidor persistente y sincronización conservadora para GitHub Codespaces."""
import argparse
import fcntl
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
import subprocess
import sys
import tempfile
import threading
import time

APP = Path(__file__).resolve().parents[1]
REPO = APP.parent
STATE = Path(tempfile.gettempdir()) / ('metrolab-' + __import__('hashlib').sha256(str(REPO).encode()).hexdigest()[:12])
STATE.mkdir(exist_ok=True)
LOG = STATE / 'servicio.log'


def git(*args):
    return subprocess.run(['git', '-C', str(REPO), *args], text=True,
                          stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=45)


def synchronize():
    # No reset, stash, checkout, rebase, force or deletion of local files.
    if git('branch', '--show-current').stdout.strip() != 'main':
        return 'Sin sincronizar: la rama activa no es main.'
    result = git('fetch', 'origin', 'main')
    if result.returncode:
        return 'No se pudo consultar GitHub: ' + result.stdout.strip()
    # An explicit fetch always writes FETCH_HEAD. Some prepared checkouts do
    # not configure remote.origin.fetch, leaving origin/main stale forever.
    fetched = git('rev-parse', '--verify', 'FETCH_HEAD^{commit}')
    if fetched.returncode:
        return 'No se pudo identificar la versión descargada: ' + fetched.stdout.strip()
    if git('branch', '--show-current').stdout.strip() != 'main':
        return 'Sin sincronizar: la rama activa ya no es main.'
    if git('rev-parse', 'HEAD').stdout == fetched.stdout:
        return None
    result = git('-c', 'merge.autoStash=false', 'merge', '--ff-only', fetched.stdout.strip())
    return ('Actualizado: ' if result.returncode == 0 else 'Actualización pendiente; se conservan los cambios locales: ') + result.stdout.strip()


def worker():
    with (STATE / 'servicio.lock').open('w') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return
        sys.path.insert(0, str(APP))
        from servidor import SimulatorHandler
        server = None
        server_thread = None
        occupied = False
        next_sync = 0
        while True:
            if server is not None and not server_thread.is_alive():
                server.server_close()
                server = None
            if server is None:
                try:
                    server = ThreadingHTTPServer(('0.0.0.0', 8001), partial(SimulatorHandler, directory=str(APP / 'dist')))
                    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
                    server_thread.start()
                    occupied = False
                    print('Simulador disponible en el puerto 8001.', flush=True)
                except OSError as error:
                    # A user's running server may already own 8001. Never kill it
                    # or silently move to a different URL; retry after it stops.
                    if not occupied:
                        print('Puerto 8001 ocupado; se conserva el servidor existente:', error, flush=True)
                    occupied = True
            if time.monotonic() >= next_sync:
                try:
                    message = synchronize()
                    if message:
                        print(message, flush=True)
                except (OSError, subprocess.TimeoutExpired) as error:
                    print('Sincronización pendiente:', error, flush=True)
                next_sync = time.monotonic() + 60
            time.sleep(5)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--worker', action='store_true')
    args = parser.parse_args()
    if args.worker:
        worker()
    else:
        with LOG.open('a') as output:
            subprocess.Popen([sys.executable, str(Path(__file__).resolve()), '--worker'],
                             cwd=REPO, stdin=subprocess.DEVNULL, stdout=output,
                             stderr=subprocess.STDOUT, start_new_session=True)
        print('Servicio automático activado. Puerto: 8001. Registro:', LOG)


if __name__ == '__main__':
    main()
