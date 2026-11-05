// Carga del tren 248. En "Seguir este tren" se elige qué tan lleno va el convoy: vacío, media,
// tres cuartos, lleno o un porcentaje libre. El simulador no se teletransporta a esa carga: la gente
// se forma en el andén de la siguiente estación y entra por las puertas durante la parada, con el
// límite de embarque normal de cada parada. Si se pide menos carga, en la siguiente parada baja la
// gente de costumbre y nadie sube (los que esperaban siguen en el andén para el tren que viene).
// Mientras suben, la caja de cada carro baja sobre su suspensión según la carga.
//
// 100 % = capacidad de 4 personas por m² que usa el simulador, equivalente a la carga 4/4 documentada
// (338.5 t para 9 carros). El hundimiento máximo de la caja es un supuesto visual del modelo.
export const PRESETS248=[['auto','Como la simulación',null],['0','Vacío',0],['50','Media carga',.5],['75','Tres cuartos',.75],['100','Lleno (4/4)',1],['custom','Personalizada…',null]];
export const SAG_MAX_M248=.04;
const key248=t=>t.line+':'+t.id;

export class TrainLoad248{
 constructor(doc=document,win=window){
  this.doc=doc;this.win=win;this.targets=new Map();this.held=new Map();this.shown=new Map();this.plans=new Map();
  const picker=doc.getElementById('sim106-train-picker'),bar=picker?.parentElement||doc.querySelector('.sim106-bar');
  this.root=doc.createElement('label');this.root.className='tl248';this.root.title='Carga del convoy que sigues';
  this.root.innerHTML=`Carga <select data-tl248-preset>${PRESETS248.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select><input type="range" min="0" max="100" step="5" value="60" data-tl248-range hidden aria-label="Porcentaje de carga"><output data-tl248-out></output>`;
  if(picker)picker.after(this.root);else bar?.append(this.root);
  this.select=this.root.querySelector('[data-tl248-preset]');this.range=this.root.querySelector('[data-tl248-range]');this.out=this.root.querySelector('[data-tl248-out]');
  this.select.onchange=()=>this.apply();this.range.oninput=()=>this.apply();
  this.timer=win.setInterval?.(()=>this.tick(),100);
 }
 state(){const s=this.win.metroViewState?.(),e=s?.engine;if(!e)return null;const t=e.trains?.find(x=>e.operator?x.id===e.operator.trainId:x.id===s.selectedTrain);return {s,e,t};}
 apply(){const r=this.state();if(!r?.t)return;const v=this.select.value;this.range.hidden=v!=='custom';
  const frac=v==='auto'?null:v==='custom'?Number(this.range.value)/100:PRESETS248.find(p=>p[0]===v)[2];
  if(frac==null)this.targets.delete(key248(r.t));else this.targets.set(key248(r.t),frac);this.label(r);}
 target(t,e){const f=this.targets.get(key248(t));return f==null?null:Math.round(f*e.capacity);}
 label(r){const {e,t}=r;if(!t)return;const target=this.target(t,e),mass=massT248(this.displayed(t,e)/e.capacity);
  this.out.textContent=` ${Math.round(t.load).toLocaleString('es-MX')}${target!=null?' → '+target.toLocaleString('es-MX'):''} pasajeros · ${mass.toLocaleString('es-MX',{maximumFractionDigits:1})} t`;}
 // Load shown on the car body: during a stop it moves from the arrival load to the planned load as
 // people walk in or out, instead of jumping when the doors close.
 displayed(t,e){const k=key248(t),plan=this.plans.get(k);if(!plan||!(t.wait>0))return t.load;const dwell=e.stopDuration?.(t)??e.dwell,progress=Math.max(0,Math.min(1,1-(t.wait-1.5)/Math.max(1,dwell-3)));return plan.from+(plan.to-plan.from)*progress;}
 tick(){const r=this.state();if(!r)return;const {e,t:followed}=r;
  // Keep the selector in sync with the followed convoy.
  if(followed&&this.followedKey!==key248(followed)){this.followedKey=key248(followed);const f=this.targets.get(this.followedKey);const preset=PRESETS248.find(p=>p[2]===f);this.select.value=f==null?'auto':preset?preset[0]:'custom';this.range.hidden=this.select.value!=='custom';if(this.select.value==='custom')this.range.value=String(Math.round(f*100));}
  for(const t of e.trains||[]){const k=key248(t),target=this.target(t,e),line=e.lines?.[t.line],station=line?.stations?.[t.target];if(!station)continue;
   const stopped=t.wait>0&&t.speed<.05,dist=Math.abs((line.distances?.[t.target]??t.position)-t.position);
   if(stopped&&!this.plans.has(k)){const terminal=t.target===0||t.target===line.stations.length-1,exiting=terminal?t.load:Math.floor(t.load*.2),entering=Math.min(Math.floor(e.waiting?.[station.id]||0),e.capacity-t.load+exiting,e.boardingLimit?.(t)??Infinity);this.plans.set(k,{from:t.load,to:t.load-exiting+Math.max(0,entering),station:station.id});}
   if(!stopped&&t.speed>.5&&this.plans.has(k)){this.plans.delete(k);
}
   // Give back the people who stayed on the platform once this convoy has left that station.
   const held=this.held.get(k);if(held&&held.station!==station.id&&e.waiting){e.waiting[held.station]=(e.waiting[held.station]||0)+held.count;this.held.delete(k);}
   if(target==null||stopped||dist>260)continue;
   // Approaching the next platform: prepare the queue so the stop moves the load toward the target.
   const terminal=t.target===0||t.target===line.stations.length-1,afterExit=t.load-(terminal?t.load:Math.floor(t.load*.2)),need=Math.max(0,target-afterExit);
   if(!e.waiting)continue;const queue=e.waiting[station.id]||0;
   if(need>queue)e.waiting[station.id]=need;
   else if(need<queue){const held=this.held.get(k);const extra=queue-need;e.waiting[station.id]=need;this.held.set(k,{station:station.id,count:(held?.station===station.id?held.count:0)+extra});}}
  this.sag();if(followed)this.label(r);
 }
 // Lower every car body on its suspension (bogies stay on the track).
 sag(){const r=this.state(),scene=this.win.stationScene;if(!r||!scene?.trainMeshes)return;const {e}=r;
  for(const [id,model] of scene.trainMeshes){const t=e.trains.find(x=>x.id===id);if(!t||!model?.group)continue;const frac=Math.max(0,Math.min(1,this.displayed(t,e)/e.capacity)),k=key248(t),prev=this.shown.get(k)??frac,now=prev+(frac-prev)*.25;this.shown.set(k,now);
   for(const car of model.group.children){if(car.userData?.carIndex===undefined)continue;for(const part of car.children){if(part.userData?.bogie212)continue;part.userData.sagBase248??=part.position.y;part.position.y=part.userData.sagBase248-now*SAG_MAX_M248;}}}}
 dispose(){this.win.clearInterval?.(this.timer);this.root.remove();}
}
// Mass of a 9-car pneumatic train for a load fraction (documented 231.4 t empty, 338.5 t at 4/4).
export function massT248(frac){return 231.4+(338.5-231.4)*Math.max(0,Math.min(1,frac));}
export function installTrainLoad248(doc=document,win=window){if(doc.querySelector('.tl248'))return win.trainLoad248;return win.trainLoad248=new TrainLoad248(doc,win);}
