// Portaherramientas 236 en el recorrido a pie de la planta rectificadora: rueda con Tab, cambio con
// un toque, Q para guardar, herramienta en la mano enguantada y lecturas del punto apuntado.
import assert from 'node:assert/strict';
import * as T from 'three';
import {WalkTools236,WALK_TOOLS236,detectorRate236,thermalColour236} from '../dist/walk-tools236.js';

// Minimal DOM for the HUD, the hidden buttons and the shared wheel.
class El{constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.style={setProperty(){}};this.hidden=false;this.listeners={};this.attrs={};this._html='';}
 append(...c){for(const x of c){x.parentElement=this;this.children.push(x);}}remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(x=>x!==this);}
 replaceChildren(){this.children=[];}setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,f){(this.listeners[k]??=[]).push(f);}removeEventListener(){}
 set innerHTML(v){this._html=v;this.slots={};for(const m of v.matchAll(/data-([a-z0-9-]+)/g))this.slots[m[1]]=new El('span');}get innerHTML(){return this._html;}
 querySelector(s){const m=/data-([a-z0-9-]+)/.exec(s);if(m&&this.slots?.[m[1]])return this.slots[m[1]];if(s==='b')return this.slots?.b||(this.slots.b=new El('b'));return null;}
 closest(){return this.tagName==='DIALOG'?this:null;}getBoundingClientRect(){return {left:0,top:0,width:100,height:100};}click(){this.onclick?.();}
 fire(type,e){for(const f of this.listeners[type]||[])f({preventDefault(){},stopImmediatePropagation(){},repeat:false,target:this,...e});}}
const doc={createElement:t=>new El(t),addEventListener(){},removeEventListener(){},body:new El('body')};
const dialog=new El('dialog');dialog.open=true;dialog.ownerDocument=doc;const wrap=new El('div'),canvas=new El('canvas');wrap.append(canvas);dialog.append(wrap);

const scene=new T.Scene(),camera=new T.PerspectiveCamera(68,1.5,.03,50);camera.position.set(0,1.6,3);scene.add(camera);
const model=new T.Group(),hot=new T.Group(),cold=new T.Group();model.add(hot,cold);scene.add(model);
const box=new T.Mesh(new T.BoxGeometry(2,3,1),new T.MeshStandardMaterial());box.position.set(0,1.5,0);hot.add(box);
const wall=new T.Mesh(new T.BoxGeometry(6,4,.2),new T.MeshStandardMaterial());wall.position.set(0,2,-6);cold.add(wall);
const view={dialog,canvas,camera,scene,model,parts:new Map([['transformer',hot],['civil',cold]]),walk176:{enabled:true,keys:new Set(),bagActive:()=>false},service128:{active:false}};
scene.updateMatrixWorld(true);
const tools=new WalkTools236(view);
const key=(type,k)=>dialog.fire(type,{key:k});
const step=(n=3)=>{for(let i=0;i<n;i++)tools.update(.05);};

step();assert(!tools.hud.hidden&&tools.rig.visible,'En el recorrido libre se ve el portaherramientas');
assert.equal(tools.selected,'hand');assert(!tools.glove.root.visible,'Con manos libres no se ve guante con herramienta');
// Tap Tab: next tool. Hold Tab: wheel; release picks.
key('keydown','Tab');key('keyup','Tab');assert.equal(tools.selected,'flashlight','Un toque de Tab pasa a la siguiente');
step();assert(tools.spot.intensity>0&&tools.models.flashlight.visible&&tools.glove.root.visible,'La linterna ilumina y se ve en la mano');
key('keydown','Tab');await new Promise(r=>setTimeout(r,230));assert(tools.wheel232.isOpen,'Mantener Tab abre la rueda');
assert.equal(tools.wheel232.items.length,WALK_TOOLS236.length-1,'El cinturón tiene una bolsa por herramienta (las manos libres se eligen con Q)');
const thermal=tools.wheel232.items.findIndex(x=>x.id==='thermal');tools.wheel232.select(thermal);key('keyup','Tab');
assert(!tools.wheel232.isOpen&&tools.selected==='thermal','Al soltar Tab se toma la herramienta marcada');
step();assert.equal(tools.spot.intensity,0,'La linterna se apaga al cambiar');
assert(/°C/.test(tools.reading.value)&&tools.reading.celsius>50,'La cámara térmica lee el transformador caliente');
assert(/ilustrativo/.test(tools.reading.note),'La temperatura se declara ilustrativa');
tools.choose('detector');step();assert(tools.reading.alarm&&tools.reading.rate>0,'El detector indica tensión cerca del transformador');
camera.position.set(0,1.6,5.5);scene.updateMatrixWorld(true);step();assert(!tools.reading.alarm,'Lejos del equipo el detector no alarma');
camera.position.set(-2.5,2,3);camera.lookAt(-2.5,2,-6);scene.updateMatrixWorld(true);tools.choose('detector');step();assert(!tools.reading.alarm&&/Sin tensión/.test(tools.reading.value),'La obra civil no tiene tensión');
camera.position.set(0,1.6,3);camera.rotation.set(0,0,0);scene.updateMatrixWorld(true);
tools.choose('laser');step();assert.equal(tools.reading.value,'2.50 m','El láser mide la distancia al punto apuntado');assert(tools.beam.visible&&tools.dot.visible,'Se ven el haz y el punto rojo');
assert(Math.abs(tools.dot.position.z-.5)<.05,'El punto rojo cae sobre la cara del equipo');
key('keydown','q');assert.equal(tools.selected,'hand','Q guarda la herramienta');step();assert(!tools.beam.visible,'Al guardar desaparece el haz');
// Maintenance practice or bag active: the walk tools step aside.
view.service128.active=true;step();assert(tools.hud.hidden&&!tools.rig.visible,'Durante una práctica manda la bolsa de mantenimiento');
key('keydown','Tab');key('keyup','Tab');assert.equal(tools.selected,'hand','Tab no cambia herramientas de recorrido durante una práctica');view.service128.active=false;
assert(detectorRate236(.3)>detectorRate236(2.5)&&detectorRate236(4)===0,'El pitido se acelera al acercarse');
assert(thermalColour236(65).r>thermalColour236(22).r,'Paleta térmica de frío a caliente');
tools.dispose();assert(!camera.children.includes(tools.rig)&&!scene.children.includes(tools.beam),'Al cerrar se retira todo');
console.log('236 PASS: portaherramientas en el recorrido de la planta: Tab (toque y rueda), Q, linterna, detector de tensión por proximidad, cámara térmica ilustrativa y láser con punto rojo; guante en la mano; cede el control a la bolsa durante las prácticas.');
process.exit(0);
