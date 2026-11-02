"""Reachable vertical posts for the existing NM22 standing passenger positions."""
from pathlib import Path
import json,struct,math
import numpy as np
for kind in ['cabina','intermedio']:
 p=Path('assets-source/trenes','NM22_'+kind+'.glb');base=Path('assets-source/trenes/base46',p.name);base.parent.mkdir(exist_ok=True)
 if not base.exists():base.write_bytes(p.read_bytes())
 b=base.read_bytes();n=struct.unpack_from('<I',b,12)[0];d=json.loads(b[20:20+n]);blob=bytearray(b[28+n:]);positions=[];normals=[]
 for i,x in enumerate([-4.1,-.1,3.9,-3.3,.7]):
  z=(1 if i%2 else -1)*.32
  for radius,y0,y1 in [(.017,1.23,3.36),(.034,1.225,1.24),(.030,3.35,3.375)]:
   ring=16
   for j in range(ring):
    a=j*math.tau/ring;c=(j+1)*math.tau/ring;v=np.array([[x+radius*math.cos(t),y,z+radius*math.sin(t)]for y,t in [(y0,a),(y0,c),(y1,c),(y1,a)]]);f=np.array([(0,2,1),(0,3,2)]);tri=v[f];normal=np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0]);normal/=np.linalg.norm(normal,axis=1)[:,None];positions.extend(tri.reshape(-1,3));normals.extend(np.repeat(normal,3,axis=0))
 def acc(a):
  a=np.asarray(a,dtype='<f4');blob.extend(b'\0'*((-len(blob))%4));off=len(blob);blob.extend(a.tobytes());d['bufferViews'].append({'buffer':0,'byteOffset':off,'byteLength':a.nbytes,'target':34962});d['accessors'].append({'bufferView':len(d['bufferViews'])-1,'componentType':5126,'count':len(a),'type':'VEC3','min':a.min(0).tolist(),'max':a.max(0).tolist()});return len(d['accessors'])-1
 d['materials'].append({'name':'Pasamanos funcionales46','pbrMetallicRoughness':{'baseColorFactor':[.50,.55,.56,1],'metallicFactor':.85,'roughnessFactor':.30}});d['meshes'].append({'name':'Pasamanos46','primitives':[{'attributes':{'POSITION':acc(positions),'NORMAL':acc(normals)},'material':len(d['materials'])-1}]});d['nodes'].append({'name':'Pasamanos46','mesh':len(d['meshes'])-1,'extras':{'familia_visual':'interior','revision_pasamanos':46}});d['scenes'][d.get('scene',0)]['nodes'].append(len(d['nodes'])-1);d['buffers'][0]['byteLength']=len(blob);j=json.dumps(d,separators=(',',':')).encode();j+=b' '*((-len(j))%4);blob.extend(b'\0'*((-len(blob))%4));out=struct.pack('<4sII',b'glTF',2,28+len(j)+len(blob))+struct.pack('<I4s',len(j),b'JSON')+j+struct.pack('<I4s',len(blob),b'BIN\0')+blob;p.write_bytes(out);Path('dist/models',p.name).write_bytes(out)
