// Control y energía 279: reactor de equilibrio, frenado reostático por modelo de tren, regulación del
// centro de control (regímenes PA/CMC/CML, ATP, hombre muerto, bloque fijo y CBTC, restricciones,
// regulación del intervalo, registrador de eventos) e indicadores de la Agenda 2030.
globalThis.self??=globalThis;globalThis.createImageBitmap??=async()=>({width:1,height:1,close(){}});
import fs from 'node:fs';import zlib from 'node:zlib';import assert from 'node:assert/strict';import * as THREE from 'three';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {BRAKE279,brakeInfo279,rheoOnly279,brakeSplit279,VMAX279} from '../dist/braking279.js';
import {snapshot263} from '../dist/pcc263.js';
import {REACTOR279,sixPulse279,reactorWaves279,bridgeCurrents279,ratedCurrent279,buildBalanceReactor279,removeCabinetReactor279,placeBalanceReactor279} from '../dist/balance-reactor279.js';
import {SR_PARTS126} from '../dist/rectifier-model126.js';
import {brakePaths279,MOTOR_CARS250} from '../dist/track-current250.js';
import {Regulator279,MODES279,SIGNALLING279,ASSUMED279,blocks279,blockIndex279,occupancy279,occupiedBlocks279,clock279} from '../dist/regulacion279.js';
import {FESEN279,ODS279,indicators279,STC2030} from '../dist/agenda2030-279.js';
await import('../dist/engine.js');
const data=JSON.parse(fs.readFileSync('dist/datos.json'));
const mk=(fleet)=>{const e=new globalThis.MetroEngine(data);if(fleet){e.fleet=fleet;e.reset();}return e;};
const near=(a,b,tol)=>Math.abs(a-b)<=tol;

// 1. Freno por modelo (diapositiva 35 y ALAMYS).
assert.deepEqual(Object.keys(BRAKE279).sort(),['MP-82','NM-22','NM-79']);assert(rheoOnly279('NM-79')&&rheoOnly279('MP-82')&&!rheoOnly279('NM-22'));
assert.deepEqual([brakeSplit279('MP-82',800,{receptive:true}).regen,brakeSplit279('MP-82',800,{receptive:true}).rheo],[0,800],'El chopper no regenera aunque la línea sea receptiva');
{const a=brakeSplit279('NM-22',1000,{receptive:true});assert.equal(a.regen,1000);assert(a.V<VMAX279);const b=brakeSplit279('NM-22',6000,{receptive:true});assert.equal(b.V,VMAX279);assert(near(b.regen+b.rheo,6000,1e-6)&&b.rheo>0,'Arriba de 900 V el excedente va a resistencias');assert.equal(brakeSplit279('NM-22',900,{receptive:false}).rheo,900);}
// En el tablero: la Línea 8 nunca regenera; la Línea 1 sí.
{const e=mk(),m1=new Map(),m8=new Map();let regen8=0,rheo8=0,regen1=0;for(let i=0;i<3000;i++){e.step(.2);const s8=snapshot263(e,8,m8,{out:new Set(),open:new Set()}),s1=snapshot263(e,1,m1,{out:new Set(),open:new Set()});for(const r of s8.rows){assert(r.brakeType==='rheo');regen8+=r.regenKW;rheo8+=r.rheoKW;}regen1+=s1.totals.regenKW;}
 assert.equal(regen8,0,'Línea 8: NM-79 y MP-82 sin regeneración');assert(rheo8>0,'Línea 8 frena en resistencias');assert(regen1>0,'Línea 1: el NM-22 regenera');}
// En la vista 3D: regenerativo = caminos de tracción al revés; reostático = motor → resistencias del carro.
{const bp=brakePaths279({direction:1,line:1,model:'NM-22'},1000);assert.equal(bp.rheo.length,MOTOR_CARS250.length*4);assert(bp.regen.every(p=>/^regen/.test(p.kind)));
 const pos=bp.regen.find(p=>p.kind==='regenPositive');assert(pos.points[0][1]>pos.points.at(-1)[1]-.6&&Math.abs(pos.points.at(-1)[0]-1000)>200,'Sale del tren hacia la subestación');assert(bp.rheo.every(p=>p.length>0&&p.length<9.4&&Math.abs(p.points.at(-1)[0]-p.points[0][0])<8.4),'El reostático no sale del carro');}

