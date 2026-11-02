from estaciones48 import GLB,matrix
from accesos54 import ROOT,D,BASE,STAIR
import subprocess,json,hashlib
from collections import Counter

def stable(g):
 out=Counter()
 for n in g.j['nodes']:
  name=n.get('name','');ex=n.get('extras',{})
  if name.startswith(STAIR)or ex.get('revision_accesos')==54 or ex.get('hueco_acceso_revision')==54 or name.startswith(('Salida sobre andén','Rotulo_← SALIDA')):continue
  h=hashlib.sha256(matrix(n).tobytes())
  if'mesh'in n:
   for p in g.j['meshes'][n['mesh']]['primitives']:
    for k,v in sorted(p['attributes'].items()):h.update(k.encode());h.update(g.array(v).tobytes())
    if'indices'in p:h.update(g.array(p['indices']).tobytes())
    h.update(g.j['materials'][p['material']]['name'].encode())
  out[(name,h.hexdigest())]+=1
 return out
for st in json.loads((D/'datos.json').read_text())['estaciones']:
 rel='dist/'+st['geometria_3d']['url_glb'].split('?')[0];b=subprocess.check_output(['git','show',BASE+':'+rel],cwd=ROOT);new=(ROOT/rel).read_bytes()
 if st['linea']==8:assert b==new,st['id']+' L8 cambió';continue
 oldg=GLB(b);newg=GLB(new);old=stable(oldg)
 # Wall portions cut for openings are explicit exceptions, not silent geometry changes.
 names={n.get('name')for n in newg.j['nodes']if n.get('extras',{}).get('hueco_acceso_revision')==54}
 old=Counter({k:v for k,v in old.items()if k[0]not in names});new=Counter({k:v for k,v in stable(newg).items()if k[0]not in names});assert old==new,st['id']+' modificación ajena a accesos'
for p in (D/'models').glob('*.glb*'):assert p.read_bytes()==subprocess.check_output(['git','show',BASE+':'+str(p.relative_to(ROOT))],cwd=ROOT),p
print('Vías, anuncios, mapas, pantallas y estructura ajena a accesos conservados; 19 estaciones L8 y trenes intactos.')
