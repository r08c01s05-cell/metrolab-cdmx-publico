"""Native Blender fittings observed in the four new L8 photographs; metres, +Y up on export."""
import bpy,math,sys
from pathlib import Path
from mathutils import Vector
sys.path.insert(0,str(Path(__file__).parent))
from parts140 import empty,mat,box,axial,mesh,C
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision141';O.mkdir(exist_ok=True,parents=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
root=empty('Accesorios interiores L8 referencia141')
steel=mat('Acero satinado luminaria141',(.43,.46,.46),.88,.39)
paint=mat('Chapa marfil luminaria141',(.63,.65,.60),.04,.46)
black=mat('Junta luminaria141',(.011,.014,.015),0,.87)
opal=mat('Difusor opalino estriado141',(.76,.78,.70),0,.52)
b=opal.node_tree.nodes['Principled BSDF'];b.inputs['Emission Color'].default_value=(.76,.78,.69,1);b.inputs['Emission Strength'].default_value=.85
# Embedded tangent-space flutes: a cylindrical reeded cover, no baked reflections or dirt.
im=bpy.data.images.new('Estrias policarbonato141',width=128,height=128);pixels=[]
for y in range(128):
 for x in range(128):
  nx=.16*math.sin(x*2*math.pi/8);pixels += [.5+nx*.5,.5,math.sqrt(1-nx*nx)*.5+.5,1]
im.pixels[:]=pixels;im.colorspace_settings.name='Non-Color';im.pack();tex=opal.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im;n=opal.node_tree.nodes.new('ShaderNodeNormalMap');n.inputs['Strength'].default_value=.4;opal.node_tree.links.new(tex.outputs['Color'],n.inputs['Color']);opal.node_tree.links.new(n.outputs['Normal'],b.inputs['Normal'])
light=empty('Luminaria estriada141',root);light['detail141']='ribbed_luminaire';light['source141']='011259,011308,011323'
box(light,'Canal de chapa141',(0,.002,0),(2.88,.065,.25),paint,.006)
# Real curved lens section, extruded along train X; front is downward web Y.
profile=[(-.107,-.025),(-.099,-.047),(-.080,-.061),(-.04,-.071),(0,-.075),(.04,-.071),(.080,-.061),(.099,-.047),(.107,-.025)]
vs=[(x,y,z) for x in [-1.417,1.417]for z,y in profile];N=len(profile);fs=[tuple(range(N-1,-1,-1)),tuple(range(N,2*N))]+[(i,i+1,i+1+N,i+N)for i in range(N-1)]
cover=mesh('Cubierta curva estriada141',vs,[tuple(reversed(f))for f in fs],opal,light)
# Longitudinal metric UV: flutes across the width, independent of 2.8 m length.
for p in cover.data.polygons:
 for li in p.loop_indices:
  v=C.inverted()@cover.data.vertices[cover.data.loops[li].vertex_index].co;cover.data.uv_layers.active.data[li].uv=(v.z/.105,v.x/.105)
for z in [-.119,.119]:box(light,'Perfil longitudinal141',(0,-.021,z),(2.87,.034,.014),steel,.002)
for x in [-1.425,1.425]:box(light,'Tapa terminal141',(x,-.027,0),(.026,.095,.245),paint,.004)
for x in [-.88,.88]:
 box(light,'Abrazadera transversal141',(x,-.079,0),(.035,.009,.224),paint,.001)
 for z in [-.102,.102]:
  screw=axial(light,'Tornillo abrazadera141',(0,0,0),[(0,0),(.005,0),(.005,.002),(0,.003)],steel,24);screw.location=C@Vector((x,-.083,z));screw.rotation_euler.x=math.pi/2
speaker=empty('Altavoz circular testero141',root);speaker['detail141']='speaker';speaker['source141']='011323'
axial(speaker,'Cerco altavoz141',(0,0,0),[(.058,0),(.064,.001),(.064,.004),(.058,.005),(.058,0)],steel)
axial(speaker,'Tela oscura altavoz141',(0,0,0),[(0,.001),(.058,.001),(.058,.002),(0,.002)],black)
# Fine perforated grille, integrated into just one material batch after native save.
for axis in [0,1]:
 for k in range(-18,19):
  v=k*.003;length=2*math.sqrt(.057**2-v*v)
  box(speaker,'Malla altavoz141',(v,0,.0025)if axis==0 else(0,v,.0027),(.0007,length,.0007)if axis==0 else(length,.0007,.0007),steel,0)
collar=empty('Union pasamanos141',root);collar['detail141']='rail_joint';collar['source141']='011308'
# A cylindrical coupling along vertical web Y; fits the existing 38 mm pole.
for name,prof in [('Collarin de union141',[(.019,-.03),(.025,-.03),(.026,-.022),(.026,.021),(.024,.029),(.019,.029),(.019,-.03)]),('Brida de sujecion141',[(.019,.025),(.04,.025),(.043,.03),(.04,.036),(.019,.036),(.019,.025)])]:
 o=axial(collar,name,(0,0,0),prof,steel,48);o.rotation_euler.x=math.pi/2
for x in [-.033,.033]:box(collar,'Tornillo brida141',(x,.032,0),(.006,.006,.006),steel,.001)
bpy.context.scene.unit_settings.system='METRIC';bpy.ops.wm.save_as_mainfile(filepath=str(O/'accesorios_L8_141.blend'),compress=True)
for o in list(root.children_recursive):
 if o.type!='MESH':continue
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
 for modifier in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=modifier.name)
for assembly in root.children:
 bins={}
 for o in assembly.children_recursive:
  if o.type=='MESH':bins.setdefault(o.data.materials[0].name,[]).append(o)
 for material,objects in bins.items():
  bpy.ops.object.select_all(action='DESELECT')
  for o in objects:o.select_set(True)
  bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();bpy.context.object.name=assembly.name+' · '+material
bpy.ops.export_scene.gltf(filepath=str(O/'accesorios_L8_141.glb'),export_format='GLB',export_apply=True,export_extras=True,export_animations=False,export_cameras=False,export_lights=False)
print('141 native fittings complete',flush=True)
