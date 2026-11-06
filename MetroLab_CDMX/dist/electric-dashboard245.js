// Análisis eléctrico 245/248: tablero de corriente, tensión, potencia, fuerza y energía del tren.
//
// Datos documentados (fuentes en la tarjeta «Supuestos y fuentes»):
//  - tensión nominal de tracción 750 V CD por barra guía (STC);
//  - masa de un tren neumático de 9 carros: 231.4 t vacío y 338.5 t a carga 4/4 con 70 kg por persona;
//  - cuatro motores por carro motriz (6 motrices, 24 motores); chopper en NM-79 y MP-82, VVVF en NM-22;
//  - frenado eléctrico reostático y/o neumático en el material neumático.
// Supuestos del modelo educativo (no son datos del fabricante y se pueden cambiar en el tablero):
//  fuerza por ampere de motor, corriente límite de los motores, potencia máxima, rendimiento,
//  resistencia de los motores, resistencia al avance, masas rotativas, auxiliares y alimentación.
// 248: la corriente de los motores sale de la fuerza (al arrancar es máxima aunque la velocidad sea
// cero); la de la línea sale de la potencia que entra al tren. Se agregan la comparación por carga y
// el esquema del tren, y las gráficas en vivo comparten el instante señalado.
// The model only reads the simulator state; it never changes the train or the mission.

export const DOCUMENTED245={nominalV:750,emptyT:231.4,loadedT:338.5,passengerKg:70,cars:9,motorsPerMotorCar:4,motors:24,
 sources:[['STC · Conformación de un tren','https://www.metro.cdmx.gob.mx/operacion/conformacion-de-un-tren'],['Información técnica del Metro (resumen de datos del STC)','https://blogs.masterhacks.net/geek/interesante/breve-informacion-tecnica-sobre-el-metro-de-la-cdmx/?pdf=1986'],['ADN40 · Peso de un vagón (cita «Características generales del material rodante», STC)','https://www.adn40.mx/ciudad/metro-cdmx-cuanto-pesa-un-vagon-del-sistema-transporte-colectivo-y-cuantas-personas-le-caben']]};
// Comparative reference only (rail fleet FM-86/FM-95/FE-07/FE-10 of the STC): total traction power.
export const REFERENCE_KW245=3400;
export const ASSUMED245={maxKW:3400,forcePerA:40,motorLimitA:10000,efficiency:.9,motorOhm:.04,brakeEfficiency:.8,rotating:1.08,rollingNPerT:25,aeroNPerMs2:9,auxKW:180,lineOhm:.025};
const CONTROL245={'NM-22':'VVVF (motores asíncronos)','NM-79':'Chopper','MP-82':'Chopper'};
// Formation of 9 cars: M R N N PR N N R M (motor cars: M and N).
export const FORMATION245=['M','R','N','N','PR','N','N','R','M'];
export const LOADS248=[[0,'Vacío','#3987e5'],[.5,'Media carga','#d95926'],[.75,'Tres cuartos','#199e70'],[1,'Lleno 4/4','#c98500']];

export function massFromFraction248(frac,d=DOCUMENTED245){return d.emptyT+(d.loadedT-d.emptyT)*Math.max(0,Math.min(1,frac));}
// Force the traction chain can give at speed v: current limit at low speed, power limit above.
export function tractionCap248(v,p=ASSUMED245){const byCurrent=p.forcePerA*p.motorLimitA,byPower=v>.1?p.maxKW*1000*p.efficiency/v:Infinity;return Math.min(byCurrent,byPower);}
function lineFrom248(inKW,powered,p,d){const V0=powered?d.nominalV:0,P=inKW*1000,disc=V0*V0-4*p.lineOhm*P,V=V0?(disc>0?(V0+Math.sqrt(disc))/2:V0/2):0;return {V,I:V?P/V:0};}

