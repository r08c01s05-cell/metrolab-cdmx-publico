"""Visual reference families, not manufacturer drawings or certified NM model parts."""
from pathlib import Path
import math,json,struct,gzip,copy,hashlib
from generar_motores90 import cylinder,box,ROOT
from integrar_barrera91 import read,write

def assembly(model):
 legacy=model!='NM22'
 d={'asset':{'version':'2.0'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'name':'Motor_traccion_referencia_'+model,'children':[],'extras':{'motorAssembly90':True,'motorIndex90':0,'familia_visual':'traction','motorTechnology94':'colector_referencia_visual' if legacy else 'asincrono_jaula_requisito_2020','scope':'Geometría aproximada; asignación exacta al modelo pendiente.'}}],'meshes':[],'materials':[],'accessors':[],'bufferViews':[],'buffers':[{'byteLength':0}]};b=bytearray();cache={}
 colors={'housing':([.12,.15,.16,1] if legacy else [.42,.46,.48,1]),'steel':[.5,.55,.57,1],'copper':[.64,.28,.10,1],'copper2':[.49,.20,.075,1],'dark':[.035,.04,.042,1],'wire':[.19,.13,.07,1]}
 for k,c in colors.items():d['materials'].append({'name':'Motor94_'+k,'doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':c,'metallicFactor':.72 if k!='dark' else .12,'roughnessFactor':.42 if k!='dark' else .85}})
 def accessor(values):
  b.extend(b'\0'*(-len(b)%4));a=len(d['bufferViews']);flat=[x for v in values for x in v];d['bufferViews'].append({'buffer':0,'byteOffset':len(b),'byteLength':len(flat)*4});b.extend(struct.pack('<'+'f'*len(flat),*flat));i=len(d['accessors']);d['accessors'].append({'bufferView':a,'componentType':5126,'count':len(values),'type':'VEC3','min':[min(v[k] for v in values) for k in range(3)],'max':[max(v[k] for v in values) for k in range(3)]});return i
 def part(name,shape,material,pos,explode=(0,0,0),rotor=False,rotation=None):
  key=(shape,material)
  if key not in cache:
   v,n=cylinder(*shape[1:]) if shape[0]=='c' else box(*shape[1:]);cache[key]=len(d['meshes']);d['meshes'].append({'primitives':[{'attributes':{'POSITION':accessor(v),'NORMAL':accessor(n)},'material':list(colors).index(material)}]})
  node={'name':'Motor_1_'+name,'mesh':cache[key],'translation':list(pos),'extras':{'familia_visual':'traction','motorPart90':True,'motorIndex90':0,'motorRotor90':rotor,'motorExplode90':list(explode),'reference94':True}}
  if rotation is not None:node['rotation']=[0,0,math.sin(rotation/2),math.cos(rotation/2)]
  d['nodes'][0]['children'].append(len(d['nodes']));d['nodes'].append(node)
 part('Carcasa',('c',.235,.7,.211),'housing',(0,0,0),(0,.85,0))
 part('Estator_nucleo_laminado',('c',.199,.58,.151),'steel',(0,0,0),(0,.38,0))
 part('Rotor_inducido' if legacy else 'Rotor_jaula',('c',.137,.55,0),'steel',(0,0,0),rotor=True)
 part('Eje',('c',.043,1.27,0),'steel',(0,0,0),rotor=True)
 for end in [-1,1]:
  part('Tapa_'+str(end),('c',.238,.06,.065),'housing',(0,0,end*.385),(0,0,end*.55))
  part('Rodamiento_'+str(end),('c',.083,.07,.046),'steel',(0,0,end*.345),(0,0,end*.25))
  for j in range(8):
   a=j*math.pi/4;part('Perno_'+str(end)+'_'+str(j),('c',.012,.08,0,8),'steel',(.20*math.cos(a),.20*math.sin(a),end*.414),(0,0,end*.55))
 for j in range(16):
  a=j*math.pi/8
  part(('Devanado_inducido_' if legacy else 'Barra_jaula_')+str(j),('b',.019,.022,.51),'copper',(.143*math.cos(a),.143*math.sin(a),0),(0,0,0),True,a)
  # External axial housing ribs, visible assembled; move with casing during explosion.
  part('Nervadura_carcasa_'+str(j),('b',.018,.025,.55),'housing',(.24*math.cos(a),.24*math.sin(a),0),(0,.85,0),False,a)
 for j in range(8):
  a=j*math.pi/4;part('Devanado_estator_'+str(j),('b',.025,.034,.48),'copper',(.175*math.cos(a),.175*math.sin(a),0),(0,.38,0),False,a)
 if legacy:
  # Segmented copper commutator and stationary carbon brushes: seen in supplied workshop video.
  part('Colector_base',('c',.118,.14,0),'dark',(0,0,-.49),(0,0,-.08),True)
  for j in range(40):
   a=j*math.pi/20;part('Colector_delga_'+str(j),('b',.012,.014,.135),'copper' if j%2 else 'copper2',(.12*math.cos(a),.12*math.sin(a),-.49),(0,0,-.08),True,a)
  for j in range(4):
   a=j*math.pi/2;x,y=math.cos(a),math.sin(a);part('Escobilla_carbon_'+str(j),('b',.045,.05,.105),'dark',(.145*x,.145*y,-.49),(.30*x,.30*y,-.15),False,a);part('Portaescobilla_'+str(j),('b',.085,.055,.12),'steel',(.19*x,.19*y,-.49),(.30*x,.30*y,-.15),False,a)
 else:
  for end in [-1,1]:part('Anillo_cortocircuito_'+str(end),('c',.15,.035,.12),'copper',(0,0,end*.28),rotor=True)
  part('Caja_U_V_W',('b',.2,.12,.2),'housing',(0,.29,.05),(0,1.1,0))
 for j in range(12):
  a=j*math.pi/6;part('Ventilador_alabe_'+str(j),('b',.018,.14,.026),'steel',(.105*math.cos(a),.105*math.sin(a),.323),rotor=True,rotation=a-math.pi/2)
 part('Caja_bornes',('b',.17,.095,.16),'housing',(0,.275,-.15),(0,1.1,0))
 for x in [-.18,.18]:part('Soporte_elastico_'+str(x),('b',.12,.065,.45),'dark',(x,-.26,0),(0,-.25,0))
 part('Acoplamiento',('c',.1,.14,0),'steel',(0,0,.57),(0,0,.9),True)
 part('Reductor_carcasa',('b',.27,.29,.23),'housing',(-.34,0,.65),(0,-.45,.9))
 part('Placa_identificacion_sin_datos',('b',.08,.11,.004),'steel',(.15,.19,.10),(0,.85,0))
 return write(d,b)

