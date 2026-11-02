"""Upgrade the editable Blender SR and three service benches. Illustrative dimensions only."""
from pathlib import Path
import bpy,math,gzip
from mathutils import Matrix,Vector
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets-source/subestaciones134';OUT.mkdir(parents=True,exist_ok=True);WEB=ROOT/'dist/models/subestaciones134';WEB.mkdir(parents=True,exist_ok=True)
C=Matrix.Rotation(math.pi/2,4,'X')
def p(v):return C.to_3x3()@Vector(v)
def material(name,color,metal=0,rough=.5):
 m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*color,1);bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough;return m
def box(parent,name,xyz,size,m,bevel=.002):
 bpy.ops.mesh.primitive_cube_add(size=1);o=bpy.context.object;o.name=name;o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.parent=parent;o.location=p(xyz);o.data.materials.append(m)
 if bevel:mod=o.modifiers.new('Bisel de fabricación','BEVEL');mod.width=min(bevel,min(size)*.2);mod.segments=2
 return o
def cyl(parent,name,xyz,r,depth,m,front=True,n=24):
 bpy.ops.mesh.primitive_cylinder_add(vertices=n,radius=r,depth=depth);o=bpy.context.object;o.name=name;o.parent=parent;o.location=p(xyz);o.data.materials.append(m)
 if front:o.rotation_euler.x=math.pi/2
 mod=o.modifiers.new('Canto torneado','BEVEL');mod.width=min(.001,depth*.15);mod.segments=2
 for f in o.data.polygons:f.use_smooth=len(f.vertices)==4
 return o
def empty(name,parent=None,xyz=(0,0,0)):
 o=bpy.data.objects.new(name,None);bpy.context.scene.collection.objects.link(o);o.parent=parent;o.location=p(xyz);return o
def text(parent,name,s,xyz,size,m):
 c=bpy.data.curves.new(name,'FONT');c.body=s;c.size=size;c.align_x='CENTER';c.resolution_u=2;c.extrude=0;o=bpy.data.objects.new(name,c);bpy.context.scene.collection.objects.link(o);o.parent=parent;o.location=p(xyz);o.rotation_euler=(math.pi/2,0,math.pi);o.data.materials.append(m);bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH');return o
def tube(parent,name,points,r,m):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=8;c.bevel_depth=r;c.bevel_resolution=2;s=c.splines.new('BEZIER');s.bezier_points.add(len(points)-1)
 for q,xyz in zip(s.bezier_points,points):q.co=p(xyz);q.handle_left_type=q.handle_right_type='AUTO'
 o=bpy.data.objects.new(name,c);bpy.context.scene.collection.objects.link(o);o.parent=parent;o.data.materials.append(m);return o
def screw(parent,name,xyz,steel,dark,r=.018):
 cyl(parent,name+' arandela',xyz,r*1.36,.004,steel);cyl(parent,name+' cabeza',(xyz[0],xyz[1],xyz[2]-.009),r,.012,steel,n=32);box(parent,name+' cruz A',(xyz[0],xyz[1],xyz[2]-.016),(r*1.3,.003,.002),dark,0);box(parent,name+' cruz B',(xyz[0],xyz[1],xyz[2]-.016),(.003,r*1.3,.002),dark,0)
def export(root,name,webpath):
 scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1
 bpy.ops.wm.save_as_mainfile(filepath=str(OUT/(name+'.blend')),compress=True);bpy.ops.object.select_all(action='DESELECT')
 for o in list(scene.objects):
  a=o
  while a and a!=root:a=a.parent
  if a==root:o.select_set(True)
 bpy.context.view_layer.objects.active=root;bpy.ops.export_scene.gltf(filepath=str(OUT/(name+'.glb')),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=False,export_cameras=False,export_lights=False)
 raw=(OUT/(name+'.glb')).read_bytes();webpath.write_bytes(gzip.compress(raw,9,mtime=0));print('EXPORTED',name,len(raw),webpath.stat().st_size,flush=True)
