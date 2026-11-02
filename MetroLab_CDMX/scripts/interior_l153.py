"""Interior L1 según cinco fotografías. Edición glTF, cotas aproximadas."""
from estaciones48 import GLB,linear,matrix
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import subprocess,json,math,hashlib,numpy as np
ROOT=Path(__file__).resolve().parents[1];BASE='014499cd282a599eacdfef046d815a948caf2862';D=ROOT/'dist'
def main():
 for typ in ['cabina','intermedio']:
  rel='dist/models/NM22_'+typ+'.glb';g=GLB(subprocess.check_output(['git','show',BASE+':'+rel],cwd=ROOT));j=g.j;remove=[]
  # Replace complete legacy passenger seats/handrails and rectangular ceiling vents.
  for i,n in enumerate(j['nodes']):
   if n.get('name','')in ['interior__Asientos verde lima moldeados','interior__Pasamanos acero pulido']:remove.append(i)
   if n.get('name')=='Detalle41_roof'and'mesh'in n and any(j['materials'][p['material']]['name']in ['Ventilacion marfil41','Ranuras ventilacion41']for p in j['meshes'][n['mesh']]['primitives']):remove.append(i)
  for n in j['nodes']:
   if'children'in n:n['children']=[i for i in n['children']if i not in remove]
  for s in j['scenes']:s['nodes']=[i for i in s['nodes']if i not in remove]
  for m in j['materials']:
   name=m['name'];p=m.setdefault('pbrMetallicRoughness',{})
   if 'Piso gris'in name:p['baseColorFactor']=linear([108,113,112])+[1];p['metallicFactor']=0;p['roughnessFactor']=.68
   if 'Panel interior marfil'in name:p['baseColorFactor']=linear([227,229,220])+[1];p['roughnessFactor']=.36;p['metallicFactor']=0
  # Open passenger gangways visible in the references; preserve driving-cab front.
  for n in j['nodes']:
   if 'mesh'not in n or n.get('extras',{}).get('familia_visual')not in ['exterior','interior']:continue
   m=matrix(n)
   for pr in j['meshes'][n['mesh']]['primitives']:
    attrs=pr['attributes'];pts=g.array(attrs['POSITION']);world=pts@m[:3,:3].T+m[:3,3];ids=g.array(pr['indices']).astype(int).ravel()if 'indices'in pr else np.arange(len(pts));tri=ids.reshape(-1,3);t=world[tri];ns=np.cross(t[:,1]-t[:,0],t[:,2]-t[:,0]);ns/=np.maximum(np.linalg.norm(ns,axis=1)[:,None],1e-9)
    end=(np.abs(t[:,:,0])>7.5).all(1)&(np.abs(ns[:,0])>.9)&(t[:,:,1].min(1)<3.08)&(t[:,:,1].max(1)>1.26)&(t[:,:,2].min(1)<.68)&(t[:,:,2].max(1)>-.68)
    if typ=='cabina':end&=(t[:,:,0]>7.5).all(1)
    if not end.any():continue
    keep=tri[~end].ravel()
    for k,a in list(attrs.items()):attrs[k]=g.acc(g.array(a)[keep],j['accessors'][a]['type'])
    pr.pop('indices',None)
  red=g.material('Pulsador rojo53',[190,28,29],.4);grey=g.material('Banca marfil53',[215,221,213],.3);orange=g.material('Borde naranja asiento53',[245,93,14],.34);steel=g.material('Pasamanos acero53',[173,181,181],.3,.82);dark=g.material('Ventilacion cavidad53',[32,37,37],.85);cream=g.material('Difusor circular marfil53',[210,214,204],.4);light=g.material('Luz lateral continua53',[243,245,226],.5);j['materials'][light]['emissiveFactor']=[.65,.66,.58];buckets={}
  def emit(name,vs,fs,mat,family='interior',smooth=False):
   v=np.array(vs,float);f=np.array(fs,int);tri=v[f];norm=np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0]);norm/=np.maximum(np.linalg.norm(norm,axis=1)[:,None],1e-9)
   if smooth:
    ns=np.zeros_like(v)
    for k in range(3):np.add.at(ns,f[:,k],norm)
    ns/=np.maximum(np.linalg.norm(ns,axis=1)[:,None],1e-9);norms=ns[f]
   else:norms=np.repeat(norm[:,None,:],3,axis=1)
   key=(name,mat,family);b=buckets.setdefault(key,[[],[]]);b[0].extend(tri.reshape(-1,3));b[1].extend(norms.reshape(-1,3))
  def tube(points,r,mat=steel,family='interior',name='Pasamanos curvo53'):
   pts=np.array(points,float);v=[];f=[];cnt=12
   for i,p in enumerate(pts):
    t=pts[min(i+1,len(pts)-1)]-pts[max(0,i-1)];t/=max(np.linalg.norm(t),1e-9);u=np.cross(t,[0,1,0]if abs(t[1])<.9 else[1,0,0]);u/=max(np.linalg.norm(u),1e-9);w=np.cross(t,u)
    for k in range(cnt):v.append(p+r*(u*math.cos(k*math.tau/cnt)+w*math.sin(k*math.tau/cnt)))
   for i in range(len(pts)-1):
    for k in range(cnt):a=i*cnt+k;b=i*cnt+(k+1)%cnt;c=b+cnt;d=a+cnt;f.extend([(a,b,c),(a,c,d)])
   emit(name,v,f,mat,family,True)
  def box(name,pos,size,mat,family='interior'):g.box(name,pos,size,mat,'interior',{'familia_visual':family,'revision_interior':53})
  texture_materials={}
  def texmat(name,im):
   key=(name,hashlib.sha256(im.tobytes()).hexdigest())
   if key in texture_materials:return texture_materials[key]
   ti=g.texture(name,np.array(im.convert('RGB')));mat=g.material(name,[255,255,255],.75);j['materials'][mat]['pbrMetallicRoughness']['baseColorTexture']={'index':ti};texture_materials[key]=mat;return mat
  def plane(name,im,x,y,z,w,h,side):
   mat=texmat(name,im);v=np.array([[-w/2,-h/2,0],[w/2,-h/2,0],[w/2,h/2,0],[-w/2,h/2,0]]);order=[0,1,2,0,2,3]if side<0 else[0,2,1,0,3,2];uv=np.array([[0,1],[1,1],[1,0],[0,0]],float)
   if side>0:uv[:,0]=1-uv[:,0]
   mi=len(j['meshes']);j['meshes'].append({'primitives':[{'attributes':{'POSITION':g.acc(v[order],'VEC3'),'NORMAL':g.acc([[0,0,-side]]*6,'VEC3'),'TEXCOORD_0':g.acc(uv[order],'VEC2')},'material':mat}]});ni=len(j['nodes']);j['nodes'].append({'name':name,'mesh':mi,'translation':[x,y,z],'extras':{'familia_visual':'interior','revision_interior':53}});j['scenes'][0]['nodes'].append(ni)
  profile=np.array([[.24,1.695],[.22,1.705],[.15,1.710],[.07,1.717],[-.04,1.720],[-.11,1.737],[-.16,1.772],[-.19,1.82],[-.21,1.90],[-.225,2.10],[-.24,2.26],[-.245,2.31]])
  for side in [-1,1]:
   for center in [-3.8,.2,4.2]:
    cols=61;xs=np.linspace(-1.12,1.12,cols);v=[]
    for layer in [0,1]:
     for q,y in profile:
      for x in xs:v.append([center+x,y-layer*.034,side*(.85-q-layer*.018)])
    size=len(profile)*cols;f=[]
    for layer in [0,1]:
     for row in range(len(profile)-1):
      for k in range(cols-1):a=layer*size+row*cols+k;ts=[(a,a+1,a+cols+1),(a,a+cols+1,a+cols)];f.extend(ts if (side==-1)==(layer==0)else[tuple(reversed(t))for t in ts])
    for row in range(len(profile)-1):
     for k in [0,cols-1]:a=row*cols+k;b=a+cols;f.extend([(a,b,b+size),(a,b+size,a+size)])
    for row in [0,len(profile)-1]:
     for k in range(cols-1):
      a=row*cols+k;ts=[(a,a+size,a+size+1),(a,a+size+1,a+1)];f.extend(ts if (row==0)==(side<0)else[tuple(reversed(t))for t in ts])
    emit('Banca continua moldeada53',v,f,grey,smooth=True)
    for x in np.linspace(center-1.12,center+1.12,6):
     verts=[]
     for q,y in profile:
      for dx in [-.01,.01]:verts.append([x+dx,y+.003,side*(.85-q)-side*.003])
     faces=[]
     for k in range(len(profile)-1):a=k*2;fs=[(a,a+1,a+3),(a,a+3,a+2)];faces.extend(fs if side==-1 else[tuple(reversed(t))for t in fs])
     emit('Franjas divisorias naranja53',verts,faces,orange,smooth=True)
    box('Faldon naranja banca53',[center,1.60,side*.97],[2.24,.18,.29],orange)
    for end in [-1,1]:
     x=center+end*1.08;tube([[x,1.72,side*.66],[x,2.05,side*.65],[x,2.30,side*.58],[x+end*.05,2.60,side*.55],[x+end*.15,2.81,side*.58],[x+end*.22,2.97,side*.63]],.023)
     tube([[x,2.10,side*.66],[x,2.10,side*1.09]],.02)
     tube([[x,1.64,side*.90],[x,1.32,side*.90],[x,1.30,side*1.10],[x,1.68,side*1.10]],.018)
   tube([[-7.1,2.99,side*.63],[7.1,2.99,side*.63]],.022)
   for door in [-5.8,-1.8,2.2,6.2]:
    for end in [-1,1]:
     x=door+end*.86;tube([[x,2.06,side*1.16],[x,2.08,side*1.10],[x,2.13,side*1.06],[x,2.68,side*1.06],[x,2.74,side*1.10],[x,2.75,side*1.16]],.018)
     # Fixed black/yellow jamb, beyond the clear aperture; not attached to the moving leaf.
     w=.03;im=Image.new('RGB',(64,512),(240,199,24));dr=ImageDraw.Draw(im)
     for y in range(-64,576,96):dr.polygon([(0,y),(64,y+64),(64,y+108),(0,y+44)],fill=(20,23,22))
     plane('Precaucion jamba53',im,x,2.18,side*1.157,.03,1.86,side)
   box('Difusor lateral continuo53',[0,3.115,side*.98],[14.8,.02,.10],light,'roof')
  for end in ([1]if typ=='cabina'else[-1,1]):
   for side in [-1,1]:
    box('Lateral paso intercomunicante53',[end*8.12,2.19,side*.96],[.10,1.88,.54],cream)
    box('Fuelle lateral53',[end*8.38,2.18,side*.73],[.48,1.86,.10],dark)
    for dx in np.linspace(8.16,8.62,9):box('Pliegue fuelle53',[end*dx,2.18,side*.72],[.019,1.86,.12],dark)
   box('Dintel paso intercomunicante53',[end*8.12,3.17,0],[.10,.18,1.94],cream)
   box('Fuelle superior53',[end*8.38,3.10,0],[.48,.08,1.44],dark)
   box('Placa articulada paso53',[end*8.38,1.25,0],[.62,.025,1.40],steel)
  # Circular outlets sit in separate roof bays; no duplicate rectangular vent.
  for c in [-4.9,-.9,3.1]:
   box('Registro ventilacion53',[c,3.22,0],[.75,.028,.68],cream,'roof');emit('Cavidad circular ventilacion53',[[c,3.202,0]]+[[c+.30*math.cos(t),3.202,.30*math.sin(t)]for t in np.arange(64)*math.tau/64],[(0,k+1,(k+1)%64+1)for k in range(64)],dark,'roof')
   for radius in [.075,.145,.215,.285]:tube([[c+radius*math.cos(t),3.175+radius*.05,radius*math.sin(t)]for t in np.linspace(0,math.tau,65)],.008,cream,'roof','Anillos ventilacion circular53')
   for t in np.arange(8)*math.tau/8:tube([[c+r*math.cos(t),3.19,r*math.sin(t)]for r in [.05,.29]],.005,cream,'roof','Radios difusor53')
  # Maps, accessible-seat badges, route strips and emergency call equipment.
  network=Image.open(D/'textures/revision18/mapa_movilidad.jpg')
  stations=json.loads((D/'datos.json').read_text())['estaciones'];route=[s['nombre']for s in stations if s['linea']==1]
  f=lambda n:ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',n)
  for side in [-1,1]:
   for c in [-3.8,.2,4.2]:
    x=c+.95;box('Panel lateral mapa53',[x,2.70,side*1.17],[.55,.92,.025],cream);plane('Mapa movilidad interior53',network,x,2.70,side*1.155,.46,.55,side)
    im=Image.new('RGB',(480,100),'white');dr=ImageDraw.Draw(im)
    for cx in [60,180,300,420]:dr.rounded_rectangle((cx-51,0,cx+51,99),radius=5,fill=(22,67,128));dr.ellipse((cx-7,10,cx+7,24),fill='white')
    # Wheelchair, older person with cane, pregnancy, adult carrying a baby.
    dr.arc((33,47,80,95),0,360,fill='white',width=5);dr.line((56,28,56,61,80,61,90,84),fill='white',width=6);dr.line((56,40,76,40),fill='white',width=5)
    dr.line((180,28,174,60,165,91),fill='white',width=6);dr.line((175,58,190,91),fill='white',width=5);dr.line((180,36,197,48,201,88),fill='white',width=4)
    dr.line((300,29,300,64),fill='white',width=10);dr.ellipse((297,40,322,65),fill='white');dr.polygon([(300,47),(284,75),(316,75)],fill='white');dr.line((293,72,291,92),fill='white',width=5);dr.line((310,72,311,92),fill='white',width=5)
    dr.line((420,28,420,65),fill='white',width=9);dr.line((420,38,437,48),fill='white',width=6);dr.ellipse((436,30,449,43),fill='white');dr.line((444,45,433,61),fill='white',width=8);dr.line((417,62,408,92),fill='white',width=5);dr.line((422,62,430,92),fill='white',width=5)
    plane('Asientos preferentes53',im,x,2.38,side*1.153,.49,.105,side)
    im=Image.new('RGB',(1600,180),'white');dr=ImageDraw.Draw(im);dr.line((40,72,1560,72),fill=(221,51,146),width=10)
    for k,name in enumerate(route):
     xx=40+k*1520/(len(route)-1);dr.ellipse((xx-9,63,xx+9,81),fill=(221,51,146));dr.text((xx-22,100),name,font=f(10),fill=(40,40,40))
    dr.text((40,10),'LÍNEA 1 · PANTITLÁN — OBSERVATORIO',font=f(27),fill=(50,50,50));plane('Recorrido superior L153',im,c,3.10,side*1.132,2.15,.18,side)
   for door in [-5.8,-1.8,2.2,6.2]:
    x=door-.97;box('Interfono emergencia53',[x,2.56,side*1.145],[.13,.30,.025],cream);box('Pulsador rojo interfono53',[x,2.55,side*1.121],[.035,.05,.022],red)
    im=Image.new('RGB',(200,260),'white');dr=ImageDraw.Draw(im);dr.rectangle((20,20,180,75),fill=(190,27,33));dr.text((25,31),'EMERGENCIA',font=f(19),fill='white')
    for yy in range(98,150,8):dr.line((65,yy,135,yy),fill=(55,60,57),width=3)
    dr.ellipse((77,185,123,231),fill=(192,25,31));plane('Rotulo interfono53',im,x,2.56,side*1.118,.13,.28,side)
   im=Image.new('RGB',(300,150),(0,131,70));dr=ImageDraw.Draw(im);dr.text((15,30),'← SALIDA',font=f(44),fill='white');plane('Evacuacion interior53',im,-7.0,3.02,side*1.14,.28,.14,side)
  def flush():
   for (name,mat,fam),(p,n)in buckets.items():
    mi=len(j['meshes']);j['meshes'].append({'primitives':[{'attributes':{'POSITION':g.acc(p,'VEC3'),'NORMAL':g.acc(n,'VEC3')},'material':mat}]});ni=len(j['nodes']);j['nodes'].append({'name':name,'mesh':mi,'extras':{'familia_visual':fam,'revision_interior':53}});j['scenes'][0]['nodes'].append(ni)
  # Defined earlier in Python scope; plane is used below and in jamb generation.
  flush();g.save(ROOT/rel);(ROOT/'assets-source/trenes'/('NM22_'+typ+'.glb')).write_bytes((ROOT/rel).read_bytes());print(typ,'interior53')
if __name__=='__main__':main()
