"""Replace floating end glazing with framed, closed end-door assemblies."""
from pathlib import Path
import json,struct,gzip,math
import numpy as np
for stem in ['NM79_cabina','NM79_intermedio','MP82_cabina','MP82_intermedio']:
 src=Path('assets-source/trenes',stem+'.glb');base=Path('assets-source/trenes/base42',stem+'.glb');base.parent.mkdir(exist_ok=True)
 if not base.exists():base.write_bytes(src.read_bytes())
 b=base.read_bytes();n=struct.unpack_from('<I',b,12)[0];d=json.loads(b[20:20+n]);blob=bytearray(b[28+n:])
 def acc(data,typ):
  data=np.asarray(data,dtype='<f4');blob.extend(b'\0'*((-len(blob))%4));off=len(blob);blob.extend(data.tobytes());d['bufferViews'].append({'buffer':0,'byteOffset':off,'byteLength':data.nbytes,'target':34962});d['accessors'].append({'bufferView':len(d['bufferViews'])-1,'componentType':5126,'count':len(data),'type':typ,'min':data.min(0).tolist(),'max':data.max(0).tolist()});return len(d['accessors'])-1
 def values(i):
  a=d['accessors'][i];v=d['bufferViews'][a['bufferView']];dtype={5126:'<f4',5123:'<u2',5125:'<u4'}[a['componentType']];size={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']];return np.frombuffer(blob,dtype=dtype,count=a['count']*size,offset=v.get('byteOffset',0)+a.get('byteOffset',0)).reshape(-1,size).copy()
 removed=0
 for node in d['nodes']:
  if not node.get('name','').startswith('exterior__') or 'mesh'not in node:continue
  mesh_record=d['meshes'][node['mesh']];retained=[]
  for pr in mesh_record['primitives']:
   retained.append(pr)
   if 'cristal'not in d['materials'][pr['material']]['name'].lower():continue
   idx=values(pr['indices']).ravel()if 'indices'in pr else np.arange(d['accessors'][pr['attributes']['POSITION']]['count']);tri=idx.reshape(-1,3);p=values(pr['attributes']['POSITION']);world=p+np.array(node.get('translation',[0,0,0]));positions=world[tri];end=(np.abs(positions[:,:,0])>7.4).all(1)&(np.abs(positions[:,:,2])<.76).all(1)
   if stem.endswith('cabina'):end &= (positions[:,:,0]>7.4).all(1) if stem.startswith('NM79') else (positions[:,:,0]<-7.4).all(1)
   keep=tri[~end].ravel();removed+=int(end.sum());
   if not end.any():continue
   if not len(keep):retained.pop();continue
   for key,i in list(pr['attributes'].items()):pr['attributes'][key]=acc(values(i)[keep],d['accessors'][i]['type'])
   pr.pop('indices',None)
  if retained:mesh_record['primitives']=retained
  else:node.pop('mesh')
 def material(name,col,rough=.75,metal=0):
  d['materials'].append({'name':name,'pbrMetallicRoughness':{'baseColorFactor':col+[1],'metallicFactor':metal,'roughnessFactor':rough}});return len(d['materials'])-1
 cream=material('Panel testero marfil42',[.67,.68,.62]);steel=material('Acero marco testero42',[.48,.52,.53],.35,.82);rubber=material('Junta testero42',[.022,.024,.021],.95);glass=material('Vidrio testero neutro42',[.78,.84,.84],.17)
 d['materials'][glass]['alphaMode']='BLEND';d['materials'][glass]['doubleSided']=True;d['materials'][glass]['pbrMetallicRoughness']['baseColorFactor'][3]=.12
 buckets={}
 def mesh(v,f,mat):
  v=np.asarray(v);f=np.asarray(f);t=v[f];norm=np.cross(t[:,1]-t[:,0],t[:,2]-t[:,0]);norm/=np.maximum(np.linalg.norm(norm,axis=1)[:,None],1e-10);bucket=buckets.setdefault(mat,[[],[]]);bucket[0].extend(t.reshape(-1,3));bucket[1].extend(np.repeat(norm,3,axis=0))
 def box(c,size,mat):
  c=np.array(c);s=np.array(size)/2;v=[c+s*np.array(q)for q in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]];f=[(0,2,1),(0,3,2),(4,5,6),(4,6,7),(0,1,5),(0,5,4),(3,7,6),(3,6,2),(0,4,7),(0,7,3),(1,2,6),(1,6,5)];mesh(v,f,mat)
 ends=[-1,1] if stem.endswith('intermedio') else ([1] if stem.startswith('NM79') else [-1])
 for side in ends:
  x=side*7.62
  # Complete end wall. A closed personnel door replaces the empty middle.
  for z in [-.81,.81]:box([x,2.235,z],[.055,2.00,.73],cream)
  box([x,3.205,0],[.055,.13,.91],cream)
  # Door perimeter, recessed flat leaf, small neutral glazing with rubber seal.
  for z in [-.405,.405]:box([x-side*.035,2.20,z],[.032,1.92,.025],steel)
  box([x-side*.035,3.16,0],[.032,.027,.83],steel)
  box([x-side*.026,1.228,0],[.07,.018,.81],steel)
  box([x,1.795,0],[.031,1.12,.775],cream)
  box([x,3.005,0],[.031,.30,.775],cream)
  for z in [-.302,.302]:box([x,2.605,z],[.031,.50,.17],cream)
  # Window border surrounds a real opening in the leaf; no overlapping backing.
  for z in [-.225,.225]:box([x-side*.023,2.605,z],[.013,.50,.017],rubber)
  for y in [2.355,2.855]:box([x-side*.023,y,0],[.013,.017,.465],rubber)
  box([x-side*.020,2.605,0],[.005,.477,.432],glass)
  # Lever, spindle, small fastening plates and two hinge blocks.
  box([x-side*.044,2.085,.292],[.025,.055,.055],steel)
  box([x-side*.068,2.085,.245],[.019,.020,.115],steel)
  for y in [1.58,2.80]:box([x-side*.042,y,-.378],[.034,.085,.035],steel)
 for mat,(pos,norm)in buckets.items():
  name=d['materials'][mat]['name'];d['meshes'].append({'name':name,'primitives':[{'attributes':{'POSITION':acc(pos,'VEC3'),'NORMAL':acc(norm,'VEC3')},'material':mat}]});d['nodes'].append({'name':name,'mesh':len(d['meshes'])-1,'extras':{'familia_visual':'interior','revision_interior':42}});d['scenes'][d.get('scene',0)]['nodes'].append(len(d['nodes'])-1)
 d['buffers'][0]['byteLength']=len(blob);d['asset']['generator']='Testeros42; puertas de extremo cerradas; dimensiones aproximadas';j=json.dumps(d,separators=(',',':')).encode();j+=b' '*((-len(j))%4);blob.extend(b'\0'*((-len(blob))%4));out=struct.pack('<4sII',b'glTF',2,28+len(j)+len(blob))+struct.pack('<I4s',len(j),b'JSON')+j+struct.pack('<I4s',len(blob),b'BIN\0')+blob;src.write_bytes(out);Path('dist/models',stem+'.glb.gz').write_bytes(gzip.compress(out,9,mtime=0));print(stem,removed,'triángulos de vidrio central antiguo retirados')
