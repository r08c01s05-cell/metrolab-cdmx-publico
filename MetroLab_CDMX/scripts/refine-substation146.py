"""Reference-guided detail pass. Retains hinges, target extras and previous checked envelopes."""
from pathlib import Path
import bpy,bmesh,math,gzip,json,struct
from mathutils import Vector,Matrix
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision146';T=O/'texturas';C=Matrix.Rotation(math.pi/2,4,'X')
SPECS=[('substation','revision142/subestacion142.glb.gz'),('ventilation','revision142/servicio_ventilation142.glb.gz'),('control','subestaciones134/servicio_control.glb.gz'),('battery','subestaciones134/servicio_battery.glb.gz'),('diodes','subestaciones129/diodes.glb.gz'),('insulation','subestaciones129/insulation.glb.gz'),('relay','subestaciones129/relay.glb.gz')]
def mat(n,c,metal=0,rough=.45):
 m=bpy.data.materials.get(n)or bpy.data.materials.new(n);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*c,1);b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough;return m

def finish(o,parent,xyz,m,n):
 o.name=n;o.parent=parent;o.location=xyz;o.data.materials.clear();o.data.materials.append(m);o['referenceDetail146']=True;return o

def box(p,n,xyz,size,m,bevel=.0015):
 bpy.ops.mesh.primitive_cube_add(size=1);o=bpy.context.object;o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);finish(o,p,xyz,m,n)
 if bevel:
  b=o.modifiers.new('Radio de chapa146','BEVEL');b.width=min(bevel,min(size)*.24);b.segments=3;n=o.modifiers.new('Normales146','WEIGHTED_NORMAL');n.keep_sharp=True
 return o

def cyl(p,n,xyz,r,h,m,axis='Y',segments=24):
 bpy.ops.mesh.primitive_cylinder_add(vertices=segments,radius=r,depth=h);o=finish(bpy.context.object,p,xyz,m,n)
 if axis=='Y':o.rotation_euler.x=math.pi/2
 elif axis=='X':o.rotation_euler.y=math.pi/2
 b=o.modifiers.new('Arista mecanizada146','BEVEL');b.width=min(.0015,h*.18);b.segments=2
 for f in o.data.polygons:f.use_smooth=len(f.vertices)==4
 return o

def curve(p,n,points,r,m):
 c=bpy.data.curves.new(n,'CURVE');c.dimensions='3D';c.resolution_u=4;c.bevel_depth=r;c.bevel_resolution=1
 if len(points)>10:
  spline=c.splines.new('POLY');spline.points.add(len(points)-1)
  for b,co in zip(spline.points,points):b.co=(*co,1)
 else:
  spline=c.splines.new('BEZIER');spline.bezier_points.add(len(points)-1)
  for b,co in zip(spline.bezier_points,points):b.co=co;b.handle_left_type=b.handle_right_type='AUTO'
 o=bpy.data.objects.new(n,c);bpy.context.collection.objects.link(o);o.parent=p;c.materials.append(m);o['referenceDetail146']=True;return o

def plane(p,n,xyz,w,h,m):
 bpy.ops.mesh.primitive_plane_add(size=1);o=finish(bpy.context.object,p,xyz,m,n);o.rotation_euler.x=math.pi/2;o.scale=(-w,h,1);return o

def label(p,text,xyz,size,m):
 c=bpy.data.curves.new('Placa146','FONT');c.body=text;c.align_x='CENTER';c.align_y='CENTER';c.size=size;c.extrude=.0002;c.resolution_u=2;o=bpy.data.objects.new('Placa '+text,c);bpy.context.collection.objects.link(o);o.parent=p;o.location=xyz;o.rotation_euler.x=math.pi/2;c.materials.append(m);o.scale.x=-1;o['referenceDetail146']=True;return o

def screw(p,xyz,r=.008):
 x,y,z=xyz;cyl(p,'Arandela146',(x,y+.001,z),r*1.3,.002,steel);cyl(p,'Cabeza ranurada146',xyz,r,.005,steel,segments=12);box(p,'Ranura tornillo146',(x,y-.003,z),(r*1.35,.0015,r*.2),dark,0)

