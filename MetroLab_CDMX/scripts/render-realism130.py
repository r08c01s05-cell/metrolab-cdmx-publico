"""Auxiliary Cycles material comparison, not a browser screenshot."""
from pathlib import Path
import bpy,json,math
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets-source/realismo130'
for version in ['before','after']:
 bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath='/tmp/MP82-compact130.glb');scene=bpy.context.scene
 params={m['name']:m for m in json.loads((OUT/(version+'.json')).read_text())}
 for m in bpy.data.materials:
  q=params.get(m.name)
  if not q or not m.use_nodes:continue
  bs=m.node_tree.nodes.get('Principled BSDF')
  if not bs:continue
  bs.inputs['Metallic'].default_value=q['metalness'];bs.inputs['Roughness'].default_value=q['roughness'];bs.inputs['Coat Weight'].default_value=q['coat'];bs.inputs['Coat Roughness'].default_value=q['coatRough']
  for link in list(m.node_tree.links):
   if link.to_node==bs and link.to_socket==bs.inputs['Roughness']:m.node_tree.links.remove(link)
  # Microstructure preview of the new profile, without replacing authored color textures.
  if q['normal']>0:
   n=m.node_tree.nodes.new('ShaderNodeTexNoise');n.inputs['Scale'].default_value=230;b=m.node_tree.nodes.new('ShaderNodeBump');b.inputs['Strength'].default_value=q['normal'];b.inputs['Distance'].default_value=.0006;m.node_tree.links.new(n.outputs['Fac'],b.inputs['Height']);m.node_tree.links.new(b.outputs['Normal'],bs.inputs['Normal'])
 meshes=[o for o in scene.objects if o.type=='MESH'];coords=[o.matrix_world@Vector(v) for o in meshes for v in o.bound_box];lo=Vector(tuple(min(v[a] for v in coords)for a in range(3)));hi=Vector(tuple(max(v[a] for v in coords)for a in range(3)));center=(lo+hi)/2
 bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,lo.z-.025));floor=bpy.context.object;mat=bpy.data.materials.new('Neutral floor');mat.diffuse_color=(.15,.17,.17,1);floor.data.materials.append(mat)
 world=bpy.data.worlds.new('Studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.2,.23,.24,1);world.node_tree.nodes['Background'].inputs[1].default_value=.6 if version=='before' else .34;scene.world=world
 for pos,power,size in [((3,-4,9),1900 if version=='before' else 1450,7),((-6,4,6),1250 if version=='before' else 650,6)]:
  bpy.ops.object.light_add(type='AREA',location=center+Vector(pos));l=bpy.context.object;l.data.energy=power;l.data.size=size;l.rotation_euler=(center-l.location).to_track_quat('-Z','Y').to_euler()
 bpy.ops.object.camera_add(location=center+Vector((12,-15,8)));cam=bpy.context.object;cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=20;scene.camera=cam
 scene.render.engine='CYCLES';scene.cycles.samples=12;scene.cycles.use_denoising=True;scene.render.resolution_x=1250;scene.render.resolution_y=800;scene.render.resolution_percentage=100;scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.filepath=str(OUT/(version+'.png'));bpy.ops.render.render(write_still=True)
print('MATERIAL_PREVIEW_COMPLETE',flush=True)
