"""Integrate photo-observed L8 fittings and Garibaldi finishes; preserve animation channels and accesses."""
from pathlib import Path
import gzip,json,copy,math,subprocess,shutil,io
import numpy as np
from PIL import Image
from estaciones48 import GLB,linear,matrix
from glb141 import read,write,graft,compact
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision141';O.mkdir(exist_ok=True,parents=True)
BASE='7f5dcb4305dadc87f265411fc78be7277761ed73'
refs=R/'assets-source/referencias141';refs.mkdir(exist_ok=True)
for f in ['image(20261018-011259).png','image(20261018-011308).png','image(20261018-011316).png','image(20261018-011323).png','WhatsApp Video 2026-10-17 at 19.00.54.mp4']:
 shutil.copy2(Path('/workspace/scratch/fc8783fbaffa/upload')/f,refs/f)
parts,pbin=read((O/'accesorios_L8_141.glb').read_bytes())
def original(rel):return subprocess.check_output(['git','show',BASE+':'+rel],cwd=R)
def clone_tree(d,index):
 n=copy.deepcopy(d['nodes'][index]);children=n.pop('children',[]);i=len(d['nodes']);d['nodes'].append(n)
 if children:n['children']=[clone_tree(d,c)for c in children]
 return i

def metric(g,n,pr,scale):
 a=pr['attributes'];m=matrix(n);p=g.array(a['POSITION'])@m[:3,:3].T+m[:3,3];normal=g.array(a['NORMAL'])@np.linalg.inv(m[:3,:3]);axis=np.abs(normal).argmax(1);uv=np.zeros((len(p),2))
 for ax,cols in [(0,(2,1)),(1,(0,2)),(2,(0,1))]:
  mask=axis==ax;uv[mask]=p[mask][:,cols]/scale
 a['TEXCOORD_0']=g.acc(uv,'VEC2')

def outward_floor(g,p):
 # Legacy thin boxes had inward-facing triangles/normals, hiding their upper finish.
 a=p['attributes'];v=g.array(a['POSITION']);normal=g.array(a['NORMAL']);center=(v.min(axis=0)+v.max(axis=0))/2
 dots=np.einsum('ij,ij->i',v-center,normal)
 if np.mean(dots<0)<.85:return
 ids=g.array(p['indices']).astype(np.uint32).ravel()if'indices'in p else np.arange(len(v),dtype=np.uint32)
 ids=ids.reshape(-1,3)[:,[0,2,1]].copy().ravel();idx=len(g.j['accessors']);g.j['accessors'].append({'bufferView':g.blob(ids.astype('<u4').tobytes()),'componentType':5125,'count':len(ids),'type':'SCALAR','min':[int(ids.min())],'max':[int(ids.max())]});p['indices']=idx;a['NORMAL']=g.acc(-normal,'VEC3');a.pop('TANGENT',None);p.setdefault('extras',{})['outwardFloor141']=True

def floor_material(g,station=False):
 N=256;rng=np.random.default_rng(141 if station else 142);y,x=np.mgrid[0:N,0:N]/N
 noise=rng.normal(0,1,(N,N));broad=np.sin(2*np.pi*(x*3+y*2))*.4+np.cos(2*np.pi*(x*7-y))*.2
 grain=rng.random((N,N));flecks=np.where(grain<.016,18,np.where(grain>.985,-12,0))
 if station:
  # 1.8 m tile: 2 x 3 slabs, nominal .90 x .60 m; fine light veining.
  seam=(np.minimum(x*2%1,1-x*2%1)<.002)|(np.minimum(y*3%1,1-y*3%1)<.003)
  vein=np.maximum(0,np.sin((x*11+y*6+np.sin(y*6.28)*.2)*2*np.pi)-.982)*310
  cells=np.array([[0,3],[-2,1],[2,-3]])[(y*3).astype(int),(x*2).astype(int)]
  color=np.array([136,144,147])[None,None,:]+(noise*1.6+broad*2+vein+cells)[:,:,None];color[seam]=[82,88,90];rough=.54+noise*.018+seam*.15;scale=1.8
 else:
  color=np.array([160,162,157])[None,None,:]+(noise*1.2+flecks+broad)[:,:,None];rough=.73+noise*.018;scale=.55
 normal=np.zeros((N,N,3));normal[:]=[128,128,255];normal[:,:,0]+=noise*.75;normal[:,:,1]-=noise*.6
 mr=np.zeros((N,N,3));mr[:,:,0]=255;mr[:,:,1]=np.clip(rough,0,1)*255
 i=g.material('Pavimento piedra gris Garibaldi141'if station else'Piso gris grano fino L8 referencia141',[255,255,255],1,0);m=g.j['materials'][i];m['extras']={'reference141':'video Garibaldi'if station else'011316','metricScale141':scale};m['pbrMetallicRoughness'].update(baseColorTexture={'index':g.texture('Albedo mineral141',color)},metallicRoughnessTexture={'index':g.texture('Rugosidad mineral141',mr)});m['normalTexture']={'index':g.texture('Microrelieve mineral141',normal),'scale':.13};return i,scale