// 2. Reactor de equilibrio.
{const w=reactorWaves279();assert(near(w.stats.udi0,1.35*REACTOR279.vll,1.5),'Udi0 ≈ 1.35 × 571 V');const vpk=REACTOR279.vll*Math.SQRT2;assert(near(w.stats.rippleY,vpk*(1-Math.cos(Math.PI/6)),.5),'Rizado de un puente de 6 pulsos');
 assert(w.stats.rippleOut<w.stats.rippleY/3,'Con el reactor el rizado de salida cae a menos de un tercio');assert.equal(w.stats.outHz,720);assert.equal(w.stats.reactorHz,360);assert(near(w.stats.reactorPeak,w.stats.rippleY,.5));
 for(let i=0;i<12;i++){const th=i/12*Math.PI*2;assert(near(sixPulse279(th,0),sixPulse279(th+Math.PI/3,0),1e-9),'Periodo de 60°');}
 const no=reactorWaves279({reactor:false});assert(no.stats.udi0>w.stats.udi0+15,'Sin reactor manda el pico del puente más alto');
 assert.deepEqual(bridgeCurrents279(3000,.3),{Y:1500,D:1500});let y=0;for(let i=0;i<360;i++){const c=bridgeCurrents279(3000,i/360*Math.PI*2,{reactor:false});assert(c.Y===3000||c.D===3000);y+=c.Y>0?1:0;}assert(near(y/360,.5,.02),'Sin reactor cada puente conduce la mitad del tiempo a corriente plena');
 assert(near(ratedCurrent279(),3333.3,.1));
 const r=buildBalanceReactor279(),n=new Set();r.traverse(o=>{if(o.isMesh)n.add(o.name);});for(const k of['Reactor_devanado_puente_Y','Reactor_devanado_puente_delta','Reactor_columna_nucleo','Reactor_yugo','Reactor_terminal_X1','Reactor_terminal_X2','Reactor_terminal_toma_central','Reactor_placa_datos','Reactor_resguardo_malla','Reactor_aislador_apoyo'])assert(n.has(k),'Falta '+k);}
// En la planta real (GLB): quita la bobina del gabinete y coloca el reactor detrás del rectificador.
{const buf=zlib.gunzipSync(fs.readFileSync(new URL('../dist/models/revision142/subestacion142.glb.gz',import.meta.url)));
 const m=(await new GLTFLoader().parseAsync(buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength),'')).scene;m.updateMatrixWorld(true);const parts=new Map(SR_PARTS126.map(p=>[p.id,m.getObjectByName(p.id)]));
 assert.equal(removeCabinetReactor279(parts),13,'Núcleo y 12 espiras');assert(!m.getObjectByName('Nucleo_reactor_equilibrio'));
 const rb=new THREE.Box3().setFromObject(parts.get('rectifier')),db=new THREE.Box3().setFromObject(parts.get('dc'));const r=placeBalanceReactor279(m,parts);assert.equal(placeBalanceReactor279(m,parts),r,'Se coloca una vez');m.updateMatrixWorld(true);
 let body=new THREE.Box3();r.traverse(o=>{if(o.isMesh&&!/resguardo|aviso/.test(o.name))body.union(new THREE.Box3().setFromObject(o));});
 assert(body.min.z>rb.max.z,'Detrás del gabinete del rectificador');assert(body.max.x<db.min.x+.2&&body.min.x>rb.min.x-.6,'Junto al rectificador');let wall=Infinity;m.traverse(o=>{if(o.isMesh&&/^Muro_posterior/.test(o.name))wall=Math.min(wall,new THREE.Box3().setFromObject(o).min.z);});assert(new THREE.Box3().setFromObject(r).max.z<wall,'Antes del muro posterior');
 assert(near(body.min.y,.05,.12),'Apoyado en el piso');assert(m.getObjectByName('Barra_toma_central_a_DUR'),'Barra hacia el D.U.R.');let p=r,under=false;while(p){if(p===parts.get('rectifier'))under=true;p=p.parent;}assert(under,'Pertenece al conjunto del rectificador');}

