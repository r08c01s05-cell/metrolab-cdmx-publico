import * as T from 'three';

// Ventilación 230: a dry-type transformer cooled by three cross-flow (tangential) blowers, one
// under each coil, blowing up through the winding ducts (as in manufacturers' forced-ventilation
// kits). The practice now works on the centre blower: its front guard grille is unscrewed,
// carried to the mat, brushed and refitted. The old wall-type filter module is hidden; the
// mission targets keep their keys and API, only their geometry and positions change.

// Bench is mounted at (-1.85,.67,.72) with scale .62 (installed-service150). Local = (world - mount)/scale.
const MOUNT230=[-1.85,.67,.72],SCALE230=.62,local=(x,y,z)=>new T.Vector3((x-MOUNT230[0])/SCALE230,(y-MOUNT230[1])/SCALE230,(z-MOUNT230[2])/SCALE230);
export const BLOWERS230=[-2.56,-1.85,-1.13].map(x=>({x,y:.55,z:1.36,length:.56,radius:.07}));
// Round axial fans of the original model, removed by triangle region (world coordinates).
export const ROUND_FANS230=[-2.75,-.95].map(x=>({min:[x-.19,.33,1.1],max:[x+.19,.69,1.31]}));
const ROUND_FAN_MATERIALS230=/SR126 Acero cepillado|SR126 Panel grafito|Acero satinado SR134/;

function mats230(){
 return {housing:new T.MeshStandardMaterial({name:'Carcasa pintada del soplador230',color:'#2c3236',metalness:.35,roughness:.55}),
  inner:new T.MeshStandardMaterial({name:'Interior del soplador230',color:'#15191b',metalness:.2,roughness:.8,side:T.DoubleSide}),
  blade:new T.MeshStandardMaterial({name:'Álabes de aluminio230',color:'#a7b0b3',metalness:.75,roughness:.35}),
  motor:new T.MeshStandardMaterial({name:'Motor del soplador230',color:'#3e4a52',metalness:.45,roughness:.45}),
  grille:new T.MeshStandardMaterial({name:'Rejilla de acero230',color:'#8f999c',metalness:.7,roughness:.4}),
  dust:new T.MeshStandardMaterial({name:'Polvo acumulado230',color:'#8c7a5e',roughness:.98}),
  label:new T.MeshStandardMaterial({name:'Placa de datos230',color:'#d9d6c8',roughness:.6})};
}
// Squirrel-cage impeller along x: two end discs and many forward-curved blades.
function impeller230(length,radius,m){
 const g=new T.Group(),blade=new T.BoxGeometry(length*.96,radius*.32,radius*.04);
 for(let i=0;i<28;i++){const a=i/28*Math.PI*2,b=new T.Mesh(blade,m.blade);b.position.set(0,Math.cos(a)*radius*.78,Math.sin(a)*radius*.78);b.rotation.x=-a+.55;g.add(b);}
 for(const x of [-.5,0,.5]){const d=new T.Mesh(new T.CylinderGeometry(radius*.95,radius*.95,radius*.06,28),m.blade);d.rotation.z=Math.PI/2;d.position.x=x*length*.96;g.add(d);}
 const shaft=new T.Mesh(new T.CylinderGeometry(radius*.09,radius*.09,length*1.05,12),m.motor);shaft.rotation.z=Math.PI/2;g.add(shaft);
 return g;
}
// Scroll housing open toward -z (the guard side) with a discharge slot on top.
function housing230(length,radius,m){
 const g=new T.Group(),shell=new T.Mesh(new T.CylinderGeometry(radius*1.18,radius*1.18,length,32,1,true,Math.PI*.15,Math.PI*1.45),m.inner);shell.rotation.z=Math.PI/2;g.add(shell);
 const outer=new T.Mesh(new T.CylinderGeometry(radius*1.24,radius*1.24,length,32,1,true,Math.PI*.15,Math.PI*1.45),m.housing);outer.rotation.z=Math.PI/2;g.add(outer);
 for(const s of [-1,1]){const cap=new T.Mesh(new T.CylinderGeometry(radius*1.26,radius*1.26,radius*.08,32),m.housing);cap.rotation.z=Math.PI/2;cap.position.x=s*length/2;g.add(cap);}
 const slot=new T.Mesh(new T.BoxGeometry(length,radius*.5,radius*1.1),m.housing);slot.position.set(0,radius*1.35,radius*.35);g.add(slot);
 const motor=new T.Mesh(new T.CylinderGeometry(radius*.62,radius*.62,radius*1.5,24),m.motor);motor.rotation.z=Math.PI/2;motor.position.x=length/2+radius*.8;g.add(motor);
 const plate=new T.Mesh(new T.PlaneGeometry(radius*.9,radius*.45),m.label);plate.position.set(length*.32,-radius*.3,-radius*1.25);plate.rotation.y=Math.PI;g.add(plate);
 return g;
}
// Guard grille: frame and horizontal slats, facing -z.
function grille230(width,height,m,dust){
 const g=new T.Group(),bar=(w,h,x,y)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,.012),m.grille);o.position.set(x,y,0);g.add(o);return o;};
 bar(width,height*.08,0,height/2);bar(width,height*.08,0,-height/2);bar(height*.08,height,width/2,0);bar(height*.08,height,-width/2,0);
 for(let i=1;i<7;i++){const s=bar(width*.97,height*.035,0,-height/2+i*height/7);s.rotation.x=.5;}
 for(let i=0;i<18;i++){const d=new T.Mesh(new T.BoxGeometry(width*(.05+((i*.37)%1)*.06),height*.12,.006),m.dust);d.name='Polvo de la rejilla230';d.position.set(-width*.44+(i%9)*width*.11,(i<9?.18:-.12)*height,-.01);g.add(d);dust.push(d);}
 return g;
}

