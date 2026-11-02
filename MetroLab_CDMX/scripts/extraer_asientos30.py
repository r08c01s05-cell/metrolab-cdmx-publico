import json,struct,numpy as np
from pathlib import Path
out={}
for p in Path('dist/models').glob('*.glb'):
 if not any(p.name.startswith(n) for n in ['NM22','NM79','MP82']):continue
 blob=p.read_bytes();n=struct.unpack_from('<I',blob,12)[0];d=json.loads(blob[20:20+n]);base=20+n+8;seats=[]
 if 'referencia39' in d.get('asset',{}).get('generator',''):
  out[p.stem]=json.loads(Path('dist/seat-layouts.json').read_text())[p.stem];continue
 def acc(i):
  a=d['accessors'][i];v=d['bufferViews'][a['bufferView']];count={'SCALAR':1,'VEC3':3}[a['type']];return np.frombuffer(blob,dtype={5126:'<f4',5125:'<u4',5123:'<u2'}[a['componentType']],count=a['count']*count,offset=base+v.get('byteOffset',0)+a.get('byteOffset',0)).reshape(-1,count)
 for node in d['nodes']:
  if 'asientos ' not in node.get('name','').lower():continue
  pr=d['meshes'][node['mesh']]['primitives'][0];v=acc(pr['attributes']['POSITION']).copy();q=node.get('rotation',[0,0,0,1]);qx,qy,qz,qw=q;R=np.array([[1-2*(qy*qy+qz*qz),2*(qx*qy-qz*qw),2*(qx*qz+qy*qw)],[2*(qx*qy+qz*qw),1-2*(qx*qx+qz*qz),2*(qy*qz-qx*qw)],[2*(qx*qz-qy*qw),2*(qy*qz+qx*qw),1-2*(qx*qx+qy*qy)]]);v=v@R.T+node.get('translation',[0,0,0]);ids=acc(pr['indices']).ravel() if 'indices' in pr else np.arange(len(v));keys={};parents=list(range(len(v)))
  def find(i):
   while parents[i]!=i:parents[i]=parents[parents[i]];i=parents[i]
   return i
  def union(a,b):parents[find(a)]=find(b)
  for i,xyz in enumerate(v):
   k=tuple(np.round(xyz,5));union(i,keys[k]) if k in keys else keys.update({k:i})
  for a,b,c in ids.reshape(-1,3):union(int(a),int(b));union(int(a),int(c))
  groups={}
  for i in range(len(v)):groups.setdefault(find(i),[]).append(i)
  for ix in groups.values():
   a=v[ix].min(0);z=v[ix].max(0);size=z-a
   if .3<size[0]<.75 and .25<size[2]<.85 and size[1]<.2 and 1.5<a[1]<1.8:
    c=(a+z)/2;seats.append({'x':round(float(c[0]),4),'z':round(float(c[2]),4),'height':round(float(z[1]),4)})
 out[p.stem]=sorted(seats,key=lambda s:(s['z'],s['x']));print(p.name,len(seats),seats[:2])
Path('dist/seat-layouts.json').write_text(json.dumps(out,separators=(',',':')))
