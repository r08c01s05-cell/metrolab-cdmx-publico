import json,subprocess
from pathlib import Path
root=Path('/workspace/scratch/fc8783fbaffa/upload');out=Path('dist/audio/revision30');out.mkdir(parents=True,exist_ok=True)
d=json.loads(Path('dist/datos.json').read_text());lookup={(s['linea'],s['nombre'].lower()):s['id'] for s in d['estaciones']}
series={1:([0,14.5,30,36.5,41.5,48,54.75,59.75,72.25,84.75,92.5,103.5,110,122,128.75,134.75,140,148.25,154.75,160,172],['Observatorio','Tacubaya','Juanacatlán','Chapultepec','Sevilla','Insurgentes','Cuauhtémoc','Balderas','Salto del Agua','Isabel la Católica','Pino Suárez','Merced','Candelaria','San Lázaro','Moctezuma','Balbuena','Boulevard Puerto Aéreo','Gómez Farías','Zaragoza','Pantitlán']),8:([0,14.75,20.25,25.75,30.5,36,40.5,45.25,55.5,60,75,79.5,85,95.25,100.75,111,125],['Constitución de 1917','Atlalilco','Escuadrón 201','Aculco','Apatlaco','Iztacalco','Coyuya','Santa Anita','La Viga','Chabacano','Obrera','Doctores','Salto del Agua','San Juan de Letrán','Bellas Artes','Garibaldi'])}
manifest={'source':{'1':'WhatsApp Video 2026-10-10 at 22.17.56.mp4 · anuncios NE-92','8':'WhatsApp Video 2026-10-10 at 22.17.57.mp4 · pruebas NE-92, según rótulo del video'},'stations':{}}
for line,(bounds,names) in series.items():
 src=root/('WhatsApp Video 2026-10-10 at 22.17.%d.mp4'%(56 if line==1 else 57))
 for i,name in enumerate(names):
  key=lookup.get((line,name.lower())) or (next((s['id'] for s in d['estaciones'] if s['linea']==line and s['nombre'].lower().startswith(name.lower())),None))
  if key is None:
   print('No mapeado',name);continue
  start,end=bounds[i:i+2];file=key+'.mp3'
  subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',str(start),'-i',str(src),'-t',str(end-start),'-vn','-ac','1','-ar','24000','-c:a','libmp3lame','-b:a','24k','-af','afade=t=in:st=0:d=0.03,afade=t=out:st=%f:d=0.08'%(end-start-.08),str(out/file)],check=True)
  manifest['stations'][key]={'url':'audio/revision30/'+file,'line':line,'name':name,'start':start,'end':end,'reference':'NE-92 · aportado'+(' · prueba' if line==8 else '')}
manifest['missing']=[{'id':s['id'],'name':s['nombre'],'line':s['linea']} for s in d['estaciones'] if s['id'] not in manifest['stations']]
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));print('Clips',len(manifest['stations']),'bytes',sum(p.stat().st_size for p in out.glob('*.mp3')))
