import * as T from 'three';

// Only the isolated study clone is articulated. Shared GLB buffers stay intact.
export class FaultAnimation218{
 constructor(model,domain,scene){
  this.model=model;this.domain=domain;this.scene=scene;this.root=new T.Group();this.root.name='Detalle ilustrativo de consecuencias218';scene.add(this.root);
  this.geometry=new Set();this.materials=new Set();this.textures=new Set();this.restore=[];this.pivots=[];this.doors=[];this.wheels=[];this.smoke=[];this.basePosition=model.root.position.clone();
  this.envelope=model.bounds().clone();this.initialBounds=this.envelope.clone();
  if(domain==='train')this.train();else this.substation();
  if(globalThis.location?.search?.includes('depurar225'))globalThis.faultFx225=this;
 }
 mesh(geometry,color,parent=this.root,options={}){this.geometry.add(geometry);const m=new T.MeshStandardMaterial({color,roughness:.7,...options});this.materials.add(m);const o=new T.Mesh(geometry,m);o.userData.study218=true;parent.add(o);return o;}
 box(size,color,position,parent=this.root){const o=this.mesh(new T.BoxGeometry(...size),color,parent);o.position.set(...position);return o;}
 pivot(meshes,center,parent){const g=new T.Group();g.position.copy(center);parent.add(g);this.pivots.push(g);for(const o of meshes){this.restore.push({o,parent:o.parent,matrix:o.matrix.clone()});g.add(o);o.matrix.premultiply(new T.Matrix4().makeTranslation(-center.x,-center.y,-center.z));}return g;}
 train(){
  const leaves=new Map(),meshes=[];this.model.root.traverse(o=>{if(!o.isMesh)return;meshes.push(o);const f=o.userData.faultFamily218;if(/Puerta.*Hoja_/i.test(f)){if(!leaves.has(f))leaves.set(f,[]);leaves.get(f).push(o);}});
  const pairs=new Map();for(const [family,objects]of leaves){const key=family.replace(/_Hoja_.*/,''),box=new T.Box3();objects.forEach(o=>box.union(new T.Box3().setFromObject(o)));if(!pairs.has(key))pairs.set(key,[]);pairs.get(key).push({objects,center:box.getCenter(new T.Vector3())});}
  const pair=[...pairs.values()].filter(a=>a.length===2&&a[0].center.z>0).sort((a,b)=>Math.abs(a[0].center.x+a[1].center.x)-Math.abs(b[0].center.x+b[1].center.x))[0];
  if(pair){const mid=(pair[0].center.x+pair[1].center.x)/2;for(const leaf of pair){const pivot=this.pivot(leaf.objects,leaf.center,this.model.targets.get('doors'));this.doors.push({pivot,x:leaf.center.x,sign:Math.sign(leaf.center.x-mid)});}}
  // Rim/fasteners are separate geometry; the rotationally symmetric rubber is
  // batched in the source. Animate the actual rims and add a small witness mark.
  const rims=meshes.filter(o=>/^Aro_llanta(?:_\d+)?$/.test(o.name));
  let support=.14;for(const rim of rims){const b=new T.Box3().setFromObject(rim),c=b.getCenter(new T.Vector3()),radius=b.getSize(new T.Vector3()).y/2;
   const objects=meshes.filter(o=>o===rim||/^Tornillo_llanta/.test(o.name)&&new T.Box3().setFromObject(o).getCenter(new T.Vector3()).distanceTo(c)<radius*1.4);
   const pivot=this.pivot(objects,c,rim.parent),mark=this.box([radius*.74,.028,.012],'#f7f2d9',[radius*.42,0,Math.sign(c.z)*.025],pivot);
   mark.name='Marca testigo de giro · ilustrativa';this.wheels.push({pivot,radius:radius*1.42,mark});support=Math.min(support,c.y-radius*1.42);
  }
  const b=this.initialBounds,min=b.min.x-1,max=b.max.x+9,length=max-min,mid=(max+min)/2;
  // A fixed observation track, unrelated to the route geometry of the game.
  for(const z of [-1.15,1.15])this.box([length,.07,.24],'#89918e',[mid,support-.035,z]);
  for(let x=min;x<max;x+=.8)this.box([.17,.08,2.9],'#697470',[x,support-.11,0]);
  for(let x=min;x<max;x+=2)this.box([.09,.015,.55],'#c69343',[x,support-.13,2]);
  this.envelope.max.x+=8;this.envelope.min.y=Math.min(this.envelope.min.y,support-.2);
 }
 substation(){
  const b=this.model.bounds('transformer'),size=b.getSize(new T.Vector3()),c=b.getCenter(new T.Vector3());
  const pixels=new Uint8Array(64*64*4);for(let y=0;y<64;y++)for(let x=0;x<64;x++){const n=(y*64+x)*4,r=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5);pixels[n]=pixels[n+1]=pixels[n+2]=255;pixels[n+3]=255*Math.max(0,1-r)**2;}
  const map=new T.DataTexture(pixels,64,64);map.needsUpdate=true;this.textures.add(map);
  for(let i=0;i<7;i++){const material=new T.SpriteMaterial({map,color:'#626760',transparent:true,opacity:0,depthWrite:false});this.materials.add(material);const o=new T.Sprite(material);this.root.add(o);o.position.set(c.x+(i%3-1)*size.x*.16,b.max.y,c.z);this.smoke.push({o,x:o.position.x,y:o.position.y,z:o.position.z,i});}
  this.envelope.max.y+=1;
  this.cooling225(map);
 }
 // Fenómenos 225: what physically happens in the transformer when forced ventilation is lost.
 // Cooling air rising through the windings from fans below them, the fans running down, the
 // air turning into slow warm convection, the windings heating, and the protection opening
 // with a brief spark at the terminals. Everything is driven by the absolute sample, so seeking,
 // pausing and display rate give the same picture. Sober, study-scene effects; not a solver.
 cooling225(map){
  const fx=this.fx225={root:new T.Group(),fans:[],coils:[]};fx.root.name='Fenómenos de ventilación225';this.root.add(fx.root);
  // Winding materials heat up: dull red emissive, stronger only in the unprotected hypothesis.
  for(const row of this.model.rows)if(row.part==='transformer'&&/resina|devanado|bobina/i.test(row.material.name)&&row.material.emissive)fx.coils.push({material:row.material,emissive:row.material.emissive.clone(),intensity:row.material.emissiveIntensity});
  // Effects anchor to the windings themselves, not to the enclosure around them.
  const coilMaterials=new Set(fx.coils.map(c=>c.material)),box=new T.Box3();this.model.targets.get('transformer')?.traverse(o=>{if(o.isMesh&&(Array.isArray(o.material)?o.material:[o.material]).some(m=>coilMaterials.has(m)))box.union(new T.Box3().setFromObject(o));});
  if(box.isEmpty())box.copy(this.model.bounds('transformer'));
  const size=box.getSize(new T.Vector3()),c=box.getCenter(new T.Vector3());Object.assign(fx,{box,size,center:c});
  // The cabinet is open on its -z face (where the study camera looks from), and the winding block is wide along x and thin along z.
  // Air: streaks rising through the winding ducts and just in front of them, drawn as thin
  // instanced bars so they keep a visible width at any distance.
  const count=300,seeds=[];for(let i=0;i<count;i++){const h=Math.sin(i*12.9898)*43758.5453,r=h-Math.floor(h),h2=Math.sin(i*78.233)*12345.678,r2=h2-Math.floor(h2),h3=Math.sin(i*39.425)*24634.6345,r3=h3-Math.floor(h3);seeds.push({x:r2-.5,depth:i%3?r3*.35:.35+r3*.65,phase:r});}
  // Each seed is a soft trail of four glowing motes (additive, so dimmer motes read as thinner
  // air): a light haze rather than solid bars.
  const TRAIL=4,air=new T.BufferGeometry();air.setAttribute('position',new T.BufferAttribute(new Float32Array(count*TRAIL*3),3));air.setAttribute('color',new T.BufferAttribute(new Float32Array(count*TRAIL*3),3));this.geometry.add(air);
  const airMaterial=new T.PointsMaterial({size:.13,map,vertexColors:true,transparent:true,opacity:1,depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true});this.materials.add(airMaterial);
  fx.air=new T.Points(air,airMaterial);fx.air.frustumCulled=false;fx.air.name='Aire de refrigeración225';fx.root.add(fx.air);fx.seeds=seeds;fx.trail=TRAIL;
  // Two axial fans at the foot of the windings on the open side, blowing in under them; the
  // air then turns and rises through the winding ducts.
  const radius=Math.min(.26,size.x*.12),blade=new T.BoxGeometry(radius*.34,radius*.86,radius*.05);blade.translate(0,radius*.47,0);this.geometry.add(blade);
  for(const k of [-1,1]){const fan=new T.Group();fan.position.set(c.x+k*size.x*.27,box.min.y+radius*.55,box.min.z-.16);fx.root.add(fan);
   this.mesh(new T.TorusGeometry(radius,radius*.08,8,28),'#2f3539',fan,{metalness:.4,roughness:.5});
   this.mesh(new T.RingGeometry(radius*.2,radius,20,1),'#1d2124',fan,{transparent:true,opacity:.3,side:T.DoubleSide}).position.z=.02;
   const rotor=new T.Group();fan.add(rotor);for(let j=0;j<5;j++){const m=this.mesh(blade,'#5d676f',rotor,{metalness:.3,roughness:.55});m.rotation.z=j*Math.PI*2/5;m.rotation.y=.4;}
   this.mesh(new T.CylinderGeometry(radius*.17,radius*.17,radius*.16,16),'#1f2326',rotor).rotation.x=Math.PI/2;fx.fans.push(rotor);}
  // Sparks and a flash at the terminals above the windings when the protection opens.
  const sparkCount=48,spark=new T.BufferGeometry();spark.setAttribute('position',new T.BufferAttribute(new Float32Array(sparkCount*3),3));this.geometry.add(spark);
  const sparkMaterial=new T.PointsMaterial({size:.09,map,color:'#ffd27a',transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});this.materials.add(sparkMaterial);
  fx.sparks=new T.Points(spark,sparkMaterial);fx.sparks.frustumCulled=false;fx.sparks.name='Chispa de apertura225';fx.root.add(fx.sparks);
  fx.sparkSeeds=Array.from({length:sparkCount},(_,i)=>{const a=i*2.399,u=(i*.618)%1;return {dx:Math.cos(a)*(.3+u),dz:Math.sin(a)*(.3+u),up:.6+((i*.37)%1)};});
  const top=this.model.bounds('transformer');fx.terminal=new T.Vector3(c.x+size.x*.25,box.max.y+.12,box.min.z-.05);
  const coreMaterial=new T.SpriteMaterial({map,color:'#cfe6ff',transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});this.materials.add(coreMaterial);fx.arc=new T.Sprite(coreMaterial);fx.arc.scale.setScalar(.45);fx.arc.position.copy(fx.terminal);fx.root.add(fx.arc);
  fx.flash=new T.PointLight('#ffcf8a',0,4,1.5);fx.flash.position.copy(fx.terminal);fx.root.add(fx.flash);
 }
 coolingApply225(sample){
  const fx=this.fx225;if(!fx)return;const active=sample.scenario?.id==='sr-cooling';fx.root.visible=active;
  for(const coil of fx.coils){coil.material.emissive.copy(coil.emissive);coil.material.emissiveIntensity=coil.intensity;}
  if(!active)return;
  // The physical effects now carry the heat; the flat amber false colour would wash them out.
  this.model.tint('',0);
  const a=sample.outcome,p=sample.progress,flow=sample.signals.flow??0,heat=sample.signals.heat??0,flowTravel=a.fanAngle/(Math.PI*64),{box,size,center}=fx;
  for(const fan of fx.fans)fan.rotation.z=a.fanAngle*1.6;
  // Forced air rises fast and cool; with the fans stopped only a slow warm draught remains.
  const cool=new T.Color('#7fc1ff'),warm=new T.Color('#ff9a55'),tint=cool.clone().lerp(warm,T.MathUtils.smoothstep(heat,.3,.85)*(1-flow*.8));
  const natural=.09*T.MathUtils.smoothstep(heat,.25,.9),climb=flowTravel*9+p*16*natural,len=size.y*(.05+.12*flow+.07*natural),y0=box.min.y-.05,span=size.y+.4;
  const strength=.45+.85*Math.max(flow,.7*T.MathUtils.smoothstep(heat,.3,.8)),pos=fx.air.geometry.attributes.position,col=fx.air.geometry.attributes.color,n=fx.trail;
  fx.seeds.forEach((s,i)=>{const t=(s.phase+climb)%1,fade=Math.sin(Math.PI*t)*strength;for(let k=0;k<n;k++){const back=k/(n-1),y=y0+span*t-len*back,sway=Math.sin((t-back*.02)*9+i)*.025*(1-flow),j=i*n+k,f=fade*(1-back*.75);pos.setXYZ(j,center.x+s.x*size.x*1.02+sway,y,box.min.z-.04+s.depth*size.z);col.setXYZ(j,tint.r*f,tint.g*f,tint.b*f);}});
  pos.needsUpdate=true;col.needsUpdate=true;
  // Heating: subtle under protection, glowing when the hypothesis says the protection does not act.
  const glow=T.MathUtils.smoothstep(heat,.45,.95)*(a.unprotected?1.8:.45);
  for(const coil of fx.coils){coil.material.emissive.set('#ff4d17');coil.material.emissiveIntensity=glow;}
  // Opening: a half-second burst of sparks and a flash at the terminals (not in the unprotected case).
  const burst=a.unprotected?0:T.MathUtils.clamp((p-.75)/.05,0,1),live=burst>0&&burst<1;
  fx.sparks.visible=live;fx.arc.visible=live;fx.arc.material.opacity=live?Math.max(0,1-burst*2.6):0;fx.flash.intensity=live?Math.max(0,1-burst*1.4)*14:0;
  if(live){const sp=fx.sparks.geometry.attributes.position,r=.35;fx.sparkSeeds.forEach((q,i)=>{const t=burst*(.6+(i%5)*.1);sp.setXYZ(i,fx.terminal.x+q.dx*r*t,fx.terminal.y+q.up*r*t-1.6*r*t*t,fx.terminal.z+q.dz*r*t);});sp.needsUpdate=true;fx.sparks.material.opacity=1-burst;}
 }
 apply(sample){
  const a=sample.outcome;this.model.root.position.copy(this.basePosition);if(this.domain==='train')this.model.root.position.x+=a.distance;
  for(const d of this.doors)d.pivot.position.x=d.x+d.sign*.52*a.doorOpening;
  for(const w of this.wheels)w.pivot.rotation.z=-a.wheelDistance/w.radius;
  for(const {o,x,y,z,i}of this.smoke){o.visible=a.damage>.02;const rise=(sample.progress*3+i/7)%1;o.position.set(x+Math.sin(i+sample.progress*9)*.15,y+rise*.85,z);o.scale.setScalar(.4+rise*.9);o.material.opacity=a.damage*(1-rise)*.55;}
  this.coolingApply225(sample);
  if(a.damage)for(const row of this.model.rows)if(row.part==='transformer'&&row.base&&/resina|aislamiento/i.test(row.material.name))row.material.color.multiplyScalar(1-a.damage*.72);
  this.model.root.updateMatrixWorld(true);
 }
 bounds(part){if(part==='doors'&&this.doors.length){const box=new T.Box3();for(const d of this.doors)box.union(new T.Box3().setFromObject(d.pivot));return box;}return part?this.model.bounds(part):this.envelope.clone();}
 dispose(){
  this.model.root.position.copy(this.basePosition);for(const r of this.restore){r.parent.add(r.o);r.o.matrix.copy(r.matrix);}for(const p of this.pivots)p.removeFromParent();
  for(const coil of this.fx225?.coils||[]){coil.material.emissive.copy(coil.emissive);coil.material.emissiveIntensity=coil.intensity;}
  for(const w of this.wheels)w.mark.removeFromParent();this.root.removeFromParent();for(const g of this.geometry)g.dispose();for(const m of this.materials)m.dispose();for(const t of this.textures)t.dispose();this.model.tint('',0);this.model.root.updateMatrixWorld(true);
 }
}

