// Análisis eléctrico 245/248: modelo de corriente de motores y de línea, tensión, potencia y energía,
// arranque por carga y selector de carga con embarque gradual.
import assert from 'node:assert/strict';
import {electricState245,startRun248,massFromFraction248,tractionCap248,DOCUMENTED245,ASSUMED245,REFERENCE_KW245,LOADS248} from '../dist/electric-dashboard245.js';
import {massT248,SAG_MAX_M248,TrainLoad248} from '../dist/train-load248.js';

const rest=electricState245({v:0,a:0,load:0,traction:0,brake:1,powered:true});
assert.equal(rest.tractionKW,0);assert(Math.abs(rest.auxKW-ASSUMED245.auxKW)<1e-9,'Detenido solo consumen los auxiliares');
assert(rest.V<DOCUMENTED245.nominalV&&rest.V>740&&Math.abs(rest.I-rest.auxKW*1000/rest.V)<1e-6,'I de línea = P/V con 750 V CD nominales');
// 248: at standstill the motor current is the highest, while the line current stays low.
const launch=electricState245({v:.05,a:1,load:0,capacity:1200,traction:1});
assert(launch.motorA>6000&&launch.I<launch.motorA/4,'Al arrancar la corriente de motores es alta y la de línea baja');
assert(Math.abs(launch.motorA-launch.delivered/ASSUMED245.forcePerA)<1e-6,'La corriente de motores sale de la fuerza');
const run=electricState245({v:10,a:1,load:600,capacity:1200,traction:1,powered:true});
assert(run.tractionKW>2000&&run.I>run.tractionKW*1000/750*.99,'Al acelerar crecen potencia y corriente de línea');assert(run.V<rest.V,'La tensión baja con la corriente');
assert(Math.abs(run.massT-massFromFraction248(.5))<1e-9&&Math.abs(massFromFraction248(1)-DOCUMENTED245.loadedT)<1e-9,'La masa va de 231.4 t vacío a 338.5 t lleno según la carga');
const heavy=electricState245({v:2,a:1,load:1200,capacity:1200,traction:1}),light=electricState245({v:2,a:1,load:0,capacity:1200,traction:1});
assert(heavy.motorA>light.motorA*1.4,'Con la misma aceleración, lleno pide alrededor de 46 % más corriente de motores');
const cruise=electricState245({v:15,a:0,traction:1});assert(cruise.tractionKW>0&&cruise.tractionKW<run.tractionKW,'A velocidad constante solo se vence la resistencia al avance');
const brake=electricState245({v:15,a:-1.2,traction:0,brake:.8});assert(brake.tractionKW===0&&brake.brakeKW>0&&brake.I>0,'Al frenar no hay tracción y la energía se disipa en el reóstato');
const off=electricState245({v:5,a:0,traction:1,powered:false});assert(off.V===0&&off.I===0&&off.tractionKW===0,'Sin energía en la línea no hay corriente');
assert.equal(REFERENCE_KW245,3400);
const fast=electricState245({v:22,a:1.4,load:1200,capacity:1200,traction:1});assert(fast.limited&&fast.delivered<fast.force&&Math.abs(fast.delivered-tractionCap248(22))<1e-6,'Si el movimiento pide más de lo que da la tracción, se limita y se marca');
// Weight comparison from rest.
const runs=LOADS248.map(([f])=>startRun248(f));
assert(runs.every(r=>Math.abs(r.startForce-runs[0].startForce)<1e-6),'Con límite de corriente todos arrancan con la misma fuerza');
assert(runs.every((r,i)=>!i||r.startAccel<runs[i-1].startAccel&&r.t80>runs[i-1].t80),'Más carga: menos aceleración y más tiempo a 80 km/h');
assert(runs[3].Ipeak>=runs[0].Ipeak-1&&runs[3].x80>runs[0].x80,'Lleno necesita más distancia para llegar a 80 km/h');
const same=LOADS248.map(([f])=>startRun248(f,{mode:'same',accel:1}));assert(Math.abs(same[3].startForce/same[0].startForce-massFromFraction248(1)/massFromFraction248(0))<.02,'Misma aceleración: la fuerza crece con la masa (~46 %)');
assert(same[3].rows[60].V<same[0].rows[60].V&&same[3].rows[60].motorA>same[0].rows[60].motorA,'Y a los 6 s el tren lleno toma más corriente y la tensión baja más');
// Load selector: queue preparation and car sag.
assert.equal(massT248(0),231.4);assert.equal(massT248(1),338.5);assert(SAG_MAX_M248>0&&SAG_MAX_M248<.1);
{const els=[];const el=()=>{const o={hidden:false,value:'auto',children:[],append(){},after(){},remove(){},set innerHTML(v){},querySelector:()=>el(),textContent:''};els.push(o);return o;};
 const doc={getElementById:()=>null,querySelector:()=>({append(){}}),createElement:el};
 const line={stations:[{id:'a'},{id:'b'},{id:'c'}],distances:[0,1000,2000]};
 const t={id:'L1-01',line:1,position:850,speed:10,wait:0,load:100,target:1};
 const e={trains:[t],lines:{1:line},waiting:{a:0,b:30,c:0},capacity:1200,dwell:30,stopDuration:()=>30,boardingLimit:()=>554};
 const car={userData:{carIndex:0},children:[{userData:{},position:{y:0}},{userData:{bogie212:1},position:{y:0}}]};
 const win={metroViewState:()=>({engine:e,selectedTrain:'L1-01'}),stationScene:{trainMeshes:new Map([['L1-01',{group:{children:[car]}}]])}};
 const tl=new TrainLoad248(doc,win);tl.select.value='100';tl.apply();tl.tick();
 assert.equal(e.waiting.b,1200-(100-20),'Al acercarse al andén se forma la gente necesaria para llenarlo');
 t.position=1000;t.speed=0;t.wait=30;tl.tick();const plan=tl.plans.get('1:L1-01');assert(plan&&plan.to===100-20+554,'La parada sube a lo que permite el embarque normal');
 const before=tl.displayed(t,e);t.wait=10;const mid=tl.displayed(t,e);assert(mid>before,'Durante la parada la carga visible crece mientras entra la gente');
 for(let i=0;i<30;i++)tl.sag();assert(car.children[0].position.y<0&&car.children[1].position.y===0,'La caja baja y los bogies siguen en la vía');
 tl.select.value='0';tl.apply();t.wait=0;t.speed=8;t.position=1300;t.target=2;t.load=700;e.waiting.c=50;tl.tick();t.position=1800;tl.tick();
 assert.equal(e.waiting.c,0,'Si se pide vaciar, en la siguiente parada nadie sube');const held=tl.held.get('1:L1-01');assert(held?.count===50,'Los que esperaban se guardan para el siguiente tren');
 t.target=0;t.position=1950;tl.tick();assert.equal(e.waiting.c,50,'Al irse el convoy, la gente vuelve al andén');tl.dispose();}
console.log('245/248 PASS: corriente de motores por fuerza (máxima al arrancar) y de línea por potencia; masa de 231.4 a 338.5 t según la carga; límites de corriente y potencia; comparación de arranques por carga (misma fuerza: menos aceleración; misma aceleración: más corriente y más caída de tensión); selector de carga con fila en el andén, embarque gradual, caja que baja y gente devuelta al andén.');
