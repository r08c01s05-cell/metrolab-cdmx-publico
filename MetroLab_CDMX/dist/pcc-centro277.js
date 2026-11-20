import {Pcc263} from './pcc263.js?v=279';
import {Regulator279} from './regulacion279.js?v=279';
import {mountConsole279} from './consola279.js?v=279';

export async function mountControl277(host,{signal,onBack,presentation=false}) {
 const doc=host.ownerDocument,win=doc.defaultView;
 const response=await win.fetch(new URL('./datos.json?v=144',import.meta.url),{signal});
 if(!response.ok)throw new Error(`Datos de las líneas no disponibles (${response.status})`);
 const data=await response.json();
 signal.throwIfAborted();
 const engine=new win.MetroEngine(data);
 const zones={out:new Set(),open:new Set()};
 const step=.2;
 // Regulación 279: reglas de ATP, señales, restricciones y regulación sobre este motor de práctica.
 let regulator=new Regulator279(engine);
 const advance=()=>{engine.step(step);regulator.step(step);};
 // Al entrar ya circulan trenes en los dos tableros.
 for(let i=0;i<180;i++)advance();
 host.innerHTML=`<div class="pcc277-toolbar">
   <div><h3>Centro de control · Líneas 1 y 8</h3><p>Escenario de práctica del simulador</p></div>
   <div class="pcc277-actions" ${presentation?'hidden':''}>
    <button type="button" data-control-back>← Volver al recorrido del edificio</button>
    <button type="button" data-control-pause aria-pressed="false">Pausar simulación</button>
    <button type="button" data-control-emergency aria-pressed="false">Freno de emergencia · ambas líneas</button>
   </div>
  </div><div class="pcc277-lines"><section data-control-line="1" aria-label="Tablero de Línea 1"></section><section data-control-line="8" aria-label="Tablero de Línea 8"></section></div>`;
 const q=selector=>host.querySelector(selector);
 const panels=[1,8].map(line=>new Pcc263(doc,win,{host:q(`[data-control-line="${line}"]`),state:()=>({engine,currentLine:line}),zones,presentation}));
 let paused=false,speed=1;
 for(const panel of panels)panel.toggle(true);
 // En el modo presentación del recorrido solo se ven los tableros, sin la consola.
 const consoleHost=doc.createElement('div');consoleHost.className='reg279-host';if(!presentation)host.append(consoleHost);
 let console279;
 const update=()=>{panels.forEach(panel=>panel.tick());console279?.update();};
 // Cambiar el número de trenes reinicia el escenario; la consola se vuelve a montar con el nuevo regulador.
 const console279Opts=()=>({engine,regulator,panels,speed,
  onSpeed(v){speed=Math.max(1,Math.min(10,v||1));},
  onFleet(n){engine.fleet=n;engine.reset();regulator.detach();regulator=new Regulator279(engine);console279.dispose();
   for(const panel of panels){panel.memo.clear();panel.energy279=null;panel.holds.releaseAll();}
   for(let i=0;i<120;i++)advance();
   console279=mountConsole279(consoleHost,console279Opts());update();}});
 if(!presentation)console279=mountConsole279(consoleHost,console279Opts());
 q('[data-control-back]').onclick=onBack;
 q('[data-control-pause]').onclick=event=>{
  paused=!paused;
  event.currentTarget.textContent=paused?'Reanudar simulación':'Pausar simulación';
  event.currentTarget.setAttribute('aria-pressed',String(paused));
 };
 q('[data-control-emergency]').onclick=event=>{
  engine.emergency=!engine.emergency;
  event.currentTarget.textContent=engine.emergency?'Liberar freno de emergencia':'Freno de emergencia · ambas líneas';
  event.currentTarget.setAttribute('aria-pressed',String(engine.emergency));
  update();
 };
 const timer=win.setInterval(()=>{
  if(paused||doc.hidden)return;
  for(let i=0;i<speed;i++)advance();
  update();
 },step*1000);
 return {
  setPaused(value){paused=value;},
  focus(){q('[data-control-back]').focus();},
  dispose(){win.clearInterval(timer);regulator.detach();console279?.dispose();panels.forEach(panel=>panel.dispose());host.replaceChildren();},
  get regulator(){return regulator;},get engine(){return engine;},get console(){return console279;},setSpeed(v){speed=v;}
 };
}
