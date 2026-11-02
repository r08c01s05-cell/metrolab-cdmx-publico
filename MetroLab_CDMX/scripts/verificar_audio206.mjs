import assert from 'node:assert/strict';
import fs from 'node:fs';
import {TrainAudio} from '../dist/train-audio.js';
const manifest=JSON.parse(fs.readFileSync('dist/audio/cabina71/cierre_manifest.json'));
const wav=fs.readFileSync('dist/'+manifest.models['NM-22'].url);
assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');
let format,data;
for(let at=12;at+8<=wav.length;){const name=wav.toString('ascii',at,at+4),size=wav.readUInt32LE(at+4),value=wav.subarray(at+8,at+8+size);if(name==='fmt ')format=value;if(name==='data')data=value;at+=8+size+(size%2);}
assert(format&&data);assert.equal(format.readUInt16LE(0),1);assert.equal(format.readUInt16LE(2),1);assert.equal(format.readUInt16LE(14),16);
const sampleRate=format.readUInt32LE(4),seconds=data.length/2/sampleRate;assert.equal(seconds,5);
for(let second=0;second<5;second++){
 const samples=new Float64Array(sampleRate);let energy=0;
 for(let i=0;i<sampleRate;i++){samples[i]=data.readInt16LE((second*sampleRate+i)*2)/32768;energy+=samples[i]**2;}
 assert(Math.sqrt(energy/sampleRate)>.04,'Audible recording throughout second '+second);
 let tone=0;
 for(let frequency=320;frequency<=390;frequency+=.5){let re=0,im=0;for(let i=0;i<samples.length;i++){const phase=2*Math.PI*frequency*i/sampleRate;re+=samples[i]*Math.cos(phase);im+=samples[i]*Math.sin(phase);}tone=Math.max(tone,Math.hypot(re,im)*2/sampleRate);}
 assert(tone>.025,'The recorded warning tone, not only background noise, spans second '+second);
}
assert.equal(manifest.manual_message.url,'audio/cabina71/permita_cierre.mp3','Manual speech remains the original clip');
const played=[],node=()=>({connect(next){return next;},disconnect(){},gain:{value:0},start(...args){this.started=args;played.push(this);},stop(at){this.stopAt=at;if(at===undefined)this.onended?.();}});
const context={currentTime:10,createGain:node,createBufferSource:node},audio=new TrainAudio();Object.assign(audio,{enabled:true,context,master:{},closingReferences:new Map()});
for(const model of ['NM-22','NM-79','MP-82']){
 assert.equal(manifest.models[model].url,manifest.models['NM-22'].url);audio.closingReferences.set(model,Promise.resolve({duration:5}));
 const train={id:model,model,line:1,wait:6.5},engine={operator:{trainId:model,phase:'warning'},power:{1:true},emergency:false};
 context.currentTime=10;assert(await audio.warning(1,train,engine));let source=played.at(-1);assert.deepEqual(source.started,[0,0]);assert.equal(source.stopAt,15,'Full five-second warning');
 train.wait=4;context.currentTime=12.5;assert(await audio.warning(1,train,engine));source=played.at(-1);assert.deepEqual(source.started,[0,2.5]);assert.equal(source.stopAt,15,'Resuming uses the remaining warning interval');
 audio.silence();assert.equal(audio.closingSources.size,0,'Pause/mute stops the warning');
}
let resolve;audio.enabled=true;audio.closingReferences.set('delayed',new Promise(r=>resolve=r));const pending=audio.warning(1,{id:'delayed',model:'delayed',line:1,wait:6.5},{power:{1:true}});audio.setEnabled(false);const before=played.length;resolve({duration:5});assert.equal(await pending,false);assert.equal(played.length,before,'A late decode cannot play after mute');
console.log('206 PASS: actual WAV contains five seconds of audible recorded warning tone, all models use it, manual closing schedules the full interval, resume seeks correctly, mute and late-decode guards remain intact.');
