"""Servidor local del simulador. Ejecutar: python servidor.py"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
from urllib.parse import unquote, urlsplit


class SimulatorHandler(SimpleHTTPRequestHandler):
    """Serve simulator assets from dist only, without exposing repository files or indexes."""

    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".gz": "application/gzip", ".glb": "model/gltf-binary"}

    def send_head(self):
        path = Path(unquote(urlsplit(self.path).path))
        target = Path(self.translate_path(self.path)).resolve()
        root = Path(self.directory).resolve()
        if (not target.is_relative_to(root)
                or any(part.startswith(".")
                       for part in path.parts if part not in {"/", "\\"})):
            self.send_error(404, "Not found")
            return None
        relative = target.relative_to(root).as_posix()
        blocked = ("docs/", "tecnica/", "documentacion/estudio89/")
        if relative.startswith(blocked) or relative in {
            "documentacion/boletin-locales-tecnicos.pdf", "documentacion/especificacion-funcional-cbtc.pdf",
            "documentacion/relacion-planos-linea-1.xlsx", "documentacion/segunda-nota-aclaratoria.docx",
            "documentacion/catalogo-planos.json", "documentacion/catalogo-vias84.json", "documentacion/locales.json", "documentacion/fuentes.json"
        }:
            self.send_error(404, "Not found")
            return None
        return super().send_head()

    def list_directory(self, path):
        self.send_error(404, "Not found")
        return None

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description="Simulador Metro CDMX")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent / "dist"
    if not (root / "index.html").is_file():
        parser.error("Falta dist/index.html. Extrae el ZIP completo antes de iniciar.")
    handler = partial(SimulatorHandler, directory=str(root))
    try:
        server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    except OSError as exc:
        parser.exit(1, f"No se pudo iniciar: {exc}\nPrueba: python servidor.py --port 8001\n")
    print(f"Abre http://localhost:{args.port} en Chrome o Edge. Ctrl+C para detener.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
