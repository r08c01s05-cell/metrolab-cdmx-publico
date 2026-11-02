from estaciones48 import GLB,matrix
from interior_l153 import ROOT,BASE
import subprocess,hashlib,json
from collections import Counter

def doors(g):
 result=Counter()
 for n in g.j['nodes']:
  if not n.get('name','').startswith('Puerta_'):continue
  h=hashlib.sha256(matrix(n).tobytes())
  if'mesh'in n:
   for p in g.j['meshes'][n['mesh']]['primitives']:
    for k,v in sorted(p['attributes'].items()):h.update(k.encode());h.update(g.array(v).tobytes())
    if'indices'in p:h.update(g.array(p['indices']).tobytes())
    h.update(g.j['materials'][p['material']]['name'].encode())
  result[(n['name'],h.hexdigest())]+=1
 return result
for type in ['cabina','intermedio']:
 rel='dist/models/NM22_'+type+'.glb';old=GLB(subprocess.check_output(['git','show',BASE+':'+rel],cwd=ROOT));new=GLB((ROOT/rel).read_bytes());assert doors(old)==doors(new),'puertas modificadas'
 assert any(n.get('name')=='Pasamanos46'for n in new.j['nodes']),'poste de agarre eliminado'
for path in list((ROOT/'dist/models').glob('*.glb.gz'))+list((ROOT/'dist/models/andenes').glob('*/*.glb')):
 assert path.read_bytes()==subprocess.check_output(['git','show',BASE+':'+str(path.relative_to(ROOT))],cwd=ROOT),path
print('Puertas conservan geometría y transformaciones; puntos de agarre presentes; L8 y 39 estaciones conservadas.')
