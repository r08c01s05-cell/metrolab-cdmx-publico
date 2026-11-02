// Laboratorio jugable 229: the 3D view fills the window and the controls live over it as a game
// HUD. A "Reto" mode pauses before each phase and asks the player to predict what happens next;
// answers score points and stars, and the best result per scenario is remembered in this browser.
import {FAULT_CASES217} from './fault-catalog217.js?v=217';

const CHECKPOINTS229=[[.2,1],[.5,2],[.75,3]];
const VARIANT_STEPS229={
 'sr-cooling:unprotected':{3:'La protección no actúa: el calentamiento continúa y el aislamiento puede dañarse.'},
 'train-brake:slide':{3:'Con baja adherencia las ruedas se bloquean y el vagón se desliza.'}
};
const STORE229='metrolab-retos229';
function hash229(text){let h=2166136261;for(const c of String(text)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
export function stepFor229(caseId,variant,phase){const c=FAULT_CASES217.find(x=>x.id===caseId);return VARIANT_STEPS229[caseId+':'+variant]?.[phase]??c.steps[phase];}
// Three options: the true next step and two steps of the same phase from other scenarios of the
// same domain. Order is shuffled deterministically per scenario and phase.
export function question229(caseId,variant,phase){
 const c=FAULT_CASES217.find(x=>x.id===caseId),answer=stepFor229(caseId,variant,phase);
 const others=FAULT_CASES217.filter(x=>x.domain===c.domain&&x.id!==caseId).map(x=>x.steps[phase]).filter(t=>t!==answer);
 const h=hash229(caseId+variant+phase),pick=[others[h%others.length],others[(h>>>4)%others.length]].filter((t,i,a)=>a.indexOf(t)===i);
 while(pick.length<2&&others.length>pick.length)pick.push(others.find(t=>!pick.includes(t)));
 const options=[answer,...pick.slice(0,2)];for(let i=options.length-1;i>0;i--){const j=(h>>>(i*3))%(i+1);[options[i],options[j]]=[options[j],options[i]];}
 return {prompt:['','¿Qué falla primero?','¿Qué se detecta después?','¿Cuál es la respuesta del sistema?'][phase],options,answer:options.indexOf(answer)};
}
export function stars229(correct,total){return total?Math.round(3*correct/total):0;}
function loadBest(){try{return JSON.parse(globalThis.localStorage?.getItem(STORE229)||'{}');}catch{return {};}}
function saveBest(best){try{globalThis.localStorage?.setItem(STORE229,JSON.stringify(best));}catch{}}

export class FaultHud229{
 constructor(lab){
  this.lab=lab;const d=lab.dialog,$=s=>d.querySelector(s),el=(tag,cls,html='')=>{const e=lab.doc.createElement(tag);if(cls)e.className=cls;e.innerHTML=html;return e;};
  d.classList.add('h229');this.reto=true;this.muted=false;this.best=loadBest();this.reset();
  const stage=$('.f217-stage'),header=$('header'),pickers=$('.f217-pickers'),aside=$('.f217-layout aside');
  header.querySelector('div').after(pickers);
  // Header tools: reto toggle, sound, technical sheet, analysis drawer.
  const tools=el('div','h229-tools',`<button type="button" data-h229-reto aria-pressed="true" title="Predice cada fase antes de verla">🎯 Reto</button><button type="button" data-h229-sound aria-pressed="true" title="Sonido de alarma">🔊</button><button type="button" data-h229-data aria-expanded="false">📈 Datos</button><button type="button" data-h229-info aria-expanded="false">ⓘ Ficha</button>`);
  header.querySelector('[data-f217-close]').before(tools);
  // HUD over the 3D view.
  const top=el('div','h229-top'),phases=$('.f217-phases'),step=$('[data-f217-step]');top.append(phases,step);
  const gauges=el('div','h229-gauges');gauges.append($('.f217-signals'));
  const score=el('div','h229-score','<b data-h229-points>0</b><span>puntos</span><i data-h229-stars>☆☆☆</i><small data-h229-best></small>');
  const bar=el('div','h229-bar'),play=$('.f217-play');bar.append(play);
  const quiz=el('div','h229-quiz','<small>RETO · PREDICE</small><h3 data-h229-prompt></h3><div data-h229-options></div><p data-h229-feedback role="status"></p><button type="button" data-h229-continue hidden>Continuar ▶</button>');quiz.hidden=true;
  const end=el('div','h229-end','<small>ESCENARIO COMPLETO</small><h3 data-h229-end-title></h3><p data-h229-end-text></p><div><button type="button" data-h229-again>↺ Repetir</button><button type="button" data-h229-next>Siguiente escenario ▶</button></div>');end.hidden=true;
  const alarm=el('div','h229-alarm','<b>⚠ ALARMA</b>');
  stage.append(top,gauges,score,bar,quiz,end,alarm);
  // Analysis drawer (schematic, chain, chart) and technical sheet drawer.
  const data=el('section','h229-drawer h229-data');data.append($('.f218-consequence'),$('.f217-chain'),$('.f217-chart'),$('.f217-visual > small')||el('small'));
  const info=el('section','h229-drawer h229-info');info.append(...aside.childNodes);aside.remove();
  stage.append(data,info);
  // Icons for the transport buttons.
  const icon=(sel,text,title)=>{const b=$(sel);b.dataset.h229Label=title;b.title=title;b.setAttribute('aria-label',title);if(text)b.textContent=text;};
  icon('[data-f217-reset]','↺','Reiniciar secuencia');icon('[data-f217-focus]','⌖','Ver conjunto (F)');icon('[data-f217-home]','⤢','Vista completa (V)');
  Object.assign(this,{$:$,stage,quiz,end,alarm,data,info,score});
  const toggle=(btn,panel)=>{const b=$(btn);b.onclick=()=>{const open=panel.dataset.open!=='true';for(const p of [data,info])p.dataset.open='false';for(const x of ['[data-h229-data]','[data-h229-info]'])$(x).setAttribute('aria-expanded','false');panel.dataset.open=String(open);b.setAttribute('aria-expanded',String(open));};};
  toggle('[data-h229-data]',data);toggle('[data-h229-info]',info);
  $('[data-h229-reto]').onclick=e=>{this.reto=!this.reto;e.currentTarget.setAttribute('aria-pressed',String(this.reto));score.hidden=!this.reto;};
  $('[data-h229-sound]').onclick=e=>{this.muted=!this.muted;e.currentTarget.setAttribute('aria-pressed',String(!this.muted));e.currentTarget.textContent=this.muted?'🔇':'🔊';};
  $('[data-h229-continue]').onclick=()=>this.resume();
  $('[data-h229-again]').onclick=()=>{this.reset();end.hidden=true;lab.clock.seek(0);lab.clock.play();lab.paint();};
  $('[data-h229-next]').onclick=()=>{const sel=$('[data-f217-case]'),i=sel.selectedIndex;sel.selectedIndex=(i+1)%sel.options.length;end.hidden=true;this.reset();lab.change();};
  for(const sel of ['[data-f217-reset]','[data-f217-seek]'])$(sel).addEventListener('input',()=>this.rewind());$('[data-f217-reset]').addEventListener('click',()=>this.reset());
  for(const sel of ['[data-f217-case]','[data-f217-domain]','[data-f218-variant]','[data-f217-model]'])$(sel).addEventListener('change',()=>this.reset());
  d.addEventListener('keydown',e=>this.key(e));
 }
 reset(){this.asked=new Set();this.correct=0;this.total=0;this.points=0;this.streak=0;this.finished=false;this.lastAlarm=false;this.prevProgress=undefined;if(this.quiz){this.quiz.hidden=true;this.end.hidden=true;}this.updateScore();}
 // Seeking back re-opens the checkpoints behind the cursor, without resetting the score.
 rewind(){const p=this.lab.clock.progress;for(const [at] of CHECKPOINTS229)if(p<at-.001)this.asked.delete(at);if(p<.999)this.finished=false;this.end.hidden=true;}
 key(e){
  if(['INPUT','SELECT','TEXTAREA'].includes(e.target?.tagName)&&e.key!=='Escape')return;const lab=this.lab;
  if(!this.quiz.hidden){const n=Number(e.key);if(n>=1&&n<=3){e.preventDefault();this.answer(n-1);}else if(e.key==='Enter'&&!this.$('[data-h229-continue]').hidden){e.preventDefault();this.resume();}return;}
  const k=e.key.toLowerCase();
  if(k===' '){e.preventDefault();this.$('[data-f217-play]').click();}
  else if(k==='r'){this.$('[data-f217-reset]').click();}
  else if(k==='f'){this.$('[data-f217-focus]').click();}
  else if(k==='v'){this.$('[data-f217-home]').click();}
  else if(k==='arrowright'||k==='arrowleft'){e.preventDefault();lab.clock.pause();lab.clock.seek(Math.max(0,Math.min(1,lab.clock.progress+(k==='arrowright'?.02:-.02))));this.rewind();lab.paint();}
 }
 update(s){
  const lab=this.lab,id=lab.scenario?.id;if(!id)return;
  // Corrección 233: a new scenario or condition always starts a fresh challenge, whatever changed it
  // ("Siguiente escenario" sets the list without a change event, so the old checkpoints stayed used).
  const key=id+':'+lab.variant;if(key!==this.key233){this.key233=key;this.reset();}
  this.stage.dataset.phase=String(s.phase);
  // Gauges: ring around each value.
  for(const [i,node] of (lab.metricNodes||[]).entries()){const v=Number(node.bar.value)||0;if(!node.ring){const ns='http://www.w3.org/2000/svg',svg=lab.doc.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 44 44');svg.classList.add('h229-ring');svg.innerHTML='<circle cx="22" cy="22" r="18" pathLength="100"/><circle cx="22" cy="22" r="18" pathLength="100" data-v/>';node.bar.before(svg);node.ring=svg.querySelector('[data-v]');}node.ring.style.strokeDasharray=(v*100).toFixed(1)+' 100';}
  // Alarm flash and tone once when the detection phase starts during playback.
  if(s.alarm&&!this.lastAlarm&&lab.clock.playing){this.alarm.dataset.on='true';setTimeout(()=>{this.alarm.dataset.on='false';},1600);this.beep();}
  this.lastAlarm=s.alarm;
  if(!this.reto||!lab.clock.playing){this.prevProgress=s.progress;return this.checkEnd(s);}
  // A checkpoint fires when playback crosses it, however large the step between two frames.
  const prev=this.prevProgress??s.progress;this.prevProgress=s.progress;
  for(const [at,phase] of CHECKPOINTS229)if(!this.asked.has(at)&&prev<at&&s.progress>=at-.004){this.asked.add(at);this.prevProgress=at-.004;lab.clock.pause();lab.clock.seek(Math.max(0,at-.004));this.ask(phase);lab.paint();return;}
  this.checkEnd(s);
 }
 ask(phase){
  const lab=this.lab,q=question229(lab.scenario.id,lab.variant,phase);this.current=q;
  this.$('[data-h229-prompt]').textContent=q.prompt;const host=this.$('[data-h229-options]');host.replaceChildren();
  q.options.forEach((text,i)=>{const b=lab.doc.createElement('button');b.type='button';b.innerHTML='<kbd>'+(i+1)+'</kbd> ';b.append(text);b.onclick=()=>this.answer(i);host.append(b);});
  this.$('[data-h229-feedback]').textContent='';this.$('[data-h229-continue]').hidden=true;this.quiz.hidden=false;this.quiz.dataset.result='';host.querySelector('button')?.focus();
 }
 answer(i){
  const q=this.current;if(!q||this.$('[data-h229-continue]').hidden===false)return;const ok=i===q.answer;this.total++;
  if(ok){this.correct++;this.streak++;this.points+=100+50*(this.streak-1);}else this.streak=0;
  [...this.$('[data-h229-options]').children].forEach((b,j)=>{b.disabled=true;b.dataset.state=j===q.answer?'right':j===i?'wrong':'';});
  this.quiz.dataset.result=ok?'right':'wrong';this.$('[data-h229-feedback]').textContent=ok?(this.streak>1?`¡Correcto! Racha ×${this.streak} · +${100+50*(this.streak-1)}`:'¡Correcto! +100'):'Casi. Observa cómo ocurre en realidad.';
  this.$('[data-h229-continue]').hidden=false;this.$('[data-h229-continue]').focus();this.updateScore();
 }
 resume(){this.quiz.hidden=true;this.current=null;this.lab.clock.play();this.lab.paint();}
 checkEnd(s){
  if(this.finished||s.progress<.999||!this.reto||!this.total)return;this.finished=true;
  const lab=this.lab,key=lab.scenario.id+':'+lab.variant,stars=stars229(this.correct,this.total),prev=this.best[key]||0;
  if(this.points>prev){this.best[key]=this.points;saveBest(this.best);}
  this.$('[data-h229-end-title]').textContent='★'.repeat(stars)+'☆'.repeat(3-stars)+'  '+this.points+' puntos';
  this.$('[data-h229-end-text]').textContent=`${this.correct} de ${this.total} predicciones correctas.`+(this.points>prev&&prev?' ¡Nuevo récord!':'');
  this.end.hidden=false;this.updateScore();
 }
 updateScore(){if(!this.score)return;const lab=this.lab,key=lab.scenario?.id+':'+lab.variant,stars=stars229(this.correct,this.total);
  this.score.querySelector('[data-h229-points]').textContent=this.points;this.score.querySelector('[data-h229-stars]').textContent='★'.repeat(stars)+'☆'.repeat(3-stars);
  const best=this.best[key];this.score.querySelector('[data-h229-best]').textContent=best?'Récord '+best:'';}
 beep(){if(this.muted)return;try{const C=globalThis.AudioContext||globalThis.webkitAudioContext;if(!C)return;this.audio??=new C();const a=this.audio,t=a.currentTime;for(const [o,f] of [[0,880],[.22,880]]){const osc=a.createOscillator(),g=a.createGain();osc.type='square';osc.frequency.value=f;g.gain.setValueAtTime(0,t+o);g.gain.linearRampToValueAtTime(.05,t+o+.01);g.gain.linearRampToValueAtTime(0,t+o+.16);osc.connect(g).connect(a.destination);osc.start(t+o);osc.stop(t+o+.18);}}catch{}}
 dispose(){try{this.audio?.close();}catch{}this.audio=null;}
}
