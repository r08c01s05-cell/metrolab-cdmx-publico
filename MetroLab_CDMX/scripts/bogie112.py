"""Detalles visibles de bogie basados en la fotografía aportada; cotas aproximadas."""
from pathlib import Path
import json,math,struct,gzip,copy,hashlib,shutil
from generar_motores90 import box,cylinder
from integrar_barrera91 import read,write
ROOT=Path(__file__).resolve().parents[1]
def geometry_asset(kind):
 guard=kind=='guard';d={'asset':{'version':'2.0','generator':'Bogie reference112'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'name':'Proteccion_captador112'if guard else'Rueda_guia_horizontal112','children':[],'extras':{'familia_visual':'mecanica','guard112':guard,'guideAssembly112':not guard,'scope':'Geometría aproximada de referencia fotográfica; asignación exacta por modelo no certificada.'}}],'meshes':[],'materials':[],'accessors':[],'bufferViews':[],'buffers':[{'byteLength':0}]};b=bytearray();cache={}
 materials={'paint':('Pintura_proteccion_oxido112',[.24,.065,.035,1],.12,.65),'steel':('Acero_bogie112',[.20,.23,.24,1],.80,.43),'rubber':('Caucho_rueda_guia112',[.025,.03,.028,1],0,.91),'cap':('Acero_tapa_guia112',[.11,.13,.13,1],.65,.52)}
 for name,c,m,r in materials.values():d['materials'].append({'name':name,'pbrMetallicRoughness':{'baseColorFactor':c,'metallicFactor':m,'roughnessFactor':r}})
 def access(v):
  b.extend(b'\0'*(-len(b)%4));view=len(d['bufferViews']);flat=[x for p in v for x in p];d['bufferViews'].append({'buffer':0,'byteOffset':len(b),'byteLength':len(flat)*4});b.extend(struct.pack('<'+'f'*len(flat),*flat));idx=len(d['accessors']);d['accessors'].append({'bufferView':view,'componentType':5126,'count':len(v),'type':'VEC3','min':[min(p[k]for p in v)for k in range(3)],'max':[max(p[k]for p in v)for k in range(3)]});return idx
 def part(name,shape,pos,mat,rotation=None):
  key=(shape,mat)
  if key not in cache:
   v,n=box(*shape[1:])if shape[0]=='b'else cylinder(*shape[1:]);cache[key]=len(d['meshes']);d['meshes'].append({'primitives':[{'attributes':{'POSITION':access(v),'NORMAL':access(n)},'material':list(materials).index(mat)}]})
  node={'name':('Captador_'if guard else'Guia_')+name,'mesh':cache[key],'translation':list(pos),'extras':{'familia_visual':'mecanica','photoDetail112':True,'poweredOnly111':guard,'guardPart112':guard,'guidePart112':not guard}}
  if rotation:node['rotation']=rotation
  d['nodes'][0]['children'].append(len(d['nodes']));d['nodes'].append(node)
 q=[math.sin(math.pi/4),0,0,math.cos(math.pi/4)]
 if guard:
  # Open U-shaped protection leaves the original contact block visible.
  for x in[-.265,.265]:
   part('Proteccion_montante_U',('b',.035,.29,.025),(x,-.135,.313),'paint')
   part('Proteccion_esquina_U',('b',.075,.035,.025),(x*.88,-.288,.313),'paint')
   part('Tornillo_proteccion',('c',.013,.018,0,8),(x,-.025,.333),'steel')
  part('Proteccion_base_U',('b',.45,.035,.025),(0,-.305,.313),'paint')
  part('Respaldo_superior',('b',.39,.16,.075),(0,.205,.07),'cap')
  part('Soporte_vertical_bogie',('b',.11,.28,.09),(0,.15,.04),'steel')
  for x in[-.12,.12]:part('Perno_respaldo',('c',.015,.02,0,8),(x,.235,.12),'steel')
 else:
  part('Neumatico_horizontal',('c',.315,.16,.225,32),(0,0,0),'rubber',q)
  part('Llanta_horizontal',('c',.23,.18,.16,32),(0,0,0),'steel',q)
  part('Cubo_horizontal',('c',.16,.19,0,24),(0,.015,0),'cap',q)
  for y,r in[(.12,.215),(.16,.17),(.19,.12)]:part('Tapa_buje',('c',r,.035,0,24),(0,y,0),'cap',q)
  part('Brazo_soporte',('b',.42,.085,.12),(-.23,.18,-.02),'steel')
  part('Placa_soporte',('b',.09,.18,.25),(-.44,.19,-.02),'steel')
  part('Perno_pivote',('c',.045,.07,0,12),(0,.22,0),'steel',q)
 return write(d,b)