report=[]
for model in ['NM79','MP82']:
 for unit in ['cabina','intermedio']:
  stem=model+'_'+unit;rel=f'dist/models/{stem}.glb.gz';g=GLB(gzip.decompress(original(rel)));d=g.j;obsolete=set()
  for i,n in enumerate(d['nodes']):
   if n.get('name')=='Luminaria lineal39':obsolete.add(i)
   if n.get('name')=='Detalle41_roof'and all('Difusor luz41'==d['materials'][p['material']]['name']for p in d['meshes'][n['mesh']]['primitives']):obsolete.add(i)
  for n in d['nodes']:
   if'children'in n:n['children']=[i for i in n['children']if i not in obsolete]
  for s in d['scenes']:s['nodes']=[i for i in s['nodes']if i not in obsolete]
  floor,scale=floor_material(g)
  for n in d['nodes']:
   if'mesh'not in n or n.get('name')not in ['interior__Piso gris antideslizante','interior__Piso verde']:continue
   m=copy.deepcopy(d['meshes'][n['mesh']]);n['mesh']=len(d['meshes']);d['meshes'].append(m)
   for p in m['primitives']:p['material']=floor;metric(g,n,p,scale);outward_floor(g,p)
  for m in d['materials']:
   if m.get('name')=='Panel cielo verde agua referencia140':m['name']='Panel cielo marfil fotografias141';m['pbrMetallicRoughness'].update(baseColorFactor=linear([216,220,211])+[1],roughnessFactor=.43,metallicFactor=.04)
  offs=graft(d,g.b,parts,pbin);source={n.get('extras',{}).get('detail141'):i for i,n in enumerate(d['nodes'])if n.get('extras',{}).get('detail141')}
  def place(kind,pos,rot=None,family='roof'):
   i=clone_tree(d,source[kind]);n=d['nodes'][i];n['translation']=pos;n['name']+=' '+str(i)
   if rot:n['rotation']=rot
   def mark(idx):
    q=d['nodes'][idx];q.setdefault('extras',{}).update(familia_visual=family,componente=family,referenceRevision141=141)
    for c in q.get('children',[]):mark(c)
   mark(i);d['scenes'][0]['nodes'].append(i);return i
  for z in [-.95,.95]:
   for x in [-5.84,-2.92,0,2.92,5.84]:place('ribbed_luminaire',[x,3.23,z])
  # Preserve hand-contact bars and add only their mounting collars.
  poles=[n for n in d['nodes']if n.get('name')=='Poste pasillo39']
  for n in poles:
   a,b=g.bounds(n);p=(a+b)/2;place('rail_joint',[float(p[0]),3.215,float(p[2])],family='interior')
  ends=([1]if model=='NM79'else[-1])if unit=='cabina'else[-1,1]
  for sign in ends:place('speaker',[sign*7.59,3.18,0],[0,math.sin(-sign*math.pi/4),0,math.cos(math.pi/4)],family='interior')
  d['asset']['revision141']=True;d,b=compact(d,g.b);out=write(d,b);(R/rel).write_bytes(gzip.compress(out,9,mtime=0));(O/(stem+'.glb')).write_bytes(out)
  report.append({'id':stem,'newLuminaireModules':10,'speakerGrilles':len(ends),'railJoints':len(poles),'obsoleteLightBatchesRemoved':len(obsolete),'bytes':(R/rel).stat().st_size});print(report[-1],flush=True)
