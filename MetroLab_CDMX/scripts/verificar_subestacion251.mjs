// Subestación 251: detalle de componentes y holgura de puertas (ninguna hoja abierta se cruza con
// otra ni con un equipo).
globalThis.self??=globalThis;globalThis.createImageBitmap??=async()=>({width:1,height:1,close(){}});
import assert from 'node:assert/strict';import fs from 'node:fs';import zlib from 'node:zlib';import * as THREE from 'three';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {detailSubstation251} from '../dist/substation-detail251.js';
import {limitDoorSwing251,leaf251,MIN_OPEN251,MARGIN251} from '../dist/door-clearance251.js';
const buf=zlib.gunzipSync(fs.readFileSync(new URL('../dist/models/revision142/subestacion142.glb.gz',import.meta.url)));
const m=(await new GLTFLoader().parseAsync(buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength),'')).scene;m.updateMatrixWorld(true);
const parts=new Map(['mt','transformer','rectifier','dc','control','battery','civil'].map(id=>[id,m.getObjectByName(id)]));
const r=detailSubstation251(m,parts);
for(const [id,n] of Object.entries({mt:9*8,rectifier:12*3,dc:2*8+2*3,battery:16*7,control:1,transformer:3,civil:2}))assert(r[id]>=n,'Detalle agregado en '+id+': '+r[id]);
assert.equal(detailSubstation251(m,parts),r,'El detalle se agrega una sola vez');
let found=0;m.traverse(o=>{if(o.isMesh&&o.name==='Campana_terminal251')found++;});assert.equal(found,27,'Tres campanas por cada una de las 9 terminales de MT');
const doors=[];m.traverse(o=>{if(!o.isMesh&&o.name.includes('Puerta')&&o.name.includes('abatida'))doors.push(o);});assert.equal(doors.length,11);
const rows=doors.map(d=>{const row={door:d,label:d.name,closed:new THREE.Quaternion(),opened:d.quaternion.clone()};d.quaternion.identity();return row;}).sort((a,b)=>a.door.position.x-b.door.position.x);m.updateMatrixWorld(true);
const report=limitDoorSwing251(rows,m);
assert(report.some(x=>/abatida003$/.test(x.label)),'La puerta del rectificador abre menos para no cruzarse con el resguardo del transformador');
assert(report.some(x=>/138002$/.test(x.label)),'La de servicios auxiliares no llega al extintor');
assert(report.every(x=>x.degrees>=MIN_OPEN251),'Ninguna abre menos de 80°');
const segs=rows.map(row=>leaf251(row,1));const dist=(a,b,c,d)=>{const s=(p,q,r)=>{const v=q.clone().sub(p),t=Math.max(0,Math.min(1,r.clone().sub(p).dot(v)/v.lengthSq()));return p.clone().addScaledVector(v,t).distanceTo(r);};return Math.min(s(a,b,c),s(a,b,d),s(c,d,a),s(c,d,b));};
for(let i=0;i<segs.length;i++)for(let j=i+1;j<segs.length;j++)assert(dist(segs[i].a,segs[i].b,segs[j].a,segs[j].b)>=MARGIN251-1e-6,'Hojas abiertas separadas: '+rows[i].label+' / '+rows[j].label);
console.log('251 PASS: terminales de MT, sensores del transformador, redes RC, shunt y zapatas de CD, pilotos de control, tapones y niveles de baterías, tapetes aislantes; puertas sin cruzarse al abrir ('+report.map(x=>Math.round(x.degrees)+'°').join(', ')+').');
