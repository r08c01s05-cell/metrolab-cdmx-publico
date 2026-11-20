// Reactor de equilibrio 279. En la S.R. el rectificador dodecafásico son dos puentes de Graetz de seis
// pulsos alimentados por los secundarios en estrella y en delta del transformador (desfasados 30°) y
// conectados en paralelo. Sus tensiones instantáneas nunca son iguales: la bobina (reactor) de
// equilibrio absorbe esa diferencia, reparte la corriente por mitades entre los puentes y entrega a la
// barra el promedio de las dos ondas, con rizado de 12 pulsos.
// Fuente de los datos de la bobina: material del curso (METRO 7EM1, diapositiva 64): «aislamiento tipo
// seco de clase B y enfriamiento natural, se encuentra conectada a la salida del rectificador dodecafásico
// y tiene como finalidad filtrar y controlar las corrientes a la salida del rectificador».
// Las medidas del modelo 3D son ilustrativas: el material no da dimensiones ni inductancia.
import * as THREE from 'three';

export const REACTOR279=Object.freeze({name:'Reactor (bobina) de equilibrio',insulation:'Seco, clase B (130 °C)',cooling:'Natural (AN)',
 connection:'Entre los positivos de los dos puentes de Graetz; su toma central sale al D.U.R.',
 purpose:'Filtrar y controlar las corrientes a la salida del rectificador dodecafásico',
 source:'Material del curso, presentación METRO 7EM1, diapositiva 64 («Bobina de Equilibrio»)',
 vll:571,f:60,ratedKW:2500,nominalV:750});

// Salida instantánea de un puente de seis pulsos ideal: la fase más alta menos la más baja.
export function sixPulse279(theta,shift,vll=REACTOR279.vll){const vp=vll*Math.SQRT2/Math.sqrt(3),a=vp*Math.sin(theta+shift),b=vp*Math.sin(theta+shift-2*Math.PI/3),c=vp*Math.sin(theta+shift+2*Math.PI/3);return Math.max(a,b,c)-Math.min(a,b,c);}
// Una vuelta de red muestreada en n puntos. Puente Y sin desfase, puente Δ desfasado 30°.
export function reactorWaves279({vll=REACTOR279.vll,f=REACTOR279.f,n=720,reactor=true}={}){const th=[],vY=[],vD=[],vR=[],vOut=[];
 for(let i=0;i<n;i++){const t=i/n*2*Math.PI,y=sixPulse279(t,0,vll),d=sixPulse279(t,-Math.PI/6,vll);th.push(t);vY.push(y);vD.push(d);vR.push(y-d);vOut.push(reactor?(y+d)/2:Math.max(y,d));}
 const mean=a=>a.reduce((s,x)=>s+x,0)/a.length,pp=a=>Math.max(...a)-Math.min(...a);
 return{th,vY,vD,vR,vOut,stats:{udi0:mean(vOut),meanY:mean(vY),rippleY:pp(vY),rippleOut:pp(vOut),reactorPeak:Math.max(...vR.map(Math.abs)),bridgeHz:6*f,reactorHz:6*f,outHz:12*f}};}
// Reparto de la corriente de carga Id (A) entre los dos puentes en un ángulo dado.
export function bridgeCurrents279(Id,theta,{reactor=true,vll=REACTOR279.vll}={}){if(reactor)return{Y:Id/2,D:Id/2};const y=sixPulse279(theta,0,vll),d=sixPulse279(theta,-Math.PI/6,vll);return y>=d?{Y:Id,D:0}:{Y:0,D:Id};}
// Corriente de carga a la potencia nominal de la S.R. (2,500 kW a 750 V CD ≈ 3,333 A).
export function ratedCurrent279(kw=REACTOR279.ratedKW,v=REACTOR279.nominalV){return kw*1000/v;}

const M=new Map();function mat(c,o={}){const k=c+JSON.stringify(o);if(!M.has(k))M.set(k,new THREE.MeshStandardMaterial({color:c,roughness:.6,metalness:.2,...o}));return M.get(k);}
function box(g,n,w,h,d,c,x,y,z,o){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c,o));m.name=n;m.position.set(x,y,z);g.add(m);return m;}
function cyl(g,n,r,h,c,x,y,z,o,seg=24){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),mat(c,o));m.name=n;m.position.set(x,y,z);g.add(m);return m;}
function plate(text,w=512,h=160){if(typeof document==='undefined'||!document.createElement)return null;const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext?.('2d');if(!x)return null;x.fillStyle='#d9d4c4';x.fillRect(0,0,w,h);x.strokeStyle='#2b2f33';x.lineWidth=6;x.strokeRect(4,4,w-8,h-8);x.fillStyle='#1d2124';x.textAlign='center';const lines=text.split('\n');lines.forEach((l,i)=>{x.font=(i?'500 26px':'700 32px')+' system-ui,sans-serif';x.fillText(l,w/2,44+i*36);});const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}

