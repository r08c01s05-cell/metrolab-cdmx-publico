import assert from 'node:assert/strict';
import {MaintenanceSession102} from '../dist/maintenance-session102.js';
import {RenderBudget101} from '../dist/render-budget101.js';
const session=new MaintenanceSession102();session.reset('electrical');
const s=session.state;
for(let guard=0;guard<150&&s.stage<6;guard++){const next=session.expected()[0];assert(next,'Exercise always exposes an action');session.action(next);}
assert.equal(s.stage,6);assert(s.lampVerified);assert(!s.complete,'24 V does not finish with leads attached');assert(s.probes.red&&s.probes.black);
assert.deepEqual(s.verifiedReadings.map(r=>r.value),['0.0 V','OL','24.0 V']);
session.action('removeRedProbe');assert.equal(s.stage,6);assert(!s.complete);assert.equal(s.probes.red,null);assert(s.probes.black);
session.action('removeBlackProbe');assert.equal(s.stage,7);assert(s.complete);assert(!s.probes.red&&!s.probes.black);assert.equal(s.verifiedReadings.length,3);
session.action('clearProbes');assert(s.complete,'Repeated cleanup is harmless');session.reset('electrical');assert.equal(s.verifiedReadings.length,0);
for(let guard=0;guard<150&&!s.complete;guard++)session.action(session.expected()[0]);assert(s.complete);assert(!s.probes.red&&!s.probes.black);
const renderer={setPixelRatio(v){this.ratio=v;},toneMappingExposure:1},budget=new RenderBudget101(renderer,{fps:30});let now=0;budget.allows(now);const target=budget.ratio;
for(let i=0;i<24;i++)budget.allows(now+=65);assert(budget.ratio<target,'Slow frames lower resolution');const reduced=budget.ratio;
budget.allows(now+=5000);assert.equal(budget.ratio,reduced,'Background gaps do not cause recovery');
for(let i=0;i<180*10;i++)budget.allows(now+=1000/30);assert.equal(budget.ratio,target,'Stable rendering restores original resolution');assert(!budget.reduced);assert.equal(budget.fps,30);assert(!budget.allows(now+1),'Frame cap remains active');
console.log('123: seven-stage electrical flow, individual/bulk lead removal, retained readings/reset, resolution recovery and frame cap.');
