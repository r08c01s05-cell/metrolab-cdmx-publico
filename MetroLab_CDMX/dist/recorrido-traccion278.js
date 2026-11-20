import * as Three from 'three';
import {cropGeometry162} from './energy-assets162.js?v=265';

const smooth=(value,min,max)=>Three.MathUtils.smoothstep(value,min,max);

// Secuencia cualitativa. Los porcentajes sólo expresan intensidad relativa.
export function tractionFrame278(seconds) {
 const accelerationTime=Three.MathUtils.clamp(seconds-4,0,13);
 const coastTime=Three.MathUtils.clamp(seconds-17,0,8);
 const brakeTime=Three.MathUtils.clamp(seconds-25,0,18);
 const travel=accelerationTime**2/26+coastTime+brakeTime-brakeTime**2/36;
 const current=smooth(seconds,4,6)*(1-.45*smooth(seconds,6,17))*(1-smooth(seconds,17,18));
 const heat=smooth(seconds,25,30)*(1-smooth(seconds,34,47));
 return {
  distance:3.2*travel/23.5,
  current, heat,
  braking:smooth(seconds,25,27)*(1-smooth(seconds,35,43)),
 };
}

const at=(x,y,z)=>new Three.Vector3(x,y,z);
const trackOffset=new Three.Matrix4().makeTranslation(0,-.204,-1.8);
const longitudinal=new Three.Matrix4().makeRotationY(-Math.PI/2);
const unrotate=longitudinal.clone().invert();
const wheelCenters=[-6.59,-4.81];

function mount(parent,name,position=at(0,0,0)){
 const object=new Three.Group();
 object.name=name;
 object.position.copy(position);
 parent.add(object);
 return object;
}

export function mountTrack279(root,station,halfLength,steel=false) {
 const anchors={};
 station.updateMatrixWorld(true);
 station.traverse(object=>{
  if(!object.isMesh||!/^Barra_guía|^Pista_de_rodamiento|^Riel_de_respaldo|^Lecho_de_vía/.test(object.name))return;
  const z=object.getWorldPosition(at(0,0,0)).z;
  if(z<0||steel&&/^(Barra|Pista)/.test(object.name))return;
  const offset=trackOffset.clone();
  const isRail=object.name.startsWith('Riel');
  const isBar=object.name.startsWith('Barra');
  if(isRail)offset.elements[14]+=Math.sign(z-1.8)*.05;
  if(isRail&&steel)offset.elements[13]+=.07;
  if(isBar){
   offset.elements[14]-=.007;
   offset.elements[13]+=.015;
  }
  const transform=longitudinal.clone().multiply(offset).multiply(object.matrixWorld);
  const geometry=cropGeometry162(object.geometry,transform,-halfLength,halfLength);
  if(!geometry)return;
  geometry.applyMatrix4(unrotate);
  const mesh=new Three.Mesh(geometry,object.material);
  mesh.name=object.name;
  root.add(mesh);
  if(isBar){const opposite=mesh.clone();opposite.scale.z=-1;root.add(opposite);anchors.bar=at(0,.405,1.355);}
  if(isRail&&z>1.8)anchors.rail=at(0,steel?.15:.08,.77);
  if(object.name.startsWith('Pista')&&z>1.8)anchors.pista=at(1.1,.04,1.045);
 });
 if(!anchors.rail||!steel&&(!anchors.bar||!anchors.pista))throw new Error('El GLB de Zaragoza no contiene las piezas de vía esperadas.');
 return anchors;
}

function subsetGeometry(object,box){
 const source=object.geometry,position=source.attributes.position,vertices=[];
 const world=at(0,0,0);
 for(let i=0;i<position.count;i++)vertices.push(box.containsPoint(world.fromBufferAttribute(position,i).applyMatrix4(object.matrixWorld)));
 const indices=[],bounds=new Three.Box3();
 const index=source.index,count=index?.count??position.count;
 for(let i=0;i<count;i+=3){
  const a=index?index.getX(i):i,b=index?index.getX(i+1):i+1,c=index?index.getX(i+2):i+2;
  if(!vertices[a]||!vertices[b]||!vertices[c])continue;
  indices.push(a,b,c);
  for(const corner of [a,b,c])bounds.expandByPoint(world.fromBufferAttribute(position,corner));
 }
 if(!indices.length)return null;
 const geometry=new Three.BufferGeometry();
 for(const [name,attribute] of Object.entries(source.attributes))geometry.setAttribute(name,attribute);
 geometry.setIndex(indices);
 geometry.boundingBox=bounds;
 geometry.boundingSphere=bounds.getBoundingSphere(new Three.Sphere());
 return geometry;
}

