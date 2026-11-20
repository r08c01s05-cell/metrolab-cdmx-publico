import * as Three from 'three';
import {RenderBudget101} from './render-budget101.js?v=222';
import {chapters,buildChapter,disposeChapter} from './recorrido-escenas275.js?v=279';
import {tractionFrame278} from './recorrido-traccion278.js?v=279';

const totalSeconds = chapters.reduce((total,chapter)=>total+chapter.duration,0);
const formatTime = seconds => `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;

export function openTour275() {
 if(document.getElementById('tour275'))return;
 const opener=document.activeElement;
 const dialog=document.createElement('dialog');
 dialog.id='tour275';
 dialog.setAttribute('aria-label','Recorrido automático del Metro');
 dialog.innerHTML=`<div class="tour275-shell">
  <header class="tour275-header"><div><b>Recorrido automático</b><span>${chapters.length} capítulos · ${formatTime(totalSeconds)}</span></div><div><button data-fullscreen type="button" aria-label="Activar pantalla completa">Pantalla completa</button><button data-close type="button" autofocus>Salir</button></div></header>
  <div class="tour275-stage"><div class="tour276-model"><canvas aria-label="Maqueta 3D del capítulo"></canvas><span class="tour275-status" role="status"></span><span class="tour276-marker" aria-hidden="true" hidden><i></i><b></b></span></div>
   <div class="tour275-caption"><p data-location></p><h2></h2><p data-story></p><div class="tour276-facts" hidden></div><div class="tour276-cue" hidden aria-live="polite"><h3></h3><p></p></div>
    <div class="tour278-meters" hidden><label>Corriente de tracción relativa <meter data-current min="0" max="1" value="0"></meter></label><label>Calor acumulado relativo <meter data-heat min="0" max="1" value="0"></meter></label></div>
   </div>
   <div class="tour278-control" hidden></div>
  </div>
  <div class="tour275-timeline"><progress aria-label="Avance del capítulo" max="1" value="0"></progress></div>
  <footer class="tour275-controls"><div><button data-prev type="button" aria-label="Capítulo anterior">←</button><button data-play type="button">Pausar</button><button data-next type="button" aria-label="Capítulo siguiente">→</button><span data-clock></span></div><nav aria-label="Capítulos">${chapters.map((c,i)=>`<button type="button" data-chapter="${i}">${c.label}</button>`).join('')}</nav><nav data-pieces aria-label="Partes del capítulo" hidden></nav></footer>
 </div>`;
 document.body.append(dialog);
 const query=selector=>dialog.querySelector(selector);
 const canvas=query('canvas'),shell=query('.tour275-shell'),status=query('.tour275-status');
 const stage=query('.tour275-stage'),progress=query('progress'),play=query('[data-play]'),clock=query('[data-clock]');
 const marker=query('.tour276-marker'),cuePanel=query('.tour276-cue'),facts=query('.tour276-facts'),pieces=query('[data-pieces]');
 const canvasBox=query('.tour276-model'), controlBox=query('.tour278-control'),meters=query('.tour278-meters');
 const currentMeter=query('[data-current]'), heatMeter=query('[data-heat]');
 const point=new Three.Vector3();
 const aim=new Three.Vector3(),target=new Three.Vector3();
 const fullscreen=query('[data-fullscreen]');
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const buttons=[...dialog.querySelectorAll('[data-chapter]')];
 const scene=new Three.Scene();
 const camera=new Three.PerspectiveCamera(39,1,.1,70);
 const hemi=new Three.HemisphereLight('#e6f0ff','#5f554d',2.1);
 const key=new Three.DirectionalLight('#fff1df',2.45);
 key.position.set(4,9,9);
 scene.add(hemi,key);
 let renderer,budget,asset,control,loading,frame,observer;
 let index=0,cueIndex=-1,elapsed=0,lastTime=null,playing=true,ready=false,finished=false,closed=false,painted=-1;
 let zoom=1;

 function showCue(chapter) {
  const cues=chapter.cues;
  if(!cues)return null;
  const next=cues.findLastIndex(([at])=>at<=elapsed);
  if(next===cueIndex)return cues[next];
  cueIndex=next;
  painted=-1;
  const [,title,description]=cues[next];
  cuePanel.querySelector('h3').textContent=title;
  cuePanel.querySelector('p').textContent=description;
  marker.querySelector('b').textContent=title;
  [...pieces.children].forEach((button,i)=>button.setAttribute('aria-current',i===next?'step':'false'));
  return cues[next];
 }

 function showFacts(data,references=[]) {
  facts.hidden=!data&&!references.length;
  facts.replaceChildren();
  if(data)facts.innerHTML=`<p>${data.ends}</p><dl><div><dt>Estaciones</dt><dd>${data.stations}</dd></div><div><dt>Longitud total</dt><dd>${data.total}</dd></div><div><dt>Vía en servicio</dt><dd>${data.service}</dd></div></dl><a href="${data.source}" target="_blank" rel="noopener noreferrer">Ficha oficial del Metro</a>`;
  for(const [label,url] of references){
   const link=document.createElement('a');
   link.textContent=label;
   link.href=url;
   link.target='_blank';
   link.rel='noopener noreferrer';
   facts.append(link);
  }
 }

 function resize() {
  const {width,height}=canvas.getBoundingClientRect();
  if(!renderer||!width||!height)return;
  camera.aspect=width/height;
  camera.updateProjectionMatrix();
  renderer.setSize(width,height,false);
  painted=-1;
 }
 function toggle() {
  if(finished){playing=true;void select(0);return;}
  playing=!playing;
  control?.setPaused(!playing);
  lastTime=null;
  play.textContent=playing?'Pausar':'Continuar';
 }
 function clearScene() {
  control?.dispose();
  control=null;
  controlBox.replaceChildren();
  if(!asset)return;
  scene.remove(asset.root);
  disposeChapter(asset.root);
  asset=null;
  renderer?.clear();
 }
 async function select(next) {
  if(next<0||next>=chapters.length||closed)return;
  loading?.abort();
  const request=loading=new AbortController();
  const chapter=chapters[next];
  const isControl=chapter.source==='control';
  index=next;cueIndex=-1;elapsed=0;lastTime=null;finished=false;ready=false;painted=-1;
  aim.set(0,0,0);zoom=1;
  clearScene();
  play.textContent=playing?'Pausar':'Continuar';
  query('[data-prev]').disabled=next===0;
  query('[data-next]').disabled=next===chapters.length-1;
  buttons.forEach((b,i)=>b.setAttribute('aria-current',i===next?'step':'false'));
  shell.style.setProperty('--tour-accent',chapter.color);
  query('[data-location]').textContent=`${next+1} de ${chapters.length} · ${chapter.label}`;
  query('h2').textContent=chapter.title;
  query('[data-story]').textContent=chapter.text??'';
  showFacts(chapter.facts,chapter.references);
  meters.hidden=chapter.source!=='traction';
  currentMeter.value=heatMeter.value=0;
  canvasBox.hidden=isControl;
  controlBox.hidden=!isControl;
  stage.classList.toggle('tour278-stage-control',isControl);
  if(!isControl)resize();
  cuePanel.hidden=!chapter.cues;
  marker.hidden=true;
  pieces.hidden=!chapter.cues;
  pieces.replaceChildren(...(chapter.cues??[]).map(([at,title])=>{
   const button=document.createElement('button');
   button.type='button';button.textContent=title;
   button.onclick=()=>{elapsed=at;lastTime=null;finished=false;painted=-1;};
   return button;
  }));
  showCue(chapter);
  stage.classList.remove('tour275-ready');
  progress.value=0;
  clock.textContent=`0:00 / ${formatTime(chapter.duration)}`;
  if(isControl){
   const message=document.createElement('p'),host=document.createElement('div');
   message.setAttribute('role','status');
   message.textContent='Abriendo los tableros de circulación y energía…';
   controlBox.append(message,host);
   const timeout=setTimeout(()=>request.abort(),18000);
   try{
    const {mountControl277}=await import('./pcc-centro277.js?v=278');
    request.signal.throwIfAborted();
    const result=await mountControl277(host,{signal:request.signal,presentation:true});
    if(closed||loading!==request||request.signal.aborted){result.dispose();return;}
    control=result;
    control.setPaused(!playing);
    message.remove();
   }catch(error){
    if(!closed&&loading===request)message.textContent='No se pudieron cargar los tableros del centro de control.';
   }finally{
    clearTimeout(timeout);
    if(!closed&&loading===request){ready=true;lastTime=null;}
   }
   return;
  }
  if(!renderer) {
   status.textContent='Vista 3D no disponible en este navegador.';
   ready=true;
   return;
  }
  status.textContent='Cargando escena 3D…';
  const timeout=setTimeout(()=>request.abort(),18000);
  try {
   const result=await buildChapter(chapter,request.signal);
   if(closed||loading!==request||request.signal.aborted){disposeChapter(result.root);return;}
   asset=result;
   scene.add(asset.root);
   status.textContent='';
   stage.classList.add('tour275-ready');
  } catch(error) {
   if(!closed&&loading===request)status.textContent='No se pudo cargar esta maqueta. El recorrido continúa.';
  } finally {
   clearTimeout(timeout);
   if(!closed&&loading===request){ready=true;lastTime=null;}
  }
 }
 function tick(now) {
  if(closed)return;
  frame=requestAnimationFrame(tick);
  if(document.hidden){lastTime=null;return;}
  const chapter=chapters[index];
  if(playing&&ready&&lastTime!==null)elapsed=Math.min(chapter.duration,elapsed+(now-lastTime)/1000);
  lastTime=now;
  if(elapsed>=chapter.duration&&!finished) {
   if(index+1<chapters.length){void select(index+1);return;}
   finished=true;playing=false;play.textContent='Repetir recorrido';
   control?.setPaused(true);
  }
  const fraction=elapsed/chapter.duration;
  const cue=showCue(chapter);
  progress.value=fraction;
  const time=`${formatTime(elapsed)} / ${formatTime(chapter.duration)}`;
  if(clock.textContent!==time)clock.textContent=time;
  if(!asset||!budget.allows(now))return;
  const timed=chapter.source==='traction';
  const animated=reducedMotion.matches&&chapter.moving ? .55 : fraction;
  if(timed){
   const {current,heat}=tractionFrame278(elapsed);
   currentMeter.value=current;
   heatMeter.value=heat;
  }
  if(painted!==animated)asset.animate(animated,cue?.[3]);
  const anchor=cue?.[3]&&asset.anchor(cue[3],point);
  const supply=chapter.source==='supply';
  const floor=chapter.source==='pcc';
  const runningGear=chapter.source==='runningGear'||chapter.source==='steel';
  const classicMotor=chapter.motorPath&&cue?.[3]==='brushes';
  const closeup=anchor&&(chapter.cut==='substation'||supply||floor||runningGear||timed&&elapsed>=4);
  target.set(0,0,0);
  if(closeup)target.copy(anchor).multiplyScalar(floor||supply||timed?.98:.72);
  const targetZoom=closeup
   ? floor?.77:supply?(cue[3]==='cfe'?.80:cue[3]==='cable'?.45:.30):timed?.43:runningGear?.68:.55
   : classicMotor?.61:chapter.cut==='motor'?.81:1;
  const settling=aim.distanceToSquared(target)>.0004||Math.abs(zoom-targetZoom)>.004;
  if(painted===animated&&!settling)return;
  const transition=reducedMotion.matches||painted===-1?1:.16;
  aim.lerp(target,transition);
  zoom=Three.MathUtils.lerp(zoom,targetZoom,transition);
  const ease=reducedMotion.matches?.5:animated*animated*(3-2*animated);
  const [x,y,z,endX,endY,endZ]=chapter.shot;
  const distance=Math.max(1,1.12/camera.aspect);
  const cameraSide=classicMotor?-1:1;
  camera.position.set(10*Three.MathUtils.lerp(x,endX,ease),10*Three.MathUtils.lerp(y,endY,ease),cameraSide*10*Three.MathUtils.lerp(z,endZ,ease)).multiplyScalar(distance*zoom).add(aim);
  camera.lookAt(aim);
  renderer.render(scene,camera);
  if(anchor)point.project(camera);
  marker.hidden=!anchor||Math.abs(point.x)>.97||Math.abs(point.y)>.94||Math.abs(point.z)>1;
  if(!marker.hidden){
   marker.style.left=`${50+point.x*50}%`;
   marker.style.top=`${50-point.y*50}%`;
   marker.classList.toggle('tour276-marker-left',point.x>0);
  }
  painted=animated;
 }

 function updateFullscreen() {
  const active=document.fullscreenElement===shell||dialog.classList.contains('tour275-expanded');
  fullscreen.textContent=active?'Salir de pantalla completa':'Pantalla completa';
  fullscreen.setAttribute('aria-label',active?'Salir de pantalla completa':'Activar pantalla completa');
 }
 fullscreen.onclick=async()=>{
  if(dialog.classList.contains('tour275-expanded')) {
   dialog.classList.remove('tour275-expanded');
   updateFullscreen();
   return;
  }
  try {
   if(document.fullscreenElement===shell)await document.exitFullscreen();
   else await shell.requestFullscreen();
  } catch {
   dialog.classList.add('tour275-expanded');
   updateFullscreen();
  }
 };
 shell.addEventListener('fullscreenchange',updateFullscreen);
 dialog.addEventListener('cancel',event=>{
  if(!dialog.classList.contains('tour275-expanded'))return;
  event.preventDefault();
  dialog.classList.remove('tour275-expanded');
  updateFullscreen();
 });
 query('[data-close]').onclick=()=>dialog.close();
 query('[data-prev]').onclick=()=>select(index-1);
 query('[data-next]').onclick=()=>select(index+1);
 play.onclick=toggle;
 buttons.forEach((b,i)=>{b.onclick=()=>select(i);});
 dialog.addEventListener('keydown',event=>{
  if(['ArrowLeft','ArrowRight'].includes(event.key)) {
   event.preventDefault();void select(index+(event.key==='ArrowRight'?1:-1));
  } else if(event.code==='Space'&&event.target.tagName!=='BUTTON') {
   event.preventDefault();toggle();
  }
 });
 dialog.addEventListener('close',()=>{
  closed=true;
  loading?.abort();
  cancelAnimationFrame(frame);
  observer?.disconnect();
  clearScene();
  renderer?.dispose();
  renderer?.forceContextLoss();
  dialog.remove();
  opener?.focus();
 },{once:true});
 dialog.showModal();
 try {
  renderer=new Three.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setClearColor(0x000000,0);
  budget=new RenderBudget101(renderer,{maxDpr:1.6});
  observer=new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
 } catch(error) { console.warn('Recorrido 3D:',error); }
 void select(0);
 frame=requestAnimationFrame(tick);
}
