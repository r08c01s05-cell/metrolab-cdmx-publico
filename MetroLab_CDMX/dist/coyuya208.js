import * as T from 'three';
import {COYUYA208,surfaceSpec209,platformRegions209} from './station-layout208.js?v=209';

// Single island, grey diagonal steel framing, open mesh sides and covered tracks.
// Photo reference: dist/referencias/linea8_57/L8-10.jpg. Hidden areas are approximate.
export function makeCoyuya208(station={id:'L8-10'}){
 const spec=surfaceSpec209(station)||surfaceSpec209('L8-10'),terminal=spec.kind==='terminal',platforms=platformRegions209(station),outer=spec.track+2.05,stairBases=spec.stairs||[-47,47];
 const root=new T.Group();root.name=spec.name+'_andenes209';root.userData={layout208:'island',regions209:platforms,approximate208:true,stationId:station.id};
 const mats=new Map(),geo=new Map(),signs=new Map();
 function material(name,color,metalness=0,roughness=.72){if(!mats.has(name))mats.set(name,new T.MeshStandardMaterial({name,color,metalness,roughness}));return mats.get(name);}
 const concrete=material('Concreto aparente '+spec.name,'#aaa99f'),steel=material('Acero estructural '+spec.name,spec.steel,.65,.42),dark=material('Acero antracita','#344a48',.65,.4),floor=material('Piso terrazo andén '+spec.name,'#a2a69e'),warning=material('Franja podotáctil amarilla','#d7b246'),roof=material('Cubierta metálica Coyuya','#a9b1aa',.48,.56),seat=material('Asiento metálico','#728781',.6,.46);
 function box(name,x,y,z,w,h,d,mat,c='estructura') {const key=[w,h,d].join('/');if(!geo.has(key))geo.set(key,new T.BoxGeometry(w,h,d));const m=new T.Mesh(geo.get(key),mat);m.name=name;m.position.set(x,y,z);m.userData.componente=c;m.castShadow=true;m.receiveShadow=true;root.add(m);return m;}
 function beam(name,a,b,width,depth=width,mat=steel){const p=new T.Vector3(...a),q=new T.Vector3(...b),m=box(name,...p.clone().add(q).multiplyScalar(.5).toArray(),width,p.distanceTo(q),depth,mat);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),q.sub(p).normalize());return m;}
 function label(text,x,y,z,w,h,turn=0){
  if(!signs.has(text)){const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#19634f';ctx.fillRect(0,0,1024,128);ctx.fillStyle='#fff';ctx.font='bold 51px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,65,980);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;signs.set(text,new T.MeshStandardMaterial({map,roughness:.8,side:T.FrontSide}));}
  const m=new T.Mesh(new T.PlaneGeometry(w,h),signs.get(text));m.name='Señal '+text;m.position.set(x,y,z);m.rotation.y=turn;m.userData.componente='senal';root.add(m);const back=m.clone();back.rotation.y+=Math.PI;back.position.x-=Math.sin(turn)*.008;back.position.z-=Math.cos(turn)*.008;root.add(back);return m;
 }

 const tile=document.createElement('canvas');tile.width=tile.height=256;const paint=tile.getContext('2d');for(let x=0;x<2;x++)for(let z=0;z<2;z++){paint.fillStyle=spec.floor[(x+z)%2];paint.fillRect(x*128,z*128,128,128);paint.strokeStyle='#89968a';paint.lineWidth=1;paint.strokeRect(x*128,z*128,128,128);}const floorMap=new T.CanvasTexture(tile);floorMap.colorSpace=T.SRGBColorSpace;floorMap.wrapS=floorMap.wrapT=T.RepeatWrapping;floorMap.channel=2;floor.map=floorMap;floor.color.set('#ffffff');
 for(const platform of platforms){const c=platform.center;
 box('Cimentación de isla',0,.56,c,156,1.12,7.5,concrete);
 box('Piso terrazo andén central',0,1.18,c,156,.04,7.5,floor,'piso');
 for(const sign of[-1,1]){
  box('Borde de concreto andén',0,1.155,c+sign*3.66,156,.09,.18,concrete);
  box('Franja podotáctil amarilla',0,1.207,c+sign*3.43,155.8,.014,.34,warning,'piso');
  box('Zócalo bajo borde',0,.99,c+sign*3.758,156,.18,.016,dark);
 }}
 for(const sign of[-1,1]){
  // Outer retaining wall is beyond the running/guide envelope of each track.
  box('Muro exterior bajo',0,.75,sign*outer,160,1.5,.25,concrete,'pared');
  for(let x=-76;x<=76;x+=8){
   beam('Columna exterior', [x,0,sign*outer],[x,6.05,sign*outer],.20,.24);
   beam('Diagonal exterior', [x-3.5,1.55,sign*outer],[x,5.85,sign*outer],.18,.18);
   beam('Diagonal exterior', [x+3.5,1.55,sign*outer],[x,5.85,sign*outer],.18,.18);
  }
  // Thin geometric grid gives depth without transparent, coplanar alpha planes.
  for(let x=-79;x<=79;x+=1.0)box('Barrote de cerramiento',x,2.9,sign*(outer-.01),.018,2.8,.018,steel);
  for(let y=1.6;y<=4.3;y+=.30)box('Malla lateral',0,y,sign*(outer-.01),160,.012,.012,steel);
  box('Canalón lateral',0,6.14,sign*(outer-.07),158,.18,.23,dark,'techo');
  const gaps=stairBases.map(base=>base+Math.sign(base)*7.5).sort((a,b)=>a-b);for(const [a,b]of[[-79,gaps[0]-1.6],[gaps[0]+1.6,gaps[1]-1.6],[gaps[1]+1.6,79]]){const cover=box('Cubierta inclinada',(a+b)/2,6.49,sign*outer/2,b-a,.12,outer+.15,roof,'techo');cover.rotation.x=-sign*.06;}
 for(const platform of platforms)box('Canalización bajo cubierta',0,5.93,platform.center+sign*2.8,153,.08,.12,dark,'techo');
  for(const platform of platforms)for(let x=-68;x<=68;x+=17){
   const light=box('Luminaria lineal',x,5.72,platform.center+sign*2.75,3.8,.09,.22,material('Difusor de luminaria','#eef4e8',0,.4),'techo');light.material.emissive=new T.Color('#dce9d7');light.material.emissiveIntensity=.65;
   label('8   '+spec.name.toUpperCase()+'   ·   '+(terminal?(sign*platform.center>0?(sign<0?'Llegada':'Garibaldi / Lagunilla'):'Vía central'):(sign<0?'Constitución de 1917':'Garibaldi / Lagunilla')),x,3.95,platform.center+sign*1.05,6.5,.48,sign<0?Math.PI:0);
  }
 }
 for(let x=-72;x<=72;x+=12){
  // Central columns leave two clear boarding/walking lanes on the island.
  for(const platform of platforms)for(const z of (stairBases.some(base=>x>=Math.min(base,base+Math.sign(base)*7.5)-1&&x<=Math.max(base,base+Math.sign(base)*7.5)+1)?[]:[platform.center-.46,platform.center+.46]))beam('Pilar de isla',[x,1.2,z],[x,6.8,z],.18,.18);
  beam('Cercha transversal',[x,6.05,-outer-.05],[x,6.05,outer+.05],.14,.16);
  for(const sign of[-1,1]){
   beam('Cordón superior de cercha',[x,6.05,sign*outer],[x,6.82,0],.14,.16);
   for(let z=1.4;z<outer-1.4;z+=1.4)beam('Diagonal de cercha',[x,6.05,sign*z],[x,6.82-(z+1.4)*(.77/outer),sign*(z+1.4)],.065,.065);
  }
 }
 for(const direction of[-1,1]){
  const x=direction*22,z=-direction*(terminal?6.12:.92),dest=direction>0?'Constitución de 1917':'Garibaldi / Lagunilla';
  box('Carcasa pantalla de llegadas',x,3.05,z,1.65,1.05,.12,dark);
  const m=new T.MeshStandardMaterial({name:'Monitor de llegadas '+spec.name+' '+direction,color:'#e5ede7',roughness:.65});m.userData={monitor_llegadas:true,direccion:direction,destino:dest};
  const screen=new T.Mesh(new T.PlaneGeometry(1.52,.95),m);screen.position.set(x,3.05,z-direction*.065);screen.rotation.y=direction>0?Math.PI:0;screen.name='Pantalla de llegadas en isla';screen.userData.componente='pantalla';root.add(screen);
 }
 for(const platform of platforms)for(const x of[-28,-8,16,30]){
  for(const sign of[-1,1]){
   box('Banco isla asiento',x,1.65,platform.center+sign*.65,3.0,.09,.45,seat);
   box('Banco isla respaldo',x,1.99,platform.center+sign*.43,3,.58,.055,seat);
   for(const dx of[-1.15,1.15])box('Soporte banco',x+dx,1.40,platform.center+sign*.65,.09,.4,.30,dark);
  }
 }
 // Access stair cores: schematic location, separate from clear boarding lanes.
 for(const platform of platforms)for(const base of stairBases){
  const end=Math.sign(base),c=platform.center;
  for(let j=0;j<25;j++)box('Escalera acceso central',base+end*j*.30,1.2+(j+1)*.14/2,c,.30,(j+1)*.14,1.8,concrete);
  const top=base+end*7.5;
  box('Descanso de acceso',top,4.66,c,2,.18,2.1,concrete);
  if(platform===platforms[0])box('Pasarela acceso sobre vías',top,4.66,0,2,.18,2*(outer+2.25),concrete);
  for(const side of[-1,1]){
   beam('Pasamanos escalera',[base,2.2,c+side*.95],[top,5.7,c+side*.95],.055);
   for(let j=0;j<25;j+=3)beam('Montante pasamanos',[base+end*j*.30,1.2+(j+1)*.14,c+side*.95],[base+end*j*.30,2.2+(j+1)*.14,c+side*.95],.035);
   if(platform===platforms[0]){beam('Barandal pasarela',[top+side*.9,5.7,-outer-2.25],[top+side*.9,5.7,outer+2.25],.05);
   for(let z=-outer-2;z<=outer+2;z++)beam('Montante pasarela',[top+side*.9,4.75,z],[top+side*.9,5.7,z],.035);}
  }
  label('SALIDA   ·   Acceso superior',base-end*.2,3.0,c,3.3,.40,-end*Math.PI/2);
  beam('Barandal extremo',[end*77.6,2.25,c-3.7],[end*77.6,2.25,c+3.7],.06);
 }
 if(terminal){
  box('Base vía central terminal',0,.015,0,180,.13,2.99,concrete,'via_central');
  for(const sign of[-1,1]){
   box('Riel central de seguridad',0,.245,sign*.72,180,.125,.075,steel,'via_central');
   box('Pista central de rodamiento',0,.265,sign*1.04,180,.145,.255,steel,'via_central');
   box('Barra guía vía central',0,.405,sign*1.39,180,.20,.07,steel,'via_central');
  }
  for(let x=-89.5;x<90;x+=.9)box('Durmiente vía central',x,.105,0,.22,.12,2.93,concrete,'via_central');
 }
 root.userData.dimensions208={...COYUYA208,id:station.id,track:spec.track};
 return root;
}

