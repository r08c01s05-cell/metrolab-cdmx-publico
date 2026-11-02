import fs from 'node:fs';import assert from 'node:assert/strict';
import {crowdCount,platformWalk,buildPassengerFrame,planPassengerStop,doorOpenness} from '../dist/passenger-flow.js';
await import('../dist/engine.js');
const data=JSON.parse(fs.readFileSync('dist/datos.json'));data.demanda_horaria=JSON.parse(fs.readFileSync('dist/demanda_horaria.json'));
const e=new globalThis.MetroEngine(data),s=e.lines[1].stations.find(s=>s.id==='L1-01');
assert.equal(e.stationRate(s)*3600,14000);e.startHour=0;assert.equal(e.stationRate(s)*3600,300);
e.startHour=7;assert.equal(e.stationArrivals(s,3590,3610),(12500+14000)*10/3600);
e.startHour=8;e.reset();const peak=e.waiting[s.id];e.startHour=22;e.reset();const low=e.waiting[s.id];assert(crowdCount(peak)>crowdCount(low)*2);assert.equal(crowdCount(0),0);
for(let i=0;i<300;i++)e.step(.1);assert(Math.abs(e.arrivals-Object.values(e.waiting).reduce((a,b)=>a+b,0)-e.boarded)<1e-6);
e.startHour=8;e.reset();const train=e.trains[0];train.load=200;const center=train.position,portals=Array.from({length:36},(_,i)=>({x:center-65+i*3.6,z:-3.2})),plan=planPassengerStop(e,train,10000,portals);
const frame=(time,running=true)=>{train.wait=e.dwell-time;return buildPassengerFrame({engine:e,train,stationCenter:center,queue:10000,portals,plan,elapsed:time,visibleStation:true,motionTime:time,running});};
const a=frame(2),b=frame(6);const walker=a.find(p=>p.id==='wait:'+center+':0');const later=b.find(p=>p.id===walker.id);assert(Math.abs(walker.x-later.x)>2);
for(let t=0;t<30;t+=.1){const actors=frame(t);assert(actors.length<=1160);assert(actors.filter(a=>a.flow&&!a.guardianId).length<=plan.flows.length);for(const a of actors){assert(Number.isFinite(a.x+a.y+a.z+a.yaw));if(a.id.startsWith('wait:'))assert(Math.abs(a.z)>=4.2);if(a.flow&&a.moving)assert(doorOpenness(e,train)>=.95);}}
assert(frame(10,false).every(a=>!a.moving));
for(let t=0;t<36;t+=.05){const a=platformWalk(t,0);assert(a.offset>=-4&&a.offset<=4);assert(a.speed<=1.72);}
console.log('Afluencia Excel 08:00/22:00/00:00, cambio de hora, conservación, densidad, recorridos, pausa, puertas y presupuesto de 1160 figuras: correctos.');
