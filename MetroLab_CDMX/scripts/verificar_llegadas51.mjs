import fs from 'node:fs';import assert from 'node:assert/strict';import '../dist/engine.js';import {predictArrivals,arrivalRows} from '../dist/arrival-displays.js';
const e=new globalThis.MetroEngine(JSON.parse(fs.readFileSync('dist/datos.json')));const original=JSON.stringify(e);const start=performance.now();const p=predictArrivals(e,900);assert.equal(JSON.stringify(e),original,'predicción muta el motor');
let checks=0;const actual=new Map();for(const t of e.trains)if(t.wait>0)actual.set(`${t.line}:${t.target}:${t.direction}`,0);
for(let sec=1;sec<=900;sec++){const before=e.trains.map(t=>t.wait>0);e.step(1);e.trains.forEach((t,i)=>{if(!before[i]&&t.wait>0){const key=`${t.line}:${t.target}:${t.direction}`;if(!actual.has(key))actual.set(key,sec);}});}
for(const [key,seconds]of actual){assert.equal(p.arrivals.get(key)?.[0].seconds,seconds,key);checks++;}
e.emergency=true;assert.equal(arrivalRows(predictArrivals(e),1,0,1,true)[0],'SERVICIO DETENIDO');e.emergency=false;assert.equal(arrivalRows(p,8,0,1,false)[0],'SERVICIO DETENIDO');
console.log({firstArrivalsCompared:checks,unchangedEngine:true,elapsedMs:Math.round(performance.now()-start)});
