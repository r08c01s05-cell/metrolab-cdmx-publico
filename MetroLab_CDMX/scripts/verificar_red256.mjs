// Red y protecciones 256: subestación de 230 kV en SF6, red de 15 kV, factor de potencia, densidad
// de SF6 en las celdas, protección 50/51, calentamiento del transformador y pérdidas en los diodos.
globalThis.self??=globalThis;globalThis.createImageBitmap??=async()=>({width:1,height:1,close(){}});
import assert from 'node:assert/strict';import fs from 'node:fs';import zlib from 'node:zlib';import * as THREE from 'three';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {detailSubstation251} from '../dist/substation-detail251.js';
import {SEAT256,SOURCES256,ASSUMED256,powerFactor256,relayTime256,windingSteady256,TransformerThermal256,diodeLosses256,sf6State256,ringFed256,recordSf6Anchors256,addSf6Gauges256,setGauge256,gaugeAngle256,GridPanel256} from '../dist/grid-substation256.js';

// Public data of the Metro-Energía substation.
assert.equal(SEAT256.transformers*SEAT256.mvaEach,240,'4 × 60 MVA = 240 MVA');assert.equal(SEAT256.kvHigh,230);assert.equal(SEAT256.kvMedium,15);
for(const s of Object.values(SOURCES256))assert(/^https:\/\//.test(s.url)&&s.note.length>20,'Cada fuente con enlace y nota');
// Power factor at 15 kV.
{const r=powerFactor256(30,9);assert(Math.abs(r.fp-30/Math.hypot(30,9))<1e-12);assert(r.okGrid);assert(Math.abs(r.I-Math.hypot(30,9)*1e6/(Math.sqrt(3)*15e3))<1e-6);
 assert(!powerFactor256(30,20).okGrid,'FP 0.83 no cumple el mínimo de 0.95');}
// IEC standard inverse + instantaneous.
{const o={Is:400,tms:.2,inst:4000};assert.equal(relayTime256(300,o),Infinity,'Debajo del arranque no dispara');
 assert(Math.abs(relayTime256(4000-1,o)-.2*.14/(Math.pow(3999/400,.02)-1))<1e-9);assert(Math.abs(relayTime256(2000,o)-.2*.14/(Math.pow(5,.02)-1))<1e-12);
 assert.equal(relayTime256(5000,o),0,'Arriba del 50 dispara al instante');assert(relayTime256(800,o)>relayTime256(1600,o),'A más corriente, menos tiempo');
 assert(Math.abs(relayTime256(2000,{Is:400,tms:1,inst:0})-4.28)<.01,'TMS 1 a 5 × Is: 4.28 s, valor clásico de la curva inversa normal');}
// Transformer heating and ventilation logic.
{assert.equal(windingSteady256(1,false),ASSUMED256.ambient+ASSUMED256.riseRated);assert(windingSteady256(1.4,true)<windingSteady256(1.4,false));
 assert(Math.abs(windingSteady256(1.4,true)-windingSteady256(1,false))<1e-9,'Con ventiladores, 40 % más carga da la misma temperatura');
 const th=new TransformerThermal256();for(let t=0;t<300;t+=1)th.step(1.2,1);assert(th.fans,'A carga 1.2 arrancan los ventiladores');assert(!th.tripped,'Y con ellos no dispara');
 const bad=new TransformerThermal256();for(let t=0;t<300;t+=1)bad.step(1.2,1,{fanFail:true});assert(bad.tripped&&bad.log.some(x=>x.alarm===1)&&bad.log.some(x=>x.alarm===2),'Sin ventiladores: alarma y luego disparo');
 const hot=bad.theta;for(let t=0;t<200;t+=1)bad.step(1.2,1,{fanFail:true});assert(bad.theta<hot,'Disparado, el transformador se enfría');}
// Diode losses: Id/6 average per diode.
{const r=diodeLosses256(3000);assert.equal(r.avg,500);assert(Math.abs(r.rms-3000/(2*Math.sqrt(3)))<1e-9);assert(Math.abs(r.total-12*(.9*500+.0004*r.rms*r.rms))<1e-6);assert(r.share>0&&r.share<.01,'Menos del 1 % de la potencia de salida');
 assert(diodeLosses256(3000,{vf0:1.8}).total>r.total*1.5,'La caída de 1.5 a 2 V de la presentación casi duplica las pérdidas');}
// SF6 states and the 15 kV ring.
assert.equal(sf6State256(1),'ok');assert.equal(sf6State256(.88),'alarm');assert.equal(sf6State256(.84),'block');
assert.equal(ringFed256(6).size,6);assert.equal(ringFed256(6,new Set([1])).size,6,'Un tramo abierto: el anillo alimenta por el otro lado');
{const f=ringFed256(6,new Set([0,1]));assert(!f.has(1)&&f.size===5,'Dos tramos abiertos aíslan la SR 2');const g=ringFed256(6,new Set(),undefined,new Set([0]));assert.equal(g.size,6,'Sin una fuente, la otra alimenta todo el anillo');}
assert(gaugeAngle256(.7)>gaugeAngle256(1.1),"Densidad baja a la izquierda de la carátula");
// Gauges on the real GLB.
const buf=zlib.gunzipSync(fs.readFileSync(new URL('../dist/models/revision142/subestacion142.glb.gz',import.meta.url)));
const m=(await new GLTFLoader().parseAsync(buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength),'')).scene;m.updateMatrixWorld(true);
const parts=new Map(['mt','transformer','rectifier','dc','control','battery','civil'].map(id=>[id,m.getObjectByName(id)]));
detailSubstation251(m,parts);const anchors=recordSf6Anchors256(m,parts);assert.equal(anchors.length,3,'Un densímetro por celda de media tensión');
const gauges=addSf6Gauges256(m,parts);assert.equal(gauges.length,3);assert.equal(addSf6Gauges256(m,parts),gauges,'Se agregan una sola vez');
m.updateMatrixWorld(true);const mtBox=new THREE.Box3();parts.get('mt').traverse(o=>{if(o.isMesh&&/^Gabinete_techo/.test(o.name))mtBox.union(new THREE.Box3().setFromObject(o));});
for(const g of gauges){const p=new THREE.Vector3().setFromMatrixPosition(g.group.matrixWorld);assert(p.y>mtBox.max.y&&p.x>mtBox.min.x&&p.x<mtBox.max.x,'Densímetro sobre su celda');
 const n=new THREE.Vector3(0,0,1).transformDirection(g.group.matrixWorld);assert(n.z<-.99,'La carátula mira al pasillo (−z)');}
