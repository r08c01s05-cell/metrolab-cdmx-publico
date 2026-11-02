"""Acabados y accesos L8 a partir de las fotografías aportadas. Edición GLB directa.
Lee exclusivamente v56, conserva L1 y trenes; cotas y plantas no levantadas.
"""
from estaciones48 import GLB,matrix,linear,maps
from accesos54 import cut
from pathlib import Path
from PIL import Image,ImageDraw
from scipy.ndimage import gaussian_filter
import json,subprocess,copy,numpy as np,io
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'dist';BASE='439ef88d2b661fed441a9b425293a2f8d9b66db9'
UP={1,2,8,9,11,12,13,19};DOWN={7};OPEN={10,11,12,13,19}
STAIR=('Peldaño acceso aproximado','Nariz peldaño','Descanso acceso','Pasamanos acceso','Montante barandal','Barandal acceso')
COLORS={1:(214,218,205),2:(224,226,216),3:(225,225,212),4:(186,190,188),5:(109,170,207),6:(225,170,79),7:(224,225,216),8:(137,151,200),9:(216,211,184),10:(183,187,182),11:(183,187,182),12:(185,188,183),13:(185,188,183),14:(220,223,213),15:(224,214,177),16:(224,205,143),17:(164,197,179),18:(137,172,211),19:(224,227,216)}
COLCOL={1:(216,221,209),2:(230,231,222),3:(230,231,222),5:(94,165,213),6:(224,163,75),8:(138,150,198),9:(134,193,177),17:(158,194,179),18:(126,169,217)}
NOTES={1:'Paneles claros, piso pétreo y columnas; las referencias muestran áreas centrales y laterales. Escalera visible en vista central; su ubicación en la representación lateral es provisional.',2:'Paneles claros con juntas negras, columnas redondas y escalera visible. Se excluye la toma oscura con otros acabados.',3:'Columnas redondas claras, collar metálico y franja negra. No se confirma escalera directa en estas vistas.',4:'Revestimiento metálico cuadriculado y marcos oscuros. Varias zonas del complejo; no se reconstruye su planta completa.',5:'Paneles y columnas azules con banda negra, decoración de mosaico. Acceso lateral aproximado; no se infiere una escalera en el andén.',6:'Paneles y columnas ocres, banda negra y mosaico geométrico. Acceso lateral aproximado.',7:'Piso gris geométrico, cubierta de vigas y acceso descendente delimitado por murete claro y barandales.',8:'Paneles azul/lila, columnas y escalera directa a pasarela superior.',9:'Revestimiento crema con vetas verticales y columnas turquesa; escalera y estructura de acceso visibles.',10:'Estructura diagonal gris, malla lateral y cubierta de cerchas. Acceso por pasillo provisional; no se inventa una escalera directa no mostrada.',11:'Estructura diagonal, cerchas y escalera directa. La toma de correspondencia con Mixcoac/Tláhuac se excluye.',12:'Estructura abierta, malla, cerchas y escalera directa al nivel superior.',13:'Edificio de diagonales claras, malla y escalera visible. Se excluyen las vistas de otra estructura/señalización.',14:'Paneles claros, columnas rectangulares y mural de aeronaves. Acceso lateral provisional; escaleras no confirmadas.',15:'Paneles crema con juntas y franja negra; columnas claras. Acceso lateral provisional.',16:'Paneles crema amarillentos, franja negra y columnas claras. Acceso lateral provisional.',17:'Paneles y columnas verde claro, mural de mosaicos azules/turquesas/rosas. Acceso lateral provisional.',18:'Paneles y columnas azules, banda negra, murales figurativos. Acceso lateral provisional.',19:'Diagonales blancas, laterales abiertos, escaleras directas con muretes blancos y pasamanos; cubierta exterior anaranjada.'}
ICONS={1:'221344',2:'221541',3:'221652',4:'221730',5:'221843',6:'222000',7:'222056',8:'222216',9:'222442',10:'222802',11:'222904',12:'223545',13:'223703',14:'223821',15:'223913',16:'224048',18:'013715',19:'013852'}
def src(num,stamp):return ROOT/f'assets-source/referencias/linea8_57/L8-{num:02}_{stamp}.jpg'
def rootmesh(g,name,attrs,mat,extra=None):
 j=g.j;mi=len(j['meshes']);j['meshes'].append({'primitives':[{'attributes':attrs,'material':mat}]});ni=len(j['nodes']);j['nodes'].append({'name':name,'mesh':mi,'extras':{'componente':'estructura','revision_estacion':57,**(extra or {})}});j['scenes'][0]['nodes'].append(ni);return ni

