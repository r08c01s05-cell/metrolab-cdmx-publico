"""Repair authored enclosures and moving door furniture. Blender 4.3, metres.
PYTHONPATH=/tmp/metro-bpy136 /root/.local/bin/python3.11 scripts/build-substation136.py
Illustrative geometry; no claim of a surveyed Metro installation.
"""
from pathlib import Path
import bpy, math, gzip, json
from mathutils import Matrix, Vector
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets-source/subestaciones136';OUT.mkdir(parents=True,exist_ok=True);WEB=ROOT/'dist/models/subestaciones136';WEB.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'assets-source/subestaciones134/subestacion_rectificadora134.blend'))
C=Matrix.Rotation(math.pi/2,4,'X');CI=C.inverted();root=bpy.data.objects['SR_Blend127'];root['revision136']=True
root['enclosureRepair136']='Continuous 1.55 m deep enclosure; internal reactor recessed; moving nameplates and SCADA; illustrative geometry.'
keys=['mt','rectifier','dc','control'];groups={k:bpy.data.objects[k] for k in keys};front=.90
heights={'mt':2.65,'rectifier':2.70,'dc':2.65,'control':2.60}
def under(o,p):
 while o:
  if o==p:return True
  o=o.parent
 return False
def webbounds(o):
 pts=[CI@(o.matrix_world@Vector(v)) for v in o.bound_box];return [min(v[i] for v in pts) for i in range(3)],[max(v[i] for v in pts) for i in range(3)]
def warp(o,fn):
 transform=CI@o.matrix_world;inverse=transform.inverted()
 for v in o.data.vertices:v.co=inverse@Vector(fn(transform@v.co))
 o.data.update()
def mat(name,color,metal=0,rough=.5):
 m=bpy.data.materials.new(name);m.use_nodes=True;bs=m.node_tree.nodes['Principled BSDF'];bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough;return m
paint=bpy.data.materials['SR126 Pintura'];metal=bpy.data.materials['SR126 Acero cepillado'];dark=bpy.data.materials['SR126 Panel grafito'];ivory=bpy.data.materials['SR126 Panel marfil']
def box(parent,name,pos,size,material):
 bpy.ops.mesh.primitive_cube_add(size=1);o=bpy.context.object;o.name=name;o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material);o.parent=parent;o.matrix_world=Matrix.Translation(C@Vector(pos));bevel=o.modifiers.new('Canto de chapa','BEVEL');bevel.width=.002;bevel.segments=2;return o
def text(parent,name,label,pos):
 c=bpy.data.curves.new(name,'FONT');c.body=label;c.align_x='CENTER';c.size=.052;c.resolution_u=3;c.extrude=.00015;o=bpy.data.objects.new(name,c);bpy.context.scene.collection.objects.link(o);o.location=C@Vector(pos);o.rotation_euler=(math.pi/2,0,math.pi);bpy.context.view_layer.update();world=o.matrix_world.copy();o.parent=parent;o.matrix_world=world;o.data.materials.append(ivory);bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH');return o
# Remove old floating labels, not the equipment details.
for o in list(bpy.context.scene.objects):
 if any(under(o,g) for g in groups.values()) and o.name.startswith(('Placa de identificación','Leyenda del conjunto')):bpy.data.objects.remove(o,do_unlink=True)
doors=[o for o in bpy.context.scene.objects if o.type=='EMPTY' and o.name.startswith('Puerta de gabinete')];assert len(doors)==7
for d in doors:d.rotation_euler.z=0
bpy.context.view_layer.update()
# Extend the actual continuous side, bottom and top sheets; keep the rear plane fixed.
for key,g in groups.items():
 for o in list(bpy.context.scene.objects):
  if o.type!='MESH' or not under(o,g) or any(under(o,d) for d in doors):continue
  if o.name.startswith(('Gabinete_base','Gabinete_lateral','Gabinete_techo')):
   warp(o,lambda v:(v.x,v.y,2.45+(v.z-2.45)*(2.45-front)/.90))
  elif o.name.startswith('Montante'):
   warp(o,lambda v:(v.x,v.y,v.z-(1.55-front)))
  elif o.name.startswith('Umbral_abierto'):
   lo,hi=webbounds(o);cy=(lo[1]+hi[1])/2
   warp(o,lambda v:(v.x,.18+(v.y-cy)*(.06/(hi[1]-lo[1])),v.z-(1.55-front)))
  elif key=='rectifier' and o.name.startswith(('Nucleo_reactor','Espira_reactor')):
   warp(o,lambda v:(v.x,v.y,v.z+.25))
