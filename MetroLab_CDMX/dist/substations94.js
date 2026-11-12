import{refineSurfaceMaterials100}from'./visual-quality100.js?v=264';
import * as THREE from 'three';
export const SAF_SOURCE94='https://metro.cdmx.gob.mx/storage/app/media/FIMETRO/INFORME-TRIMESTRAL-FIMETRO/2025/Cuarto%20Informe%20Trimestral%202024.pdf';
// Counts documented for L1; placements are an illustrative layout, not a surveyed plan.
function originalPlan94(line){
 if(line.stations.length<2)return [];
 if(line.stations[0]?.linea===8)return line.stations.map((s,i)=>{
  const exterior=s.entorno_visual?.tipo==='superficial',segment=Math.min(i,line.stations.length-2),midpoint=(line.distances[segment]+line.distances[segment+1])/2;
  return{id:s.id+'-LOCAL-99',station:s.nombre||s.id,stationId:s.id,x:exterior?line.distances[i]+(i===line.stations.length-1?-115:115):midpoint+(i===line.stations.length-1?-22:22),side:1,index:1,kind:'Local eléctrico',width:6.6,exterior,approximate:true,countVerified:false,segment,midpoint,placement96:exterior?'exterior lateral de estación de superficie':'zona central de interestación'};
 });
 if(line.stations[0]?.linea!==1)return [];
 return line.stations.flatMap((s,i)=>[-1,1].map((direction,k)=>{
  const segment=Math.max(0,Math.min(line.stations.length-2,direction<0?i-1:i)),from=line.distances[segment],to=line.distances[segment+1],midpoint=(from+to)/2;
  const spacing=Math.min(22,Math.max(8,(to-from-162)/12));
  // Two ordinary rooms straddle the midpoint; terminal rooms fold into their
  // adjacent interval, farther apart, preserving 40 records without overlap.
  const terminalExtra=i===0&&direction<0||i===line.stations.length-1&&direction>0;
  const offset=terminalExtra?direction*spacing*2.5:-direction*spacing;
  return {id:s.id+'-SAF-'+(k+1),station:s.nombre||s.name||s.id,stationId:s.id,x:midpoint+offset,side:direction,index:k+1,kind:'SAF',width:6.6,approximate:true,segment,midpoint,placement96:'zona central de interestación'};
 }));
}
// Equal intervals include the gaps from each station to its nearest local.
export function substationPlan94(line){
 const plan=originalPlan94(line),groups=new Map();
 for(const local of plan){if(!groups.has(local.segment))groups.set(local.segment,[]);groups.get(local.segment).push(local);}
 for(const [segment,locals] of groups){const from=line.distances[segment],to=line.distances[segment+1];locals.sort((a,b)=>a.x-b.x||a.id.localeCompare(b.id));const step=(to-from)/(locals.length+1);for(let i=0;i<locals.length;i++){locals[i].x=from+(i+1)*step;locals[i].spacing254=step;locals[i].placement96='intervalos iguales entre estaciones · distribución ilustrativa';}}
 return plan;
}
export function wallSpans94(from,to,side,plan){const cuts=plan.filter(p=>!p.exterior&&p.side===side&&p.x+p.width/2>from&&p.x-p.width/2<to).map(p=>[Math.max(from,p.x-p.width/2),Math.min(to,p.x+p.width/2)]).sort((a,b)=>a[0]-b[0]);let cursor=from;const out=[];for(const[a,b]of cuts){if(a>cursor)out.push([cursor,a]);cursor=Math.max(cursor,b);}if(cursor<to)out.push([cursor,to]);return out;}
export function makeSubstation94(){
 const root=new THREE.Group();root.name='Subestacion_alumbrado_fuerza_94';root.userData={substation94:true,kind:'SAF',approximate:true};
 const materials={wall:new THREE.MeshStandardMaterial({name:'Concreto local',color:'#a4a79e',roughness:.92}),floor:new THREE.MeshStandardMaterial({name:'Piso local',color:'#69706b',roughness:.85}),steel:new THREE.MeshStandardMaterial({name:'Acero gabinete',color:'#7b8587',metalness:.65,roughness:.4}),dark:new THREE.MeshStandardMaterial({name:'Panel grafito',color:'#243336',roughness:.8}),yellow:new THREE.MeshStandardMaterial({name:'Pintura amarilla',color:'#d7b84e',roughness:.65}),white:new THREE.MeshStandardMaterial({name:'Panel marfil',color:'#d8e1d6',roughness:.65}),lamp:new THREE.MeshStandardMaterial({name:'Difusor local',color:'#eff5d7',emissive:'#e6efc0',emissiveIntensity:1}),glass:new THREE.MeshStandardMaterial({name:'Vidrio local',color:'#c3ded7',transparent:true,opacity:.12,roughness:.16,depthWrite:false})};
 const box=(name,x,y,z,w,h,d,mat)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),materials[mat]);o.name=name;o.position.set(x,y,z);root.add(o);return o;};
 box('Piso_local',0,.07,1.65,6.6,.14,3.5,'floor');box('Pared_posterior',0,1.95,3.35,6.6,3.9,.16,'wall');
 for(const x of [-3.22,3.22])box('Pared_lateral',x,1.95,1.65,.16,3.9,3.5,'wall');box('Techo_local',0,3.85,1.65,6.6,.16,3.5,'wall');
 box('Fachada_superior',0,3.45,0,6.6,.75,.2,'wall');box('Zocalo_fachada',0,.3,0,6.6,.6,.2,'wall');
 // Two closed access leaves, with ventilation grilles; viewing window beside them.
 for(const x of [-2.8,-2.1]){box('Puerta_tecnica_cerrada',x,1.8,-.025,.67,2.4,.09,'steel');for(let j=0;j<9;j++)box('Lama_ventilacion',x,1.0+j*.065,-.085,.48,.025,.025,'dark');box('Manija_tecnica',x+.2,1.75,-.10,.035,.19,.035,'dark');}
 for(const x of [-3.2,-1.7,3.2])box('Pilar_fachada',x,1.95,0,.16,3.9,.2,'wall');box('Antepecho_ventana',.74,.93,0,4.72,.65,.17,'wall');box('Ventana_inspeccion',.74,2.12,0,4.72,1.78,.025,'glass');
 for(const x of [-1.61,.74,3.09])box('Marco_ventana',x,2.12,-.025,.035,1.85,.045,'steel');
 const cabinet=(name,x,w,color)=>{box(name,x,1.25,2.45,w,2.2,.72,color);box(name+'_puerta',x,1.25,2.07,w-.08,2.08,.025,'steel');box(name+'_visor',x,1.65,2.045,w*.35,.23,.02,'dark');for(const y of [1.35,1.18])box(name+'_piloto',x-.15,y,2.035,.04,.04,.02,'lamp');box(name+'_manija',x+w*.32,1.25,2.03,.035,.18,.03,'dark');};
 cabinet('Unidad_compacta_MT_RM6_referencial',-2.15,1.6,'white');cabinet('Transformador_pedestal_referencial',0,1.6,'dark');cabinet('Tablero_BT_referencial',2.1,1.5,'white');
 for(let i=0;i<12;i++)box('Aleta_transformador',-.65+i*.12,.85,2.0,.035,1.2,.13,'dark');
 box('Bandeja_cables',0,3.1,2.85,6.15,.1,.28,'steel');for(let i=0;i<3;i++)box('Cable_sin_diagrama',0,3.2+i*.045,2.85,6.1,.025,.025,'dark');
 for(const x of [-2,2])box('Luminaria_local',x,3.65,1.75,1.25,.07,.18,'lamp');
 for(const x of [-2.8,-2.1]){const warning=new THREE.Mesh(new THREE.ConeGeometry(.12,.22,3),materials.yellow);warning.rotation.z=Math.PI;warning.position.set(x,2.35,-.095);root.add(warning);}
 refineSurfaceMaterials100(root);return root;
}
