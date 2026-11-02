import assert from 'node:assert/strict';
import {circuits171,deviceFunctions196,drawing171} from '../dist/electrical171.js';
import {initial173,all173,csv173} from '../dist/cable173.js';
import {drawing173,svg173,pdf173} from '../dist/installation173.js';
import {dxf168} from '../dist/substation-cad168.js';

// Device numbers must remain appropriate to the current on their actual branch,
// and all three vector exports must use the same drawing, not a stale legend.
const state=initial173(),drawing=drawing173(state),expected=[
 ['89-1',89,'C01'],['52-1',52,'C01'],['72-CD',72,'C04'],['52-AUX',52,'C06']
];
assert.deepEqual(deviceFunctions196.map(d=>[d.tag,d.number,d.circuit]),expected);
for(const [tag,number,circuit] of expected){
 const entities=drawing.filter(e=>e.device196===tag),label=entities.find(e=>e.t==='T');
 assert(label?.s.startsWith(tag),tag+' appears beside its symbol');
 assert(entities.some(e=>e.t==='L'),tag+' has a drawn symbol');
 assert(entities.every(e=>e.c===circuit),tag+' opens the linked circuit');
 assert.equal(state[circuit].phases===0,number===72,'AC/DC function matches branch '+tag);
}
const disconnect=drawing.filter(e=>e.device196==='89-1');
assert(disconnect.filter(e=>e.t==='C').length===2,'Disconnect has two contact points');
assert(disconnect.some(e=>e.t==='L'&&e.x!==e.u&&e.y!==e.v),'Disconnect blade is open');
const svg=svg173(state),dxf=dxf168(state),pdf=Buffer.from(pdf173(state)).toString('latin1');
for(const [tag] of expected)for(const [format,text] of [['SVG',svg],['DXF',dxf],['PDF',pdf]])assert(text.includes(tag),format+' includes '+tag);
assert(!drawing.some(e=>e.t==='T'&&/QF-CD|Q-AUX|DS-1/.test(e.s)),'No mixed IEC-style device tags remain in the unifilar');
assert(svg.includes('font-weight:600'),'Readability weight is preserved');
assert.equal(circuits171.length,14);assert.equal(all173(state).length,14);
assert(csv173(all173(state)).startsWith('\uFEFF'));
for(const c of circuits171)assert(drawing.some(e=>e.c===c.id),c.id+' remains selectable');
assert(drawing171().some(e=>e.t==='T'&&e.s.includes('bloques funcionales')),'Boxes are identified as functional equipment blocks');
console.log('196 PASS: 89 disconnect, 52 AC and 72 DC breakers, live circuit selection, common SVG/DXF/PDF symbols, 14 calculation circuits and readable labels.');
