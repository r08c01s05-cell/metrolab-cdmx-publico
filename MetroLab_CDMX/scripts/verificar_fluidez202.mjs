import assert from 'node:assert/strict';
import * as T from 'three';
import {RenderBudget101} from '../dist/render-budget101.js';
import {setVisual105} from '../dist/visual-settings105.js?v=105';
import {selectDetailed121} from '../dist/instanced-passengers121.js';
for(const quality of ['balanced','performance']){setVisual105({quality});for(const hz of[60,120,144]){const budget=new RenderBudget101({setPixelRatio(){}});let count=0;for(let i=0;i<hz*2;i++)if(budget.allows(Math.round(i*10000/hz)/10))count++;assert(Math.abs(count-(quality==='performance'?60:120))<=1,quality+' keeps its cadence on '+hz+' Hz displays: '+count);budget.allows(50000);assert(Number.isFinite(budget.next202),'Background gap starts a fresh schedule');}}
setVisual105({quality:'balanced'});
const camera=new T.PerspectiveCamera();camera.position.set(0,2.83,0);const actors=Array.from({length:632},(_,i)=>({id:'flow:'+i,x:i*.2-60,z:i%2?5:-5,flow:true})),ids=selectDetailed121(actors,camera,24);assert.equal(ids.size,24,'Boarding flows share the fixed 24-skeleton budget');assert([...ids].every(id=>Math.abs(actors.find(a=>a.id===id).x)<4),'Closest people keep full detail');assert.equal(actors.length,632,'Rendering choices never remove simulated passengers');
console.log('202 PASS: balanced/performance cadence survives rounded 60/120/144 Hz timestamps and background gaps; 632 moving actors retain identities with at most 24 nearby full skeletons. CPU scheduling, not measured GPU FPS.');