# Main room: keep all 12 selectable electrical assemblies and the 7 independently hinged doors.
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'assets-source/subestaciones127/subestacion_rectificadora.blend'));scene=bpy.context.scene;root=bpy.data.objects['SR_Blend127'];groups={k:bpy.data.objects[k]for k in ['mt','transformer','rectifier','dc','control','battery','aux','cables','earth','civil','roof','fire']}
root['revision134']=True;root['normativeScope']='NOM-001-SEDE-2012 1.2.2(c): exclusive traction excluded. STPS workplace safety references; educational model, not certified.'
steel=material('Acero satinado SR134',(.44,.49,.50),.78,.4);dark=material('Aislante grafito SR134',(.025,.033,.035),0,.85);white=material('Marfil gabinete SR134',(.66,.70,.68),.08,.6);copper=material('Cobre terminal SR134',(.44,.23,.12),.83,.36);yellow=material('Amarillo señal SR134',(.86,.65,.04),0,.65);green=material('Verde salida SR134',(.035,.25,.12),0,.6)
for m in bpy.data.materials:
 if not m.use_nodes:continue
 bs=m.node_tree.nodes.get('Principled BSDF')
 if not bs:continue
 if 'Concreto' in m.name:bs.inputs['Base Color'].default_value=(.49,.51,.49,1)
 if 'Piso' in m.name:bs.inputs['Base Color'].default_value=(.23,.26,.25,1)
 if 'Pintura'==m.name.replace('SR126 ',''):bs.inputs['Base Color'].default_value=(.29,.36,.37,1)
# Remove the old exclamation signs and the solid front closure; replace with proper doorway and warning symbol.
for o in list(scene.objects):
 if o.name.startswith(('Muro_frente','Puerta_acceso','Señal · riesgo eléctrico','Símbolo eléctrico','Espira_bobina')):bpy.data.objects.remove(o,do_unlink=True)
cut=bpy.data.objects['Cerramiento_retirado']
for x in [-4.5,4.5]:box(cut,'Paño fachada con puerta central',(x,1.95,-4.9),(7,4,.20),white)
box(cut,'Dintel de acceso',(0,3.24,-4.9),(2,1.42,.2),white)
# Outward swung door leaves are outside the clear route, not floating across the passage.
for sign in [-1,1]:
 leaf=box(cut,'Puerta de acceso abierta',(sign*1.04,1.18,-5.38),(.055,2.35,.9),steel);box(cut,'Barra de salida',(sign*.99,1.12,-5.38),(.045,.04,.64),dark)
# Common clear aisle is deliberately wide; no fabricated compliance dimension is claimed.
for x in [-7.65,7.65]:box(groups['civil'],'Zoclo protector',(x,.12,0),(.07,.22,9.6),dark)
for x in range(-7,8):box(groups['civil'],'Junta de losa',(x,.048,0),(.004,.002,9.65),dark,0)
for z in [-4,-2,0,2,4]:box(groups['civil'],'Junta transversal',(0,.048,z),(15.6,.002,.004),dark,0)
for x in [-6.3,-5.18,-4.06]:
 # Warning triangle and lightning face the entrance (-Z in web coordinates).
 verts=[p((x-.16,2.76,1.48)),p((x+.16,2.76,1.48)),p((x,3.04,1.48))];me=bpy.data.meshes.new('Triangulo riesgo electrico');me.from_pydata(verts,[],[(0,2,1)]);me.materials.append(yellow);o=bpy.data.objects.new('NOM026_C7',me);scene.collection.objects.link(o);o.parent=groups['mt']
 bolt=[(x+.015,3.005,1.475),(x-.045,2.89,1.475),(x-.005,2.89,1.475),(x-.025,2.80,1.475),(x+.065,2.94,1.475),(x+.022,2.94,1.475)];me=bpy.data.meshes.new('Rayo');me.from_pydata([p(v)for v in bolt],[],[tuple(range(6))]);me.materials.append(dark);o=bpy.data.objects.new('Simbolo de riesgo electrico',me);scene.collection.objects.link(o);o.parent=groups['mt']
# Laminated transformer coils and mechanical clamps.
for x in [-2.58,-1.85,-1.12]:
 for sec in range(2):
  for i in range(23):cyl(groups['transformer'],'Capa de devanado',(x,.815+sec*.55+i*.0175,2),.35,.006,copper,front=False,n=32)
 for y in [.64,1.9]:
  for z in [1.63,2.37]:box(groups['transformer'],'Calzo de bobina',(x,y,z),(.10,.14,.065),dark)
for x in [-2.75,-.95]:
 for z in [1.25,2.75]:cyl(groups['transformer'],'Anclaje de bancada',(x,.40,z),.035,.10,steel,front=False,n=6)
# Face guard frames and gland nuts make cells read as manufactured assemblies.
guard=material('Pantalla transparente de inspección',(.59,.68,.68),0,.25);guard.diffuse_color=(.59,.68,.68,.13);guard.node_tree.nodes['Principled BSDF'].inputs['Alpha'].default_value=.13;guard.surface_render_method='DITHERED'
for key,x,w in [('mt',-6.3,.78),('mt',-5.18,.78),('mt',-4.06,.78),('dc',3.7,.82),('dc',4.85,.82)]:
 box(groups[key],'Resguardo interior visible',(x,1.5,1.51),(w,1.7,.006),guard,0)
 for sign in [-1,1]:box(groups[key],'Marco de resguardo',(x+sign*w/2,1.5,1.50),(.018,1.75,.02),steel)
 for dx in [-w/2,w/2]:
  for y in [.65,2.35]:screw(groups[key],'Fijación del resguardo',(x+dx,y,1.48),steel,dark,.013)
