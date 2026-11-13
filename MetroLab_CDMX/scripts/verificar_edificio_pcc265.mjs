// Edificios de los P.C.C. 265: pisos del P.C.C. 1 como los rotulan las diapositivas, equipo por
// piso, fachada y subestación de alumbrado y fuerza del P.C.C. 2.
import assert from 'node:assert/strict';import fs from 'node:fs';
import {FLOORS265,BUILDINGS265,ASSUMED265,floorBase265,floorHeight265,buildPcc1,buildPcc2} from '../dist/pcc-building265.js';
assert.deepEqual(FLOORS265.map(f=>f.name),['Sótano','Planta baja','Primer piso','Segundo piso','Tercer piso','Cuarto piso','Quinto piso','Sexto piso']);
const F=id=>FLOORS265.find(f=>f.id===id);
assert(/Jamaica y Nonoalco/.test(F('sotano').slide)&&/TA1, TA2, TB1, TB2/.test(F('pb').slide)&&/Lockers/.test(F('p1').slide)&&/subestaciones de rectificación/.test(F('p2').slide)&&/Bodegas/.test(F('p3').slide)&&/Mando centralizado/.test(F('p4').slide)&&/Puesto Central de Control/.test(F('p5').slide)&&/BINOI/.test(F('p6').slide));
assert(F('pb').items.some(x=>/80 toneladas/.test(x))&&F('p2').items.includes('Cuatro buses de tracción')&&F('p2').items.includes('Dos buses de alumbrado')&&F('p5').items.some(x=>/P\.D\.C\./.test(x)));
assert.equal(floorBase265(0),-ASSUMED265.basement);assert.equal(floorBase265(1),0);for(let i=1;i<8;i++)assert(Math.abs(floorBase265(i)-floorBase265(i-1)-floorHeight265(i-1))<1e-9,'Los pisos apilan sin huecos');
assert.deepEqual(BUILDINGS265.map(b=>b.id),['pcc1','pcc2']);assert(/1, 2, 3, 4, 5 y 6/.test(BUILDINGS265[0].lines));assert(/7, 8, 9 y B/.test(BUILDINGS265[1].lines)&&/Delicias 67/.test(BUILDINGS265[1].place));
const b=buildPcc1(),names=new Map();b.traverse(o=>{if(o.name)names.set(o.name,(names.get(o.name)||0)+1);});const has=(n,c=1)=>assert((names.get(n)||0)>=c,`Falta ${n} ×${c}`);
assert.equal(b.userData.floors.length,8);b.userData.floors.forEach((f,i)=>{assert.equal(f.position.y,floorBase265(i));assert(f.userData.content.children.length>3,'Piso con equipo: '+f.name);});
for(const n of['A','B']){has('Interruptor_Oerlikon_'+n);has('Bus_85kV_'+n,3);has('Mufa_llegada_'+n,3);has('TP_'+n,3);has('TC_'+n,3);has('Cuchilla_tierra_'+n);has('Tanque_CO2_'+n,2);has('Camara_Soule_'+n);has(`Seccionador_Soule_S${n}1`);has(`Seccionador_Soule_S${n}2`);}
has('SRM_seccionador_rotativo_medio');has('Muro_divisor_buses');for(const t of['TA1','TA2','TB1','TB2','Reserva'])has('Transformador_'+t);has('Puente_grua_viajera_80t');has('Galeria_cables_15kV',2);has('Lockers',4);
for(let k=1;k<=4;k++)has('Bus_traccion_'+k);has('Bus_alumbrado_1');has('Bus_alumbrado_2');assert(!names.has('Bus_alumbrado_3')&&!names.has('Bus_traccion_5'));has('Interruptor_15kV_fila1',10);
has('Grupo_volante_volante');has('Sala_relevadores',20);has('Banco_baterias',6);has('Programa_general_trafico');has('Tablero_distribucion_PDC');for(let k=1;k<=3;k++)has('Oficina_gerencia_L'+k);has('Simulador');has('Conmutador_general',2);has('BINOI');has('Videovigilancia_muro');
// The S.R.M. sits on the wall between both bus chambers; side A west, side B east; 85 kV in the north half.
const srm=b.getObjectByName('SRM_seccionador_rotativo_medio');assert.equal(srm.position.x,0);assert(b.getObjectByName('Interruptor_Oerlikon_A').position.x<0&&b.getObjectByName('Interruptor_Oerlikon_B').position.x>0);assert(b.getObjectByName('Interruptor_Oerlikon_A').position.z<0&&b.getObjectByName('Tanque_aceite_cables_85kV').position.z>0);
has('Azotea_roja');has('Domo_blanco');has('Celosia_vertical');has('Portico_columna',8);assert(b.userData.shell.name==='Fachada');
const p2=buildPcc2(),n2=new Map();p2.traverse(o=>{if(o.name)n2.set(o.name,(n2.get(o.name)||0)+1);});assert.equal(n2.get('Transformador_500kVA'),2);assert.equal(n2.get('Cabina_N'),2);assert.equal(n2.get('Cabina_P'),1);assert(n2.has('Cable_15kV_AA_109')&&n2.has('Cable_15kV_AB_109')&&n2.has('Volumen_no_descrito'));
// 267: P.C.C. 2 con sala de regulación, cuarto técnico y subestación.
{const {AREAS267,PCC2_LINES267,TCO_PARTS267,PCC2_NOTES267,paintTco267}=await import('../dist/pcc-building265.js');
 assert.deepEqual(AREAS267.map(a=>a.id),['regulacion','tecnico','sef']);assert.deepEqual(PCC2_LINES267.map(l=>l.id),['7','8','9','B','12']);assert.deepEqual(PCC2_LINES267.filter(l=>l.onlyInfographic).map(l=>l.id),['12'],'La Línea 12 solo viene en la infografía');
 assert.deepEqual(TCO_PARTS267,['Reloj madre','Indicador de retrasos','Control de tráfico','Número de tren','Estación','Alimentación de tracción']);
 assert(AREAS267[0].items.some(x=>/24 trenes/.test(x)&&/300 usuarios/.test(x)));assert(AREAS267[1].items.some(x=>/CBTC/.test(x))&&AREAS267[1].items.some(x=>/Pantitlán - Isabel la Católica/.test(x))&&/redundante/.test(AREAS267[1].items.join(' ')));
 assert(PCC2_NOTES267.some(x=>/Delicias 67/.test(x)&&/Zaragoza/.test(x)),'Se declara la discrepancia de ubicación');
 assert.equal(p2.userData.floors.length,3);for(const L of PCC2_LINES267){assert.equal(n2.get('Tablero_control_optico_L'+L.id),1);assert.equal(n2.get('Reloj_madre_L'+L.id),1);assert.equal(n2.get('Pupitre_regulador_L'+L.id),3);}
 assert(n2.get('Gabinete_respaldo_telecom')>=4&&n2.get('Gabinete_respaldo_CBTC')>=4&&n2.has('Enlace_galeria_subterranea')&&n2.has('Plafon_circular'));
 const xs=p2.userData.floors.map(f=>f.userData.center);assert(xs[0]<xs[1]&&xs[1]<xs[2]);
 const calls=[];const ctx=new Proxy({},{get:(t,k)=>(...a)=>{calls.push([k,a]);},set:()=>true});assert.equal(paintTco267(ctx,PCC2_LINES267[1]),TCO_PARTS267.length);const texts=calls.filter(c=>c[0]==='fillText').map(c=>c[1][0]);assert(texts.includes('Línea 8')&&texts.includes('CONTROL DE TRÁFICO')&&texts.includes('ALIMENTACIÓN DE TRACCIÓN')&&texts.includes('RETRASOS'));
 console.log('267 PASS: P.C.C. 2 con sala de regulación (5 tableros de control óptico), cuarto técnico de respaldo CBTC y subestación de alumbrado y fuerza; fuentes y discrepancias declaradas.');}
