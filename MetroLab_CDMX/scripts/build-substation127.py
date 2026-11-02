"""Blender 4.3 authoring/export. Run after source-substation127.mjs.
PYTHONPATH=/tmp/blender127 python3.11 scripts/build-substation127.py
Coordinates and lengths are metres. The scene is illustrative, not a surveyed SR.
"""
from pathlib import Path
import bpy,json,math,random,gzip
from mathutils import Matrix,Vector
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets-source/subestaciones127';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1
C=Matrix.Rotation(math.pi/2,4,'X');CI=C.inverted()
base=json.loads((OUT/'base126.json').read_text());groups={};materials={};asset=bpy.data.collections.new('SR · MODELO EDITABLE');scene.collection.children.link(asset)
def move(o):
 for c in list(o.users_collection):c.objects.unlink(o)
 asset.objects.link(o)
def group(name,parent=None):
 o=bpy.data.objects.new(name,None);asset.objects.link(o);o.parent=parent;return o
root=group('SR_Blend127');root['kind']='SR';root['illustrative']=True;root['source']='METRO.pdf pp.14–16 y despieces aportados';root['primaryType']='dry';root['secondaryCount']=2;root['diodeCount']=12;root['tractionReturnBondedToPE']=False
for id in ['mt','transformer','rectifier','dc','control','battery','aux','cables','earth','civil','roof','fire']:
 groups[id]=group(id,root);groups[id]['partId']=id
groups['cut']=group('Cerramiento_retirado',groups['civil'])
# Small embedded PBR maps, independently editable; deterministic microstructure.
random.seed(127)
def texture(name,kind):
 im=Image.new('RGB',(128,128));pix=im.load()
 for y in range(128):
  for x in range(128):
   r=random.random();v=int(max(0,min(255,(.75 if kind=='mineral' else .36 if kind=='metal' else .49)*255+(r-.5)*18)))
   pix[x,y]=(v,v,v)
 path=OUT/(name+'.png');im.save(path,optimize=True);image=bpy.data.images.load(str(path));image.colorspace_settings.name='Non-Color';image.pack();return image
maps={k:texture('rugosidad_'+k,k) for k in ['mineral','metal','paint']}
for d in base['meshes']:
 name=d['material']
 if name not in materials:
  m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*d['color'],1);p.inputs['Metallic'].default_value=d['metalness'];p.inputs['Roughness'].default_value=d['roughness']
  if 'Pantalla' in name:p.inputs['Emission Color'].default_value=(*d['color'],1);p.inputs['Emission Strength'].default_value=.3
  else:
   k='mineral' if ('Concreto' in name or 'Piso' in name) else 'metal' if d['metalness']>.5 else 'paint';n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=maps[k];m.node_tree.links.new(n.outputs['Color'],p.inputs['Roughness'])
  materials[name]=m
 verts=[tuple(C.to_3x3()@Vector(d['positions'][i:i+3])) for i in range(0,len(d['positions']),3)];faces=[d['indices'][i:i+3] for i in range(0,len(d['indices']),3)]
 me=bpy.data.meshes.new(d['name']);me.from_pydata(verts,[],faces);me.update();uv=me.uv_layers.new(name='UVMap')
 for loop in me.loops:uv.data[loop.index].uv=d['uv'][loop.vertex_index*2:loop.vertex_index*2+2]
 for p in me.polygons:p.use_smooth=True
 normals=[tuple(C.to_3x3()@Vector(d['normals'][i:i+3])) for i in range(0,len(d['normals']),3)];me.normals_split_custom_set_from_vertices(normals)
 o=bpy.data.objects.new(d['name'],me);asset.objects.link(o);o.parent=groups['cut'] if d['cut'] else groups[d['part']];o.matrix_world=C@Matrix([d['matrix'][i:i+4] for i in range(0,16,4)]).transposed()@CI;me.materials.append(materials[d['material']]);o['component']=d['name']
 # Native small bevels catch highlights on cabinets, bases and equipment.
 if len(verts)==24 and min(o.dimensions)>.025:
  mod=o.modifiers.new('Aristas mecanizadas · 2 mm','BEVEL');mod.width=min(.002,min(o.dimensions)*.035);mod.segments=2;mod.limit_method='ANGLE'
