"""Editable Blender detail pass, preserving all interactive roots and cabinet hinges."""
from pathlib import Path
import bpy,math,gzip,json,subprocess,sys
from mathutils import Vector
R=Path(__file__).resolve().parents[1];ns={'__file__':str(R/'scripts/refine-substation146.py')}
exec((R/'scripts/refine-substation146.py').read_text().split('reports=[]')[0],ns)
mat,curve,quantise=[ns[k]for k in ['mat','curve','quantise']]
O=R/'assets-source/revision148';O.mkdir(exist_ok=True);reports=[]
def mesh(p,n,v,f,m):
 me=bpy.data.meshes.new(n);me.from_pydata(v,[],f);me.update();o=bpy.data.objects.new(n,me);bpy.context.collection.objects.link(o);o.parent=p;o.data.materials.append(m);o['revision148']=True;return o
def box(p,n,xyz,size,m):
 x,y,z=xyz;a,b,c=[s/2 for s in size];o=mesh(p,n,[(x+i*a,y+j*b,z+k*c)for i,j,k in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]],[(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(0,4,7,3),(1,2,6,5)],m);mod=o.modifiers.new('Radio de fabricacion148','BEVEL');mod.width=min(.0015,min(size)*.2);mod.segments=2;return o
def cyl(p,n,xyz,r,h,m,segments=24):
 x,y,z=xyz;v=[(x+r*math.cos(2*math.pi*i/segments),y+s*h/2,z+r*math.sin(2*math.pi*i/segments))for s in [-1,1]for i in range(segments)];f=[tuple(range(segments)),tuple(reversed(range(segments,2*segments)))]+[(i,i+segments,(i+1)%segments+segments,(i+1)%segments)for i in range(segments)];o=mesh(p,n,v,f,m)
 for face in o.data.polygons:face.use_smooth=len(face.vertices)==4
 return o
