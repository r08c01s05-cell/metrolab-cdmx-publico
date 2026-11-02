"""Correct the four current L8 GLBs without rebuilding earlier doors/motors/locks."""
from pathlib import Path
import sys, json, gzip, hashlib
import numpy as np
from integrar_cerradura92 import read,write
root=Path(__file__).resolve().parents[1];report=[]
for model in ['NM79','MP82']:
 for unit in ['cabina','intermedio']:
  stem=model+'_'+unit;target=root/'dist/models'/f'{stem}.glb.gz';raw=gzip.decompress(target.read_bytes());d,blob=read(raw)
  if d['asset'].get('revision100'):raise RuntimeError('Already corrected: '+stem)
  Path('/tmp/metro100',stem+'.glb').write_bytes(raw)
  def values(i):
   a=d['accessors'][i];v=d['bufferViews'][a['bufferView']];n={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']];dt={5126:'<f4',5123:'<u2',5125:'<u4'}[a['componentType']]
   assert not v.get('byteStride'),'Packed accessor required'
   return np.frombuffer(blob,dtype=dt,count=a['count']*n,offset=v.get('byteOffset',0)+a.get('byteOffset',0)).reshape(-1,n).copy()
  def acc(a,kind):
   a=np.asarray(a,dtype='<f4');blob.extend(b'\0'*(-len(blob)%4));off=len(blob);blob.extend(a.tobytes());d['bufferViews'].append({'buffer':0,'byteOffset':off,'byteLength':a.nbytes,'target':34962});d['accessors'].append({'bufferView':len(d['bufferViews'])-1,'componentType':5126,'count':len(a),'type':kind,'min':a.min(0).tolist(),'max':a.max(0).tolist()});return len(d['accessors'])-1
  removed=0;hinges=0
  for node in d['nodes']:
   if node.get('name')!='Acero marco testero42':continue
   for pr in d['meshes'][node['mesh']]['primitives']:
    arrays={k:values(a) for k,a in pr['attributes'].items()};idx=values(pr['indices']).ravel() if 'indices'in pr else np.arange(len(arrays['POSITION']));t=idx.reshape(-1,3);verts=arrays['POSITION'][t]
    lever=(np.abs(verts[:,:,0])>7.50).all(1)&(verts[:,:,1]>2.04).all(1)&(verts[:,:,1]<2.13).all(1)&(verts[:,:,2]>.17).all(1)&(verts[:,:,2]<.34).all(1)
    removed+=int(lever.sum());keep=t[~lever].ravel()
    for key,a in list(arrays.items()):arrays[key]=a[keep]
    pos=arrays['POSITION'];hinge=(pos[:,0]>7.50)&(pos[:,2]<-.35)&(pos[:,2]>-.41)&(((pos[:,1]>1.53)&(pos[:,1]<1.63))|((pos[:,1]>2.75)&(pos[:,1]<2.85)));pos[hinge,2]+=.756;hinges+=int(hinge.sum())
    for key,a in arrays.items():pr['attributes'][key]=acc(a,d['accessors'][pr['attributes'][key]]['type'])
    pr.pop('indices',None)
  ends=[-1,1] if unit=='intermedio' else ([1] if model=='NM79' else [-1]);assert removed==24*len(ends),(stem,removed)
  panel=next(i for i,m in enumerate(d['materials']) if m.get('name')=='Panel testero marfil42')
  for side in ends:
   c=np.array([side*7.62,3.365,0]);r=np.array([.035,.105,1.19]);v=np.array([c+r*q for q in np.array([[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]])]);f=np.array([(0,2,1),(0,3,2),(4,5,6),(4,6,7),(0,1,5),(0,5,4),(3,7,6),(3,6,2),(0,4,7),(0,7,3),(1,2,6),(1,6,5)]);tri=v[f];norm=np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0]);norm/=np.linalg.norm(norm,axis=1)[:,None]
   d['meshes'].append({'primitives':[{'attributes':{'POSITION':acc(tri.reshape(-1,3),'VEC3'),'NORMAL':acc(np.repeat(norm,3,axis=0),'VEC3')},'material':panel}]});d['nodes'].append({'name':'Remate_superior_testero100','mesh':len(d['meshes'])-1,'extras':{'familia_visual':'interior','revision100':True,'endSide':side}});d['scenes'][d.get('scene',0)]['nodes'].append(len(d['nodes'])-1)
  # Reuse the embedded PBR textures already in the asset: no new image payloads.
  for node in d['nodes']:
   if node.get('name') not in ['Panel testero marfil42','Acero marco testero42','Remate_superior_testero100']:continue
   kind='steel' if node['name'].startswith('Acero') else 'panel'
   for pr in d['meshes'][node['mesh']]['primitives']:
    m=d['materials'][pr['material']];pbr=m['pbrMetallicRoughness']
    for label in ['color','rough','normal']:
     image=next((i for i,x in enumerate(d.get('images',[])) if x.get('name')==kind+'_'+label+'_41'),None);tex=next((i for i,x in enumerate(d.get('textures',[])) if x.get('source')==image),None) if image is not None else None
     if tex is None:continue
     if label=='normal':m['normalTexture']={'index':tex,'scale':.11}
     else:pbr['baseColorTexture' if label=='color' else 'metallicRoughnessTexture']={'index':tex}
    p=values(pr['attributes']['POSITION']);pr['attributes']['TEXCOORD_0']=acc(p[:,[2,1]]*4,'VEC2');pbr['roughnessFactor']=1
  d['asset']['revision100']='Previous duplicate levers removed; opposite hinges; closed upper end-wall; embedded PBR reused.'
  out=write(d,blob);target.write_bytes(gzip.compress(out,9,mtime=0));(root/'assets-source/trenes'/f'{stem}.glb').write_bytes(out);report.append({'model':stem,'oldLeverTrianglesRemoved':removed,'hingeVerticesMoved':hinges,'ends':ends,'sha256':hashlib.sha256(out).hexdigest()})
(root/'dist/documentacion/interiores100.json').write_text(json.dumps(report,separators=(',',':')))
print(report)
