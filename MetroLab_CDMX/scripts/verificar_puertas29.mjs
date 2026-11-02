import {readTrainGLB} from './read-train-glb.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';import * as THREE from 'three';
import {preparePocketDoors,updatePocketDoor} from '../dist/train-doors.js';
const sourceMaterial=new THREE.MeshStandardMaterial();let leaves=0;
for(const prefix of ['NM22','NM79','MP82'])for(const carType of ['cabina','intermedio'])for(const direction of [1,-1]){
 const file='dist/models/'+prefix+'_'+carType+'.glb',b=readTrainGLB(file),json=JSON.parse(b.subarray(20,20+b.readUInt32LE(12))),objects=json.nodes.map(n=>{let o;if(n.mesh!==undefined){const accessor=json.accessors[json.meshes[n.mesh].primitives[0].attributes.POSITION],min=new THREE.Vector3().fromArray(accessor.min),max=new THREE.Vector3().fromArray(accessor.max),size=max.clone().sub(min);o=new THREE.Mesh(new THREE.BoxGeometry(size.x,size.y,size.z).translate(...min.add(max).multiplyScalar(.5).toArray()),sourceMaterial);}else o=new THREE.Group();o.name=n.name||'';if(n.translation)o.position.fromArray(n.translation);if(n.rotation)o.quaternion.fromArray(n.rotation);if(n.scale)o.scale.fromArray(n.scale);return o;});
 json.nodes.forEach((n,i)=>(n.children||[]).forEach(j=>objects[i].add(objects[j])));const root=new THREE.Group();for(const i of json.scenes[json.scene||0].nodes)root.add(objects[i]);root.rotation.y=direction===-1?Math.PI:0;root.position.set(300,0,-direction*1.8);root.scale.x=.965;
 const doors=[];root.traverse(o=>{if(o.isMesh)return;const m=o.name.match(/Puerta_S(-?1)_(\d+)_Hoja_(-?1)$/);if(m)doors.push({mesh:o,x:o.position.x,side:Number(m[1]),half:Number(m[3]),portalKey:m[2]});});assert.equal(doors.length,16,file);
 preparePocketDoors(doors);assert.equal(sourceMaterial.clippingPlanes,null);
 for(const door of doors){
  for(const amount of [0,.0001,.25,.5,.75,1,.75,.25,.0001,0]){
   updatePocketDoor(door,amount);assert.equal(door.mesh.visible,amount===0);assert.equal(door.mesh.position.x,door.x);
   door.mesh.traverse(o=>{if(!o.isMesh)return;assert.equal(o.material,sourceMaterial);let effective=true;for(let n=o;n;n=n.parent)effective=effective&&n.visible;assert.equal(effective,amount===0);});
  }leaves++;
 }root.traverse(o=>{if(o.isMesh)o.geometry.dispose();});
}
console.log(leaves+' hojas de 6 GLB en ambos sentidos: invisibles durante apertura y cierre, visibles totalmente cerradas, sin desplazamiento ni superposición.');
