import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {sampleOutcome218,variants218} from '../dist/fault-outcomes218.js';
import {stepFor229} from '../dist/fault-hud229.js';

const context = vm.createContext({console});
for (const file of ['engine.js','manual-driver.js']) {
 vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
}
const engine = new context.MetroEngine(JSON.parse(fs.readFileSync('dist/datos.json','utf8')));
for (const line of [1,8]) {
 engine.reset();
 for(let i=0;i<160;i++)engine.step(.25);
 const affected=engine.trains.find(t=>t.line===line&&t.speed>0);
 const other=engine.trains.find(t=>t.line!==line&&t.speed>0);
 assert(affected&&other);
 const startSpeed=affected.speed, otherPosition=other.position;
 assert(engine.startIncident271(line));
 assert(!engine.startIncident271(line===1?8:1));
 assert(!engine.clearIncident271());
 engine.step(.1);
 assert(affected.speed<startSpeed&&affected.speed>0);
 assert.notEqual(other.position,otherPosition);
 for(let i=0;i<120;i++)engine.step(.25);
 assert(engine.trains.filter(t=>t.line===line).every(t=>t.speed===0));
 assert.equal(engine.power[line],true);
 assert(engine.clearIncident271());
 engine.step(.25);
 assert(affected.speed>0);
}
assert.equal(variants218('train-person')[0][0],'fatal');
for (const p of [0,.2,.5,.75,1]) {
 const frame=sampleOutcome218('train-person',p,'fatal');
 assert(frame.outcome.fatal);
 assert.equal(frame.note,stepFor229('train-person','fatal',frame.phase));
 if(p>=.75){assert.match(frame.note,/fallecimiento/);assert.equal(frame.signals.blocked,1);}
}
assert(!sampleOutcome218('train-person',1,'reference').outcome.fatal);
console.log('271: frenado gradual, bloqueo por línea, reposición manual y variantes de Fallas verificados.');
