// Laboratorio jugable 229: preguntas del reto, estrellas y cuarto de equipos.
import assert from 'node:assert/strict';
import * as T from 'three';
import {question229,stepFor229,stars229} from '../dist/fault-hud229.js';
import {FAULT_CASES217} from '../dist/fault-catalog217.js';
import {FaultStage225} from '../dist/fault-stage225.js';
let n=0;
for(const c of FAULT_CASES217)for(const variant of ['reference','unprotected','slide'])for(const phase of [1,2,3]){
 const q=question229(c.id,variant,phase);n++;
 assert.equal(q.options.length,3,'Tres opciones '+c.id+phase);assert.equal(new Set(q.options).size,3,'Opciones distintas');
 assert.equal(q.options[q.answer],stepFor229(c.id,variant,phase),'La respuesta correcta es el paso real');
 assert.deepEqual(question229(c.id,variant,phase),q,'Mismo orden cada vez');
 for(const o of q.options)if(o!==q.options[q.answer])assert(FAULT_CASES217.some(x=>x.domain===c.domain&&x.id!==c.id&&x.steps.includes(o)),'Distractores del mismo ámbito');
}
assert.match(stepFor229('sr-cooling','unprotected',3),/no actúa/,'La variante sin protección cambia la respuesta final');
assert.equal(stars229(3,3),3);assert.equal(stars229(2,3),2);assert.equal(stars229(0,3),0);assert.equal(stars229(0,0),0);
const scene=new T.Scene(),stage=new FaultStage225(scene),box=new T.Box3(new T.Vector3(-3,0,0),new T.Vector3(3,2.5,3));
stage.fit([box],box,{pad:2,height:4});const room=stage.room.userData.bounds229;
assert(room.containsBox(box),'El equipo queda dentro del cuarto');assert.equal(room.max.y-room.min.y,4);
for(const name of ['Muro de block pintado229','Plafón229','Puerta229','Extintor229'])assert(stage.room.getObjectByName(name),'Cuarto con '+name);
const before=stage.room.children.length;stage.fit([box],box,{pad:2,height:4});assert.equal(stage.room.children.length,before,'Reconstruir no duplica el cuarto');
assert(!scene.fog,'Dentro del cuarto no hay niebla');stage.dispose();assert(!scene.getObjectByName('Cuarto de equipos229'));
console.log(`229 PASS: ${n} preguntas de reto con respuesta real y distractores del mismo ámbito, estrellas, cuarto de equipos cerrado y sin duplicados. CPU/DOM.`);
