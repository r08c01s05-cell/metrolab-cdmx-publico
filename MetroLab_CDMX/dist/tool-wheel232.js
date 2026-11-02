// Portaherramientas 232: hold Tab to open a radial wheel with every tool of the bag; point with the
// mouse (or arrows / scroll) and release Tab to take it. A short tap of Tab still opens the bag.
// Tools not yet taken from the floor bag show as "en la bolsa"; choosing one opens the bag.
const ICONS232={hand:'✋',inspect:'🔍',meter:'📟',driver:'🪛',screwdriver:'🪛',brush:'🧹',test:'▶',spare:'🔩',wrench:'🔧',megohm:'⚡',dmm:'📟',probe:'📟',light:'🔦',lock:'🔒',rag:'🧽'};
export const HOLD_MS232=180;
export function wheelIndex232(dx,dy,count){
 if(!count||Math.hypot(dx,dy)<14)return -1;
 // Item 0 at the top, clockwise.
 const angle=(Math.atan2(dx,-dy)+Math.PI*2)%(Math.PI*2);return Math.round(angle/(Math.PI*2/count))%count;
}
export class ToolWheel232{
 constructor(bag){
  this.bag=bag;const doc=bag.doc;this.root=doc.createElement('div');this.root.className='wheel232';this.root.hidden=true;this.root.setAttribute('role','listbox');this.root.setAttribute('aria-label','Portaherramientas');
  this.ring=doc.createElement('div');this.ring.className='wheel232-ring';this.center=doc.createElement('div');this.center.className='wheel232-center';this.root.append(this.ring,this.center);
  this.index=-1;this.vec={x:0,y:0};this.items=[];
  this.onMove=e=>{if(this.root.hidden)return;if(doc.pointerLockElement){this.vec.x+=e.movementX||0;this.vec.y+=e.movementY||0;const l=Math.hypot(this.vec.x,this.vec.y);if(l>120){this.vec.x*=120/l;this.vec.y*=120/l;}}else{const r=this.root.getBoundingClientRect();this.vec.x=e.clientX-(r.left+r.width/2);this.vec.y=e.clientY-(r.top+r.height/2);}const i=wheelIndex232(this.vec.x,this.vec.y,this.items.length);if(i>=0)this.select(i);};
  this.onWheel=e=>{if(this.root.hidden)return;e.preventDefault();this.select((Math.max(0,this.index)+(e.deltaY>0?1:-1)+this.items.length)%this.items.length);};
  doc.addEventListener('mousemove',this.onMove,true);doc.addEventListener('wheel',this.onWheel,{capture:true,passive:false});
 }
 mount(){const host=this.bag.host.closest?.('dialog')||this.bag.doc.body;if(this.root.parentElement!==host)host.append(this.root);}
 open(){
  const bag=this.bag;this.mount();this.ring.replaceChildren();this.items=bag.buttons.map(b=>({button:b,id:bag.getId(b)})).filter(x=>x.id);
  const n=this.items.length;this.items.forEach((item,i)=>{const a=i/n*Math.PI*2,el=bag.doc.createElement('div'),ready=['hand','inspect','test','spare'].includes(item.id)||bag.prepared176.has(item.id);
   el.className='wheel232-item';el.dataset.ready=String(ready);el.style.setProperty('--x',(Math.sin(a)*150).toFixed(1)+'px');el.style.setProperty('--y',(-Math.cos(a)*150).toFixed(1)+'px');
   el.innerHTML=`<span>${ICONS232[item.id]||'🧰'}</span><b></b><small>${ready?'':'en la bolsa'}</small>`;el.querySelector('b').textContent=bag.title(item.id);item.el=el;item.ready=ready;this.ring.append(el);});
  this.vec={x:0,y:0};const current=this.items.findIndex(x=>x.id===bag.selected);this.select(current>=0?current:0);this.root.hidden=false;
 }
 select(i){this.index=i;this.items.forEach((x,j)=>x.el.dataset.active=String(j===i));const item=this.items[i];if(item)this.center.innerHTML=`<span>${ICONS232[item.id]||'🧰'}</span><b>${item.el.querySelector('b').textContent}</b><small>${item.ready?'Suelta Tab para tomarla':'Está en la bolsa del suelo'}</small>`;}
 step(d){if(this.items.length)this.select((Math.max(0,this.index)+d+this.items.length)%this.items.length);}
 close(choose=true){if(this.root.hidden)return null;this.root.hidden=true;const item=choose?this.items[this.index]:null;if(item)item.button.click();return item?.id||null;}
 get isOpen(){return !this.root.hidden;}
 dispose(){this.bag.doc.removeEventListener('mousemove',this.onMove,true);this.bag.doc.removeEventListener('wheel',this.onWheel,{capture:true});this.root.remove();}
}
