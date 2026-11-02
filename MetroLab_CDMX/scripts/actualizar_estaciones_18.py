"""Actualiza GLB desde fotografías del usuario. Coordenadas Y-up, metros aproximados.
Uso: python scripts/actualizar_estaciones_18.py /ruta/referencias /ruta/mapa_cartel.jpg
Requiere Pillow y numpy. Ejecutar sobre la revisión 17 (copia en Git).
"""
import json,struct,sys,io,math,hashlib
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist';REF=Path(sys.argv[1]);MAP=Path(sys.argv[2]);TEX=DIST/'textures/revision18';TEX.mkdir(parents=True,exist_ok=True)
# Orden Pantitlán -> Observatorio. Fechas de captura de las fotografías no verificadas.
ICONS=['20261010-075617','20261010-075400','20261010-075233','20261010-074907','20261010-074726','20261010-074558','20261010-074429','20261010-074322','20261010-074124','20261009-063742','20261009-063407','20261009-063107','20261009-062725','20261009-061732','20261009-061524','20261009-061135','20261009-060813','20261009-055331','20261009-055019','20261009-054444']
WHITE={6,8,11,12,14,20};STONE={1,2,3,4,5,7,9,10,13,15,16,17,18,19}
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
class GLB:
 def __init__(self,path):
  b=path.read_bytes();n=struct.unpack_from('<I',b,12)[0];self.j=json.loads(b[20:20+n]);self.b=bytearray(b[28+n:]);self.j.setdefault('materials',[]);self.j.setdefault('textures',[]);self.j.setdefault('images',[]);self.cube=None
 def blob(self,b):
  self.b.extend(b'\0'*((-len(self.b))%4));off=len(self.b);self.b.extend(b);v=len(self.j['bufferViews']);self.j['bufferViews'].append({'buffer':0,'byteOffset':off,'byteLength':len(b)});return v
 def acc(self,a,typ):
  a=np.asarray(a,dtype='<f4');v=self.blob(a.tobytes());idx=len(self.j['accessors']);self.j['accessors'].append({'bufferView':v,'componentType':5126,'count':len(a),'type':typ,'min':a.min(axis=0).tolist(),'max':a.max(axis=0).tolist()});return idx
 def mat(self,name,c,rough=.65,metal=0):
  idx=len(self.j['materials']);self.j['materials'].append({'name':name,'pbrMetallicRoughness':{'baseColorFactor':[*c,1],'roughnessFactor':rough,'metallicFactor':metal}});return idx
 def texture(self,name,im):
  out=io.BytesIO();im.convert('RGB').save(out,format='JPEG',quality=82,optimize=True);v=self.blob(out.getvalue());idx=len(self.j['images']);self.j['images'].append({'name':name,'bufferView':v,'mimeType':'image/jpeg'});t=len(self.j['textures']);self.j['textures'].append({'source':idx});m=self.mat(name,[1,1,1],.78);self.j['materials'][m]['pbrMetallicRoughness']['baseColorTexture']={'index':t};self.j['materials'][m]['doubleSided']=True;return m
 def geometry(self,positions,normals,uv=None):
  attrs={'POSITION':self.acc(positions,'VEC3'),'NORMAL':self.acc(normals,'VEC3')}
  if uv is not None:attrs['TEXCOORD_0']=self.acc(uv,'VEC2')
  return attrs
 def node(self,name,attrs,mat,pos,scale,comp,quat=None):
  mesh=len(self.j['meshes']);self.j['meshes'].append({'name':name,'primitives':[{'attributes':attrs,'material':mat}]});node={'name':name,'mesh':mesh,'translation':pos,'scale':scale,'extras':{'componente':comp,'revision':'18','cotas':'aproximadas'}}
  if quat:node['rotation']=quat
  ni=len(self.j['nodes']);self.j['nodes'].append(node);self.j['scenes'][0]['nodes'].append(ni)
 def box(self,name,pos,size,mat,comp='equipo',quat=None):
  if self.cube is None:
   p=[];n=[]
   for axis in range(3):
    for sign in [-1,1]:
     normal=np.eye(3)[axis]*sign;u=np.eye(3)[(axis+1)%3];v=np.cross(normal,u);verts=[normal*.5+u*a+v*b for a,b in [(-.5,-.5),(.5,-.5),(.5,.5),(-.5,.5)]]
     for k in [0,1,2,0,2,3]:p.append(verts[k]);n.append(normal)
   self.cube=self.geometry(p,n)
  self.node(name,self.cube,mat,pos,size,comp,quat)
 def panel(self,name,x,y,z,w,h,mat,side):
  # Each face points toward its platform; readable from the interior.
  p=[[-.5,-.5,0],[.5,-.5,0],[.5,.5,0],[-.5,-.5,0],[.5,.5,0],[-.5,.5,0]];uv=[[0,1],[1,1],[1,0],[0,1],[1,0],[0,0]]
  attrs=self.geometry(p,[[0,0,1]]*6,uv);self.node(name,attrs,mat,[x,y,z],[w,h,1],'pared',[0,1,0,0] if side>0 else None)
 def save(self,path):
  self.j['buffers'][0]['byteLength']=len(self.b);self.b.extend(b'\0'*((-len(self.b))%4));j=json.dumps(self.j,ensure_ascii=False,separators=(',',':')).encode();j+=b' '*((-len(j))%4);path.write_bytes(struct.pack('<III',0x46546c67,2,28+len(j)+len(self.b))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(self.b),0x004e4942)+self.b)

