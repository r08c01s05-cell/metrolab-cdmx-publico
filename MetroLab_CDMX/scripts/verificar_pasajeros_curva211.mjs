import './node-textures40.mjs';
import assert from 'node:assert/strict';import * as T from 'three';
import {cabinPlacement}from'../dist/passenger-seats.js';
import {configureLayout208,trainTrack208}from'../dist/station-layout208.js?v=209';
import {renderCurved97}from'../dist/route-geometry97.js';
import {renderPosition203}from'../dist/presentation203.js';
import {InstancedPassengers121}from'../dist/instanced-passengers121.js';
import {PassengerContacts122}from'../dist/world-contact122.js';
configureLayout208({stations:[{id:'L8-18',linea:8},{id:'L8-19',linea:8}],distances:[0,1000]});
const route={pose(x,z){const a=x/140;return{x:140*Math.sin(a)-Math.sin(a)*z,z:140*(1-Math.cos(a))+Math.cos(a)*z,yaw:-a};},map(v){const p=this.pose(v.x,v.z);return new T.Vector3(p.x,v.y,p.z);}};
globalThis.window={metroTiming170:{pendingSeconds:.015}};
let cases=0;
for(const model of['NM-22','NM-79','MP-82'])for(const direction of[-1,1])for(const position of[640,760,880,1000]){
 const train={id:'T',model,line:model==='NM-22'?1:8,direction,position,speed:14,wait:0,target:direction>0?1:0};
 const state={running:true,selectedTrain:'T',engine:{trains:[train],lines:{[train.line]:{distances:[0,1400]}}}};
 const scene=new T.Scene(),group=new T.Group();group.position.set(position,0,trainTrack208(train));group.rotation.y=direction<0?Math.PI:0;scene.add(group);
 for(let i=0;i<9;i++){const c=new T.Group();c.userData.carIndex=i;c.position.x=(i-4)*16.7;group.add(c);}
 const actors=Array.from({length:144},(_,slot)=>({id:'inside:T:'+slot,slot,location:'cabin',modelType:slot%2?'woman':'man',trainId:'T',...cabinPlacement(train,slot)}));
 const detailed=new T.Group();scene.add(detailed);for(const actor of actors.slice(0,24)){const o=new T.Object3D();o.position.set(actor.x,actor.y,actor.z);o.rotation.y=actor.yaw;o.userData.passenger203=actor;detailed.add(o);}
 const far=new InstancedPassengers121(scene,{},200),mesh=new T.InstancedMesh(new T.BoxGeometry(.1,.1,.1),new T.MeshBasicMaterial(),200),bucket={meshes:[mesh],count:0};far.group.add(mesh);far.buckets.set('test',bucket);far.prototype=()=>bucket;
 far.update(actors.slice(24).map((actor,hash)=>({actor,hash,template:{}})),2,route,train);
 const contacts=new PassengerContacts122(scene);contacts.update(actors,2,route,train);
 const camera=new T.PerspectiveCamera();camera.position.set(position-30,25,-40);const bank={group:detailed,background121:far,contacts122:contacts,train203:'T'},sun=new T.Object3D();sun.target=new T.Object3D();
 const view={alignment97:route,getState:()=>state,trainMeshes:new Map([['T',{group}]]),cabinCharacters:bank,camera,cameraMode:'full',controls:{target:new T.Vector3(position,2,0)},sun,scene};
 const originals=detailed.children.map(o=>[o.position.clone(),o.quaternion.clone()]),logical=JSON.stringify(actors);
 const check=(actor,world)=>{const car=group.children[actor.carAnchor211.index];car.updateWorldMatrix(true,false);const local=world.clone().applyMatrix4(car.matrixWorld.clone().invert()),expected=new T.Vector3(direction*(actor.x-actor.carAnchor211.x),actor.y,direction*(actor.z-actor.carAnchor211.z));assert(local.distanceTo(expected)<1e-3,`${model}/${direction}/${position}: rider detached from car ${actor.carAnchor211.index}`);assert(Math.abs(local.z)<1.21,'Rider remains inside carriage');};
 view.renderer={render(){scene.updateMatrixWorld(true);for(const o of detailed.children)check(o.userData.passenger203,o.getWorldPosition(new T.Vector3()));const m=new T.Matrix4();for(const entry of far.cabinInstances211){mesh.getMatrixAt(entry.index,m);check(entry.actor,new T.Vector3().setFromMatrixPosition(m));}for(const entry of contacts.cabinContacts211){contacts.mesh.getMatrixAt(entry.index,m);const foot={...entry.actor,y:entry.actor.y+.012};check(foot,new T.Vector3().setFromMatrixPosition(m));}}};
 // Move the live train after the crowd snapshot: it must stay attached between
 // population samples and at interpolated drawing positions on either track.
 train.position+=.30;
 for(let cycle=0;cycle<3;cycle++){window.metroTiming170.pendingSeconds=cycle*.006;renderCurved97(view);assert.equal(JSON.stringify(actors),logical);for(let i=0;i<originals.length;i++){assert(detailed.children[i].position.equals(originals[i][0]));assert(detailed.children[i].quaternion.equals(originals[i][1]));}}
 state.running=false;renderCurved97(view);state.running=true;
 const checkRiders=view.renderer.render;
 for(const mode of['car','passenger']){
  view.cameraMode=mode;view.passenger178=mode==='passenger'?{ride200:{trainId:'T'}}:undefined;
  const x=train.position+direction*3*16.7+direction*2,z=trainTrack208(train)+direction*.2;
  camera.position.set(x,2.83,z);view.controls.target.set(x+direction*5,2.83,z);
  view.renderer.render=(scene,eye)=>{checkRiders();const c=group.children[7];c.updateWorldMatrix(true,false);const local=eye.position.clone().applyMatrix4(c.matrixWorld.clone().invert());assert(local.distanceTo(new T.Vector3(2,2.83,.2))<1e-3,'Interior/player eye shares the car frame');const forward=eye.getWorldDirection(new T.Vector3()).transformDirection(c.matrixWorld.clone().invert());assert(forward.distanceTo(new T.Vector3(1,0,0))<1e-5,'Interior view does not bend independently through the car');};
  renderCurved97(view);assert.equal(camera.position.x,x);
 }
 view.cameraMode='full';view.passenger178=undefined;camera.position.set(position-30,25,-40);
 view.renderer.render=()=>{throw Error('test render failure');};assert.throws(()=>renderCurved97(view),/test render failure/);for(let i=0;i<originals.length;i++)assert(detailed.children[i].position.equals(originals[i][0]));
 assert.equal(camera.position.x,position-30);cases++;
}
console.log('211 PASS:',cases,'model/direction/curve cases; all 144 riders and 288 foot contacts stay rigidly inside their own car across 3 render phases, stale crowd samples and renderer failure.');
