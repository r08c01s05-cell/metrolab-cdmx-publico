"""Keep imported rig/geometry/UVs; repack buffers and resize embedded textures for web."""
from pathlib import Path
from PIL import Image
import io,json,struct,gzip,hashlib,argparse
import numpy as np
P=argparse.ArgumentParser();P.add_argument('source');args=P.parse_args();R=Path(__file__).resolve().parents[1];report=[]
for p in Path(args.source).glob('*walk*.glb.gz'):
 raw=gzip.decompress(p.read_bytes());n=struct.unpack_from('<I',raw,12)[0];d=json.loads(raw[20:20+n]);binary=bytearray(raw[28+n:]);
 # Round vertex floats below visual precision; inverse bind matrices and animation remain exact.
 for mesh in d['meshes']:
  for prim in mesh['primitives']:
   for role,ai in prim['attributes'].items():
    a=d['accessors'][ai];v=d['bufferViews'][a['bufferView']];dims={'VEC2':2,'VEC3':3,'VEC4':4};
    if a['componentType']!=5126 or a['type'] not in dims:continue
    count=dims[a['type']];off=v.get('byteOffset',0)+a.get('byteOffset',0);stride=v.get('byteStride',count*4)
    view=np.ndarray((a['count'],count),dtype='<f4',buffer=binary,offset=off,strides=(stride,4));view[:]=np.round(view,4 if role in ['POSITION','TEXCOORD_0']else 3)
    if role=='POSITION':a['min']=view.min(axis=0).tolist();a['max']=view.max(axis=0).tolist()
    if role=='WEIGHTS_0':
     dominant=view.argmax(axis=1);view[np.arange(len(view)),dominant]+=1-view.sum(axis=1)
 # Remove unreachable source accessors and their buffer views; keep all authored primitives and clips.
 refs=set()
 for mesh in d['meshes']:
  for prim in mesh['primitives']:
   refs.update(prim['attributes'].values())
   if 'indices'in prim:refs.add(prim['indices'])
   for target in prim.get('targets',[]):refs.update(target.values())
 for skin in d.get('skins',[]):
  if 'inverseBindMatrices'in skin:refs.add(skin['inverseBindMatrices'])
 for animation in d.get('animations',[]):
  for sampler in animation['samplers']:refs.update([sampler['input'],sampler['output']])
 mapping={old:i for i,old in enumerate(sorted(refs))};d['accessors']=[d['accessors'][i]for i in sorted(refs)]
 for mesh in d['meshes']:
  for prim in mesh['primitives']:
   prim['attributes']={k:mapping[v]for k,v in prim['attributes'].items()}
   if 'indices'in prim:prim['indices']=mapping[prim['indices']]
   for target in prim.get('targets',[]):
    for k in target:target[k]=mapping[target[k]]
 for skin in d.get('skins',[]):
  if 'inverseBindMatrices'in skin:skin['inverseBindMatrices']=mapping[skin['inverseBindMatrices']]
 for animation in d.get('animations',[]):
  for sampler in animation['samplers']:
   for k in ['input','output']:sampler[k]=mapping[sampler[k]]
 views={a['bufferView']for a in d['accessors']}|{im['bufferView']for im in d['images']};mapping={old:i for i,old in enumerate(sorted(views))};d['bufferViews']=[d['bufferViews'][i]for i in sorted(views)]
 for accessor in d['accessors']:accessor['bufferView']=mapping[accessor['bufferView']]
 for im in d['images']:im['bufferView']=mapping[im['bufferView']]
 images={a['bufferView']:a for a in d.get('images',[]) if 'bufferView'in a};out=bytearray();seen={};resized=0
 for i,v in enumerate(d['bufferViews']):
  payload=binary[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']]
  if i in images:
   image=Image.open(io.BytesIO(payload));image.thumbnail((512,512),Image.Resampling.LANCZOS);buf=io.BytesIO();
   alpha=image.getchannel('A').getextrema() if image.mode=='RGBA'else (255,255)
   fmt='PNG'if alpha[0]<255 else 'JPEG'
   if fmt=='JPEG':image=image.convert('RGB');image.save(buf,format='JPEG',quality=82,optimize=True)
   else:image.save(buf,format='PNG',optimize=True)
   if len(buf.getvalue())<len(payload):payload=buf.getvalue();images[i]['mimeType']='image/png'if fmt=='PNG'else 'image/jpeg'
   resized+=1
  key=hashlib.sha256(payload).digest()
  if key not in seen:
   out.extend(b'\0'*(-len(out)%4));seen[key]=len(out);out.extend(payload)
  v['byteOffset']=seen[key];v['byteLength']=len(payload)
 out.extend(b'\0'*(-len(out)%4));d['buffers'][0]['byteLength']=len(out);d['asset']['integration144']='Embedded textures capped at 512 px; Original topology, rig, UV layout and animation retained; vertex attributes rounded below visual precision.'
 j=json.dumps(d,separators=(',',':')).encode();j+=b' '*(-len(j)%4);encoded=struct.pack('<III',0x46546c67,2,28+len(j)+len(out))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(out),0x004e4942)+out
 dest=R/'dist/models/personajes'/p.name;dest.write_bytes(gzip.compress(encoded,compresslevel=9,mtime=0));report.append({'file':p.name,'source_sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'before':p.stat().st_size,'after':dest.stat().st_size,'textures':resized,'asset':d['asset']})
(R/'assets-source/integration144/cast-audit.json').write_text(json.dumps(report,indent=2,ensure_ascii=False));print(json.dumps([{k:r[k]for k in ['file','before','after']}for r in report],indent=2))
