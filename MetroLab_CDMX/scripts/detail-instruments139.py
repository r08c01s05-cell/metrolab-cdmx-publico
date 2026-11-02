"""Rebuild instrument assembly transforms and mechanical details without altering mission targets."""
import bpy,math,gzip
from pathlib import Path
from mathutils import Matrix,Vector
R=Path(__file__).resolve().parents[1];O=R/'assets-source/herramientas139';C=Matrix.Rotation(math.pi/2,4,'X')
for kind in ['diodes','insulation','relay']:
 bpy.ops.wm.open_mainfile(filepath=str(R/f'assets-source/subestaciones129/{kind}.blend'));root=bpy.data.objects['sr129_'+kind];meter=bpy.data.objects.new('Instrumento_escala139',None);bpy.context.collection.objects.link(meter);meter.parent=root;meter.location=C@Vector((.71,-.01,-.075));bpy.context.view_layer.update();inv=meter.matrix_world.inverted();selected=[]
 for o in list(root.children):
  if o==meter:continue
  p=C.inverted()@o.location
  if o.name.startswith(('Instrumento','sr129_screen','sr129_display','sr129_staticDisplay','sr129_target_dial','sr129_target_measure','sr129_target_release','sr129_redPort','sr129_blackPort'))or(.4<p.x<.95 and -.5<p.y<.5 and p.z<-.19):selected.append(o)
 for o in selected:
  world=o.matrix_world.copy();o.parent=meter;o.matrix_parent_inverse=Matrix.Identity(4);o.matrix_basis=inv@world
 meter.scale=(.32,.32,.32);meter['instrument139']=True;meter['physicalHeight139']=.2912
 # Smooth manufactured radii, a machined dial and recessed banana sockets.
 for o in selected:
  for obj in [o]+list(o.children_recursive):
   for mod in obj.modifiers:
    if mod.type=='BEVEL':mod.segments=5;mod.harden_normals=True
   if obj.type=='MESH' and obj.name.startswith(('Instrumento','Selector giratorio')):
    normal=obj.modifiers.new('Normales de caras fabricadas','WEIGHTED_NORMAL');normal.keep_sharp=True;normal.weight=50
 dial=bpy.data.objects['sr129_target_dial'];selector=next(o for o in dial.children if o.name.startswith('Selector giratorio'))
 bpy.ops.mesh.primitive_cylinder_add(vertices=64,radius=.105,depth=.045);temp=bpy.context.object;selector.data=temp.data.copy();bpy.data.objects.remove(temp,do_unlink=True);selector.data.materials.append(bpy.data.materials['Polimero grafito'])
 for f in selector.data.polygons:f.use_smooth=len(f.vertices)==4
 for key in ['sr129_redPort','sr129_blackPort']:
  port=bpy.data.objects[key];colour=bpy.data.materials['Goma roja' if 'red' in key else 'Goma negra']
  for child in list(port.children):bpy.data.objects.remove(child,do_unlink=True)
  bpy.ops.mesh.primitive_torus_add(major_radius=.023,minor_radius=.006,major_segments=40,minor_segments=10);o=bpy.context.object;o.name='Boca banana empotrada139';o.parent=port;o.location=C@Vector((0,0,-.014));o.rotation_euler.x=math.pi/2;o.data.materials.append(colour)
  for f in o.data.polygons:f.use_smooth=True
  bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=.018,depth=.004);o=bpy.context.object;o.name='Cavidad de entrada139';o.parent=port;o.location=C@Vector((0,0,-.003));o.rotation_euler.x=math.pi/2;o.data.materials.append(bpy.data.materials['Polimero grafito'])
 def legend(text,x,y):
  c=bpy.data.curves.new('Serigrafia instrumento139','FONT');c.body=text;c.size=.026;c.align_x='CENTER';c.resolution_u=4;o=bpy.data.objects.new('Leyenda '+text,c);bpy.context.collection.objects.link(o);o.parent=meter;o.location=C@Vector((x,y,-.1195));o.rotation_euler=(math.pi/2,0,math.pi);o.data.materials.append(bpy.data.materials['Polimero grafito'])
 for text,x,y in [('OFF',0,.125),('V',-.17,.11),('mV',.17,.11),('MΩ',-.175,-.04),('Ω',.175,-.04),('COM',.10,-.285),('V / Ω',-.10,-.285)]:legend(text,x,y)
 # Four recessed housing screws, LCD keys and grip ribs remain in the assembly.
 steel=bpy.data.materials['Acero satinado'];dark=bpy.data.materials['Polimero grafito']
 for x in [-.215,.215]:
  for y in [-.35,.35]:
   bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=.013,depth=.006);o=bpy.context.object;o.name='Tornillo carcasa instrumento139';o.parent=meter;o.location=C@Vector((x,y,-.12));o.rotation_euler.x=math.pi/2;o.data.materials.append(steel)
   for turn in [0,math.pi/2]:
    bpy.ops.mesh.primitive_cube_add(size=1);q=bpy.context.object;q.name='Cruz de tornillo139';q.parent=meter;q.location=C@Vector((x,y,-.124));q.dimensions=(.017,.001,.003);q.rotation_euler.y=turn;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);q.data.materials.append(dark)
 for x in [-.25,.25]:
  for i in range(6):
   bpy.ops.mesh.primitive_cube_add(size=1);o=bpy.context.object;o.name='Banda de agarre instrumento139';o.parent=meter;o.location=C@Vector((x,-.18+i*.065,-.005));o.dimensions=(.014,.14,.018);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(dark);b=o.modifiers.new('Radio de elastomero','BEVEL');b.width=.004;b.segments=2
 bpy.context.scene.unit_settings.system='METRIC';bpy.ops.wm.save_as_mainfile(filepath=str(O/(kind+'139.blend')),compress=True);bpy.ops.object.select_all(action='DESELECT')
 for o in bpy.context.scene.objects:
  p=o
  while p and p!=root:p=p.parent
  if p==root:o.select_set(True)
 bpy.context.view_layer.objects.active=root;out=O/(kind+'139.glb');bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=False,export_cameras=False,export_lights=False)
 # Match the existing web precision: positions 1 micrometre; normals/UV 1e-4.
 import struct,json
 raw=out.read_bytes();ln=struct.unpack_from('<I',raw,12)[0];j=json.loads(raw[20:20+ln]);binary=bytearray(raw[28+ln:]);seen=set()
 for mesh in j['meshes']:
  for prim in mesh['primitives']:
   for role,ai in prim['attributes'].items():
    if role not in ['POSITION','NORMAL','TEXCOORD_0']or ai in seen:continue
    a=j['accessors'][ai]
    if a['componentType']!=5126:continue
    seen.add(ai);v=j['bufferViews'][a['bufferView']];n={'VEC2':2,'VEC3':3}[a['type']];stride=v.get('byteStride',n*4);offset=v.get('byteOffset',0)+a.get('byteOffset',0);digits=6 if role=='POSITION'else 4
    for i in range(a['count']):
     for k in range(n):p=offset+i*stride+k*4;struct.pack_into('<f',binary,p,round(struct.unpack_from('<f',binary,p)[0],digits))
 text=json.dumps(j,separators=(',',':')).encode();text+=b' '*((-len(text))%4);payload=struct.pack('<III',0x46546c67,2,28+len(text)+len(binary))+struct.pack('<II',len(text),0x4e4f534a)+text+struct.pack('<II',len(binary),0x004e4942)+binary
 target=R/f'dist/models/subestaciones129/{kind}.glb.gz';old=target.stat().st_size;target.write_bytes(gzip.compress(payload,9,mtime=0));print(kind,old,target.stat().st_size,flush=True)
