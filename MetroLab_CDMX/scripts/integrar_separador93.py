from pathlib import Path
import json,gzip,hashlib,io,struct
from PIL import Image,ImageDraw,ImageFont
from integrar_barrera91 import read,write,append,ROOT

def asset():
 im=Image.new('RGB',(1024,600),'#f0f1ec');dr=ImageDraw.Draw(im)
 f=lambda size:ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',size)
 dr.rectangle((0,0,1024,135),fill='#008553');dr.text((512,65),'VIAJA SEGURA',font=f(68),fill='white',anchor='mm')
 for x,child in [(412,False),(610,True)]:
  y=205 if not child else 255;scale=1 if not child else .73
  dr.ellipse((x-24*scale,y-24*scale,x+24*scale,y+24*scale),fill='#008553')
  dr.polygon([(x-30*scale,y+36*scale),(x+30*scale,y+36*scale),(x+65*scale,y+170*scale),(x-65*scale,y+170*scale)],fill='#008553')
  for dx in [-23,23]:dr.line((x+dx*scale,y+160*scale,x+dx*scale,y+230*scale),fill='#008553',width=int(20*scale))
  for sign in [-1,1]:dr.line((x+sign*40*scale,y+48*scale,x+sign*75*scale,y+120*scale),fill='#008553',width=int(17*scale))
 dr.text((512,485),'SOLO MUJERES Y NIÑOS',font=f(51),fill='#006b43',anchor='mm');dr.text((512,552),'ÁREA EXCLUSIVA  ·  LÍNEA 8',font=f(32),fill='#006b43',anchor='mm')
 stream=io.BytesIO();im.save(stream,'PNG');png=stream.getvalue()
 parts=json.loads(Path('/tmp/separador93.json').read_text())
 d={'asset':{'version':'2.0'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'name':'Separador_fijo_L8_v93','children':[],'extras':{'zona_exclusiva91':True,'separador93':True,'adaptacion_simulada':True,'cotas':'aproximadas','paso_central_m':1.5}}],'meshes':[],'materials':[],'accessors':[],'bufferViews':[],'buffers':[{'byteLength':0}],'images':[],'textures':[]};b=bytearray()
 def view(data):
  b.extend(b'\0'*(-len(b)%4));i=len(d['bufferViews']);d['bufferViews'].append({'buffer':0,'byteOffset':len(b),'byteLength':len(data)});b.extend(data);return i
 for part in parts:
  attrs={}
  for key,values,n in [('POSITION',part['positionData'],3),('NORMAL',part['normalData'],3),('TEXCOORD_0',part['uv'],2)]:
   if not values:continue
   if key=='TEXCOORD_0' and part['label']:values=[v if i%2==0 else 1-v for i,v in enumerate(values)]
   i=len(d['accessors']);entry={'bufferView':view(struct.pack('<'+'f'*len(values),*values)),'componentType':5126,'count':len(values)//n,'type':'VEC'+str(n)}
   if key=='POSITION':entry.update(min=[min(values[k::n]) for k in range(n)],max=[max(values[k::n]) for k in range(n)])
   d['accessors'].append(entry);attrs[key]=i
  mat={'name':part['name'],'doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':part['color'],'metallicFactor':0,'roughnessFactor':.52}}
  if part['label']:mat['pbrMetallicRoughness']['baseColorTexture']={'index':0}
  if 'Vidrio' in part['name']:mat['alphaMode']='BLEND';mat['pbrMetallicRoughness']['roughnessFactor']=.12
  if 'acero' in part['name'] or 'anclaje' in part['name']:mat['pbrMetallicRoughness']['metallicFactor']=.85;mat['pbrMetallicRoughness']['roughnessFactor']=.27
  mi=len(d['materials']);d['materials'].append(mat);mesh=len(d['meshes']);d['meshes'].append({'primitives':[{'attributes':attrs,'material':mi}]});node={'name':part['name'],'mesh':mesh,'translation':part['position'],'extras':{'componente':'zona_exclusiva'}}
  if part['back']:node['rotation']=[0,1,0,0]
  d['nodes'][0]['children'].append(len(d['nodes']));d['nodes'].append(node)
 d['images']=[{'bufferView':view(png),'mimeType':'image/png'}];d['textures']=[{'source':0}]
 return write(d,b)

if __name__=='__main__':
 obj=asset();(ROOT/'dist/models/Separador_fijo_Linea8.glb').write_bytes(obj)
 paths=list((ROOT/'dist/models/andenes/L8').glob('*.glb.gz'))
 for p in paths:
  d,b=read(gzip.decompress(p.read_bytes()));roots=d['scenes'][d.get('scene',0)]['nodes']
  if any(n.get('extras',{}).get('separador93') for n in d['nodes']):raise ValueError('already integrated')
  # Remove previous barriers from active scene, never display both types together.
  roots[:]=[n for n in roots if not d['nodes'][n].get('extras',{}).get('zona_exclusiva91')]
  out=append(write(d,b),obj);d,b=read(out)
  for n in d['scenes'][d.get('scene',0)]['nodes']:
   node=d['nodes'][n]
   if node.get('extras',{}).get('separador93'):
    node['translation'][2]=-5.95 if node['extras']['direction']==1 else 5.95
  out=write(d,b);p.write_bytes(gzip.compress(out,compresslevel=9,mtime=0));(ROOT/'assets-source/andenes89'/p.relative_to(ROOT/'dist/models/andenes').with_suffix('')).write_bytes(out)
 manifest=[]
 for p in (ROOT/'dist/models/andenes').rglob('*.glb.gz'):
  out=gzip.decompress(p.read_bytes());manifest.append({'file':str(p.relative_to(ROOT/'dist')).removesuffix('.gz'),'sha256':hashlib.sha256(out).hexdigest(),'bytes':len(out)})
 (ROOT/'dist/documentacion/andenes-compresion89.json').write_text(json.dumps(manifest))
 print('Updated',len(paths),'Line 8 stations; 2 fixed separators per station.')
