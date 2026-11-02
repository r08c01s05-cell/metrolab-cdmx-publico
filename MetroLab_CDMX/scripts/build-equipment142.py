import bpy,math,gzip,sys,random
from pathlib import Path
from mathutils import Vector,Matrix
sys.path.insert(0,str(Path(__file__).parent));from parts140 import C,mat,box,mesh
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision142';W=R/'dist/models/revision142';O.mkdir(parents=True,exist_ok=True);W.mkdir(parents=True,exist_ok=True)
def export(root,name,doors=False):
 bpy.context.scene.unit_settings.system='METRIC';bpy.ops.wm.save_as_mainfile(filepath=str(O/(name+'.blend')),compress=True)
 if doors:
  for o in bpy.context.scene.objects:
   if o.type=='EMPTY' and o.name.startswith('Puerta de gabinete'):o.rotation_euler.z=math.radians(105)*o.get('openSign138',1)
 bpy.ops.object.select_all(action='DESELECT')
 for o in [root]+list(root.children_recursive):o.select_set(True)
 bpy.context.view_layer.objects.active=root;bpy.ops.export_scene.gltf(filepath=str(O/(name+'.glb')),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=False,export_cameras=False,export_lights=False);(W/(name+'.glb.gz')).write_bytes(gzip.compress((O/(name+'.glb')).read_bytes(),9,mtime=0))
bpy.ops.wm.open_mainfile(filepath=str(R/'assets-source/subestaciones136/servicio_ventilation136.blend'));f=bpy.data.objects['sr134_filter'];root=f.parent
for o in list(f.children):
 if o.name.startswith(('Marco filtro','Pliegue filtrante')):bpy.data.objects.remove(o,do_unlink=True)
steel=mat('Aluminio marco filtro142',(.47,.49,.48),.86,.38);seal=mat('Sello perimetral filtro142',(.025,.029,.028),0,.84);fiber=mat('Fibra filtrante plisada142',(.63,.65,.59),0,.92)
for x in [-.58,.58]:box(f,'Perfil lateral filtro142',(x,0,-.02),(.024,.62,.04),steel,.003)
for y in [-.30,.30]:box(f,'Perfil horizontal filtro142',(0,y,-.02),(1.16,.024,.04),steel,.003)
for x in [-.561,.561]:box(f,'Junta de filtro142',(x,0,-.026),(.009,.575,.015),seal,.002)
vs=[(-.55+i*1.1/80,y,-.030-(.023 if i%2 else 0))for y in [-.28,.28]for i in range(81)];fs=[(i,i+1,i+82,i+81)for i in range(80)];mesh('Medio filtrante continuo142',vs,fs,fiber,f)
im=bpy.data.images.new('Polvo suave RGBA142',width=64,height=64,alpha=True);im.alpha_mode='STRAIGHT';rng=random.Random(142);pix=[]
for y in range(64):
 for x in range(64):
  r=((x-31.5)/32)**2+((y-31.5)/32)**2;a=max(0,1-r)**2*(.35+rng.random()*.35);pix.extend([.22,.19,.13,a])
im.pixels[:]=pix;im.pack();dirt=mat('Polvo fino filtro142',(.22,.19,.13),0,.98);bs=dirt.node_tree.nodes['Principled BSDF'];t=dirt.node_tree.nodes.new('ShaderNodeTexImage');t.image=im;dirt.node_tree.links.new(t.outputs['Color'],bs.inputs['Base Color']);dirt.node_tree.links.new(t.outputs['Alpha'],bs.inputs['Alpha']);dirt.surface_render_method='DITHERED';dirt.use_backface_culling=False
for o in list(f.children):
 if not o.name.startswith('sr134_dust'):continue
 p=C.inverted()@o.location;o.modifiers.clear();o.data=mesh('Dust mesh142',[(-.07,-.085,0),(.07,-.085,0),(.07,.085,0),(-.07,.085,0)],[(0,1,2,3)],dirt).data;bpy.data.objects.remove(bpy.data.objects['Dust mesh142'],do_unlink=True);o.location=C@Vector((p.x,p.y,-.055));o.scale=(1,1,1)
 uv=o.data.uv_layers.active
 for i,coord in enumerate([(0,0),(1,0),(1,1),(0,1)]):uv.data[i].uv=coord
export(root,'servicio_ventilation142')
bpy.ops.wm.open_mainfile(filepath=str(R/'assets-source/revision140/subestacion140.blend'));root=bpy.data.objects['SR_Blend127'];root['revision142']=True
steel=mat('Acero galvanizado chasis142',(.40,.43,.44),.87,.4);dark=mat('Ranuras chasis142',(.025,.030,.032),0,.85)
for key,x1,x2 in [('mt',-6.65,-3.70),('rectifier',.40,1.90),('dc',3.32,5.22),('control',5.82,6.67)]:
 g=bpy.data.objects[key]
 for x in [x1,x2]:
  box(g,'Perfil de chasis142',(x,1.48,1.12),(.035,2.52,.045),steel,.002)
  for k in range(22):box(g,'Perforacion de chasis142',(x,.29+k*.11,1.095),(.012,.026,.001),dark,0)
 for y in [.24,2.70]:box(g,'Travesano de chasis142',((x1+x2)/2,y,1.12),(x2-x1,.035,.045),steel,.002)
# Signs stay attached to architecture instead of floating when the cutaway is hidden.
cut=bpy.data.objects['Cerramiento_retirado'];bpy.context.view_layer.update()
for key in ['Placa SALIDA','Salida']:
 o=bpy.data.objects.get(key)
 if o:world=o.matrix_world.copy();o.parent=cut;o.matrix_parent_inverse=Matrix.Identity(4);o.matrix_world=world
export(root,'subestacion142',True)
print('142 equipment complete',flush=True)