def cylinder(g,name,x,y,z,r,h,mat):
 p=[];nn=[];uv=[];segments=32
 for k in range(segments):
  a=k*2*np.pi/segments;b=(k+1)*2*np.pi/segments
  vv=[[x+r*np.cos(a),y-h/2,z+r*np.sin(a)],[x+r*np.cos(b),y-h/2,z+r*np.sin(b)],[x+r*np.cos(b),y+h/2,z+r*np.sin(b)],[x+r*np.cos(a),y+h/2,z+r*np.sin(a)]]
  for q in [0,2,1,0,3,2]:p.append(vv[q]);ang=a if q in [0,3]else b;nn.append([np.cos(ang),0,np.sin(ang)]);uv.append([ang/(2*np.pi),0 if q<2 else 1])
  for sign in [-1,1]:
   vv=[[x,y+sign*h/2,z],[x+r*np.cos(a),y+sign*h/2,z+r*np.sin(a)],[x+r*np.cos(b),y+sign*h/2,z+r*np.sin(b)]]
   for q in ([0,1,2]if sign==-1 else[0,2,1]):p.append(vv[q]);nn.append([0,sign,0]);uv.append([0,0])
 return rootmesh(g,name,{'POSITION':g.acc(p,'VEC3'),'NORMAL':g.acc(nn,'VEC3'),'TEXCOORD_0':g.acc(uv,'VEC2')},mat)

def metric_uv(g,n,pr,scale):
 a=pr['attributes'];m=matrix(n);p=g.array(a['POSITION'])@m[:3,:3].T+m[:3,3];normal=g.array(a['NORMAL'])@np.linalg.inv(m[:3,:3]);axis=np.abs(normal).argmax(1);uv=np.zeros((len(p),2))
 for ax,cols in [(0,(2,1)),(1,(0,2)),(2,(0,1))]:
  mask=axis==ax;uv[mask]=p[mask][:,cols]/scale
  if ax!=1:uv[mask,1]*=-1
 a['TEXCOORD_0']=g.acc(uv,'VEC2')

def floor_maps():
 n=512;rng=np.random.default_rng(57);y,x=np.mgrid[0:n,0:n]/n;cx=(x*4).astype(int);cy=(y*4).astype(int);u=x*4%1;v=y*4%1
 vals=np.array([[142,169,129,157],[158,125,171,140],[132,156,143,175],[171,145,160,131]])[cy,cx];tri=np.where(((cx+cy)%2)==0,u+v>1,u>v);tone=vals+np.where(tri,-15,10)
 field=np.sin(2*np.pi*(x*7+y*3+np.sin(x*2*np.pi)*.14));vein=np.exp(-(field/.075)**2)*18;noise=rng.normal(0,1,(n,n));color=np.stack([tone+vein+noise,tone+vein+noise+2,tone+vein+noise-1],-1)
 seam=(u<.003)|(v<.003);color[seam]=[99,103,100];normal=np.zeros((n,n,3));normal[:]=[128,128,255];mr=np.zeros((n,n,3));mr[:,:,0]=255;mr[:,:,1]=np.clip(.36+noise*.012+seam*.17,0,1)*255
 return color,normal,mr

