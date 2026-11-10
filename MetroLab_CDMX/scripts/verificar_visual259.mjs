// Rendimiento y acabado 259: nivel de detalle del tren por distancia, tope de pasajeros detallados
// y capa de desgaste en coordenadas del mundo.
import assert from 'node:assert/strict';import * as THREE from 'three';
import {LOD259,carTier259,classifyCar259,updateTrainLod259} from '../dist/train-lod259.js';
import {DETAILED259,detailedBudget259} from '../dist/passenger-budget259.js';
import {WEATHER_KINDS259,weatherKind259,bindWeather259,weatherRoot259,updateWeathering259} from '../dist/weathering259.js';

// Tiers with hysteresis.
assert.equal(carTier259(10),0);assert.equal(carTier259(60),1,'A media distancia solo se omiten gomas y sellos');
assert.equal(carTier259(100),3);assert.equal(carTier259(150),7);assert.equal(carTier259(150,0,1,true),5,'En vista con corte el interior se conserva');
assert.equal(carTier259(LOD259.interior+3,0),1,'Sin pasar el margen no cambia');assert.equal(carTier259(LOD259.interior-3,3),3,'Ni regresa hasta alejarse del umbral');
assert.equal(carTier259(100,0,1.6),1,'En calidad cinemática los umbrales se alejan');
// A car like the ones metro-render builds.
const mesh=(name,family,box=[1,1,1],pos=[0,0,0])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...box),new THREE.MeshStandardMaterial());m.name=name;if(family)m.userData.familia_visual=family;m.position.set(...pos);return m;};
function makeCar(index){const car=new THREE.Group();car.userData.carIndex=index;car.position.x=(index-4)*16.7;
 car.add(mesh('interior__batched','interior'),mesh('interiorDisplay52__batched','interiorDisplay52'),mesh('exterior__batched','exterior'),mesh('roof__batched','roof'),mesh('wallPos__batched','wallPos'),mesh('traction__batched','traction',[6,.6,2],[0,.6,0]),mesh('mecanica__batched','mecanica',[3,.4,2],[4,.8,0]));
 for(const sign of[-1,1]){const pivot=new THREE.Group();pivot.name='Bogie_articulado212_'+sign;pivot.userData.bogie212=sign;pivot.position.x=sign*5.5;pivot.add(mesh('mecanica__batched','mecanica',[3,.9,2.4],[0,.5,0]),mesh('exterior__batched','exterior',[1,1,.3],[0,.5,1]));car.add(pivot);}
 const doors=new THREE.Group();doors.name='Scene';doors.add(mesh('Puerta_S1_1_Hoja_1'),mesh('Puerta_S1_1_Hoja_1__Goma'),mesh('Sello_metalico_puerta'));car.add(doors);return car;}
