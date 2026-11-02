import fs from 'node:fs';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {createCharacter,poseCharacter,CabinCharacters} from '../dist/cabin-characters.js';
import {cabinPlacement} from '../dist/passenger-seats.js';
const manifest=JSON.parse(fs.readFileSync('dist/models/personajes/manifest.json')),templates=[];
assert.equal(manifest.length,5);
for(const record of manifest){
 const buffer=zlib.gunzipSync(fs.readFileSync('dist/'+record.url.replace('./','')));
 assert(buffer.equals(fs.readFileSync('assets-source/personajes/'+record.name+'.glb')));
 const gltf=await new GLTFLoader().parseAsync(buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength),'');gltf.name=record.name;
 assert(gltf.animations.some(a=>a.name==='Idle'));assert(gltf.animations.some(a=>a.name==='Walk'));templates.push(gltf);
 const one=createCharacter(gltf),two=createCharacter(gltf);assert.notEqual(one.bones.Hips,two.bones.Hips);
 for(const model of ['NM-22','NM-79','MP-82'])for(const direction of [-1,1])for(const index of [0,18]){
  const actor=cabinPlacement({line:model==='NM-22'?1:8,model,direction,position:200},index);
  poseCharacter(one,actor,2);const bounds=new THREE.Box3().setFromObject(one.root);
  assert(Math.abs(bounds.min.y-actor.y)<.04,record.name+' feet');
  assert(bounds.max.y<actor.y+1.9&&bounds.max.y>actor.y+1.2);
  assert(Object.values(one.bones).every(b=>b.matrixWorld.elements.every(Number.isFinite)));
  const before=one.bones.Head.matrixWorld.clone();poseCharacter(one,actor,2);assert.deepEqual(one.bones.Head.matrixWorld.elements,before.elements);
  if(actor.pose==='seated')assert(one.bones.UpperLeg_L.rotation.x<-.9);
 }
 // Source skeleton stays unmodified by independently posed copies.
 assert(Math.abs(two.bones.UpperLeg_L.rotation.x)<1e-10);
}
// Exercise the actual pool without triggering network requests in Node.
const bank=Object.create(CabinCharacters.prototype);Object.assign(bank,{ready:true,templates,pool:[],group:new THREE.Group()});
const actors=Array.from({length:144},(_,i)=>({id:'inside:test:'+i,carryingBaby:i%9===3,...cabinPlacement({line:8,model:'MP-82',direction:1,position:300},i)}));
assert.equal(bank.update(actors,2),144);assert.equal(bank.pool.length,144);
assert.equal(new Set(bank.pool.map(p=>p.template)).size,5);
bank.update(actors.slice(0,8),3);assert.equal(bank.pool.filter(p=>p.root.visible).length,8);
bank.update([],3);assert(bank.pool.every(p=>!p.root.visible));
const family=[{id:'wait:family',x:0,y:1.21,z:5,carryingBaby:true,moving:true},{id:'wait:family:child',x:.6,y:1.21,z:5,modelType:'child',moving:true}];
bank.update(family,4);const mother=bank.pool.find(p=>p.root.visible&&p.actorId===family[0].id),child=bank.pool.find(p=>p.root.visible&&p.actorId===family[1].id);
assert.equal(mother.template.name,'personaje_metro_madre_nino');assert.equal(child.template.name,'personaje_metro_adolescente');assert.equal(child.root.scale.x,.72);
assert.equal(mother.mixer.clipAction(mother.walk).isRunning(),true);
const before=mother.bones.UpperLeg_L.matrixWorld.clone();bank.update(family.map(a=>({...a,moving:false})),4,false);assert.deepEqual(mother.bones.UpperLeg_L.matrixWorld.elements,before.elements);
const sceneSource=fs.readFileSync('dist/station-scene.js','utf8');assert(!sceneSource.includes('PassengerModels'));assert(!sceneSource.includes('this.people.update'));assert(sceneSource.includes('this.cabinCharacters.update(actors'));
console.log('5 GLB originales: compresión íntegra, skins independientes, reposo, pies sobre piso, posturas en 6 trenes/sentidos y pool de 144 pasajeros correctos.');
