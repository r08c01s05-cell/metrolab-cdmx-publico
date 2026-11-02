import assert from 'node:assert/strict';
import{SubstationMaintenance128}from'../dist/substation-maintenance-state128.js';
import{MaintenanceSession102}from'../dist/maintenance-session102.js';
import{readingParts146}from'../dist/instrument-readout146.js';
let timed=0;for(const id of ['ventilation','control','battery','diodes','insulation','relay']){
 const s=new SubstationMaintenance128();s.start(id);let guard=160;
 while(!s.done&&guard--){const step=s.step;s.choose(step.tool);const before=s.index,r=s.act(step.target);assert(r.ok,id+' '+s.feedback);
  if(r.pending){timed++;assert.equal(s.index,before);const leads={...s.leads};assert(!s.releaseProbes().ok);assert.deepEqual(s.leads,leads);s.advance148(.1);assert.equal(s.index,before);let clock=200;while(s.pending148&&clock--)s.advance148(.1);assert(clock>0);assert.equal(s.index,before+1);}
 }
 assert(s.done,id+' finishes');assert(!s.charge148&&!s.pending148);
 if(id==='insulation'){assert.equal(s.log.length,3);assert(s.log.every(r=>r.time==='60 s simulados'));assert.equal(s.effects.filter(e=>e==='discharge148').length,3);assert(s.trace148.length>30);}
 if(id==='battery'){assert(s.log.some(r=>r.value==='120.0 mV · 10.0 A'));assert(s.log.some(r=>r.value==='12.0 mV · 10.0 A'));assert(s.isolated148&&!s.load148);assert.deepEqual(s.leads,{red:null,black:null});}
 if(id==='control')assert(s.effects.indexOf('isolate148')<s.effects.indexOf('open'));
 console.log('148 procedure PASS',id,s.mission.steps.length,'actions');
}
assert.equal(timed,6);assert.equal(readingParts146('120.0 mV · 10.0 A').unit,'mV');assert.equal(readingParts146('Descarga 50 % · puntas conectadas').value,'50 %');
const wheel=new MaintenanceSession102();wheel.reset('running');wheel.action('power');wheel.action('stand');assert.deepEqual(wheel.expected(),['wheel']);wheel.action('wheel');assert(wheel.state.wheelInspected148&&!wheel.state.selectedItem);while(wheel.state.stage<3)wheel.action(wheel.expected()[0],1);const order=[];while(wheel.state.stage===3){const next=wheel.expected()[0];order.push(next);wheel.action(next,1);}assert.deepEqual(order,['bolt1','bolt5','bolt3','bolt7','bolt2','bolt6','bolt4','bolt8']);
console.log('148: timed readings and discharge, mV/10A comparison, isolation, probe locks, inspection and cross fastening.');
