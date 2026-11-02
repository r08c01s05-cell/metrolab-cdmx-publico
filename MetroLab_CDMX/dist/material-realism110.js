import {applySurfaceDetail205} from './surface-detail205.js?v=205';
import * as THREE from 'three';
import {surfaceMaps124,finishProfiles124,finishUV124} from './surface-finish124.js?v=194';
const prepared=new WeakSet(),replacements=new WeakMap(),maps=new Map();
const profiles={ceramic:{rough:.28,metal:0,normal:.008,coat:.18,coatRough:.24},paint:{rough:.36,metal:.08,normal:.014,coat:.12,coatRough:.4},brushed:{rough:.37,metal:.88,normal:.022},polished:{rough:.20,metal:.94,normal:.009},panel:{rough:.48,metal:0,normal:.025,coat:.08,coatRough:.42},seat:{rough:.43,metal:0,normal:.035,coat:.045,coatRough:.55},rubber:{rough:.89,metal:0,normal:.08},floor:{rough:.76,metal:0,normal:.045},cast:{rough:.65,metal:.48,normal:.11},steel:{rough:.35,metal:.88,normal:.045},copper:{rough:.32,metal:.96,normal:.025},canvas:{rough:.91,metal:0,normal:.11},filter:{rough:.94,metal:0,normal:.045},cloth:{rough:.91,metal:0,normal:.065},skin:{rough:.58,metal:0,normal:.018},mineral:{rough:.79,metal:0,normal:.035},leather:{rough:.57,metal:0,normal:.035},hair:{rough:.52,metal:0,normal:.025},eye:{rough:.16,metal:0,normal:0},diffuser:{rough:.68,metal:0,normal:.008}};
// Exact roles from the supplied character assets take precedence over generic words.
export function materialCategory115(material){
 const n=(material.name||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 if(/std_(?:eye|cornea)/.test(n))return'eye';
 if(/eyelash|eyebrow|(?:^|_)hair/.test(n))return'hair';
 if(/^surface(?:\.\d+)?$/.test(n)){if(material.transparent)return'glass';if(material.metalness>.6)return'brushed';const c=material.color;if(c&&Math.max(c.r,c.g,c.b)<.09)return'rubber';return'panel';}
 const roles={skin:'skin',mouth:'skin',shirt:'cloth',kidshirt:'cloth',pants:'cloth',kidpants:'cloth',pack:'cloth',pack2:'cloth',strap:'cloth',emblem:'cloth',shoe:'leather',kidshoe:'leather',sole:'rubber',hair:'hair',kidhair:'hair',brow:'hair',eye:'eye',dark:'eye',watch:'leather',frame:'panel'};
 if(roles[n])return roles[n];
 if(/opalino|difusor|m103_bulb/.test(n))return'diffuser';
 if(/pantalla|display|letrero|rotulo|etiqueta|recorrido|mapa|precaucion|cartel|publicidad|pictograma|mural|letras|marca_piso|serigrafia|graduacion/.test(n))return'label';
 if(/junta|burlete|goma|caucho/.test(n))return'rubber';
 if(/cristal|vidrio|glass/.test(n))return'glass';
 if(/lona|tapete textil|acolchad|cinta.*cosid/.test(n))return'canvas';
 if(/fibra filtrante|papel filtrante/.test(n))return'filter';
 if(/sello perimetral/.test(n))return'rubber';
 if(/pintura|pintad|esmalte/.test(n))return'paint';
 if(/guante|tejido|costura|tela|textil|camisa|pantal|vestid|shirt|trouser|cloth/.test(n))return'cloth';
 if(/copper|cobre|laton/.test(n))return'copper';
 if(/porcelana|ceramica/.test(n))return'ceramic';
 if(/goma|caucho|rubber|junta|manguera|aislante|carbon_escobilla/.test(n))return'rubber';
 if(/pasamanos|pulido|cromad/.test(n))return'polished';
 if(/cepillado|inoxidable|satinado|galvaniz|aluminio/.test(n))return'brushed';
 if(/bastidor|fundicion|housing|cast/.test(n))return'cast';
 if(/asiento|banca|seat/.test(n))return'seat';
 if(/pintura|pintad|chapa|esmalte|naranja|franja|paint|linea [18]|equipo rojo|borde amarillo/.test(n))return'paint';
 if(/piso|suelo|pavimento|antideslizante|floor/.test(n))return'floor';
 if(/piel|skin/.test(n))return'skin';
 if(/revestimiento.*(stone|piedra)|piedra|concreto|terrazo|columnas|muretes/.test(n))return'mineral';
 if(/panel|marfil|revestimiento|plastic|consola|plafon|grafito|carcasa|dintel/.test(n))return'panel';
 if(/acero|steel|herraje|metal|tornillo|perno|placa_anclaje|soporte monitor/.test(n)||material.metalness>.6)return'steel';
 if(/pared|muro|techo|zocalo/.test(n))return'mineral';
 return null;
}
const category=materialCategory115;
const textures=surfaceMaps124;
// Local planar UVs supply missing microdetail coordinates without changing vertices.
function ensureUV(mesh){const g=mesh.geometry;if(g.attributes.uv)return;const pos=g.attributes.position,n=g.attributes.normal;if(!pos||!n)return;const uv=new Float32Array(pos.count*2);for(let i=0;i<pos.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));if(ay>=ax&&ay>=az){uv[i*2]=pos.getX(i);uv[i*2+1]=pos.getZ(i);}else if(ax>=az){uv[i*2]=pos.getZ(i);uv[i*2+1]=pos.getY(i);}else{uv[i*2]=pos.getX(i);uv[i*2+1]=pos.getY(i);}}g.setAttribute('uv',new THREE.BufferAttribute(uv,2));}
export function refineMaterials110(root,anisotropy=4){let count=0;root.updateMatrixWorld(true);root.traverse(mesh=>{if(!mesh.isMesh)return;const originals=Array.isArray(mesh.material)?mesh.material:[mesh.material],result=originals.map(original=>{if(!original?.isMeshStandardMaterial)return original;if(replacements.has(original)){const cached=replacements.get(original);if(cached.normalMap&&profiles[cached.userData.realism110])ensureUV(mesh);finishUV124(mesh,cached.userData.realism110);if(cached.normalMap?.channel===3||cached.clearcoatNormalMap?.channel===3)mesh.geometry.deleteAttribute('tangent');return cached;}if(prepared.has(original)){if(original.normalMap&&profiles[original.userData.realism110])ensureUV(mesh);finishUV124(mesh,original.userData.realism110);if(original.normalMap?.channel===3||original.clearcoatNormalMap?.channel===3)mesh.geometry.deleteAttribute('tangent');return original;}const kind=category(original)||category({name:mesh.name,metalness:original.metalness,color:original.color})||(!original.map&&!original.transparent?'panel':null),profile=profiles[kind];let m=original;if((profile?.coat||kind==='glass'||kind==='skin'||kind==='cloth'||kind==='canvas'||kind==='leather')&&!m.isMeshPhysicalMaterial){m=new THREE.MeshPhysicalMaterial();THREE.MeshStandardMaterial.prototype.copy.call(m,original);}prepared.add(m);replacements.set(original,m);count++;m.userData={...m.userData,realism110:kind||'preserved',finish124:kind||'preserved'};
 if(kind==='glass'){m.metalness=0;m.roughness=.10;m.envMapIntensity=.90;if(m.isMeshPhysicalMaterial){m.ior=1.5;m.specularIntensity=1;}m.transparent=true;m.opacity=Math.min(original.opacity,/testero/.test(m.name.toLowerCase())?.14:.18);m.depthWrite=false;}
 else if(profile){if(kind==='diffuser'){m.transparent=false;m.opacity=1;m.depthWrite=true;}m.metalness=profile.metal;m.envMapIntensity=kind==='polished'?.85:kind==='brushed'?.75:.62;const mapped=Boolean(m.roughnessMap);m.roughness=mapped?Math.max(.05,Math.min(1,original.roughness)):profile.rough;if(profile.coat){m.clearcoat=profile.coat;m.clearcoatRoughness=profile.coatRough;}if(['cloth','canvas'].includes(kind)&&m.isMeshPhysicalMaterial){m.sheen=.10;m.sheenRoughness=.92;m.sheenColor.set('#b6bcc0');m.clearcoat=0;}if(kind==='leather'&&m.isMeshPhysicalMaterial){m.clearcoat=.06;m.clearcoatRoughness=.65;}if(kind==='skin'&&m.isMeshPhysicalMaterial){m.clearcoat=0;m.ior=1.4;m.specularIntensity=.55;}
 ensureUV(mesh);finishUV124(mesh,kind);if(mesh.geometry.attributes.uv&&!m.transparent&&kind!=='eye'){const detail=textures(kind);if(!m.normalMap&&profile.normal>0){m.normalMap=detail.normal;m.normalScale.setScalar(finishProfiles124[kind].strength);if(m.normalMap.channel===3)mesh.geometry.deleteAttribute('tangent');}if(!m.roughnessMap){m.roughnessMap=detail.rough;m.roughness=1;}if(!m.map&&detail.albedo)m.map=detail.albedo;// Preserve authored AO; albedo variation is not an occlusion map.
if(profile.coat&&m.isMeshPhysicalMaterial&&!m.clearcoatNormalMap){m.clearcoatNormalMap=detail.normal;m.clearcoatNormalScale.setScalar(kind==='paint'?.065:.025);if(detail.normal.channel===3)mesh.geometry.deleteAttribute('tangent');}}
 }
 if(m.transparent)m.depthWrite=false;for(const key of['map','normalMap','roughnessMap','metalnessMap','aoMap','clearcoatNormalMap'])if(m[key])m[key].anisotropy=Math.min(8,Math.max(1,anisotropy));m.needsUpdate=true;return m;});mesh.material=Array.isArray(mesh.material)?result:result[0];for(const material of result)applySurfaceDetail205(mesh,material);});return count;}
export const materialProfiles110=profiles;
