import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {initial173,all173,calculate173,factorAmbient173,factorGroup173,drop173,csv173} from '../dist/cable173.js';
import {circuits171} from '../dist/electrical171.js';
import {pdf173,svg173,drawing173} from '../dist/installation173.js';
const state=initial173(),c=circuits171.find(c=>c.id==='C09'),run=s=>calculate173(c,{...state.C09,...s});
assert.equal(factorAmbient173(40,90),.91);assert.equal(factorAmbient173(60,75),.58);assert.equal(factorGroup173(6),.8);assert.equal(factorGroup173(9),.7);assert.equal(factorGroup173(41),.35);
let r=run({nominal:16,continuous:100,length:0,terminal:'60'});assert.equal(r.design,20);assert.equal(r.ocp,20);assert.equal(r.section,3.31);assert.equal(r.pe[0],3.31);assert.equal(r.corrected,20);
const hot=run({nominal:16,continuous:100,length:0,terminal:'60',ambient:50,group:9});assert(hot.section>r.section);assert(hot.corrected>=20);assert.equal(hot.kt,.82);assert.equal(hot.kg,.7);
const long=run({nominal:16,continuous:100,length:200,terminal:'60'});assert(long.section>r.section);assert(long.pe[0]>r.pe[0]);assert(long.dropPct<=3);assert.equal(drop173({...state.C09,length:0},3.31),0);
assert.equal(run({nominal:0}).status,'Entrada inválida');assert.equal(run({ambient:90}).status,'Sin selección');
const motor=all173(state).find(r=>r.id==='C08');assert.equal(motor.design,6.25);assert.equal(motor.ocp,15);assert.equal(motor.overload,5.75);
const mt=all173(state).find(r=>r.id==='C01');assert(mt.status.includes('manual'));assert.equal(mt.ampBase,150);assert(mt.warnings.some(w=>w.includes('NO se utiliza la tabla')));
assert(run({raceway:'Charola'}).warnings.some(w=>w.includes('No se aplica 40')));
for(const r of all173(state)){if(r.id!=='PE01'){assert(r.section,r.id);assert(r.design>0,r.id);assert(r.ocp>0,r.id);assert(r.rows.length>15,r.id);}}
assert(csv173(all173(state)).startsWith('\uFEFF'));assert.equal(all173(state).length,14);
await fs.writeFile('assets-source/integracion174/Unifilar_Cedulas_R173.pdf',pdf173(state));await fs.writeFile('assets-source/integracion174/unifilar173.svg',svg173(state));await fs.writeFile('assets-source/integracion174/results173.json',JSON.stringify(all173(state),null,2));await fs.writeFile('assets-source/integracion174/results173.csv',csv173(all173(state)));
console.log('PASS: continuous current, hot/grouped conductors, VD upsize + proportional PE, 14 circuits, motor/MT/manual guards, CSV/PDF/SVG');console.log(all173(state).map(r=>({id:r.id,section:r.section,ocp:r.ocp,design:r.design,drop:r.dropPct})));console.log('Entities',drawing173(state).length);
