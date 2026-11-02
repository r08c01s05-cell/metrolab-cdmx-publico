"""Cuatro anuncios y cuatro monitores por estación; GLB con imágenes incrustadas."""
from estaciones48 import GLB
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,subprocess,numpy as np
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'dist';BASE='7cb77eda486e7686bfdb5c6d1f2092f561b5dd5e'
def font(n):return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',n)
def face(g,name,x,y,z,side,mat,height=.85):
 # screen is perpendicular to track, with independent faces in both walking directions.
 p=np.array([[0,-.36,-.58],[0,-.36,.58],[0,.36,.58],[0,.36,-.58]])
 p[:,1]*=height/.85
 order=[0,2,1,0,3,2]if side==1 else[0,1,2,0,2,3]
 uv=np.array([[0,1],[1,1],[1,0],[0,0]])
 if side==1:uv[:,0]=1-uv[:,0]
 attrs={'POSITION':g.acc(p[order],'VEC3'),'NORMAL':g.acc([[side,0,0]]*6,'VEC3'),'TEXCOORD_0':g.acc(uv[order],'VEC2')}
 mi=len(g.j['meshes']);g.j['meshes'].append({'primitives':[{'attributes':attrs,'material':mat}]});ni=len(g.j['nodes']);g.j['nodes'].append({'name':name,'mesh':mi,'translation':[x,y,z],'extras':{'componente':'pantalla','pantalla_llegada':True}});g.j['scenes'][0]['nodes'].append(ni)
