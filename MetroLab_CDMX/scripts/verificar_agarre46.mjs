import './node-textures40.mjs';
import fs from 'node:fs';import zlib from 'node:zlib';import assert from 'node:assert/strict';import * as THREE from 'three';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';import {readTrainGLB} from './read-train-glb.mjs';
import {cabinPlacement} from '../dist/passenger-seats.js';import {createCharacter,poseCharacter} from '../dist/cabin-characters.js';
const templates=[];
for(const file of fs.readdirSync('dist/models/personajes').filter(f=>f.endsWith('.gz'))){const b=zlib.gunzipSync(fs.readFileSync('dist/models/personajes/'+file));const g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');templates.push(createCharacter(g));}
let checked=0;
for(const prefix of ['NM22','NM79','MP82'])for(const kind of ['cabina','intermedio']){
 const car=kind==='cabina'?0:4,b=readTrainGLB('dist/models/'+prefix+'_'+kind+'.glb');const g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
 for(const direction of [-1,1]){
  const train={line:prefix==='NM22'?1:8,model:prefix==='MP82'?'MP-82':prefix==='NM79'?'NM-79':'NM-22',direction,position:200};
  const flip=direction*(prefix==='MP82'&&car===0?-1:1),track=-direction*1.8;
  g.scene.position.set(200+direction*(car-4)*16.7,0,track);g.scene.rotation.y=flip<0?Math.PI:0;g.scene.scale.x=.965;g.scene.updateMatrixWorld(true);
  for(const column of [2,5,8,11,14]){
   const actor=cabinPlacement(train,car+column*9);assert(actor.grip);
   for(const child of [false,true]){
    const target={...actor.grip,y:child?2.10:2.43};const ray=new THREE.Raycaster(new THREE.Vector3(target.x,target.y,track),new THREE.Vector3(0,0,Math.sign(target.z-track)),0,.40);
    assert(ray.intersectObject(g.scene,true).length,'el destino debe tener un tubo real');
    for(const item of templates){
     poseCharacter(item,{...actor,modelType:child?'child':'man'},2);if(child)assert.equal(item.gripPoint,null,'niños sin agarre');
     else assert(item.gripPoint.distanceTo(item.gripTarget)<.005,'adulto con mano al tubo');
     assert(Object.values(item.bones).every(b=>b.matrixWorld.elements.every(Number.isFinite)));
     poseCharacter(item,{...actor,moving:true},2);assert.equal(item.gripPoint,null,'soltar al caminar');checked++;
    }
   }
  }
 }
}
console.log(checked+' posturas verificadas: tubo real, agarre exclusivo de adultos, niños sin agarre y liberación al caminar.');