for x in [6.0,6.25,6.5]:
 for y in [.7,1.06,1.42]:
  screw(groups['control'],'Borne de control',(x,y,1.79),steel,dark,.009)
for y in [.35,1.05]:
 for i in range(8):
  x=4.67+i*.27;cyl(groups['battery'],'Tapa de celda',(x,y+.48,-1.7),.035,.025,dark,front=False);box(groups['battery'],'Etiqueta de celda',(x,y+.25,-1.949),(.11,.075,.003),white,0)
# Real ceiling fixtures, luminous diffusers and a clear emergency exit sign.
led=material('Difusor LED SR134',(.78,.84,.83),0,.55);bs=led.node_tree.nodes['Principled BSDF'];bs.inputs['Emission Color'].default_value=(.78,.84,.83,1);bs.inputs['Emission Strength'].default_value=.8
for x in [-5,0,5]:
 for z in [-2.0,1.1]:
  box(groups['aux'],'Carcasa de luminaria',(x,3.76,z),(1.2,.065,.19),steel);box(groups['aux'],'Difusor de luminaria',(x,3.72,z),(1.12,.012,.15),led)
box(groups['civil'],'Placa SALIDA',(0,2.7,-4.76),(1.3,.25,.02),green);text(groups['civil'],'Salida','SALIDA',(0,2.66,-4.745),.13,white)
box(groups['fire'],'Placa extintor',(-7,1.75,-3.97),(.36,.44,.02),bpy.data.materials['SR126 Pintura roja']);text(groups['fire'],'Extintor','EXTINTOR',(-7,1.74,-3.95),.06,white)
# Save an entry perspective at human eye height, with broad diffuse interior lighting.
for o in list(scene.objects):
 if o.type in ['LIGHT','CAMERA']:bpy.data.objects.remove(o,do_unlink=True)
