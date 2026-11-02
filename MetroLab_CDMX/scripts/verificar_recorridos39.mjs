import {readTrainGLB} from './read-train-glb.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';import * as THREE from 'three';
import {buildNaturalPassengerFrame} from '../dist/passenger-journeys.js';import {planPassengerStop,doorOpenness} from '../dist/passenger-flow.js';
globalThis.document={body:{dataset:{workspace:'workshop'}}};globalThis.window={addEventListener(){}};await import('../dist/engine.js');const {StationScene}=await import('../dist/station-scene.js');
const data=JSON.parse(fs.readFileSync('dist/datos.json'));data.demanda_horaria=JSON.parse(fs.readFileSync('dist/demanda_horaria.json'));const engine=new window.MetroEngine(data);
function nodes(file){const b=readTrainGLB(file),j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12))),all=j.nodes.map(n=>{const o=new THREE.Object3D();o.name=n.name||'';if(n.translation)o.position.fromArray(n.translation);if(n.rotation)o.quaternion.fromArray(n.rotation);if(n.scale)o.scale.fromArray(n.scale);if(n.matrix){o.matrix.fromArray(n.matrix);o.matrix.decompose(o.position,o.quaternion,o.scale);}if(n.mesh!==undefined)o.isMesh=true;return o;});j.nodes.forEach((n,i)=>(n.children||[]).forEach(k=>all[i].add(all[k])));const root=new THREE.Group();j.scenes[j.scene||0].nodes.forEach(i=>root.add(all[i]));return root;}
for(const model of ['NM-22','NM-79','MP-82'])for(const direction of [1,-1]){
 const line=model==='NM-22'?1:8,prefix=model==='NM-22'?'NM22':model==='NM-79'?'NM79':'MP82',center=engine.lines[line].distances[1];
 const train={id:model+direction,line,model,direction,position:center,target:1,stops:1,wait:30,load:500,speed:0},group=new THREE.Group(),doors=[];
 for(let car=0;car<9;car++){const root=nodes('dist/models/'+prefix+(car===0||car===8?'_cabina':'_intermedio')+'.glb'),reversed=prefix==='MP82'?car===0:car===8;root.position.x=(car-4)*16.7;root.scale.x=.965;root.rotation.y=reversed?Math.PI:0;group.add(root);root.traverse(o=>{const m=o.name.match(/^Puerta_S(-?1)_(\d+)_Hoja_(-?1)$/);if(m)doors.push({mesh:o,x:o.position.x,side:-Number(m[1])*(reversed?-1:1),portalKey:car+'_'+m[2]});});}
 group.position.set(center,0,-direction*1.8);group.rotation.y=direction===-1?Math.PI:0;const portals=StationScene.prototype.doorPortals({group,doors,detailed:true},train);assert.equal(portals.length,36);
 const states=new Map(),options={engine,train,stationCenter:center,queue:800,portals,elapsed:0,visibleStation:true,motionTime:0,running:true};
 const before=buildNaturalPassengerFrame(options,states),snapshot=new Map(before.map(a=>[a.id,a]));const plan=planPassengerStop(engine,train,800,portals);
 options.plan=plan;buildNaturalPassengerFrame(options,states);const exchange=states.get(train.id).exchange,boards=exchange.routes.filter(r=>r.kind==='board');assert(boards.length>8);
 for(const r of boards){assert(snapshot.has(r.descriptor.id),'sale de la espera existente');assert(Math.hypot(r.points[0].x-snapshot.get(r.descriptor.id).x,r.points[0].z-snapshot.get(r.descriptor.id).z)<1e-6);}
 let previous=new Map(),crossings=0,last=[];
 for(let elapsed=0;elapsed<28;elapsed+=.05){train.wait=30-elapsed;options.elapsed=elapsed;options.motionTime=elapsed;const actors=buildNaturalPassengerFrame(options,states);assert(actors.length<=1160);assert.equal(new Set(actors.map(a=>a.id)).size,actors.length);
  for(const actor of actors){if(!exchange.routes.some(r=>r.descriptor.id===actor.id))continue;assert(Number.isFinite(actor.x+actor.y+actor.z));const old=previous.get(actor.id);if(old)assert(Math.hypot(actor.x-old.x,actor.z-old.z)<.071,'sin salto de posición');
   if(Math.abs(actor.z)>2.95&&Math.abs(actor.z)<3.2&&actor.moving){assert(doorOpenness(engine,train)>=.95);assert(portals.some(p=>Math.abs(p.x-actor.x)<.001),'cruce en puerta real');crossings++;}
  }previous=new Map(actors.map(a=>[a.id,a]));last=actors;
 }assert(crossings>10);
 const onboard=last.filter(a=>a.location==='cabin'),lastMap=new Map(onboard.map(a=>[a.id,a]));train.wait=0;train.position+=direction*10;train.target+=direction;options.plan=null;
 const after=buildNaturalPassengerFrame(options,states).filter(a=>a.location==='cabin');assert(after.length>=100);
 for(const actor of after){const old=lastMap.get(actor.id);assert(old,'misma identidad al partir');assert(Math.abs(actor.x-old.x-direction*10)<.001,'viaja con el tren sin teleport');assert(Math.abs(actor.z-old.z)<.001);}
 const seatIds=after.filter(a=>a.pose==='seated').map(a=>a.seatId);assert.equal(new Set(seatIds).size,seatIds.length);
 console.log(model+' '+direction+': '+boards.length+' embarques desde fila, '+crossings+' cruces abiertos, identidades y destinos continuos al partir.');
}
