import fs from 'node:fs';import assert from 'node:assert/strict';import {TrainAudio} from '../dist/train-audio.js';
const closingManifest=JSON.parse(fs.readFileSync('dist/audio/cabina71/cierre_manifest.json'));
const manifest=JSON.parse(fs.readFileSync('dist/audio/cabina71/estaciones_manifest.json'));
const data=JSON.parse(fs.readFileSync('dist/datos.json'));data.demanda_horaria=JSON.parse(fs.readFileSync('dist/demanda_horaria.json'));
let currentEngine,currentTrain,events=[],sources=[];
const param=()=>({value:0,setTargetAtTime(){},setValueAtTime(){},linearRampToValueAtTime(){}});
class Context{
 currentTime=0;sampleRate=100;destination={};
 node(buffer=false){const ctx=this;return {gain:param(),frequency:param(),connect(n){return n;},disconnect(){},start(){if(buffer&&!this.loop){this.end=ctx.currentTime+7;sources.push(this);const line=currentEngine.lines[currentTrain.line];if(!this.buffer.isClosing)events.push({station:line.stations[currentTrain.target].id,visit:currentTrain.stops,remaining:Math.abs(currentTrain.position-line.distances[currentTrain.target]),wait:currentTrain.wait});}},stop(){this.finished=true;this.onended?.();}};}
 createGain(){return this.node();}createBiquadFilter(){return this.node();}createOscillator(){return this.node();}createBufferSource(){return this.node(true);}createBuffer(a,n){return{getChannelData(){return new Float32Array(n);}};}resume(){return Promise.resolve();}decodeAudioData(bytes){return Promise.resolve({duration:7,isClosing:new Uint8Array(bytes)[0]===1});}
}
globalThis.window={AudioContext:Context};globalThis.fetch=async url=>({ok:true,json:async()=>url.includes('marcha_manifest')?JSON.parse(fs.readFileSync('dist/audio/cabina71/marcha_manifest.json')):url.includes('cierre_manifest')?closingManifest:manifest,arrayBuffer:async()=>new Uint8Array([/aviso_cierre|permita_cierre|marcha_cabina/.test(url)?1:0]).buffer});await import('../dist/engine.js');
for(const line of [1,8])for(const rate of [1,8]){
 currentEngine=new window.MetroEngine(data);currentEngine.fleet=1;currentEngine.reset();currentTrain=currentEngine.trains.find(t=>t.line===line);events=[];sources=[];
 const audio=new TrainAudio();await audio.enable();const state={engine:currentEngine,running:true,currentLine:line,selectedTrain:currentTrain.id};
 for(let real=0;currentEngine.time<900;real+=.25){
  for(let n=0;n<rate*5;n++)currentEngine.step(.05);audio.context.currentTime=real;
  for(const source of sources)if(!source.finished&&real>=source.end){source.finished=true;source.onended?.();}
  // Camera may stay far behind; announcements belong to the selected train.
  audio.update(state,-5000,rate);for(let n=0;n<10;n++)await Promise.resolve();
 }
 assert(events.length>=3,'L'+line+' ×'+rate+' no avisos');assert(events.every(e=>e.wait===0&&e.remaining>1));
 assert.equal(new Set(events.map(e=>e.visit+':'+e.station)).size,events.length);
 console.log('Motor real L'+line+' ×'+rate+': '+events.length+' aproximaciones anunciadas una vez, antes de detenerse, con cámara alejada.');audio.silence();
}
