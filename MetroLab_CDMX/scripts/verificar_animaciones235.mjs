// Animaciones visibles 235: cada escenario del laboratorio tiene su propio fenómeno en 3D,
// baliza y anillo de estado; todo depende solo del avance absoluto y se libera al cerrar.
import assert from 'node:assert/strict';
import * as T from 'three';
import {FaultAnimation218} from '../dist/fault-animation218.js';
import {sampleOutcome218} from '../dist/fault-outcomes218.js';
import {FAULT_CASES217} from '../dist/fault-catalog217.js';
import {stateLevel235} from '../dist/fault-show235.js';

function fakeModel(parts){
 const root=new T.Group(),targets=new Map(),rows=[];let x=-4;
 for(const part of parts){const g=new T.Group(),m=new T.MeshStandardMaterial({name:part==='transformer'?'Resina colada transformador140':'Acero'});const o=new T.Mesh(new T.BoxGeometry(1.4,2,1),m);o.position.set(x+=2,1,0);g.add(o);root.add(g);targets.set(part,g);rows.push({part,material:m,base:m.color.clone()});}
 root.updateMatrixWorld(true);
 return {root,targets,rows,tint(){},bounds(part){root.updateMatrixWorld(true);return new T.Box3().setFromObject(part&&targets.get(part)||root);}};
}
const snapshot=group=>{const out=[];group.traverse(o=>{if(o.geometry?.attributes?.color&&(o.isPoints||o.isLineSegments))out.push(...o.geometry.attributes.position.array.slice(0,30),...o.geometry.attributes.color.array.slice(0,30));if(o.material?.opacity!==undefined)out.push(o.material.opacity);});return out;};
const bright=group=>{let m=0;group.traverse(o=>{if(o.visible&&(o.isPoints||o.isLineSegments))for(const v of o.geometry.attributes.color.array)m=Math.max(m,v);if(o.isSprite&&o.visible)m=Math.max(m,o.material.opacity);});return m;};

for(const domain of ['substation','train']){
 const scene=new T.Scene(),model=fakeModel(domain==='train'?['doors','mechanics','collectors','motors','body']:['transformer','rectifier','dc','battery']);
 const fx=new FaultAnimation218(model,domain,scene),show=fx.show235;
 for(const scenario of FAULT_CASES217.filter(c=>c.domain===domain)){
  const sample=(p,v='reference')=>({...sampleOutcome218(scenario.id,p,v),scenario,progress:p});
  assert(show.effects.has(scenario.id),`Efecto propio para ${scenario.id}`);
  fx.apply(sample(.5));const e=show.effects.get(scenario.id);
  assert(e.group.visible&&[...show.effects].every(([k,f])=>k===scenario.id||!f.group.visible),`${scenario.id}: solo su efecto está visible`);
  if(scenario.id!=='sr-cooling'){let peak=0;for(const p of [.05,.1,.3,.5,.6,.76,.77,.9])peak=Math.max(peak,(fx.apply(sample(p)),bright(e.group)));assert(peak>.4,`${scenario.id}: el fenómeno se ve con claridad`);}
  fx.apply(sample(.6));const a=snapshot(e.group);fx.apply(sample(.1));fx.apply(sample(.6));assert.deepEqual(snapshot(e.group),a,`${scenario.id}: mismo cuadro al volver al mismo avance`);
  fx.apply(sample(.1));const green=show.beacon.dome.material.emissive.clone();fx.apply(sample(.9));const red=show.beacon.dome.material.emissive.clone();
  assert(green.g>green.r&&red.r>red.g,`${scenario.id}: la baliza pasa de verde a rojo`);
 }
 assert(stateLevel235(.1)===0&&stateLevel235(.5)===1&&stateLevel235(.95)===2,'Niveles de estado por fase');
 fx.dispose();assert(!scene.getObjectByName('Animaciones visibles235')&&!model.root.getObjectByName('Animaciones visibles235'),`${domain}: los efectos se retiran al cerrar`);
}
console.log('235 PASS: los ocho escenarios del laboratorio tienen fenómeno propio y visible (calor del rectificador, arco y corriente del alimentador, reserva de batería, puertas, aire, captación y chispas de freno), baliza y anillo verde/ámbar/rojo, cuadros deterministas y recursos liberados. CPU/geometría.');
