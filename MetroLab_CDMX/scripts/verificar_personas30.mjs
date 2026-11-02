import fs from 'node:fs';import assert from 'node:assert/strict';import * as THREE from 'three';
import {PassengerModels} from '../dist/passenger-models.js';import {cabinPlacement} from '../dist/passenger-seats.js';
const people=new PassengerModels(new THREE.Scene(),144),matrix=new THREE.Matrix4(),pos=new THREE.Vector3(),scale=new THREE.Vector3(),q=new THREE.Quaternion();
for(const model of ['NM-22','NM-79','MP-82'])for(const direction of [1,-1]){
 const train={line:model==='NM-22'?1:8,model,direction,position:300};const actors=Array.from({length:144},(_,i)=>({id:'inside:test:'+i,modelType:i%2?'woman':'man',...cabinPlacement(train,i)}));
 assert(actors.some(a=>a.pose==='seated')&&actors.some(a=>a.pose!=='seated'));const seatIds=actors.filter(a=>a.pose==='seated').map(a=>a.seatId);assert.equal(new Set(seatIds).size,seatIds.length);
 for(const a of actors)assert(Math.abs(a.z+direction*1.8)<1.1);
 for(const time of [0,5,15]){people.update(actors,time);for(const part of Object.values(people.parts))for(let i=0;i<part.count;i++){part.getMatrixAt(i,matrix);assert(matrix.elements.every(Number.isFinite));}
  for(let i=0;i<actors.length;i++)if(actors[i].pose==='seated'){
   people.parts.hips.getMatrixAt(i,matrix);matrix.decompose(pos,q,scale);assert(pos.y-scale.y>=actors[i].seatHeight-.025);
   for(let k=0;k<2;k++){people.parts.shoe.getMatrixAt(i*2+k,matrix);matrix.decompose(pos,q,scale);assert(Math.abs(pos.y-scale.y-1.21)<.025);}
  }
 }
}
const manifest=JSON.parse(fs.readFileSync('dist/audio/revision30/manifest.json'));assert.equal(Object.keys(manifest.stations).length,36);for(const [id,clip]of Object.entries(manifest.stations)){assert(fs.statSync('dist/'+clip.url).size>1000);assert(clip.end>clip.start);assert(id.startsWith('L'+clip.line+'-'));}
console.log('6 combinaciones: sentados y de pie, asientos únicos, pelvis sobre cojín, pies sobre piso, matrices finitas y 36 anuncios vinculados: correctos.');
