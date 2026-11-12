import {DOCUMENTED245,ASSUMED245,FORMATION245} from './electric-dashboard245.js?v=255';
import {inlineSvg256} from './grid-substation256.js?v=262';
import {atpCurve257,ASSUMED257,stoppingDistance257,ENGINE_RATES257} from './train-dynamics257.js?v=262';

// Sistemas a bordo 258. Panel del seguimiento del tren con los temas de la presentación sobre lo que
// va dentro del tren y que el simulador no explicaba: la cadena de potencia a bordo (escobillas,
// protección, filtro, convertidor de tracción, motores y convertidor auxiliar), el mando y la
// supervisión (TCMS, modos de conducción, freno de urgencia y hombre muerto), la lógica de puertas
// y la separación entre trenes con bloque fijo y bloque móvil. Lee el estado del simulador y no
// cambia el movimiento de los trenes.

export const CONTROL258=Object.freeze({'NM-22':{kind:'VVVF',motor:'asíncronos de CA',brake:'eléctrico y fricción'},'NM-79':{kind:'Chopper',motor:'de CD',brake:'eléctrico y fricción'},'MP-82':{kind:'Chopper',motor:'de CD',brake:'eléctrico y fricción'}});
// Values the presentation gives without a public source we could verify; shown as such.
export const PRESENTATION258=Object.freeze({auxAC:'220 V CA trifásica',lowDC:{'NM-22':'110 V CD','NM-79':'72 V CD','MP-82':'72 V CD'},battery:'níquel-cadmio'});
export const SEPARATION258=Object.freeze({lookahead:500,gap:180,trainLength:150}); // engine.js and STC train length

// Door authorisation: every condition must hold (AND); traction needs all doors closed.
export function doorLogic258({speed=0,atPlatform=false,sideOk=true,closed=true}={}){const stopped=speed<.1,open=stopped&&atPlatform&&sideOk;return{stopped,atPlatform,sideOk,open,traction:closed};}
// Emergency brake: any condition triggers it (OR).
export function emergency258({deadmanReleased=false,powerLost=false,atpOverspeed=false,emergency=false}={}){const causes=[];if(deadmanReleased)causes.push('hombre muerto soltado');if(atpOverspeed)causes.push('exceso sobre la curva ATP');if(powerLost)causes.push('sin tensión en la barra guía');if(emergency)causes.push('emergencia de línea');return{active:causes.length>0,causes};}
// Minimum separation and headway. Fixed block: the follower must stay one whole block behind the
// block the leader occupies, so on average it adds 1.5 blocks; moving block only needs braking plus margin.
export function separation258(v,{block=400,decel=1.2,reaction=ASSUMED257.reaction,margin=ASSUMED257.overlap,length=SEPARATION258.trainLength}={}){
 const brake=v*reaction+v*v/(2*decel)+margin,moving=length+brake,fixed=length+brake+1.5*block;
 return{brake,moving,fixed,headwayMoving:v>0?moving/v:Infinity,headwayFixed:v>0?fixed/v:Infinity};}
// Gap to the next train ahead on the same line and direction.
export function gapAhead258(engine,t){let best=Infinity;for(const o of engine?.trains||[]){if(o===t||o.line!==t.line||o.direction!==t.direction)continue;const gap=(o.position-t.position)*(t.direction||1);if(gap>0&&gap<best)best=gap;}return best;}

const fmt=(x,d=0)=>Number(x).toLocaleString('es-MX',{maximumFractionDigits:d,minimumFractionDigits:d});
const TABS258=[['power','Cadena de potencia'],['control','Mando y urgencia'],['doors','Puertas'],['blocks','Bloque fijo y móvil']];

