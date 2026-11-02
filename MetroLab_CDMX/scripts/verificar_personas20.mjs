import * as THREE from 'three';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PassengerModels} from '../dist/passenger-models.js';
const scene=new THREE.Scene(),people=new PassengerModels(scene,8);
const actors=[{id:'adulto20',modelType:'man',x:-1.1,y:0,z:0,yaw:0},{id:'adulta20',modelType:'woman',x:0,y:0,z:0,yaw:0},{id:'menor20',modelType:'child',x:1,y:0,z:0,yaw:0},{id:'cuidadora20',modelType:'woman',carryingBaby:true,x:2,y:0,z:0,yaw:0}];
for(let frame=0;frame<120;frame++){
 people.update(actors.map(a=>({...a,moving:frame>0})),frame/20);
 for(const m of Object.values(people.parts))for(let i=0;i<m.count*16;i++)assert(Number.isFinite(m.instanceMatrix.array[i]),m.name);
 const mat=new THREE.Matrix4(),sc=new THREE.Vector3(),q=new THREE.Quaternion(),pos=new THREE.Vector3();
 for(const name of ['upperLeg','lowerLeg'])for(let i=0;i<8;i++){people.parts[name].getMatrixAt(i,mat);mat.decompose(pos,q,sc);assert(sc.y>.25&&sc.y<.45);}
}
people.update(actors,0);
// Export the actual instanced meshes for an offline geometry preview.
const items=[],mat=new THREE.Matrix4(),v=new THREE.Vector3(),color=new THREE.Color();
for(const m of Object.values(people.parts)){
 if(m.name==='contactShadow')continue;
 for(let i=0;i<m.count;i++){
  m.getMatrixAt(i,mat);if(Math.abs(mat.determinant())<1e-12)continue;
  const g=m.geometry,pts=[];for(let k=0;k<g.attributes.position.count;k++){v.fromBufferAttribute(g.attributes.position,k).applyMatrix4(mat);pts.push(v.toArray());}
  if(m.instanceColor)m.getColorAt(i,color);else color.copy(m.material.color);
  items.push({points:pts,index:Array.from(g.index.array),color:'#'+color.getHexString()});
 }
}
fs.writeFileSync('/workspace/scratch/fc8783fbaffa/personas20_preview.json',JSON.stringify(items));
console.log('Adultos, niños y cuidadores: matrices finitas y longitudes de piernas estables durante 120 fotogramas.');
