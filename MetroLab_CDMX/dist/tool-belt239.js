import * as T from 'three';

// Portaherramientas 239: el cinturón del simulador de la planta de emergencia, adaptado. Va puesto
// en la cadera: un cinturón de nylon oscuro con franjas amarillas y hebilla, y una bolsa por
// herramienta con la herramienta asomando. Al abrirlo sube a la vista, la herramienta marcada se
// levanta de su bolsa con su nombre encima; flechas, rueda del ratón o mover el ratón cambian;
// soltar Tab, otro Tab o un clic la sacan a la mano. Esc cancela.
// Same interface as the radial wheel it replaces (open, close, select, step, isOpen, items).
export const HOLD_MS239=180;
const NAMES239={hand:'Manos libres',inspect:'Inspección visual',test:'Prueba funcional',spare:'Repuesto',screwdriver:'Destornillador',driver:'Destornillador',wrench:'Llave',brush:'Cepillo',meter:'Instrumento',red:'Punta roja',black:'Punta negra',lock:'Candado y etiqueta',rag:'Paño',flashlight:'Linterna',detector:'Detector de tensión',thermal:'Cámara térmica',laser:'Medidor láser',light:'Linterna',megohm:'Megóhmetro',dmm:'Multímetro'};

// Small 3D tools for the pouches (and for anyone who needs a quick prop). Drawn over the scene.
export function toolProp239(id,owned=[]){
 const g=new T.Group(),m=(c,r=.55,me=.1)=>{const x=new T.MeshStandardMaterial({color:c,roughness:r,metalness:me,depthTest:false});owned.push(x);return x;};
 const add=(geo,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{owned.push(geo);const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.renderOrder=1001;o.frustumCulled=false;g.add(o);return o;};
 const cz=(r1,r2,len,seg=14)=>{const q=new T.CylinderGeometry(r1,r2,len,seg);q.rotateX(Math.PI/2);return q;};
 const steel=m('#c3cbd0',.22,.9),dark=m('#1f2225',.6,.2),red=m('#b3261e',.6,.1),yel=m('#ffc400',.55,.05),wood=m('#9a6a35',.75,0);
 if(id==='screwdriver'||id==='driver'){add(cz(.016,.014,.1,12),red,0,0,-.02);add(cz(.017,.017,.02,12),yel,0,0,.03);add(cz(.0035,.0035,.13,8),steel,0,0,-.135);add(new T.BoxGeometry(.008,.002,.012),steel,0,0,-.205);}
 else if(id==='wrench'){add(new T.BoxGeometry(.024,.008,.19),steel,0,0,-.1);add(new T.TorusGeometry(.024,.0075,8,18),steel,0,0,-.225);add(new T.TorusGeometry(.019,.0065,8,14,Math.PI*1.6),steel,0,0,0,0,0,Math.PI*1.2);add(new T.BoxGeometry(.045,.009,.006),dark,0,0,-.045);}
 else if(id==='brush'){add(cz(.014,.017,.14,12),wood,0,0,-.03);add(cz(.0175,.0175,.03,12),steel,0,0,-.115);add(new T.BoxGeometry(.055,.02,.09),wood,0,-.005,-.17);const bm=m('#e2cf8a',.9,0);for(let i=0;i<5;i++)for(let j=0;j<6;j++)add(cz(.0035,.0035,.03,5),bm,-.02+i*.01,-.022,-.135-j*.011);}
 else if(['flashlight','inspect','light'].includes(id)){add(cz(.019,.019,.15,16),dark,0,0,-.04);for(let i=0;i<4;i++)add(new T.TorusGeometry(.0195,.0014,5,16),m('#3a3d40',.7),0,0,.01-i*.025);add(cz(.02,.034,.055,18),yel,0,0,-.14);add(cz(.036,.036,.01,18),dark,0,0,-.172);add(new T.CircleGeometry(.029,18),m('#fff6c8',.1,0),0,0,-.178,0,Math.PI,0);}
 else if(['meter','dmm','megohm','thermal','laser'].includes(id)){const body=id==='megohm'?m('#e2621b',.55,0):id==='thermal'?m('#2b3035',.6,.1):yel;add(new T.BoxGeometry(.078,.034,.14),body,0,-.01,-.06);add(new T.BoxGeometry(.084,.026,.03),m('#2b2b2b',.9,0),0,-.012,-.12);add(new T.BoxGeometry(.084,.026,.03),m('#2b2b2b',.9,0),0,-.012,0);add(new T.BoxGeometry(.056,.003,.04),m(id==='thermal'?'#3050ff':'#8fbf8a',.2,0),0,.009,-.095);add(cz(.017,.017,.008,18),dark,0,.01,-.05);}
 else if(id==='red'||id==='black'){add(cz(.007,.009,.11,10),id==='red'?red:dark,0,0,-.04);add(cz(.002,.002,.05,6),steel,0,0,-.12);add(cz(.01,.01,.01,10),id==='red'?red:dark,0,0,.02);}
 else if(id==='detector'){add(cz(.012,.014,.15,12),yel,0,0,-.04);add(cz(.006,.012,.03,12),m('#e8e8e2'),0,0,-.13);add(new T.SphereGeometry(.007,10,8),m('#ff2a1a',.3,0),0,.013,-.08);}
 else if(id==='lock'){add(new T.BoxGeometry(.054,.05,.026),red,0,-.012,-.06);add(new T.TorusGeometry(.018,.0045,8,16,Math.PI),steel,0,.013,-.06);add(new T.BoxGeometry(.04,.055,.002),m('#f3eee0',.9,0),0,-.07,-.06,0,0,.1);}
 else if(id==='rag'){const cols=['#d94a2b','#cf4326','#e0562f'];for(let i=0;i<4;i++)add(new T.BoxGeometry(.105-i*.006,.007,.115-i*.005),m(cols[i%3],.97,0),0,-.005+i*.006,-.07,0,i*.12-.2,i*.03-.04);}
 else if(id==='spare'){add(cz(.022,.022,.09,6),steel,0,0,-.05);add(cz(.034,.034,.018,6),steel,0,0,.004);for(let i=0;i<5;i++)add(new T.TorusGeometry(.0225,.0018,4,12),m('#8e979c',.4,.8),0,0,-.02-i*.015);}
 else if(id==='test'){add(new T.BoxGeometry(.088,.016,.12),m('#1b3d6b',.8,0),0,-.02,-.06);add(new T.BoxGeometry(.081,.011,.113),m('#f6f1dc',.95,0),.002,-.017,-.06);add(new T.BoxGeometry(.03,.002,.03),m('#3ccf7e',.4,0),0,-.011,-.07);}
 else add(new T.BoxGeometry(.06,.04,.1),dark,0,0,-.05);
 return g;
}

export class ToolBelt239{
 // owner: the tool bag (or the walk tools). It provides doc, buttons, getId, title, and a view or
 // getContext().view with camera and canvas.
 constructor(owner){this.owner=owner;this.items=[];this.index=-1;this.open239=0;this.want=0;this.owned=[];this.doc=owner.doc||globalThis.document;
  this.tag=this.doc.createElement('output');this.tag.className='belt239-tag';this.tag.hidden=true;
  this.onMove=e=>{if(!this.isOpen)return;const lock=this.doc.pointerLockElement;if(lock){this.dx=(this.dx||0)+(e.movementX||0);if(Math.abs(this.dx)>70){this.step(Math.sign(this.dx));this.dx=0;}}else{const c=this.view?.canvas?.getBoundingClientRect?.();if(c&&c.width&&this.items.length){const u=T.MathUtils.clamp((e.clientX-c.left)/c.width,0,.999);this.select(Math.floor(u*this.items.length));}}};
  this.onWheel=e=>{if(!this.isOpen)return;e.preventDefault?.();e.stopImmediatePropagation?.();this.step(e.deltaY>0?1:-1);};
  this.onDown=e=>{if(!this.isOpen||e.button!==0&&e.button!==undefined)return;if(e.target?.closest?.('button,a,input,select,textarea,dialog header'))return;e.preventDefault?.();e.stopImmediatePropagation?.();this.close(true);owner.sticky238=false;};
  this.doc.addEventListener?.('mousemove',this.onMove,true);this.doc.addEventListener?.('wheel',this.onWheel,{capture:true,passive:false});this.doc.addEventListener?.('pointerdown',this.onDown,true);
 }
 get isOpen(){return this.want===1;}
 get view(){return this.owner.view||this.owner.getContext?.()?.view||null;}
 // Built once per camera; pouches are rebuilt when the set of tools changes.
 build(){
  const v=this.view;if(!v?.camera)return false;const ids=this.owner.buttons.map(b=>this.owner.getId(b)).filter(id=>id&&id!=='hand');const key=ids.join(',');
  if(this.root&&this.root.parent===v.camera&&key===this.key)return true;this.dispose3d();this.key=key;
  const mat=(c,r=.85,me=0)=>{const x=new T.MeshStandardMaterial({color:c,roughness:r,metalness:me,depthTest:false});this.owned.push(x);return x;};
  const root=new T.Group();root.name='Portaherramientas en la cadera239';root.visible=false;v.camera.add(root);this.root=root;
  const put=(geo,m,x,y,z,ord,p=root)=>{this.owned.push(geo);const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.renderOrder=ord;o.frustumCulled=false;p.add(o);return o;};
  const nylon=mat('#2e3338',.95),nyl2=mat('#3a4147',.95),strap=mat('#1c1f22',.9),yel=mat('#ffc400',.6),metal=mat('#aeb6bb',.3,.9),n=Math.max(2,ids.length),span=Math.min(.92,.11*n);
  put(new T.BoxGeometry(span+.14,.05,.012),strap,0,0,0,990);put(new T.BoxGeometry(span+.14,.006,.014),yel,0,.022,0,991);put(new T.BoxGeometry(span+.14,.006,.014),yel,0,-.022,0,991);put(new T.BoxGeometry(.06,.05,.02),metal,-(span/2+.04),0,.006,992);
  this.pouches=ids.map((id,i)=>{const x=-span/2+i*(span/(n-1)),g=new T.Group();g.position.set(x,-.012,.004);root.add(g);
   put(new T.BoxGeometry(.088,.11,.012),nyl2,0,-.02,0,993,g);put(new T.BoxGeometry(.088,.082,.03),nylon,0,-.035,.016,995,g);put(new T.BoxGeometry(.09,.012,.032),strap,0,.004,.016,996,g);put(new T.BoxGeometry(.088,.004,.032),yel,0,-.07,.016,996,g);
   const pr=toolProp239(this.kindOf(id),this.owned);pr.rotation.x=Math.PI/2;pr.scale.setScalar(.75);g.add(pr);return {id,g,pr};});
  root.rotation.x=-.5;root.position.set(0,-.6,-.52);return true;
 }
 kindOf(id){const k=this.owner.getContext?.()?.kind;return id==='meter'&&k?({anemometer:'meter',megohm:'megohm',dmm:'dmm'}[k]||'meter'):id;}
 open(){
  const o=this.owner;this.items=o.buttons.map(b=>({button:b,id:o.getId(b)})).filter(x=>x.id&&x.id!=='hand');if(!this.items.length)return;
  this.build();const v=this.view;if(v)v.toolBelt239=this;const host=v?.canvas?.parentElement||o.host?.closest?.('dialog')||this.doc.body;if(this.tag.parentElement!==host)host?.append?.(this.tag);
  const current=this.items.findIndex(x=>x.id===o.selected);this.want=1;this.dx=0;this.select(current>=0?current:0);if(this.root){this.root.visible=true;}this.update(0,true);
 }
 select(i){if(!this.items.length)return;this.index=(i+this.items.length)%this.items.length;const item=this.items[this.index],name=o239name(this.owner,item.id);this.tag.textContent='◀ ▶ '+name+(this.owner.sticky238?' · clic o Tab':' · suelta Tab');this.tag.dataset.tool=item.id;}
 step(d){if(this.items.length)this.select(Math.max(0,this.index)+d);}
 close(choose=true){if(!this.isOpen)return null;this.want=0;this.tag.hidden=true;const item=choose?this.items[this.index]:null;if(item)item.button.click();return item?.id||null;}
 // Called every frame by the scene that shows it (substation, workshop bench, plant walk).
 update(dt=.016,snap=false){if(!this.root)return;const k=snap?1:Math.min(1,dt*9);this.open239+=(this.want-this.open239)*k;if(this.want===0&&this.open239<.02){this.root.visible=false;this.tag.hidden=true;return;}
  this.root.visible=true;this.root.position.set(0,-.6+this.open239*.37,-.52);this.root.rotation.x=-.5-this.open239*.3;
  const sel=this.items[this.index]?.id,held=this.owner.selected;
  for(const p of this.pouches||[]){const on=this.isOpen&&p.id===sel,e=snap?1:Math.min(1,dt*14);p.pr.visible=p.id!==held;p.pr.position.y+=((on?.045:0)-p.pr.position.y)*e;p.g.position.z+=((on?.03:.004)-p.g.position.z)*e;}
  const pouch=this.pouches?.find(p=>p.id===sel),c=this.view?.canvas;if(this.isOpen&&pouch&&c){const w=pouch.g.getWorldPosition(new T.Vector3());w.y+=.07;w.project(this.view.camera);const r={width:c.clientWidth||c.width||1,height:c.clientHeight||c.height||1};this.tag.style.left=((w.x+1)/2*r.width)+'px';this.tag.style.top=((1-w.y)/2*r.height)+'px';this.tag.hidden=false;}}
 dispose3d(){this.root?.removeFromParent();for(const o of this.owned)o.dispose?.();this.owned=[];this.root=null;this.pouches=[];}
 dispose(){this.doc.removeEventListener?.('mousemove',this.onMove,true);this.doc.removeEventListener?.('wheel',this.onWheel,{capture:true});this.doc.removeEventListener?.('pointerdown',this.onDown,true);this.dispose3d();this.tag.remove?.();}
}
function o239name(owner,id){if(id==='meter'){const k=owner.getContext?.()?.kind;return {anemometer:'Anemómetro',megohm:'Megóhmetro',dmm:'Multímetro'}[k]||owner.title?.(id)||'Instrumento';}return owner.title?.(id)||NAMES239[id]||id;}