def append_nodes(raw,asset,placements):
 d,b=read(raw);a,ab=read(asset);offset={k:len(d[k])for k in['nodes','meshes','materials','accessors','bufferViews']};b.extend(b'\0'*(-len(b)%4));bo=len(b);b.extend(ab)
 for v in a['bufferViews']:v['byteOffset']=v.get('byteOffset',0)+bo
 for v in a['accessors']:v['bufferView']+=offset['bufferViews']
 for m in a['meshes']:
  for p in m['primitives']:p['material']+=offset['materials'];p['attributes']={k:v+offset['accessors']for k,v in p['attributes'].items()}
 for n in a['nodes']:
  if'mesh'in n:n['mesh']+=offset['meshes']
  if'children'in n:n['children']=[v+offset['nodes']for v in n['children']]
 for k in offset:d[k].extend(a[k])
 for placement in placements:
  node=copy.deepcopy(a['nodes'][0]);node['children']=[];node.update(placement['transform']);idx=len(d['nodes']);d['nodes'].append(node)
  if'parent'in placement:d['nodes'][placement['parent']].setdefault('children',[]).append(idx)
  else:d['scenes'][d.get('scene',0)]['nodes'].append(idx)
  for child in a['nodes'][0]['children']:
   n=copy.deepcopy(d['nodes'][child]);node['children'].append(len(d['nodes']));d['nodes'].append(n)
 return write(d,b)
if __name__=='__main__':
 guard=geometry_asset('guard');guide=geometry_asset('guide');dest=ROOT/'assets-source/bogie112';dest.mkdir(parents=True,exist_ok=True)
 (dest/'Proteccion_captador.glb').write_bytes(guard);(dest/'Rueda_guia.glb').write_bytes(guide)
 # Preserve originals outside the public package.
 refs=dest/'referencias';refs.mkdir(exist_ok=True)
 for source in['image(20261015-140352).png','image(20261015-135431).png']:shutil.copyfile(ROOT.parent.parent/'scratch/fc8783fbaffa/upload'/source,refs/source)
 manifest=[]
 for model in['NM22','NM79','MP82']:
  for unit in['cabina','intermedio']:
   path=ROOT/f'dist/models/{model}_{unit}.glb.gz';raw=gzip.decompress(path.read_bytes());d,_=read(raw)
   if any(n.get('extras',{}).get('photoDetail112')for n in d['nodes']):raise ValueError('Detalle ya aplicado')
   roots=d['scenes'][d.get('scene',0)]['nodes'];parents=[i for i in roots if d['nodes'][i].get('extras',{}).get('collectorAssembly111')];assert len(parents)==4
   raw=append_nodes(raw,guard,[{'parent':i,'transform':{}}for i in parents]);center=5.35 if model=='MP82'else 5.7;reach=1.48 if model=='MP82'else 1.7
   raw=append_nodes(raw,guide,[{'transform':{'translation':[x+end*reach,.405,side*1.04],'rotation':[0,1,0,0]if end<0 else[0,0,0,1]}}for x in[-center,center]for end in[-1,1]for side in[-1,1]])
   path.write_bytes(gzip.compress(raw,compresslevel=9,mtime=0));(ROOT/f'assets-source/trenes/{model}_{unit}.glb').write_bytes(raw);manifest.append({'asset':path.name,'guards':4,'horizontalGuideWheels':8,'sha256':hashlib.sha256(raw).hexdigest(),'approximate':True})
 (ROOT/'dist/documentacion/bogie112.json').write_text(json.dumps({'reference':'Fotografías aportadas image(20261015-140352).png e image(20261015-135431).png','scope':'Disposición visual aproximada, adaptada a los tres modelos; foto sin identificación técnica suficiente para certificar cada versión.','assets':manifest},ensure_ascii=False,indent=2));print('6 GLB: protección de captadores y ruedas guía horizontales integradas.')
