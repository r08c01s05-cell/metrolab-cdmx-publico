import './node-textures40.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';import * as THREE from 'three';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {readTrainGLB} from './read-train-glb.mjs';
import {updateCabDisplay147,disposeCabDisplay147} from '../dist/cab-display147.js';
import {batchTrainStatics} from '../dist/metro-render.js';
const layouts=JSON.parse(fs.readFileSync('dist/seat-layouts.json'));
let first;
for(const prefix of ['NM22','NM79','MP82'])for(const type of ['cabina','intermedio']){
 const stem=prefix+'_'+type,b=readTrainGLB('dist/models/'+stem+'.glb');
 const gltf=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');const group=gltf.scene;group.updateMatrixWorld(true);
 let seats=0,screens=0,obsolete=0,thresholds=0;group.traverse(o=>{if(o.userData.seatIndex147!==undefined)seats++;if(o.userData.cabScreen147)screens++;if(o.userData.revision_interior===43&&o.userData.familia_visual==='interior')obsolete++;if(o.name==='Umbral_147'||o.name.startsWith('Umbral_147_'))thresholds++;});
 assert.equal(screens,type==='cabina'?1:0,stem+' only driving cars have speed face');assert.equal(thresholds,8);
 if(prefix!=='NM22'){
  assert.equal(obsolete,0);assert.equal(seats,layouts[stem].length);
  for(const seat of layouts[stem]){
   const ray=new THREE.Raycaster(new THREE.Vector3(seat.x,1.82,seat.z),new THREE.Vector3(0,-1,0),0,.20);
   const hits=ray.intersectObject(group,true).filter(h=>h.object.material.name.startsWith('Asientos verdes moldeados147'));
   assert(hits.length,'Seat surface at passenger anchor '+stem+JSON.stringify(seat));assert(Math.abs(hits[0].point.y-seat.height)<.04);
  }
 }
 if(stem==='NM79_cabina')first=group;
 console.log(stem+': native GLB loads, '+seats+' replacement seats, '+screens+' cab display, 8 thresholds.');
}
// The live display survives static batching and each convoy owns its own texture.
let draws=0;globalThis.document={createElement(){return{getContext(){return{fillRect(){},fillText(){draws++;}};}};}};
const a=first.clone(true),b=first.clone(true);batchTrainStatics(a);batchTrainStatics(b);
const face=g=>{let f;g.traverse(o=>{if(o.userData.cabScreen147)f=o;});return f;};const original=face(a).material;
updateCabDisplay147(a,{speed:10});updateCabDisplay147(b,{speed:5});assert.notEqual(face(a).material,face(b).material);assert.notEqual(face(a).material.map,face(b).material.map);assert(draws>0);const count=draws;updateCabDisplay147(a,{speed:10});assert.equal(draws,count,'Stable speed avoids canvas redraw');updateCabDisplay147(a,{speed:11});assert(draws>count);disposeCabDisplay147(a);assert.equal(face(a).material,original);disposeCabDisplay147(b);
const scene=fs.readFileSync('dist/station-scene.js','utf8');assert(scene.includes("mode==='driver'?.04"),'Driver near plane retains nearby console');
console.log('147: physical seat anchors, old assemblies removed, native load, display isolation, batching and disposal verified. CPU tests; no browser/WebGL frame.');