for o in scene.objects:o.hide_render=False
world=scene.world;world.node_tree.nodes['Background'].inputs[1].default_value=.65
for xyz,power,size in [((0,3.5,-2),1700,7),((-5,3.5,0),1100,5),((5,3.5,0),1100,5)]:
 bpy.ops.object.light_add(type='AREA',location=p(xyz));o=bpy.context.object;o.data.energy=power;o.data.size=size;o.rotation_euler=(p((xyz[0],1.2,2))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=p((0,1.68,-4.25)));cam=bpy.context.object;cam.rotation_euler=(p((0,1.68,2))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=22;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.use_denoising=True;scene.render.resolution_x=1320;scene.render.resolution_y=850;scene.render.resolution_percentage=100;scene.render.filepath=str(OUT/'entrada.png')
export(root,'subestacion_rectificadora134',ROOT/'dist/models/subestaciones127/rectificadora.glb.gz');bpy.ops.render.render(write_still=True)
# Three newly authored service activities share manufactured enclosures, tools and 3D fixings.
for kind in ['ventilation','control','battery']:
 bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene;root=empty('Servicio_SR134_'+kind);root['asset134']=True;root['units']='metres';root['trainingOnly']=True
 steel=material('Acero satinado banco134',(.45,.50,.51),.8,.4);paint=material('Pintura marfil banco134',(.44,.49,.47),.08,.59);dark=material('Caucho grafito banco134',(.025,.033,.035),0,.86);copper=material('Cobre conexiones banco134',(.48,.24,.11),.84,.36);red=material('Aislante rojo banco134',(.42,.035,.02),0,.7);blue=material('Aislante azul banco134',(.04,.16,.29),0,.7);white=material('Ceramica banco134',(.72,.74,.67),0,.65);green=material('Testigo verde banco134',(.04,.35,.16),0,.5);dirt=material('Polvo de filtro banco134',(.23,.20,.13),0,.98)
 def target(key,xyz):
  g=empty('sr134_'+key,root,xyz);g['srTarget128']=key;return g
 box(root,'Panel de ensayo',(0,0,.06),(1.8,1.14,.095),paint,.018);box(root,'Mesa de servicio',(0,-.64,.08),(2.1,.09,.82),steel,.012)
 for x in [-.85,.85]:
  for z in [-.22,.38]:box(root,'Pata de bancada',(x,-.79,z),(.06,.30,.06),steel)
 text(root,'Identificación',{'ventilation':'VENTILACION / FILTRO EXTRAIBLE','control':'CIRCUITO AUXILIAR / 24 V CD','battery':'CONEXIONES / BANCO AISLADO'}[kind],(0,.48,.002),.055,dark)
 if kind=='ventilation':
  f=target('filter',(0,.06,-.045));box(f,'Marco filtro',(0,0,0),(1.18,.62,.045),steel,.006)
  for i in range(28):
   o=box(f,'Pliegue filtrante',(-.55+i*.041,0,-.035),(.026,.53,.034),white,.002);o.rotation_euler.y=(-1 if i%2 else 1)*.25
  for i in range(30):box(f,'sr134_dust',(-.51+(i%10)*.113,-.19+(i//10)*.18,-.059),(.075,.09,.005),dirt,0)
  for key,x,y in [('screwL',-.69,.29),('screwR',.69,.29),('screw3',-.69,-.20),('screw4',.69,-.20)]:screw(target(key,(x,y,-.07)),'Tornillo de filtro',(0,0,0),steel,dark,.025)
  fan=target('fan',(0,-.37,-.07));cyl(fan,'Aro de ventilación',(0,0,0),.13,.05,steel);rotor=empty('sr134_rotor',fan)
  for a in range(5):o=box(rotor,'Aspa curva',(0,0,-.035),(.20,.032,.009),dark,.012);o.rotation_euler.y=a*math.pi/5
  cyl(fan,'Buje',(0,0,-.045),.032,.025,dark)
 elif kind=='control':
  for key,x,m in [('tpSource',-.62,red),('tpLoad',.62,blue)]:
   t=target(key,(x,.17,-.06));cyl(t,'Borne aislado',(0,0,0),.065,.05,m);cyl(t,'Contacto mecanizado',(0,0,-.035),.025,.025,steel)
  f=target('fuse',(0,.08,-.06));box(f,'Zocalo portafusible',(0,0,0),(.30,.45,.12),white,.01);holder=empty('sr134_fuseLeaf',f);box(holder,'Portafusible extraible',(0,0,-.075),(.19,.30,.10),dark,.008);cyl(holder,'Cartucho cerámico',(0,0,-.14),.035,.21,white,front=False)
  for y in [-.12,.12]:cyl(holder,'Casquillo de cartucho',(0,y,-.14),.038,.04,steel,front=False)
  for x in [-.58,.58]:tube(root,'Cable flexible',[(x,.10,-.03),(x,-.2,-.06),(x*.1,-.25,-.03)],.012,red if x<0 else blue)
  lamp=target('lamp',(.5,-.36,-.06));cyl(lamp,'Bisel piloto',(0,0,0),.085,.04,steel);o=cyl(lamp,'sr134_indicator',(0,0,-.028),.063,.02,dark)
 else:
  for key,x in [('terminalL',-.43),('terminalR',.43)]:
   g=target(key,(x,.08,-.08));box(g,'Soporte aislante',(0,0,0),(.30,.34,.055),dark,.008);box(g,'Zapata de cobre',(0,-.03,-.043),(.12,.26,.028),copper,.007);cyl(g,'Perno roscado',(0,.04,-.065),.035,.06,steel);cyl(g,'Tuerca hexagonal',(0,.04,-.10),.06,.04,steel,n=6)
   for i in range(5):box(g,'sr134_dust',(-.06+i*.03,-.12,-.063),(.020,.05,.004),dirt,0)
  tube(root,'Puente de conexión',[(-.43,-.1,-.11),(-.30,-.23,-.12),(.30,-.23,-.12),(.43,-.1,-.11)],.025,copper)
  indicator=target('indicator',(0,-.37,-.06));cyl(indicator,'Bisel piloto',(0,0,0),.085,.04,steel);cyl(indicator,'sr134_indicator',(0,0,-.028),.063,.02,dark)
 # A physical tray, panel screws and discrete instrument cradle stay outside the active components.
 box(root,'Bandeja de retirados',(.73,-.55,-.12),(.5,.025,.35),dark,.01)
 for x in [-.84,.84]:
  for y in [-.50,.50]:screw(root,'Fijacion panel',(x,y,-.001),steel,dark,.012)
 text(root,'Alcance','BANCO DIDACTICO / DATOS SIMULADOS',(0,-.53,-.006),.035,dark)
 export(root,'servicio_'+kind,WEB/('servicio_'+kind+'.glb.gz'))
print('BUILD134_COMPLETE',flush=True)
