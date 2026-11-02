// One 4 Hz UI timer per maintenance surface; no renderer or physics changes.
export class IdleClock201{
 constructor(delay=5000){this.delay=delay;this.key=null;this.since=null;}
 reset(){this.since=null;}
 check(now,key,active){if(!active){this.key=null;this.since=null;return false;}if(this.key!==key||this.since===null){this.key=key;this.since=now;}return now-this.since>=this.delay;}
}
export function installIdleGuide201({host,doc=host.ownerDocument,win=doc.defaultView,get,focus,bag,plan}){
 if(!doc?.createElement||!win?.setInterval||!host?.append)return null;
 const clock=new IdleClock201(),root=doc.createElement('aside');root.className='idle201-guide';root.hidden=true;root.setAttribute('aria-label','Ayuda del trabajo actual');
 const title=doc.createElement('strong');title.textContent='¿Qué sigue?';const text=doc.createElement('p');text.setAttribute('role','status');text.setAttribute('aria-live','polite');const controls=doc.createElement('div');
 for(const[label,action]of [['Enfocar · F',focus],['Bolsa · Tab',bag],['Plan · J',plan]])if(action){const b=doc.createElement('button');b.type='button';b.textContent=label;b.onclick=()=>{clock.reset();root.hidden=true;action();};controls.append(b);}
 root.append(title,text,controls);host.append(root);
 const tick=()=>{const state=get(),active=!!state?.active&&!doc.hidden;const show=clock.check(win.performance?.now?.()??Date.now(),state?.key,active);if(show&&text.textContent!==state.text)text.textContent=state.text;root.hidden=!show;};
 const activity=e=>{if(root.contains(e.target))return;clock.reset();root.hidden=true;};
 host.addEventListener('pointerdown',activity,true);doc.addEventListener('keydown',activity,true);
 const timer=win.setInterval(tick,250);timer?.unref?.();
 return{root,clock,tick,dispose(){win.clearInterval(timer);host.removeEventListener('pointerdown',activity,true);doc.removeEventListener('keydown',activity,true);root.remove();}};
}
