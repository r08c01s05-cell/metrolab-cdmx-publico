from pathlib import Path
import json,struct,gzip,copy,hashlib,io
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
def read(b):
 n=struct.unpack_from('<I',b,12)[0];return json.loads(b[20:20+n]),bytearray(b[28+n:])
def write(d,b):
 d['buffers'][0]['byteLength']=len(b);j=json.dumps(d,separators=(',',':'),ensure_ascii=False).encode();j+=b' '*(-len(j)%4);b+=b'\0'*(-len(b)%4);return struct.pack('<III',0x46546c67,2,28+len(j)+len(b))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(b),0x004e4942)+b
def build():
 im=Image.new('RGB',(1024,244),'#dc8abd');draw=ImageDraw.Draw(im);font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',29);small=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',22)
 for y,t in [(12,'ESPACIO EXCLUSIVO'),(47,'PARA MUJERES Y NIÑAS')]:draw.text((512,y),t,font=font,fill='white',anchor='mt')
 for x in [425,590]:draw.rounded_rectangle((x-55,95,x+55,230),radius=9,fill='#f5f5ec')
 def person(x,y,female,s=1):
  r=7*s;draw.ellipse((x-r,y-r,x+r,y+r),fill='#182325');draw.line((x,y+11*s,x,y+50*s),fill='#182325',width=int(13*s));draw.line((x-15*s,y+15*s,x-22*s,y+43*s),fill='#182325',width=int(5*s));draw.line((x+15*s,y+15*s,x+22*s,y+43*s),fill='#182325',width=int(5*s))
  if female:draw.polygon([(x-13*s,y+13*s),(x+13*s,y+13*s),(x+23*s,y+55*s),(x-23*s,y+55*s)],fill='#182325')
  for dx in [-7,7]:draw.line((x+dx*s,y+51*s,x+dx*s,y+78*s),fill='#182325',width=int(6*s))
 person(425,123,True);draw.text((590,101),'-12 AÑOS',font=small,fill='#182325',anchor='mt');person(568,146,False,.72);person(613,146,True,.72)
 stream=io.BytesIO();im.save(stream,format='PNG');png=stream.getvalue();p=ROOT/'dist/textures/zona91/cartel.png';p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(png)
 parts=json.loads(Path('/tmp/barrera91.json').read_text());d={'asset':{'version':'2.0'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'name':'Barrera_zona_exclusiva','children':[],'extras':{'zona_exclusiva91':True,'cotas':'aproximadas'}}],'meshes':[],'materials':[],'accessors':[],'bufferViews':[],'buffers':[{'byteLength':0}],'images':[],'textures':[]};b=bytearray()
 def view(data):
  b.extend(b'\0'*(-len(b)%4));i=len(d['bufferViews']);d['bufferViews'].append({'buffer':0,'byteOffset':len(b),'byteLength':len(data)});b.extend(data);return i
 for p in parts:
  attrs={}
  for key,values,n in [('POSITION',p['positionData'],3),('NORMAL',p['normalData'],3),('TEXCOORD_0',p['uv'],2)]:
   if not values:continue
   if key=='TEXCOORD_0' and p['label']:values=[v if i%2==0 else 1-v for i,v in enumerate(values)]
   i=len(d['accessors']);a={'bufferView':view(struct.pack('<'+'f'*len(values),*values)),'componentType':5126,'count':len(values)//n,'type':'VEC'+str(n)}
   if key=='POSITION':a.update(min=[min(values[k::n]) for k in range(n)],max=[max(values[k::n]) for k in range(n)])
   d['accessors'].append(a);attrs[key]=i
  mat={'name':p['name'],'doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':p['color'],'metallicFactor':0,'roughnessFactor':.52}}
  if p['label']:mat['pbrMetallicRoughness']['baseColorTexture']={'index':0}
  mi=len(d['materials']);d['materials'].append(mat);mesh=len(d['meshes']);d['meshes'].append({'primitives':[{'attributes':attrs,'material':mi}]});node={'name':p['name'],'mesh':mesh,'translation':p['position'],'extras':{'familia_visual':'exterior','componente':'zona_exclusiva'}}
  if p['back']:node['rotation']=[0,1,0,0]
  d['nodes'][0]['children'].append(len(d['nodes']));d['nodes'].append(node)
 d['images']=[{'bufferView':view(png),'mimeType':'image/png'}];d['textures']=[{'source':0}];return write(d,b)
def append(base,asset):
 d,b=read(base);a,ab=read(asset);keys=['nodes','meshes','materials','accessors','bufferViews','images','textures'];o={k:len(d.setdefault(k,[])) for k in keys};b.extend(b'\0'*(-len(b)%4));bo=len(b);b.extend(ab)
 for v in a['bufferViews']:v['buffer']=0;v['byteOffset']=v.get('byteOffset',0)+bo
 for v in a['accessors']:v['bufferView']+=o['bufferViews']
 for v in a['images']:v['bufferView']+=o['bufferViews']
 for v in a['textures']:v['source']+=o['images']
 for m in a['materials']:
  t=m['pbrMetallicRoughness'].get('baseColorTexture')
  if t:t['index']+=o['textures']
 for m in a['meshes']:
  for p in m['primitives']:p['material']+=o['materials'];p['attributes']={k:v+o['accessors'] for k,v in p['attributes'].items()}
 for n in a['nodes']:
  if 'children' in n:n['children']=[v+o['nodes'] for v in n['children']]
  if 'mesh' in n:n['mesh']+=o['meshes']
 for k in keys:d[k].extend(a[k])
 scene=d['scenes'][d.get('scene',0)]['nodes'];first=o['nodes'];d['nodes'][first]['translation']=[25.05,1.225,-6.85];d['nodes'][first]['rotation']=[0,2**-.5,0,2**-.5];d['nodes'][first]['extras']['direction']=1;scene.append(first)
 clone=copy.deepcopy(a['nodes'][0]);clone.update(translation=[-25.05,1.225,6.85],rotation=[0,-2**-.5,0,2**-.5]);clone['extras']['direction']=-1;children=clone['children'];clone['children']=[];ci=len(d['nodes']);scene.append(ci);d['nodes'].append(clone)
 for child in children:d['nodes'][ci]['children'].append(len(d['nodes']));d['nodes'].append(copy.deepcopy(d['nodes'][child]))
 return write(d,b)
if __name__=='__main__':
 asset=build();(ROOT/'dist/models/Barrera_zona_exclusiva.glb').write_bytes(asset);manifest=[]
 for p in (ROOT/'dist/models/andenes').rglob('*.glb.gz'):
  base=gzip.decompress(p.read_bytes());d,_=read(base)
  if any(n.get('extras',{}).get('zona_exclusiva91') for n in d['nodes']):raise ValueError('Ya integrada '+str(p))
  result=append(base,asset);p.write_bytes(gzip.compress(result,compresslevel=9,mtime=0));editable=ROOT/'assets-source/andenes89'/p.relative_to(ROOT/'dist/models/andenes').with_suffix('');editable.write_bytes(result);manifest.append({'file':str(p.relative_to(ROOT/'dist')).removesuffix('.gz'),'sha256':hashlib.sha256(result).hexdigest(),'bytes':len(result)})
 (ROOT/'dist/documentacion/andenes-compresion89.json').write_text(json.dumps(manifest));print('Integrados',len(manifest),'andenes')
