import * as Three from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';

import {lineFacts,trainCues,fleetClassic279,motorCues,tunnelCues,supplyCues,substationCues,runningCues,steelCues,tractionCues,runningSources,tractionSources,supplySources} from './recorrido-fichas276.js?v=280';
import {FLOORS265,buildPcc1} from './pcc-building265.js?v=279';
import {makeTraction278,mountTrack279} from './recorrido-traccion278.js?v=280';

const trackAsset='models/andenes/L1/L1_02_Zaragoza.glb.gz';
const substationAsset='models/revision142/subestacion142.glb.gz';
const intermediate='models/NM22_intermedio.glb.gz';

const pccCues=[
 [0,'Fachada de Buen Tono','El edificio histórico reúne la recepción eléctrica, la distribución y el mando centralizado. La maqueta sube del sótano al sexto piso.',null],
 [8,'Corte del edificio','Vista de conjunto: las losas separan el sótano, la planta baja y los seis pisos de instalaciones y oficinas.',null],
 ...FLOORS265.map((f,i)=>[16+i*9,f.name,f.id==='p6'?'En esta planta se muestran oficinas, videovigilancia y el simulador mencionados en el material de referencia.':f.text,f.id]),
 [88,'Sala de mando · quinto piso','Desde la sala de mando se coordinan la circulación y la alimentación. En la siguiente escena aparecen los dos tableros del escenario simulado.', 'p5']
];

export const chapters = [
 {title:'De Pantitlán a Observatorio', label:'Línea 1', duration:20, color:'#fd79ac', facts:lineFacts[1], text:'Zaragoza abre el recorrido. La estación permite reconocer la disposición de las vías, los andenes laterales y los accesos.', path:'models/andenes/L1/L1_02_Zaragoza.glb.gz', cut:'station', shot:[.74,.45,.58,.38,.34,.42]},
 {title:'De Garibaldi a Constitución', label:'Línea 8', duration:20, color:'#74dba1', facts:lineFacts[8], text:'En Coyuya, el puente y la cubierta escalonada distinguen la estación desde la avenida. El corte muestra el andén central entre las vías.', source:'coyuya', cut:'surface', shot:[-.72,.47,.67,-.35,.35,.48]},
 {title:'El tren en movimiento', label:'Tren NM-22', duration:25, color:'#ffae74', cues:trainCues, path:'models/NM22_cabina.glb.gz', moving:true, shot:[.73,.3,1.47,.16,.23,1.25]},
 ...['NM79','MP82'].map(id=>{
  const name=id.replace(/([A-Z]+)(\d+)/,'$1-$2');
  return {title:`${name} · tracción clásica`,label:`Tren ${name}`,duration:30,color:'#ffae74',
   ...fleetClassic279[id],path:`models/${id}_cabina.glb.gz`,motorPath:`models/Motor_${id}_referencia94.glb.gz`,
   moving:true,shot:[.60,.36,1.27,.30,.36,1.24]};
 }),
 {title:'Despiece del rodaje neumático', label:'Bogie y captadores', duration:53, color:'#ffae74', cues:runningCues, references:runningSources, source:'runningGear', shot:[.75,.57,1.47,.40,.56,1.47]},
 {title:'Rueda de acero sobre riel', label:'Rodaje férreo', duration:18, color:'#c7e0ef', cues:steelCues, references:runningSources.slice(0,1), source:'steel', shot:[.59,.53,1.49,.35,.42,1.48]},
 {title:'Despiece del motor de tracción', label:'Despiece del motor', duration:48, color:'#ffae74', cues:motorCues, path:'models/Motor_NM22_referencia94.glb.gz', cut:'motor', shot:[1.30,.5,.50,1.44,.28,.20]},
 {title:'Túnel de sección rectangular', label:'Túnel cajón', duration:16, color:'#99d0ef', text:'Muros laterales y losas forman el cajón. La maqueta muestra dos vías sobre la losa inferior, con espacio para circulación y mantenimiento.', path:'models/Tunel_cajon273.glb', shot:[.77,.56,1.58,.12,.20,1.60]},
 {title:'Por dentro del túnel circular', label:'Túnel circular', duration:22, color:'#99d0ef', cues:tunnelCues, path:'models/Tunel_circular273.glb?v=274', cut:'tunnel', shot:[.89,.58,1.64,.08,.18,1.57]},
 {title:'De CFE a la barra guía', label:'Alimentación', duration:68, color:'#ffe190', cues:supplyCues, references:supplySources, source:'supply', shot:[-.20,.55,1.55,.18,.43,1.36]},
 {title:'Despiece de la subestación', label:'Subestación', duration:56, color:'#ffe190', cues:substationCues, path:substationAsset, cut:'substation', shot:[.26,.33,-1.60,-.16,.28,-1.49]},
 {title:'Del arranque al frenado', label:'Tracción y frenado', duration:48, color:'#ffbf70', cues:tractionCues, references:tractionSources, source:'traction', shot:[.59,.44,1.25,.44,.38,1.25]},
 {title:'Piso por piso en Buen Tono', label:'Edificio del PCC', duration:98, color:'#caafff', cues:pccCues, source:'pcc', shot:[.68,.54,1.55,.47,.83,1.40]},
 {title:'Centro de control', label:'Tableros de las líneas', duration:42, color:'#caafff', source:'control', text:'Sigue la posición de los trenes, el estado de las zonas de tracción y el balance de energía de las líneas 1 y 8 en los tableros del simulador.'}
];

