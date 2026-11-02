import * as THREE from 'three';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
// Pasajeros con perfiles anatómicos suaves y articulación de dos segmentos.
// Geometrías compartidas por instancias para conservar el rendimiento.
const hash=text=>{let h=2166136261;for(const c of String(text)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
const tops=['#285774','#527d91','#873b53','#bd6e35','#4b6650','#b9ada1','#202e42','#7d6487','#d1b283','#597b78'];
const skins=['#edc7a5','#d5a77c','#bd8a63','#a46f4c','#83563d','#684635'];
const pants=['#263344','#405065','#55534d','#283b3b','#494147'];
const hairs=['#211b19','#34241d','#594032','#77716b'];
// Rings: [height, half-width, half-depth, depth-offset].
function organicProfile(rings,segments=24){
 const path=new THREE.CatmullRomCurve3(rings.map(([y,w,d])=>new THREE.Vector3(w,y,d)),false,'centripetal');
 const samples=path.getPoints(rings.length*4),vertices=[],indices=[],uv=[];
 for(let k=0;k<samples.length;k++){
  const {x:w,y,z:d}=samples[k];
  for(let j=0;j<=segments;j++){const t=j/segments*Math.PI*2;vertices.push(Math.cos(t)*Math.max(0,w),y,Math.sin(t)*Math.max(0,d));uv.push(j/segments,k/(samples.length-1));}
 }
 for(let k=0;k<samples.length-1;k++)for(let j=0;j<segments;j++){const a=k*(segments+1)+j,b=a+segments+1;indices.push(a,b,a+1,b,b+1,a+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
 // Match normals across the duplicated UV seam.
 const n=g.attributes.normal;for(let k=0;k<samples.length;k++){const a=k*(segments+1),b=a+segments,v=new THREE.Vector3().fromBufferAttribute(n,a).add(new THREE.Vector3().fromBufferAttribute(n,b)).normalize();n.setXYZ(a,v.x,v.y,v.z);n.setXYZ(b,v.x,v.y,v.z);}return g;
}
const anatomicalTorso=()=>organicProfile([[-.30,0,0],[-.29,.160,.108],[-.22,.172,.113],[-.07,.161,.106],[.08,.193,.119],[.18,.216,.111],[.235,.207,.094],[.27,.147,.080],[.29,.063,.058],[.30,0,0]]);
function anatomicalHead(){
 const g=organicProfile([[-1,0,0],[-.94,.35,.39],[-.78,.61,.62],[-.55,.78,.76],[-.28,.89,.88],[.05,.95,.97],[.32,1,1],[.58,.92,.94],[.80,.73,.78],[.95,.40,.43],[1,0,0]],32),a=g.attributes.position;
 for(let i=0;i<a.count;i++){
  const x=a.getX(i),y=a.getY(i),z=a.getZ(i);if(z<=0)continue;
  const front=Math.pow(Math.max(0,z),2),gauss=(cx,cy,wx,wy)=>Math.exp(-(((x-cx)/wx)**2+((y-cy)/wy)**2));
  const bridge=.16*gauss(0,.05,.13,.32),tip=.18*gauss(0,-.15,.18,.13);
  const sockets=-.07*(gauss(-.37,.19,.25,.17)+gauss(.37,.19,.25,.17));
  const cheeks=.06*(gauss(-.50,-.17,.27,.25)+gauss(.50,-.17,.27,.25));
  const chin=.09*gauss(0,-.72,.42,.15),lips=.025*gauss(0,-.43,.28,.05);
  a.setZ(i,z+(bridge+tip+sockets+cheeks+chin+lips)*front);
 }
 g.computeVertexNormals();return g;
}
// End volumes overlap inside the adjacent segment, avoiding pinched ball joints.
const softLimb=()=>organicProfile([[-.58,0,0],[-.55,.58,.58],[-.50,.78,.78],[-.30,.84,.84],[.03,.94,.94],[.27,1,1],[.50,.79,.79],[.55,.58,.58],[.58,0,0]],16);
function handGeometry(){
 const pieces=[],part=(x,y,z,sx,sy,sz,angle=0)=>{const g=new THREE.SphereGeometry(1,12,8);g.scale(sx,sy,sz);g.rotateZ(angle);g.translate(x,y,z);pieces.push(g);};
 part(0,0,0,.90,.65,.40);
 for(let k=0;k<4;k++){const x=(k-1.5)*.42,short=k===0||k===3?.08:0;part(x,-.50+short,.04,.19,.28,.17);part(x,-.84+short,.14,.175,.23,.16);part(x,-1.08+short,.30,.15,.19,.15);}
 part(-.82,-.14,.04,.22,.43,.23,-.62);
 return mergeGeometries(pieces);
}
function backpackGeometry(){
 const g=new THREE.BoxGeometry(2,2,2,5,7,4),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i),inner=v.clone().clampScalar(-.74,.74);v.sub(inner).normalize().multiplyScalar(.26).add(inner);p.setXYZ(i,v.x,v.y,v.z);}g.computeVertexNormals();return g;
}
function surfaceTexture(kind){
 const size=128,data=new Uint8Array(size*size*4);let seed=12345;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const grain=(seed/4294967296-.5);const v=kind==='skin'?248+grain*12:235+grain*10+6*Math.sin(x*Math.PI/2)*Math.sin(y*Math.PI/2);const at=(y*size+x)*4;data.set([v,v,v,255],at);}
 const t=new THREE.DataTexture(data,size,size);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t;
}
// Restrained folds in the mesh, not floating decorative pieces.
function fabricFolds(g,kind){
 const p=g.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=Math.hypot(x,z);if(r<.001)continue;
  let displacement=0;
  if(kind==='shirt')displacement=.0045*Math.sin(y*73+x*8)*Math.exp(-(((y+.12)/.18)**2));
  else if(kind==='sleeve')displacement=.015*Math.sin(y*65)*Math.exp(-(((y+.30)/.20)**2));
  else if(kind==='skirt')displacement=.004*Math.sin(Math.atan2(z,x)*7)*(1-Math.min(1,(y+.32)/.50));
  else if(kind==='blanket')displacement=.025*Math.sin(y*29+x*9)*Math.exp(-y*y*2);
  p.setX(i,x+x/r*displacement);p.setZ(i,z+z/r*displacement);
 }g.computeVertexNormals();return g;
}
function scalpGeometry(){
 const g=anatomicalHead(),p=g.attributes.position,indices=[];
 for(let i=0;i<g.index.count;i+=3){const tri=[g.index.getX(i),g.index.getX(i+1),g.index.getX(i+2)];if(tri.every(j=>p.getY(j)>.42+.10*p.getX(j)||(p.getZ(j)<-.20&&p.getY(j)>-.46)))indices.push(...tri);}
 g.setIndex(indices);g.scale(1.035,1.035,1.035);return g;
}
export function passengerCategory(id){return hash(id)%2?'woman':'man';}
export class PassengerModels {
 constructor(scene,capacity=220){
  this.capacity=capacity;this.group=new THREE.Group();this.group.name='Usuarios_articulados';scene.add(this.group);this.parts={};this.identities=[];this.dummy=new THREE.Object3D();this.base=new THREE.Matrix4();this.q=new THREE.Quaternion();this.p=new THREE.Vector3();this.scale=new THREE.Vector3();this.axis=new THREE.Vector3(0,1,0);this.limbA=new THREE.Vector3();this.limbB=new THREE.Vector3();this.limbDir=new THREE.Vector3();
  const sphere=new THREE.SphereGeometry(1,20,14),cylinder=softLimb(),dome=new THREE.SphereGeometry(1,20,10,0,Math.PI*2,0,Math.PI*.36);
  const torso=fabricFolds(anatomicalTorso(),'shirt');
  const add=(name,geometry,color,mult=1)=>{const material=new THREE.MeshStandardMaterial({color,roughness:.83});const m=new THREE.InstancedMesh(geometry,material,capacity*mult);m.name=name;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;this.parts[name]=m;this.group.add(m);};
  add('torso',torso,'white');add('hips',sphere,'white');add('head',anatomicalHead(),'white');add('neck',cylinder,'white');add('hair',scalpGeometry(),'white');add('nose',sphere,'white');add('ears',sphere,'white',2);add('eyes',sphere,'#292321',2);
  add('upperLeg',cylinder,'white',2);add('lowerLeg',cylinder,'white',2);add('shoe',sphere,'#242b30',2);add('upperArm',fabricFolds(cylinder.clone(),'sleeve'),'white',2);add('forearm',fabricFolds(cylinder.clone(),'sleeve'),'white',2);add('hand',handGeometry(),'white',2);add('bag',backpackGeometry(),'white');add('strap',cylinder,'#273844',2);add('collar',sphere,'white');add('shoulder',sphere,'white',2);add('knee',sphere,'white',2);add('cuff',sphere,'white',2);
  add('hairBack',sphere,'white');add('ponytail',sphere,'white');add('skirt',fabricFolds(new THREE.LatheGeometry([new THREE.Vector2(.24,-.32),new THREE.Vector2(.23,-.18),new THREE.Vector2(.20,.12),new THREE.Vector2(.19,.18)],32),'skirt'),'white');
  add('babyBody',fabricFolds(sphere.clone(),'blanket'),'white');add('babyArm',cylinder,'white',2);add('babyLeg',cylinder,'white',2);add('babyHead',sphere,'white');add('babyCap',dome,'white');add('babyEyes',sphere,'#292321',2);add('babyNose',sphere,'white');add('babyHand',sphere,'white',2);add('babyFoot',sphere,'white',2);add('eyeWhite',sphere,'#e4e1d7',2);add('eyelid',sphere,'white',2);add('brow',sphere,'white',2);add('mouth',sphere,'white');
  const pixels=new Uint8Array(32*32*4);for(let y=0;y<32;y++)for(let x=0;x<32;x++){const value=Math.round(Math.max(0,1-Math.hypot((x-15.5)/16,(y-15.5)/16))**1.8*255),at=(y*32+x)*4;pixels.set([value,value,value,255],at);}const shadowMap=new THREE.DataTexture(pixels,32,32);shadowMap.needsUpdate=true;add('contactShadow',new THREE.PlaneGeometry(1,1),'#000000');this.parts.contactShadow.material.dispose();this.parts.contactShadow.material=new THREE.MeshBasicMaterial({color:'#000000',alphaMap:shadowMap,transparent:true,opacity:.25,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  const weave=new Uint8Array(64*64*4);for(let y=0;y<64;y++)for(let x=0;x<64;x++){const at=(y*64+x)*4;weave.set([128+Math.round(15*Math.sin(x*Math.PI/2)),128+Math.round(15*Math.sin(y*Math.PI/2)),254,255],at);}const fabric=new THREE.DataTexture(weave,64,64);fabric.wrapS=fabric.wrapT=THREE.RepeatWrapping;fabric.repeat.set(5,5);fabric.needsUpdate=true;for(const name of ['torso','hips','upperLeg','lowerLeg','upperArm','shoulder','skirt','bag']){this.parts[name].material.normalMap=fabric;this.parts[name].material.normalScale.set(.055,.055);}
  const skinTexture=surfaceTexture('skin'),clothTexture=surfaceTexture('cloth');
  for(const key of ['head','neck','nose','ears','hand','babyHead','babyHand','babyArm']){const m=this.parts[key].material;m.map=skinTexture;m.roughness=.68;}
  for(const key of ['torso','hips','upperLeg','lowerLeg','upperArm','forearm','shoulder','skirt','bag','babyBody']){const m=this.parts[key].material;m.map=clothTexture;m.roughness=.92;}
  this.parts.bag.material.roughness=.87;
  this.parts.eyes.material.roughness=.30;this.parts.babyEyes.material.roughness=.30;
  for(let i=0;i<capacity;i++)this.setStyle(i,'initial-'+i);
 }
 setStyle(i,id,type,carrying=false){const key=id+':'+type+':'+carrying;if(this.identities[i]===key)return;this.identities[i]=key;const h=hash(id);const color=(name,value,n=1)=>{for(let k=0;k<n;k++)this.parts[name].setColorAt(i*n+k,new THREE.Color(value));};
  const skirt=type==='woman'&&h%3===1;const top=carrying?'#b9bcc1':skirt?'#87334f':tops[h%tops.length],skin=skins[(h>>>4)%skins.length],pant=carrying||skirt?'#25354c':pants[(h>>>8)%pants.length];
  color('torso',top);color('upperArm',top,2);color('shoulder',top,2);color('cuff',top,2);color('knee',pant,2);color('forearm',carrying||skirt||h%3?top:skin,2);color('collar',new THREE.Color(top).multiplyScalar(.88));color('hips',pant);color('upperLeg',pant,2);color('lowerLeg',pant,2);for(const name of ['head','neck','nose'])color(name,skin);color('ears',skin,2);color('eyelid',skin,2);color('hand',skin,2);const hair=hairs[(h>>>12)%hairs.length];color('hair',hair);color('brow',hair,2);color('mouth',new THREE.Color(skin).multiplyScalar(.78));color('hairBack',hair);color('ponytail',hair);color('skirt',pant);color('babyBody','#aacbdc');color('babyCap','#e6e0cb');color('babyHead',skin);color('babyNose',skin);color('babyHand',skin,2);color('babyArm',skin,2);color('babyLeg',['#9fbac6','#d6bf9b','#b7c5b0'][h%3],2);color('babyFoot','#e6e0cb',2);color('bag','#365f73');
  this.styleDirty=true;
 }
 put(name,index,x,y,z,sx,sy,sz,rx=0,rz=0){const d=this.dummy;if(sx===0||sy===0||sz===0)sx=sy=sz=0;d.position.set(x,y,z);d.scale.set(sx,sy,sz);d.rotation.set(rx,0,rz);d.updateMatrix();d.matrix.premultiply(this.base);this.parts[name].setMatrixAt(index,d.matrix);}
 limb(name,index,start,end,radius){const a=this.limbA.set(...start),b=this.limbB.set(...end),dir=this.limbDir.copy(b).sub(a),length=dir.length(),d=this.dummy;d.position.copy(a).add(b).multiplyScalar(.5);d.quaternion.setFromUnitVectors(this.axis,dir.normalize());d.scale.set(radius,radius===0?0:length,radius);d.updateMatrix();d.matrix.premultiply(this.base);this.parts[name].setMatrixAt(index,d.matrix);}
 setPerson(i,a,time){
  const id=a.id??i,h=hash(id),type=a.modelType||passengerCategory(id),child=type==='child',woman=type==='woman',carrying=!!a.carryingBaby,seated=a.pose==='seated',holding=a.pose==='holding';
  this.setStyle(i,id,type,carrying);const height=child?.66+((h>>>10)%12)/100:(woman?.90:.96)+((h>>>10)%10)/100,width=child?.74+((h>>>17)%8)/100:(woman?.88:.94)+((h>>>17)%12)/100;
  const phase=time*(child?6.8:5.5)+(h%100)*.063,wave=a.moving?Math.sin(phase)*.26*Math.min(1,(a.speed??1.2)/1.2):.018*Math.sin(time*.8+h%13),breath=.002*Math.sin(time*1.6+h%11),headY=child?1.55:1.665,headR=child?.139:.105,headH=child?.174:.132,shoulderY=1.40,hipY=.91;
  const originY=seated?(a.seatHeight??1.70)-hipY*height+.13:a.y;
  this.p.set(a.x,originY,a.z);this.q.setFromAxisAngle(this.axis,a.yaw||0);this.scale.set(width,height,width);this.base.compose(this.p,this.q,this.scale);
  this.put('torso',i,0,1.185+breath,0,woman?.96:1,1,1);this.put('hips',i,0,hipY-.02,0,woman?.175:.166,.119,.112);
  this.put('neck',i,0,headY-.145+breath,0,.052,.11,.050);this.put('head',i,0,headY+breath,.005,headR,headH,child?.116:.095);this.put('hair',i,0,headY+breath,.005,headR,headH,child?.116:.095);
  const longHair=woman&&h%3!==0,tail=woman&&h%3===0;this.put('hairBack',i,0,headY-.06+breath,-.073,longHair?.112:0,.19,.062);this.put('ponytail',i,0,headY+.025+breath,-.147,tail?.050:0,.12,.046);
  this.put('contactShadow',i,0,(a.y-originY)/height+.009,.025,.85,1.0,1,-Math.PI/2);this.put('mouth',i,0,headY-.051+breath,child?.112:.090,.020,.0035,.003);
  this.put('nose',i,0,headY-.017+breath,child?.112:.094,0,0,0);this.put('collar',i,0,shoulderY+.044,.008,.065,.016,.052);
  const skirt=woman&&h%3===1;this.put('skirt',i,0,seated?.81:.82,seated?.18:0,skirt?.82:0,seated?.28:.76,seated?1.45:.68,seated?.15:0);
  for(let k=0;k<2;k++){
   const sign=k?1:-1,j=i*2+k,faceZ=child?.116:.094,eyeX=child?.047:.038;
   this.put('eyeWhite',j,sign*eyeX,headY+.025+breath,faceZ,.0095,.004,.003);
   this.put('eyes',j,sign*eyeX,headY+.025+breath,faceZ+.003, .0032,.0032,.0015);
   this.put('eyelid',j,sign*eyeX,headY+.030+breath,faceZ+.001,.011,.003,.003);
   this.put('brow',j,sign*eyeX,headY+.042+breath,faceZ-.003,.019,.003,.004);
   this.put('ears',j,sign*(headR-.002),headY-.009+breath,-.002,.013,.026,.018);
   // Fixed bone lengths. Swing leg bends at the knee and clears the floor.
   const cycle=phase+(k?Math.PI:0),swing=a.moving?Math.sin(cycle)*.26:0;
   const kneeFlex=a.moving?Math.max(0,Math.cos(cycle))*.38:.035;
   const hip=[sign*.096,hipY,0],thigh=.405,shin=.405;
   const seatedKneeY=(a.y+.08-originY)/height+shin;
   const knee=seated?[hip[0],seatedKneeY,Math.sqrt(Math.max(0,thigh*thigh-(hipY-seatedKneeY)**2))]:[hip[0],hipY-Math.cos(swing)*thigh,Math.sin(swing)*thigh];
   const ankle=seated?[hip[0],knee[1]-shin,knee[2]]:[hip[0],knee[1]-Math.cos(swing-kneeFlex)*shin,knee[2]+Math.sin(swing-kneeFlex)*shin];
   this.limb('upperLeg',j,hip,knee,.078);this.limb('lowerLeg',j,knee,ankle,.059);
   this.put('knee',j,...knee,.051,.054,.053);
   this.put('shoe',j,ankle[0],ankle[1]-.038,ankle[2]+.045,.065,.042,.126);
   const shoulder=[sign*.201,shoulderY,0],armSwing=sign*wave*.85;
   const elbow=seated&&!carrying?[sign*.23,1.17,.17]:holding&&sign===1&&!carrying?[sign*.21,1.60,.15]:carrying?[sign*.24,1.11,.13]:[sign*.214,shoulderY-.272*Math.cos(armSwing),-.272*Math.sin(armSwing)];
   const hand=seated&&!carrying?[sign*.18,.97,.32]:holding&&sign===1&&!carrying?[sign*.21,1.83,.06]:carrying?[sign<0?-.20:.12,sign<0?1.245:1.10,.33]:[sign*.222,elbow[1]-.255*Math.cos(armSwing+.09),elbow[2]-.255*Math.sin(armSwing+.09)];
   this.put('shoulder',j,...shoulder,.047,.056,.052);
   this.limb('upperArm',j,shoulder,elbow,.061);this.limb('forearm',j,elbow,hand,.044);
   this.put('cuff',j,...elbow,.044,.045,.044);
   this.put('hand',j,...hand,.036,.067,.030,carrying?-.9:0,carrying?sign*.45:sign*.03);
   const bag=h%3===0&&!carrying;this.put('strap',j,sign*.14,child?1.13:1.24,-.135,bag?.016:0,.34,.016);
   this.put('babyEyes',j,-.182+sign*.024,1.311+breath,.423,carrying?.004:0,.004,.003);
   this.limb('babyArm',j,[.00,1.20+breath,.40],[-.01+sign*.025,1.245+breath,.455],carrying?.020:0);
   this.limb('babyLeg',j,[.20,1.12+breath,.35+sign*.032],[.29,1.075+breath,.34+sign*.032],carrying?.030:0);
   this.put('babyHand',j,-.01+sign*.025,1.245+breath,.455,carrying?.018:0,.022,.016);
   this.put('babyFoot',j,.29,1.075+breath,.34+sign*.032,carrying?.04:0,.035,.028);
  }
  const bag=h%3===0&&!carrying;this.put('bag',i,0,child?1.04:1.16,-.21,bag?.18:0,.245,.11);
  // Infant stays attached to the caregiver's transform; no independent walking path.
  this.put('babyBody',i,.085,1.17+breath,.35,carrying?.21:0,.125,.115,0,-.30);
  this.put('babyHead',i,-.18,1.29+breath,.35,carrying?.077:0,.091,.074);
  this.put('babyCap',i,-.18,1.29+breath,.35,carrying?.080:0,.095,.078);
  this.put('babyNose',i,-.18,1.29+breath,.429,carrying?.010:0,.014,.012);
 }
 update(actors,time){const count=Math.min(actors.length,this.capacity);for(let i=0;i<count;i++)this.setPerson(i,actors[i],time);for(const [name,m] of Object.entries(this.parts)){m.count=count*(['ears','eyes','upperLeg','lowerLeg','shoe','upperArm','forearm','hand','strap','babyEyes','babyHand','babyFoot','eyeWhite','eyelid','brow','shoulder','knee','cuff','babyArm','babyLeg'].includes(name)?2:1);m.instanceMatrix.needsUpdate=true;if(this.styleDirty&&m.instanceColor)m.instanceColor.needsUpdate=true;}this.styleDirty=false;return count;}
}
