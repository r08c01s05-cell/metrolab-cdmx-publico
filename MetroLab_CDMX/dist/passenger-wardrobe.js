import{prepareCloth119,clothStyle119}from'./passenger-cloth119.js?v=130';
import * as THREE from 'three';

const tops=['#254b74','#497d95','#7b334b','#a64c50','#c1a36e','#d4d0bd','#557457','#283d3b','#74547a','#94653d','#dedfe1','#3b414c','#a67789','#547f7a','#bf8652','#61739b','#778344','#555361'];
const bottoms=['#202e46','#3e5b7d','#536d8d','#343b43','#555452','#a69b81','#736957','#272d32','#424e45','#606e70','#4b3e4c','#746a76'];
const shoes=['#26282e','#deddd1','#7a5942','#394d68','#756e63','#8d3d43','#4c5146','#a99f8d'];
const bags=['#b2534c','#355f75','#586948','#b7a176','#654d76','#373b43','#408b85','#8c6a43'];
const roles={upper_suit_m:'top',Buttom_m:'bottom',jacket_m:'top',jacket_pockets_m:'top',shirt_m:'top',pants_m:'bottom',pants_pockets:'bottom',shoes_m:'shoe',heels_m:'shoe',heeltop_m:'shoe',sole_m:'sole','T-shirt':'top','T-shirt_0':'top',Shorts:'bottom',Shoes:'shoe',skin:'skin',hair:'hair',kidhair:'hair',trim:'trim',shirt:'top',pants:'bottom',shoe:'shoe',sole:'sole',emblem:'trim',pack:'bag',pack2:'bagShade',strap:'strap',watch:'watch',kidshirt:'kidTop',kidpants:'kidBottom',kidshoe:'kidShoe'};
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

export function prepareWardrobe(body){
 const copies=new Map();
 body.traverse(mesh=>{if(!mesh.isMesh)return;
  const clone=original=>{
   const role=roles[original.name];if(!role)return original;
   if(!copies.has(original)){const material=original.clone();material.userData.wardrobeRole=role;if(role==='top'||role==='kidTop')prepareCloth119(material);copies.set(original,material);}
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
