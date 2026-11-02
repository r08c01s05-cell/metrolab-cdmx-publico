"""Acabados de las 39 estaciones, a partir de los GLB v47 y referencias aportadas.
Edición directa glTF; no implica reconstrucción fotogramétrica ni ejecución de Blender.
Repetible: lee siempre el commit de entrada, compacta recursos sin uso al guardar.
"""
from pathlib import Path
import json,struct,subprocess,io,copy,hashlib
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'dist'
BASE='c6435a607436ab5bd11b1f0f24779534c349a384'
DT={5120:'i1',5121:'u1',5122:'<i2',5123:'<u2',5125:'<u4',5126:'<f4'}
NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def linear(rgb):
 a=np.array(rgb)/255.;return np.where(a<=.04045,a/12.92,((a+.055)/1.055)**2.4).tolist()
def matrix(n):
 if 'matrix'in n:return np.array(n['matrix']).reshape((4,4),order='F')
 x,y,z,w=n.get('rotation',[0,0,0,1]);m=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w),0],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w),0],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y),0],[0,0,0,1]],float);m[:3,:3]=m[:3,:3]@np.diag(n.get('scale',[1,1,1]));m[:3,3]=n.get('translation',[0,0,0]);return m
class GLB:
 def __init__(self,b):
  z=struct.unpack_from('<I',b,12)[0];self.j=json.loads(b[20:20+z]);self.b=bytearray(b[28+z:]);self.cache={}
 def array(self,i):
  a=self.j['accessors'][i];v=self.j['bufferViews'][a['bufferView']];dt=np.dtype(DT[a['componentType']]);nc=NC[a['type']];arr=np.ndarray((a['count'],nc),dt,buffer=self.b,offset=v.get('byteOffset',0)+a.get('byteOffset',0),strides=(v.get('byteStride',dt.itemsize*nc),dt.itemsize)).astype(float)
  if a.get('normalized'):arr=np.maximum(arr/np.iinfo(dt).max,-1)
  return arr
 def blob(self,b):
  self.b.extend(b'\0'*((-len(self.b))%4));i=len(self.j['bufferViews']);self.j['bufferViews'].append({'buffer':0,'byteOffset':len(self.b),'byteLength':len(b)});self.b.extend(b);return i
 def acc(self,a,typ):
  a=np.array(a,dtype='<f4');i=len(self.j['accessors']);self.j['accessors'].append({'bufferView':self.blob(a.tobytes()),'componentType':5126,'count':len(a),'type':typ,'min':a.min(axis=0).tolist(),'max':a.max(axis=0).tolist()});return i
 def texture(self,name,arr):
  im=Image.fromarray(np.uint8(np.clip(arr,0,255)));out=io.BytesIO();im.save(out,'PNG',optimize=True)
  j=self.j;j.setdefault('samplers',[]);sampler={'magFilter':9729,'minFilter':9987,'wrapS':10497,'wrapT':10497}
  if sampler not in j['samplers']:j['samplers'].append(sampler)
  si=j['samplers'].index(sampler);ii=len(j['images']);j['images'].append({'name':name,'bufferView':self.blob(out.getvalue()),'mimeType':'image/png'});ti=len(j['textures']);j['textures'].append({'source':ii,'sampler':si});return ti
 def material(self,name,color,rough=.65,metal=0):
  i=len(self.j['materials']);self.j['materials'].append({'name':name,'pbrMetallicRoughness':{'baseColorFactor':linear(color)+[1],'metallicFactor':metal,'roughnessFactor':rough}});return i
 def box(self,name,pos,size,mat,comp='pared',extra=None):
  if 'cube'not in self.cache:
   p=[];norm=[]
   for axis in range(3):
    for sign in [-1,1]:
     n=np.eye(3)[axis]*sign;u=np.eye(3)[(axis+1)%3];v=np.cross(n,u);vs=[n*.5+u*a+v*b for a,b in [(-.5,-.5),(.5,-.5),(.5,.5),(-.5,.5)]]
     for k in [0,1,2,0,2,3]:p.append(vs[k]);norm.append(n)
   self.cache['cube']={'POSITION':self.acc(p,'VEC3'),'NORMAL':self.acc(norm,'VEC3')}
  mi=len(self.j['meshes']);self.j['meshes'].append({'primitives':[{'attributes':self.cache['cube'],'material':mat}]});ni=len(self.j['nodes']);self.j['nodes'].append({'name':name,'mesh':mi,'translation':pos,'scale':size,'extras':{'componente':comp,'revision_acabados':48,**(extra or {})}});self.j['scenes'][0]['nodes'].append(ni)
 def bounds(self,n):
  m=matrix(n);pts=np.concatenate([self.array(p['attributes']['POSITION'])for p in self.j['meshes'][n['mesh']]['primitives']]);pts=pts@m[:3,:3].T+m[:3,3];return pts.min(axis=0),pts.max(axis=0)
 def compact(self):
  j=self.j;keep=set()
  def visit(i):
   if i in keep:return
   keep.add(i)
   for c in j['nodes'][i].get('children',[]):visit(c)
  for sc in j['scenes']:
   for i in sc['nodes']:visit(i)
  def prune(key,used):
   ids=sorted(used);mp={v:i for i,v in enumerate(ids)};j[key]=[j[key][i]for i in ids];return mp
  nm=prune('nodes',keep)
  for sc in j['scenes']:sc['nodes']=[nm[i]for i in sc['nodes']]
  for n in j['nodes']:
   if 'children'in n:n['children']=[nm[i]for i in n['children']]
  mm=prune('meshes',{n['mesh']for n in j['nodes']if'mesh'in n})
  for n in j['nodes']:
   if'mesh'in n:n['mesh']=mm[n['mesh']]
  ps=[p for m in j['meshes']for p in m['primitives']]
  am=prune('accessors',{v for p in ps for v in [*p['attributes'].values(),*([p['indices']]if'indices'in p else [])]})
  for p in ps:
   p['attributes']={k:am[v]for k,v in p['attributes'].items()}
   if'indices'in p:p['indices']=am[p['indices']]
  mt=prune('materials',{p['material']for p in ps})
  for p in ps:p['material']=mt[p['material']]
  texrefs=[]
  def refs(o):
   if isinstance(o,dict):
    for k,v in o.items():
     if k.endswith('Texture')and isinstance(v,dict)and'index'in v:texrefs.append(v)
     else:refs(v)
   elif isinstance(o,list):
    for v in o:refs(v)
  refs(j['materials']);tm=prune('textures',{r['index']for r in texrefs})
  for r in texrefs:r['index']=tm[r['index']]
  im=prune('images',{t['source']for t in j['textures']})
  for t in j['textures']:t['source']=im[t['source']]
  used={a['bufferView']for a in j['accessors']}|{im['bufferView']for im in j['images']};vs=[];binary=bytearray();vm={};dedup={}
  for i in sorted(used):
   v=copy.deepcopy(j['bufferViews'][i]);raw=bytes(self.b[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']]);key=(raw,v.get('byteStride'),v.get('target'))
   if key in dedup:vm[i]=dedup[key];continue
   binary.extend(b'\0'*((-len(binary))%4));v['byteOffset']=len(binary);binary.extend(raw);vm[i]=len(vs);dedup[key]=len(vs);vs.append(v)
  for a in j['accessors']:a['bufferView']=vm[a['bufferView']]
  for im in j['images']:im['bufferView']=vm[im['bufferView']]
  j['bufferViews']=vs;self.b=binary
 def save(self,p):
  self.compact();self.j['buffers']=[{'byteLength':len(self.b)}];self.b.extend(b'\0'*((-len(self.b))%4));js=json.dumps(self.j,ensure_ascii=False,separators=(',',':')).encode();js+=b' '*((-len(js))%4);out=struct.pack('<III',0x46546c67,2,28+len(js)+len(self.b))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(self.b),0x004e4942)+self.b;p.write_bytes(out);return len(out)

def maps(kind):
 # Periodic, low amplitude maps; no baked lighting, cracks or dirt.
 n=256;rng=np.random.default_rng(480);y,x=np.mgrid[0:n,0:n]/n;noise=rng.normal(0,1,(n,n));broad=np.sin(2*np.pi*(x*3+y*2))*.4+np.cos(2*np.pi*(x*7-y))*.3
 if kind=='stone':
  veins=gaussian_filter(rng.normal(0,1,(n,n)),(18,.9),mode='wrap')*17+gaussian_filter(rng.normal(0,1,(n,n)),(6,2),mode='wrap')*6
  tone=veins*3+broad*3+noise*.55;color=np.array([226,219,202])[None,None,:]+tone[:,:,None];height=veins*.00007+noise*.000006;rough=.60+veins*.025
 elif kind=='mineral':
  tone=broad*3+noise*1.4;color=np.array([218,218,211])[None,None,:]+tone[:,:,None];height=noise*.000016;rough=.67+noise*.018
 elif kind=='floor1':
  # Four rows/columns of 0.60 m stone slabs in a 2.40 m repeat.
  cells=np.array([[0,-12,6,-5],[8,-3,-17,3],[-8,5,-4,9],[3,-15,7,-7]])
  tone=cells[np.minimum((y*4).astype(int),3),np.minimum((x*4).astype(int),3)]+broad*5+noise*1.8
  seam=((x*4)%1<.006)|((y*4)%1<.006);color=np.array([155,158,153])[None,None,:]+tone[:,:,None];color[seam]=[106,109,106];height=noise*.000006-seam*.00045;rough=.43+broad*.05+seam*.2
 elif kind=='terrazzo':
  tone=noise*2.8+broad*.8;color=np.array([157,161,156])[None,None,:]+tone[:,:,None];height=noise*.000012;rough=.46+noise*.025
 else:
  color=np.ones((n,n,3))*245+noise[:,:,None]*.3;height=noise*.000003;rough=np.ones((n,n))*.51
 # All wall maps cover 1.20 m; floor1 covers 2.40 m, terrazzo .60 m.
 scale=2.4 if kind=='floor1'else .6 if kind=='terrazzo'else 1.2
 dx=(np.roll(height,-1,1)-np.roll(height,1,1))/(2*scale/n);dy=(np.roll(height,-1,0)-np.roll(height,1,0))/(2*scale/n)
 normal=np.stack([-dx,-dy,np.ones_like(dx)],axis=-1);normal/=np.linalg.norm(normal,axis=-1)[:,:,None];normal=(normal*.5+.5)*255
 mr=np.stack([np.ones_like(rough)*255,np.clip(rough,0,1)*255,np.zeros_like(rough)],axis=-1)
 return color,normal,mr,scale
# Primary wall finishes visible in the supplied station photographs.
L1_STONE={1,2,3,7,9,10,13,15,18,19}
L8_COLORS={1:(230,230,220),2:(231,232,224),3:(233,231,212),4:(228,227,215),5:(63,145,191),6:(220,170,105),7:(226,224,210),8:(204,205,224),9:(227,222,202),10:(185,186,178),11:(185,186,178),12:(187,188,180),13:(187,188,180),14:(229,230,220),15:(230,224,202),16:(228,214,175),17:(182,207,195),18:(204,216,226),19:(226,229,219)}
NOTES1=['Piedra clara y piso gris; terminal parcialmente visible.','Vetas verticales beige visibles entre los marcos rosas.','Revestimiento mineral marfil con vetas discretas.','Panel claro liso; no usar el túnel como acabado del andén.','Panel blanco y marcos rosas, con piso pétreo gris.','Panel blanco renovado; las vistas antiguas se mantienen como contexto.','Piedra clara en las zonas visibles de L1; correspondencia sin extrapolar.','Panel blanco; pasarela existente conservada.','Piedra crema entre anuncios de marco rosa.','Revestimiento mineral claro en la toma rotulada Pino Suárez.','Revestimiento mineral gris claro, sin dominante amarilla.','Paneles blancos y zócalo oscuro en la referencia.','Piedra beige visible alrededor del gabinete y anuncio.','Panel blanco de la imagen rotulada Cuauhtémoc.','Piedra cálida con vetas, plafón lateral claro.','Panel blanco de la referencia renovada.','Acabado claro de andén y pasarela; toma distante.','Piedra marfil visible detrás de anuncios; cubierta central oscura.','Piedra cálida bajo la zona de mural; mural no reconstruido sin textura completa.','Panel claro de terminal; cerchas y cubierta alta existentes.']

def run():
 data=json.loads(subprocess.check_output(['git','show',BASE+':dist/datos.json'],cwd=ROOT));report=[]
 for st in data['estaciones']:
  geo=st['geometria_3d'];rel=geo['url_glb'].split('?')[0];old=subprocess.check_output(['git','show',BASE+':dist/'+rel],cwd=ROOT);g=GLB(old);j=g.j;line=st['linea'];num=st['orden'];roots=list(j['scenes'][0]['nodes']);changes=[];kind='stone'if line==1 and num in L1_STONE else'mineral'if(line==1 and num==11)or(line==8 and 10<=num<=13)else'panel'
  wallids=[];floorids=[];metric={};materials_before=copy.deepcopy(j['materials'])
  for mi,m in enumerate(j['materials']):
   name=m.get('name','');p=m.setdefault('pbrMetallicRoughness',{})
   if 'Revestimiento'in name:wallids.append(mi)
   if 'Piso'in name or'Terrazo'in name:floorids.append(mi)
   if name=='Pintura verde pálido':p.update(metallicFactor=0,roughnessFactor=.62);m.pop('extensions',None)
  for ids,k in [(wallids,kind),(floorids,'floor1'if line==1 else'terrazzo')]:
   color,normal,mr,scale=maps(k);ti=g.texture(k+' color48',color);nt=g.texture(k+' normal48',normal);rt=g.texture(k+' rugosidad48',mr)
   for mi in ids:
    m=j['materials'][mi];p=m['pbrMetallicRoughness'];p.update(baseColorFactor=[1,1,1,1],baseColorTexture={'index':ti},metallicRoughnessTexture={'index':rt},roughnessFactor=1,metallicFactor=0);m['normalTexture']={'index':nt,'scale':.65};m['extras']={'revision_acabados':48,'tipo':k,'repeticion_m':scale};metric[mi]=scale
    if mi in wallids and line==8:p['baseColorFactor']=linear(np.array(L8_COLORS[num])*255/(218 if k=='mineral' else 245))+[1]
    m.pop('extensions',None)
  changes+=['Revestimiento '+kind+' con color, microrelieve y rugosidad embebidos','Piso con escala métrica y rugosidad diferenciada']
  # Correct column finish without recoloring ceiling or unrelated painted metal.
  colmat=None
  if line==8 and num in [8,18]:
   colmat=g.material('Pintura lila de columnas · referencia48',(145,145,189)if num==8 else(157,162,194),.60);changes.append('Columnas y basamentos lilas según fotograma, pintura no metálica')
  band_y=next((float(sum(g.bounds(j['nodes'][i])[k][1] for k in [0,1])/2) for i in roots if j['nodes'][i].get('name','').startswith('Banda Línea 1')),4.3)
  uv_count=0;mount_count=0
  for ni in roots:
   node=j['nodes'][ni]
   if'mesh'not in node:continue
   name=node.get('name','');mesh=copy.deepcopy(j['meshes'][node['mesh']]);updated=False
   if colmat is not None and name.startswith(('Columna circular','Basamento columna')):
    for pr in mesh['primitives']:pr['material']=colmat
    updated=True
   for pr in mesh['primitives']:
    mi=pr['material']
    if mi not in metric:continue
    # Baked world-aligned UVs in meters; every face gets the proper two axes.
    a=pr['attributes'];pos=g.array(a['POSITION']);m=matrix(node);w=pos@m[:3,:3].T+m[:3,3];norm=g.array(a['NORMAL'])@np.linalg.inv(m[:3,:3]);axis=np.abs(norm).argmax(axis=1);uv=np.zeros((len(pos),2))
    for ax,cols in [(0,(2,1)),(1,(0,2)),(2,(0,1))]:
     sel=axis==ax;uv[sel]=w[sel][:,cols]/metric[mi]
     if ax!=1:uv[sel,1]*=-1
    a['TEXCOORD_0']=g.acc(uv,'VEC2');updated=True;uv_count+=1
   if updated:node['mesh']=len(j['meshes']);j['meshes'].append(mesh)
   # Frames and artwork shared the same floating offset; move as groups.
   if line==1 and name.startswith(('Marco cartel movilidad','Cartel mapa aportado','Marco publicidad','Panel publicidad disponible')):
    lo,hi=g.bounds(node);side=1 if(lo[2]+hi[2])>0 else-1
    if'matrix'in node:node['matrix'][14]+=side*.195
    else:node['translation'][2]+=side*.195
    node.setdefault('extras',{})['montaje48']='Respaldo de marco a 5 mm del revestimiento';mount_count+=1
   if line==1 and name.startswith('Pictograma'):
    lo,hi=g.bounds(node);side=1 if(lo[2]+hi[2])>0 else-1
    # Pictograms sit on the same fascia as station names, not behind it.
    node['translation'][1]=band_y;node['translation'][2]=side*7.934
    node['scale'][0]=.20;node['scale'][1]=.20
    node.setdefault('extras',{})['montaje48']='Pictograma centrado y enrasado con banda de estación'
  # L8 runtime maps gain a real backing/frame. Surface stations need posts anchored
  # at the parapet because the map lies above its 2.55 m top.
  if line==8:
   frame=g.material('Marco cartel satinado48',(133,139,140),.43,.7);back=g.material('Respaldo cartel48',(235,235,230),.78)
   for slot in geo.get('posiciones_carteles_mapa',[]):
    side=slot['side'];x=slot['x'];y=slot['y'];slot['z']=side*7.936
    g.box('Marco mapa movilidad48',[x,y,side*7.975],[1.22,1.60,.050],frame)
    g.box('Respaldo mapa movilidad48',[x,y,side*7.945],[1.16,1.54,.012],back)
    if 10<=num<=13 or num==19:
     for dx in [-.50,.50]:g.box('Anclaje cartel al pretil48',[x+dx,2.87,side*8.015],[.025,1.65,.035],frame)
    mount_count+=1
  changes.append('Carteles con respaldo o marco y apoyo sobre la pared/pretil')
  geo['url_glb']=rel+'?revision=48';geo['revision_acabados']=48;geo['acabado']='piedra clara con veta'if kind=='stone'else'mineral gris claro'if kind=='mineral'else'panel liso '+('claro'if line==1 else {1:'marfil',2:'marfil',3:'crema',4:'crema',5:'azul',6:'ocre',7:'crema',8:'lila claro',9:'crema',10:'concreto claro',11:'concreto claro',12:'concreto claro',13:'concreto claro',14:'marfil',15:'crema',16:'crema cálido',17:'verde claro',18:'azul claro',19:'marfil'}[num]);geo['analisis_referencias48']=NOTES1[num-1]if line==1 else geo.get('observado','Referencia parcial del video aportado.');geo['limite_revision48']='Color y acabado aproximados a las referencias; cotas, zonas ocultas y fecha de captura no verificadas.'
  j['scenes'][0].setdefault('extras',{})['revision_acabados']=48
  size=g.save(D/rel);report.append({'id':st['id'],'nombre':st['nombre'],'linea':line,'referencia':('referencias/fotos18/'+st['id']+'.jpg')if line==1 else geo.get('url_fotograma'),'criterio':geo['analisis_referencias48'],'acabado':kind,'cambios':changes,'primitivas_uv_metrica':uv_count,'piezas_cartel_montadas':mount_count,'bytes_antes':len(old),'bytes_despues':size,'sha256':hashlib.sha256((D/rel).read_bytes()).hexdigest()});print(st['id'],kind,uv_count,len(old),'->',size,flush=True)
 (D/'datos.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');(D/'docs/Revision_estaciones48.json').write_text(json.dumps({'revision':48,'base':BASE,'metodo':'Comparación de fotografías y dos perspectivas de video aportadas; edición GLB directa. Sin levantamiento de medidas ni verificación WebGL.','estaciones':report},ensure_ascii=False,indent=2)+'\n')
if __name__=='__main__':run()
