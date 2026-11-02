from pathlib import Path
import json,struct,gzip,hashlib,copy
ROOT=Path(__file__).resolve().parents[1]
def read(b):
 n=struct.unpack_from('<I',b,12)[0];return json.loads(b[20:20+n]),bytearray(b[28+n:])
def write(d,b):
 d['buffers'][0]['byteLength']=len(b);j=json.dumps(d,separators=(',',':')).encode();j+=b' '*(-len(j)%4);b+=b'\0'*(-len(b)%4);return struct.pack('<III',0x46546c67,2,28+len(j)+len(b))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(b),0x004e4942)+b
def asset():
 d={'asset':{'version':'2.0'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'name':'Cerradura_testero_L8','children':[],'extras':{'cerradura92':True,'familia_visual':'lock92','cotas':'aproximadas desde fotografías'}}],'meshes':[],'materials':[],'accessors':[],'bufferViews':[],'buffers':[{'byteLength':0}]};b=bytearray();material_cache={}
 def accessor(values):
  b.extend(b'\0'*(-len(b)%4));view=len(d['bufferViews']);d['bufferViews'].append({'buffer':0,'byteOffset':len(b),'byteLength':len(values)*4});b.extend(struct.pack('<'+'f'*len(values),*values));i=len(d['accessors']);d['accessors'].append({'bufferView':view,'componentType':5126,'count':len(values)//3,'type':'VEC3','min':[min(values[k::3]) for k in range(3)],'max':[max(values[k::3]) for k in range(3)]});return i
 for p in json.loads(Path('/tmp/cerradura92.json').read_text()):
  attrs={'POSITION':accessor(p['vertices']),'NORMAL':accessor(p['normals'])};key=str((p['color'],p['metal'],p['rough']));mi=material_cache.get(key)
  if mi is None:mi=len(d['materials']);material_cache[key]=mi;d['materials'].append({'name':p['name'],'pbrMetallicRoughness':{'baseColorFactor':p['color'],'metallicFactor':p['metal'],'roughnessFactor':p['rough']}})
  mesh=len(d['meshes']);d['meshes'].append({'primitives':[{'attributes':attrs,'material':mi}]});d['nodes'][0]['children'].append(len(d['nodes']));d['nodes'].append({'name':p['name'],'mesh':mesh,'translation':p['pos'],'rotation':p['rotation'],'extras':{'familia_visual':'lock92','pieza':'cerradura_testero'}})
 return write(d,b)
def append(base,hardware,sides):
 d,b=read(base);a,ab=read(hardware);keys=['nodes','meshes','materials','accessors','bufferViews'];offset={k:len(d[k]) for k in keys};b.extend(b'\0'*(-len(b)%4));bo=len(b);b.extend(ab)
 for v in a['bufferViews']:v['byteOffset']+=bo
 for v in a['accessors']:v['bufferView']+=offset['bufferViews']
 for m in a['meshes']:
  for p in m['primitives']:p['material']+=offset['materials'];p['attributes']={k:v+offset['accessors'] for k,v in p['attributes'].items()}
 for n in a['nodes']:
  if 'mesh' in n:n['mesh']+=offset['meshes']
  if 'children' in n:n['children']=[x+offset['nodes'] for x in n['children']]
 for k in keys:d[k].extend(a[k])
 first=offset['nodes'];scene=d['scenes'][d.get('scene',0)]['nodes']
 for i,side in enumerate(sides):
  if i==0:index=first
  else:
   node=copy.deepcopy(a['nodes'][0]);children=node['children'];node['children']=[];index=len(d['nodes']);d['nodes'].append(node)
   for child in children:d['nodes'][index]['children'].append(len(d['nodes']));d['nodes'].append(copy.deepcopy(d['nodes'][child]))
  node=d['nodes'][index];node.update(translation=[side*7.538,1.94,-side*.26],rotation=[0,-side*2**-.5,0,2**-.5]);node['extras']['endSide']=side;scene.append(index)
 return write(d,b)
if __name__=='__main__':
 hardware=asset();(ROOT/'dist/models/Cerradura_testero_L8.glb').write_bytes(hardware);report=[]
 for model in ['NM79','MP82']:
  for unit in ['cabina','intermedio']:
   p=ROOT/f'dist/models/{model}_{unit}.glb.gz';base=gzip.decompress(p.read_bytes());d,_=read(base)
   if any(n.get('extras',{}).get('cerradura92') for n in d['nodes']):raise ValueError('Ya integrada: '+str(p))
   sides=[-1,1] if unit=='intermedio' else ([1] if model=='NM79' else [-1]);out=append(base,hardware,sides);p.write_bytes(gzip.compress(out,compresslevel=9,mtime=0));report.append({'file':p.name,'locks':len(sides),'sha256':hashlib.sha256(out).hexdigest()})
 (ROOT/'dist/documentacion/cerraduras92.json').write_text(json.dumps(report,indent=2));print(report)
