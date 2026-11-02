from pathlib import Path
import json,struct,hashlib
root=Path(__file__).resolve().parents[1];dist=root/'dist';data=json.loads((dist/'datos.json').read_text());report=[]
for s in data['estaciones']:
 if s['linea']!=1:continue
 g=s['geometria_3d'];p=dist/g['url_glb'].split('?')[0];raw=p.read_bytes();size=struct.unpack_from('<I',raw,12)[0];d=json.loads(raw[20:20+size]);tail=raw[20+size:];count=0
 for m in d['materials']:
  if m.get('name')=='Recorrido L1 aportado':
   m['name']='Panel publicidad en blanco';m['pbrMetallicRoughness']={'baseColorFactor':[.94,.94,.92,1],'roughnessFactor':.86,'metallicFactor':0};m.pop('normalTexture',None);m.pop('emissiveTexture',None);m['emissiveFactor']=[0,0,0]
 for i in d['scenes'][0]['nodes']:
  n=d['nodes'][i]
  if n.get('name')=='Recorrido real esquema usuario':n['name']='Panel publicidad disponible';n.setdefault('extras',{})['contenido']='Blanco; reservado para publicidad';count+=1
  if n.get('name')=='Marco recorrido L1':n['name']='Marco publicidad'
 assert count==2,(s['id'],count)
 packed=json.dumps(d,ensure_ascii=False,separators=(',',':')).encode();packed+=b' '*((-len(packed))%4);out=struct.pack('<III',0x46546c67,2,20+len(packed)+len(tail))+struct.pack('<II',len(packed),0x4e4f534a)+packed+tail;p.write_bytes(out)
 g['url_glb']=g['url_glb'].split('?')[0]+'?revision=25';g['panel_publicidad']='Blanco, con marco rosa; mapa general en cartel independiente'
 report.append({'id':s['id'],'paneles_blancos':count,'sha256':hashlib.sha256(out).hexdigest()})
(dist/'datos.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');(dist/'docs/Paneles_publicidad25.json').write_text(json.dumps({'cambio':'Diagrama L1 retirado de los paneles de publicidad. Se conservan los carteles del mapa general y el recorrido interactivo.','estaciones':report},ensure_ascii=False,indent=2)+'\n')
for filename,old,new in [('app.js','datos.json?v=24','datos.json?v=25'),('index.html','station-scene.js?v=24','station-scene.js?v=25'),('index.html','app.js?v=24','app.js?v=25')]:
 p=dist/filename;p.write_text(p.read_text().replace(old,new))
print('40 paneles en blanco; carteles del mapa general conservados.')