// Remove the two round axial fans from the substation model, once.
export function stripRoundFans230(model){
 if(!model||model.userData.roundFans230)return 0;model.userData.roundFans230=true;let removed=0;const a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();
 model.updateMatrixWorld(true);
 model.traverse(o=>{
  if(!o.isMesh||!ROUND_FAN_MATERIALS230.test(o.material?.name||''))return;const g=o.geometry,pos=g.attributes.position;if(!pos)return;
  const idx=g.index?Array.from(g.index.array):Array.from({length:pos.count},(_,i)=>i),keep=[];
  for(let t=0;t<idx.length;t+=3){a.fromBufferAttribute(pos,idx[t]).applyMatrix4(o.matrixWorld);b.fromBufferAttribute(pos,idx[t+1]).applyMatrix4(o.matrixWorld);c.fromBufferAttribute(pos,idx[t+2]).applyMatrix4(o.matrixWorld);a.add(b).add(c).multiplyScalar(1/3);
   const inside=ROUND_FANS230.some(r=>a.x>r.min[0]&&a.x<r.max[0]&&a.y>r.min[1]&&a.y<r.max[1]&&a.z>r.min[2]&&a.z<r.max[2]);if(inside)removed++;else keep.push(idx[t],idx[t+1],idx[t+2]);}
  if(keep.length!==idx.length){const next=g.clone();next.setIndex(keep);o.geometry=next;}
 });
 return removed;
}

