import bpy,math
from pathlib import Path
from mathutils import Vector,Matrix
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision143';V=O/'vistas';V.mkdir(parents=True,exist_ok=True);C=Matrix.Rotation(math.pi/2,4,'X')
for name in ['puntas_soportes143','puntas_diodos143','puntas_auxiliar143','puntas_tablero143']:
 bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(O/(name+'.glb')));sc=bpy.context.scene;sc.world=bpy.data.worlds.new('World');sc.world.color=(.15,.15,.15);sc.render.engine='CYCLES';sc.cycles.samples=20;sc.cycles.use_denoising=True;sc.render.resolution_x=1200;sc.render.resolution_y=800;sc.render.resolution_percentage=100
 train='tablero' in name;target=Vector((.15,1.1,.1)if train else(0,-.08,-.1));eye=Vector((.0,2.2,6)if train else(.15,.35,-4));scale=5.4 if train else 2.75
 for pos,power,size in [((-2,4,4 if train else -3),600,4),((3,2,1 if train else -2),350,3)]:
  d=bpy.data.lights.new('Difusa143','AREA');d.energy=power;d.size=size;o=bpy.data.objects.new('Difusa143',d);sc.collection.objects.link(o);o.location=C@Vector(pos);o.rotation_euler=(C@target-o.location).to_track_quat('-Z','Y').to_euler()
 d=bpy.data.cameras.new('Inspeccion143');o=bpy.data.objects.new('Inspeccion143',d);sc.collection.objects.link(o);o.location=C@eye;o.rotation_euler=(C@target-o.location).to_track_quat('-Z','Y').to_euler();d.type='ORTHO';d.ortho_scale=scale;sc.camera=o;sc.render.filepath=str(V/(name+'.png'));bpy.ops.wm.save_as_mainfile(filepath=str(O/(name+'.blend')),compress=True);bpy.ops.render.render(write_still=True)
