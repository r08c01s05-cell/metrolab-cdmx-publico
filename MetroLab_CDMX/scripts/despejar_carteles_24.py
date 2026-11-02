"""Reubica grupos de señalización entre soportes; comprueba proyección frontal."""
from pathlib import Path
import numpy as np,json,struct,itertools,hashlib
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'dist';data=json.loads((D/'datos.json').read_text());report=[]
def matrix(n):
 if 'matrix' in n:return np.array(n['matrix']).reshape((4,4),order='F')
 x,y,z,w=n.get('rotation',[0,0,0,1]);m=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w),0],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w),0],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y),0],[0,0,0,1]],float);m[:3,:3]=m[:3,:3]@np.diag(n.get('scale',[1,1,1]));m[:3,3]=n.get('translation',[0,0,0]);return m
def bounds(j,n):
 boxes=[]
 for prim in j['meshes'][n['mesh']]['primitives']:
  a=j['accessors'][prim['attributes']['POSITION']];lo=np.array(a['min'],float);hi=np.array(a['max'],float)
  if a.get('normalized'):scale={5122:32767,5123:65535,5120:127,5121:255}[a['componentType']];lo=np.maximum(lo/scale,-1);hi=hi/scale
  pts=np.array([list(v)+[1] for v in itertools.product(*zip(lo,hi))]);p=(matrix(n)@pts.T).T[:,:3];boxes.extend(p)
 p=np.array(boxes);return p.min(axis=0),p.max(axis=0)
def intersect(a,b):return a[0]<b[1] and a[1]>b[0]
for st in data['estaciones']:
 p=D/st['geometria_3d']['url_glb'].split('?')[0];raw=p.read_bytes();sz=struct.unpack_from('<I',raw,12)[0];j=json.loads(raw[20:20+sz]);tail=raw[20+sz:];active=j['scenes'][0]['nodes'];obs=[];groups={}
 for i in active:
  n=j['nodes'][i];name=n.get('name','');low=name.lower()
  if 'mesh' not in n:continue
  lo,hi=bounds(j,n);center=(lo+hi)/2;side=1 if center[2]>0 else -1
  if any(t in low for t in ['machón','machon','columna','poste','pilar']) and hi[1]>1.8 and abs(center[2])>3.5:obs.append((lo,hi,name,side))
  if abs(center[2])<4:continue
  kind=None
  if any(t in low for t in ['marco cartel movilidad','cartel mapa aportado']):kind='mapa'
  elif any(t in low for t in ['marco recorrido','recorrido real esquema']):kind='diagrama'
  elif low.startswith('pictograma') or low.startswith('emblema remate'):kind='pictograma'
  elif st['linea']==8 and any(t in low for t in ['fondo mapa','marco plano','parada esquemática','trazado esquemático','rotulo_línea 8']):kind='diagrama-anterior'
  elif low.startswith('rotulo_') and 'incendio' not in low:kind='rotulo'
  if kind:
   x=round(float(center[0]),2)
   if kind=='diagrama-anterior':x=45 if x>=0 else -45
   key=(kind,x,side);groups.setdefault(key,[]).append((i,lo,hi))
 reserved=[];moved=[];checked=0
 def free(lo,hi,shift,side):
  xr=(lo[0]+shift-.16,hi[0]+shift+.16)
  if xr[0]<-74 or xr[1]>74:return False
  for a,b,name,s in obs:
   if s==side and intersect((lo[1],hi[1]),(a[1],b[1])) and intersect(xr,(a[0],b[0])) and min(abs(a[2]),abs(b[2]))<max(abs(lo[2]),abs(hi[2])):return False
  for a,b,s in reserved:
   if s==side and intersect((lo[1],hi[1]),(a[1],b[1])) and intersect(xr,(a[0],b[0])):return False
  return True
 for (kind,x,side),items in sorted(groups.items(),key=lambda kv:0 if kv[0][0] in ['mapa','diagrama','diagrama-anterior'] else 1):
  lo=np.min([a for _,a,_ in items],axis=0);hi=np.max([b for _,_,b in items],axis=0)
  candidates=[0]+[sign*i*.25 for i in range(1,121) for sign in [1,-1]]
  shift=next((v for v in candidates if free(lo,hi,v,side)),None)
  if shift is None:raise RuntimeError('No hay hueco para '+st['id']+' '+str((kind,x,side)))
  for i,a,b in items:
   n=j['nodes'][i]
   if 'matrix' in n:n['matrix'][12]+=shift
   else:n.setdefault('translation',[0,0,0])[0]+=shift
   n.setdefault('extras',{})['cartel_despejado_revision']=24
  lo[0]+=shift;hi[0]+=shift;reserved.append((lo,hi,side));checked+=1
  if shift:moved.append({'grupo':kind,'lado':side,'x_anterior':x,'desplazamiento':shift})
 # Runtime L8 map posters also use checked free slots rather than a hardcoded coordinate.
 slots=[]
 if st['linea']==8:
  for side in [-1,1]:
   lo=np.array([12-.61,2.9-.80,side*7.72]);hi=np.array([12+.61,2.9+.80,side*7.72]);shift=next((v for v in [0]+[sign*i*.25 for i in range(1,121) for sign in [1,-1]] if free(lo,hi,v,side)),None)
   if shift is None:raise RuntimeError(st['id']+' mapa runtime')
   slots.append({'side':side,'x':12+shift,'y':2.9,'z':side*7.72})
 st['geometria_3d']['posiciones_carteles_mapa']=slots;st['geometria_3d']['url_glb']=st['geometria_3d']['url_glb'].split('?')[0]+'?revision=24'
 packed=json.dumps(j,ensure_ascii=False,separators=(',',':')).encode();packed+=b' '*((-len(packed))%4);out=struct.pack('<III',0x46546c67,2,20+len(packed)+len(tail))+struct.pack('<II',len(packed),0x4e4f534a)+packed+tail;p.write_bytes(out)
 report.append({'id':st['id'],'grupos_verificados':checked,'grupos_reubicados':moved,'mapas_runtime':slots,'sha256':hashlib.sha256(out).hexdigest()})
(D/'datos.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');(D/'docs/Carteles_despejados_24.json').write_text(json.dumps({'criterio':'Sin intersección en proyección frontal con columnas o machones; margen lateral 0.16 m. Los ángulos oblicuos pueden ocultar parcialmente un cartel.','estaciones':report},ensure_ascii=False,indent=2)+'\n')
print('Estaciones:',len(report),'grupos reubicados:',sum(len(x['grupos_reubicados']) for x in report))