// Reactor seco de núcleo de hierro con dos devanados (uno por puente) y toma central.
// Origen en el piso, centro del equipo; el frente (placa y terminales) mira a −z.
export function buildBalanceReactor279(){const g=new THREE.Group();g.name='Reactor_equilibrio279';const steel='#3d484e',core='#4b5054',coil='#6b3b1f',cu='#c47a3a';
 // Bastidor sobre aisladores de apoyo.
 for(const sx of[-1,1]){box(g,'Reactor_bastidor',1.3,.1,.1,steel,0,.17,sx*.38);box(g,'Reactor_bastidor',.1,.1,.86,steel,sx*.6,.17,0);}
 for(const sx of[-1,1])for(const sz of[-1,1]){cyl(g,'Reactor_aislador_apoyo',.05,.12,'#8f4526',sx*.55,.06,sz*.33);for(let k=0;k<2;k++)cyl(g,'Reactor_aislador_apoyo',.075,.025,'#a8532f',sx*.55,.03+k*.06,sz*.33);}
 // Núcleo de chapa magnética: dos columnas y dos yugos, con escalones de laminación.
 const y0=.24,limbH=1,limbX=.33;for(const sx of[-1,1]){box(g,'Reactor_columna_nucleo',.2,limbH,.3,core,sx*limbX,y0+.16+limbH/2,0,{metalness:.55,roughness:.45});box(g,'Reactor_columna_nucleo',.16,limbH,.34,core,sx*limbX,y0+.16+limbH/2,0,{metalness:.55,roughness:.45});}
 for(const yy of[y0+.08,y0+.24+limbH])box(g,'Reactor_yugo',.9,.17,.3,core,0,yy,0,{metalness:.55,roughness:.45});
 // Devanados: cilindros con barniz clase B, separadores y ductos de enfriamiento natural.
 const coilH=.74,coilY=y0+.16+limbH/2;for(const sx of[-1,1]){const name=sx<0?'Reactor_devanado_puente_Y':'Reactor_devanado_puente_delta';const o=cyl(g,name,.215,coilH,coil,sx*limbX,coilY,0,{roughness:.55,metalness:.05},32);o.scale.z=.82;cyl(g,name+'_interior',.17,coilH+.02,'#3a2414',sx*limbX,coilY,0,{},24).scale.z=.82;
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2,s=box(g,'Reactor_separador',.025,coilH+.04,.025,'#d8c79a',sx*limbX+Math.cos(a)*.215,coilY,Math.sin(a)*.215*.82);s.rotation.y=-a;}
  for(let k=0;k<5;k++)cyl(g,'Reactor_ducto_enfriamiento',.222,.012,'#2a1a10',sx*limbX,coilY-coilH/2+.1+k*(coilH-.2)/4,0,{},32).scale.z=.83;}
 // Herrajes de apriete: canales de acero arriba y abajo con tirantes roscados.
 for(const yy of[y0+.08,y0+.24+limbH])for(const sz of[-1,1])box(g,'Reactor_herraje_apriete',1,.14,.05,steel,0,yy,sz*.18);
 for(const sx of[-.45,0,.45])for(const sz of[-1,1])cyl(g,'Reactor_tirante',.012,limbH+.2,'#c8ccd0',sx,y0+.16+limbH/2,sz*.18,{metalness:.8,roughness:.3},8);
 // Terminales: X1 (puente Y +), X2 (puente Δ +) y toma central 0 (a D.U.R.).
 const topY=y0+.36+limbH;const term=(n,x,label)=>{cyl(g,'Reactor_aislador_terminal',.04,.14,'#8f4526',x,topY+.07,-.05);box(g,'Reactor_terminal_'+n,.12,.025,.08,cu,x,topY+.15,-.05,{metalness:.85,roughness:.25});return{x,y:topY+.16,z:-.05,label};};
 const terminals={X1:term('X1',-limbX,'Puente Y +'),X2:term('X2',limbX,'Puente Δ +'),N:term('toma_central',0,'Toma central → D.U.R.')};
 box(g,'Reactor_puente_toma_central',.7,.02,.06,cu,0,y0+.24+limbH+.12,-.18,{metalness:.85,roughness:.25});
 // Placa de datos con lo que dice el material.
 const tex=plate('BOBINA DE EQUILIBRIO\nSECA · CLASE B · ENFRIAMIENTO NATURAL\nRECTIFICADOR DODECAFÁSICO · 750 V CD');const pl=new THREE.Mesh(new THREE.PlaneGeometry(.46,.144),tex?new THREE.MeshStandardMaterial({map:tex,roughness:.5,metalness:.3}):mat('#d9d4c4'));pl.name='Reactor_placa_datos';pl.position.set(0,y0+.6,-.185);pl.rotation.y=Math.PI;g.add(pl);
 // Resguardo de malla con marco (se ve a través).
 const W=1.5,D=1.06,H=topY+.32;for(const sx of[-1,1])for(const sz of[-1,1])box(g,'Reactor_resguardo_poste',.04,H,.04,'#d8c23a',sx*W/2,H/2,sz*D/2);
 for(const yy of[.02,H])for(const sz of[-1,1])box(g,'Reactor_resguardo_marco',W,.035,.035,'#d8c23a',0,yy,sz*D/2);for(const yy of[.02,H])for(const sx of[-1,1])box(g,'Reactor_resguardo_marco',.035,.035,D,'#d8c23a',sx*W/2,yy,0);
 const mesh={color:'#9aa3a8',transparent:true,opacity:.18,metalness:.6,roughness:.4,depthWrite:false,side:THREE.DoubleSide};for(const sz of[-1,1]){const m=box(g,'Reactor_resguardo_malla',W-.05,H-.06,.008,'#9aa3a8',0,H/2,sz*D/2,mesh);m.raycast=()=>{};}for(const sx of[-1,1]){const m=box(g,'Reactor_resguardo_malla',.008,H-.06,D-.05,'#9aa3a8',sx*W/2,H/2,0,mesh);m.raycast=()=>{};}
 const warn=plate('PELIGRO\n750 V CD',300,110);const wp=new THREE.Mesh(new THREE.PlaneGeometry(.3,.11),warn?new THREE.MeshBasicMaterial({map:warn}):mat('#e8d44d'));wp.name='Reactor_aviso';wp.position.set(.5,H-.25,-D/2-.01);wp.rotation.y=Math.PI;g.add(wp);
 g.userData={terminals,size:{w:W,d:D,h:H},illustrative:true};return g;}

