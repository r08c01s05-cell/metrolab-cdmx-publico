import {EnergyDetail249} from './energy-detail249.js?v=253';
import{RenderBudget101}from'./render-budget101.js?v=222';
import * as T from 'three';
import {detailedEnergy162} from './energy-assets162.js?v=222';
import {OrbitControls} from './vendor/OrbitControls.js';
const PARTS=[
 ['track','1 · Vía y retorno','Las pistas soportan los neumáticos. Los rieles de seguridad y las conexiones de retorno son elementos distintos de la barra de alimentación. En rodadura férrea, las ruedas de acero apoyan sobre los rieles.',[0,-.65,0]],
 ['supply','2 · Alimentación','La barra guía lateral alimenta al tren neumático mediante el captador. En el sistema aéreo, un pantógrafo toma la corriente del hilo de contacto.',[1.05,.55,0]],
 ['collector','3 · Captador','El contacto deslizante mantiene la toma de corriente mientras avanza el coche. El aislador separa eléctricamente el captador del bastidor.',[.6,.4,.65]],
 ['power','4 · Conversión de tracción','Protección, filtro y convertidor regulan la energía antes de llegar al motor. Selecciona una arquitectura para comparar sus componentes.',[0,.65,1.7]],
 ['bogie','5 · Bogie y motores','El bastidor transmite las cargas a las ruedas. El motor entrega par al eje mediante la transmisión. El retorno cierra el circuito hacia la subestación.',[0,.2,-1.1]],
 ['body','6 · Caja del coche','El corte transversal descubre el piso y los equipos bajo la caja. La envolvente permanece opaca; el corte retira geométricamente la mitad del modelo.',[0,1.5,0]]
];
export function createEnergyModel160(type='pneumatic',architecture='inverter'){
 const root=new T.Group(),groups=new Map(),materials=[];
 const material=(name,color,metalness=.2)=>{const m=new T.MeshStandardMaterial({name,color,metalness,roughness:.54});materials.push(m);return m;};
 const steel=material('Acero','#a1b0af',.72),dark=material('Goma y aislante','#202b30'),orange=material('Carrocería','#df792d',.35),copper=material('Conductor','#d4a15b',.65),red=material('Positivo','#bd4f3e'),blue=material('Retorno','#4a9cae'),white=material('Piso','#bfc9bf'),green=material('Convertidor','#47756b');
 for(const[id]of PARTS){const g=new T.Group();g.name=id;g.userData.energyPart=id;groups.set(id,g);root.add(g);}
 function box(g,p,s,m){const o=new T.Mesh(new T.BoxGeometry(...s),m);o.position.set(...p);g.add(o);return o;}
 function cylinder(g,p,r,l,m,axis='x'){const o=new T.Mesh(new T.CylinderGeometry(r,r,l,32),m);if(axis==='x')o.rotation.z=Math.PI/2;else if(axis==='z')o.rotation.x=Math.PI/2;o.position.set(...p);g.add(o);return o;}
 function bar(g,a,b,r,m){const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av),o=cylinder(g,av.clone().lerp(bv,.5).toArray(),r,d.length(),m,'y');o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;}
 const track=groups.get('track'),supply=groups.get('supply'),collector=groups.get('collector'),bogie=groups.get('bogie'),body=groups.get('body'),power=groups.get('power');
 box(track,[0,-.19,0],[3.8,.24,5],material('Concreto','#667673'));
 for(let z=-2.2;z<2.4;z+=.55)box(track,[0,-.025,z],[2.65,.12,.17],steel);
 for(const x of[-.7175,.7175]){box(track,[x,.07,0],[.13,.14,5],steel);box(track,[x,.15,0],[.075,.045,5],steel);}
 const pneumatic=type==='pneumatic';
 if(pneumatic)for(const x of[-1.0,1.0]){box(track,[x,.13,0],[.34,.16,5],white);box(supply,[Math.sign(x)*1.47,.55,0],[.055,.19,5],copper);for(const z of[-1.8,-.6,.6,1.8]){box(supply,[Math.sign(x)*1.54,.24,z],[.16,.2,.17],dark);box(supply,[Math.sign(x)*1.52,.38,z],[.16,.09,.17],white);}}
 else{
  bar(supply,[0,4.55,-2.5],[0,4.55,2.5],.025,copper);
  for(const z of[-2.2,2.2]){bar(supply,[-1.9,0,z],[-1.9,5,z],.065,steel);bar(supply,[-1.9,4.9,z],[.15,4.9,z],.04,steel);bar(supply,[0,4.9,z],[0,4.55,z],.015,copper);}
 }
 for(const z of[-1.3,1.3]){
  cylinder(bogie,[0,.68,z],.09,2.35,steel);
  for(const x of[-1,1]){
   cylinder(bogie,[x,.68,z],pneumatic?.43:.49,pneumatic?.25:.11,pneumatic?dark:steel);
   cylinder(bogie,[x*1.15,.68,z],.22,.05,steel);
   if(pneumatic){cylinder(bogie,[x*.72,.66,z],.41,.07,steel);cylinder(bogie,[x*1.3,.55,z],.17,.1,dark,'y');}
  }
  box(bogie,[0,.98,z],[2.1,.18,.2],steel);
  const motor=cylinder(bogie,[0,.7,z-.25],.23,.65,green);for(let i=0;i<9;i++)cylinder(bogie,[-.31+i*.078,.7,z-.25],.245,.018,steel);
  box(bogie,[.47,.64,z-.14],[.24,.4,.4],dark);
 }
 for(const x of[-.68,.68]){box(bogie,[x,1.07,0],[.16,.2,3],steel);for(const z of[-.65,.65]){for(let j=0;j<6;j++)cylinder(bogie,[x,1.15+j*.045,z],.15,.022,steel,'y');}}
 if(pneumatic){
  for(const x of[-1,1]){box(collector,[x*1.44,.55,0],[.045,.14,.32],dark);bar(collector,[x*.88,1.05,0],[x*1.43,.55,0],.035,copper);cylinder(collector,[x*.9,1.02,0],.1,.18,white,'y');}
  bar(collector,[1.0,1.05,0],[.6,1.4,.4],.024,red);
 }else{
  box(collector,[0,3.7,0],[.85,.07,.8],dark);
  for(const z of[-.2,.2]){bar(collector,[-.38,3.75,z],[.42,4.1,z],.025,steel);bar(collector,[.42,4.1,z],[-.12,4.51,z],.025,steel);}
  box(collector,[-.12,4.52,0],[.75,.035,.55],dark);bar(collector,[.4,3.7,.3],[.4,1.4,.3],.025,red);
 }
 // Open front in section mode; the far half remains to convey the train envelope.
 box(body,[0,1.5,0],[2.65,.15,4.5],white);box(body,[0,3.55,0],[2.65,.12,4.5],orange);
 for(const x of[-1.3,1.3]){
  box(body,[x,2.0,0],[.08,.95,4.5],orange);box(body,[x,3.39,0],[.08,.23,4.5],orange);
  for(const z of[-2.2,-.73,.73,2.2])box(body,[x,2.9,z],[.08,.9,.07],steel);
 }
 for(const x of[-.9,.9])box(body,[x,1.82,1.3],[.52,.25,1.1],green);
 // Independently separated inner components and a removable cover.
 box(power,[0,1.24,.35],[1.55,.1,1.12],dark);box(power,[-.63,1.02,.35],[.18,.32,.9],white);
 for(let i=0;i<10;i++)cylinder(power,[-.35,1.03,.02+i*.055],.13,.035,copper,'z');
 if(architecture==='rheostat')for(let i=0;i<12;i++)box(power,[.12+i*.045,1.04,.35],[.02,.24,.72],steel);
 else for(let row=0;row<(architecture==='inverter'?3:2);row++){
  box(power,[.13+row*.2,1.02,.35],[.14,.25,.72],green);
  for(let i=0;i<10;i++)box(power,[.13+row*.2,.88,.04+i*.065],[.17,.045,.018],steel);
 }
 for(const z of[-.1,.7])bar(power,[-.65,1.3,z],[.7,1.3,z],.017,copper);
 bar(power,[.55,.9,.35],[.55,.6,1.3],.02,red);bar(bogie,[.55,.6,1.3],[.72,.25,1.3],.02,blue);
 const cover=box(power,[0,1.0,.94],[1.58,.4,.04],green);cover.name='Tapa de acceso';cover.userData.cover160=true;
 const sectionPlane=new T.Plane(new T.Vector3(0,0,-1),0);
 const bodyMaterials=new Map();body.traverse(o=>{if(!o.isMesh)return;if(!bodyMaterials.has(o.material)){const m=o.material.clone();materials.push(m);bodyMaterials.set(o.material,m);}o.material=bodyMaterials.get(o.material);});
 const sectionEdge=new T.Group();body.add(sectionEdge);for(const x of[-1.3,1.3])box(sectionEdge,[x,2.55,-.004],[.09,2.05,.035],copper);box(sectionEdge,[0,1.5,-.004],[2.65,.16,.035],copper);box(sectionEdge,[0,3.55,-.004],[2.65,.13,.035],copper);
 function setSection(on){sectionEdge.visible=on;for(const m of bodyMaterials.values()){m.clippingPlanes=on?[sectionPlane]:null;m.clipShadows=true;m.needsUpdate=true;}root.userData.section160=on;}
 function explode(value){for(const[id,,,offset]of PARTS)groups.get(id).position.fromArray(offset).multiplyScalar(value);cover.position.z=.94+value*.7;root.updateMatrixWorld(true);}
 setSection(true);
 return{root,groups,setSection,explode,dispose(){root.traverse(o=>o.geometry?.dispose());for(const m of new Set(materials))m.dispose();}};
}
let viewer;
export function mountEnergy160(){
 if(document.getElementById('energy160'))return document.getElementById('energy160');
 const dialog=document.createElement('dialog');dialog.id='energy160';
 dialog.innerHTML=`<header class="energy160-head"><div><small>ENERGÍA · CORTE TRANSVERSAL 3D</small><h2>De la vía al motor</h2></div><button data-close>Volver ×</button></header><div class="energy160-layout"><div class="energy160-stage"><canvas aria-label="Modelo tridimensional de captación y alimentación"></canvas><span class="energy160-help">Arrastra para girar · rueda para acercar · selecciona un componente</span></div><aside class="energy160-side"><p data-load162 role="status"></p><label>Coche de referencia<select data-model162><option value="NM22">NM-22 · Línea 1</option><option value="NM79">NM-79 · Línea 8</option><option value="MP82">MP-82 · Línea 8</option></select></label><label>Captación<select data-type><option value="pneumatic">Barra guía · neumático · 750 V CD</option><option value="overhead">Catenaria · férreo · 750 / 1500 V CD</option></select></label><label>Arquitectura de tracción<select data-architecture><option value="inverter">Inversor VVVF · motor de CA</option><option value="chopper">Chopper · motor de CC</option><option value="rheostat">Control reostático · motor de CC</option></select></label><div class="energy160-actions"><button data-section aria-pressed="true">Corte transversal</button><button data-front162>Corte frontal</button><button data-home>Vista general</button></div><label>Despiece <output data-amount>0 %</output><input data-explode aria-label="Separación de componentes" type="range" min="0" max="1" step=".01" value="0"></label><label><input type="checkbox" data-flow249 checked> Mostrar flujo de energía</label><p>Ámbar: alimentación y captación. Cian: circuito de retorno. Los equipos consumen; la barra guía conduce. Pulsos didácticos, sin escala de velocidad física.</p><details><summary>Electrónica de potencia · detalle comparativo</summary><p>Captador → disyuntor → filtro / enlace CC → inversor VVVF → motor CA. Desde el enlace CC se deriva la alimentación del convertidor auxiliar para ventilación, alumbrado y baterías. VVVF describe tensión y frecuencia variables; los IGBT son interruptores de potencia, no un sistema distinto. Seis posiciones Q1–Q6, con diodos antiparalelos, forman tres ramas U/V/W en este inversor ilustrativo de dos niveles. Chopper y reostático requieren otras topologías.</p><div data-devices249></div><p data-device249></p><a href="https://www.mitsubishielectric.com/semiconductors/powerdevices/application/railway/index.html" target="_blank" rel="noopener">Referencia del fabricante · inversores de tracción</a></details><nav class="energy160-parts" aria-label="Componentes de alimentación"></nav><h3 data-title></h3><p data-description></p><p data-architecture-note></p><small>Geometría didáctica. La arquitectura de tracción se compara por separado: no se atribuye una revisión eléctrica específica a cada tren.</small><p><a href="https://www.metro.cdmx.gob.mx/parque-vehicular" target="_blank" rel="noopener">Referencia pública del STC</a></p></aside></div>`;
 document.body.append(dialog);
 for(const[id,title]of PARTS){const b=document.createElement('button');b.textContent=title;b.dataset.energyPart=id;b.onclick=()=>viewer?.model&&viewer.select(id);dialog.querySelector('nav').append(b);}
 const open=()=>{const model=globalThis.window?.workshopGame?.selectedModel216,select=dialog.querySelector('[data-model162]'),changed=['NM22','NM79','MP82'].includes(model)&&select.value!==model;if(changed)select.value=model;dialog.showModal();if(!viewer)viewer=new EnergyViewer160(dialog);else if(changed)viewer.rebuild();viewer.resize();viewer.draw();};
 document.querySelector('#energy-open160')?.addEventListener('click',open);
 document.addEventListener('metro-energy-open',open);
 dialog.querySelector('[data-close]').onclick=()=>dialog.close();
 return dialog;
}
class EnergyViewer160{
 constructor(dialog){this.dialog=dialog;this.canvas=dialog.querySelector('canvas');this.renderer=new T.WebGLRenderer({canvas:this.canvas,antialias:true,powerPreference:'high-performance'});this.budget171=new RenderBudget101(this.renderer,{fps:60});this.renderer.localClippingEnabled=true;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.2;this.scene=new T.Scene();this.scene.background=new T.Color('#14272f');this.scene.add(new T.HemisphereLight('#f1f4e8','#394b52',2));const key=new T.DirectionalLight('#fff0d8',3);key.position.set(3,7,5);this.scene.add(key);this.camera=new T.PerspectiveCamera(43,1,.05,80);this.controls=new OrbitControls(this.camera,this.canvas);this.controls.enableDamping=false;this.controls.minDistance=2;this.controls.maxDistance=22;this.controls.addEventListener('change',()=>this.draw());this.ray=new T.Raycaster();this.pointer=new T.Vector2();
  for(const key of['type','architecture','model162'])dialog.querySelector('[data-'+key+']').onchange=()=>this.rebuild();
  dialog.querySelector('[data-section]').onclick=e=>{this.section=!this.section;this.model?.setSection(this.section);e.currentTarget.setAttribute('aria-pressed',this.section);this.draw();};
  dialog.querySelector('[data-explode]').oninput=e=>{const n=Number(e.target.value);this.model?.explode(n);dialog.querySelector('[data-amount]').textContent=Math.round(n*100)+' %';this.draw();};
  dialog.querySelector('[data-home]').onclick=()=>this.home();dialog.querySelector('[data-front162]').onclick=()=>{this.camera.position.set(0,1.7,7.4);this.controls.target.set(0,1.7,0);this.controls.update();this.draw();};
  this.canvas.addEventListener('pointerdown',e=>this.down=[e.clientX,e.clientY]);
  this.canvas.addEventListener('pointerup',e=>{if(!this.model)return;if(!this.down||Math.hypot(e.clientX-this.down[0],e.clientY-this.down[1])>5)return;const r=this.canvas.getBoundingClientRect();this.pointer.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);this.ray.setFromCamera(this.pointer,this.camera);for(const h of this.ray.intersectObject(this.model.root,true)){if(this.section&&h.point.z>0&&h.object.material.clippingPlanes?.length)continue;let o=h.object;while(o&&!o.userData.energyPart)o=o.parent;if(o){this.select(o.userData.energyPart);break;}}});
  dialog.querySelector('[data-flow249]').onchange=()=>this.draw();dialog.addEventListener('close',()=>{if(this.pending171)cancelAnimationFrame(this.pending171);this.pending171=null;});new ResizeObserver(()=>this.resize()).observe(this.canvas.parentElement);this.rebuild();
 }
 async rebuild(){const token=this.loading162=(this.loading162||0)+1,type=this.dialog.querySelector('[data-type]').value,architecture=this.dialog.querySelector('[data-architecture]').value,id=this.dialog.querySelector('[data-model162]').value;this.dialog.dataset.loading162='true';this.dialog.querySelector('[data-load162]').textContent='Cargando coche, bogie y vía detallados…';let candidate;
  try{candidate=createEnergyModel160(type,architecture);await detailedEnergy162(candidate,type,id);if(this.loading162!==token){candidate.dispose();return;}if(this.model){this.detail249?.dispose();this.scene.remove(this.model.root);this.model.dispose();}this.model=candidate;this.scene.add(candidate.root);this.detail249=new EnergyDetail249(candidate,type,architecture);const devices=this.dialog.querySelector('[data-devices249]');devices.replaceChildren();for(let i=0;i<this.detail249.devices.length;i++){const b=document.createElement('button');b.textContent='Q'+(i+1)+' · '+ 'UVW'[Math.floor(i/2)];b.onclick=()=>{this.detail249.select(i);this.dialog.querySelector('[data-device249]').textContent=this.detail249.devices[i].name+' · encapsulado esquemático, cotas y tecnología del coche pendientes de verificar';this.select('power');const center=new T.Box3().setFromObject(this.detail249.electronics).getCenter(new T.Vector3());this.controls.target.copy(center);this.camera.position.copy(center).add(new T.Vector3(1.6,1.4,2.2));this.controls.update();this.draw();};devices.append(b);}this.dialog.querySelector('[data-device249]').textContent=architecture==='inverter'?'Usa el despiece y selecciona un IGBT. No es un plano del fabricante del coche.':'La topología elegida no es el inversor trifásico de seis IGBT; selecciona VVVF para compararla.';this.section=true;this.dialog.querySelector('[data-section]').setAttribute('aria-pressed','true');this.dialog.querySelector('[data-explode]').value=0;this.dialog.querySelector('[data-amount]').textContent='0 %';this.dialog.querySelector('[data-architecture-note]').textContent=({inverter:'VVVF: corriente continua a alterna de tensión y frecuencia variables.',chopper:'Chopper: regulación de corriente continua por conmutación.',rheostat:'Reostático: regulación con resistencias.'})[architecture]+' Comparación de arquitectura; no modifica la tecnología atribuida al coche.';this.dialog.querySelector('[data-load162]').textContent=type==='overhead'?'Carrocería existente con adaptación férrea y pantógrafo didácticos.':'Coche, bogie, motores, captadores y vía del simulador.';this.select('collector');this.home();}
  catch(e){candidate?.dispose();if(this.loading162===token)this.dialog.querySelector('[data-load162]').textContent='No se pudo cargar el modelo. Cambia de coche para reintentar.';console.error('Alimentación 3D:',e);}
  finally{if(this.loading162===token)this.dialog.dataset.loading162='false';}
 }
 select(id){if(this.outline){this.scene.remove(this.outline);this.outline.geometry.dispose();this.outline.material.dispose();}this.outline=new T.BoxHelper(this.model.groups.get(id),0xe5bc74);this.scene.add(this.outline);const row=PARTS.find(p=>p[0]===id);this.dialog.querySelector('[data-title]').textContent=row[1];this.dialog.querySelector('[data-description]').textContent=row[2];for(const b of this.dialog.querySelectorAll('[data-energy-part]'))b.setAttribute('aria-pressed',b.dataset.energyPart===id);this.draw();}
 home(){this.camera.position.set(6,4.8,8);this.controls.target.set(0,1.7,0);this.controls.update();this.draw();}
 resize(){if(!this.dialog.open)return;const r=this.canvas.parentElement.getBoundingClientRect();if(!r.width||!r.height)return;this.renderer.setSize(r.width,r.height,false);this.camera.aspect=r.width/r.height;this.camera.updateProjectionMatrix();this.draw();}
 draw(){if(!this.dialog.open||!this.model||this.pending171)return;const paint=now=>{this.pending171=null;if(!this.dialog.open||!this.model)return;if(!this.budget171.allows(now)){this.pending171=requestAnimationFrame(paint);return;}this.detail249?.update(now/1000,this.dialog.querySelector('[data-flow249]').checked);this.outline?.update();this.renderer.render(this.scene,this.camera);if(this.dialog.querySelector('[data-flow249]').checked)this.draw();};this.pending171=requestAnimationFrame(paint);}
}
if(typeof document!=='undefined')mountEnergy160();



