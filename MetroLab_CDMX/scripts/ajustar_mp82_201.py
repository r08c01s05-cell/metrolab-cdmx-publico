"""Frente MP-82 según la fotografía aportada: parabrisas único y ópticas redondas.
Adaptación visual sin cotas de fabricante. Conserva binario previo, rig y cabina.
"""
from pathlib import Path
import gzip,json,struct,math,io
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
p=ROOT/'dist/models/MP82_cabina.glb.gz';raw=gzip.decompress(p.read_bytes());n=struct.unpack_from('<I',raw,12)[0];j=json.loads(raw[20:20+n]);blob=bytearray(raw[28+n:])
if j['asset'].get('frontReference201'):
 print('MP82: referencia 201 ya aplicada.');raise SystemExit(0)
root=next(i for i,o in enumerate(j['nodes'])if o.get('name')=='MP82_frente198')
j['nodes'][root]['children']=[]
j['nodes'][root]['extras']['reference201']='Fotografía aportada por el usuario: MP-82, unidad visible 386. Proporciones visuales aproximadas.'
def material(name,color,metal=.1,rough=.4,**kwargs):
 j['materials'].append({'name':name,'pbrMetallicRoughness':{'baseColorFactor':color,'metallicFactor':metal,'roughnessFactor':rough},**kwargs});return len(j['materials'])-1
paint=next(i for i,m in enumerate(j['materials'])if m.get('name')=='Naranja esmalte')
trim=next(i for i,m in enumerate(j['materials'])if m.get('name')=='Goma negra')
steel=material('Marco metálico MP82 201',[.48,.53,.54,1],.7,.35)
glass=material('Parabrisas único MP82 201',[.09,.17,.20,.62],.12,.18,alphaMode='BLEND',doubleSided=True)
white=material('Óptica blanca circular MP82 201',[.77,.82,.76,1],.12,.25)
red=material('Piloto rojo circular MP82 201',[.55,.025,.018,1],.05,.3)
def acc(values,kind='VEC3'):
 blob.extend(b'\0'*(-len(blob)%4));offset=len(blob);flat=[c for v in values for c in v];blob.extend(struct.pack('<'+'f'*len(flat),*flat));j['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':len(flat)*4,'target':34962});j['accessors'].append({'bufferView':len(j['bufferViews'])-1,'componentType':5126,'count':len(values),'type':kind,'min':[min(v[a]for v in values)for a in range(len(values[0]))],'max':[max(v[a]for v in values)for a in range(len(values[0]))]});return len(j['accessors'])-1
def mesh(name,vertices,faces,mat,uv=None):
 positions=[];normals=[];tex=[]
 for f in faces:
  a,b,c=[vertices[i]for i in f];u=[b[i]-a[i]for i in range(3)];v=[c[i]-a[i]for i in range(3)];q=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];length=math.sqrt(sum(x*x for x in q));q=[x/length for x in q];positions.extend([a,b,c]);normals.extend([q]*3)
  if uv:tex.extend([uv[i]for i in f])
 attrs={'POSITION':acc(positions),'NORMAL':acc(normals)}
 if uv:attrs['TEXCOORD_0']=acc(tex,'VEC2')
 j['meshes'].append({'name':name,'primitives':[{'attributes':attrs,'material':mat}]});j['nodes'].append({'name':name,'mesh':len(j['meshes'])-1,'extras':{'familia_visual':'exterior','revision201':True}});j['nodes'][root]['children'].append(len(j['nodes'])-1)
def x(y,offset=0):return 8.30-(y-1.18)*.11+offset
def panel(name,y0,y1,z0,z1,mat,offset=0):mesh(name,[[x(y0,offset),y0,z0],[x(y0,offset),y0,z1],[x(y1,offset),y1,z1],[x(y1,offset),y1,z0]],[(0,2,1),(0,3,2)],mat)
def rounded(y0,y1,z0,z1,r,offset=0):return [[x(y,offset),y,z]for y,z in[(y0,z0+r),(y0,z1-r),(y0+r,z1),(y1-r,z1),(y1,z1-r),(y1,z0+r),(y1-r,z0),(y0+r,z0)]]
def face(name,poly,mat):mesh(name,poly,[(0,i+1,i)for i in range(1,len(poly)-1)],mat)
def ring(name,outer,inner,mat):mesh(name,outer+inner,[(i,(i+1)%8,8+i)for i in range(8)]+[((i+1)%8,8+(i+1)%8,8+i)for i in range(8)],mat)
# Continuous orange body surrounds a tall, single windscreen assembly.
panel('Frente_panel_inferior201',1.18,1.90,-1.22,1.22,paint)
panel('Frente_banda_superior201',3.43,3.69,-1.22,1.22,paint)
for side in[-1,1]:
 lo,hi=sorted([side*.99,side*1.22]);panel('Frente_montante201_'+str(side),1.90,3.43,lo,hi,paint)
