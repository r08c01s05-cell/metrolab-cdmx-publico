from pathlib import Path
import json,fitz,hashlib
from PIL import Image
root=Path('/workspace/sites/metro-cdmx-simulador');c=json.loads((root/'dist/tecnica/linea1/catalogo.json').read_text());assert c['pdfFiles']==146 and c['pages']==147 and c['indexEntries']==93
assert len({p['id'] for p in c['items']})==146
for p in c['items']:
 d=fitz.open(root/'dist'/p['pdf']);assert len(d)==p['pages'];assert all(page.get_images() for page in d)
 im=Image.open(root/'dist'/p['preview']);im.verify()
 source=Path('/workspace/scratch/fc8783fbaffa/planos66/2026-10-12_metro.cdmx.gob.mx_anexo1_planos')/p['file'];assert hashlib.sha256(source.read_bytes()).hexdigest()==p['sha256_original']
assert {v['value'] for p in c['items'] if p['file']=='TV 420.pdf' for v in p['verifiedReadings']}=={'400 m','120 mm','30 m','18.064 m','16 de julio de 1968'}
print('146 PDFs, 147 páginas, vistas previas y huellas originales correctas; cotas TV 420 registradas.')
