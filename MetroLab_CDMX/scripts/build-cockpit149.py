"""First-person teaching pupitre; generic controls, not a certified replica of an STC console."""
from pathlib import Path
import sys,bpy,math,gzip
sys.path.insert(0,str(Path(__file__).parent))
from parts140 import empty,mat,box,axial,printed,C
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision149';O.mkdir(exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
steel=mat('Acero satinado pupitre149',(.40,.44,.45),.86,.32);dark=mat('Polimero pupitre149',(.012,.021,.025),0,.53);ink=mat('Rotulo marfil149',(.78,.84,.77),0,.65);lcd=mat('LCD central149',(.05,.10,.10),0,.52);red=mat('Seta emergencia149',(.60,.018,.009),0,.35);green=mat('Pulsador apertura149',(.04,.30,.17),0,.4);amber=mat('Pulsador aviso149',(.65,.38,.025),0,.42);blue=mat('Pulsador comunicaciones149',(.03,.16,.36),0,.43)
def text(parent,s,p,size=.020):return printed(parent,s,p,size,ink,n='Rotulacion149')
for modern in [False,True]:
 root=empty('cab149_'+('modern'if modern else'classic'));root['cockpit149']=True;root['scope149']='Pupitre didactico para interaccion en primera persona, no replica exacta por modelo.'
 paint=mat('Chapa '+('moderna'if modern else'clasica')+'149',(.10,.19,.19)if modern else(.07,.14,.13),.20,.44)
 box(root,'Frente de chapa plegada149',(0,-.72,-1.05),(1.96,.32,.55),paint,.015)
 box(root,'Plano de mandos149',(0,-.56,-1.10),(1.98,.07,.75),dark,.018)
 box(root,'Borde protegido149',(0,-.53,-.72),(1.98,.06,.04),paint,.012)
 # Front-facing central instrument panel. Labels remain crisp at ordinary browser resolution.
 box(root,'Panel de instrumentos149',(0,-.30,-1.46),(1.92,.39,.06),paint,.012)
 for x in [-.69,.69]:
  box(root,'Bisel indicador149',(x,-.30,-1.416),(.35,.25,.028),steel,.012)
  box(root,'Fondo indicador149',(x,-.30,-1.398),(.315,.215,.012),dark,.006)
  text(root,'PUERTAS'if x<0 else'CABINA',(x,-.24,-1.387),.025)
  text(root,'SUPERVISION'if x<0 else'OPERADOR',(x,-.34,-1.387),.017)
 box(root,'Marco pantalla149',(0,-.30,-1.413),(.65,.285,.036),steel,.012)
 display=box(root,'Pantalla dinamica149',(0,-.30,-1.39),(.60,.235,.006),lcd,.002);display['screen149']=True
 for x in [-.87,.87]:
  for y in [-.43,-.17]:axial(root,'Tornillo de panel149',(x,y,-1.415),[(0,0),(.008,0),(.008,.004),(0,.004)],steel,16)
 lever=empty('Manipulador149',root,(-.55,-.52,-1.10));lever['control149']='lever';lever['label149']='Tracción y freno · arrastra arriba/abajo'
 box(lever,'Fuelle de manipulador149',(0,.018,0),(.19,.035,.18),dark,.009)
 pivot=empty('Pivote mando149',lever);pivot['leverPivot149']=True
 box(pivot,'Vastago palanca149',(0,.105,0),(.028,.21,.028),steel,.009)
 box(pivot,'Empunadura anatomica149',(0,.22,0),(.16,.052,.068),dark,.02)
 for j in range(4):box(pivot,'Estria empunadura149',(-.052+j*.035,.248,0),(.012,.002,.06),paint,.001)
 # Labels printed in the horizontal plane of the deck.
 for y,s in [(-1.29,'TRACCION'),(-.84,'FRENO')]:
  o=text(root,s,(-.55,-.515,y),.023);o.rotation_euler=(0,0,0)
 controls=[('open','ABRIR',.02,-1.13,green),('close','CERRAR',.26,-1.13,amber),('voice','AVISO',.50,-1.13,blue),('emergency','EMERGENCIA',.76,-1.10,red),('align','AJUSTAR',.03,-.94,blue),('cab','CAMBIAR CABINA',.36,-.94,amber)]
 for key,label,x,z,m in controls:
  g=empty('Mando149_'+key,root,(x,-.43,z));g['control149']=key;g['label149']=label
  box(g,'Placa mando149',(0,-.055,0),(.19,.11,.16),paint,.005)
  button=empty('Pulsador149_'+key,g);button['button149']=True
  axial(button,'Corona pulsador149',(0,0,0),[(0,0),(.036,0),(.036,.015),(0,.015)],steel,32).rotation_euler.x=-math.pi/2
  axial(button,'Lente pulsador149',(0,0,0),[(0,.013),(.049 if key=='emergency'else .029,.013),(.049 if key=='emergency'else .029,.032),(0,.032)],m,32).rotation_euler.x=-math.pi/2
  o=text(g,label,(0,.011,.064),.014 if key=='cab'else .017);o.rotation_euler=(0,0,0)
 bpy.context.scene.unit_settings.system='METRIC'
bpy.ops.wm.save_as_mainfile(filepath=str(O/'pupitres149.blend'),compress=True)
bpy.ops.export_scene.gltf(filepath=str(O/'pupitres149.glb'),export_format='GLB',export_apply=True,export_extras=True,export_animations=False)
D=R/'dist/models/revision149';D.mkdir(exist_ok=True);(D/'pupitres149.glb.gz').write_bytes(gzip.compress((O/'pupitres149.glb').read_bytes(),9,mtime=0));print('Native cockpit ready',flush=True)