outer=rounded(1.90,3.43,-.99,.99,.07,.004);inner=rounded(2.105,3.365,-.925,.925,.045,.009)
# The metal plate beneath the glass carries four round optics.
face('Frente_placa_opticas201',rounded(1.90,2.145,-.99,.99,.055,.005),steel)
ring('Frente_marco_metalico201',outer,inner,steel)
seal=rounded(2.12,3.35,-.91,.91,.04,.013)
ring('Frente_junta_unica201',inner,seal,trim)
face('Frente_parabrisas_unico201',seal,glass)
panel('Frente_destino_fondo201',3.17,3.33,-.85,.85,trim,-.018)
def optic(name,cy,cz,r,mat,offset):
 center=[x(cy,offset),cy,cz];verts=[center]+[[x(cy+r*math.cos(a),offset),cy+r*math.cos(a),cz+r*math.sin(a)]for a in[2*math.pi*i/32 for i in range(32)]];mesh(name,verts,[(0,i+1,(i+1)%32+1)for i in range(32)],mat)
for i,z in enumerate([-.76,-.29,.29,.76]):
 optic('Frente_bisel_circular201_'+str(i),2.015,z,.065,trim,.018)
 optic('Frente_optica_circular201_'+str(i),2.015,z,.045,red if i in[0,3]else white,.021)
# Two wiper arms over the same pane; no central mullion or lower grille.
for side in[-1,1]:
 z=side*.42;mesh('Frente_limpiaparabrisas201_'+str(side),[[x(2.15,.025),2.15,z-.012],[x(2.15,.025),2.15,z+.012],[x(2.67,.025),2.67,z+side*.22+.012],[x(2.67,.025),2.67,z+side*.22-.012]],[(0,2,1),(0,3,2)],trim)
def box(name,x0,x1,y0,y1,z0,z1,mat):
 vs=[[a,b,c]for a in[x0,x1]for b in[y0,y1]for c in[z0,z1]];mesh(name,vs,[(0,1,3),(0,3,2),(4,6,7),(4,7,5),(0,4,5),(0,5,1),(2,3,7),(2,7,6),(0,2,6),(0,6,4),(1,5,7),(1,7,3)],mat)
box('Frente_soporte_acoplador201',8.19,8.43,.72,1.24,-.20,.20,trim)
# Readable unit number copied from the supplied reference, not a brand.
im=Image.new('RGBA',(256,96));draw=ImageDraw.Draw(im);font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',72);draw.text((8,0),'386',font=font,fill=(239,238,216,255));out=io.BytesIO();im.save(out,format='PNG');data=out.getvalue();blob.extend(b'\0'*(-len(blob)%4));offset=len(blob);blob.extend(data);j['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':len(data)});j.setdefault('images',[]).append({'bufferView':len(j['bufferViews'])-1,'mimeType':'image/png','name':'Número unidad referencia201'});j.setdefault('textures',[]).append({'source':len(j['images'])-1});label=material('Rotulación unidad MP82 201',[1,1,1,1],0,.8,alphaMode='BLEND',doubleSided=True);j['materials'][label]['pbrMetallicRoughness']['baseColorTexture']={'index':len(j['textures'])-1}
mesh('Frente_numero_386201',[[x(y,.028),y,z]for y,z in[(1.49,-1.10),(1.49,-.65),(1.67,-.65),(1.67,-1.10)]],[(0,2,1),(0,3,2)],label,[[1,1],[0,1],[0,0],[1,0]])
# Close the existing roof/front gap and retain roof cutaway classification.
def roofpart():
 node=j['nodes'][root]['children'].pop();j['nodes'][node]['extras']['familia_visual']='roof';j['scenes'][j.get('scene',0)]['nodes'].append(node)
box('Techo_remate_frontal201',7.68,8.028,3.675,3.69,-1.22,1.22,paint);roofpart()
rib=material('Nervadura techo MP82 201',[.60,.25,.085,1],.15,.76)
for i in range(9):
 z=-.8+i*.2;box('Techo_nervadura201_'+str(i),-7.92,8.0,3.689,3.697,z-.007,z+.007,rib);roofpart()
j['asset']['frontReference201']=True;j['buffers'][0]['byteLength']=len(blob);encoded=json.dumps(j,ensure_ascii=False,separators=(',',':')).encode();encoded+=b' '*(-len(encoded)%4);blob.extend(b'\0'*(-len(blob)%4));raw=struct.pack('<III',0x46546c67,2,28+len(encoded)+len(blob))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(blob),0x004e4942)+blob;p.write_bytes(gzip.compress(raw,compresslevel=9,mtime=0));print('MP82 201: parabrisas único, marco, cuatro ópticas redondas y soporte del acoplador; cabina anterior conservada.')
