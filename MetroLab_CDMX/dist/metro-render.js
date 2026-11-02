import {splitBogieGeometry212} from './bogie-batching212.js?v=212';
import{repairClearance174}from'./interior-clearance174.js?v=174';
import{improveLabels174}from'./label-quality174.js?v=174';
import {refineMaterials110} from './material-realism110.js?v=205';
import {preserveFinishUV124} from './surface-finish124.js?v=194';
import {reflectionScene122} from './render-environment122.js?v=130';
import * as THREE from 'three';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';

// A prefiltered lighting environment gives glass and steel a reflection source.
// It is generated once and does not add visible scenery or per-frame lights.
export function createMetroEnvironment(renderer,kind='workshop'){
 const studio=reflectionScene122(kind),generator=new THREE.PMREMGenerator(renderer),target=generator.fromScene(studio,.055,.1,100);generator.dispose();studio.userData.dispose122();return target;
}

export function enhanceMetroMaterials(model,modelId=''){
 const cache=new Map();
 model.traverse(mesh=>{
  if(!mesh.isMesh)return;
  const original=mesh.material;
  if(!cache.has(original)){
   let material=original.clone();const name=original.name.toLowerCase();
   if(name.includes('vidrio testero neutro42')){
    material.color.set('#cddadb');material.opacity=.12;material.transparent=true;material.depthWrite=false;material.roughness=.17;material.metalness=0;material.forceSinglePass=true;
   }else if(name.includes('naranja')){
    material=new THREE.MeshPhysicalMaterial();THREE.MeshStandardMaterial.prototype.copy.call(material,original);
    material.clearcoat=.12;material.clearcoatRoughness=.4;material.roughness=.36;material.metalness=.10;material.envMapIntensity=.85;
   }else if(name.includes('cristal')){
    material.color.copy(original.color);material.opacity=Math.min(original.opacity,.18);material.transparent=true;material.depthWrite=false;
    material.roughness=.14;material.metalness=0;material.envMapIntensity=.9;
    // Fluidez 222: thin glazing; one double-sided pass avoids two program changes per pane and frame.
    material.forceSinglePass=true;
   }else if(name.includes('acero')||name.includes('pasamanos')){
    material.roughness=original.roughnessMap?1:(name.includes('cepillado')?.39:.30);material.metalness=.82;material.envMapIntensity=1.1;
   }else if(name.includes('goma')){material.roughness=.9;material.metalness=0;}
   else if(name.includes('asientos')){
    material=new THREE.MeshPhysicalMaterial();THREE.MeshStandardMaterial.prototype.copy.call(material,original);
    material.clearcoat=.045;material.clearcoatRoughness=.55;material.roughness=original.roughnessMap?1:.42;material.metalness=0;material.envMapIntensity=.65;
   }
   if(name.includes('luz blanca'))material.emissiveIntensity=1.35;
   cache.set(original,material);
  }
  mesh.material=cache.get(original);if(mesh.material.transparent)mesh.renderOrder=2;
 });repairClearance174(model,modelId);improveLabels174(model);return model;
}

