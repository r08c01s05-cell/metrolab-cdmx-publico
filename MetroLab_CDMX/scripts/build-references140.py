from pathlib import Path
import bpy,math,gzip,json
from mathutils import Vector,Matrix
from parts140 import *
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision140';O.mkdir(parents=True,exist_ok=True);W=R/'dist/models/revision140';W.mkdir(parents=True,exist_ok=True)
def export(root,name,doors=False):
 bpy.context.scene.unit_settings.system='METRIC';bpy.ops.wm.save_as_mainfile(filepath=str(O/(name+'.blend')),compress=True)
 if name=='detalles_L8':
  for o in list(root.children_recursive):
   if o.type not in ['MESH','FONT']:continue
   bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
   if o.type=='FONT':bpy.ops.object.convert(target='MESH')
   for modifier in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=modifier.name)
  for assembly in root.children:
   bins={}
   for o in assembly.children_recursive:
    if o.type=='MESH':bins.setdefault(o.data.materials[0].name,[]).append(o)
   for material,objects in bins.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();bpy.context.object.name=assembly.name+' · '+material
 if doors:
  for o in bpy.context.scene.objects:
   if o.type=='EMPTY' and o.name.startswith('Puerta de gabinete'):o.rotation_euler.z=math.radians(105)*o.get('openSign138',1)
 bpy.ops.object.select_all(action='DESELECT')
 for o in bpy.context.scene.objects:
  p=o
  while p and p!=root:p=p.parent
  if p==root:o.select_set(True)
 bpy.context.view_layer.objects.active=root;bpy.ops.export_scene.gltf(filepath=str(O/(name+'.glb')),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=False,export_cameras=False,export_lights=False);(W/(name+'.glb.gz')).write_bytes(gzip.compress((O/(name+'.glb')).read_bytes(),9,mtime=0));print('EXPORTED140',name,flush=True)
bpy.ops.wm.read_factory_settings(use_empty=True);root=empty('Referencias_L8_140');a,v=create_parts140();a.parent=v.parent=root;export(root,'detalles_L8')
bpy.ops.wm.open_mainfile(filepath=str(R/'assets-source/proteccion138/subestacion138.blend'));root=bpy.data.objects['SR_Blend127'];tr=bpy.data.objects['transformer'];rect=bpy.data.objects['rectifier'];root['revision140']=True
removed=[]
for o in list(tr.children_recursive):
 if o.type=='MESH' and o.name.startswith(('Bobina_primaria','Bobina_secundaria','Espira_bobina','Capa de devanado')):removed.append(o.name);bpy.data.objects.remove(o,do_unlink=True)
resin=mat('Resina colada transformador140',(.36,.027,.017),0,.43);iron=mat('Acero laminado nucleo140',(.075,.083,.087),.63,.59);steel=mat('Acero galvanizado estructura140',(.40,.43,.45),.85,.39);black=mat('Aislante negro potencia140',(.012,.016,.019),0,.87);copper=mat('Cobre de terminales140',(.35,.16,.067),.93,.34)
for o in tr.children_recursive:
 if o.type=='MESH' and o.name.startswith(('Columna_nucleo','Yugo_nucleo')):o.data.materials.clear();o.data.materials.append(iron)
 if o.type=='MESH' and o.name.startswith('Salida_secundario'):o.data.materials.clear();o.data.materials.append(black)
# Cast-resin dry-transformer windings around the existing three core limbs.
profile=[(.205,.67),(.325,.67),(.345,.70),(.345,1.86),(.328,1.91),(.205,1.91),(.205,.67)]
for x in [-2.58,-1.85,-1.12]:
 N=64;vs=[(x+r*math.cos(i*2*math.pi/N),y,2+r*1.17*math.sin(i*2*math.pi/N))for r,y in profile for i in range(N)];fs=[(j*N+i,j*N+(i+1)%N,(j+1)*N+(i+1)%N,(j+1)*N+i)for j in range(len(profile)-1)for i in range(N)];o=mesh('Devanado encapsulado140',vs,fs,resin,tr)
 for f in o.data.polygons:f.use_smooth=True
 for y in [.635,1.945]:box(tr,'Apoyo aislante de devanado140',(x,y,2),(.56,.045,.63),black,.006)
 for y in [1.03,1.58]:
  box(tr,'Soporte de salida140',(x,y,1.60),(.11,.06,.075),black,.004);box(tr,'Zapata de conexion140',(x,y,1.55),(.08,.045,.018),copper,.002)
  axial(tr,'Perno de terminal140',(x+.025,y,1.539),[(0,0),(.009,0),(.009,-.010),(0,-.010)],steel,6,False)
 # Cast cooling channels are subtle ribs, not a repeated wicker texture.
 for a in [-.65,-.32,0,.32,.65]:
  xx=x+math.sin(a)*.346;zz=2-math.cos(a)*.406;box(tr,'Nervio vertical de resina140',(xx,1.29,zz),(.012,1.00,.008),resin,.003)
 for y in [.69,1.885]:box(tr,'Abrazadera de devanado140',(x,y,1.58),(.48,.026,.023),iron,.003)
# Laminated yokes receive fine, physically sized joint lines.
for y in [.55,2.14]:
 for i in range(9):box(tr,'Lamina del nucleo140',(-1.85,y-.105+i*.026,1.655),(2.10,.002,.003),iron,.0002)
# Modular diode heat sinks, support rails and fasteners remain behind the working door.
for x in [.72,1.58]:
 for y in [.63,.93,1.23,1.53,1.83,2.13]:
  box(rect,'Placa de disipador140',(x,y,1.94),(.60,.18,.025),steel,.003)
  for i in range(8):box(rect,'Aleta de disipador140',(x-.245+i*.07,y,1.82),(.009,.16,.23),steel,0)
  for dx in [-.26,.26]:
   axial(rect,'Perno de modulo rectificador140',(x+dx,y,1.69),[(0,0),(.018,0),(.018,.015),(0,.015)],steel,6,False)
 for z in [1.86,2.3]:box(rect,'Montante perforado de bastidor140',(x-.35,1.41,z),(.035,1.91,.045),steel,.002)
for y in [.43,1.39,2.39]:box(rect,'Travesano de bastidor140',(1.15,y,2.15),(1.56,.035,.045),steel,.002)
(O/'transformador140.json').write_text(json.dumps({'removedCoilMeshes':removed,'castWindings':3,'rectifierDiodesUnchanged':12,'reference':'Visual only: 004847 and 004857..004933; manufacturer equipment not verified as Metro installation'},indent=2));export(root,'subestacion140',True)
