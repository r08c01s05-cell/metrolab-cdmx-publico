"""Blender tool geometry in metres. Educational tools, no OEM branding."""
import bpy, math, gzip
from pathlib import Path
from mathutils import Matrix,Vector
R=Path(__file__).resolve().parents[1];O=R/'assets-source/herramientas139';O.mkdir(parents=True,exist_ok=True);W=R/'dist/models/herramientas139';W.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True);C=Matrix.Rotation(math.pi/2,4,'X')
def material(n,c,metal=0,rough=.5):
 m=bpy.data.materials.new(n);m.use_nodes=True;b=m.node_tree.nodes['Principled BSDF'];b.inputs['Base Color'].default_value=(*c,1);b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough;return m
steel=material('Acero satinado herramienta139',(.45,.49,.51),.92,.27);chrome=material('Acero cromado llave139',(.52,.56,.58),.96,.22);rubber=material('Caucho TPE mango139',(.027,.043,.049),0,.83);plastic=material('Polimero rojo herramienta139',(.39,.045,.028),0,.48);black=material('Nylon cerdas139',(.025,.027,.023),0,.88)
def group(n,tip):
 g=bpy.data.objects.new('tool139_'+n,None);bpy.context.collection.objects.link(g);g['tool139']=n;g['tip139']=tip;g['grip139']=[0,.065,0];return g
def mesh(n,vs,fs,mat,p):
 me=bpy.data.meshes.new(n);me.from_pydata([C@Vector(v) for v in vs],[],fs);me.materials.append(mat);o=bpy.data.objects.new(n,me);bpy.context.collection.objects.link(o);o.parent=p;return o
def lathe(p,n,profile,m,segments=32):
 vs=[(r*math.cos(i*2*math.pi/segments),y,r*math.sin(i*2*math.pi/segments))for r,y in profile for i in range(segments)];fs=[]
 for row in range(len(profile)-1):
  for i in range(segments):a=row*segments+i;b=row*segments+(i+1)%segments;fs.append((a,b,b+segments,a+segments))
 fs.extend([tuple(range(segments-1,-1,-1)),tuple((len(profile)-1)*segments+i for i in range(segments))]);o=mesh(n,vs,fs,m,p)
 for f in o.data.polygons:f.use_smooth=len(f.vertices)==4
 return o
def box(p,n,xyz,size,m):
 x,y,z=[a/2 for a in size];vs=[(-x,-y,-z),(x,-y,-z),(x,y,-z),(-x,y,-z),(-x,-y,z),(x,-y,z),(x,y,z),(-x,y,z)];o=mesh(n,vs,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],m,p);o.location=C@Vector(xyz);b=o.modifiers.new('Radio moldeado','BEVEL');b.width=min(.001,min(size)*.2);b.segments=2;return o
d=group('screwdriver',[0,.255,0]);lathe(d,'Mango bimaterial',[(.008,.012),(.013,.018),(.016,.03),(.0165,.065),(.015,.091),(.011,.106),(.009,.11)],plastic)
for i in range(8):
 a=i*math.pi/4;pad=box(d,'Inserto de agarre',(math.cos(a)*.015,.060,math.sin(a)*.015),(.003,.056,.008),rubber);pad.rotation_euler.z=-a
