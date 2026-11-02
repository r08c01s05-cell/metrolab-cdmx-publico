"""Targeted L8 interior corrections using supplied references; not factory dimensions."""
from pathlib import Path
import json,math,gzip,copy,hashlib
import numpy as np
from integrar_barrera91 import read,write
ROOT=Path(__file__).resolve().parents[1]
def rgb(h):
 a=np.array([int(h[i:i+2],16)/255 for i in[1,3,5]]);return np.where(a<=.04045,a/12.92,((a+.055)/1.055)**2.4).tolist()+[1]
def rounded(y0,y1,z0,z1,r,n=8):
 out=[]
 for cy,cz,start in[(y1-r,z1-r,0),(y0+r,z1-r,90),(y0+r,z0+r,180),(y1-r,z0+r,270)]:
  for t in np.linspace(math.radians(start),math.radians(start+90),n,endpoint=False):out.append([cy+r*math.cos(t),cz+r*math.sin(t)])
 return np.array(out)
report=[];layouts=json.loads((ROOT/'dist/seat-layouts.json').read_text())
for model in['NM79','MP82']:
 for unit in['cabina','intermedio']:
  stem=model+'_'+unit;path=ROOT/f'dist/models/{stem}.glb.gz';d,blob=read(gzip.decompress(path.read_bytes()))
  if d['asset'].get('revision113'):raise ValueError('Already applied')
  def values(i):
   a=d['accessors'][i];v=d['bufferViews'][a['bufferView']];size={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']];return np.frombuffer(blob,dtype={5126:'<f4',5123:'<u2',5125:'<u4'}[a['componentType']],count=a['count']*size,offset=v.get('byteOffset',0)+a.get('byteOffset',0)).reshape(-1,size).copy()
  def acc(v,typ):
   a=np.asarray(v,dtype='<f4');blob.extend(b'\0'*(-len(blob)%4));off=len(blob);blob.extend(a.tobytes());d['bufferViews'].append({'buffer':0,'byteOffset':off,'byteLength':a.nbytes});d['accessors'].append({'bufferView':len(d['bufferViews'])-1,'componentType':5126,'count':len(a),'type':typ,'min':a.min(0).tolist(),'max':a.max(0).tolist()});return len(d['accessors'])-1
  # Remove the old small rectangular pane and seal, keeping the photographed locks.
  obsolete={i for i,n in enumerate(d['nodes'])if n.get('name')in['Vidrio testero neutro42','Junta testero42']}
  for scene in d['scenes']:scene['nodes']=[i for i in scene['nodes']if i not in obsolete]
  for node in d['nodes']:
   if'children'in node:node['children']=[i for i in node['children']if i not in obsolete]
   if node.get('name')=='Panel testero marfil42':
    for pr in d['meshes'][node['mesh']]['primitives']:
     p=values(pr['attributes']['POSITION']);idx=values(pr['indices']).ravel().astype(int)if'indices'in pr else np.arange(len(p));tris=idx.reshape(-1,3);v=p[tris];remove=(np.abs(v[:,:,2])<.40).all(1)&(np.abs(v[:,:,0])>7.4).all(1);keep=tris[~remove].ravel()
     for k,a in list(pr['attributes'].items()):pr['attributes'][k]=acc(values(a)[keep],d['accessors'][a]['type'])
     pr.pop('indices',None)
  mats={key:next(i for i,m in enumerate(d['materials'])if m['name']==name)for key,name in[('cream','Panel testero marfil42'),('steel','Acero marco testero42'),('rubber','Junta testero42'),('glass','Vidrio testero neutro42')]}
  roof=next(i for i,m in enumerate(d['materials'])if 'Panel interior marfil referencia39'in m['name']and'PBR41'in m['name']);m=copy.deepcopy(d['materials'][roof]);m['name']='Panel cielo marfil oliva113';m['pbrMetallicRoughness']['baseColorFactor']=rgb('#dfe2cd');roofmat=len(d['materials']);d['materials'].append(m)
  for node in d['nodes']:
   if node.get('name')=='Cielo interior claro39':
    for pr in d['meshes'][node['mesh']]['primitives']:pr['material']=roofmat
   if node.get('name')=='Referencia43_roof':
    for pr in d['meshes'][node['mesh']]['primitives']:
     p=values(pr['attributes']['POSITION']);p[:,1]+=.044;pr['attributes']['POSITION']=acc(p,'VEC3')
  for m in d['materials']:
   if 'Asientos verdes moldeados'in m.get('name',''):m['pbrMetallicRoughness']['baseColorFactor']=rgb('#88bb42')
  buckets={}
  def emit(v,faces,mat,family='interior'):
   v=np.array(v,float);f=np.array(faces,int);tri=v[f];norm=np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0]);norm/=np.maximum(np.linalg.norm(norm,axis=1)[:,None],1e-12);p=tri.reshape(-1,3);uv=p[:,[2,1]]*4;b=buckets.setdefault((mat,family),[[],[],[]]);b[0].extend(p);b[1].extend(np.repeat(norm,3,axis=0));b[2].extend(uv)
  ends=[-1,1]if unit=='intermedio'else([1]if model=='NM79'else[-1]);inner=rounded(2.18,3.08,-.18,.18,.075)
  for side in ends:
   x=side*7.62;N=len(inner)
   def slab(y0,y1,z0,z1):
    verts=[[xx,y,z]for xx,y,z in[(x-.0155,y0,z0),(x+.0155,y0,z0),(x+.0155,y1,z0),(x-.0155,y1,z0),(x-.0155,y0,z1),(x+.0155,y0,z1),(x+.0155,y1,z1),(x-.0155,y1,z1)]]
    emit(verts,[(0,2,1),(0,3,2),(4,5,6),(4,6,7),(0,1,5),(0,5,4),(3,7,6),(3,6,2),(0,4,7),(0,7,3),(1,2,6),(1,6,5)],mats['cream'])
   slab(1.24,2.18,-.3875,.3875);slab(3.08,3.16,-.3875,.3875);slab(2.18,3.08,-.3875,-.18);slab(2.18,3.08,.18,.3875)
   for cy,cz,start,corner in[(3.005,.105,0,[3.08,.18]),(2.255,.105,90,[2.18,.18]),(2.255,-.105,180,[2.18,-.18]),(3.005,-.105,270,[3.08,-.18])]:
    arc=[[cy+.075*math.cos(t),cz+.075*math.sin(t)]for t in np.linspace(math.radians(start),math.radians(start+90),9)]
    for xx in[x-.0155,x+.0155]:emit([[xx,*corner]]+[[xx,*v]for v in arc],[(0,i,i+1)for i in range(1,9)],mats['cream'])
    v=[[x-.0155,*yz]for yz in arc]+[[x+.0155,*yz]for yz in arc];emit(v,[(i,i+1,i+10)for i in range(8)]+[(i,i+10,i+9)for i in range(8)],mats['cream'])
   outer=rounded(2.166,3.094,-.194,.194,.089);verts=[[x-side*.024,*yz]for yz in inner]+[[x-side*.024,*yz]for yz in outer];f=[]
   for i in range(N):j=(i+1)%N;f.extend([(i,j,N+j),(i,N+j,N+i)])
   emit(verts,f,mats['rubber']);glass=[[x-side*.02,*yz]for yz in inner];emit(glass,[(0,i,i+1)for i in range(1,N-1)],mats['glass'])
  # Collars and mounting feet on the existing passenger-reachable posts.
  def ring(x,y,z,r0,r1,h):
   v=[];n=16
   for yy,r in[(y-h/2,r0),(y-h/2,r1),(y+h/2,r1),(y+h/2,r0)]:v.extend([[x+r*math.cos(t),yy,z+r*math.sin(t)]for t in np.arange(n)*math.tau/n])
   f=[]
   for layer in range(4):
    for i in range(n):j=(i+1)%n;a=layer*n+i;b=layer*n+j;c=((layer+1)%4)*n+j;e=((layer+1)%4)*n+i;f.extend([(a,b,c),(a,c,e)])
   emit(v,f,mats['steel'])
  xs=sorted(set(round(s['x'],3)for s in layouts[stem][:24]));
  for x in xs:
   for z in[-.32,.32]:
    for y,r,h in[(1.236,.044,.022),(2.34,.029,.033),(3.229,.033,.027)]:ring(x,y,z,.018,r,h)
  # Thin stainless jambs frame the existing door openings without crossing the leaves.
  doorx=sorted({round(sum(n.get('translation',[0])[0]for n in d['nodes']if n.get('name')in[f'Puerta_S1_{i}_Hoja_-1',f'Puerta_S1_{i}_Hoja_1'])/2,3)for i in range(1,5)})
  for centerx in doorx:
   for side in[-1,1]:
    for edge in[-1,1]:
     x=centerx+edge*.79;y=2.25;z=side*1.18;dx,dy,dz=.0175,1.01,.014
     verts=[[x+a*dx,y+b*dy,z+c*dz]for a,b,c in[(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
     emit(verts,[(0,2,1),(0,3,2),(4,5,6),(4,6,7),(0,1,5),(0,5,4),(3,7,6),(3,6,2),(0,4,7),(0,7,3),(1,2,6),(1,6,5)],mats['steel'])
  for(mat,family),(pos,norm,uv)in buckets.items():
   name='Interior113_'+('ventana'if mat==mats['glass']else'junta'if mat==mats['rubber']else'hoja'if mat==mats['cream']else'uniones_pasamanos');d['meshes'].append({'primitives':[{'attributes':{'POSITION':acc(pos,'VEC3'),'NORMAL':acc(norm,'VEC3'),'TEXCOORD_0':acc(uv,'VEC2')},'material':mat}]});d['nodes'].append({'name':name,'mesh':len(d['meshes'])-1,'extras':{'familia_visual':family,'revision113':True}});d['scenes'][d.get('scene',0)]['nodes'].append(len(d['nodes'])-1)
  d['materials'][mats['cream']]['doubleSided']=True;d['materials'][mats['rubber']]['doubleSided']=True;d['materials'][mats['glass']]['doubleSided']=True
  d['asset']['revision113']='Taller L8: ventanilla alta redondeada, rejillas alojadas, bases y uniones de pasamanos; cotas aproximadas.';out=write(d,blob);path.write_bytes(gzip.compress(out,9,mtime=0));(ROOT/f'assets-source/trenes/{stem}.glb').write_bytes(out);report.append({'asset':stem,'endWindows':len(ends),'postMounts':len(xs)*2,'seatCount':len(layouts[stem]),'sha256':hashlib.sha256(out).hexdigest()})
(ROOT/'dist/documentacion/interiores113.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(report)
