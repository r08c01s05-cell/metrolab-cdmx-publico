"""Elimina los bordes de los peldaños que quedaron tras retirar las escaleras en v54."""
from estaciones48 import GLB
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'dist'
REMOVED_PREFIXES=('Nariz peldaño','Peldaño acceso aproximado','Descanso acceso','Pasamanos acceso','Montante barandal','Barandal acceso')
def main():
 data=json.loads((D/'datos.json').read_text());report=[]
 for st in data['estaciones']:
  if st['linea']!=1 or st['orden']==20:continue
  rel=st['geometria_3d']['url_glb'].split('?')[0];g=GLB((D/rel).read_bytes());removed=[]
  for scene in g.j['scenes']:
   roots=scene['nodes'];removed.extend(i for i in roots if g.j['nodes'][i].get('name','').startswith(REMOVED_PREFIXES));roots[:]=[i for i in roots if i not in removed]
  g.save(D/rel);st['geometria_3d'].update(url_glb=rel+'?revision=55',revision_limpieza_escaleras=55)
  report.append({'id':st['id'],'nombre':st['nombre'],'piezas_retiradas':len(set(removed))})
 (D/'datos.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 (D/'docs/Limpieza_escaleras55.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print('Bordes de escalones retirados:',sum(r['piezas_retiradas']for r in report),'en',len(report),'estaciones')
if __name__=='__main__':main()
