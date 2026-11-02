"""Append a documented educational traction assembly without changing existing GLB data."""
from pathlib import Path
import json,struct,gzip,math,hashlib
ROOT=Path(__file__).resolve().parents[1]
def cylinder(r,length,inner=0,segments=32):
 verts=[];norms=[]
 def tri(a,b,c):
  u=[b[i]-a[i] for i in range(3)];v=[c[i]-a[i] for i in range(3)];n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];mag=math.sqrt(sum(x*x for x in n));n=[x/(mag or 1) for x in n]
  verts.extend([a,b,c]);norms.extend([n]*3)
 def point(rad,a,z):return [rad*math.cos(a),rad*math.sin(a),z]
 for i in range(segments):
  a=2*math.pi*i/segments;b=2*math.pi*(i+1)/segments
  for rad,reverse in [(r,False)]+([(inner,True)] if inner else []):
   q=[point(rad,a,-length/2),point(rad,b,-length/2),point(rad,b,length/2),point(rad,a,length/2)]
   if reverse:q.reverse()
   tri(q[0],q[1],q[2]);tri(q[0],q[2],q[3])
  for z,reverse in [(-length/2,True),(length/2,False)]:
   q=[point(inner,a,z),point(r,a,z),point(r,b,z),point(inner,b,z)]
   if reverse:q.reverse()
   tri(q[0],q[1],q[2]);tri(q[0],q[2],q[3])
 return verts,norms
def box(w,h,d):
 v=[];n=[]
 for axis in range(3):
  other=[i for i in range(3) if i!=axis]
  for sign in [-1,1]:
   q=[]
   for a,b in [(-1,-1),(1,-1),(1,1),(-1,1)]:
    p=[0,0,0];p[axis]=[w,h,d][axis]/2*sign;p[other[0]]=[w,h,d][other[0]]/2*a;p[other[1]]=[w,h,d][other[1]]/2*b;q.append(p)
   normal=[0,0,0];normal[axis]=sign
   if (axis==1 and sign==1) or (axis!=1 and sign==-1):q.reverse()
   for k in [0,1,2,0,2,3]:v.append(q[k]);n.append(normal)
 return v,n
