from pathlib import Path
import bpy,math,gzip,json
from mathutils import Vector
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision150';O.mkdir(exist_ok=True);W=R/'dist/models/revision150';W.mkdir(exist_ok=True)
ns={'__file__':str(R/'scripts/refine-substation146.py')};exec((R/'scripts/refine-substation146.py').read_text().split('reports=[]')[0],ns)
mat,label,curve=[ns[k]for k in ['mat','label','curve']]
def box(p,n,xyz,size,m,bevel=.0015):
 a,b,c=[v/2 for v in size];me=bpy.data.meshes.new(n);me.from_pydata([(i*a,j*b,k*c)for i,j,k in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]],[],[(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(0,4,7,3),(1,2,6,5)]);o=bpy.data.objects.new(n,me);bpy.context.collection.objects.link(o);o.parent=p;o.location=xyz;me.materials.append(m)
 if bevel:mod=o.modifiers.new('Radio150','BEVEL');mod.width=min(bevel,min(size)*.2);mod.segments=2
 return o
def cyl(p,n,xyz,r,h,m,axis='Y',segments=24):
 vs=[]
 for z in [-h/2,h/2]:
  for i in range(segments):
   a=2*math.pi*i/segments;q=(r*math.cos(a),r*math.sin(a),z);vs.append((q[0],-q[2],q[1])if axis=='Y'else q)
 fs=[tuple(range(segments-1,-1,-1)),tuple(range(segments,2*segments))]+[(i,(i+1)%segments,(i+1)%segments+segments,i+segments)for i in range(segments)];me=bpy.data.meshes.new(n);me.from_pydata(vs,[],fs);o=bpy.data.objects.new(n,me);bpy.context.collection.objects.link(o);o.parent=p;o.location=xyz;me.materials.append(m)
 for f in me.polygons:f.use_smooth=len(f.vertices)==4
 return o
def empty(n,p):
 o=bpy.data.objects.new(n,None);bpy.context.collection.objects.link(o);o.parent=p;return o
def remove(o):bpy.data.batch_remove(ids=tuple(o.children_recursive)+(o,))
def materials():
 global steel,dark,white,paint,green,red,amber,blue
 steel=mat('Acero satinado150',(.4,.44,.45),.86,.34);dark=mat('Polimero150',(.018,.025,.027),0,.7);white=mat('Serigrafia150',(.81,.82,.77),0,.7);paint=mat('Chapa150',(.55,.56,.51),.12,.49);green=mat('Verde150',(.04,.29,.11),0,.3);red=mat('Rojo150',(.45,.02,.015),0,.3);amber=mat('Ambar150',(.65,.32,.015),0,.3);blue=mat('Azul150',(.03,.13,.45),0,.3)
def gauge(p,x,z,unit,maxval):
 box(p,'Instrumento '+unit,(x,-.031,z),(.235,.045,.235),dark,.005);box(p,'Marco instrumento150',(x,-.057,z),(.219,.007,.219),steel);box(p,'Caratula150',(x,-.061,z),(.201,.002,.201),white,0)
 for j in range(11):
  a=math.pi-j*math.pi/10;curve(p,'Marca escala150',[(x+math.cos(a)*.08,-.063,z-.04+math.sin(a)*.08),(x+math.cos(a)*.07,-.063,z-.04+math.sin(a)*.07)],.0009,dark)
 curve(p,'Aguja150',[(x,-.066,z-.04),(x-.035,-.066,z+.031)],.0012,dark);label(p,unit,(x,-.064,z+.044),.019,dark);label(p,'0       '+str(maxval),(x,-.064,z-.067),.012,dark)
def button(p,x,z,title,m,selector=False):
 box(p,'Placa '+title,(x,-.025,z+.015),(.087,.012,.118),dark);cyl(p,'Corona150',(x,-.04,z),.023,.016,steel);cyl(p,'Piloto '+title,(x,-.052,z),.017,.009,m)
 if selector:box(p,'Maneta150',(x,-.065,z),(.009,.020,.043),dark)
 label(p,title,(x,-.035,z+.047),.007,white)
def export(root,name,path):
 bpy.context.scene.unit_settings.system='METRIC';bpy.ops.wm.save_as_mainfile(filepath=str(O/(name+'.blend')),compress=True);bpy.ops.object.select_all(action='DESELECT')
 for o in [root]+list(root.children_recursive):o.select_set(True)
 bpy.context.view_layer.objects.active=root;bpy.ops.export_scene.gltf(filepath=str(O/(name+'.glb')),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_animations=False,export_cameras=False,export_lights=False);path.write_bytes(gzip.compress((O/(name+'.glb')).read_bytes(),9,mtime=0))
