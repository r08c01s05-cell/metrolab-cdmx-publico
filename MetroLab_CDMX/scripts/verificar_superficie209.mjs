import './node-textures40.mjs';
import assert from 'node:assert/strict';import fs from 'node:fs';import {gunzipSync}from'node:zlib';import * as T from 'three';
import {SURFACE209,configureLayout208,offsetAt208,trainTrack208,doorSide208,waitingZ208,platformRegions209}from'../dist/station-layout208.js?v=209';
import {makeCoyuya208,widenCoyuya208}from'../dist/coyuya208.js?v=209';
import {platformSolids169,sweepPlatform169,constrainPlatformActors169}from'../dist/platform-collision169.js';
import {batchStationModel}from'../dist/station-assets.js';import{finishPlatforms160}from'../dist/platform-finish160.js';
import{buildPassengerFrame}from'../dist/passenger-flow.js';import{finishObservatorio209}from'../dist/terminal-surface209.js?v=209';import{GLTFLoader}from'../dist/vendor/GLTFLoader.js';
const data=JSON.parse(fs.readFileSync('dist/datos.json','utf8')),stations=data.estaciones.filter(s=>s.linea===8),line={stations,distances:stations.map((_,i)=>i*1000)};configureLayout208(line);
globalThis.document={createElement:()=>({getContext:()=>new Proxy({createImageData:(w,h)=>({data:new Uint8Array(w*h*4)})},{get:(o,k)=>o[k]||(()=>{})})})};
for(const [id,spec]of Object.entries(SURFACE209).filter(([,s])=>s.kind!=='lateral')){
 const station=stations.find(s=>s.id===id),index=stations.indexOf(station),center=line.distances[index],root=makeCoyuya208(station),solids=platformSolids169(root),regions=platformRegions209(station);
 const floors=root.children.filter(m=>m.name==='Piso terrazo andén central');assert.equal(floors.length,spec.kind==='terminal'?2:1);
 for(const f of floors){const b=new T.Box3().setFromObject(f);assert(Math.abs(b.max.z-b.min.z-7.5)<1e-6);for(const rail of(spec.kind==='terminal'?[-10.4,0,10.4]:[-5.2,5.2]))assert(rail-1.425>=b.max.z-.001||rail+1.425<=b.min.z+.001,'Track/guide envelope does not enter platform');}
 for(const direction of[-1,1]){
  const t={id:'test',line:8,model:'NM-79',direction,position:center,target:index,wait:20,load:100};assert.equal(trainTrack208(t),-direction*spec.track);assert.equal(doorSide208(t),direction);
  const engine={time:5,power:{8:true},emergency:false,stopDuration:()=>30},actors=buildPassengerFrame({engine,train:t,stationCenter:center,queue:80,visibleStation:true});constrainPlatformActors169(actors,center,solids);
  for(const a of actors.filter(a=>a.location==='platform')){const radius=a.modelType==='child'?.19:.26;assert(regions.some(r=>a.z-radius>=r.minZ-.001&&a.z+radius<=r.maxZ+.001),'Waiting body inside a platform safe region');}
  let p={x:5,z:waitingZ208(t)};for(let j=0;j<200;j++)p=sweepPlatform169(p,{x:p.x,z:p.z+direction*.12},-direction,solids,.3);
  if(spec.kind==='terminal')assert.equal(Math.sign(p.z),-direction,'Cannot walk across central track');else assert(p.z*direction>2.9,'Single island is connected across its width');
 }
 if(spec.kind==='terminal'){assert(root.children.some(m=>m.name==='Base vía central terminal'));assert(root.children.some(m=>m.name==='Riel central de seguridad'));}
 const infrastructure=new T.Group(),track=new T.Group();track.userData.track99=true;infrastructure.add(track);const rail=new T.Mesh(new T.BoxGeometry(40,.1,.1,10),new T.MeshStandardMaterial());rail.position.set(center,.2,-1.8);track.add(rail);widenCoyuya208(infrastructure,line,offsetAt208);assert(Math.abs(new T.Box3().setFromObject(rail).getCenter(new T.Vector3()).z+spec.track)<.001);
 finishPlatforms160(root);const batch=batchStationModel(root);assert(batch.children.length<100,'Material batching remains bounded');console.log('209 PASS surface geometry, tracks, waiting, collisions, UV/batching',id,batch.children.length);
}
// Continuous track separation across all four successive central-island stops.
for(let x=9000;x<=12000;x+=10)assert.equal(offsetAt208(8,x),5.2);assert.equal(offsetAt208(8,0),1.8);assert.equal(offsetAt208(1,19000),1.8);
const station=data.estaciones.find(s=>s.id==='L1-20'),url=station.geometria_3d.url_glb.split('?')[0],b=gunzipSync(fs.readFileSync('dist/'+url+'.gz')),root=(await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')).scene;
const geometry=[];root.traverse(o=>{if(o.isMesh)geometry.push([o,o.position.clone(),o.quaternion.clone(),o.scale.clone(),o.geometry]);});assert(finishObservatorio209(root,station)>0);
for(const[o,p,q,s,g]of geometry){assert(o.position.equals(p)&&o.quaternion.equals(q)&&o.scale.equals(s));assert.equal(o.geometry,g,'Observatorio geometry preserved');}
root.traverse(o=>{if(o.isMesh)assert(!(Array.isArray(o.material)?o.material:[o.material]).some(m=>m.name==='Franja_verde_Linea_8'));});assert.equal(station.tipo_anden,'dos laterales');console.log('209 PASS Observatorio retains authored lateral platforms and textures; inherited Line 8 green stripe corrected to pink.');