export class Onboard258{
 constructor(doc=document,win=window){
  this.doc=doc;this.win=win;this.on=false;this.tab='power';this.block=400;this.speedKmh=60;
  this.button=doc.createElement('button');this.button.type='button';this.button.className='ob258-toggle';this.button.textContent='🚆 Sistemas a bordo';this.button.setAttribute('aria-pressed','false');this.button.title='Cadena de potencia, mando, puertas y separación entre trenes';this.button.onclick=()=>this.toggle();
  (doc.querySelector('.sim106-view-tools')||doc.getElementById('sim106-shell')||doc.body)?.append(this.button);
  this.panel=doc.createElement('aside');this.panel.className='ob258';this.panel.hidden=true;this.panel.setAttribute('aria-label','Sistemas a bordo del tren');
  this.panel.innerHTML=`<header><div><small>SISTEMAS A BORDO</small><b data-ob258-title>Tren</b></div><button type="button" data-ob258-close aria-label="Cerrar">×</button></header><nav role="tablist">${TABS258.map(([id,l])=>`<button type="button" role="tab" data-ob258-tab="${id}" aria-selected="${id==='power'}">${l}</button>`).join('')}</nav><div data-ob258-body></div>`;
  (doc.getElementById('sim106-stage')||doc.body)?.append(this.panel);
  this.panel.querySelector('[data-ob258-close]')?.addEventListener?.('click',()=>this.toggle(false));
  for(const b of this.panel.querySelectorAll?.('[data-ob258-tab]')||[])b.addEventListener('click',()=>this.show(b.dataset.ob258Tab));
  this.body=this.panel.querySelector('[data-ob258-body]');
  this.timer=win.setInterval?.(()=>{if(this.on)this.update();},300);
 }
 toggle(on=!this.on){this.on=on;this.button.setAttribute('aria-pressed',String(on));this.panel.hidden=!on;if(on)this.show(this.tab);}
 show(tab){this.tab=tab;for(const b of this.panel.querySelectorAll?.('[data-ob258-tab]')||[])b.setAttribute('aria-selected',String(b.dataset.ob258Tab===tab));this.body.innerHTML=this['html_'+tab]();this['bind_'+tab]?.();this.update();}
 $(s){return this.body?.querySelector?.(s);}
 read(){const s=this.win.metroViewState?.(),e=s?.engine;if(!e)return null;const op=e.operator,t=e.trains?.find(x=>op&&op.trainId?x.id===op.trainId:x.id===s.selectedTrain);if(!t)return null;return{s,e,op:op&&op.trainId===t.id?op:null,t};}
 model(t){return t?.model&&CONTROL258[t.model]?t.model:'NM-22';}
 // ---- Cadena de potencia ----
 html_power(){return `<p class="ob258-lead">Así recorre la energía el tren seguido. Las flechas se encienden según lo que hace en este momento.</p><svg viewBox="0 0 520 250" class="ob258-svg" data-ob258-chain></svg><div class="ob258-tiles" data-ob258-power></div>
<p class="ob258-assume">Tensiones auxiliares (${PRESENTATION258.auxAC}; 110 V CD en NM-22 y 72 V CD en NM-79/MP-82; baterías de ${PRESENTATION258.battery}) tomadas de la presentación, sin fuente pública verificada. La potencia de auxiliares (${ASSUMED245.auxKW} kW) es un supuesto del análisis eléctrico.</p>`;}
 drawChain(r){const svg=this.$('[data-ob258-chain]');if(!svg)return;const st=this.win.electricDashboard245?.state,model=this.model(r?.t),c=CONTROL258[model];
  const traction=(st?.tractionKW||0)>1,braking=(st?.brakeKW||0)>1,powered=r?!!r.e.power?.[r.t.line]&&!r.e.emergency:false;
  const box=(x,y,w,h,t,s,on,col='#ffb238')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${on?'#2a2414':'#16282e'}" stroke="${on?col:'#446168'}" stroke-width="${on?2.5:1.5}"/><text x="${x+w/2}" y="${y+h/2-3}" fill="#f2f6f4" font-size="11.5" text-anchor="middle">${t}</text><text x="${x+w/2}" y="${y+h/2+12}" fill="#a8bbb5" font-size="10" text-anchor="middle">${s}</text>`;
  const arrow=(x1,y1,x2,y2,on,col='#ffb238',back=false)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${on?col:'#446168'}" stroke-width="${on?3.5:2}" stroke-dasharray="${on?'':'5 4'}"/><circle cx="${back?x1:x2}" cy="${back?y1:y2}" r="4" fill="${on?col:'#446168'}"/>`;
  svg.innerHTML=inlineSvg256(`${box(6,20,86,46,'Escobillas','+750 V CD',powered)}${arrow(92,43,106,43,powered)}${box(106,20,104,46,'Protección','fusibles, disyuntor',powered)}${arrow(210,43,224,43,traction||braking)}${box(224,20,86,46,'Filtro LC','suaviza entrada',traction||braking)}${arrow(310,43,324,43,traction||braking,braking?'#39a7ff':'#ffb238',braking)}${box(324,20,96,46,'Convertidor',c.kind,traction||braking,braking?'#39a7ff':'#ffb238')}${arrow(420,43,434,43,traction||braking,braking?'#39a7ff':'#ffb238',braking)}${box(434,20,80,46,'Motores',`24 de ${c.kind==='VVVF'?'CA':'CD'}`,traction||braking,braking?'#39a7ff':'#ffb238')}
   ${arrow(158,66,158,120,powered,'#79dbc1')}${box(92,120,132,46,'Convertidor estático','servicios auxiliares',powered,'#79dbc1')}${arrow(224,143,262,118,powered,'#79dbc1')}${arrow(224,143,262,190,powered,'#79dbc1')}
   ${box(262,96,150,44,'CA trifásica','ventilación · compresor',powered,'#79dbc1')}${box(262,170,160,44,'Baja tensión CD','control, alumbrado, puertas',powered,'#79dbc1')}${arrow(422,192,440,192,true,'#e8b32a')}${box(440,170,74,44,'Baterías','respaldo',true,'#e8b32a')}
   <text x="8" y="240" fill="#93a39d" font-size="10.5">${model} · ${c.kind} · motores ${c.motor}${braking?' · frenando: la energía vuelve del motor hacia la línea o las resistencias':traction?' · traccionando':''}</text>`);}
 // ---- Mando y urgencia ----
 html_control(){return `<p class="ob258-lead">El TCMS es la red de computadoras del tren. Recibe la orden (del conductor o del pilotaje automático), la reparte a la unidad de tracción (TCU) y a la de freno (BCU), y vigila todo. Si una sola condición de seguridad falla, aplica el freno de urgencia.</p>
<div class="ob258-layers"><span><small>1 · Decisión</small><b data-ob258-mode>—</b><em data-ob258-mode-note></em></span><span><small>2 · Red del tren</small><b>TCMS</b><em>reparte la orden y registra eventos</em></span><span><small>3 · Ejecución</small><b data-ob258-exec>—</b><em>TCU tracción · BCU freno · puertas</em></span></div>
<h4>Freno de urgencia: basta una condición</h4><ul class="ob258-or" data-ob258-or></ul><div class="ob258-tiles" data-ob258-emer></div>
<p class="ob258-assume">Modos de la presentación: PA (pilotaje automático), CMC (conducción manual controlada, el ATP limita la velocidad) y CML (conducción manual limitada, modo degradado). En el simulador, los trenes sin conductor siguen la curva de servicio de engine.js y el tren que conduces usa los mandos de cabina con hombre muerto.</p>`;}
 // ---- Puertas ----
 html_doors(){return `<p class="ob258-lead">Las puertas solo abren si se cumplen todas las condiciones a la vez, y el tren solo puede traccionar con todas cerradas y enclavadas.</p><ul class="ob258-and" data-ob258-and></ul><div class="ob258-tiles" data-ob258-doors></div>
<p class="ob258-assume">El enclavamiento KFS de la presentación permite aislar una puerta averiada con llave para que el tren siga en servicio; el aislamiento queda registrado.</p>`;}
 // ---- Bloque fijo y móvil ----
 html_blocks(){return `<p class="ob258-lead">Con bloque fijo la vía se divide en tramos y solo un tren puede ocupar cada uno, así que el de atrás debe esperar a que se libere un tramo entero. Con bloque móvil (CBTC) el tren de atrás solo guarda su distancia de frenado más un margen detrás del de adelante.</p>
<div class="ob258-row"><label>Velocidad <input type="range" min="20" max="80" step="5" value="${this.speedKmh}" data-ob258-v><output data-ob258-v-out></output></label><label>Largo del bloque <input type="range" min="200" max="800" step="50" value="${this.block}" data-ob258-b><output data-ob258-b-out></output></label></div>
<svg viewBox="0 0 520 170" class="ob258-svg" data-ob258-blocks></svg><div class="ob258-tiles" data-ob258-sep></div><div class="ob258-tiles" data-ob258-live></div>
<p class="ob258-assume">Supuestos: tren de ${SEPARATION258.trainLength} m, frenado de servicio de la línea, reacción ${ASSUMED257.reaction} s y margen ${ASSUMED257.overlap} m; en bloque fijo se suma en promedio bloque y medio. engine.js separa los trenes mirando ${SEPARATION258.lookahead} m adelante y dejando al menos ${SEPARATION258.gap} m: se parece a un bloque móvil.</p>`;}
 bind_blocks(){this.$('[data-ob258-v]').addEventListener('input',e=>{this.speedKmh=+e.target.value;this.update();});this.$('[data-ob258-b]').addEventListener('input',e=>{this.block=+e.target.value;this.update();});}
 update(){const r=this.read();const title=this.panel.querySelector('[data-ob258-title]');if(title)title.textContent=r?`${r.t.id} · ${this.model(r.t)} · Línea ${r.t.line}`:'Sin tren seleccionado';
  const st=this.win.electricDashboard245?.state;
  if(this.tab==='power'){this.drawChain(r);const box=this.$('[data-ob258-power]');if(box)box.innerHTML=`<span><small>Tensión en el tren</small><b>${st?fmt(st.V):'—'} V</b>nominal ${DOCUMENTED245.nominalV} V CD</span><span><small>Corriente de línea</small><b>${st?fmt(st.I):'—'} A</b>tracción ${st?fmt(st.tractionKW):'—'} kW</span><span><small>Auxiliares</small><b>${st?fmt(st.auxKW):'—'} kW</b>ventilación, compresor, control</span><span><small>Carros motrices</small><b>${FORMATION245.filter(k=>k==='M'||k==='N').length} de ${FORMATION245.length}</b>4 motores cada uno</span>`;}
  if(this.tab==='control'){const op=r?.op,e=r?.e,t=r?.t,v=t?.speed||0;const line=t?.line??1;const dist=t?Math.abs((e.lines?.[line]?.distances?.[t.target]??t.position)-t.position):0;
   const atp=t?v>atpCurve257(dist,ASSUMED257.emergency)+.01:false,emer=emergency258({deadmanReleased:!!op&&!op.deadman&&v>.1,powerLost:!!t&&!e.power?.[line],atpOverspeed:atp,emergency:!!e?.emergency});
   const m=this.$('[data-ob258-mode]');if(m){m.textContent=op?'Conducción manual':'Pilotaje automático';this.$('[data-ob258-mode-note]').textContent=op?`palanca ${fmt((op.throttle||0)*100)} % · freno ${fmt((op.brake||0)*100)} % · hombre muerto ${op.deadman?'mantenido':'suelto'}`:'el tren sigue la curva de servicio hacia la próxima parada';
    this.$('[data-ob258-exec]').textContent=(st?.tractionKW||0)>1?'Tracción':(st?.brakeKW||0)>1?'Freno':'Deriva o detenido';
    this.$('[data-ob258-or]').innerHTML=[['Hombre muerto soltado en marcha',!!op&&!op.deadman&&v>.1],['Exceso sobre la curva ATP',atp],['Sin tensión en la barra guía',!!t&&!e.power?.[line]],['Emergencia de la línea',!!e?.emergency]].map(([l,on])=>`<li class="${on?'on':''}"><i></i>${l}</li>`).join('');
    this.$('[data-ob258-emer]').innerHTML=`<span class="${emer.active?'bad':'ok'}"><small>Freno de urgencia</small><b>${emer.active?'Activo':'No requerido'}</b>${emer.active?emer.causes.join(' · '):'todas las condiciones de seguridad se cumplen'}</span><span><small>Detención con urgencia</small><b>${fmt(stoppingDistance257(v,ASSUMED257.emergency))} m</b>a ${fmt(v*3.6)} km/h, ${ASSUMED257.emergency} m/s²</span>`;}}
  if(this.tab==='doors'){const t=r?.t,op=r?.op,v=t?.speed||0,at=!!t&&((t.wait||0)>0||Math.abs((r.e.lines?.[t.line]?.distances?.[t.target]??Infinity)-t.position)<2);
   const closed=op?op.phase==='closed':!(t&&(t.wait||0)>0),d=doorLogic258({speed:v,atPlatform:at,sideOk:true,closed});const and=this.$('[data-ob258-and]');
   if(and){and.innerHTML=[['Tren detenido',d.stopped],['Frente al andén',d.atPlatform],['Lado del andén correcto',d.sideOk]].map(([l,on])=>`<li class="${on?'on':''}"><i></i>${l}</li>`).join('')+`<li class="res ${d.open?'on':''}"><i></i>${d.open?'Apertura autorizada':'Apertura bloqueada'}</li>`;
    this.$('[data-ob258-doors]').innerHTML=`<span class="${closed?'ok':'warn'}"><small>Puertas</small><b>${closed?'Cerradas y enclavadas':'Abiertas'}</b>${op?'fase '+(op.phase||'—'):'tren automático'}</span><span class="${d.traction?'ok':'bad'}"><small>Tracción</small><b>${d.traction?'Permitida':'Inhibida'}</b>${d.traction?'todas las hojas confirmadas':'hasta cerrar y enclavar todas las hojas'}</span>`;}}
  if(this.tab==='blocks'){const t=r?.t,v=this.speedKmh/3.6,b=ENGINE_RATES257[t?.line??1]?.b??1.2,s=separation258(v,{block:this.block,decel:b});
   const o=this.$('[data-ob258-v-out]');if(o){o.textContent=`${this.speedKmh} km/h`;this.$('[data-ob258-b-out]').textContent=`${this.block} m`;
    const span=Math.max(s.fixed,1200)+100,X=d=>20+480*d/span;let g='';for(let x=0;x<span;x+=this.block)g+=`<line x1="${X(x)}" x2="${X(x)}" y1="30" y2="62" stroke="#5b6b70"/>`;
    const train=(x,y,c)=>`<rect x="${X(x)}" y="${y}" width="${Math.max(6,X(x+SEPARATION258.trainLength)-X(x))}" height="14" rx="3" fill="${c}"/>`;
    this.$('[data-ob258-blocks]').innerHTML=inlineSvg256(`<text x="20" y="22" fill="#ffd38a" font-size="11">Bloque fijo: separación ${fmt(s.fixed)} m</text><line x1="20" x2="500" y1="54" y2="54" stroke="#446168" stroke-width="2"/>${g}${train(0,40,'#39a7ff')}${train(s.fixed-SEPARATION258.trainLength,40,'#ff7a2f')}
     <text x="20" y="102" fill="#8fe0c8" font-size="11">Bloque móvil: separación ${fmt(s.moving)} m</text><line x1="20" x2="500" y1="134" y2="134" stroke="#446168" stroke-width="2"/>${train(0,120,'#39a7ff')}${train(s.moving-SEPARATION258.trainLength,120,'#ff7a2f')}<line x1="${X(SEPARATION258.trainLength)}" x2="${X(s.moving-SEPARATION258.trainLength)}" y1="150" y2="150" stroke="#8fe0c8" stroke-dasharray="4 3"/><text x="${X(s.moving/2)}" y="164" fill="#8fe0c8" font-size="10" text-anchor="middle">frenado + margen</text>`);
    this.$('[data-ob258-sep]').innerHTML=`<span><small>Intervalo con bloque fijo</small><b>${fmt(s.headwayFixed)} s</b>entre frentes de tren</span><span class="ok"><small>Intervalo con bloque móvil</small><b>${fmt(s.headwayMoving)} s</b>${fmt((1-s.headwayMoving/s.headwayFixed)*100)} % menos</span>`;
    const gap=t?gapAhead258(r.e,t):Infinity;this.$('[data-ob258-live]').innerHTML=`<span><small>Tren seguido</small><b>${isFinite(gap)?fmt(gap)+' m':'sin tren adelante'}</b>${isFinite(gap)?'al tren de adelante en su vía':'en su sentido'}</span><span><small>Distancia de frenado ahora</small><b>${t?fmt(stoppingDistance257(t.speed,b)):'—'} m</b>a ${t?fmt(t.speed*3.6):'—'} km/h · ${b} m/s²</span>`;}}
 }
 dispose(){this.win.clearInterval?.(this.timer);this.button.remove();this.panel.remove();}
}
export function installOnboard258(doc=document,win=window){if(win.onboard258)return win.onboard258;return win.onboard258=new Onboard258(doc,win);}
