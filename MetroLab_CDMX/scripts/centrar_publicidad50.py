"""Centra cada anuncio y su marco en un paño libre; lee siempre v49."""
from estaciones48 import GLB,matrix
from pathlib import Path
import json,subprocess,hashlib
import numpy as np
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'dist';BASE='a9bf50dce7d5bdfa1f62a9d90fba6e895fa2b8dd'
def main():
 data=json.loads(subprocess.check_output(['git','show',BASE+':dist/datos.json'],cwd=ROOT));reports=[]
 for st in data['estaciones']:
  geo=st['geometria_3d'];rel=geo['url_glb'].split('?')[0];g=GLB(subprocess.check_output(['git','show',BASE+':dist/'+rel],cwd=ROOT));j=g.j;roots=j['scenes'][0]['nodes'];blocks=[];reserve=[];groups={};bands={};base={};changes=[]
  for i in roots:
   n=j['nodes'][i];name=n.get('name','')
   if'mesh'not in n:continue
   lo,hi=g.bounds(n);c=(lo+hi)/2;side=1 if c[2]>0 else-1
   if name.startswith(('Marco publicidad','Panel publicidad disponible')):groups.setdefault(side,[]).append((i,lo,hi))
   elif name.startswith(('Machón de pared','Pilar terminal','Pilar cubierta','Columna pasarela','Pilar rectangular','Columna circular','Descanso acceso','Peldaño acceso','Pasamanos acceso','Montante barandal'))and hi[1]>1.8:blocks.append((side,lo,hi,name))
   elif name.startswith(('Cartel mapa','Marco cartel movilidad','Gabinete','Extintor','Emblema remate','Separador de anden','Salida sobre andén','Rotulo_← SALIDA')):reserve.append((side,lo,hi,name))
   if name.startswith('Banda Línea'):bands[side]=lo[1]
   if name.startswith(('Zócalo sanitario','Zócalo machón')):base[side]=max(base.get(side,1.2),hi[1])
  for side,items in groups.items():
   lo=np.min([a for _,a,_ in items],axis=0);hi=np.max([b for _,_,b in items],axis=0);old=(lo+hi)/2;w=hi[0]-lo[0];h=hi[1]-lo[1];bottom=base.get(side,1.66);top=bands.get(side,4.2);cy=(bottom+top)/2
   oldh=h;h=min(h,top-bottom-.36);yscale=h/oldh
   assert h>=1.0,(st['id'],'altura insuficiente')
   intervals=[]
   for s,a,b,name in blocks:
    if s==side and a[1]<cy+h/2 and b[1]>cy-h/2:intervals.append((a[0],b[0]))
   intervals.sort();merged=[]
   for a,b in intervals:
    if merged and a<=merged[-1][1]:merged[-1]=(merged[-1][0],max(b,merged[-1][1]))
    else:merged.append((a,b))
   edges=[(-74,-74),*merged,(74,74)];gaps=[(edges[k][1],edges[k+1][0])for k in range(len(edges)-1)];candidates=[]
   for left,right in gaps:
    cx=(left+right)/2
    if right-left<w+.8:continue
    # Equipment and maps are independent functional areas, not available for ads.
    if any(s==side and a[1]<cy+h/2+.15 and b[1]>cy-h/2-.15 and a[0]<cx+w/2+max(.3,abs(old[2])-min(abs(a[2]),abs(b[2]))+.2) and b[0]>cx-w/2-max(.3,abs(old[2])-min(abs(a[2]),abs(b[2]))+.2) for s,a,b,_ in reserve):continue
    candidates.append((abs(cx-old[0]),cx,left,right))
   assert candidates,(st['id'],'no hay paño libre')
   _,cx,left,right=min(candidates);shift=np.array([cx-old[0],cy-old[1],0.])
   for i,_,_ in items:
    n=j['nodes'][i]
    if'matrix'in n:
     n['matrix'][12]+=float(shift[0]);n['matrix'][13]=float(cy+(n['matrix'][13]-old[1])*yscale)
     for col in [1,5,9]:n['matrix'][col]*=yscale
    else:
     pos=np.array(n.get('translation',[0,0,0]));pos[0]+=shift[0];pos[1]=cy+(pos[1]-old[1])*yscale;n['translation']=pos.tolist();n.setdefault('scale',[1,1,1])[1]*=yscale
    n.setdefault('extras',{}).update(publicidad_centrada_revision=50,pano_libre_x_m=[float(left),float(right)],pano_libre_y_m=[float(bottom),float(top)])
   changes.append({'lado':side,'centro_anterior':old.tolist(),'centro_nuevo':[float(cx),float(cy),float(old[2])],'limites_pano_x':[float(left),float(right)],'limites_pano_y':[float(bottom),float(top)],'ancho_marco':float(w),'alto_marco':float(h),'alto_anterior':float(oldh)})
  if changes:
   j['scenes'][0].setdefault('extras',{})['revision_publicidad']=50;g.save(D/rel);geo['url_glb']=rel+'?revision=50';geo['revision_publicidad']=50
  reports.append({'id':st['id'],'nombre':st['nombre'],'paneles':changes,'sha256':hashlib.sha256((D/rel).read_bytes()).hexdigest()})
 (D/'datos.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');(D/'docs/Publicidad_centrada50.json').write_text(json.dumps({'revision':50,'criterio':'Centro del paño libre delimitado por soportes, zócalo y banda superior. Marco y panel se desplazan juntos.','estaciones':reports},ensure_ascii=False,indent=2)+'\n');print('39 estaciones revisadas;',sum(len(x['paneles'])for x in reports),'paneles centrados con su marco.')
if __name__=='__main__':main()
