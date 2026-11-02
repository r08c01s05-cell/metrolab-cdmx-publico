"""Reference-led pass: doors and seat anchor coordinates remain authoritative."""
from pathlib import Path
import json,gzip,copy,subprocess
import numpy as np
from estaciones48 import GLB
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision157';ns={'__file__':str(R/'scripts/integrate-trains140.py')};exec((R/'scripts/integrate-trains140.py').read_text().split('parts,pbin=')[0],ns);read,write,graft,compact=[ns[k]for k in ['read','write','graft','compact']];P,PB=read((O/'asiento-L8-157.glb').read_bytes());report=[]
rng=np.random.default_rng(157);n=256;grain=rng.normal(0,1.2,(n,n));normal=np.zeros((n,n,3));normal[:]=[128,128,255];normal[:,:,:2]+=rng.normal(0,.65,(n,n,2));rough=np.full((n,n,3),255.);rough[:,:,1]=rng.integers(180,205,(n,n));rough[:,:,2]=0
for model in ['NM22','NM79','MP82']:
 for unit in ['cabina','intermedio']:
  stem=model+'_'+unit;path=R/f'dist/models/{stem}.glb.gz';d,b=read(gzip.decompress(subprocess.check_output(['git','show','HEAD:'+str(path.relative_to(R))],cwd=R)));leaves=copy.deepcopy([n for n in d['nodes']if n.get('name','').startswith('Puerta_S')]);anim=copy.deepcopy(d.get('animations',[]));anchors=[i for i,n in enumerate(d['nodes'])if 'seatIndex147'in n.get('extras',{})];replaced=0
  if model!='NM22':
   off=graft(d,b,P,PB);proto=next(i for i in range(off['nodes'],len(d['nodes']))if d['nodes'][i].get('name')=='Asiento_L8_157')
   def clone(i):
    n=copy.deepcopy(d['nodes'][i]);ch=n.pop('children',[]);idx=len(d['nodes']);n.setdefault('extras',{}).update(familia_visual='interior',revision157=True);d['nodes'].append(n)
    if ch:n['children']=[clone(c)for c in ch]
    return idx
   for i in anchors:d['nodes'][i]['children']=[clone(c)for c in d['nodes'][proto].get('children',[])];d['nodes'][i]['extras']['revision157']=True;replaced+=1
  g=GLB(write(d,b));j=g.j;basecol=np.array([105,109,107]if model=='NM22'else[111,119,112]);floor=np.repeat(grain[:,:,None],3,axis=2)+basecol
  for _ in range(1900):x,y=rng.integers(0,n,2);floor[y,x]+=rng.choice([-1,1])*rng.uniform(5,16)
  ft=g.texture('Piso antideslizante157_'+model,floor);nt=g.texture('Microrelieve moldeado157',normal);rt=g.texture('Rugosidad suelo157',rough);floors=set();changed=[]
  for mi,m in enumerate(j['materials']):
   name=m.get('name','').lower();p=m.setdefault('pbrMetallicRoughness',{})
   if 'piso'in name and any(q in name for q in ['gris','antideslizante']):p.update(baseColorFactor=[1,1,1,1],baseColorTexture={'index':ft},metallicFactor=0,roughnessFactor=1,metallicRoughnessTexture={'index':rt});m['normalTexture']={'index':nt,'scale':.10};floors.add(mi);changed.append(m['name'])
   if any(q in name for q in ['banca marfil','polimero verde moldeado','borde naranja asiento']):m['normalTexture']={'index':nt,'scale':.08};p['roughnessFactor']=.31 if model!='NM22'else .41;p['metallicFactor']=0;changed.append(m['name'])
   if 'cristal'in name:p['baseColorFactor']=[.72,.78,.75,.13];p['roughnessFactor']=.12;changed.append(m['name'])
  for mesh in j['meshes']:
   for pr in mesh['primitives']:
    mi=pr.get('material',-1);name=j['materials'][mi].get('name','').lower()
    if mi not in floors and not any(q in name for q in ['banca marfil','polimero verde moldeado','borde naranja asiento']):continue
    xyz=g.array(pr['attributes']['POSITION']);uv=xyz[:,[0,2]]/(.5 if mi in floors else .15)
    if mi not in floors:uv[:,1]+=xyz[:,1]/.15
    pr['attributes']['TEXCOORD_0']=g.acc(uv,'VEC2')
  j['asset']['revision157']=True;j['asset']['scope157']='Comparacion fotografica: L1 longitudinal marfil/naranja, L8 verde transversal. Adaptacion visual, no planos de fabricante.'
  assert [n for n in j['nodes']if n.get('name','').startswith('Puerta_S')]==leaves;assert j.get('animations',[])==anim
  d,b=compact(j,g.b);raw=write(d,b);path.write_bytes(gzip.compress(raw,9,mtime=0));(O/(stem+'.glb')).write_bytes(raw);(R/'assets-source/trenes'/(stem+'.glb')).write_bytes(raw)
  row={'asset':stem,'replacementSeats':replaced,'doorLeavesPreserved':len(leaves),'animationsPreserved':len(anim),'materials':changed,'floorTileMetres':.5,'bytes':path.stat().st_size};report.append(row);print(json.dumps(row),flush=True)
(O/'auditoria-interiores157.json').write_text(json.dumps(report,indent=2,ensure_ascii=False));(R/'dist/documentacion/auditoria-interiores157.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))
