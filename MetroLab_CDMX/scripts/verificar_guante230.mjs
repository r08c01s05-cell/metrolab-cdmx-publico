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
// 234: volumen de guante, color que no parece piel, pulgar frente a la palma y dedos juntos.
{const h=createDielectricHand230(),c=h.hand.geometry.attributes.color,hsl={};let sat=0;for(let i=0;i<c.count;i+=37){new T.Color(c.getX(i),c.getY(i),c.getZ(i)).getHSL(hsl,T.SRGBColorSpace);sat=Math.max(sat,hsl.s);}
 assert(sat<.3,'El protector no tiene tono de piel');assert(h.hand.material.bumpMap,'Grano de cuero');
 const tip=()=>h.bones[4].getWorldPosition(new T.Vector3()),open=tip();h.angles.opposition234=.6;h.pose(h.angles);assert(tip().distanceTo(open)>.01,'El pulgar se cruza frente a la palma al sujetar');
 const fingers=[];h.angles.opposition234=0;h.pose(h.angles);for(const i of [9,24])fingers.push(h.bones[i].position.clone());assert(fingers[0].distanceTo(fingers[1])<.085,'Dedos juntos, sin abanico');h.dispose();}
console.log('230/234 PASS: guante dieléctrico con mano articulada alineada al rig, dedos que se cierran hacia la palma y vuelven, puño de hule naranja y protector de cuero. CPU/geometría.');