assert.equal(setGauge256(gauges[0],.86),'alarm');assert.equal(setGauge256(gauges[0],.8),'block');setGauge256(gauges[0],1);
// Panel with a minimal DOM.
{const mk=()=>{const o={hidden:false,dataset:{},textContent:'',value:'1',checked:false,children:[],append(c){this.children.push(c);},remove(){},setAttribute(){},addEventListener(){},insertBefore(){},set innerHTML(v){this._h=v;},get innerHTML(){return this._h||'';},querySelector:()=>mk(),querySelectorAll:()=>[]};return o;};
 const view={dialog:{querySelector:()=>mk()},model:m,parts,status:{textContent:''}};const gp=new GridPanel256(view,{createElement:mk,body:mk()});
 assert(gp.gauges.length===3&&gp.gauges.every(g=>g.virtual),'261: el panel ya no pone densímetros en las celdas de la S.R.; el SF6 es de la subestación de 230 kV');
 for(const t of['real','zonas','red','sf6','prot','trafo','diodos']){gp.show(t);assert(gp.body.innerHTML.length>200,'Contenido de '+t);}
 gp.show('sf6');assert(/Duval/.test(gp.body.innerHTML)&&/HF/.test(gp.body.innerHTML),'Corrige el triángulo de Duval: SF6 se revisa por subproductos, no por gases en aceite');
 gp.toggle(true);gp.leak={on:true,cell:1,rate:.05,clock:0};for(let i=0;i<40;i++)gp.update(.1);assert(gp.gauges[1].rho<.85&&sf6State256(gp.gauges[1].rho)==='block','La fuga baja la aguja hasta el bloqueo');assert.equal(gp.gauges[0].rho,1,'Las otras bahías no cambian');
 gp.th.running=true;gp.th.K=1.2;gp.th.fanFail=true;for(let i=0;i<200;i++)gp.update(.1);assert(gp.thermal.tripped,'Simulación térmica: sin ventiladores dispara');
 gp.dispose();}
console.log('256 PASS: 230 kV en SF6 (4 × 60 MVA), FP ≥ 0.95, curva IEC inversa + 50, ventilación/alarma/disparo del transformador, pérdidas de 12 diodos (Id/6), densímetros SF6 en 3 celdas MT con alarma y bloqueo, anillo de 15 kV.');