const group=new THREE.Group();for(let i=0;i<9;i++)group.add(makeCar(i));const roof=[],cutWalls=[];group.traverse(o=>{if(o.userData.familia_visual==='roof')roof.push(o);if(o.userData.familia_visual==='wallPos')cutWalls.push(o);});
const sets=classifyCar259(group.children[0]);assert.deepEqual([sets.interior.length,sets.under.length,sets.seals.length,sets.bogies.length,sets.bogies[0].meshes.length],[2,2,2,2,2]);
const view={camera:{position:new THREE.Vector3(0,60,170)},trainMeshes:new Map([['L1-01',{group,roof,cutWalls,detailed:true}]])};
let s=updateTrainLod259(view);assert.deepEqual(s,{cars:9,interiorHidden:9,underHidden:9,sealsHidden:9},'Tren lejano: todo reducido');
const car=group.children[4],by=n=>car.getObjectByName(n);
assert.equal(by('interior__batched').layers.mask,2);assert.equal(by('exterior__batched').layers.mask,1,'La carrocería se queda');assert.equal(by('Puerta_S1_1_Hoja_1').layers.mask,1,'Las hojas de puerta se quedan');assert.equal(by('Sello_metalico_puerta').layers.mask,2);
const bogie=by('Bogie_articulado212_1'),proxy=bogie.getObjectByName('Bogie_lejano259');assert(proxy&&proxy.layers.mask===1&&bogie.children[0].layers.mask===2,'El bogie se cambia por un volumen simple');
assert(Math.abs(proxy.scale.x-3*.9)<1e-6&&Math.abs(proxy.position.y-.5)<1e-6,'El volumen ocupa el lugar del bogie');
const under=by('Equipo_bajo_bastidor_lejano259');assert(under&&Math.abs(under.scale.x-8.5*.94)<1e-6,'Un volumen para el equipo bajo bastidor');
let hidden=0;group.traverse(o=>{if(!o.visible)hidden++;});assert.equal(hidden,0,'No se toca .visible: lo usan cortes, puertas y cabina');
// Cut-away view keeps the interior; near camera restores everything.
roof[0].visible=false;view.camera.position.set(0,60,170);for(const c of group.children)c.userData.lod259.applied=false;s=updateTrainLod259(view);assert.equal(s.interiorHidden,0,'Con el techo cortado se ve el interior');assert.equal(s.underHidden,9);roof[0].visible=true;
view.camera.position.set(0,2,4);s=updateTrainLod259(view);assert(s.interiorHidden<9&&by('interior__batched').layers.mask===1&&proxy.layers.mask===2&&bogie.children[0].layers.mask===1,'De cerca vuelve el detalle');
assert(group.children[0].getObjectByName('interior__batched').layers.mask===1&&group.children[8].getObjectByName('Sello_metalico_puerta').layers.mask===2,'Cada carro decide por su distancia');
const proxies=[];group.traverse(o=>{if(o.userData.proxy259)proxies.push(o);});assert.equal(proxies.length,27,'Los volúmenes se crean una sola vez');assert.equal(classifyCar259(car).bogies[0].meshes.length,2,'Y no se cuentan como piezas del bogie');
// Detailed passenger budget.
assert.equal(detailedBudget259('passenger','balanced'),14);assert.equal(detailedBudget259('passenger','cinematic'),24);assert.equal(detailedBudget259('driver','cinematic'),DETAILED259.cab);assert.equal(detailedBudget259('driver','performance'),8);
// Weathering kinds.
const mat=(name,extra={})=>Object.assign(new THREE.MeshStandardMaterial({name}),extra);
assert.equal(weatherKind259(mat('Concreto tunel')),WEATHER_KINDS259.tunnel);assert.equal(weatherKind259(mat('Acero alma riel')),WEATHER_KINDS259.rail);assert.equal(weatherKind259(mat('Acero pista rodamiento')),WEATHER_KINDS259.runway);
assert.equal(weatherKind259(mat('Acero barra guia')),WEATHER_KINDS259.guide);assert.equal(weatherKind259(mat('Piso pasillo54 · referencia L1-01 213')),WEATHER_KINDS259.floor);assert.equal(weatherKind259(mat('Revestimiento stone · referencia L1-01 213')),WEATHER_KINDS259.wall);
{const steel=mat('Acero satinado · referencia L1-01 213');steel.userData.referenceRole213='floor';assert.equal(weatherKind259(steel),0,'El acero de la estación no se envejece');
 assert.equal(weatherKind259(mat('Concreto tunel',{transparent:true})),0);const label=mat('Piso mapa');label.userData.realism110='label';assert.equal(weatherKind259(label),0,'Letreros y mapas quedan intactos');assert.equal(weatherKind259(new THREE.MeshBasicMaterial({name:'Concreto tunel'})),0);}
// Shader patch on the real three.js standard shader.
{const m=mat('Concreto tunel'),key=m.customProgramCacheKey();bindWeather259(m,1);assert.notEqual(m.customProgramCacheKey(),key);assert(m.customProgramCacheKey().endsWith('|weather259:1'));
 const shader={uniforms:{},vertexShader:THREE.ShaderLib.standard.vertexShader,fragmentShader:THREE.ShaderLib.standard.fragmentShader};m.onBeforeCompile(shader,null);
 assert(shader.uniforms.weatherEnabled259&&/#define WEATHER259 1/.test(shader.fragmentShader)&&/vWorld259=\(modelMatrix\*wp259\)\.xyz/.test(shader.vertexShader)&&/USE_BATCHING/.test(shader.vertexShader),'Posición de mundo también con piezas agrupadas e instanciadas');
 assert(/roughnessFactor\+rough259/.test(shader.fragmentShader)&&shader.fragmentShader.indexOf('float rough259')<shader.fragmentShader.indexOf('roughnessFactor+rough259'));
 const again=shader.fragmentShader;m.onBeforeCompile(shader,null);assert.equal(shader.fragmentShader,again,'No se aplica dos veces');
 const fn=m.onBeforeCompile;bindWeather259(m,1);assert.equal(m.onBeforeCompile,fn);}
// Scene sweep: skips trains and people, examines each material once.
{const scene=new THREE.Scene(),tunnel=new THREE.Mesh(new THREE.BoxGeometry(),mat('Concreto tunel')),people=new THREE.Group();people.name='Pasajeros_distantes121';const person=new THREE.Mesh(new THREE.BoxGeometry(),mat('Piso raro'));people.add(person);
 const train=new THREE.Group(),body=new THREE.Mesh(new THREE.BoxGeometry(),mat('Piso tren'));train.add(body);scene.add(tunnel,people,train);
 const v={scene,trainMeshes:new Map([['a',{group:train}]])};assert.equal(updateWeathering259(v),1);assert.equal(tunnel.material.userData.weather259,1);assert(!person.material.userData.weather259&&!body.material.userData.weather259,'Ni personas ni trenes');
 assert.equal(updateWeathering259(v),0,'Solo barre cada cierto número de cuadros');assert.equal(weatherRoot259(scene),1,'El piso del tren solo se excluye en el barrido de la vista');assert.equal(weatherRoot259(scene),0,'Cada material se examina una vez');}
console.log('259 PASS: tren por niveles de detalle con capas (interior, bajo bastidor y sellos; volúmenes simples a lo lejos; corte conserva interior), tope de pasajeros detallados por calidad y capa de desgaste en túnel, vía, pisos y muros.');