// Quita la bobina pequeña que la maqueta dibujaba dentro del gabinete del rectificador.
export function removeCabinetReactor279(parts){const rec=parts.get('rectifier');if(!rec)return 0;const rm=[];rec.traverse(o=>{if(o.isMesh&&/^(Nucleo_reactor_equilibrio|Espira_reactor)/.test(o.name))rm.push(o);});for(const o of rm)o.removeFromParent();return rm.length;}

// Coloca el reactor detrás del gabinete del rectificador, con barras al rectificador y al D.U.R.
export function placeBalanceReactor279(model,parts){if(model.userData.reactor279)return model.userData.reactor279;const rec=parts.get('rectifier'),dc=parts.get('dc');if(!rec||!dc)return null;model.updateMatrixWorld(true);
 const rb=new THREE.Box3().setFromObject(rec),db=new THREE.Box3().setFromObject(dc);let wallZ=rb.max.z+3;model.traverse(o=>{if(o.isMesh&&/^Muro_posterior/.test(o.name)){const b=new THREE.Box3().setFromObject(o);wallZ=Math.min(wallZ,b.min.z);}});
 const holder=new THREE.Group();holder.name='Reactor_equilibrio279_holder';holder.matrixAutoUpdate=false;holder.matrix.copy(rec.matrixWorld).invert();rec.add(holder);
 const r=buildBalanceReactor279(),{d}=r.userData.size,x=(rb.min.x+rb.max.x)/2,z=Math.min(rb.max.z+.3+d/2,wallZ-.12-d/2);r.position.set(x,.05,z);holder.add(r);
 // Barras de cobre aéreas (unión ilustrativa): del techo del rectificador a X1/X2 y de la toma central al D.U.R.
 const cu=mat('#c47a3a',{metalness:.85,roughness:.25}),bus=new THREE.Group();bus.name='Reactor_barras279';holder.add(bus);const T=r.userData.terminals,hy=Math.max(rb.max.y,db.max.y)-.25;
 const run=(name,pts)=>{for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],len=a.distanceTo(b);if(len<1e-3)continue;const m=new THREE.Mesh(new THREE.BoxGeometry(.06,.012,len),cu);m.name=name;m.position.copy(a).add(b).multiplyScalar(.5);m.lookAt(b);bus.add(m);}};
 const w=t=>new THREE.Vector3(x+t.x,.05+t.y,z+t.z);
 run('Barra_puente_Y_a_reactor',[w(T.X1),new THREE.Vector3(x+T.X1.x,hy,z+T.X1.z),new THREE.Vector3(x-.25,hy,rb.max.z-.05)]);
 run('Barra_puente_delta_a_reactor',[w(T.X2),new THREE.Vector3(x+T.X2.x,hy+.08,z+T.X2.z),new THREE.Vector3(x+.25,hy+.08,rb.max.z-.05)]);
 const dx=db.min.x+.45;run('Barra_toma_central_a_DUR',[w(T.N),new THREE.Vector3(x,hy+.16,z+T.N.z),new THREE.Vector3(dx,hy+.16,z+T.N.z),new THREE.Vector3(dx,hy+.16,db.max.z-.05)]);
 for(const b of[[x-.25,rb.max.z],[x+.25,rb.max.z],[dx,db.max.z]]){const s=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.14,12),mat('#8f4526'));s.name='Reactor_aislador_pasamuro';s.position.set(b[0],hy+.04,b[1]+.02);s.rotation.x=Math.PI/2;bus.add(s);}
 holder.updateMatrixWorld(true);r.userData.holder=holder;model.userData.reactor279=r;return r;}