# Station: current topology, platform openings and path metadata remain authoritative.
rel='dist/models/andenes/L8/L8_01_Garibaldi_Lagunilla.glb.gz';g=GLB(gzip.decompress(original(rel)));d=g.j;floor,scale=floor_material(g,True)
edge=g.material('Concreto claro borde Garibaldi141',[184,186,180],.79);dark=g.material('Pintura grafito cubierta Garibaldi141',[35,38,39],.64,.12)
roots=d['scenes'][0]['nodes'];removed=[]
for i in list(roots):
 n=d['nodes'][i];name=n.get('name','')
 if'mesh'not in n:continue
 # Obsolete 3 m grid would conflict with the new photograph-based slab joints.
 if name.startswith(('Junta terrazo','Junta longitudinal terrazo','Canal luminaria','Difusor tubular','Clip luminaria')):roots.remove(i);removed.append(name);continue
 if name.startswith(('Pavimento','Descanso')):
  # Existing structural platform ends at Y=1.210; surface used to sit below it.
  if name.startswith('Pavimento'):
   if 'matrix'in n:n['matrix'][13]+=.006
   else:n.setdefault('translation',[0,0,0])[1]+=.006
  mm=copy.deepcopy(d['meshes'][n['mesh']]);n['mesh']=len(d['meshes']);d['meshes'].append(mm)
  for p in mm['primitives']:p['material']=floor;metric(g,n,p,scale);outward_floor(g,p)
 if name.startswith(('Cassette plafón','Viga de cubierta','Perfil plafón longitudinal')):
  mm=copy.deepcopy(d['meshes'][n['mesh']]);n['mesh']=len(d['meshes']);d['meshes'].append(mm)
  for p in mm['primitives']:p['material']=dark
 # Move strip and its detail together: a real setback, not tactile at platform lip.
 if name.startswith(('Borde seguridad continuo','Estría borde de seguridad')):
  a,b=g.bounds(n);sgn=1 if a[2]+b[2]>0 else-1
  if'matrix'in n:n['matrix'][14]+=sgn*.54
  else:n.setdefault('translation',[0,0,0])[2]+=sgn*.54
for s in [-1,1]:g.box('Remate concreto borde Garibaldi141',[0,1.215,s*3.525],[150,.004,.55],edge,'anden',{'revision141':141})
# Square tactile studs are an explicitly approximate .028 m pitch normal texture.
N=128;y,x=np.mgrid[0:N,0:N];u=(x%16-7.5)/16;v=(y%16-7.5)/16;r=np.sqrt(u*u+v*v);h=np.clip((.27-r)*18,0,1);gy,gx=np.gradient(h);nm=np.stack([128-gx*110,128-gy*110,np.full_like(h,255)],-1)
for m in d['materials']:
 if m.get('name')=='Borde amarillo seguridad':m['normalTexture']={'index':g.texture('Botones tactiles Garibaldi141',nm),'scale':.6};m['pbrMetallicRoughness']['roughnessFactor']=.69
for n in d['nodes']:
 if'mesh'in n and n.get('name','').startswith('Borde seguridad continuo'):
  mm=copy.deepcopy(d['meshes'][n['mesh']]);n['mesh']=len(d['meshes']);d['meshes'].append(mm)
  for p in mm['primitives']:metric(g,n,p,.224);outward_floor(g,p)
# The video shows short transverse light fittings, replacing the old longitudinal tubes.
offs=graft(d,g.b,parts,pbin);lampSource=next(i for i,n in enumerate(d['nodes'])if n.get('extras',{}).get('detail141')=='ribbed_luminaire')
for side in [-1,1]:
 for x in range(-72,73,6):
  i=clone_tree(d,lampSource);nd=d['nodes'][i];nd['name']='Luminaria transversal Garibaldi141 '+str(i);nd['translation']=[x+1.5,4.99,side*4.9];nd['rotation']=[0,math.sin(math.pi/4),0,math.cos(math.pi/4)];nd['scale']=[.8,1,1]
  def mark(idx):
   n=d['nodes'][idx];n.setdefault('extras',{}).update(componente='techo',referenceRevision141=141)
   for c in n.get('children',[]):mark(c)
  mark(i);d['scenes'][0]['nodes'].append(i)
d['asset']['revision141']=True;d,b=compact(d,g.b);out=write(d,b);(R/rel).write_bytes(gzip.compress(out,9,mtime=0));(O/'Garibaldi_Lagunilla141.glb').write_bytes(out)
data=json.loads((R/'dist/datos.json').read_text());st=next(s for s in data['estaciones']if s['id']=='L8-01');st['geometria_3d'].update(url_glb=rel.removeprefix('dist/')+'?revision=141',revision_referencias141=141,analisis_referencias141='Video aportado: piso gris rectangular con juntas, borde claro, franja táctil separada del borde, cubierta oscura. Se mantiene la planta y los accesos aproximados anteriores; no se deducen dimensiones exactas ni nuevas plantas de la grabación.');(R/'dist/datos.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
report.append({'id':'L8-01','removedOldFloorJointMeshes':sum(n.startswith(('Junta terrazo','Junta longitudinal terrazo'))for n in removed),'removedOldLightMeshes':sum(n.startswith(('Canal luminaria','Difusor tubular','Clip luminaria'))for n in removed),'newTransverseLuminaires':50,'tactileSetbackApproximateM':.54,'bytes':(R/rel).stat().st_size});(O/'integration141.json').write_text(json.dumps(report,indent=2));print(report[-1],flush=True)