def append_asset(raw,asset):
 d,b=read(raw);a,ab=read(asset);keys=['nodes','meshes','materials','accessors','bufferViews'];o={k:len(d[k]) for k in keys};b.extend(b'\0'*(-len(b)%4));bo=len(b);b.extend(ab)
 for v in a['bufferViews']:v['byteOffset']=v.get('byteOffset',0)+bo
 for v in a['accessors']:v['bufferView']+=o['bufferViews']
 for m in a['meshes']:
  for p in m['primitives']:p['material']+=o['materials'];p['attributes']={k:v+o['accessors'] for k,v in p['attributes'].items()}
 for n in a['nodes']:
  if 'mesh' in n:n['mesh']+=o['meshes']
  if 'children' in n:n['children']=[v+o['nodes'] for v in n['children']]
 roots=d['scenes'][d.get('scene',0)]['nodes'];old=[copy.deepcopy(d['nodes'][i]) for i in roots if d['nodes'][i].get('extras',{}).get('motorAssembly90')]
 if len(old)!=4:raise ValueError('Expected four motor placements')
 roots[:]=[i for i in roots if not d['nodes'][i].get('extras',{}).get('motorAssembly90')]
 for k in keys:d[k].extend(a[k])
 base=a['nodes'][0]
 for i,oldroot in enumerate(old):
  root=copy.deepcopy(base);root['translation']=oldroot['translation'];root['name']='Motor_traccion_'+str(i+1)+'_referencia94';root['extras']['motorIndex90']=i;root['children']=[];ri=len(d['nodes']);d['nodes'].append(root);roots.append(ri)
  for ni in base['children']:
   n=copy.deepcopy(d['nodes'][ni]);n['name']=n['name'].replace('Motor_1_','Motor_'+str(i+1)+'_');n['extras']['motorIndex90']=i;d['nodes'][ri]['children'].append(len(d['nodes']));d['nodes'].append(n)
 return write(d,b)
if __name__=='__main__':
 manifest=[]
 for model in ['NM22','NM79','MP82']:
  asset=assembly(model);(ROOT/f'dist/models/Motor_{model}_referencia94.glb').write_bytes(asset)
  for unit in ['cabina','intermedio']:
   path=ROOT/f'dist/models/{model}_{unit}.glb.gz';raw=gzip.decompress(path.read_bytes());d,_=read(raw)
   if any(n.get('extras',{}).get('motorTechnology94') for n in d['nodes']):raise ValueError('Already integrated')
   result=append_asset(raw,asset);path.write_bytes(gzip.compress(result,compresslevel=9,mtime=0));manifest.append({'file':str(path.relative_to(ROOT/'dist')),'sha256':hashlib.sha256(result).hexdigest(),'basis':'visual_colector_no_ficha_modelo' if model!='NM22' else 'requisito_proyecto_L1_2020','motors':4})
 (ROOT/'dist/documentacion/motores94.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));print('Updated six train GLBs and three separate motor assemblies.')
