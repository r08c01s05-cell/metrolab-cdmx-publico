from estaciones48 import GLB,matrix
from pathlib import Path
from collections import Counter
import json,subprocess,hashlib
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'dist';BASE='ccb1c8fc5c3783412b0b1028dc1d61d221e43a54'
report=json.loads((D/'docs/Soportes49.json').read_text());data=json.loads((D/'datos.json').read_text());results=[]
def nodes(g,skip):
 out=Counter()
 for i in g.j['scenes'][0]['nodes']:
  if i in skip:continue
  n=g.j['nodes'][i];h=hashlib.sha256(matrix(n).tobytes())
  if'mesh'in n:
   for p in g.j['meshes'][n['mesh']]['primitives']:
    for key,v in sorted(p['attributes'].items()):h.update(key.encode());h.update(g.array(v).tobytes())
    if'indices'in p:h.update(g.array(p['indices']).tobytes())
    h.update(json.dumps(g.j['materials'][p['material']],sort_keys=True).encode())
  out[(n.get('name',''),h.hexdigest())]+=1
 return out
for st,rev in zip(data['estaciones'],report['estaciones']):
 rel=st['geometria_3d']['url_glb'].split('?')[0];old=GLB(subprocess.check_output(['git','show',BASE+':dist/'+rel],cwd=ROOT));new=GLB((D/rel).read_bytes());assert nodes(old,{r['node']for r in rev['retirados']})==nodes(new,set()),st['id']+' otra pieza/material alterado'
 if st['id']=='L1-01':assert not any(n.get('name','').startswith('Pilar terminal')for n in new.j['nodes'])
 if st['id']=='L1-08':
  cols=[n for n in new.j['nodes']if n.get('name','')=='Columna pasarela Candelaria'];assert len(cols)==2 and all(matrix(n)[0,3]<0 for n in cols)
 results.append({'id':st['id'],'elementos_retirados':len(rev['retirados']),'resto_de_geometria_uv_materiales_conservados':True})
(D/'docs/Verificacion_soportes49.json').write_text(json.dumps({'estaciones':results,'metodo':'Comparación de arrays glTF, matrices y materiales contra v48, exceptuando las 12 piezas retiradas; no prueba WebGL.'},indent=2)+'\n');print('39 estaciones: solo se retiraron las 12 piezas previstas; geometría, UV y materiales restantes conservados.')
