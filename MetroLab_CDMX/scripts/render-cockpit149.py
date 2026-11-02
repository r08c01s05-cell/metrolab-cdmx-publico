from pathlib import Path
import bpy,math,gzip
from mathutils import Vector,Matrix
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision149';V=O/'vistas';V.mkdir(exist_ok=True);C=Matrix.Rotation(math.pi/2,4,'X')
bpy.ops.wm.open_mainfile(filepath=str(O/'pupitres149.blend'))
(O/'guante-temp.glb').write_bytes(gzip.decompress((R/'dist/models/mantenimiento104/guante.glb.gz').read_bytes()))
for side in [-1,1]:
 before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(O/'guante-temp.glb'));added=set(bpy.data.objects)-before
 root=bpy.data.objects.new('Mano de conduccion149 '+str(side),None);bpy.context.collection.objects.link(root)
 for obj in added:
  if obj.parent not in added:obj.parent=root
 root.rotation_euler.x=-math.pi/2;root.scale=(side*.85,.85,.85)
 goal=Vector((-.55,-.265,-1.075)if side<0 else(.58,-.35,-1.04));offset=Matrix.Rotation(-math.pi/2,4,'X')@(C@Vector((0,.06*.85,0)));root.location=C@goal-offset
 end=root.location+root.rotation_euler.to_matrix()@(C@Vector((0,-.30*.85,0)));start=C@Vector((side*1.2,-.85,-.20));direction=end-start
 bpy.ops.mesh.primitive_cone_add(vertices=20,radius1=.073,radius2=.052,depth=direction.length,location=(start+end)*.5);sleeve=bpy.context.object;sleeve.name='Manga continua149';sleeve.rotation_euler=direction.to_track_quat('Z','Y').to_euler();cloth=bpy.data.materials.get('Tejido manga149')or bpy.data.materials.new('Tejido manga149');cloth.use_nodes=True;cloth.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.026,.04,.045,1);cloth.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=.93;sleeve.data.materials.append(cloth)
 for f in sleeve.data.polygons:f.use_smooth=True
 for obj in added:
  if obj.type=='ARMATURE':
   for b in obj.pose.bones:
    if b.name.startswith('finger104_'):
     j=int(b.name.split('_')[-1]);b.rotation_mode='XYZ';b.rotation_euler.x-=[.48,.80,.48][j]if side<0 else[.24,.38,.20][j]
(O/'guante-temp.glb').unlink()
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=20;s.cycles.use_denoising=True;s.render.resolution_x=1440;s.render.resolution_y=810;s.render.resolution_percentage=100
s.world=bpy.data.worlds.new('World149');s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.17,.22,.23,1);s.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.5
for pos,power,size in [((-1,2,1),100,3),((2,1,0),80,2)]:
 d=bpy.data.lights.new('Luz difusa149','AREA');d.energy=power;d.size=size;o=bpy.data.objects.new('Luz difusa149',d);s.collection.objects.link(o);o.location=C@Vector(pos);o.rotation_euler=(C@Vector((0,-.4,-1))-o.location).to_track_quat('-Z','Y').to_euler()
d=bpy.data.cameras.new('Camara primera persona149');o=bpy.data.objects.new(d.name,d);s.collection.objects.link(o);ret=max(0,1.05/(math.tan(math.radians(26))*1440/810)-1.1);o.location=C@Vector((0,ret*.30,ret));o.rotation_euler=(C@Vector((0,0,-1))).to_track_quat('-Z','Y').to_euler();d.type='PERSP';d.lens_unit='FOV';d.angle=2*math.atan(math.tan(math.radians(26))*1440/810);d.clip_start=.025;s.camera=o
for kind in ['classic','modern']:
 for k in ['classic','modern']:
  root=bpy.data.objects['cab149_'+k]
  for obj in [root]+list(root.children_recursive):obj.hide_render=k!=kind
 s.render.filepath=str(V/('cabina-'+kind+'149.png'));bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str(O/'conduccion149.blend'),compress=True)
