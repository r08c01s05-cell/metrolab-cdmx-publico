import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as Three from 'three';
import {chapters,buildChapter,disposeChapter} from '../dist/recorrido-escenas275.js';
import {tractionFrame278} from '../dist/recorrido-traccion278.js';

const fetchAsset=globalThis.fetch;
globalThis.fetch=async (url,options)=>{
 const resource=new URL(url);
 if(resource.protocol!=='file:')return fetchAsset(url,options);
 const bytes=await readFile(resource,{signal:options?.signal});
 return new Response(bytes,{status:200});
};
globalThis.self=globalThis;
// La prueba CPU conserva mallas, materiales y UV; la decodificación de imágenes se verifica en navegador.
globalThis.createImageBitmap=async()=>({width:1,height:1,close(){}});

const before=tractionFrame278(0),peak=tractionFrame278(6),coast=tractionFrame278(22);
const brake=tractionFrame278(32),stopped=tractionFrame278(43),cooled=tractionFrame278(48);
assert.equal(before.distance,0);
assert(peak.current>.95&&peak.distance>0);
assert(coast.current===0&&coast.distance>peak.distance);
assert(brake.current===0&&brake.braking>.9&&brake.heat>.9&&brake.distance>coast.distance);
assert(stopped.distance===cooled.distance&&cooled.braking===0&&cooled.heat===0);
for(let t=0;t<48;t+=.25)assert(tractionFrame278(t+.25).distance>=tractionFrame278(t).distance-1e-9);

const signal=new AbortController().signal;
for(const source of ['runningGear','steel','traction','supply','pcc']){
 const chapter=chapters.find(item=>item.source===source);
 const scene=await buildChapter(chapter,signal);
 const point=new Three.Vector3();
 for(const [at,,,id] of chapter.cues){
  scene.animate(at/chapter.duration,id);
  if(id)assert(scene.anchor(id,point)?.toArray().every(Number.isFinite),id);
 }
 if(source==='runningGear'){
  const wheelGroups=scene.root.getObjectsByProperty('name','Neumático portador GLB');
  assert.equal(wheelGroups.length,4);
  assert(wheelGroups.every(group=>group.children.length===1&&group.children[0].geometry.index.count>100));
  assert(scene.root.getObjectByName('Vía GLB de Zaragoza').children.some(object=>object.name.startsWith('Pista_de_rodamiento')));
  const position=seconds=>{
   scene.animate(seconds/chapter.duration);
   return scene.anchor('shoe',new Three.Vector3());
  };
  const start=position(0);
  assert(position(15).distanceTo(start)>.5);
  assert(position(53).distanceTo(start)<1e-6);
 }
 if(source==='traction'){
  assert(scene.root.getObjectByName('Cofre GLB de referencia').children.length>5);
  scene.animate(0);
  const start=scene.anchor('shoe',new Three.Vector3());
  scene.animate(1,'resistor');
  assert(scene.anchor('shoe',point).x>start.x);
 }
 if(source==='supply'){
  assert(scene.root.getObjectByName('GLB NM-22'));
  assert(scene.root.getObjectByName('GLB transformer'));
  assert(scene.root.getObjectByName('GLB rectifier'));
 }
 if(source==='pcc'){
  const building=scene.root.getObjectByName('Edificio_PCC1');
  const {shell,floors}=building.userData;
  scene.animate(0);
  assert(shell.visible);
  scene.animate(8/chapter.duration);
  assert(!shell.visible&&floors.every(floor=>floor.visible));
  scene.animate(88/chapter.duration,'p5');
  assert.deepEqual(floors.filter(floor=>floor.visible).map(floor=>floor.userData.id),['p5']);
 }
 disposeChapter(scene.root);
}
for(const name of ['NM79','MP82']){
 const chapter=chapters.find(item=>item.path===`models/${name}_cabina.glb.gz`);
 const scene=await buildChapter(chapter,signal);
 scene.animate(0,'body');
 assert(scene.anchor('body',new Three.Vector3()));
 scene.animate(.9,'brushes');
 assert(scene.anchor('brushes',new Three.Vector3()));
 disposeChapter(scene.root);
}
assert.equal(chapters.at(-1).source,'control');
console.log('278 PASS: captadores, despiece y rearme, arranque, inercia, frenado, etapas de alimentación y pisos del PCC.');
