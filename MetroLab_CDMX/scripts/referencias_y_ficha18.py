from pathlib import Path
from PIL import Image
import json,shutil
root=Path('/workspace/scratch/fc8783fbaffa');d=Path(__file__).resolve().parents[1]/'dist';out=d/'referencias/fotos18';out.mkdir(parents=True,exist_ok=True)
refs=['20261010-075535','20261010-075429','20261010-075312','20261010-075935','20261010-074836','20261010-074658','20261010-074512','20261010-074254','20261010-074038','20261009-063803','20261009-063446','20261009-063102','20261009-062335','20261009-061917','20261009-061608','20261009-061058','20261009-060625','20261009-055539','20261009-054914','20261009-054243'];refs[3]='20261010-074935'
j=json.loads((d/'datos.json').read_text())
for i,s in enumerate(sorted([s for s in j['estaciones'] if s['linea']==1],key=lambda s:s['orden'])):
 stamp=refs[i];p=next(p for p in [root/'upload'/f'image({stamp}).png',root/'referencias18'/f'image({stamp}).png'] if p.exists());im=Image.open(p).convert('RGB');im.thumbnail((640,400));target=out/(s['id']+'.jpg');im.save(target,quality=78,optimize=True);s['geometria_3d']['foto_revision18']='referencias/fotos18/'+target.name;s['geometria_3d']['referencia_foto_original']=p.name
(d/'datos.json').write_text(json.dumps(j,ensure_ascii=False,indent=2))
p=d/'app.js';s=p.read_text();s=s.replace('<summary>Andenes y referencia de video</summary>','<summary>Modelo y referencias de la estación</summary>');s=s.replace('<p>${esc(g.observado)}</p>','${g.foto_revision18?`<p><b>Revisión 18 · Fotografías de la estación</b></p><img src="${esc(g.foto_revision18)}" alt="Referencia fotográfica de ${esc(s.nombre)}" loading="lazy" style="width:100%;height:auto"><p>Pictograma y carteles integrados. Acabados según fotografías; medidas y distribución de accesos aproximadas.</p>`:\'\'}<p>${esc(g.observado)}</p>');p.write_text(s)
shutil.copy(root/'upload/image(20261010-075912).png',d/'referencias/recorrido_L1_usuario.png')
p=d/'index.html';s=p.read_text().replace('Ambas líneas comparten Salto del Agua.','Ambas líneas comparten Salto del Agua. · <a href="referencias/recorrido_L1_usuario.png" target="_blank" rel="noopener">Mapa L1 aportado</a> · <a href="textures/revision18/mapa_movilidad.jpg" target="_blank" rel="noopener">Cartel de movilidad</a>');p.write_text(s)