def findimg(stamp):
 for base in [REF,Path('/workspace/scratch/fc8783fbaffa/upload')]:
  p=base/f'image({stamp}).png'
  if p.exists():return Image.open(p).convert('RGB')
 raise FileNotFoundError(stamp)

data=json.loads((DIST/'datos.json').read_text());stations=sorted([s for s in data['estaciones'] if s['linea']==1],key=lambda s:s['orden']);report=[]
mapim=Image.open(MAP).convert('RGB');mapim.thumbnail((900,1200));mapim.save(TEX/'mapa_movilidad.jpg',quality=85)
# Diagrama aportado: vértices y estaciones normalizados, sin atribuir escala topográfica.
xy=[[98,302],[139,261],[168,231],[199,200],[234,166],[270,138],[308,138],[349,138],[425,138],[473,138],[522,138],[558,123],[628,51],[664,51],[703,91],[731,119],[742,157],[750,194],[773,218],[822,227]]
# Add bends to segments Candelaria-Merced and Moctezuma-Balbuena / Zaragoza-Pantitlan as in source.
route={'type':'esquema_aportado_no_georreferenciado','source':'image(20261010-075912).png','stations':{s['id']:xy[19-i] for i,s in enumerate(stations)},'note':'Forma tomada del esquema del usuario. Distancias del motor aproximadas; no contiene radios de curva ni coordenadas topográficas.'}
(DIST/'recorrido_L1.json').write_text(json.dumps(route,ensure_ascii=False,indent=2))
# High contrast printable route, readable in 3D; use full station names.
routeim=Image.new('RGB',(1800,800),'#faf8f5');dr=ImageDraw.Draw(routeim);f=ImageFont.truetype(font,22);fb=ImageFont.truetype(font,34)
dr.text((50,25),'LÍNEA 1 · OBSERVATORIO — PANTITLÁN',font=fb,fill='#b62770');pts=[(x*1.95+20,y*1.55+135) for x,y in xy];dr.line(pts,fill='#d64d93',width=14)
for i,(s,p) in enumerate(zip(reversed(stations),pts)):
 dr.ellipse((p[0]-7,p[1]-7,p[0]+7,p[1]+7),fill='white',outline='#373a40',width=2)
 # Rotated station names keep all twenty labels separate.
 label=Image.new('RGBA',(340,42));ImageDraw.Draw(label).text((0,2),s['nombre'],font=f,fill='#252b34');label=label.rotate(55,expand=True);routeim.paste(label,(int(p[0]-8),int(p[1]+16)),label)
