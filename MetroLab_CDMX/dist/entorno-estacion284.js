import * as T from 'three';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {texturaCaja} from './alimentacion/superficies-3d.js';
import {exteriorMaterial285,repetirExterior285} from './materiales-exterior285.js?v=285';
import {agregarHitos285} from './hitos-estacion285.js?v=285';

const styles={
 'L1-20':{facing:1,terminal:true,palette:['#bdbaaa','#beb1a0','#8d9999','#c2c5b8'],levels:[2,3,4]},
 'L8-10':{facing:1,palette:['#c0b8a3','#a07862','#8b9d92','#dad2bc'],levels:[1,2,3]},
 'L8-11':{facing:-1,palette:['#a88f7b','#afa2ac','#ced3c4','#8b969b'],levels:[2,3,4]},
 'L8-12':{facing:1,palette:['#d2c0a5','#a39b86','#709094','#b9937f'],levels:[1,2,3]},
 'L8-13':{facing:-1,palette:['#c2ae94','#986e60','#a5ae9a','#d0c4a9'],levels:[1,2,2]},
 'L8-19':{facing:1,terminal:true,palette:['#d0c9b6','#929e99','#b48368','#b8b3a5'],levels:[2,3,4]}
};

// Entorno ilustrativo en coordenadas del andén: X sigue la vía, Z apunta al barrio.
export function buildStationDistrict284(station){
 const style=styles[station.id];
 if(!style)return null;
 const district=new T.Group();
 district.name='Entorno exterior ilustrativo · '+(station.nombre??station.id);
 const buildingFootprints=[];
 const outer=station.id==='L8-10'?102:62;
 district.userData={illustrative:true,buildingFootprints,outer};
 const batches=new Map();
 function piece(kind,x,y,z,w,h,d,color,rotation){
  const batch=batches.get(kind)??[];
  batch.push({x,y,z,w,h,d,color,rotation});batches.set(kind,batch);
 }
 const box=(x,y,z,w,h,d,color,kind='aplanado')=>piece(kind,x,y,z,w,h,d,color);
 const glass=(...args)=>piece('cristal',...args);
 function beam(a,b,width,color,kind,thickness=width){
  const start=new T.Vector3(...a),end=new T.Vector3(...b),center=start.clone().lerp(end,.5);
  const axis=end.clone().sub(start),length=axis.length();
  const rotation=new T.Matrix4().lookAt(end,start,new T.Vector3(0,1,0));
  piece(kind,...center.toArray(),width,thickness,length+.025,color,rotation);
 }
 function building(x,z,w,d,levels,color,shop,brick){
  const side=Math.sign(z),height=levels*3.15;
  const face=z-side*d/2;
  buildingFootprints.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,height});
  box(x,height/2,z,w,height,d,color,brick?'ladrillo':'aplanado');
  box(x,.22,z,w+.35,.46,d+.35,'#a6a093','concreto');
  box(x,height+.08,z,w+.30,.22,d+.30,'#737972','concreto');
  for(const edge of [-1,1])box(x,height+.31,z+edge*(d/2-.12),w,.35,.26,color);
  box(x+w*.22,height+.34,z+side*d*.21,1.5,.5,1.25,'#959995');
  box(x-w*.28,height+.34,z-side*d*.23,.91,.54,.95,'#6a7571');
  const bays=Math.max(2,Math.floor((w-1.5)/2.6)),spacing=(w-.75)/bays;
  for(let i=0;i<bays;i++){
   const col=x+(i-(bays-1)/2)*spacing;
   for(let floor=0;floor<levels;floor++){
    const sill=floor*3.15+1.55,storefront=floor===0&&shop;
    const width=storefront?spacing*.79:Math.min(1.48,spacing*.64);
    const windowZ=face-side*.05;
    box(col,sill,windowZ,width+.16,storefront?2.04:1.39,.16,'#595d56');
    glass(col,sill,face-side*.14,width,storefront?1.88:1.26,.045,i%3===0?'#6d9298':'#45636e');
    box(col,sill-.71,face-side*.18,width+.18,.085,.30,'#a49d91');
    const rear=z+side*d/2;
    const rearWidth=Math.min(1.12,spacing*.53);
    box(col,sill,rear+side*.035,rearWidth+.13,1.17,.10,'#686d62');
    glass(col,sill,rear+side*.089,rearWidth,1.03,.035,i%2?'#698790':'#526d75');
    if(storefront){
     box(col,2.76,face-side*.66,width+.33,.10,1.3,i%2?'#b07858':'#6e8a80','metal');
     box(col,3.01,face-side*.17,width+.22,.20,.20,'#ded4ba');
    }
   }
  }
  for(const end of [-1,1])for(let level=1;level<levels;level++){
   for(const offset of [-.24,.24])glass(x+end*(w/2+.031),level*3.15+1.55,z+d*offset,.065,1.13,1.37,'#63808a');
  }
 }
 for(const side of [-1,1]){
  const inner=station.id==='L1-20'?10:style.terminal?12.75:7.57;
  const road=inner+5.55;
  box(0,-.36,side*(inner+outer)/2,230,.40,outer-inner,'#93927a','tierra');
  box(0,-.131,side*road,228,.08,9.2,'#555a59','asfalto');
  for(const z of [inner+.45,inner+11.27]){
   box(0,-.077,side*z,228,.15,z<road?.88:2.22,'#bdb8a6','loseta');
   box(0,-.084,side*(z+Math.sign(road-z)*.48),228,.15,.19,'#a7a599','concreto');
  }
  for(let x=-107;x<108;x+=7){
   box(x,-.082,side*road,2.4,.014,.095,'#d2c89e','pintura');
   if(!style.terminal)box(x+3.1,-.069,side*road,.55,.049,.135,'#c8a34b','pintura');
  }
  const rowOffset=(station.id.charCodeAt(station.id.length-1)%4)*2;
  for(let i=0;i<11;i++){
   const x=-104+i*20+rowOffset,main=side===style.facing;
   const reserved=station.id==='L1-20'?70:style.terminal&&main?78:0;
   if(Math.abs(x)<reserved||station.id==='L8-10'&&Math.abs(x-54.5)<17)continue;
   const palette=style.palette;
   const depth=10+(i%3)*1.4,z=(style.terminal?37.5:26)+(i%3)*1.7;
   building(x,side*z,13.1+((i+rowOffset)%3)*1.95,depth,style.levels[(i+(main?1:0))%3],palette[i%palette.length],(i+rowOffset)%2===0,i%3===1);
  }
  if(station.id==='L8-10')for(const [i,x] of [-94,-69,-43,-17,10,29,82,100].entries()){
   const z=side*(49+(i%3)*11);
   building(x,z,11+(i%3)*1.7,9+(i%3),1+i%3,style.palette[(i+1)%4],false,i%3===2);
  }
  for(const x of [-87,-43,46,90]){
   const h=4.4;
   box(x,h/2,side*(road+5.7),.12,h,.12,'#616f70','metal');
   box(x,h,side*(road+5.1),.15,.15,1.2,'#526268','metal');
   box(x,h-.11,side*(road+4.6),.39,.15,.53,'#bab7a1','metal');
  }
  for(let i=0;i<11;i++){
   const x=-105+i*21,z=side*(road+5.92+(i%3)*.45);
   if(Math.abs(x)<(style.terminal?72:21)&&side===style.facing)continue;
   piece('Troncos',x,1.34,z,.32,2.68,.32,'#715d4e');
   piece('Copas',x-.20,2.9,z,2.37,2.6,2.30,i%2?'#627c54':'#72925e');
   piece('Copas',x+.58,2.8,z-.43,1.7,1.81,1.58,'#829660');
  }
 }
 agregarHitos285(station.id,box,beam);
 const matrix=new T.Matrix4(),color=new T.Color();
 for(const [kind,batch] of batches){
  const material=exteriorMaterial285(kind,'#ffffff',repetirExterior285[kind]);
  material.vertexColors=true;
  const geometries=batch.map(({x,y,z,w,h,d,color:swatch,rotation})=>{
   const geometry=kind==='Copas'?new T.IcosahedronGeometry(.5,1)
    :kind==='Troncos'?new T.CylinderGeometry(.36,.5,1,9):new T.BoxGeometry(1,1,1);
   if(material.map)texturaCaja(geometry,w,h,d,1);
   matrix.makeScale(w,h,d);
   if(rotation)matrix.premultiply(rotation);
   matrix.setPosition(x,y,z);geometry.applyMatrix4(matrix);
   color.set(swatch);
   const rgb=new Float32Array(geometry.attributes.position.count*3);
   for(let i=0;i<rgb.length;i+=3)color.toArray(rgb,i);
   geometry.setAttribute('color',new T.BufferAttribute(rgb,3));
   return geometry;
  });
  const mesh=new T.Mesh(mergeGeometries(geometries,false),material);
  geometries.forEach(geometry=>geometry.dispose());
  mesh.name=kind;
  mesh.receiveShadow=true;
  mesh.castShadow=!['tierra','pintura','asfalto','loseta','cristal'].includes(kind);
  district.add(mesh);
 }
 return district;
}

export function disposeStationDistrict284(district){
 for(const {geometry,material} of district.children){
  geometry.dispose();material.map?.dispose();material.bumpMap?.dispose();material.dispose();
 }
}