def main():
 data=json.loads(subprocess.check_output(['git','show',BASE+':dist/datos.json'],cwd=ROOT));report=[]
 for st in data['estaciones']:
  rel=st['geometria_3d']['url_glb'].split('?')[0];g=GLB(subprocess.check_output(['git','show',BASE+':dist/'+rel],cwd=ROOT));j=g.j;roots=j['scenes'][0]['nodes'];blocks=[];reserve=[];bands={};base={};roof=[]
  for i in roots:
   n=j['nodes'][i];name=n.get('name','')
   if'mesh'not in n:continue
   a,b=g.bounds(n);side=1 if(a[2]+b[2])>0 else-1
   if name.startswith(('Soporte inclinado','Machón','Pilar','Columna','Descanso acceso','Peldaño acceso','Pasamanos acceso','Montante barandal')):blocks.append((side,a,b))
   if name.startswith(('Fondo mapa','Marco plano de línea','Cartel mapa','Marco cartel movilidad','Marco mapa movilidad','Respaldo mapa','Gabinete','Extintor','Emblema remate','Separador de anden','Salida sobre andén','Rotulo_← SALIDA')):reserve.append((side,a,b))
   if name.startswith('Banda Línea'):bands[side]=a[1]
   if name.startswith(('Zócalo sanitario','Zócalo machón')):base[side]=max(base.get(side,1.2),b[1])
   if n.get('extras',{}).get('componente')=='techo':roof.append((a,b))
  roots[:]=[i for i in roots if not j['nodes'][i].get('name','').startswith(('Marco publicidad','Panel publicidad disponible'))]
  frame=g.material('Marco publicidad51',[210,54,128]if st['linea']==1 else[13,127,68],.55);blank=g.material('Publicidad sin campaña51',[231,234,231],.8);dark=g.material('Carcasa monitor51',[25,27,29],.35,.25);mount=g.material('Soporte monitor51',[76,79,79],.45,.6)
  ads=[];monitors=[]
  for side in [-1,1]:
   bottom=base.get(side,1.6);top=bands[side];h=min(2.1,top-bottom-.36);cy=(top+bottom)/2;w=3.35;z=side*7.965
   intervals=[(a[0],b[0])for s,a,b in blocks if s==side and a[1]<cy+h/2 and b[1]>cy-h/2]
   intervals += [(a[0]-max(.4,abs(z)-min(abs(a[2]),abs(b[2]))+.25),b[0]+max(.4,abs(z)-min(abs(a[2]),abs(b[2]))+.25))for s,a,b in reserve if s==side and a[1]<cy+h/2+.15 and b[1]>cy-h/2-.15]
   intervals.sort();merged=[]
   for a,b in intervals:
    if merged and a<=merged[-1][1]:merged[-1]=(merged[-1][0],max(b,merged[-1][1]))
    else:merged.append((a,b))
   edges=[(-73,-73),*merged,(73,73)];candidates=[]
   for k in range(len(edges)-1):
    l,r=edges[k][1],edges[k+1][0];x=(l+r)/2
    if r-l<w+1:continue
    if any(s==side and a[1]<cy+h/2+.15 and b[1]>cy-h/2-.15 and a[0]<x+w/2+max(.4,abs(z)-min(abs(a[2]),abs(b[2]))+.25) and b[0]>x-w/2-max(.4,abs(z)-min(abs(a[2]),abs(b[2]))+.25)for s,a,b in reserve):continue
    candidates.append((x,l,r))
   chosen=[]
   for desired in [-37,37]:
    options=[c for c in candidates if all(abs(c[0]-v[0])>w+5 for v in chosen)]
    assert options,(st['id'],side,'sin espacio')
    chosen.append(min(options,key=lambda c:abs(c[0]-desired)))
   for k,(x,l,r)in enumerate(chosen):
    extra={'publicidad_revision':51,'lado':side,'pano_x':[l,r]}
    g.box(f'Marco publicidad51 {side} {k}',[x,cy,z],[w,h,.07],frame,extra=extra)
    g.box(f'Panel publicidad disponible51 {side} {k}',[x,cy,z-side*.047],[w-.14,h-.14,.025],blank,extra=extra);ads.append({'lado':side,'x':x,'y':cy,'pano':[l,r]})
   direction=-side;terminal=next(s['nombre']for s in data['estaciones']if s['linea']==st['linea']and s['orden']==(20 if st['linea']==1 else 19))if direction==1 else next(s['nombre']for s in data['estaciones']if s['linea']==st['linea']and s['orden']==1)
   im=Image.new('RGB',(768,480),(238,238,231));dr=ImageDraw.Draw(im);color=(221,51,146)if st['linea']==1 else(0,145,66)
   dr.rectangle((0,0,767,48),fill=color);dr.text((20,10),'PRÓXIMOS TRENES',font=font(25),fill='white');dr.text((522,10),'DIRECCIÓN',font=font(22),fill='white');dr.line((505,0,505,420),fill=color,width=6)
   for k,t in enumerate(['CONSULTAR','PRÓXIMA LLEGADA','TIEMPO ESTIMADO']):dr.text((28,90+k*98),t,font=font(25),fill=(25,31,29))
   dr.rounded_rectangle((552,90,715,240),radius=15,fill=color);dr.text((592,114),str(st['linea']),font=font(80),fill='white')
   words=terminal.split();y=280
   for word in words:dr.text((518,y),word,font=font(19),fill=(20,25,24));y+=28
   dr.rectangle((0,422,768,480),fill=(22,25,24));dr.text((20,436),'TIEMPOS DE LA SIMULACIÓN',font=font(24),fill=(230,225,135))
   ti=g.texture('Pantalla referencia51 '+terminal,np.array(im));mat=g.material('Display51 '+str(side),[255,255,255],1);j['materials'][mat]['pbrMetallicRoughness']['baseColorTexture']={'index':ti};j['materials'][mat]['emissiveTexture']={'index':ti};j['materials'][mat]['emissiveFactor']=[.65,.65,.65];j['materials'][mat]['extras']={'monitor_llegadas':True,'direccion':direction,'destino':terminal}
   for k,desired in enumerate([-25,25]):
    # Avoid stairs and columns, moving within the same half-platform.
    mz=side*5.45;opts=[x for x in np.arange(desired-15,desired+16,1)if all(abs(x-v[0])>6 for v in chosen) and not any(a[0]-.9<x<b[0]+.9 and a[2]-.85<mz<b[2]+.85 and b[1]>3.7 for _,a,b in blocks+reserve)]
    assert opts,(st['id'],'monitor bloqueado');x=float(min(opts,key=lambda x:abs(x-desired)));ceil=min([a[1]for a,b in roof if a[0]<=x<=b[0]and a[2]<=mz<=b[2]and a[1]>4.05]+[top+.38]);height=.65 if ceil<4.5 else .85;y=min(top+.3,ceil-height/2-.08);assert y-height/2>3.3,(st['id'],'altura monitor')
    g.box(f'Monitor llegadas51 {side} {k}',[x,y,mz],[.16,height,1.30],dark,'pantalla',{'monitor_llegadas':True,'direccion':direction})
    for dz in [-.45,.45]:g.box('Suspensión monitor51',[x,(y+height/2+ceil)/2,mz+dz],[.055,max(.1,ceil-y-height/2),.055],mount,'estructura')
    for faceSide in [-1,1]:face(g,'Display llegadas51',x+faceSide*.083,y,mz,faceSide,mat,height)
    monitors.append({'lado':side,'direccion':direction,'x':x,'y':y,'z':mz,'destino':terminal})
  g.save(D/rel);st['geometria_3d'].update(url_glb=rel+'?revision=51',revision_equipamiento=51,publicidad=ads,pantallas_llegada=monitors)
  report.append({'id':st['id'],'publicidad':ads,'pantallas':monitors})
 (D/'datos.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');(D/'docs/Equipamiento51.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('39 GLB; 156 anuncios y 156 monitores físicos, doble cara')
if __name__=='__main__':main()
