from pathlib import Path
import bpy,json,gzip
from mathutils import Vector
root=Path(__file__).resolve().parents[1];folder=root/'assets-source/taller132'
bpy.ops.wm.read_factory_settings(use_empty=True)
for item in json.loads(gzip.decompress((folder/'preview.json.gz').read_bytes())):
 v=item['vertices'];vertices=[v[i:i+3]for i in range(0,len(v),3)];idx=item['index'] or list(range(len(vertices)));faces=[idx[i:i+3]for i in range(0,len(idx),3)]
 mesh=bpy.data.meshes.new(item['name']);mesh.from_pydata(vertices,[],faces);mesh.update();obj=bpy.data.objects.new(item['name'],mesh);bpy.context.collection.objects.link(obj)
 mat=bpy.data.materials.new(item['name']);mat.use_nodes=True;bs=mat.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*item['color'],1);bs.inputs['Metallic'].default_value=item['metalness'];bs.inputs['Roughness'].default_value=item['roughness'];mesh.materials.append(mat)
 # Preserve hard edges in source models without blanket smoothing.
scene=bpy.context.scene;world=bpy.data.worlds.new('Taller');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.26,.29,.30,1);world.node_tree.nodes['Background'].inputs[1].default_value=.45;scene.world=world
for pos,power,size in [((-3,-4,5),850,5),((4,-1,4),350,4)]:
 bpy.ops.object.light_add(type='AREA',location=pos);l=bpy.context.object;l.data.energy=power;l.data.shape='DISK';l.data.size=size;l.rotation_euler=(Vector((0,0,1))-l.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(.55,-5.5,1.65));cam=bpy.context.object;cam.rotation_euler=(Vector((.35,0,1.12))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=35;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.use_denoising=True;scene.render.resolution_x=1100;scene.render.resolution_y=700;scene.render.resolution_percentage=100;scene.view_settings.view_transform='AgX';scene.render.filepath=str(folder/'taller.png');bpy.ops.render.render(write_still=True)
print('Workshop auxiliary preview complete',flush=True)
