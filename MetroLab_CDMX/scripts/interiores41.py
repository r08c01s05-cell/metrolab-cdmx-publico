"""Detailed PBR interiors, embedded textures, original door and seat coordinates."""
from pathlib import Path
import json,struct,gzip,math,io
import numpy as np
from PIL import Image
rng=np.random.default_rng(4101)
textures={}
for kind in ['floor','plastic','panel','steel']:
 size=256; noise=rng.normal(0,1,(size,size));
 if kind=='floor':
  tone=np.clip(184+noise*10,145,215);rough=np.clip(219+noise*6,195,240)
 elif kind=='steel':
  lines=rng.normal(0,4,(size,1));tone=np.clip(225+lines+noise*1.2,208,241);rough=np.clip(128+lines*2,95,160)
 else:
  tone=np.clip(242+noise*(1.8 if kind=='panel' else 3.0),228,250);rough=np.clip((195 if kind=='panel' else 153)+noise*4,130,215)
 # A tileable height gradient produces small, restrained surface relief.
 height= (tone-tone.mean())/255;dx=(np.roll(height,-1,1)-np.roll(height,1,1))*.8;dy=(np.roll(height,-1,0)-np.roll(height,1,0))*.8
 normal=np.stack([-dx,-dy,np.ones_like(dx)],-1);normal/=np.linalg.norm(normal,axis=-1)[...,None]
 images=[np.repeat(tone[...,None],3,2),np.stack([np.full_like(rough,255),rough,np.full_like(rough,255 if kind=='steel' else 0)],-1),(normal*.5+.5)*255]
 for label,data in zip(['color','rough','normal'],images):
  out=io.BytesIO();Image.fromarray(data.astype('uint8')).save(out,format='PNG');textures[kind,label]=out.getvalue()