// The GLB batches electrical contacts and fan internals with other equipment.
// This labelled functional detail shows their motion without falsifying meshes.
export function createConsequence218(host){
 host.innerHTML=`<h3>Respuesta observable · detalle funcional esquemático</h3><svg viewBox="0 0 640 160" role="img" aria-label="Animación de la consecuencia del fallo"><g data-kind="electrical"><g transform="translate(70 70)"><circle r="31" fill="none"/><g data-fan><path d="M0-25Q30-20 5 0Q25 25 0 6Q-30 25-6 0Q-25-25 0-6Z" fill="#697c73"/></g><circle r="5" fill="#222"/></g><text x="18" y="125" data-fan-label></text><path d="M150 70H240M300 70H365"/><circle cx="240" cy="70" r="4"/><circle cx="300" cy="70" r="4"/><path data-contact d="M240 70H300" stroke-width="5"/><text x="180" y="125" data-contact-label></text><g data-winding><rect x="395" y="32" width="80" height="75" rx="6" fill="#bd6f43"/><path d="M410 35V104M425 35V104M440 35V104M455 35V104"/></g><text x="385" y="145" data-damage-label></text></g><g data-kind="battery"><path d="M35 35H130V105H35Z M150 70H265"/><text x="42" y="140" data-charger-label></text><rect x="275" y="30" width="245" height="80" fill="none"/><rect data-reserve x="282" y="37" width="230" height="66" fill="#819a8a"/><text x="280" y="140">Reserva bajo consumo supuesto</text><path data-charger-line d="M40 65H125" stroke-width="4"/></g><g data-kind="train"><path d="M10 125H625" stroke="#9ba69f"/><g data-car><rect x="30" y="20" width="180" height="80" rx="8" fill="#e3b16a"/><rect x="48" y="32" width="35" height="28" fill="#dce8e3"/><rect x="162" y="32" width="32" height="28" fill="#dce8e3"/><rect x="101" y="28" width="38" height="70" fill="#1b3029"/><rect data-door-left x="101" y="28" width="19" height="70" fill="#cad1cb"/><rect data-door-right x="120" y="28" width="19" height="70" fill="#cad1cb"/><g transform="translate(65 107)"><circle r="17" fill="#fff"/><path data-wheel-a d="M-14 0H14M0-14V14"/></g><g transform="translate(178 107)"><circle r="17" fill="#fff"/><path data-wheel-b d="M-14 0H14M0-14V14"/></g></g><g data-air-detail><rect x="300" y="25" width="65" height="45" fill="#c7d5ca"/><path d="M310 48H353"/><rect data-piston x="323" y="32" width="9" height="32" fill="#5e7569"/><rect x="400" y="25" width="180" height="45"/><rect data-air-reserve x="405" y="30" width="170" height="35" fill="#8da99a"/><text x="285" y="98">Compresor / reserva esquemáticos</text></g><text x="18" y="153" data-motion-label></text></g></svg><p data-result role="status"></p><small>Movimiento de exhibición: no representa metros, tiempos de avería, distancia de frenado ni una reconstrucción certificada del equipo.</small>`;
 const q=s=>host.querySelector(s),groups=[...host.querySelectorAll('[data-kind]')];let last='';
 return {apply(sample){const a=sample.outcome,id=sample.scenario.id,kind=sample.scenario.domain==='train'?'train':id==='sr-charger'?'battery':'electrical';
  for(const g of groups)g.style.display=g.dataset.kind===kind?'':'none';
  q('[data-fan]').setAttribute('transform',`rotate(${a.fanAngle*180/Math.PI})`);q('[data-fan-label]').textContent=id==='sr-feeder'?'Detalle de contactos':a.fanRunning?'Ventilador girando':'Ventilador detenido';q('[data-fan]').parentElement.style.display=id==='sr-feeder'?'none':'';
  q('[data-contact]').setAttribute('transform',`rotate(${-38*a.breakerOpening} 240 70)`);q('[data-contact-label]').textContent=a.breakerOpen?'Protección ABIERTA':'Protección cerrada';q('[data-winding]').style.display=id==='sr-feeder'?'none':'';q('[data-winding] rect').setAttribute('fill',a.damage>.1?'#51453b':'#bd6f43');q('[data-damage-label]').textContent=a.damage>.1?'Daño potencial · hipótesis':'Equipo íntegro en este caso';
  q('[data-reserve]').setAttribute('width',230*(sample.signals.reserve??1));q('[data-charger-line]').style.display=sample.signals.charger===0?'none':'';q('[data-charger-label]').textContent=sample.signals.charger===0?'Cargador detenido':'Cargador activo';
  q('[data-car]').setAttribute('transform',`translate(${a.distance*48} 0)`);q('[data-door-left]').setAttribute('transform',`translate(${-18*a.doorOpening} 0)`);q('[data-door-right]').setAttribute('transform',`translate(${18*a.doorOpening} 0)`);for(const [selector,x]of [['[data-wheel-a]',0],['[data-wheel-b]',0]])q(selector).setAttribute('transform',`rotate(${-a.wheelDistance*220} ${x} 0)`);
  q('[data-air-detail]').style.display=id==='train-air'?'':'none';q('[data-piston]').setAttribute('transform',`translate(${Math.sin(a.compressorAngle)*15} 0)`);q('[data-air-reserve]').setAttribute('width',170*(sample.signals.reserve??1));q('[data-motion-label]').textContent=a.sliding?'DESLIZAMIENTO: carro avanza, ruedas bloqueadas':a.moving?'RODADURA: carro avanza y ruedas giran':'TREN INMÓVIL';if(last!==a.result){q('[data-result]').textContent=a.result;last=a.result;}
 }};
}
