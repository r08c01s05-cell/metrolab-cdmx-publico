import fs from 'node:fs';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import crypto from 'node:crypto';import {TrainAudio} from '../dist/train-audio.js';
const manifest=JSON.parse(fs.readFileSync('dist/audio/cabina71/cierre_manifest.json')),stations=JSON.parse(fs.readFileSync('dist/audio/cabina71/estaciones_manifest.json'));
const checks=new Set();for(const [model,clip]of Object.entries(manifest.models)){
 const file='dist/'+clip.url,b=fs.readFileSync(file),duration=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',file]));assert(Math.abs(duration-clip.duration)<.1);assert(b.length>10000);checks.add(crypto.createHash('sha256').update(b).digest('hex'));
 const pcm=execFileSync('ffmpeg',['-v','error','-i',file,'-f','s16le','-ac','1','-ar','22050','pipe:1']);let sum=0;for(let i=0;i<pcm.length;i+=2)sum+=(pcm.readInt16LE(i)/32768)**2;assert(Math.sqrt(sum/(pcm.length/2))>.01,model+' audible');
 assert(clip.reference_only&&clip.source_model==='Referencia común aportada');
}assert.equal(checks.size,1);
let oscillatorCount=0,playing=[],stopping=[];const param=()=>({value:0,setTargetAtTime(){},setValueAtTime(){},linearRampToValueAtTime(){}});
const node=()=>({gain:param(),frequency:param(),connect(n){return n;},disconnect(){},start(){playing.push(this);},stop(){stopping.push(this);this.onended?.();}});
class Context{currentTime=0;sampleRate=100;destination={};createGain(){return node();}createBiquadFilter(){return node();}createOscillator(){oscillatorCount++;return node();}createBufferSource(){return node();}createBuffer(a,n){return{getChannelData(){return new Float32Array(n);}};}resume(){return Promise.resolve();}decodeAudioData(bytes){return Promise.resolve({duration:2,bytes});}}
globalThis.window={AudioContext:Context};globalThis.fetch=async url=>({ok:true,json:async()=>url.includes('marcha_manifest')?JSON.parse(fs.readFileSync('dist/audio/cabina71/marcha_manifest.json')):url.includes('cierre_manifest')?manifest:stations,arrayBuffer:async()=>{const b=fs.readFileSync('dist/'+url);return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);}});
for(const model of ['NM-79','MP-82','NM-22']){
 const audio=new TrainAudio();await audio.enable();assert.equal(audio.closingReferences.size,3);const baseline=playing.length,oscillators=oscillatorCount;
 const t={id:'train-'+model,model,line:model==='NM-22'?1:8,position:0,target:0,stops:1,wait:3.3,speed:0};
 const s={currentLine:t.line,selectedTrain:t.id,running:true,engine:{epoch:1,trains:[t],lines:{[t.line]:{stations:[{id:t.line===1?'L1-01':'L8-01'}],distances:[0]}},power:{[t.line]:true}}};
 audio.update(s,0);await new Promise(r=>setTimeout(r,0));assert.equal(playing.length,baseline+1);assert.equal(playing.at(-1).buffer,await audio.closingReferences.get(model));assert.equal(oscillatorCount,oscillators,'sin aviso sintetizado');
 audio.update(s,0);await new Promise(r=>setTimeout(r,0));assert.equal(playing.length,baseline+1);
 t.wait=0;t.speed=10;audio.update(s,0);assert(stopping.includes(playing.at(-1)),'corte al partir');
 t.stops++;t.wait=3.3;t.speed=0;audio.update(s,0);await new Promise(r=>setTimeout(r,0));assert.equal(playing.length,baseline+2);
 s.running=false;audio.update(s,0);assert(stopping.includes(playing.at(-1)));
}
console.log('Grabación común aportada no silenciosa, mapeo en los tres modelos, precarga, aviso único, sin osciladores de cierre, corte al partir/pausar: correctos.');
