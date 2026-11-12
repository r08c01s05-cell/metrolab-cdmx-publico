import * as THREE from 'three';

// Recorrido de la energía 250 dentro de la planta rectificadora. Con un botón, la energía aparece
// por etapas, en el orden en que la transforma la subestación: la media tensión de CA entra a las
// celdas, el transformador la baja y la entrega por sus dos secundarios, el rectificador de doce
// diodos la convierte en corriente directa, y las celdas de CD la mandan a la vía como positivo
// (+750 V CD a la barra guía); el retorno vuelve por los rieles al negativo de la planta.
// Las rutas siguen la maqueta didáctica de este simulador (no son un plano de una instalación) y
// usan los datos del material del curso (261): 15 kV / 571 V CA en el transformador y 750 V CD de tracción.
export const STAGES250=[
 {id:'mt',color:'#ffb238',title:'1 · Entra la media tensión',text:'El cable de 15 kV del P.C.C. llega al grupo seccionador (Intersec), pasa por el seccionador tripolar y sigue al transformador principal.'},
 {id:'transformer',color:'#c47dff',title:'2 · El transformador baja la tensión',text:'El primario recibe la media tensión. Los dos secundarios, uno en delta y otro en estrella, entregan 571 V CA, cada uno a un puente rectificador.'},
 {id:'rectifier',color:'#ff4f3b',title:'3 · El rectificador la convierte en directa',text:'Dos puentes de Graetz (168 diodos en la S.R. real de 2,500 kW) convierten la CA en corriente directa. La bobina de equilibrio reparte la carga entre los dos puentes.'},
 {id:'dc',color:'#ff4f3b',title:'4 · Sale a la vía como positivo',text:'El disyuntor ultrarrápido (D.U.R.) y el seccionador de 5,000 A mandan el positivo de 750 V CD hacia la barra guía.'},
 {id:'return',color:'#36a6ff',title:'5 · Regresa por los rieles',text:'Después de pasar por los motores del tren, la corriente vuelve por los rieles de seguridad al negativo (CD−) de la planta y cierra el circuito en el rectificador.'}
];
const TX=-1.85;
// Polylines in the local coordinates of the rectifier model (createRectifier126).
export function flowRoutes250(){
 const r=[];const add=(stage,points)=>r.push({stage,points});
 for(let p=0;p<3;p++){const dz=(p-1)*.07,cellX=[-6.3,-5.18,-4.06].map(x=>x-.27+p*.27),trX=TX-.73+p*.73;
  add('mt',[[-7.2,3.05,1.9+dz],[cellX[0],3.05,1.9+dz],[cellX[0],2.5,1.9+dz],[cellX[2],2.5,1.9+dz],[cellX[2],1.2,1.9+dz],[-3.35,1.2,1.9+dz],[-3.35,2.8,2+dz],[trX,2.8,2+dz],[trX,2.4,2+dz]]);
  for(let s=0;s<2;s++){const y=1.03+s*.55,z=1.05+p*.16,bx=.72+s*.86;
   add('transformer',[[trX,2.2,2],[trX,y,1.7],[trX,y,z],[TX+1.2,y,z],[.25,y,1.45],[bx-.32,.7+s*.3,1.6],[bx-.32,2.2,1.6]]);}
 }
 for(let s=0;s<2;s++){const bx=.72+s*.86;for(let d=0;d<6;d+=2)add('rectifier',[[bx-.32,.63+d*.3,1.62],[bx,.63+d*.3,1.56],[bx+.25,.63+d*.3,1.5],[1.15,2.45,1.5],[1.95,2.6,1.6]]);}
 for(const x of[3.7,4.85]){const pos=x-.3,neg=x+.3;
  add('dc',[[1.95,2.6,1.6],[pos,2.75,1.95],[pos,2.4,2.1],[pos,.8,2.1],[pos,.5,1.7],[pos,.14,1.3],[7.4,.14,1.3]]);
  add('return',[[7.4,.14,.85],[neg,.14,.85],[neg,.6,1.8],[neg,2.45,2.1],[neg,2.75,1.95],[2.05,2.75,1.9],[1.15,.5,.95],[.4,.5,1.4]]);}
 for(const route of r){let L=0;route.lengths=[0];for(let i=1;i<route.points.length;i++){const a=route.points[i-1],b=route.points[i];L+=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);route.lengths.push(L);}route.length=L;}
 return r;
}
function along250(route,d){let i=1;while(i<route.lengths.length-1&&route.lengths[i]<d)i++;const a=route.points[i-1],b=route.points[i],u=(d-route.lengths[i-1])/((route.lengths[i]-route.lengths[i-1])||1);return[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];}
export const STAGE_SECONDS250=4.5;

