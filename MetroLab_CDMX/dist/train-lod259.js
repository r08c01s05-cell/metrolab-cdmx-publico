import * as THREE from 'three';
import {visualState105} from './visual-settings105.js?v=105';
import {farWallSign260} from './frame-budget260.js?v=260';

// Nivel de detalle del tren 259. Un tren completo son unos 2.6 millones de triángulos y 1,600
// llamadas de dibujo, y se pintaba entero aunque la cámara estuviera a 170 m. Aquí cada carro
// decide por su distancia a la cámara qué piezas se dibujan:
//   - interior (asientos, pasamanos, pantallas): se omite lejos, salvo en vista con corte;
//   - bogies y equipo bajo bastidor: lejos se cambian por volúmenes oscuros simples;
//   - gomas y sellos de puertas: se omiten a media distancia.
// No se toca la visibilidad (.visible) que usan los cortes, las puertas y la cabina: las piezas
// se apartan con capas de Three.js (la cámara solo dibuja la capa 0), así que el resto del
// simulador no nota el cambio. Las distancias crecen en calidad «cinemática» y bajan en «rendimiento».
export const LOD259=Object.freeze({interior:85,under:110,seals:45,hysteresis:6});
const VISIBLE=1,HIDDEN=2,CAR_HALF=8.5;
const SCALE259={performance:.7,balanced:1,cinematic:1.6};
const INTERIOR=/^(interior|interiorDisplay)/,UNDER=/^(traction|mecanica)$/,SEAL=/Goma|Sello/;
let proxyGeometry,proxyMaterial;

// Sort the meshes of one car once.
export function classifyCar259(car){
 const sets={interior:[],under:[],seals:[],bogies:[],wallPos:[],wallNeg:[]};
 for(const child of car.children){
  if(child.userData.proxy259)continue;
  const family=child.userData.familia_visual||'';
  if(child.userData.bogie212!==undefined){const meshes=[];child.traverse(o=>{if(o.isMesh&&!o.userData.proxy259)meshes.push(o);});sets.bogies.push({pivot:child,meshes,proxy:null});}
  else if(child.isMesh&&INTERIOR.test(family))sets.interior.push(child);
  else if(child.isMesh&&UNDER.test(family))sets.under.push(child);
  else if(child.isMesh&&(family==='wallPos'||family==='wallNeg'))sets[family].push(child);
  else if(!child.isMesh&&!family)child.traverse(o=>{if(o.isMesh&&SEAL.test(o.name))sets.seals.push(o);});
 }
 return sets;
}
// Bit mask of what to omit at a distance; `previous` gives hysteresis so pieces do not flicker.
export function carTier259(distance,previous=0,scale=1,keepInterior=false){
 let tier=0;const edge=(limit,bit)=>limit*scale+(previous&bit?-LOD259.hysteresis:LOD259.hysteresis);
 if(distance>edge(LOD259.seals,1))tier|=1;
 if(!keepInterior&&distance>edge(LOD259.interior,2))tier|=2;
 if(distance>edge(LOD259.under,4))tier|=4;
 return tier;
}
function localBox(parent,meshes){
 parent.updateWorldMatrix(true,true);const inverse=parent.matrixWorld.clone().invert(),box=new THREE.Box3(),part=new THREE.Box3(),m=new THREE.Matrix4();
 for(const mesh of meshes){if(!mesh.geometry)continue;if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();part.copy(mesh.geometry.boundingBox).applyMatrix4(m.multiplyMatrices(inverse,mesh.matrixWorld));box.union(part);}
 return box;
}
function makeProxy(parent,meshes,name,shrink=.9){
 const box=localBox(parent,meshes);if(box.isEmpty())return null;
 proxyGeometry??=new THREE.BoxGeometry(1,1,1);proxyMaterial??=new THREE.MeshStandardMaterial({name:'Volumen lejano 259',color:'#1a1c1d',roughness:.85,metalness:.2});
 const proxy=new THREE.Mesh(proxyGeometry,proxyMaterial),size=box.getSize(new THREE.Vector3());
 proxy.name=name;proxy.userData.proxy259=true;proxy.raycast=()=>{};box.getCenter(proxy.position);proxy.scale.set(Math.max(.05,size.x*shrink),Math.max(.05,size.y*shrink),Math.max(.05,size.z*shrink));proxy.layers.mask=HIDDEN;parent.add(proxy);return proxy;
}
function apply(car,sets,tier,farWall=0){
 // 260: with the interior omitted, the wall on the far side of the car cannot be seen either.
 const hidePos=!!(tier&2)&&farWall>0,hideNeg=!!(tier&2)&&farWall<0;
 for(const o of sets.wallPos)o.layers.mask=hidePos?HIDDEN:VISIBLE;for(const o of sets.wallNeg)o.layers.mask=hideNeg?HIDDEN:VISIBLE;
 for(const o of sets.seals)o.layers.mask=tier&1?HIDDEN:VISIBLE;
 for(const o of sets.interior)o.layers.mask=tier&2?HIDDEN:VISIBLE;
 const far=!!(tier&4);
 if(far){ // build the stand-in volumes the first time they are needed
  for(const b of sets.bogies)b.proxy??=makeProxy(b.pivot,b.meshes,'Bogie_lejano259');
  if(sets.underProxy===undefined)sets.underProxy=sets.under.length?makeProxy(car,sets.under,'Equipo_bajo_bastidor_lejano259',.94):null;
 }
 for(const b of sets.bogies){for(const o of b.meshes)o.layers.mask=far?HIDDEN:VISIBLE;if(b.proxy)b.proxy.layers.mask=far?VISIBLE:HIDDEN;}
 for(const o of sets.under)o.layers.mask=far?HIDDEN:VISIBLE;if(sets.underProxy)sets.underProxy.layers.mask=far?VISIBLE:HIDDEN;
}
// Call once per frame before rendering. Returns counters for the tests and the debug overlay.
export function updateTrainLod259(view){
 const camera=view.camera?.position;if(!camera||!view.trainMeshes)return null;
 const scale=SCALE259[visualState105().quality]??1,stats={cars:0,interiorHidden:0,underHidden:0,sealsHidden:0,wallsHidden:0};
 for(const model of view.trainMeshes.values()){
  const group=model.group;if(!group?.visible||!model.detailed)continue;
  let open;// a cut-away view (roof or walls removed) shows the interior on purpose
  for(const car of group.children){
   if(car.userData.carIndex===undefined)continue;
   const state=car.userData.lod259??={sets:classifyCar259(car),tier:0};
   const dx=Math.max(0,Math.abs(camera.x-(group.position.x+car.position.x))-CAR_HALF),dy=camera.y-2,dz=camera.z-(group.position.z+car.position.z),distance=Math.hypot(dx,dy,dz);
   if(distance>LOD259.interior*scale-LOD259.hysteresis&&open===undefined)open=!!(model.roof?.some(o=>!o.visible)||model.cutWalls?.some(o=>!o.visible));
   const tier=carTier259(distance,state.tier,scale,!!open);
   const farWall=tier&2?farWallSign260(group,car,camera.z):0;
   if(tier!==state.tier||farWall!==state.farWall||!state.applied){state.tier=tier;state.farWall=farWall;state.applied=true;apply(car,state.sets,tier,farWall);}
   if(farWall)stats.wallsHidden++;
   stats.cars++;if(tier&1)stats.sealsHidden++;if(tier&2)stats.interiorHidden++;if(tier&4)stats.underHidden++;
  }
 }
 view.lodStats259=stats;return stats;
}