// Lightweight exterior for the other NM-79 trains. Individual doors/windows,
// tires and cab glazing remain visible; batching keeps the draw count low.
export function makeNM79Overview(){
 const source=new THREE.Group(),buckets=new Map();
 const materials={
  paint:new THREE.MeshPhysicalMaterial({color:'#ed4e09',metalness:.12,roughness:.34,clearcoat:.45,clearcoatRoughness:.3}),
  roof:new THREE.MeshStandardMaterial({color:'#c0c7c7',metalness:.65,roughness:.38}),
  steel:new THREE.MeshStandardMaterial({color:'#a4b1b5',metalness:.82,roughness:.34}),
  glass:new THREE.MeshStandardMaterial({color:'#26434e',metalness:.18,roughness:.16}),
  rubber:new THREE.MeshStandardMaterial({color:'#172025',roughness:.9}),
  chassis:new THREE.MeshStandardMaterial({color:'#354047',metalness:.45,roughness:.65}),
  stripe:new THREE.MeshStandardMaterial({color:'#a7bd32',roughness:.4}),
  lamps:new THREE.MeshStandardMaterial({color:'#fff2ce',emissive:'#ffe9bc',emissiveIntensity:1.4})
 };
 for(const [key,name]of Object.entries({paint:'Pintura exterior convoy',roof:'Acero satinado techo convoy',steel:'Acero ruedas convoy',rubber:'Caucho convoy',chassis:'Fundicion bastidor convoy',stripe:'Pintura franja convoy',lamps:'Difusor faros convoy'}))materials[key].name=name;
 function add(geometry,material,x,y,z,family='exterior',rotation=null){
  const mesh=new THREE.Mesh(geometry,materials[material]);mesh.position.set(x,y,z);if(rotation)mesh.rotation.set(...rotation);mesh.userData.familia_visual=family;source.add(mesh);return mesh;
 }
 const box=(x,y,z,w,h,d,mat,fam)=>add(new THREE.BoxGeometry(w,h,d),mat,x,y,z,fam);
 // Rounded upper corners avoid a rectangular slab silhouette.
 const profile=new THREE.Shape();profile.moveTo(-1.24,1.2);profile.lineTo(1.24,1.2);profile.lineTo(1.24,3.15);
 profile.quadraticCurveTo(1.24,3.55,.94,3.55);profile.lineTo(-.94,3.55);profile.quadraticCurveTo(-1.24,3.55,-1.24,3.15);profile.closePath();
 const shell=new THREE.ExtrudeGeometry(profile,{depth:16,bevelEnabled:false,curveSegments:6});shell.rotateY(Math.PI/2);shell.translate(-8,0,0);
 for(let i=0;i<9;i++){
  const x=(i-4)*16.7;add(shell.clone(),'paint',x,0,0);
  box(x,3.56,0,15.95,.1,2.08,'roof','roof');box(x,1.03,0,15.85,.25,2.27,'chassis');
  for(const side of [-1,1]){
   box(x,1.62,side*1.246,15.95,.1,.02,'stripe');
   for(const local of [-5.9,-2,2,5.9]){
    box(x+local,2.25,side*1.257,1.44,2.06,.022,'rubber');
    for(const half of [-1,1]){
     box(x+local+half*.35,2.25,side*1.275,.68,2.02,.022,'steel');
     box(x+local+half*.35,2.73,side*1.291,.43,.78,.012,'rubber');
     box(x+local+half*.35,2.73,side*1.301,.37,.7,.012,'glass');
    }
   }
   for(const local of [-7.15,-4,0,4,7.15]){
    const width=Math.abs(local)>7?.65:1.65;
    box(x+local,2.72,side*1.254,width,.99,.025,'rubber');
    box(x+local,2.72,side*1.273,width-.09,.88,.016,'glass');
   }
  }
  for(const local of [-5.35,5.35]){
   for(const end of[-1,1])for(const side of[-1,1]){add(new THREE.CylinderGeometry(.315,.315,.16,16),'rubber',x+local+end*1.48,.405,side*1.04,'mecanica');add(new THREE.CylinderGeometry(.23,.23,.18,16),'steel',x+local+end*1.48,.405,side*1.04,'mecanica');}
   if([0,2,3,5,6,8].includes(i))for(const side of[-1,1]){box(x+local,.255,side*1.333,.52,.035,.025,'chassis','mecanica');for(const edge of[-1,1])box(x+local+edge*.265,.40,side*1.333,.035,.29,.025,'chassis','mecanica');}
   if([0,2,3,5,6,8].includes(i))for(const side of[-1,1]){box(x+local,.68,side*1.05,.46,.07,.18,'steel','mecanica');box(x+local,.52,side*1.19,.40,.18,.18,'chassis','mecanica');box(x+local,.405,side*1.32,.36,.10,.07,'rubber','mecanica');}
   box(x+local,.65,0,2.55,.42,1.85,'chassis');
   for(const axle of [-.65,.65])for(const side of [-1,1]){
    add(new THREE.CylinderGeometry(.43,.43,.29,12),'rubber',x+local+axle,.48,side*1.05,'exterior',[Math.PI/2,0,0]);
    add(new THREE.CylinderGeometry(.19,.19,.3,10),'steel',x+local+axle,.48,side*1.07,'exterior',[Math.PI/2,0,0]);
   }
  }
  if(i<8)box(x+8.35,1.8,0,.7,1.15,1.72,'rubber');
 }
 for(const sign of [-1,1]){
  box(sign*74.84,2.73,0,.025,1.04,1.94,'rubber');box(sign*74.86,2.73,0,.025,.89,1.77,'glass');
  box(sign*74.88,3.32,0,.025,.18,1.15,'rubber');
  for(const z of [-.86,.86])box(sign*74.89,1.77,z,.06,.17,.22,'lamps');
 }
 shell.dispose();source.updateMatrixWorld(true);
 source.traverse(mesh=>{
  if(!mesh.isMesh)return;const key=mesh.material.uuid+'|'+mesh.userData.familia_visual;
  if(!buckets.has(key))buckets.set(key,{material:mesh.material,family:mesh.userData.familia_visual,geometries:[]});
  const geometry=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();geometry.applyMatrix4(mesh.matrixWorld);
  geometry.deleteAttribute('uv');buckets.get(key).geometries.push(geometry);mesh.geometry.dispose();
 });
 const group=new THREE.Group(),roof=[];
 for(const bucket of buckets.values()){
  const geometry=mergeGeometries(bucket.geometries,false);if(!geometry)throw Error('NM79 batching failed');
  const mesh=new THREE.Mesh(geometry,bucket.material);mesh.userData.familia_visual=bucket.family;group.add(mesh);
  if(bucket.family==='roof')roof.push(mesh);bucket.geometries.forEach(g=>g.dispose());
 }
 refineMaterials110(group);return {group,roof,doors:[],cutWalls:[],detailed:false,low:true,authenticOverview:true};
}

