import * as Three from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';

import {lineFacts,trainCues,motorCues,tunnelCues,supplyCues,substationCues} from './recorrido-fichas276.js?v=276';

export const chapters = [
 {title:'De Pantitlán a Observatorio', label:'Línea 1', duration:20, color:'#fd79ac', facts:lineFacts[1], text:'Zaragoza abre el recorrido. La estación permite reconocer la disposición de las vías, los andenes laterales y los accesos.', path:'models/andenes/L1/L1_02_Zaragoza.glb.gz', cut:'station', shot:[.74,.45,.58,.38,.34,.42]},
 {title:'De Garibaldi a Constitución', label:'Línea 8', duration:20, color:'#74dba1', facts:lineFacts[8], text:'En Coyuya, las vías flanquean el andén central. Desde el mismo andén se accede a los trenes de ambos sentidos.', source:'coyuya', cut:'station', shot:[-.72,.47,.67,-.35,.35,.48]},
 {title:'El tren en movimiento', label:'Tren NM-22', duration:25, color:'#ffae74', cues:trainCues, path:'models/NM22_cabina.glb.gz', moving:true, shot:[.73,.3,1.47,.16,.23,1.25]},
 {title:'Despiece del motor de tracción', label:'Despiece del motor', duration:48, color:'#ffae74', cues:motorCues, path:'models/Motor_NM22_referencia94.glb.gz', cut:'motor', shot:[1.30,.5,.50,1.44,.28,.20]},
 {title:'Túnel de sección rectangular', label:'Túnel cajón', duration:16, color:'#99d0ef', text:'Muros laterales y losas forman el cajón. La maqueta muestra dos vías sobre la losa inferior, con espacio para circulación y mantenimiento.', path:'models/Tunel_cajon273.glb', shot:[.77,.56,1.58,.12,.20,1.60]},
 {title:'Por dentro del túnel circular', label:'Túnel circular', duration:22, color:'#99d0ef', cues:tunnelCues, path:'models/Tunel_circular273.glb?v=274', cut:'tunnel', shot:[.89,.58,1.64,.08,.18,1.57]},
 {title:'De la red eléctrica al tren', label:'Alimentación', duration:54, color:'#ffe190', cues:supplyCues, source:'supply', shot:[-.38,.62,1.34,.25,.37,1.28]},
 {title:'Despiece de la subestación', label:'Subestación', duration:56, color:'#ffe190', cues:substationCues, path:'models/revision142/subestacion142.glb.gz', cut:'substation', shot:[.26,.33,-1.60,-.16,.28,-1.49]},
 {title:'La red desde el puesto de control', label:'Puesto de control', duration:20, color:'#caafff', text:'El Puesto Central de Control reúne información de circulación y alimentación para coordinar el servicio. La vista se abre para mostrar la distribución del edificio.', source:'pcc', shot:[.60,.52,1.46,-.37,.47,1.38]}
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
 root.updateMatrixWorld(true);
 root.traverseVisible(object => {
  if(!object.isMesh)return;
  if(!object.geometry.boundingBox)object.geometry.computeBoundingBox();
  box.union(object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld));
 });
 return box;
}

