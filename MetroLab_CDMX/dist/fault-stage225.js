import * as T from 'three';

// Fenómenos 225: a reference floor for the fault study scene. Polished concrete with saw-cut
// joints every 1.5 m and a yellow safety line around the studied equipment, soft contact
// shadows under each assembly, and fog that blends the floor into the room tone, so equipment
// stands on the ground instead of floating on a flat background. Owns and frees its resources.
const ROOM225='#c9cdca',JOINT225=1.5;
function concreteTexture225(){
 const size=512,canvas=globalThis.document?.createElement?.('canvas');if(!canvas)return null;canvas.width=canvas.height=size;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#9a9d99';ctx.fillRect(0,0,size,size);
 // Deterministic aggregate speckle and soft trowel clouds.
 let seed=225;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 for(let i=0;i<70;i++){const x=rnd()*size,y=rnd()*size,r=40+rnd()*120,g=ctx.createRadialGradient(x,y,0,x,y,r),l=rnd()<.5?255:0;g.addColorStop(0,`rgba(${l},${l},${l},${.035+rnd()*.03})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
 for(let i=0;i<9000;i++){const l=rnd()<.5?40+rnd()*40:170+rnd()*60;ctx.fillStyle=`rgba(${l},${l},${l},${.10+rnd()*.18})`;ctx.fillRect(rnd()*size,rnd()*size,1+rnd()*1.4,1+rnd()*1.4);}
 // Saw-cut joint on two edges of the tile: one tile spans one joint module.
 ctx.fillStyle='rgba(40,42,40,.55)';ctx.fillRect(0,0,size,2);ctx.fillRect(0,0,2,size);ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(0,2,size,1);ctx.fillRect(2,0,1,size);
 const texture=new T.CanvasTexture(canvas);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;return texture;
}
function blobTexture225(){
 const w=128,h=128,data=new Uint8Array(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const a=Math.abs(x/(w-1)*2-1),b=Math.abs(y/(h-1)*2-1),d=Math.max(Math.pow(a,4)+Math.pow(b,4),0)**.25;data[(y*w+x)*4+3]=Math.round(255*Math.max(0,1-d)**1.6);}
 const t=new T.DataTexture(data,w,h);t.needsUpdate=true;return t;
}
export class FaultStage225{
 constructor(scene){
  this.scene=scene;this.root=new T.Group();this.root.name='Piso de referencia225';scene.add(this.root);this.owned=[];
  scene.background=new T.Color(ROOM225);this.priorFog=scene.fog;scene.fog=new T.Fog(ROOM225,18,60);
  const map=concreteTexture225(),size=120;if(map){map.repeat.set(size/JOINT225,size/JOINT225);this.owned.push(map);}
  const floorMaterial=new T.MeshStandardMaterial({color:map?'#ffffff':'#9a9d99',map,roughness:.62,metalness:0,envMapIntensity:.55});
  const floorGeometry=new T.PlaneGeometry(size,size);this.owned.push(floorMaterial,floorGeometry);
  this.floor=new T.Mesh(floorGeometry,floorMaterial);this.floor.rotation.x=-Math.PI/2;this.floor.name='Piso de concreto pulido225';this.floor.renderOrder=-1;this.root.add(this.floor);
  this.blob=blobTexture225();this.owned.push(this.blob);
  this.shadowMaterial=new T.MeshBasicMaterial({color:'#101413',map:this.blob,transparent:true,opacity:.5,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});this.owned.push(this.shadowMaterial);
  this.lineMaterial=new T.MeshStandardMaterial({color:'#d9b13b',roughness:.55});this.owned.push(this.lineMaterial);
  this.decor=new T.Group();this.root.add(this.decor);
 }
 // Place the floor under the given boxes (one per assembly) and add their contact shadows and
 // a safety line around the focus box.
 fit(boxes,focus){
  for(const o of [...this.decor.children]){o.removeFromParent();o.geometry?.dispose();}
  const all=new T.Box3();for(const b of boxes)if(!b.isEmpty())all.union(b);if(all.isEmpty())return;
  const y=all.min.y-.002;this.floor.position.set((all.min.x+all.max.x)/2,y,(all.min.z+all.max.z)/2);
  for(const b of boxes){if(b.isEmpty())continue;const s=b.getSize(new T.Vector3()),c=b.getCenter(new T.Vector3());const g=new T.PlaneGeometry(s.x*1.18+.25,s.z*1.18+.25),m=new T.Mesh(g,this.shadowMaterial);m.rotation.x=-Math.PI/2;m.position.set(c.x,y+.003,c.z);m.name='Sombra de contacto225';this.decor.add(m);}
  if(focus&&!focus.isEmpty()){const s=focus.getSize(new T.Vector3()),c=focus.getCenter(new T.Vector3()),pad=.45,w=.07,W=s.x+pad*2,D=s.z+pad*2;
   for(const [sx,sz,x,z] of [[W,w,0,-D/2],[W,w,0,D/2],[w,D,-W/2,0],[w,D,W/2,0]]){const g=new T.BoxGeometry(sx,.004,sz),m=new T.Mesh(g,this.lineMaterial);m.position.set(c.x+x,y+.002,c.z+z);m.name='Línea de seguridad225';this.decor.add(m);}}
 }
 dispose(){for(const o of [...this.decor.children])o.geometry?.dispose();this.root.removeFromParent();for(const r of this.owned)r.dispose();this.scene.fog=this.priorFog??null;}
}

// Smooth camera moves for the study view: positions and target ease over a short time instead
// of jumping. Driven by absolute time from the render loop.
export function cameraTween225(camera,controls,toPosition,toTarget,now,duration=650){
 return {from:camera.position.clone(),fromTarget:controls.target.clone(),to:toPosition.clone(),toTarget:toTarget.clone(),start:now,duration,
  step(t){const u=Math.min(1,Math.max(0,(t-this.start)/this.duration)),e=u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;camera.position.lerpVectors(this.from,this.to,e);controls.target.lerpVectors(this.fromTarget,this.toTarget,e);return u<1;}};
}
