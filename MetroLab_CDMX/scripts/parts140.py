import bpy,math
from mathutils import Vector,Matrix
import random
C=Matrix.Rotation(math.pi/2,4,'X')
def mat(n,c,metal=0,rough=.5):
 m=bpy.data.materials.new(n);m.use_nodes=True;b=m.node_tree.nodes['Principled BSDF'];b.inputs['Base Color'].default_value=(*c,1);b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough
 if metal>.8:
  image=bpy.data.images.get('Cepillado140')
  if not image:
   image=bpy.data.images.new('Cepillado140',width=128,height=128);rng=random.Random(140);pixels=[]
   for y in range(128):
    row=rng.uniform(-.045,.045)
    for x in range(128):v=max(.05,min(.95,.38+row+rng.uniform(-.008,.008)));pixels.extend([v,v,v,1])
   image.pixels[:]=pixels;image.colorspace_settings.name='Non-Color';image.pack()
  node=m.node_tree.nodes.new('ShaderNodeTexImage');node.image=image;node.extension='REPEAT';m.node_tree.links.new(node.outputs['Color'],b.inputs['Roughness'])
 return m
def empty(n,parent=None,p=(0,0,0)):
 o=bpy.data.objects.new(n,None);bpy.context.collection.objects.link(o);o.parent=parent;o.location=C@Vector(p);return o
def mesh(n,vs,fs,m,parent=None):
 me=bpy.data.meshes.new(n);me.from_pydata([C@Vector(v)for v in vs],[],fs);me.materials.append(m);me.update();uv=me.uv_layers.new(name='UV140')
 for poly in me.polygons:
  normal=C.inverted().to_3x3()@poly.normal;axis=max(range(3),key=lambda k:abs(normal[k]));axes=[k for k in range(3)if k!=axis]
  for li in poly.loop_indices:
   v=C.inverted()@me.vertices[me.loops[li].vertex_index].co;uv.data[li].uv=(v[axes[0]]/.12,v[axes[1]]/.12)
 o=bpy.data.objects.new(n,me);bpy.context.collection.objects.link(o);o.parent=parent;return o
def bevel(o,r=.002,segments=3):
 b=o.modifiers.new('Radio de fabricacion140','BEVEL');b.width=r;b.segments=segments;b.harden_normals=True;n=o.modifiers.new('Normales de chapa140','WEIGHTED_NORMAL');n.keep_sharp=True;return o
def box(parent,n,p,s,m,r=.001):
 x,y,z=[a/2 for a in s];o=mesh(n,[(-x,-y,-z),(x,-y,-z),(x,y,-z),(-x,y,-z),(-x,-y,z),(x,-y,z),(x,y,z),(-x,y,z)],[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],m,parent);o.location=C@Vector(p);return bevel(o,min(r,min(s)*.2)) if r>0 else o
def axial(parent,n,p,profile,m,segments=48,smooth=True):
 vs=[(p[0]+r*math.cos(i*2*math.pi/segments),p[1]+r*math.sin(i*2*math.pi/segments),p[2]+z)for r,z in profile for i in range(segments)];fs=[]
 for row in range(len(profile)-1):
  for i in range(segments):a=row*segments+i;b=row*segments+(i+1)%segments;fs.append((a,b,b+segments,a+segments))
 o=mesh(n,vs,fs,m,parent)
 if smooth:
  for f in o.data.polygons:f.use_smooth=True
 return o
def printed(parent,text,p,size,m,n='Serigrafia140'):
 c=bpy.data.curves.new(n,'FONT');c.body=text;c.size=size;c.align_x='CENTER';c.resolution_u=3;o=bpy.data.objects.new(n+' '+text,c);bpy.context.collection.objects.link(o);o.parent=parent;o.location=C@Vector(p);o.rotation_euler=(math.pi/2,0,0);o.data.materials.append(m);return o
