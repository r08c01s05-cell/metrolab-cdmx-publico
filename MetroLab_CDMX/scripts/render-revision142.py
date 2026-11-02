import bpy,math,sys
from pathlib import Path
from mathutils import Vector,Matrix
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision142';V=O/'vistas';V.mkdir(exist_ok=True);C=Matrix.Rotation(math.pi/2,4,'X')
def shot(name,eye,target,scale):
 sc=bpy.context.scene;sc.render.engine='CYCLES';sc.cycles.samples=16;sc.cycles.use_denoising=True;sc.render.resolution_x=1100;sc.render.resolution_y=760;sc.render.resolution_percentage=100;sc.world=sc.world or bpy.data.worlds.new('World142');sc.world.color=(.20,.20,.20)
 for pos,power,size in [((0,5,-4),750,5),((-4,3,-1),450,4),((4,4,2),600,4)]:
  d=bpy.data.lights.new('Softbox142','AREA');d.energy=power;d.shape='DISK';d.size=size;o=bpy.data.objects.new('Softbox142',d);sc.collection.objects.link(o);o.location=C@Vector(pos);o.rotation_euler=((C@Vector(target))-o.location).to_track_quat('-Z','Y').to_euler()
 d=bpy.data.cameras.new('Vista QA142');o=bpy.data.objects.new('Vista QA142',d);sc.collection.objects.link(o);o.location=C@Vector(eye);o.rotation_euler=((C@Vector(target))-o.location).to_track_quat('-Z','Y').to_euler();d.type='ORTHO';d.ortho_scale=scale;sc.camera=o;sc.render.filepath=str(V/(name+'.png'));bpy.ops.render.render(write_still=True)
bpy.ops.wm.open_mainfile(filepath=str(O/'instrumentos142.blend'))
for i,k in enumerate(['dmm','megohm','anemometer']):bpy.data.objects['instrument142_'+k].location.x=(i-1)*.69
shot('instrumentos142',(1,1.2,4),(0,.07,0),2.4)
bpy.ops.wm.open_mainfile(filepath=str(O/'servicio_ventilation142.blend'));shot('filtro142',(-1.4,.4,-3.5),(0,0,0),2.5)
bpy.ops.wm.open_mainfile(filepath=str(O/'subestacion142.blend'))
for o in bpy.context.scene.objects:
 if o.type=='EMPTY' and o.name.startswith('Puerta de gabinete'):o.rotation_euler.z=math.radians(105)*o.get('openSign138',1)
cut=bpy.data.objects['Cerramiento_retirado']
for o in [cut]+list(cut.children_recursive):o.hide_render=True
for o in [bpy.data.objects['roof']]+list(bpy.data.objects['roof'].children_recursive):o.hide_render=True
shot('subestacion142',(-12,11,-15),(0,1,0),18)
