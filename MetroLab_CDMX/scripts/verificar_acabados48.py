from estaciones48 import *
from collections import Counter

def preserved(g):
 out=Counter()
 for i in g.j['scenes'][0]['nodes']:
  n=g.j['nodes'][i];name=n.get('name','')
  if'mesh'not in n or name.startswith(('Marco cartel movilidad','Cartel mapa aportado','Marco publicidad','Panel publicidad disponible','Pictograma','Marco mapa movilidad48','Respaldo mapa movilidad48','Anclaje cartel al pretil48')):continue
  h=hashlib.sha256(matrix(n).tobytes())
  for p in g.j['meshes'][n['mesh']]['primitives']:
   for key in ['POSITION','NORMAL']:h.update(g.array(p['attributes'][key]).tobytes())
   if'indices'in p:h.update(g.array(p['indices']).tobytes())
  out[(name,h.hexdigest())]+=1
 return out
report=[]
for s in json.loads((D/'datos.json').read_text())['estaciones']:
 path=s['geometria_3d']['url_glb'].split('?')[0];new=GLB((D/path).read_bytes());old=GLB(subprocess.check_output(['git','show',BASE+':dist/'+path],cwd=ROOT));assert preserved(old)==preserved(new),s['id']+' geometría funcional alterada';j=new.j;uvfaces=0;images=0
 for im in j['images']:
  assert'uri'not in im;v=j['bufferViews'][im['bufferView']];Image.open(io.BytesIO(new.b[v['byteOffset']:v['byteOffset']+v['byteLength']])).verify();images+=1
 for i in j['scenes'][0]['nodes']:
  n=j['nodes'][i]
  if'mesh'not in n:continue
  assert not n.get('name','').lower().startswith(('banco','asiento')),s['id']+' banco'
  for p in j['meshes'][n['mesh']]['primitives']:
   mat=j['materials'][p['material']];scale=mat.get('extras',{}).get('repeticion_m')
   if not scale:continue
   a=p['attributes'];m=matrix(n);xyz=new.array(a['POSITION'])@m[:3,:3].T+m[:3,3];uv=new.array(a['TEXCOORD_0']);assert np.isfinite(uv).all();idx=new.array(p['indices']).astype(int).ravel().reshape(-1,3)if'indices'in p else np.arange(len(xyz)).reshape(-1,3)
   pts=xyz[idx];e=pts[:,1]-pts[:,0];f=pts[:,2]-pts[:,0];normal=np.cross(e,f);areas=np.linalg.norm(normal,axis=1);norm=normal/np.maximum(areas[:,None],1e-12);planar=(np.abs(norm).max(axis=1)>.99999)&(areas>.001)
   for edge in [1,2]:
    world=np.linalg.norm(pts[:,edge]-pts[:,0],axis=1);tex=np.linalg.norm(uv[idx[:,edge]]-uv[idx[:,0]],axis=1)*scale;assert np.max(np.abs(world[planar]-tex[planar]),initial=0)<.00015,(s['id'],n['name'],'UV incorrecta')
   uvfaces+=int(planar.sum());assert mat['pbrMetallicRoughness']['metallicFactor']==0
 assert uvfaces>500
 if s['id']in ['L8-08','L8-18']:
  columns=[n for n in j['nodes']if n.get('name','').startswith('Columna circular')]
  assert len(columns)==18
  for n in columns:
   mat=j['materials'][j['meshes'][n['mesh']]['primitives'][0]['material']];assert'lila'in mat['name']
 report.append({'id':s['id'],'caras_uv_verificadas':uvfaces,'texturas_embebidas_decodificadas':images,'geometria_funcional_preservada':True})
(D/'docs/Verificacion_acabados48.json').write_text(json.dumps({'metodo':'Geometría y UV desde bytes glTF; decodificación real PNG/JPEG con Pillow. Comparación contra v47. No prueba WebGL.','estaciones':report},indent=2)+'\n');print('39 estaciones: geometría conservada,',sum(r['caras_uv_verificadas']for r in report),'caras con UV métricas y',sum(r['texturas_embebidas_decodificadas']for r in report),'imágenes embebidas verificadas.')
