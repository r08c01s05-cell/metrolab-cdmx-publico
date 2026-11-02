import './node-textures40.mjs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readTrainGLB} from './read-train-glb.mjs';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
for(const prefix of ['NM22','NM79','MP82'])for(const kind of ['cabina','intermedio']){
 const b=readTrainGLB('dist/models/'+prefix+'_'+kind+'.glb');
 const g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');g.scene.updateMatrixWorld(true);let count=0;
 g.scene.traverse(leaf=>{
  const match=leaf.name.match(/^Puerta_S(-?1)_\d_Hoja_-?1$/);if(!match||leaf.isMesh)return;
  const glass=leaf.children.find(o=>o.isMesh&&o.material.name.toLowerCase().includes('cristal'));assert(glass);
  const box=new THREE.Box3().setFromObject(glass),center=leaf.getWorldPosition(new THREE.Vector3()),direction=-Number(match[1]);
  for(const dx of [-.30,-.20,0,.20,.30])for(let step=0;step<12;step++){
   const y=box.min.y-.11+step*.01;
   const ray=new THREE.Raycaster(new THREE.Vector3(center.x+dx,y,0),new THREE.Vector3(0,0,direction),0,2);
   assert(ray.intersectObject(leaf,true).length>0,`${prefix} ${kind} hueco dx=${dx} y=${y}`);
  }count++;
 });assert.equal(count,16);console.log(prefix+'_'+kind+': 16 hojas sin hueco debajo del vidrio.');
}
