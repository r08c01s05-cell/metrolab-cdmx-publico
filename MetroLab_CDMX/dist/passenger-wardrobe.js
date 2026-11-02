import{prepareCloth119,clothStyle119}from'./passenger-cloth119.js?v=130';
import * as THREE from 'three';

// Realismo 224: everyday commuter colours (navy, charcoal, greys, white, burgundy, olive, browns,
// denim) instead of saturated sportswear tones.
const tops=['#1f2a3a','#2f3e52','#3d4a5c','#4a4f57','#5b6168','#7c8288','#a9adb0','#d9d8d2','#efefea','#5a2f36','#6b3a3a','#3f4a36','#4f5a3d','#6d5b45','#8a7356','#2d4a5e','#41566b','#7a6a5c'];
const bottoms=['#1d2533','#2a3448','#3b4a63','#4e6283','#22252a','#3a3d42','#55585c','#6f6656','#8c8069','#4a3f35','#2e3a2f','#5a5f66'];
const shoes=['#26282e','#deddd1','#7a5942','#394d68','#756e63','#8d3d43','#4c5146','#a99f8d'];
const bags=['#b2534c','#355f75','#586948','#b7a176','#654d76','#373b43','#408b85','#8c6a43'];
const roles={upper_suit_m:'top',Buttom_m:'bottom',jacket_m:'top',jacket_pockets_m:'top',shirt_m:'top',pants_m:'bottom',pants_pockets:'bottom',shoes_m:'shoe',heels_m:'shoe',heeltop_m:'shoe',sole_m:'sole','T-shirt':'top','T-shirt_0':'top',Shorts:'bottom',Shoes:'shoe',skin:'skin',hair:'hair',kidhair:'hair',trim:'trim',shirt:'top',pants:'bottom',shoe:'shoe',sole:'sole',emblem:'trim',pack:'bag',pack2:'bagShade',strap:'strap',watch:'watch',kidshirt:'kidTop',kidpants:'kidBottom',kidshoe:'kidShoe'};
// Realismo 224: the man with shorts wears long trousers on the Metro. His bare-leg skin
// becomes fabric of the same colour as the shorts, so they read as one pair of trousers.
const trousers224=new Set(['Legs','Shorts','Feet']);roles.Legs='bottom';roles.Feet='bottom';
// Trousers stand off the skin: legs are pushed out along their normals, more toward the ankle.
const looseLegs224=new WeakMap();
function looseTrousers224(geometry){
 if(looseLegs224.has(geometry))return looseLegs224.get(geometry);
 const g=geometry.clone(),p=g.attributes.position,n=g.attributes.normal;
 if(p&&n){for(let i=0;i<p.count;i++){const y=p.getY(i),flare=THREE.MathUtils.smoothstep(.55-y,0,.45),d=.010+.016*flare;p.setXYZ(i,p.getX(i)+n.getX(i)*d,y+n.getY(i)*d*.3,p.getZ(i)+n.getZ(i)*d);}p.needsUpdate=true;g.computeBoundingSphere();}
 looseLegs224.set(geometry,g);return g;
}
function seed(text){let h=2166136261;for(const c of String(text)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;return h>>>0;}
export function wardrobeFor(id){
 const pick=(palette,role)=>{const h=seed(id+':'+role),c=new THREE.Color(palette[h%palette.length]);
  // Small variations within each fabric colour keep repeated palettes distinct.
  c.multiplyScalar(.90+((h>>>8)%1024)/1023*.20);return c;};
 const bag=pick(bags,'bag');
 return {top:pick(tops,'top'),bottom:pick(bottoms,'bottom'),shoe:pick(shoes,'shoe'),
  sole:pick(['#d6d3c4','#40434a','#b5b0a1'],'sole'),trim:pick(['#dbd7c6','#35424d','#ac9a76'],'trim'),
  skin:pick(['#e5b992','#d59e77','#bd805b','#a56849','#86563f','#694433'],'skin'),hair:pick(['#242329','#38291f','#51382a','#6b4c32','#3c3534'],'hair'),
  bag,bagShade:bag.clone().multiplyScalar(.65),strap:pick(['#272e36','#68574a','#535751'],'strap'),
  watch:pick(['#39444c','#796b55','#a6adb1'],'watch'),kidTop:pick(tops,'kidTop'),kidBottom:pick(bottoms,'kidBottom'),kidShoe:pick(shoes,'kidShoe')};
}

// Realismo 224: several garments ship with near-black textures, so the colour tint that gives
// each passenger their own clothes barely shows and crowds look uniformly dark. Those maps are
// replaced once by a grey copy at a common brightness that keeps the weave, seams and folds.
const fabricMaps224=new WeakMap();
function fabricMap224(texture){
 if(!texture?.image||fabricMaps224.has(texture))return fabricMaps224.get(texture)||texture;
 let result=texture;
 try{
  const img=texture.image,w0=img.width||img.videoWidth,h0=img.height||img.videoHeight;if(!w0||!h0)throw 0;
  const k=Math.min(1,1024/Math.max(w0,h0)),w=Math.max(1,Math.round(w0*k)),h=Math.max(1,Math.round(h0*k));
  const canvas=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(w,h):globalThis.document?.createElement?.('canvas');if(!canvas)throw 0;canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);const data=ctx.getImageData(0,0,w,h),px=data.data;
  let sum=0,count=0;for(let i=0;i<px.length;i+=4)if(px[i+3]>8){sum+=.2126*px[i]+.7152*px[i+1]+.0722*px[i+2];count++;}
  const mean=count?sum/count:128;
  if(mean<150){const gain=Math.min(8,190/Math.max(8,mean));for(let i=0;i<px.length;i+=4){const l=Math.min(255,(.2126*px[i]+.7152*px[i+1]+.0722*px[i+2])*gain);px[i]=px[i+1]=px[i+2]=l;}ctx.putImageData(data,0,0);
   result=new THREE.CanvasTexture(canvas);for(const key of ['flipY','colorSpace','wrapS','wrapT','channel','anisotropy','magFilter','minFilter'])result[key]=texture[key];result.repeat.copy(texture.repeat);result.offset.copy(texture.offset);result.needsUpdate=true;}
 }catch{result=texture;}
 fabricMaps224.set(texture,result);return result;
}
export function prepareWardrobe(body){
 const copies=new Map();
 body.traverse(mesh=>{if(!mesh.isMesh)return;
  if(!Array.isArray(mesh.material)&&mesh.material.name==='Legs')mesh.geometry=looseTrousers224(mesh.geometry);
  const clone=original=>{
   const role=roles[original.name];if(!role)return original;
   if(!copies.has(original)){const material=original.clone();material.userData.wardrobeRole=role;if(['top','bottom'].includes(role)&&material.map)material.map=fabricMap224(material.map);if(trousers224.has(original.name)){material.map=null;material.normalMap=null;material.roughnessMap=null;material.metalness=0;material.roughness=.88;material.userData.trousers224=true;}if(role==='top'||role==='kidTop')prepareCloth119(material);copies.set(original,material);}
   return copies.get(original);
  };mesh.material=Array.isArray(mesh.material)?mesh.material.map(clone):clone(mesh.material);
 });return [...copies.values()];
}

export function applyWardrobe(item,id){
 if(item.wardrobeId===id)return;
 const colours=wardrobeFor(id);
 for(const material of item.wardrobeMaterials){
  const role=material.userData.wardrobeRole;material.color.copy(colours[role]);if(material.userData.clothPattern119)material.userData.clothPattern119.value=clothStyle119(id);
  // Muted fabric finishes; shoes and accessories remain slightly smoother.
  if(!material.roughnessMap)material.roughness=['top','bottom','kidTop','kidBottom'].includes(role)?.88:.68;
 }
 item.wardrobeId=id;
}
