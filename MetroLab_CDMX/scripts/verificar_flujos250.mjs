// Flujos de corriente 250: en el seguimiento del tren (barras guía, escobillas y retorno por rieles)
// y recorrido de la energía dentro de la planta rectificadora, por etapas.
import assert from 'node:assert/strict';
import {currentPaths250,pointOn250,flowLevel250,MOTOR_CARS250,TRACK250,TrackCurrent250} from '../dist/track-current250.js';
import {flowRoutes250,STAGES250,STAGE_SECONDS250,PowerFlow250} from '../dist/power-flow250.js';
import * as THREE from 'three';

assert.deepEqual(MOTOR_CARS250,[0,2,3,5,6,8],'Escobillas en los 6 carros motrices (24 motores)');
const train={id:'L1-01',line:1,direction:1,model:'NM-22',position:1000};
const paths=currentPaths250(train,1000);
assert.equal(paths.length,6*2*2*2,'Por carro motriz: 2 bogies × 2 lados, ida y retorno');
for(const p of paths.filter(p=>p.kind==='positive')){const [a]=p.points;assert(Math.abs(Math.abs(a[2])-TRACK250.guideZ)<1e-9&&a[1]===TRACK250.guideY,'La ida empieza en una barra guía');assert(p.points.at(-1)[1]>1,'Y termina dentro del carro');}
for(const p of paths.filter(p=>p.kind==='ret')){const last=p.points.at(-1);assert(Math.abs(Math.abs(last[2])-TRACK250.railZ)<1e-9&&last[1]===TRACK250.railY,'El retorno corre por los rieles de seguridad');}
const mid=pointOn250(paths[0],paths[0].length/2);assert(mid.every(Number.isFinite));
assert(flowLevel250(4000).speed>flowLevel250(300).speed&&flowLevel250(4000).share>flowLevel250(300).share,'Más corriente: partículas más rápidas y más densas');
// Toggle without a 3D scene must not break.
{const el=()=>({hidden:false,append(){},remove(){},setAttribute(){},set innerHTML(v){},querySelector:()=>null,innerHTML:''});
 const doc={createElement:el,querySelector:()=>({append(){}}),getElementById:()=>({append(){}})};
 const engine={trains:[{...train,speed:10,wait:0,target:1}],power:{1:true},lines:{1:{distances:[0,2000]}}};
 const scene=new THREE.Scene();
 const win={metroViewState:()=>({engine,selectedTrain:'L1-01',running:true}),stationScene:{scene,alignment97:null},electricDashboard245:{state:{I:3500}},requestAnimationFrame:()=>1,cancelAnimationFrame(){}};
 const tc=new TrackCurrent250(doc,win);tc.toggle(true);assert(scene.getObjectByName('Flujo_corriente250'),'Al activar aparecen las partículas en la escena');
 tc.update(0);const n=tc.update(100);assert(n>200,'Con 3,500 A circula la mayoría de las partículas');
 engine.power[1]=false;assert.equal(tc.update(200),0,'Sin energía no circula nada');
 tc.toggle(false);assert(!tc.mesh.visible,'Se apaga con otro clic');tc.dispose();}
// Substation: five stages, in order.
assert.deepEqual(STAGES250.map(s=>s.id),['mt','transformer','rectifier','dc','return']);
const routes=flowRoutes250();for(const s of STAGES250)assert(routes.some(r=>r.stage===s.id),'Ruta para '+s.id);
{const items=[];const el=()=>{const o={hidden:false,dataset:{},textContent:'',append(){},remove(){},setAttribute(){},set innerHTML(v){},querySelector:()=>null,querySelectorAll:()=>items,insertBefore(){}};return o;};
 const model=new THREE.Group(),view={dialog:{querySelector:()=>el()},model,status:{textContent:''},exploded:false};
 const pf=new PowerFlow250(view,{createElement:el,body:el()});pf.toggle(true);
 const lit=()=>{const seen=new Set();for(let i=0;i<pf.mesh.count;i++){const c=new THREE.Color();pf.mesh.getColorAt(i,c);seen.add(c.getHexString());}return seen;};
 pf.update(.5);assert.equal(pf.stage(),1);assert(pf.mesh.count>0&&lit().size===1,'Primero solo se ve la media tensión');
 pf.update(STAGE_SECONDS250*2);assert.equal(pf.stage(),3);assert(lit().size>=2);
 pf.update(STAGE_SECONDS250*3);assert.equal(pf.stage(),5);assert(lit().size===4,'Al final se ven CA de MT, CA de BT, CD+ y retorno');
 view.exploded=true;assert.equal(pf.update(.1),0,'En despiece no se dibuja el recorrido');view.exploded=false;
 pf.toggle(false);assert(!pf.mesh.visible);pf.dispose();assert(!model.getObjectByName('Flujo_energia250'));}
console.log('250 PASS: flujo de corriente en vía (barras guía → escobillas de 6 carros motrices → retorno por rieles), según la corriente de línea, se apaga sin energía; recorrido por etapas en la planta rectificadora (MT, transformador, rectificador, CD+, retorno).');
