import assert from 'node:assert/strict';import fs from 'node:fs';import zlib from 'node:zlib';import {execFileSync} from 'node:child_process';
import * as THREE from 'three';import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {applyMotorRole90,motorBench90} from '../dist/motor-runtime90.js';import {motorPartMatrix90} from '../dist/motor-view90.js';import {packCars} from '../dist/depot86.js';
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1,height:1,close(){}});globalThis.ProgressEvent=class{constructor(t,p){Object.assign(this,p);}};
const json=b=>JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));const count=s=>{let n=0;s.traverse(o=>{if(o.userData.motorAssembly90)n++;});return n;};
for(const model of ['NM22','NM79','MP82']){let cab,mid;
 for(const unit of ['cabina','intermedio']){
  const path=`dist/models/${model}_${unit}.glb.gz`,b=zlib.gunzipSync(fs.readFileSync(path)),prior=zlib.gunzipSync(execFileSync('git',['show','2c13c50d30b152935019170116a5d9d6994111ab:'+path],{maxBuffer:40*1024*1024}));const old=json(prior),now=json(b);assert.deepEqual(now.nodes.slice(0,old.nodes.length),old.nodes);assert.deepEqual(now.meshes.slice(0,old.meshes.length),old.meshes);assert.deepEqual(now.materials.slice(0,old.materials.length),old.materials);
  const scene=(await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')).scene;assert.equal(count(scene),4);scene.updateMatrixWorld(true);let parts=0;scene.traverse(o=>{if(o.userData.motorPart90){parts++;assert.equal(o.userData.familia_visual,'traction');assert(o.userData.motorIndex90>=0&&o.userData.motorIndex90<4);assert(o.geometry.attributes.normal);}});assert.equal(parts,100);
  if(unit==='cabina')cab=scene;else mid=scene;
 }
 let total=0;for(let i=0;i<9;i++){const car=applyMotorRole90((i===0||i===8?cab:mid).clone(true),i);const n=count(car);assert.equal(n,[1,4,7].includes(i)?0:4);total+=n;}assert.equal(total,24);assert.equal(count(mid),4,'Cached source unchanged');
 const depotMid=packCars(mid,7,model,24,16.7,false);let motorBatches=0;depotMid.traverse(o=>{if(o.material?.name.startsWith('Motor90_')){motorBatches++;assert.equal(o.count,4);const m=new THREE.Matrix4();for(let i=0;i<4;i++){o.getMatrixAt(i,m);assert(Math.abs(m.elements[14]-(24-[2,3,5,6][i]*16.7))<1e-4);}}});assert(motorBatches>0);
}
assert.equal(motorBench90({power:false,command:100}).running,false);assert.equal(motorBench90({power:true,command:100,isolated:true}).relativeSpeed,0);assert.equal(motorBench90({power:true,command:40}).relativeSpeed,40);assert.equal(motorBench90({power:true,command:300}).relativeSpeed,100);
const center=new THREE.Vector3(2,3,4),base=new THREE.Matrix4().makeTranslation(3,3,4);const m=motorPartMatrix90(base,center,[0,1,0],.5,Math.PI/2,true),point=new THREE.Vector3().setFromMatrixPosition(m);assert(point.distanceTo(new THREE.Vector3(2,4.5,4))<1e-7);assert.deepEqual(motorPartMatrix90(base,center,[0,1,0],0,0,false).elements,base.elements);
console.log('6 GLBs: original nodes/materials/meshes preserved; 4 motors per motriz; 0 per trailer; 24 per reference convoy; depot instances only in motrices; rotor pivot, isolation and power verified. No WebGL render test.');