// Merge the train's static meshes across cars; moving door leaves stay independent.
export function batchTrainStatics(group,options={}){
 group.updateMatrixWorld(true);const buckets=new Map(),originals=[];let originalMeshes=0;
 group.traverse(o=>{
  if(!o.isMesh)return;originalMeshes++;if(!o.visible)return;
  let family=o.userData.familia_visual||'exterior';if(family.startsWith('Puerta_S')||o.userData.cabScreen147)return;
  const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geo.applyMatrix4(o.matrixWorld);
  if(!geo.attributes.normal)geo.computeVertexNormals();
  for(const name of Object.keys(geo.attributes))if(!['position','normal','uv','uv3'].includes(name))geo.deleteAttribute(name);
  if(!geo.attributes.uv)geo.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));
  preserveFinishUV124(geo);const oldUV=geo.attributes.uv,uv=new Float32Array(oldUV.count*2);for(let i=0;i<oldUV.count;i++){uv[i*2]=oldUV.getX(i);uv[i*2+1]=oldUV.getY(i);}geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  for(const name of ['position','normal']){
   const a=geo.attributes[name],values=new Float32Array(a.count*3);
   for(let i=0;i<a.count;i++){values[i*3]=a.getX(i);values[i*3+1]=a.getY(i);values[i*3+2]=a.getZ(i);}
   geo.setAttribute(name,new THREE.Float32BufferAttribute(values,3));
  }
  if(family==='wallPos'||family==='wallNeg'){geo.computeBoundingBox();family=geo.boundingBox.getCenter(new THREE.Vector3()).z>=0?'wallPos':'wallNeg';}
  for(const part of splitBogieGeometry212(geo,family,options.bogieHalf212)){const key=family+'|'+o.material.uuid+'|'+part.sign;if(!buckets.has(key))buckets.set(key,{family,sign:part.sign,material:o.material,geometries:[]});buckets.get(key).geometries.push(part.geometry);}originals.push(o);
 });
 originals.forEach(o=>o.removeFromParent());const ownedGeometries=[],bogies212=new Map();
 for(const b of buckets.values()){
  const geometry=mergeGeometries(b.geometries,false);if(!geometry)throw Error('Train geometry batching failed');
  const mesh=new THREE.Mesh(geometry,b.material);mesh.userData.familia_visual=b.family;mesh.name=b.family+'__batched';if(b.material.transparent)mesh.renderOrder=2;if(b.sign){if(!bogies212.has(b.sign)){const pivot=new THREE.Group();pivot.name='Bogie_articulado212_'+b.sign;pivot.position.x=b.sign*options.bogieHalf212;pivot.userData.bogie212=b.sign;group.add(pivot);bogies212.set(b.sign,pivot);}geometry.translate(-b.sign*options.bogieHalf212,0,0);bogies212.get(b.sign).add(mesh);}else group.add(mesh);ownedGeometries.push(geometry);b.geometries.forEach(g=>g.dispose());
 }
 let meshes=0;group.traverse(o=>{if(o.isMesh)meshes++;});group.userData.renderStats={originalMeshes,meshes};return ownedGeometries;
}
