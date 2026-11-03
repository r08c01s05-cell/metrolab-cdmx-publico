import * as T from 'three';
import {ToolBelt239 as ToolWheel232,HOLD_MS239 as HOLD_MS232} from './tool-belt239.js?v=242';
import {createGlove104} from './repair-glove104.js?v=234';

// Portaherramientas 236 para el recorrido a pie de la planta rectificadora. Mantén Tab para abrir
// la rueda (la misma de las prácticas de mantenimiento), suelta para tomar la herramienta; un
// toque de Tab pasa a la siguiente y Q la guarda. La herramienta se ve en la mano enguantada y
// lee lo que tienes al centro de la vista. Lecturas de recorrido con fines didácticos: la
// temperatura es ilustrativa y el detector solo indica presencia de tensión, no su valor.
export const WALK_TOOLS236=[
 {id:'hand',title:'Manos libres',hint:'Sin herramienta en la mano.'},
 {id:'flashlight',title:'Linterna',hint:'Ilumina hacia donde miras.'},
 {id:'detector',title:'Detector de tensión',hint:'Sin contacto: indica presencia de tensión.'},
 {id:'thermal',title:'Cámara térmica',hint:'Temperatura superficial ilustrativa.'},
 {id:'laser',title:'Medidor láser',hint:'Distancia al punto que apuntas.'}
];
// Equipos con tensión en servicio dentro de la planta (presencia, no valor).
export const ENERGIZED236={mt:'Media tensión',transformer:'Transformador energizado',rectifier:'Rectificador en servicio',dc:'Barras y alimentadores de CD',control:'Tablero de control',battery:'Banco de baterías',aux:'Servicios auxiliares',cables:'Cables con tensión'};
// Temperaturas superficiales de referencia para la cámara (ilustrativas, en °C).
export const SURFACE_C236={transformer:58,rectifier:47,dc:38,mt:33,control:31,battery:27,aux:31,cables:34,earth:24,civil:23,roof:25,fire:23};
export function thermalColour236(c,target=new T.Color()){const t=T.MathUtils.clamp((c-20)/45,0,1);return target.setHSL((1-t)*.66,1,.32+.25*t);}
export function detectorRate236(distance){return distance>3?0:T.MathUtils.lerp(9,1.5,T.MathUtils.clamp((distance-.3)/2.7,0,1));}