def gauge(p,xyz,kind):
 x,y,z=xyz;w=.245;box(p,'Caja instrumento146',xyz,(w,.045,w),dark,.005);box(p,'Marco acero146',(x,y-.025,z),(w-.012,.006,w-.012),steel)
 mm=mat('Escala '+kind+'146',(1,1,1),0,.75);im=bpy.data.images.load(str(T/(kind+'.png')),check_existing=True);im.pack();node=mm.node_tree.nodes.new('ShaderNodeTexImage');node.image=im;mm.node_tree.links.new(node.outputs['Color'],mm.node_tree.nodes.get('Principled BSDF').inputs['Base Color']);plane(p,'Escala instrumento146',(x,y-.03,z),w-.024,w-.024,mm)
 # Needle has real thickness, pivot and a scale. Stored units are illustrative, never rated equipment data.
 pivot=Vector((x,y-.032,z-.054));tip=pivot+Vector((.039,0,.076));curve(p,'Aguja instrumento146',[pivot,tip],.0013,dark);cyl(p,'Eje aguja146',pivot,.007,.004,dark)
 for dx in [-1,1]:
  for dz in [-1,1]:screw(p,(x+dx*.112,y-.03,z+dz*.112),.0035)

def button(p,xyz,title,colour,selector=False):
 x,y,z=xyz;box(p,'Placa botonera146',(x,y+.003,z+.015),(.072,.012,.112),dark);cyl(p,'Bisel pulsador146',(x,y-.006,z),.022,.015,steel);cyl(p,'Lente piloto146',(x,y-.016,z),.017,.008,colour)
 if selector:box(p,'Maneta selector146',(x,y-.027,z),(.01,.018,.042),dark,.002)
 label(p,title,(x,y-.006,z+.046),.008,white)

def quantise(out):
 raw=out.read_bytes();n=struct.unpack_from('<I',raw,12)[0];j=json.loads(raw[20:20+n]);binary=bytearray(raw[28+n:]);seen=set()
 for mesh in j['meshes']:
  for prim in mesh['primitives']:
   for role,ai in prim['attributes'].items():
    if role not in ['POSITION','NORMAL','TEXCOORD_0']or ai in seen:continue
    a=j['accessors'][ai]
    if a['componentType']!=5126:continue
    seen.add(ai);v=j['bufferViews'][a['bufferView']];w={'VEC2':2,'VEC3':3}[a['type']];offset=v.get('byteOffset',0)+a.get('byteOffset',0);stride=v.get('byteStride',w*4);mins=[float('inf')]*w;maxs=[float('-inf')]*w
    for i in range(a['count']):
     vals=[round(x,5 if role=='POSITION'else 3 if role=='NORMAL'else 4)for x in struct.unpack_from('<'+'f'*w,binary,offset+i*stride)];struct.pack_into('<'+'f'*w,binary,offset+i*stride,*vals);mins=[min(x,y)for x,y in zip(mins,vals)];maxs=[max(x,y)for x,y in zip(maxs,vals)]
    if role=='POSITION':a['min']=mins;a['max']=maxs
 j['asset']['revision146']=True;encoded=json.dumps(j,separators=(',',':')).encode();encoded+=b' '*(-len(encoded)%4);payload=struct.pack('<III',0x46546c67,2,28+len(encoded)+len(binary))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(binary),0x004e4942)+binary;out.write_bytes(payload);return payload
