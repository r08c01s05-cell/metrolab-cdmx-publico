import * as T from 'three';

// Fenómenos 225: a reference floor for the fault study scene. Polished concrete with saw-cut
// joints every 1.5 m and a yellow safety line around the studied equipment, soft contact
// shadows under each assembly, and fog that blends the floor into the room tone, so equipment
// stands on the ground instead of floating on a flat background. Owns and frees its resources.
const ROOM225='#c9cdca',JOINT225=1.5;
function concreteTexture225(){
 const size=512,canvas=globalThis.document?.createElement?.('canvas');if(!canvas)return null;canvas.width=canvas.height=size;
 const ctx=canvas.getContext?.('2d');if(!ctx?.createRadialGradient?.(0,0,0,0,0,1)?.addColorStop)return null;ctx.fillStyle='#9a9d99';ctx.fillRect(0,0,size,size);
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

// Fenómenos 229: painted concrete block for the room walls (running bond 0.40 x 0.20 m).
function blockTexture229(){
 const w=512,h=512,canvas=globalThis.document?.createElement?.('canvas'),ctx=canvas?.getContext?.('2d');if(!ctx?.createRadialGradient?.(0,0,0,0,0,1)?.addColorStop)return null;canvas.width=w;canvas.height=h;
 ctx.fillStyle='#d7d9d2';ctx.fillRect(0,0,w,h);let seed=229;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 for(let i=0;i<5000;i++){const l=rnd()<.5?150+rnd()*40:235+rnd()*20;ctx.fillStyle=`rgba(${l},${l},${l-4},${.10+rnd()*.12})`;ctx.fillRect(rnd()*w,rnd()*h,1+rnd()*2,1+rnd()*2);}
 // 2 blocks across, 4 courses up per tile: tile = 0.80 x 0.80 m.
 ctx.strokeStyle='rgba(120,122,116,.55)';ctx.lineWidth=4;for(let r=0;r<4;r++){const y=r*h/4;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();const off=r%2?w/4:0;for(let c=0;c<3;c++){const x=off+c*w/2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+h/4);ctx.stroke();}}
 const t=new T.CanvasTexture(canvas);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t;
}
function louverTexture229(){
 const canvas=globalThis.document?.createElement?.('canvas'),ctx=canvas?.getContext?.('2d');if(!ctx?.createLinearGradient?.(0,0,0,1)?.addColorStop)return null;canvas.width=64;canvas.height=64;
 for(let i=0;i<8;i++){const g=ctx.createLinearGradient(0,i*8,0,i*8+8);g.addColorStop(0,'#c4c8c4');g.addColorStop(.6,'#7d827f');g.addColorStop(1,'#2b302e');ctx.fillStyle=g;ctx.fillRect(0,i*8,64,8);}
 const t=new T.CanvasTexture(canvas);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;return t;
}
export class FaultStage225{
 constructor(scene){
  this.scene=scene;this.root=new T.Group();this.root.name='Piso de referencia225';scene.add(this.root);this.owned=[];
  // Fenómenos 229: the equipment stands inside a room; outside it the view is a dark neutral.
  scene.background=new T.Color('#1d2422');this.priorFog=scene.fog;scene.fog=null;
  const map=concreteTexture225(),size=1;this.floorMap=map;if(map)this.owned.push(map);
  const floorMaterial=new T.MeshStandardMaterial({color:map?'#ffffff':'#9a9d99',map,roughness:.62,metalness:0,envMapIntensity:.55});
  const floorGeometry=new T.PlaneGeometry(size,size);this.owned.push(floorMaterial,floorGeometry);
  this.floor=new T.Mesh(floorGeometry,floorMaterial);this.floor.rotation.x=-Math.PI/2;this.floor.name='Piso de concreto pulido225';this.floor.renderOrder=-1;this.root.add(this.floor);
  this.blob=blobTexture225();this.owned.push(this.blob);
  this.shadowMaterial=new T.MeshBasicMaterial({color:'#101413',map:this.blob,transparent:true,opacity:.32,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});this.owned.push(this.shadowMaterial);
  this.lineMaterial=new T.MeshStandardMaterial({color:'#d9b13b',roughness:.55});this.owned.push(this.lineMaterial);
  this.decor=new T.Group();this.root.add(this.decor);
  this.room=new T.Group();this.room.name='Cuarto de equipos229';this.root.add(this.room);this.roomOwned=[];
  const block=blockTexture229(),louver=louverTexture229();for(const t of [block,louver])if(t)this.owned.push(t);
  const mat=(o)=>{const m=new T.MeshStandardMaterial({roughness:.85,metalness:0,side:T.FrontSide,...o});this.owned.push(m);return m;};
  this.mats229={wall:mat({color:block?'#ffffff':'#d7d9d2',map:block}),dado:mat({color:'#56645f',roughness:.7}),ceiling:mat({color:'#e7e8e3'}),panel:new T.MeshStandardMaterial({color:'#ffffff',emissive:'#fff6e4',emissiveIntensity:1.2,side:T.FrontSide}),door:mat({color:'#4d5c63',metalness:.35,roughness:.5}),frame:mat({color:'#2f3639',metalness:.4,roughness:.5}),louver:mat({color:louver?'#ffffff':'#8a8f8c',map:louver,metalness:.3,roughness:.5}),red:mat({color:'#b5221c',roughness:.4,metalness:.2}),tray:mat({color:'#9da3a4',metalness:.6,roughness:.4}),sign:mat({color:'#f2c230',roughness:.6}),green:mat({color:'#1e8a4c',emissive:'#1e8a4c',emissiveIntensity:.6})};this.owned.push(this.mats229.panel);
 }
 // Place the floor under the given boxes (one per assembly) and add their contact shadows and
 // a safety line around the focus box.
 fit(boxes,focus,options={}){
  for(const o of [...this.decor.children]){o.removeFromParent();o.geometry?.dispose();}
  const all=new T.Box3();for(const b of boxes)if(!b.isEmpty())all.union(b);if(all.isEmpty())return;
  const y=all.min.y-.002;this.floor.position.set((all.min.x+all.max.x)/2,y,(all.min.z+all.max.z)/2);
  this.buildRoom229(all,y,options);
  for(const b of boxes){if(b.isEmpty())continue;const s=b.getSize(new T.Vector3()),c=b.getCenter(new T.Vector3());const g=new T.PlaneGeometry(s.x*1.18+.25,s.z*1.18+.25),m=new T.Mesh(g,this.shadowMaterial);m.rotation.x=-Math.PI/2;m.position.set(c.x,y+.003,c.z);m.name='Sombra de contacto225';this.decor.add(m);}
  if(focus&&!focus.isEmpty()){const s=focus.getSize(new T.Vector3()),c=focus.getCenter(new T.Vector3()),pad=.45,w=.07,W=s.x+pad*2,D=s.z+pad*2;
   for(const [sx,sz,x,z] of [[W,w,0,-D/2],[W,w,0,D/2],[w,D,-W/2,0],[w,D,W/2,0]]){const g=new T.BoxGeometry(sx,.004,sz),m=new T.Mesh(g,this.lineMaterial);m.position.set(c.x+x,y+.002,c.z+z);m.name='Línea de seguridad225';this.decor.add(m);}}
 }

