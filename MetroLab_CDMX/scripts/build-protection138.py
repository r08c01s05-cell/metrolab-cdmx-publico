"""Manufactured enclosures and bench housings; illustrative equipment, not OEM drawings."""
from pathlib import Path
import bpy,math,gzip
from mathutils import Matrix,Vector
R=Path(__file__).resolve().parents[1];O=R/'assets-source/proteccion138';O.mkdir(parents=True,exist_ok=True);W=R/'dist/models/proteccion138';W.mkdir(parents=True,exist_ok=True);C=Matrix.Rotation(math.pi/2,4,'X')
def material(name,c,metal=0,rough=.5):
 m=bpy.data.materials.new(name);m.use_nodes=True;b=m.node_tree.nodes['Principled BSDF'];b.inputs['Base Color'].default_value=(*c,1);b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough;return m
def empty(name,parent=None,p=(0,0,0)):
 o=bpy.data.objects.new(name,None);bpy.context.scene.collection.objects.link(o);o.parent=parent;o.location=C@Vector(p);return o
def box(parent,name,p,size,mat):
 x,y,z=[v/2 for v in size];vs=[(-x,-y,-z),(x,-y,-z),(x,y,-z),(-x,y,-z),(-x,-y,z),(x,-y,z),(x,y,z),(-x,y,z)];faces=[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)];me=bpy.data.meshes.new(name);me.from_pydata([C@Vector(v)for v in vs],[],faces);me.materials.append(mat);o=bpy.data.objects.new(name,me);bpy.context.scene.collection.objects.link(o);o.parent=parent;o.location=C@Vector(p);b=o.modifiers.new('Pliegue y canto de chapa','BEVEL');b.width=min(.003,min(size)*.15);b.segments=1;return o
def fastener(parent,p,r=.012,positive=False):
 # Washer, hexagonal head and recessed socket are separate machined surfaces.
 for name,rr,depth,off,n,mat in [('Arandela138',r*1.4,.003,0,16,steel),('Cabeza hexagonal138',r,.009,-.005,6,steel),('Alojamiento Allen138',r*.42,.001,-.010,6,dark)]:
  vs=[]
  for z in [-depth/2,depth/2]:
   for i in range(n):vs.append(C@Vector((rr*math.cos(i*2*math.pi/n),rr*math.sin(i*2*math.pi/n),z)))
  fs=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n)for i in range(n)]
  me=bpy.data.meshes.new(name);me.from_pydata(vs,[],fs);me.materials.append(mat);o=bpy.data.objects.new(name,me);bpy.context.scene.collection.objects.link(o);o.parent=parent;o.location=C@Vector((p[0],p[1],p[2]+off*(-1 if positive else 1)))
def printlabel(parent,text,p,size=.045):
 c=bpy.data.curves.new('Identificador de equipo138','FONT');c.body=text;c.size=size;c.align_x='CENTER';c.resolution_u=2;o=bpy.data.objects.new('Placa '+text,c);bpy.context.scene.collection.objects.link(o);o.parent=parent;o.location=C@Vector(p);o.rotation_euler=(math.pi/2,0,math.pi);o.data.materials.append(steel)
def curve(parent,name,pts,r,mat):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=4;c.bevel_depth=r;c.bevel_resolution=2;s=c.splines.new('BEZIER');s.bezier_points.add(len(pts)-1)
 for q,v in zip(s.bezier_points,pts):q.co=C@Vector(v);q.handle_left_type=q.handle_right_type='AUTO'
 o=bpy.data.objects.new(name,c);bpy.context.scene.collection.objects.link(o);o.parent=parent;o.data.materials.append(mat);return o
def export(root,name):
 bpy.context.scene.unit_settings.system='METRIC';bpy.ops.wm.save_as_mainfile(filepath=str(O/(name+'.blend')),compress=True);bpy.ops.object.select_all(action='DESELECT')
 for o in bpy.context.scene.objects:
  p=o
  while p and p!=root:p=p.parent
  if p==root:o.select_set(True)
 bpy.context.view_layer.objects.active=root;bpy.ops.export_scene.gltf(filepath=str(O/(name+'.glb')),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=False,export_lights=False,export_cameras=False);raw=(O/(name+'.glb')).read_bytes();(W/(name+'.glb.gz')).write_bytes(gzip.compress(raw,9,mtime=0));print('EXPORTED',name,flush=True)