counts={};report=[]
for d in sorted(doors,key=lambda o:o.location.x):
 key=next(k for k,g in groups.items() if under(d,g));counts[key]=counts.get(key,0)+1
 # Move the real hinge with all its leaf hardware to the new manufactured front.
 pos=CI@d.location;pos.z=front;d.location=C@pos;bpy.context.view_layer.update()
 leaf=next(o for o in d.children if o.name.startswith('Hoja de gabinete'))
 lo,hi=webbounds(leaf);y0=.225;y1=heights[key]+.175
 warp(leaf,lambda v:(v.x,y0+(v.y-lo[1])*(y1-y0)/(hi[1]-lo[1]),v.z))
 width=hi[0]-lo[0];cx=(lo[0]+hi[0])/2
 for furniture in list(d.children):
  if furniture.type!='MESH' or not furniture.name.startswith(('Tirador de puerta','Ranura de ventilación')):continue
  b0,b1=webbounds(furniture);target=front-.05 if furniture.name.startswith('Tirador') else front-.02;delta=target-(b0[2]+b1[2])/2;warp(furniture,lambda v:(v.x,v.y,v.z+delta))
 # A shallow pressed return around the leaf makes its edge read as sheet metal.
 for x in [lo[0]+.025,hi[0]-.025]:box(d,'Retorno interior de hoja136',(x,(y0+y1)/2,front+.027),(.02,y1-y0-.07,.018),paint)
 label=({'mt':'MT · CELDA','rectifier':'RECTIFICADOR','dc':'CD · SALIDA','control':'CONTROL / RTU'})[key]+(' '+str(counts[key]) if key in ['mt','dc'] else '')
 box(d,'Placa solidaria a puerta136',(cx,.67,front-.027),(min(.83,width-.10),.145,.012),dark)
 text(d,'Identificacion puerta136',label,(cx,.65,front-.035))
 # Operator displays are door-mounted; they move with the leaf instead of piercing it.
 names=['Pantalla_SCADA','Display_SCADA'] if key=='control' else ['Medidor_CD'] if key=='dc' else []
 for o in list(bpy.context.scene.objects):
  if not under(o,groups[key]) or any(under(o,h) for h in doors) or not any(o.name.startswith(n) for n in names):continue
  b0,b1=webbounds(o);ox=(b0[0]+b1[0])/2
  if abs(ox-cx)>width/2:continue
  world=o.matrix_world.copy();o.parent=d;o.matrix_world=world
  target=front-.065 if o.name.startswith('Display') else front-.035
  shift=target-(b0[2]+b1[2])/2;warp(o,lambda v:(v.x,v.y,v.z+shift))
 d['closedFront136']=front;d['leafMinY136']=y0;d['leafMaxY136']=y1;d['cabinetPart136']=key;d['enclosureDepth136']=2.45-front
 report.append({'part':key,'front':front,'rear':2.45,'leafY':[y0,y1]})
bpy.context.view_layer.update()
# Check every non-structural interior remains behind the closed leaf, with clearance.
violations=[]
for key,g in groups.items():
 for o in bpy.context.scene.objects:
  if o.type!='MESH' or not under(o,g) or any(under(o,d) for d in doors):continue
  if o.name.startswith(('Gabinete_','Montante','Umbral_','Tornillo ranurado','Ranura tornillo','NOM026','Simbolo')):continue
  lo,hi=webbounds(o)
  if lo[2]<front+.04:violations.append((key,o.name,lo[2]))
assert not violations,violations
bpy.context.scene.unit_settings.system='METRIC';bpy.context.scene.unit_settings.scale_length=1
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'subestacion_rectificadora136.blend'),compress=True)
# Export the authored opening pose; runtime keeps it as the open endpoint.
for d in doors:d.rotation_euler.z=math.radians(105)
bpy.context.view_layer.update();bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
 if under(o,root):o.select_set(True)
bpy.context.view_layer.objects.active=root
bpy.ops.export_scene.gltf(filepath=str(OUT/'subestacion_rectificadora136.glb'),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=False,export_cameras=False,export_lights=False)
raw=(OUT/'subestacion_rectificadora136.glb').read_bytes();(WEB/'rectificadora.glb.gz').write_bytes(gzip.compress(raw,9,mtime=0));(OUT/'envolventes136.json').write_text(json.dumps({'illustrative':True,'cabinets':report,'interiorFrontViolations':violations},indent=2));print('136 exported',len(raw),'bytes; 7 verified enclosures',flush=True)

# Give the carried filter a full-width physical support, at its exact resting height.
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'assets-source/subestaciones134/servicio_ventilation.blend'))
root=bpy.data.objects['Servicio_SR134_ventilation'];root['revision136']=True
metal=bpy.data.materials['Acero satinado banco134'];dark=bpy.data.materials['Caucho grafito banco134']
for o in list(bpy.context.scene.objects):
 if o.name.startswith('Bandeja de retirados'):bpy.data.objects.remove(o,do_unlink=True)
box(root,'Bandeja filtro retirado136',(.50,-.55,-.345),(1.38,.04,.25),metal)
for x in [-.17,1.17]:box(root,'Borde bandeja136',(x,-.51,-.345),(.035,.08,.25),metal)
box(root,'Borde frontal bandeja136',(.50,-.51,-.45),(1.38,.08,.025),metal)
for x in [.02,.98]:box(root,'Soporte bandeja136',(x,-.735,-.345),(.045,.34,.20),metal)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'servicio_ventilation136.blend'),compress=True)
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
 if under(o,root):o.select_set(True)
bpy.context.view_layer.objects.active=root
bpy.ops.export_scene.gltf(filepath=str(OUT/'servicio_ventilation136.glb'),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=False,export_cameras=False,export_lights=False)
raw=(OUT/'servicio_ventilation136.glb').read_bytes();(WEB/'servicio_ventilation.glb.gz').write_bytes(gzip.compress(raw,9,mtime=0));print('136 filter tray exported',flush=True)
