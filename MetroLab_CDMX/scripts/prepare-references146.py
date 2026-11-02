from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import math,random,shutil
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision146';T=O/'texturas';T.mkdir(parents=True,exist_ok=True)
f='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
for title,unit,limit in [('voltaje','V CD',1000),('corriente','A CD',4000)]:
 im=Image.new('RGB',(256,256),'#e9e8df');d=ImageDraw.Draw(im);cx,cy=128,190
 for i in range(51):
  a=math.radians(180-i*3.6);r=105;l=15 if i%5==0 else 7
  d.line((cx+math.cos(a)*(r-l),cy-math.sin(a)*(r-l),cx+math.cos(a)*r,cy-math.sin(a)*r),fill='#202627',width=2 if i%5==0 else 1)
  if i%10==0:
   x=cx+math.cos(a)*73;y=cy-math.sin(a)*73;d.text((x,y),str(int(i*limit/50)),font=ImageFont.truetype(f,14),fill='#202627',anchor='mm')
 d.text((128,52),unit,font=ImageFont.truetype(f,22),fill='#202627',anchor='mm');d.text((128,232),'INDICADOR DIDACTICO',font=ImageFont.truetype(f,10),fill='#4a4a44',anchor='mm');im.save(T/(title+'.png'))
r=random.Random(146);im=Image.new('RGB',(64,64));im.putdata([(v,v,v)for v in [r.randrange(108,123)for _ in range(4096)]]);im.save(T/'rugosidad.png')

# Original references are preserved in assets-source/revision146/referencias.
