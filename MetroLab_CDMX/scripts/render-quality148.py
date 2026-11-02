from pathlib import Path
import bpy,math
from mathutils import Vector,Matrix
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision148';V=O/'vistas';V.mkdir(exist_ok=True);C=Matrix.Rotation(math.pi/2,4,'X')
def render(name,eye,target,scale):
 s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=14;s.cycles.use_denoising=True;s.render.resolution_x=1000;s.render.resolution_y=700;s.render.resolution_percentage=100;s.world=s.world or bpy.data.worlds.new('World148');s.world.use_nodes=True;s.world.node_tree.nodes.get('Background').inputs['Color'].default_value=(.24,.28,.29,1);s.world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.5
 for pos,power,size in [((-5,7,-4),1100,6),((5,5,-2),850,5),((0,5,4),750,5)]:
  data=bpy.data.lights.new('Softbox148','AREA');data.energy=power;data.shape='DISK';data.size=size;o=bpy.data.objects.new('Softbox148',data);s.collection.objects.link(o);o.location=C@Vector(pos);o.rotation_euler=(C@Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
 cam=bpy.data.cameras.new('Camera148');o=bpy.data.objects.new('Camera148',cam);s.collection.objects.link(o);o.location=C@Vector(eye);o.rotation_euler=(C@Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();cam.type='ORTHO';cam.ortho_scale=scale;s.camera=o;s.render.filepath=str(V/(name+'.png'));bpy.ops.render.render(write_still=True)
bpy.ops.wm.open_mainfile(filepath=str(O/'substation148.blend'))
for name in ['roof','Cerramiento_retirado']:
 root=bpy.data.objects.get(name)
 if root:
  for o in [root]+list(root.children_recursive):o.hide_render=True
for o in bpy.data.objects:
 if o.type=='EMPTY' and 'Puerta de gabinete' in o.name:o.rotation_mode='QUATERNION';o.rotation_quaternion=(1,0,0,0)
render('tablero148',(1.2,2.5,-3.3),(1.2,1.6,1.2),3.5)
render('substation148',(-11,10,-13),(0,1,0),17)
for o in bpy.data.objects:
 if o.type=='EMPTY'and 'Puerta de gabinete' in o.name:o.rotation_mode='XYZ';o.rotation_euler.z=math.radians(-95)
render('interior148',(0,3.2,-5),(0,1.3,1.8),7.5)
for kind in ['diodes','control','battery','ventilation','insulation','relay']:
 bpy.ops.wm.open_mainfile(filepath=str(O/(kind+'148.blend')));render(kind+'148',(-1.5,.9,-3.4),(0,.05,0),2.7)

for kind in ['doors','ventilation_train','running','electrical']:
 bpy.ops.wm.open_mainfile(filepath=str(O/(kind+'148.blend')));render(kind+'148',(3,2.4,4),(.2,1.15,0),4.8)
