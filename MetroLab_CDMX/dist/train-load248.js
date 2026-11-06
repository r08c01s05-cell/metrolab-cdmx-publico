// Carga del tren 248/250. En "Seguir este tren" se elige con un botón qué tan lleno va el convoy:
// automático, 0, 10, 25, 50, 75 o 100 %. El simulador no se teletransporta a esa carga: la gente
// se forma en el andén de la siguiente estación y entra por las puertas durante la parada, con el
// límite de embarque normal de cada parada. Si se pide menos carga, en la siguiente parada baja la
// gente de costumbre y nadie sube (los que esperaban siguen en el andén para el tren que viene).
// Mientras suben, la caja de cada carro baja sobre su suspensión según la carga.
//
// 100 % = capacidad de 4 personas por m² que usa el simulador, equivalente a la carga 4/4 documentada
// (338.5 t para 9 carros). El hundimiento máximo de la caja es un supuesto visual del modelo.
export const LEVELS250=[['auto','Auto',null,'La carga que da la simulación'],['0','0 %',0,'Vacío'],['10','10 %',.1,'10 % de la capacidad'],['25','25 %',.25,'Un cuarto'],['50','50 %',.5,'Media carga'],['75','75 %',.75,'Tres cuartos'],['100','100 %',1,'Lleno (4/4)']];
export const SAG_MAX_M248=.04;
const key248=t=>t.line+':'+t.id;

export class TrainLoad248{
 constructor(doc=document,win=window){
  this.doc=doc;this.win=win;this.targets=new Map();this.held=new Map();this.shown=new Map();this.plans=new Map();
  // 250: botones visibles en la tarjeta del recorrido (el menú junto al convoy quedaba oculto en algunas pantallas).
  this.root=doc.createElement('div');this.root.className='tl248';this.root.setAttribute('role','group');this.root.setAttribute('aria-label','Carga del convoy que sigues');
  this.root.innerHTML=`<span class="tl248-title">Carga del convoy</span><span class="tl248-buttons">${LEVELS250.map(([v,l,,hint])=>`<button type="button" data-tl248-level="${v}" aria-pressed="${v==='auto'}" title="${hint}">${l}</button>`).join('')}</span><output data-tl248-out></output>`;
  const trip=doc.querySelector('.sim106-trip > div'),picker=doc.getElementById('sim106-train-picker');
  if(trip)trip.append(this.root);else if(picker)picker.after(this.root);else (doc.querySelector('.sim106-bar')||doc.body)?.append(this.root);
  this.value='auto';this.out=this.root.querySelector('[data-tl248-out]');this.buttons=[...(this.root.querySelectorAll?.('[data-tl248-level]')||[])];
  for(const b of this.buttons)b.onclick=()=>this.choose(b.dataset.tl248Level);
  this.timer=win.setInterval?.(()=>this.tick(),100);
 }
 state(){const s=this.win.metroViewState?.(),e=s?.engine;if(!e)return null;const t=e.trains?.find(x=>e.operator?x.id===e.operator.trainId:x.id===s.selectedTrain);return {s,e,t};}
 choose(v){if(!LEVELS250.some(l=>l[0]===v))return;this.value=v;this.mark();this.apply();}
 mark(){for(const b of this.buttons)b.setAttribute('aria-pressed',String(b.dataset.tl248Level===this.value));}
 apply(){const r=this.state();if(!r?.t)return;const frac=LEVELS250.find(l=>l[0]===this.value)?.[2]??null;
  if(frac==null)this.targets.delete(key248(r.t));else this.targets.set(key248(r.t),frac);this.label(r);}
 target(t,e){const f=this.targets.get(key248(t));return f==null?null:Math.round(f*e.capacity);}
 label(r){const {e,t}=r;if(!t)return;const target=this.target(t,e),mass=massT248(this.displayed(t,e)/e.capacity);
  const boarding=this.plans.has(key248(t))&&t.wait>0;this.out.textContent=`${boarding?'Subiendo y bajando · ':''}${Math.round(this.displayed(t,e)).toLocaleString('es-MX')}${target!=null?' → '+target.toLocaleString('es-MX'):''} pasajeros · ${mass.toLocaleString('es-MX',{maximumFractionDigits:1})} t`;}
 // Load shown on the car body: during a stop it moves from the arrival load to the planned load as
 // people walk in or out, instead of jumping when the doors close.
 displayed(t,e){const k=key248(t),plan=this.plans.get(k);if(!plan||!(t.wait>0))return t.load;const dwell=e.stopDuration?.(t)??e.dwell,progress=Math.max(0,Math.min(1,1-(t.wait-1.5)/Math.max(1,dwell-3)));return plan.from+(plan.to-plan.from)*progress;}
 tick(){const r=this.state();if(!r)return;const {e,t:followed}=r;
  // Keep the selector in sync with the followed convoy.
  if(followed&&this.followedKey!==key248(followed)){this.followedKey=key248(followed);const f=this.targets.get(this.followedKey);this.value=f==null?'auto':(LEVELS250.find(l=>l[2]===f)?.[0]??'auto');this.mark();}
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
