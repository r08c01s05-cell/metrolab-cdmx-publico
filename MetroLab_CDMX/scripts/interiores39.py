"""Rebuild L8 interior GLB meshes; preserve exterior, doors and mechanics."""
import json,struct,math,gzip
from pathlib import Path
import numpy as np

def read(p):
 b=p.read_bytes() if p.exists() else gzip.decompress(Path(str(p)+'.gz').read_bytes());n=struct.unpack_from('<I',b,12)[0];return json.loads(b[20:20+n]),bytearray(b[28+n:])
def colour(h):
 c=np.array([int(h[i:i+2],16)/255 for i in [1,3,5]]);return np.where(c<=.04045,c/12.92,((c+.055)/1.055)**2.4).tolist()+[1]
layouts=json.loads(Path('dist/seat-layouts.json').read_text())
for prefix in ['NM79','MP82']:
 for kind in ['cabina','intermedio']:
  p=Path('dist/models')/(prefix+'_'+kind+'.glb');d,blob=read(p)
  # Remove old seats, supports and interior panels. Retain existing floor mesh.
  removed=set()
  for i,n in enumerate(d['nodes']):
   if n.get('extras',{}).get('revision_interior')==39:removed.add(i)
   if n.get('name','').startswith('interior__') and 'piso' not in n.get('name','').lower():removed.add(i)
   if n.get('name','').startswith('roof__') and any(k in n.get('name','').lower() for k in ['marfil','luz']):removed.add(i)
  for n in d['nodes']:
   if 'children'in n:n['children']=[i for i in n['children'] if i not in removed]
  for s in d['scenes']:s['nodes']=[i for i in s['nodes'] if i not in removed]
  for m in d['materials']:
   if 'piso' in m.get('name','').lower():m['pbrMetallicRoughness']['baseColorFactor']=colour('#858a84');m['pbrMetallicRoughness']['roughnessFactor']=.92
  def mat(name,h,rough=.65,metal=0,emissive=False):
   m={'name':name,'pbrMetallicRoughness':{'baseColorFactor':colour(h),'roughnessFactor':rough,'metallicFactor':metal}}
   if emissive:m['emissiveFactor']=[.8,.8,.7]
   d['materials'].append(m);return len(d['materials'])-1
  green=mat('Asientos verdes moldeados referencia39','#64ad29',.38);cream=mat('Panel interior marfil referencia39','#d7d7bc');chrome=mat('Pasamanos acero referencia39','#bac1be',.25,.85);black=mat('Ventilacion interior referencia39','#252b27');light=mat('Luz blanca referencia39','#f6f6dc',.3,0,True)
  def accessor(a,typ):
   a=np.asarray(a,dtype='<f4');blob.extend(b'\0'*((-len(blob))%4));offset=len(blob);blob.extend(a.tobytes());d['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':a.nbytes,'target':34962});d['accessors'].append({'bufferView':len(d['bufferViews'])-1,'componentType':5126,'count':len(a),'type':typ,'min':a.min(0).tolist(),'max':a.max(0).tolist()});return len(d['accessors'])-1
  def mesh(name,v,faces,material,family='interior'):
   v=np.asarray(v,float);faces=np.asarray(faces,int);tri=v[faces].reshape(-1,3);norm=np.cross(v[faces[:,1]]-v[faces[:,0]],v[faces[:,2]]-v[faces[:,0]]);norm/=np.maximum(np.linalg.norm(norm,axis=1)[:,None],1e-12);norm=np.repeat(norm,3,axis=0)
   pos=accessor(tri,'VEC3');normal=accessor(norm,'VEC3');d['meshes'].append({'name':name,'primitives':[{'attributes':{'POSITION':pos,'NORMAL':normal},'material':material}]});d['nodes'].append({'name':name,'mesh':len(d['meshes'])-1,'extras':{'familia_visual':family,'revision_interior':39}});d['scenes'][d.get('scene',0)]['nodes'].append(len(d['nodes'])-1)
  def box(name,c,size,material,family='interior'):
   c=np.array(c);s=np.array(size)/2;v=[c+s*np.array(q) for q in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]];f=[(0,2,1),(0,3,2),(4,5,6),(4,6,7),(0,1,5),(0,5,4),(3,7,6),(3,6,2),(0,4,7),(0,7,3),(1,2,6),(1,6,5)];mesh(name,v,f,material,family)
  def rod(name,a,b,r=.019):
   a=np.array(a);b=np.array(b);axis=(b-a)/np.linalg.norm(b-a);u=np.cross(axis,[0,0,1] if abs(axis[2])<.9 else [0,1,0]);u/=np.linalg.norm(u);w=np.cross(axis,u);v=[q+r*(math.cos(t)*u+math.sin(t)*w) for q in [a,b] for t in np.arange(16)*math.tau/16];f=[]
   for i in range(16):j=(i+1)%16;f.extend([(i,j,16+j),(i,16+j,16+i)])
   mesh(name,v,f,chrome)
  # Rounded moulded seat panels, with a curved/sloped back rather than benches.
  def panel(name,x,z,yaw,rings):
   v=[];count=32
   for y,width,depth,shift in rings:
    for t in np.arange(count)*math.tau/count:
     xx=width/2*np.sign(math.cos(t))*abs(math.cos(t))**.28;zz=depth/2*np.sign(math.sin(t))*abs(math.sin(t))**.28+shift
     v.append([x+math.cos(yaw)*xx+math.sin(yaw)*zz,y,z-math.sin(yaw)*xx+math.cos(yaw)*zz])
   faces=[]
   for k in range(len(rings)-1):
    for i in range(count):j=(i+1)%count;faces.extend([(k*count+i,k*count+j,(k+1)*count+j),(k*count+i,(k+1)*count+j,(k+1)*count+i)])
   for i in range(1,count-1):faces.append((0,i+1,i));q=(len(rings)-1)*count;faces.append((q,q+i,q+i+1))
   mesh(name,v,[tuple(reversed(f)) for f in faces],green)
  doorx=sorted({round(sum(n.get('translation',[0])[0] for n in d['nodes'] if n.get('name','')==f'Puerta_S1_{i}_Hoja_-1' or n.get('name','')==f'Puerta_S1_{i}_Hoja_1')/2,3) for i in range(1,5)})
  centers=[(a+b)/2 for a,b in zip(doorx,doorx[1:])];seats=[]
  for bay,c in enumerate(centers):
   for row in [-1,1]:
    x=c+row*.61;yaw=-row*math.pi/2
    for side in [-1,1]:
     for zz in [.55,.98]:
      z=side*zz;seats.append({'x':x,'z':z,'height':1.70,'yaw':yaw})
      panel(f'Asiento39_{bay}_{row}_{side}_{zz}',x,z,yaw,[(1.63,.36,.37,0),(1.65,.43,.45,0),(1.69,.43,.45,0),(1.70,.37,.39,0)])
      panel(f'Respaldo39_{bay}_{row}_{side}_{zz}',x,z,yaw,[(1.68,.37,.055,-.20),(1.79,.43,.07,-.21),(2.17,.43,.07,-.25),(2.32,.36,.06,-.27),(2.34,.32,.04,-.27)])
      for dx in [-.12,.12]:rod('Soporte asiento39',[x+dx,1.22,z],[x+dx,1.64,z],.015)
    for side in [-1,1]:rod('Poste pasillo39',[x,1.22,side*.32],[x,3.25,side*.32]);rod('Barra respaldo39',[x,2.34,side*.34],[x,2.34,side*1.17],.016)
   box('Ventilacion techo39',[c,3.23,0],[.7,.035,.42],black,'roof')
  for side in [-1,1]:
   rod('Barra superior longitudinal39',[-7.4,3.23,side*.32],[7.4,3.23,side*.32])
   box('Luminaria lineal39',[0,3.22,side*.95],[14.8,.055,.16],light,'roof')
   # Revestimiento entre puertas: ningún panel fijo cruza el hueco móvil.
   for a,b in zip([-7.5]+[x+.80 for x in doorx],[x-.80 for x in doorx]+[7.5]):
    if b>a:box('Panel superior ventanas39',[(a+b)/2,3.17,side*1.20],[b-a,.12,.045],cream)
   for c in centers:box('Panel inferior ventanas39',[c,1.46,side*1.20],[2.35,.48,.045],cream)
  box('Cielo interior claro39',[0,3.29,0],[15,.065,2.35],cream,'roof')
  for end in [-1,1]:
   for side in [-1,1]:box('Panel testero claro39',[end*7.65,2.24,side*.96],[.05,2.02,.42],cream)
  layouts[p.stem]=seats
  # Compact unused geometry from the removed interior before writing the GLB.
  used_nodes=set()
  def walk(i):
   if i in used_nodes:return
   used_nodes.add(i)
   for j in d['nodes'][i].get('children',[]):walk(j)
  for s in d['scenes']:
   for i in s['nodes']:walk(i)
  nm={old:new for new,old in enumerate(sorted(used_nodes))};nodes=[d['nodes'][i] for i in sorted(used_nodes)]
  for n in nodes:
   if 'children'in n:n['children']=[nm[i] for i in n['children']]
  for s in d['scenes']:s['nodes']=[nm[i] for i in s['nodes']]
  mids=sorted({n['mesh'] for n in nodes if 'mesh'in n});mm={a:i for i,a in enumerate(mids)};meshes=[d['meshes'][i] for i in mids]
  for n in nodes:
   if 'mesh'in n:n['mesh']=mm[n['mesh']]
  aids=set()
  for m in meshes:
   for pr in m['primitives']:
    aids.update(pr['attributes'].values())
    if 'indices'in pr:aids.add(pr['indices'])
  aids=sorted(aids);am={a:i for i,a in enumerate(aids)};accs=[d['accessors'][i] for i in aids];vids=sorted({a['bufferView'] for a in accs});vm={a:i for i,a in enumerate(vids)};newblob=bytearray();views=[]
  for i in vids:
   v=d['bufferViews'][i].copy();newblob.extend(b'\0'*((-len(newblob))%4));off=len(newblob);newblob.extend(blob[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']]);v['byteOffset']=off;views.append(v)
  for a in accs:a['bufferView']=vm[a['bufferView']]
  for m in meshes:
   for pr in m['primitives']:
    pr['attributes']={k:am[v] for k,v in pr['attributes'].items()}
    if 'indices'in pr:pr['indices']=am[pr['indices']]
  mats=sorted({pr['material'] for m in meshes for pr in m['primitives'] if 'material'in pr});matmap={a:i for i,a in enumerate(mats)}
  for m in meshes:
   for pr in m['primitives']:
    if 'material'in pr:pr['material']=matmap[pr['material']]
  d.update(materials=[d['materials'][i] for i in mats],nodes=nodes,meshes=meshes,accessors=accs,bufferViews=views,buffers=[{'byteLength':len(newblob)}]);d.setdefault('asset',{})['generator']='Interior referencia39; GLB editable en Blender'
  j=json.dumps(d,separators=(',',':')).encode();j+=b' '*((-len(j))%4);newblob.extend(b'\0'*((-len(newblob))%4));out=struct.pack('<III',0x46546c67,2,28+len(j)+len(newblob))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(newblob),0x004e4942)+newblob;p.write_bytes(out);print(p,len(out),'24 asientos transversales')
Path('dist/seat-layouts.json').write_text(json.dumps(layouts,separators=(',',':')))
p=Path('dist/passenger-seats.js');s=p.read_text();s='const layouts='+json.dumps(layouts,separators=(',',':'))+';\n'+s[s.index('export function'):];s=s.replace("yaw:flip*seat.z>0?Math.PI:0", "yaw:seat.yaw!==undefined?seat.yaw+(flip<0?Math.PI:0):(flip*seat.z>0?Math.PI:0)");p.write_text(s)