reports=[]
for kind,rel in SPECS:
 bpy.ops.wm.open_mainfile(filepath=str(R/'assets-source/revision145'/(kind+'145.blend')));bpy.context.view_layer.update();anchors={o.name:o.get('srTarget128')for o in bpy.data.objects if o.get('srTarget128')};doors=[o for o in bpy.data.objects if o.type=='EMPTY'and 'Puerta de gabinete'in o.name];root=next(o for o in bpy.context.scene.objects if o.parent is None)
 steel=mat('Acero satinado146',(.43,.46,.47),.86,.32);dark=mat('Poliamida negra146',(.016,.021,.024),0,.64);white=mat('Rotulacion marfil146',(.80,.79,.72),0,.6);copper=mat('Cobre con patina leve146',(.36,.14,.055),.88,.35);amber=mat('Lente ambar146',(.62,.29,.023),0,.25);red=mat('Lente roja146',(.45,.025,.018),0,.26);green=mat('Lente verde146',(.04,.23,.12),0,.3);ceramic=mat('Ceramica tecnica146',(.7,.67,.57),0,.28)
 # Small packed roughness map: a fine surface finish, never exaggerated rust or random wear.
 rough=bpy.data.images.load(str(T/'rugosidad.png'),check_existing=True);rough.colorspace_settings.name='Non-Color';rough.pack()
 for m in list(bpy.data.materials):
  if not m.use_nodes:continue
  b=m.node_tree.nodes.get('Principled BSDF')
  if b and any(x in m.name.lower()for x in ['pintura','paint','chapa','acero']):
   tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=rough;m.node_tree.links.new(tex.outputs['Color'],b.inputs['Roughness'])
   if 'pintura'in m.name.lower()or 'paint'in m.name.lower():b.inputs['Base Color'].default_value=(.49,.50,.45,1);b.inputs['Metallic'].default_value=.18
 if kind=='substation':
  for door in doors:
   part=door.parent.name
   if part not in ['mt','dc','rectifier','control']:continue
   sheet=next(o for o in door.children if o.name.startswith('Hoja de gabinete'));width=sheet.dimensions.x
   # Legacy facade displays were too far outside the sheet. Replace rather than superpose.
   for o in list(door.children):
    if any(o.name.startswith(n)for n in ['Medidor_CD','Display_SCADA','Pantalla_SCADA']):bpy.data.objects.remove(o,do_unlink=True)
   x=width*.5
   if part in ['rectifier','dc']:
    gauge(door,(x-.145,-.028,2.08),'voltaje');gauge(door,(x+.145,-.028,2.08),'corriente')
   elif part=='mt':gauge(door,(x,-.028,2.08),'corriente')
   else:
    gauge(door,(x-.145,-.028,2.08),'voltaje');gauge(door,(x+.145,-.028,2.08),'corriente')
   titles=['CA','CD','FALLA','FLUJO','TEMP','LOCAL','LISTO','PRUEBA'] if part=='rectifier' else ['LISTO','FALLA','LOCAL','PRUEBA']
   for i,title in enumerate(titles):
    row=i//4;col=i%4;button(door,(x+(col-1.5)*.105,-.026,1.68-row*.15),title,[green,amber,red,amber][col],title=='LOCAL')
   # Cabinet door state contact and lock at latch side, mounted behind the panel.
   box(door,'Contacto auxiliar de puerta146',(width-.065,.05,1.95),(.034,.028,.075),dark);cyl(door,'Pestillo enclavamiento146',(width-.065,.055,1.88),.008,.065,steel,'Z')
  rec=bpy.data.objects.get('rectifier')
  for o in list(bpy.data.objects):
   if o.name.startswith('Diodo_potencia'):
    # Proper machined end plates around existing silicon package.
    o.update_world_matrix()if hasattr(o,'update_world_matrix')else None
    q=rec.matrix_world.inverted()@o.matrix_world.translation;x,y,z=q
    cyl(rec,'Electrodo diodo146',(x,y+.055,z),.079,.012,steel);cyl(rec,'Perno central diodo146',(x,y+.069,z),.018,.019,copper,segments=12)
  # Lugs and numbered control wiring routed within the backplate, safely behind shut doors.
  ctrl=bpy.data.objects.get('control')
  for i in range(8):
   x=5.98+i*.075;pts=[(x,.75,1.80),(x,1.0,1.80),(6.68,1.12+i*.065,1.80)];curve(ctrl,'Cableado control numerado146',[C@Vector(p)for p in pts],.003,dark)
   cyl(ctrl,'Puntera control146',C@Vector((x,.75,1.80)),.005,.022,steel,'Z',12)
 else:
  targets={o.get('srTarget128'):o for o in bpy.data.objects if o.get('srTarget128')}
  # All added details stay under the same moving target, preserving probes and screen-space picking.
  if kind=='control':
   for old in list(bpy.data.objects):
    if old.name.startswith('Cable flexible'):bpy.data.objects.remove(old,do_unlink=True)
   pvc=mat('PVC rojo146',(.31,.025,.018),0,.68)
   routes=[('Fuente a fusible146',[(-.62,-.12,.17),(-.70,-.13,.37),(-.25,-.13,.37),(0,-.23,.21)],pvc),('Fusible a salida146',[(0,-.23,.015),(.25,-.13,-.02),(.62,-.12,.17)],pvc),('Salida a lampara146',[(.62,-.12,.17),(.73,-.13,.04),(.73,-.13,-.36),(.5,-.13,-.36)],pvc),('Retorno de lampara146',[(.5,-.13,-.36),(.5,-.10,-.45),(-.78,-.10,-.45),(-.78,-.08,-.36)],dark)]
   for name,points,material in routes:curve(root,name,points,.009,material)['serviceCable146']=True
   common=bpy.data.objects.new('sr146_common',None);bpy.context.collection.objects.link(common);common.parent=root;common.location=(-.78,.08,-.36)
   cyl(common,'Borne COM146',(0,-.028,0),.025,.025,steel);cyl(common,'Receso COM146',(0,-.041,0),.011,.002,dark);label(common,'COM',(0,-.043,-.06),.028,dark)
   root['controlCircuit146']='Banco ficticio 24 V CD: fuente-fusible-salida-lampara-COM. Sin conexion a la SR.'
   leaf=bpy.data.objects.get('sr134_fuseLeaf')
   for z in [-.065,.13]:cyl(leaf,'Ferrule de cartucho146',(0,-.17,z),.038,.035,steel,'Z')
   for x in [-.045,.045]:box(leaf,'Mordaza de portafusible146',(x,-.15,.035),(.012,.03,.10),copper)
  elif kind=='battery':
   for key in ['terminalL','terminalR']:
    p=targets[key];cyl(p,'Terminal mecanizado146',(0,-.04,0),.07,.012,copper);screw(p,(0,-.05,0),.024)
    curve(p,'Cable flexible del borne146',[(.02,-.015,-.045),(.07,.00,-.14),(.13,.06,-.18)],.014,dark)
  elif kind=='ventilation':
   p=targets['fan']
   # Concentric steel guard rings. No cover over the filter or the four interactive screws.
   for r in [.10,.15,.20]:curve(p,'Aro de guarda ventilador146',[(math.cos(i*math.tau/48)*r,-.012,math.sin(i*math.tau/48)*r)for i in range(49)],.002,steel)
  elif kind=='diodes':
   p=targets['module']
   for x in [-.21,.21]:
    screw(p,(x,-.25,.10),.011);curve(p,'Trenza conexion diodo146',[(x,-.22,.07),(x*.8,-.23,.13),(x*.4,-.23,.13)],.008,copper)
   for old in list(bpy.data.objects):
    if old.name.startswith('Aleta disipador'):bpy.data.objects.remove(old,do_unlink=True)
   for i in range(12):box(p,'Aleta fina disipador146',(-.24+i*.043,-.06,0),(.009,.13,.33),steel,.001)
  elif kind=='insulation':
   p=targets['sample']
   for x in [-.20,.20]:screw(p,(x,-.125,0),.014);cyl(p,'Casquillo aislador146',(x,-.09,0),.031,.018,steel)
  elif kind=='relay':
   p=targets['relay']
   for x in [-.105,.105]:
    for z in [-.095,.095]:screw(p,(x,-.125,z),.007)
   curve(p,'Contacto elastico146',[(-.08,-.13,.09),(-.04,-.15,.13),(.06,-.15,.13)],.003,copper)
 # Front of the imported Blender asset is +Y; reflect facade details once, without moving anchors.
 parents={o.parent for o in bpy.data.objects if o.get('referenceDetail146') and o.parent and (kind!='substation' or o.parent in doors)}
 for parent in parents:
  children=[o for o in list(parent.children) if o.get('referenceDetail146')]
  frame=bpy.data.objects.new('Frente de instrumentacion146',None);bpy.context.collection.objects.link(frame);frame.parent=parent;frame.scale.y=-1
  for o in children:o.parent=frame
 if kind=='substation':
  for door in doors:
   for child in door.children:
    if child.name.startswith('Tirador de puerta'):child.location.y=abs(child.location.y)
 for n,key in anchors.items():assert bpy.data.objects[n].get('srTarget128')==key
 root['revision146']=True;root['referenceScope146']='Referencias STE/UPM/videos: detalle visual y banco didactico, no plano ni maniobra de una SR Metro real.';bpy.context.scene.unit_settings.system='METRIC';bpy.context.view_layer.update();bpy.ops.wm.save_as_mainfile(filepath=str(O/(kind+'146.blend')),compress=True);out=O/(kind+'146.glb');bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=root;bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=False,export_cameras=False,export_lights=False)
 payload=quantise(out);(R/'dist/models'/rel).write_bytes(gzip.compress(payload,9,mtime=0));row=dict(kind=kind,anchors=len(anchors),doors=len(doors),details=sum(bool(o.get('referenceDetail146'))for o in bpy.data.objects),bytes=(R/'dist/models'/rel).stat().st_size);reports.append(row);print(json.dumps(row),flush=True)
(O/'audit146.json').write_text(json.dumps(reports,indent=2))
