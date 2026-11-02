"""Manufactured radii and detailed components; retain all current interactive Blender anchors."""
from pathlib import Path
import bpy,bmesh,math,gzip,json,struct,subprocess
from mathutils import Vector,Matrix
R=Path('/workspace/sites/metro-cdmx-simulador');O=R/'assets-source/revision145';O.mkdir(parents=True,exist_ok=True)
SPECS=[('substation','revision142/subestacion142.glb.gz'),('ventilation','revision142/servicio_ventilation142.glb.gz'),('control','subestaciones134/servicio_control.glb.gz'),('battery','subestaciones134/servicio_battery.glb.gz'),('diodes','subestaciones129/diodes.glb.gz'),('insulation','subestaciones129/insulation.glb.gz'),('relay','subestaciones129/relay.glb.gz')]
def mat(n,c,metal=0,rough=.4):
 m=bpy.data.materials.get(n)or bpy.data.materials.new(n);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*c,1);b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough;return m

def lathe(o,profile,material,disc=False):
 vs=[v.co for v in o.data.vertices];lo=Vector([min(v[a]for v in vs)for a in range(3)]);hi=Vector([max(v[a]for v in vs)for a in range(3)]);size=hi-lo;axis=(min if disc else max)(range(3),key=lambda a:size[a]);axes=[a for a in range(3)if a!=axis];center=(lo+hi)/2;vertices=[];segments=48
 for t,r in profile:
  for j in range(segments):
   q=center.copy();q[axis]=lo[axis]+t*size[axis];q[axes[0]]+=math.cos(j*math.tau/segments)*size[axes[0]]*.5*r;q[axes[1]]+=math.sin(j*math.tau/segments)*size[axes[1]]*.5*r;vertices.append(q)
 faces=[]
 for k in range(len(profile)-1):
  for j in range(segments):a=k*segments+j;b=k*segments+(j+1)%segments;faces.append((a,b,b+segments,a+segments))
 faces.extend([tuple(reversed(range(segments))),tuple((len(profile)-1)*segments+j for j in range(segments))]);me=bpy.data.meshes.new('Perfil torneado145');me.from_pydata(vertices,[],faces);me.update();bm=bmesh.new();bm.from_mesh(me);
 if bm.calc_volume(signed=True)<0:bmesh.ops.reverse_faces(bm,faces=list(bm.faces))
 bm.normal_update();bm.to_mesh(me);bm.free();me.materials.append(material);o.data=me;o.modifiers.clear();o['manufactured145']=True
 for f in me.polygons:f.use_smooth=len(f.vertices)==4

def block(parent,n,xyz,size,m):
 bpy.ops.mesh.primitive_cube_add(size=1);o=bpy.context.object;o.name=n;o.parent=parent;o.location=xyz;o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(m);b=o.modifiers.new('Bisel industrial145','BEVEL');b.width=min(.003,min(size)*.15);b.segments=3;return o

def cylinder(parent,n,xyz,r,h,m):
 bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=r,depth=h);o=bpy.context.object;o.name=n;o.parent=parent;o.location=xyz;o.rotation_euler.x=math.pi/2;o.data.materials.append(m)
 for f in o.data.polygons:f.use_smooth=len(f.vertices)==4
 return o

