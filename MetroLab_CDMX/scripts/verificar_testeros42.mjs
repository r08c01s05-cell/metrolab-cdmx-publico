import './node-textures40.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readTrainGLB} from './read-train-glb.mjs';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {enhanceMetroMaterials} from '../dist/metro-render.js';
for(const prefix of ['NM79','MP82'])for(const kind of ['cabina','intermedio']){
 const stem=prefix+'_'+kind,b=readTrainGLB('dist/models/'+stem+'.glb');
 const g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');enhanceMetroMaterials(g.scene);g.scene.updateMatrixWorld(true);
 const ends=kind==='intermedio'?[-1,1]:prefix==='NM79'?[1]:[-1];let glazing=0;
 g.scene.traverse(o=>{
  if(!o.isMesh)return;
  const name=o.material.name;
  if(name.includes('Vidrio testero neutro42')){glazing++;assert.equal(o.material.opacity,.12);assert.equal(o.material.depthWrite,false);const box=new THREE.Box3().setFromObject(o);assert(box.min.z>=-.22&&box.max.z<=.22);}
  if(o.name.startsWith('exterior__')&&name.toLowerCase().includes('cristal')){
   const geom=o.geometry.index?o.geometry.toNonIndexed():o.geometry,p=geom.attributes.position;
   for(let i=0;i<p.count;i+=3){const points=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,i+k).applyMatrix4(o.matrixWorld));for(const side of ends)assert(!points.every(v=>v.x*side>7.4&&Math.abs(v.z)<.76),'vidrio central antiguo todavía presente');}
  }
 });assert.equal(glazing,1);
 for(const side of ends){
  const ray=new THREE.Raycaster(new THREE.Vector3(0,1.95,0),new THREE.Vector3(side,0,0),0,8.0);
  const hits=ray.intersectObject(g.scene,true).filter(h=>h.object.userData.revision_interior===42);
  assert(hits.some(h=>h.object.material.name.includes('Panel testero marfil42')),'el extremo debe tener una puerta sólida');
 }
 assert(b.equals(fs.readFileSync('assets-source/trenes/'+stem+'.glb')));
 console.log(stem+': puerta de extremo sólida, vidrio enmarcado y sin panel central antiguo.');
}
