// Guante dieléctrico 230: mano generic-hand (W3C) montada sobre el rig del guante existente.
import assert from 'node:assert/strict';
import * as T from 'three';
import {createDielectricHand230,FINGER_MAP230} from '../dist/dielectric-glove230.js';
const h=createDielectricHand230();h.root.updateMatrixWorld(true);
const at=i=>h.bones[i].getWorldPosition(new T.Vector3());
// Nudillo del índice en el mismo lugar que el del rig anterior (palm104: -.041, .206, 0).
assert(at(6).distanceTo(new T.Vector3(-.041,.206,0))<.004,'El índice nace donde estaba el del guante anterior');
assert(at(14).y>at(10).y+.08,'Los dedos apuntan hacia +y como en el rig');
const open=at(14).clone(),straight=Array.from({length:5},()=>Array.from({length:3},()=>({rotation:{x:0}})));
const curled=Array.from({length:5},()=>Array.from({length:3},()=>({rotation:{x:.9}})));
h.follow(curled);h.root.updateMatrixWorld(true);const closed=at(14);
assert(closed.z>open.z+.05&&closed.y<open.y-.03,'Al cerrar, la punta del medio va hacia la palma (+z)');
h.follow(straight);h.root.updateMatrixWorld(true);assert(at(14).distanceTo(open)<1e-6,'Al abrir vuelve a la pose original');
assert.equal(FINGER_MAP230.length,5,'Los cinco dedos del rig tienen equivalente');
for(const name of ['Protector de cuero sobre guante aislante230','Puño de hule aislante230','Manga de camisa de trabajo230'])assert(h.root.getObjectByName(name),'Incluye '+name);
assert.equal(h.root.getObjectByName('Puño de hule aislante230').material.color.getHexString(),'e56b1f','Hule aislante naranja');
h.dispose();assert(!h.root.parent);
console.log('230 PASS: guante dieléctrico con mano articulada alineada al rig, dedos que se cierran hacia la palma y vuelven, puño de hule naranja y protector de cuero. CPU/geometría.');