def update(model,unit):
 path=ROOT/f'dist/models/{model}_{unit}.glb.gz';raw=gzip.decompress(path.read_bytes());jl=struct.unpack_from('<I',raw,12)[0];doc=json.loads(raw[20:20+jl]);offset=20+jl;bl=struct.unpack_from('<I',raw,offset)[0];binary=bytearray(raw[offset+8:offset+8+bl]);old_nodes=len(doc['nodes'])
 if any(n.get('extras',{}).get('motorAssembly90') for n in doc['nodes']):raise ValueError('Already updated: '+str(path))
 mat={}
 for key,color,metal in [('housing',[.18,.25,.29,1],.7),('copper',[.62,.29,.12,1],.65),('steel',[.55,.59,.63,1],.85),('dark',[.055,.065,.075,1],.3),('terminal',[.18,.20,.21,1],.4)]:
  mat[key]=len(doc['materials']);doc['materials'].append({'name':'Motor90_'+key,'doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':color,'metallicFactor':metal,'roughnessFactor':.38}})
 def accessor(values):
  while len(binary)%4:binary.append(0)
  start=len(binary);flat=[c for v in values for c in v];binary.extend(struct.pack('<'+'f'*len(flat),*flat));view=len(doc['bufferViews']);doc['bufferViews'].append({'buffer':0,'byteOffset':start,'byteLength':len(flat)*4,'target':34962});idx=len(doc['accessors']);doc['accessors'].append({'bufferView':view,'componentType':5126,'count':len(values),'type':'VEC3','min':[min(v[i] for v in values) for i in range(3)],'max':[max(v[i] for v in values) for i in range(3)]});return idx
 geometry={}
 def mesh(shape,material):
  key=(shape,material)
  if key not in geometry:
   vertices,normals=(cylinder(*shape[1:]) if shape[0]=='c' else box(*shape[1:]));pos=accessor(vertices);normal=accessor(normals);geometry[key]=len(doc['meshes']);doc['meshes'].append({'primitives':[{'attributes':{'POSITION':pos,'NORMAL':normal},'material':mat[material]}]})
  return geometry[key]
 def part(parent,name,shape,material,pos,explode,rotor=False):
  idx=len(doc['nodes']);doc['nodes'].append({'name':name,'mesh':mesh(shape,material),'translation':pos,'extras':{'familia_visual':'traction','motorPart90':True,'motorIndex90':doc['nodes'][parent]['extras']['motorIndex90'],'motorRotor90':rotor,'motorExplode90':explode,'cotas':'aproximación didáctica, no plano de fabricante'}});doc['nodes'][parent]['children'].append(idx)
 roots=doc['scenes'][doc.get('scene',0)]['nodes'];locations=[-6,-4.7,4.7,6] if model=='MP82' else [-6.55,-4.85,4.85,6.55]
 for i,axle in enumerate(locations):
  shift=.34 if i in [0,2] else -.34;parent=len(doc['nodes']);doc['nodes'].append({'name':f'Motor_traccion_{i+1}_conceptual','translation':[axle+shift,.61,0],'children':[],'extras':{'familia_visual':'traction','motorAssembly90':True,'motorIndex90':i,'scope':'representación conceptual; confirmar modelo, montaje y cotas'}});roots.append(parent)
  prefix=f'Motor_{i+1}_'
  part(parent,prefix+'Carcasa',('c',.23,.66,.205),'housing',[0,0,0],[0,.85,0])
  part(parent,prefix+'Estator',('c',.195,.57,.14),'copper',[0,0,0],[0,.38,0])
  part(parent,prefix+'Rotor',('c',.125,.54,0),'steel',[0,0,0],[0,0,0],True)
  part(parent,prefix+'Marca_giro',('b',.025,.035,.42),'copper',[.127,0,0],[0,0,0],True)
  part(parent,prefix+'Eje',('c',.045,1.08,0),'steel',[0,0,0],[0,0,0],True)
  for side in [-1,1]:
   part(parent,prefix+f'Tapa_{side}',('c',.23,.065,.06),'housing',[0,0,side*.36],[0,0,side*.55])
   part(parent,prefix+f'Rodamiento_{side}',('c',.081,.09,.048),'steel',[0,0,side*.31],[0,0,side*.25])
   for j in range(6):
    a=j*math.pi/3;part(parent,prefix+f'Perno_{side}_{j}',('c',.014,.075,0,8),'steel',[.18*math.cos(a),.18*math.sin(a),side*.39],[0,0,side*.55])
  part(parent,prefix+'Caja_bornes',('b',.18,.1,.19),'terminal',[0,.26,0],[0,1.1,0])
  part(parent,prefix+'Soporte',('b',.31,.065,.46),'housing',[0,-.25,0],[0,-.25,0])
  part(parent,prefix+'Acoplamiento',('c',.10,.12,0),'dark',[0,0,.57],[0,0,.9],True)
  part(parent,prefix+'Reductor_conceptual',('b',.25,.26,.22),'housing',[-shift,0,.64],[0,-.45,.9])
 doc['buffers'][0]['byteLength']=len(binary);j=json.dumps(doc,separators=(',',':'),ensure_ascii=False).encode();j+=b' '*((-len(j))%4);binary+=b'\0'*((-len(binary))%4);result=struct.pack('<III',0x46546c67,2,12+8+len(j)+8+len(binary))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(binary),0x004e4942)+binary;path.write_bytes(gzip.compress(result,compresslevel=9,mtime=0))
 return {'file':str(path.relative_to(ROOT/'dist')),'originalNodes':old_nodes,'addedNodes':len(doc['nodes'])-old_nodes,'motors':4,'sha256':hashlib.sha256(result).hexdigest(),'scope':'Plantilla motriz. El simulador elimina motores de R y PR.'}
if __name__=='__main__':
 report=[update(m,u) for m in ['NM22','NM79','MP82'] for u in ['cabina','intermedio']];(ROOT/'dist/documentacion/motores90.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(report)
