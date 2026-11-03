// Análisis eléctrico 245: tablero de corriente, tensión, potencia y energía del tren que se conduce.
//
// Datos documentados (fuentes en la tarjeta «Supuestos y fuentes»):
//  - tensión nominal de tracción 750 V CD por barra guía (STC);
//  - masa de un tren neumático de 9 carros: 231.4 t vacío y 338.5 t a carga 4/4 con 70 kg por persona;
//  - cuatro motores por carro motriz; control por chopper en NM-79 y MP-82, VVVF en el NM-22;
//  - frenado eléctrico reostático y/o neumático en el material neumático.
// Supuestos del modelo educativo (no son datos del fabricante y se pueden cambiar en el tablero):
//  rendimiento de la cadena de tracción, resistencia al avance, factor de masas rotativas,
//  potencia de auxiliares y resistencia equivalente de la alimentación.
// The model only reads the simulator state; it never changes the train or the mission.

export const DOCUMENTED245={nominalV:750,emptyT:231.4,loadedT:338.5,passengerKg:70,cars:9,motorsPerMotorCar:4,
 sources:[['STC · Conformación de un tren','https://www.metro.cdmx.gob.mx/operacion/conformacion-de-un-tren'],['Información técnica del Metro (resumen de datos del STC)','https://blogs.masterhacks.net/geek/interesante/breve-informacion-tecnica-sobre-el-metro-de-la-cdmx/?pdf=1986'],['ADN40 · Peso de un vagón (cita «Características generales del material rodante», STC)','https://www.adn40.mx/ciudad/metro-cdmx-cuanto-pesa-un-vagon-del-sistema-transporte-colectivo-y-cuantas-personas-le-caben']]};
// Comparative reference only (rail fleet FM-86/FM-95/FE-07/FE-10 of the STC): total traction power.
export const REFERENCE_KW245=3400;
export const ASSUMED245={maxKW:3400,efficiency:.86,brakeEfficiency:.8,rotating:1.08,rollingNPerT:25,aeroNPerMs2:9,auxKW:180,lineOhm:.025};
const CONTROL245={'NM-22':'VVVF (motores asíncronos)','NM-79':'Chopper','MP-82':'Chopper'};

// One physics step. v in m/s, a in m/s² (from the simulator), load = passengers on board.
export function electricState245({v=0,a=0,load=0,traction=0,brake=0,powered=true},p=ASSUMED245,d=DOCUMENTED245){
 const massT=Math.min(d.loadedT,d.emptyT+load*d.passengerKg/1000),m=massT*1000,meq=m*p.rotating;
 const resist=massT*p.rollingNPerT+p.aeroNPerMs2*v*v,force=meq*a+(v>.05?resist:0);
 let tractionKW=0,brakeKW=0;
 // The traction chain cannot deliver more than its rated power (an assumption, editable): if the
 // simulated motion asks for more, the dashboard caps it and flags it instead of showing impossible currents.
 let limited=false;if(force>0&&traction>0&&powered){tractionKW=force*v/1000/p.efficiency;if(tractionKW>p.maxKW){tractionKW=p.maxKW;limited=true;}}
 else if(force<0&&v>.05){brakeKW=Math.min(p.maxKW,-force*v/1000*p.brakeEfficiency);}
 const auxKW=powered?p.auxKW:0,inKW=tractionKW+auxKW;
 // Train terminal voltage with a resistive feed: V² - V0·V + R·P = 0 (largest root).
 const V0=powered?d.nominalV:0,P=inKW*1000,disc=V0*V0-4*p.lineOhm*P,V=V0?(disc>0?(V0+Math.sqrt(disc))/2:V0/2):0,I=V?P/V:0;
 return {massT,force,tractionKW,brakeKW,auxKW,inKW,V,I,limited};
}

const fmt=(x,dig=0)=>Number(x).toLocaleString('es-MX',{maximumFractionDigits:dig,minimumFractionDigits:dig});
const SERIES245=[['speed','Velocidad','km/h',0],['I','Corriente de tracción','A',0],['V','Tensión en el tren','V',0],['P','Potencia (tracción + / frenado −)','kW',0]];

