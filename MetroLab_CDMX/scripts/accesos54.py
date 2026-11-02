"""Retira escaleras repetidas sin respaldo y crea accesos conectados al andén."""
from estaciones48 import GLB,matrix
from pathlib import Path
import subprocess,json,numpy as np,copy
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'dist';BASE='dadf9b2bd78f9edc83c9ff18edbe12a53cf4282a'
# Classification describes the representation, not a surveyed station plan.
SIDE={7,8,12,13,17,19};STAIR=('Peldaño acceso aproximado','Descanso acceso','Pasamanos acceso','Montante barandal','Barandal acceso')
def subtract_triangle(poly,lo,hi):
 outside=[];inside=poly
 for axis in range(3):
  for bound,sign in [(lo[axis],1),(hi[axis],-1)]:
   a=[];b=[]
   if len(inside)<3:break
   for k,p in enumerate(inside):
    q=inside[(k+1)%len(inside)];dp=sign*(p[axis]-bound);dq=sign*(q[axis]-bound);pin=dp>=-1e-8;qin=dq>=-1e-8
    (a if pin else b).append(p)
    if pin!=qin:
     v=p+(q-p)*(dp/(dp-dq));a.append(v);b.append(v)
   if len(b)>=3:outside.append(b)
   inside=a
 return outside

def cut(g,lo,hi):
 j=g.j
 for idx in list(j['scenes'][0]['nodes']):
  n=j['nodes'][idx]
  if'mesh'not in n:continue
  a,b=g.bounds(n)
  if np.any(b<lo)or np.any(a>hi):continue
  # Never cut equipment, maps, tracks or advertising to make an entrance fit.
  if n.get('extras',{}).get('componente')not in ['pared','estructura','techo']:continue
  if any(t in n.get('name','')for t in ['cartel','Cartel','publicidad','mapa','Pictograma','Salida','Rotulo','Gabinete','Extintor','Monitor','Display']):continue
  m=matrix(n);newpr=[];changed=False
  for pr in j['meshes'][n['mesh']]['primitives']:
   attrs=pr['attributes'];pos=g.array(attrs['POSITION'])@m[:3,:3].T+m[:3,3];norm=g.array(attrs['NORMAL'])@np.linalg.inv(m[:3,:3]);norm/=np.maximum(np.linalg.norm(norm,axis=1)[:,None],1e-9);uv=g.array(attrs['TEXCOORD_0'])if'TEXCOORD_0'in attrs else np.zeros((len(pos),2));data=np.c_[pos,norm,uv];ids=g.array(pr['indices']).astype(int).ravel()if'indices'in pr else np.arange(len(pos));tris=data[ids.reshape(-1,3)];out=[]
   for tri in tris:
    if np.any(tri[:,:3].max(0)<lo)or np.any(tri[:,:3].min(0)>hi):out.append(tri);continue
    pieces=subtract_triangle(list(tri),lo,hi);changed=True
    for poly in pieces:
     for k in range(1,len(poly)-1):out.append([poly[0],poly[k],poly[k+1]])
   if out:
    arr=np.array(out).reshape(-1,8);p=copy.deepcopy(pr);p.pop('indices',None);p['attributes']={'POSITION':g.acc(arr[:,:3],'VEC3'),'NORMAL':g.acc(arr[:,3:6],'VEC3'),'TEXCOORD_0':g.acc(arr[:,6:8],'VEC2')};newpr.append(p)
  if changed:
   if not newpr:n.pop('mesh');continue
   mi=len(j['meshes']);j['meshes'].append({'primitives':newpr});n['mesh']=mi
   for key in ['matrix','translation','rotation','scale']:n.pop(key,None)
   n.setdefault('extras',{})['hueco_acceso_revision']=54

