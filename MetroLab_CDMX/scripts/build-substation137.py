"""Manufactured detail pass over all 12 existing assemblies; Blender 4.3."""
from pathlib import Path
import bpy,math,gzip
from mathutils import Matrix,Vector
R=Path(__file__).resolve().parents[1];O=R/'assets-source/subestaciones137';O.mkdir(parents=True,exist_ok=True);W=R/'dist/models/subestaciones137';W.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(R/'assets-source/subestaciones136/subestacion_rectificadora136.blend'));C=Matrix.Rotation(math.pi/2,4,'X');groups={k:bpy.data.objects[k]for k in ['mt','transformer','rectifier','dc','control','battery','aux','cables','earth','civil','roof','fire']};root=bpy.data.objects['SR_Blend127'];root['revision137']=True
# PBR differences in manufactured surfaces, preserving authored identifiers and colors.
def mat(n,c,metal,rough):
 m=bpy.data.materials.new(n);m.use_nodes=True;p=m.node_tree.nodes['Principled BSDF'];p.inputs['Base Color'].default_value=(*c,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;return m
steel=mat('137 acero inoxidable mecanizado',(.39,.43,.45),.86,.30);copper=mat('137 cobre de pletinas',(.38,.19,.09),.85,.34);black=mat('137 elastomero y aislante',(.023,.028,.03),0,.88);ceramic=mat('137 porcelana tecnica',(.45,.30,.24),.03,.33);paint=mat('137 chapa pintada',(.23,.29,.30),.16,.54)
def box(k,n,p,s,m=steel):
 bpy.ops.mesh.primitive_cube_add(size=1);o=bpy.context.object;o.name=n+'137';o.dimensions=(s[0],s[2],s[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.parent=groups[k];o.location=C@Vector(p);o.data.materials.append(m);b=o.modifiers.new('radio de fabricacion','BEVEL');b.width=min(.004,min(s)*.18);b.segments=2;return o
def cyl(k,n,p,r,h,m=steel,front=False,vertices=16):
 bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=h);o=bpy.context.object;o.name=n+'137';o.parent=groups[k];o.location=C@Vector(p);o.data.materials.append(m)
 if front:o.rotation_euler.x=math.pi/2
 for f in o.data.polygons:f.use_smooth=len(f.vertices)==4
 b=o.modifiers.new('canto torneado','BEVEL');b.width=min(.001,h*.15);b.segments=1;return o
def wire(k,points,r=.006,m=black):
 c=bpy.data.curves.new('Mazo flexible137','CURVE');c.dimensions='3D';c.resolution_u=5;c.bevel_depth=r;c.bevel_resolution=2;s=c.splines.new('BEZIER');s.bezier_points.add(len(points)-1)
 for b,p in zip(s.bezier_points,points):b.co=C@Vector(p);b.handle_left_type=b.handle_right_type='AUTO'
 o=bpy.data.objects.new('Cableado flexible137',c);bpy.context.scene.collection.objects.link(o);o.parent=groups[k];o.data.materials.append(m)
# MT pole collars, shedding porcelain and bolted connections.
for x in [-6.57,-6.30,-6.03,-5.45,-5.18,-4.91,-4.33,-4.06,-3.79]:
 for y in [.94,1.10,1.26,1.42]:cyl('mt','Aleta aisladora',(x,y,2),.106,.028,ceramic)
 for y in [.85,1.55]:cyl('mt','Brida del polo',(x,y,2),.112,.05)
 cyl('mt','Tornillo pletina',(x,2.5,1.56),.019,.028,front=True,vertices=6)
# Transformer clamp tie rods, cooling spacers and primary cable terminations.
for x in [-2.75,-.95]:
 for z in [1.60,2.40]:
  cyl('transformer','Tirante de nucleo',(x,1.33,z),.018,1.65)
  for y in [.50,2.19]:cyl('transformer','Tuerca de tirante',(x,y,z),.034,.04,vertices=6)
for x in [-2.58,-1.85,-1.12]:
 for y in [.73,1.28,1.85]:box('transformer','Espaciador devanado',(x,y,1.64),(.12,.055,.10),black)
 for y in [2.37,2.43,2.49]:cyl('transformer','Plato de aislador',(x,y,2),.088,.023,ceramic)
 box('transformer','Zapata terminal',(x,2.65,2),(.12,.08,.15),copper)
# Diode mounting studs and heat-sink bolting, keeping all assemblies behind closed doors.
for x in [.72,1.58]:
 for y in [.63,.93,1.23,1.53,1.83,2.13]:
  cyl('rectifier','Brida diodo',(x,y,1.526),.084,.018,front=True)
  cyl('rectifier','Espiga diodo',(x,y,1.49),.018,.05,copper,True)
  cyl('rectifier','Tuerca diodo',(x,y,1.46),.029,.027,steel,True,6)
  for dx in [-.27,.27]:cyl('rectifier','Perno disipador',(x+dx,y,1.81),.014,.032,steel,True,6)
for x in [3.7,4.85]:
 for y in [1.65,1.72,1.79,1.86]:box('dc','Nervio camara extincion',(x,y,1.67),(.62,.018,.05),black)
 for dx in [-.29,.29]:
  for y in [.99,1.51]:cyl('dc','Perno interruptor',(x+dx,y,1.66),.023,.025,steel,True,6)
 box('dc','Biela mecanismo',(x+.11,1.12,1.60),(.035,.28,.045))
# Control terminal wiring and ducts; individual cable bends instead of rectangular strips.
for row in range(5):
 y=.7+row*.36
 for i in range(5):
  x=5.93+i*.14;wire('control',[(x,y-.10,1.80),(x,y-.17,1.78),(5.82,y-.18,1.80)])
  for dy in [-.07,.07]:cyl('control','Borne modular',(x,y+dy,1.77),.008,.015,steel,True)
for x in [4.67+i*.27 for i in range(8)]:
 for y in [.35,1.05]:
  for z in [-1.83,-1.57]:cyl('battery','Tuerca borne celda',(x,y+.50,z),.028,.028,steel,False,6)
# Auxiliaries, gland bodies and grounded enclosure fixings.
for x in [-6.23,-6,-5.77]:
 for y in [.49,1.01]:cyl('aux','Collarin bobina auxiliar',(x,y,-2),.128,.035)
for x in [-6.3,-5.18,-4.06,1.15,3.7,4.85,6.25]:
 for dx in [-.18,.18]:cyl('cables','Tuerca prensaestopa',(x+dx,.32,2.1),.057,.025,black,False,6)
for x in [-1,-.75,-.5,-.25,0,.25,.5,.75,1]:
 cyl('earth','Arandela barra PE',(x,.25,-3.48),.034,.012,steel,True)
for x in [-7,7]:
 cyl('fire','Cuello extintor',(x,1.045,-3.8),.047,.065)
 wire('fire',[(x+.08,1.04,-3.8),(x+.19,.95,-3.8),(x+.18,.66,-3.8)],.013)
for x in [-7.55,7.55]:
 for z in [-3,0,3]:box('civil','Placa anclaje bancada',(x,.06,z),(.16,.025,.16))
for x in [-4,4]:
 for dx in [-.4,.4]:cyl('roof','Fijacion extractor',(x+dx,4.02,2),.025,.04,steel,False,6)
# Save editable closed model; runtime reads the authored 105-degree opening endpoint.
bpy.context.scene.unit_settings.system='METRIC';bpy.context.scene.unit_settings.scale_length=1;bpy.ops.wm.save_as_mainfile(filepath=str(O/'subestacion_rectificadora137.blend'),compress=True)
for o in bpy.context.scene.objects:
 if o.type=='EMPTY' and o.name.startswith('Puerta de gabinete'):o.rotation_euler.z=math.radians(105)
bpy.context.view_layer.update();bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
 p=o
 while p and p!=root:p=p.parent
 if p==root:o.select_set(True)
bpy.context.view_layer.objects.active=root;bpy.ops.export_scene.gltf(filepath=str(O/'subestacion_rectificadora137.glb'),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=False,export_cameras=False,export_lights=False)
raw=(O/'subestacion_rectificadora137.glb').read_bytes();(W/'rectificadora.glb.gz').write_bytes(gzip.compress(raw,9,mtime=0));print('137_NATIVE_COMPLETE',len(raw),flush=True)
