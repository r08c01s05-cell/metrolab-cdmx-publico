// Fenómenos 225: pérdida de ventilación del transformador seco con aire, ventiladores,
// calentamiento y chispa de apertura. Determinista por avance absoluto; libera sus recursos.
import assert from 'node:assert/strict';
import * as T from 'three';
import {FaultAnimation218} from '../dist/fault-animation218.js';
import {sampleOutcome218} from '../dist/fault-outcomes218.js';
import {FAULT_CASES217} from '../dist/fault-catalog217.js';
import {FaultStage225,cameraTween225} from '../dist/fault-stage225.js';

const scene=new T.Scene(),root=new T.Group(),group=new T.Group();root.add(group);scene.add(root);
const resin=new T.MeshStandardMaterial({name:'Resina colada transformador140',color:'#b03020'}),steel=new T.MeshStandardMaterial({name:'Acero laminado nucleo140'});
const coil=new T.Mesh(new T.BoxGeometry(2,1.2,.8),resin);coil.position.set(-1.8,1.3,2);group.add(coil);group.add(new T.Mesh(new T.BoxGeometry(2.2,1.8,.8),steel));
root.updateMatrixWorld(true);
const rows=[{part:'transformer',material:resin,base:resin.color.clone()},{part:'transformer',material:steel,base:steel.color.clone()}];
const model={root,rows,targets:new Map([['transformer',group]]),tint(){},bounds(){return new T.Box3().setFromObject(root);}};
const fx=new FaultAnimation218(model,'substation',scene),scenario=FAULT_CASES217.find(c=>c.id==='sr-cooling');
const sample=(p,v='reference')=>({...sampleOutcome218('sr-cooling',p,v),scenario,progress:p});
const state=()=>({fan:fx.fx225.fans[0].rotation.z,air:[...fx.fx225.air.geometry.attributes.position.array.slice(0,48)],glow:resin.emissiveIntensity,spark:fx.fx225.sparks.visible,flash:fx.fx225.flash.intensity});

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
// Piso de referencia y movimiento suave de cámara.
{const room=new T.Scene(),stage=new FaultStage225(room),a=new T.Box3(new T.Vector3(-3,.08,0),new T.Vector3(-.3,2.9,3)),b=new T.Box3(new T.Vector3(1,.2,0),new T.Vector3(2,2,1));
 stage.fit([a,b],a);assert(Math.abs(stage.floor.position.y-.078)<1e-6,'El piso queda justo bajo el equipo más bajo');
 assert.equal(stage.decor.children.filter(o=>o.name==='Sombra de contacto225').length,2,'Una sombra de contacto por conjunto');
 assert.equal(stage.decor.children.filter(o=>o.name==='Línea de seguridad225').length,4,'Línea de seguridad alrededor del equipo estudiado');
 stage.fit([b],null);assert.equal(stage.decor.children.length,1,'Al cambiar de escenario se reemplazan sombras y línea');
 assert(room.fog,'Niebla que funde el piso con el fondo');stage.dispose();assert(!room.fog&&!room.getObjectByName('Piso de referencia225'),'El piso se libera al cerrar');
 const camera=new T.PerspectiveCamera(),controls={target:new T.Vector3()};camera.position.set(0,0,10);
 const tw=cameraTween225(camera,controls,new T.Vector3(10,0,0),new T.Vector3(1,1,1),1000,600);
 assert(tw.step(1300)&&Math.abs(camera.position.x-5)<1e-9,'A la mitad del tiempo, a la mitad del camino');assert(!tw.step(1700)&&camera.position.x===10&&controls.target.y===1,'Termina exactamente en el destino');}

console.log('225 PASS: piso de referencia con sombras y línea de seguridad, cámara con transición suave; aire, dos ventiladores, calentamiento y chispa de apertura deterministas; variante sin protección incandescente; recursos restaurados. CPU/geometría.');
