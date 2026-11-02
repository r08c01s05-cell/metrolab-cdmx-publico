from pathlib import Path
import sys
sys.path.extend(["/usr/lib/python3.12/lib-dynload","/opt/codex/runtimes/codex-primary-runtime/dependencies/python/lib/python3.12/site-packages"])
import bpy,math
from mathutils import Vector,Matrix
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision157';V=O/'vistas';V.mkdir(exist_ok=True);C=Matrix.Rotation(math.pi/2,4,'X')
def render(n,eye,target,ortho=None):
 s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=16;s.cycles.use_denoising=False;s.render.resolution_x=800;s.render.resolution_y=520;s.render.resolution_percentage=100;s.world=s.world or bpy.data.worlds.new('World147');s.world.use_nodes=True;s.world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.35;s.world.node_tree.nodes.get('Background').inputs['Color'].default_value=(.26,.30,.32,1)
 for pos,power,size in [((0,3.4,0),260,5),((-4,3,0),150,3),((4,3,0),150,3)]:
  d=bpy.data.lights.new('Iluminacion difusa147','AREA');d.energy=power;d.shape='DISK';d.size=size;o=bpy.data.objects.new('Iluminacion difusa147',d);s.collection.objects.link(o);o.location=C@Vector(pos);o.rotation_euler=(C@Vector((pos[0],1.3,pos[2]))-o.location).to_track_quat('-Z','Y').to_euler()
 d=bpy.data.cameras.new('Camera147');o=bpy.data.objects.new('Camera147',d);s.collection.objects.link(o);o.location=C@Vector(eye);o.rotation_euler=(C@Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();d.lens=20 if not ortho else 50;d.clip_start=.025
 if ortho:d.type='ORTHO';d.ortho_scale=ortho
 s.camera=o;s.render.filepath=str(V/(n+'.png'));bpy.ops.render.render(write_still=True)
for model in ['NM79','MP82','NM22']:
 for unit in ['cabina','intermedio']:
  stem=model+'_'+unit;bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(O/(stem+'.glb')));bpy.context.scene.unit_settings.system='METRIC';bpy.ops.wm.save_as_mainfile(filepath=str(O/(stem+'.blend')),compress=True)
  if unit=='intermedio':render(stem+'_interior',(-6.3,2.75,0),(5,2.25,0))
  elif False:
   sign=1 if model=='MP82'else-1;render(stem+'_cabina',(sign*5.70,2.75,0),(sign*8.3,2.2,0))
