// Fenómenos 225: pérdida de ventilación del transformador seco con aire, ventiladores,
// calentamiento y chispa de apertura. Determinista por avance absoluto; libera sus recursos.
import assert from 'node:assert/strict';
import * as T from 'three';
import {FaultAnimation218} from '../dist/fault-animation218.js';
import {sampleOutcome218} from '../dist/fault-outcomes218.js';
import {FAULT_CASES217} from '../dist/fault-catalog217.js';

const scene=new T.Scene(),root=new T.Group(),group=new T.Group();root.add(group);scene.add(root);
const resin=new T.MeshStandardMaterial({name:'Resina colada transformador140',color:'#b03020'}),steel=new T.MeshStandardMaterial({name:'Acero laminado nucleo140'});
const coil=new T.Mesh(new T.BoxGeometry(2,1.2,.8),resin);coil.position.set(-1.8,1.3,2);group.add(coil);group.add(new T.Mesh(new T.BoxGeometry(2.2,1.8,.8),steel));
root.updateMatrixWorld(true);
const rows=[{part:'transformer',material:resin,base:resin.color.clone()},{part:'transformer',material:steel,base:steel.color.clone()}];
const model={root,rows,targets:new Map([['transformer',group]]),tint(){},bounds(){return new T.Box3().setFromObject(root);}};
const fx=new FaultAnimation218(model,'substation',scene),scenario=FAULT_CASES217.find(c=>c.id==='sr-cooling');
const sample=(p,v='reference')=>({...sampleOutcome218('sr-cooling',p,v),scenario,progress:p});
const state=()=>({fan:fx.fx225.fans[0].rotation.z,air:[...fx.fx225.air.instanceMatrix.array.slice(0,48)],glow:resin.emissiveIntensity,spark:fx.fx225.sparks.visible,flash:fx.fx225.flash.intensity});

assert.equal(fx.fx225.fans.length,2,'Dos ventiladores en la cara abierta');
assert.equal(fx.fx225.coils.length,1,'Solo la resina de los devanados se calienta');
fx.apply(sample(.1));const early=state();
fx.apply(sample(.5));fx.apply(sample(.1));assert.deepEqual(state(),early,'Mismo cuadro al regresar en la línea de tiempo');
fx.apply(sample(.6));const slow=state();assert.equal(fx.apply(sample(.6)),undefined);assert.deepEqual(state(),slow,'Sin deriva al repetir el mismo avance');
assert(Math.abs(fx.fx225.fans[0].rotation.z-sample(.6).outcome.fanAngle*1.6)<1e-9,'El giro del ventilador sigue al caudal integrado');
fx.apply(sample(.1));assert(resin.emissiveIntensity<.05,'Con ventilación el devanado no brilla');
fx.apply(sample(.95));const protectedGlow=resin.emissiveIntensity;
fx.apply(sample(.95,'unprotected'));assert(resin.emissiveIntensity>protectedGlow*2,'Sin protección el devanado se pone incandescente');
fx.apply(sample(.76));assert(fx.fx225.sparks.visible&&fx.fx225.flash.intensity>0,'Chispa y destello al abrir la protección');
fx.apply(sample(.76,'unprotected'));assert(!fx.fx225.sparks.visible,'Sin apertura no hay chispa');
fx.apply(sample(.9));assert(!fx.fx225.sparks.visible&&fx.fx225.flash.intensity===0,'La chispa dura un instante');
fx.apply({...sampleOutcome218('sr-rectifier',.5),scenario:FAULT_CASES217.find(c=>c.id==='sr-rectifier'),progress:.5});
assert(!fx.fx225.root.visible&&resin.emissive.getHex()===0&&resin.emissiveIntensity===1,'Otros escenarios no muestran estos efectos y restauran el material');
fx.apply(sample(.95,'unprotected'));fx.dispose();
assert(resin.emissive.getHex()===0&&resin.emissiveIntensity===1,'Al cerrar se restaura el material');assert(!scene.getObjectByName('Fenómenos de ventilación225'),'Al cerrar se retiran los efectos');
console.log('225 PASS: aire, dos ventiladores, calentamiento y chispa de apertura deterministas; variante sin protección incandescente; recursos restaurados. CPU/geometría.');