// 3. Regulación sobre el motor real.
{const e=mk(),proto=Object.getPrototypeOf(e).speedLimit,R=new Regulator279(e);assert.notEqual(e.speedLimit,proto);assert.equal(Object.getPrototypeOf(e).speedLimit,proto,'No cambia la clase');R.detach();assert.equal(e.speedLimit,proto,'Al desconectar vuelve el método original');}
assert.deepEqual(Object.keys(MODES279),['PA','CMC','CML']);assert.equal(SIGNALLING279[1].kind,'cbtc');assert.equal(SIGNALLING279[8].kind,'fixed');
// Cantones: estaciones y mitades.
{const e=mk(),B=blocks279(e.lines[8]);assert.equal(B.length,(e.lines[8].distances.length-1)*2+1);assert.equal(blockIndex279(B,B[3]+1),3);assert.deepEqual(occupancy279({position:1000,direction:1}),[850,1000]);assert.deepEqual(occupancy279({position:1000,direction:-1}),[1000,1150]);
 const occ=occupiedBlocks279(B,[{id:'a',position:B[4]+20,direction:1}],1);assert(occ.has(4)&&occ.has(3),'La cola ocupa el cantón de atrás');}
// CML: tope de 30 km/h; cambio de régimen solo detenido.
{const e=mk(),R=new Regulator279(e),t=e.trains.find(x=>x.line===1);assert(R.setMode(t.id,'CML').ok);let max=0,i=0;for(;i<3000;i++){e.step(.2);R.step(.2);max=Math.max(max,t.speed*3.6);}assert(max<=ASSUMED279.cmlKmh+.01&&max>20,'CML a '+max.toFixed(1)+' km/h');
 const moving=e.trains.find(x=>x.line===1&&x.speed>5);if(moving)assert.equal(R.setMode(moving.id,'CMC').ok,false,'No se cambia el régimen en marcha');assert(R.events.some(x=>/PA → CML/.test(x.text)));}
// Restricción temporal: nadie pasa de 25 km/h dentro del tramo.
{const e=mk(),R=new Regulator279(e),r=R.addLtv(1,3,6,25);let worst=0,seen=0;for(let i=0;i<4000;i++){e.step(.2);R.step(.2);for(const t of e.trains)if(t.line===1&&t.position>=r.from&&t.position<=r.to){seen++;worst=Math.max(worst,t.speed*3.6);}}assert(seen>50,'Pasan trenes por el tramo');assert(worst<=25.6,'Velocidad máxima en el tramo '+worst.toFixed(1));assert(R.removeLtv(r.id)&&!R.ltv.length);}
// ATP en CMC: ejercicio de sobrevelocidad → freno de urgencia → rearme detenido.
{const e=mk(),R=new Regulator279(e),t=e.trains.find(x=>x.line===8);assert(R.setMode(t.id,'CMC').ok);assert.equal(R.overspeed(t.id).ok,false,'Detenido no hay ejercicio');
 let i=0;while(i++<3000&&!(t.wait<=0&&t.speed>8)){e.step(.2);R.step(.2);}assert(t.speed>8,'El tren arranca');assert(R.overspeed(t.id).ok);e.step(.2);R.step(.2);assert(R.atp.get(t.id)?.braking,'El ATP actúa');assert(R.events.some(x=>x.level==='critical'&&/ATP: sobrevelocidad/.test(x.text)));
 assert.equal(R.rearm(t.id).ok,false,'No se rearma en marcha');for(let k=0;k<400&&t.speed>0;k++){e.step(.2);R.step(.2);}assert.equal(t.speed,0,'Se detiene');for(let k=0;k<50;k++){e.step(.2);R.step(.2);}assert.equal(t.speed,0,'Sigue detenido hasta el rearme');assert(R.rearm(t.id).ok);for(let k=0;k<200;k++){e.step(.2);R.step(.2);}assert(t.speed>0||t.wait>0,'Reanuda tras el rearme');}