bpy.ops.wm.open_mainfile(filepath=str(R/'assets-source/subestaciones137/subestacion_rectificadora137.blend'));root=bpy.data.objects['SR_Blend127'];root['revision138']=True;root['doorCount138']=11
paint=material('138 chapa galvanizada pintada',(.31,.36,.36),.22,.49);steel=material('138 acero herraje',(.48,.52,.54),.83,.31);dark=material('138 junta EPDM',(.018,.023,.025),0,.87);red=material('138 tapa borne positivo',(.38,.025,.018),0,.66)
g={k:bpy.data.objects[k]for k in ['transformer','aux','battery']}
def frame(parent,cx,cy,z,w,h,depth):
 for sign in [-1,1]:box(parent,'Montante envolvente138',(cx+sign*w/2,cy,z+depth/2),(.045,h,depth),paint)
 box(parent,'Techo envolvente138',(cx,cy+h/2,z+depth/2),(w+.045,.05,depth),paint);box(parent,'Zocalo envolvente138',(cx,cy-h/2,z+depth/2),(w+.045,.07,depth),paint);box(parent,'Fondo envolvente138',(cx,cy,z+depth),(w,h,.045),paint)
def door(parent,x,y,z,w,h,louver=False):
 d=empty('Puerta de gabinete · abatida138',parent,(x,y,z));d['closedFront136']=z;d['cabinetPart136']=parent.name;d['leafMinY136']=y;d['leafMaxY136']=y+h;d['protection138']=True;sign=1 if w>0 else -1;a=abs(w);leaf=empty('Hoja de gabinete138',d)
 # Closed leaf: opaque sheet or complete framed ventilation louvers with narrow guarded slots.
 if not louver:box(leaf,'Chapa plegada138',(w/2,h/2,0),(a-.025,h-.025,.035),paint)
 else:
  for xx in [sign*.035,w-sign*.035]:box(leaf,'Perfil vertical de resguardo138',(xx,h/2,0),(.07,h,.05),paint)
  for yy in [.04,h/2,h-.04]:box(leaf,'Travesano de resguardo138',(w/2,yy,0),(a,.08,.05),paint)
  for i in range(25):
   slat=box(leaf,'Lama protectora de ventilacion138',(w/2,.12+i*(h-.24)/24,.005),(a-.11,.082,.045),paint);slat.rotation_euler.x=math.radians(12)
 for yy in [.24,h-.24]:box(d,'Bisagra industrial138',(sign*.015,yy,-.035),(.035,.12,.05),steel)
 for xx in [sign*.018,w-sign*.018]:box(d,'Junta de hoja138',(xx,h/2,.022),(.012,h-.045,.018),dark)
 curve(d,'Asa de puerta138',[(w-sign*.15,h*.51,-.035),(w-sign*.15,h*.51,-.095),(w-sign*.15,h*.44,-.095),(w-sign*.15,h*.44,-.035)],.012,steel)
 box(d,'Placa identificacion138',(w/2,.19,-.027),(min(.55,a-.14),.11,.009),dark)
 printlabel(d,'TRANSFORMADOR' if louver else ('SERVICIOS AUX.' if parent.name=='aux' else 'CARGADOR'),(w/2,.172,-.035),.042)
 for yy in [.24,h-.24]:fastener(d,(sign*.016,yy,-.063),.009)
 d['openSign138']=sign
 return d
# Two opposed leaves protect the dry transformer while leaving forced ventilation possible.
frame(g['transformer'],-1.85,1.53,.59,2.72,2.66,2.53)
door(g['transformer'],-3.195,.225,.57,1.335,2.61,True);door(g['transformer'],-.505,.225,.57,-1.335,2.61,True)
# The auxiliary and charger fronts now have real closed leaves rather than exposed modules.
door(g['aux'],-6.635,.225,-2.475,1.27,1.75);door(g['battery'],6.69,.225,-2.475,.62,1.55)
for parent,cx in [(g['aux'],-6),(g['battery'],7)]:
 for yy in [.27,1.65 if cx==-6 else 1.45]:box(parent,'Marco frontal138',(cx,yy,-2.445),(1.25 if cx==-6 else .60,.04,.055),steel)
# Rounded insulating boots enclose each battery stud and conductive bridge.
for yy in [.35,1.05]:
 for i in range(8):
  x=4.67+i*.27
  for z,m in [(-1.83,red),(-1.57,dark)]:box(g['battery'],'Cubrebornes aislante138',(x,yy+.52,z),(.085,.07,.085),m)
  if i<7:box(g['battery'],'Funda de puente de bateria138',(x+.135,yy+.54,-1.83),(.265,.045,.07),red)
# Save editable model closed, export the runtime hinge opening endpoints.
bpy.ops.wm.save_as_mainfile(filepath=str(O/'subestacion138.blend'),compress=True)
for d in bpy.context.scene.objects:
 if d.type=='EMPTY' and d.name.startswith('Puerta de gabinete'):d.rotation_euler.z=math.radians(105)*(d.get('openSign138',1))
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
 p=o
 while p and p!=root:p=p.parent
 if p==root:o.select_set(True)
