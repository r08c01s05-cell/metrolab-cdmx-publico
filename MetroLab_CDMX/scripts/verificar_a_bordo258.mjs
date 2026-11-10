// Sistemas a bordo 258: cadena de potencia, mando y freno de urgencia, lógica de puertas y
// separación entre trenes con bloque fijo y bloque móvil.
import assert from 'node:assert/strict';
import {CONTROL258,PRESENTATION258,SEPARATION258,doorLogic258,emergency258,separation258,gapAhead258,Onboard258} from '../dist/onboard258.js';
import {ASSUMED257} from '../dist/train-dynamics257.js';

assert.equal(CONTROL258['NM-22'].kind,'VVVF');assert.equal(CONTROL258['MP-82'].kind,'Chopper');
assert.equal(PRESENTATION258.lowDC['NM-22'],'110 V CD');
// Doors: AND.
assert(doorLogic258({speed:0,atPlatform:true}).open);assert(!doorLogic258({speed:2,atPlatform:true}).open,'En marcha no abren');
assert(!doorLogic258({speed:0,atPlatform:false}).open,'Fuera del andén no abren');assert(!doorLogic258({speed:0,atPlatform:true,sideOk:false}).open,'Del lado equivocado no abren');
assert(!doorLogic258({closed:false}).traction,'Con puertas abiertas no hay tracción');
// Emergency: OR.
assert(!emergency258({}).active);for(const k of['deadmanReleased','powerLost','atpOverspeed','emergency'])assert(emergency258({[k]:true}).active,'Basta '+k);
assert.equal(emergency258({deadmanReleased:true,powerLost:true}).causes.length,2);
// Separation.
{const v=60/3.6,s=separation258(v,{block:400,decel:1.2});assert(Math.abs(s.brake-(v*ASSUMED257.reaction+v*v/2.4+ASSUMED257.overlap))<1e-9);
 assert(Math.abs(s.fixed-s.moving-600)<1e-9,'Bloque fijo suma bloque y medio');assert(s.headwayMoving<s.headwayFixed,'Con bloque móvil los trenes pueden ir más juntos');
 assert(separation258(v,{block:800}).fixed>separation258(v,{block:200}).fixed,'Bloques más largos separan más');}
{const t={id:'a',line:1,direction:1,position:1000},e={trains:[t,{id:'b',line:1,direction:1,position:1450},{id:'c',line:1,direction:1,position:1300},{id:'d',line:1,direction:-1,position:1100},{id:'e',line:8,direction:1,position:1050}]};
 assert.equal(gapAhead258(e,t),300,'Tren adelante más cercano, misma línea y sentido');assert.equal(gapAhead258({trains:[t]},t),Infinity);}
assert.equal(SEPARATION258.gap,180);
// Panel with a minimal DOM.
{const els={};const mk=(sel)=>{const o={sel,hidden:false,dataset:{},textContent:'',value:'0',children:[],append(c){this.children.push(c);},remove(){},setAttribute(k,v){this[k]=v;},addEventListener(){},set innerHTML(v){this._h=v;},get innerHTML(){return this._h||'';},querySelector(s){return els[s]??=mk(s);},querySelectorAll:()=>[]};return o;};
 const doc={createElement:mk,querySelector:()=>mk(),getElementById:()=>mk(),body:mk()};
 const train={id:'L1-01',line:1,direction:1,model:'NM-22',speed:0,position:600,target:1,wait:12};
 const engine={trains:[train,{id:'L1-02',line:1,direction:1,position:1400,speed:10}],lines:{1:{distances:[0,600,1350]}},power:{1:true},emergency:false};
 const win={metroViewState:()=>({engine,selectedTrain:'L1-01'}),electricDashboard245:{state:{V:744,I:242,tractionKW:0,brakeKW:0,auxKW:180}},setInterval:()=>1,clearInterval(){}};
 const ob=new Onboard258(doc,win);ob.toggle(true);
 for(const t of['power','control','doors','blocks']){ob.show(t);assert(ob.body.innerHTML.length>150,'Contenido de '+t);}
 ob.show('doors');assert(/Apertura autorizada/.test(els['[data-ob258-and]'].innerHTML),'En la estación, detenido: abre');assert(/Inhibida/.test(els['[data-ob258-doors]'].innerHTML),'Con puertas abiertas la tracción queda inhibida');
 train.wait=0;train.speed=15;train.position=900;ob.update();assert(/Apertura bloqueada/.test(els['[data-ob258-and]'].innerHTML));
 ob.show('control');assert(/No requerido/.test(els['[data-ob258-emer]'].innerHTML));engine.power[1]=false;ob.update();assert(/sin tensión/.test(els['[data-ob258-emer]'].innerHTML),'Sin tensión: urgencia');engine.power[1]=true;
 engine.operator={trainId:'L1-01',deadman:false,throttle:.5,brake:0,phase:'closed'};ob.update();assert(/hombre muerto soltado/.test(els['[data-ob258-emer]'].innerHTML),'Hombre muerto suelto en marcha: urgencia');assert.equal(els['[data-ob258-mode]'].textContent,'Conducción manual');
 ob.show('blocks');assert(/500 m/.test(els['[data-ob258-live]'].innerHTML),'Distancia al tren de adelante');assert(/style="/.test(els['[data-ob258-blocks]'].innerHTML));
 ob.show('power');assert(/VVVF/.test(els['[data-ob258-chain]'].innerHTML));ob.dispose();}
console.log('258 PASS: cadena de potencia a bordo (VVVF/chopper, convertidor estático), freno de urgencia por cualquiera de 4 condiciones, puertas por las 3 condiciones con tracción inhibida, bloque fijo contra móvil y distancia al tren de adelante.');