// One physics step. v in m/s, a in m/s² (from the simulator). massT given, or derived from load.
export function electricState245({v=0,a=0,load=0,capacity=0,massT=null,traction=0,brake=0,powered=true},p=ASSUMED245,d=DOCUMENTED245){
 const mT=massT??(capacity?massFromFraction248(load/capacity,d):Math.min(d.loadedT,d.emptyT+load*d.passengerKg/1000)),meq=mT*1000*p.rotating;
 const resist=mT*p.rollingNPerT+p.aeroNPerMs2*v*v,force=meq*a+(v>.05?resist:0);
 let tractionKW=0,brakeKW=0,motorA=0,limited=false,delivered=0;
 if(force>0&&traction>0&&powered){const cap=tractionCap248(v,p);delivered=Math.min(force,cap);limited=force>cap*1.001;motorA=delivered/p.forcePerA;
  // Power into the motors: mechanical output over the chain efficiency plus copper losses (I²R).
  const perMotor=motorA/d.motors;tractionKW=(delivered*v/p.efficiency+d.motors*perMotor*perMotor*p.motorOhm)/1000;}
 else if(force<0&&v>.05){brakeKW=Math.min(p.maxKW,-force*v/1000*p.brakeEfficiency);motorA=Math.min(p.motorLimitA,-force/p.forcePerA);}
 const auxKW=powered?p.auxKW:0,inKW=tractionKW+auxKW,{V,I}=lineFrom248(inKW,powered,p,d);
 return {massT:mT,force,delivered,tractionKW,brakeKW,auxKW,inKW,V,I,motorA,motorPerA:motorA/d.motors,limited,accelReal:delivered>0?(delivered-(v>.05?resist:0))/meq:null};
}
// Start from rest on level track for a load fraction. mode 'limit': the control holds the motor
// current limit (a real start); mode 'same': every load is asked the same acceleration.
export function startRun248(frac,{mode='limit',accel=1,seconds=45,dt=.1}={},p=ASSUMED245,d=DOCUMENTED245){
 const mT=massFromFraction248(frac,d),meq=mT*1000*p.rotating,rows=[];let v=0,x=0,t60=null,t80=null,x80=null,Vmin=Infinity,Ipeak=0,motorStart=0;
 for(let t=0;t<=seconds+1e-9;t+=dt){const resist=mT*p.rollingNPerT+p.aeroNPerMs2*v*v;let F;
  if(mode==='same')F=v<80/3.6?Math.min(meq*accel+resist,v>.1?p.maxKW*1000*p.efficiency/v:Infinity):resist;else F=v<80/3.6?tractionCap248(v,p):resist;
  const perMotor=F/p.forcePerA/d.motors,inKW=(F*v/p.efficiency+d.motors*perMotor*perMotor*p.motorOhm)/1000+p.auxKW,{V,I}=lineFrom248(inKW,true,p,d);
  const a=Math.max(0,(F-resist)/meq);if(t===0)motorStart=F/p.forcePerA;Vmin=Math.min(Vmin,V);Ipeak=Math.max(Ipeak,I);
  rows.push({t,v:v*3.6,motorA:F/p.forcePerA,I,V,F,a});v=Math.min(80/3.6,v+a*dt);x+=v*dt;if(t60==null&&v>=60/3.6)t60=t;if(t80==null&&v>=80/3.6-1e-6){t80=t;x80=x;}}
 return {frac,massT:mT,rows,startForce:rows[0].F,startAccel:rows[0].a,motorStart,motorPerStart:motorStart/d.motors,Ipeak,Vmin,t60,t80,x80};
}

const fmt=(x,dig=0)=>Number(x).toLocaleString('es-MX',{maximumFractionDigits:dig,minimumFractionDigits:dig});
const SERIES245=[['speed','Velocidad','km/h'],['motorA','Corriente de motores (24)','A'],['I','Corriente de línea','A'],['V','Tensión en el tren','V'],['P','Potencia (tracción + / frenado −)','kW']];

