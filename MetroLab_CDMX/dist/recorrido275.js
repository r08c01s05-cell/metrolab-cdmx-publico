import * as Three from 'three';
import {RenderBudget101} from './render-budget101.js?v=222';
import {chapters,buildChapter,disposeChapter} from './recorrido-escenas275.js?v=275';

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
  <div class="tour275-stage"><canvas aria-label="Maqueta 3D del capítulo"></canvas><span class="tour275-status" role="status"></span>
   <div class="tour275-caption"><p data-location></p><h2></h2><p data-story></p></div>
  </div>
  <div class="tour275-timeline"><progress aria-label="Avance del capítulo" max="1" value="0"></progress></div>
  <footer class="tour275-controls"><div><button data-prev type="button" aria-label="Capítulo anterior">←</button><button data-play type="button">Pausar</button><button data-next type="button" aria-label="Capítulo siguiente">→</button><span data-clock></span></div><nav aria-label="Capítulos">${chapters.map((c,i)=>`<button type="button" data-chapter="${i}">${c.label}</button>`).join('')}</nav></footer>
 </div>`;
 document.body.append(dialog);
 const query=selector=>dialog.querySelector(selector);
 const canvas=query('canvas'),shell=query('.tour275-shell'),status=query('.tour275-status');
 const stage=query('.tour275-stage'),progress=query('progress'),play=query('[data-play]'),clock=query('[data-clock]');
 const fullscreen=query('[data-fullscreen]');
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const buttons=[...dialog.querySelectorAll('[data-chapter]')];
 const scene=new Three.Scene();
 const camera=new Three.PerspectiveCamera(39,1,.1,70);
 const hemi=new Three.HemisphereLight('#e6f0ff','#5f554d',2.1);
 const key=new Three.DirectionalLight('#fff1df',2.45);
 key.position.set(4,9,9);
 scene.add(hemi,key);
 let renderer,budget,asset,loading,frame,observer;
 let index=0,elapsed=0,lastTime=null,playing=true,ready=false,finished=false,closed=false,painted=-1;

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
  lastTime=null;
  play.textContent=playing?'Pausar':'Continuar';
 }
 function clearScene() {
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
  index=next;elapsed=0;lastTime=null;finished=false;ready=false;painted=-1;
  clearScene();
  play.textContent=playing?'Pausar':'Continuar';
  query('[data-prev]').disabled=next===0;
  query('[data-next]').disabled=next===chapters.length-1;
  buttons.forEach((b,i)=>b.setAttribute('aria-current',i===next?'step':'false'));
  shell.style.setProperty('--tour-accent',chapter.color);
  query('[data-location]').textContent=`${next+1} de ${chapters.length} · ${chapter.label}`;
  query('h2').textContent=chapter.title;
  query('[data-story]').textContent=chapter.text;
  stage.classList.remove('tour275-ready');
  progress.value=0;
  clock.textContent=`0:00 / ${formatTime(chapter.duration)}`;
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
  }
  const fraction=elapsed/chapter.duration;
  progress.value=fraction;
  const time=`${formatTime(elapsed)} / ${formatTime(chapter.duration)}`;
  if(clock.textContent!==time)clock.textContent=time;
  const animated=reducedMotion.matches?.55:fraction;
  if(!asset||painted===animated||!budget.allows(now))return;
  const ease=animated*animated*(3-2*animated);
  const [x,y,z,endX,endY,endZ]=chapter.shot;
  const distance=Math.max(1,1.12/camera.aspect);
  camera.position.set(10*Three.MathUtils.lerp(x,endX,ease),10*Three.MathUtils.lerp(y,endY,ease),10*Three.MathUtils.lerp(z,endZ,ease)).multiplyScalar(distance);
  camera.lookAt(0,0,0);
  asset.animate(animated);
  renderer.render(scene,camera);
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
