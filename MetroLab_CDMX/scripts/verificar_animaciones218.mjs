import './node-textures40.mjs';
import assert from 'node:assert/strict';import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {sampleOutcome218,variants218} from '../dist/fault-outcomes218.js';
import {FaultClock217} from '../dist/fault-catalog217.js';
import {loadFaultModel217} from '../dist/fault-model217.js';
import {FaultAnimation218} from '../dist/fault-animation218.js';
const sample=(id,p,v)=>sampleOutcome218(id,p,v).outcome;
assert(sample('sr-cooling',1).breakerOpen);assert.equal(sample('sr-cooling',1).damage,0);
assert(!sample('sr-cooling',1,'unprotected').breakerOpen);assert.equal(sample('sr-cooling',1,'unprotected').damage,1);
assert.equal(sampleOutcome218('sr-cooling',1,'unprotected').signals.supply,1);
assert.equal(sample('sr-cooling',.8).fanAngle,sample('sr-cooling',1).fanAngle,'Fan stays stopped after flow is lost');
assert.equal(sample('train-doors',1).distance,0);assert.equal(sample('train-doors',1).doorOpening,1);
assert.equal(sample('train-air',1).distance,0);
assert(sample('train-supply',1).moving);assert(sample('train-supply',1).distance>sample('train-supply',.8).distance);
assert(!sample('train-brake',1).moving);assert.equal(sample('train-brake',1).distance,sample('train-brake',.95).distance);
assert(sample('train-brake',1,'slide').moving);assert(sample('train-brake',1,'slide').sliding);
assert(sample('train-brake',1,'slide').distance>sample('train-brake',.7,'slide').distance);
assert.equal(sample('train-brake',1,'slide').wheelDistance,sample('train-brake',.7,'slide').wheelDistance);
for(const hz of [30,60,144]){const clock=new FaultClock217();clock.play();for(let i=0;i<=hz*8;i++)clock.advance(i*1000/hz);const actual=sample('train-brake',clock.progress,'slide'),expected=sample('train-brake',.5,'slide');assert(Math.abs(actual.distance-expected.distance)<1e-9);}
assert.equal(variants218('sr-cooling').length,2);
const native=fetch;globalThis.fetch=async(url,...args)=>{const file='dist/'+String(url).split('?')[0].replace(/^\.\//,'');return fs.existsSync(file)?new Response(fs.readFileSync(file)):native(url,...args);};
globalThis.document={createElement:()=>({getContext:()=>new Proxy({},{get:(o,k)=>o[k]||(()=>{})})})};
for(const id of ['NM22','NM79','MP82']){
 const model=await loadFaultModel217('train',id),scene=new T.Scene();scene.add(model.root);const before=[];model.root.traverse(o=>{if(o.isMesh)before.push({o,parent:o.parent,matrix:o.matrix.clone()});});
 let disposedBorrowed=0;for(const g of new Set(before.map(r=>r.o.geometry)))g.addEventListener('dispose',()=>disposedBorrowed++);
 const animation=new FaultAnimation218(model,'train',scene);assert.equal(animation.doors.length,2,'A real pair of complete leaves: '+id);assert.equal(animation.wheels.length,8,'Eight actual wheel rims: '+id);
 for(const d of animation.doors){assert(d.pivot.children.some(o=>/cristal/i.test(o.name)),'Window moves with leaf');assert(d.pivot.children.some(o=>/acero/i.test(o.name)),'Steel moves with leaf');}
 for(let cycle=0;cycle<3;cycle++){
  animation.apply(sampleOutcome218('train-doors',1));assert(animation.doors.every(d=>Math.abs(d.pivot.position.x-d.x)>.5));
  animation.apply(sampleOutcome218('train-brake',.7,'slide'));const angle=animation.wheels[0].pivot.rotation.z,x=model.root.position.x;
  animation.apply(sampleOutcome218('train-brake',1,'slide'));assert(model.root.position.x>x);assert.equal(animation.wheels[0].pivot.rotation.z,angle);
  animation.apply(sampleOutcome218('train-supply',.8));assert(animation.wheels[0].pivot.rotation.z!==angle);
  const bounds=animation.bounds();assert(bounds.containsBox(model.bounds()),'Full motion stays inside framing envelope');
  animation.apply(sampleOutcome218('train-doors',0));assert(animation.doors.every(d=>d.pivot.position.x===d.x));assert.equal(model.root.position.x,0);assert(animation.wheels.every(w=>w.pivot.rotation.z===0));
 }
 animation.dispose();assert.equal(disposedBorrowed,0);for(const r of before){assert.equal(r.o.parent,r.parent);assert(r.o.matrix.equals(r.matrix));}model.dispose();assert.equal(disposedBorrowed,0);assert.equal(scene.children.length,1);console.log('218 PASS geometry / restore / seek / ownership',id);
}
const model=await loadFaultModel217('substation'),scene=new T.Scene();scene.add(model.root);const effects=new FaultAnimation218(model,'substation',scene);
effects.apply(sampleOutcome218('sr-cooling',1,'unprotected'));assert(effects.fx225?.smoke.group.visible||effects.smoke.some(s=>s.o.visible&&s.o.material.opacity>0),'Humo visible en la variante sin protección (226: humo realista del ensayo de ventilación)');
effects.apply(sampleOutcome218('sr-cooling',1));assert(effects.smoke.every(s=>!s.o.visible));effects.dispose();model.dispose();
console.log('218 PASS: deterministic train translation, rolling/locked wheels, complete doors, stopped fans, open protection, hypothetical thermal damage; three seek/reset cycles per model.');
