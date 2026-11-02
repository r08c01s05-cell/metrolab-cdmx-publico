from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,struct,io,hashlib
D=Path(__file__).resolve().parents[1]/'dist';data=json.loads((D/'datos.json').read_text());route=json.loads((D/'recorrido_L1.json').read_text());stations=sorted([s for s in data['estaciones'] if s['linea']==1],key=lambda s:s['orden'],reverse=True)
im=Image.new('RGB',(1800,800),'#faf8f5');dr=ImageDraw.Draw(im);font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';f=ImageFont.truetype(font,23);fb=ImageFont.truetype(font,34);small=ImageFont.truetype(font,17)
dr.text((50,25),'LÍNEA 1 · OBSERVATORIO — PANTITLÁN',font=fb,fill='#b62770');pts=[(route['stations'][s['id']][0]*1.95+20,route['stations'][s['id']][1]*1.25+75) for s in stations];dr.line(pts,fill='#d64d93',width=14)
for i,(s,p) in enumerate(zip(stations,pts)):
 dr.ellipse((p[0]-15,p[1]-15,p[0]+15,p[1]+15),fill='white',outline='#b62770',width=2);dr.text((p[0],p[1]),str(i+1),font=small,anchor='mm',fill='#252b34')
 x=50+(i%5)*350;y=515+(i//5)*55;name=s['nombre'];dr.text((x,y),str(i+1)+'. '+name,font=f if len(name)<23 else small,fill='#252b34')
dr.text((50,765),'Esquema del usuario · sin escala geográfica',font=small,fill='#59616b');im.save(D/'textures/revision18/recorrido_linea1.jpg',quality=90)
f=io.BytesIO();im.resize((1200,533)).save(f,format='JPEG',quality=82,optimize=True);raw=f.getvalue();new=raw+b'\0'*((-len(raw))%4)
for p in (D/'models/andenes/L1').glob('*.glb'):
 b=p.read_bytes();n=struct.unpack_from('<I',b,12)[0];j=json.loads(b[20:20+n]);binary=bytearray(b[28+n:]);img=next(x for x in j['images'] if x.get('name')=='Recorrido L1 aportado');v=j['bufferViews'][img['bufferView']];off=v['byteOffset'];oldlen=v['byteLength'];padded=(oldlen+3)//4*4;delta=len(new)-padded;binary[off:off+padded]=new
 for bv in j['bufferViews']:
  if bv.get('byteOffset',0)>off:bv['byteOffset']+=delta
 v['byteLength']=len(raw);j['buffers'][0]['byteLength']=len(binary);jj=json.dumps(j,ensure_ascii=False,separators=(',',':')).encode();jj+=b' '*((-len(jj))%4);p.write_bytes(struct.pack('<III',0x46546c67,2,28+len(jj)+len(binary))+struct.pack('<II',len(jj),0x4e4f534a)+jj+struct.pack('<II',len(binary),0x004e4942)+binary)
r=json.loads((D/'docs/Revision_estaciones_18.json').read_text())
for s in r['estaciones']:
 p=D/s['glb'];s['sha256']=hashlib.sha256(p.read_bytes()).hexdigest();s['bytes']=p.stat().st_size
(D/'docs/Revision_estaciones_18.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
