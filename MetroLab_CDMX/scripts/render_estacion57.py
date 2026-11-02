"""Vista técnica CPU del GLB. No sustituye validación del render WebGL/PBR."""
from pathlib import Path
import sys,json,io,struct,subprocess
import numpy as np
from PIL import Image
from estaciones48 import GLB
D=Path(__file__).resolve().parents[1]/'dist'
def export(stid,out,eye_coords=None,target_coords=None):
 s=next(s for s in json.loads((D/'datos.json').read_text())['estaciones']if s['id']==stid);g=GLB((D/s['geometria_3d']['url_glb'].split('?')[0]).read_bytes());j=g.j
 eye=np.array(eye_coords if eye_coords else [-34.,2.90,-5.55]);target=np.array(target_coords if target_coords else [10.,3.0,-7.5]);f=target-eye;f/=np.linalg.norm(f);right=np.cross(f,[0,1,0]);right/=np.linalg.norm(right);up=np.cross(right,f);cam=np.array([right,up,f]);tris=[]
 from estaciones48 import matrix
 for i in j['scenes'][0]['nodes']:
  n=j['nodes'][i]
  if'mesh'not in n:continue
  m=matrix(n)
  for pr in j['meshes'][n['mesh']]['primitives']:
   a=pr['attributes'];p=g.array(a['POSITION'])@m[:3,:3].T+m[:3,3];v=(p-eye)@cam.T;ids=g.array(pr['indices']).astype(int).ravel()if'indices'in pr else np.arange(len(v));ids=ids.reshape(-1,3);uv=g.array(a['TEXCOORD_0'])if'TEXCOORD_0'in a else np.zeros((len(v),2));norm=g.array(a['NORMAL'])@np.linalg.inv(m[:3,:3]);norm/=np.maximum(np.linalg.norm(norm,axis=1)[:,None],1e-9)
   # Soft technical lighting only; surfaces are not lit with a fabricated AO texture.
   shade=.78+.22*np.abs(norm[:,1]);shade+=.04*np.maximum(norm[:,2],0)
   attr=np.c_[v,uv,shade];alltri=attr[ids];inside=(alltri[:,:,2]>=.08);t=list(alltri[inside.all(axis=1)])
   for tri in alltri[inside.any(axis=1)&~inside.all(axis=1)]:
    poly=[]
    for vi in range(3):
     a=tri[vi];b=tri[(vi+1)%3];ia=a[2]>=.08;ib=b[2]>=.08
     if ia:poly.append(a)
     if ia!=ib:poly.append(a+(b-a)*((.08-a[2])/(b[2]-a[2])))
    for vi in range(1,len(poly)-1):t.append(np.array([poly[0],poly[vi],poly[vi+1]]))
   if t:
    t=np.array(t);mi=np.full((len(t),1),pr['material']);tris.append(np.c_[mi,t.reshape(-1,18)])
 t=np.concatenate(tris).astype('<f4');raw=bytearray(struct.pack('<II',len(j['materials']),len(t)))
 for mat in j['materials']:
  p=mat.get('pbrMetallicRoughness',{});c=p.get('baseColorFactor',[1,1,1,1])[:3];tex=p.get('baseColorTexture')
  if tex:
   im=j['images'][j['textures'][tex['index']]['source']];v=j['bufferViews'][im['bufferView']];img=Image.open(io.BytesIO(g.b[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']])).convert('RGB');img.thumbnail((512,512));a=np.array(img)
  else:a=np.ones((1,1,3),dtype=np.uint8)*255
  raw.extend(struct.pack('<IIfff',a.shape[1],a.shape[0],*c));raw.extend(a.tobytes())
 raw.extend(t.tobytes());Path(out).write_bytes(raw)
if __name__=='__main__':export(sys.argv[1],sys.argv[2])
