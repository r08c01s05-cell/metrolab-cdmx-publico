from pathlib import Path
import sys,math
sys.path.extend(['/usr/lib/python3.12/lib-dynload','/opt/codex/runtimes/codex-primary-runtime/dependencies/python/lib/python3.12/site-packages'])
import bpy
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision157';O.mkdir(exist_ok=True)
ns={'__file__':str(R/'scripts/build-rolling147.py')};exec((R/'scripts/build-rolling147.py').read_text().split('# A single, watertight')[0],ns)
mat,root,box,tube,mesh,cyl,steel,dark,green=[ns[k]for k in ['mat','root','box','tube','mesh','cyl','steel','dark','green']]
green.name='Asiento polimero verde moldeado157';bs=green.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(.20,.43,.025,1);bs.inputs['Roughness'].default_value=.30
seat=root('Asiento_L8_157','interior');profile=[(.235,-.006),(.218,.012),(.16,.018),(.04,.008),(-.10,.016),(-.18,.055),(-.208,.14),(-.235,.36),(-.265,.56),(-.267,.61)];v=[];f=[];cols=25
for z,y in profile:
 for j in range(cols):u=-1+2*j/(cols-1);v.append((u*(.211-.012*max(y-.5,0)/.11),y+.018*abs(u)**4,z+.013*abs(u)**4))
for i in range(len(profile)-1):
 for j in range(cols-1):a=i*cols+j;f.append((a,a+1,a+cols+1,a+cols))
o=mesh(seat,'Carcasa inyectada continua157',v,f,green)
for p in o.data.polygons:p.use_smooth=True
s=o.modifiers.new('Espesor continuo moldeado157','SOLIDIFY');s.thickness=.022;s.offset=-1;b=o.modifiers.new('Radio del borde157','BEVEL');b.width=.007;b.segments=3
box(seat,'Canto frontal moldeado157',(0,-.024,.194),(.416,.064,.068),green,.018)
for x in [-.12,.12]:
 tube(seat,'Bastidor curvado157',[(x,-.052,.13),(x,-.39,.13),(x,-.443,.08),(x,-.443,-.13),(x,-.39,-.19),(x,-.052,-.19)],.014,steel);box(seat,'Patin de apoyo157',(x,-.458,-.025),(.05,.012,.32),steel,.004)
 for z in [-.14,.10]:cyl(seat,'Perno de anclaje157',(x,-.448,z),.008,.005,dark)
 box(seat,'Placa de union carcasa157',(x,-.029,-.08),(.045,.012,.10),steel)
 for z in [-.11,-.05]:cyl(seat,'Fijacion de carcasa157',(x,-.020,z),.006,.006,dark)
box(seat,'Travesano inferior157',(0,-.056,-.005),(.36,.03,.035),steel)
bpy.ops.wm.save_as_mainfile(filepath=str(O/'asiento-L8-157.blend'),compress=True);bpy.ops.export_scene.gltf(filepath=str(O/'asiento-L8-157.glb'),export_format='GLB',export_extras=True,export_apply=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
steel=mat('Acero cremallera157',(.46,.49,.50),.9,.32)
cloth=mat('Lona negra tejido bolsa157',(.018,.022,.023),0,.93);grey=mat('Lona gris bolsillos157',(.16,.17,.16),0,.90);orange=mat('Cinta naranja cosida157',(.65,.19,.025),0,.73);rubber=mat('Goma base bolsa157',(.008,.011,.010),0,.87);bag=root('Bolsa157','interior')
box(bag,'Base reforzada157',(0,-.065,0),(.52,.035,.26),rubber,.012)
for side in [-1,1]:
 v=[];f=[];cols=33;rows=9
 for j in range(rows):
  t=j/(rows-1)
  for i in range(cols):
   u=i/(cols-1);v.append(((u-.5)*.51,-.05+t*(.12-.012*math.sin(u*math.pi)**2),side*(.12+.004*math.sin(u*math.pi)*math.sin(t*math.pi)+.0014*math.sin(u*math.pi*18)*math.sin(t*math.pi))))
 for j in range(rows-1):
  for i in range(cols-1):a=j*cols+i;f.append((a,a+1,a+cols+1,a+cols))
 o=mesh(bag,'Lona flexible157',v,f if side>0 else [tuple(reversed(q))for q in f],cloth)
 for p in o.data.polygons:p.use_smooth=True
 o.modifiers.new('Espesor lona157','SOLIDIFY').thickness=.003
 tube(bag,'Ribete naranja157',[(-.25,.07,side*.12),(0,.058,side*.12),(.25,.07,side*.12)],.003,orange)
 tube(bag,'Asa cinta reforzada157',[(-.18,.055,side*.12),(-.14,.16,side*.12),(-.07,.175,side*.12),(.07,.175,side*.12),(.14,.16,side*.12),(.18,.055,side*.12)],.007,cloth)
 for x in [-.18,-.06,.06,.18]:
  vv=[];ff=[]
  for j in range(6):
   t=j/5
   for i in range(13):u=i/12;vv.append((x+(u-.5)*.105,-.045+t*.08,side*(.126+.019*math.sin(u*math.pi)*(.4+.6*t))))
  for j in range(5):
   for i in range(12):a=j*13+i;ff.append((a,a+1,a+14,a+13))
  o=mesh(bag,'Bolsillo abombado157',vv,ff if side>0 else [tuple(reversed(q))for q in ff],grey)
  for p in o.data.polygons:p.use_smooth=True
  o.modifiers.new('Espesor bolsillo157','SOLIDIFY').thickness=.002
  tube(bag,'Remate bolsillo157',[(x-.052,.035,side*.127),(x,.035,side*.145),(x+.052,.035,side*.127)],.0025,orange)
  for dx in [-.047,.047]:
   for j in range(8):box(bag,'Puntada bolsillo157',(x+dx,-.04+j*.009,side*.131),(.002,.003,.0015),orange,0)
for x in [-.25,.25]:box(bag,'Extremo acolchado157',(x,.005,0),(.014,.13,.24),cloth,.006)
lid=root('Solapa157','interior');lid.parent=bag;lid.location=(0,.12,.07);box(lid,'Lona solapa157',(0,0,.12),(.50,.009,.24),cloth,.004)
for x in [i*.006-.24 for i in range(81)]:box(lid,'Diente cremallera157',(x,.007,.235),(.003,.003,.004),steel,.001)
box(lid,'Tirador cremallera157',(.24,.012,.235),(.018,.006,.010),steel,.002);box(bag,'Tapete157',(0,-.096,.25),(.48,.016,.17),rubber,.008)
bpy.ops.wm.save_as_mainfile(filepath=str(O/'bolsa157.blend'),compress=True);bpy.ops.export_scene.gltf(filepath=str(O/'bolsa157.glb'),export_format='GLB',export_extras=True,export_apply=True)
