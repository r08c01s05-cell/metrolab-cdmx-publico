import assert from 'node:assert/strict';
import * as T from 'three';
import {configureLayout208,offsetAt208,trainTrack208,doorSide208,islandAt208} from '../dist/station-layout208.js?v=209';
import {makeCoyuya208,widenCoyuya208} from '../dist/coyuya208.js?v=209';
import {safePlatformPoint169,sweepPlatform169,platformSolids169,constrainPlatformActors169} from '../dist/platform-collision169.js';
import {batchStationModel} from '../dist/station-assets.js';
import {cabinPlacement} from '../dist/passenger-seats.js';
import {buildPassengerFrame} from '../dist/passenger-flow.js';
import {finishPlatforms160} from '../dist/platform-finish160.js';
import {cabPose118} from '../dist/cab-camera118.js';
const line={stations:[{id:'L8-09',linea:8},{id:'L8-10',linea:8},{id:'L8-11',linea:8}],distances:[0,1100,2200]};configureLayout208(line);
assert.equal(offsetAt208(8,1100),5.2);assert.equal(offsetAt208(8,0),1.8);assert.equal(offsetAt208(1,1100),1.8);
for(const x of[700,940,1260,1500])assert(Math.abs(offsetAt208(8,x+.001)-offsetAt208(8,x-.001))<.0001,'No lateral jump at transition joins');
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>new Proxy({createImageData:(w,h)=>({data:new Uint8Array(w*h*4)})},{get:(o,k)=>o[k]||(()=>{})})})};
const source=makeCoyuya208(),bounds=new T.Box3().setFromObject(source.getObjectByName('Piso terrazo andén central'));
assert.equal(bounds.min.z,-3.75);assert.equal(bounds.max.z,3.75);assert.equal(bounds.min.x,-78);assert.equal(bounds.max.x,78);
const solids=platformSolids169(source);solids.layout208='island';assert(solids.some(b=>Math.abs(b.minZ)<1),'Actual central columns collide');assert(solids.some(b=>b.minX>40&&b.maxY===undefined),'Stair solids captured');
for(const direction of[-1,1]){
 const train={id:'test',direction,line:8,model:'NM-79',position:1100,target:1,wait:20,load:100};
 assert.equal(trainTrack208(train),-direction*5.2);assert.equal(doorSide208(train),direction);
 const seat=cabinPlacement(train,0);assert(Math.abs(seat.z-trainTrack208(train))<1.2,'Occupants remain inside shifted vehicle');
 const pose=cabPose118({pose:(x,z)=>({x,z,yaw:0})},train,'driver');assert.equal(pose.eye.z,trainTrack208(train));
 const engine={time:5,stopDuration:()=>30,emergency:false,power:{8:true},operator:null};
 const actors=buildPassengerFrame({engine,train,stationCenter:1100,queue:70,visibleStation:true});
 assert(actors.filter(a=>a.location==='platform').length>20);
 constrainPlatformActors169(actors,1100,solids);
 for(const a of actors.filter(a=>a.location==='platform'))assert(Math.abs(a.z)+(a.modelType==='child'?.19:.26)<=3.40001,'Waiting body stays behind the tactile edge');
 for(const side of[-1,1]){
  const p=safePlatformPoint169({x:5,z:side*90},side,solids,.3);assert(Math.abs(p.z)<=3.1);
  const across=sweepPlatform169({x:5,z:-2.7},{x:5,z:2.7},side,solids,.3);assert(across.z>2.6,'Can walk across the single island');
 }
}
// Solid obstacle prevents a swept walk from crossing the central stair core.
let walk={x:40,z:0};for(let i=0;i<400;i++)walk=sweepPlatform169(walk,{x:walk.x+.05,z:walk.z},-1,solids,.3);assert(walk.x<47,'No walking through stair geometry');
const root=new T.Group(),track=new T.Group();track.userData.track99=true;root.add(track);const rail=new T.Mesh(new T.BoxGeometry(40,.1,.1,12),new T.MeshStandardMaterial());rail.position.set(1100,.2,-1.8);track.add(rail);widenCoyuya208(root,line,offsetAt208);assert(Math.abs(new T.Box3().setFromObject(rail).getCenter(new T.Vector3()).z+5.2)<.001,'Infrastructure rail and train agree');
finishPlatforms160(source);const model=batchStationModel(source);assert(model.getObjectByName('Andenes_piso').geometry.attributes.uv2,'World-scale floor UVs survive station batching');assert(model.children.length<65,'Pilot station remains batched');assert(model.userData.batching.meshes_originales>300);console.log('208 PASS: single island and two offset tracks; smooth transitions; both door sides face island; seats/cabs match tracks; waiting bodies and swept walking respect stairs and edges; station batching',model.children.length);