// Hombre muerto: no aplica en PA; en CML frena.
{const e=mk(),R=new Regulator279(e),t=e.trains.find(x=>x.line===1);assert.equal(R.deadman(t.id).ok,false);R.setMode(t.id,'CML');let i=0;while(i++<3000&&!(t.wait<=0&&t.speed>3)){e.step(.2);R.step(.2);}assert(R.deadman(t.id).ok&&R.atp.get(t.id).braking&&/Hombre muerto/.test(R.atp.get(t.id).reason));}
// Bloque fijo en la Línea 8: un tren se detiene ante la señal del cantón que ocupa el de adelante.
{const e=mk(),R=new Regulator279(e),L=e.lines[8],B=blocks279(L),k=5,lead=e.trains.find(t=>t.line===8),fol=e.trains.find(t=>t.line===8&&t!==lead);
 for(const t of e.trains)if(t.line===8&&t!==lead&&t!==fol)t.position=L.distances[k]+4000*(t.direction>0?1:-1)+1e4;
 Object.assign(lead,{position:L.distances[k],direction:1,target:k,wait:9999,speed:0});const mid=(L.distances[k-1]+L.distances[k])/2;Object.assign(fol,{position:L.distances[k-1]+20,direction:1,target:k,wait:0,speed:8});
 for(let i=0;i<900;i++){lead.wait=9999;e.step(.2);R.step(.2);}const a=R.authority(fol);assert.equal(fol.speed,0,'El tren de atrás se detiene');assert.equal(a.kind,'signal');assert(a.dist<40&&fol.position<mid&&fol.position>mid-60,'Ante la señal de entrada del cantón ocupado ('+(mid-fol.position).toFixed(1)+' m antes)');
 assert.equal(R.rows(8).find(r=>r.id===fol.id).limitBy,'Señal en rojo');lead.wait=0;for(let i=0;i<900;i++){e.step(.2);R.step(.2);}assert(fol.position>mid,'Cuando se libera el cantón, avanza');}
// Con 10 trenes por línea nunca se encima un tren sobre otro del mismo sentido.
{const e=mk(10),R=new Regulator279(e);let minGap=Infinity;for(let i=0;i<5000;i++){e.step(.2);R.step(.2);const L8=e.trains.filter(t=>t.line===8);for(const t of L8)for(const o of L8){if(o===t||o.direction!==t.direction||o.wait>0&&(o.target===0||o.target===e.lines[8].stations.length-1))continue;const gap=(o.position-t.position)*t.direction;if(gap>0)minGap=Math.min(minGap,gap);}}
 assert(minGap>ASSUMED279.trainLength,'Separación mínima '+minGap.toFixed(0)+' m');}
// CBTC en la Línea 1: autoridad hasta la cola del tren de adelante menos el margen.
{const e=mk(),R=new Regulator279(e),L1=e.trains.filter(t=>t.line===1&&t.direction===1).sort((a,b)=>a.position-b.position);if(L1.length>1){const a=R.authority(L1[0]);assert.equal(a.kind,'cbtc');assert(near(a.dist,L1[1].position-ASSUMED279.trainLength-L1[0].position-ASSUMED279.cbtcMargin,1e-6));}}
// Regulación del intervalo y registro de eventos.
{const e=mk(8),R=new Regulator279(e);assert(R.reg[1].target>=60&&R.reg[1].target%15===0);R.setRegulation(1,true,400);R.setRegulation(8,true,400);for(let i=0;i<8000;i++){e.step(.2);R.step(.2);}assert(R.events.some(x=>/Regulación: retiene/.test(x.text)),'La regulación retiene trenes');assert(R.interval(1,1)>0);
 e.power[8]=false;R.step(.2);assert(/Corte de tensión/.test(R.events[0].text)&&R.events[0].level==='critical');e.power[8]=true;R.step(.2);assert(/restablecida/.test(R.events[0].text));assert(/^\d\d:\d\d:\d\d$/.test(clock279(e)));}

// 4. Agenda 2030.
assert.equal(FESEN279.value,.444);assert.deepEqual(ODS279.map(o=>o.ods),[7,9,11,13]);assert(/2030/.test(STC2030.text));
{const I=indicators279([{drawKWh:100,regenKWh:10,rheoKWh:5,srKWh:90},{drawKWh:50,regenKWh:0,rheoKWh:8,srKWh:50}],{boarded:1000});assert(near(I.co2AvoidedKg,10*.444,1e-9)&&near(I.co2LostKg,13*.444,1e-9));assert(near(I.brakeReuse,10/23,1e-9));assert(near(I.kWhPerPassenger,.14,1e-9));assert.equal(indicators279([],{}).kWhPerPassenger,null);}
const src=fs.readFileSync('dist/regulacion279.js','utf8');assert(!/prototype\.speedLimit\s*=|MetroEngine\.prototype/.test(src),'No parcha la clase del motor');
console.log('279 PASS: reactor de equilibrio (Udi0 1.35 × 571 V, 12 pulsos, reparto Id/2, colocado tras el rectificador), frenado reostático de NM-79/MP-82, consola de regulación (PA/CMC/CML, ATP, hombre muerto, bloque fijo, CBTC, restricciones, intervalo, eventos) y Agenda 2030 con FESEN 2024.');