function pullMesh(object,destination,geometry=object.geometry){
 const mesh=new Three.Mesh(geometry,object.material);
 mesh.name=object.name;
 destination.updateWorldMatrix(true,false);
 const transform=destination.matrixWorld.clone().invert().multiply(object.matrixWorld);
 transform.decompose(mesh.position,mesh.quaternion,mesh.scale);
 destination.add(mesh);
 return mesh;
}

function wheelPart(parts,source,x,z,steel){
 const size=steel?at(.314,.315,.043):at(.422,.422,.11);
 const center=at(x,.46,z),bounds=new Three.Box3(center.clone().sub(size),center.clone().add(size));
 const geometry=subsetGeometry(source,bounds);
 if(!geometry)throw new Error('No se encontró la rueda en la carrocería GLB.');
 const group=mount(parts,steel?'Rueda de seguridad GLB':'Neumático portador GLB',center);
 pullMesh(source,group,geometry);
 return group;
}

export function makeTraction278(root,mode,train,station) {
 const running=mode==='traction',steel=mode==='steel';
 const track=mount(root,'Vía GLB de Zaragoza');
 const trackPoints=mountTrack279(track,station,running?11.5:3.5,steel);
 root.add(station);
 station.visible=false;
 root.add(train);
 train.visible=false;
 train.updateMatrixWorld(true);
 const rubber=train.getObjectByName('exterior__Goma_y_juntas');
 const metal=train.getObjectByName('exterior__Acero_inoxidable_cepillado');
 const mechanical=train.getObjectByName('Mecanica_detallada_referencia_fotografica');
 if(!rubber||!metal||!mechanical)throw new Error('El coche GLB no incluye todos los conjuntos de rodaje.');

 const vehicle=mount(root,'Coche NM-22 animado'),parts=mount(vehicle,'Corte del coche GLB');
 const anchors={},exploded=[],wheels=[];
 for(const x of steel?wheelCenters.slice(0,1):wheelCenters)for(const side of [-1,1]){
  const safety=wheelPart(parts,metal,x,side*.77,true);
  wheels.push([safety,.31]);
  if(side>0)anchors.steelWheel=safety;
  if(steel)continue;
  const tire=wheelPart(parts,rubber,x,side*1.06,false);
  wheels.push([tire,.42]);
  if(side>0)anchors.tire=tire;
  exploded.push([safety,at(0,.30,side*.28)],[tire,at(0,.52,side*.58)]);
 }

 if(steel){
  parts.position.x=-wheelCenters[0];
  anchors.rail=mount(track,'Riel GLB',trackPoints.rail.clone().setX(1));
  return {anchors,animate(){}};
 }

 const motor=train.getObjectByName('Motor_traccion_1_referencia94');
 const secondMotor=train.getObjectByName('Motor_traccion_2_referencia94');
 const shoes=train.children.filter(object=>/^Captador_positivo_B1_S-?1$/.test(object.name));
 const guides=train.children.filter(object=>/^Rueda_guia_horizontal112/.test(object.name)&&object.position.x<0);
 if(!motor||!secondMotor||shoes.length!==2||guides.length!==4)throw new Error('El NM-22 GLB no contiene los dos captadores y guías del bogie.');
 // Los hijos directos conservan su coordenada original de coche en el corte.
 for(const object of [...shoes,...guides,motor,secondMotor])parts.add(object);
 for(const object of mechanical.children){
  if(!object.isMesh)continue;
  const p=object.getWorldPosition(at(0,0,0));
  if(p.x < -3.7&&p.x > -7.8)pullMesh(object,parts);
 }
 for(const object of [...shoes,...guides]){
  const isShoe=/^Captador/.test(object.name),side=Math.sign(object.position.z);
  const id=isShoe?'shoe':'guide';
  if(side>0)anchors[id]=isShoe
   ? object.children.find(child=>/patin_carbon_contacto/.test(child.name))
   : object.children.find(child=>/Neumatico_horizontal/.test(child.name));
  exploded.push([object,isShoe?at(0,.08,side*.69):at(Math.sign(object.position.x+5.7)*.32,.20,side*.90)]);
 }
 anchors.pista=mount(track,'Pista GLB',trackPoints.pista);
 anchors.bar=mount(track,'Barra guía GLB',trackPoints.bar);
 anchors.return=mount(track,'Riel de retorno GLB',trackPoints.rail.clone().setX(-.95));

 if(!running){
  parts.position.x=5.7;
  const separated=exploded.map(([object,offset])=>[object,object.position.clone(),offset]);
  return {anchors,animate(seconds){
   const amount=smooth(seconds,3,10)*(1-smooth(seconds,45,51));
   for(const [object,start,offset] of separated)object.position.copy(start).addScaledVector(offset,amount);
  }};
 }

 const floor=train.getObjectByName('interior__Piso_gris_antideslizante');
 const floorSlice=floor&&cropGeometry162(floor.geometry,longitudinal.clone().multiply(floor.matrixWorld),-8.24,-.85);
 let deck;
 if(floorSlice){
  floorSlice.applyMatrix4(unrotate);
  deck=new Three.Mesh(floorSlice,floor.material);
  deck.name='Piso del NM-22 GLB en corte';
  parts.add(deck);
 }
 const cabinets=[mount(parts,'Cofre GLB de referencia'),mount(parts,'Rejilla GLB de referencia')];
 const heated=[];
 for(const object of mechanical.children){
  if(!object.isMesh||!/Marco|Lama|Soporte_equipo|Placa_precaucion/.test(object.name))continue;
  const p=object.getWorldPosition(at(0,0,0));
  if(p.z<.55)continue;
  const slot=Math.abs(p.x+2.75)<.78?0:Math.abs(p.x)<.79?1:-1;
  if(slot<0)continue;
  const mesh=pullMesh(object,cabinets[slot]);
  if(slot===1&&/^Lama/.test(object.name)){
   mesh.material=object.material.clone();
   mesh.material.emissive.set('#ff572c');
   heated.push(mesh.material);
  }
 }
 if(cabinets.some(cabinet=>!cabinet.children.length)||!heated.length)throw new Error('No se encontraron los cofres de referencia del NM-22 GLB.');
 anchors.motor=motor;
 anchors.converter=mount(cabinets[0],'Entrada de potencia',at(-2.75,.77,.79));
 anchors.resistor=mount(cabinets[1],'Disipación de freno',at(0,.77,.79));
 const points=()=>Object.fromEntries(['shoe','motor','converter','resistor'].map(id=>[id,
  vehicle.worldToLocal(anchors[id].getWorldPosition(at(0,0,0)))]));
 const position=points(),shoe=position.shoe;
 const fromBar=flow(vehicle,[at(shoe.x-3.5,shoe.y,1.355),at(shoe.x,shoe.y,1.355),shoe,position.converter,position.motor],'#ffca58');
 const railReturn=flow(vehicle,[position.converter,at(shoe.x-.4,.085,.77),at(shoe.x-3.5,.085,.77)],'#86d9ee');
 const toHeat=flow(vehicle,[position.motor,position.converter,position.resistor],'#ff7654');
 const full=train.getObjectByName('NM22_L1_Coche_intermedio');
 if(full)parts.add(full);
 return {anchors,animate(seconds){
  const {distance,current,heat,braking}=tractionFrame278(seconds);
  vehicle.position.x=-1.6+distance;
  // La caja abre el plano de arranque; al entrar al cofre queda el piso recortado.
  if(full)full.visible=seconds<10;
  if(deck)deck.visible=!full||seconds>=10;
  for(const [object,radius] of wheels){
   object.visible=!full||seconds>=10;
   object.rotation.z=-distance/radius;
  }
  fromBar(seconds,current);
  railReturn(seconds,current);
  toHeat(seconds,braking);
  for(const material of heated)material.emissiveIntensity=2.2*heat;
 }};
}

function flow(parent,points,color){
 const path=new Three.CurvePath();
 for(let i=1;i<points.length;i++)path.add(new Three.LineCurve3(points[i-1],points[i]));
 const group=mount(parent,'Flujo eléctrico ilustrativo');
 const line=new Three.Line(new Three.BufferGeometry().setFromPoints(points),
  new Three.LineBasicMaterial({color,transparent:true,opacity:.8,depthTest:false}));
 const geometry=new Three.SphereGeometry(.033,10,8);
 const material=new Three.MeshBasicMaterial({color,depthTest:false,transparent:true});
 const dots=Array.from({length:10},()=>new Three.Mesh(geometry,material));
 group.add(line,...dots);
 return (seconds,amount)=>{
  group.visible=amount>.015;
  if(!group.visible)return;
  line.material.opacity=.32+amount*.53;
  material.opacity=.5+amount*.5;
  dots.forEach((dot,i)=>dot.position.copy(path.getPointAt((seconds*.65+i/dots.length)%1)));
 };
}
