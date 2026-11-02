import assert from 'node:assert/strict';import fs from 'node:fs';import {TrainAudio} from '../dist/train-audio.js';
const closingManifest=JSON.parse(fs.readFileSync('dist/audio/cierre38/manifest.json'));
const manifest=JSON.parse(fs.readFileSync('dist/audio/revision30/manifest.json')),starts=[],stops=[];
const parameter=()=>({value:0,setTargetAtTime(){},setValueAtTime(){},linearRampToValueAtTime(){}});
const node=()=>({gain:parameter(),frequency:parameter(),connect(n){return n;},disconnect(){},start(){starts.push(this);},stop(){stops.push(this);this.onended?.();}});
class Context{currentTime=0;sampleRate=24000;destination={};createGain(){return node();}createOscillator(){return node();}createBufferSource(){return node();}createBuffer(a,n){return{getChannelData(){return new Float32Array(n);}};}resume(){return Promise.resolve();}decodeAudioData(){return Promise.resolve({duration:7});}}
globalThis.window={AudioContext:Context};globalThis.fetch=async url=>({ok:true,json:async()=>url.includes('cierre38/manifest')?closingManifest:manifest,arrayBuffer:async()=>new ArrayBuffer(8)});
const audio=new TrainAudio();await audio.enable();const train={id:'L1-01',line:1,position:0,target:0,stops:0,wait:30,speed:0};const engine={epoch:1,dwell:30,trains:[train],lines:{1:{stations:[{id:'L1-01'}],distances:[0]}},power:{1:true},emergency:false};const state={engine,currentLine:1,running:true};
audio.update(state,0);await new Promise(r=>setTimeout(r,0));assert(!audio.announcementActive);const initial=starts.length;
train.wait=0;train.speed=10;train.position=-100;audio.update(state,0);await new Promise(r=>setTimeout(r,0));assert(audio.announcementActive);assert.equal(starts.length,initial+1);const count=starts.length;audio.update(state,0);assert.equal(starts.length,count);assert(audio.references.has('L1-01'));
train.position=0;train.speed=0;train.wait=30;train.stops++;audio.update(state,0);assert(audio.announcementActive);assert.equal(starts.length,count);
state.running=false;audio.update(state,0);assert(!audio.announcementActive);assert(stops.length>0);
// A pending download must not start audio after pause/mute.
let resolve;globalThis.fetch=()=>new Promise(r=>resolve=r);const pending=audio.announcement('L8-01');audio.setEnabled(false);resolve({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)});assert.equal(await pending,false);
console.log('Audio: referencias cargadas, estación correcta, una reproducción por parada, silencio al pausar y cancelación de descarga al silenciar: correctos.');
// A slow download finishing after arrival must never play at the platform.
const delayed=new TrainAudio();globalThis.fetch=async url=>({ok:true,json:async()=>url.includes('cierre38/manifest')?closingManifest:manifest,arrayBuffer:async()=>new ArrayBuffer(8)});await delayed.enable();
train.stops=1;train.wait=0;train.speed=10;train.position=-100;state.running=true;
let finish;globalThis.fetch=()=>new Promise(r=>finish=r);delayed.update(state,0);const previousStarts=starts.length;
train.position=0;train.speed=0;train.wait=30;delayed.update(state,0);finish({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)});await new Promise(r=>setTimeout(r,0));assert.equal(starts.length,previousStarts);assert(!delayed.announcementActive);
console.log('Anuncio sólo durante aproximación; parada inicial silenciosa; el aviso iniciado termina sin reiniciarse al llegar; descarga tardía cancelada.');
// Every supplied station: one announcement for the approach, independent of
// repeated frames, camera changes, pausing, or arrival/stops counter changes.
globalThis.fetch=async url=>({ok:true,json:async()=>url.includes('cierre38/manifest')?closingManifest:manifest,arrayBuffer:async()=>new ArrayBuffer(8)});
for(const [stationId,clip]of Object.entries(manifest.stations)){
 const sound=new TrainAudio();await sound.enable();const t={id:'test-'+stationId,line:clip.line,target:0,position:0,speed:0,wait:30,stops:0};
 const s={running:true,currentLine:clip.line,engine:{epoch:1,dwell:30,trains:[t],lines:{[clip.line]:{stations:[{id:stationId}],distances:[0]}},power:{[clip.line]:true},emergency:false}};
 const baseline=starts.length;sound.update(s,0);await new Promise(r=>setTimeout(r,0));assert.equal(starts.length,baseline);
 const lead=Math.max(300,(clip.end-clip.start+5)*25);t.wait=0;t.speed=25;t.position=-(lead-10);
 sound.update(s,0);await new Promise(r=>setTimeout(r,0));assert.equal(starts.length,baseline+1,stationId+' aproxima');
 sound.announcementSource.onended();for(let i=0;i<4;i++)sound.update(s,0);await new Promise(r=>setTimeout(r,0));assert.equal(starts.length,baseline+1);
 sound.update(s,lead*10);sound.update(s,0);s.running=false;sound.update(s,0);s.running=true;sound.update(s,0);await new Promise(r=>setTimeout(r,0));assert.equal(starts.length,baseline+1);
 t.position=0;t.wait=30;t.speed=0;t.stops++;sound.update(s,0);await new Promise(r=>setTimeout(r,0));assert.equal(starts.length,baseline+1,stationId+' llegada');
 t.wait=0;t.speed=25;t.stops++;t.position=-(lead-10);sound.update(s,0);await new Promise(r=>setTimeout(r,0));assert.equal(starts.length,baseline+2,stationId+' nueva visita');sound.silence();
}
console.log('36 estaciones: una sola emisión antes de llegar, sin repetición por cámara/pausa/llegada, nueva emisión sólo en otra visita.');