metal=materials['SR126 Acero cepillado'];paint=materials['SR126 Pintura'];dark=materials['SR126 Panel grafito'];yellow=materials['SR126 Pintura amarilla'];white=materials['SR126 Panel marfil'];red=materials['SR126 Pintura roja']
def pos(v):return C.to_3x3()@Vector(v)
def box(id,name,v,size,mat,bevel=.003):
 bpy.ops.mesh.primitive_cube_add(size=1,location=pos(v));o=bpy.context.object;o.name=name;o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);move(o);o.parent=groups[id];o.data.materials.append(mat)
 if bevel:mod=o.modifiers.new('Bisel','BEVEL');mod.width=bevel;mod.segments=2
 return o
def cylinder(id,name,v,r,depth,mat,axis='front',verts=16):
 bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=depth,location=pos(v));o=bpy.context.object;o.name=name;move(o);o.parent=groups[id];o.data.materials.append(mat)
 if axis=='front':o.rotation_euler.x=math.pi/2
 mod=o.modifiers.new('Bisel torneado','BEVEL');mod.width=.0015;mod.segments=2
 return o
def text(id,name,s,v,size=.085,mat=white):
 c=bpy.data.curves.new(name,'FONT');c.body=s;c.size=size;c.extrude=.0003;c.align_x='CENTER';o=bpy.data.objects.new(name,c);asset.objects.link(o);o.parent=groups[id];o.location=pos(v);o.rotation_euler.x=math.pi/2;o.rotation_euler.z=math.pi;o.data.materials.append(mat);bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False);return o
# Engraved equipment plates, not fabricated serial numbers or OEM branding.
plates=[('mt',-5.18,'01  MEDIA TENSION'),('transformer',-1.85,'02  TRANSFORMADOR SECO'),('rectifier',1.15,'03  RECTIFICACION'),('dc',4.27,'04  DISTRIBUCION CD'),('control',6.25,'05  CONTROL / RTU')]
for id,x,label in plates:
 w=1.5 if id=='transformer' else 1.05;box(id,'Placa de identificación',(x,.3,.98),(w,.2,.025),dark);text(id,'Leyenda del conjunto',label,(x,.29,.963),.061)
# Door panels sit alongside the open cells, preserving inspection access.
for id,x,w in [('mt',-6.3,1.02),('mt',-5.18,1.02),('mt',-4.06,1.02),('rectifier',1.15,1.8),('dc',3.7,1.05),('dc',4.85,1.05),('control',6.25,1.15)]:
 hinge=group('Puerta de gabinete · abatida',groups[id]);hinge.location=pos((x-w/2,.2,1.55));hinge.rotation_euler.z=math.radians(105)
 door=box(id,'Hoja de gabinete',(x,.2+1.2,1.55),(w-.04,2.4,.035),paint);world=door.matrix_world.copy();door.parent=hinge;door.matrix_world=world
 # Place the leaf locally; rotating the hinge opens it out into the service aisle.
 door.location=(w/2,0,1.2);door.rotation_euler=(0,0,0)
 for y in [.48,2.15]:
  o=cylinder(id,'Bisagra de puerta',(0,0,0),.025,.11,metal,axis='up');o.parent=hinge;o.location=(.02,0,y);o.rotation_euler=(0,0,0)
 for k in range(9):
  o=box(id,'Ranura de ventilación',(0,0,0),(w*.55,.018,.008),dark,0);o.parent=hinge;o.location=(w/2,-.022,.25+k*.045);o.rotation_euler=(0,0,0)
 o=box(id,'Tirador de puerta',(0,0,0),(.028,.18,.06),metal);o.parent=hinge;o.location=(w-.12,-.05,1.1);o.rotation_euler=(0,0,0)
# Recessed cabinet anchors and slotted fasteners.
for id,x in [('mt',-6.3),('mt',-5.18),('mt',-4.06),('rectifier',1.15),('dc',3.7),('dc',4.85),('control',6.25)]:
 for dx in [-.35,.35]:
  for y in [.46,2.6]:
   cylinder(id,'Tornillo ranurado',(x+dx,y,1.52),.019,.012,metal);box(id,'Ranura tornillo',(x+dx,y,1.51),(.024,.003,.004),dark,0)
