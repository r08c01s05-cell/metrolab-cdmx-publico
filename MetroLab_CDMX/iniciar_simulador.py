"""Lanzador portable; requiere Python 3.10 o superior, sin paquetes adicionales."""
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
import argparse
import webbrowser

from servidor import SimulatorHandler


def main():
    parser = argparse.ArgumentParser(description="Iniciar MetroLab CDMX")
    parser.add_argument("--port", type=int, default=8001)
    parser.add_argument("--sin-navegador", action="store_true")
    args = parser.parse_args()
    if not 0 <= args.port <= 65535:
        parser.error("El puerto debe estar entre 0 y 65535.")
    root = Path(__file__).resolve().parent / "dist"
    if not (root / "index.html").is_file():
        parser.error("Extrae el ZIP completo antes de iniciar el simulador.")
    # Explicit MIME types avoid different Windows registry associations.
    SimulatorHandler.extensions_map = {
        **SimulatorHandler.extensions_map,
        ".js": "text/javascript", ".mjs": "text/javascript",
        ".css": "text/css", ".json": "application/json",
        ".gz": "application/gzip", ".glb": "model/gltf-binary",
    }
    server = None
    ports = [args.port] if args.port == 0 else range(args.port, min(args.port + 10, 65536))
    for port in ports:
        try:
            server = ThreadingHTTPServer(("127.0.0.1", port), partial(SimulatorHandler, directory=str(root)))
            break
        except OSError:
            continue
    if server is None:
        parser.error("No hay un puerto disponible. Prueba: python iniciar_simulador.py --port 8100")
    url = f"http://127.0.0.1:{server.server_port}/"
    print(f"MetroLab CDMX listo: {url}\nMantén esta ventana abierta. Ctrl+C para cerrar.", flush=True)
    if not args.sin_navegador:
        try:
            webbrowser.open(url)
        except Exception:
            print("Abre la dirección anterior en Chrome o Edge.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
