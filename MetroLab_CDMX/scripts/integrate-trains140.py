"""Graft Blender fittings, retain active train geometry byte-for-byte, discard orphaned resources."""
from pathlib import Path
import json,struct,gzip,copy,math,re,subprocess
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision140';layouts=json.loads((R/'dist/seat-layouts.json').read_text())
def read(b):n=struct.unpack_from('<I',b,12)[0];return json.loads(b[20:20+n]),bytearray(b[28+n:])
def write(d,b):
 b+=b'\0'*(-len(b)%4);d['buffers']=[{'byteLength':len(b)}];s=json.dumps(d,separators=(',',':'),ensure_ascii=False).encode();s+=b' '*(-len(s)%4);return struct.pack('<III',0x46546c67,2,28+len(s)+len(b))+struct.pack('<II',len(s),0x4e4f534a)+s+struct.pack('<II',len(b),0x004e4942)+b

def texture_infos(obj):
 for k,v in obj.items():
  if isinstance(v,dict):
   if k.endswith('Texture')and'index'in v:yield v
   else:yield from texture_infos(v)
def compact(d,b):
 assert not d.get('skins'),'No train skin is expected in the supplied fleet assets'
 live=set()
 def visit(i):
  if i in live:return
  live.add(i)
  for c in d['nodes'][i].get('children',[]):visit(c)
 for scene in d['scenes']:
  for i in scene['nodes']:visit(i)
 use={'nodes':live,'meshes':{d['nodes'][i]['mesh']for i in live if'mesh'in d['nodes'][i]}}
 use['materials']={p['material']for i in use['meshes']for p in d['meshes'][i]['primitives']if'material'in p}
 use['accessors']=set()
 for i in use['meshes']:
  for p in d['meshes'][i]['primitives']:
   use['accessors'].update(p['attributes'].values())
   if'indices'in p:use['accessors'].add(p['indices'])
   for target in p.get('targets',[]):use['accessors'].update(target.values())
 for animation in d.get('animations',[]):
  for sampler in animation['samplers']:use['accessors'].update([sampler['input'],sampler['output']])
 use['textures']={t['index']for i in use['materials']for t in texture_infos(d['materials'][i])};use['images']={d['textures'][i]['source']for i in use['textures']};use['samplers']={d['textures'][i]['sampler']for i in use['textures']if'sampler'in d['textures'][i]}
 use['bufferViews']={d['accessors'][i]['bufferView']for i in use['accessors']if'bufferView'in d['accessors'][i]}|{d['images'][i]['bufferView']for i in use['images']if'bufferView'in d['images'][i]}
 for i in use['accessors']:
  if'sparse'in d['accessors'][i]:
   for key in ['indices','values']:use['bufferViews'].add(d['accessors'][i]['sparse'][key]['bufferView'])
 maps={k:{old:new for new,old in enumerate(sorted(ids))}for k,ids in use.items()};out=copy.deepcopy(d)
 for k,ids in use.items():out[k]=[copy.deepcopy(d.get(k,[])[i])for i in sorted(ids)]
 for n in out['nodes']:
  if'mesh'in n:n['mesh']=maps['meshes'][n['mesh']]
  if'children'in n:n['children']=[maps['nodes'][i]for i in n['children']]
 for scene in out['scenes']:scene['nodes']=[maps['nodes'][i]for i in scene['nodes']]
 for m in out['meshes']:
  for p in m['primitives']:
   p['attributes']={k:maps['accessors'][v]for k,v in p['attributes'].items()}
   if'indices'in p:p['indices']=maps['accessors'][p['indices']]
   if'material'in p:p['material']=maps['materials'][p['material']]
   for target in p.get('targets',[]):
    for k,v in target.items():target[k]=maps['accessors'][v]
 for animation in out.get('animations',[]):
  for sampler in animation['samplers']:
   sampler['input']=maps['accessors'][sampler['input']];sampler['output']=maps['accessors'][sampler['output']]
  for channel in animation['channels']:channel['target']['node']=maps['nodes'][channel['target']['node']]
 for m in out['materials']:
  for t in texture_infos(m):t['index']=maps['textures'][t['index']]
 for t in out['textures']:
  t['source']=maps['images'][t['source']]
  if'sampler'in t:t['sampler']=maps['samplers'][t['sampler']]
 for im in out['images']:
  if'bufferView'in im:im['bufferView']=maps['bufferViews'][im['bufferView']]
 for a in out['accessors']:
  if'bufferView'in a:a['bufferView']=maps['bufferViews'][a['bufferView']]
  if'sparse'in a:
   for key in ['indices','values']:a['sparse'][key]['bufferView']=maps['bufferViews'][a['sparse'][key]['bufferView']]
 binary=bytearray()
 for v in out['bufferViews']:
  source=b[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']];binary+=b'\0'*(-len(binary)%4);v['buffer']=0;v['byteOffset']=len(binary);binary+=source
 return out,binary

def graft(d,b,a,ab):
 offsets={k:len(d.setdefault(k,[]))for k in ['nodes','meshes','materials','accessors','bufferViews','images','textures','samplers']};a=copy.deepcopy(a);b+=b'\0'*(-len(b)%4);bo=len(b);b+=ab
 for v in a['bufferViews']:v['buffer']=0;v['byteOffset']=v.get('byteOffset',0)+bo
 for ac in a['accessors']:
  if'bufferView'in ac:ac['bufferView']+=offsets['bufferViews']
 for im in a.get('images',[]):im['bufferView']+=offsets['bufferViews']
 for t in a.get('textures',[]):
  t['source']+=offsets['images']
  if'sampler'in t:t['sampler']+=offsets['samplers']
 for m in a['materials']:
  for t in texture_infos(m):t['index']+=offsets['textures']
 for m in a['meshes']:
  for p in m['primitives']:
   p['attributes']={k:v+offsets['accessors']for k,v in p['attributes'].items()}
   if'indices'in p:p['indices']+=offsets['accessors']
   p['material']+=offsets['materials']
 for n in a['nodes']:
  if'mesh'in n:n['mesh']+=offsets['meshes']
  if'children'in n:n['children']=[c+offsets['nodes']for c in n['children']]
 for k in offsets:d[k]+=a.get(k,[])
 return offsets
parts,pbin=read((O/'detalles_L8.glb').read_bytes());report=[]
for model in ['NM79','MP82']:
 for unit in ['cabina','intermedio']:
  stem=model+'_'+unit;path=R/f'dist/models/{stem}.glb.gz';base=O/'base139'/path.name;base.parent.mkdir(exist_ok=True)
  if not base.exists():base.write_bytes(subprocess.check_output(['git','show','HEAD:'+str(path.relative_to(R))]))
  old=base.read_bytes();d,b=read(gzip.decompress(old));assert not d['asset'].get('revision140');obsolete=set()
  for i,n in enumerate(d['nodes']):
   name=n.get('name','')
   if name=='Referencia43_roof':obsolete.add(i)
   if name=='Detalle41_roof'and'mesh'in n and any('ventilacion'in d['materials'][p['material']].get('name','').lower()for p in d['meshes'][n['mesh']]['primitives']):obsolete.add(i)
   # Earlier NM79 ceiling assemblies are entirely within the central fan strip.
   if model=='NM79'and name.startswith('roof__')and'mesh'in n:
    bounds=[d['accessors'][p['attributes']['POSITION']]for p in d['meshes'][n['mesh']]['primitives']];t=n.get('translation',[0,0,0]);lo=[min(a['min'][k]for a in bounds)+t[k]for k in range(3)];hi=[max(a['max'][k]for a in bounds)+t[k]for k in range(3)]
    if max(abs(lo[2]),abs(hi[2]))<.5 and lo[1]>3.10 and hi[1]<3.40:obsolete.add(i)
  for n in d['nodes']:
   if'children'in n:n['children']=[i for i in n['children']if i not in obsolete]
  for s in d['scenes']:s['nodes']=[i for i in s['nodes']if i not in obsolete]
  for animation in d.get('animations',[]):
   expected=re.sub(r'\.\d+$','',animation.get('name','').removesuffix('Action'));matches=[i for i,n in enumerate(d['nodes'])if n.get('name')==expected];assert len(matches)==1,expected
   target=matches[0];closed=d['nodes'][target].get('translation',[0,0,0]);half=int(expected.rsplit('_',1)[1]);opened=[closed[0]+half*.78,closed[1],closed[2]]
   def add_animation_values(values,typ):
    flat=[v for row in values for v in row]if typ=='VEC3'else values;raw=struct.pack('<'+'f'*len(flat),*flat);b.extend(b'\0'*(-len(b)%4));off=len(b);b.extend(raw);view=len(d['bufferViews']);d['bufferViews'].append({'buffer':0,'byteOffset':off,'byteLength':len(raw)});index=len(d['accessors']);a={'bufferView':view,'componentType':5126,'count':len(values),'type':typ}
    if typ=='SCALAR':a.update(min=[min(values)],max=[max(values)])
    else:a.update(min=[min(r[k]for r in values)for k in range(3)],max=[max(r[k]for r in values)for k in range(3)])
    d['accessors'].append(a);return index
   animation['samplers']=[{'input':add_animation_values([0,1.8,3.6],'SCALAR'),'output':add_animation_values([closed,opened,closed],'VEC3'),'interpolation':'LINEAR'}];animation['channels']=[{'sampler':0,'target':{'node':target,'path':'translation'}}]
  for m in d['materials']:
   if 'Asientos verdes moldeados' in m.get('name',''):m['doubleSided']=True
   if m.get('name')=='Panel cielo marfil oliva113':m['name']='Panel cielo verde agua referencia140';m['pbrMetallicRoughness']['baseColorFactor']=[.64,.73,.69,1]
  offset=graft(d,b,parts,pbin);prototypes={d['nodes'][i].get('name'):i for i in range(offset['nodes'],len(d['nodes']))};scene=d['scenes'][d.get('scene',0)]['nodes']
  def clone_tree(i,family):
   node=copy.deepcopy(d['nodes'][i]);children=node.pop('children',[]);node.setdefault('extras',{})['familia_visual']=family;index=len(d['nodes']);d['nodes'].append(node)
   if children:node['children']=[clone_tree(c,family)for c in children]
   return index
  centers=sorted(set(round(s['x']+.61,3)for s in layouts[stem][:24]if s['yaw']>0));ends=[-1,1]if unit=='intermedio'else([1]if model=='NM79'else[-1])
  for x in centers:
   i=clone_tree(prototypes['Difusor_L8_referencia140'],'roof');d['nodes'][i].update(translation=[x,3.254,0],rotation=[math.sin(math.pi/4),0,0,math.cos(math.pi/4)]);scene.append(i)
  for side in ends:
   i=clone_tree(prototypes['Alarma_L8_referencia140'],'interior');a=-side*math.pi/2;d['nodes'][i].update(translation=[side*7.592,2.84,-.72],rotation=[0,math.sin(a/2),0,math.cos(a/2)]);scene.append(i)
  d['asset'].update(revision140=True,blenderDetails140='Blender 4.3: alarm and concentric ceiling diffuser from supplied photos');d,b=compact(d,b);raw=write(d,b);path.write_bytes(gzip.compress(raw,9,mtime=0));(O/(stem+'.glb')).write_bytes(raw);report.append({'asset':stem,'diffusers':len(centers),'alarmUnits':len(ends),'obsoleteCeilingNodes':len(obsolete),'oldBytes':len(old),'newBytes':path.stat().st_size,'positionsApproximate':True});print(report[-1],flush=True)
(O/'trenes140.json').write_text(json.dumps(report,indent=2))
