"""Retira pilares de la fila genérica señalada y soportes huérfanos de pasarela.
No elimina basamentos/collares que son partes de una misma columna.
"""
from pathlib import Path
import sys,json,subprocess,hashlib
import numpy as np
from estaciones48 import GLB
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'dist';BASE='ccb1c8fc5c3783412b0b1028dc1d61d221e43a54'
data=json.loads(subprocess.check_output(['git','show',BASE+':dist/datos.json'],cwd=ROOT));report=[]
for st in data['estaciones']:
 geo=st['geometria_3d'];rel=geo['url_glb'].split('?')[0];raw=subprocess.check_output(['git','show',BASE+':dist/'+rel],cwd=ROOT);g=GLB(raw);j=g.j;roots=j['scenes'][0]['nodes'];removed=[];supports=[]
 for i in roots:
  n=j['nodes'][i];name=n.get('name','')
  if'mesh'not in n:continue
  lo,hi=g.bounds(n);c=(lo+hi)/2
  remove=(st['id']=='L1-01' and name.startswith('Pilar terminal'))or(st['id']=='L1-08' and name.startswith('Columna pasarela Candelaria')and c[0]>0)
  if remove:removed.append({'node':i,'nombre':name,'centro_m':c.tolist(),'motivo':'Fila genérica adicional señalada por el usuario'if st['id']=='L1-01'else'Soporte del extremo opuesto sin pasarela encima'})
  elif name.startswith(('Machón de pared','Pilar terminal','Pilar cubierta','Pilar rectangular','Columna circular','Columna pasarela')):supports.append((i,name,lo,hi))
 # Independent audit: full-height supports must not occupy the same volume twice.
 duplicates=[]
 for k,(i,n,a,b)in enumerate(supports):
  for q,m,c,d in supports[k+1:]:
   overlap=np.maximum(0,np.minimum(b,d)-np.maximum(a,c));ratio=float(np.prod(overlap)/max(1e-10,min(np.prod(b-a),np.prod(d-c))))
   if ratio>.95:duplicates.append({'node':q,'nombre':m,'centro_m':((c+d)/2).tolist(),'motivo':'Más del 95 % del volumen coincide con '+n})
 for x in duplicates:
  if x['node']not in{x['node']for x in removed}:removed.append(x)
 if removed:
  kill={r['node']for r in removed};j['scenes'][0]['nodes']=[i for i in roots if i not in kill];j['scenes'][0].setdefault('extras',{})['revision_soportes']=49;g.save(D/rel);geo['url_glb']=rel+'?revision=49';geo['revision_soportes']=49;geo['componentes']=len(j['scenes'][0]['nodes'])
 report.append({'id':st['id'],'nombre':st['nombre'],'soportes_completos_revisados':len(supports)+len(removed)-len(duplicates),'retirados':removed,'sha256':hashlib.sha256((D/rel).read_bytes()).hexdigest()})
(D/'datos.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');(D/'docs/Soportes49.json').write_text(json.dumps({'revision':49,'criterio':'Comparación con captura del usuario y posición de soportes en 39 GLB. Partes de basamento y collar no se tratan como columnas duplicadas.','estaciones':report},ensure_ascii=False,indent=2)+'\n');print('39 estaciones revisadas;',sum(len(x['retirados'])for x in report),'pilares/soportes retirados.')
