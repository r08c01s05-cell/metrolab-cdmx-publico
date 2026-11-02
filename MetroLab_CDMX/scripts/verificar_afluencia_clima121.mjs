import fs from 'node:fs';import assert from 'node:assert/strict';
import {crowdCount,buildPassengerFrame,doorOpenness} from '../dist/passenger-flow.js';
import {buildNaturalPassengerFrame} from '../dist/passenger-journeys.js';
import {eligibleForReserved91} from '../dist/reserved-zone91.js';
await import('../dist/engine.js');
const data=JSON.parse(fs.readFileSync('dist/datos.json'));data.demanda_horaria=JSON.parse(fs.readFileSync('dist/demanda_horaria.json'));data.demanda_documentada=JSON.parse(fs.readFileSync('dist/documentacion/afluencia-resumen.json'));
const e=new globalThis.MetroEngine(data),s=e.lines[1].stations.find(s=>s.id==='L1-01'),t=e.trains[0];
assert.equal(e.demandMode,'hourly');assert.equal(e.stationRate(s)*3600,14000);assert.match(e.demandInfo(s).label,/Excel/);
for(const queue of [0,10,100,300,625,900]){
 t.load=0;const options={engine:e,train:t,stationCenter:t.position,queue,portals:[],plan:null,elapsed:0,visibleStation:true,motionTime:2,running:false},actors=buildPassengerFrame(options);
 assert.equal(actors.length,queue);assert.equal(new Set(actors.map(a=>a.id)).size,queue);
 for(const a of actors){assert(Math.abs(a.z)>=4.2&&Math.abs(a.z)<9);assert(Math.abs(a.x-t.position)<68);if(a.guardianId)assert(actors.some(b=>b.id===a.guardianId));if(!eligibleForReserved91(a))assert((a.x-t.position)*(-Math.sign(a.z))<=20);}
 if(queue===625){for(const side of [-1,1]){const set=actors.filter(a=>Math.sign(a.z)===side);assert(set.length>250);for(let i=0;i<6;i++)assert(set.some(a=>a.x-t.position>=-66+i*22&&a.x-t.position< -44+i*22),'Full platform distribution');}assert.equal(buildNaturalPassengerFrame(options,new Map()).length,625);}
}
e.startHour=8;e.reset();const peak=e.waiting[s.id];e.startHour=22;e.reset();const low=e.waiting[s.id];assert.equal(peak,625);assert.equal(low,75);assert(crowdCount(peak)>crowdCount(low)*5);assert.equal(crowdCount(10000),900);
function trip(line,rain){const engine=new globalThis.MetroEngine(data),train=engine.trains.find(t=>t.line===line),l=engine.lines[line];engine.trains=[train];train.position=l.distances[2];train.target=3;train.direction=1;train.wait=0;train.speed=0;engine.setWeather(rain?'rain':'dry','line',35);let seconds=0;while(!train.wait&&seconds<1000){engine.step(.1);seconds+=.1;}assert(seconds<1000);return{engine,train,seconds};}
for(const line of [1,8]){const dry=trip(line,false),wet=trip(line,true);assert(wet.seconds>dry.seconds*1.2);assert.equal(wet.train.stopDwell,37.5);wet.train.wait=wet.train.stopDwell-2;assert.equal(doorOpenness(wet.engine,wet.train),1);wet.engine.setWeather('dry');assert.equal(wet.train.stopDwell,30);assert.equal(wet.train.wait,28);console.log('L'+line,{dry:dry.seconds.toFixed(1),rain:wet.seconds.toFixed(1)});}
console.log('121: Excel default, 625 vs 75 waiting, exact families within budget, reserved area, both full platforms, 900 cap, natural composer, rain travel and dwell, elapsed door continuity.');