dr.text((50,745),'Esquema de referencia del usuario · sin escala geográfica',font=f,fill='#59616b');routeim.save(TEX/'recorrido_linea1.jpg',quality=90)
for i,s in enumerate(stations):
 num=i+1;path=DIST/s['geometria_3d']['url_glb'].split('?')[0];g=GLB(path);j=g.j
 # Remove obsolete generic line diagrams; retain tracks and access collision layout.
 obsolete=('Fondo mapa','Marco plano de línea','Parada esquemática','Trazado esquemático','Rotulo_LÍNEA 1')
 roots=j['scenes'][0]['nodes'];j['scenes'][0]['nodes']=[k for k in roots if not j['nodes'][k].get('name','').startswith(obsolete)]
 for m in j['materials']:
  name=m.get('name','');pbr=m.setdefault('pbrMetallicRoughness',{})
  if 'Revestimiento' in name:
   pbr['baseColorFactor']=[.91,.92,.90,1] if num in WHITE else [.78,.70,.57,1];pbr['roughnessFactor']=.42 if num in WHITE else .7
   if num in WHITE:pbr.pop('baseColorTexture',None);m.pop('normalTexture',None)
  if 'Piso' in name:pbr['roughnessFactor']=.3;pbr['metallicFactor']=.04
  if 'Difusor' in name:m['emissiveFactor']=[.85,.87,.82]
 steel=g.mat('Acero oscuro de techo',[.055,.065,.07],.5,.55);frame=g.mat('Marco rosa fotografía',[.78,.12,.39],.48);silver=g.mat('Aluminio cepillado',[.48,.52,.54],.32,.75)
 # Expose the dark central track ceiling instead of platform-colored slabs.
 for k in j['scenes'][0]['nodes']:
  n=j['nodes'][k];name=n.get('name','');mat=n.get('matrix');pos=mat[12:15] if mat else n.get('translation',[0,0,0])
  if name.startswith(('Viga sobre vías','Bandeja servicios')):
   for p in j['meshes'][n['mesh']]['primitives']:p['material']=steel
  if name.startswith('Plafón modular') and abs(pos[2])<3.2:
   for p in j['meshes'][n['mesh']]['primitives']:p['material']=steel
 icon=findimg(ICONS[i]);icon.thumbnail((384,384));iconmat=g.texture('Pictograma aportado '+s['nombre'],icon);mapmat=g.texture('Mapa movilidad aportado',mapim);routemat=g.texture('Recorrido L1 aportado',routeim.resize((1200,533)))
 for side in [-1,1]:
  z=side*7.77
  for x in [-42,42]:
   g.box('Marco cartel movilidad',[x,2.9,z],[1.22,1.63,.07],silver,'pared');g.panel('Cartel mapa aportado',x,2.9,z-side*.045,1.14,1.52,mapmat,side)
  g.box('Marco recorrido L1',[0,3.0,z],[4.6,2.1,.06],frame,'pared');g.panel('Recorrido real esquema usuario',0,3.0,z-side*.045,4.5,2,routemat,side)
  for x in [-62,-25,25,62]:g.panel('Pictograma '+s['nombre'],x,4.13,z-side*.05,.47,.47,iconmat,side)
  # Longitudinal cable trays and articulated metallic hangers over track.
  for zz in [.7,1.15]:g.box('Canalizacion longitudinal',[0,4.45,side*zz],[150,.055,.075],steel,'techo')
  for x in range(-70,71,10):g.box('Soporte canalizacion',[x,4.51,side*.9],[.035,.2,.9],silver,'techo')
 # Distinct, bounded architectural details from station photos. Positions provisional.
 if num in [8,17]:
  g.box('Pasarela superior referencia fotografica',[-57,6.05,0],[5,.32,15.7],silver,'techo')
  for x in [-59.4,-54.6]:
   g.box('Antepecho pasarela',[x,6.8,0],[.10,1.2,15.7],silver,'techo')
  if num==8:
   for x in [-61,61]:
    for z in [-7.5,7.5]:g.box('Columna pasarela Candelaria',[x,4.2,z],[.42,6,.42],silver,'estructura')
 if num==20:
  # Elevated steel roof, preserving existing platform supports and the rail clearance.
  for k in j['scenes'][0]['nodes']:
   n=j['nodes'][k]
   if n.get('extras',{}).get('componente')=='techo' and 'matrix' in n:n['matrix'][13]+=2.5
  for x in range(-66,67,12):
   g.box('Cercha transversal Observatorio',[x,8.0,0],[.16,.18,16],silver,'techo')
   for z in [-6,-2,2,6]:g.box('Diagonal cercha Observatorio',[x,8.45,z],[.13,1.35,2.4],silver,'techo',[-.22,0,0,.9755])
 if num in [1,9,10]:
  # Barriers remain at the rear of platform, outside simulated passenger boarding paths.
  for side in [-1,1]:
   for x in [-67,-64,-61]:
    g.box('Separador de anden referencia',[x,1.85,side*7.1],[2.8,1.1,.08],frame,'equipo')
 if num==13:
  red=g.mat('Gabinete rojo Balderas',[.6,.025,.035],.6)
  for side in [-1,1]:g.box('Gabinete doble manguera Balderas',[22,2.8,side*7.72],[1.45,1,.22],red,'equipo')
 if num==11:
  for side in [-1,1]:g.panel('Emblema remate Isabel la Catolica',72,3,side*7.7,1.5,1.5,iconmat,side)
 j['scenes'][0].setdefault('extras',{}).update({'revision':'18-fotografias','fuente':'Fotografías por estación aportadas 9 y 10 octubre 2026','cotas':'Aproximadas; arquitectura no levantada topográficamente'})
 g.save(path);s['geometria_3d'].update({'url_glb':s['geometria_3d']['url_glb'].split('?')[0]+'?revision=18','revision_modelo':'L1-FOTOS-18','fuentes_visuales':s['geometria_3d'].get('fuentes_visuales',[])+['FOTOS-ESTACIONES-USUARIO'],'cartel_mapa':True,'pictograma_fotografico':True,'acabado':'panel claro' if num in WHITE else 'piedra beige','componentes':len(j['scenes'][0]['nodes'])})
 report.append({'id':s['id'],'nombre':s['nombre'],'glb':str(path.relative_to(DIST)),'pictograma':ICONS[i],'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size})
(DIST/'datos.json').write_text(json.dumps(data,ensure_ascii=False,indent=2));(DIST/'docs/Revision_estaciones_18.json').write_text(json.dumps({'estaciones':report,'limitaciones':['Dimensiones y ubicación de accesos provisionales.','Vistas antiguas o ambiguas no usadas para cambiar la planta.','El mapa interactivo sigue el esquema, no es un levantamiento geográfico.','GLB editados directamente; no se ejecutó Blender.']},ensure_ascii=False,indent=2));print('Actualizados',len(report),'GLB')
