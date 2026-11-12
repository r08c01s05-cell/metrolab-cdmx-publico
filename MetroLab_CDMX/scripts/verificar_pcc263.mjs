// P.C.C. 263: modo eléctrico de cada tren, balance de energía con regeneración, zonas de
// tracción y retención en estación sobre el motor real del simulador (sin modificarlo).
import fs from 'node:fs';import assert from 'node:assert/strict';
import {trainMode263,snapshot263,HoldBook263,MODES263,ASSUMED263} from '../dist/pcc263.js';
import {ZONE_STATE261} from '../dist/sr-real261.js';
await import('../dist/engine.js');
const data=JSON.parse(fs.readFileSync('dist/datos.json'));
const mk=()=>new globalThis.MetroEngine(data);
assert.equal(trainMode263(0,0),'detenido');assert.equal(trainMode263(10,1),'traccion');assert.equal(trainMode263(10,-1),'regenera');assert.equal(trainMode263(10,0),'deriva');assert.equal(trainMode263(0,1.2),'traccion');assert.deepEqual(Object.keys(MODES263),['traccion','deriva','regenera','detenido']);
// Snapshot on the real engine.
{const e=mk(),memo=new Map();let s=snapshot263(e,1,memo,{out:new Set(),open:new Set()});assert.equal(s.rows.length,e.fleet);assert.equal(s.positions.length,17);assert(s.rows.every(r=>r.zone&&r.zoneLive));
 let sawT=false,sawR=false,sawBack=false;for(let i=0;i<4000;i++){e.step(.2);s=snapshot263(e,1,memo,{out:new Set(),open:new Set()});for(const r of s.rows){if(r.mode==='traccion'){sawT=true;assert(r.drawKW>180,'En tracción pide más que los auxiliares');}if(r.mode==='regenera'){sawR=true;assert(r.brakeKW>0);assert(Math.abs(r.regenKW+r.rheoKW-r.brakeKW)<1e-6,'Lo frenado va a la barra o a resistencias');}}
  const T=s.totals;assert(T.regenKW<=T.demandKW+1e-6,'No regresa más de lo que otros consumen');assert(Math.abs(T.srKW-(T.demandKW-T.regenKW))<1e-6);if(T.regenKW>1)sawBack=true;}
 assert(sawT&&sawR&&sawBack,'En un recorrido hay tracción, frenado y energía devuelta a otro tren');}
// A lone braking train has no receiver: everything goes to resistors.
{const e=mk();e.trains=e.trains.filter(t=>t.line===1).slice(0,1);const t=e.trains[0],memo=new Map();t.wait=0;t.speed=15;snapshot263(e,1,memo);e.time+=1;t.speed=13.5;const s=snapshot263(e,1,memo);assert.equal(s.rows[0].mode,'regenera');assert.equal(s.rows[0].regenKW,0);assert(s.rows[0].rheoKW>0);}
// Zones: both S.R. of zone C out and C.S. open → trains there see a dead zone.
{const e=mk(),zones={out:new Set(['Balbuena','San Lázaro']),open:new Set(['B-C','C-D'])},t=e.trains.find(t=>t.line===1);t.position=e.lines[1].distances[5];const s=snapshot263(e,1,new Map(),zones),r=s.rows.find(r=>r.id===t.id);assert.equal(r.zone,'C');assert(!r.zoneLive&&!s.fed.has('C'));assert.equal(r.drawKW,0,'Sin tensión no toma potencia');
 const h=new HoldBook263();h.setAuto(s.rows);assert.equal(h.auto.has(t.id),r.inStation);}
assert.equal(snapshot263(mk(),8).positions.length,0,'Línea 8 sin S.R. documentadas');
// Holding: a held train stays at its station; released, it leaves. Others keep running.
{const e=mk(),h=new HoldBook263(),t=e.trains.find(t=>t.line===1),o=e.trains.filter(x=>x.line===1)[1];assert(t.wait>0);const pos=t.position;h.toggle(t.id);
 for(let i=0;i<1500;i++){h.apply(e);e.step(.2);}assert.equal(t.position,pos,'Retenido 300 s: no sale');assert.equal(t.speed,0);assert(o.stops>0,'Los demás trenes siguen');assert.equal(t.state,'En estación');
 h.toggle(t.id);assert(!h.held(t.id));for(let i=0;i<400;i++){h.apply(e);e.step(.2);}assert.notEqual(t.position,pos,'Liberado: reanuda');}
// A held train in motion is only held once it stops; the operator's train is never touched.
{const e=mk(),h=new HoldBook263(),t=e.trains.find(t=>t.line===1);t.wait=0;t.speed=5;h.toggle(t.id);assert.equal(h.apply(e),0);t.wait=3;e.operator={trainId:t.id};assert.equal(h.apply(e),0);assert.equal(t.wait,3);e.operator=null;assert.equal(h.apply(e),1);assert.equal(t.wait,ASSUMED263.holdSeconds);}
assert.equal(ZONE_STATE261.out.size,0);
const src=fs.readFileSync('dist/pcc263.js','utf8');assert(!/engine\.(step|reset|speedLimit)\s*=/.test(src)&&!/prototype/.test(src),'No parcha el motor');
console.log('263 PASS: modos motor/inercia/generador, balance con regeneración entre trenes y resistencias, zonas sin tensión, retención y liberación en estación sobre el motor real.');