export class ElectricDashboard245{
 constructor(doc=document,win=window){
  this.doc=doc;this.win=win;this.params={...ASSUMED245};this.history=[];this.starts=[];this.reset();this.tab='live';this.mode248='limit';
  const host=doc.getElementById('sim106-shell')||doc.body,tools=doc.querySelector('.sim106-view-tools'),heading=doc.querySelector('.drive107-heading');
  this.button=doc.createElement('button');this.button.type='button';this.button.className='ed245-toggle';this.button.innerHTML='⚡ Análisis eléctrico';this.button.setAttribute('aria-expanded','false');this.button.onclick=()=>this.toggle();
  (tools||heading||host).append(this.button);
  this.root=doc.createElement('section');this.root.className='ed245';this.root.hidden=true;this.root.setAttribute('aria-label','Análisis eléctrico del tren');
  this.root.innerHTML=`<header><div><small data-ed245-mode>ANÁLISIS ELÉCTRICO</small><h3 data-ed245-title>Tren</h3></div><div class="ed245-actions"><button type="button" data-ed245-reset>Reiniciar registro</button><button type="button" data-ed245-close aria-label="Cerrar">×</button></div></header>
<nav class="ed245-tabs" role="tablist"><button type="button" role="tab" data-ed245-tab="live" aria-selected="true">En vivo</button><button type="button" role="tab" data-ed245-tab="weight" aria-selected="false">Efecto del peso</button></nav>
<div data-ed245-pane="live">
<div class="ed245-train" data-ed245-train></div>
<div class="ed245-tiles" data-ed245-tiles></div>
<p class="ed245-hint" data-ed245-hint>Pasa el ratón por una gráfica: todas marcan el mismo instante y los recuadros muestran sus valores.</p>
<div class="ed245-charts" data-ed245-charts></div>
<figure class="ed245-starts"><figcaption><b>Arranques: corriente de motores desde que el tren se mueve</b></figcaption><canvas width="560" height="150" data-ed245-starts aria-label="Corriente de motores del arranque actual y del anterior"></canvas><div class="ed245-legend" data-ed245-starts-legend></div></figure>
<details class="ed245-table"><summary>Consumo por interestación</summary><table><thead><tr><th>Tramo</th><th>Distancia</th><th>Tiempo</th><th>Tracción</th><th>Frenado eléctrico</th><th>kWh/km</th><th>Corriente pico</th></tr></thead><tbody data-ed245-rows><tr><td colspan="7">Sigue al tren de una estación a otra para registrar el primer tramo.</td></tr></tbody></table></details>
</div>
<div data-ed245-pane="weight" hidden>
<div class="ed245-modes"><span>Cómo arranca:</span><button type="button" data-ed245-run="limit" aria-pressed="true">Con el límite de corriente (real)</button><button type="button" data-ed245-run="same" aria-pressed="false">Pidiendo la misma aceleración</button></div>
<p class="ed245-hint" data-ed245-weight-note></p>
<div class="ed245-legend" data-ed245-weight-legend></div>
<div class="ed245-charts" data-ed245-weight-charts></div>
<table class="ed245-compare"><thead><tr><th>Carga</th><th>Masa</th><th>Fuerza al arrancar</th><th>Aceleración inicial</th><th>Corriente por motor</th><th>Corriente de línea pico</th><th>Tensión mínima</th><th>A 60 km/h</th><th>A 80 km/h</th></tr></thead><tbody data-ed245-compare></tbody></table>
</div>
<details class="ed245-notes"><summary>Supuestos y fuentes</summary><div data-ed245-notes></div></details>`;
  host.append(this.root);
  const $=s=>this.root.querySelector(s);
  $('[data-ed245-close]').onclick=()=>this.toggle(false);$('[data-ed245-reset]').onclick=()=>{this.reset();this.starts=[];this.draw();};
  for(const b of this.root.querySelectorAll('[data-ed245-tab]'))b.onclick=()=>this.showTab(b.dataset.ed245Tab);
  for(const b of this.root.querySelectorAll('[data-ed245-run]'))b.onclick=()=>{this.mode248=b.dataset.ed245Run;for(const x of this.root.querySelectorAll('[data-ed245-run]'))x.setAttribute('aria-pressed',String(x===b));this.drawWeight();};
  this.tiles=$('[data-ed245-tiles]');
  this.charts=SERIES245.map(([key,label,unit])=>this.figure($('[data-ed245-charts]'),key,label,unit,130));
  this.weightCharts=[['v','Velocidad','km/h'],['motorA','Corriente de motores (24)','A'],['I','Corriente de línea','A'],['V','Tensión en el tren','V']].map(([key,label,unit])=>this.figure($('[data-ed245-weight-charts]'),key,label,unit,140,true));
  $('[data-ed245-weight-legend]').innerHTML=LOADS248.map(([f,l,c])=>`<span><i style="background:${c}"></i>${l}</span>`).join('');
  this.notes();
  this.timer=win.setInterval?.(()=>this.sample(),200);
 }
 figure(parent,key,label,unit,h,weight=false){const fig=this.doc.createElement('figure');fig.innerHTML=`<figcaption><b>${label}</b><span data-now></span></figcaption><canvas width="560" height="${h}" aria-label="${label}"></canvas><output class="ed245-tip" hidden></output>`;parent.append(fig);
  const c={key,label,unit,fig,weight,canvas:fig.querySelector('canvas'),now:fig.querySelector('[data-now]'),tip:fig.querySelector('.ed245-tip')};
  c.canvas.addEventListener('pointermove',e=>this.hover(c,e));c.canvas.addEventListener('pointerleave',()=>{this.hoverAt=null;this.hoverWeight=null;this.redraw(weight);});return c;}
 reset(){this.history=[];this.totals={tractionKWh:0,brakeKWh:0,auxKWh:0,km:0,peakA:0,time:0};this.segments=[];this.segment=null;this.lastT=null;this.lastV=null;this.start=null;}
 toggle(open=this.root.hidden){this.root.hidden=!open;this.button.setAttribute('aria-expanded',String(open));if(open)this.draw();}
 showTab(tab){this.tab=tab;for(const b of this.root.querySelectorAll('[data-ed245-tab]'))b.setAttribute('aria-selected',String(b.dataset.ed245Tab===tab));for(const p of this.root.querySelectorAll('[data-ed245-pane]'))p.hidden=p.dataset.ed245Pane!==tab;this.draw();}
 notes(){const d=DOCUMENTED245,p=this.params,box=this.root.querySelector('[data-ed245-notes]');
  box.innerHTML=`<p><b>Datos documentados.</b> Tracción a ${d.nominalV} V CD por barra guía. Un tren de 9 carros pesa ${fmt(d.emptyT,1)} t vacío y ${fmt(d.loadedT,1)} t a carga completa (4/4, con 70 kg por persona). Lleva 4 motores por carro motriz, 24 en total, y frenado eléctrico reostático y/o neumático. El control es chopper en el NM-79 y el MP-82, y VVVF en el NM-22.</p>
<p><b>Supuestos del modelo.</b> No son datos del fabricante; cámbialos para ver qué pasa.</p>
<div class="ed245-params">${[['forcePerA','Fuerza por ampere de motor','N/A',10,120,1],['motorLimitA','Corriente límite de los 24 motores','A',2000,20000,500],['maxKW','Potencia máxima de tracción','kW',500,8000,100],['efficiency','Rendimiento de la cadena de tracción','',.6,.99,.01],['motorOhm','Resistencia de cada motor','Ω',0,.2,.005],['auxKW','Auxiliares (aire, alumbrado, ventilación)','kW',0,400,10],['rollingNPerT','Resistencia de rodadura','N/t',5,60,1],['lineOhm','Resistencia de la alimentación','Ω',0,.08,.005]].map(([k,l,u,min,max,step])=>`<label>${l}<input type="number" data-ed245-param="${k}" value="${p[k]}" min="${min}" max="${max}" step="${step}"> <span>${u}</span></label>`).join('')}</div>
<p><b>Dos corrientes distintas.</b> La de motores depende de la fuerza: al arrancar es la más alta, aunque el tren casi no se mueva. La de línea es la que toma el tren de la barra guía, igual a la potencia de entrada entre la tensión. Al arrancar, el control entrega mucha corriente a los motores con poca tensión, así que de la línea se toma poca. Conforme sube la velocidad, la corriente de línea crece hasta el límite de potencia.</p>
<p><b>Ojo con la aceleración.</b> En el simulador el tren acelera parejo hasta su velocidad máxima. Un tren real está limitado por la corriente de sus motores y por su potencia. Cuando el movimiento pide más, el tablero marca «al límite» y calcula lo que el tren sí podría entregar. Los 3,400 kW de potencia máxima son la tracción documentada de los trenes férreos FM-86, FM-95, FE-07 y FE-10 del STC; para los neumáticos no hay dato publicado, así que se usan como comparación.</p>
<p>En frenado, la energía mostrada es la que se disipa en el reóstato: no está documentado que estos trenes la regresen a la red, así que no se cuenta como ahorro.</p>
<p>${d.sources.map(([t,u])=>`<a href="${u}" target="_blank" rel="noopener">${t}</a>`).join(' · ')}</p>`;
  for(const input of box.querySelectorAll('[data-ed245-param]'))input.onchange=()=>{const v=Number(input.value);if(Number.isFinite(v))this.params[input.dataset.ed245Param]=v;this.drawWeight();};}
 // Reads the simulator (never writes it).
 read(){const s=this.win.metroViewState?.();const e=s?.engine;if(!e)return null;const op=e.operator,t=e.trains?.find(x=>op?x.id===op.trainId:x.id===s.selectedTrain);if(!t)return null;return {e,op,t,s};}
 loadOf(t,e){const shown=this.win.trainLoad248?.displayed?.(t,e);return shown??t.load??0;}
 sample(now=(this.win.performance?.now?.()??Date.now())){
  const r=this.read();if(!r){this.lastT=null;return;}const {e,op,t}=r,time=now/1000;if(this.trainId!==undefined&&this.trainId!==t.id+'@'+t.line){this.reset();this.starts=[];}this.trainId=t.id+'@'+t.line;
  if(this.lastT==null||time-this.lastT>2){this.lastT=time;this.lastV=t.speed;this.lastPos=t.position;this.train=t;return;}
  const dt=time-this.lastT;if(dt<=0)return;const raw=Math.max(-3,Math.min(3,(t.speed-this.lastV)/dt)),k=1-Math.exp(-dt/.8);this.acc=(this.acc??raw)+(raw-(this.acc??raw))*k;const a=this.acc,powered=!!e.power?.[t.line]&&!e.emergency;
  const load=this.loadOf(t,e),st=electricState245({v:t.speed,a,load,capacity:e.capacity||0,traction:op?op.throttle:(a>-.05&&t.speed>.3?1:0),brake:op?op.brake:0,powered},this.params);
  const km=Math.abs(t.position-(this.lastPos??t.position))/1000;
  this.totals.tractionKWh+=st.tractionKW*dt/3600;this.totals.brakeKWh+=st.brakeKW*dt/3600;this.totals.auxKWh+=st.auxKW*dt/3600;this.totals.km+=km;this.totals.time+=dt;this.totals.peakA=Math.max(this.totals.peakA,st.I);
  const row={time:this.totals.time,speed:t.speed*3.6,motorA:st.motorA,I:st.I,V:st.V,P:st.tractionKW>0?st.tractionKW:-st.brakeKW,st,load,capacity:e.capacity||1};this.history.push(row);while(this.history.length&&this.totals.time-this.history[0].time>120)this.history.shift();
  // Starts: from the moment the train leaves a stop, for 40 s. The previous one stays for comparison.
  if(!this.start&&this.lastV<.05&&t.speed>=.05)this.start={rows:[],massT:st.massT,load};
  if(this.start){const g=this.start;g.rows.push({t:g.rows.length?g.rows[g.rows.length-1].t+dt:0,motorA:st.motorA,v:t.speed*3.6});if(g.rows[g.rows.length-1].t>=40||t.speed<.05&&g.rows.length>5){this.starts.unshift(g);this.starts.length=Math.min(2,this.starts.length);this.start=null;}}
  const line=e.lines?.[t.line],stopped=t.speed<.05&&(op?.phase==='open'||t.wait>0);
  if(!this.segment&&!stopped&&t.speed>.3)this.segment={from:line?.stations?.[nearest245(line,this.lastPos)]?.nombre||'—',km:0,time:0,tr:0,br:0,peak:0};
  if(this.segment){const g=this.segment;g.km+=km;g.time+=dt;g.tr+=st.tractionKW*dt/3600;g.br+=st.brakeKW*dt/3600;g.peak=Math.max(g.peak,st.I);if(stopped&&g.km>.05){g.to=line?.stations?.[nearest245(line,t.position)]?.nombre||'—';this.segments.unshift(g);this.segments.length=Math.min(this.segments.length,12);this.segment=null;this.renderRows();}}
  this.lastT=time;this.lastV=t.speed;this.lastPos=t.position;this.train=t;this.state=st;
  if(!this.root.hidden&&this.tab==='live')this.draw();
 }
 css(){const css=getComputedStyle(this.root),g=(k,f)=>css.getPropertyValue(k).trim()||f;return {ink:g('--ed245-muted','#9aa39e'),grid:g('--ed245-grid','#ffffff1f'),line:g('--ed245-series','#3987e5'),text:g('--ed245-ink','#f0efec')};}
 draw(){const t=this.train,op=this.win.metroViewState?.()?.engine?.operator;
  this.root.querySelector('[data-ed245-mode]').textContent=op?'ANÁLISIS ELÉCTRICO · TREN EN CONDUCCIÓN':'ANÁLISIS ELÉCTRICO · SEGUIMIENTO DE LA RED'+(t?' · convoy '+t.id:'');
  this.root.querySelector('[data-ed245-title]').textContent=t?`${t.model||'Tren'} · Línea ${t.line} · control ${CONTROL245[t.model]||'según modelo'}`:'Sigue o conduce un tren para empezar';
  if(this.tab==='weight'){this.drawWeight();return;}
  const T=this.totals,row=this.hoverAt!=null?this.rowAt(this.hoverAt):this.history[this.history.length-1],st=row?.st,perKm=T.km>.05?(T.tractionKWh+T.auxKWh)/T.km:null,at=this.hoverAt!=null&&row?` (hace ${fmt(this.history[this.history.length-1].time-row.time)} s)`:'';
  const tiles=[['Corriente de motores'+at,st?fmt(st.motorA)+' A · '+fmt(st.motorPerA)+' A c/u':'—'],['Corriente de línea'+at,st?fmt(st.I)+' A':'—'],['Tensión en el tren'+at,st?fmt(st.V)+' V':'—'],['Fuerza de tracción'+at,st?fmt(st.delivered/1000)+' kN'+(st.limited?' · al límite':''):'—'],['Potencia de tracción'+at,st?fmt(st.tractionKW)+' kW':'—'],['Masa con pasajeros',st?fmt(st.massT,1)+' t':'—'],['Energía de tracción',fmt(T.tractionKWh,2)+' kWh'],['Disipada al frenar',fmt(T.brakeKWh,2)+' kWh'],['Consumo por km',perKm==null?'—':fmt(perKm,2)+' kWh/km']];
  this.tiles.innerHTML=tiles.map(([k,v],i)=>`<div${i<5&&st?.limited&&i===3?' data-warn':''}><small>${k}</small><b>${v}</b></div>`).join('');
  this.drawTrain(row);for(const c of this.charts)this.drawLive(c);this.drawStarts();}
 rowAt(time){return this.history.reduce((b,q)=>Math.abs(q.time-time)<Math.abs(b.time-time)?q:b,this.history[0]);}
 // Train diagram: fill of each car, glowing motors by current, force arrow and mass.
 drawTrain(row){const box=this.root.querySelector('[data-ed245-train]'),frac=row?Math.max(0,Math.min(1,row.load/row.capacity)):0,st=row?.st,motor=st?Math.min(1,st.motorA/this.params.motorLimitA):0,W=560,cw=56,gap=5;
  const cars=FORMATION245.map((k,i)=>{const x=8+i*(cw+gap),motorCar=k==='M'||k==='N',h=28*frac;return `<g><rect x="${x}" y="14" width="${cw}" height="30" rx="5" class="car"/><rect x="${x+2}" y="${42-h}" width="${cw-4}" height="${h}" rx="3" class="fill"/>${motorCar?`<circle cx="${x+14}" cy="50" r="5" class="wheel" style="--m:${motor.toFixed(2)}"/><circle cx="${x+cw-14}" cy="50" r="5" class="wheel" style="--m:${motor.toFixed(2)}"/>`:`<circle cx="${x+14}" cy="50" r="5" class="trailer"/><circle cx="${x+cw-14}" cy="50" r="5" class="trailer"/>`}<text x="${x+cw/2}" y="10" class="code">${k}</text></g>`;}).join('');
  const force=st?.delivered>0?Math.min(1,st.delivered/(this.params.forcePerA*this.params.motorLimitA)):0;
  box.innerHTML=`<svg viewBox="0 0 ${W} 74" role="img" aria-label="Esquema del tren con su carga y la corriente de los motores">${cars}<line x1="8" y1="66" x2="${8+force*(W-24)}" y2="66" class="force"/>${force>0?`<polygon points="${8+force*(W-24)},61 ${16+force*(W-24)},66 ${8+force*(W-24)},71" class="force-head"/>`:''}</svg>
<div class="ed245-train-legend"><span><i class="sw-fill"></i>Carga ${fmt(frac*100)} % · ${fmt(row?.load||0)} pasajeros · ${st?fmt(st.massT,1):'—'} t</span><span><i class="sw-motor"></i>Motores: ${st?fmt(st.motorPerA):'—'} A c/u</span><span><i class="sw-force"></i>Fuerza: ${st?fmt(st.delivered/1000):'—'} kN</span></div>`;}
 axes(ctx,c,lo,hi,W,H,L,R,Tp,B,col,xLabels){const nice=niceStep245((hi-lo)/3);lo=Math.floor(lo/nice)*nice;hi=Math.ceil(hi/nice)*nice;const y=v=>Tp+(hi-v)/(hi-lo||1)*(H-Tp-B);
  ctx.font='11px system-ui';ctx.fillStyle=col.ink;ctx.strokeStyle=col.grid;ctx.lineWidth=1;ctx.textAlign='right';ctx.textBaseline='middle';
  for(let v=lo;v<=hi+1e-9;v+=nice){ctx.beginPath();ctx.moveTo(L,Math.round(y(v))+.5);ctx.lineTo(W-R,Math.round(y(v))+.5);ctx.stroke();ctx.fillText(fmt(v),L-6,y(v));}
  ctx.textBaseline='top';ctx.textAlign='left';ctx.fillText(xLabels[0],L,H-B+5);ctx.textAlign='right';ctx.fillText(xLabels[1],W-R,H-B+5);return {lo,hi,y};}
 drawLive(c){const cv=c.canvas,ctx=cv.getContext?.('2d'),pts=this.history,last=pts[pts.length-1];const shown=this.hoverAt!=null&&pts.length?this.rowAt(this.hoverAt):last;c.now.textContent=shown?fmt(shown[c.key])+' '+c.unit:'';if(!ctx)return;
  const W=cv.width,H=cv.height,L=50,R=8,Tp=10,B=20,col=this.css();ctx.clearRect(0,0,W,H);
  let lo=Math.min(0,...pts.map(p=>p[c.key])),hi=Math.max({speed:90,motorA:2000,I:1000,P:500}[c.key]||1,...pts.map(p=>p[c.key]));if(c.key==='V'){lo=Math.min(600,...pts.map(p=>p.V));hi=Math.max(760,...pts.map(p=>p.V));}
  const ax=this.axes(ctx,c,lo,hi,W,H,L,R,Tp,B,col,['−2 min','ahora']),t1=last?.time||120,t0=t1-120,x=t=>L+(t-t0)/120*(W-L-R);
  const ref=c.key==='P'?this.params.maxKW:c.key==='motorA'?this.params.motorLimitA:null;if(ref&&ref<=ax.hi&&ref>=ax.lo){ctx.save();ctx.setLineDash([4,4]);ctx.strokeStyle=col.ink;ctx.beginPath();ctx.moveTo(L,ax.y(ref));ctx.lineTo(W-R,ax.y(ref));ctx.stroke();ctx.restore();ctx.textAlign='left';ctx.textBaseline='bottom';ctx.fillText(c.key==='P'?'potencia máxima supuesta':'límite de corriente supuesto',L+4,ax.y(ref)-2);}
  if(ax.lo<0&&ax.hi>0){ctx.strokeStyle=col.ink;ctx.beginPath();ctx.moveTo(L,ax.y(0));ctx.lineTo(W-R,ax.y(0));ctx.stroke();}
  if(pts.length>1){ctx.strokeStyle=col.line;ctx.lineWidth=2;ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(x(p.time),ax.y(p[c.key])):ctx.moveTo(x(p.time),ax.y(p[c.key])));ctx.stroke();}
  // Shared instant: every live chart marks the same moment.
  if(this.hoverAt!=null&&shown){ctx.strokeStyle=col.ink;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x(shown.time),Tp);ctx.lineTo(x(shown.time),H-B);ctx.stroke();ctx.fillStyle=col.line;ctx.strokeStyle='#121a19';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x(shown.time),ax.y(shown[c.key]),5,0,Math.PI*2);ctx.fill();ctx.stroke();
   c.tip.hidden=false;c.tip.textContent=`${fmt(shown[c.key])} ${c.unit} · ${fmt(shown.speed)} km/h`;c.tip.style.left=Math.min(70,Math.max(0,(x(shown.time)/W*100-10)))+'%';}else c.tip.hidden=true;}
 drawStarts(){const cv=this.root.querySelector('[data-ed245-starts]'),ctx=cv?.getContext?.('2d'),list=[this.start,...this.starts].filter(Boolean).slice(0,2),col=this.css(),styles=[[col.line,[]],[col.ink,[5,4]]];
  this.root.querySelector('[data-ed245-starts-legend]').innerHTML=list.length?list.map((g,i)=>`<span><i style="background:${styles[i][0]}"></i>${i?'Arranque anterior':'Arranque actual'} · ${fmt(g.massT,1)} t</span>`).join(''):'<span>Aparecerá en cuanto el tren arranque.</span>';if(!ctx)return;
  const W=cv.width,H=cv.height,L=50,R=8,Tp=10,B=20;ctx.clearRect(0,0,W,H);const hi=Math.max(this.params.motorLimitA*1.1,...list.flatMap(g=>g.rows.map(r=>r.motorA))),ax=this.axes(ctx,null,0,hi,W,H,L,R,Tp,B,col,['0 s','40 s']),x=t=>L+t/40*(W-L-R);
  list.forEach((g,i)=>{if(g.rows.length<2)return;ctx.save();ctx.strokeStyle=styles[i][0];ctx.setLineDash(styles[i][1]);ctx.lineWidth=2;ctx.beginPath();g.rows.forEach((r,j)=>j?ctx.lineTo(x(r.t),ax.y(r.motorA)):ctx.moveTo(x(r.t),ax.y(r.motorA)));ctx.stroke();ctx.restore();});}
 // Weight tab: four loads from rest, same axes, so the effect of the mass reads directly.
 drawWeight(){if(this.root.hidden||this.tab!=='weight')return;const runs=LOADS248.map(([f])=>startRun248(f,{mode:this.mode248},this.params));this.runs=runs;
  const note=this.root.querySelector('[data-ed245-weight-note]'),full=runs[3],empty=runs[0];
  note.textContent=this.mode248==='limit'?`Con el límite de corriente, los cuatro arrancan con la misma fuerza (${fmt(empty.startForce/1000)} kN) y la misma corriente por motor. El tren lleno pesa ${fmt((full.massT/empty.massT-1)*100)} % más, así que acelera menos y tarda ${full.t80&&empty.t80?fmt(full.t80-empty.t80,1)+' s más':'más'} en llegar a 80 km/h. En la línea toma más corriente durante más tiempo.`:`Si se pide la misma aceleración a todos, la fuerza y la corriente de motores crecen con la masa. Lleno se necesita ${fmt((full.startForce/empty.startForce-1)*100)} % más fuerza que vacío, y la tensión en el tren baja más. Cuando pasa del límite supuesto (${fmt(this.params.motorLimitA)} A), el control real no lo permitiría.`;
  const col=this.css(),hover=this.hoverWeight;
  for(const c of this.weightCharts){const cv=c.canvas,ctx=cv.getContext?.('2d');if(!ctx)continue;const W=cv.width,H=cv.height,L=50,R=8,Tp=10,B=20;ctx.clearRect(0,0,W,H);const all=runs.flatMap(r=>r.rows.map(q=>q[c.key]));
   let lo=Math.min(0,...all),hi=Math.max(1,...all);if(c.key==='V'){lo=Math.min(600,...all);hi=Math.max(760,...all);}
   const ax=this.axes(ctx,c,lo,hi,W,H,L,R,Tp,B,col,['0 s','45 s']),x=t=>L+t/45*(W-L-R);
   if(c.key==='motorA'){ctx.save();ctx.setLineDash([4,4]);ctx.strokeStyle=col.ink;const yy=ax.y(this.params.motorLimitA);ctx.beginPath();ctx.moveTo(L,yy);ctx.lineTo(W-R,yy);ctx.stroke();ctx.restore();ctx.textAlign='left';ctx.textBaseline='bottom';ctx.fillStyle=col.ink;ctx.fillText('límite de corriente supuesto',L+4,yy-2);}
   runs.forEach((r,i)=>{ctx.strokeStyle=LOADS248[i][2];ctx.lineWidth=2;ctx.lineJoin='round';ctx.beginPath();r.rows.forEach((q,j)=>j?ctx.lineTo(x(q.t),ax.y(q[c.key])):ctx.moveTo(x(q.t),ax.y(q[c.key])));ctx.stroke();});
   if(hover!=null){const k=Math.round(Math.max(0,Math.min(45,hover))/.1);ctx.strokeStyle=col.ink;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x(k*.1),Tp);ctx.lineTo(x(k*.1),H-B);ctx.stroke();
    runs.forEach((r,i)=>{const q=r.rows[Math.min(k,r.rows.length-1)];ctx.fillStyle=LOADS248[i][2];ctx.strokeStyle='#121a19';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x(q.t),ax.y(q[c.key]),4.5,0,Math.PI*2);ctx.fill();ctx.stroke();});
    c.tip.hidden=false;c.tip.textContent=`${fmt(k*.1,1)} s · `+runs.map((r,i)=>`${LOADS248[i][1]} ${fmt(r.rows[Math.min(k,r.rows.length-1)][c.key])}`).join(' · ')+' '+c.unit;c.tip.style.left='0%';}else c.tip.hidden=true;
   c.now.textContent='';}
  this.root.querySelector('[data-ed245-compare]').innerHTML=runs.map((r,i)=>`<tr><td><i class="sw" style="background:${LOADS248[i][2]}"></i>${LOADS248[i][1]}</td><td>${fmt(r.massT,1)} t</td><td>${fmt(r.startForce/1000)} kN</td><td>${fmt(r.startAccel,2)} m/s²</td><td${r.motorStart>this.params.motorLimitA*1.001?' data-warn':''}>${fmt(r.motorPerStart)} A</td><td>${fmt(r.Ipeak)} A</td><td>${fmt(r.Vmin)} V</td><td>${r.t60==null?'—':fmt(r.t60,1)+' s'}</td><td>${r.t80==null?'—':fmt(r.t80,1)+' s · '+fmt(r.x80)+' m'}</td></tr>`).join('');}
 redraw(weight){if(weight)this.drawWeight();else this.draw();}
 hover(c,e){const r=c.canvas.getBoundingClientRect(),px=(e.clientX-r.left)/r.width*c.canvas.width,L=50,R=8,W=c.canvas.width;
  if(c.weight){this.hoverWeight=(px-L)/(W-L-R)*45;this.drawWeight();return;}
  const last=this.history[this.history.length-1];if(!last)return;this.hoverAt=last.time-120+(px-L)/(W-L-R)*120;this.draw();}
 renderRows(){const body=this.root.querySelector('[data-ed245-rows]');body.innerHTML=this.segments.map(g=>`<tr><td>${g.from} → ${g.to}</td><td>${fmt(g.km*1000)} m</td><td>${fmt(g.time)} s</td><td>${fmt(g.tr,2)} kWh</td><td>${fmt(g.br,2)} kWh</td><td>${g.km>.05?fmt((g.tr)/g.km,2):'—'}</td><td>${fmt(g.peak)} A</td></tr>`).join('');}
 dispose(){this.win.clearInterval?.(this.timer);this.root.remove();this.button.remove();}
}
function nearest245(line,pos){const d=line?.distances||[];let k=0;for(let i=1;i<d.length;i++)if(Math.abs(d[i]-pos)<Math.abs(d[k]-pos))k=i;return k;}
function niceStep245(x){if(!(x>0))return 1;const e=Math.pow(10,Math.floor(Math.log10(x))),f=x/e;return (f<=1?1:f<=2?2:f<=5?5:10)*e;}
export function installElectricDashboard245(doc=document,win=window){if(doc.querySelector('.ed245'))return win.electricDashboard245??null;return win.electricDashboard245=new ElectricDashboard245(doc,win);}
