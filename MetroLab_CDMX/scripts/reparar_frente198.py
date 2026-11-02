"""Cierra el frente ausente del MP82. Adaptación visual ajustada al marco existente.
No cambia puertas, cabina, rodadura ni geometría anterior; no son cotas de fabricante.
"""
from pathlib import Path
import gzip, json, struct, math
ROOT = Path(__file__).resolve().parents[1]
p = ROOT / 'dist/models/MP82_cabina.glb.gz'
raw = gzip.decompress(p.read_bytes())
n = struct.unpack_from('<I', raw, 12)[0]
j = json.loads(raw[20:20+n])
if j['asset'].get('frontRepaired198'):
    print('Frente MP82 ya reparado; sin cambios.')
    raise SystemExit(0)
blob = bytearray(raw[28+n:])
root = len(j['nodes'])
j['nodes'].append({'name': 'MP82_frente198', 'children': [], 'extras': {'familia_visual': 'exterior', 'revision198': True, 'scope198': 'Adaptación visual del cierre ausente; no plano de fabricante.'}})
j['scenes'][j.get('scene', 0)]['nodes'].append(root)
def material(name, color, **kwargs):
    j['materials'].append({'name': name, 'pbrMetallicRoughness': {'baseColorFactor': color, 'metallicFactor': .1, 'roughnessFactor': .35}, **kwargs})
    return len(j['materials'])-1
paint = next(i for i,m in enumerate(j['materials']) if m.get('name') == 'Naranja esmalte')
trim = next(i for i,m in enumerate(j['materials']) if m.get('name') == 'Goma negra')
glass = material('Cristal frontal MP82 198', [.22,.32,.35,.18], alphaMode='BLEND', doubleSided=True)
light = material('Óptica frontal MP82 198', [.92,.93,.81,1], emissiveFactor=[.22,.22,.17])
red = material('Piloto frontal MP82 198', [.45,.03,.02,1])
def acc(values):
    blob.extend(b'\0'*(-len(blob)%4)); offset=len(blob)
    flat=[c for v in values for c in v]; data=struct.pack('<'+'f'*len(flat), *flat); blob.extend(data)
    j['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':len(data),'target':34962})
    j['accessors'].append({'bufferView':len(j['bufferViews'])-1,'componentType':5126,'count':len(values),'type':'VEC3','min':[min(v[a]for v in values)for a in range(3)],'max':[max(v[a]for v in values)for a in range(3)]})
    return len(j['accessors'])-1
def mesh(name, vertices, faces, mat):
    positions=[];normals=[]
    for f in faces:
        a,b,c=[vertices[i]for i in f];u=[b[i]-a[i]for i in range(3)];v=[c[i]-a[i]for i in range(3)];q=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];length=math.sqrt(sum(x*x for x in q));q=[x/length for x in q]
        positions.extend([a,b,c]);normals.extend([q]*3)
    j['meshes'].append({'name':name,'primitives':[{'attributes':{'POSITION':acc(positions),'NORMAL':acc(normals)},'material':mat}]})
    j['nodes'].append({'name':name,'mesh':len(j['meshes'])-1,'extras':{'familia_visual':'exterior','revision198':True}})
    j['nodes'][root]['children'].append(len(j['nodes'])-1)
def panel(name,y0,y1,z0,z1,mat,offset=0):
    x=lambda y:8.30-(y-1.18)*.11+offset
    mesh(name,[[x(y0),y0,z0],[x(y0),y0,z1],[x(y1),y1,z1],[x(y1),y1,z0]],[(0,2,1),(0,3,2)],mat)
panel('Frente_panel_inferior198',1.18,2.25,-1.22,1.22,paint)
panel('Frente_banda_superior198',3.35,3.57,-1.22,1.22,paint)
for side in [-1,1]:
    lo,hi=sorted([side*1.09,side*1.22]);panel('Frente_montante198_'+str(side),2.25,3.35,lo,hi,paint)
panel('Frente_junta_inferior198',2.25,2.30,-1.09,1.09,trim)
panel('Frente_junta_superior198',3.29,3.35,-1.09,1.09,trim)
for side in [-1,1]:
    lo,hi=sorted([side*1.04,side*1.09]);panel('Frente_junta_lateral198_'+str(side),2.30,3.29,lo,hi,trim)
    lo,hi=sorted([side*.025,side*1.04]);panel('Frente_parabrisas198_'+str(side),2.30,3.29,lo,hi,glass)
    z=side*.84;panel('Frente_bisel_faro198_'+str(side),1.52,1.79,z-.19,z+.19,trim,.006)
    panel('Frente_faro198_'+str(side),1.56,1.75,z-.145,z+.145,light,.008)
    z=side*1.06;panel('Frente_piloto198_'+str(side),1.99,2.07,z-.055,z+.055,red,.006)
panel('Frente_partelunas198',2.30,3.29,-.025,.025,trim,.003)
for i in range(4):
    y=1.48+i*.065;panel('Frente_rejilla198_'+str(i),y,y+.024,-.39,.39,trim,.006)
# Wipers are narrow strips in the glazing plane; no opaque sheet over the driver's view.
for side in [-1,1]:
    z=side*.53;panel('Frente_limpiaparabrisas198_'+str(side),2.33,2.70,z-.012,z+.012,trim,.009)
j['asset']['frontRepaired198']=True
j['buffers'][0]['byteLength']=len(blob)
encoded=json.dumps(j,ensure_ascii=False,separators=(',',':')).encode();encoded+=b' '*(-len(encoded)%4);blob.extend(b'\0'*(-len(blob)%4))
raw=struct.pack('<III',0x46546c67,2,28+len(encoded)+len(blob))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(blob),0x004e4942)+blob
p.write_bytes(gzip.compress(raw,compresslevel=9,mtime=0))
print('MP82: frente cerrado en +X; resto del modelo preservado.')