specs=ns['SPECS']+[(k,'mantenimiento103/'+('ventilation'if k=='ventilation_train'else k)+'.glb.gz')for k in ['doors','ventilation_train','running','electrical']]
if '--train-only' in sys.argv:specs=specs[-4:]
for kind,rel in specs:
 bpy.ops.wm.read_factory_settings(use_empty=True);src=R/'assets-source/revision146'/(kind+'146.blend')
 if src.exists():bpy.ops.wm.open_mainfile(filepath=str(src))
 else:
  tmp=O/'input.glb';tmp.write_bytes(gzip.decompress(subprocess.check_output(['/usr/bin/git','show','c94f48f1b6f92803069463d840daba6481269cc6:dist/models/'+rel],cwd=R)));bpy.ops.import_scene.gltf(filepath=str(tmp));tmp.unlink()
 root=next(o for o in bpy.context.scene.objects if o.parent is None)
 steel=mat('Acero mecanizado148',(.39,.42,.43),.88,.32);copper=mat('Cobre electrotecnico148',(.36,.14,.055),.9,.3);dark=mat('Poliamida y junta148',(.018,.023,.026),0,.7);ivory=mat('Ceramica vitrificada148',(.65,.62,.53),0,.28);paint=mat('Chapa pintada148',(.32,.36,.35),.2,.42)
 def bolt(p,xyz,r=.012):
  x,y,z=xyz;cyl(p,'Arandela de fijacion148',(x,y+.002,z),r*1.35,.003,steel);cyl(p,'Tuerca hexagonal148',xyz,r,.008,steel,6);cyl(p,'Vastago roscado148',(x,y-.006,z),r*.48,.008,steel)
 if kind=='substation':
  p=bpy.data.objects['rectifier']
  for x in [.72,1.58]:
   for z in [.63,.93,1.23,1.53,1.83,2.13]:
    for dx in [-.115,.115]:
     box(p,'Mordaza de presion diodo148',(x+dx,-1.60,z),(.025,.055,.19),steel)
     for dz in [-.065,.065]:bolt(p,(x+dx,-1.56,z+dz))
    curve(p,'Puente flexible rectificador148',[(x,-1.62,z+.095),(x+.11,-1.72,z+.15),(x+.18,-1.90,z+.15)],.012,copper)
  p=bpy.data.objects['transformer']
  for x in [-2.58,-1.85,-1.12]:
   for z in [.70,1.85]:
    box(p,'Brida de bobina148',(x,-1.58,z),(.43,.035,.055),steel)
    for dx in [-.17,.17]:bolt(p,(x+dx,-1.55,z),.016)
   curve(p,'Salida bobinado148',[(x,-2,2.08),(x,-1.95,2.21),(x+.10,-1.88,2.26)],.023,copper)
  p=bpy.data.objects['dc']
  for x in [3.7,4.85]:
   for j in range(10):box(p,'Placa de camara de arco148',(x-.28+j*.062,-1.90,1.64),(.017,.31,.18),dark)
   cyl(p,'Eje mecanismo CD148',(x,-1.64,1.2),.04,.05,steel);curve(p,'Biela articulada CD148',[(x-.23,-1.64,1.12),(x,-1.62,1.2),(x+.18,-1.62,1.4)],.015,steel)
  for name in ['mt','control']:
   p=bpy.data.objects[name]
   for o in list(p.children_recursive):
    if o.name.startswith('Contacto_modulo'):
     q=p.matrix_world.inverted()@o.matrix_world.translation;bolt(p,(q.x,q.y+.024,q.z),.006)
 else:
  targets={o.get('srTarget128'):o for o in bpy.data.objects if o.get('srTarget128')}
  if kind in ['control','battery']:
   switch=bpy.data.objects.new('Seccionador auxiliar148',None);bpy.context.collection.objects.link(switch);switch.parent=root;switch.location=(.68,.08,-.33);switch['srTarget128']='isolator148'
   box(switch,'Base interruptor S1 148',(0,0,0),(.15,.065,.18),paint);cyl(switch,'Bisel S1 148',(0,.045,0),.047,.024,steel);lever=box(switch,'Palanca S1 148',(0,.067,0),(.022,.025,.07),dark);lever['isolatorLever148']=True
   text=ns['label'](switch,'S1 / '+('CARGA'if kind=='battery'else'FUENTE'),(0,.088,.12),.022,dark);text.rotation_euler=(math.pi/2,0,math.pi);text.scale.x=1
   for x in [-.055,.055]:
    for z in [-.07,.07]:bolt(switch,(x,.04,z),.006)
   if kind=='battery':
    for key in ['terminalL','terminalR']:
     p=targets[key]
     for j in range(7):curve(p,'Hilos de cobre flexible148',[(j*.004-.012,.015,-.08),(j*.004+.02,.05,-.13),(j*.004+.07,.05,-.16)],.002,copper)
     for z in [-.06,.06]:bolt(p,(0,.065,z),.008)
   else:
    for i in range(6):
     x=-.25+i*.10;box(root,'Bornera auxiliar DIN148',(x,.065,-.40),(.075,.06,.09),ivory)
     for dz in [-.025,.025]:bolt(root,(x,.10,-.40+dz),.005)
  elif kind=='insulation':
   p=targets['sample'];box(p,'Muestra aislante fisurada148',(0,.14,0),(.115,.025,.20),ivory);o=curve(p,'Fisura de la muestra148',[(-.027,.155,-.07),(.009,.155,-.025),(-.014,.155,.015),(.023,.155,.07)],.0018,dark);o['fault148']=True
   for x in [-.19,.19]:
    for z in [-.09,.09]:bolt(p,(x,.13,z),.008)
   for key in ['lineA','lineB','earth']:
    p=targets[key];cyl(p,'Anillo aislante148',(0,.005,0),.035,.008,ivory);cyl(p,'Contacto de medida148',(0,.014,0),.009,.014,steel)
  elif kind=='relay':
   p=targets['relay']
   for j in range(18):curve(p,'Espira de bobina rele148',[(-.055,.135,-.06+j*.006),(-.06,.15,-.06+j*.006),(.06,.15,-.06+j*.006),(.055,.135,-.06+j*.006)],.0015,copper)
  elif kind=='diodes':
   p=targets['module']
   for x in [-.18,.18]:
    for z in [-.10,.10]:bolt(p,(x,.10,z),.01)
 # Actual manufacturing radii on large mechanical faces, without extra texture noise.
 for o in bpy.data.objects:
  if o.type=='MESH'and o.name.startswith(('Chapa','Hoja de gabinete','Interruptor_ultrarrapido','Panel de','Marco de','Cartucho','Contacto','Terminal mecanizado','Tornillo','Cabeza','Tuerca','Mordaza','Soporte')):
   b=o.modifiers.new('Chaflan de fabricacion148','BEVEL');b.width=.0015;b.segments=2
 root['revision148']=True;root['scope148']='Detalle visual de equipos y bancos aislados; no es plano de fabricante ni procedimiento de maniobra STC.'
 bpy.context.scene.unit_settings.system='METRIC';bpy.context.view_layer.update();bpy.ops.wm.save_as_mainfile(filepath=str(O/(kind+'148.blend')),compress=True);out=O/(kind+'148.glb');bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=root;bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',export_apply=True,export_extras=True,export_animations=False,export_cameras=False,export_lights=False)
 payload=quantise(out);(R/'dist/models'/rel).write_bytes(gzip.compress(payload,9,mtime=0));reports.append({'kind':kind,'path':rel,'bytes':(R/'dist/models'/rel).stat().st_size});print(json.dumps(reports[-1]),flush=True)
if '--train-only' in sys.argv:reports=json.loads((O/'audit148.json').read_text())[:-4]+reports
(O/'audit148.json').write_text(json.dumps(reports,indent=2))
