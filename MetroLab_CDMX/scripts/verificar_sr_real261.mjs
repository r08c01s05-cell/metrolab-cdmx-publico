// S.R. real 261: grupos de la subestación de rectificación según el material del curso, zonas y
// subestaciones de la Línea 1, y qué de la maqueta existe.
import assert from 'node:assert/strict';
import {SR_GROUPS261,MODEL_CHECK261,L1_ZONES261,L1_SR261,L1_CS261,srPositions261,feedersAt261,zonesFed261,BUEN_TONO261,RING261} from '../dist/sr-real261.js';
import {SR_PARTS126} from '../dist/rectifier-model126.js';
import {STAGES250} from '../dist/power-flow250.js';

assert.deepEqual(SR_GROUPS261.map(g=>g.id),['intersec','transformer','rectifier','dur','sec5000','control','fan','cs']);
const g=id=>SR_GROUPS261.find(x=>x.id===id);
assert(/571 V/.test(g('transformer').data)&&/2,750 kVA/.test(g('transformer').data));assert(/168 diodos/.test(g('rectifier').data));assert(/5,000 A/.test(g('dur').data)&&/1,800 V/.test(g('dur').data));assert(/220 V/.test(g('intersec').data));
// Table 3.1 and 3.2.
assert.deepEqual(L1_ZONES261.map(z=>z.zone+':'+z.sr.length),['A:2','B:3','C:2','D:2','E:4','F:4']);assert.equal(L1_SR261.length,17);
assert.deepEqual(L1_CS261.map(c=>c.between+'@'+c.at),['A-B@Pablo Fierro','B-C@Balbuena','C-D@Candelaria','D-E@Salto del Agua','E-F@Constituyentes']);
// Positions on the simulator's Line 1.
const names=['Pantitlán','Zaragoza','Gómez Farías','Boulevard Puerto Aéreo','Balbuena','Moctezuma','San Lázaro','Candelaria','Merced','Pino Suárez','Isabel la Católica','Salto del Agua','Balderas','Cuauhtémoc','Insurgentes','Sevilla','Chapultepec','Juanacatlán','Tacubaya','Observatorio'];
const distances=[0,1470,2382,3143,3888,4741,5369,6385,7233,8128,8660,9255,9863,10422,11365,12160,12811,13934,15242,16654],line={stations:names.map(n=>({nombre:n,linea:1})),distances};
const pos=srPositions261(line),by=n=>pos.find(p=>p.name===n);assert.equal(pos.length,17,'Las 17 S.R. quedan ubicadas');
assert.equal(by('Aeropuerto').x,3143,'Aeropuerto es Boulevard Puerto Aéreo');assert.equal(by('Juan Acatlán').x,13934);assert.equal(by('Pino Suárez 1').x,8128);
assert.equal(by('Pablo Fierro').x,735);assert(by('Pablo Fierro').approximate&&by('Constituyentes').approximate&&!by('Zaragoza').approximate);assert.equal(by('Constituyentes').x,(12811+13934)/2);
for(let i=1;i<pos.length;i++)assert(pos[i].x>=pos[i-1].x);
assert.deepEqual(srPositions261({stations:[{nombre:'Garibaldi',linea:8}],distances:[0]}),[],'Solo Línea 1');
// Feeders of a point.
{const f=feedersAt261(pos,2000);assert.equal(f.left.name,'Zaragoza');assert.equal(f.right.name,'Aeropuerto');assert.equal(f.zone,'B');
 const o=feedersAt261(pos,2000,new Set(['Zaragoza']));assert.equal(o.left.name,'Pablo Fierro','Con una S.R. fuera, alimenta la siguiente');assert.equal(feedersAt261(pos,16654).right,null);}
// Zones.
assert.equal(zonesFed261().fed.size,6);
{const r=zonesFed261(new Set(['Balbuena','San Lázaro']));assert(r.fed.has('C')&&r.tied.has('C')&&!r.own.has('C'),'Sin sus dos S.R., la zona C recibe por el C.S. de Candelaria (C-D)');}
{const r=zonesFed261(new Set(['San Lázaro','Balbuena']),new Set(['C-D']));assert(!r.fed.has('C'),'Sin S.R. propias y sin C.S. que la una, la zona C queda sin tensión');}
{const r=zonesFed261(new Set(['Candelaria','Pino Suárez 1']));assert(r.fed.has('D')&&r.tied.has('D'),'La zona D recibe por el C.S. de Salto del Agua (D-E)');
 const r2=zonesFed261(new Set(['Candelaria','Pino Suárez 1']),new Set(['D-E']));assert(!r2.fed.has('D'));}
// Model check covers the 12 parts and the part texts carry the real data.
assert.equal(MODEL_CHECK261.length,12);assert.deepEqual(MODEL_CHECK261.filter(c=>!c.real).map(c=>c.part),['battery','fire','cables','earth','civil']);
assert.deepEqual(SR_PARTS126.map(p=>p.id),['mt','transformer','rectifier','dc','control','battery','aux','cables','earth','civil','roof','fire']);
const part=id=>Object.values(SR_PARTS126.find(p=>p.id===id)).join(' ');assert(/Intersec/.test(part('mt'))&&/571 V/.test(part('transformer'))&&/168 diodos/.test(part('rectifier'))&&/D\.U\.R\./.test(part('dc'))&&/No documentado/.test(part('battery')));
assert(/571 V/.test(STAGES250[1].text)&&/D\.U\.R\./.test(STAGES250[3].text)&&!STAGES250.some(s=>/540/.test(s.text)));
assert.equal(BUEN_TONO261.transformers*BUEN_TONO261.mvaEach,154);assert.equal(RING261.length,6);
console.log('261 PASS: 8 grupos de la S.R. real (571 V, 168 diodos, D.U.R. 5,000 A), 17 S.R. de Línea 1 en 6 zonas con 5 C.S., ubicadas sobre la línea del simulador, alimentación por zona y revisión de las 12 piezas de la maqueta.');
