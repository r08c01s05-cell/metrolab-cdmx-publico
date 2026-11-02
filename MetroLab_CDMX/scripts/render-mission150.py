from pathlib import Path
import bpy,math
from mathutils import Vector,Matrix
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision150';V=O/'vistas';C=Matrix.Rotation(math.pi/2,4,'X')
# Native preview of the mounted fixture within the original installation (runtime tools are assembled on the web).
bpy.ops.wm.open_mainfile(filepath=str(O/'subestacion150.blend'))
for o in bpy.data.objects:
 if o.type=='EMPTY'and o.name.startswith('Puerta de gabinete'):
  o.rotation_mode='XYZ';o.rotation_euler.z=math.radians(-105)if o.parent.name=='control'else 0
for name in ['roof','Cerramiento_retirado']:
 for o in [bpy.data.objects[name]]+list(bpy.data.objects[name].children_recursive):o.hide_render=True
with bpy.data.libraries.load(str(O/'relay150.blend'),link=False)as(a,b):b.objects=list(a.objects)
objs=[o for o in b.objects if o];roots=[o for o in objs if o.parent not in objs]
for o in objs:
 if not o.users_collection:bpy.context.collection.objects.link(o)
rig=roots[0];rig.location=C@Vector((6.25,1.87,1.30));rig.scale=(.55,.55,.55)
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=14;s.cycles.use_denoising=True;s.render.resolution_x=1200;s.render.resolution_y=800;s.render.resolution_percentage=100
s.world=s.world or bpy.data.worlds.new('World150');s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.6
for o in list(bpy.data.objects):
 if o.type in ['LIGHT','CAMERA']:bpy.data.objects.remove(o,do_unlink=True)
for xyz,power,size in [((4,4,-1),450,4),((7,3,-1),250,3)]:
 d=bpy.data.lights.new('Difusa150','AREA');d.energy=power;d.size=size;o=bpy.data.objects.new('Difusa150',d);s.collection.objects.link(o);o.location=C@Vector(xyz);o.rotation_euler=(C@Vector((6.4,1.8,1.3))-o.location).to_track_quat('-Z','Y').to_euler()
d=bpy.data.cameras.new('Inspeccion150');o=bpy.data.objects.new('Inspeccion150',d);s.collection.objects.link(o);o.location=C@Vector((6.1,1.9,-.9));o.rotation_euler=(C@Vector((6.4,1.7,1.3))-o.location).to_track_quat('-Z','Y').to_euler();d.lens=35;s.camera=o;s.render.filepath=str(V/'mantenimiento-instalado150.png');bpy.ops.render.render(write_still=True)