for stem in ['NM22_cabina','NM22_intermedio','NM79_cabina','NM79_intermedio','MP82_cabina','MP82_intermedio']:
 raw=Path('dist/models',stem+'.glb');compressed=Path(str(raw)+'.gz');src=Path('assets-source/trenes',stem+'.glb')
 # Repeated runs start at the previous revision, not the generated revision.
 baseline=Path('assets-source/trenes/base41',stem+'.glb');baseline.parent.mkdir(parents=True,exist_ok=True)
 if not baseline.exists():baseline.write_bytes(raw.read_bytes() if raw.exists() else gzip.decompress(compressed.read_bytes()))
 b=baseline.read_bytes();ln=struct.unpack_from('<I',b,12)[0];d=json.loads(b[20:20+ln]);blob=bytearray(b[28+ln:]);d.setdefault('images',[]);d.setdefault('textures',[]);d.setdefault('samplers',[]);sampler=len(d['samplers']);d['samplers'].append({'magFilter':9729,'minFilter':9987,'wrapS':10497,'wrapT':10497})
 def view(data,target=None):
  blob.extend(b'\0'*((-len(blob))%4));off=len(blob);blob.extend(data);v={'buffer':0,'byteOffset':off,'byteLength':len(data)}
  if target:v['target']=target
  d['bufferViews'].append(v);return len(d['bufferViews'])-1
 def acc(a,typ):
  a=np.asarray(a,dtype='<f4');v=view(a.tobytes(),34962);d['accessors'].append({'bufferView':v,'componentType':5126,'count':len(a),'type':typ,'min':a.min(0).tolist(),'max':a.max(0).tolist()});return len(d['accessors'])-1
 def values(index):
  a=d['accessors'][index];v=d['bufferViews'][a['bufferView']];components={'VEC2':2,'VEC3':3,'VEC4':4}[a['type']];return np.frombuffer(blob,dtype='<f4',count=a['count']*components,offset=v.get('byteOffset',0)+a.get('byteOffset',0)).reshape(-1,components).copy()
 maps={}
 for (kind,label),data in textures.items():
  d['images'].append({'name':kind+'_'+label+'_41','mimeType':'image/png','bufferView':view(data)});d['textures'].append({'source':len(d['images'])-1,'sampler':sampler});maps[kind,label]={'index':len(d['textures'])-1}
 material_cache={}
 def detailed_material(original,kind):
  key=(original,kind)
  if key not in material_cache:
   m=json.loads(json.dumps(d['materials'][original]));m['name']+=' PBR41';p=m.setdefault('pbrMetallicRoughness',{});p['baseColorTexture']=maps[kind,'color'];p['metallicRoughnessTexture']=maps[kind,'rough'];p['roughnessFactor']=1.;p['metallicFactor']=.88 if kind=='steel' else 0;m['normalTexture']={**maps[kind,'normal'],'scale':.28 if kind=='floor' else .13};d['materials'].append(m);material_cache[key]=len(d['materials'])-1
  return material_cache[key]
 for n in d['nodes']:
  if 'mesh'not in n:continue
  name=n.get('name','');family=n.get('extras',{}).get('familia_visual','')
  if not (name.startswith(('interior__','Asiento39_','Respaldo39_','Panel ','Cielo ','Poste ','Barra ','Soporte ')) or family=='roof' or name.startswith('Puerta_')):continue
  for pr in d['meshes'][n['mesh']]['primitives']:
   mname=d['materials'][pr['material']]['name'].lower();kind='floor' if 'piso'in mname else 'plastic' if 'asiento'in mname else 'panel' if 'marfil'in mname else 'steel' if any(x in mname for x in ['acero','pasamanos','pulido']) else None
   if not kind:continue
   pos=values(pr['attributes']['POSITION']);norm=values(pr['attributes']['NORMAL']);dominant=np.argmax(np.abs(norm),axis=1);uv=np.zeros((len(pos),2))
   for axis,coords in [(0,[2,1]),(1,[0,2]),(2,[0,1])]:uv[dominant==axis]=pos[dominant==axis][:,coords]*(2 if kind=='floor' else 4)
   pr['attributes']['TEXCOORD_0']=acc(uv,'VEC2');pr['material']=detailed_material(pr['material'],kind)
   if name.startswith(('Asiento39_','Respaldo39_')):
    # Smooth duplicated triangle vertices on the rounded moulded panels.
    _,inverse=np.unique(np.round(pos,5),axis=0,return_inverse=True);summed=np.zeros((inverse.max()+1,3));np.add.at(summed,inverse,norm);summed/=np.maximum(np.linalg.norm(summed,axis=1)[:,None],1e-9);pr['attributes']['NORMAL']=acc(summed[inverse],'VEC3')
 def mat(name,color,metal=0,rough=.7):
  d['materials'].append({'name':name,'pbrMetallicRoughness':{'baseColorFactor':color+[1],'metallicFactor':metal,'roughnessFactor':rough}});return len(d['materials'])-1
 steel=mat('Herrajes interiores41',[.48,.52,.53],.85,.34);rubber=mat('Juntas interiores41',[.025,.028,.025],0,.95);cream=mat('Ventilacion marfil41',[.67,.68,.62]);dark=mat('Ranuras ventilacion41',[.045,.049,.043]);light=mat('Difusor luz41',[.9,.91,.82]);d['materials'][light]['emissiveFactor']=[.28,.29,.25]
 buckets={}
 def geometry(name,v,faces,material,family='interior'):
  v=np.asarray(v);faces=np.asarray(faces);tri=v[faces];norm=np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0]);norm/=np.maximum(np.linalg.norm(norm,axis=1)[:,None],1e-9)
  bucket=buckets.setdefault((material,family),[[],[]]);bucket[0].extend(tri.reshape(-1,3));bucket[1].extend(np.repeat(norm,3,axis=0))
 def box(c,size,material,family='interior'):
  c=np.array(c);s=np.array(size)/2;v=[c+s*np.array(q) for q in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]];f=[(0,2,1),(0,3,2),(4,5,6),(4,6,7),(0,1,5),(0,5,4),(3,7,6),(3,6,2),(0,4,7),(0,7,3),(1,2,6),(1,6,5)];geometry('box',v,f,material,family)
 def screw(x,y,z,side):
  count=8;v=[[x,y,z]]+[[x+.010*math.cos(t),y+.010*math.sin(t),z]for t in np.arange(count)*math.tau/count];f=[(0,i+1,(i+1)%count+1)if side<0 else(0,(i+1)%count+1,i+1)for i in range(count)];geometry('tornillo',v,f,steel);box([x,y,z-side*.002],[.012,.002,.002],dark)
 doorx=sorted({round(n.get('translation',[0])[0],3)for n in d['nodes']if n.get('name','').startswith('Puerta_S1_')and '__'not in n['name']});centers=sorted({round((a+b)/2,3)for a,b in zip(doorx,doorx[1:])if b-a>1.5})
 # Use actual leaf pairs to determine centers, preserving existing portals.
 names={n.get('name'):n for n in d['nodes']};doorx=sorted([(names[f'Puerta_S1_{i}_Hoja_-1']['translation'][0]+names[f'Puerta_S1_{i}_Hoja_1']['translation'][0])/2 for i in range(1,5)]);centers=[(a+b)/2 for a,b in zip(doorx,doorx[1:])]
 for x in doorx:
  for side in [-1,1]:
   # Side liners stay beyond the existing doorway; header above leaf height.
   for dx in [-.79,.79]:
    box([x+dx,2.20,side*1.185],[.027,1.90,.018],steel)
    for y in [1.42,2.12,3.00]:screw(x+dx,y,side*1.172,side)
   box([x,3.235,side*1.18],[1.52,.035,.025],steel,'roof')
   box([x,1.229,side*1.10],[1.43,.018,.20],steel)
   for dx in [-.50,-.25,0,.25,.50]:box([x+dx,1.239,side*1.10],[.003,.001,.17],rubber)
 for c in centers:
  # Ceiling vent frames, individual slats and a recessed dark cavity.
  box([c,3.215,0],[.72,.027,.46],cream,'roof');box([c,3.196,0],[.63,.010,.36],dark,'roof')
  for offset in np.linspace(-.28,.28,15):box([c+offset,3.187,0],[.012,.012,.35],cream,'roof')
  for side in [-1,1]:
   box([c,3.19,side*.92],[2.50,.032,.20],steel,'roof');box([c,3.167,side*.92],[2.40,.013,.16],light,'roof')
   # Floor joints and edge coves are restrained, not high-contrast stripes.
   box([c,1.254,side*.83],[.005,.001,.57],rubber)
   box([c,1.255,side*1.158],[2.22,.018,.032],rubber)
   for dx in [-1.06,1.06]:
    for y in [1.32,1.61]:screw(c+dx,y,side*1.17,side)
 for (material,family),(positions,normals)in buckets.items():
  d['meshes'].append({'name':'Detalle41_'+family,'primitives':[{'attributes':{'POSITION':acc(positions,'VEC3'),'NORMAL':acc(normals,'VEC3')},'material':material}]});d['nodes'].append({'name':'Detalle41_'+family,'mesh':len(d['meshes'])-1,'extras':{'familia_visual':family,'revision_interior':41}});d['scenes'][d.get('scene',0)]['nodes'].append(len(d['nodes'])-1)
 d['buffers'][0]['byteLength']=len(blob);d['asset']['generator']='Interiores PBR41, medidas aproximadas; compatible Blender';encoded=json.dumps(d,separators=(',',':')).encode();encoded+=b' '*((-len(encoded))%4);blob.extend(b'\0'*((-len(blob))%4));out=struct.pack('<4sII',b'glTF',2,28+len(encoded)+len(blob))+struct.pack('<I4s',len(encoded),b'JSON')+encoded+struct.pack('<I4s',len(blob),b'BIN\0')+blob
 src.parent.mkdir(parents=True,exist_ok=True);src.write_bytes(out)
 if stem.startswith('NM22'):raw.write_bytes(out)
 else:compressed.write_bytes(gzip.compress(out,9,mtime=0))
 print(stem,'textures',len(d['images']),'detail_batches',len(buckets),'bytes',len(out))
