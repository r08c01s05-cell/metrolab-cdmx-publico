"""Revisión de acabados GLB sobre la versión actual, sin alterar plantas ni vías."""
from pathlib import Path
import json,struct,hashlib
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist'
d=json.loads((DIST/'datos.json').read_text());report=[]
# Paletas aproximadas desde las vistas aportadas; valores en espacio lineal glTF.
warm={1,3,7,9,10,15,19};stone={13,19};gray={11}
notes={1:'Andén claro con piso gris; mantener separadores y señalización.',2:'Priorizar la vista con franja rosa y pared clara; excluir la imagen 075421 de señalización verde.',3:'Pared marfil clara y plafón lateral metálico; evitar un baño amarillo sobre toda la estación.',4:'Panel claro y franja rosa; el túnel oscuro es una vista distinta, no un acabado de la estación.',5:'Pared clara, piso gris y plafón lateral claro.',6:'La vista renovada muestra panel blanco; las vistas con plafón anterior se conservan como contexto.',7:'Priorizar andén de Línea 1; no mezclarlo con otras zonas del complejo de correspondencia.',8:'Panel claro y pasarela; 074312 contiene iconografía asociada a Pino Suárez y no define el acabado.',9:'Panel blanco enmarcado de rosa; diferenciar las imágenes con plafón anterior.',10:'Las imágenes con murales azules y plafón cuadriculado corresponden a otro acabado; priorizar 063803.',11:'Pared clara de aspecto mineral y remate gris con emblema; evitar tratarla como piedra amarilla.',12:'Panel blanco y franja rosa; conservar correspondencia y pictograma.',13:'Revestimiento mineral claro y correspondencia amarilla; no extrapolar el tren verde de 062256 a la estación.',14:'Priorizar la imagen rotulada Cuauhtémoc 061917; 061756 repite una vista rotulada Insurgentes.',15:'Conservar matiz cálido del revestimiento y separar los acabados antiguos del conjunto renovado.',16:'Las vistas antiguas de pared mineral no sustituyen el panel claro de 061058.',17:'Panel claro y pasarela; no usar el interior de un tren como evidencia arquitectónica.',18:'Panel claro y plafón lateral metálico; pictograma de ave propio de la estación.',19:'Mantener matiz mineral cálido en el revestimiento; las vistas de plafón cuadriculado y techo oscuro no son intercambiables.',20:'Panel claro, cubierta metálica elevada y cerchas; conservar arquitectura específica de terminal.'}
for st in d['estaciones']:
 g=st['geometria_3d'];p=DIST/g['url_glb'].split('?')[0];raw=p.read_bytes();n=struct.unpack_from('<I',raw,12)[0];j=json.loads(raw[20:20+n]);tail=raw[20+n:];num=st['orden'];line=st['linea'];changes=[]
 for mat in j['materials']:
  name=mat.get('name','');pbr=mat.setdefault('pbrMetallicRoughness',{})
  if 'Revestimiento' in name and line==1:
   tone=[.82,.80,.76] if num in gray else [.89,.86,.80] if num in warm else [.90,.91,.90]
   if num in stone and 'baseColorTexture' in pbr:
    pbr['baseColorFactor']=[.98,.98,.96,1];pbr['roughnessFactor']=.68
   else:
    pbr['baseColorFactor']=[*tone,1];pbr.pop('baseColorTexture',None);mat.pop('normalTexture',None);pbr['roughnessFactor']=.60 if num in gray else .47
   changes.append('Revestimiento corregido desde la referencia seleccionada')
  if any(t in name for t in ['Piso','Terrazo']):pbr.update(roughnessFactor=.52,metallicFactor=0);changes.append('Piso con reflexión moderada y sin metalicidad')
  if 'Concreto' in name:pbr['roughnessFactor']=.87;pbr['metallicFactor']=0
  if 'Borde amarillo' in name:pbr['roughnessFactor']=.76;pbr['metallicFactor']=0
  if name in ['Franja rosa Línea 1','Marco rosa fotografía']:pbr['baseColorFactor']=[.46,.10,.26,1];pbr['roughnessFactor']=.56;changes.append('Franja y marcos con tono rosa coherente')
  if any(t in name for t in ['Acero satinado','Aluminio cepillado']):pbr['roughnessFactor']=.42;pbr['metallicFactor']=.72
  if 'Difusor' in name:pbr['baseColorFactor']=[.90,.91,.90,1];mat['emissiveFactor']=[.48,.49,.46];changes.append('Difusor neutro sin dominante azul')
  if 'Plafón porcelánico' in name:pbr['baseColorFactor']=[.84,.85,.83,1];pbr['roughnessFactor']=.70
  if 'normalTexture' in mat:mat['normalTexture']['scale']=.12
 j['scenes'][0].setdefault('extras',{})['revision_acabados']='23-coherencia-referencias'
 packed=json.dumps(j,ensure_ascii=False,separators=(',',':')).encode();packed+=b' '*((-len(packed))%4)
 out=struct.pack('<III',0x46546c67,2,20+len(packed)+len(tail))+struct.pack('<II',len(packed),0x4e4f534a)+packed+tail;p.write_bytes(out)
 g['url_glb']=g['url_glb'].split('?')[0]+'?revision=23';g['revision_acabados']=23
 g['analisis_referencias23']=notes[num] if line==1 else 'Revisión común de materiales e iluminación; se conserva la paleta y arquitectura del video de Línea 8. Sin nuevas fotografías por estación en este lote.'
 report.append({'id':st['id'],'nombre':st['nombre'],'linea':line,'modelo':str(p.relative_to(DIST)),'referencia_principal':g.get('referencia_foto_original'),'criterio':g['analisis_referencias23'],'cambios':sorted(set(changes)),'sha256':hashlib.sha256(out).hexdigest()})
