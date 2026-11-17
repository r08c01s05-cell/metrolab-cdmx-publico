import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {sampleOutcome218} from '../dist/fault-outcomes218.js';
import {PERFILES270} from '../dist/perfiles270.js';
import {TrainDynamics257} from '../dist/train-dynamics257.js';
const ctx={console};ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync('dist/engine.js','utf8'),ctx);
const e=new ctx.MetroEngine(JSON.parse(fs.readFileSync('dist/datos.json','utf8')));
const t=e.trains.find(t=>t.line===8),line=e.lines[8];
assert.equal(e.rainScope,'exterior');
e.weather='rain';t.position=(line.distances[0]+line.distances[1])/2;
const wet=(track)=>TrainDynamics257.prototype.wet.call({track},e,t);
assert(!wet('auto'),'La lluvia no moja automáticamente un túnel');
e.rainScope='line';assert(e.weatherRestricted(t));assert(!wet('auto'),'Restricción operativa y adherencia física son distintas');
assert(wet('wet'),'La hipótesis manual de agua en túnel permanece disponible');
const i=line.stations.findIndex((s,i)=>s.entorno_visual?.tipo==='superficial'&&line.stations[i+1]?.entorno_visual?.tipo==='superficial');
assert(i>=0);t.position=(line.distances[i]+line.distances[i+1])/2;assert(wet('auto'));
e.weather='dry';assert(!wet('auto'));
assert.equal(PERFILES270.length,3);
let previous=-1;
for(let n=0;n<=100;n++) {
 const s=sampleOutcome218('train-person',n/100);
 assert(s.outcome.distance>=previous-1e-10);previous=s.outcome.distance;
 assert(s.outcome.distance<3,'El tren no alcanza a la figura ubicada seis metros más allá del extremo original');
 if(n>=20){assert.equal(s.signals.supply,0);assert.equal(s.signals.blocked,1);}
 if(n>=60){assert.equal(s.signals.speed,0);assert(!s.outcome.moving);}
 assert.equal(s.outcome.damage,0);assert.equal(s.outcome.doorOpening,0);
}
for(const p of [1,.7,.2,0,.5,1,0]) {
 const a=sampleOutcome218('train-person',p),b=sampleOutcome218('train-person',p);
 assert.deepEqual(a,b,'Pausa, búsqueda y ciclos reproducibles por tiempo absoluto');
}
console.log('270: perfiles, lluvia por exposición, bloqueo, frenado sin impacto y reinicio verificados.');