export class PowerFlow250{
 constructor(view,doc=globalThis.document){
  this.view=view;this.doc=doc;this.on=false;this.clock=0;this.time=0;this.routes=flowRoutes250();
  const tools=view.dialog?.querySelector?.('.sr126-tools');
  this.button=doc.createElement('button');this.button.type='button';this.button.className='pf250-toggle';this.button.textContent='〰 Flujo de energía';this.button.setAttribute('aria-pressed','false');this.button.onclick=()=>this.toggle();
  const advanced=tools?.querySelector?.('.sr137-advanced');if(advanced)tools.insertBefore(this.button,advanced);else tools?.append(this.button);
  this.panel=doc.createElement('aside');this.panel.className='pf250-panel';this.panel.hidden=true;this.panel.setAttribute('aria-live','polite');
  this.panel.innerHTML=`<header><b>Recorrido de la energía</b><button type="button" data-pf250-replay>Repetir</button></header><ol>${STAGES250.map(s=>`<li data-pf250-stage="${s.id}"><i style="background:${s.color}"></i><div><b>${s.title}</b><span>${s.text}</span></div></li>`).join('')}</ol><small>Rutas sobre la maqueta didáctica, no sobre un plano real. Se ven a través de los gabinetes.</small>`;
  (view.dialog?.querySelector?.('.sr126-stage')||doc.body)?.append(this.panel);
  this.panel.querySelector?.('[data-pf250-replay]')?.addEventListener?.('click',()=>{this.clock=0;});
  const count=this.routes.reduce((n,r)=>n+Math.ceil(r.length/.22),0);
  this.mesh=new THREE.InstancedMesh(new THREE.SphereGeometry(.028,8,6),new THREE.MeshBasicMaterial({color:'#ffffff',toneMapped:false,depthTest:false,depthWrite:false,transparent:true}),count);
  this.mesh.name='Flujo_energia250';this.mesh.frustumCulled=false;this.mesh.renderOrder=20;this.mesh.visible=false;view.model?.add(this.mesh);
  this.seeds=[];this.routes.forEach((route,i)=>{const n=Math.ceil(route.length/.22);for(let k=0;k<n;k++)this.seeds.push({route:i,offset:k/n});});
 }
 toggle(on=!this.on){this.on=on;this.clock=0;this.button.setAttribute('aria-pressed',String(on));this.panel.hidden=!on;this.mesh.visible=on;if(on&&this.view.status)this.view.status.textContent='Flujo de energía: mira cómo entra la CA, se transforma, se rectifica y sale a la vía.';}
 // Stage reached so far (all stages stay lit once reached).
 stage(){return Math.min(STAGES250.length,1+Math.floor(this.clock/STAGE_SECONDS250));}
 update(dt=0){if(!this.on)return 0;this.clock+=dt;this.time+=dt;const reached=this.stage(),current=STAGES250[reached-1].id;
  for(const li of this.panel.querySelectorAll?.('[data-pf250-stage]')||[]){const i=STAGES250.findIndex(s=>s.id===li.dataset.pf250Stage);li.dataset.state=i<reached-1?'done':i===reached-1?'now':'next';}
  // Exploded view separates the cabinets; the routes only follow the assembled plant.
  const exploded=!!this.view.exploded;this.mesh.visible=!exploded;if(exploded)return 0;
  const m=new THREE.Matrix4(),v=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),c=new THREE.Color();let n=0;
  for(const seed of this.seeds){const route=this.routes[seed.route],index=STAGES250.findIndex(s=>s.id===route.stage);if(index>=reached)continue;
   const fresh=STAGES250[index].id===current&&reached<=STAGES250.length&&this.clock<STAGES250.length*STAGE_SECONDS250,grow=fresh?Math.min(1,(this.clock-index*STAGE_SECONDS250)/1.6):1;
   const d=(seed.offset*route.length+this.time*1.1)%route.length;if(d>route.length*grow)continue;
   v.set(...along250(route,d));sc.setScalar(fresh?1.35:1);m.compose(v,q,sc);this.mesh.setMatrixAt(n,m);this.mesh.setColorAt(n,c.set(STAGES250[index].color));n++;}
  this.mesh.count=n;this.mesh.instanceMatrix.needsUpdate=true;if(this.mesh.instanceColor)this.mesh.instanceColor.needsUpdate=true;return n;}
 dispose(){this.mesh.removeFromParent();this.button.remove();this.panel.remove();}
}
