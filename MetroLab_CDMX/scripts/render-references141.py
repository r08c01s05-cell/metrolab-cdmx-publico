import bpy,math,sys
from pathlib import Path
from mathutils import Matrix,Vector
kind=sys.argv[-1];R=str(Path(__file__).resolve().parents[1]/'assets-source/revision141')+'/';bpy.ops.wm.open_mainfile(filepath=R+('NM79_intermedio.blend'if kind=='train'else'Garibaldi_Lagunilla141.blend'));s=bpy.context.scene;C=Matrix.Rotation(math.pi/2,4,'X');s.world=bpy.data.worlds.new('Iluminacion de referencia');s.world.color=(.16,.17,.18)
def light(p,t,e,size):
 d=bpy.data.lights.new('Rebote suave','AREA');d.energy=e;d.shape='DISK';d.size=size;o=bpy.data.objects.new('Rebote suave',d);s.collection.objects.link(o);o.location=C@Vector(p);o.rotation_euler=(C@Vector(t)-o.location).to_track_quat('-Z','Y').to_euler()
if kind=='train':
 for x in [-6,-3,0,3,6]:
  for z in [-.9,.9]:light((x,3.1,z),(x,1.2,0),28,2.0)
 eye=(-6.6,2.50,.12);target=(0.3,2.56,0);lens=18
else:
 for x in range(-54,55,9):
  for z in [-4.1,4.1]:light((x,4.75,z),(x,1.2,z),220,4.0)
 eye=(-37,2.86,-4.7);target=(26,2.8,-3.3);lens=20
bpy.ops.object.camera_add();cam=bpy.context.object;cam.location=C@Vector(eye);cam.rotation_euler=(C@Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=lens;s.camera=cam;s.render.engine='CYCLES';s.cycles.samples=16;s.cycles.use_denoising=True;s.render.resolution_x=1000;s.render.resolution_y=750;s.render.resolution_percentage=100;s.render.filepath=R+'vistas/'+kind+'141.png';bpy.ops.render.render(write_still=True)
