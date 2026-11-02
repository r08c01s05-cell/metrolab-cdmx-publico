"""Native Blender 4.3 technical training benches, editable .blend + embedded GLB."""
from pathlib import Path
import bpy,math,gzip,random
from mathutils import Vector,Matrix
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets-source/subestaciones129';WEB=ROOT/'dist/models/subestaciones129';OUT.mkdir(parents=True,exist_ok=True);WEB.mkdir(parents=True,exist_ok=True)
C=Matrix.Rotation(math.pi/2,4,'X')
def p(v):return C.to_3x3()@Vector(v)
for kind in ['diodes','insulation','relay']:
 bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1;objects=[];groups={}
 def empty(name,parent=None,xyz=(0,0,0)):
  o=bpy.data.objects.new(name,None);scene.collection.objects.link(o);o.parent=parent;o.location=p(xyz);objects.append(o);return o
 root=empty('sr129_'+kind);root['asset129']=True;root['trainingOnly']=True;root['units']='metres'
 def mat(name,color,metal=.1,rough=.5):
  m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*color,1);b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough;return m
 steel=mat('Acero satinado',(.42,.48,.51),.83,.3);dark=mat('Polimero grafito',(.025,.047,.057),.05,.65);paint=mat('Pintura banco',(.15,.27,.28),.16,.48);white=mat('Ceramica y leyendas',(.75,.8,.72),0,.65);copper=mat('Cobre',(.48,.21,.08),.85,.3);red=mat('Goma roja',(.5,.045,.025),0,.75);black=mat('Goma negra',(.012,.017,.018),0,.85);green=mat('Indicador verde',(.12,.55,.3),.1,.35);glass=mat('LCD fondo',(.08,.14,.12),0,.48)
 # A small packed roughness texture survives GLB export as an embedded image.
 random.seed(129);im=Image.new('RGB',(32,32));im.putdata([(110+(v:=random.randrange(30)),110+v,110+v) for _ in range(1024)]);path=OUT/'rough129.png';im.save(path);tex=bpy.data.images.load(str(path));tex.colorspace_settings.name='Non-Color';tex.pack();n=paint.node_tree.nodes.new('ShaderNodeTexImage');n.image=tex;paint.node_tree.links.new(n.outputs['Color'],paint.node_tree.nodes['Principled BSDF'].inputs['Roughness'])
 def box(name,xyz,size,material,parent=root,bevel=.002):
  bpy.ops.mesh.primitive_cube_add(size=1);o=bpy.context.object;o.name=name;o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.parent=parent;o.location=p(xyz);o.data.materials.append(material);objects.append(o)
  if bevel:mod=o.modifiers.new('Bisel mecanizado','BEVEL');mod.width=bevel;mod.segments=2
  return o
 def cyl(name,xyz,r,depth,material,parent=root,front=True):
  bpy.ops.mesh.primitive_cylinder_add(vertices=20,radius=r,depth=depth);o=bpy.context.object;o.name=name;o.parent=parent;o.location=p(xyz);o.data.materials.append(material);objects.append(o)
  if front:o.rotation_euler.x=math.pi/2
  mod=o.modifiers.new('Bisel circular','BEVEL');mod.width=.001;mod.segments=1;return o
 def label(text,xyz,size=.04,parent=root,material=white,name='Leyenda'):
  bpy.ops.object.select_all(action='DESELECT');c=bpy.data.curves.new(name,'FONT');c.body=text;c.resolution_u=3;c.size=size;c.align_x='CENTER';c.extrude=0;o=bpy.data.objects.new(name,c);scene.collection.objects.link(o);o.parent=parent;o.location=p(xyz);o.rotation_euler=(math.pi/2,0,math.pi);o.data.materials.append(material);objects.append(o);o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH');return o
 def target(key,xyz):
  g=empty('sr129_target_'+key,root,xyz);g['srTarget128']=key;groups[key]=g;return g
 def terminal(key,xyz,title):
  g=target(key,xyz);cyl('Aislador borne',(0,0,0),.05,.035,red if key not in ['earth','A2','refK','K'] else black,g);cyl('Contacto borne',(0,0,-.025),.018,.03,steel,g);label(title,(xyz[0],xyz[1]-.10,xyz[2]-.035),.045);return g
 box('Mesa de servicio',(0,-.63,.1),(2.25,.12,.65),steel);box('Panel tecnico',(0,0,.08),(2.15,1.18,.08),paint)
 for x in [-.95,.95]:box('Pata',(x,-.83,.1),(.09,.33,.45),steel)
 title={'diodes':'DIODOS · MODULO AISLADO','insulation':'AISLAMIENTO · BANCO VIRTUAL','relay':'RELE AUXILIAR · 24 V CD'}[kind];label(title,(0,.5,.025),.06);label('DATOS SIMULADOS · SIN CONEXION A LA SUBESTACION',(0,-.53,.025),.035)
 # Instrument holster, face, LCD, selector and lead sockets.
 box('Instrumento · funda',(.71,-.01,-.075),(.53,.91,.18),dark,bevel=.025);box('Instrumento · cara',(.71,-.01,-.175),(.46,.82,.035),white,bevel=.016);box('sr129_screen',(.71,.25,-.203),(.39,.16,.018),glass)
 empty('sr129_display',root,(.71,.25,-.218));label('---',(.71,.23,-.22),.07,name='sr129_staticDisplay')
 dial=target('dial',(.71,-.02,-.218));cyl('Selector giratorio',(0,0,0),.105,.045,dark,dial);box('Indicador de modo',(0,.05,-.035),(.012,.065,.01),white,dial)
 for i in range(10):
  a=2*math.pi*i/10;box('Marca selector',(.71+math.sin(a)*.135,-.02+math.cos(a)*.135,-.213),(.008,.018,.004),black,bevel=0)
 label({'diodes':'DIODE','insulation':'R ISO','relay':'OHM'}[kind],(.71,.41,-.205),.045,material=dark)
 for key,x,m in [('sr129_redPort',.61,red),('sr129_blackPort',.81,black)]:g=empty(key,root,(x,-.35,-.215));cyl('Entrada punta',(0,0,0),.03,.025,m,g)
 for key,x,s in [('measure',.59,'TEST'),('release',.84,'CLEAR')]:g=target(key,(x,-.20,-.218));box('Tecla',(0,0,0),(.17,.08,.035),dark,g,.01);label(s,(x,-.215,-.241),.029)
 for color,x,material in [('red',-.99,red),('black',-.85,black)]:
  g=empty('sr129_'+color+'Probe',root,(x,-.19,-.19));cyl('Cuerpo punta',(0,0,0),.023,.22,material,g,front=False);cyl('Guarda de dedos',(0,-.10,0),.039,.025,material,g,front=False);cyl('Punta metalica',(0,-.15,0),.008,.07,steel,g,front=False)
 # Different service hardware for each technical activity.
 if kind=='diodes':
  module=target('module',(-.32,.12,-.08));box('Disipador',(0,0,.025),(.54,.36,.13),steel,module)
  for i in range(9):box('Aleta disipador',(-.23+i*.058,0,-.06),(.014,.33,.13),steel,module,.0008)
  cyl('Diodo de potencia',(0,0,-.15),.09,.07,white,module);cyl('Contacto diodo',(0,0,-.20),.025,.045,copper,module)
  terminal('A',(-.61,.13,-.23),'A');terminal('K',(-.03,.13,-.23),'K')
  box('Patron aislado',(-.33,-.28,-.08),(.6,.13,.07),dark);terminal('refA',(-.57,-.26,-.15),'A ref');terminal('refK',(-.08,-.26,-.15),'K ref')
  label('MODULO BAJO PRUEBA',(-.33,.39,-.08),.038)
 elif kind=='insulation':
  sample=target('sample',(-.33,.01,-.07));box('Soporte muestra',(0,0,0),(.65,.56,.08),dark,sample)
  for x in [-.18,.18]:
   for y in [-.15,.15]:cyl('Aislador ceramico',(x,y,-.06),.055,.09,white,sample)
  box('Ramal A',(-.18,0,-.12),(.05,.42,.04),copper,sample);box('Ramal B',(.18,0,-.12),(.05,.42,.04),copper,sample)
  terminal('lineA',(-.57,.31,-.15),'LINE A');terminal('lineB',(-.1,.31,-.15),'LINE B');terminal('earth',(-.34,-.32,-.16),'EARTH ensayo')
 else:
  relay=target('relay',(-.33,.05,-.09));box('Base de rele',(0,0,0),(.58,.49,.12),dark,relay)
  box('Bobina visible',(-.1,0,-.09),(.18,.28,.1),copper,relay)
  for i in range(9):box('Espira bobina',(-.18+i*.02,0,-.15),(.008,.27,.02),steel,relay,0)
  box('Nucleo rele',(-.1,0,-.16),(.045,.32,.035),steel,relay);arm=empty('sr129_armature',relay,(.1,.02,-.12));box('Armadura movil',(0,0,0),(.055,.31,.03),steel,arm)
  terminal('A1',(-.61,.36,-.14),'A1');terminal('A2',(-.06,.36,-.14),'A2');terminal('C',(-.61,-.27,-.14),'C');terminal('NO',(-.06,-.27,-.14),'NO')
  command=target('command',(-.33,-.36,-.13));cyl('Boton señal prueba',(0,0,0),.055,.035,green,command);label('TEST',(-.33,-.37,-.155),.025)
 # Render and export; studio elements are excluded from the asset selection.
 world=bpy.data.worlds.new('Estudio suave');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.11,.17,.19,1);world.node_tree.nodes['Background'].inputs[1].default_value=.5;scene.world=world
 bpy.ops.object.camera_add(location=p((2.3,1.5,-3.7)));cam=bpy.context.object;cam.rotation_euler=(p((0,0,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.95;scene.camera=cam
 for xyz,power,size in [((-2,4,-3),450,3),((2,2,-1),300,2)]:
  bpy.ops.object.light_add(type='AREA',location=p(xyz));o=bpy.context.object;o.data.energy=power;o.data.size=size;o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
 scene.render.engine='CYCLES';scene.cycles.samples=12;scene.cycles.use_denoising=True;scene.render.resolution_x=1100;scene.render.resolution_y=800;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.filepath=str(OUT/(kind+'.png'));scene.view_settings.view_transform='AgX'
 bpy.ops.wm.save_as_mainfile(filepath=str(OUT/(kind+'.blend')),compress=True)
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=root;bpy.ops.export_scene.gltf(filepath=str(OUT/(kind+'.glb')),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=False,export_cameras=False,export_lights=False)
 (WEB/(kind+'.glb.gz')).write_bytes(gzip.compress((OUT/(kind+'.glb')).read_bytes(),compresslevel=9,mtime=0));print('ASSET',kind,(WEB/(kind+'.glb.gz')).stat().st_size,flush=True);bpy.ops.render.render(write_still=True)
print('TECHNICAL_BLENDER_COMPLETE',flush=True)