async function loadModel(path, signal) {
 const url = new URL(path, import.meta.url);
 const response = await fetch(url,{signal});
 if(!response.ok)throw new Error(`Modelo 3D no disponible (${response.status})`);
 const bytes = url.pathname.endsWith('.gz')
  ? await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
  : await response.arrayBuffer();
 signal.throwIfAborted();
 return (await new GLTFLoader().parseAsync(bytes,new URL('.',url).href)).scene;
}

function visibleBounds(root) {
 const box = new Three.Box3();
 root.updateWorldMatrix(true,true);
 root.traverseVisible(object => {
  if(!object.isMesh)return;
  const source=object.isInstancedMesh?object:object.geometry;
  if(!source.boundingBox)source.computeBoundingBox();
  box.union(source.boundingBox.clone().applyMatrix4(object.matrixWorld));
 });
 return box;
}

function setAnchor(anchors,id,object) {
 if(!object)return;
 const box=visibleBounds(object);
 if(box.isEmpty())return;
 anchors.set(id,{object,point:object.worldToLocal(box.getCenter(new Three.Vector3()))});
}

function motorParts(model,anchors) {
 const parts=[];
 const selectors=[
  ['housing',/Carcasa|Nervadura|Caja_|Ventilador/i,-1.23,/Carcasa/],
  ['stator',/Estator|Devanado/i,-.53,/Estator/],
  ['rotor',/Rotor|Barra_jaula|Anillo/i,.27,/Rotor/],
  ['shaft',/_Eje$/i,1.05,/_Eje$/i],
  ['cover',/Tapa|Rodamiento|Perno/i,1.05,/Tapa_1$/]
 ];
 model.traverse(object=>{
  if(!object.isMesh)return;
  const row=selectors.find(([,pattern])=>pattern.test(object.name));
  if(!row)return;
  const [id,,offset,representative]=row;
  const coverOffset=/(?:Tapa|Rodamiento|Perno)_-1/.test(object.name)?-1.28:1.42;
  parts.push({object,start:object.position.clone(),offset:new Three.Vector3(0,id==='cover'?.36:0,id==='cover'?coverOffset:offset)});
  if(representative.test(object.name))setAnchor(anchors,id,object);
 });
 return parts;
}

function placeParts(parts,amount) {
 for(const {object,start,offset} of parts)object.position.copy(start).addScaledVector(offset,amount);
}