def main():
 data=json.loads(subprocess.check_output(['git','show',BASE+':dist/datos.json'],cwd=ROOT));reports=[]
 for st in data['estaciones']:
  if st['linea']!=1:continue
  rel=st['geometria_3d']['url_glb'].split('?')[0];g=GLB(subprocess.check_output(['git','show',BASE+':dist/'+rel],cwd=ROOT));j=g.j;num=st['orden'];removed=[];access=[]
  if num==20:
   reports.append({'id':st['id'],'criterio':'Escaleras visibles en la referencia de Observatorio; conservadas, ubicación aproximada.','retirados':0});st['geometria_3d']['criterio_accesos54']='Escaleras visibles conservadas; ubicación aproximada.';continue
  roots=j['scenes'][0]['nodes'];removed=[i for i in roots if j['nodes'][i].get('name','').startswith(STAIR)];roots[:]=[i for i in roots if i not in removed]
  wall=g.material('Panel pasillo claro54',[216,217,211],.75);floor=g.material('Piso pasillo54',[144,148,145],.65);dark=g.material('Remate oscuro acceso54',[53,57,57],.85);lamp=g.material('Luz pasillo54',[237,238,220],.7);j['materials'][lamp]['emissiveFactor']=[.5,.51,.46]
  def box(name,pos,size,mat,comp='estructura'):g.box(name,pos,size,mat,comp,{'revision_accesos':54})
  # Close the ceiling gaps formerly reserved for the universal stairs.
  for side in [-1,1]:
   slabs=[]
   for i in roots:
    n=j['nodes'][i]
    if'mesh'in n and n.get('name','').startswith('Plafón modular'):
     a,b=g.bounds(n)
     if np.sign((a[2]+b[2])/2)==side and min(abs(a[2]),abs(b[2]))>3:slabs.append((a,b))
   if slabs:
    intervals=sorted((a[0],b[0])for a,b in slabs);merged=[]
    for a,b in intervals:
     if merged and a-merged[-1][1]<.1:merged[-1]=(merged[-1][0],max(b,merged[-1][1]))
     else:merged.append((a,b))
    for left,right in zip(merged,merged[1:]):
     a,b=left[1],right[0]
     if .3<b-a<13:
      roofy=float(np.median([(v[1]+w[1])/2 for v,w in slabs]));box('Plafon restaurado sin escalera54',[(a+b)/2,roofy,side*5.64],[b-a,.07,4.74],wall,'techo')
  if num not in SIDE:
   # End passage: clear platform remains entirely level. No new hole in advertisement walls.
   for side in [-1,1]:
    for end in [-1,1]:
     z=side*5.95;w=2.7;start=end*74.8;length=6.2;cx=end*(74.8+length/2)
     lo=np.array([min(start,end*75.7),1.18,z-w/2]);hi=np.array([max(start,end*75.7),3.70,z+w/2]);cut(g,lo,hi)
     box('Piso pasillo longitudinal54',[cx,1.185,z],[length,.05,w],floor)
     for dz in [-w/2-.08,w/2+.08]:box('Pared pasillo longitudinal54',[cx,2.44,z+dz],[length,2.52,.15],wall,'pared')
     box('Techo pasillo longitudinal54',[cx,3.73,z],[length,.10,w+.3],wall,'techo')
     box('Luz acceso longitudinal54',[cx,3.64,z],[length-.4,.025,.08],lamp,'techo')
     # A real side turn terminates the view; not a black painted doorway.
     box('Fondo giro acceso54',[end*82.3,2.44,z],[.15,2.52,w],wall,'pared')
     box('Piso giro acceso54',[end*81.0,1.185,z+side*1.4],[2.7,.05,2.8],floor)
     box('Techo giro acceso54',[end*81.0,3.73,z+side*1.4],[2.7,.10,2.8],wall,'techo')
     access.append({'tipo':'pasillo_extremo','x':end*74.9,'z':z,'lado':side,'direccion':end,'ancho':w,'altura_libre':2.45,'cotas':'aproximadas'})
  else:
   for side in [-1,1]:
    desired=-57 if num in [8,17]else(-18 if side==1 else 17);w=2.4;options=[]
    for x in np.arange(desired-14,desired+15,.5):
     bad=False
     for i in roots:
      n=j['nodes'][i];name=n.get('name','')
      if'mesh'not in n or not name.startswith(('Machón','Columna','Pilar','Marco publicidad','Panel publicidad','Cartel mapa','Marco cartel','Gabinete','Extintor','Pictograma')):continue
      a,b=g.bounds(n)
      if np.sign((a[2]+b[2])/2)!=side or b[1]<1.4 or a[1]>3.9:continue
      if a[0]<x+w/2+.3 and b[0]>x-w/2-.3:bad=True;break
     if not bad:options.append(float(x))
    assert options,(st['id'],'no espacio libre para acceso');x=min(options,key=lambda x:abs(x-desired));lo=np.array([x-w/2,1.18,min(side*7.85,side*8.3)]);hi=np.array([x+w/2,3.65,max(side*7.85,side*8.3)]);cut(g,lo,hi)
    depth=5.5;cz=side*(8+depth/2)
    box('Piso pasillo lateral54',[x,1.185,cz],[w,.05,depth],floor)
    for dx in [-w/2-.07,w/2+.07]:box('Pared pasillo lateral54',[x+dx,2.43,cz],[.14,2.5,depth],wall,'pared')
    box('Techo pasillo lateral54',[x,3.73,cz],[w+.28,.12,depth],wall,'techo');box('Luz acceso lateral54',[x,3.63,cz],[.09,.02,depth-.3],lamp,'techo')
    # Offset end wall leaves a turning continuation, visually away from the platform.
    box('Fondo giro acceso lateral54',[x,2.43,side*14.6],[w+.28,2.5,.14],wall,'pared')
    box('Piso giro acceso lateral54',[x+1.25,1.185,side*13.3],[2.5,.05,2.5],floor)
    box('Techo giro acceso lateral54',[x+1.25,3.73,side*13.3],[2.5,.12,2.5],wall,'techo')
    access.append({'tipo':'pasillo_lateral','x':x,'z':side*8,'lado':side,'ancho':w,'altura_libre':2.45,'cotas':'aproximadas'})
  for i in roots:
   n=j['nodes'][i]
   if 'mesh'not in n or not n.get('name','').startswith(('Salida sobre andén','Rotulo_← SALIDA')):continue
   a,b=g.bounds(n);side=1 if(a[2]+b[2])>0 else-1
   cx=float((a[0]+b[0])/2);dest=next(ac['x']for ac in access if ac['lado']==side) if num in SIDE else(-68 if side==1 else 68)
   delta=dest-cx
   if 'matrix'in n:n['matrix'][12]+=delta
   else:n.setdefault('translation',[0,0,0])[0]+=delta
   n.setdefault('extras',{})['senaletica_accesos54']=True
  st['geometria_3d'].update(url_glb=rel+'?revision=54',revision_accesos=54,accesos_anden=access,criterio_accesos54='Se retira la escalera repetida sin evidencia; acceso '+('lateral de correspondencia/pasarela'if num in SIDE else'por pasillo de extremo')+'. Planta y posición provisionales: las referencias no constituyen un levantamiento completo.')
  g.save(D/rel);reports.append({'id':st['id'],'nombre':st['nombre'],'retirados':len(removed),'accesos':access})
 (D/'datos.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');(D/'docs/Accesos_linea1_54.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2)+'\n');print('L1 revisada:',len(reports),'estaciones;',sum(x['retirados']for x in reports),'piezas de escaleras repetidas retiradas')
if __name__=='__main__':main()
