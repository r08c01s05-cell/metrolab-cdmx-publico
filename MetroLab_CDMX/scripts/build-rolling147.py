"""Blender-built seats, folded cabin consoles and threshold fittings; dimensions from visual references are approximate."""
from pathlib import Path
import bpy,bmesh,math,json
from mathutils import Vector,Matrix
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision147';O.mkdir(exist_ok=True);C=Matrix.Rotation(math.pi/2,4,'X')
bpy.ops.wm.read_factory_settings(use_empty=True)
def mat(n,c,metal=0,rough=.45):
 m=bpy.data.materials.new(n);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*c,1);b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough;return m
green=mat('Asientos verdes moldeados147',(.25,.48,.053),0,.4);steel=mat('Acero satinado147',(.46,.49,.50),.9,.32);dark=mat('Polimero grafito147',(.018,.024,.027),0,.64);paint=mat('Pintura gris verde cabina147',(.10,.18,.17),.15,.48);white=mat('Rotulos marfil147',(.8,.81,.74),0,.6);black=mat('Pintura negra pupitre147',(.014,.018,.021),.12,.44);red=mat('Pulsador rojo147',(.46,.018,.012),0,.3);yellow=mat('Pulsador ambar147',(.62,.39,.03),0,.3);blue=mat('Pulsador azul147',(.025,.12,.34),0,.3);teal=mat('Pulsador verde147',(.015,.27,.13),0,.3)
def root(n,fam):
 o=bpy.data.objects.new(n,None);bpy.context.collection.objects.link(o);o['familia_visual']=fam;o['revision147']=True;return o
def finish(o,p,n,pos,m):
 o.name=n;o.parent=p;o.location=C@Vector(pos);o.data.materials.append(m);o['familia_visual']=p.get('familia_visual','interior');o['revision147']=True;return o
def mesh(p,n,v,f,m):
 me=bpy.data.meshes.new(n);me.from_pydata([C@Vector(q)for q in v],[],f);me.update();bm=bmesh.new();bm.from_mesh(me);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(me);bm.free();o=bpy.data.objects.new(n,me);bpy.context.collection.objects.link(o);finish(o,p,n,(0,0,0),m);return o
def box(p,n,pos,size,m,bevel=.004):
 bpy.ops.mesh.primitive_cube_add(size=1);o=bpy.context.object;o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);finish(o,p,n,pos,m)
 if bevel:b=o.modifiers.new('Radio de fabricacion147','BEVEL');b.width=min(bevel,min(size)*.2);b.segments=3;b=o.modifiers.new('Normales147','WEIGHTED_NORMAL');b.keep_sharp=True
 return o
def tube(p,n,pts,r,m):
 c=bpy.data.curves.new(n,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=2;c.resolution_u=6;s=c.splines.new('BEZIER');s.bezier_points.add(len(pts)-1)
 for q,v in zip(s.bezier_points,pts):q.co=C@Vector(v);q.handle_left_type=q.handle_right_type='AUTO'
 o=bpy.data.objects.new(n,c);bpy.context.collection.objects.link(o);finish(o,p,n,(0,0,0),m);return o
def cyl(p,n,pos,r,h,m,axis='Y'):
 bpy.ops.mesh.primitive_cylinder_add(vertices=24,radius=r,depth=h);o=bpy.context.object;finish(o,p,n,pos,m)
 if axis=='X':o.rotation_euler.y=math.pi/2
 elif axis=='Z':o.rotation_euler.x=math.pi/2
 for f in o.data.polygons:f.use_smooth=len(f.vertices)==4
 return o
def label(p,text,pos,size,m):
 c=bpy.data.curves.new('Rotulo147','FONT');c.body=text;c.align_x='CENTER';c.align_y='CENTER';c.size=size;c.extrude=.00015;c.resolution_u=2;o=bpy.data.objects.new('Rotulo '+text,c);bpy.context.collection.objects.link(o);finish(o,p,o.name,pos,m);o.rotation_euler=(math.pi/2,0,-math.pi/2);return o
# A single, watertight moulded shell. Thickness follows the surface normal, not a diagonal offset.
seat=root('Asiento_L8_147','interior');profile=[(.225,-.015),(.205,.018),(.16,.008),(.02,0),(-.12,.006),(-.185,.045),(-.22,.13),(-.25,.39),(-.28,.59),(-.278,.63)];v=[];rows=[]
for i in range(len(profile)-1):
 a=Vector(profile[max(0,i-1)]);b=Vector(profile[i]);c=Vector(profile[i+1]);d=Vector(profile[min(len(profile)-1,i+2)])
 for k in range(4):
  t=k/4;q=.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);rows.append(q)
rows.append(Vector(profile[-1]));cols=17
for q,y in rows:
 half=.211 if y<.5 else .211-(y-.5)*.2
 for j in range(cols):
  u=-1+2*j/(cols-1);v.append((u*half,y+(.014*abs(u)**4 if y<.08 else 0),q+.009*abs(u)**4))
f=[]
for i in range(len(rows)-1):
 for j in range(cols-1):a=i*cols+j;f.append((a,a+1,a+cols+1,a+cols))
o=mesh(seat,'Carcasa continua de asiento147',v,f,green)
for p in o.data.polygons:p.use_smooth=True
s=o.modifiers.new('Espesor moldeado147','SOLIDIFY');s.thickness=.014;s.offset=-1;b=o.modifiers.new('Labio redondeado147','BEVEL');b.width=.005;b.segments=3
for side in [-1,1]:
 x=side*.145;tube(seat,'Bastidor tubular asiento147',[(x,-.055,.14),(x,-.405,.14),(x,-.45,.10),(x,-.45,-.15),(x,-.405,-.20),(x,-.055,-.20)],.015,steel)
 box(seat,'Apoyo sobre piso147',(x,-.458,-.02),(.055,.012,.34),steel)
 for z in [-.14,.1]:cyl(seat,'Fijacion al piso147',(x,-.449,z),.008,.005,dark)
