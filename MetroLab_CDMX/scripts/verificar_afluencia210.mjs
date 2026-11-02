import './node-textures40.mjs';
import assert from 'node:assert/strict';import fs from 'node:fs';
import {SURFACE209,configureLayout208,platformRegions209}from'../dist/station-layout208.js?v=209';
import {makeCoyuya208}from'../dist/coyuya208.js?v=209';
import {buildPassengerFrame}from'../dist/passenger-flow.js?v=209';
import {platformSolids169,constrainPlatformActors169}from'../dist/platform-collision169.js?v=209';
globalThis.document={createElement:()=>({getContext:()=>new Proxy({createImageData:(w,h)=>({data:new Uint8Array(w*h*4)})},{get:(o,k)=>o[k]||(()=>{})})})};
const stations=JSON.parse(fs.readFileSync('dist/datos.json','utf8')).estaciones.filter(s=>s.linea===8),line={stations,distances:stations.map((_,i)=>i*1000)};configureLayout208(line);
let placementMs=0;
for(const[id,spec]of Object.entries(SURFACE209).filter(([,s])=>s.kind!=='lateral')){
 const index=stations.findIndex(s=>s.id===id),center=line.distances[index],solids=platformSolids169(makeCoyuya208(stations[index]));
 for(const time of[0,8,17]){
  const train={id:'test',line:8,model:'NM-79',direction:1,position:center,target:index,wait:20,load:0},engine={time,power:{8:true},stopDuration:()=>30};
  const actors=buildPassengerFrame({engine,train,stationCenter:center,queue:900,visibleStation:true}),count=actors.length;
  const start=performance.now();constrainPlatformActors169(actors,center,solids);placementMs+=performance.now()-start;assert.equal(actors.length,count,'Do not discard passengers');
  const crowd=actors.filter(a=>a.location==='platform'&&!a.flow);
  for(let i=0;i<crowd.length;i++){
   const a=crowd[i],x=a.x-center,r=a.modelType==='child'?.19:.28;
   assert(platformRegions209(id).some(b=>a.z-r>=b.minZ-1e-6&&a.z+r<=b.maxZ+1e-6),'Body stays on an island');
   assert(!solids.some(b=>x>b.minX-r+1e-6&&x<b.maxX+r-1e-6&&a.z>b.minZ-r+1e-6&&a.z<b.maxZ+r-1e-6),'No passenger in stairs or pillars');
   for(let j=0;j<i;j++){const b=crowd[j],min=a.guardianId===b.id?.43:.60;assert(Math.hypot(a.x-b.x,a.z-b.z)>=min-1e-6,`${id} time ${time}: overlapping ${a.id}/${b.id}`);}
  }
 }
 console.log('210 PASS 900 distinct passengers, stairs/pillar clearance, 3 movement phases:',id);
}

console.log('210 CPU placement mean for 900 figures (not a GPU/FPS measurement):', (placementMs/15).toFixed(2),'ms');
