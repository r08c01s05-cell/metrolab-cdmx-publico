import json,struct
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'assets-source/trenes/MP82_cabina.glb';raw=p.read_bytes();n=struct.unpack_from('<I',raw,12)[0];j=json.loads(raw[20:20+n]);b=bytearray(raw[28+n:]);types={5120:('b',1),5121:('B',1),5122:('h',2),5123:('H',2),5125:('I',4),5126:('f',4)};dims={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def rows(ai):
 a=j['accessors'][ai];v=j['bufferViews'][a['bufferView']];fmt,size=types[a['componentType']];count=dims[a['type']];off=v.get('byteOffset',0)+a.get('byteOffset',0);stride=v.get('byteStride',size*count);return [bytes(b[off+i*stride:off+i*stride+size*count]) for i in range(a['count'])]
def append(ai,data):
 a=dict(j['accessors'][ai]);payload=b''.join(data);b.extend(b'\0'*((-len(b))%4));v=len(j['bufferViews']);j['bufferViews'].append({'buffer':0,'byteOffset':len(b),'byteLength':len(payload)});b.extend(payload);a['bufferView']=v;a['byteOffset']=0;a['count']=len(data);a.pop('min',None);a.pop('max',None);j['accessors'].append(a);return len(j['accessors'])-1
for mesh in j['meshes']:
 for prim in mesh['primitives']:
  if 'indices' not in prim:continue
  ai=prim['indices'];a=j['accessors'][ai];fmt,size=types[a['componentType']];ids=[struct.unpack('<'+fmt,row)[0] for row in rows(ai)];used=sorted(set(ids));mapping={v:i for i,v in enumerate(used)}
  for role,x in list(prim['attributes'].items()):
   data=rows(x);prim['attributes'][role]=append(x,[data[i] for i in used])
  prim['indices']=append(ai,[struct.pack('<'+fmt,mapping[i]) for i in ids])
j.pop('animations',None);j['buffers'][0]['byteLength']=len(b);s=json.dumps(j,separators=(',',':')).encode();s+=b' '*((-len(s))%4);Path('/tmp/MP82-compact130.glb').write_bytes(struct.pack('<III',0x46546c67,2,28+len(s)+len(b))+struct.pack('<II',len(s),0x4e4f534a)+s+struct.pack('<II',len(b),0x004e4942)+b)