export async function buildChapter(chapter,signal) {
 const anchors=new Map(), exploded=[];
 let model, pccShell, pccFloors, liveFlow, traction, station, classicMotor;
 if(chapter.source==='pcc') {
  signal.throwIfAborted();
  model=buildPcc1();
  model.getObjectByName('Terreno').visible=false;
  const surroundings=model.getObjectByName('Entorno268');
  if(surroundings)surroundings.visible=false;
  model.traverse(object=>{
   if(object.isSprite&&!object.name.startsWith('Rotulo:P.C.C.'))object.visible=false;
  });
  ({shell:pccShell,floors:pccFloors}=model.userData);
  for(const floor of pccFloors){
   const walls=floor.getObjectByName('Muros_'+floor.userData.id);
   if(walls)walls.visible=false;
   anchors.set(floor.userData.id,{object:floor,point:new Three.Vector3(0,1,0)});
  }
 } else if(['runningGear','steel','traction'].includes(chapter.source)) {
  const [train,trackModel]=await Promise.all([loadModel(intermediate,signal),loadModel(trackAsset,signal)]);
  model=new Three.Group();
  traction=makeTraction278(model,chapter.source,train,trackModel);
  for(const [id,object] of Object.entries(traction.anchors)){
   if(object.children.length||object.isMesh)setAnchor(anchors,id,object);
   else anchors.set(id,{object,point:new Three.Vector3()});
  }
 } else if(chapter.source==='coyuya') {
  // El GLB archivado conserva los andenes laterales anteriores a la corrección.
  const [{makeCoyuya208},{buildStationDistrict284}] = await Promise.all([
   import('./coyuya208.js?v=285'),import('./entorno-estacion284.js?v=285')
  ]);
  signal.throwIfAborted();
  model=makeCoyuya208();
  model.add(buildStationDistrict284({id:'L8-10',nombre:'Coyuya'}));
 } else if(chapter.source==='supply') {
  const [{construirMaqueta},{tramosDeAlimentacion,observacionTransmision},{prepararSubestacionGLB,prepararTrenGLB},substation,train] = await Promise.all([
   import('./alimentacion/escena-3d.js?v=284'),import('./alimentacion/circuito-3d.js?v=284'),
   import('./alimentacion/modelos-glb.js?v=280'),loadModel(substationAsset,signal),loadModel('models/NM22_cabina.glb.gz',signal)
  ]);
  signal.throwIfAborted();
  model=new Three.Group();
  const parts=construirMaqueta(model);
  parts.aerea.visible=false;
  const replace=(group,...equipment)=>{
   for(const item of group.children)item.visible=false;
   group.add(...equipment);
  };
  const equipment=prepararSubestacionGLB(substation);
  substation.visible=false;
  model.add(substation);
  replace(parts.tr,equipment.get('transformer'));
  replace(parts.rec,equipment.get('rectifier'),equipment.get('dc'));
  const wagon=prepararTrenGLB(train,'nm22');
  replace(parts.track,wagon.grupo);
  const oldShoe=parts.lateral.getObjectByName('zapata-esquematica');
  if(oldShoe)oldShoe.visible=false;
  setAnchor(anchors,'seat',parts.seat);
  setAnchor(anchors,'cable',parts.cable);
  setAnchor(anchors,'tr',equipment.get('transformer'));
  setAnchor(anchors,'rec',equipment.get('rectifier'));
  anchors.set('cfe',{object:model,point:new Three.Vector3(...observacionTransmision)});
  anchors.set('contact',{object:model,point:new Three.Vector3(...(wagon.captador??[27.55,-1.88,2.05]))});
  anchors.set('returnPath',{object:model,point:new Three.Vector3(31,-2.31,.96)});
  const marker=new Three.SphereGeometry(.26,8,6);
  const colors={ac:new Three.MeshBasicMaterial({color:'#fff093'}),dc:new Three.MeshBasicMaterial({color:'#ff9e65'}),ret:new Three.MeshBasicMaterial({color:'#92ddeb'})};
  liveFlow=tramosDeAlimentacion({mediumOnly:false,overhead:false,captador:wagon.captador}).filter(([,group])=>group!=='aux').map(([kind,group,points])=>{
   const path=new Three.CatmullRomCurve3(points.map(point=>new Three.Vector3(...point)));
   const line=new Three.Line(new Three.BufferGeometry().setFromPoints(path.getPoints(24)),new Three.LineBasicMaterial({color:colors[kind]?.color??'#83b9c9',transparent:true,opacity:.55}));
   const dot=new Three.Mesh(marker,colors[kind]??colors.ret);
   model.add(line,dot);
   return {path,dot,line,group:group==='track'?'contact':group==='return'?'returnPath':group};
  });
 } else if(chapter.moving){
  [model,station,classicMotor]=await Promise.all([
   loadModel(chapter.path,signal),loadModel(trackAsset,signal),
   chapter.motorPath&&loadModel(chapter.motorPath,signal)
  ]);
 } else {
  model=await loadModel(chapter.path,signal);
 }
 const stationShell=[];
 if(['station','surface'].includes(chapter.cut))model.traverse(object=>{
  if(!/^(Techo|Cubierta|(?:Cassette_)?Plaf[oó]n|Pared[ _]exterior|Pared[ _]de[ _]fondo)/i.test(object.name))return;
  if(chapter.cut==='surface')stationShell.push(object);
  else object.visible=false;
 });
 if(chapter.cut==='substation')for(const name of ['roof','Cerramiento_retirado']) {
  const object=model.getObjectByName(name);
  if(object)object.visible=false;
 }
 if(chapter.cut==='substation') {
  const equipment=['mt','transformer','rectifier','dc','control'].map(id=>[id,model.getObjectByName(id)]).filter(([,object])=>object);
  equipment.sort((a,b)=>visibleBounds(a[1]).getCenter(new Three.Vector3()).x-visibleBounds(b[1]).getCenter(new Three.Vector3()).x);
  equipment.forEach(([id,object],i)=>{
   setAnchor(anchors,id,object);
   exploded.push({object,start:object.position.clone(),offset:new Three.Vector3((i-2)*.6,0,-1.2-(i%2)*.7)});
  });
 }
 if(chapter.cut==='motor')exploded.push(...motorParts(model,anchors));
 if(chapter.moving) {
  const find=pattern=>{let match;model.traverse(object=>{if(!match&&pattern.test(object.name))match=object;});return match;};
  setAnchor(anchors,'body',find(/^wallNeg__.*naranja/i)??find(/^wallPos__.*naranja/i)??model);
  setAnchor(anchors,'door',find(/^Puerta_S1_2_Hoja_1$/)??find(/^Puerta_S1.*Hoja/));
  setAnchor(anchors,'bogie',find(/^Larguero_bogie_refuerzo/));
 }
 if(chapter.cut==='tunnel') {
  const nodes=model.children;
  for(const [id,pattern] of [['lining',/^Dovela/],['walkway',/^Pasarela/],['slab',/^Solera/]]) {
   const part=nodes.filter(object=>pattern.test(object.name)).sort((a,b)=>b.position.z-a.position.z)[0];
   setAnchor(anchors,id,part);
  }
 }
 const content=new Three.Group();
 content.add(model);
 const bounds=visibleBounds(model),center=bounds.getCenter(new Three.Vector3());
 placeParts(exploded,1);
 if(chapter.source==='runningGear')traction.animate(12);
 bounds.union(visibleBounds(model));
 placeParts(exploded,0);
 traction?.animate(0);
 const size=bounds.getSize(new Three.Vector3());
 if(chapter.cut==='motor')bounds.getCenter(center);
 model.position.sub(center);
 let trainTrack, motorStage;
 if(chapter.moving){
  trainTrack=new Three.Group();
  mountTrack279(trainTrack,station,size.x*.72);
  trainTrack.position.y=-center.y;
  station.visible=false;
  trainTrack.add(station);
  content.add(trainTrack);
 }
 if(classicMotor){
  motorStage=new Three.Group();
  content.add(motorStage);
  motorStage.add(classicMotor);
  const ccCenter=visibleBounds(classicMotor).getCenter(new Three.Vector3());
  classicMotor.position.sub(ccCenter);
  motorStage.scale.setScalar(4.4);
  classicMotor.traverse(object=>{
   if(!object.isMesh)return;
   const name=object.name;
   if(/Escobilla_carbon_0/.test(name))setAnchor(anchors,'brushes',object);
   if(/Escobilla|Colector/.test(name))exploded.push({object,start:object.position.clone(),offset:new Three.Vector3(/Escobilla/.test(name)?.16:0,0,-.50)});
   else if(/Tapa_-1|Rodamiento_-1/.test(name))exploded.push({object,start:object.position.clone(),offset:new Three.Vector3(0,0,-.93)});
   else if(/Carcasa|Nervadura/.test(name)&&!/Reductor/.test(name))exploded.push({object,start:object.position.clone(),offset:new Three.Vector3(0,0,.50)});
  });
  if(!anchors.has('brushes'))throw new Error('El GLB del motor de CC no contiene las escobillas esperadas.');
 }
 const root=new Three.Group();
 root.add(content);
 content.scale.setScalar(10/Math.max(size.x,size.y,size.z,1));
 const trainStart=model.position.x;
 return {root,anchor(id,point){
  const anchor=anchors.get(id);
  return anchor ? anchor.object.localToWorld(point.copy(anchor.point)) : null;
 },animate(progress,cue){
  for(const part of stationShell)part.visible=progress<.58;
  if(chapter.moving)model.position.x=trainStart+(progress-.5)*size.x*.26;
  if(motorStage){
   motorStage.visible=cue==='brushes';
   trainTrack.visible=model.visible=!motorStage.visible;
  }
  if(exploded.length)placeParts(exploded,motorStage
   ? Three.MathUtils.smoothstep(progress,.56,.72):Three.MathUtils.smoothstep(progress,.04,.16));
  if(pccShell){
   pccShell.visible=progress<8/chapter.duration;
   for(const floor of pccFloors)floor.visible=cue?floor.userData.id===cue:!pccShell.visible||floor.userData.index>0;
  }
  traction?.animate(progress*chapter.duration);
  liveFlow?.forEach(({path,dot,line,group},i)=>{
   dot.visible=group===cue;
   line.material.opacity=dot.visible?.78:.28;
   if(dot.visible)path.getPointAt((progress*12+i*.13)%1,dot.position);
  });
 }};
}

export function disposeChapter(root) {
 const geometries=new Set(), materials=new Set(), textures=new Set();
 root.traverse(object=>{
  if(object.isInstancedMesh)object.dispose();
  if(object.geometry)geometries.add(object.geometry);
  for(const material of [object.material].flat())if(material)materials.add(material);
 });
 for(const material of materials)for(const value of Object.values(material))if(value?.isTexture)textures.add(value);
 textures.forEach(texture=>texture.dispose());
 materials.forEach(material=>material.dispose());
 geometries.forEach(geometry=>geometry.dispose());
}