// Offset tracks AND nearby infrastructure before the existing route curvature bake.
export function widenCoyuya208(root,line,offsetAt){
 if(!line.stations.some(s=>surfaceSpec209(s)&&surfaceSpec209(s).kind!=='lateral'))return;
 root.updateMatrixWorld(true);const v=new T.Vector3(),matrix=new T.Matrix4();
 for(const child of root.children){
  if(!child.userData.track99&&!child.name.startsWith('Tunel_')&&!child.userData.stationSafety99)continue;
  child.traverse(o=>{
   if(!o.isMesh)return;
   const inverse=o.matrixWorld.clone().invert();
   if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);v.setFromMatrixPosition(matrix).applyMatrix4(o.matrixWorld);v.z+=Math.sign(v.z)*(offsetAt(8,v.x)-1.8);v.applyMatrix4(inverse);matrix.setPosition(v);o.setMatrixAt(i,matrix);}o.instanceMatrix.needsUpdate=true;o.computeBoundingSphere();return;}
   const g=o.geometry.clone(),p=g.attributes.position;
   for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);v.z+=Math.sign(v.z)*(offsetAt(8,v.x)-1.8);v.applyMatrix4(inverse);p.setXYZ(i,...v.toArray());}
   g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();o.geometry=g;o.userData.routeGeometry97=true;
  });
 }
}
