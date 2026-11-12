// Mando y control 262: puestos de mando, equipos telemandados, enclavamientos de 85 kV y
// coordinación de maniobras de una S.R., según el material del curso.
import assert from 'node:assert/strict';import fs from 'node:fs';
import {POSTS262,DEVICES262,CAUSES262,Maneuver262,canOperate262,telemando262} from '../dist/control262.js';
assert.deepEqual(POSTS262.map(p=>p.id),['pcc','pdc','sala','tcd','pcl','cee','local']);assert(/5\.º piso/.test(POSTS262[1].where));
const d=id=>DEVICES262.find(x=>x.id===id);for(const x of DEVICES262)assert(x.remote===null||POSTS262.some(p=>p.id===x.remote),'Cada telemando apunta a un puesto');
assert.equal(d('sr').remote,'pdc');assert.equal(d('oerlikon').modes.length,3,'Tres mandos del Oerlikon');assert.equal(d('srm').remote,null);assert.equal(d('dmt12').remote,'cee');assert.equal(d('iat').remote,'pcl');assert(/7 segundos/.test(d('dv').rule));
// Interlocks.
assert(!canOperate262('soule',{arrivalClosed:true}).ok);assert(canOperate262('soule',{arrivalClosed:false}).ok);
assert(!canOperate262('rotativo',{load:true}).ok&&canOperate262('rotativo',{load:false}).ok);assert(!canOperate262('srm',{}).ok&&canOperate262('srm',{busIsolated:true}).ok);assert(canOperate262('oerlikon',{load:true}).ok);
assert(telemando262().ok);assert(!telemando262({pilot:false}).ok&&/hilo piloto/.test(telemando262({pilot:false}).why));assert(!telemando262({flooded:true}).ok);
// Causes and maneuver order.
assert.deepEqual(CAUSES262.map(c=>c.id),['tierra','corto','grupo','piloto','mtto']);assert(CAUSES262[0].auto&&CAUSES262[1].auto&&!CAUSES262[2].auto);
{const m=new Maneuver262('Balbuena','tierra');assert(m.out&&m.telemando.ok);assert(!m.advance(3),'Los pasos van en orden');assert.equal(m.done,0);
 const sala=m.steps.findIndex(s=>/sala de interruptores/.test(s)),pdc=m.steps.findIndex(s=>/5\.º piso/.test(s));assert(sala>0&&pdc===sala+1,'Primero la sala de interruptores, luego el P.D.C.');
 while(!m.finished)assert(m.advance());assert(!m.out&&!m.advance());assert.equal(m.log.length,m.steps.length+1);}
{const m=new Maneuver262('Zaragoza','piloto');assert(!m.telemando.ok,'Sin hilo piloto no hay telemando');m.advance();m.advance();assert(m.telemando.ok);}
assert(/T\.C\.D\./.test(CAUSES262[2].steps[0]));assert.throws(()=>new Maneuver262('X','nada'));
// Panel wiring.
const g=fs.readFileSync(new URL('../dist/grid-substation256.js',import.meta.url),'utf8');assert(/\['mando','Mando: P\.C\.C\. y P\.D\.C\.'\]/.test(g)&&/html_mando\(\)/.test(g)&&/bind_mando\(\)/.test(g));
assert(/realOnly262&&\(id==='battery'\|\|id==='fire'\)/.test(fs.readFileSync(new URL('../dist/rectifier-view126.js',import.meta.url),'utf8')));
console.log('262 PASS: 7 puestos de mando, 10 equipos con su telemando, enclavamientos de 85 kV, telemando por hilo piloto y 5 causas con su coordinación de maniobras en orden.');
