// Station announcements and door warnings extracted from user videos.
export class TrainAudio {
 constructor(){this.enabled=false;this.seen=new Set();this.nodes=new Set();this.volume=.28;this.references=new Map();this.announcementSeen=new Set();this.generation=0;}
 async enable(){
  if(!this.context){const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)throw Error('Audio no disponible');this.context=new AudioContext({latencyHint:'interactive'});this.master=this.context.createGain();this.master.gain.value=this.volume;const context=this.context,high=context.createBiquadFilter(),low=context.createBiquadFilter();high.type='highpass';high.frequency.value=45;low.type='lowpass';low.frequency.value=Math.min(17000,(context.sampleRate||44100)*.45);if(high.Q)high.Q.value=.7;if(low.Q)low.Q.value=.7;this.master.connect(high).connect(low);let output=low;if(context.createDynamicsCompressor){const c=context.createDynamicsCompressor();for(const[key,value]of Object.entries({threshold:-12,knee:9,ratio:3,attack:.006,release:.18}))if(c[key])c[key].value=value;output.connect(c);output=c;this.compressor187=c;}const headroom=context.createGain();headroom.gain.value=.82;output.connect(headroom).connect(context.destination);this.output187={high,low,headroom};
   this.motorGain=this.context.createGain();this.motorGain.gain.value=0;this.motorGain.connect(this.master);this.rollingGain=this.context.createGain();this.rollingGain.gain.value=0;this.rollingGain.connect(this.master);

  }
  await this.context.resume();if(!this.manifest)this.manifest=await fetch('audio/cabina71/estaciones_manifest.json?v=71').then(r=>{if(!r.ok)throw Error('Referencias de audio no disponibles');return r.json();});
  if(!this.closingManifest)this.closingManifest=await fetch('audio/cabina71/cierre_manifest.json?v=206').then(r=>{if(!r.ok)throw Error('Avisos de cierre no disponibles');return r.json();});
  this.closingReferences??=new Map();await Promise.all(Object.keys(this.closingManifest.models).map(model=>this.closingReference(model)));await this.prepareMotion().catch(error=>{this.motionError=true;console.error('Sonido de marcha',error);});this.enabled=true;
 }
 async prepareMotion(){if(this.rolling)return;if(this.motionPreparation)return this.motionPreparation;this.motionPreparation=(async()=>{if(!this.motionBuffer){const info=await fetch('audio/cabina71/marcha_manifest.json?v=71').then(r=>{if(!r.ok)throw Error('Referencia de marcha no disponible');return r.json();});const bytes=await fetch(info.url).then(r=>{if(!r.ok)throw Error('Audio de marcha no disponible');return r.arrayBuffer();});this.motionBuffer=await this.context.decodeAudioData(bytes);}const source=this.context.createBufferSource();source.buffer=this.motionBuffer;source.loop=true;const motorFilter=this.context.createBiquadFilter();motorFilter.type='lowpass';motorFilter.frequency.value=500;const wheelFilter=this.context.createBiquadFilter();wheelFilter.type='highpass';wheelFilter.frequency.value=500;const cabinFilter=this.context.createBiquadFilter();cabinFilter.type='lowpass';cabinFilter.frequency.value=6500;source.connect(motorFilter).connect(this.motorGain);source.connect(wheelFilter).connect(cabinFilter).connect(this.rollingGain);this.rolling=source;source.start();this.motionError=false;})().finally(()=>{this.motionPreparation=null;});return this.motionPreparation;}
 updateMotion(state,nearest,dist){if(!this.rolling||!this.motorGain||!this.rollingGain)return;const e=state.engine,cabin=state.cameraMode?['driver','cab-platform','car'].includes(state.cameraMode):Boolean(e.operator),train=cabin?e.trains.find(t=>t.id===state.selectedTrain)||nearest:nearest;const speed=train?.speed||0,u=Math.max(0,Math.min(1,speed/22.22)),onset=Math.max(0,Math.min(1,(speed-.15)/1.35)),fade=onset*onset*(3-2*onset),distance=cabin?1:Math.max(0,1-dist/320),voice=this.announcementActive||this.doorRequestSource||this.doorRequestPending||this.closingSources?.size,duck=voice?.3:1,now=this.context.currentTime;this.motorGain.gain.setTargetAtTime((state.running?(e.power[train?.line]?1:.08)*(.1+u*.38):0)*fade*distance*duck,now,.3);this.rollingGain.gain.setTargetAtTime((state.running?.48*Math.pow(u,1.1):0)*fade*distance*duck,now,.3);this.rolling.playbackRate?.setTargetAtTime(.9+.22*u,now,.35);}
 closingReference(model){if(!this.closingReferences.has(model)){const clip=this.closingManifest.models[model];if(!clip)return Promise.reject(Error('Sin aviso de cierre para '+model));const task=fetch(clip.url).then(r=>{if(!r.ok)throw Error('Archivo de cierre ausente');return r.arrayBuffer();}).then(bytes=>this.context.decodeAudioData(bytes));this.closingReferences.set(model,task);task.catch(()=>this.closingReferences.delete(model));}return this.closingReferences.get(model);}
 async playDoorRequest(){if(!this.enabled)throw Error('Activa el sonido.');if(this.doorRequestSource||this.doorRequestPending)return false;this.doorRequestPending=true;try{this.stopAnnouncement();const clip=this.closingManifest.manual_message;if(!clip)throw Error('Mensaje no disponible');const generation=this.generation;this.doorRequestBuffer??=fetch(clip.url).then(r=>{if(!r.ok)throw Error('No se pudo cargar el mensaje');return r.arrayBuffer();}).then(bytes=>this.context.decodeAudioData(bytes)).catch(e=>{this.doorRequestBuffer=null;throw e;});const buffer=await this.doorRequestBuffer;if(!this.enabled||generation!==this.generation)return false;const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=buffer;gain.gain.value=.85;source.connect(gain).connect(this.master);this.doorRequestSource=source;this.nodes.add(source);return new Promise(resolve=>{source.onended=()=>{this.nodes.delete(source);if(this.doorRequestSource===source)this.doorRequestSource=null;source.disconnect();gain.disconnect();resolve(true);};source.start();});}finally{this.doorRequestPending=false;}}
 stopDoorRequest(){if(this.doorRequestSource){try{this.doorRequestSource.stop();}catch{}}}
 setEnabled(value){this.enabled=value;if(!value)this.silence();}
 setVolume(value){this.volume=Math.max(0,Math.min(1,value));if(this.master)this.master.gain.setTargetAtTime(this.volume,this.context.currentTime,.04);}
 silence(){this.generation++;this.announcementActive=false;if(!this.context)return;this.motorGain?.gain.setTargetAtTime(0,this.context.currentTime,.08);this.rollingGain?.gain.setTargetAtTime(0,this.context.currentTime,.08);for(const n of this.nodes){try{n.stop();}catch{}}this.nodes.clear();}
 stopAnnouncement(){this.generation++;this.announcementActive=false;const source=this.announcementSource;this.announcementSource=null;if(source){this.nodes.delete(source);try{source.stop();}catch{}}}
 reference(stationId){
  if(!this.references.has(stationId)){
   const clip=this.manifest?.stations[stationId];if(!clip)return Promise.reject(Error('Sin referencia'));
   const task=fetch(clip.url).then(r=>{if(!r.ok)throw Error('Audio ausente');return r.arrayBuffer();}).then(bytes=>this.context.decodeAudioData(bytes));
   this.references.set(stationId,task);task.catch(()=>{if(this.references.get(stationId)===task)this.references.delete(stationId);});
  }return this.references.get(stationId);
 }
 async announcement(stationId,approachKey){
  const clip=this.manifest?.stations[stationId];if(!clip||this.announcementActive)return false;
  this.announcementActive=true;const generation=this.generation;
  try{
   const buffer=await this.reference(stationId);if(generation!==this.generation||!this.enabled||(approachKey!==undefined&&(approachKey!==this.audioVisit||!this.canStartAnnouncement))){if(generation===this.generation)this.announcementActive=false;return false;}
   const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=buffer;gain.gain.value=.8;source.connect(gain).connect(this.master);this.nodes.add(source);this.announcementSource=source;source.onended=()=>{this.nodes.delete(source);source.disconnect();gain.disconnect();if(this.announcementSource===source)this.announcementSource=null;if(generation===this.generation)this.announcementActive=false;};source.start();if(approachKey!==undefined)this.announcementSeen.add(approachKey);return true;
  }catch{this.references.delete(stationId);if(generation===this.generation)this.announcementActive=false;return false;}
 }
 async warning(rate=1,train,engine){
  if(!this.enabled||!train)return false;this.stopDoorRequest();const generation=this.generation;
  try{const buffer=await this.closingReference(train.model);if(generation!==this.generation||!this.enabled||train.wait<=1.5||engine.emergency||!engine.power[train.line])return false;
   const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=buffer;gain.gain.value=.85;source.connect(gain).connect(this.master);this.nodes.add(source);this.closingSources??=new Map();this.closingSources.set(train.id,source);
   source.onended=()=>{this.nodes.delete(source);if(this.closingSources.get(train.id)===source)this.closingSources.delete(train.id);source.disconnect();gain.disconnect();};const manual=engine.operator?.trainId===train.id;if(manual){const remaining=Math.max(0,Math.min(5,train.wait-1.5));source.start(0,5-remaining);source.stop(this.context.currentTime+remaining);}else source.start();return true;
  }catch(error){console.error('Aviso de cierre',error);return false;}
 }
 update(state,anchor,rate=1){
  if(!this.enabled||!state.running){const op=state.engine.operator,t=op&&state.engine.trains.find(t=>t.id===op.trainId);if(t&&op.phase==='warning')this.seen.delete([state.engine.epoch,t.id,t.stops].join(':'));this.silence();return;}const e=state.engine;if(this.epoch!==e.epoch){this.silence();this.seen.clear();this.announcementSeen.clear();this.epoch=e.epoch;}
  if(this.audioLine!==state.currentLine){this.silence();this.audioLine=state.currentLine;}
  const candidates=e.trains.filter(t=>t.line===state.currentLine);let nearest=null,dist=Infinity;
  for(const t of candidates){const d=Math.abs(t.position-anchor);if(d<dist){dist=d;nearest=t;}}
  // Announcements follow the selected train, independently of the camera.
  const announcer=candidates.find(t=>t.id===state.selectedTrain)||nearest;
  if(announcer){
   const line=e.lines[announcer.line],station=line.stations[announcer.target],remaining=Math.abs(announcer.position-line.distances[announcer.target]);
   // The engine increments stops at arrival; retain the approach identity during
   // its dwell, so arrival cannot cancel or repeat a started announcement.
   const visit=announcer.stops-(announcer.wait>0?1:0),key=[e.epoch,announcer.id,visit,station.id].join(':');
   if(this.audioVisit!==key){this.stopAnnouncement();this.audioVisit=key;this.retryAnnouncementAt=0;this.prefetchedVisit=null;}
   const clip=this.manifest?.stations[station.id],duration=clip?Math.max(1,clip.end-clip.start):7;
   // Longer announcements need an earlier trigger than the old fixed 180 m
   // audible zone. Keep the margin in real seconds when time is accelerated.
   const lead=Math.max(300,(duration+5)*Math.max(1,announcer.speed)*Math.max(1,rate));
   this.canStartAnnouncement=announcer.wait<=0&&announcer.speed>0&&remaining>1&&!e.emergency&&e.power[announcer.line];
   if(clip&&announcer.wait<=0&&this.prefetchedVisit!==key){this.prefetchedVisit=key;this.reference(station.id).catch(()=>{});}
   if(clip&&!this.doorRequestPending&&!this.doorRequestSource&&this.canStartAnnouncement&&remaining<lead&&!this.announcementActive&&!this.announcementSeen.has(key)&&this.context.currentTime>=(this.retryAnnouncementAt||0)){
    this.announcement(station.id,key).then(ok=>{if(!ok&&this.audioVisit===key)this.retryAnnouncementAt=this.context.currentTime+1;});
   }
  }else{this.canStartAnnouncement=false;this.stopAnnouncement();}
  for(const [id,source]of this.closingSources||[]){const t=candidates.find(t=>t.id===id);if(!t||t.wait<=0||(e.operator?.trainId===id&&e.operator.phase!=='warning')||e.emergency||!e.power[t.line]){if(t&&e.operator?.trainId===id&&e.operator.phase==='warning')this.seen.delete([e.epoch,t.id,t.stops].join(':'));try{source.stop();}catch{}}}
  for(const t of candidates){const d=Math.abs(t.position-anchor),key=[e.epoch,t.id,t.stops].join(':');const manual=e.operator?.trainId===t.id;if(manual&&e.operator.phase!=='warning')continue;const clip=this.closingManifest?.models[t.model],start=manual?6.5:(clip?.duration||2.15)+1.5;
   if((d<160||t.id===state.selectedTrain)&&t.wait<=start&&t.wait>1.5&&!e.emergency&&e.power[t.line]&&!this.seen.has(key)){this.seen.add(key);this.warning(rate,t,e);}
  }
  this.updateMotion(state,nearest,dist);
 }
}