lathe(d,'Collarin antirodadura',[(.01,.106),(.012,.108),(.012,.116),(.008,.12)],rubber,24);lathe(d,'Vastago rectificado',[(.0033,.117),(.0033,.236),(.0028,.244)],steel)
# Tapered PH2 cross: four ground wings meet at one short cross tip.
section=[(-.001,-.003),(.001,-.003),(.001,-.001),(.003,-.001),(.003,.001),(.001,.001),(.001,.003),(-.001,.003),(-.001,.001),(-.003,.001),(-.003,-.001),(-.001,-.001)]
vs=[(x*k,y,z*k)for y,k in [(.239,1),(.253,.35),(.255,.1)]for x,z in section];fs=[(j*12+i,j*12+(i+1)%12,(j+1)*12+(i+1)%12,(j+1)*12+i)for j in range(2)for i in range(12)];mesh('Punta Phillips PH2',vs,fs,steel,d)
w=group('wrench',[0,.205,0]);outline=[(-.008,.028),(-.007,.064),(-.007,.164),(-.017,.182),(-.020,.198),(-.013,.212),(-.0065,.214),(-.0065,.197),(.0065,.197),(.0065,.214),(.013,.212),(.020,.198),(.017,.182),(.007,.164),(.007,.064),(.008,.028)]
# Use a true polygon outline for the open end and a 12-point closed ring.
vs=[(x,y,z)for z in [-.0025,.0025]for x,y in outline];n=len(outline);fs=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n)for i in range(n)];o=mesh('Llave combinada 13 mm',vs,fs,chrome,w);b=o.modifiers.new('Bisel forjado','BEVEL');b.width=.0007;b.segments=2
# Annular box end with twelve-point socket, real through-hole.
vs=[]
for z in [-.003,.003]:
 for rkind in [0,1]:
  for i in range(48):a=i*2*math.pi/48;r=.014 if not rkind else(.007 if i%4<2 else .008);vs.append((r*math.cos(a),.023+r*math.sin(a),z))
fs=[]
for i in range(48):j=(i+1)%48;fs.extend([(i,j,48+j,48+i),(96+i,144+i,144+j,96+j),(i,96+i,96+j,j),(48+i,48+j,144+j,144+i)])
mesh('Boca estrella de doce puntos',vs,fs,chrome,w);box(w,'Nervio forjado',(0,.108,0),(.008,.090,.006),steel)
p=group('meter',[0,.181,0]);lathe(p,'Empunadura de punta',[(.004,.008),(.008,.017),(.0085,.065),(.007,.086),(.015,.090),(.015,.094),(.006,.098),(.004,.151),(.003,.157)],plastic)
for i in range(6):lathe(p,'Anillo antideslizante',[(.008,.026+i*.009),(.009,.028+i*.009),(.008,.03+i*.009)],rubber,24)
lathe(p,'Punta conductora',[(.0016,.156),(.0016,.176),(.0002,.181)],steel,16)
c=bpy.data.curves.new('Alivio flexible de cable','CURVE');c.dimensions='3D';c.bevel_depth=.0025;c.bevel_resolution=2;s=c.splines.new('BEZIER');s.bezier_points.add(3)
for q,xyz in zip(s.bezier_points,[(0,.014,0),(0,-.02,0),(.025,-.05,0),(.06,-.06,.01)]):q.co=C@Vector(xyz);q.handle_left_type=q.handle_right_type='AUTO'
o=bpy.data.objects.new(c.name,c);bpy.context.collection.objects.link(o);o.parent=p;c.materials.append(rubber)
b=group('brush',[0,.223,0]);lathe(b,'Mango de brocha',[(.005,.012),(.008,.02),(.009,.06),(.007,.118),(.008,.145)],rubber,24);box(b,'Virola plegada',(0,.164,0),(.036,.038,.012),steel)
for x in [-.014,.014]:box(b,'Engatillado de virola',(x,.165,-.0065),(.002,.028,.001),chrome)
for i in range(12):
 for j in range(4):
  length=.036+((i*7+j*3)%5)*.0015;o=lathe(b,'Haz de filamentos',[(.0007,.18),(.00055,.18+length),(.0001,.18+length+.001)],black,5);o.location=C@Vector(((i-5.5)*.0028,0,(j-1.5)*.0028))
bpy.context.scene.unit_settings.system='METRIC';bpy.ops.wm.save_as_mainfile(filepath=str(O/'herramientas139.blend'),compress=True);bpy.ops.export_scene.gltf(filepath=str(O/'herramientas139.glb'),export_format='GLB',export_apply=True,export_extras=True,export_cameras=False,export_lights=False);raw=(O/'herramientas139.glb').read_bytes();(W/'herramientas139.glb.gz').write_bytes(gzip.compress(raw,9,mtime=0));print('TOOLS139',len(raw),len(gzip.compress(raw,9)))
