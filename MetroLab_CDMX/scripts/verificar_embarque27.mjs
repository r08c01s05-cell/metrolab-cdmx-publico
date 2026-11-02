import {readTrainGLB} from './read-train-glb.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';import * as THREE from 'three';
globalThis.document={body:{dataset:{workspace:'workshop'}}};globalThis.window={addEventListener(){}};const {StationScene}=await import('../dist/station-scene.js');
import {buildPassengerFrame,planPassengerStop,onboardCount,doorOpenness} from '../dist/passenger-flow.js';
await import('../dist/engine.js');
const data=JSON.parse(fs.readFileSync('dist/datos.json'));data.demanda_horaria=JSON.parse(fs.readFileSync('dist/demanda_horaria.json'));const e=new window.MetroEngine(data);
// Reconstruct the real GLB node transforms without a browser or texture decoding.
function nodes(file){const b=readTrainGLB(file),json=JSON.parse(b.subarray(20,20+b.readUInt32LE(12))),all=json.nodes.map(n=>{const o=new THREE.Object3D();o.name=n.name||'';o.userData=n.extras||{};if(n.translation)o.position.fromArray(n.translation);if(n.rotation)o.quaternion.fromArray(n.rotation);if(n.scale)o.scale.fromArray(n.scale);if(n.matrix){o.matrix.fromArray(n.matrix);o.matrix.decompose(o.position,o.quaternion,o.scale);}if(n.mesh!==undefined)o.isMesh=true;return o;});json.nodes.forEach((n,i)=>(n.children||[]).forEach(j=>all[i].add(all[j])));const scene=new THREE.Group();for(const i of json.scenes[json.scene||0].nodes)scene.add(all[i]);return scene;}
for(const prefix of ['NM22','NM79','MP82'])for(const direction of [1,-1]){
 const group=new THREE.Group(),doors=[];
 for(let i=0;i<9;i++){const car=nodes('dist/models/'+prefix+(i===0||i===8?'_cabina':'_intermedio')+'.glb');car.position.x=(i-4)*16.7;car.scale.x=.965;const reversed=prefix==='MP82'?i===0:i===8;car.rotation.y=reversed?Math.PI:0;group.add(car);car.traverse(o=>{if(o.isMesh)return;const match=o.name.match(/Puerta_S(-?1)_(\d+)_Hoja_(-?1)/);if(match)doors.push({mesh:o,x:o.position.x,half:Number(match[3]),side:-Number(match[1])*(reversed?-1:1),portalKey:i+'_'+match[2]});});}
 group.position.z=-direction*1.8;group.rotation.y=direction===-1?Math.PI:0;
 const train={...e.trains[0],direction,load:500},portals=StationScene.prototype.doorPortals({detailed:true,group,doors},train);
 assert.equal(portals.length,36,prefix+' puertas');assert(portals[0].x<-65&&portals.at(-1).x>65);
 const plan=planPassengerStop(e,train,1000,portals);assert.equal(plan.entering,e.boardingLimit());assert(plan.flows.filter(f=>f.kind==='board').length>30);
 const build=(t,queue=1000)=>{train.wait=e.dwell-t;return buildPassengerFrame({engine:e,train,stationCenter:0,queue,plan,elapsed:t,visibleStation:true,motionTime:t});};
 let crossing=0;for(let t=0;t<e.dwell;t+=.1){const actors=build(t);assert(actors.length<=1160);for(const a of actors){assert(Number.isFinite(a.x+a.y+a.z));if(a.flow&&a.moving){assert(doorOpenness(e,train)>=.95);if(Math.abs(a.z)>2&&Math.abs(a.z)<3.1)crossing++;}if(a.id.startsWith('wait:'))assert(Math.abs(a.z)>=4.2);} }
 assert(crossing>20);const end=build(27);assert(end.filter(a=>a.id.startsWith('inside:')).length>=120);
 const positions=end.filter(a=>a.id.startsWith('inside:')).map(a=>a.x);for(let car=0;car<9;car++)assert(positions.some(x=>Math.abs(x-(car-4)*16.7)<7));
 const small=build(0,50).filter(a=>a.id.startsWith('wait:'));
 // With no reserved boarding groups, a small crowd must still cover both platform ends.
 const distributed=buildPassengerFrame({engine:e,train:{...train,wait:0,position:200},stationCenter:0,queue:50,elapsed:0,visibleStation:true});const x=distributed.filter(a=>a.id.startsWith('wait:')).map(a=>a.x);assert(Math.min(...x)<-50&&Math.max(...x)>50);assert(x.some(x=>Math.abs(x)<12));
}
assert.equal(onboardCount(500),125);assert(e.trains.some(t=>t.target>0&&t.load>0));assert(e.trains.filter(t=>t.target===0).every(t=>t.load===0));
for(let i=0;i<6000;i++)e.step(.1);assert(Math.abs(e.arrivals-Object.values(e.waiting).reduce((a,b)=>a+b,0)-e.boarded)<1e-5);assert.equal(e.initialOnboard+e.boarded-e.alighted,e.trains.reduce((a,t)=>a+t.load,0));
for(const dwell of [10,20,30,60]){e.dwell=dwell;const t={...e.trains[0],target:1,load:700,wait:dwell,stopDwell:dwell},p=planPassengerStop(e,t,1000,Array.from({length:36},(_,i)=>({x:i*4-70})));assert(p.flows.some(f=>f.kind==='board'));assert(p.flows.every(f=>f.start+f.duration+.45<dwell-1.5));}
console.log('6 combinaciones modelo/sentido: 36 puertas reales, cruce abierto, embarque, 9 vagones ocupados, andén completo con poca gente, conservación y estancias 10–60 s: correctos.');