export class WalkTools236{
 constructor(view){
  this.view=view;this.doc=view.dialog.ownerDocument||document;this.selected='hand';this.owned=[];this.reading=null;this.time=0;this.raycaster=new T.Raycaster();this.raycaster.far=25;
  this.byGroup=new Map();for(const [id,g] of view.parts||[])this.byGroup.set(g,id);
  // Hidden buttons give the shared wheel the same interface as the maintenance bag.
  this.buttons=WALK_TOOLS236.map(t=>{const b=this.doc.createElement('button');b.type='button';b.hidden=true;b.dataset.walkTool236=t.id;b.textContent=t.title;b.onclick=()=>this.choose(t.id);return b;});
  this.host=view.dialog;this.getId=b=>b.dataset.walkTool236;this.title=id=>WALK_TOOLS236.find(t=>t.id===id)?.title||id;this.prepared176=new Set(WALK_TOOLS236.map(t=>t.id));
  this.wheel232=new ToolWheel232(this);
  this.hud=this.doc.createElement('section');this.hud.className='walk236';this.hud.hidden=true;this.hud.setAttribute('aria-live','polite');
  this.hud.innerHTML='<b data-walk236-title></b><strong data-walk236-value></strong><small data-walk236-note></small><em>Tab: siguiente · mantén Tab: portaherramientas · Q: guardar</em>';
  (view.canvas.parentElement||view.dialog).append(this.hud);
  this.buildViewModel();
  this.onKeyDown=e=>this.keydown(e);this.onKeyUp=e=>this.keyup(e);view.dialog.addEventListener('keydown',this.onKeyDown,true);view.dialog.addEventListener('keyup',this.onKeyUp,true);
 }
 get active(){const v=this.view;return !!(v.dialog.open&&v.walk176?.enabled&&!v.service128?.active&&!v.walk176.bagActive?.());}
 keydown(e){if(!this.active||['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))return;const k=String(e.key||'').toLowerCase();
  if(k==='tab'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat&&!this.tabTimer&&!this.wheel232.isOpen)this.tabTimer=setTimeout(()=>{this.tabTimer=null;this.wheel232.open();},HOLD_MS232);return;}
  if(this.wheel232.isOpen&&['arrowright','arrowdown','arrowleft','arrowup','escape'].includes(k)){e.preventDefault();e.stopImmediatePropagation();if(k==='escape')this.wheel232.close(false);else this.wheel232.step(['arrowright','arrowdown'].includes(k)?1:-1);return;}
  if(k==='q'&&!e.repeat){this.choose('hand');}}
 keyup(e){if(String(e.key||'').toLowerCase()!=='tab'||!this.active&&!this.wheel232.isOpen)return;e.preventDefault();e.stopImmediatePropagation();
  if(this.tabTimer){clearTimeout(this.tabTimer);this.tabTimer=null;const i=WALK_TOOLS236.findIndex(t=>t.id===this.selected);this.choose(WALK_TOOLS236[(i+1)%WALK_TOOLS236.length].id);return;}
  if(this.wheel232.isOpen)this.wheel232.close(true);}
 choose(id){if(!WALK_TOOLS236.some(t=>t.id===id))return;this.selected=id;for(const [key,o]of Object.entries(this.models))o.visible=key===id;this.glove.root.visible=id!=='hand';this.grip();this.render(true);}
 grip(){const g=GRIPS236[this.selected];if(!g)return;this.glove.root.position.set(...g.position);this.glove.root.rotation.set(...g.rotation);this.glove.set?.(g.pose,true);}
 mat(o){const m=new T.MeshStandardMaterial({roughness:.5,...o});this.owned.push(m);return m;}
 part(geo,o,parent,pos=[0,0,0],rot=[0,0,0]){this.owned.push(geo);const m=new T.Mesh(geo,this.mat(o));m.position.set(...pos);m.rotation.set(...rot);parent.add(m);return m;}
 // Tools live in camera space, lower right, pointing where the camera looks (-z).
 buildViewModel(){
  const v=this.view,rig=new T.Group();rig.name='Herramienta en mano236';rig.position.set(.17,-.16,-.42);rig.rotation.set(.06,-.1,0);v.camera.add(rig);this.rig=rig;
  const black={color:'#1d2124',roughness:.6},yellow={color:'#f2c230',roughness:.45},grey={color:'#6c757b',metalness:.6,roughness:.35},models={};
  const lamp=new T.Group();models.flashlight=lamp;
  this.part(new T.CylinderGeometry(.022,.022,.15,20),black,lamp,[0,0,0],[Math.PI/2,0,0]);this.part(new T.BoxGeometry(.03,.085,.035),black,lamp,[0,-.055,.035],[.25,0,0]);this.part(new T.CylinderGeometry(.027,.019,.05,24),grey,lamp,[0,0,-.105],[Math.PI/2,0,0]);
  this.lens=this.part(new T.CircleGeometry(.024,24),{color:'#fff8e0',emissive:'#fff2c4',emissiveIntensity:2},lamp,[0,0,-.131],[0,Math.PI,0]);
  const det=new T.Group();models.detector=det;
  this.part(new T.BoxGeometry(.045,.04,.12),yellow,det);this.part(new T.BoxGeometry(.03,.085,.035),{color:'#2b3035'},det,[0,-.06,.035],[.25,0,0]);this.part(new T.CylinderGeometry(.01,.014,.06,16),yellow,det,[0,0,-.085],[Math.PI/2,0,0]);this.part(new T.ConeGeometry(.01,.03,16),{color:'#e8e8e2'},det,[0,0,-.13],[-Math.PI/2,0,0]);
  this.led=this.part(new T.SphereGeometry(.009,12,8),{color:'#400',emissive:'#ff2010',emissiveIntensity:0},det,[0,.024,-.03]);
  const cam=new T.Group();models.thermal=cam;
  this.part(new T.BoxGeometry(.075,.08,.12),{color:'#2b3035',roughness:.55},cam);this.part(new T.BoxGeometry(.035,.09,.04),{color:'#2b3035'},cam,[0,-.075,.03],[.25,0,0]);
  this.part(new T.CylinderGeometry(.022,.022,.03,20),{color:'#111',metalness:.4},cam,[0,.01,-.07],[Math.PI/2,0,0]);
  this.screen=this.part(new T.PlaneGeometry(.06,.05),{color:'#000',emissive:'#3050ff',emissiveIntensity:1.2},cam,[0,.012,.0605]);
  const las=new T.Group();models.laser=las;
  this.part(new T.BoxGeometry(.05,.03,.11),yellow,las);this.part(new T.BoxGeometry(.03,.085,.035),black,las,[0,-.055,.035],[.25,0,0]);this.part(new T.BoxGeometry(.052,.032,.03),black,las,[0,0,.045]);
  this.part(new T.PlaneGeometry(.036,.018),{color:'#000',emissive:'#9fe0a0',emissiveIntensity:.8},las,[0,.0165,.01],[-Math.PI/2,0,0]);
  for(const o of Object.values(models)){o.visible=false;rig.add(o);}this.models=models;
  // Beam and dot of the laser in world space.
  const beamGeo=new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3(0,0,-1)]),beamMat=new T.LineBasicMaterial({color:'#ff2a2a',transparent:true,opacity:.75});this.owned.push(beamGeo,beamMat);this.beam=new T.Line(beamGeo,beamMat);this.beam.frustumCulled=false;this.beam.visible=false;v.scene.add(this.beam);
  const px=new Uint8Array(32*32*4);for(let y=0;y<32;y++)for(let x=0;x<32;x++){const r=Math.hypot(x-15.5,y-15.5)/15.5,n=(y*32+x)*4;px.set([255,255,255,255*Math.max(0,1-r)**1.5],n);}const dotMap=new T.DataTexture(px,32,32);dotMap.needsUpdate=true;this.owned.push(dotMap);
  const dotMat=new T.SpriteMaterial({map:dotMap,color:'#ff3030',transparent:true,depthTest:false,blending:T.AdditiveBlending});this.owned.push(dotMat);this.dot=new T.Sprite(dotMat);this.dot.scale.setScalar(.06);this.dot.visible=false;v.scene.add(this.dot);
  // The flashlight: one spot light that always exists (toggling lights would recompile materials).
  this.spot=new T.SpotLight('#fff3dc',0,18,.42,.45,1.2);this.spot.position.set(0,0,-.13);lamp.add(this.spot);this.spot.target.position.set(0,0,-3);lamp.add(this.spot.target);
  // Dielectric glove holding the tool (same glove as the maintenance practices).
  this.glove=createGlove104();this.glove.root.visible=false;rig.add(this.glove.root);this.glove.ready?.then?.(()=>this.grip());
 }
 aim(){const v=this.view,o=new T.Vector3();v.camera.updateMatrixWorld(true);const _=0,d=new T.Vector3();v.camera.getWorldPosition(o);v.camera.getWorldDirection(d);this.raycaster.set(o,d);
  const hits=this.raycaster.intersectObject(v.model,true).filter(h=>h.object.visible&&!h.object.userData.study218);const hit=hits[0];if(!hit)return null;
  let id=null;for(let p=hit.object;p&&!id;p=p.parent)id=this.byGroup.get(p)||null;return {...hit,id,origin:o,direction:d};}
 beep(rate,dt){if(!rate){this.beepClock=0;return;}this.beepClock=(this.beepClock||0)+dt;if(this.beepClock<1/rate)return;this.beepClock=0;
  try{const A=globalThis.AudioContext||globalThis.webkitAudioContext;if(!A)return;this.audio??=new A();const o=this.audio.createOscillator(),g=this.audio.createGain();o.frequency.value=2600;g.gain.setValueAtTime(.05,this.audio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,this.audio.currentTime+.06);o.connect(g).connect(this.audio.destination);o.start();o.stop(this.audio.currentTime+.07);}catch{}}
 measure(hit){const id=this.selected;
  if(id==='detector'){const on=hit&&ENERGIZED236[hit.id]&&hit.distance<3;return {value:on?'TENSIÓN PRESENTE':'Sin tensión detectada',note:on?ENERGIZED236[hit.id]+' · conserva la distancia y no toques':hit&&hit.distance>=3&&ENERGIZED236[hit.id]?'Acércate a menos de 3 m para detectar':'Apunta a un equipo',alarm:!!on,rate:on?detectorRate236(hit.distance):0};}
  if(id==='thermal'){if(!hit)return {value:'-- °C',note:'Apunta a un equipo'};const base=SURFACE_C236[hit.id]??24,c=base+Math.sin(hit.point.x*3.1+hit.point.y*2.3)*1.5;return {value:c.toFixed(1)+' °C',note:(hit.id?this.view.parts&&hit.id&&labelOf236(hit.id):'Superficie')+' · valor ilustrativo',celsius:c};}
  if(id==='laser'){return hit?{value:hit.distance.toFixed(2)+' m',note:'Distancia al punto rojo'}:{value:'-- m',note:'Fuera de alcance (25 m)'};}
  if(id==='flashlight')return {value:'Encendida',note:'Ilumina hacia donde miras'};
  return {value:'',note:'Mantén Tab para elegir una herramienta'};}
 render(force=false){const r=this.reading||{},t=WALK_TOOLS236.find(x=>x.id===this.selected),key=this.selected+'|'+r.value+'|'+r.note;if(!force&&key===this.lastKey)return;this.lastKey=key;
  this.hud.querySelector('[data-walk236-title]').textContent=t.title;this.hud.querySelector('[data-walk236-value]').textContent=r.value||'';this.hud.querySelector('[data-walk236-note]').textContent=r.note||t.hint;this.hud.dataset.alarm=String(!!r.alarm);this.hud.dataset.tool=this.selected;}
 update(dt=0){
  const on=this.active;this.hud.hidden=!on;this.rig.visible=on;if(!on){this.spot.intensity=0;this.beam.visible=this.dot.visible=false;if(this.wheel232.isOpen)this.wheel232.close(false);this.wheel232.update(1);return;}
  this.time+=dt;const hit=this.selected==='hand'||this.selected==='flashlight'?null:this.aim();this.reading=this.measure(hit);
  this.spot.intensity=this.selected==='flashlight'?28:0;
  this.led.material.emissiveIntensity=this.reading.alarm?(Math.sin(this.time*this.reading.rate*Math.PI*2)>0?4:.4):0;this.beep(this.reading.rate,dt);
  if(this.reading.celsius!==undefined)thermalColour236(this.reading.celsius,this.screen.material.emissive);
  const laser=this.selected==='laser'&&hit;this.beam.visible=this.dot.visible=!!laser;
  if(laser){const from=this.models.laser.localToWorld(new T.Vector3(0,0,-.056)),p=this.beam.geometry.attributes.position;p.setXYZ(0,from.x,from.y,from.z);p.setXYZ(1,hit.point.x,hit.point.y,hit.point.z);p.needsUpdate=true;this.dot.position.copy(hit.point).addScaledVector(hit.direction,-.01);}
  // A little sway while walking keeps the tool alive in the hand.
  const moving=this.view.walk176.keys?.size?1:0;this.rig.position.y=-.16+Math.sin(this.time*7)*.004*moving;this.rig.position.x=.17+Math.cos(this.time*3.5)*.003*moving;
  this.glove.update?.(dt);this.wheel232.update(dt);this.render();}
 dispose(){this.view.dialog.removeEventListener('keydown',this.onKeyDown,true);this.view.dialog.removeEventListener('keyup',this.onKeyUp,true);this.wheel232.dispose();this.hud.remove();this.rig.removeFromParent();this.beam.removeFromParent();this.dot.removeFromParent();for(const o of this.owned)o.dispose?.();}
}
// Glove placement per tool in the tool rig (glove space: fingers +y, palm +z, thumb +x).
// Every tool has a pistol grip under its body, so the same fist holds all of them.
export const GRIPS236={
 thermal:{position:[.045,-.085,.045],rotation:[-1.75,-1.5708,0],pose:'carryInstrument'},
 laser:{position:[.04,-.03,.03],rotation:[-1.75,-1.5708,0],pose:'carryInstrument'},
 flashlight:{position:[.04,-.07,.045],rotation:[-1.75,-1.5708,0],pose:'carryInstrument'},
 detector:{position:[.04,-.07,.045],rotation:[-1.75,-1.5708,0],pose:'carryInstrument'}
};
const LABELS236={mt:'Celdas de media tensión',transformer:'Transformador de tracción',rectifier:'Rectificador y reactor',dc:'Distribución de tracción',control:'Control y protección',battery:'Baterías y cargador',aux:'Servicios auxiliares',cables:'Canalizaciones',earth:'Puesta a tierra',civil:'Obra civil',roof:'Cubierta y ventilación',fire:'Protección contra incendios'};
function labelOf236(id){return LABELS236[id]||'Superficie';}
