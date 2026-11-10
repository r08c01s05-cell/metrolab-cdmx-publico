// Dinámica y frenado 257: esfuerzo contra velocidad, resistencia con pendiente, adherencia seca y
// mojada, freno combinado, destino de la energía de frenado y distancia de detención con curva ATP.
import assert from 'node:assert/strict';
import {ASSUMED245,DOCUMENTED245,tractionCap248} from '../dist/electric-dashboard245.js';
import {ASSUMED257,MOTOR_SHARE257,ENGINE_RATES257,SOURCES257,resistance257,adhesionLimit257,usableForce257,maxAccel257,blend257,brakeDestination257,stoppingDistance257,serviceCurve257,atpCurve257,cant257,TrainDynamics257} from '../dist/train-dynamics257.js';

const full=DOCUMENTED245.loadedT,empty=DOCUMENTED245.emptyT;
assert(Math.abs(MOTOR_SHARE257-6/9)<1e-12,'Seis de nueve carros son motrices');
for(const s of Object.values(SOURCES257))assert(/^https:\/\//.test(s.url));
// Resistance: the simulator's rolling + aero, plus grade.
assert.equal(resistance257(0,full),full*ASSUMED245.rollingNPerT);
assert(Math.abs(resistance257(10,full,30)-resistance257(10,full)-full*1000*9.81*.03)<1e-6,'30 ‰ de subida suma m·g·0.03');
assert(resistance257(10,full,-30)<0,'En bajada fuerte la pendiente empuja al tren');
// Adhesion: wet tyres transmit less; the traction chain limit (400 kN) is below dry adhesion.
assert(adhesionLimit257(full,ASSUMED257.muDry)>tractionCap248(0),'En seco manda el límite de corriente');
assert(adhesionLimit257(empty,ASSUMED257.muWet)>tractionCap248(0),'Con μ 0.4 el neumático mojado aún transmite los 400 kN');
assert(adhesionLimit257(empty,.25)<tractionCap248(0),'Con μ 0.25 y tren vacío manda la adherencia');
assert.equal(usableForce257(0,empty,.25),adhesionLimit257(empty,.25));
assert(maxAccel257(0,empty,ASSUMED257.muDry)>maxAccel257(0,full,ASSUMED257.muDry),'Lleno acelera menos');
assert(maxAccel257(0,empty,.25)<maxAccel257(0,empty,ASSUMED257.muDry),'Muy mojado acelera menos');
assert(maxAccel257(15,full,ASSUMED257.muDry,40)<maxAccel257(15,full,ASSUMED257.muDry,0),'La pendiente le quita aceleración');
// Blended braking: all electric at speed, all friction when stopping.
{const b=ENGINE_RATES257[1].b,hi=blend257(40/3.6,full,b),lo=blend257(3/3.6,full,b),stop=blend257(0,full,b);
 assert(Math.abs(hi.electric+hi.friction-hi.need)<1e-6);assert(blend257(40/3.6,empty,1).share>.99,'Vacío y frenando suave a 40 km/h, todo es freno eléctrico');assert(hi.share>.3&&hi.share<1,'Lleno a 1.8 m/s²: el eléctrico no alcanza y entra fricción');
 assert(lo.share<.5&&stop.electric===0,'Cerca de detenerse solo queda la fricción');
 const fast=blend257(80/3.6,full,b);assert(fast.electric<=ASSUMED245.maxKW*1000/(80/3.6)+1e-6&&fast.friction>0,'A 80 km/h la potencia limita al freno eléctrico y entra fricción');}
// Destination of the braking energy.
{const d=brakeDestination257(1000);assert(d.rheo===0&&d.V<=ASSUMED257.vMax1,'Poca potencia: toda regresa a la barra');
 const big=brakeDestination257(8000);assert(big.V===ASSUMED257.vMax1&&big.rheo>0&&Math.abs(big.regen+big.rheo-8000)<1e-6,'Si la tensión llegaría a más de 900 V, el resto va a resistencias');
 assert.deepEqual(brakeDestination257(2000,{receptive:false}),{regen:0,rheo:2000,V:DOCUMENTED245.nominalV},'Sin trenes que la tomen, todo se quema');}
// Stopping and ATP curves.
{const v=70/3.6;assert(Math.abs(stoppingDistance257(v,1.33)-(v*1.5+v*v/2.66+20))<1e-9);assert(Math.abs(stoppingDistance257(19.44,1.33)-191)<1,'Ejemplo de la presentación: ≈ 191 m');
 for(const d of[0,50,200,600,1500])assert(atpCurve257(d,ASSUMED257.emergency)>serviceCurve257(d,ENGINE_RATES257[8].b),'Línea 8: la intervención ATP queda arriba de la curva de servicio');
 assert(atpCurve257(800,ASSUMED257.emergency)>serviceCurve257(800,ENGINE_RATES257[1].b),'Línea 1 también, aunque con poco margen');
 const d=300,va=atpCurve257(d,2);assert(Math.abs(stoppingDistance257(va,2)-(d+ASSUMED257.overlap)-ASSUMED257.overlap)<1e-6,'En la curva ATP, reacción + frenado llegan justo al punto de peligro');
 assert(Math.abs(cant257(80,500)-11.8*6400/500)<1e-9);}
// Tab inside the electric dashboard, with a minimal DOM.
{const els={};const mk=(sel)=>{const o={sel,hidden:false,dataset:{},textContent:'',value:'0',children:[],append(c){this.children.push(c);},after(c){this.children.push(c);return true;},remove(){},setAttribute(k,v){this[k]=v;},addEventListener(){},set innerHTML(v){this._h=v;},get innerHTML(){return this._h||'';},querySelector(s){return els[s]??=mk(s);},querySelectorAll:()=>[]};return o;};
 const root=mk('root');let shown=null;const dash={root,showTab(t){shown=t;},state:{massT:full,delivered:0,force:-200e3,brakeKW:2500}};
 const train={id:'L1-01',line:1,speed:12,position:1000,target:2};
 const engine={trains:[train,{id:'L1-02',line:1,speed:5,position:1500},{id:'L1-03',line:1,speed:5,position:4000}],lines:{1:{distances:[0,600,1350]}},weather:'dry'};
 const win={electricDashboard245:dash,metroViewState:()=>({engine,selectedTrain:'L1-01',running:true}),setInterval:()=>1,clearInterval(){}};
 const dy=new TrainDynamics257({createElement:mk},win);dy.tab.onclick();assert.equal(shown,'dyn257','La pestaña se abre en el tablero');
 let out=dy.render();assert.equal(out.dist,350,'Distancia a la siguiente parada');assert.equal(out.mu,ASSUMED257.muDry);
 engine.trains[1].speed=8;engine.trains[2].speed=9;out=dy.render();assert(/1 tren acelerando/.test(els['[data-dy257-blend-tiles]'].innerHTML),'Solo cuenta el tren cercano que acelera');
 engine.weather='rain';out=dy.render();assert.equal(out.mu,ASSUMED257.muWet,'Con lluvia en el simulador la vía se toma mojada');
 for(const k of['effort','blend','atp'])assert(/style="/.test(els[`[data-dy257-${k}]`].innerHTML),'Gráfica '+k+' con estilos en línea');
 dy.dispose();}
console.log('257 PASS: resistencia con pendiente, adherencia seca/mojada (6/9 de la masa), freno combinado eléctrico + fricción, energía a la barra hasta 900 V o a resistencias, distancia de detención (≈191 m del ejemplo) y curva ATP arriba de la de servicio.');
