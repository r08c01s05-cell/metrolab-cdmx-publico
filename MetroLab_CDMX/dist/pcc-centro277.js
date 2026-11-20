import {Pcc263} from './pcc263.js?v=277';

export async function mountControl277(host,{signal,onBack}) {
 const doc=host.ownerDocument,win=doc.defaultView;
 const response=await win.fetch(new URL('./datos.json?v=144',import.meta.url),{signal});
 if(!response.ok)throw new Error(`Datos de las líneas no disponibles (${response.status})`);
 const data=await response.json();
 signal.throwIfAborted();
 const engine=new win.MetroEngine(data);
 const zones={out:new Set(),open:new Set()};
 const step=.2;
 // Al entrar ya circulan trenes en los dos tableros.
 for(let i=0;i<180;i++)engine.step(step);
 host.innerHTML=`<div class="pcc277-toolbar">
   <div><h3>Centro de control · Líneas 1 y 8</h3><p>Escenario de práctica del simulador</p></div>
   <div class="pcc277-actions">
    <button type="button" data-control-back>← Volver al recorrido del edificio</button>
    <button type="button" data-control-pause aria-pressed="false">Pausar simulación</button>
    <button type="button" data-control-emergency aria-pressed="false">Freno de emergencia · ambas líneas</button>
   </div>
  </div><div class="pcc277-lines"><section data-control-line="1" aria-label="Tablero de Línea 1"></section><section data-control-line="8" aria-label="Tablero de Línea 8"></section></div>`;
 const q=selector=>host.querySelector(selector);
 const panels=[1,8].map(line=>new Pcc263(doc,win,{host:q(`[data-control-line="${line}"]`),state:()=>({engine,currentLine:line}),zones}));
 let paused=false;
 for(const panel of panels)panel.toggle(true);
 const update=()=>panels.forEach(panel=>panel.tick());
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
  engine.step(step);
  update();
 },step*1000);
 return {
  focus(){q('[data-control-back]').focus();},
  dispose(){win.clearInterval(timer);panels.forEach(panel=>panel.dispose());host.replaceChildren();}
 };
}
