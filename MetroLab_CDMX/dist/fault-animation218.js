import * as T from 'three';

// Only the isolated study clone is articulated. Shared GLB buffers stay intact.
export class FaultAnimation218{
 constructor(model,domain,scene){
  this.model=model;this.domain=domain;this.scene=scene;this.root=new T.Group();this.root.name='Detalle ilustrativo de consecuencias218';scene.add(this.root);
  this.geometry=new Set();this.materials=new Set();this.textures=new Set();this.restore=[];this.pivots=[];this.doors=[];this.wheels=[];this.smoke=[];this.basePosition=model.root.position.clone();
  this.envelope=model.bounds().clone();this.initialBounds=this.envelope.clone();
  if(domain==='train')this.train();else this.substation();
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
 }
 apply(sample){
  const a=sample.outcome;this.model.root.position.copy(this.basePosition);if(this.domain==='train')this.model.root.position.x+=a.distance;
  for(const d of this.doors)d.pivot.position.x=d.x+d.sign*.52*a.doorOpening;
  for(const w of this.wheels)w.pivot.rotation.z=-a.wheelDistance/w.radius;
  for(const {o,x,y,z,i}of this.smoke){o.visible=a.damage>.02;const rise=(sample.progress*3+i/7)%1;o.position.set(x+Math.sin(i+sample.progress*9)*.15,y+rise*.85,z);o.scale.setScalar(.4+rise*.9);o.material.opacity=a.damage*(1-rise)*.55;}
  if(a.damage)for(const row of this.model.rows)if(row.part==='transformer'&&row.base&&/resina|aislamiento/i.test(row.material.name))row.material.color.multiplyScalar(1-a.damage*.72);
  this.model.root.updateMatrixWorld(true);
 }
 bounds(part){if(part==='doors'&&this.doors.length){const box=new T.Box3();for(const d of this.doors)box.union(new T.Box3().setFromObject(d.pivot));return box;}return part?this.model.bounds(part):this.envelope.clone();}
 dispose(){
  this.model.root.position.copy(this.basePosition);for(const r of this.restore){r.parent.add(r.o);r.o.matrix.copy(r.matrix);}for(const p of this.pivots)p.removeFromParent();
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
