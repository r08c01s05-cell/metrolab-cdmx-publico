"""Editable Blender instruments, generic educational designs; metric export."""
import bpy,sys,math,gzip
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent))
from parts140 import empty,mat,box,axial,printed,C
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision142';O.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
rubber=mat('Elastomero antideslizante142',(.019,.024,.026),0,.82)
dark=mat('Polimero grafito142',(.035,.043,.045),0,.56)
steel=mat('Acero conectores142',(.52,.55,.56),.92,.31)
ink=mat('Serigrafia clara142',(.75,.79,.73),0,.7)
lcd=mat('Cristal LCD142',(.16,.23,.19),.04,.27)
red=mat('Boton TEST142',(.52,.035,.025),0,.46)
for i,kind in enumerate(['dmm','megohm','anemometer']):
 g=empty('instrument142_'+kind);g['instrument142']=kind;g['display142']=[0,.168,.118];g['displaySize142']=[.318,.152]
 paint=mat('Carcasa '+kind+'142',[(.50,.31,.055),(.12,.30,.22),(.17,.24,.29)][i],0,.48)
 box(g,'Funda sobremoldeada142',(0,0,0),(.52,.81,.195),rubber,.045)
 box(g,'Carcasa moldeada142',(0,0,.025),(.475,.76,.172),paint,.035)
 box(g,'Junta de carcasa142',(0,0,-.06),(.49,.77,.012),dark,.002)
 box(g,'Bisel pantalla142',(0,.168,.109),(.367,.202,.017),dark,.008)
 box(g,'LCD empotrado142',(0,.168,.119),(.318,.152,.002),lcd,.001)
 printed(g,'METROLAB',(0,.32,.113),.025,ink)
 printed(g,{'dmm':'MULTIMETRO','megohm':'MEGOHMETRO','anemometer':'ANEMOMETRO'}[kind],(0,.28,.114),.019,ink)
 for x in [-.25,.25]:
  for k in range(7):box(g,'Nervio de agarre142',(x,-.20+k*.061,-.015),(.019,.027,.12),rubber,.005)
 for x in [-.204,.204]:
  for y in [-.34,.34]:
   axial(g,'Tornillo de carcasa142',(x,y,.112),[(0,0),(.012,0),(.012,.004),(0,.004)],steel,24)
   box(g,'Ranura tornillo142',(x,y,.1162),(.016,.002,.0007),dark,0)
 box(g,'Soporte trasero142',(0,-.12,-.112),(.32,.34,.018),dark,.008)
 for x in [-.112,0,.112]:box(g,'Tecla elastomero142',(x,.037,.118),(.070,.035,.016),dark,.008)
 test=empty('instrument142_test_'+kind,g);test['instrumentControl142']='measure'
 axial(test,'Pulsador de medida142',(.147,-.17,.113),[(0,0),(.044,0),(.044,.015),(.039,.019),(0,.019)],red,48)
 printed(test,'TEST' if kind=='megohm' else 'READ',(.147,-.174,.133),.015,ink)
 dial=empty('instrument142_dial_'+kind,g);dial['instrumentControl142']='dial';dial.location=C@__import__('mathutils').Vector((-.04,-.11,.116))
 if kind!='anemometer':
  axial(dial,'Selector moldeado142',(0,0,0),[(0,0),(.078,0),(.078,.025),(.070,.030),(0,.030)],dark,64)
  box(dial,'Cresta de selector142',(0,0,.038),(.024,.118,.028),dark,.006)
  box(dial,'Indice selector142',(0,.047,.053),(.009,.014,.001),ink,.001)
  for a,label in enumerate(['OFF','V','R ISO' if kind=='megohm' else 'DIODE','Ω']):
   angle=math.pi/2+a*math.pi/2;printed(g,label,(-.04+math.cos(angle)*.114,-.11+math.sin(angle)*.114,.115),.017,ink)
 for x,label in ([] if kind=='anemometer' else [(-.13,'EARTH' if kind=='megohm' else 'COM'),(.13,'LINE' if kind=='megohm' else 'V / Ω')]):
  axial(g,'Boca banana142',(x,-.285,.113),[(.014,0),(.023,0),(.024,.011),(.014,.013),(.014,0)],steel,40)
  axial(g,'Cavidad aislada142',(x,-.285,.111),[(0,0),(.014,0),(.014,.002),(0,.002)],dark,32)
  printed(g,label,(x,-.338,.114),.019,ink)
 if kind!='anemometer':
  for sign in [-1,1]:
   box(g,'Brazo de soporte de punta143',(sign*.29,-.25,.105),(.12,.037,.065),dark,.004)
   holder=empty('Soporte lateral de punta143',g,(sign*.35,-.25,.15))
   ring=axial(holder,'Abrazadera de elastomero143',(0,0,0),[(.015,-.018),(.022,-.018),(.023,-.014),(.023,.014),(.022,.018),(.015,.018),(.015,-.018)],dark,40);ring.rotation_euler.x=math.pi/2
 if kind=='megohm':
  axial(g,'Puerto GUARD142',(0,-.285,.113),[(.012,0),(.020,0),(.020,.009),(.012,.010),(.012,0)],steel,32)
  printed(g,'GUARD',(0,-.338,.114),.015,ink)
 if kind=='anemometer':
  printed(g,'VELOCIDAD DEL AIRE / m/s',(0,-.30,.114),.019,ink)
  box(g,'Cuello de sonda142',(0,.44,0),(.065,.16,.09),dark,.012)
  axial(g,'Anillo de sonda142',(0,.60,0),[(.125,-.035),(.155,-.035),(.158,.038),(.126,.038),(.125,-.035)],dark,64)
  axial(g,'Eje de turbina142',(0,.60,0),[(0,-.025),(.024,-.025),(.024,.035),(0,.035)],steel,32)
  for a in range(7):
   q=box(g,'Alabe de anemometro142',(math.cos(a*math.tau/7)*.07,.60+math.sin(a*math.tau/7)*.07,0),(.108,.022,.013),dark,.003);q.rotation_euler.y=-a*math.tau/7
  for x in [-.085,0,.085]:box(g,'Resguardo de sonda142',(x,.60,.042),(.004,.24 if x==0 else .18,.004),steel,.001)
bpy.context.scene.unit_settings.system='METRIC';bpy.ops.wm.save_as_mainfile(filepath=str(O/'instrumentos142.blend'),compress=True)
# Apply manufactured radii, keep controls independent, batch static meshes by material.
for o in list(bpy.context.scene.objects):
 if o.type=='FONT':
  bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')
for o in list(bpy.context.scene.objects):
 if o.type!='MESH':continue
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
 for m in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=m.name)
for root in [o for o in bpy.context.scene.objects if o.get('instrument142')]:
 for anchor in [root]+[o for o in root.children if o.get('instrumentControl142')]:
  bins={}
  for o in list(anchor.children):
   if o.type=='MESH':bins.setdefault(o.data.materials[0].name,[]).append(o)
  for objects in bins.values():
   bpy.ops.object.select_all(action='DESELECT')
   for o in objects:o.select_set(True)
   bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join()
bpy.ops.export_scene.gltf(filepath=str(O/'instrumentos142.glb'),export_format='GLB',export_apply=True,export_extras=True,export_animations=False,export_cameras=False,export_lights=False)
D=R/'dist/models/revision142';D.mkdir(parents=True,exist_ok=True);(D/'instrumentos142.glb.gz').write_bytes(gzip.compress((O/'instrumentos142.glb').read_bytes(),9,mtime=0))
print('142 native instruments complete',flush=True)
