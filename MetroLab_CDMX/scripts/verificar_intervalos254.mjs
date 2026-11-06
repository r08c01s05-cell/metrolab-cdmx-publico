import assert from 'node:assert/strict';
import {substationPlan94,wallSpans94} from '../dist/substations94.js';
import {rectifierAnchors252} from '../dist/energy-flow249.js';
for(const number of [1,8]){const distances=[0,650,1900,2800,4100],line={distances,stations:distances.map((_,i)=>({id:'L'+number+'-'+i,linea:number,nombre:'Estación '+i,entorno_visual:{tipo:i>2?'superficial':'subterraneo'}}))},plan=substationPlan94(line);assert.equal(plan.length,number===1?10:5);assert.equal(new Set(plan.map(p=>p.id)).size,plan.length);
 for(let segment=0;segment<4;segment++){const rooms=plan.filter(p=>p.segment===segment).sort((a,b)=>a.x-b.x),points=[distances[segment],...rooms.map(r=>r.x),distances[segment+1]],step=(points.at(-1)-points[0])/(rooms.length+1);for(let i=1;i<points.length;i++)assert(Math.abs(points[i]-points[i-1]-step)<1e-8);for(const r of rooms)assert(r.x-r.width/2>distances[segment]&&r.x+r.width/2<distances[segment+1]);for(const side of [-1,1])for(const [a,b]of wallSpans94(distances[segment],distances[segment+1],side,plan))assert(a<=b);}
 const anchors=rectifierAnchors252(plan.map(p=>({userData:p,position:{x:p.x,z:p.side*4.6}})));assert.deepEqual(anchors.map(a=>a.x),plan.map(p=>p.x));assert.deepEqual(anchors.map(a=>a.side),plan.map(p=>p.side));
}
console.log('254 PASS: equal gaps including station endpoints on L1/L8, counts and IDs retained, no local overlaps with station centres, SR anchors follow locals.');
