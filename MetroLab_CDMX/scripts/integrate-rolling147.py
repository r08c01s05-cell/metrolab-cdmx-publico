"""Replace whole obsolete seat/cab assemblies; preserve active door nodes, bindings and passenger anchors."""
from pathlib import Path
import json,struct,gzip,math,copy,hashlib,subprocess
R=Path(__file__).resolve().parents[1];ns={'__file__':str(R/'scripts/integrate-trains140.py')};exec((R/'scripts/integrate-trains140.py').read_text().split('parts,pbin=')[0],ns);read,write,graft,compact=[ns[x]for x in ['read','write','graft','compact']];O=R/'assets-source/revision147';P,PB=read((O/'componentes147.glb').read_bytes());layouts=json.loads((R/'dist/seat-layouts.json').read_text());reports=[]
for model in ['NM22','NM79','MP82']:
 for unit in ['cabina','intermedio']:
  stem=model+'_'+unit;path=R/f'dist/models/{stem}.glb.gz';base=subprocess.check_output(['git','show','HEAD:'+str(path.relative_to(R))],cwd=R);d,b=read(gzip.decompress(base));oldAnimations=copy.deepcopy(d.get('animations',[]));obsolete=set();oldDoorNames=[n['name']for n in d['nodes']if n.get('name','').startswith('Puerta_S')]
  for i,n in enumerate(d['nodes']):
   e=n.get('extras',{});fam=e.get('familia_visual','');name=n.get('name','')
   if fam=='cab':obsolete.add(i)
   if model!='NM22'and e.get('revision_interior')==43 and fam=='interior':obsolete.add(i)
  for n in d['nodes']:
   if'children'in n:n['children']=[i for i in n['children']if i not in obsolete]
  for s in d['scenes']:s['nodes']=[i for i in s['nodes']if i not in obsolete]
  off=graft(d,b,P,PB);prototypes={d['nodes'][i]['name']:i for i in range(off['nodes'],len(d['nodes']))if d['nodes'][i].get('name')};scene=d['scenes'][d.get('scene',0)]['nodes']
  def clone_tree(i,fam):
   node=copy.deepcopy(d['nodes'][i]);children=node.pop('children',[]);node.setdefault('extras',{}).update(familia_visual=fam,revision147=True);idx=len(d['nodes']);d['nodes'].append(node)
   if children:node['children']=[clone_tree(c,fam)for c in children]
   return idx
  def add(proto,xyz,yaw=0,fam='interior',extra=None):
   i=clone_tree(prototypes[proto],fam);d['nodes'][i].update(translation=xyz,rotation=[0,math.sin(yaw/2),0,math.cos(yaw/2)]);d['nodes'][i].pop('matrix',None)
   if extra:d['nodes'][i]['extras'].update(extra)
   scene.append(i);return i
  if model!='NM22':
   for idx,s in enumerate(layouts[stem]):add('Asiento_L8_147',[s['x'],s['height'],s['z']],s['yaw'],extra={'seatIndex147':idx,'seatHeight147':s['height']})
  if unit=='cabina':
   sign=1 if model=='MP82'else-1;add('Cabina_moderna147'if model=='NM22'else'Cabina_clasica147',[sign*6.15,1.23,0],0 if sign>0 else math.pi,'cab',{'referenceScope147':'Adaptacion visual. La cabina moderna no se atribuye a L8; las fotos L12 y video NM16 se conservan como comparacion.'})
  centers=sorted({round(sum(n.get('translation',[0])[0]for n in d['nodes']if n.get('name')in[f'Puerta_S1_{i}_Hoja_-1',f'Puerta_S1_{i}_Hoja_1'])/2,3)for i in range(1,5)})
  assert len(centers)==4,(stem,centers)
  for x in centers:
   for side in [-1,1]:add('Umbral_147',[x,1.235,side*1.18])
  # Calibrated material roles keep the supplied livery, fabrics and wall palette.
  for m in d['materials']:
   name=m.get('name','').lower();p=m.get('pbrMetallicRoughness',{})
   if any(k in name for k in ['acero','inoxidable','pasamanos']):p['metallicFactor']=.88;p['roughnessFactor']=.32
   if 'asiento'in name and'preferentes'not in name:p['roughnessFactor']=.40;p['metallicFactor']=0
   if any(k in name for k in ['goma','caucho']):p['roughnessFactor']=.85;p['metallicFactor']=0
  d['asset']['revision147']=True;d['asset']['source147']='Seis fotos y ocho archivos de video (uno duplicado). Asientos L8 y cabina clasica: aproximacion visual, no plano de fabricante.';d,b=compact(d,b)
  # Small float rounding removes storage noise; no door animation channel or value is rewritten.
  touched=set()
  for mesh in d['meshes']:
   for pr in mesh['primitives']:
    for role,ai in pr['attributes'].items():
     if role not in ['POSITION','NORMAL','TEXCOORD_0']or ai in touched:continue
     a=d['accessors'][ai]
     if a['componentType']!=5126:continue
     touched.add(ai);v=d['bufferViews'][a['bufferView']];w={'VEC2':2,'VEC3':3}[a['type']];offset=v.get('byteOffset',0)+a.get('byteOffset',0);stride=v.get('byteStride',w*4);mins=[float('inf')]*w;maxs=[float('-inf')]*w
     for i in range(a['count']):
      vals=[round(x,5 if role=='POSITION'else 4)for x in struct.unpack_from('<'+'f'*w,b,offset+i*stride)];struct.pack_into('<'+'f'*w,b,offset+i*stride,*vals);mins=[min(x,y)for x,y in zip(mins,vals)];maxs=[max(x,y)for x,y in zip(maxs,vals)]
     if role=='POSITION':a['min']=mins;a['max']=maxs
  assert len(d.get('animations',[]))==len(oldAnimations);assert [n['name']for n in d['nodes']if n.get('name','').startswith('Puerta_S')]==oldDoorNames
  raw=write(d,b);path.write_bytes(gzip.compress(raw,9,mtime=0));(O/(stem+'.glb')).write_bytes(raw);row=dict(asset=stem,removedAssemblies=len(obsolete),seats=len(layouts[stem])if model!='NM22'else'longitudinales conservados',thresholds=8,doorAnimations=len(oldAnimations),oldBytes=len(base),bytes=path.stat().st_size,sha256=hashlib.sha256(raw).hexdigest());reports.append(row);print(json.dumps(row),flush=True)
(O/'auditoria147.json').write_text(json.dumps(reports,indent=2))
