"""Web-only float precision reduction (1 micrometre positions, 1e-4 normals/UV).
Canonical Blender GLBs and editable scenes remain unchanged.
"""
from pathlib import Path
import json,struct,gzip
try:
 from zopfli.gzip import compress as encode
except ImportError:
 def encode(data,**kwargs):return gzip.compress(data,9,mtime=0)
root=Path(__file__).resolve().parents[1]
for id in ['diodes','insulation','relay']:
 raw=(root/f'assets-source/subestaciones129/{id}.glb').read_bytes();length=struct.unpack_from('<I',raw,12)[0];j=json.loads(raw[20:20+length]);start=28+length;b=bytearray(raw[start:]);seen=set()
 for mesh in j['meshes']:
  for prim in mesh['primitives']:
   for role,ai in prim['attributes'].items():
    if role not in ['POSITION','NORMAL','TEXCOORD_0']:continue
    a=j['accessors'][ai]
    if a['componentType']!=5126 or ai in seen:continue
    seen.add(ai);v=j['bufferViews'][a['bufferView']];n={'VEC2':2,'VEC3':3}[a['type']];stride=v.get('byteStride',n*4);off=v.get('byteOffset',0)+a.get('byteOffset',0);digits=6 if role=='POSITION' else 4;mins=[float('inf')]*n;maxs=[-float('inf')]*n
    for i in range(a['count']):
     for k in range(n):
      p=off+i*stride+k*4;x=round(struct.unpack_from('<f',b,p)[0],digits);struct.pack_into('<f',b,p,x);mins[k]=min(mins[k],x);maxs[k]=max(maxs[k],x)
    if 'min'in a:a['min']=mins;a['max']=maxs
 j.setdefault('asset',{}).setdefault('extras',{})['webPrecision129']='Positions 1um; normals and UV 1e-4. Canonical Blender export preserved.';s=json.dumps(j,separators=(',',':')).encode();s+=b' '*((-len(s))%4);out=struct.pack('<III',0x46546c67,2,28+len(s)+len(b))+struct.pack('<II',len(s),0x4e4f534a)+s+struct.pack('<II',len(b),0x004e4942)+b;z=encode(out,numiterations=5);(root/f'dist/models/subestaciones129/{id}.glb.gz').write_bytes(z);print(id,len(z))