export function crossflowVentilation230(bench){
 const legacy230=[];
 const group=bench.group,targets=bench.targets,m=mats230(),dust=[],owned=[];
 // Hide the wall-type filter module (housing, fixed plate, duct interior), keep instruments.
 const keep=new Set([...targets.values()]);
 group.traverse(o=>{if(!o.isMesh)return;for(let p=o;p&&p!==group;p=p.parent){if(keep.has(p)||/instrument|Instrumento|anemometer|anemómetro/i.test(p.name))return;}o.visible=false;o.raycast=()=>{};});
 const root=new T.Group();root.name='Ventilación de flujo cruzado230';group.add(root);
 const blowers=BLOWERS230.map((w,i)=>{const p=local(w.x,w.y,w.z),L=w.length/SCALE230,R=w.radius/SCALE230,unit=new T.Group();unit.name='Soplador de flujo cruzado '+(i+1)+'230';unit.position.copy(p);root.add(unit);
  unit.add(housing230(L,R,m));const rotor=impeller230(L,R,m);unit.add(rotor);
  // Fixed guards on the side blowers.
  if(i!==1){const guard=grille230(L*.98,R*2,m,[]);guard.position.z=-R*1.3;unit.add(guard);}
  return {unit,rotor,L,R};});
 const centre=blowers[1],c=centre.unit.position;
 // Rebuild the mission targets on the centre blower.
 const clear=t=>{for(const ch of [...t.children]){if(/Vástago|Rosca|Tornillo|Cabeza|Ranura|tornillo|screw/i.test(ch.name)&&t.userData.srTarget128?.startsWith('screw'))continue;ch.removeFromParent();ch.traverse(o=>{o.geometry?.dispose?.();});}};
 const filter=targets.get('filter');if(filter){
  // The practice's own dust pieces (tracked by the brushing and measuring layers) are kept and
  // spread over the new grille instead of being replaced.
  legacy230.length=0;const legacy=legacy230;filter.traverse(o=>{if(o!==filter&&/^sr134_dust/.test(o.name))legacy.push(o);});
  clear(filter);filter.position.set(c.x,c.y,c.z-centre.R*1.32);filter.rotation.set(0,0,0);filter.add(grille230(centre.L*.98,centre.R*2,m,dust));const face=new T.Mesh(new T.PlaneGeometry(centre.L*.98,centre.R*2),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false,side:T.DoubleSide}));face.name='Superficie de toma de la rejilla230';face.rotation.y=Math.PI;face.position.z=.004;filter.add(face);owned.push(face.material);
  legacy.forEach((d,i)=>{const cols=Math.max(1,Math.ceil(legacy.length/2));d.removeFromParent();d.position.set(-centre.L*.42+(i%cols)*(centre.L*.84/Math.max(1,cols-1||1)),(i<cols?.35:-.3)*centre.R,-.012);d.rotation.set(0,0,0);filter.add(d);});
 }
 for(const [key,sx,sy] of [['screwL',-1,1],['screwR',1,1],['screw3',-1,-1],['screw4',1,-1]]){const s=targets.get(key);if(s){s.position.set(c.x+sx*(centre.L*.49+.035),c.y+sy*(centre.R*.82),c.z-centre.R*1.36);s.rotation.set(0,0,0);s.scale.setScalar(.75);}}
 // Fixed front flange of the centre blower: the captive screws seat on it.
 const flangeZ=c.z-centre.R*1.36,flange=new T.Group(),R=centre.R,L=centre.L;flange.name='Brida frontal del soplador central230';flange.userData.fastenerSupport196=true;flange.position.set(c.x,c.y,flangeZ+.01);group.add(flange);
 // A frame around the opening, so the impeller stays visible and reachable through it.
 for(const [w,h,x,y] of [[L+.16,R*.5,0,R*.88],[L+.16,R*.5,0,-R*.88],[.1,R*2.26,-(L/2+.03),0],[.1,R*2.26,L/2+.03,0]]){const bar=new T.Mesh(new T.BoxGeometry(w,h,.02),m.housing);bar.position.set(x,y,0);bar.name='Brida frontal del soplador central230';flange.add(bar);}
 const fan=targets.get('fan');if(fan){clear(fan);fan.position.copy(c);fan.rotation.set(0,0,0);// The measuring point is the discharge slot on top, reachable above the guard grille.
 const hit=new T.Mesh(new T.BoxGeometry(centre.L,centre.R*.95,centre.R*2.35),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false}));hit.renderOrder=-1;hit.position.set(0,centre.R*1.42,-centre.R*.17);hit.name='Salida de aire del soplador230';fan.add(hit);centre.unit.remove(centre.rotor);fan.add(centre.rotor);}
 for(const mat of Object.values(m))owned.push(mat);if(fan)owned.push(fan.getObjectByName('Salida de aire del soplador230')?.material);
 // Homes are captured by the bench before this runs: refresh them to the new positions.
 if(bench.homes136)for(const [k,t] of targets)bench.homes136.set(k,t.position.clone());
 group.userData.crossflow230={blowers,dust};
 // Behaviour: dust follows cleaning; side blowers run during the whole practice except while the
 // centre one is out of service; the centre impeller runs slowly (clogged) and at full speed after the test.
 let state='clogged';const apply=bench.apply.bind(bench),update=bench.update.bind(bench),dispose=bench.dispose.bind(bench);
 bench.apply=(s,result)=>{apply(s,result);syncDust();if(!result?.ok)return;const e=result.effect;if(e==='loosenL')state='stopped';if(e==='test')state='running';};
 const syncDust=()=>{const k=legacy230.length?Math.min(...legacy230.map(d=>d.scale.x)):null;if(k!==null)for(const d of dust)d.scale.setScalar(k);};
 bench.update=dt=>{update(dt);syncDust();const step=Math.min(dt,.1);for(const [i,b] of blowers.entries()){const speed=i===1?(state==='running'?22:state==='clogged'?6:0):16;b.rotor.rotation.x+=step*speed;}};
 bench.dispose=()=>{for(const mat of owned)mat.dispose();for(const g of [root,flange])g.traverse(o=>o.geometry?.dispose?.());dispose();};
 bench.crossflow230=true;return bench;
}
