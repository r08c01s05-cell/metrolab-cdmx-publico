"""Genera los archivos gzip de distribución sin modificar los GLB fuente."""
from pathlib import Path
import gzip
for folder, destination, pattern in [
    ('assets-source/trenes', 'dist/models', '*.glb'),
    ('assets-source/personajes', 'dist/models/personajes', 'personaje_metro_*.glb'),
]:
    for source in Path(folder).glob(pattern):
        if '_fotorrealista' in source.stem:
            continue
        Path(destination, source.name + '.gz').write_bytes(
            gzip.compress(source.read_bytes(), compresslevel=9, mtime=0))