# Fan impellers and protective grille bars, transformer front and rectifier top.
for x in [-2.75,-.95]:
 for a in [0,math.pi/3,2*math.pi/3]:
  o=box('transformer','Aspa ventilador',(x,.51,1.175),(.24,.04,.012),metal,.008);o.rotation_euler.y=a
 for k in range(7):box('transformer','Rejilla ventilador',(x-.13+k*.044,.51,1.16),(.008,.27,.008),metal,.001)
 cylinder('transformer','Buje ventilador',(x,.51,1.15),.035,.035,dark)
# Walkway edge, equipment plinth stripes and safety symbol at MT.
for x in [-6,-4,-2,0,2,4,6]:box('civil','Marca de zona de servicio',(x,.065,-.65),(1.8,.012,.045),yellow,0)
for x in [-6.3,-5.18,-4.06]:
 # Triangle lies in the X/Z plane of Blender, normal toward the service aisle.
 me=bpy.data.meshes.new('Peligro eléctrico');me.from_pydata([pos((x-.12,2.78,1.51)),pos((x+.12,2.78,1.51)),pos((x,2.99,1.51))],[],[(0,2,1)]);me.materials.append(yellow);o=bpy.data.objects.new('Señal · riesgo eléctrico',me);asset.objects.link(o);o.parent=groups['mt'];text('mt','Símbolo eléctrico','!',(x,2.8,1.50),.14,dark)
# Structural roof supports and equipment cable-entry glands.
for x in [-6,-2,2,6]:box('roof','Correa estructural',(x,3.87,0),(.12,.16,9.7),metal)
for x in [-6.3,-5.18,-4.06,1.15,3.7,4.85,6.25]:
 for dx in [-.18,.18]:cylinder('cables','Prensaestopa',(x+dx,.3,2.1),.047,.08,dark,axis='up')
# Default Blender view is the same open interior as the web explorer.
for o in asset.objects:
 if o.parent==groups['cut'] or o.parent==groups['roof']:o.hide_render=True
# Camera and studio lights are editable, excluded from the GLB asset selection.
world=bpy.data.worlds.new('Ambiente suave');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.13,.18,.21,1);world.node_tree.nodes['Background'].inputs[1].default_value=.5;scene.world=world
bpy.ops.object.camera_add(location=pos((14,12,-18)));cam=bpy.context.object;cam.name='Camara · interior';cam.rotation_euler=(pos((0,1,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=22;scene.camera=cam
for name,v,power,size in [('Luz principal',(-4,10,-5),2500,8),('Luz relleno',(7,7,-2),1800,7),('Luz posterior',(0,8,4),2000,6)]:
 bpy.ops.object.light_add(type='AREA',location=pos(v));o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(pos((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=12;scene.cycles.use_denoising=True;scene.render.resolution_x=1400;scene.render.resolution_y=950;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.filepath=str(OUT/'subestacion127.png')
# Save a usable, organized Blender workspace.
for area in bpy.context.screen.areas:
 if area.type=='VIEW_3D':area.spaces.active.region_3d.view_distance=22;area.spaces.active.region_3d.view_location=(0,0,1)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'subestacion_rectificadora.blend'),compress=True)
bpy.ops.object.select_all(action='DESELECT')
for o in asset.objects:o.select_set(True)
bpy.context.view_layer.objects.active=root
bpy.ops.export_scene.gltf(filepath=str(OUT/'subestacion_rectificadora.glb'),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_yup=True,export_animations=False,export_cameras=False,export_lights=False,export_materials='EXPORT',export_image_format='AUTO')
web=ROOT/'dist/models/subestaciones127';web.mkdir(parents=True,exist_ok=True);raw=(OUT/'subestacion_rectificadora.glb').read_bytes();(web/'rectificadora.glb.gz').write_bytes(gzip.compress(raw,compresslevel=9,mtime=0))
print('GLB_BYTES',len(raw),'GZIP_BYTES',(web/'rectificadora.glb.gz').stat().st_size,flush=True)
bpy.ops.render.render(write_still=True)
print('BLENDER_BUILD_COMPLETE',flush=True)