bpy.ops.wm.open_mainfile(filepath=str(R/'assets-source/revision148/substation148.blend'));materials();counts={};report=[]
for door in [o for o in bpy.data.objects if o.type=='EMPTY'and o.name.startswith('Puerta de gabinete')]:
 part=door.parent.name;counts[part]=counts.get(part,0)+1
 for o in list(door.children):
  if o.name.startswith(('Frente de instrumentacion146','Identificacion puerta136','Placa solidaria a puerta136')):remove(o)
 if part not in ['mt','rectifier','dc','control']:continue
 width=next(o for o in door.children if o.name.startswith('Hoja de gabinete')).dimensions.x;x=width*.5;face=empty('Frente funcional150 '+part,door);face.scale.y=-1
 title={'mt':['ENTRADA MT','PROTECCION MT','SALIDA A TRAFO'][counts[part]-1],'rectifier':'GRUPO RECTIFICADOR','dc':'ALIMENTADOR CD '+str(counts[part]),'control':'CONTROL Y AUXILIARES'}[part];door['panelRole150']=title;report.append({'part':part,'title':title});box(face,'Placa funcion150',(x,-.028,2.36),(width*.86,.014,.13),dark);label(face,title,(x,-.038,2.36),.027,white)
 if part=='rectifier':
  gauge(face,x+.17,2.06,'kV CD',1);gauge(face,x-.17,2.06,'kA CD',4)
  for j,(t,m)in enumerate([('CA',white),('CD',white),('FALLA',red),('TEMP',amber),('FLUJO',amber),('PUERTA',amber),('ALARMA',amber),('LISTO',amber)]):button(face,x-(j-3.5)*.105,1.69,t,m)
  for j,(t,m)in enumerate([('SERV',blue),('VENT',blue),('PRUEBA',amber),('LOCAL',dark),('MARCHA',green),('PARO',red),('RESET',amber),('REMOTO',dark)]):button(face,x-(j-3.5)*.105,1.51,t,m,t in ['LOCAL','REMOTO'])
 elif part=='mt':
  for dx,t,m in [(-.14,'ABIERTO',green),(.14,'CERRADO',red)]:button(face,x+dx,1.85,t,m)
  label(face,'CA / CELDA MT',(x,-.033,2.1),.025,dark);box(face,'Mimico MT150',(x,-.03,1.52),(.025,.006,.31),dark);box(face,'Corte MT150',(x+.04,-.034,1.54),(.11,.006,.018),dark)
 elif part=='dc':
  gauge(face,x,2.06,'kA CD',4)
  for dx,t,m in [(-.15,'ABIERTO',green),(0,'CERRADO',red),(.15,'DISPARO',amber)]:button(face,x+dx,1.68,t,m)
  button(face,x-.13,1.49,'LOCAL',dark,True);button(face,x+.13,1.49,'REARME',blue)
 else:
  box(face,'Ventana RTU150',(x,-.03,2.06),(.42,.02,.19),dark);label(face,'CONTROL / ESTADOS',(x,-.044,2.06),.021,white)
  for dx,t,m in [(-.16,'AUX',green),(0,'ALARMA',red),(.16,'PUERTA',amber)]:button(face,x+dx,1.72,t,m)
  button(face,x,1.5,'LOCAL',dark,True)
for door in bpy.data.objects:
 if door.type=='EMPTY'and door.name.startswith('Puerta de gabinete'):door.rotation_euler.z=math.radians(105)*door.get('openSign138',1)
export(bpy.data.objects['SR_Blend127'],'subestacion150',R/'dist/models/revision142/subestacion142.glb.gz')
for kind in ['ventilation','control','battery','diodes','insulation','relay']:
 bpy.ops.wm.open_mainfile(filepath=str(R/'assets-source/revision148'/(kind+'148.blend')));materials();root=next(o for o in bpy.data.objects if o.parent is None);root['mounted150']=kind
 for o in list(root.children):
  if o.name.startswith(('Mesa','Pata','Panel de ensayo','Panel tecnico','Identificación','Alcance','Leyenda','Bandeja de retirados','Bandeja filtro retirado','Borde bandeja','Borde frontal bandeja','Soporte bandeja','Fijacion panel')):remove(o)
 if kind in ['control','relay','insulation','diodes']:
  box(root,'Placa interior instalada150',(0,-.11,0),(1.76,.035,1.1),paint,.008)
  for z in [-.42,.42]:box(root,'Carril de montaje150',(0,-.075,z),(1.65,.028,.035),steel)
 box(root,'Repisa solidaria al gabinete150',(1.08,.13,-.49),(.62,.44,.025),steel,.006)
 export(root,kind+'150',W/(kind+'150.glb.gz'))
(O/'distribucion150.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('BUILD150 COMPLETE',flush=True)
