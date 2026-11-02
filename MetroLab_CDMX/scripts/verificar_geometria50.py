from estaciones48 import GLB,matrix
from centrar_publicidad50 import BASE,D,ROOT
from collections import Counter
import json,subprocess,hashlib

def fingerprint(g):
 result=Counter()
 for i in g.j['scenes'][0]['nodes']:
  n=g.j['nodes'][i]
  if n.get('name','').startswith(('Marco publicidad','Panel publicidad disponible')):continue
  h=hashlib.sha256(matrix(n).tobytes())
  if'mesh'in n:
   for p in g.j['meshes'][n['mesh']]['primitives']:
    for key,v in sorted(p['attributes'].items()):h.update(key.encode());h.update(g.array(v).tobytes())
    if'indices'in p:h.update(g.array(p['indices']).tobytes())
    h.update(json.dumps(g.j['materials'][p['material']],sort_keys=True).encode())
  result[(n.get('name',''),h.hexdigest())]+=1
 return result
for s in json.loads((D/'datos.json').read_text())['estaciones']:
 path=s['geometria_3d']['url_glb'].split('?')[0];old=GLB(subprocess.check_output(['git','show',BASE+':dist/'+path],cwd=ROOT));new=GLB((D/path).read_bytes());assert fingerprint(old)==fingerprint(new),s['id']+' otra geometría/material cambió'
print('39 estaciones: vías, soportes, accesos, mapas y materiales conservados; cambios limitados a los anuncios y sus marcos.')
