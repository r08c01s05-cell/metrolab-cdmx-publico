from pathlib import Path
import json,gzip,struct,hashlib
from integrar_barrera91 import ROOT,read,write,append
from integrar_separador93 import asset
for existing in (ROOT/'dist/models/andenes/L1').glob('*.glb.gz'):
 doc,_=read(gzip.decompress(existing.read_bytes()))
 if any(n.get('name','').startswith('Separador_fijo_L1_v97') for n in doc['nodes']):raise ValueError('Revisión 97 ya aplicada; usar los modelos de revisión 96 como entrada.')
# Existing fixed green separator -> the same fixed design in L1 pink, no old orange barriers.
base=asset();d,b=read(base)
# Rebuild label PNG using the same precise pictogram layout with L1 ink.
from PIL import Image
import io
image=d['images'][0];view=d['bufferViews'][image['bufferView']];offset=view.get('byteOffset',0);im=Image.open(io.BytesIO(b[offset:offset+view['byteLength']])).convert('RGB');pixels=im.load()
for y in range(im.height):
 for x in range(im.width):
  r,g,bl=pixels[x,y]
  if g>r+20 and g>bl+15:pixels[x,y]=(205,50,119)
s=io.BytesIO();im.save(s,'PNG');data=s.getvalue();b.extend(b'\0'*(-len(b)%4));view['byteOffset']=len(b);view['byteLength']=len(data);b.extend(data)
for m in d['materials']:
 c=m['pbrMetallicRoughness']['baseColorFactor']
 if c[1]>c[0]+.2 and c[1]>c[2]+.1:m['pbrMetallicRoughness']['baseColorFactor']=[.72,.035,.20,1]
d['nodes'][0]['name']='Separador_fijo_L1_v97';d['nodes'][0]['extras']['linea']=1
pink=write(d,b);(ROOT/'assets-source/motores94/Separador_fijo_Linea1.glb').write_bytes(pink);(ROOT/'dist/models/Separador_fijo_Linea1.glb.gz').write_bytes(gzip.compress(pink,compresslevel=9,mtime=0))
report=[]
for path in (ROOT/'dist/models/andenes').rglob('*.glb.gz'):
 raw=gzip.decompress(path.read_bytes());d,b=read(raw);roots=d['scenes'][d.get('scene',0)]['nodes'];line=1 if path.parent.name=='L1' else 8
 if line==1:
  roots[:]=[n for n in roots if not d['nodes'][n].get('extras',{}).get('zona_exclusiva91')];d,b=read(append(write(d,b),pink))
  for i in d['scenes'][d.get('scene',0)]['nodes']:
   n=d['nodes'][i]
   if n.get('extras',{}).get('separador93'):n['translation'][2]=-5.95 if n['extras']['direction']==1 else 5.95
 # Move all four displays and their suspension members together, away from separator at +/-25.05m.
 monitors=[(i,n['translation'].copy()) for i,n in enumerate(d['nodes']) if n.get('extras',{}).get('monitor_llegadas')]
 for i,old in monitors:
  shift=(42 if old[0]>0 else -42)-old[0];d['nodes'][i]['translation'][0]+=shift
  for n in d['nodes']:
   if n.get('name','').startswith('Suspensión monitor') and n.get('translation') and abs(n['translation'][0]-old[0])<.01 and n['translation'][2]*old[2]>0:n['translation'][0]+=shift
 out=write(d,b);path.write_bytes(gzip.compress(out,compresslevel=9,mtime=0));editable=ROOT/'assets-source/andenes89'/path.relative_to(ROOT/'dist/models/andenes').with_suffix('');editable.write_bytes(out);report.append({'file':str(path.relative_to(ROOT/'dist')).removesuffix('.gz'),'sha256':hashlib.sha256(out).hexdigest(),'bytes':len(out)})
(ROOT/'dist/documentacion/andenes-compresion89.json').write_text(json.dumps(report));print('Updated',len(report),'stations: fixed separators in L1 and four displays relocated in both lines.')
