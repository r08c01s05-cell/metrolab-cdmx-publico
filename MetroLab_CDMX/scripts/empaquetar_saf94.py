import json,struct,gzip
from pathlib import Path
from integrar_barrera91 import ROOT,write
parts=json.loads(Path('/tmp/metro94/saf.json').read_text());d={'asset':{'version':'2.0'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'name':'SAF_referencia94','children':[],'extras':{'substation94':True,'approximate':True}}],'meshes':[],'materials':[],'accessors':[],'bufferViews':[],'buffers':[{'byteLength':0}]};b=bytearray()
for p in parts:
 attrs={}
 for key,values in [('POSITION',p['positionData']),('NORMAL',p['normalData'])]:
  b.extend(b'\0'*(-len(b)%4));i=len(d['accessors']);d['accessors'].append({'bufferView':len(d['bufferViews']),'componentType':5126,'count':len(values)//3,'type':'VEC3','min':[min(values[k::3]) for k in range(3)],'max':[max(values[k::3]) for k in range(3)]});d['bufferViews'].append({'buffer':0,'byteOffset':len(b),'byteLength':len(values)*4});b.extend(struct.pack('<'+'f'*len(values),*values));attrs[key]=i
 mi=len(d['materials']);m={'pbrMetallicRoughness':{'baseColorFactor':p['color'],'metallicFactor':p['metalness'],'roughnessFactor':p['roughness']}}
 if p['color'][3]<1:m['alphaMode']='BLEND'
 d['materials'].append(m);mesh=len(d['meshes']);d['meshes'].append({'primitives':[{'attributes':attrs,'material':mi}]});d['nodes'][0]['children'].append(len(d['nodes']));d['nodes'].append({'name':p['name'],'mesh':mesh,'translation':p['position'],'rotation':p['quaternion']})
asset=write(d,b);(ROOT/'assets-source/motores94/Subestacion_SAF_referencia94.glb').write_bytes(asset);(ROOT/'dist/models/Subestacion_SAF_referencia94.glb.gz').write_bytes(gzip.compress(asset,mtime=0,compresslevel=9))
