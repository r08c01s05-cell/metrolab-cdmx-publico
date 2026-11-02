"""Actualiza exclusivamente los tres monitores existentes de cada coche NM22."""
from estaciones48 import GLB,matrix
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import subprocess,numpy as np
ROOT=Path(__file__).resolve().parents[1];BASE='2c9c03349aa6a127d977487226194a4aba3f40d0'
def main():
 for typ in ['cabina','intermedio']:
  rel='dist/models/NM22_'+typ+'.glb';g=GLB(subprocess.check_output(['git','show',BASE+':'+rel],cwd=ROOT));j=g.j
  old=next(n for n in j['nodes']if n.get('name')=='roof__Pantalla instrumental');p=j['meshes'][old['mesh']]['primitives'][0];pts=g.array(p['attributes']['POSITION']);m=matrix(old);pts=pts@m[:3,:3].T+m[:3,3];xs=sorted(set(np.round(pts[:,0]/.1)*.1));centers=[]
  for x in xs:
   if not centers or x-centers[-1]>1:centers.append(float(x))
  centers=[float((pts[abs(pts[:,0]-x)<.1,0].min()+pts[abs(pts[:,0]-x)<.1,0].max())/2)for x in centers];assert len(centers)==3
  black=g.material('Carcasa televisores NM22 52',[22,25,26],.4,.15);p['material']=black;old['extras']['familia_visual']='interiorDisplay52'
  im=Image.new('RGB',(768,480),(238,238,231));d=ImageDraw.Draw(im);f=lambda n:ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',n)
  d.rectangle((0,0,768,58),fill=(221,51,146));d.text((24,13),'PRÓXIMA PARADA · LÍNEA 1',font=f(30),fill='white');d.text((28,115),'TIEMPO DE LLEGADA',font=f(34),fill=(24,30,27));d.text((28,195),'INFORMACIÓN DEL RECORRIDO',font=f(28),fill=(24,30,27));d.rectangle((0,420,768,480),fill=(22,25,24));d.text((22,435),'ESTIMACIÓN DE LA SIMULACIÓN',font=f(24),fill=(230,225,135))
  ti=g.texture('Televisor NM22 referencia52',np.array(im));mat=g.material('Display NM22 52',[255,255,255],1);j['materials'][mat]['pbrMetallicRoughness']['baseColorTexture']={'index':ti};j['materials'][mat]['emissiveTexture']={'index':ti};j['materials'][mat]['emissiveFactor']=[.65]*3;j['materials'][mat]['extras']={'monitor_vagon':True}
  for x in centers:
   g.box('Carcasa televisor52',[x,3.09,0],[.34,.27,.49],black,'interior',{'familia_visual':'interiorDisplay52'})
   for side in [-1,1]:
    coords=np.array([[0,-.123,-.229],[0,-.123,.229],[0,.123,.229],[0,.123,-.229]]);order=[0,2,1,0,3,2]if side==1 else[0,1,2,0,2,3];uv=np.array([[0,1],[1,1],[1,0],[0,0]],float)
    if side==1:uv[:,0]=1-uv[:,0]
    attrs={'POSITION':g.acc(coords[order],'VEC3'),'NORMAL':g.acc([[side,0,0]]*6,'VEC3'),'TEXCOORD_0':g.acc(uv[order],'VEC2')};mi=len(j['meshes']);j['meshes'].append({'primitives':[{'attributes':attrs,'material':mat}]});ni=len(j['nodes']);j['nodes'].append({'name':'Televisor pasajeros52','mesh':mi,'translation':[x+side*.171,3.09,0],'extras':{'familia_visual':'interiorDisplay52','monitor_vagon':True}});j['scenes'][0]['nodes'].append(ni)
  g.save(ROOT/rel);(ROOT/'assets-source/trenes'/('NM22_'+typ+'.glb')).write_bytes((ROOT/rel).read_bytes());print(typ,'3 monitores, 6 caras')
if __name__=='__main__':main()
