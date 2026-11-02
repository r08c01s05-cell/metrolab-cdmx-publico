"""Seal lower glazing-to-panel gaps on NM22/NM79 moving door leaves."""
from pathlib import Path
import json,struct,gzip
import numpy as np
for prefix in ['NM22','NM79']:
 for kind in ['cabina','intermedio']:
  stem=prefix+'_'+kind;p=Path('assets-source/trenes',stem+'.glb');base=Path('assets-source/trenes/base45',stem+'.glb');base.parent.mkdir(exist_ok=True)
  if not base.exists():base.write_bytes(p.read_bytes())
  b=base.read_bytes();n=struct.unpack_from('<I',b,12)[0];d=json.loads(b[20:20+n]);blob=bytearray(b[28+n:])
  d['materials'].extend([{'name':'Sello metalico puerta45','pbrMetallicRoughness':{'baseColorFactor':[.36,.40,.41,1],'metallicFactor':.8,'roughnessFactor':.38}},{'name':'Junta inferior vidrio45','pbrMetallicRoughness':{'baseColorFactor':[.022,.024,.022,1],'metallicFactor':0,'roughnessFactor':.9}}]);steel=len(d['materials'])-2;rubber=steel+1
  def accessor(a):
   a=np.asarray(a,dtype='<f4');blob.extend(b'\0'*((-len(blob))%4));off=len(blob);blob.extend(a.tobytes());d['bufferViews'].append({'buffer':0,'byteOffset':off,'byteLength':a.nbytes,'target':34962});d['accessors'].append({'bufferView':len(d['bufferViews'])-1,'componentType':5126,'count':len(a),'type':'VEC3','min':a.min(0).tolist(),'max':a.max(0).tolist()});return len(d['accessors'])-1
  def box(parent,c,size,mat):
   c=np.array(c);s=np.array(size)/2;v=np.array([c+s*np.array(q)for q in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]);f=np.array([(0,2,1),(0,3,2),(4,5,6),(4,6,7),(0,1,5),(0,5,4),(3,7,6),(3,6,2),(0,4,7),(0,7,3),(1,2,6),(1,6,5)]);tri=v[f];norm=np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0]);norm/=np.linalg.norm(norm,axis=1)[:,None];d['meshes'].append({'name':'Union puerta45','primitives':[{'attributes':{'POSITION':accessor(tri.reshape(-1,3)),'NORMAL':accessor(np.repeat(norm,3,axis=0))},'material':mat}]});idx=len(d['nodes']);d['nodes'].append({'name':d['materials'][mat]['name'],'mesh':len(d['meshes'])-1,'extras':{'familia_visual':parent['name'],'revision_puerta':45}});parent.setdefault('children',[]).append(idx)
  leaves=[node for node in d['nodes']if node.get('name','').startswith('Puerta_S')and '__'not in node.get('name','')and 'mesh'not in node];assert len(leaves)==16
  for leaf in leaves:
   glass=next(d['nodes'][i]for i in leaf['children']if 'cristal'in d['nodes'][i].get('name','').lower());pr=d['meshes'][glass['mesh']]['primitives'][0];a=d['accessors'][pr['attributes']['POSITION']];t=np.array(glass.get('translation',[0,0,0]));lo=np.array(a['min'])+t;hi=np.array(a['max'])+t;cx=(lo[0]+hi[0])/2;cz=(lo[2]+hi[2])/2;low=lo[1]
   # Full-width opaque sill overlaps the existing panel and glass perimeter.
   box(leaf,[cx,low-.054,cz],[.68,.128,.054],steel)
   box(leaf,[cx,low+.007,cz],[.52,.014,.060],rubber)
  d['buffers'][0]['byteLength']=len(blob);j=json.dumps(d,separators=(',',':')).encode();j+=b' '*((-len(j))%4);blob.extend(b'\0'*((-len(blob))%4));out=struct.pack('<4sII',b'glTF',2,28+len(j)+len(blob))+struct.pack('<I4s',len(j),b'JSON')+j+struct.pack('<I4s',len(blob),b'BIN\0')+blob;p.write_bytes(out)
  if prefix=='NM22':Path('dist/models',stem+'.glb').write_bytes(out)
  else:Path('dist/models',stem+'.glb.gz').write_bytes(gzip.compress(out,9,mtime=0))
  print(stem,16,'uniones selladas')