def pbr(g,name,color,kind='panel',rough=.48,metal=0):
 mi=g.material(name,color,rough,metal)
 if kind=='panel':
  rng=np.random.default_rng(57);a=rng.normal(0,.45,(128,128));normal=np.zeros((128,128,3));normal[:,:,0]=128+a;normal[:,:,1]=128-a;normal[:,:,2]=255;g.j['materials'][mi]['normalTexture']={'index':g.texture(name+' microrelieve',normal),'scale':.13}
 elif kind=='stone':
  tex,norm,mr,scale=maps('stone');g.j['materials'][mi]['pbrMetallicRoughness'].update(baseColorFactor=linear(np.array(color)*255/np.array([226,219,202]))+[1],baseColorTexture={'index':g.texture(name+' veta',tex)},roughnessFactor=rough);g.j['materials'][mi]['normalTexture']={'index':g.texture(name+' normal',norm),'scale':.2}
 elif kind=='metal':
  n=128;y,x=np.mgrid[0:n,0:n];checker=((x//8+y//8)%2);col=np.stack([174+checker*14]*3,-1);normal=np.ones((n,n,3))*128;normal[:,:,2]=255;normal[:,:,0]+=np.where(checker,6,-6);normal[:,:,1]+=np.where(checker,-6,6);g.j['materials'][mi]['pbrMetallicRoughness'].update(baseColorFactor=[1,1,1,1],baseColorTexture={'index':g.texture(name+' cuadriculado',col)});g.j['materials'][mi]['normalTexture']={'index':g.texture(name+' relieve',normal),'scale':.5}
 g.j['materials'][mi]['extras']={'revision_acabados':57,'tipo':kind};return mi

def plane(g,name,x,y,z,w,h,side,mat,extra=None):
 verts=np.array([[-w/2,-h/2,0],[w/2,-h/2,0],[w/2,h/2,0],[-w/2,h/2,0]])+[x,y,z];order=[0,2,1,0,3,2]if side>0 else[0,1,2,0,2,3];uv=np.array([[0,1],[1,1],[1,0],[0,0]])
 if side>0:uv[:,0]=1-uv[:,0]
 return rootmesh(g,name,{'POSITION':g.acc(verts[order],'VEC3'),'NORMAL':g.acc([[0,0,-side]]*6,'VEC3'),'TEXCOORD_0':g.acc(uv[order],'VEC2')},mat,{'componente':'pared',**(extra or {})})

def paint(g,n,mat,scale=None):
 mesh=copy.deepcopy(g.j['meshes'][n['mesh']])
 for p in mesh['primitives']:
  p['material']=mat
  if scale:metric_uv(g,n,p,scale)
 n['mesh']=len(g.j['meshes']);g.j['meshes'].append(mesh)

def icon_texture(num):
 if num==17:
  im=Image.open(src(num,'013626')).crop((100,0,294,225)).convert('RGB');im.thumbnail((128,128));out=Image.new('RGB',(128,128),(0,142,64));out.paste(im,((128-im.width)//2,(128-im.height)//2));return np.array(out)
 stamp=ICONS[num];im=Image.open(src(num,stamp)).convert('RGB');w,h=im.size;im=im.crop((0,0,w,min(w,int(h*.9))));im=im.resize((128,128));return np.array(im)

def mural_texture(num):
 specs={6:('222010',(0,110,435,344)),17:('013647',(760,38,1018,270)),18:('013742',(777,110,1265,324))}
 if num in specs:
  stamp,rect=specs[num];im=Image.open(src(num,stamp));im=im.crop(rect).resize((768,384));return np.array(im)
 # Partial photographic murals do not supply a flat complete texture: limited motif interpretation.
 im=Image.new('RGB',(768,384),(211,224,223));dr=ImageDraw.Draw(im)
 if num==5:
  for k in range(0,768,36):dr.rectangle((k,75+(k//36%3)*35,k+30,230),(70,136,193));dr.rectangle((k,250,k+26,285),(149,186,211))
 elif num==14:
  im=Image.new('RGB',(768,384),(171,198,210));dr=ImageDraw.Draw(im)
  for x,y in [(150,110),(415,210),(640,100)]:dr.polygon([(x-10,y-50),(x+10,y-50),(x+10,y-12),(x+58,y+12),(x+58,y+26),(x+8,y+10),(x+8,y+38),(x+25,y+45),(x+25,y+54),(x,y+46),(x-25,y+54),(x-25,y+45),(x-8,y+38),(x-8,y+10),(x-58,y+26),(x-58,y+12),(x-10,y-12)],fill=(46,94,119))
 return np.array(im)

def choose_portal(g,side,desired=0,width=2.7):
 intervals=[]
 for i in g.j['scenes'][0]['nodes']:
  n=g.j['nodes'][i];name=n.get('name','')
  if'mesh'not in n or not name.startswith(('Columna','Pilar','Soporte inclinado','Marco publicidad','Panel publicidad','Fondo mapa','Marco plano','Marco mapa','Respaldo mapa','Gabinete','Extintor','Rotulo_','Letrero','Monitor')):continue
  a,b=g.bounds(n)
  if np.sign(a[2]+b[2])!=side or b[1]<1.21 or a[1]>4.1:continue
  intervals.append((a[0]-width/2-.5,b[0]+width/2+.5))
 options=[x for x in np.arange(-55,56,.5)if all(not(a<x<b)for a,b in intervals)];assert options
 return float(min(options,key=lambda x:abs(x-desired)))

def lateral_passage(g,side,x,wall,floor,light):
 w=2.7;top=3.91;cut(g,np.array([x-w/2,1.18,min(side*7.82,side*8.35)]),np.array([x+w/2,top,max(side*7.82,side*8.35)]))
 def box(name,pos,size,mat,comp='estructura'):g.box(name,pos,size,mat,comp,{'revision_estacion':57,'acceso_tipo':'pasillo_lateral'})
 def z(v):return side*v
 box('Piso pasillo real57',[x,1.185,z(12.05)],[w,.05,8.1],floor,'anden')
 box('Pared exterior pasillo57',[x-w/2-.07,2.56,z(12.05)],[.14,2.7,8.1],wall,'pared')
 box('Pared interior pasillo57',[x+w/2+.07,2.56,z(10.75)],[.14,2.7,5.5],wall,'pared')
 box('Techo pasillo real57',[x,3.96,z(12.05)],[w+.28,.1,8.1],wall,'techo')
 box('Luz pasillo real57',[x,3.88,z(11.2)],[.10,.025,5.4],light,'techo')
 length=5.0;cx=x+w/2+length/2
 box('Piso giro pasillo57',[cx,1.185,z(14.8)],[length,.05,w],floor,'anden')
 box('Techo giro pasillo57',[cx,3.96,z(14.8)],[length,.1,w+.28],wall,'techo')
 for zz in [13.45,16.15]:box('Pared giro pasillo57',[cx,2.56,z(zz)],[length,2.7,.14],wall,'pared')
 box('Fondo pasillo fuera de vista57',[x+w/2+length,2.56,z(14.8)],[.14,2.7,w],wall,'pared')
 box('Luz giro pasillo57',[cx,3.88,z(14.8)],[length-.3,.025,.1],light,'techo')
 return {'tipo':'pasillo_lateral','x':x,'z':z(8),'lado':side,'ancho':w,'altura_libre':2.7,'cotas':'aproximadas','ruta_local':[[x,1.21,z(8.05)],[x,1.21,z(11)],[x,1.21,z(14.8)],[x+w/2+4.2,1.21,z(14.8)]]}

def stair_up(g,side,start,ceily,wall,floor,steel):
 rise=ceily+1.3-1.21;n=int(np.ceil(rise/.17));r=rise/n;t=.29;width=1.65;zc=side*7.05;end=start+n*t;upper=1.21+rise
 # Head clearance opens before the staircase crosses the old ceiling plane.
 opening_start=start+max(0,(ceily-1.21-2.2)/rise)*(n*t)
 cut(g,np.array([opening_start,ceily-.4,min(zc-width/2-.14,zc+width/2+.14)]),np.array([end+2.2,ceily+4,max(zc-width/2+.14,zc+width/2-.14)]))
 def box(name,pos,size,mat,comp='acceso'):g.box(name,pos,size,mat,comp,{'revision_estacion':57,'acceso_tipo':'escalera_ascendente'})
 for k in range(n):
  height=(k+1)*r;box('Peldaño ascendente57',[start+(k+.5)*t,1.21+height/2,zc],[t,height,width],floor)
  box('Borde escalon ascendente57',[start+k*t+.018,1.21+height+.005,zc],[.036,.01,width-.03],steel)
 # Sloping smooth guard walls and polished handrails, not detached upright bars.
 for dz in [-width/2-.08,width/2+.08]:
  z=zc+dz
  poly=np.array([[start,1.21],[end,1.21],[end,upper+.55],[start,1.76]])
  ps=[];ns=[]
  for sign in [-1,1]:
   for tri in [[0,1,2],[0,2,3]]:
    if sign<0:tri=tri[::-1]
    for q in tri:ps.append([poly[q,0],poly[q,1],z+sign*.06]);ns.append([0,0,sign])
  for k in range(4):
   a=poly[k];b=poly[(k+1)%4];normal=np.array([b[1]-a[1],a[0]-b[0],0]);normal/=np.linalg.norm(normal)
   vv=[[a[0],a[1],z-.06],[b[0],b[1],z-.06],[b[0],b[1],z+.06],[a[0],a[1],z+.06]]
   for q in [0,1,2,0,2,3]:ps.append(vv[q]);ns.append(normal)
  rootmesh(g,'Murete escalera ascendente57',{'POSITION':g.acc(ps,'VEC3'),'NORMAL':g.acc(ns,'VEC3')},wall,{'componente':'acceso'})
  ang=np.arctan2(rise,n*t)
  g.box('Pasamanos escalera ascendente57',[(start+end)/2,1.21+rise/2+.93,z],[float(np.hypot(n*t,rise)),.035,.035],steel,'acceso',{'revision_estacion':57});g.j['nodes'][-1]['rotation']=[0,0,float(np.sin(ang/2)),float(np.cos(ang/2))]
  for k in range(0,n+1,4):box('Soporte pasamanos57',[start+k*t,1.21+k*r+.68,z],[.025,.5,.025],steel)
 box('Descanso conectado57',[end+1,upper-.035,zc],[2,.07,width+.25],floor,'anden')
 # Enclosed upper access provides somewhere for the stair to lead.
 cx=end+1;depth=5.0;cz=side*(7.0+depth/2)
 box('Piso vestibulo superior57',[cx,upper-.035,cz],[2.1,.07,depth],floor,'anden')
 for dx in [-1.12,1.12]:box('Pared vestibulo superior57',[cx+dx,upper+1.25,side*10.0],[.14,2.5,4.0],wall,'pared')
 box('Techo vestibulo superior57',[cx,upper+2.55,cz],[2.4,.1,depth],wall,'techo')
 box('Fondo vestibulo superior57',[cx,upper+1.25,side*12.0],[2.1,2.5,.14],wall,'pared')
 return {'tipo':'escalera_ascendente','x':start,'z':zc,'lado':side,'ancho':width,'peldaños':n,'contrahuella_m':r,'huella_m':t,'altura_destino':upper,'cotas':'aproximadas'}

def stair_perpendicular(g,side,x,ceily,wall,floor,steel):
 rise=ceily+1.3-1.21;n=int(np.ceil(rise/.17));r=rise/n;t=.29;w=1.65;start=6.2;end=start+n*t;upper=1.21+rise
 def box(name,pos,size,mat,comp='acceso'):g.box(name,pos,size,mat,comp,{'revision_estacion':57,'acceso_tipo':'escalera_ascendente'})
 cut(g,np.array([x-w/2-.14,1.18,min(side*7.82,side*8.35)]),np.array([x+w/2+.14,ceily+4,max(side*7.82,side*8.35)]))
 hs=start+max(0,(ceily-1.21-2.2)/rise)*n*t
 cut(g,np.array([x-w/2-.14,ceily-.4,min(side*hs,side*(end+2.1))]),np.array([x+w/2+.14,ceily+4,max(side*hs,side*(end+2.1))]))
 box('Cimentacion tramo perpendicular57',[x,.60,side*(start+n*t/2)],[w,1.2,n*t],wall,'estructura')
 for k in range(n):
  height=(k+1)*r;z=side*(start+(k+.5)*t);box('Peldaño ascendente57',[x,1.21+height/2,z],[w,height,t],floor)
  box('Borde escalon ascendente57',[x,1.21+height+.005,side*(start+k*t+.018)],[w-.03,.01,.036],steel)
 for dx in [-w/2-.08,w/2+.08]:
  xx=x+dx;poly=np.array([[side*start,1.21],[side*end,1.21],[side*end,upper+.55],[side*start,1.76]]);ps=[];ns=[]
  # Guard-wall face winding depends on the mirrored stair direction.
  for sign in [-1,1]:
   for tri in [[0,1,2],[0,2,3]]:
    if sign*side>0:tri=tri[::-1]
    for q in tri:ps.append([xx+sign*.06,poly[q,1],poly[q,0]]);ns.append([sign,0,0])
  for k in range(4):
   a=poly[k];b=poly[(k+1)%4];normal=side*np.array([0,a[0]-b[0],b[1]-a[1]]);normal/=np.linalg.norm(normal)
   vv=np.array([[xx-.06,a[1],a[0]],[xx+.06,a[1],a[0]],[xx+.06,b[1],b[0]],[xx-.06,b[1],b[0]]])
   order=[0,1,2,0,2,3]
   if np.dot(np.cross(vv[1]-vv[0],vv[2]-vv[0]),normal)<0:order=[0,2,1,0,3,2]
   for q in order:ps.append(vv[q]);ns.append(normal)
  rootmesh(g,'Murete escalera perpendicular57',{'POSITION':g.acc(ps,'VEC3'),'NORMAL':g.acc(ns,'VEC3')},wall,{'componente':'acceso'})
  length=float(np.hypot(n*t,rise));ang=-side*np.arctan2(rise,n*t)
  box('Pasamanos escalera perpendicular57',[xx,1.21+rise/2+.93,side*(start+end)/2],[.035,.035,length],steel)
  g.j['nodes'][-1]['rotation']=[float(np.sin(ang/2)),0,0,float(np.cos(ang/2))]
  for k in range(0,n+1,4):box('Soporte pasamanos57',[xx,1.21+k*r+.68,side*(start+k*t)],[.025,.5,.025],steel)
 box('Descanso conectado57',[x,upper-.035,side*(end+1)],[w+.25,.07,2],floor,'anden')
 for dx in [-w/2-.13,w/2+.13]:box('Pared vestibulo superior57',[x+dx,upper+1.25,side*(end+1)],[.14,2.5,2],wall,'pared')
 box('Techo vestibulo superior57',[x,upper+2.55,side*(end+1)],[w+.4,.1,2.2],wall,'techo')
 box('Fondo vestibulo superior57',[x,upper+1.25,side*(end+2)],[w,2.5,.14],wall,'pared')
 return {'tipo':'escalera_ascendente','orientacion':'perpendicular','x':x,'z':side*start,'lado':side,'ancho':w,'peldaños':n,'contrahuella_m':r,'huella_m':t,'altura_destino':upper,'cotas':'aproximadas'}

def stair_down(g,side,start,wall,floor,steel):
 # Hole through the real platform slab, not a staircase drawn on top of it.
 from accesos54 import subtract_triangle
 j=g.j;w=1.65;zc=side*7.05;n=20;r=.16;t=.29;end=start+n*t;lo=np.array([start-.12,-2.2,zc-w/2-.03]);hi=np.array([end+1,1.23,zc+w/2+.03])
 # cut() normally protects platforms; temporarily mark only overlapping platform pieces as structure.
 altered=[]
 for nd in j['nodes']:
  if'mesh'in nd and (nd.get('extras',{}).get('componente')=='anden' or nd.get('name','').startswith('Base de vía')):nd.setdefault('extras',{})['_comp57']=nd['extras']['componente'];nd['extras']['componente']='estructura';altered.append(nd)
 cut(g,lo,hi)
 for nd in altered:nd['extras']['componente']=nd['extras']['_comp57']
 def box(name,pos,size,mat,comp='acceso'):g.box(name,pos,size,mat,comp,{'revision_estacion':57,'acceso_tipo':'escalera_descendente'})
 bottom=1.21-n*r
 for k in range(n):box('Peldaño descendente57',[start+(k+.5)*t,1.21-(k+1)*r-.06,zc],[t,.12,w],floor)
 for dz in [-w/2-.10,w/2+.10]:
  z=zc+dz;box('Murete acceso descendente57',[(start+end)/2,1.57,z],[n*t+.2,.72,.16],wall)
  box('Barandal acceso descendente57',[(start+end)/2,2.25,z],[n*t+.2,.035,.035],steel)
  for k in range(5):box('Poste barandal descendente57',[start+k*n*t/4,2.09,z],[.025,.3,.025],steel)
  box('Pared hueco descendente57',[(start+end)/2,-.5,z],[n*t+.2,3.3,.14],wall,'pared')
 box('Piso inferior conectado57',[end+.45,bottom-.035,zc],[.9,.07,w],floor,'anden')
 box('Cierre hueco inicio57',[start-.1,-.5,zc],[.14,3.3,w],wall,'pared')
 box('Murete final hueco57',[end+.97,1.57,zc],[.14,.72,w+.2],wall)
 box('Barandal final hueco57',[end+.97,2.25,zc],[.035,.035,w+.2],steel)
 for nd in altered:nd['extras']['componente']='estructura'
 cut(g,np.array([end+1,bottom-.1,zc-w/2-.03]),np.array([end+7,bottom+2.5,zc+w/2+.03]))
 for nd in altered:nd['extras']['componente']=nd['extras']['_comp57']
 box('Piso pasillo inferior57',[end+3.8,bottom-.035,zc],[6.5,.07,w],floor,'anden')
 for dz in [-w/2-.07,w/2+.07]:box('Pared pasillo inferior57',[end+3.8,bottom+1.2,zc+dz],[6.5,2.4,.14],wall,'pared')
 box('Techo pasillo inferior57',[end+3.8,bottom+2.45,zc],[6.5,.1,w+.28],wall,'techo')
 box('Fondo pasillo inferior57',[end+7,bottom+1.2,zc],[.14,2.4,w],wall,'pared')
 for nd in altered:nd['extras'].pop('_comp57',None)
 return {'tipo':'escalera_descendente','x':start,'z':zc,'lado':side,'ancho':w,'peldaños':n,'altura_destino':bottom,'cotas':'aproximadas'}

def main():
 data=json.loads(subprocess.check_output(['git','show',BASE+':dist/datos.json'],cwd=ROOT));report=[]
 for st in data['estaciones']:
  if st['linea']!=8:continue
  num=st['orden'];geo=st['geometria_3d'];rel=geo['url_glb'].split('?')[0];g=GLB(subprocess.check_output(['git','show',BASE+':dist/'+rel],cwd=ROOT));j=g.j;roots=j['scenes'][0]['nodes'];orig=list(roots);removed=[i for i in orig if j['nodes'][i].get('name','').startswith(STAIR)];roots[:]=[i for i in orig if i not in removed]
  wall=pbr(g,'Revestimiento referencia57',COLORS[num],'metal'if num==4 else'stone'if num==9 else'panel',.4 if num!=4 else .38,.68 if num==4 else 0)
  col=g.material('Columnas referencia57',COLCOL.get(num,(228,230,221)),.43);base=g.material('Zocalo columnas57',[37,39,38],.58);steel=g.material('Pasamanos acero57',[173,182,179],.3,.8);white=g.material('Muretes claros57',[220,224,217],.66);concrete=pbr(g,'Concreto estructural57',[221,224,217]if num==19 else[167,174,174],'panel',.72)
  fcol,fnorm,fmr=floor_maps();floor=g.material('Piedra geometrica andenes57',[255,255,255],1);j['materials'][floor]['pbrMetallicRoughness'].update(baseColorTexture={'index':g.texture('Piso geométrico color57',fcol)},metallicRoughnessTexture={'index':g.texture('Piso geométrico rugosidad57',fmr)});j['materials'][floor]['normalTexture']={'index':g.texture('Piso geométrico normal57',fnorm),'scale':.2}
  light=g.material('Luz pasillo57',[232,236,229],.5);j['materials'][light]['emissiveFactor']=[.65,.68,.61]
  # Existing roof elevation is approximate and retained to preserve equipment clearance.
  ceily=min(g.bounds(j['nodes'][i])[0][1]for i in orig if j['nodes'][i].get('name','').startswith('Cassette plafón'))
  for mi,m in enumerate(j['materials']):
   name=m.get('name','');p=m.setdefault('pbrMetallicRoughness',{})
   if name=='Plafón porcelánico':p.update(baseColorFactor=linear([215,216,207])+[1],roughnessFactor=.82,metallicFactor=0)
   if name=='Línea 8 verde':p.update(roughnessFactor=.48,metallicFactor=0)
   if name=='Difusor LED':m['emissiveFactor']=[.75,.78,.69]
  # Floor material and metre-scaled mapping; preserve tactile strips, platform edge and tracks.
  for i in list(roots):
   nd=j['nodes'][i];name=nd.get('name','')
   if'mesh'not in nd:continue
   if name.startswith(('Pavimento','Descanso')):paint(g,nd,floor,2.4)
   if name.startswith('Panel modular de revestimiento'):paint(g,nd,wall,.12 if num==4 else 1.2)
   if name.startswith(('Soporte inclinado','Cercha longitudinal','Diagonal cercha')):paint(g,nd,concrete,1.2)
   if name.startswith(('Columna circular','Pilar rectangular')):
    a,b=g.bounds(nd);cx,cz=(a[[0,2]]+b[[0,2]])/2
    if num in COLCOL:
     roots.remove(i);cylinder(g,'Columna circular referencia57',float(cx),float((a[1]+b[1])/2),float(cz),.44,float(b[1]-a[1]),col);cylinder(g,'Zocalo columna circular57',float(cx),1.265,float(cz),.445,.13,base)
     if num in [3,5,6,8]:cylinder(g,'Franja negra columna57',float(cx),2.48,float(cz),.445,.22,base)
     if num==3:cylinder(g,'Collar metalico columna57',float(cx),3.25,float(cz),.446,.06,steel)
    else:paint(g,nd,col)
   if name.startswith(('Basamento columna','Basamento pilar','Collar columna'))and num in COLCOL:roots.remove(i)
  if num in [14,15,16]:
   for side in [-1,1]:
    for x in [-65,-48.75,-32.5,-16.25,0,16.25,32.5,48.75,65]:
     protected=False
     for i in roots:
      nd=j['nodes'][i]
      if 'mesh'not in nd or not nd.get('name','').startswith(('Marco publicidad51','Fondo mapa','Marco mapa','Gabinete')):continue
      a,b=g.bounds(nd)
      if np.sign(a[2]+b[2])==side and a[0]-3.0<x<b[0]+3.0:protected=True;break
     if not protected:
      g.box('Pilar rectangular referencia57',[x,float((ceily+1.21)/2),side*6.75],[.70,float(ceily-1.21),.72],col,'estructura',{'revision_estacion':57})
      g.box('Zocalo pilar referencia57',[x,1.3,side*6.75],[.71,.18,.73],base,'estructura',{'revision_estacion':57})
  # Open surface facades use diamond mesh, rather than opaque glass.
  if num in OPEN:
   n=128;y,x=np.mgrid[0:n,0:n];alpha=np.where((np.abs(((x+y)%32)-16)<1.3)|(np.abs(((x-y)%32)-16)<1.3),255,0);arr=np.zeros((n,n,4));arr[:,:,:3]=[158,168,169];arr[:,:,3]=alpha
   wire=g.material('Malla romboidal abierta57',[255,255,255],.6,.5);j['materials'][wire].update(alphaMode='MASK',alphaCutoff=.45,doubleSided=True);j['materials'][wire]['pbrMetallicRoughness']['baseColorTexture']={'index':g.texture('Malla sin vidrio57',arr)}
   for i in list(roots):
    nd=j['nodes'][i];name=nd.get('name','')
    if name.startswith('Ventanal superior'):paint(g,nd,wire,.40)
    if name.startswith('Montante ventanal'):roots.remove(i)
  if num in OPEN:
   bandmat=next(i for i,m in enumerate(j['materials'])if m.get('name')=='Línea 8 verde')
   for i in list(roots):
    nd=j['nodes'][i];name=nd.get('name','')
    if name.startswith('Banda Línea 8'):roots.remove(i)
    if name.startswith('Rotulo_'+st['nombre'].upper().replace('/','-')) or name.startswith('Rotulo_CONSTITUCIÓN DE 1917'):
     a,b=g.bounds(nd);side=1 if a[2]+b[2]>0 else-1;dy=float(ceily-.58-(a[1]+b[1])/2);dz=side*6.95-float((a[2]+b[2])/2)
     if 'matrix'in nd:nd['matrix'][13]+=dy;nd['matrix'][14]+=dz
     else:nd.setdefault('translation',[0,0,0])[1]+=dy;nd['translation'][2]+=dz
   for side in [-1,1]:
    for cx in [-60,-30,0,30,60]:
     g.box('Fascia suspendida estacion57',[cx,float(ceily-.58),side*6.985],[11,.36,.06],bandmat,'pared',{'revision_estacion':57})
     for dx in [-4.8,4.8]:g.box('Suspension fascia estacion57',[cx+dx,float(ceily-.29),side*6.985],[.025,.58,.025],steel,'techo',{'revision_estacion':57})
  # Replace old universal flights with independently classified accesses.
  access=[]
  if num in UP:
   for side in [-1,1]:
    if num in OPEN:access.append(stair_perpendicular(g,side,choose_portal(g,side,-10 if side==1 else 10,width=1.65),float(ceily),white,floor,steel))
    else:access.append(stair_up(g,side,-13.8 if side==1 else 5.3,float(ceily),white,floor,steel))
  elif num in DOWN:
   for side in [-1,1]:access.append(stair_down(g,side,-13.8 if side==1 else 5.3,white,floor,steel))
  else:
   for side in [-1,1]:
    x=choose_portal(g,side,-10 if side==1 else 10);access.append(lateral_passage(g,side,x,wall,floor,light))
  # Roof sheets no longer retain slots reserved for the obsolete stairs.
  # Close only actual short longitudinal gaps outside newly cut ascent holes.
  for side in [-1,1]:
   slabs=[]
   for i in roots:
    nd=j['nodes'][i]
    if'mesh'in nd and nd.get('name','').startswith('Cassette plafón'):
     a,b=g.bounds(nd)
     if min(abs(a[2]),abs(b[2]))>4 and np.sign(a[2]+b[2])==side:slabs.append((a,b))
   if slabs:
    ints=sorted((a[0],b[0])for a,b in slabs);merged=[]
    for a,b in ints:
     if merged and a-merged[-1][1]<.1:merged[-1]=(merged[-1][0],max(merged[-1][1],b))
     else:merged.append((a,b))
    if num not in UP:
     for a,b in zip(merged,merged[1:]):
      if .1<b[0]-a[1]<15:g.box('Plafon reparado sin escalera57',[(a[1]+b[0])/2,float(ceily+.045),side*6.0],[b[0]-a[1],.09,3.9],white,'techo',{'revision_estacion':57})
  # Add station pictograms supplied by the user on the green fascia.
  icon=g.material('Pictograma estacion57',[255,255,255],.56);j['materials'][icon]['pbrMetallicRoughness']['baseColorTexture']={'index':g.texture('Pictograma aportado57',icon_texture(num))}
  for side in [-1,1]:
   for x in [-60,0,60]:plane(g,'Pictograma de estacion57',x-4,float(ceily-.58),side*(6.94 if num in OPEN else 7.936),.32,.32,side,icon)
  # Murals: place photographic excerpts or explicit limited motifs in free wall bays.
  murals=[]
  if num in [5,6,14,17,18]:
   arr=mural_texture(num);mi=g.material('Mural referencia57',[255,255,255],.65);j['materials'][mi]['pbrMetallicRoughness']['baseColorTexture']={'index':g.texture('Detalle mural referencia57',arr)}
   for side in [-1,1]:
    cx=choose_portal(g,side,55,width=6.0);height=min(2.2,float(ceily-1.7));cy=1.45+height/2
    # Keep artwork away from the new access mouth and all advertisements.
    if any(abs(cx-a['x'])<5 for a in access):cx=choose_portal(g,side,-55,width=6.0)
    plane(g,'Mural de estacion57',cx,cy,side*7.976,5.8,height,side,mi);murals.append({'lado':side,'x':cx,'tipo':'fragmento fotografico'if num in [6,17,18]else'interpretacion parcial de motivo'})
  # Exit signs point to access representations, not the removed flights.
  for i in roots:
   nd=j['nodes'][i]
   if'mesh'not in nd or not nd.get('name','').startswith(('Salida sobre andén','Rotulo_← SALIDA')):continue
   a,b=g.bounds(nd);side=1 if a[2]+b[2]>0 else-1;dst=next(ac['x']for ac in access if ac['lado']==side);delta=dst-float((a[0]+b[0])/2)
   if'matrix'in nd:nd['matrix'][12]+=delta
   else:nd.setdefault('translation',[0,0,0])[0]+=delta
  geo['foto_revision57']=f'referencias/linea8_57/{st["id"]}.jpg'
  geo.update(url_glb=rel+'?revision=57',revision_acabados=57,revision_accesos=57,accesos_anden=access,analisis_referencias57=NOTES[num],criterio_accesos54=NOTES[num]+' Posición y cotas aproximadas; no es un levantamiento de planta.',acabado='Metal cuadriculado'if num==4 else'Piedra de veta vertical'if num==9 else'Panel y columna según fotografías',limite_revision57='Se reconstruyen elementos visibles. Escaleras confirmadas en las fotografías, ubicación provisional. Pasillos no visibles en su totalidad se representan como aproximación funcional. No se modelan todos los vestíbulos o andenes centrales del complejo.')
  for i in list(roots):
   nd=j['nodes'][i]
   if 'mesh'not in nd:continue
   if nd.get('extras',{}).get('revision_estacion')==57 and nd.get('extras',{}).get('componente')in ['pared','techo'] and any(term in nd.get('name','').lower()for term in ['pasillo','vestibulo','hueco']):nd['extras']['componente']='acceso'
   mesh=copy.deepcopy(j['meshes'][nd['mesh']]);updated=False
   for pr in mesh['primitives']:
    if pr['material']==floor and 'TEXCOORD_0'not in pr['attributes']:metric_uv(g,nd,pr,2.4);updated=True
   if updated:nd['mesh']=len(j['meshes']);j['meshes'].append(mesh)
  j['scenes'][0].setdefault('extras',{}).update(revision_estacion=57)
  size=g.save(D/rel);report.append({'id':st['id'],'nombre':st['nombre'],'analisis':NOTES[num],'geometria':access,'piezas_obsoletas_retiradas':len(removed),'murales':murals,'bytes':size});print(st['id'],len(removed),access[0]['tipo'],size,flush=True)
 (D/'datos.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');(D/'docs/Estaciones_linea8_57.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
if __name__=='__main__':main()
