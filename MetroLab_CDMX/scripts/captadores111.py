"""Captadores positivos ilustrativos. Medidas no proceden de planos de fabricante."""
from pathlib import Path
import math,json,struct,gzip,hashlib,copy
from generar_motores90 import box,cylinder
from integrar_barrera91 import read,write
ROOT=Path(__file__).resolve().parents[1]
SOURCE='https://metro.cdmx.gob.mx/storage/app/media/licitacion/2020/30102015_002_20/ANEX1/ACTUALIZADA/15-prescripciones-mr-25sept-cambios.pdf'
def build():
 d={'asset':{'version':'2.0','generator':'Captador ilustrativo111'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'name':'Captador_positivo_referencia111','children':[],'extras':{'collectorAssembly111':True,'poweredOnly111':True,'familia_visual':'mecanica','scope':'Geometría y dimensiones aproximadas; diseño individual NM-22/NM-79/MP-82 no certificado.','source':SOURCE}}],'meshes':[],'materials':[],'accessors':[],'bufferViews':[],'buffers':[{'byteLength':0}]};b=bytearray();cache={}
 colors={'Acero_soporte111':([.20,.23,.24,1],.78,.43),'Aislante_captador111':([.17,.11,.065,1],0,.72),'Carbon_escobilla111':([.055,.06,.058,1],0,.88),'Cobre_terminal111':([.48,.23,.10,1],.85,.38),'Caucho_cable111':([.025,.03,.03,1],0,.91)}
 for n,(c,m,r)in colors.items():d['materials'].append({'name':n,'pbrMetallicRoughness':{'baseColorFactor':c,'metallicFactor':m,'roughnessFactor':r}})
 def access(values):
  b.extend(b'\0'*(-len(b)%4));view=len(d['bufferViews']);flat=[x for v in values for x in v];d['bufferViews'].append({'buffer':0,'byteOffset':len(b),'byteLength':len(flat)*4});b.extend(struct.pack('<'+'f'*len(flat),*flat));i=len(d['accessors']);d['accessors'].append({'bufferView':view,'componentType':5126,'count':len(values),'type':'VEC3','min':[min(v[k]for v in values)for k in range(3)],'max':[max(v[k]for v in values)for k in range(3)]});return i
 def part(name,shape,pos,mat,rot=None):
  key=(shape,mat)
  if key not in cache:
   v,n=box(*shape[1:])if shape[0]=='b'else cylinder(*shape[1:]);cache[key]=len(d['meshes']);d['meshes'].append({'primitives':[{'attributes':{'POSITION':access(v),'NORMAL':access(n)},'material':list(colors).index(mat)}]})
  node={'name':name,'mesh':cache[key],'translation':list(pos),'extras':{'collectorPart111':True,'poweredOnly111':True,'familia_visual':'mecanica'}}
  if rot:node['rotation']=rot
  d['nodes'][0]['children'].append(len(d['nodes']));d['nodes'].append(node)
 part('Captador_placa_anclaje',('b',.46,.075,.19),(0,.12,0),'Acero_soporte111')
 for x in[-.155,.155]:
  part('Captador_aislador',('c',.052,.12,0,12),(x,.04,.045),'Aislante_captador111',[math.sin(math.pi/4),0,0,math.cos(math.pi/4)])
  for y in[-.005,.03,.065]:part('Captador_aleta_aislador',('c',.065,.012,0,12),(x,y,.045),'Aislante_captador111',[math.sin(math.pi/4),0,0,math.cos(math.pi/4)])
  part('Captador_perno',('c',.018,.018,0,6),(x,.165,0),'Acero_soporte111',[math.sin(math.pi/4),0,0,math.cos(math.pi/4)])
 part('Captador_soporte_portaescobilla',('b',.40,.065,.13),(0,-.065,.075),'Acero_soporte111')
 for x in[-.14,.14]:part('Captador_brazo_presion',('b',.035,.07,.19),(x,-.11,.18),'Acero_soporte111')
 part('Captador_caja_aislante',('b',.40,.14,.12),(0,-.155,.225),'Aislante_captador111')
 part('Captador_patin_carbon_contacto',('b',.36,.10,.07),(0,-.155,.30),'Carbon_escobilla111')
 part('Captador_terminal_conductor',('b',.065,.035,.055),(.20,-.06,.11),'Cobre_terminal111')
 # Segmented insulated cable follows a bounded path back toward the bogie frame.
 for i,(x,y,z)in enumerate([(.23,-.045,.10),(.25,0,.09),(.27,.04,.06),(.28,.065,.01)]):part('Captador_cable_aislado_'+str(i),('b',.045,.065,.045),(x,y,z),'Caucho_cable111')
 return write(d,b)