box(seat,'Travesano bajo carcasa147',(0,-.047,0),(.36,.025,.035),steel)
# Universal stainless threshold: grooves stay at floor level and never cross a moving door leaf.
th=root('Umbral_147','interior');box(th,'Placa de umbral147',(0,0,0),(1.50,.018,.115),steel)
for z in [-.036,0,.036]:box(th,'Estria umbral147',(0,.010,z),(1.46,.0015,.004),dark,0)
for x in [-.68,.68]:cyl(th,'Tornillo de umbral147',(x,.011,0),.009,.003,dark)
# Two console families. They are visual adaptations, not a model-specific wiring diagram.
for modern in [False,True]:
 cab=root('Cabina_moderna147'if modern else'Cabina_clasica147','cab');box(cab,'Faldon pupitre147',(1,.43,0),(.83,.78,1.95),paint,.018)
 # Wedge-shaped top, rounded at the operator-facing edge.
 v=[(.45,.80,-1.01),(1.40,.80,-1.01),(1.40,1.05,-1.01),(.45,.92,-1.01),(.45,.80,1.01),(1.40,.80,1.01),(1.40,1.05,1.01),(.45,.92,1.01)]
 deck=mesh(cab,'Chapa inclinada pupitre147',v,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(0,4,7,3),(1,2,6,5)],black);b=deck.modifiers.new('Canto pupitre147','BEVEL');b.width=.012;b.segments=3
 box(cab,'Panel instrumentos147',(1.32,1.18,0),(.08,.43,1.97),black,.014)
 for i,z in enumerate([-.72,0,.72]):
  # Front-normal is -X, the operator looks towards +X.
  box(cab,'Marco indicador147',(1.265,1.20,z),(.032,.285,.44 if modern else .30),steel)
  vv=[(1.245,1.075,z-.195),(1.245,1.075,z+.195),(1.245,1.325,z+.195),(1.245,1.325,z-.195)]if modern else[(1.245,1.075,z-.13),(1.245,1.075,z+.13),(1.245,1.325,z+.13),(1.245,1.325,z-.13)]
  screenMat=mat(('Pantalla'if modern else'Escala')+str(i)+' cabina147',(.035,.06,.07)if modern else(.7,.73,.67),0,.64);face=mesh(cab,'Instrumento cabina147',vv,[(0,1,2,3)],screenMat)
  if i==1:face['cabScreen147']='speed'
  else:
   if modern:
    for row in range(4):box(cab,'Linea indicador147',(1.242,1.14+row*.036,z),(.002,.009,.28),teal,0)
   else:
    for k in range(21):
     a=math.pi-math.pi*k/20;yy=1.13+math.sin(a)*.09;zz=z+math.cos(a)*.09;box(cab,'Marca escala147',(1.242,yy,zz),(.003,.01,.002),dark,0)
    tube(cab,'Aguja indicador147',[(1.238,1.13,z),(1.238,1.17,z-.06)],.0018,dark)
   label(cab,'ESTADO'if modern else'INDICADOR',(1.239,1.29,z),.018,white if modern else dark)
  for dz in [-1,1]:
   for dy in [-1,1]:cyl(cab,'Tornillo bisel147',(1.24,1.20+dy*.13,z+dz*(.205 if modern else .14)),.006,.003,steel,'X')
 for z in [-.76,-.58,-.4,.4,.58,.76]:
  cyl(cab,'Bisel pulsador147',(.73,.975,z),.026,.012,steel);cyl(cab,'Pulsador147',(.73,.988,z),.019,.014,[teal,yellow,blue,teal,yellow,red][int(round((z+1)*10))%6])
 for z in [-.91,.91]:
  box(cab,'Placa manipulador147',(.53,.95,z),(.18,.025,.15),steel);tube(cab,'Palanca de mando147',[(.53,.96,z),(.53,1.10,z)],.014,dark);cyl(cab,'Empunadura147',(.53,1.12,z),.035,.055,dark)
 box(cab,'Radio e interfonia147',(.50,.97,.20),(.15,.04,.20),dark);tube(cab,'Cable radio147',[(.50,.98,.12),(.40,1.01,.05),(.50,.98,-.02)],.004,dark)
 for y in [.15,.55]:
  box(cab,'Tapa registro pupitre147',(.575,y,0),(.02,.28,.75),paint)
  for z in [-.32,.32]:cyl(cab,'Fijacion tapa147',(.56,y,z),.007,.006,steel,'X')
 # Roof-side console remains above the windscreen sightline.
 box(cab,'Panel superior cabina147',(1.50,1.90,0),(.18,.14,1.85),paint)
 for z in [-.7,-.35,0,.35,.7]:cyl(cab,'Mando panel superior147',(1.40,1.9,z),.02,.016,dark,'X')
 # Operator chair, with a proper pedestal and separated backrest.
 cyl(cab,'Pedestal butaca operador147',(-.42,.27,0),.06,.48,steel);box(cab,'Cojin butaca operador147',(-.42,.55,0),(.43,.10,.46),dark,.025);box(cab,'Respaldo butaca operador147',(-.67,.85,0),(.09,.57,.43),dark,.024)
bpy.context.scene.unit_settings.system='METRIC';bpy.ops.wm.save_as_mainfile(filepath=str(O/'componentes147.blend'),compress=True);bpy.ops.object.select_all(action='SELECT');bpy.ops.export_scene.gltf(filepath=str(O/'componentes147.glb'),export_format='GLB',export_apply=True,export_extras=True,export_animations=False)
print('147 native components ready',flush=True)