function track(root,width,length,y) {
 const deck = new Three.Mesh(new Three.BoxGeometry(length,.14,width),new Three.MeshStandardMaterial({color:'#4b595e'}));
 deck.position.y=y-.13;
 root.add(deck);
 const rails = new Three.InstancedMesh(new Three.BoxGeometry(length,.06,.035),new Three.MeshStandardMaterial({color:'#aebcc1',metalness:.45}),2);
 for(const [i,sign] of [-1,1].entries())rails.setMatrixAt(i,new Three.Matrix4().makeTranslation(0,y-.03,sign*width*.22));
 root.add(rails);
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
 let model, pccShell, liveFlow;
 if(chapter.source==='pcc') {
  const {buildPcc1} = await import('./pcc-building265.js?v=268');
  signal.throwIfAborted();
  model=buildPcc1();
  model.getObjectByName('Terreno').visible=false;
  const surroundings=model.getObjectByName('Entorno268');
  if(surroundings)surroundings.visible=false;
  model.traverse(object=>{
   if(object.isSprite&&!object.name.startsWith('Rotulo:P.C.C.'))object.visible=false;
  });
  pccShell=model.userData.shell;
 } else if(chapter.source==='coyuya') {
  const {makeCoyuya208} = await import('./coyuya208.js?v=209');
  signal.throwIfAborted();
  model=makeCoyuya208();
 } else if(chapter.source==='supply') {
  const [{construirMaqueta},{tramosDeAlimentacion}] = await Promise.all([
   import('./alimentacion/escena-3d.js'),import('./alimentacion/circuito-3d.js')
  ]);
  signal.throwIfAborted();
  model=new Three.Group();
  const parts=construirMaqueta(model);
  parts.aerea.visible=false;
  for(const id of ['cfe','seat','cable','rec'])setAnchor(anchors,id,parts[id]);
  anchors.set('contact',{object:model,point:new Three.Vector3(30,-1.8,2.05)});
  anchors.set('returnPath',{object:model,point:new Three.Vector3(31,-2.31,.96)});
  const marker=new Three.SphereGeometry(.26,8,6);
  const colors={ac:new Three.MeshBasicMaterial({color:'#fff093'}),dc:new Three.MeshBasicMaterial({color:'#ff9e65'}),ret:new Three.MeshBasicMaterial({color:'#92ddeb'})};
  liveFlow=tramosDeAlimentacion({mediumOnly:false,overhead:false}).filter(([,group])=>group!=='aerea').map(([kind,,points])=>{
   const path=new Three.CatmullRomCurve3(points.map(point=>new Three.Vector3(...point)));
   const line=new Three.Line(new Three.BufferGeometry().setFromPoints(path.getPoints(24)),new Three.LineBasicMaterial({color:colors[kind]?.color??'#83b9c9',transparent:true,opacity:.55}));
   const dot=new Three.Mesh(marker,colors[kind]??colors.ret);
   model.add(line,dot);
   return {path,dot};
  });
 } else {
  model=await loadModel(chapter.path,signal);
 }
 if(chapter.cut==='station')model.traverse(object=>{
  if(/^(Techo|Cubierta|Plaf[oó]n|Pared exterior|Pared de fondo)/i.test(object.name))object.visible=false;
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
  setAnchor(anchors,'body',find(/^wallPos__.*naranja/i)??find(/^NM22_L1/));
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
 bounds.union(visibleBounds(model));
 placeParts(exploded,0);
 const size=bounds.getSize(new Three.Vector3());
 if(chapter.cut==='motor')bounds.getCenter(center);
 model.position.sub(center);
 if(chapter.moving)track(content,size.z*1.48,size.x*1.4,-size.y/2);
 const root=new Three.Group();
 root.add(content);
 content.scale.setScalar(10/Math.max(size.x,size.y,size.z,1));
 const trainStart=model.position.x;
 return {root,anchor(id,point){
  const anchor=anchors.get(id);
  return anchor ? anchor.object.localToWorld(point.copy(anchor.point)) : null;
 },animate(progress){
  if(chapter.moving)model.position.x=trainStart+(progress-.5)*size.x*.26;
  if(exploded.length)placeParts(exploded,Three.MathUtils.smoothstep(progress,.04,.16));
  if(pccShell)pccShell.visible=progress<.38;
  liveFlow?.forEach(({path,dot},i)=>path.getPointAt((progress*5+i*.13)%1,dot.position));
 }};
}

export function disposeChapter(root) {
 const geometries=new Set(), materials=new Set(), textures=new Set();
 root.traverse(object=>{
  if(object.geometry)geometries.add(object.geometry);
  for(const material of [object.material].flat())if(material)materials.add(material);
 });
 for(const material of materials)for(const value of Object.values(material))if(value?.isTexture)textures.add(value);
 textures.forEach(texture=>texture.dispose());
 materials.forEach(material=>material.dispose());
 geometries.forEach(geometry=>geometry.dispose());
}