(DIST/'datos.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
(DIST/'docs/Coherencia_estaciones_23.json').write_text(json.dumps({'imagenes_accesibles_revisadas':104,'imagenes_no_legibles':['image(20261009-054501).png','image(20261009-055958).png'],'criterio':'Comparación visual; fecha de captura y dimensiones no verificadas. Vistas rotuladas de la estación preferidas frente a imágenes ambiguas.','estaciones':report},ensure_ascii=False,indent=2)+'\n')
lines=['# Coherencia visual · revisión 23','', 'Se revisaron 104 imágenes accesibles. Dos archivos no se pudieron decodificar. Las referencias mezclan acabados anteriores, renovados, vistas de otras líneas y condiciones distintas de iluminación. La revisión prioriza las vistas rotuladas de la misma estación y mantiene el tono propio de cada una. No se afirma una fecha real de captura.','', '## Cambios comunes','', 'Pisos menos brillantes y sin metalicidad, difusores neutros, metales satinados y relieve de material más discreto. Se mantienen vías, accesos, pictogramas, carteles, pasarelas y elementos específicos; los bancos retirados siguen ausentes.','', '## Revisión por estación de Línea 1','', '| Estación | Criterio visual |','|---|---|']
lines += [f"| {x['nombre']} | {x['criterio']} |" for x in report if x['linea']==1]
lines+=['','## Línea 8 y límites','', 'En los 19 GLB de Línea 8 se mejoraron los materiales comunes conservando los acabados del video previo. No se atribuyen a fotografías nuevas por estación. Los 20 GLB de Línea 1 reciben además correcciones de revestimiento y armonización de franja y marcos. Las plantas y medidas siguen aproximadas. Se editaron GLB directamente; no se ejecutó Blender ni se generaron nuevos archivos .blend. No hay prueba WebGL en navegador.']
(DIST/'docs/Coherencia_estaciones_23.md').write_text('\n'.join(lines)+'\n')
p=DIST/'app.js';s=p.read_text().replace('Revisión 18 · Fotografías de la estación','Revisión 23 · Fotografías de la estación').replace('Pictograma y carteles integrados. Acabados según fotografías; medidas y distribución de accesos aproximadas.','${esc(g.analisis_referencias23||\'Acabados según las referencias aportadas.\')} Medidas y distribución de accesos aproximadas. <a href="docs/Coherencia_estaciones_23.md" target="_blank" rel="noopener">Ver análisis de coherencia</a>');p.write_text(s)
p=DIST/'station-scene.js';p.write_text(p.read_text().replace('Fotografías · revisión 18','Fotografías · revisión 23'))
p=DIST/'index.html';p.write_text(p.read_text().replace('station-scene.js?v=22','station-scene.js?v=23').replace('app.js?v=19','app.js?v=23'))
print('Actualizados',len(report),'modelos; 20 con comparación de fotografías y 19 con ajuste común de materiales.')
