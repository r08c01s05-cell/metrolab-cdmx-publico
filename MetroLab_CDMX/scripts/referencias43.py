"""Rebuild L8 moulded seats and reference-specific fittings; retain doors/testeros."""
from pathlib import Path
import json,struct,gzip,math
import numpy as np
layouts=json.loads(Path('dist/seat-layouts.json').read_text())
for stem in ['NM79_cabina','NM79_intermedio','MP82_cabina','MP82_intermedio']:
 src=Path('assets-source/trenes',stem+'.glb');base=Path('assets-source/trenes/base43',stem+'.glb');base.parent.mkdir(exist_ok=True)
 if not base.exists():base.write_bytes(src.read_bytes())
 b=base.read_bytes();n=struct.unpack_from('<I',b,12)[0];d=json.loads(b[20:20+n]);blob=bytearray(b[28+n:]);remove={i for i,n in enumerate(d['nodes'])if n.get('name','').startswith(('Asiento39_','Respaldo39_','Soporte asiento39'))}
 for n in d['nodes']:
  if 'children'in n:n['children']=[i for i in n['children']if i not in remove]
 for s in d['scenes']:s['nodes']=[i for i in s['nodes']if i not in remove]
 def rgb(h):
  c=np.array([int(h[i:i+2],16)/255 for i in [1,3,5]]);return np.where(c<=.04045,c/12.92,((c+.055)/1.055)**2.4).tolist()+[1]
 for m in d['materials']:
  name=m['name'].lower()
  if 'piso'in name:m['pbrMetallicRoughness']['baseColorFactor']=rgb('#a7b5a1')
  if 'asientos'in name:m['pbrMetallicRoughness']['baseColorFactor']=rgb('#99c447')
 def acc(a,typ):
  a=np.asarray(a,dtype='<f4');blob.extend(b'\0'*((-len(blob))%4));off=len(blob);blob.extend(a.tobytes());d['bufferViews'].append({'buffer':0,'byteOffset':off,'byteLength':a.nbytes,'target':34962});d['accessors'].append({'bufferView':len(d['bufferViews'])-1,'componentType':5126,'count':len(a),'type':typ,'min':a.min(0).tolist(),'max':a.max(0).tolist()});return len(d['accessors'])-1
 green=next(i for i,m in enumerate(d['materials'])if 'Asientos verdes' in m['name']and 'PBR41'in m['name']);steel=next(i for i,m in enumerate(d['materials'])if 'Pasamanos acero referencia39'in m['name']and 'PBR41'in m['name'])
 def mat(name,color,rough=.6,metal=0):
  d['materials'].append({'name':name,'pbrMetallicRoughness':{'baseColorFactor':rgb(color),'roughnessFactor':rough,'metallicFactor':metal}});return len(d['materials'])-1
 black=mat('Ventilador negro43','#242820',.9);trim=mat('Cerco ventilador43','#70786c',.45,.6);buckets={}
 def emit(name,v,f,material,family='interior',smooth=False):
  v=np.asarray(v,float);f=np.asarray(f,int);t=v[f];norm=np.cross(t[:,1]-t[:,0],t[:,2]-t[:,0]);norm/=np.maximum(np.linalg.norm(norm,axis=1)[:,None],1e-10)
  if smooth:
   vertexnorm=np.zeros_like(v)
   for k in range(3):np.add.at(vertexnorm,f[:,k],norm)
   vertexnorm/=np.maximum(np.linalg.norm(vertexnorm,axis=1)[:,None],1e-10);norm=vertexnorm[f].reshape(-1,3)
  else:norm=np.repeat(norm,3,axis=0)
  p=t.reshape(-1,3);uv=np.stack([p[:,0],p[:,1]+p[:,2]],-1)*3
  bucket=buckets.setdefault((material,family),[[],[],[]]);bucket[0].extend(p);bucket[1].extend(norm);bucket[2].extend(uv)
 def tube(points,r=.015,material=steel,family='interior'):
  points=np.asarray(points);v=[];segments=12
  for i,p in enumerate(points):
   tangent=points[min(i+1,len(points)-1)]-points[max(0,i-1)];tangent/=np.linalg.norm(tangent);u=np.cross(tangent,[0,0,1]if abs(tangent[2])<.9 else[0,1,0]);u/=np.linalg.norm(u);w=np.cross(tangent,u)
   v.extend([p+r*(math.cos(t)*u+math.sin(t)*w)for t in np.arange(segments)*math.tau/segments])
  faces=[]
  for k in range(len(points)-1):
   for j in range(segments):a=k*segments+j;b=k*segments+(j+1)%segments;c=b+segments;e=a+segments;faces.extend([(a,b,c),(a,c,e)])
  emit('tubo',v,faces,material,family,True)
 seats=layouts[stem][:24];ends=[-1,1]if stem.endswith('intermedio')else([1]if stem.startswith('NM79')else[-1])
 for end in ends:
  for side in [-1,1]:seats.append({'x':end*7.17,'z':side*.88,'height':1.70,'yaw':math.pi if side>0 else 0})
 layouts[stem]=seats
 for seat in seats:
  x,z,yaw=seat['x'],seat['z'],seat['yaw']
  def transform(v):
   a,b,c=v;return [x+math.cos(yaw)*a+math.sin(yaw)*c,b,z-math.sin(yaw)*a+math.cos(yaw)*c]
  # Cross-section from rounded front lip, through seat dish, into a curved back.
  profile=[(.225,1.665),(.222,1.691),(.195,1.712),(.12,1.696),(.02,1.687),(-.10,1.69),(-.16,1.71),(-.20,1.76),(-.221,1.83),(-.235,1.94),(-.255,2.13),(-.275,2.27),(-.286,2.32),(-.280,2.343)]
  widths=[.17,.19,.204,.212,.214,.214,.214,.213,.212,.211,.209,.199,.180,.161];v=[];cols=17
  for layer in [0,1]:
   for row,(q,y)in enumerate(profile):
    for col,u in enumerate(np.linspace(-1,1,cols)):
     edge=abs(u)**4;yy=y+(.018*edge if row<7 else 0)-layer*.034;qq=q+(.009*edge if row>=7 else 0)-layer*.020
     v.append(transform([u*widths[row],yy,qq]))
  rows=len(profile);count=rows*cols;f=[]
  for layer in [0,1]:
   for row in range(rows-1):
    for col in range(cols-1):
     a=layer*count+row*cols+col;quad=[(a,a+1,a+cols+1),(a,a+cols+1,a+cols)];f.extend(quad if layer==0 else[tuple(reversed(t))for t in quad])
  for row in range(rows-1):
   for col in [0,cols-1]:a=row*cols+col;b=a+cols;f.extend([(a,b,b+count),(a,b+count,a+count)])
  for row in [0,rows-1]:
   for col in range(cols-1):a=row*cols+col;f.extend([(a,a+count,a+count+1),(a,a+count+1,a+1)])
  # Top surface winding is corrected for the local cross-section orientation.
  emit('Asiento anatomico43',v,f,green,smooth=True)
  # Continuous tubular base instead of four thin independent pegs.
  for lateral in [-.145,.145]:tube([transform([lateral,1.62,.13]),transform([lateral,1.30,.13]),transform([lateral,1.275,.10]),transform([lateral,1.275,-.18]),transform([lateral,1.30,-.20]),transform([lateral,1.62,-.20])],.014)
  # Curved grab handle visible above each back, as in the supplied photographs.
  points=[transform([.14*math.cos(t),2.335+.17*math.sin(t),-.278])for t in np.linspace(0,math.pi,21)];tube(points,.012)
  # Subtle moulded border around the recessed back centre.
  border=[]
  for t in np.arange(65)*math.tau/64:
   a=.156*np.sign(math.cos(t))*abs(math.cos(t))**.30;y=2.07+.207*np.sign(math.sin(t))*abs(math.sin(t))**.30;q=-.246-(y-2.07)*.13+.004;border.append(transform([a,y,q]))
  tube(border,.0028,green)
 # Circular fan guards mounted under the existing ceiling housings.
 centers=sorted(set(round(s['x']+.61,3)for s in seats[:24]if s['yaw']>0))
 for c in centers:
  for radius,material in [(.19,trim),(.15,black),(.11,black),(.07,black)]:tube([[c+radius*math.cos(t),3.163,radius*math.sin(t)]for t in np.arange(65)*math.tau/64],.005,material,'roof')
  for angle in np.arange(8)*math.tau/8:tube([[c+rr*math.cos(angle),3.159,rr*math.sin(angle)]for rr in [.03,.19]],.003,black,'roof')
 for (material,family),(p,norm,uv)in buckets.items():
  attributes={'POSITION':acc(p,'VEC3'),'NORMAL':acc(norm,'VEC3'),'TEXCOORD_0':acc(uv,'VEC2')};d['meshes'].append({'name':'Referencia43_'+family,'primitives':[{'attributes':attributes,'material':material}]});d['nodes'].append({'name':'Referencia43_'+family,'mesh':len(d['meshes'])-1,'extras':{'familia_visual':family,'revision_interior':43}});d['scenes'][d.get('scene',0)]['nodes'].append(len(d['nodes'])-1)
 d['buffers'][0]['byteLength']=len(blob);d['asset']['generator']='Interiores referencia43; asientos moldeados y herrajes; escala aproximada';j=json.dumps(d,separators=(',',':')).encode();j+=b' '*((-len(j))%4);blob.extend(b'\0'*((-len(blob))%4));out=struct.pack('<4sII',b'glTF',2,28+len(j)+len(blob))+struct.pack('<I4s',len(j),b'JSON')+j+struct.pack('<I4s',len(blob),b'BIN\0')+blob;src.write_bytes(out);Path('dist/models',stem+'.glb.gz').write_bytes(gzip.compress(out,9,mtime=0));print(stem,len(seats),'asientos con carcasa continua')
Path('dist/seat-layouts.json').write_text(json.dumps(layouts,separators=(',',':'))+'\n')
p=Path('dist/passenger-seats.js');s=p.read_text();s=s[s.index('export function'):];s=s.replace('(column*7)','(column*(seats.length===28?5:7))');p.write_text('const layouts='+json.dumps(layouts,separators=(',',':'))+';\n'+s)