reports=[]
for kind,rel in SPECS:
 bpy.ops.wm.read_factory_settings(use_empty=True);src=R/'dist/models'/rel;original=subprocess.check_output(['git','show','HEAD:dist/models/'+rel],cwd=R);tmp=O/(kind+'-input.glb');tmp.write_bytes(gzip.decompress(original));bpy.ops.import_scene.gltf(filepath=str(tmp));tmp.unlink();bpy.context.view_layer.update();root=next(o for o in bpy.context.scene.objects if o.parent is None);anchors={o.name:o.get('srTarget128')for o in bpy.data.objects if o.get('srTarget128')};counts={'bevels':0,'profiles':0,'windings':0,'blades':0}
 copper=mat('Cobre barnizado145',(.34,.125,.046),.82,.3);ceramic=mat('Porcelana esmaltada145',(.63,.59,.48),0,.22);steel=mat('Acero mecanizado145',(.48,.51,.53),.88,.3);dark=mat('Polimero moldeado145',(.025,.035,.038),0,.78);pcb=mat('Laminado de circuito145',(.025,.15,.12),0,.7)
 for o in list(bpy.data.objects):
  if o.type!='MESH':continue
  name=o.name.lower();extent=min(o.dimensions);large=max(o.dimensions)
  if extent>.0015 and large>.008 and len(o.data.vertices)<=24 and not any(x in name for x in ['texto','simbolo','símbolo','ranura','perforacion','perforación','nom026','dust','polvo','espira']):
   bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-7);bm.to_mesh(o.data);bm.free();o.data.update();o['manufactured145']=True;b=o.modifiers.new('Radio de fabricacion145','BEVEL');b.limit_method='ANGLE';b.angle_limit=.3;b.width=min(.004 if kind=='substation'else .0025,extent*.12,large*.015);b.segments=3;b.harden_normals=True;n=o.modifiers.new('Normales de chapa145','WEIGHTED_NORMAL');n.keep_sharp=True;counts['bevels']+=1
  if kind=='relay'and o.name.startswith('Espira bobina'):bpy.data.objects.remove(o,do_unlink=True);continue
  if kind=='relay'and o.name.startswith('Bobina visible'):
   profile=[(0,.72),(.015,.97),(.045,1),(.06,.80)]
   for i in range(32):z=.075+i*.0265;profile.extend([(z,.86),(z+.007,.92),(z+.016,.90),(z+.023,.86)])
   profile.extend([(.94,.8),(.955,1),(.985,.97),(1,.72)]);lathe(o,profile,copper);counts['windings']+=1
  if kind=='insulation'and o.name.startswith('Aislador ceramico'):
   profile=[(0,.65),(.04,.76),(.10,.6)]
   for z in [.14,.38,.62]:profile.extend([(z,.6),(z+.04,.94),(z+.09,1),(z+.14,.91),(z+.20,.6)])
   profile.extend([(.9,.6),(.96,.76),(1,.65)]);lathe(o,profile,ceramic,True);counts['profiles']+=1
  if kind=='diodes'and o.name.startswith('Diodo de potencia'):lathe(o,[(0,.72),(.05,.9),(.12,1),(.18,1),(.22,.85),(.72,.85),(.78,.7),(.90,.7),(1,.6)],steel,True);counts['profiles']+=1
  if any(n in name for n in ['aspa','pala de ventilador','alabe']):
   vs=[v.co.copy()for v in o.data.vertices];lo=Vector([min(v[a]for v in vs)for a in range(3)]);hi=Vector([max(v[a]for v in vs)for a in range(3)]);u,v,w=sorted(range(3),key=lambda a:hi[a]-lo[a],reverse=True);mid=(lo+hi)/2;vertices=[]
   for t in [0,.25,.5,.75,1]:
    for side in [-1,1]:q=mid.copy();q[u]=lo[u]+t*(hi[u]-lo[u]);q[v]+=side*(.45+.55*math.sin(math.pi*(.1+.8*t)))*(hi[v]-lo[v])*.5;q[w]+=(hi[w]-lo[w])*.45*math.sin(t*math.pi)*side;vertices.append(q)
   me=bpy.data.meshes.new('Pala alabeada145');me.from_pydata(vertices,[],[(i*2,i*2+1,i*2+3,i*2+2)for i in range(4)]);me.update();mats=list(o.data.materials);o.data=me
   for m in mats:me.materials.append(m)
   o.modifiers.clear();s=o.modifiers.new('Espesor de pala145','SOLIDIFY');s.thickness=.0012;b=o.modifiers.new('Borde redondeado145','BEVEL');b.width=.0008;b.segments=2;counts['blades']+=1
 if kind=='control':
  C=Matrix.Rotation(math.pi/2,4,'X');P=lambda v:C@Vector(v);block(root,'Tarjeta poblada145',P((-.1,-.05,.028)),(.30,.012,.22),pcb)
  for i in range(4):cylinder(root,'Condensador145',P((-.2+i*.065,-.09,-.008)),.012,.028,dark);cylinder(root,'Tapa de condensador145',P((-.2+i*.065,-.09,-.024)),.01,.002,steel)
  for i in range(3):block(root,'Resistencia encapsulada145',P((-.18+i*.08,.02,-.003)),(.04,.025,.014),ceramic)
 for m in bpy.data.materials:
  if not m.use_nodes:continue
  bs=m.node_tree.nodes.get('Principled BSDF')
  if not bs:continue
  n=m.name.lower()
  if any(x in n for x in ['acero','cobre','aluminio','metal','laton']):bs.inputs['Metallic'].default_value=max(.65,bs.inputs['Metallic'].default_value);bs.inputs['Roughness'].default_value=.3 if 'mecanizado'in n else .4
  if any(x in n for x in ['porcelana','ceramico','cerámico']):bs.inputs['Roughness'].default_value=.24
 for n,key in anchors.items():assert bpy.data.objects[n].get('srTarget128')==key
 root['revision145']=True;root['scope145']='Modelo didactico aproximado, con radios fabricados y componentes detallados. Anclajes de interaccion conservados.';bpy.context.scene.unit_settings.system='METRIC';bpy.ops.wm.save_as_mainfile(filepath=str(O/(kind+'145.blend')),compress=True);out=O/(kind+'145.glb');bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=root;bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=False,export_cameras=False,export_lights=False)
 raw=out.read_bytes();n=struct.unpack_from('<I',raw,12)[0];j=json.loads(raw[20:20+n]);binary=bytearray(raw[28+n:]);seen=set()
 for mesh in j['meshes']:
  for prim in mesh['primitives']:
   for role,ai in prim['attributes'].items():
    if role not in ['POSITION','NORMAL','TEXCOORD_0']or ai in seen:continue
    a=j['accessors'][ai]
    if a['componentType']!=5126:continue
    seen.add(ai);view=j['bufferViews'][a['bufferView']];width={'VEC2':2,'VEC3':3}[a['type']];offset=view.get('byteOffset',0)+a.get('byteOffset',0);stride=view.get('byteStride',width*4);mins=[float('inf')]*width;maxs=[float('-inf')]*width
    for i in range(a['count']):
     vals=[round(x,6 if role=='POSITION'else 4)for x in struct.unpack_from('<'+'f'*width,binary,offset+i*stride)];struct.pack_into('<'+'f'*width,binary,offset+i*stride,*vals);mins=[min(x,y)for x,y in zip(mins,vals)];maxs=[max(x,y)for x,y in zip(maxs,vals)]
    if role=='POSITION':a['min']=mins;a['max']=maxs
 j['asset']['revision145']=True;encoded=json.dumps(j,separators=(',',':')).encode();encoded+=b' '*(-len(encoded)%4);payload=struct.pack('<III',0x46546c67,2,28+len(encoded)+len(binary))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(binary),0x004e4942)+binary;out.write_bytes(payload);src.write_bytes(gzip.compress(payload,9,mtime=0));counts.update(kind=kind,bytes=src.stat().st_size,anchors=len(anchors));reports.append(counts);print(json.dumps(counts),flush=True)
(O/'audit145.json').write_text(json.dumps(reports,indent=2));print('145 MODELS DONE',flush=True)
