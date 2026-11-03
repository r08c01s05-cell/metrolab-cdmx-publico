// Portaherramientas 239: cinturón 3D en la cadera (forma del simulador de la planta de emergencia).
// Sube al abrirse, levanta la herramienta marcada, cambia con flechas/rueda/ratón y un clic la toma,
// también con el puntero capturado en primera persona.
import assert from 'node:assert/strict';
import * as T from 'three';
import {ToolBelt239,toolProp239} from '../dist/tool-belt239.js';

const listeners={};const doc={createElement:()=>({hidden:false,dataset:{},style:{},remove(){},textContent:''}),addEventListener:(k,f)=>(listeners[k]??=[]).push(f),removeEventListener(){},pointerLockElement:null,body:{append(){}}};
const fire=(k,e)=>{let stopped=false;for(const f of listeners[k]||[])f({preventDefault(){},stopImmediatePropagation(){stopped=true;},target:{closest:()=>null},...e});return stopped;};
const camera=new T.PerspectiveCamera(60,1.5,.03,50),scene=new T.Scene();scene.add(camera);
const canvas={width:900,height:600,clientWidth:900,clientHeight:600,parentElement:{append(){}},getBoundingClientRect:()=>({left:0,top:0,width:900,height:600})};
const taken=[];const ids=['hand','inspect','screwdriver','wrench','meter','brush'];
const owner={doc,view:{camera,canvas},selected:'hand',buttons:ids.map(id=>({id,click(){taken.push(id);owner.selected=id;}})),getId:b=>b.id,title:id=>id,getContext:()=>({kind:'anemometer'})};
const belt=new ToolBelt239(owner);
belt.open();assert(belt.isOpen,'Se abre el portaherramientas');
assert.equal(belt.items.length,ids.length-1,'Una bolsa por herramienta; las manos libres no ocupan bolsa');
assert(belt.root&&belt.root.parent===camera,'El cinturón va puesto en la vista (cadera)');
assert.equal(belt.pouches.length,belt.items.length);assert(belt.root.getObjectByName('Portaherramientas en la cadera239')===belt.root);
const low=-.6;for(let i=0;i<40;i++)belt.update(.05);assert(belt.root.position.y>low+.25,'Sube a la vista al abrirse');
belt.select(belt.items.findIndex(x=>x.id==='meter'));for(let i=0;i<20;i++)belt.update(.05);
const pouch=belt.pouches.find(p=>p.id==='meter'),other=belt.pouches.find(p=>p.id==='wrench');assert(pouch.pr.position.y>.06&&other.pr.position.y<.04,'La herramienta marcada se levanta de su bolsa');
assert(/Anemómetro/.test(belt.tag.textContent),'El nombre del instrumento depende de la práctica');assert(!belt.tag.hidden,'Su nombre aparece sobre la bolsa');
fire('keydown',{key:'ArrowRight'});fire('wheel',{deltaY:120});assert.equal(belt.items[belt.index].id,'brush','La rueda del ratón cambia de bolsa');
doc.pointerLockElement=canvas;fire('mousemove',{movementX:-80});assert.equal(belt.items[belt.index].id,'meter','En primera persona mover el ratón cambia de bolsa');
assert(fire('pointerdown',{button:0}),'El clic se usa para tomar, no llega a la escena');
assert.deepEqual(taken,['meter'],'Con el puntero capturado un clic toma la herramienta marcada');assert(!belt.isOpen);
for(let i=0;i<40;i++)belt.update(.05);assert(!belt.root.visible,'Vuelve a la cadera y se oculta');
belt.open();for(let i=0;i<10;i++)belt.update(.05);assert(!belt.pouches.find(p=>p.id==='meter').pr.visible,'La bolsa de la herramienta que tienes en la mano está vacía');
assert.equal(belt.close(false),null,'Esc cancela sin tomar');assert.deepEqual(taken,['meter']);
assert(!fire('pointerdown',{button:0}),'Cerrado, el clic vuelve a la escena');
for(const id of ['screwdriver','wrench','brush','meter','red','black','inspect','test','spare','lock','rag','flashlight','detector','thermal','laser'])assert(toolProp239(id).children.length>0,'Modelo para '+id);
belt.dispose();assert(!camera.children.length,'Se retira al cerrar');
// Real browsers ignore click() on a button while its own click is dispatching: the bag must not rely on it.
{const {ToolBag156}=await import('../dist/tool-bag156.js');assert(/queueMicrotask\(\(\)=>this\.take238\(id\)\)/.test(ToolBag156.toString()),'La herramienta se entrega después del clic, no dentro de él');}
// 240: solo las herramientas de la práctica, modelos detallados y nombres correctos.
{const {detailedTool240,spareKind240}=await import('../dist/tool-props240.js');const count=o=>{let n=0;o.traverse(x=>{if(x.isMesh)n++;});return n;};
 for(const [id,o] of [['screwdriver',{}],['wrench',{}],['brush',{}],['inspect',{}],['meter',{kind:'dmm'}],['meter',{kind:'anemometer'}],['meter',{kind:'megohm'}],['red',{}],['spare',{spare:'relay'}],['spare',{spare:'module'}],['test',{}],['laser',{}]])assert(count(detailedTool240(id,o))>=4,'Modelo detallado: '+id+' '+JSON.stringify(o));
 assert.equal(spareKind240('relay'),'relay');assert.equal(spareKind240('diodes'),'module');
 const ctxOwner={doc,view:{camera,canvas},selected:'hand',buttons:['hand','inspect','screwdriver','wrench','meter','brush','red','black'].map(id=>({id,click(){}})),getId:b=>b.id,title:id=>id,status:{textContent:''},getContext:()=>({kind:'anemometer',tools:['meter','inspect','screwdriver','brush']})};
 const b2=new ToolBelt239(ctxOwner);b2.open();assert.deepEqual(b2.items.map(x=>x.id),['inspect','screwdriver','meter','brush'],'El cinturón trae solo las herramientas de la práctica');
 b2.select(1);assert(/Destornillador aislado/.test(b2.tag.textContent),'Nombre de la herramienta real');b2.select(2);assert(/Anemómetro/.test(b2.tag.textContent));b2.close(false);b2.dispose();
 const empty={...ctxOwner,getContext:()=>({tools:[]})},b3=new ToolBelt239(empty);b3.open();assert(!b3.isOpen&&/manos/.test(empty.status.textContent),'Práctica sin herramientas: se avisa que se trabaja con las manos');b3.dispose();}
console.log('239 PASS: cinturón portaherramientas en la cadera: sube, levanta la marcada con su nombre, cambia con flechas/rueda/ratón y toma con clic incluso con el puntero capturado; Esc cancela; bolsa vacía para la herramienta en mano.');