const g=fs.readFileSync(new URL('../dist/game86.js',import.meta.url),'utf8');assert(/\['pcc','06','Puestos Centrales de Control'/.test(g)&&/mode==='pcc'\)\{await import\('\.\/pcc-building265\.js/.test(g));
console.log('265 PASS: P.C.C. 1 con sótano, planta baja y seis pisos según las diapositivas (85 kV al norte, S.R.M. en el muro divisor, 4 transformadores y reserva, 4 buses de tracción y 2 de alumbrado, P.D.C. en el quinto piso), fachada y subestación de alumbrado y fuerza del P.C.C. 2.');
// 266: acabados. Cada tipo de pieza recibe su textura; sombras y contornos sin tocar la geometría documentada.
{const {kindOf266,dress266,paint266,KINDS266}=await import('../dist/pcc-building265.js');
 assert.equal(kindOf266('Losa_p2'),'concrete');assert.equal(kindOf266('Terreno'),'asphalt');assert.equal(kindOf266('Interruptor_15kV_fila3'),'cabinet');assert.equal(kindOf266('Transformador_TA1'),'metal');assert.equal(kindOf266('Mufa_llegada_A'),'porcelain');assert.equal(kindOf266('Celosia_vertical'),'slats');assert.equal(kindOf266('Radiador_TB2'),'ribbed');assert.equal(kindOf266('Videovigilancia_pantalla'),'screen');assert.equal(kindOf266(''),null);
 const calls=[];const ctx=new Proxy({},{get:(t,k)=>k==='createLinearGradient'?()=>({addColorStop(){}}):(...a)=>{calls.push(k);},set:()=>true});for(const k of KINDS266){calls.length=0;paint266(k,ctx);assert(calls.includes('fillRect'),'Textura '+k+' dibuja');}
 const b1=buildPcc1(),before=[];b1.traverse(o=>{if(o.isMesh)before.push(o.name);});const n=dress266(b1);assert(n>400,'Se visten las piezas: '+n);let shadows=0,edges=0,meshes=[];b1.traverse(o=>{if(o.name==='Contorno266')edges++;else if(o.isMesh){meshes.push(o.name);if(o.castShadow)shadows++;}});
 assert.deepEqual(meshes,before,'No se agregan ni quitan piezas');assert(shadows>300&&edges>300);assert(!b1.getObjectByName('Terreno').castShadow);assert.equal(b1.getObjectByName('Transformador_TA1').userData.kind266,'metal');
 assert.notEqual(b1.getObjectByName('Transformador_TA1').material,b1.getObjectByName('Radiador_TA1').material);assert(dress266(buildPcc2())>10);
 console.log('266 PASS: acabados del apartado P.C.C. (9 texturas procedurales, sombras y contornos) sin cambiar las piezas.');}