 // Walls face inward and are culled from behind, so the camera sees into the room from any side
 // ("dollhouse"), while inside it every wall, the ceiling and its lights are visible.
 buildRoom229(all,y,{pad=2.2,height=3.8}={}){
  for(const o of [...this.room.children])o.removeFromParent();for(const g of this.roomOwned)g.dispose();this.roomOwned=[];
  const min=all.min.clone().addScalar(-pad),max=all.max.clone().addScalar(pad),W=max.x-min.x,D=max.z-min.z,cx=(min.x+max.x)/2,cz=(min.z+max.z)/2,M=this.mats229;
  this.floor.scale.set(W,D,1);this.floor.position.set(cx,y,cz);if(this.floorMap)this.floorMap.repeat.set(W/JOINT225,D/JOINT225);
  const geo=g=>{this.roomOwned.push(g);return g;},add=(g,m,x,yy,z,ry=0,name)=>{const o=new T.Mesh(geo(g),m);o.position.set(x,yy,z);o.rotation.y=ry;if(name)o.name=name;o.receiveShadow=true;this.room.add(o);return o;};
  const dado=1.15;
  // [length, centre x, centre z, rotation so the plane's front faces the room]
  const walls=[[W,cx,min.z,0],[W,cx,max.z,Math.PI],[D,min.x,cz,Math.PI/2],[D,max.x,cz,-Math.PI/2]];
  for(const [len,x,z,ry] of walls){
   const up=new T.PlaneGeometry(len,height-dado),uv=up.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*len/.8,uv.getY(i)*(height-dado)/.8);
   add(up,M.wall,x,y+dado+(height-dado)/2,z,ry,'Muro de block pintado229');add(new T.PlaneGeometry(len,dado),M.dado,x,y+dado/2,z,ry,'Zoclo pintado229');
  }
  const ceil=add(new T.PlaneGeometry(W,D),M.ceiling,cx,y+height,cz,0,'Plafón229');ceil.rotation.x=Math.PI/2;
  // Fluorescent panels in two rows, facing down.
  for(let i=0;i<Math.max(2,Math.round(W/3));i++)for(const k of [-.25,.25]){const p=add(new T.PlaneGeometry(1.2,.3),M.panel,min.x+(i+.5)*W/Math.max(2,Math.round(W/3)),y+height-.01,cz+k*D,0,'Luminaria229');p.rotation.x=Math.PI/2;}
  // Door with frame, push bar and exit sign on the far (+z) wall; louvered vents high up;
  // extinguisher and safety sign by the door; cable tray along the back wall.
  const dx=min.x+Math.min(1.6,W*.2),dz=max.z-.01;add(new T.PlaneGeometry(1.12,2.2),M.frame,dx,y+1.1,dz,Math.PI,'Marco de puerta229');add(new T.PlaneGeometry(1,2.12),M.door,dx,y+1.06,dz-.01,Math.PI,'Puerta229');
  add(new T.BoxGeometry(.7,.05,.05),M.tray,dx,y+1.02,dz-.04,0,'Barra antipánico229');add(new T.PlaneGeometry(.36,.14),M.green,dx,y+2.42,dz-.01,Math.PI,'Señal de salida229');
  const ext=add(new T.CylinderGeometry(.08,.08,.5,18),M.red,dx+.95,y+.55,dz-.12,0,'Extintor229');ext.castShadow=true;add(new T.PlaneGeometry(.3,.3),M.sign,dx+.95,y+1.35,dz-.01,Math.PI,'Señal de riesgo eléctrico229');
  for(const t of [.3,.7])for(const [len,x,z,ry] of [walls[2],walls[3]])add(new T.PlaneGeometry(.9,.45),M.louver,x+(ry>0?.01:-.01),y+height-.55,min.z+t*D,ry,'Rejilla de ventilación229');
  add(new T.BoxGeometry(W*.9,.06,.3),M.tray,cx,y+height-.35,min.z+.2,0,'Charola de cables229');
  this.room.userData.bounds229=new T.Box3(new T.Vector3(min.x,y,min.z),new T.Vector3(max.x,y+height,max.z));
 }
 dispose(){for(const o of [...this.decor.children])o.geometry?.dispose();for(const g of this.roomOwned)g.dispose();this.root.removeFromParent();for(const r of this.owned)r.dispose();this.scene.fog=this.priorFog??null;}
}

// Smooth camera moves for the study view: positions and target ease over a short time instead
// of jumping. Driven by absolute time from the render loop.
export function cameraTween225(camera,controls,toPosition,toTarget,now,duration=650){
 return {from:camera.position.clone(),fromTarget:controls.target.clone(),to:toPosition.clone(),toTarget:toTarget.clone(),start:now,duration,
  step(t){const u=Math.min(1,Math.max(0,(t-this.start)/this.duration)),e=u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;camera.position.lerpVectors(this.from,this.to,e);controls.target.lerpVectors(this.fromTarget,this.toTarget,e);return u<1;}};
}
