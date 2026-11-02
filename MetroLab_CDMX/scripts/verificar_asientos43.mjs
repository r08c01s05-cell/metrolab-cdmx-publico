import './node-textures40.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {readTrainGLB} from './read-train-glb.mjs';
import {cabinPlacement} from '../dist/passenger-seats.js';
const layouts=JSON.parse(fs.readFileSync('dist/seat-layouts.json'));
for(const prefix of ['NM79','MP82'])for(const type of ['cabina','intermedio']){
 const stem=prefix+'_'+type,b=readTrainGLB('dist/models/'+stem+'.glb');
 const g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');g.scene.updateMatrixWorld(true);
 assert.equal(layouts[stem].length,type==='cabina'?26:28);
 for(const seat of layouts[stem]){
  const ray=new THREE.Raycaster(new THREE.Vector3(seat.x,1.82,seat.z),new THREE.Vector3(0,-1,0),0,.20);
  const hits=ray.intersectObject(g.scene,true).filter(h=>h.object.material.name.includes('Asientos')&&h.object.userData.revision_interior===43);
  assert(hits.length>0,'superficie superior visible en '+stem+' '+JSON.stringify(seat));
  assert(Math.abs(hits[0].point.y-seat.height)<.04);
 }
 for(const direction of [-1,1]){
  const train={line:8,model:prefix==='MP82'?'MP-82':'NM-79',direction,position:200};
  const identities=[];
  for(let slot=0;slot<144;slot++){const a=cabinPlacement(train,slot);if(a.pose==='seated')identities.push(a.seatId);}
  assert.equal(identities.length,new Set(identities).size,'destinos sin asientos repetidos');
 }
 console.log(stem+': carcasa orientada hacia arriba, alturas y destinos únicos correctos.');
}