# In web coordinates these parts face +Z. Text orientation maps the print to that face.
def create_parts140():
 steel=mat('Acero cepillado inoxidable140',(.46,.49,.50),.88,.36);black=mat('Caucho junta y cajeados140',(.016,.019,.02),0,.86);red=mat('Pintura roja alarma140',(.45,.025,.018),.03,.38);ink=mat('Rotulo rojo alarma140',(.42,.015,.018),0,.6);plate=mat('Rotulo marfil alarma140',(.72,.73,.68),0,.64);brown=mat('Pintura marron difusor140',(.055,.039,.030),.24,.48)
 def screw(g,p,r=.008):
  axial(g,'Tornillo de seguridad140',p,[(0,0),(r,0),(r*.95,.003),(r*.65,.0045),(0,.0045)],steel,32)
  for a in [0,2*math.pi/3,4*math.pi/3]:
   q=box(g,'Muesca de seguridad140',(p[0]+math.cos(a)*r*.75,p[1]+math.sin(a)*r*.75,p[2]+.0046),(r*.65,r*.20,.0004),black,.0001);q.rotation_euler.z=a
 alarm=empty('Alarma_L8_referencia140');alarm['detail140']='alarm';alarm['source140']='004818,004823';
 # Folded face has a stepped ridge, not a flat rectangular box.
 xs=[(-.17,.002),(.17,.002),(.17,.045),(-.015,.045),(-.04,.054),(-.055,.046),(-.17,.046)];vs=[(x,y,z)for y in [-.095,.095]for x,z in xs];n=len(xs);fs=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n)for i in range(n)];bevel(mesh('Carcasa plegada alarma140',vs,fs,steel,alarm),.003,4)
 box(alarm,'Junta posterior alarma140',(0,0,.001),(.337,.188,.003),black)
 for x in [-.147,.147]:
  for y in [-.072,.072]:screw(alarm,(x,y,.047),.009)
 axial(alarm,'Alojamiento llave triangular140',(-.111,.006,.046),[(0,0),(.020,0),(.020,.001),(.017,.003),(0,.003)],black,48)
 axial(alarm,'Cerco acero llave140',(-.111,.006,.047),[(.019,-.001),(.0215,0),(.0215,.002),(.019,.003),(.019,-.001)],steel,48)
 mesh('Llave triangular140',[(-.122,-.001,.0505),(-.100,-.001,.0505),(-.111,.018,.0505)],[(0,1,2)],steel,alarm)
 # Red T handle: an actual shaped extrusion and rounded edges.
 pts=[(-.008,-.093),(.008,-.093),(.012,-.142),(.052,-.158),(.056,-.170),(.05,-.178),(-.05,-.178),(-.056,-.170),(-.052,-.158),(-.012,-.142)];vs=[(x,y,z)for z in [.015,.034]for x,y in pts];n=len(pts);fs=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n)for i in range(n)];bevel(mesh('Palanca roja en T140',vs,fs,red,alarm),.003,4)
 box(alarm,'Placa de senal de alarma140',(0,-.273,.003),(.35,.155,.006),steel,.001);box(alarm,'Lamina rotulada alarma140',(0,-.273,.0063),(.342,.147,.0006),plate,.0001)
 for x in [-.159,.159]:
  for y in [-.335,-.211]:screw(alarm,(x,y,.0066),.004)
 for x in [-.166,.166]:box(alarm,'Borde rojo rotulo140',(x,-.273,.0068),(.001,.133,.0003),ink,.00005)
 for y in [-.34,-.206]:box(alarm,'Borde rojo rotulo140',(0,y,.0068),(.332,.001,.0003),ink,.00005)
 arrow=[(-.139,-.222,.007),(-.113,-.222,.007),(-.113,-.294,.007),(-.101,-.294,.007),(-.126,-.328,.007),(-.151,-.294,.007),(-.139,-.294,.007)];mesh('Flecha de accionamiento140',arrow,[tuple(range(7))],ink,alarm)
 for text,y,size in [('SEÑAL',-.233,.026),('DE ALARMA',-.264,.026),('EN CASO DE PELIGRO',-.284,.009),('JALE LA PALANCA',-.301,.010),('TODO ABUSO SERA CASTIGADO',-.320,.008)]:printed(alarm,text,(.036,y,.0071),size,ink)
 vent=empty('Difusor_L8_referencia140');vent['detail140']='ceiling_diffuser';vent['source140']='004830,004838';
 # Flat square annulus with a real circular aperture.
 N=64;vs=[]
 for z in [0,.006]:
  for inner in [False,True]:
   for i in range(N):a=i*2*math.pi/N;r=.254 if inner else .31/max(abs(math.cos(a)),abs(math.sin(a)));vs.append((r*math.cos(a),r*math.sin(a),z))
 fs=[]
 for i in range(N):j=(i+1)%N;fs.extend([(i,j,N+j,N+i),(2*N+i,3*N+i,3*N+j,2*N+j),(i,2*N+i,2*N+j,j),(N+i,N+j,3*N+j,3*N+i)])
 bevel(mesh('Placa cuadrada con abertura circular140',vs,fs,brown,vent),.0015,3)
 for x in [-.315,.315]:box(vent,'Marco de difusor140',(x,0,-.001),(.012,.642,.012),brown)
 for y in [-.315,.315]:box(vent,'Marco de difusor140',(0,y,-.001),(.618,.012,.012),brown)
 for r in [.25,.206,.162,.118,.074]:axial(vent,'Aro concentrico estampado140',(0,0,0),[(r-.018,.002),(r-.014,.003),(r,.031),(r+.002,.029),(r-.015,.001),(r-.018,.002)],brown,64)
 axial(vent,'Centro ciego del difusor140',(0,0,0),[(0,.025),(.056,.025),(.066,.029),(.066,.034),(0,.034)],brown,64)
 axial(vent,'Fondo oscuro de conducto140',(0,0,0),[(0,.001),(.25,.001),(.25,.002),(0,.002)],black,64)
 for axis in [0,1]:
  for i in range(-29,30):
   x=i*.008
   if abs(x)>=.247:continue
   length=2*math.sqrt(.247**2-x*x)
   if axis==0:box(vent,'Malla fina de resguardo140',(x,0,.006),(.0007,length,.0008),black,0)
   else:box(vent,'Malla fina de resguardo140',(0,x,.005),(length,.0007,.0008),black,0)
 for a in range(4):
  for s in [-1,1]:
   x,y=[(-.289,s*.255),(.289,s*.255),(s*.255,-.289),(s*.255,.289)][a];screw(vent,(x,y,.006),.004)
 return alarm,vent
