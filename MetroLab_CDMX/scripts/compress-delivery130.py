"""Lossless gzip repack; the actual GLB payload must remain byte-identical."""
from pathlib import Path
import gzip
from zopfli.gzip import compress
root=Path(__file__).resolve().parents[1];p=root/'dist/models/subestaciones127/rectificadora.glb.gz';original=p.read_bytes();data=gzip.decompress(original);encoded=compress(data,numiterations=5);assert gzip.decompress(encoded)==data
if len(encoded)<len(original):p.write_bytes(encoded)
print('Lossless saving:',max(0,len(original)-len(encoded)))