bpy.context.view_layer.objects.active=root;bpy.ops.export_scene.gltf(filepath=str(O/'subestacion138.glb'),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=False,export_lights=False,export_cameras=False);(W/'subestacion138.glb.gz').write_bytes(gzip.compress((O/'subestacion138.glb').read_bytes(),9,mtime=0));print('SUBSTATION138_READY',flush=True)
# A compact native GLB pack: housings added around existing, unchanged interactive nodes.
bpy.ops.wm.read_factory_settings(use_empty=True);pack=empty('Protecciones_bancos138');steel=material('138 Acero de bancada',(.35,.40,.43),.8,.39);paint=material('138 Chapa de equipo',(.39,.43,.42),.16,.55);dark=material('138 Junta industrial',(.02,.026,.028),0,.9)
for kind in ['doors','ventilation','running','electrical','sr_ventilation','sr_control','sr_battery','tech_diodes','tech_insulation','tech_relay']:
 b=empty('bench138_'+kind,pack);static=empty('anchor138_static',b);static['anchor138']='static'
 if kind in ['ventilation','electrical']:
  for sign in [-1,1]:box(static,'Pared lateral de carcasa138',(sign*.99,1.12,.05),(.04,1.65,.72),paint)
  box(static,'Fondo de equipo138',(0,1.12,-.32),(2.02,1.65,.04),paint)
  for yy in [.30,1.94]:box(static,'Retorno de carcasa138',(0,yy,.05),(2.02,.035,.72),steel)
  cover=empty('anchor138_cover',b);cover['anchor138']='cover'
  for sign in [-1,1]:box(cover,'Junta perimetral138',(sign*.93,0,-.012),(.025,1.47,.025),dark)
  for yy in [-.74,.74]:box(cover,'Junta perimetral138',(0,yy,-.012),(1.88,.025,.025),dark)
  for x in [-.7,.7]:curve(static,'Pasamuros con cable138',[(x,.29,-.08),(x,.17,-.13),(x+.12,.15,-.18)],.015,dark)
 elif kind=='doors':
  box(static,'Cubierta de mecanismo138',(0,2.45,.24),(2.25,.31,.035),paint)
  for sign in [-1,1]:box(static,'Testero de mecanismo138',(sign*1.12,2.45,.02),(.035,.31,.45),steel)
  for yy in [2.30,2.60]:box(static,'Pliegue de mecanismo138',(0,yy,.02),(2.25,.025,.45),steel)
  for i in range(14):box(static,'Ranura cubierta138',(-.83+i*.127,2.48,.260),(.06,.014,.003),dark)
 elif kind=='running':
  # Cast supports and a continuous rear shaft replace the floating wheel presentation.
  for sign in [-1,1]:box(static,'Pedestal de rodamiento138',(sign*.23,.63,-.17),(.17,.93,.36),paint);box(static,'Pie de pedestal138',(sign*.23,.19,-.17),(.34,.08,.55),steel)
  for yy in [.92,1.28]:box(static,'Brida rodamiento138',(0,yy,-.18),(.64,.065,.38),steel)
  curve(static,'Engrasador de rodamiento138',[(.19,1.28,-.18),(.19,1.38,-.18),(.25,1.41,-.18)],.018,steel)
 else:
  technical=kind.startswith('tech_');w,h=(2.25,1.45)if technical else(1.86,1.15);cy=-.02 if technical else 0
  for sign in [-1,1]:box(static,'Lateral instrumento138',(sign*w/2,cy,.12),(.035,h,.26),paint)
  box(static,'Tapa trasera138',(0,cy,.25),(w,h,.035),paint)
  for yy in [cy-h/2,cy+h/2]:box(static,'Retorno de banco138',(0,yy,.12),(w,.025,.26),steel)
  for x in [-w*.35,w*.35]:box(static,'Apoyo antivibratorio138',(x,cy-h/2-.035,.13),(.18,.055,.22),dark)
# Four visible fixings retain each rigid chassis; moving screws remain in the original targets.
 for sign in [-1,1]:
  for yy in ([2.34,2.56] if kind=='doors' else [.48,1.65] if kind in ['ventilation','electrical'] else [.32,.89] if kind=='running' else [-.42,.42]):
   xx=sign*(1.06 if kind=='doors' else .955 if kind in ['ventilation','electrical'] else .25 if kind=='running' else 1.075 if kind.startswith('tech_') else .875)
   zz=.267 if kind=='doors' else .418 if kind in ['ventilation','electrical'] else -.38 if kind=='running' else -.019
   fastener(static,(xx,yy,zz),.009 if kind.startswith('tech_') else .012,kind in ['doors','ventilation','electrical','running'])
export(pack,'bancos138')