export class ElectricDashboard245{
 constructor(doc=document,win=window){
  this.doc=doc;this.win=win;this.params={...ASSUMED245};this.history=[];this.reset();
  const host=doc.getElementById('sim106-shell')||doc.body,tools=doc.querySelector('.sim106-view-tools'),heading=doc.querySelector('.drive107-heading');
  this.button=doc.createElement('button');this.button.type='button';this.button.className='ed245-toggle';this.button.innerHTML='⚡ Análisis eléctrico';this.button.setAttribute('aria-expanded','false');this.button.onclick=()=>this.toggle();// 246: in the shared view tools (next to Cameras and Map), so it works while following the network
  // and while driving.
  (tools||heading||host).append(this.button);
  this.root=doc.createElement('section');this.root.className='ed245';this.root.hidden=true;this.root.setAttribute('aria-label','Análisis eléctrico del tren');
  this.root.innerHTML=`<header><div><small data-ed245-mode>ANÁLISIS ELÉCTRICO</small><h3 data-ed245-title>Tren</h3></div><div class="ed245-actions"><button type="button" data-ed245-reset>Reiniciar registro</button><button type="button" data-ed245-close aria-label="Cerrar">×</button></div></header>
<div class="ed245-tiles" data-ed245-tiles></div>
<div class="ed245-charts" data-ed245-charts></div>
<details class="ed245-table"><summary>Consumo por interestación</summary><table><thead><tr><th>Tramo</th><th>Distancia</th><th>Tiempo</th><th>Tracción</th><th>Frenado eléctrico</th><th>kWh/km</th><th>Corriente pico</th></tr></thead><tbody data-ed245-rows><tr><td colspan="7">Conduce de una estación a otra para registrar el primer tramo.</td></tr></tbody></table></details>
<details class="ed245-notes"><summary>Supuestos y fuentes</summary><div data-ed245-notes></div></details>`;
  host.append(this.root);
  this.root.querySelector('[data-ed245-close]').onclick=()=>this.toggle(false);this.root.querySelector('[data-ed245-reset]').onclick=()=>{this.reset();this.draw();};
  this.tiles=this.root.querySelector('[data-ed245-tiles]');this.charts=SERIES245.map(([key,label,unit])=>{const fig=doc.createElement('figure');fig.innerHTML=`<figcaption><b>${label}</b><span data-now></span></figcaption><canvas width="520" height="130" aria-label="${label} en los últimos 2 minutos"></canvas><output class="ed245-tip" hidden></output>`;this.root.querySelector('[data-ed245-charts]').append(fig);const c={key,label,unit,fig,canvas:fig.querySelector('canvas'),now:fig.querySelector('[data-now]'),tip:fig.querySelector('.ed245-tip')};c.canvas.addEventListener('pointermove',e=>this.hover(c,e));c.canvas.addEventListener('pointerleave',()=>{c.hoverX=null;c.tip.hidden=true;this.drawChart(c);});return c;});
  this.notes();
  this.timer=win.setInterval?.(()=>this.sample(),200);
 }
 reset(){this.history=[];this.totals={tractionKWh:0,brakeKWh:0,auxKWh:0,km:0,peakA:0,time:0};this.segments=[];this.segment=null;this.lastT=null;this.lastV=null;}
 toggle(open=this.root.hidden){this.root.hidden=!open;this.button.setAttribute('aria-expanded',String(open));if(open)this.draw();}
 notes(){const d=DOCUMENTED245,p=this.params,box=this.root.querySelector('[data-ed245-notes]');
  box.innerHTML=`<p><b>Datos documentados.</b> Tracción a ${d.nominalV} V CD por barra guía; masa de un tren de 9 carros de ${fmt(d.emptyT,1)} t vacío y ${fmt(d.loadedT,1)} t a carga completa (70 kg por persona); 4 motores por carro motriz; frenado eléctrico reostático y/o neumático; control chopper en NM-79 y MP-82 y VVVF en el NM-22.</p>
<p><b>Supuestos del modelo</b> (no son datos del fabricante): puedes cambiarlos y ver cómo cambia el consumo.</p>
<div class="ed245-params">${[['maxKW','Potencia máxima de tracción','kW',500,8000,100],['efficiency','Rendimiento de tracción','',.6,.98,.01],['auxKW','Auxiliares (aire, alumbrado, ventilación)','kW',0,400,10],['rollingNPerT','Resistencia de rodadura','N/t',5,60,1],['lineOhm','Resistencia de la alimentación','Ω',0,.08,.005]].map(([k,l,u,min,max,step])=>`<label>${l}<input type="number" data-ed245-param="${k}" value="${p[k]}" min="${min}" max="${max}" step="${step}"> <span>${u}</span></label>`).join('')}</div>
<p><b>Ojo con la aceleración.</b> En el simulador el tren acelera parejo hasta su velocidad máxima, y un tren real no puede hacerlo porque su potencia tiene un límite. Por eso el tablero limita la tracción a una potencia máxima, por omisión de 3,400 kW, y marca «al límite» cuando el movimiento pediría más. Esos 3,400 kW son la tracción total documentada de los trenes férreos FM-86, FM-95, FE-07 y FE-10 del STC, unos 4,500 A a 750 V. Para los trenes neumáticos no hay dato publicado, así que se usa como supuesto de comparación; puedes cambiarlo.</p>
<p>La corriente es la de entrada del tren (tracción más auxiliares) dividida entre la tensión en sus terminales. La tensión baja con la corriente por la resistencia de la alimentación. En frenado, la energía mostrada es la que se disipa en el reóstato: el regreso de energía a la red no está documentado para estos trenes y no se cuenta como ahorro.</p>
<p>${d.sources.map(([t,u])=>`<a href="${u}" target="_blank" rel="noopener">${t}</a>`).join(' · ')}</p>`;
  for(const input of box.querySelectorAll('[data-ed245-param]'))input.onchange=()=>{const v=Number(input.value);if(Number.isFinite(v))this.params[input.dataset.ed245Param]=v;};}
 // Reads the simulator (never writes it).
 read(){const s=this.win.metroViewState?.();const e=s?.engine;if(!e)return null;const op=e.operator,t=e.trains?.find(x=>op?x.id===op.trainId:x.id===s.selectedTrain);if(!t)return null;return {e,op,t,s};}
 sample(now=(this.win.performance?.now?.()??Date.now())){
  const r=this.read();if(!r){this.lastT=null;return;}const {e,op,t}=r,time=now/1000;if(this.trainId!==undefined&&this.trainId!==t.id+'@'+t.line){this.reset();}this.trainId=t.id+'@'+t.line;
  if(this.lastT==null||time-this.lastT>2){this.lastT=time;this.lastV=t.speed;this.lastPos=t.position;this.train=t;return;}
  const dt=time-this.lastT;if(dt<=0)return;const raw=Math.max(-3,Math.min(3,(t.speed-this.lastV)/dt)),k=1-Math.exp(-dt/.8);this.acc=(this.acc??raw)+(raw-(this.acc??raw))*k;const a=this.acc,powered=!!e.power?.[t.line]&&!e.emergency;
  const st=electricState245({v:t.speed,a,load:t.load||0,traction:op?op.throttle:(a>-.05&&t.speed>.3?1:0),brake:op?op.brake:0,powered},this.params);
  const km=Math.abs(t.position-(this.lastPos??t.position))/1000;
  this.totals.tractionKWh+=st.tractionKW*dt/3600;this.totals.brakeKWh+=st.brakeKW*dt/3600;this.totals.auxKWh+=st.auxKW*dt/3600;this.totals.km+=km;this.totals.time+=dt;this.totals.peakA=Math.max(this.totals.peakA,st.I);
  const row={time:this.totals.time,speed:t.speed*3.6,I:st.I,V:st.V,P:st.tractionKW>0?st.tractionKW:-st.brakeKW,st};this.history.push(row);while(this.history.length&&this.totals.time-this.history[0].time>120)this.history.shift();
  // Interstation record: a segment closes when the train stops at a platform with doors open.
  const line=e.lines?.[t.line],stopped=t.speed<.05&&(op?.phase==='open'||t.wait>0);
  if(!this.segment&&!stopped&&t.speed>.3)this.segment={from:line?.stations?.[nearest245(line,this.lastPos)]?.nombre||'—',km:0,time:0,tr:0,br:0,peak:0};
  if(this.segment){const g=this.segment;g.km+=km;g.time+=dt;g.tr+=st.tractionKW*dt/3600;g.br+=st.brakeKW*dt/3600;g.peak=Math.max(g.peak,st.I);if(stopped&&g.km>.05){g.to=line?.stations?.[nearest245(line,t.position)]?.nombre||'—';this.segments.unshift(g);this.segments.length=Math.min(this.segments.length,12);this.segment=null;this.renderRows();}}
  this.lastT=time;this.lastV=t.speed;this.lastPos=t.position;this.train=t;this.state=st;
  if(!this.root.hidden)this.draw();
 }
 draw(){const t=this.train,op=this.win.metroViewState?.()?.engine?.operator;this.root.querySelector('[data-ed245-mode]').textContent=op?'ANÁLISIS ELÉCTRICO · TREN EN CONDUCCIÓN':'ANÁLISIS ELÉCTRICO · SEGUIMIENTO DE LA RED · '+(t?'convoy '+t.id:'');this.root.querySelector('[data-ed245-title]').textContent=t?`${t.model||'Tren'} · Línea ${t.line} · control ${CONTROL245[t.model]||'según modelo'}`:'Toma los mandos de un tren para empezar';
  const T=this.totals,st=this.state,perKm=T.km>.05?(T.tractionKWh+T.auxKWh)/T.km:null;
  const tiles=[['Corriente ahora',st?fmt(st.I)+' A':'—'],['Tensión en el tren',st?fmt(st.V)+' V':'—'],['Potencia de tracción',st?fmt(st.tractionKW)+' kW'+(st.limited?' · al límite':''):'—'],['Energía de tracción',fmt(T.tractionKWh,2)+' kWh'],['Auxiliares',fmt(T.auxKWh,2)+' kWh'],['Disipada al frenar',fmt(T.brakeKWh,2)+' kWh'],['Consumo por km',perKm==null?'—':fmt(perKm,2)+' kWh/km'],['Corriente pico',fmt(T.peakA)+' A'],['Masa estimada',st?fmt(st.massT,1)+' t':'—']];
  this.tiles.innerHTML=tiles.map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join('');
  for(const c of this.charts)this.drawChart(c);}
 drawChart(c){const cv=c.canvas,ctx=cv.getContext?.('2d');const last=this.history[this.history.length-1];c.now.textContent=last?fmt(last[c.key])+' '+c.unit:'';if(!ctx)return;
  const W=cv.width,H=cv.height,L=46,R=8,Tp=10,B=20,css=getComputedStyle(this.root),ink=css.getPropertyValue('--ed245-muted').trim()||'#9aa39e',grid=css.getPropertyValue('--ed245-grid').trim()||'#ffffff1f',line=css.getPropertyValue('--ed245-series').trim()||'#3987e5';
  ctx.clearRect(0,0,W,H);const pts=this.history;let lo=Math.min(0,...pts.map(p=>p[c.key])),hi=Math.max({speed:90,I:1000,P:500}[c.key]||1,...pts.map(p=>p[c.key]));if(c.key==='V'){lo=Math.min(600,...pts.map(p=>p.V));hi=Math.max(760,...pts.map(p=>p.V));}
  const nice=niceStep245((hi-lo)/3);lo=Math.floor(lo/nice)*nice;hi=Math.ceil(hi/nice)*nice;const t1=last?.time||120,t0=t1-120,x=t=>L+(t-t0)/120*(W-L-R),y=v=>Tp+(hi-v)/(hi-lo||1)*(H-Tp-B);
  ctx.font='11px system-ui';ctx.fillStyle=ink;ctx.strokeStyle=grid;ctx.lineWidth=1;ctx.textAlign='right';ctx.textBaseline='middle';
  for(let v=lo;v<=hi+1e-9;v+=nice){ctx.beginPath();ctx.moveTo(L,Math.round(y(v))+.5);ctx.lineTo(W-R,Math.round(y(v))+.5);ctx.stroke();ctx.fillText(fmt(v),L-6,y(v));}
  ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText('−2 min',L,H-B+5);ctx.textAlign='right';ctx.fillText('ahora',W-R,H-B+5);
  const ref=c.key==='P'?this.params.maxKW:null;if(ref&&ref<=hi&&ref>=lo){ctx.save();ctx.setLineDash([4,4]);ctx.strokeStyle=ink;ctx.beginPath();ctx.moveTo(L,y(ref));ctx.lineTo(W-R,y(ref));ctx.stroke();ctx.restore();ctx.textAlign='left';ctx.textBaseline='bottom';ctx.fillText('potencia máxima supuesta',L+4,y(ref)-2);}
  if(lo<0&&hi>0){ctx.strokeStyle=ink;ctx.beginPath();ctx.moveTo(L,y(0));ctx.lineTo(W-R,y(0));ctx.stroke();}
  if(pts.length>1){ctx.strokeStyle=line;ctx.lineWidth=2;ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(x(p.time),y(p[c.key])):ctx.moveTo(x(p.time),y(p[c.key])));ctx.stroke();}
  if(c.hoverX!=null&&pts.length){const tt=t0+(c.hoverX-L)/(W-L-R)*120;const p=pts.reduce((b,q)=>Math.abs(q.time-tt)<Math.abs(b.time-tt)?q:b);ctx.strokeStyle=ink;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x(p.time),Tp);ctx.lineTo(x(p.time),H-B);ctx.stroke();ctx.fillStyle=line;ctx.beginPath();ctx.arc(x(p.time),y(p[c.key]),4,0,Math.PI*2);ctx.fill();
   c.tip.hidden=false;c.tip.textContent=`${fmt(p[c.key])} ${c.unit} · hace ${fmt(t1-p.time)} s · ${fmt(p.speed)} km/h`;c.tip.style.left=Math.min(70,Math.max(0,(x(p.time)/W*100-10)))+'%';}}
 hover(c,e){const r=c.canvas.getBoundingClientRect();c.hoverX=(e.clientX-r.left)/r.width*c.canvas.width;this.drawChart(c);}
 renderRows(){const body=this.root.querySelector('[data-ed245-rows]');body.innerHTML=this.segments.map(g=>`<tr><td>${g.from} → ${g.to}</td><td>${fmt(g.km*1000)} m</td><td>${fmt(g.time)} s</td><td>${fmt(g.tr,2)} kWh</td><td>${fmt(g.br,2)} kWh</td><td>${g.km>.05?fmt((g.tr)/g.km,2):'—'}</td><td>${fmt(g.peak)} A</td></tr>`).join('');}
 dispose(){this.win.clearInterval?.(this.timer);this.root.remove();this.button.remove();}
}
function nearest245(line,pos){const d=line?.distances||[];let k=0;for(let i=1;i<d.length;i++)if(Math.abs(d[i]-pos)<Math.abs(d[k]-pos))k=i;return k;}
function niceStep245(x){if(!(x>0))return 1;const e=Math.pow(10,Math.floor(Math.log10(x))),f=x/e;return (f<=1?1:f<=2?2:f<=5?5:10)*e;}
export function installElectricDashboard245(doc=document,win=window){if(doc.querySelector('.ed245'))return null;return new ElectricDashboard245(doc,win);}
