import{HandsMaintenance,HAND_CASES}from'./maintenance-hands-core.js?v=216';
export const LABELS102={doorSlideLeft:'Hoja izquierda',doorSlideRight:'Hoja derecha',meterMode125:'Selector V CC / continuidad',power:'S1 · alimentación',stand:'Bloquear apoyo',cover:'Tapa / rejilla',coverSeat:'Marco de la tapa',tray:'Bandeja de retirados',screw1:'Tornillo A',screw2:'Tornillo B',screw3:'Tornillo C',screw4:'Tornillo D',bolt1:'Fijación 1',bolt2:'Fijación 2',bolt3:'Fijación 3',bolt4:'Fijación 4',bolt5:'Fijación 5',bolt6:'Fijación 6',bolt7:'Fijación 7',bolt8:'Fijación 8',obstacle:'Objeto en la guía',plug:'Conector suelto',port:'Puerto del ventilador',wheel:'Rueda marcada',newWheel:'Rueda de repuesto',wheelHub:'Eje de montaje',fuse:'Fusible F1',newFuse:'Repuesto F1',fuseSocket:'Portafusible F1',sourcePlus:'TP+',return:'TP−',fuseA:'F1 A',fuseB:'F1 B',lampPlus:'H+',lampMinus:'H−',clearProbes:'Retirar ambas puntas',removeRedProbe:'Retirar punta roja',removeBlackProbe:'Retirar punta negra',selectRedProbe:'Tomar punta roja',selectBlackProbe:'Tomar punta negra',openTest:'Abrir puerta',closeTest:'Cerrar puerta',testFan:'Ensayar ventilación',rotateTest:'Girar rueda · 90°'};
export function targets102(s){if(s.complete)return[];if(s.selectedItem)return s.selectedItem==='cover'&&s.coverOpen?['coverSeat']:({cover:['tray'],obstacle:['tray'],wheel:['tray'],fuse:['tray'],newFuse:['fuseSocket'],newWheel:['wheelHub'],plug:['port']}[s.selectedItem]||[]);const st=s.stage,remove=()=>['red','black'].filter(c=>s.probes[c]).map(c=>c==='red'?'removeRedProbe':'removeBlackProbe'),open=()=>s.screws.some(Boolean)?s.screws.flatMap((v,i)=>v?['screw'+(i+1)]:[]):['cover'];const close=()=>s.coverOpen?['cover']:s.screws.flatMap((v,i)=>!v?['screw'+(i+1)]:[]);
 if(s.id==='doors')return st===0?['power']:st===1?['obstacle']:!s.power?['power']:!s.doorOpened?['openTest']:['closeTest'];
 if(s.id==='ventilation')return st===0?['power']:st===1?open():st===2?['plug']:st===3?close():!s.power?['power']:['testFan'];
 if(s.id==='running')return st===0?s.power?['power']:['stand']:st===1?!s.wheelInspected148?['wheel']:s.wheelBolts.some(Boolean)?s.wheelBolts.flatMap((v,i)=>v?['bolt'+(i+1)]:[]):['wheel']:st===2?['newWheel']:st===3?[1,5,3,7,2,6,4,8].filter(i=>!s.wheelBolts[i-1]).slice(0,1).map(i=>'bolt'+i):['rotateTest'];
 return st===0?s.power?['power']:['sourcePlus','return'].filter(x=>!Object.values(s.probes).includes(x)):st===1?open():st===2?['fuseA','fuseB'].filter(x=>!Object.values(s.probes).includes(x)):st===3?Object.values(s.probes).some(p=>p==='fuseA'||p==='fuseB')?remove():!s.fuseRemoved&&!s.fuseReplaced?['fuse']:['newFuse']:st===4?Object.values(s.probes).some(p=>p==='fuseA'||p==='fuseB')?remove():close():st===6?remove():!s.power?['power']:['lampPlus','lampMinus'].filter(x=>!Object.values(s.probes).includes(x));}
export class MaintenanceSession102{
 constructor(onChange=()=>{}){this.state=new HandsMaintenance();this.onChange=onChange;this.guided=true;this.turns={};this.events=[];}
 reset(id=this.state.id){this.state.reset(id);this.state.toolMotion=null;this.turns={};this.events=[];this.onChange();}
 expected(){return targets102(this.state);}
 toolFor(id){return /^(screw)/.test(id)?'screwdriver':/^bolt/.test(id)?'wrench':['sourcePlus','return','fuseA','fuseB','lampPlus','lampMinus'].includes(id)?'meter':'hand';}
 use(tool){this.state.toolMotion=null;this.state.use(tool);this.onChange();}
 cancel(){this.state.selectedItem=null;this.state.toolMotion=null;this.state.message='Pieza devuelta a su posición. Puedes volver a tomarla.';this.onChange();}
 action(id,amount=.25){const s=this.state,stage=s.stage;try{
  if(s.id==='electrical'&&id==='meterMode125'&&!s.complete){s.use('meter');s.meterMode=s.meterMode==='V'?'Ω':'V';s.message='Multímetro en '+(s.meterMode==='V'?'V CC.':'continuidad / Ω.');s.measure();return;}
  if(s.id==='electrical'&&['clearProbes','removeRedProbe','removeBlackProbe'].includes(id)){s.removeProbe(id==='removeRedProbe'?'red':id==='removeBlackProbe'?'black':null);this.events.push({id,stage,after:s.stage});return;}
  if(s.id==='electrical'&&['selectRedProbe','selectBlackProbe'].includes(id)&&!s.complete){s.use('meter');s.probeColour=id==='selectRedProbe'?'red':'black';s.message='Punta '+(s.probeColour==='red'?'roja':'negra')+' preparada. Selecciona su punto de medida.';return;}
  if(s.complete){s.message='Práctica completada. Reinicia o selecciona otra actividad.';return;}
  if(id==='inspect'){s.message=HAND_CASES[s.id].symptom;return;}
  if(!this.expected().includes(id)&&!(id==='wheelHub'&&s.id==='running'&&s.stage===4)){throw Error('Ahora: '+this.expected().map(x=>LABELS102[x]).join(' o ')+'.');}
  const tool=this.toolFor(id);if(this.guided&&s.tool!==tool)s.use(tool);
  if(s.tool!==tool)throw Error('Selecciona '+({hand:'Mano con guante',screwdriver:'Destornillador',wrench:'Llave',meter:'Multímetro'}[tool])+'.');
  if(/^screw|^bolt/.test(id)){s.safe();this.turns[id]=Math.min(1,(this.turns[id]||0)+Math.abs(amount));s.toolMotion={target:id,progress:this.turns[id]};s.message=LABELS102[id]+' · '+Math.round(this.turns[id]*100)+' %';if(this.turns[id]>=1){s.perform(id);delete this.turns[id];s.toolMotion=null;}}
  else if(id==='openTest')s.door(100);else if(id==='closeTest')s.door(0);else if(id==='rotateTest'||id==='wheelHub'&&s.stage===4)s.rotate(s.rotation+90);
  else{if(tool==='meter')s.meterMode=s.stage===2?'Ω':'V';s.perform(id);}
  this.events.push({id,stage,after:s.stage});
 }catch(e){s.message=e.message;}finally{this.onChange();}}
 door(value){this.state.door(value);this.onChange();}
 wheel(value){this.state.rotate(value);this.onChange();}
}
