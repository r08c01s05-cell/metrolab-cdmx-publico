from estaciones48 import GLB,matrix
from pantallas_vagones52 import ROOT,BASE
from pathlib import Path
from collections import Counter
import subprocess,json,hashlib

def fingerprint(g):
 out=Counter()
 for n in g.j['nodes']:
  if n.get('name')in ['roof__Pantalla instrumental','Televisor pasajeros52','Carcasa televisor52']:continue
  h=hashlib.sha256(matrix(n).tobytes())
  if'mesh'in n:
   for p in g.j['meshes'][n['mesh']]['primitives']:
    for k,v in sorted(p['attributes'].items()):h.update(k.encode());h.update(g.array(v).tobytes())
    if'indices'in p:h.update(g.array(p['indices']).tobytes())
    h.update(json.dumps(g.j['materials'][p['material']],sort_keys=True).encode())
  out[(n.get('name'),h.hexdigest())]+=1
 return out
for type in ['cabina','intermedio']:
 path='dist/models/NM22_'+type+'.glb';old=GLB(subprocess.check_output(['git','show',BASE+':'+path],cwd=ROOT));new=GLB((ROOT/path).read_bytes());assert fingerprint(old)==fingerprint(new),type
for path in (ROOT/'dist/models').glob('*.glb.gz'):
 assert path.read_bytes()==subprocess.check_output(['git','show',BASE+':'+str(path.relative_to(ROOT))],cwd=ROOT),path
for path in (ROOT/'dist/models/andenes').glob('*/*.glb'):
 assert path.read_bytes()==subprocess.check_output(['git','show',BASE+':'+str(path.relative_to(ROOT))],cwd=ROOT),path
print('Resto del NM22 preservado; trenes L8 y los 39 GLB de estaciones sin cambios.')
