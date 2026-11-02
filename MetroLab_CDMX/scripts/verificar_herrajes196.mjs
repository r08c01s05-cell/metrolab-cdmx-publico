import './node-textures40.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as T from 'three';
import {loadRectifier127} from '../dist/rectifier-assets127.js';
import {loadServiceBench134} from '../dist/substation-service134.js';
import {loadBench103} from '../dist/maintenance-assets103.js';

const native=fetch;
globalThis.fetch=async u=>String(u).startsWith('./models/')?new Response(fs.readFileSync('dist/'+String(u).slice(2).split('?')[0])):native(u);
const model=await loadRectifier127();
let batteryLeaves=0;
for(const door of model.userData.doors){
 const opened=door.quaternion.clone(),closed=new T.Quaternion();
 door.quaternion.copy(closed);door.updateWorldMatrix(true,true);
 const center=new T.Box3().setFromObject(door).getCenter(new T.Vector3()),local=door.worldToLocal(center.clone()),hinge=door.getWorldPosition(new T.Vector3()),outside=new T.Vector3(0,0,-1).applyQuaternion(door.parent.getWorldQuaternion(new T.Quaternion()));
 for(const amount of [.2,.4,.6,.8,1]){
  door.quaternion.slerpQuaternions(closed,opened,amount);door.updateWorldMatrix(true,true);
  const moved=door.localToWorld(local.clone()).sub(center).dot(outside);
  assert(moved>.03,'Door moves toward the aisle instead of inside the cabinet: '+door.name);
  assert(new T.Box3().setFromObject(door).max.z<=hinge.z+.09,'Opened leaf stays in front of the enclosure, including moving furniture');
 }
 if(door.userData.cover177)batteryLeaves++;
 door.quaternion.copy(opened);
}
assert.equal(batteryLeaves,2,'Both battery-cover hinge directions are covered');

const bench=await loadServiceBench134('ventilation'),plate=bench.group.getObjectByName('Placa fija con aberturas de filtro y ventilación196');
assert(plate?.userData.fastenerSupport196,'The mounted ventilation practice has a fixed physical flange');
bench.group.updateMatrixWorld(true);
for(const key of ['screwL','screwR','screw3','screw4']){
 const screw=bench.targets.get(key),point=screw.getWorldPosition(new T.Vector3()),ray=new T.Raycaster(point.clone().add(new T.Vector3(0,0,-.03)),new T.Vector3(0,0,1),0,.1),hits=ray.intersectObject(plate);
 assert(hits.length,'A real plate surface supports each fastener: '+key);
 assert(Math.abs(hits[0].point.z-point.z)<.004,'The washer seats directly against the flange');
 const shaft=screw.getObjectByName('Vástago cautivo apoyado en la brida196');assert(shaft,'Backed-out screw retains a visible captive shaft');
 for(const offset of [0,-.045]){screw.position.z+=offset;screw.updateWorldMatrix(true,true);assert(new T.Box3().setFromObject(shaft).intersectsBox(new T.Box3().setFromObject(plate)),'The shaft reaches the flange in tightened and loosened states');screw.position.z-=offset;}
}
for(const [x,y] of [[0,.06],[0,-.37]]){
 const hits=new T.Raycaster(new T.Vector3(x,y,-.3),new T.Vector3(0,0,1),0,1).intersectObject(plate);
 assert.equal(hits.length,0,'The support sheet leaves a real airflow opening for the filter and fan');
}
const filter=bench.targets.get('filter'),home=filter.position.clone();filter.position.z-=.8;filter.updateWorldMatrix(true,true);assert.equal(plate.parent,bench.group,'The support stays installed while the filter is carried away');filter.position.copy(home);

// Existing train benches must keep a real cover under their four fasteners.
for(const id of ['ventilation','electrical']){
 const rig=await loadBench103(id);rig.group.updateMatrixWorld(true);
 for(let i=1;i<=4;i++){
  const point=rig.parts['screw'+i].getWorldPosition(new T.Vector3()),ray=new T.Raycaster(point.clone().add(new T.Vector3(0,0,.10)),new T.Vector3(0,0,-1),0,.2),hit=ray.intersectObject(rig.parts.cover,true).find(h=>h.object.material?.visible!==false);
  assert(hit,'Train '+id+' fastener '+i+' rests against the physical cover');
  assert(Math.abs(hit.point.z-point.z)<.025,'Train fixing and cover are adjacent');
 }
}
bench.dispose();
console.log('196 PASS: 13 cabinet leaves open into the aisle; four captive ventilation fasteners seat on a fixed plate with airflow openings; both train covers support all four fixings.');
