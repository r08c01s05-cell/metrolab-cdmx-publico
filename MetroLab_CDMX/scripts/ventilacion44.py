"""Remove superseded ceiling fan assemblies; keep one reference assembly per bay."""
from pathlib import Path
import json,struct,gzip
import numpy as np
for stem in ['NM79_cabina','NM79_intermedio','MP82_cabina','MP82_intermedio']:
 p=Path('assets-source/trenes',stem+'.glb');b=p.read_bytes();n=struct.unpack_from('<I',b,12)[0];d=json.loads(b[20:20+n]);blob=b[28+n:];removed=[]
 for i,node in enumerate(d['nodes']):
  if 'mesh'not in node:continue
  name=node.get('name','');mesh=d['meshes'][node['mesh']];legacy=False
  if name=='Detalle41_roof' and any('ventilacion'in d['materials'][pr['material']]['name'].lower()for pr in mesh['primitives']):legacy=True
  if name.startswith('roof__'):
   a=d['accessors'][mesh['primitives'][0]['attributes']['POSITION']];t=node.get('translation',[0,0,0]);lo=np.array(a['min'])+t;hi=np.array(a['max'])+t
   legacy=max(abs(lo[2]),abs(hi[2]))<.45 and lo[1]>3.10 and hi[1]<3.40
  if legacy:removed.append(i)
 for node in d['nodes']:
  if 'children'in node:node['children']=[i for i in node['children']if i not in removed]
 for scene in d['scenes']:scene['nodes']=[i for i in scene['nodes']if i not in removed]
 d['asset']['generator']='Ventilacion44: un conjunto por bahia';j=json.dumps(d,separators=(',',':')).encode();j+=b' '*((-len(j))%4);out=struct.pack('<4sII',b'glTF',2,28+len(j)+len(blob))+struct.pack('<I4s',len(j),b'JSON')+j+struct.pack('<I4s',len(blob),b'BIN\0')+blob;p.write_bytes(out);Path('dist/models',stem+'.glb.gz').write_bytes(gzip.compress(out,9,mtime=0));print(stem,[d['nodes'][i]['name']for i in removed])
