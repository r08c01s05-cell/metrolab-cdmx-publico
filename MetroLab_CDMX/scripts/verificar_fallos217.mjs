import './node-textures40.mjs';
import assert from 'node:assert/strict';import fs from 'node:fs';
import {FAULT_CASES217,FAULT_SOURCES217,FaultClock217,sampleFault217} from '../dist/fault-catalog217.js';
import {loadFaultModel217} from '../dist/fault-model217.js';
import {trainAsset} from '../dist/depot86.js?v=212';
assert.equal(FAULT_CASES217.length,8);assert.equal(new Set(FAULT_CASES217.map(c=>c.id)).size,8);
for(const domain of ['train','substation'])assert.equal(FAULT_CASES217.filter(c=>c.domain===domain).length,4);
for(const c of FAULT_CASES217){assert(c.evidence&&c.inference&&c.pending);assert.equal(c.steps.length,4);for(const id of c.sources){const s=FAULT_SOURCES217[id];assert(s?.scope&&s?.locator);assert.equal(new URL(s.url).protocol,'https:');}for(let n=0;n<=100;n++){const s=sampleFault217(c.id,n/100);for(const v of Object.values(s.signals))assert(Number.isFinite(v)&&v>=0&&v<=1);assert.equal(s.alarm,n>=50);}assert.equal(sampleFault217(c.id,NaN).progress,0);}
assert.throws(()=>sampleFault217('not-a-case',.5));
const doors=sampleFault217('train-doors',.3);assert.equal(doors.signals.closed,0);assert.equal(doors.signals.permission,0);assert(doors.signals.command>0,'Command does not bypass the simulated interlock');
const coast=sampleFault217('train-supply',.55);assert.equal(coast.signals.supply,0);assert.equal(coast.signals.effort,0);assert(coast.signals.speed>0,'Loss of traction does not teleport a moving train to rest');
const battery=sampleFault217('sr-charger',.55);assert.equal(battery.signals.charger,0);assert.equal(battery.signals.bus,1,'Battery sustains control before the illustrated reserve depletion');
const heat=sampleFault217('sr-cooling',.8);assert.equal(heat.signals.supply,0);assert(heat.signals.heat>.7,'Thermal state does not disappear at disconnection');
for(const n of [0,20,50,75,100]){const s=sampleFault217('train-brake',n/100);assert(Math.abs(s.signals.electric+s.signals.friction-s.signals.total)<1e-9);}
for(const hz of [30,60,144]){const c=new FaultClock217();c.play();for(let n=0;n<=hz*8;n++)c.advance(n*1000/hz);assert(Math.abs(c.progress-.5)<1e-9,'Playback time independent of rendering FPS');c.pause();c.advance(20000);assert(Math.abs(c.progress-.5)<1e-9);c.play();c.advance(30000);assert(Math.abs(c.progress-.5)<1e-9);c.advance(31000,false);c.advance(50000);assert(Math.abs(c.progress-.5)<1e-9,'Hidden-tab time is not replayed');c.seek(.99);c.play();c.advance(51000);c.advance(52000);assert.equal(c.progress,1);assert(!c.playing);}
const native=fetch;globalThis.fetch=async(url,...args)=>{const file='dist/'+String(url).split('?')[0].replace(/^\.\//,'');return fs.existsSync(file)?new Response(fs.readFileSync(file)):native(url,...args);};
globalThis.document={createElement:()=>({getContext:()=>new Proxy({},{get:(o,k)=>o[k]||(()=>{})})})};
for(const id of ['NM22','NM79','MP82']){
 const source=await trainAsset(id),snapshots=[];source.traverse(o=>{if(o.isMesh){for(const m of Array.isArray(o.material)?o.material:[o.material])snapshots.push({o,geometry:o.geometry,material:m,color:m.color?.clone(),matrix:o.matrix.clone()});}});
 let disposed=0;const geometries=new Set(snapshots.map(s=>s.geometry));for(const g of geometries)g.addEventListener('dispose',()=>disposed++);
 const model=await loadFaultModel217('train',id);for(const c of FAULT_CASES217.filter(c=>c.domain==='train')){assert(model.targets.get(c.target)?.children.length,'Actual affected assembly exists: '+id+' '+c.target);assert(!model.bounds(c.target).isEmpty());model.tint(c.target,.5);model.tint(c.target,0);}
 model.dispose();assert.equal(disposed,0,'Study viewer never disposes borrowed fleet geometry');for(const s of snapshots){assert(s.o.matrix.equals(s.matrix));if(s.color)assert(s.material.color.equals(s.color),'False colour does not alter live/source materials');}
 console.log('217 PASS study-model isolation',id);
}
const station=await loadFaultModel217('substation');for(const c of FAULT_CASES217.filter(c=>c.domain==='substation')){assert(station.targets.get(c.target)?.children.length);assert(!station.bounds(c.target).isEmpty());station.tint(c.target,.5);}station.dispose();
console.log('217 PASS: eight sourced cases, causal indications, normalized signals, FPS-independent pause/seek/background playback, three actual trains and four substation assemblies; no maintenance actions.');
