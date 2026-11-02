import {readTrainGLB} from './read-train-glb.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';import * as THREE from 'three';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';import {enhanceMetroMaterials} from '../dist/metro-render.js';
import {loadTrainPair} from '../dist/train-assets.js';
globalThis.window={addEventListener(){}};const {StationScene}=await import('../dist/station-scene.js');
const assets=new Map(),pending=new Map(),calls=new Map();
const read=async key=>{const n=(calls.get(key)||0)+1;calls.set(key,n);if(key==='NM79_cabina'&&n===1)throw Error('Interrupción temporal');const b=readTrainGLB('dist/models/'+key+'.glb');const g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');return enhanceMetroMaterials(g.scene);};
await Promise.all([loadTrainPair(assets,pending,'NM79',read,async()=>{}),loadTrainPair(assets,pending,'NM79',read,async()=>{})]);
assert.equal(calls.get('NM79_cabina'),2);assert.equal(calls.get('NM79_intermedio'),1);assert.equal(pending.size,0);
await loadTrainPair(assets,pending,'MP82',read,async()=>{});
const view=Object.create(StationScene.prototype);Object.assign(view,{assets,trainTemplates:new Map(),trainMeshes:new Map(),scene:new THREE.Scene()});
for(const model of ['NM-79','MP-82'])for(const direction of [-1,1]){
 const train={id:model+direction,line:8,model,direction,position:200};const m=view.ensureTrainModel(train,200);
 assert(m?.detailed&&m.group.visible);assert.equal(m.group.children.filter(o=>o.userData.carIndex!==undefined).length,9);assert.equal(m.doors.length,144);
 const box=new THREE.Box3().setFromObject(m.group);assert(box.max.x-box.min.x>150);assert(box.max.y>3.5);assert(box.max.z-box.min.z>2.5);
 assert(m.group.userData.renderStats.meshes>0);
}
// A permanent failure must clear pending requests, so an explicit retry works.
const retryAssets=new Map(),retryPending=new Map();await assert.rejects(loadTrainPair(retryAssets,retryPending,'MP82',async()=>{throw Error('Offline');},async()=>{}));
await new Promise(resolve=>setTimeout(resolve,0));assert.equal(retryPending.size,0);await loadTrainPair(retryAssets,retryPending,'MP82',async key=>assets.get(key),async()=>{});assert.equal(retryAssets.size,2);
console.log('L8: NM-79/MP-82 completos en ambos sentidos, 9 coches y 144 hojas; recuperación de fallos, deduplicación y reintento correctos.');