def append(raw,asset,center):
 d,b=read(raw);a,ab=read(asset)
 if any(n.get('extras',{}).get('collectorAssembly111')for n in d['nodes']):raise ValueError('Captadores ya integrados')
 keys=['nodes','meshes','materials','accessors','bufferViews'];offset={k:len(d[k])for k in keys};b.extend(b'\0'*(-len(b)%4));bo=len(b);b.extend(ab)
 for v in a['bufferViews']:v['byteOffset']=v.get('byteOffset',0)+bo
 for v in a['accessors']:v['bufferView']+=offset['bufferViews']
 for m in a['meshes']:
  for p in m['primitives']:p['material']+=offset['materials'];p['attributes']={k:v+offset['accessors']for k,v in p['attributes'].items()}
 for n in a['nodes']:
  if'mesh'in n:n['mesh']+=offset['meshes']
  if'children'in n:n['children']=[x+offset['nodes']for x in n['children']]
 for k in keys:d[k].extend(a[k])
 base=a['nodes'][0];roots=d['scenes'][d.get('scene',0)]['nodes']
 for bogie,x in enumerate([-center,center]):
  for side in[-1,1]:
   node=copy.deepcopy(base);node['name']=f'Captador_positivo_B{bogie+1}_S{side}';node['translation']=[x,.56,side*1.02];node['rotation']=[0,1,0,0]if side<0 else[0,0,0,1];node['extras'].update({'bogie111':bogie,'side111':side});node['children']=[];idx=len(d['nodes']);d['nodes'].append(node);roots.append(idx)
   for child in base['children']:
    n=copy.deepcopy(d['nodes'][child]);n['name']=node['name']+'_'+n['name'];node['children'].append(len(d['nodes']));d['nodes'].append(n)
 return write(d,b)
if __name__=='__main__':
 asset=build();source=ROOT/'assets-source/captadores111';source.mkdir(parents=True,exist_ok=True);(source/'Captador_positivo_referencia.glb').write_bytes(asset);(ROOT/'dist/models/Captador_positivo111.glb.gz').write_bytes(gzip.compress(asset,mtime=0));manifest=[]
 for model in['NM22','NM79','MP82']:
  for unit in['cabina','intermedio']:
   path=ROOT/f'dist/models/{model}_{unit}.glb.gz';raw=gzip.decompress(path.read_bytes());result=append(raw,asset,5.35 if model=='MP82'else 5.7);path.write_bytes(gzip.compress(result,compresslevel=9,mtime=0));(ROOT/f'assets-source/trenes/{model}_{unit}.glb').write_bytes(result);manifest.append({'asset':path.name,'positiveCollectors':4,'poweredOnly':True,'sha256':hashlib.sha256(result).hexdigest(),'approximate':True})
 (ROOT/'dist/documentacion/captadores111.json').write_text(json.dumps({'source':SOURCE,'scope':'Referencia general; geometría ilustrativa, no certificación de montaje por modelo.','assets':manifest},ensure_ascii=False,indent=2));print('6 GLB actualizados; 4 captadores positivos por plantilla motriz.')
